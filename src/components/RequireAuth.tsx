import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { UserRole } from '../auth/types'

export function RequireAuth({
  roles,
  children,
}: {
  roles: UserRole[]
  children: React.ReactNode
}) {
  const { user, bootstrapping } = useAuth()

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Loading…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) {
    const fallback =
      user.role === 'student'
        ? '/student'
        : user.role === 'teacher'
          ? '/teacher'
          : user.role === 'admin'
            ? '/admin'
            : '/parent'
    return <Navigate to={fallback} replace />
  }
  return children
}
