import type { UserRole } from './types'

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
