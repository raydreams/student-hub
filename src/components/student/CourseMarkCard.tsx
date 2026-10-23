import { Link } from 'react-router-dom'
import type { CourseReport } from '../../data/types'

export function CourseMarkCard({ course }: { course: CourseReport }) {
  const mark = course.currentMark
  const pct = mark ?? 0

  return (
    <Link
      to={mark != null ? `/student/course/${course.id}` : '#'}
      className={`hub-card block p-4 transition active:scale-[0.98] ${
        mark == null ? 'pointer-events-none opacity-60' : 'hover:border-blue-500/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-wide text-hub-blue-bright">
            {course.code}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm font-medium text-white">{course.name}</p>
          <p className="mt-1 text-xs text-hub-muted">
            {course.block} · rm. {course.room}
          </p>
        </div>
        <div
          className="relative flex size-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-hub-panel-elevated"
          style={{
            background: mark
              ? `conic-gradient(#3b82f6 ${pct * 3.6}deg, #1e293b 0deg)`
              : undefined,
          }}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-hub-panel text-xs font-bold text-white">
            {mark != null ? `${mark.toFixed(0)}` : '—'}
          </div>
        </div>
      </div>
    </Link>
  )
}
