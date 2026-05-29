import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type ProgressSize = 'sm' | 'md'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  size?: ProgressSize
  showLabel?: boolean
}

const trackSizeClasses: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
}

export function Progress({
  value,
  size = 'md',
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs text-[#8b95a5]">Progress</span>
          <span className="text-xs font-semibold text-[#a3ff3f]">{clamped}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'w-full overflow-hidden rounded-full bg-white/8',
          trackSizeClasses[size],
        )}
      >
        <div
          className="h-full rounded-full bg-[#a3ff3f] transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
