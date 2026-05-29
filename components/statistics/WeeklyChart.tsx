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

interface WeeklyDataPoint {
  day: string
  completed: number
}

interface WeeklyChartProps {
  data: WeeklyDataPoint[]
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        backgroundColor: '#151922',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '10px 14px',
        color: '#f5f7fa',
      }}
    >
      <p style={{ color: '#8b95a5', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: '#a3ff3f', fontSize: '14px', fontWeight: 700 }}>
        {payload[0].value}{' '}
        <span style={{ color: '#8b95a5', fontWeight: 400, fontSize: '12px' }}>workouts</span>
      </p>
    </div>
  )
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          barCategoryGap="35%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            stroke="#8b95a5"
            tick={{ fill: '#8b95a5', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#8b95a5"
            tick={{ fill: '#8b95a5', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(163,255,63,0.05)', radius: 4 }}
          />
          <Bar
            dataKey="completed"
            fill="#a3ff3f"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
