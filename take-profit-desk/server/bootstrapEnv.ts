import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { PROJECT_ROOT } from "./paths.ts";

/** Where the Zerion agent API key originated (never includes the secret). */
export type ZerionApiKeySource = "environment" | "sibling_api_file" | "custom_key_file" | "unset";

let apiKeySource: ZerionApiKeySource = "unset";

export function getZerionApiKeySource(): ZerionApiKeySource {
  return apiKeySource;
}

/**
 * If ZERION_API_KEY is unset, try reading the first usable line from ZERION_API_KEY_FILE
 * or from `<repo-root>/api` (sibling next to take-profit-desk/).
 * Supports UTF-8 BOM, blank lines, and `#` comments. Never log the key.
 */
export function hydrateZerionApiKeyFromFile() {
  const fromEnv = process.env.ZERION_API_KEY?.trim();
  if (fromEnv) {
    apiKeySource = "environment";
    return;
  }

  const explicit = process.env.ZERION_API_KEY_FILE?.trim();
  const filePath = explicit || path.join(PROJECT_ROOT, "..", "api");

  try {
    if (!existsSync(filePath)) {
      apiKeySource = "unset";
      return;
    }
    const raw = readFileSync(filePath, "utf-8");
    const noBom = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
    for (const rawLine of noBom.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      process.env.ZERION_API_KEY = line;
      apiKeySource = explicit ? "custom_key_file" : "sibling_api_file";
      return;
    }
  } catch {
    /* ignore */
  }

  apiKeySource = process.env.ZERION_API_KEY?.trim() ? apiKeySource : "unset";
}
