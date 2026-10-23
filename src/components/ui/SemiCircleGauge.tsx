import { useEffect, useMemo, useState } from 'react'

interface SemiCircleGaugeProps {
  value: number | null
  animateFrom?: number | null
  size?: number
  label?: string
}

export function SemiCircleGauge({
  value,
  animateFrom,
  size = 240,
  label = 'Overall average',
}: SemiCircleGaugeProps) {
  const target = value ?? 0
  const start = animateFrom ?? target
  const [display, setDisplay] = useState(start)

  useEffect(() => {
    if (target === start) {
      setDisplay(target)
      return
    }
    const duration = 1100
    const t0 = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const eased = 1 - (1 - t) ** 3
      setDisplay(start + (target - start) * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, start])

  const { path, circumference, offset } = useMemo(() => {
    const r = 86
    const cx = 100
    const cy = 100
    const startX = cx - r
    const endX = cx + r
    const d = `M ${startX} ${cy} A ${r} ${r} 0 0 1 ${endX} ${cy}`
    const circ = Math.PI * r
    const pct = Math.max(0, Math.min(100, display)) / 100
    return { path: d, circumference: circ, offset: circ * (1 - pct) }
  }, [display])

  const delta =
    value != null && animateFrom != null ? value - animateFrom : null

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div className="relative w-full max-w-[280px]">
        <svg viewBox="0 0 200 120" className="w-full overflow-visible">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d={path}
            fill="none"
            stroke="#1e293b"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <path
            d={path}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#gaugeGlow)"
            className="transition-[stroke-dashoffset] duration-300"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-1">
          <span className="text-4xl font-bold tabular-nums tracking-tight text-white sm:text-5xl">
            {value != null ? display.toFixed(1) : '—'}
            {value != null && (
              <span className="text-lg font-semibold text-hub-muted">%</span>
            )}
          </span>
          {delta != null && Math.abs(delta) >= 0.05 && (
            <span
              className={`mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                delta < 0
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}
            >
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1)}% since last update
            </span>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-sm font-medium text-hub-muted">{label}</p>
    </div>
  )
}
