import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = path.resolve(__dirname, "..");

/** Vercel serverless filesystem is ephemeral; only /tmp is writable for persisted JSON. */
function dataDirFallback(): string {
  if (process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)) {
    return path.join("/tmp", "harvest-desk-data");
  }
  return path.join(PROJECT_ROOT, "data");
}

export function resolveZerionCliPath(): string {
  const override = process.env.ZERION_CLI_PATH?.trim();
  if (override) return path.resolve(PROJECT_ROOT, override);
  return path.resolve(PROJECT_ROOT, "..", "zerion-ai", "cli", "zerion.js");
}

export const DATA_DIR = process.env.DATA_DIR?.trim()
  ? path.resolve(process.cwd(), process.env.DATA_DIR.trim())
  : dataDirFallback();
export const POLICY_PATH = path.join(DATA_DIR, "policy.json");
export const STATE_PATH = path.join(DATA_DIR, "agent-state.json");
