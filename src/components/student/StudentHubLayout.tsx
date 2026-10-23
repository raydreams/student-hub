import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useAsyncData } from '../../hooks/useAsyncData'
import { api } from '../../lib/api/client'

const nav = [
  { to: '/student', label: 'Dashboard', end: true, icon: DashboardIcon },
  { to: '/student/courses', label: 'Courses', end: false, icon: CoursesIcon },
  { to: '/student/inbox', label: 'Inbox', end: false, icon: InboxIcon, hasBadge: true },
]

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function CoursesIcon({ active }: { active: boolean }) {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function InboxIcon({ active }: { active: boolean }) {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

export function StudentHubLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const onCourseReport = location.pathname.includes('/course/')
  const { data: dashboardData } = useAsyncData(() => api.student.dashboard(), [location.pathname])

  const unreadCount = dashboardData?.unreadInbox ?? 0

  return (
    <div className="hub-bg min-h-screen text-slate-100 flex flex-col justify-between pb-20 md:pb-8">
      {/* Institutional School Board Header */}
      <header className="sticky top-0 z-30 border-b border-[#1c2233] bg-[#08090d]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* School Board Brand */}
          <Link to="/student" className="flex items-center gap-3 text-left">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
              YRDSB
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">
                  TeachAssist
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  · Student Hub
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                York Region District School Board
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-lg bg-[#0e1118] p-1 border border-[#1c2233]">
            {nav.map(({ to, label, end, icon: Icon, hasBadge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-[#151924]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon active={isActive} />
                    <span>{label}</span>
                    {hasBadge && unreadCount > 0 && (
                      <span className="rounded-full bg-blue-500/20 px-1.5 py-0.2 text-[10px] font-bold text-blue-300">
                        {unreadCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User info & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-white">
                {user?.displayName ?? 'Rehan Morani'}
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                #{user?.studentId ?? '349564708'}
              </p>
            </div>

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

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6 w-full flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="hidden md:block py-6 text-center text-xs text-slate-500 border-t border-[#141824]">
        York Region District School Board · TeachAssist Evaluation Portal · Academic Year 2026–2027
      </footer>

      {/* Mobile Bottom Navigation */}
      {!onCourseReport && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1c2233] bg-[#0c0f16]/95 backdrop-blur-md md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="flex justify-around px-2 py-2">
            {nav.map(({ to, label, end, icon: Icon, hasBadge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-w-[70px] flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-blue-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="relative">
                      <Icon active={isActive} />
                      {hasBadge && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-2 flex size-3.5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <span>{label}</span>
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
