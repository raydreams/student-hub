import { Router } from 'express'
import { loadDatabase, updateDatabase } from '../db.js'
import { appendGradeHistory, computeOverallAverage } from '../lib/grades.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { linkedStudentId, requireAuth, requireRoles } from '../middleware/auth.js'

export const studentRouter = Router()

studentRouter.use(requireAuth)
studentRouter.use(requireRoles('student', 'parent'))

studentRouter.get('/profile', (req: AuthedRequest, res) => {
  const studentId = linkedStudentId(req.user!)
  res.json({ studentId, displayName: req.user!.displayName })
})

studentRouter.get('/dashboard', (req: AuthedRequest, res) => {
  const db = loadDatabase()
  const studentId = linkedStudentId(req.user!)
  if (studentId !== db.studentId) {
    res.status(404).json({ error: 'Student not found' })
    return
  }
  const overallAverage = computeOverallAverage(db.courses)
  const history = db.gradeHistory
  const previousAverage =
    history.length >= 2 ? history[history.length - 2].overallAverage : overallAverage
  const unreadInbox = db.inbox.filter((m) => !m.read).length
  res.json({
    studentId,
    overallAverage,
    previousAverage,
    gradeHistory: history,
    courses: db.courses,
    inboxPreview: db.inbox.slice(0, 4),
    unreadInbox,
  })
})

studentRouter.get('/inbox', (req: AuthedRequest, res) => {
  const db = loadDatabase()
  const studentId = linkedStudentId(req.user!)
  if (studentId !== db.studentId) {
    res.status(404).json({ error: 'Student not found' })
    return
  }
  res.json({ messages: db.inbox })
})

studentRouter.patch('/inbox/:id/read', (req, res) => {
  const id = req.params.id
  let found = false
  updateDatabase((db) => {
    const msg = db.inbox.find((m) => m.id === id)
    if (msg) {
      msg.read = true
      found = true
    }
  })
  if (!found) {
    res.status(404).json({ error: 'Message not found' })
    return
  }
  res.json({ ok: true })
})

studentRouter.post('/inbox/read-all', (_req, res) => {
  updateDatabase((db) => {
    db.inbox.forEach((m) => {
      m.read = true
    })
  })
  res.json({ ok: true })
})

studentRouter.get('/courses', (req: AuthedRequest, res) => {
  const db = loadDatabase()
  const studentId = linkedStudentId(req.user!)
  if (studentId !== db.studentId) {
    res.status(404).json({ error: 'Student not found' })
    return
  }
  res.json({ studentId, courses: db.courses })
})

studentRouter.get('/courses/:courseId/report', (req, res) => {
  const db = loadDatabase()
  const courseId = req.params.courseId
  const course = db.courses.find((c) => c.id === courseId)
  const detail = db.courseDetails[courseId]
  if (!course || !detail) {
    res.status(404).json({ error: 'Report not available' })
    return
  }
  res.json({ course, detail })
})

/** Demo: simulates a new low-weight assessment affecting overall average */
studentRouter.post('/simulate-assessment', (req: AuthedRequest, res) => {
  const studentId = linkedStudentId(req.user!)
  if (req.user!.role !== 'student') {
    res.status(403).json({ error: 'Students only' })
    return
  }
  const db = updateDatabase((db) => {
    if (studentId !== db.studentId) return
    const course = db.courses.find((c) => c.id === 'mhf4u')
    if (course && course.currentMark != null) {
      course.currentMark = Math.max(55, course.currentMark - 4.2)
    }
    appendGradeHistory(db, 'New MHF4U quiz added to average')
    db.inbox.unshift({
      id: `in${Date.now()}`,
      from: 'J. Smith',
      subject: 'MHF4U quiz posted',
      preview: 'Quiz 4 marks are in. Your course average was recalculated.',
      sentAt: new Date().toISOString(),
      read: false,
      category: 'grade',
    })
  })
  const overallAverage = computeOverallAverage(db.courses)
  const history = db.gradeHistory
  res.json({
    ok: true,
    overallAverage,
    previousAverage: history.length >= 2 ? history[history.length - 2].overallAverage : overallAverage,
    gradeHistory: history,
  })
})
