/**
 * Smoke / integration checks for Harvest Desk AI agent endpoints.
 *
 * Prerequisites: API listening (default http://127.0.0.1:8787)
 *   cd take-profit-desk && npm run dev
 *
 * Optional real swap test (risky — small notionals):
 *   set TEST_AI_AGENT_EXECUTE=1
 *   set EXECUTE_SECRET=your-match-to-.env-secret
 *
 * Usage:
 *   node ./scripts/test-ai-agent-flow.mjs
 *   node ./scripts/test-ai-agent-flow.mjs --base http://127.0.0.1:8787
 */
import process from 'node:process'

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    if (a.startsWith('--')) {
      const [k, v] = a.replace(/^--/, '').split('=')
      return [k, v ?? true]
    }
    return [a, true]
  }),
)

const base = String(typeof args.base === 'string' ? args.base : process.env.DESK_API_BASE || 'http://127.0.0.1:8787').replace(/\/$/, '')

async function json(path, opts = {}) {
  const url = `${base}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) throw new Error(`${opts.method || 'GET'} ${path} → ${res.status}: ${text.slice(0, 280)}`)
  return data
}

function heading(s) {
  console.error(`\n━━ ${s} ━━`)
}

function isOpenWalletWin32Failure(msg) {
  const s = String(msg)
  return (
    s.includes('@open-wallet-standard/core-win32') ||
    (s.includes('open-wallet-standard') && s.includes('win32'))
  )
}

async function main() {
  heading('Harvest Desk AI agent API flow')
  console.error(`Base URL: ${base}`)

  if (process.platform === 'win32') {
    console.warn(
      '\n⚠ Native Windows Node often cannot load Zerion CLI (Open Wallet Standard has no Win32 bindings on npm).',
    )
    console.warn('   If failures mention @open-wallet-standard/core-win32, use WSL2 + Linux Node for live CLI/VCR.\n')
  }

  heading('/api/health')
  const health = await json('/api/health')
  console.log(JSON.stringify(health, null, 2))
  if (!health.ok) throw new Error('health not ok')

  heading('GET /api/desk')
  let desk = await json('/api/desk')
  if (desk.fetchError) {
    console.error('Desk fetch errors (CLI / Zerion):\n', desk.fetchError.slice(0, 500))
    console.warn('\nContinuing with governance-only tests (evaluate may still append audit rows).\n')
  } else {
    console.log('Desk OK:', {
      wallet: desk.policy?.walletName,
      mockMode: desk.auth?.mockMode,
      zerionCliPresent: desk.auth?.zerionCliPresent,
    })
  }

  heading('POST /api/evaluate (agent reasoning step)')
  let evalPayload
  try {
    evalPayload = await json('/api/evaluate', { method: 'POST' })
  } catch (e) {
    if (process.platform === 'win32' && isOpenWalletWin32Failure(e.message)) {
      console.warn('\n✓ PARTIAL PASS: API is healthy, but Zerion CLI cannot run on native Windows (no OWS Win32 binary on npm).')
      console.warn('  → Use WSL2 (Ubuntu) with Node 20+ for a full live test, or set MOCK_MODE=true in .env and restart `npm run dev` to exercise the agent flow with synthetic PnL.\n')
      process.exit(0)
    }
    throw e
  }
  console.log('Evaluation decision:', evalPayload.evaluation?.decision)
  console.log('Reason:', evalPayload.evaluation?.reason?.slice?.(0, 200))

  heading('Reload /api/desk')
  desk = await json('/api/desk')
  console.log('Latest audit tail:', (desk.state?.runs ?? []).slice(-3))

  const doExecute =
    process.env.TEST_AI_AGENT_EXECUTE === '1' || process.env.TEST_AI_AGENT_EXECUTE === 'true'

  const secret =
    typeof args.secret === 'string' ? args.secret : process.env.EXECUTE_SECRET || ''

  if (!doExecute) {
    heading('Skipping POST /api/execute (set TEST_AI_AGENT_EXECUTE=1 to attempt real swap)')
    console.error('\nSmoke tests finished without on-chain submission.\n')
    return
  }

  if (!secret.trim()) throw new Error('Need EXECUTE_SECRET or --secret=… for execution test.')

  heading('POST /api/execute (REAL TX — ONLY if gates are FIRE)')
  const execPayload = await json('/api/execute', {
    method: 'POST',
    headers: {
      'X-Execute-Secret': secret,
    },
    body: JSON.stringify({}),
  })
  console.log(JSON.stringify(execPayload, null, 2))

  heading('✓ Completed (including execution attempt)')
}

main().catch((e) => {
  console.error('\n❌ Test failed:', e.message)
  console.error('\nIs the API running?  npm run dev  (inside take-profit-desk)')
  console.error('')
  process.exit(1)
})
