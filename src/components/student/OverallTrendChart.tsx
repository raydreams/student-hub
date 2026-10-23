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

interface OverallTrendChartProps {
  history: GradeHistoryPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    payload: {
      date: string
      average: number
      event?: string
    }
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div className="rounded-lg border border-[#232a3d] bg-[#0e1118] px-3.5 py-2 shadow-lg text-left">
      <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
        <span>{data.date}</span>
        <span className="font-medium text-blue-400">TeachAssist Record</span>
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-lg font-bold text-white tabular-nums">
          {data.average.toFixed(1)}%
        </span>
        <span className="text-xs text-slate-400">overall</span>
      </div>
      {data.event && (
        <p className="mt-1 text-xs text-slate-300 border-t border-[#1c2233] pt-1">
          {data.event}
        </p>
      )}
    </div>
  )
}

export function OverallTrendChart({ history }: OverallTrendChartProps) {
  const data = history.map((h) => ({
    date: h.date.slice(5),
    average: h.overallAverage,
    event: h.event,
  }))

  const minVal = Math.floor(Math.min(...history.map((h) => h.overallAverage)) - 2)
  const maxVal = Math.ceil(Math.max(...history.map((h) => h.overallAverage)) + 2)

  return (
    <div className="h-44 w-full sm:h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="taBlueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#181f2f" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#717d91', fontSize: 11 }}
            axisLine={{ stroke: '#1c2233' }}
            tickLine={false}
            dy={4}
          />
          <YAxis
            domain={[minVal, maxVal]}
            tick={{ fill: '#717d91', fontSize: 11 }}
            axisLine={{ stroke: '#1c2233' }}
            tickLine={false}
            width={34}
            unit="%"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="average"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#taBlueFill)"
            dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#ffffff', stroke: '#2563eb', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
