import { useState } from 'react'
import { AppShell } from '../../components/AppShell'
import { AsyncState } from '../../components/AsyncState'
import { useAsyncData } from '../../hooks/useAsyncData'
import type { AttendanceRecord } from '../../data/types'
import { api } from '../../lib/api/client'

type Tab = 'classes' | 'attendance' | 'supply'

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('classes')
  const classesQuery = useAsyncData(() => api.admin.classes(), [])
  const attendanceQuery = useAsyncData(() => api.admin.attendance(), [])
  const supplyQuery = useAsyncData(() => api.admin.supply(), [])
  const [supplyForm, setSupplyForm] = useState({
    date: '2026-10-25',
    teacherAbsent: '',
    supplyTeacher: 'Rehan Morani',
    courseCode: '',
    block: '',
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSupplySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supplyForm.courseCode || !supplyForm.teacherAbsent) return
    setSubmitting(true)
    try {
      await api.admin.createSupply(supplyForm)
      setSupplyForm({
        date: '2026-10-25',
        teacherAbsent: '',
        supplyTeacher: 'Rehan Morani',
        courseCode: '',
        block: '',
      })
      supplyQuery.reload()
    } finally {
      setSubmitting(false)
    }
  }

  async function patchAttendance(id: string, status: AttendanceRecord['status']) {
    await api.admin.updateAttendance(id, status)
    attendanceQuery.reload()
  }

  return (
    <AppShell title="School Admin — Unionville HS">
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ['classes', 'All classes'],
            ['attendance', 'All attendance'],
            ['supply', 'On-call / supply'],
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
      </div>

      {tab === 'classes' && (
        <AsyncState loading={classesQuery.loading} error={classesQuery.error}>
          {classesQuery.data && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Course</th>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Block</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Enrollment</th>
                  </tr>
                </thead>
                <tbody>
                  {classesQuery.data.classes.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium">
                        {c.code}
                        <span className="block text-xs font-normal text-slate-500">{c.name}</span>
                      </td>
                      <td className="px-4 py-3">{c.teacher}</td>
                      <td className="px-4 py-3">{c.block}</td>
                      <td className="px-4 py-3">{c.room}</td>
                      <td className="px-4 py-3">{c.enrollment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AsyncState>
      )}

      {tab === 'attendance' && (
        <AsyncState loading={attendanceQuery.loading} error={attendanceQuery.error}>
          {attendanceQuery.data && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-left text-sm font-semibold">Attendance correction</h2>
              <p className="mb-4 text-left text-xs text-slate-500">
                Adjust records school-wide. Changes are saved to the API database.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-slate-500">
                      <th className="py-2 pr-2">Date</th>
                      <th className="py-2 pr-2">Course</th>
                      <th className="py-2 pr-2">Student</th>
                      <th className="py-2 pr-2">Period</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceQuery.data.attendance.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="py-2 pr-2">{row.date}</td>
                        <td className="py-2 pr-2">{row.courseCode}</td>
                        <td className="py-2 pr-2">{row.studentName}</td>
                        <td className="py-2 pr-2">{row.period}</td>
                        <td className="py-2">
                          <select
                            value={row.status}
                            onChange={(e) =>
                              void patchAttendance(row.id, e.target.value as typeof row.status)
                            }
                            className="rounded border border-slate-300 px-2 py-1 text-sm capitalize"
                          >
                            <option value="present">present</option>
                            <option value="absent">absent</option>
                            <option value="late">late</option>
                            <option value="excused">excused</option>
                          </select>
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

      {tab === 'supply' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <form
            onSubmit={(e) => void handleSupplySubmit(e)}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-left"
          >
            <h2 className="mb-3 text-sm font-semibold">Assign supply teacher</h2>
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="text-slate-600">Date</span>
                <input
                  type="date"
                  value={supplyForm.date}
                  onChange={(e) => setSupplyForm((f) => ({ ...f, date: e.target.value }))}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Teacher absent</span>
                <input
                  value={supplyForm.teacherAbsent}
                  onChange={(e) =>
                    setSupplyForm((f) => ({ ...f, teacherAbsent: e.target.value }))
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                  placeholder="J. Smith"
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Supply teacher</span>
                <input
                  value={supplyForm.supplyTeacher}
                  onChange={(e) =>
                    setSupplyForm((f) => ({ ...f, supplyTeacher: e.target.value }))
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Course code</span>
                <input
                  value={supplyForm.courseCode}
                  onChange={(e) =>
                    setSupplyForm((f) => ({ ...f, courseCode: e.target.value }))
                  }
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                  placeholder="MHF4U1-8"
                />
              </label>
              <label className="block">
                <span className="text-slate-600">Block</span>
                <input
                  value={supplyForm.block}
                  onChange={(e) => setSupplyForm((f) => ({ ...f, block: e.target.value }))}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
                  placeholder="P4"
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {submitting ? 'Saving…' : 'Save assignment'}
              </button>
            </div>
          </form>
          <AsyncState loading={supplyQuery.loading} error={supplyQuery.error}>
            {supplyQuery.data && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-left">
                <h2 className="mb-3 text-sm font-semibold">Scheduled coverage</h2>
                <ul className="space-y-3 text-sm">
                  {supplyQuery.data.supply.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <p className="font-medium">{s.date}</p>
                      <p className="text-slate-600">
                        {s.supplyTeacher} covers {s.courseCode} ({s.block}) for{' '}
                        {s.teacherAbsent}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AsyncState>
        </div>
      )}
    </AppShell>
  )
}
