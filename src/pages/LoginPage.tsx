import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { UserRole } from '../auth/types'

const hints: { role: UserRole; label: string; user: string; pass: string; desc: string }[] = [
  { role: 'student', label: 'Student', user: '349564708', pass: 'gi8arr2m', desc: 'Rehan Morani · Grade 12' },
  { role: 'teacher', label: 'Teacher', user: 'rehan.morani', pass: 'rehan786', desc: 'CS & Tech Faculty' },
  { role: 'parent', label: 'Parent', user: 'parent349564708', pass: 'gi8arr2m', desc: 'Linked to Student 349564708' },
  { role: 'admin', label: 'Admin', user: 'rehan.admin', pass: 'admin', desc: 'School Administration' },
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
  const [username, setUsername] = useState('349564708')
  const [password, setPassword] = useState('gi8arr2m')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090d] text-slate-400 text-xs">
        Loading TeachAssist portal…
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
      setError('Invalid student number or password.')
      return
    }
    const stored = sessionStorage.getItem('student-hub-auth')
    if (stored) {
      const parsed = JSON.parse(stored) as { role: UserRole }
      navigate(homeForRole(parsed.role))
    }
  }

  return (
    <div className="hub-bg min-h-screen flex items-center justify-center p-4">
      <div className="ta-card-elevated w-full max-w-md p-6 sm:p-8 text-left">
        {/* School Board Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
            YRDSB
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">TeachAssist</h1>
          <p className="mt-1 text-xs text-slate-400">
            York Region District School Board · Student &amp; Parent Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Student Number or Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-[#1c2233] bg-[#090b10] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. 349564708"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#1c2233] bg-[#090b10] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/25 bg-red-950/20 p-2.5 text-xs font-medium text-red-300" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="ta-btn-primary w-full py-2.5 text-xs font-semibold disabled:opacity-50"
          >
            {submitting ? 'Authenticating…' : 'Log in to TeachAssist'}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="mt-6 border-t border-[#1a2030] pt-4">
          <p className="mb-2 text-[11px] font-medium text-slate-400">
            Available Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            {hints.map((h) => (
              <button
                key={h.role}
                type="button"
                onClick={() => {
                  setUsername(h.user)
                  setPassword(h.pass)
                }}
                className={`rounded border p-2 text-left transition-colors ${
                  username === h.user
                    ? 'border-blue-500/50 bg-blue-950/20 text-white'
                    : 'border-[#1c2233] bg-[#090b10] text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{h.label}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-500 truncate">{h.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
