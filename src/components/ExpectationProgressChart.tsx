import {
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProgressPoint } from '../data/types'

const copColors: Record<ProgressPoint['type'], string> = {
  conversation: '#38bdf8',
  observation: '#34d399',
  product: '#fb923c',
}

interface ExpectationProgressChartProps {
  points: ProgressPoint[]
  yMin?: number
  yMax?: number
  dark?: boolean
}

export function ExpectationProgressChart({
  points,
  yMin = 50,
  yMax = 95,
  dark = true,
}: ExpectationProgressChartProps) {
  const data = points.map((p) => ({
    ...p,
    x: p.time,
    y: p.value,
  }))

  const gridColor = dark ? '#172642' : '#cbd5e1'
  const textColor = dark ? '#8b9cb8' : '#64748b'

  return (
    <div className="h-36 w-full min-w-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          {/* Shaded bands for Level 2 (50-60), Level 3 (60-70), Level 4 (70-100) */}
          <ReferenceArea
            y1={yMin}
            y2={60}
            fill={dark ? '#ef4444' : '#fecaca'}
            fillOpacity={dark ? 0.08 : 0.45}
          />
          <ReferenceArea
            y1={60}
            y2={70}
            fill={dark ? '#eab308' : '#fef08a'}
            fillOpacity={dark ? 0.08 : 0.5}
          />
          <ReferenceArea
            y1={70}
            y2={yMax}
            fill={dark ? '#3b82f6' : '#f0fdf4'}
            fillOpacity={dark ? 0.09 : 0.6}
          />
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.5} />
          <XAxis
            type="number"
            dataKey="x"
            name="Time"
            domain={[0, 'dataMax + 1']}
            tick={{ fontSize: 10, fill: textColor }}
            label={{
              value: 'timeline',
              position: 'insideBottom',
              offset: -2,
              fontSize: 10,
              fill: textColor,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[yMin, yMax]}
            ticks={[50, 60, 70, 80, 90]}
            tick={{ fontSize: 10, fill: textColor }}
            width={28}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: '#0c1427',
              borderColor: 'rgba(59, 130, 246, 0.3)',
              borderRadius: '0.75rem',
              color: '#f8fafc',
              fontSize: '12px',
            }}
            formatter={(value, _name, item) => {
              const v = typeof value === 'number' ? value : Number(value)
              const payload = item?.payload as ProgressPoint | undefined
              return [`${v}%`, payload?.label ?? payload?.type ?? 'Mark']
            }}
          />
          <Scatter
            data={data}
            shape={(props: { cx?: number; cy?: number; payload?: ProgressPoint }) => {
              const { cx = 0, cy = 0, payload } = props
              const fill = payload ? copColors[payload.type] : '#64748b'
              return (
                <rect
                  x={cx - 5}
                  y={cy - 5}
                  width={10}
                  height={10}
                  fill={fill}
                  rx={2}
                  stroke="#ffffff"
                  strokeWidth={0.5}
                />
              )
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
