import { ArrowRightLeft, Database } from 'lucide-react'
import { Panel } from '../components/Panel'
import type { DeskPolicy } from '../types'
import { useDesk } from '../context/DeskContext'

export function ExecutionPage() {
  const {
    data,
    busy,
    policyDraft,
    setPolicyDraft,
    executeSecret,
    setExecuteSecret,
    savePolicy,
    executeSwap,
    evaluation: ev,
  } = useDesk()

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-slate-200/80 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Operate</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
          Execution &amp; policy ledger
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Persist policy JSON to disk on the API host, then route swaps through Zerion CLI when gates show{' '}
          <span className="font-medium text-zinc-900">Eligible</span> on the Policy engine page.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl gap-10">
        <Panel>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Database className="h-5 w-5 text-zinc-700" />
            <h2 className="font-display text-lg font-semibold text-slate-900">Policy ledger</h2>
          </div>

          {!policyDraft ? (
            <p className="mt-4 text-sm text-slate-500">Loading workspace policy…</p>
          ) : (
            <div className="mt-5 space-y-4">
              {(
                [
                  ['walletName', 'Wallet name', 'text'],
                  ['chain', 'Execution chain', 'text'],
                  ['fromToken', 'From token symbol', 'text'],
                  ['toToken', 'Settlement symbol', 'text'],
                  ['swapAmount', 'Notional amount (CLI string)', 'text'],
                ] as const
              ).map(([key, label, type]) => (
                <label key={key} className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
                  <input
                    type={type}
                    className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    value={String(policyDraft[key as keyof DeskPolicy] ?? '')}
                    onChange={(e) =>
                      setPolicyDraft({ ...policyDraft, [key]: e.target.value } as DeskPolicy)
                    }
                  />
                </label>
              ))}

              {(
                [
                  ['minTotalGainUsd', 'Minimum cumulative gain floor (USD)'],
                  ['minGainDeltaUsd', 'Δ gain versus checkpoint (USD)'],
                  ['cooldownHours', 'Cooldown duration (hours)'],
                  ['maxNotionalUsdPerRun', 'Notional advisory cap (USD)'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
                  <input
                    type="number"
                    step="any"
                    className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                    value={Number(policyDraft[key as keyof DeskPolicy] ?? 0)}
                    onChange={(e) =>
                      setPolicyDraft({
                        ...policyDraft,
                        [key]: Number(e.target.value),
                      } as DeskPolicy)
                    }
                  />
                </label>
              ))}

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Authorized chains (comma-separated)
                </span>
                <input
                  type="text"
                  className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  value={policyDraft.allowedChains.join(', ')}
                  onChange={(e) =>
                    setPolicyDraft({
                      ...policyDraft,
                      allowedChains: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Policy expiry (ISO-8601, blank for none)
                </span>
                <input
                  type="text"
                  placeholder="2099-12-31T23:59:59.000Z"
                  className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  value={policyDraft.policyExpiresAt ?? ''}
                  onChange={(e) =>
                    setPolicyDraft({
                      ...policyDraft,
                      policyExpiresAt: e.target.value.trim() === '' ? null : e.target.value.trim(),
                    })
                  }
                />
              </label>

              <button
                type="button"
                disabled={busy != null}
                onClick={() => void savePolicy()}
                className="mt-3 w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:opacity-45"
              >
                {busy === 'save' ? 'Persisting…' : 'Persist policy'}
              </button>
            </div>
          )}
        </Panel>

        <Panel>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <ArrowRightLeft className="h-5 w-5 text-zinc-700" />
            <h2 className="font-display text-lg font-semibold text-slate-900">Controlled execution</h2>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-slate-600">
            Server-side invokes <code className="rounded bg-slate-100 px-1 py-0.5 text-[13px] text-slate-800">zerion swap</code>{' '}
            with segregated approvals. Provision an unattended agent credential per Zerion documentation; supply{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[13px] text-slate-800">EXECUTE_SECRET</code> and mirror it below.
          </p>
          <input
            type="password"
            autoComplete="off"
            placeholder="Execution secret"
            className="mt-4 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
            value={executeSecret}
            onChange={(e) => setExecuteSecret(e.target.value)}
          />
          <button
            type="button"
            disabled={busy != null || ev?.decision !== 'fire'}
            onClick={() => void executeSwap()}
            className="mt-3 w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none"
          >
            {busy === 'exec' ? 'Routing through Zerion CLI…' : 'Route crystallization swap'}
          </button>
          {!data?.auth.executeSecretConfigured && (
            <p className="mt-3 text-xs leading-relaxed text-amber-800">
              Rotate the default execution secret inside your deployment environment prior to unattended operation.
            </p>
          )}
        </Panel>

        <Panel>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Activity log</h3>
          <ul className="mt-4 max-h-64 space-y-2 overflow-auto text-xs text-slate-600">
            {data?.state.runs.slice(-12).reverse().map((r, i) => (
              <li key={`${r.at}-${i}`} className="flex justify-between gap-3 border-b border-slate-100 pb-2 font-mono last:border-none">
                <span>{new Date(r.at).toLocaleString()}</span>
                <span className="shrink-0 font-semibold uppercase tracking-wide text-zinc-900">{r.kind}</span>
              </li>
            ))}
            {((data?.state.runs.length ?? 0) === 0) && <li>No recorded activity.</li>}
          </ul>
        </Panel>
      </div>
    </main>
  )
}
