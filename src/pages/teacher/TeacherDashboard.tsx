import { useState } from 'react'
import { AppShell } from '../../components/AppShell'
import { AsyncState } from '../../components/AsyncState'
import { useAsyncData } from '../../hooks/useAsyncData'
import { api } from '../../lib/api/client'

type Tab = 'marks' | 'attendance'

export function TeacherDashboard() {
  const [tab, setTab] = useState<Tab>('marks')
  const [selectedCourse, setSelectedCourse] = useState('tgj4m')
  const [markDrafts, setMarkDrafts] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const reportQuery = useAsyncData(
    () => api.teacher.courseReport(selectedCourse),
    [selectedCourse],
  )
  const attendanceQuery = useAsyncData(
    () => api.teacher.attendance(selectedCourse),
    [selectedCourse],
  )

  async function saveMark(taskId: string) {
    const value = markDrafts[taskId]
    if (!value) return
    setSavingId(taskId)
    try {
      await api.teacher.updateTaskMark(taskId, selectedCourse, value)
      reportQuery.reload()
    } finally {
      setSavingId(null)
    }
  }

  async function markAllPresent(date: string) {
    await api.teacher.markAllPresent(selectedCourse, date)
    attendanceQuery.reload()
  }

  const detail = reportQuery.data?.detail
  const records = attendanceQuery.data?.records ?? []

  return (
    <AppShell title="Teacher Gradebook &amp; Attendance">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-md bg-[#0e1118] p-1 border border-[#1c2233]">
          {(
            [
              ['marks', 'Grade Entry'],
              ['attendance', 'Attendance Roster'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                tab === id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="ml-auto rounded-lg border border-[#1c2233] bg-[#0e1118] px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="tgj4m">TGJ4M1-1 — Communications Technology (Period 1)</option>
          <option value="ics4u">ICS4U1-1 — Computer Science (Period 2)</option>
        </select>
      </div>

      {tab === 'marks' && (
        <AsyncState loading={reportQuery.loading} error={reportQuery.error}>
          {detail && (
            <div className="ta-card-elevated p-5 text-left">
              <h2 className="text-base font-bold text-white tracking-tight">Assessment Tasks</h2>
              <p className="mt-0.5 text-xs text-slate-400 mb-4">
                Update marks below. Student dashboard averages reflect new evaluations immediately.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#1c2233] text-xs uppercase text-slate-400">
                      <th className="py-2.5 pr-3">Evaluation Task</th>
                      <th className="py-2.5 pr-3">OE</th>
                      <th className="py-2.5 pr-3">Current Mark</th>
                      <th className="py-2.5 pr-3">New Mark</th>
                      <th className="py-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181d2a]">
                    {detail.tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="py-2.5 pr-3 font-medium text-white">{task.name}</td>
                        <td className="py-2.5 pr-3 font-mono text-blue-400 text-xs">{task.expectation}</td>
                        <td className="py-2.5 pr-3 tabular-nums font-semibold text-white">{task.mark || '—'}</td>
                        <td className="py-2.5 pr-3">
                          <input
                            type="text"
                            placeholder="e.g. 18/20"
                            value={markDrafts[task.id] ?? ''}
                            onChange={(e) =>
                              setMarkDrafts((d) => ({ ...d, [task.id]: e.target.value }))
                            }
                            className="w-28 rounded border border-[#1c2233] bg-[#090b10] px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5">
                          <button
                            type="button"
                            disabled={savingId === task.id}
                            onClick={() => void saveMark(task.id)}
                            className="ta-btn-primary px-3 py-1 text-xs font-medium disabled:opacity-50"
                          >
                            {savingId === task.id ? 'Saving…' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </AsyncState>
      )}

      {tab === 'attendance' && (
        <div className="space-y-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3 ta-card p-4">
            <span className="text-xs text-slate-400">Class Attendance Action</span>
            <button
              type="button"
              onClick={() => void markAllPresent('2026-10-23')}
              className="ta-btn-primary px-3 py-1.5 text-xs font-medium"
            >
              Mark all students present today
            </button>
          </div>
          <AsyncState loading={attendanceQuery.loading} error={attendanceQuery.error}>
            <div className="ta-card-elevated p-5">
              <h2 className="mb-3 text-base font-bold text-white tracking-tight">Recent Period Attendance</h2>
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#1c2233] text-xs uppercase text-slate-400">
                    <th className="py-2">Date</th>
                    <th className="py-2">Student</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181d2a]">
                  {records.map((row) => (
                    <tr key={row.id}>
                      <td className="py-2.5 font-mono text-slate-400">{row.date}</td>
                      <td className="py-2.5 font-medium text-white">{row.studentName}</td>
                      <td className="py-2.5 capitalize text-emerald-400">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AsyncState>
        </div>
      )}
    </AppShell>
  )
}
