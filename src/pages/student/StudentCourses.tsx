import { AsyncState } from '../../components/AsyncState'
import { CourseMarkCard } from '../../components/student/CourseMarkCard'
import { useAsyncData } from '../../hooks/useAsyncData'
import { api } from '../../lib/api/client'

export function StudentCourses() {
  const { data, loading, error } = useAsyncData(() => api.student.courses(), [])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Your courses</h1>
        <p className="text-sm text-hub-muted">Tap a course to open the full expectation report.</p>
      </div>
      <AsyncState loading={loading} error={error}>
        {data && (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.courses.map((course) => (
              <CourseMarkCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </AsyncState>
    </div>
  )
}
