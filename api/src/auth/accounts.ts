import type { AuthUser, UserRole } from '../types.js'

interface Account {
  username: string
  password: string
  user: Omit<AuthUser, 'username'>
}

const accounts: Account[] = [
  {
    username: '349564708',
    password: 'gi8arr2m',
    user: {
      role: 'student',
      displayName: 'Student 349564708',
      studentId: '349564708',
    },
  },
  {
    username: 'rehan.morani',
    password: 'rehan786',
    user: { role: 'teacher', displayName: 'Rehan Morani' },
  },
  {
    username: 'rehan.admin',
    password: 'admin',
    user: { role: 'admin', displayName: 'Rehan Admin' },
  },
  {
    username: 'parent349564708',
    password: 'gi8arr2m',
    user: {
      role: 'parent',
      displayName: 'Parent Portal',
      studentId: '349564708',
    },
  },
]

export function verifyCredentials(
  username: string,
  password: string,
): AuthUser | null {
  const trimmed = username.trim()
  const match = accounts.find(
    (a) => a.username === trimmed && a.password === password,
  )
  if (!match) return null
  return { ...match.user, username: match.username }
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'student':
      return 'Student'
    case 'teacher':
      return 'Teacher'
    case 'admin':
      return 'School Admin'
    case 'parent':
      return 'Parent'
  }
}
