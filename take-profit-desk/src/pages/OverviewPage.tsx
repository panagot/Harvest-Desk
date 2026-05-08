import { AlertTriangle, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { Panel } from '../components/Panel'
import { useDesk } from '../context/DeskContext'

export function OverviewPage() {
  const { loading, err, data, mockMode, pnl, apiKeySource, zerionCliPresent } = useDesk()

  const keyLabel =
    apiKeySource === 'sibling_api_file'
      ? '`…/Frontier/Zerion/api` (sibling key file)'
      : apiKeySource === 'environment'
        ? '`ZERION_API_KEY`'
        : apiKeySource === 'custom_key_file'
          ? '`ZERION_API_KEY_FILE`'
          : 'not loaded'

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
              Institutional-style guardrails around discretionary sells: Zerion-derived P&amp;L and portfolio snapshots,
              local policy envelopes, optional checkpointing, then single-path execution routed through{' '}
              <span className="font-medium text-slate-900">your fork</span> of the Zerion CLI.
            </p>
          </div>
          {!loading && (
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {mockMode ? (
                <span className="inline-flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Running on synthetic analytics
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-zinc-600" />
                  Live Zerion data (API routes through local CLI — see readiness below)
                </span>
              )}
            </div>
          )}
        </div>

        {!loading && !mockMode && !zerionCliPresent && (
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <strong className="font-semibold">Zerion CLI not found</strong>
            {' — '}Live PnL/portfolio queries need <code className="rounded bg-white/70 px-1">zerion-ai/cli/zerion.js</code>.
            Initialize the submodule then run{' '}
            <code className="rounded bg-white/70 px-1">npm install</code> in <code className="rounded bg-white/70 px-1">zerion-ai/</code>{' '}
            before recording swaps.
          </div>
        )}

        {!loading && !mockMode && (
          <div className="mt-6 grid gap-3 rounded-xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">API key source</p>
              <p className="mt-2 text-sm text-zinc-900">{keyLabel}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">CLI</p>
              <p className="mt-2 text-sm font-medium text-zinc-900">
                {zerionCliPresent ? 'Detected (ready for Zerion CLI calls)' : 'Missing (see alert above)'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Execute gate</p>
              <p className="mt-2 text-sm text-zinc-900">
                {data?.auth.executeSecretConfigured
                  ? 'Execute secret configured (blur it on camera)'
                  : 'Set EXECUTE_SECRET in .env — still change-me placeholder'}
              </p>
            </div>
          </div>
        )}

        {err && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {err}
          </div>
        )}

        {!loading && data?.fetchError && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Unable to hydrate live metrics: <span className="font-medium">{data.fetchError}</span>. Inspect wallet name
            and Zerion CLI configuration; policy authoring remains available.
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
            <p className="mt-3 text-xs text-slate-500">All-time Zerion attribution for this wallet lens.</p>
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
      </section>
    </main>
  )
}
