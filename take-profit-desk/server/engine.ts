import type { DeskPolicy } from "./policySchema.ts";
import type { AgentState } from "./agentState.ts";

export type DeskEvaluation = {
  at: string;
  policy: DeskPolicy;
  pnlSnapshot: {
    totalGainUsd: number | null;
    realizedUsd: number | null;
    unrealizedUsd: number | null;
    deltaSinceCheckpointUsd: number | null;
  };
  gates: {
    expired: boolean;
    chainAllowed: boolean;
    cooldownElapsed: boolean;
    totalGainFloorMet: boolean;
    deltaThresholdMet: boolean;
  };
  decision: "fire" | "hold";
  reason: string;
  proposedCommand: string | null;
};

function hoursBetween(a: Date, b: Date): number {
  return (a.getTime() - b.getTime()) / (1000 * 60 * 60);
}

export function evaluateDesk(input: {
  policy: DeskPolicy;
  state: AgentState;
  totalGainUsd: number | null;
  realizedUsd: number | null;
  unrealizedUsd: number | null;
}): DeskEvaluation {
  const at = new Date().toISOString();
  const { policy, state } = input;
  const totalGainUsd = input.totalGainUsd;
  const realizedUsd = input.realizedUsd;
  const unrealizedUsd = input.unrealizedUsd;

  const lastCp = state.lastCheckpointTotalGainUsd;
  const deltaSinceCheckpointUsd =
    totalGainUsd != null
      ? lastCp != null
        ? totalGainUsd - lastCp
        : totalGainUsd
      : null;

  const expired =
    Boolean(policy.policyExpiresAt) && policy.policyExpiresAt
      ? new Date() > new Date(policy.policyExpiresAt)
      : false;

  const chainAllowed = policy.allowedChains.map((c) => c.toLowerCase()).includes(policy.chain.toLowerCase());

  let cooldownElapsed = true;
  if (state.lastRunAt) {
    const last = new Date(state.lastRunAt);
    cooldownElapsed = hoursBetween(new Date(), last) >= policy.cooldownHours;
  }

  const totalGainFloorMet = totalGainUsd != null ? totalGainUsd >= policy.minTotalGainUsd : false;

  const deltaThresholdMet =
    deltaSinceCheckpointUsd != null ? deltaSinceCheckpointUsd >= policy.minGainDeltaUsd : false;

  const gates = {
    expired,
    chainAllowed,
    cooldownElapsed,
    totalGainFloorMet,
    deltaThresholdMet,
  };

  const failed: string[] = [];
  if (expired) failed.push("Policy expiry passed");
  if (!chainAllowed) failed.push(`Chain "${policy.chain}" not in allowedChains`);
  if (!cooldownElapsed) failed.push(`Cooldown (${policy.cooldownHours}h) active`);
  if (!totalGainFloorMet && totalGainUsd != null)
    failed.push(`Total gain $${totalGainUsd.toFixed(2)} below floor $${policy.minTotalGainUsd}`);
  if (totalGainUsd == null) failed.push("PnL unavailable");
  if (!deltaThresholdMet && deltaSinceCheckpointUsd != null)
    failed.push(
      `Gain delta $${deltaSinceCheckpointUsd.toFixed(2)} below threshold $${policy.minGainDeltaUsd}`,
    );

  const allCore =
    !expired &&
    chainAllowed &&
    cooldownElapsed &&
    totalGainUsd != null &&
    totalGainFloorMet &&
    (deltaSinceCheckpointUsd != null ? deltaThresholdMet : false);

  const proposedCommand = allCore
    ? `zerion swap ${policy.chain} ${policy.swapAmount} ${policy.fromToken} ${policy.toToken} --wallet ${policy.walletName}`
    : null;

  const decision: "fire" | "hold" = allCore ? "fire" : "hold";
  const reason =
    decision === "fire"
      ? "All policy gates passed — eligible to crystallize gains into stables."
      : failed.length
        ? failed.join(" · ")
        : "Hold — conditions not met.";

  return {
    at,
    policy,
    pnlSnapshot: {
      totalGainUsd,
      realizedUsd,
      unrealizedUsd,
      deltaSinceCheckpointUsd,
    },
    gates,
    decision,
    reason,
    proposedCommand,
  };
}
