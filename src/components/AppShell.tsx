import { Link } from 'react-router-dom'
import { roleLabel } from '../auth/roleLabel'
import { useAuth } from '../auth/AuthContext'

export function AppShell({
  title,
  children,
  backTo,
}: {
  title: string
  children: React.ReactNode
  backTo?: { label: string; path: string }
}) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900/90 via-emerald-800/40 to-slate-100">
      <header className="border-b border-white/10 bg-emerald-950/80 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">
              TA
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold">TeachAssist · YRDSB</p>
              <p className="truncate text-xs text-emerald-100/80">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {user && (
              <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs sm:inline">
                {user.displayName} · {roleLabel(user.role)}
              </span>
            )}
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {backTo && (
          <Link
            to={backTo.path}
            className="mb-4 inline-flex text-sm font-medium text-emerald-900 hover:underline"
          >
            ← {backTo.label}
          </Link>
        )}
        {children}
      </main>

      <footer className="py-8 text-center text-xs text-slate-500">
        copyright © 2026{' '}
        <span className="font-medium text-emerald-700">teachassist foundation</span>
      </footer>
    </div>
  )
}
