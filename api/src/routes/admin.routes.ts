import { Router } from 'express'
import { loadDatabase, updateDatabase } from '../db.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import type { AttendanceRecord, SupplyAssignment } from '../types.js'

export const adminRouter = Router()

adminRouter.use(requireAuth)
adminRouter.use(requireRoles('admin'))

adminRouter.get('/classes', (_req, res) => {
  const db = loadDatabase()
  res.json({ classes: db.classes })
})

adminRouter.get('/attendance', (_req, res) => {
  const db = loadDatabase()
  res.json({ attendance: db.attendance })
})

adminRouter.patch('/attendance/:id', (req, res) => {
  const { status } = req.body as { status?: AttendanceRecord['status'] }
  if (!status) {
    res.status(400).json({ error: 'status required' })
    return
  }
  const id = req.params.id
  let found = false
  updateDatabase((db) => {
    const row = db.attendance.find((a) => a.id === id)
    if (row) {
      row.status = status
      found = true
    }
  })
  if (!found) {
    res.status(404).json({ error: 'Record not found' })
    return
  }
  res.json({ ok: true })
})

adminRouter.get('/supply', (_req, res) => {
  const db = loadDatabase()
  res.json({ supply: db.supply })
})

adminRouter.post('/supply', (req, res) => {
  const body = req.body as Omit<SupplyAssignment, 'id'>
  if (!body.date || !body.teacherAbsent || !body.supplyTeacher || !body.courseCode) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }
  const assignment: SupplyAssignment = {
    id: `s${Date.now()}`,
    date: body.date,
    teacherAbsent: body.teacherAbsent,
    supplyTeacher: body.supplyTeacher,
    courseCode: body.courseCode,
    block: body.block ?? '',
  }
  updateDatabase((db) => {
    db.supply.push(assignment)
  })
  res.status(201).json({ assignment })
})

adminRouter.get('/health-data', (_req: AuthedRequest, res) => {
  const db = loadDatabase()
  res.json({
    counts: {
      courses: db.courses.length,
      attendance: db.attendance.length,
      supply: db.supply.length,
    },
  })
})
