# Demo script (video)

Suggested length: **90 seconds–3 minutes**. Record **1080p**, show **URLs** briefly, **blur** EXECUTE_SECRET if typed.

## 1. Problem (15s)

- “Volatility wallets need **take-profit rails**: lock chain, caps, cooldown, no god-mode signer.”

## 2. Architecture (20s)

- Show repo: **forked Zerion CLI** (`zerion-ai`) + **Harvest Desk**.
- Mention: Zerion CLI for **PnL/portfolio/swap**; desk for **gates + UX + Telegram + cron**.

## 3. Policy (25s)

- Open **`/execution`**: wallet name, chain, pair, thresholds, **`allowedChains`**, expiry.
- **Persist policy**.
- Explain one **Zerion-side agent token + policy** (CLI) for unattended signing — point to Zerion docs.

## 4. Decision (20s)

- **`/overview`**: PnL cards (live or mock).
- **`/engine`**: gates, **Eligible vs HOLD**, proposed **CLI command**.
- **Record checkpoint** or show **evaluation** appended.

## 5. Execution (30s — critical)

**Option A (live):** small **swap** on cheap chain; paste execute secret → **Submit** → show **explorer / wallet activity**.

**Option B (split clip):** UI in mock → cut to separate screen recording of **same policy** firing a **tiny live tx** elsewhere.

## 6. Optional “bot” wow (15s)

- **`npm run agent:tick`** log line (`evaluated` / optional `execute_ok`).
- Telegram **`/status`** + **`/execute`** on phone (blur secret keyboard).

## 7. Closing (10s)

- Link repo + **Frontier** + “policies enforced before any swap routes through Zerion API.”

---

**Backup:** If live API fails mid-demo, show **mock** UI + **`agent:tick`** JSON + recorded tx hash screenshot.
