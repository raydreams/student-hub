import cors from 'cors'
import express from 'express'
import { adminRouter } from './routes/admin.routes.js'
import { authRouter } from './routes/auth.routes.js'
import { studentRouter } from './routes/student.routes.js'
import { teacherRouter } from './routes/teacher.routes.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'student-hub-api' })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/student', studentRouter)
  app.use('/api/teacher', teacherRouter)
  app.use('/api/admin', adminRouter)

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' })
  })

  return app
}
