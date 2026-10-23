import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, getStoredToken, setStoredToken } from '../lib/api/client'
import type { AuthUser } from './types'

const STORAGE_KEY = 'student-hub-auth'

interface AuthContextValue {
  user: AuthUser | null
  bootstrapping: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser())
  const [bootstrapping, setBootstrapping] = useState(() => !!getStoredToken())

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setBootstrapping(false)
      return
    }
    api.auth
      .me()
      .then(({ user: next }) => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        setUser(next)
      })
      .catch(() => {
        setStoredToken(null)
        sessionStorage.removeItem(STORAGE_KEY)
        setUser(null)
      })
      .finally(() => setBootstrapping(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const { token, user: next } = await api.auth.login(username, password)
      setStoredToken(token)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setUser(next)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } catch {
      /* session may already be invalid */
    }
    setStoredToken(null)
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, bootstrapping, login, logout }),
    [user, bootstrapping, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
