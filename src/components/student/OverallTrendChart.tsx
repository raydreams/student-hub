import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { GradeHistoryPoint } from '../../data/types'

export function OverallTrendChart({ history }: { history: GradeHistoryPoint[] }) {
  const data = history.map((h) => ({
    date: h.date.slice(5),
    average: h.overallAverage,
    event: h.event,
  }))

  return (
    <div className="h-44 w-full sm:h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e2a45" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#8b9cb8', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={['dataMin - 2', 'dataMax + 2']}
            tick={{ fill: '#8b9cb8', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: '#121a2e',
              border: '1px solid #1e2a45',
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v: number) => [`${v.toFixed(1)}%`, 'Average']}
          />
          <Area
            type="monotone"
            dataKey="average"
            stroke="#60a5fa"
            strokeWidth={2}
            fill="url(#avgFill)"
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#93c5fd' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
