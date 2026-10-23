import { useState, useMemo } from 'react'
import { AsyncState } from '../../components/AsyncState'
import { useAsyncData } from '../../hooks/useAsyncData'
import { api } from '../../lib/api/client'
import type { InboxMessage } from '../../data/types'

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function StudentInbox() {
  const { data, loading, error, reload } = useAsyncData(() => api.student.inbox(), [])
  const [filter, setFilter] = useState<'all' | 'grade' | 'announcement' | 'unread'>('all')
  const [search, setSearch] = useState('')
  const [activeMessage, setActiveMessage] = useState<InboxMessage | null>(null)

  const messages = data?.messages ?? []

  async function openMessage(msg: InboxMessage) {
    setActiveMessage(msg)
    if (!msg.read) {
      await api.student.markInboxRead(msg.id)
      reload()
    }
  }

  async function handleMarkAllRead() {
    await api.student.readAllInbox()
    reload()
  }

  const filtered = useMemo(() => {
    return (data?.messages ?? []).filter((m) => {
      const matchSearch =
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.preview.toLowerCase().includes(search.toLowerCase()) ||
        m.from.toLowerCase().includes(search.toLowerCase())

      if (!matchSearch) return false

      if (filter === 'unread') return !m.read
      if (filter === 'grade') return m.category === 'grade'
      if (filter === 'announcement') return m.category === 'announcement'
      return true
    })
  }, [data?.messages, filter, search])

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div className="space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2233] pb-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">TeachAssist Message Center</h1>
          <p className="text-xs text-slate-400">
            Instructor evaluation feedback and school board announcements
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            className="ta-btn-secondary px-3 py-1.5 text-xs font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex rounded-md bg-[#090b10] p-1 border border-[#1c2233] shrink-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('grade')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition ${
              filter === 'grade'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Evaluation Updates
          </button>
          <button
            type="button"
            onClick={() => setFilter('announcement')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition ${
              filter === 'announcement'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Announcements
          </button>
        </div>

        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search messages by instructor or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#1c2233] bg-[#0e1118] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Messages List */}
      <AsyncState loading={loading} error={error}>
        {filtered.length === 0 ? (
          <div className="ta-card p-8 text-center text-xs text-slate-500">
            No messages found.
          </div>
        ) : (
          <div className="ta-card divide-y divide-[#181e2d] overflow-hidden">
            {filtered.map((msg) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => void openMessage(msg)}
                className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                  !msg.read ? 'bg-[#121724]' : 'hover:bg-[#10141f]'
                }`}
              >
                <div className="mt-1 flex size-2 shrink-0 rounded-full">
                  {!msg.read ? (
                    <span className="size-2 rounded-full bg-blue-500" />
                  ) : (
                    <span className="size-2 rounded-full bg-transparent" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className={`text-xs sm:text-sm ${!msg.read ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>
                      {msg.subject}
                    </p>
                    <span className="text-[11px] text-slate-500">{formatTime(msg.sentAt)}</span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-xs text-slate-400 leading-relaxed">
                    {msg.preview}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>From: {msg.from}</span>
                    <span className="text-blue-400 font-medium">Read details →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </AsyncState>

      {/* Message Reader Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="ta-card-elevated w-full max-w-lg p-6 relative border border-[#232a3d]">
            <button
              type="button"
              onClick={() => setActiveMessage(null)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
              <span className="font-semibold text-blue-400 uppercase">
                {activeMessage.category}
              </span>
              <span>•</span>
              <span>From: {activeMessage.from}</span>
            </div>

            <h3 className="text-base font-bold text-white mb-3">
              {activeMessage.subject}
            </h3>

            <div className="rounded-lg border border-[#1c2233] bg-[#090c13] p-4 text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
              {activeMessage.preview}
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Timestamp: {formatTime(activeMessage.sentAt)}</span>
              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                className="ta-btn-secondary px-3 py-1.5 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
