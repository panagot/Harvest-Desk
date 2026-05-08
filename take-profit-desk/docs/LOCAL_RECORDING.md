# Local screen recording checklist

Goal: Capture **Harvest Desk at `http://localhost:5173`** with **live Zerion data** where possible, matching [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md).

## 1. One-time setup

1. **Submodule + CLI deps** — from repo root (`Zerion/`):
   - `git submodule update --init --recursive`
   - `cd zerion-ai && npm install`
2. **API key file** — keep a single line in **`Zerion/api`** next to **`take-profit-desk/`** (already gitignored). The server picks it up automatically; no need to paste the key into chat or commit it.
3. **`.env` in `take-profit-desk/`** — copy from [`.env.example`](../.env.example):
   - **`DESK_WALLET`** = wallet name Zerion recognizes (replace `demo-wallet`).
   - **`EXECUTE_SECRET`** = long random string (not the default placeholder) if you film **Execute**.
   - **`MOCK_MODE=false`** — or omit **`MOCK_MODE`**; **`MOCK_MODE=true`** forces fake numbers even when an API key exists.
   - Optionally set **`ZERION_API_KEY=`** instead of the **`api`** file — then the navbar shows **Live · env**.
4. **App** — from `take-profit-desk/`:
   - `npm install`
   - `npm run dev` → UI **:5173**, API **:8787** (Vite proxies `/api`).

## 2. Before you hit record

| Check | Where |
|--------|--------|
| Navbar says **Live · sibling api** (or **Live · env**) | Top bar |
| **Overview** shows **API key source** + **CLI** + **Execute gate** | Readiness cards |
| **CLI** = “Detected” | If “Missing”, finish `zerion-ai` install before live PnL/swap shots |
| Policy wallet matches your live wallet | **Execution** page |
| Blur **Execute secret** if typing on camera | [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) |

## 3. Record in this order (suggested)

Same flow as **DEMO_SCRIPT**: problem → architecture → **Execution** (policy) → **Overview** / **Engine** → **Execution** (swap or mock + cut to live).

## 4. If live metrics fail

Read the amber **fetchError** on **Overview** (wallet name, CLI path, key rights). You can still record policy + engine, then use **Option B** in **DEMO_SCRIPT** (mock UI + separate live tx clip).
