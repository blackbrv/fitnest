'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DayData {
  day: string
  completed: number
  total: number
}

interface ProgressChartProps {
  data?: DayData[]
}

const DEFAULT_DATA: DayData[] = [
  { day: 'Mon', completed: 4, total: 5 },
  { day: 'Tue', completed: 3, total: 5 },
  { day: 'Wed', completed: 5, total: 5 },
  { day: 'Thu', completed: 2, total: 5 },
  { day: 'Fri', completed: 4, total: 5 },
  { day: 'Sat', completed: 3, total: 5 },
  { day: 'Sun', completed: 1, total: 5 },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const completed = payload.find((p) => p.name === 'completed')?.value ?? 0
  const total = payload.find((p) => p.name === 'total')?.value ?? 0

  return (
    <div className="bg-surface-2 border border-white/10 rounded-xl px-3 py-2.5 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      <p className="text-xs text-primary">
        {completed}/{total} completed
      </p>
      <p className="text-[10px] text-muted mt-0.5">
        {total > 0 ? Math.round((completed / total) * 100) : 0}% rate
      </p>
    </div>
  )
}

export function ProgressChart({ data = DEFAULT_DATA }: ProgressChartProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Weekly Progress
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Family workouts completed per day
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#a3ff3f]" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-white/10" />
            Total
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          barCategoryGap="30%"
          barGap={3}
          margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255,255,255,0.06)"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8b95a5', fontSize: 11, fontWeight: 500 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8b95a5', fontSize: 11 }}
            allowDecimals={false}
            tickCount={4}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.04)', radius: 6 }}
          />
          {/* Total (background) bars */}
          <Bar
            dataKey="total"
            name="total"
            fill="rgba(255,255,255,0.08)"
            radius={[4, 4, 0, 0]}
          />
          {/* Completed (foreground) bars */}
          <Bar
            dataKey="completed"
            name="completed"
            fill="#a3ff3f"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
