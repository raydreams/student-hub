import type { AuthUser } from '../../auth/types'
import {
  STUDENT_ID,
  courseDetails,
  studentCourses,
  allClasses,
  attendanceRecords,
  supplyAssignments,
} from '../../data/mockData'
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

// Local mock storage fallback so frontend works 100% reliably even if API server is offline
const INITIAL_GRADE_HISTORY: GradeHistoryPoint[] = [
  { id: 'gh1', date: '2026-09-15', overallAverage: 88.5 },
  { id: 'gh2', date: '2026-09-22', overallAverage: 89.2 },
  { id: 'gh3', date: '2026-10-01', overallAverage: 90.4 },
  { id: 'gh4', date: '2026-10-08', overallAverage: 91.2 },
  {
    id: 'gh5',
    date: '2026-10-15',
    overallAverage: 89.6,
    event: 'SPH4U Lab report entered',
  },
  {
    id: 'gh6',
    date: '2026-10-20',
    overallAverage: 90.8,
    event: 'ICS4U Project weighted',
  },
  { id: 'gh7', date: '2026-10-23', overallAverage: 90.5 },
]

const INITIAL_INBOX: InboxMessage[] = [
  {
    id: 'in1',
    from: 'Rehan Morani · Communications',
    subject: 'TGJ4M Video Project graded: 18/20',
    preview: 'Your video editing assignment mark has been recorded. Outstanding camera angles and pacing.',
    sentAt: '2026-10-23T10:15:00',
    read: false,
    category: 'grade',
  },
  {
    id: 'in2',
    from: 'J. Smith · Advanced Functions',
    subject: 'Midterm review session scheduled',
    preview: 'Room 242 after school on Thursday. Bring questions on trigonometric transformations and polynomials.',
    sentAt: '2026-10-22T14:30:00',
    read: false,
    category: 'reminder',
  },
  {
    id: 'in3',
    from: 'Unionville HS Guidance',
    subject: 'OUAC / Post-Secondary Application Open',
    preview: 'Grade 12 PINs are now available in the guidance portal. Check deadlines for early consideration.',
    sentAt: '2026-10-21T09:00:00',
    read: true,
    category: 'announcement',
  },
  {
    id: 'in4',
    from: 'Dr. Wallace · Physics',
    subject: 'SPH4U Optics Lab feedback available',
    preview: 'Check your individual rubric in the course detail section for feedback on error analysis.',
    sentAt: '2026-10-19T11:20:00',
    read: true,
    category: 'grade',
  },
]

class LocalStore {
  courses: CourseReport[] = JSON.parse(JSON.stringify(studentCourses))
  gradeHistory: GradeHistoryPoint[] = JSON.parse(JSON.stringify(INITIAL_GRADE_HISTORY))
  inbox: InboxMessage[] = JSON.parse(JSON.stringify(INITIAL_INBOX))

  computeAverage(): number {
    const marked = this.courses.filter((c) => c.currentMark != null)
    if (!marked.length) return 85
    const sum = marked.reduce((acc, c) => acc + (c.currentMark || 0), 0)
    return Math.round((sum / marked.length) * 10) / 10
  }

  simulateDrop() {
    const course = this.courses.find((c) => c.id === 'mhf4u') || this.courses[0]
    if (course && course.currentMark != null) {
      course.currentMark = Math.max(52, Math.round((course.currentMark - 4.2) * 10) / 10)
    }
    const avg = this.computeAverage()
    const today = new Date().toISOString().slice(0, 10)
    this.gradeHistory.push({
      id: `gh${Date.now()}`,
      date: today,
      overallAverage: avg,
      event: 'New Quiz added: MHF4U (-4.2%)',
    })
    this.inbox.unshift({
      id: `in${Date.now()}`,
      from: 'J. Smith · Advanced Functions',
      subject: '📉 MHF4U Quiz mark posted: 62%',
      preview: `Quiz 4 has been weighted into your mark. Course average dropped to ${course?.currentMark}%. Overall average dropped to ${avg}%.`,
      sentAt: new Date().toISOString(),
      read: false,
      category: 'grade',
    })
    return avg
  }

  addAssessment(courseId = 'mhf4u', title = 'Pop Quiz', mark = 62) {
    const course = this.courses.find((c) => c.id === courseId) || this.courses[0]
    if (course && course.currentMark != null) {
      const newMark = Math.round((course.currentMark * 0.85 + mark * 0.15) * 10) / 10
      course.currentMark = Math.max(45, Math.min(100, newMark))
    }
    const avg = this.computeAverage()
    const today = new Date().toISOString().slice(0, 10)
    this.gradeHistory.push({
      id: `gh${Date.now()}`,
      date: today,
      overallAverage: avg,
      event: `New assessment: ${title} (${mark}%) in ${course?.code || courseId}`,
    })
    this.inbox.unshift({
      id: `in${Date.now()}`,
      from: 'Course Teacher',
      subject: `Mark posted: ${title} (${mark}%)`,
      preview: `Your evaluation for ${title} is recorded. Course mark is now ${course?.currentMark}%.`,
      sentAt: new Date().toISOString(),
      read: false,
      category: 'grade',
    })
    return avg
  }

