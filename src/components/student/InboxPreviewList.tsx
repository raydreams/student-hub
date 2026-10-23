import { Link } from 'react-router-dom'
import type { InboxMessage } from '../../data/types'

const categoryStyle: Record<InboxMessage['category'], string> = {
  grade: 'bg-blue-500/20 text-blue-300',
  announcement: 'bg-violet-500/20 text-violet-300',
  reminder: 'bg-amber-500/20 text-amber-300',
}

export function InboxPreviewList({
  messages,
  compact,
}: {
  messages: InboxMessage[]
  compact?: boolean
}) {
  if (messages.length === 0) {
    return <p className="text-sm text-hub-muted">Inbox is clear.</p>
  }

  return (
    <ul className="space-y-2">
      {messages.map((msg) => (
        <li key={msg.id}>
          <Link
            to="/student/inbox"
            className={`flex gap-3 rounded-xl border border-transparent p-3 transition hover:border-white/10 hover:bg-white/5 ${
              !msg.read ? 'bg-blue-500/5' : ''
            }`}
          >
            <div
              className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase ${categoryStyle[msg.category]}`}
            >
              {msg.category.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-white">{msg.subject}</p>
                {!msg.read && (
                  <span className="size-2 shrink-0 rounded-full bg-blue-400" aria-label="Unread" />
                )}
              </div>
              {!compact && (
                <p className="mt-0.5 line-clamp-2 text-xs text-hub-muted">{msg.preview}</p>
              )}
              <p className="mt-1 text-[10px] text-hub-muted">{msg.from}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
