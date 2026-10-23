import { useEffect, useMemo, useState } from 'react'

interface SemiCircleGaugeProps {
  value: number | null
  animateFrom?: number | null
  size?: number
  label?: string
  subtext?: string
}

export function SemiCircleGauge({
  value,
  animateFrom,
  size = 280,
  label = 'Overall Semester Average',
  subtext = 'Weighted across all 4 active courses',
}: SemiCircleGaugeProps) {
  const target = value ?? 0
  const start = animateFrom ?? target
  const [display, setDisplay] = useState(start)

  useEffect(() => {
    if (target === start) return

    const duration = 900
    const t0 = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      // Standard ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(start + (target - start) * eased)
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        setDisplay(target)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, start])

  const { path, circumference, offset, ticks } = useMemo(() => {
    const cx = 130
    const cy = 120
    const r = 92
    const startX = cx - r
    const endX = cx + r
    const d = `M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`
    const circ = Math.PI * r
    const pct = Math.max(0, Math.min(100, display)) / 100
    const currentOffset = circ * (1 - pct)

    // Clean institutional tick notches
    const tickValues = [0, 50, 70, 80, 90, 100]
    const tickItems = tickValues.map((val) => {
      const tPct = val / 100
      const tAngle = Math.PI * (1 - tPct)
      const innerR = r - 7
      const outerR = r + 7
      return {
        val,
        x1: cx + innerR * Math.cos(tAngle),
        y1: cy - innerR * Math.sin(tAngle),
        x2: cx + outerR * Math.cos(tAngle),
        y2: cy - outerR * Math.sin(tAngle),
      }
    })

    return {
      path: d,
      circumference: circ,
      offset: currentOffset,
      ticks: tickItems,
    }
  }, [display])

  const delta =
    value != null && animateFrom != null ? value - animateFrom : null
  const isDrop = delta != null && delta < -0.05
  const isGain = delta != null && delta > 0.05

  return (
    <div className="flex flex-col items-center" style={{ width: '100%', maxWidth: size }}>
      <div className="relative w-full select-none">
        <svg viewBox="0 0 260 145" className="w-full overflow-visible">
          {/* Background Track */}
          <path
            d={path}
            fill="none"
            stroke="#161b29"
            strokeWidth={14}
            strokeLinecap="round"
          />

          {/* Clean Tick Notches */}
          {ticks.map((t) => (
            <line
              key={`tick-${t.val}`}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="#262f45"
              strokeWidth={1.5}
            />
          ))}

          {/* Active Arc - Professional School Board Royal Blue */}
          <path
            d={path}
            fill="none"
            stroke="#2563eb"
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-300"
          />

          {/* Scale Min / Max */}
          <text x="38" y="138" fill="#556277" fontSize="10" fontWeight="500" textAnchor="middle">
            0%
          </text>
          <text x="130" y="24" fill="#556277" fontSize="10" fontWeight="500" textAnchor="middle">
            50%
          </text>
          <text x="222" y="138" fill="#556277" fontSize="10" fontWeight="500" textAnchor="middle">
            100%
          </text>
        </svg>

        {/* Center Numbers and Live Status */}
        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white tabular-nums">
              {value != null ? display.toFixed(1) : '—'}
            </span>
            {value != null && (
              <span className="text-xl font-medium text-slate-400">%</span>
            )}
          </div>
          <span className="mt-0.5 text-xs font-medium text-slate-400">
            {label}
          </span>
        </div>
      </div>

      {/* Delta indicator pill */}
      <div className="mt-3 flex flex-col items-center gap-1">
        {isDrop && (
          <div className="badge-drop inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <svg className="size-3 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14m0 0l-5-5m5 5l5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Dropped {Math.abs(delta!).toFixed(1)}% after assessment update</span>
          </div>
        )}

        {isGain && (
          <div className="badge-gain inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
            <svg className="size-3 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 19V5m0 0l-5 5m5-5l5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Increased +{delta!.toFixed(1)}% after evaluation</span>
          </div>
        )}

        {!isDrop && !isGain && subtext && (
          <p className="text-center text-xs text-slate-500 font-normal">
            {subtext}
          </p>
        )}
      </div>
    </div>
  )
}