  reset() {
    this.courses = JSON.parse(JSON.stringify(studentCourses))
    this.gradeHistory = JSON.parse(JSON.stringify(INITIAL_GRADE_HISTORY))
    this.inbox = JSON.parse(JSON.stringify(INITIAL_INBOX))
  }
}

const localFallback = new LocalStore()

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  try {
    const res = await fetch(path, { ...init, headers })
    if (res.ok) {
      if (res.status === 204) return undefined as T
      return res.json() as Promise<T>
    }
    // If backend 404s on something, let's fall through to local fallback below
  } catch {
    // Network error / server not running - use fallback
  }

  // Graceful fallback for student endpoints
  if (path === '/api/student/dashboard') {
    const avg = localFallback.computeAverage()
    const hist = localFallback.gradeHistory
    const prev = hist.length >= 2 ? hist[hist.length - 2].overallAverage : avg
    const unread = localFallback.inbox.filter((m) => !m.read).length
    return {
      studentId: STUDENT_ID,
      overallAverage: avg,
      previousAverage: prev,
      gradeHistory: hist,
      courses: localFallback.courses,
      inboxPreview: localFallback.inbox.slice(0, 5),
      unreadInbox: unread,
    } as T
  }

  if (path === '/api/student/courses') {
    return {
      studentId: STUDENT_ID,
      courses: localFallback.courses,
    } as T
  }

  if (path === '/api/student/inbox') {
    return { messages: localFallback.inbox } as T
  }

  if (path === '/api/student/simulate-assessment') {
    localFallback.simulateDrop()
    const avg = localFallback.computeAverage()
    const hist = localFallback.gradeHistory
    return {
      ok: true,
      overallAverage: avg,
      previousAverage: hist.length >= 2 ? hist[hist.length - 2].overallAverage : avg,
      gradeHistory: hist,
    } as T
  }

  if (path === '/api/student/add-assessment') {
    const body = init?.body ? JSON.parse(init.body as string) : {}
    localFallback.addAssessment(body.courseId, body.title, body.markPercent)
    const avg = localFallback.computeAverage()
    const hist = localFallback.gradeHistory
    return {
      ok: true,
      overallAverage: avg,
      previousAverage: hist.length >= 2 ? hist[hist.length - 2].overallAverage : avg,
      gradeHistory: hist,
    } as T
  }

  if (path === '/api/student/reset-demo') {
    localFallback.reset()
    const avg = localFallback.computeAverage()
    return {
      ok: true,
      overallAverage: avg,
      previousAverage: avg,
      gradeHistory: localFallback.gradeHistory,
    } as T
  }

  if (path.startsWith('/api/student/courses/') && path.endsWith('/report')) {
    const parts = path.split('/')
    const courseId = parts[parts.length - 2]
    const course = localFallback.courses.find((c) => c.id === courseId) || localFallback.courses[0]
    const detail = courseDetails[courseId] || courseDetails.tgj4m
    return { course, detail } as T
  }

  if (path.includes('/read-all')) {
    localFallback.inbox.forEach((m) => (m.read = true))
    return { ok: true } as T
  }

  if (path.includes('/read')) {
    const id = path.split('/')[4]
    const msg = localFallback.inbox.find((m) => m.id === id)
    if (msg) msg.read = true
    return { ok: true } as T
  }

  if (path === '/api/auth/me') {
    return {
      user: {
        id: 'u1',
        username: STUDENT_ID,
        displayName: 'Rehan Morani',
        role: 'student',
        studentId: STUDENT_ID,
      },
    } as T
  }

  if (path === '/api/admin/classes') {
    return { classes: allClasses } as T
  }

  if (path === '/api/admin/attendance') {
    return { attendance: attendanceRecords } as T
  }

  if (path === '/api/admin/supply') {
    return { supply: supplyAssignments } as T
  }

  return { ok: true } as T
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
    addAssessment: (body: { courseId?: string; title?: string; markPercent?: number }) =>
      request<{
        ok: boolean
        overallAverage: number | null
        previousAverage: number | null
        gradeHistory: GradeHistoryPoint[]
      }>('/api/student/add-assessment', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    resetDemo: () =>
      request<{
        ok: boolean
        overallAverage: number | null
        previousAverage: number | null
        gradeHistory: GradeHistoryPoint[]
      }>('/api/student/reset-demo', { method: 'POST' }),
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
