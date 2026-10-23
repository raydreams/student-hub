import { Link, useParams } from 'react-router-dom'
import { AsyncState } from '../../components/AsyncState'
import { CopLegend } from '../../components/CopLegend'
import { ExpectationProgressChart } from '../../components/ExpectationProgressChart'
import { useAsyncData } from '../../hooks/useAsyncData'
import { api } from '../../lib/api/client'

export function CourseReport() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data, loading, error } = useAsyncData(
    () => api.student.courseReport(courseId!),
    [courseId],
  )

  if (!courseId) {
    return <p className="text-sm text-hub-muted">Invalid course.</p>
  }

  return (
    <div className="space-y-4 pb-8">
      <Link
        to="/student/courses"
        className="inline-flex items-center gap-1 text-sm font-medium text-hub-blue-bright"
      >
        ← Courses
      </Link>

      <AsyncState loading={loading} error={error}>
        {data && (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-hub-blue-bright">
                {data.course.code}
              </p>
              <h1 className="mt-1 text-xl font-semibold text-white">{data.course.name}</h1>
              <p className="text-sm text-hub-muted">
                {data.course.block} · rm. {data.course.room}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-hub-panel-elevated p-3 text-xs sm:text-sm">
              <span className="text-white">
                Term work{' '}
                <strong className="text-hub-blue-bright">
                  {data.detail.termWorkPercent.toFixed(1)}%
                </strong>
              </span>
              <span className="text-hub-muted">·</span>
              <span className="text-hub-muted">
                Culminating {data.detail.culminatingPercent.toFixed(1)}%
              </span>
            </div>

            <div className="hub-card overflow-hidden">
              {data.detail.strandGroups.map((group) => (
                <div key={group.strand}>
                  <h2 className="border-b border-white/5 bg-white/5 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-hub-muted">
                    {group.strand}
                  </h2>
                  {group.expectations.map((oe) => (
                    <article
                      key={oe.id}
                      className="space-y-3 border-b border-white/5 px-4 py-4 last:border-0"
                    >
                      <p className="text-left text-sm text-slate-200">
                        <span className="font-semibold text-white">{oe.code}: </span>
                        {oe.description}
                      </p>
                      <div className="rounded-xl border border-white/10 bg-hub-bg/50 p-2">
                        <ExpectationProgressChart points={oe.points} dark />
                      </div>
                      <div className="flex justify-between text-sm">
                        <CopLegend compact dark />
                        <div className="text-right">
                          {oe.markPercent != null ? (
                            <span className="font-bold text-white">
                              {oe.markPercent.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-hub-muted">—</span>
                          )}
                          <span className="ml-2 text-xs text-hub-muted">w:{oe.totalWeight}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ))}
            </div>

            <section className="hub-card p-4">
              <h2 className="mb-3 text-sm font-semibold text-white">Assessment tasks</h2>
              <ul className="divide-y divide-white/5">
                {data.detail.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{task.name}</p>
                      <p className="text-xs text-hub-muted">OE {task.expectation}</p>
                    </div>
                    <p className="font-semibold tabular-nums text-hub-blue-bright">
                      {task.mark || '—'}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </AsyncState>
    </div>
  )
}
