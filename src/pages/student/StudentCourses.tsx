import { useState, useMemo } from 'react'
import { AsyncState } from '../../components/AsyncState'
import { CourseMarkCard } from '../../components/student/CourseMarkCard'
import { useAsyncData } from '../../hooks/useAsyncData'
import { api } from '../../lib/api/client'

export function StudentCourses() {
  const { data, loading, error } = useAsyncData(() => api.student.courses(), [])
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('active')
  const [search, setSearch] = useState('')

  const courses = data?.courses ?? []

  const filtered = useMemo(() => {
    return (data?.courses ?? []).filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.room.toLowerCase().includes(search.toLowerCase())

      if (!matchesSearch) return false

      if (filter === 'active') return c.currentMark != null
      if (filter === 'upcoming') return c.currentMark == null
      return true
    })
  }, [data?.courses, filter, search])

  const markedCourses = courses.filter((c) => c.currentMark != null)
  const avg =
    markedCourses.length > 0
      ? markedCourses.reduce((acc, c) => acc + (c.currentMark ?? 0), 0) / markedCourses.length
      : null

  return (
    <div className="space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2233] pb-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Academic Courses</h1>
          <p className="text-xs text-slate-400">
            Ontario Secondary School Diploma course load &amp; evaluation records
          </p>
        </div>

        {avg != null && (
          <div className="flex items-center gap-2 rounded-lg border border-[#1c2233] bg-[#0e1118] px-3 py-1.5 text-xs">
            <span className="text-slate-400">Semester 1 Average:</span>
            <span className="font-bold text-white tabular-nums">{avg.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex rounded-md bg-[#090b10] p-1 border border-[#1c2233] shrink-0">
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Semester ({courses.filter((c) => c.currentMark != null).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('upcoming')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semester 2 ({courses.filter((c) => c.currentMark == null).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Courses ({courses.length})
          </button>
        </div>

        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Filter by course code, title, or room…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#1c2233] bg-[#0e1118] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      <AsyncState loading={loading} error={error}>
        {filtered.length === 0 ? (
          <div className="ta-card p-8 text-center text-xs text-slate-500">
            No courses found matching this criteria.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((course) => (
              <CourseMarkCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </AsyncState>
    </div>
  )
}
