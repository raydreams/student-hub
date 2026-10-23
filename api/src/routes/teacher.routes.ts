import { Router } from 'express'
import { loadDatabase, updateDatabase } from '../db.js'
import { appendGradeHistory } from '../lib/grades.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'

const COURSE_META: Record<string, { code: string; period: string }> = {
  tgj4m: { code: 'TGJ4M1-1', period: 'P1' },
  ics4u: { code: 'ICS4U1-1', period: 'P2' },
}

export const teacherRouter = Router()

teacherRouter.use(requireAuth)
teacherRouter.use(requireRoles('teacher'))

teacherRouter.get('/courses', (_req, res) => {
  const db = loadDatabase()
  const teachable = db.courses.filter((c) => c.id === 'tgj4m' || c.id === 'ics4u')
  res.json({ courses: teachable })
})

teacherRouter.get('/courses/:courseId/report', (req, res) => {
  const db = loadDatabase()
  const detail = db.courseDetails[req.params.courseId]
  if (!detail) {
    res.status(404).json({ error: 'Course not found' })
    return
  }
  res.json({ detail })
})

teacherRouter.get('/courses/:courseId/attendance', (req, res) => {
  const db = loadDatabase()
  const meta = COURSE_META[req.params.courseId]
  if (!meta) {
    res.status(404).json({ error: 'Course not found' })
    return
  }
  const records = db.attendance.filter((a) => a.courseCode === meta.code)
  res.json({ records, courseCode: meta.code })
})

teacherRouter.get('/roster', (_req, res) => {
  const db = loadDatabase()
  res.json({ roster: db.roster })
})

teacherRouter.patch('/tasks/:taskId', (req, res) => {
  const { courseId, mark } = req.body as { courseId?: string; mark?: string }
  if (!courseId || mark === undefined) {
    res.status(400).json({ error: 'courseId and mark required' })
    return
  }
  const taskId = req.params.taskId
  let updated = false
  updateDatabase((db) => {
    const detail = db.courseDetails[courseId]
    if (!detail) return
    const task = detail.tasks.find((t) => t.id === taskId)
    if (!task) return
    task.mark = mark
    updated = true
    appendGradeHistory(db, `${task.name} updated`)
    db.inbox.unshift({
      id: `in${Date.now()}`,
      from: 'Rehan Morani',
      subject: `${task.name} updated`,
      preview: `New mark posted: ${mark}. Open the course report for details.`,
      sentAt: new Date().toISOString(),
      read: false,
      category: 'grade',
    })
  })
  if (!updated) {
    res.status(404).json({ error: 'Task not found' })
    return
  }
  res.json({ ok: true })
})

teacherRouter.post('/courses/:courseId/attendance/mark-all-present', (req, res) => {
  const meta = COURSE_META[req.params.courseId]
  if (!meta) {
    res.status(404).json({ error: 'Course not found' })
    return
  }
  const { date } = req.body as { date?: string }
  if (!date) {
    res.status(400).json({ error: 'date required (YYYY-MM-DD)' })
    return
  }
  const db = updateDatabase((db) => {
    for (const student of db.roster) {
      const exists = db.attendance.some(
        (a) =>
          a.studentId === student.id &&
          a.date === date &&
          a.courseCode === meta.code,
      )
      if (!exists) {
        db.attendance.push({
          id: `att${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
          studentId: student.id,
          studentName: student.name,
          courseCode: meta.code,
          date,
          status: 'present',
          period: meta.period,
        })
      }
    }
  })
  const records = db.attendance.filter((a) => a.courseCode === meta.code)
  res.json({ records })
})
