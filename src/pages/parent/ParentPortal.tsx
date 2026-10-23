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
    <AppShell title={`Parent portal — linked student ${user?.studentId ?? '…'}`}>
      <AsyncState loading={loading} error={error}>
        {data && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left">
            <p className="text-sm text-slate-600">
              View-only access to your child&apos;s course marks and reports. Contact the school
              office to link additional students.
            </p>
            <ul className="mt-4 divide-y divide-slate-100">
              {data.courses
                .filter((c) => c.currentMark != null)
                .map((course) => (
                  <li
                    key={course.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {course.code} — {course.name}
                      </p>
                      <p className="text-xs text-slate-500">{course.dateRange}</p>
                    </div>
                    <Link
                      to={`/student/course/${course.id}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {course.currentMark!.toFixed(1)}% report
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
