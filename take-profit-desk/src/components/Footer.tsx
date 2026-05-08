import { Github, Layers, Lock, Shield, Video } from 'lucide-react'
import { Link } from 'react-router-dom'

const internal = [
  { to: '/overview', label: 'Overview' },
  { to: '/positions', label: 'Positions' },
  { to: '/engine', label: 'Policy engine' },
  { to: '/execution', label: 'Execution & policy' },
  { to: '/agent', label: 'AI agent' },
] as const

const external = [
  { href: 'https://github.com/panagot/Harvest-Desk', label: 'GitHub repo' },
  {
    href: 'https://github.com/zeriontech/zerion-ai',
    label: 'Zerion CLI (fork this upstream)',
  },
  {
    href: 'https://harvest-desk.vercel.app/',
    label: 'Hosted demo UI',
  },
  { href: 'https://dashboard.zerion.io/', label: 'Zerion API keys' },
] as const

export function Footer() {
  const pillars = [
    { Icon: Shield, title: 'Scoped policies', body: 'Chain locks, expiry, cooldown, notional envelopes before any CLI call.' },
    { Icon: Layers, title: 'Forked Zerion CLI', body: 'Execution and wallet routing stay anchored to upstream zerion-ai + API.' },
    { Icon: Lock, title: 'Local credentials', body: 'API keys and wallets stay on your box — Harvest Desk orchestrates flows only.' },
  ] as const

  return (
    <footer className="mt-auto">
      <div className="border-t border-zinc-200/90 bg-gradient-to-b from-white to-zinc-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {pillars.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-zinc-200/90 bg-white/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </div>
              <h3 className="mt-4 font-display text-sm font-semibold text-zinc-900">{title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">{body}</p>
            </div>
          ))}
        </div>
      </div>

    <div className="bg-[var(--desk-footer)] text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-zinc-800/80 pb-12 lg:grid-cols-[1fr,auto] lg:gap-16">
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-zinc-900">
                H
              </span>
              <span className="font-display text-lg font-semibold text-white">Harvest Desk</span>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-zinc-500">
              Web control plane for Zerion Frontier: scoped take-profit policies, forked Zerion CLI execution layer, optional
              AI agent workflows. Submission stack — MIT licensed; wallets and keys stay local to your machine unless you configure
              them otherwise.
            </p>
          </div>
          <div className="flex flex-wrap gap-10 lg:gap-16">
            <div>
              <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                <Layers className="h-3.5 w-3.5" aria-hidden /> App pages
              </h3>
              <ul className="mt-4 space-y-2.5">
                {internal.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-zinc-400 hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                <Github className="h-3.5 w-3.5" aria-hidden /> Links &amp; forks
              </h3>
              <ul className="mt-4 space-y-2.5">
                {external.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-zinc-400 hover:text-white"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                <Video className="h-3.5 w-3.5" aria-hidden /> Demo
              </h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a
                    href="https://github.com/panagot/Harvest-Desk/blob/main/take-profit-desk/docs/DEMO_SCRIPT.md"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-zinc-400 hover:text-white"
                  >
                    Video outline (DEMO_SCRIPT)
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/panagot/Harvest-Desk/blob/main/take-profit-desk/docs/LOCAL_RECORDING.md"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-zinc-400 hover:text-white"
                  >
                    Local recording checklist
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} · MIT · Not a Zerion, Inc. product — built for the Frontier track.
          </p>
          <p className="text-xs text-zinc-600">
            Real funds at risk — start with tiny notionals. Swaps route through your forked CLI + Zerion trading APIs.
          </p>
        </div>
      </div>
    </div>
    </footer>
  )
}
