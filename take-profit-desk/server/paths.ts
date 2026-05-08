import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = path.resolve(__dirname, "..");

export function resolveZerionCliPath(): string {
  const override = process.env.ZERION_CLI_PATH?.trim();
  if (override) return path.resolve(PROJECT_ROOT, override);
  return path.resolve(PROJECT_ROOT, "..", "zerion-ai", "cli", "zerion.js");
}

export const DATA_DIR = path.join(PROJECT_ROOT, "data");
export const POLICY_PATH = path.join(DATA_DIR, "policy.json");
export const STATE_PATH = path.join(DATA_DIR, "agent-state.json");
