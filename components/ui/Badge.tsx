import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-[#a3ff3f]/15 text-[#a3ff3f] ring-[#a3ff3f]/25',
  success: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-400 ring-amber-500/25',
  danger: 'bg-red-500/15 text-red-400 ring-red-500/25',
  neutral: 'bg-white/8 text-[#8b95a5] ring-white/10',
}

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'text-xs font-medium ring-1 ring-inset',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
