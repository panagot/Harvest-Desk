# Frontier · Zerion build — [Harvest Desk](https://github.com/panagot/Harvest-Desk)

```bash
git clone --recurse-submodules https://github.com/panagot/Harvest-Desk.git
cd Harvest-Desk
```

Already cloned without submodules?

```bash
git submodule update --init --recursive
```

## Contents

| Directory | Purpose |
|-----------|---------|
| [`zerion-ai/`](./zerion-ai/) | **Git submodule** → [zeriontech/zerion-ai](https://github.com/zeriontech/zerion-ai). Frontier asks for **your fork**: fork that repo on GitHub, then repoint: `git config -f .gitmodules submodule.zerion-ai.url https://github.com/<you>/zerion-ai.git` and `git submodule sync --recursive`. |
| [`take-profit-desk/`](./take-profit-desk/) | Dashboard, REST API, `agent:tick`, optional Telegram bot. → [`take-profit-desk/README.md`](./take-profit-desk/README.md). |
| `api` (local file) | One-line Zerion API key beside this folder. **[.gitignored](.gitignore) — never commit.** |

Quick start UI: `cd take-profit-desk && npm install && npm run dev`. Demo script: **`take-profit-desk/docs/DEMO_SCRIPT.md`**.

**Vercel:** Root [`vercel.json`](./vercel.json) and [`index.ts`](./index.ts) run install/build against **`take-profit-desk/`** so the site works when the project Root Directory is the **repo root** (GitHub default). Optionally set Root Directory to **`take-profit-desk`** and use [`take-profit-desk/vercel.json`](./take-profit-desk/vercel.json) only.
