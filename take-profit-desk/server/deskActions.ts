import { existsSync } from "node:fs";
import { getZerionApiKeySource } from "./bootstrapEnv.ts";
import { evaluateDesk } from "./engine.ts";
import { loadPolicy } from "./policyStore.ts";
import { loadState, saveState, type AgentState } from "./agentState.ts";
import { mockPnl, mockPortfolio } from "./mockData.ts";
import { resolveZerionCliPath } from "./paths.ts";
import { zerionJson, type PortfolioStdout, type PnlStdout, type SwapStdout } from "./zerionRunner.ts";
import type { DeskPolicy } from "./policySchema.ts";

/**
 * Synthetic/mocked PnL + portfolio (no Zerion CLI subprocess).
 *
 * Native **Windows** cannot load Open Wallet Standard binaries (no `@open-wallet-standard/core-win32-*` on npm).
 * Default to mock on `win32` so localhost works; use **WSL/Linux/macOS** for live CLI, or set
 * `ZERION_ALLOW_WIN_NATIVE=true` to attempt CLI anyway (usually still fails).
 */
export function computeMock(): boolean {
  if (process.env.MOCK_MODE === "true") return true;
  if (process.env.MOCK_MODE === "false" && process.env.ZERION_ALLOW_WIN_NATIVE === "true") {
    return !String(process.env.ZERION_API_KEY || "").trim();
  }
  if (process.platform === "win32") return true;
  return !String(process.env.ZERION_API_KEY || "").trim();
}

export function summarizeDeskAuth(mock: boolean) {
  return {
    mockMode: mock,
    apiKeyConfigured: Boolean(process.env.ZERION_API_KEY?.trim()),
    executeSecretConfigured: Boolean(
      process.env.EXECUTE_SECRET?.trim() && process.env.EXECUTE_SECRET !== "change-me-to-a-long-random-string",
    ),
    apiKeySource: getZerionApiKeySource(),
    zerionCliPresent: existsSync(resolveZerionCliPath()),
  };
}

export async function fetchPnl(policy: DeskPolicy, mock = computeMock()) {
  if (mock) {
    const m = mockPnl(policy.walletName);
    return {
      raw: m,
      totalGain: m.pnl.totalGain ?? null,
      realized: m.pnl.realizedGain ?? null,
      unrealized: m.pnl.unrealizedGain ?? null,
    };
  }
  const r = await zerionJson<PnlStdout>(["pnl", "--wallet", policy.walletName], {
    ZERION_API_KEY: process.env.ZERION_API_KEY || "",
  });
  if (!r.ok) throw new Error(r.error);
  const p = r.data.pnl || {};
  return {
    raw: r.data,
    totalGain: p.totalGain ?? null,
    realized: p.realizedGain ?? null,
    unrealized: p.unrealizedGain ?? null,
  };
}

export async function fetchPortfolio(policy: DeskPolicy, mock = computeMock()) {
  if (mock) return mockPortfolio(policy.walletName);
  const r = await zerionJson<PortfolioStdout>(["portfolio", "--wallet", policy.walletName], {
    ZERION_API_KEY: process.env.ZERION_API_KEY || "",
  });
  if (!r.ok) throw new Error(r.error);
  return r.data;
}

export function evaluateFromPnl(policy: DeskPolicy, state: AgentState, pnl: Awaited<ReturnType<typeof fetchPnl>>) {
  return evaluateDesk({
    policy,
    state,
    totalGainUsd: pnl.totalGain,
    realizedUsd: pnl.realized,
    unrealizedUsd: pnl.unrealized,
  });
}

