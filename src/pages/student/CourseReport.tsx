import { Link, useParams } from 'react-router-dom'
import { AsyncState } from '../../components/AsyncState'
import { CopLegend } from '../../components/CopLegend'
import { ExpectationProgressChart } from '../../components/ExpectationProgressChart'
import { useAuth } from '../../auth/AuthContext'
import { useAsyncData } from '../../hooks/useAsyncData'
import { api } from '../../lib/api/client'

export function CourseReport() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuth()
  const { data, loading, error } = useAsyncData(
    () => api.student.courseReport(courseId!),
    [courseId],
  )

  const backPath = user?.role === 'parent' ? '/parent' : '/student/courses'
  const backLabel = user?.role === 'parent' ? 'Parent Portal' : 'Courses'

  if (!courseId) {
    return <p className="text-sm text-slate-500">Invalid course identifier.</p>
  }

  return (
    <div className="space-y-5 pb-8 text-left">
      {/* Back button */}
      <div>
        <Link
          to={backPath}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:underline"
        >
          ← Return to {backLabel}
        </Link>
      </div>

      <AsyncState loading={loading} error={error}>
        {data && (
          <>
            {/* Course Header Banner */}
            <div className="ta-card-elevated p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400">
                      {data.course.code}
                    </span>
                    <span className="text-xs text-slate-400">
                      Period {data.course.block} · Room {data.course.room}
                    </span>
                  </div>
                  <h1 className="mt-1 text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {data.course.name}
                  </h1>
                  <p className="mt-1 text-xs text-slate-400">
                    Session: {data.course.dateRange} · Ontario Secondary School Curriculum
                  </p>
                </div>

                {data.course.currentMark != null && (
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium">Course Standing</span>
                    <div className="mt-0.5">
                      <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white tabular-nums">
                        {data.course.currentMark.toFixed(1)}
                      </span>
                      <span className="text-lg text-slate-400 font-medium">%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Weighting Breakdown */}
              <div className="mt-5 flex flex-wrap gap-3 border-t border-[#1c2233] pt-3 text-xs">
                <div className="rounded bg-[#0a0d14] border border-[#1c2233] px-3 py-1.5">
                  <span className="text-slate-400">Term Work (70%): </span>
                  <strong className="text-white font-semibold">{data.detail.termWorkPercent.toFixed(1)}%</strong>
                </div>
                <div className="rounded bg-[#0a0d14] border border-[#1c2233] px-3 py-1.5">
                  <span className="text-slate-400">Culminating / Exam (30%): </span>
                  <strong className="text-white font-semibold">{data.detail.culminatingPercent.toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            {/* Curriculum Strands & Overall Expectations */}
            <div className="ta-card overflow-hidden">
              <div className="border-b border-[#1c2233] bg-[#0c0f16] px-5 py-3">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Curriculum Strands &amp; Overall Expectations (OE)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Growing Success Evaluation Methods: Conversations, Observations, Products (COP)
                </p>
              </div>

              {data.detail.strandGroups.map((group) => (
                <div key={group.strand} className="border-b border-[#1c2233] last:border-0">
                  <h3 className="border-b border-[#1c2233] bg-[#090b10] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {group.strand}
                  </h3>
                  {group.expectations.map((oe) => (
                    <article
                      key={oe.id}
                      className="space-y-3 border-b border-[#181d2a] px-5 py-4 last:border-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs sm:text-sm text-slate-300">
                          <span className="font-semibold text-white">{oe.code}: </span>
                          {oe.description}
                        </p>
                        <div className="shrink-0 text-right">
                          {oe.markPercent != null ? (
                            <span className="text-sm font-bold text-white tabular-nums">
                              {oe.markPercent.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                          <span className="ml-1.5 text-[10px] text-slate-500">w:{oe.totalWeight}</span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#1c2233] bg-[#090c13] p-2">
                        <ExpectationProgressChart points={oe.points} dark />
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <CopLegend compact dark />
                        <span className="text-[11px] text-slate-500">
                          {oe.points.length} evaluation points
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ))}
            </div>

            {/* Assessment Tasks Table */}
            <section className="ta-card p-5 space-y-3">
              <div className="border-b border-[#1c2233] pb-3">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Evaluated Assessment Tasks
                </h2>
                <p className="text-xs text-slate-400">
                  All tests, quizzes, assignments, and practical lab evaluations
                </p>
              </div>

              <ul className="divide-y divide-[#181e2d]">
                {data.detail.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs sm:text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{task.name}</p>
                        <span className="font-mono text-[10px] text-slate-400">
                          OE {task.expectation}
                        </span>
                      </div>
                      {task.feedback && (
                        <p className="mt-0.5 text-xs text-slate-400 italic">
                          &ldquo;{task.feedback}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold tabular-nums text-white">
                        {task.mark || '—'}
                      </p>
                      <p className="text-[10px] text-slate-500">Weight: {task.weight}</p>
                    </div>
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
