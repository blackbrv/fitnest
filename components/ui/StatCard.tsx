import { ComponentType } from 'react'
import { LucideProps, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ComponentType<LucideProps>
  trend?: number
  trendUp?: boolean
  className?: string
}

export function StatCard({ label, value, icon: Icon, trend, trendUp, className }: StatCardProps) {
  const hasTrend = trend !== undefined

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-white/8 bg-[#151922] p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#8b95a5]">{label}</span>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a3ff3f]/10">
            <Icon size={18} className="text-[#a3ff3f]" strokeWidth={2} />
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-[#f5f7fa]">
          {value}
        </span>

        {hasTrend && (
          <div
            className={cn(
              'mb-0.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              trendUp
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-red-500/15 text-red-400',
            )}
          >
            {trendUp ? (
              <TrendingUp size={11} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={11} strokeWidth={2.5} />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
