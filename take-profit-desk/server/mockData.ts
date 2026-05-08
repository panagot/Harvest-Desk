import type { PnlStdout, PortfolioStdout } from "./zerionRunner.ts";

/** Deterministic-ish demo payload when MOCK_MODE=true */
export function mockPnl(walletName: string): PnlStdout {
  return {
    wallet: { name: walletName, address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0" },
    pnl: {
      totalGain: 1842.52,
      realizedGain: 620.11,
      unrealizedGain: 1222.41,
      totalGainPercent: 14.2,
      totalInvested: 10000,
      netInvested: 9850,
      totalFees: 128.4,
    },
  };
}

export function mockPortfolio(walletName: string): PortfolioStdout {
  return {
    wallet: { name: walletName, address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0" },
    portfolio: { total: 11842.52, change_24h: 312.44, currency: "usd" },
    positions: [
      { symbol: "ETH", name: "Ethereum", chain: "base", quantity: 1.82, value: 5800, price: 3186 },
      { symbol: "USDC", name: "USD Coin", chain: "base", quantity: 4200, value: 4200, price: 1 },
      { symbol: "OP", name: "Optimism", chain: "optimism", quantity: 2000, value: 1800, price: 0.9 },
    ],
    positionCount: 3,
  };
}
