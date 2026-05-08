export type DeskPolicy = {
  walletName: string
  chain: string
  fromToken: string
  toToken: string
  swapAmount: string
  minTotalGainUsd: number
  minGainDeltaUsd: number
  cooldownHours: number
  maxNotionalUsdPerRun: number
  allowedChains: string[]
  policyExpiresAt?: string | null
}

export type DeskEvaluation = {
  at: string
  decision: 'fire' | 'hold'
  reason: string
  proposedCommand: string | null
  gates: {
    expired: boolean
    chainAllowed: boolean
    cooldownElapsed: boolean
    totalGainFloorMet: boolean
    deltaThresholdMet: boolean
  }
  pnlSnapshot: {
    totalGainUsd: number | null
    realizedUsd: number | null
    unrealizedUsd: number | null
    deltaSinceCheckpointUsd: number | null
  }
}

export type DeskPayload = {
  auth: {
    mockMode: boolean
    apiKeyConfigured: boolean
    executeSecretConfigured: boolean
  }
  policy: DeskPolicy
  state: {
    lastEvaluationAt: string | null
    lastRunAt: string | null
    lastCheckpointTotalGainUsd: number | null
    runs: Array<{ at: string; kind: string; note?: string; txHash?: string }>
  }
  pnl: unknown
  portfolio: unknown
  evaluation: DeskEvaluation | null
  fetchError: string | null
}
