# Harvest Desk · Zerion take-profit agent

**Harvest Desk** is a submission-style stack for the Frontier hackathon Zerion track: a **scoped-policy** agent that **crystallizes gains into stables** using **your fork** of [zeriontech/zerion-ai](https://github.com/zeriontech/zerion-ai) (`zerion` CLI) as wallet + execution. Swaps route through **Zerion’s trading API**, matching track rules.

## Repo layout

| Piece | Role |
|--------|------|
| **`../zerion-ai/`** | Zerion CLI — **fork upstream** for your public submission. |
| **`take-profit-desk/`** (this app) | Web UI + REST API + **cron agent tick** + optional **Telegram bot** + shared **policy engine**. |
| **`../api`** (optional, gitignored) | Single-line Zerion API key read if `ZERION_API_KEY` is unset. |

## Submission checklist (you verify)

| Requirement | Done via |
|-------------|----------|
| Fork Zerion CLI | Point judges to **your GitHub fork** (replace this clone). |
| Real onchain tx | Live mode + CLI **agent token**; execute from **Execution** page or Telegram. |
| ≥1 scoped policy | `data/policy.json` gates + Zerion CLI **agent policies** for signing. |
| Demo video | Outline in [`docs/DEMO_SCRIPT.md`](./docs/DEMO_SCRIPT.md). |
| Open source | Public repo; omit `.env`, `api` key files, wallet material. |

## Dev: API + UI

```bash
cd zerion-ai && npm install   # upstream CLI
cd ../take-profit-desk && npm install
cp .env.example .env          # DESK_WALLET, EXECUTE_SECRET; set key in .env or ../api
npm run dev                   # API :8787, Vite :5173 (/api proxied)
```

App routes: `/overview`, `/positions`, `/engine`, `/execution`.

## Production-style single port

```bash
npm run build
npm run preview:all
```

Serves **`http://localhost:8787`** (static `dist/` + `/api`). Uses `SERVE_STATIC=1` via cross-env.

## Autonomous cron (`agent:tick`)

```bash
npm run agent:tick
```

Set **`AGENT_AUTO_EXECUTE=true`** to run **`zerion swap`** when gates return FIRE (dangerous — test tiny notionals).

## Telegram bot

```bash
# .env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_IDS (recommended allowlist)
npm run bot:telegram
```

Commands: `/status`, `/evaluate`, `/checkpoint`, `/execute <EXECUTE_SECRET>`.

## References

- [Zerion API docs](https://developers.zerion.io/) · [Dashboard](https://dashboard.zerion.io/)
- [Zerion Wallet Security](https://zerion.io/security)

MIT — see [`LICENSE`](./LICENSE).
