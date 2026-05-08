/**
 * Cron-friendly autonomous tick: evaluate + optionally execute when policy says FIRE.
 *
 * Env:
 *   AGENT_AUTO_EXECUTE=true — after logging evaluation, runs swap via Zerion CLI (requires agent token setup).
 *
 * Typical cron (every hour):
 *   0 * * * * cd /path/to/take-profit-desk && npx dotenv-cli -e .env -- npm run agent:tick --silent
 */

import "dotenv/config";
import { mkdirSync } from "node:fs";
import { hydrateZerionApiKeyFromFile } from "./bootstrapEnv.ts";
import { DATA_DIR } from "./paths.ts";
import { computeMock, performEvaluate, performExecute } from "./deskActions.ts";

hydrateZerionApiKeyFromFile();
mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });

const autoExecute =
  process.env.AGENT_AUTO_EXECUTE === "true" || process.env.AGENT_AUTO_EXECUTE === "1";

function log(payload: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

async function main() {
  log({
    type: "agent_tick_start",
    ts: new Date().toISOString(),
    mockMode: computeMock(),
    autoExecute,
  });

  try {
    const { evaluation } = await performEvaluate();
    log({
      type: "evaluated",
      decision: evaluation.decision,
      reason: evaluation.reason,
      proposed: evaluation.proposedCommand,
    });

    if (!autoExecute) {
      log({ type: "execute_skipped", note: "Set AGENT_AUTO_EXECUTE=true for unattended swaps." });
      return;
    }

    if (evaluation.decision !== "fire") {
      log({ type: "execute_skipped", note: evaluation.reason });
      return;
    }

    const out = await performExecute(undefined, { bypassSecret: true });

    if (out.ok) {
      log({ type: "execute_ok", mock: out.mock, resultPreview: sanitizeResult(out.result) });
    } else {
      log({ type: "execute_failed", error: out.error });
      process.exitCode = 1;
    }
  } catch (e) {
    log({ type: "agent_tick_error", error: e instanceof Error ? e.message : String(e) });
    process.exitCode = 1;
  }
}

function sanitizeResult(result: unknown) {
  if (result === null || result === undefined) return result;
  if (typeof result === "object" && result !== null) {
    const r = result as Record<string, unknown>;
    const tx = r.tx;
    if (tx && typeof tx === "object") {
      const h = (tx as { hash?: unknown }).hash;
      return { txHash: typeof h === "string" ? h : undefined };
    }
  }
  return { logged: true };
}

void main();