/** Read-only snapshot (no audit row appended). */
export async function getDeskSnapshot(policy = loadPolicy()) {
  const mock = computeMock();
  const state = loadState();
  let error: string | null = null;
  let pnl: Awaited<ReturnType<typeof fetchPnl>> | null = null;
  let portfolio: PortfolioStdout | null = null;
  try {
    pnl = await fetchPnl(policy, mock);
    portfolio = await fetchPortfolio(policy, mock);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const evaluation = pnl != null ? evaluateFromPnl(policy, state, pnl) : null;

  return {
    auth: summarizeDeskAuth(mock),
    policy,
    state,
    pnl: pnl?.raw ?? null,
    portfolio,
    evaluation,
    fetchError: error,
  };
}

/** Append an evaluation audit row (same as POST /api/evaluate). */
export async function performEvaluate(policy = loadPolicy()) {
  const state = loadState();
  const mock = computeMock();
  const pnl = await fetchPnl(policy, mock);
  const evaluation = evaluateFromPnl(policy, state, pnl);

  const next: AgentState = {
    ...state,
    lastEvaluationAt: evaluation.at,
    runs: [...state.runs, { at: evaluation.at, kind: "evaluate" as const }],
  };
  saveState(next);
  return { evaluation, pnl, portfolio: await fetchPortfolio(policy, mock), stateAfter: next };
}

export type ExecuteResult =
  | { ok: true; mock: boolean; evaluation: ReturnType<typeof evaluateDesk>; result?: unknown }
  | { ok: false; error: string; evaluation?: ReturnType<typeof evaluateDesk>; stderr?: string };

export async function performExecute(
  providedSecret: string | undefined,
  opts?: { bypassSecret?: boolean },
): Promise<ExecuteResult> {
  const expected = process.env.EXECUTE_SECRET?.trim();
  if (!opts?.bypassSecret) {
    const header = String(providedSecret || "");
    if (!expected || header !== expected) {
      return { ok: false, error: "Missing or invalid execute secret" };
    }
  } else if (!expected) {
    return { ok: false, error: "EXECUTE_SECRET not configured" };
  }

  const policy = loadPolicy();
  const state = loadState();
  const mock = computeMock();
  const pnl = await fetchPnl(policy, mock);
  const evaluation = evaluateFromPnl(policy, state, pnl);

  if (evaluation.decision !== "fire") {
    return { ok: false, error: "Policy blocks execution", evaluation };
  }

  if (mock) {
    const at = new Date().toISOString();
    const txHash = "0xmock" + Math.random().toString(16).slice(2);
    const next: AgentState = {
      ...state,
      lastRunAt: at,
      lastCheckpointTotalGainUsd: pnl.totalGain,
      runs: [...state.runs, { at, kind: "swap", note: "MOCK_MODE swap (no chain transaction)", txHash }],
    };
    saveState(next);
    return {
      ok: true,
      mock: true,
      evaluation,
      result: { executed: true, tx: { hash: txHash }, state: next },
    };
  }

  const swapArgs = ["swap", policy.chain, policy.swapAmount, policy.fromToken, policy.toToken, "--wallet", policy.walletName];
  const r = await zerionJson<SwapStdout>(swapArgs, {
    ZERION_API_KEY: process.env.ZERION_API_KEY || "",
  });

  if (!r.ok) {
    return { ok: false, error: r.error, evaluation, stderr: r.stderr };
  }

  const at = new Date().toISOString();
  const tx = (r.data as { tx?: { hash?: string } })?.tx;
  const next: AgentState = {
    ...state,
    lastRunAt: at,
    lastCheckpointTotalGainUsd: pnl.totalGain,
    runs: [...state.runs, { at, kind: "swap", note: "Live swap via Zerion CLI", txHash: tx?.hash }],
  };
  saveState(next);
  return { ok: true, mock: false, evaluation, result: r.data };
}

export async function performCheckpoint(policy = loadPolicy()) {
  const mock = computeMock();
  const state = loadState();
  const pnl = await fetchPnl(policy, mock);
  const total = pnl.totalGain;
  if (total == null) {
    throw new Error("Cannot checkpoint — PnL total gain unavailable");
  }
  const at = new Date().toISOString();
  const next: AgentState = {
    ...state,
    lastCheckpointTotalGainUsd: total,
    runs: [...state.runs, { at, kind: "evaluate", note: `Checkpoint at total gain $${total.toFixed(2)}` }],
  };
  saveState(next);
  return { lastCheckpointTotalGainUsd: total, state: next };
}
