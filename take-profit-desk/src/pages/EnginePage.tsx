import { Link } from 'react-router-dom'
import { Gauge, Terminal } from 'lucide-react'
import { GatePill } from '../components/GatePill'
import { Panel } from '../components/Panel'
import { cn } from '../lib/utils'
import { useDesk } from '../context/DeskContext'

export function EnginePage() {
  const { evaluation: ev, busy, evaluateNow, checkpoint } = useDesk()

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-slate-200/80 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Automation</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
          Policy engine
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Gate evaluation before any swap is routed. Adjust policy fields on the{' '}
          <Link to="/execution" className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2">
            Execution
          </Link>{' '}
          page, then record checkpoints or append evaluations here.
        </p>
      </div>

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-zinc-700" />
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">Policy engine output</h2>
              <p className="text-sm text-slate-600">Gate taxonomy and proposed CLI parity line.</p>
            </div>
          </div>
          <span
            className={cn(
              'rounded-md border px-3 py-1.5 text-sm font-semibold',
              ev?.decision === 'fire'
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-200 bg-zinc-50 text-zinc-700',
            )}
          >
            {ev?.decision === 'fire' ? 'Eligible' : 'On hold'}
          </span>
        </div>

        {ev ? (
          <>
            <p className="mt-5 text-sm leading-relaxed text-slate-700">{ev.reason}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <GatePill ok={!ev.gates.expired} label="Policy expiry" />
              <GatePill ok={ev.gates.chainAllowed} label="Chain allow-list" />
              <GatePill ok={ev.gates.cooldownElapsed} label="Cooldown" />
              <GatePill ok={ev.gates.totalGainFloorMet} label="Gain floor" />
              <GatePill ok={ev.gates.deltaThresholdMet} label="Δ gain threshold" />
            </div>
            {ev.proposedCommand && (
              <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <Terminal className="h-3.5 w-3.5" />
                  Zerion parity command
                </p>
                <pre className="overflow-x-auto text-xs leading-relaxed text-slate-800">{ev.proposedCommand}</pre>
              </div>
            )}
          </>
        ) : (
          <p className="mt-5 text-sm text-slate-500">Evaluate once telemetry is reachable.</p>
        )}

        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            disabled={busy != null}
            onClick={() => void evaluateNow()}
            className="rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-45"
          >
            {busy === 'eval' ? 'Working…' : 'Append evaluation'}
          </button>
          <button
            type="button"
            disabled={busy != null}
            onClick={() => void checkpoint()}
            className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-45"
          >
            {busy === 'checkpoint' ? 'Working…' : 'Record checkpoint'}
          </button>
        </div>
      </Panel>
    </main>
  )
}
