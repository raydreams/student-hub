import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncState } from '../../components/AsyncState'
import { CourseMarkCard } from '../../components/student/CourseMarkCard'
import { InboxPreviewList } from '../../components/student/InboxPreviewList'
import { OverallTrendChart } from '../../components/student/OverallTrendChart'
import { CourseComparisonChart } from '../../components/student/CourseComparisonChart'
import { AssessmentSimulatorModal } from '../../components/student/AssessmentSimulatorModal'
import { SemiCircleGauge } from '../../components/ui/SemiCircleGauge'
import { useAsyncData } from '../../hooks/useAsyncData'
import { api } from '../../lib/api/client'
import type { InboxMessage } from '../../data/types'

export function StudentHome() {
  const { data, loading, error, reload } = useAsyncData(() => api.student.dashboard(), [])
  const [simulating, setSimulating] = useState(false)
  const [animFrom, setAnimFrom] = useState<number | null>(null)
  const [activeGraphTab, setActiveGraphTab] = useState<'trend' | 'comparison'>('trend')
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const [selectedInboxMsg, setSelectedInboxMsg] = useState<InboxMessage | null>(null)
  const [dropAlert, setDropAlert] = useState<{
    oldAvg: number
    newAvg: number
    delta: number
    title: string
  } | null>(null)

  // One-click simulated drop
  async function handleSimulateDrop() {
    if (simulating || !data?.overallAverage) return
    setSimulating(true)
    const previous = data.overallAverage
    setAnimFrom(previous)
    try {
      const res = await api.student.simulateAssessment()
      const newAverage = res.overallAverage ?? previous - 1.8
      const delta = Math.round((newAverage - previous) * 10) / 10
      setDropAlert({
        oldAvg: previous,
        newAvg: newAverage,
        delta,
        title: 'MHF4U Quiz 4 (62%) entered into gradebook',
      })
      reload()
    } finally {
      setSimulating(false)
    }
  }

  // Custom assessment added
  async function handleAddCustomAssessment(courseId: string, title: string, mark: number) {
    if (!data?.overallAverage) return
    const previous = data.overallAverage
    setAnimFrom(previous)
    const res = await api.student.addAssessment({
      courseId,
      title,
      markPercent: mark,
    })
    const newAverage = res.overallAverage ?? previous
    const delta = Math.round((newAverage - previous) * 10) / 10
    setDropAlert({
      oldAvg: previous,
      newAvg: newAverage,
      delta,
      title: `${title} (${mark}%) entered`,
    })
    reload()
  }

  // Reset to initial baseline
  async function handleResetDemo() {
    if (simulating) return
    setSimulating(true)
    try {
      if (data?.overallAverage) setAnimFrom(data.overallAverage)
      await api.student.resetDemo()
      setDropAlert(null)
      reload()
    } finally {
      setSimulating(false)
    }
  }

  const gaugeFrom = animFrom ?? data?.previousAverage ?? data?.overallAverage

  return (
    <div className="space-y-6 text-left">
      <AsyncState loading={loading} error={error}>
        {data && (
          <>
            {/* Student & School Profile Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2233] pb-3">
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Academic Performance Summary
                </h1>
                <p className="text-xs text-slate-400">
                  Unionville High School · Semester 1 · 2026–2027
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="rounded bg-[#131722] border border-[#1c2233] px-2.5 py-1">
                  Student: 349564708
                </span>
                <span className="rounded bg-[#131722] border border-[#1c2233] px-2.5 py-1">
                  Grade 12
                </span>
              </div>
            </div>

            {/* Drop Alert Notification Banner */}
            {dropAlert && (
              <div className="badge-drop rounded-lg p-3 text-xs flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <svg className="size-4 text-red-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 5v14m0 0l-5-5m5 5l5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p className="font-semibold text-white">
                      Assessment Added: {dropAlert.title}
                    </p>
                    <p className="text-red-200/90 mt-0.5">
                      Overall weighted average recalculated from{' '}
                      <strong>{dropAlert.oldAvg.toFixed(1)}%</strong> to{' '}
                      <strong>{dropAlert.newAvg.toFixed(1)}%</strong> ({dropAlert.delta}%).
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDropAlert(null)}
                  className="text-red-400/80 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Overall Average Gauge Section */}
            <section className="ta-card-elevated p-6 flex flex-col items-center justify-center text-center">
              <SemiCircleGauge
                value={data.overallAverage}
                animateFrom={gaugeFrom}
                size={290}
                label="Overall Weighted Average"
                subtext="Current average across 4 semester courses"
              />

              {/* Assessment Simulation Controls */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={simulating}
                  onClick={() => void handleSimulateDrop()}
                  className="ta-btn-primary px-4 py-2 text-xs font-medium transition disabled:opacity-50"
                >
                  {simulating ? 'Recalculating…' : 'Record Assessment (Drop Mark)'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsSimulatorOpen(true)}
                  className="ta-btn-secondary px-3.5 py-2 text-xs font-medium"
                >
                  Custom Assessment…
                </button>

                <button
                  type="button"
                  onClick={() => void handleResetDemo()}
                  disabled={simulating}
                  className="ta-btn-secondary px-3 py-2 text-xs text-slate-400 hover:text-white"
                  title="Reset to default average"
                >
                  Reset
                </button>
              </div>
            </section>

            {/* Performance Analytics: Trend & Course Comparison */}
            <section className="ta-card p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2233] pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Academic Evaluation Analytics
                  </h2>
                  <p className="text-xs text-slate-400">
                    Evaluation trajectory and subject comparison
                  </p>
                </div>

                <div className="flex rounded-md bg-[#090b10] p-1 border border-[#1c2233]">
                  <button
                    type="button"
                    onClick={() => setActiveGraphTab('trend')}
                    className={`rounded px-3 py-1 text-xs font-medium transition ${
                      activeGraphTab === 'trend'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Average Over Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGraphTab('comparison')}
                    className={`rounded px-3 py-1 text-xs font-medium transition ${
                      activeGraphTab === 'comparison'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Subject Comparison
                  </button>
                </div>
              </div>

              {activeGraphTab === 'trend' ? (
                <div>
                  <OverallTrendChart history={data.gradeHistory} />
                  <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-[#181f2f]">
                    <span>{data.gradeHistory.length} total gradebook evaluations recorded</span>
                    {data.gradeHistory[data.gradeHistory.length - 1]?.event && (
                      <span className="text-slate-300">
                        Latest: {data.gradeHistory[data.gradeHistory.length - 1].event}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <CourseComparisonChart courses={data.courses} />
                </div>
              )}
            </section>

            {/* Courses List */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">Active Courses</h2>
                  <p className="text-xs text-slate-400">Click a course to view Ontario expectation breakdowns &amp; tasks</p>
                </div>
                <Link
                  to="/student/courses"
                  className="text-xs font-medium text-blue-400 hover:underline"
                >
                  All Courses →
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {data.courses
                  .filter((c) => c.currentMark != null)
                  .map((course) => (
                    <CourseMarkCard key={course.id} course={course} />
                  ))}
              </div>
            </section>

            {/* Inbox Section */}
            <section className="ta-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1c2233] pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    TeachAssist Messages &amp; Announcements
                  </h2>
                  <p className="text-xs text-slate-400">
                    Official evaluation postings and school communication
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {data.unreadInbox > 0 && (
                    <span className="rounded-full bg-blue-600/20 text-blue-300 px-2 py-0.5 text-xs font-semibold">
                      {data.unreadInbox} unread
                    </span>
                  )}
                  <Link
                    to="/student/inbox"
                    className="text-xs font-medium text-blue-400 hover:underline"
                  >
                    Open Inbox →
                  </Link>
                </div>
              </div>

              <InboxPreviewList
                messages={data.inboxPreview}
                compact
                onSelectMessage={(msg) => setSelectedInboxMsg(msg)}
              />
            </section>

            {/* Assessment Simulator Modal */}
            <AssessmentSimulatorModal
              isOpen={isSimulatorOpen}
              onClose={() => setIsSimulatorOpen(false)}
              courses={data.courses}
              currentAverage={data.overallAverage}
              onAddAssessment={handleAddCustomAssessment}
            />

            {/* Message Detail Modal */}
            {selectedInboxMsg && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                <div className="ta-card-elevated w-full max-w-lg p-6 relative border border-[#232a3d]">
                  <button
                    type="button"
                    onClick={() => setSelectedInboxMsg(null)}
                    className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    ✕
                  </button>

                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                    <span className="font-semibold text-blue-400 uppercase">
                      {selectedInboxMsg.category}
                    </span>
                    <span>•</span>
                    <span>{selectedInboxMsg.from}</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-3">
                    {selectedInboxMsg.subject}
                  </h3>

                  <div className="rounded-lg border border-[#1c2233] bg-[#090c13] p-4 text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {selectedInboxMsg.preview}
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>{new Date(selectedInboxMsg.sentAt).toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedInboxMsg(null)}
                      className="ta-btn-secondary px-3 py-1.5 text-xs font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </AsyncState>
    </div>
  )
}
