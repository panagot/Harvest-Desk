import { NavLink } from 'react-router-dom'
import { Bot, Shield, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'

const links = [
  { to: '/overview', label: 'Overview' },
  { to: '/positions', label: 'Positions' },
  { to: '/engine', label: 'Policy engine' },
  { to: '/execution', label: 'Execution' },
  { to: '/agent', label: 'AI agent', icon: Bot },
] as const

type NavbarProps = {
  mockMode: boolean
  loading: boolean
  zerionCliPresent: boolean
  onRefresh: () => void
}

function statusBadgeLabel(mockMode: boolean, cliPresent: boolean) {
  if (mockMode) return 'Practice mode'
  if (!cliPresent) return 'CLI install pending'
  return 'Live · Zerion'
}

export function Navbar({ mockMode, loading, zerionCliPresent, onRefresh }: NavbarProps) {
  return (
    <header className="sticky top-0 z-[100] border-b border-zinc-200/90 bg-[var(--desk-nav)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-[3.25rem] max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <NavLink to="/overview" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-[13px] font-bold tracking-tight text-white shadow-sm">
            H
          </span>
          <div className="hidden leading-tight text-left sm:block">
            <span className="font-display text-[15px] font-semibold tracking-tight text-zinc-900">Harvest Desk</span>
            <span className="block text-[11px] font-medium text-zinc-500">Take-profit automation</span>
          </div>
        </NavLink>

        <div className="min-w-0 flex-1 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <nav className="flex w-max items-center gap-0.5 pr-1 md:w-auto md:flex-wrap">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-3',
                    isActive
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                  )
                }
              >
                {'icon' in l && l.icon ? <l.icon className="hidden h-[15px] w-[15px] sm:inline opacity-80" strokeWidth={2} /> : null}
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="relative z-[110] flex shrink-0 items-center justify-end gap-2 sm:gap-2.5">
          <span
            className={cn(
              'hidden max-w-[10rem] truncate sm:inline-flex sm:max-w-none items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium sm:text-xs',
              mockMode
                ? 'border-amber-200/90 bg-amber-50 text-amber-900'
                : 'border-zinc-200 bg-zinc-50 text-zinc-800',
            )}
            title=""
          >
            <Shield className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
            {statusBadgeLabel(mockMode, zerionCliPresent)}
          </span>
          <button
            type="button"
            aria-busy={loading}
            aria-label="Reload desk data"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => void onRefresh()}
            className="touch-manipulation inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-zinc-50 active:bg-zinc-100"
          >
            <RefreshCw className={cn('h-4 w-4 text-zinc-500', loading && 'animate-spin')} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>
    </header>
  )
}
