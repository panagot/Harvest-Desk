# Local screen recording checklist

Goal: Capture **Harvest Desk at `http://localhost:5173`** with **live Zerion data** where possible, matching [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md).

## 1. One-time setup

1. **Submodule + CLI deps** — from repo root (`Zerion/`):
   - `git submodule update --init --recursive`
   - `cd zerion-ai && npm install` (**or** rely on `take-profit-desk` **`npm install`** — it runs this automatically on your machine unless `VERCEL` / `CI` is set).
2. **API key file** — keep a single line in **`Zerion/api`** next to **`take-profit-desk/`** (already gitignored). The server picks it up automatically; no need to paste the key into chat or commit it.
3. **`.env` in `take-profit-desk/`** — copy from [`.env.example`](../.env.example):
   - **`DESK_WALLET`** = wallet name Zerion recognizes (replace `demo-wallet`).
   - **`EXECUTE_SECRET`** = long random string (not the default placeholder) if you film **Execute**.
   - **`MOCK_MODE=false`** — or omit **`MOCK_MODE`**; **`MOCK_MODE=true`** forces fake numbers even when an API key exists.
   - Optionally set **`ZERION_API_KEY=`** instead of the **`api`** file — then the navbar shows **Live · env**.
4. **App** — from `take-profit-desk/`:
   - `npm install`
   - `npm run dev` → UI **:5173**, API **:8787** (Vite proxies `/api`).
5. **Smoke test (AI agent APIs)** — with dev server running:
   ```bash
   npm run test:agent
   ```
   On **native Windows**, Zerion CLI may refuse to load (missing Win32 Open Wallet Standard binary — use **WSL2** or **`MOCK_MODE=true`** for a full pass). The script prints **PARTIAL PASS** when the API works but CLI cannot spawn.

## 2. Before you hit record

| Check | Where |
|--------|--------|
| Navbar shows **Live · Zerion** (or **Practice mode**) | Top bar |
| **Overview** shows friendly errors if CLI deps are missing | Amber callout + **Retry sync** |
| **CLI** detected (navbar) | If **CLI install pending**, run `npm install` in `zerion-ai/` |
| Use **AI agent** page for guided evaluate + swap | `/agent` |
| Policy wallet matches your live wallet | **Execution** page |
| Blur **Execute secret** if typing on camera | [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) |

## 3. Record in this order (suggested)

Same flow as **DEMO_SCRIPT**: problem → architecture → **Execution** (policy) → **Overview** / **Engine** → **AI agent** (evaluate + optional real swap).

## 4. If live metrics fail

## 5. Automated tests (`take-profit-desk`)

```bash
cd take-profit-desk
npm install
npm test
```

**`npm test`** runs **`test:all`**: **`npm run build`**, **`test:integration`** (temporary mock API on port **8877** + **`test-ai-agent-flow.mjs`** — passes on native Windows), and **`test:upstream`** (Zerion CLI unit tests — **skipped on Win32**, run inside **WSL/macOS/Linux** for real CLI coverage).

| Script | Purpose |
|--------|---------|
| `npm test` · `npm run test:all` | Full suite |
| `npm run test:integration` | Mock server + agent API smoke only |
| `npm run test:agent` | Against **your** running API (default `http://127.0.0.1:8787`) |
| `npm run test:upstream` | Upstream `zerion-ai` unit files (non-Windows) |
