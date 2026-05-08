import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  CircleDot,
  Play,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Panel } from '../components/Panel'
import { useDesk } from '../context/DeskContext'

/**
 * Guided flow: snapshot → gated evaluation → guarded swap via forked Zerion CLI (submission path).
 */
export function AgentPage() {
  const {
    data,
    evaluation,
    mockMode,
    busy,
    executeSecret,
    setExecuteSecret,
    load,
    evaluateNow,
    executeSwap,
    checkpoint,
  } = useDesk()

  const fireReady = evaluation?.decision === 'fire' && !mockMode
  const runs = [...(data?.state.runs ?? [])].reverse().slice(0, 14)

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-slate-200/80 pb-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Bot className="h-4 w-4 text-zinc-900" aria-hidden />
            AI agent
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
            Guided automation
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            This surface drives the same server routes as Telegram / cron: it reads your{' '}
            <strong className="text-zinc-900">scoped policy</strong> (
            chains, expiry, cooldown, notional envelope), evaluates gates against Zerion-derived PnL, then can submit a{' '}
            <strong className="text-zinc-900">real swap</strong> through your fork of the Zerion CLI (Zerion API routing —
            Frontier requirement). Demo with tiny notionals first.
          </p>
          {mockMode && (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>You are in practice mode: wire a Zerion agent key and unset forced mock mode to record live execution.</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl gap-8">
        <Panel>
          <h2 className="font-display text-lg font-semibold text-slate-900">Workflow</h2>
          <ol className="mt-5 space-y-4 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                1
              </span>
              <div>
                <p className="font-semibold text-zinc-900">Author policy</p>
                <p className="mt-1 text-slate-600">
                  Set wallet, chain lock, spend caps, and pair on the{' '}
                  <Link to="/execution" className="font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900">
                    Execution
                  </Link>{' '}
                  page, then persist.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                2
              </span>
              <div>
                <p className="font-semibold text-zinc-900">Refresh desk</p>
                <p className="mt-1 text-slate-600">Sync pulls PnL + portfolio so the agent reasons on current numbers.</p>
                <button
                  type="button"
                  onClick={() => void load()}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-900 shadow-sm hover:bg-zinc-50"
                >
                  <Play className="h-3.5 w-3.5" aria-hidden />
                  Refresh snapshot
                </button>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                3
              </span>
              <div className="flex-1">
                <p className="font-semibold text-zinc-900">Run evaluation</p>
                <p className="mt-1 text-slate-600">
                  Appends an audit row and surfaces <span className="font-medium">Eligible</span> only when every gate passes.
                </p>
                <button
                  type="button"
                  disabled={busy != null}
                  onClick={() => void evaluateNow()}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:opacity-45"
                >
                  <Zap className="h-4 w-4" aria-hidden />
                  {busy === 'eval' ? 'Evaluating…' : 'Run agent evaluation'}
                </button>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                4
              </span>
              <div className="flex-1">
                <p className="font-semibold text-zinc-900">Optional checkpoint</p>
                <p className="mt-1 text-slate-600">Pins PnL deltas for gated “since checkpoint” thresholds.</p>
                <button
                  type="button"
                  disabled={busy != null}
                  onClick={() => void checkpoint()}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 disabled:opacity-45"
                >
                  Record checkpoint
                </button>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                5
              </span>
              <div className="flex-1">
                <p className="font-semibold text-zinc-900">Execute on-chain swap (guarded)</p>
                <p className="mt-1 text-slate-600">
                  Mirrors the Zerion Wallet agent-token flow documented by Zerion. Supply the same{' '}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[13px]">EXECUTE_SECRET</code> configured on the API
                  host.
                </p>
                <input
                  type="password"
                  autoComplete="off"
                  placeholder="Execution secret"
                  className="mt-3 w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                  value={executeSecret}
                  onChange={(e) => setExecuteSecret(e.target.value)}
                />
                <button
                  type="button"
                  disabled={busy != null || !fireReady}
                  onClick={() => void executeSwap()}
                  className="mt-3 w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500"
                >
                  {busy === 'exec' ? 'Sending through Zerion CLI…' : 'Submit real crystallization swap'}
                </button>
                {!fireReady && evaluation && (
                  <p className="mt-2 text-xs text-amber-800">
                    Gates are HOLD — tighten policy or checkpoints, or rerun evaluation after telemetry updates.
                  </p>
                )}
              </div>
            </li>
          </ol>
        </Panel>

        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h2 className="font-display text-lg font-semibold text-slate-900">Gate readout</h2>
            {evaluation?.decision === 'fire' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-900">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Eligible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-700">
                <CircleDot className="h-3.5 w-3.5" aria-hidden /> Hold
              </span>
            )}
          </div>
          {evaluation ? (
            <dl className="mt-5 space-y-3 text-sm text-slate-700">
              <div>
                <dt className="text-xs uppercase tracking-wide text-zinc-500">Reason</dt>
                <dd className="mt-1 text-zinc-900">{evaluation.reason}</dd>
              </div>
              {evaluation.proposedCommand && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-zinc-500">Proposed Zerion CLI</dt>
                  <dd className="mt-2 rounded-lg bg-zinc-950 px-4 py-3 font-mono text-[13px] leading-relaxed text-emerald-200">
                    {evaluation.proposedCommand}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-5 text-sm text-slate-500">Run an evaluation after data loads to populate this panel.</p>
          )}
        </Panel>

        <Panel>
          <h2 className="font-display text-lg font-semibold text-slate-900">Recent audit trail</h2>
          <ul className="mt-4 space-y-2 text-xs font-mono text-slate-600">
            {runs.map((r, i) => (
              <li key={`${r.at}-${r.kind}-${i}`} className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
                <span>{new Date(r.at).toLocaleString()}</span>
                <span className="shrink-0 font-semibold uppercase text-zinc-900">{r.kind}</span>
              </li>
            ))}
            {runs.length === 0 && <li className="text-slate-500">No events yet.</li>}
          </ul>
        </Panel>
      </div>
    </main>
  )
}
