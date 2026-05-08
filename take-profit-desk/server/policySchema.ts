import { z } from "zod";

/**
 * Desk policy mirrors hackathon guidance: chain lock, spend-ish limits,
 * expiry, explicit pair for the crystallization swap.
 */
export const DeskPolicySchema = z.object({
  walletName: z.string().min(1),
  /** Execution chain (same-chain swap) */
  chain: z.string().min(1),
  fromToken: z.string().min(1),
  toToken: z.string().min(1),
  /** Token amount string as accepted by Zerion CLI, e.g. "0.02" */
  swapAmount: z.string().min(1),
  /** Minimum all-time-style total gain (USD) before we consider triggers */
  minTotalGainUsd: z.number().nonnegative(),
  /** Minimum gain delta (USD) since last successful checkpoint to fire */
  minGainDeltaUsd: z.number().positive(),
  cooldownHours: z.number().positive(),
  /** Hard cap interpreted as USD notional for governance / UI warnings */
  maxNotionalUsdPerRun: z.number().positive(),
  allowedChains: z.array(z.string().min(1)).min(1),
  /** ISO timestamp string; null/omit = no expiry */
  policyExpiresAt: z.string().nullable().optional(),
});

export type DeskPolicy = z.infer<typeof DeskPolicySchema>;

export const defaultPolicy = (): DeskPolicy => ({
  walletName: process.env.DESK_WALLET || "demo-wallet",
  chain: "base",
  fromToken: "ETH",
  toToken: "USDC",
  swapAmount: "0.001",
  minTotalGainUsd: 0,
  minGainDeltaUsd: 25,
  cooldownHours: 24,
  maxNotionalUsdPerRun: 500,
  allowedChains: ["base"],
  policyExpiresAt: null,
});
