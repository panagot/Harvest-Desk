import type { ComponentProps } from 'react'
import { cn } from '../lib/utils'

export function Panel({ className, ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-24px_rgba(0,0,0,0.12)]',
        className,
      )}
      {...props}
    />
  )
}
