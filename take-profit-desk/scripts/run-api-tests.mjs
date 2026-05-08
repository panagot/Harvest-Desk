/**
 * Spins up Harvest Desk Express on an ephemeral port with MOCK_MODE=true (no Zerion subprocess),
 * then runs test-ai-agent-flow.mjs against it — full PASS on native Windows CI.
 *
 * Override port: TEST_API_PORT=8878 npm run test:integration
 */
import { execSync, spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const deskRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const PORT = process.env.TEST_API_PORT ?? '8877'
const base = `http://127.0.0.1:${PORT}`

const requireDesk = createRequire(path.join(deskRoot, 'package.json'))
let tsxCli
try {
  const tsxDir = path.dirname(requireDesk.resolve('tsx/package.json'))
  tsxCli = path.join(tsxDir, 'dist', 'cli.mjs')
} catch {
  console.error('[test] Missing tsx — run npm install inside take-profit-desk')
  process.exit(1)
}

function waitForHealth() {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 45_000
    const tick = async () => {
      if (Date.now() > deadline) {
        reject(new Error(`API did not become ready within 45s at ${base}`))
        return
      }
      try {
        const res = await fetch(`${base}/api/health`)
        if (res.ok) {
          resolve()
          return
        }
      } catch {
        /* retry */
      }
      setTimeout(tick, 200)
    }
    tick()
  })
}

function killTree(child) {
  if (!child?.pid) return
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${child.pid} /t /f`, { stdio: 'ignore' })
    } else {
      child.kill('SIGTERM')
    }
  } catch {
    try {
      child.kill('SIGKILL')
    } catch {
      /* ignore */
    }
  }
}

async function main() {
  console.error('[test] Ephemeral mock API:', base)

  const env = {
    ...process.env,
    MOCK_MODE: 'true',
    PORT,
    NODE_ENV: 'test',
    VERCEL: '',
    CI: '',
  }

  const child = spawn(process.execPath, [tsxCli, path.join(deskRoot, 'server/index.ts')], {
    cwd: deskRoot,
    env,
    stdio: ['ignore', 'ignore', 'pipe'],
  })

  let stderrTail = ''
  child.stderr?.on('data', (d) => {
    stderrTail = (stderrTail + d.toString()).slice(-2000)
  })

  try {
    await waitForHealth()
    console.error('[test] Running agent flow smoke against', base)

    const tester = spawn(process.execPath, [path.join(deskRoot, 'scripts', 'test-ai-agent-flow.mjs')], {
      cwd: deskRoot,
      env: {
        ...process.env,
        DESK_API_BASE: base,
        MOCK_MODE: 'true',
        PORT,
      },
      stdio: 'inherit',
    })

    await new Promise((resolve) => tester.on('close', resolve))
    await new Promise((r) => setTimeout(r, 200))

    if (tester.exitCode !== 0) {
      console.error('\n[last server stderr]', stderrTail.slice(-800))
      process.exit(tester.exitCode ?? 1)
    }
    console.error('\n[test] Integration agent flow PASSED.\n')
  } finally {
    killTree(child)
    await new Promise((r) => setTimeout(r, 300))
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
