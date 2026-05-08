import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { PROJECT_ROOT } from "./paths.ts";

/**
 * If ZERION_API_KEY is unset, try reading the first line from ZERION_API_KEY_FILE
 * or from <repo>/../api (sibling file next to take-profit-desk in the Frontier folder).
 * Never log the key.
 */
export function hydrateZerionApiKeyFromFile() {
  if (process.env.ZERION_API_KEY?.trim()) return;

  const filePath =
    process.env.ZERION_API_KEY_FILE?.trim() || path.join(PROJECT_ROOT, "..", "api");

  try {
    if (!existsSync(filePath)) return;
    const line = readFileSync(filePath, "utf-8").split(/\r?\n/)[0]?.trim();
    if (line) process.env.ZERION_API_KEY = line;
  } catch {
    /* ignore */
  }
}
