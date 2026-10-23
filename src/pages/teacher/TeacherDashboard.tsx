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
    <AppShell title="Teacher — Communications & CS">
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ['marks', 'Mark input'],
            ['attendance', 'Attendance'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === id
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="tgj4m">TGJ4M1-1 — Communications Technology</option>
          <option value="ics4u">ICS4U1-1 — Computer Science</option>
        </select>
      </div>

      {tab === 'marks' && (
        <AsyncState loading={reportQuery.loading} error={reportQuery.error}>
          {detail && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-left text-sm font-semibold">Assessment tasks</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-slate-500">
                      <th className="py-2 pr-3">Task</th>
                      <th className="py-2 pr-3">OE</th>
                      <th className="py-2 pr-3">Current</th>
                      <th className="py-2 pr-3">Enter mark</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.tasks.map((task) => (
                      <tr key={task.id} className="border-b border-slate-100">
                        <td className="py-2 pr-3">{task.name}</td>
                        <td className="py-2 pr-3">{task.expectation}</td>
                        <td className="py-2 pr-3">{task.mark || '—'}</td>
                        <td className="py-2 pr-3">
                          <input
                            type="text"
                            placeholder="e.g. 18/20"
                            value={markDrafts[task.id] ?? ''}
                            onChange={(e) =>
                              setMarkDrafts((d) => ({ ...d, [task.id]: e.target.value }))
                            }
                            className="w-28 rounded border border-slate-300 px-2 py-1 text-sm"
                          />
                        </td>
                        <td className="py-2">
                          <button
                            type="button"
                            disabled={savingId === task.id}
                            onClick={() => void saveMark(task.id)}
                            className="rounded bg-emerald-700 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                          >
                            {savingId === task.id ? 'Saving…' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-left text-xs text-slate-500">
                Marks are persisted to the API database (
                <code className="text-xs">api/data/db.json</code>).
              </p>
            </div>
          )}
        </AsyncState>
      )}

      {tab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="text-sm font-medium text-slate-700">Quick actions</span>
            <button
              type="button"
              onClick={() => void markAllPresent('2026-10-23')}
              className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white"
            >
              Mark all present — Oct 23
            </button>
          </div>
          <AsyncState loading={attendanceQuery.loading} error={attendanceQuery.error}>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-left text-sm font-semibold">Recent attendance</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-slate-500">
                    <th className="py-2">Date</th>
                    <th className="py-2">Student</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="py-2">{row.date}</td>
                      <td className="py-2">{row.studentName}</td>
                      <td className="py-2 capitalize">{row.status}</td>
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
