/**
 * After `npm install` in take-profit-desk, install zerion-ai deps locally
 * so the CLI can resolve `viem` and other packages. Skips on Vercel/CI.
 */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const deskRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(deskRoot, '..')
const zerionAi = path.join(repoRoot, 'zerion-ai')

if (process.env.VERCEL === '1' || process.env.CI === 'true') {
  process.exit(0)
}

if (!existsSync(path.join(zerionAi, 'package.json'))) {
  console.warn('[harvest-desk] zerion-ai folder missing — skipping CLI dependency install')
  process.exit(0)
}

try {
  console.info('[harvest-desk] Installing Zerion CLI dependencies (zerion-ai/)…')
  execSync('npm install', { cwd: zerionAi, stdio: 'inherit', shell: true })
} catch {
  console.warn('[harvest-desk] zerion-ai npm install failed — run `npm install` inside zerion-ai/ manually')
  process.exit(0)
}
