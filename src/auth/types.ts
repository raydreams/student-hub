export type UserRole = 'student' | 'teacher' | 'admin' | 'parent'

export interface AuthUser {
  role: UserRole
  displayName: string
  studentId?: string
  username: string
}
