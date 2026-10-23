import { useState } from 'react'
import type { CourseReport } from '../../data/types'

interface AssessmentSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
  courses: CourseReport[]
  currentAverage: number | null
  onAddAssessment: (courseId: string, title: string, mark: number) => Promise<void>
}

export function AssessmentSimulatorModal({
  isOpen,
  onClose,
  courses,
  currentAverage,
  onAddAssessment,
}: AssessmentSimulatorModalProps) {
  const activeCourses = courses.filter((c) => c.currentMark != null)
  const [courseId, setCourseId] = useState(activeCourses[0]?.id || 'mhf4u')
  const [title, setTitle] = useState('Quiz 4: Trigonometric Functions')
  const [markPercent, setMarkPercent] = useState(62)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const selectedCourse = activeCourses.find((c) => c.id === courseId) || activeCourses[0]
  const courseCurrentMark = selectedCourse?.currentMark ?? 85

  // Projected course mark (15% weight)
  const projectedCourseMark =
    Math.round((courseCurrentMark * 0.85 + markPercent * 0.15) * 10) / 10
  const courseDelta = Math.round((projectedCourseMark - courseCurrentMark) * 10) / 10

  // Projected overall average
  const currentSum = activeCourses.reduce((acc, c) => acc + (c.currentMark || 0), 0)
  const projectedSum = currentSum - courseCurrentMark + projectedCourseMark
  const projectedOverall =
    activeCourses.length > 0 ? Math.round((projectedSum / activeCourses.length) * 10) / 10 : 85
  const overallDelta =
    currentAverage != null ? Math.round((projectedOverall - currentAverage) * 10) / 10 : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onAddAssessment(courseId, title, markPercent)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="ta-card-elevated w-full max-w-md p-6 relative border border-[#232a3d]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-4 text-left">
          <span className="font-mono text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
            TeachAssist · Mark Simulator
          </span>
          <h3 className="mt-1 text-base font-bold text-white">Record New Assessment</h3>
          <p className="text-xs text-slate-400">
            Simulate a newly posted evaluation and observe the weighted drop on your overall average.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Course
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-lg border border-[#23293b] bg-[#090b10] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {activeCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} (Current: {c.currentMark?.toFixed(1)}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Assessment Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-[#23293b] bg-[#090b10] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Unit 3 Quiz, Lab Evaluation"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-300">Assessment Mark</span>
              <span className="font-bold text-white tabular-nums">{markPercent}%</span>
            </div>
            <input
              type="range"
              min="35"
              max="100"
              step="1"
              value={markPercent}
              onChange={(e) => setMarkPercent(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>35% (Significant Drop)</span>
              <span>65% (Moderate Drop)</span>
              <span>100% (High)</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setTitle('Quiz 4: Trigonometric Functions')
                setMarkPercent(58)
              }}
              className="rounded border border-red-500/20 bg-red-950/20 px-2 py-1 text-[11px] font-medium text-red-300 hover:bg-red-950/40"
            >
              Simulate 58% Quiz
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle('Physics Dynamics Lab Test')
                setMarkPercent(66)
              }}
              className="rounded border border-amber-500/20 bg-amber-950/20 px-2 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-950/40"
            >
              Simulate 66% Test
            </button>
          </div>

          {/* Calculation Summary Box */}
          <div className="rounded-lg border border-[#1e2436] bg-[#090c13] p-3 text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Course Mark Impact:</span>
              <span className="text-white font-medium">
                {courseCurrentMark.toFixed(1)}% → {projectedCourseMark.toFixed(1)}% ({courseDelta < 0 ? `${courseDelta}%` : `+${courseDelta}%`})
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Overall Average Impact:</span>
              <span className="font-bold text-white">
                {currentAverage?.toFixed(1)}% → {projectedOverall.toFixed(1)}% (
                <span className={overallDelta < 0 ? 'text-red-400' : 'text-emerald-400'}>
                  {overallDelta < 0 ? `${overallDelta}%` : `+${overallDelta}%`}
                </span>
                )
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="ta-btn-secondary flex-1 py-2 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="ta-btn-primary flex-1 py-2 text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? 'Applying…' : 'Record & Update Average'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
