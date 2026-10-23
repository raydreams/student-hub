import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { AppShell } from '../../components/AppShell'
import { AsyncState } from '../../components/AsyncState'
import { useAsyncData } from '../../hooks/useAsyncData'
import { api } from '../../lib/api/client'

export function ParentPortal() {
  const { user } = useAuth()
  const { data, loading, error } = useAsyncData(() => api.student.courses(), [])

  return (
    <AppShell title={`Parent Portal — Linked Student ${user?.studentId ?? '…'}`}>
      <AsyncState loading={loading} error={error}>
        {data && (
          <div className="ta-card-elevated p-6 text-left">
            <h2 className="text-base font-bold text-white tracking-tight">
              Academic Progress &amp; Course Standing
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Official read-only access to course evaluation reports and mark breakdowns.
            </p>

            <ul className="mt-5 divide-y divide-[#1c2233]">
              {data.courses
                .filter((c) => c.currentMark != null)
                .map((course) => (
                  <li
                    key={course.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-blue-400">
                          {course.code}
                        </span>
                        <p className="font-medium text-sm text-white">
                          {course.name}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Room {course.room} · Period {course.block} · {course.dateRange}
                      </p>
                    </div>
                    <Link
                      to={`/student/course/${course.id}`}
                      className="ta-btn-secondary px-3 py-1.5 text-xs font-medium"
                    >
                      {course.currentMark!.toFixed(1)}% Full Report →
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </AsyncState>
    </AppShell>
  )
}
