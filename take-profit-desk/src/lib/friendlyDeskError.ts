/** Turn raw API / Zerion subprocess errors into short, actionable hints (no secrets). */
export function describeDeskFetchError(raw: string): { title: string; detail: string; fix?: string } {
  const t = raw.replace(/\s+/g, ' ').trim()

  if (
    t.includes('@open-wallet-standard/core-win32') ||
    (t.includes('open-wallet-standard') && t.includes('win32'))
  ) {
    return {
      title: 'Zerion CLI is not supported on native Windows Node',
      detail:
        'The CLI depends on Open Wallet Standard native binaries. npm only ships those for Linux and macOS — there is no Windows package on the registry.',
      fix: 'Use WSL2 (Ubuntu) inside your repo, install Node/npm there, then run `npm install` in `take-profit-desk` and `zerion-ai`. Or demo from a Linux/mac machine.',
    }
  }

  if (t.includes('viem') && (t.includes('ERR_MODULE_NOT_FOUND') || t.includes('Cannot find package'))) {
    return {
      title: 'Zerion CLI dependencies missing',
      detail: 'The forked Zerion CLI needs its own npm install (packages like viem live in zerion-ai/node_modules).',
      fix: 'Run: cd zerion-ai && npm install — or reinstall the desk (`npm install` in take-profit-desk runs this automatically).',
    }
  }

  if (t.includes('Cannot find module') || t.includes('MODULE_NOT_FOUND')) {
    return {
      title: 'CLI module missing',
      detail: 'Something the Zerion CLI imports is not installed in zerion-ai/.',
      fix: 'Run: cd zerion-ai && npm install',
    }
  }

  const short = t.length > 420 ? `${t.slice(0, 400)}…` : t
  return {
      title: 'Could not load live portfolio / PnL',
    detail: short,
    fix: 'Check wallet name matches your Zerion CLI wallet, submodule is cloned, and the API key is valid.',
  }
}
