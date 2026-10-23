import { Router } from 'express'
import { roleLabel, verifyCredentials } from '../auth/accounts.js'
import { createSession, getSession, revokeSession } from '../auth/tokens.js'
import type { AuthedRequest } from '../middleware/auth.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body as {
    username?: string
    password?: string
  }
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' })
    return
  }
  const user = verifyCredentials(username, password)
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }
  const token = createSession(user)
  res.json({ token, user, roleLabel: roleLabel(user.role) })
})

authRouter.post('/logout', requireAuth, (req: AuthedRequest, res) => {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  if (token) revokeSession(token)
  res.json({ ok: true })
})

authRouter.get('/me', requireAuth, (req: AuthedRequest, res) => {
  const user = req.user!
  res.json({ user, roleLabel: roleLabel(user.role) })
})

authRouter.get('/session-check', (req, res) => {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  const user = getSession(token)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  res.json({ user })
})
