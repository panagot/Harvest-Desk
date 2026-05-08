import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { DATA_DIR, POLICY_PATH } from "./paths.ts";
import { DeskPolicySchema, defaultPolicy, type DeskPolicy } from "./policySchema.ts";

export function loadPolicy(): DeskPolicy {
  try {
    if (!existsSync(POLICY_PATH)) {
      const p = defaultPolicy();
      savePolicy(p);
      return p;
    }
    const raw = readFileSync(POLICY_PATH, "utf-8");
    return DeskPolicySchema.parse(JSON.parse(raw));
  } catch {
    const p = defaultPolicy();
    savePolicy(p);
    return p;
  }
}

export function savePolicy(policy: DeskPolicy) {
  const parsed = DeskPolicySchema.parse(policy);
  mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  writeFileSync(POLICY_PATH, JSON.stringify(parsed, null, 2) + "\n", {
    encoding: "utf-8",
    mode: 0o600,
  });
  return parsed;
}
