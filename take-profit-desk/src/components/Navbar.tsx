import { NavLink } from 'react-router-dom'
import { ExternalLink, Shield, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'

import type { DeskPayload } from '../types'

const links = [
  { to: '/overview', label: 'Overview' },
  { to: '/positions', label: 'Positions' },
  { to: '/engine', label: 'Policy engine' },
  { to: '/execution', label: 'Execution' },
] as const

type NavbarProps = {
  mockMode: boolean
  loading: boolean
  apiKeySource: NonNullable<DeskPayload['auth']['apiKeySource']>
  onRefresh: () => void
}

function liveBadgeLabel(apiKeySource: NavbarProps['apiKeySource']) {
  switch (apiKeySource) {
    case 'sibling_api_file':
      return 'Live · sibling api'
    case 'custom_key_file':
      return 'Live · key file'
    case 'environment':
      return 'Live · env'
    default:
      return 'Live API'
  }
}

export function Navbar({ mockMode, loading, apiKeySource, onRefresh }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/90 bg-[var(--desk-nav)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-[3.25rem] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <NavLink to="/overview" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-[13px] font-bold tracking-tight text-white shadow-sm">
            H
          </span>
          <div className="leading-tight text-left hidden sm:block">
            <span className="font-display text-[15px] font-semibold tracking-tight text-zinc-900">
              Harvest Desk
            </span>
            <span className="block text-[11px] font-medium text-zinc-500">Take-profit automation</span>
          </div>
        </NavLink>

        <nav className="flex flex-1 min-w-0 items-center gap-0.5 overflow-x-auto scrollbar-none md:flex-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-3',
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-initial items-center justify-end gap-2 sm:gap-3 shrink-0">
          <span
            className={cn(
              'hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium',
              mockMode
                ? 'border-amber-200/90 bg-amber-50 text-amber-900'
                : 'border-zinc-200 bg-zinc-50 text-zinc-800',
            )}
          >
            <Shield className="h-3.5 w-3.5 text-zinc-500" />
            {mockMode ? 'Demo data' : liveBadgeLabel(apiKeySource)}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-zinc-50"
          >
            <RefreshCw className={cn('h-4 w-4 text-zinc-500', loading && 'animate-spin')} />
            <span className="hidden sm:inline">Sync</span>
          </button>
          <a
            href="https://developers.zerion.io/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-800 underline decoration-zinc-300 underline-offset-4 hover:decoration-indigo-500"
          >
            API docs
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </a>
        </div>
      </div>
    </header>
  )
}
