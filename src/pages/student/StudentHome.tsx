import { Link } from 'react-router-dom'
import { AsyncState } from '../../components/AsyncState'
import { CourseMarkCard } from '../../components/student/CourseMarkCard'
import { InboxPreviewList } from '../../components/student/InboxPreviewList'
import { OverallTrendChart } from '../../components/student/OverallTrendChart'
import { SemiCircleGauge } from '../../components/ui/SemiCircleGauge'
import { useAsyncData } from '../../hooks/useAsyncData'
import { api } from '../../lib/api/client'
import { useState } from 'react'

export function StudentHome() {
  const { data, loading, error, reload } = useAsyncData(() => api.student.dashboard(), [])
  const [simulating, setSimulating] = useState(false)
  const [animFrom, setAnimFrom] = useState<number | null>(null)

  async function simulateNewAssessment() {
    if (simulating || !data?.overallAverage) return
    setSimulating(true)
    setAnimFrom(data.overallAverage)
    try {
      await api.student.simulateAssessment()
      reload()
    } finally {
      setSimulating(false)
    }
  }

  const gaugeFrom = animFrom ?? data?.previousAverage ?? data?.overallAverage

  return (
    <div className="space-y-5">
      <AsyncState loading={loading} error={error}>
        {data && (
          <>
            <section className="hub-card-elevated relative overflow-hidden p-5 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-blue-600/20 blur-3xl" />
              <div className="relative flex flex-col items-center">
                <SemiCircleGauge
                  value={data.overallAverage}
                  animateFrom={gaugeFrom}
                  label="Overall average · active courses"
                />
                <p className="mt-4 max-w-sm text-center text-xs text-hub-muted">
                  Updates when teachers post marks or new assessments are weighted into your
                  average.
                </p>
                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => void simulateNewAssessment()}
                  className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:opacity-50"
                >
                  {simulating ? 'Updating…' : 'Demo: new assessment added'}
                </button>
              </div>
            </section>

            <section className="hub-card p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Average over time</h2>
                <span className="text-xs text-hub-muted">Last {data.gradeHistory.length} updates</span>
              </div>
              <OverallTrendChart history={data.gradeHistory} />
              {data.gradeHistory[data.gradeHistory.length - 1]?.event && (
                <p className="mt-2 text-xs text-hub-muted">
                  Latest: {data.gradeHistory[data.gradeHistory.length - 1].event}
                </p>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Courses</h2>
                <Link to="/student/courses" className="text-xs font-medium text-hub-blue-bright">
                  See all
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {data.courses
                  .filter((c) => c.currentMark != null)
                  .slice(0, 4)
                  .map((course) => (
                    <CourseMarkCard key={course.id} course={course} />
                  ))}
              </div>
            </section>

            <section className="hub-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Inbox</h2>
                {data.unreadInbox > 0 && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    {data.unreadInbox} new
                  </span>
                )}
              </div>
              <InboxPreviewList messages={data.inboxPreview} compact />
              <Link
                to="/student/inbox"
                className="mt-3 block text-center text-xs font-medium text-hub-blue-bright"
              >
                Open inbox
              </Link>
            </section>
          </>
        )}
      </AsyncState>
    </div>
  )
}
