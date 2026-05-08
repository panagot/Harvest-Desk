import { ExternalLink, Lock, Server, ShieldCheck } from 'lucide-react'

const columns = [
  {
    title: 'Product',
    items: [
      { label: 'Zerion CLI', href: 'https://github.com/zeriontech/zerion-ai' },
      { label: 'Zerion Web', href: 'https://zerion.io/' },
      { label: 'API Dashboard', href: 'https://dashboard.zerion.io/' },
    ],
  },
  {
    title: 'Developers',
    items: [
      { label: 'API reference', href: 'https://developers.zerion.io/' },
      { label: 'Portfolio recipe', href: 'https://developers.zerion.io/recipes/multi-chain-portfolio' },
      { label: 'PnL recipe', href: 'https://developers.zerion.io/recipes/wallet-pnl-tracker' },
    ],
  },
  {
    title: 'Security',
    items: [
      { label: 'Zerion Wallet Security', href: 'https://zerion.io/security' },
      { label: 'Bug bounty (Immunefi)', href: 'https://immunefi.com/bounty/zerion/' },
      { label: 'Help center', href: 'https://help.zerion.io/en/' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Supported chains', href: 'https://developers.zerion.io/supported-blockchains' },
      { label: 'Transaction history', href: 'https://developers.zerion.io/recipes/transaction-history' },
      { label: 'Wallet activity alerts', href: 'https://developers.zerion.io/recipes/wallet-activity-alerts' },
    ],
  },
] as const

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Scoped policies',
    body: 'Chain locks, spend envelopes, expiry, and cooldowns — automation without a god key.',
  },
  {
    icon: Server,
    title: 'CLI as execution plane',
    body: 'Swaps route through Zerion’s trading stack; this desk is orchestration and guardrails.',
  },
  {
    icon: Lock,
    title: 'Keys stay yours',
    body: 'Non-custodial by design — same posture as Zerion Wallet: credentials on your machine, not ours.',
  },
] as const

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        {label}
        <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-80" />
      </a>
    </li>
  )
}

export function Footer() {
  return (
    <footer className="mt-auto">
      {/* Trust strip — inspired by zerion.io/security pillar layout */}
      <div className="border-t border-zinc-200/80 bg-gradient-to-b from-zinc-50/90 to-zinc-100/80">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-center font-display text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Built with the same ideas as onchain safety products
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-zinc-200/90 bg-white/70 p-6 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_8px_24px_-12px_rgba(0,0,0,0.08)] backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-zinc-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dark footer band — zerion.io column structure */}
      <div className="bg-[var(--desk-footer)] text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 border-b border-zinc-800/80 pb-14 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            <div className="max-w-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-zinc-900">
                  H
                </span>
                <span className="font-display text-lg font-semibold text-white">Harvest Desk</span>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-zinc-500">
                A control surface for crystallizing gains via Zerion CLI — policies first, execution second. Not a Zerion product;
                reads public docs and tooling they publish for builders.
              </p>
              <p className="mt-6 text-xs leading-relaxed text-zinc-600">
                Zerion emphasizes self-custody, transaction preview, phishing protection, and public audits — see{' '}
                <a
                  href="https://zerion.io/security"
                  className="text-zinc-300 underline decoration-zinc-600 underline-offset-2 hover:text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  Wallet Security
                </a>{' '}
                for how they describe their posture.
              </p>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-8 lg:justify-end lg:gap-12">
              {columns.map((col) => (
                <div key={col.title}>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{col.title}</h3>
                  <ul className="mt-4 space-y-3">{col.items.map((item) => <LinkRow key={item.href} {...item} />)}</ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} Frontier build · Not affiliated with Zerion, Inc.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
              <a href="https://zerion.io/privacy/" className="text-zinc-500 hover:text-zinc-300" target="_blank" rel="noreferrer">
                Privacy
              </a>
              <a href="https://zerion.io/terms/" className="text-zinc-500 hover:text-zinc-300" target="_blank" rel="noreferrer">
                Terms
              </a>
              <a href="https://developers.zerion.io/" className="text-zinc-500 hover:text-zinc-300" target="_blank" rel="noreferrer">
                API docs
              </a>
              <span className="text-zinc-600">Funds at risk — test with minimal size.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
