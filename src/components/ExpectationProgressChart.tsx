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
  conversation: '#2563eb',
  observation: '#16a34a',
  product: '#ea580c',
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
  dark = false,
}: ExpectationProgressChartProps) {
  const data = points.map((p) => ({
    ...p,
    x: p.time,
    y: p.value,
  }))

  return (
    <div className="h-36 w-full min-w-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <ReferenceArea y1={yMin} y2={60} fill="#fecaca" fillOpacity={0.45} />
          <ReferenceArea y1={60} y2={70} fill="#fef08a" fillOpacity={0.5} />
          <ReferenceArea y1={70} y2={yMax} fill="#f0fdf4" fillOpacity={0.6} />
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
          <XAxis
            type="number"
            dataKey="x"
            name="Time"
            domain={[0, 'dataMax + 1']}
            tick={{ fontSize: 10, fill: '#64748b' }}
            label={{
              value: 'time',
              position: 'insideBottom',
              offset: -2,
              fontSize: 10,
              fill: '#64748b',
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[yMin, yMax]}
            ticks={[50, 60, 70, 80, 90]}
            tick={{ fontSize: 10, fill: '#64748b' }}
            width={28}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
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
                  rx={1}
                />
              )
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
