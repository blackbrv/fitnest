import { ComponentType, ReactNode } from 'react'
import { LucideProps } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ComponentType<LucideProps>
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl',
        'border border-dashed border-white/10 bg-white/2 px-6 py-14 text-center',
        className,
      )}
    >
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 ring-1 ring-border">
          <Icon size={26} className="text-muted" strokeWidth={1.5} />
        </span>
      )}

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="max-w-xs text-sm text-muted">{description}</p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
