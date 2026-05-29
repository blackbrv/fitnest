'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface MonthlyDataPoint {
  date: string
  completed: number
}

interface MonthlyChartProps {
  data: MonthlyDataPoint[]
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
        <span style={{ color: '#8b95a5', fontWeight: 400, fontSize: '12px' }}>
          {payload[0].value === 1 ? 'workout' : 'workouts'}
        </span>
      </p>
    </div>
  )
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  // Show every 5th label to avoid crowding on 30-day chart
  const tickFormatter = (_: string, index: number) => {
    if (index % 5 === 0) {
      return data[index]?.date ?? ''
    }
    return ''
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
        >
          <defs>
            <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a3ff3f" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#a3ff3f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="#8b95a5"
            tick={{ fill: '#8b95a5', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={tickFormatter}
            interval={0}
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
            cursor={{ stroke: 'rgba(163,255,63,0.2)', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#a3ff3f"
            strokeWidth={2}
            fill="url(#limeGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#a3ff3f', stroke: '#0f1115', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
