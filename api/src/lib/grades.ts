import type { CourseReport, Database, GradeHistoryPoint } from '../types.js'

export function computeOverallAverage(courses: CourseReport[]): number | null {
  const marked = courses.filter((c) => c.currentMark != null)
  if (marked.length === 0) return null
  const sum = marked.reduce((acc, c) => acc + (c.currentMark as number), 0)
  return Math.round((sum / marked.length) * 10) / 10
}

export function appendGradeHistory(
  db: Database,
  event?: string,
): GradeHistoryPoint | null {
  const average = computeOverallAverage(db.courses)
  if (average == null) return null

  const last = db.gradeHistory[db.gradeHistory.length - 1]
  const today = new Date().toISOString().slice(0, 10)
  if (last && last.date === today && last.overallAverage === average && !event) {
    return last
  }

  const point: GradeHistoryPoint = {
    id: `gh${Date.now()}`,
    date: today,
    overallAverage: average,
    event,
  }
  db.gradeHistory.push(point)
  if (db.gradeHistory.length > 30) {
    db.gradeHistory = db.gradeHistory.slice(-30)
  }
  return point
}
