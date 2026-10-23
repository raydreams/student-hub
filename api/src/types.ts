export type UserRole = 'student' | 'teacher' | 'admin' | 'parent'

export interface AuthUser {
  role: UserRole
  displayName: string
  studentId?: string
  username: string
}

export type CopType = 'conversation' | 'observation' | 'product'

export interface CourseReport {
  id: string
  code: string
  name: string
  block: string
  room: string
  dateRange: string
  currentMark: number | null
  statusNote?: string
}

export interface ProgressPoint {
  time: number
  value: number
  type: CopType
  label?: string
}

export interface OverallExpectation {
  id: string
  code: string
  title: string
  description: string
  markPercent: number | null
  totalWeight: number
  points: ProgressPoint[]
}

export interface AssessmentTask {
  id: string
  name: string
  expectation: string
  mark: string
  weight: number
  feedback: string
  category: 'task' | 'culminating' | 'attendance'
}

export interface CourseDetail {
  courseId: string
  termWorkPercent: number
  termWorkWeight: number
  culminatingPercent: number
  culminatingWeight: number
  strandGroups: { strand: string; expectations: OverallExpectation[] }[]
  tasks: AssessmentTask[]
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  courseCode: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  period: string
}

export interface ClassSummary {
  id: string
  code: string
  name: string
  teacher: string
  block: string
  room: string
  enrollment: number
}

export interface SupplyAssignment {
  id: string
  date: string
  teacherAbsent: string
  supplyTeacher: string
  courseCode: string
  block: string
}

export interface RosterEntry {
  id: string
  name: string
}

export interface GradeHistoryPoint {
  id: string
  date: string
  overallAverage: number
  event?: string
}

export interface InboxMessage {
  id: string
  from: string
  subject: string
  preview: string
  sentAt: string
  read: boolean
  category: 'grade' | 'announcement' | 'reminder'
}

export interface Database {
  studentId: string
  courses: CourseReport[]
  courseDetails: Record<string, CourseDetail>
  classes: ClassSummary[]
  attendance: AttendanceRecord[]
  supply: SupplyAssignment[]
  roster: RosterEntry[]
  gradeHistory: GradeHistoryPoint[]
  inbox: InboxMessage[]
}
