import { Link } from 'react-router-dom'
import type { CourseReport } from '../../data/types'

interface CourseComparisonChartProps {
  courses: CourseReport[]
}

export function CourseComparisonChart({ courses }: CourseComparisonChartProps) {
  const activeCourses = courses.filter((c) => c.currentMark != null)

  return (
    <div className="space-y-3">
      {activeCourses.map((course) => {
        const mark = course.currentMark ?? 0

        return (
          <Link
            key={course.id}
            to={`/student/course/${course.id}`}
            className="group block rounded-lg border border-[#1c2233] bg-[#0c0f16] p-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-blue-400">
                  {course.code}
                </span>
                <span className="text-slate-300 font-medium truncate max-w-[180px] sm:max-w-md">
                  {course.name}
                </span>
              </div>
              <span className="font-bold text-white tabular-nums">
                {mark.toFixed(1)}%
              </span>
            </div>

            {/* Clean Progress Bar Container */}
            <div className="relative h-2 w-full rounded-full bg-[#161c28] overflow-hidden">
              {/* Provincial Standard Marker at 70% */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-500/40 z-10"
                style={{ left: '70%' }}
                title="Ontario Provincial Standard (70%)"
              />

              {/* Course Mark Bar */}
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(5, mark))}%` }}
              />
            </div>
          </Link>
        )
      })}

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
        <span>0%</span>
        <span>70% (Provincial Standard)</span>
        <span>100%</span>
      </div>
    </div>
  )
}
