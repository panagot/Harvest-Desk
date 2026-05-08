import { AlertTriangle, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { describeDeskFetchError } from '../lib/friendlyDeskError'
import { Panel } from '../components/Panel'
import { Link } from 'react-router-dom'
import { useDesk } from '../context/DeskContext'

export function OverviewPage() {
  const { loading, err, data, mockMode, pnl, zerionCliPresent, load } = useDesk()

  const fetchFriendly = data?.fetchError ? describeDeskFetchError(data.fetchError) : null

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <section className="border-b border-slate-200/80 pb-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <LayoutDashboard className="h-4 w-4 text-zinc-700" />
              Overview
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.02em] text-zinc-950 sm:text-[2.5rem] sm:leading-[1.15]">
              Take-profit crystallization
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Read positions and PnL from your fork of the Zerion CLI, apply take-profit policies locally, then optionally
              settle into stables through Zerion’s routing when your gates allow it.
            </p>
          </div>
          {!loading && (
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {mockMode ? (
                <span className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Practice mode — no live key
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-950 shadow-sm">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
                  Live data {zerionCliPresent ? 'ready' : '— CLI still setting up'}
                </span>
              )}
            </div>
          )}
        </div>

        {!loading && mockMode && (
          <p className="mt-5 text-sm text-slate-600">
            Add a Zerion agent API key (<code className="rounded bg-zinc-100 px-1 py-0.5 text-[13px]">.env</code> or sibling{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-[13px]">api</code> file), set{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-[13px]">MOCK_MODE=false</code>, then hit{' '}
            <button
              type="button"
              className="font-semibold text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900"
              onClick={() => void load()}
            >
              Sync
            </button>
            .
          </p>
        )}

        {!loading && !mockMode && !zerionCliPresent && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <strong className="font-semibold">Finish CLI setup</strong> — clone the{' '}
            <code className="rounded bg-white/80 px-1 py-0.5 text-[13px]">zerion-ai</code> submodule and run{' '}
            <code className="rounded bg-white/80 px-1 py-0.5 text-[13px]">npm install</code> there (Harvest Desk runs this on{' '}
            <code className="rounded bg-white/80 px-1 py-0.5 text-[13px]">npm install</code>). Then sync again.
          </div>
        )}

        {err && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{err}</div>
        )}

        {!loading && fetchFriendly && (
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50/90 px-5 py-4 text-sm text-amber-950 shadow-sm">
            <p className="font-semibold text-amber-950">{fetchFriendly.title}</p>
            <p className="mt-2 leading-relaxed text-amber-900/95">{fetchFriendly.detail}</p>
            {fetchFriendly.fix && (
              <p className="mt-3 rounded-md bg-white/80 px-3 py-2 font-medium text-zinc-900">{fetchFriendly.fix}</p>
            )}
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-black"
            >
              Retry sync
            </button>
          </div>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Panel className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total gain</p>
            <p className="mt-3 font-display text-3xl font-bold tabular-nums text-slate-900">
              {pnl?.totalGain != null
                ? `$${Number(pnl.totalGain).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : '—'}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Zerion attribution for the wallet configured on the{' '}
              <Link to="/execution" className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900">
                Execution
              </Link>{' '}
              page.
            </p>
          </Panel>
          <Panel className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Realized</p>
            <p className="mt-3 font-display text-2xl font-semibold tabular-nums text-slate-900">
              {pnl?.realizedGain != null
                ? `$${Number(pnl.realizedGain).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : '—'}
            </p>
          </Panel>
          <Panel className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unrealized</p>
            <p className="mt-3 font-display text-2xl font-semibold tabular-nums text-slate-900">
              {pnl?.unrealizedGain != null
                ? `$${Number(pnl.unrealizedGain).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : '—'}
            </p>
          </Panel>
        </div>

        {!loading && !mockMode && data?.auth && !data.auth.executeSecretConfigured && (
          <p className="mt-8 text-xs text-zinc-500">
            Tip: configure <code className="rounded bg-zinc-100 px-1 py-0.5">EXECUTE_SECRET</code> before automations or swaps
            from the <Link to="/agent" className="font-medium text-zinc-800 underline underline-offset-2 hover:text-black">AI agent</Link> page.
          </p>
        )}
      </section>
    </main>
  )
}
