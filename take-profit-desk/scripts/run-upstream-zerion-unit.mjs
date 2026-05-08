/**
 * Run zerion-ai unit tests (upstream) when the platform ships OWS natives (macOS/Linux).
 * On Win32 npm's glob + CLI spawn yields false failures — skipped with exit 0.
 */
import { execSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const deskRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const zerionAi = path.resolve(deskRoot, '..', 'zerion-ai')
const unitRoot = path.join(zerionAi, 'cli', 'tests', 'unit')

if (process.platform === 'win32') {
  console.error(
    '[skip] Zerion CLI upstream unit suite spawns Node + native OWS binaries (unsupported on Win32 npm). '
      + 'Run `npm run test:upstream` inside WSL or macOS/Linux for full parity.',
  )
  process.exit(0)
}

function collect(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) collect(full, acc)
    else if (name.endsWith('.test.mjs')) acc.push(full)
  }
  return acc
}

if (!existsSync(unitRoot)) {
  console.error('[skip] zerion-ai/cli/tests/unit not found — init submodule')
  process.exit(0)
}

const files = collect(unitRoot)
if (files.length === 0) {
  console.error('No unit *.test.mjs files found.')
  process.exit(1)
}

const quoted = files.map((f) => `"${f}"`).join(' ')
execSync(`node --test ${quoted}`, { cwd: zerionAi, stdio: 'inherit', shell: true })
