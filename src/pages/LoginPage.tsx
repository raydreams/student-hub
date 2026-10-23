import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { UserRole } from '../auth/types'

const hints: { role: UserRole; user: string; pass: string }[] = [
  { role: 'student', user: '349564708', pass: 'gi8arr2m' },
  { role: 'teacher', user: 'rehan.morani', pass: 'rehan786' },
  { role: 'admin', user: 'rehan.admin', pass: 'admin' },
  { role: 'parent', user: 'parent349564708', pass: 'gi8arr2m' },
]

function homeForRole(role: UserRole): string {
  switch (role) {
    case 'student':
      return '/student'
    case 'teacher':
      return '/teacher'
    case 'admin':
      return '/admin'
    case 'parent':
      return '/parent'
  }
}

export function LoginPage() {
  const { user, bootstrapping, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-950 text-white">
        Loading…
      </div>
    )
  }

  if (user) {
    return <Navigate to={homeForRole(user.role)} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const ok = await login(username, password)
    setSubmitting(false)
    if (!ok) {
      setError('Invalid username or password.')
      return
    }
    const stored = sessionStorage.getItem('student-hub-auth')
    if (stored) {
      const parsed = JSON.parse(stored) as { role: UserRole }
      navigate(homeForRole(parsed.role))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-800 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white">
            TA
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Student Hub</h1>
          <p className="mt-1 text-sm text-slate-500">
            YRDSB TeachAssist — student, teacher, admin &amp; parent access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-600 focus:ring-2"
              placeholder="Student #, teacher ID, or parent349564708"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-600 focus:ring-2"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-600">
          <p className="mb-2 font-semibold text-slate-800">Demo accounts</p>
          <ul className="space-y-1">
            {hints.map((h) => (
              <li key={h.role}>
                <span className="capitalize">{h.role}</span>:{' '}
                <button
                  type="button"
                  className="text-emerald-700 hover:underline"
                  onClick={() => {
                    setUsername(h.user)
                    setPassword(h.pass)
                  }}
                >
                  {h.user}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
