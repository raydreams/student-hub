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
    <AppShell title="School Administration Console">
      <div className="mb-4 flex flex-wrap gap-2 text-left">
        <div className="flex rounded-md bg-[#0e1118] p-1 border border-[#1c2233]">
          {(
            [
              ['classes', 'Master Schedule'],
              ['attendance', 'Attendance Records'],
              ['supply', 'On-Call / Supply Coverage'],
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
      </div>

      {tab === 'classes' && (
        <AsyncState loading={classesQuery.loading} error={classesQuery.error}>
          {classesQuery.data && (
            <div className="ta-card-elevated overflow-hidden text-left">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-[#1c2233] bg-[#0c0f16] text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Course Code &amp; Title</th>
                    <th className="px-4 py-3">Instructor</th>
                    <th className="px-4 py-3">Block</th>
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Enrollment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181d2a]">
                  {classesQuery.data.classes.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-blue-400">{c.code}</span>
                        <span className="block text-xs text-slate-400">{c.name}</span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">{c.teacher}</td>
                      <td className="px-4 py-3 text-slate-400">{c.block}</td>
                      <td className="px-4 py-3 text-slate-400">{c.room}</td>
                      <td className="px-4 py-3 font-mono text-white">{c.enrollment} students</td>
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
            <div className="ta-card-elevated p-5 text-left">
              <h2 className="text-base font-bold text-white tracking-tight">Attendance Correction Console</h2>
              <p className="mt-0.5 mb-4 text-xs text-slate-400">
                Official attendance records for York Region District School Board.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#1c2233] text-xs uppercase text-slate-400">
                      <th className="py-2.5 pr-2">Date</th>
                      <th className="py-2.5 pr-2">Course</th>
                      <th className="py-2.5 pr-2">Student</th>
                      <th className="py-2.5 pr-2">Period</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181d2a]">
                    {attendanceQuery.data.attendance.map((row) => (
                      <tr key={row.id}>
                        <td className="py-2.5 pr-2 font-mono text-slate-400">{row.date}</td>
                        <td className="py-2.5 pr-2 font-mono font-semibold text-blue-400">{row.courseCode}</td>
                        <td className="py-2.5 pr-2 font-medium text-white">{row.studentName}</td>
                        <td className="py-2.5 pr-2 text-slate-400">{row.period}</td>
                        <td className="py-2">
                          <select
                            value={row.status}
                            onChange={(e) =>
                              void patchAttendance(row.id, e.target.value as typeof row.status)
                            }
                            className="rounded border border-[#1c2233] bg-[#090b10] px-2 py-1 text-xs text-white capitalize focus:border-blue-500 focus:outline-none"
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
        <div className="grid gap-4 lg:grid-cols-2 text-left">
          <form
            onSubmit={(e) => void handleSupplySubmit(e)}
            className="ta-card-elevated p-5"
          >
            <h2 className="text-base font-bold text-white tracking-tight">Assign Supply Coverage</h2>
            <p className="mt-0.5 mb-4 text-xs text-slate-400">On-call coverage log</p>
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={supplyForm.date}
                  onChange={(e) => setSupplyForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full rounded border border-[#1c2233] bg-[#090b10] px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Teacher Absent</label>
                <input
                  value={supplyForm.teacherAbsent}
                  onChange={(e) =>
                    setSupplyForm((f) => ({ ...f, teacherAbsent: e.target.value }))
                  }
                  className="w-full rounded border border-[#1c2233] bg-[#090b10] px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. J. Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Supply Teacher</label>
                <input
                  value={supplyForm.supplyTeacher}
                  onChange={(e) =>
                    setSupplyForm((f) => ({ ...f, supplyTeacher: e.target.value }))
                  }
                  className="w-full rounded border border-[#1c2233] bg-[#090b10] px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Course Code</label>
                <input
                  value={supplyForm.courseCode}
                  onChange={(e) =>
                    setSupplyForm((f) => ({ ...f, courseCode: e.target.value }))
                  }
                  className="w-full rounded border border-[#1c2233] bg-[#090b10] px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  placeholder="MHF4U1-8"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Block / Period</label>
                <input
                  value={supplyForm.block}
                  onChange={(e) => setSupplyForm((f) => ({ ...f, block: e.target.value }))}
                  className="w-full rounded border border-[#1c2233] bg-[#090b10] px-2.5 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  placeholder="P4"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="ta-btn-primary w-full py-2 text-xs font-semibold disabled:opacity-50"
              >
                {submitting ? 'Saving…' : 'Save Assignment'}
              </button>
            </div>
          </form>

          <AsyncState loading={supplyQuery.loading} error={supplyQuery.error}>
            {supplyQuery.data && (
              <div className="ta-card-elevated p-5">
                <h2 className="text-base font-bold text-white tracking-tight">Scheduled Coverage</h2>
                <p className="mt-0.5 mb-4 text-xs text-slate-400">Active roster</p>
                <ul className="space-y-2.5 text-xs sm:text-sm">
                  {supplyQuery.data.supply.map((s) => (
                    <li
                      key={s.id}
                      className="rounded border border-[#1c2233] bg-[#0a0d14] p-3 text-left"
                    >
                      <p className="font-mono font-medium text-white">{s.date}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        <strong className="text-blue-400">{s.supplyTeacher}</strong> covers{' '}
                        <span className="font-semibold text-white">{s.courseCode}</span> ({s.block}) for{' '}
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
