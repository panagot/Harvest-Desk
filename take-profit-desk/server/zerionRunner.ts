import { spawn } from "node:child_process";
import path from "node:path";
import { resolveZerionCliPath } from "./paths.ts";

export type ZerionResult<T> =
  | { ok: true; data: T; stderr: string }
  | { ok: false; error: string; stderr: string };

function parseStdoutJson(stdout: string): unknown {
  const trimmed = stdout.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}

/**
 * Spawn Zerion CLI with JSON stdout. Inherits user's HOME so ~/.zerion config & wallets resolve.
 */
export async function runZerion(args: string[], env: NodeJS.ProcessEnv): Promise<{ stdout: string; stderr: string; code: number }> {
  const cli = resolveZerionCliPath();
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], {
      env: { ...process.env, ...env, FORCE_COLOR: "0" },
      windowsHide: true,
      cwd: path.dirname(cli),
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr?.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ stdout, stderr, code: code ?? 1 });
    });
  });
}

export async function zerionJson<T>(
  args: string[],
  extraEnv: Record<string, string | undefined> = {},
): Promise<ZerionResult<T>> {
  try {
    const { stdout, stderr, code } = await runZerion([...args, "--json"], {
      ...extraEnv,
    });
    if (code !== 0) {
      let message = stderr.trim() || stdout.trim() || `zerion exited ${code}`;
      try {
        const errObj = JSON.parse(stderr.trim()) as { error?: { message?: string; code?: string } };
        if (errObj?.error?.message) message = errObj.error.message;
      } catch {
        /* keep message */
      }
      return { ok: false, error: message, stderr };
    }
    const data = parseStdoutJson(stdout) as T;
    return { ok: true, data, stderr };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg, stderr: "" };
  }
}

export type PnlStdout = {
  wallet: { name: string; address: string };
  pnl: {
    totalGain?: number;
    realizedGain?: number;
    unrealizedGain?: number;
    totalGainPercent?: number;
    totalInvested?: number;
    netInvested?: number;
    totalFees?: number;
  };
};

export type PortfolioStdout = {
  wallet: { name: string; address: string };
  portfolio: { total: number; change_24h: number | null; currency: string };
  positions: Array<{
    name?: string;
    symbol?: string;
    chain?: string;
    quantity?: number;
    value?: number;
    price?: number;
  }>;
  positionCount: number;
};

export type SwapStdout = Record<string, unknown>;
