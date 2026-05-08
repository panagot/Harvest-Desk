import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { DATA_DIR, STATE_PATH } from "./paths.ts";

export type AgentState = {
  lastEvaluationAt: string | null;
  lastRunAt: string | null;
  lastCheckpointTotalGainUsd: number | null;
  runs: Array<{
    at: string;
    kind: "swap" | "evaluate";
    note?: string;
    txHash?: string;
  }>;
};

const emptyState = (): AgentState => ({
  lastEvaluationAt: null,
  lastRunAt: null,
  lastCheckpointTotalGainUsd: null,
  runs: [],
});

export function loadState(): AgentState {
  try {
    if (!existsSync(STATE_PATH)) return emptyState();
    const raw = readFileSync(STATE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as AgentState;
    return {
      ...emptyState(),
      ...parsed,
      runs: Array.isArray(parsed.runs) ? parsed.runs : [],
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state: AgentState) {
  mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n", { encoding: "utf-8", mode: 0o600 });
}
