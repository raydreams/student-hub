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
    <div className="hub-bg min-h-screen text-slate-100 flex flex-col justify-between">
      <header className="sticky top-0 z-30 border-b border-[#1c2233] bg-[#08090d]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              YRDSB
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-bold text-white">TeachAssist · Student Hub</p>
              <p className="truncate text-xs text-slate-400">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {user && (
              <span className="hidden rounded bg-[#131722] border border-[#1c2233] px-2.5 py-1 text-xs text-slate-300 sm:inline">
                {user.displayName} · {roleLabel(user.role)}
              </span>
            )}
            <button
              type="button"
              onClick={() => void logout()}
              className="ta-btn-secondary px-3 py-1.5 text-xs font-medium"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 w-full flex-1">
        {backTo && (
          <Link
            to={backTo.path}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:underline"
          >
            ← {backTo.label}
          </Link>
        )}
        {children}
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-[#141824]">
        York Region District School Board · TeachAssist Evaluation Portal · Academic Year 2026–2027
      </footer>
    </div>
  )
}
