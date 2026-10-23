import { Link } from 'react-router-dom'
import type { CourseReport } from '../../data/types'

export function CourseMarkCard({ course }: { course: CourseReport }) {
  const mark = course.currentMark
  const isAvailable = mark != null

  return (
    <Link
      to={isAvailable ? `/student/course/${course.id}` : '#'}
      className={`ta-card block p-4 sm:p-5 transition-all text-left ${
        !isAvailable ? 'opacity-60 cursor-default' : 'hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-blue-400">
              {course.code}
            </span>
            <span className="text-[11px] text-slate-500">
              {course.block} · Rm {course.room}
            </span>
          </div>

          <h3 className="mt-1 text-sm sm:text-base font-semibold text-white truncate">
            {course.name}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {isAvailable ? '70% Term Work · 30% Final Evaluation' : 'Semester 2 course'}
          </p>

          {course.statusNote && (
            <p className="mt-1.5 text-xs text-amber-400/90 italic">
              {course.statusNote}
            </p>
          )}
        </div>

        {/* Current Mark display */}
        <div className="text-right shrink-0">
          {isAvailable ? (
            <div>
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                {mark.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-slate-400">%</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Current Mark</p>
            </div>
          ) : (
            <span className="text-sm font-medium text-slate-500">—</span>
          )}
        </div>
      </div>

      {isAvailable && (
        <div className="mt-3.5 flex items-center justify-between border-t border-[#1a2030] pt-2.5 text-xs text-slate-400">
          <span>View strand expectations &amp; tasks</span>
          <span className="text-blue-400 font-medium hover:underline">
            Details →
          </span>
        </div>
      )}
    </Link>
  )
}
