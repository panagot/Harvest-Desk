import { Link } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { Panel } from '../components/Panel'
import { useDesk } from '../context/DeskContext'

export function PositionsPage() {
  const { portfolioRows } = useDesk()

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-slate-200/80 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Holdings</p>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
          Portfolio positions
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Zerion-derived snapshot used for crystallization sizing and checks. Drill into execution policy on{' '}
          <Link to="/execution" className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2">
            Execution
          </Link>
          .
        </p>
      </div>

      <Panel>
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Activity className="h-5 w-5 text-zinc-700" />
          <h2 className="font-display text-lg font-semibold text-slate-900">Positions</h2>
        </div>
        <div className="mt-4 overflow-hidden rounded-md border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Chain</th>
                <th className="px-4 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {portfolioRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                    No position rows returned yet.
                  </td>
                </tr>
              ) : (
                portfolioRows.slice(0, 50).map((row, i) => (
                  <tr key={`${row.symbol}-${i}`} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-900">
                      <span className="font-semibold">{row.symbol || '?'}</span>
                      {row.name ? <span className="ml-2 font-normal text-slate-500">{row.name}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.chain || '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-900">
                      {row.value != null ? `$${row.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </main>
  )
}
