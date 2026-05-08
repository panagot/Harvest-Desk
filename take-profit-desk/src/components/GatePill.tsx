import { cn } from '../lib/utils'

export function GatePill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium',
        ok ? 'border-zinc-300 bg-zinc-100 text-zinc-900' : 'border-zinc-200 bg-zinc-50 text-zinc-500',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', ok ? 'bg-zinc-900' : 'bg-zinc-400')} />
      {label}
    </span>
  )
}
