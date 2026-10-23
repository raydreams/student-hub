import type { NextFunction, Request, Response } from 'express'
import { getSession } from '../auth/tokens.js'
import type { AuthUser, UserRole } from '../types.js'

export interface AuthedRequest extends Request {
  user?: AuthUser
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  const user = getSession(token)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  req.user = user
  next()
}

export function requireRoles(...roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    next()
  }
}

export function linkedStudentId(user: AuthUser): string {
  return user.studentId ?? '349564708'
}
