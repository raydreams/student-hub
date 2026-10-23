import type { AuthUser } from '../../auth/types'
import type {
  AttendanceRecord,
  ClassSummary,
  CourseDetail,
  CourseReport,
  GradeHistoryPoint,
  InboxMessage,
  StudentDashboard,
  SupplyAssignment,
} from '../../data/types'

const TOKEN_KEY = 'student-hub-token'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null): void {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(path, { ...init, headers })
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ token: string; user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    logout: () =>
      request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
    me: () => request<{ user: AuthUser }>('/api/auth/me'),
  },
  student: {
    dashboard: () => request<StudentDashboard>('/api/student/dashboard'),
    courses: () =>
      request<{ studentId: string; courses: CourseReport[] }>(
        '/api/student/courses',
      ),
    inbox: () => request<{ messages: InboxMessage[] }>('/api/student/inbox'),
    markInboxRead: (id: string) =>
      request<{ ok: boolean }>(`/api/student/inbox/${id}/read`, {
        method: 'PATCH',
      }),
    readAllInbox: () =>
      request<{ ok: boolean }>('/api/student/inbox/read-all', {
        method: 'POST',
      }),
    simulateAssessment: () =>
      request<{
        ok: boolean
        overallAverage: number | null
        previousAverage: number | null
        gradeHistory: GradeHistoryPoint[]
      }>('/api/student/simulate-assessment', { method: 'POST' }),
    courseReport: (courseId: string) =>
      request<{ course: CourseReport; detail: CourseDetail }>(
        `/api/student/courses/${courseId}/report`,
      ),
  },
  teacher: {
    courseReport: (courseId: string) =>
      request<{ detail: CourseDetail }>(`/api/teacher/courses/${courseId}/report`),
    attendance: (courseId: string) =>
      request<{ records: AttendanceRecord[]; courseCode: string }>(
        `/api/teacher/courses/${courseId}/attendance`,
      ),
    updateTaskMark: (taskId: string, courseId: string, mark: string) =>
      request<{ ok: boolean }>(`/api/teacher/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ courseId, mark }),
      }),
    markAllPresent: (courseId: string, date: string) =>
      request<{ records: AttendanceRecord[] }>(
        `/api/teacher/courses/${courseId}/attendance/mark-all-present`,
        { method: 'POST', body: JSON.stringify({ date }) },
      ),
  },
  admin: {
    classes: () => request<{ classes: ClassSummary[] }>('/api/admin/classes'),
    attendance: () =>
      request<{ attendance: AttendanceRecord[] }>('/api/admin/attendance'),
    updateAttendance: (id: string, status: AttendanceRecord['status']) =>
      request<{ ok: boolean }>(`/api/admin/attendance/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    supply: () => request<{ supply: SupplyAssignment[] }>('/api/admin/supply'),
    createSupply: (body: Omit<SupplyAssignment, 'id'>) =>
      request<{ assignment: SupplyAssignment }>('/api/admin/supply', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
}
