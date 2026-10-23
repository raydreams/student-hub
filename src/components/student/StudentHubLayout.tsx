import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { roleLabel } from '../../auth/roleLabel'
import { useAuth } from '../../auth/AuthContext'

const nav = [
  { to: '/student', label: 'Home', end: true, icon: HomeIcon },
  { to: '/student/courses', label: 'Courses', end: false, icon: GridIcon },
  { to: '/student/inbox', label: 'Inbox', end: false, icon: InboxIcon },
]

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  )
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function InboxIcon({ active }: { active: boolean }) {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
      <path d="M4 6h16v12H4V6Z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

export function StudentHubLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const onCourseReport = location.pathname.includes('/course/')

  return (
    <div className="hub-glow relative min-h-screen bg-hub-bg pb-24">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-hub-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 sm:max-w-2xl lg:max-w-4xl">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-sm font-bold text-white shadow-lg shadow-blue-500/30">
              SH
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-base font-semibold tracking-tight text-white">
                Student Hub
              </p>
              <p className="truncate text-xs text-hub-muted">
                {user?.displayName} · {user ? roleLabel(user.role) : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="shrink-0 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-hub-muted transition hover:border-red-400/40 hover:text-red-300"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 sm:max-w-2xl lg:max-w-4xl">
        <Outlet />
      </main>

      {!onCourseReport && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-hub-panel/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex max-w-lg justify-around px-2 py-2 sm:max-w-2xl lg:max-w-4xl">
            {nav.map(({ to, label, end, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'text-hub-blue-bright'
                      : 'text-hub-muted hover:text-slate-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon active={isActive} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
