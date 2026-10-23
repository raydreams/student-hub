import { randomUUID } from 'node:crypto'
import type { AuthUser } from '../types.js'

const sessions = new Map<string, AuthUser>()

export function createSession(user: AuthUser): string {
  const token = randomUUID()
  sessions.set(token, user)
  return token
}

export function getSession(token: string | undefined): AuthUser | null {
  if (!token) return null
  return sessions.get(token) ?? null
}

export function revokeSession(token: string): void {
  sessions.delete(token)
}
