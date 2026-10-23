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

  async function openMessage(msg: InboxMessage) {
    if (!msg.read) {
      await api.student.markInboxRead(msg.id)
      reload()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white">Inbox</h1>
          <p className="text-sm text-hub-muted">Grades, announcements, and reminders.</p>
        </div>
        <button
          type="button"
          onClick={() => void api.student.readAllInbox().then(() => reload())}
          className="shrink-0 text-xs font-medium text-hub-blue-bright"
        >
          Mark all read
        </button>
      </div>
      <AsyncState loading={loading} error={error}>
        {data && (
          <ul className="space-y-2">
            {data.messages.map((msg) => (
              <li key={msg.id}>
                <button
                  type="button"
                  onClick={() => void openMessage(msg)}
                  className={`hub-card w-full p-4 text-left transition hover:border-blue-500/30 ${
                    !msg.read ? 'ring-1 ring-blue-500/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-white">{msg.subject}</p>
                    {!msg.read && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-hub-muted">{msg.preview}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    {msg.from} · {formatTime(msg.sentAt)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </AsyncState>
    </div>
  )
}
