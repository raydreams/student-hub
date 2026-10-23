import { Link } from 'react-router-dom'
import type { InboxMessage } from '../../data/types'

interface InboxPreviewListProps {
  messages: InboxMessage[]
  compact?: boolean
  onSelectMessage?: (msg: InboxMessage) => void
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Recent'
  }
}

export function InboxPreviewList({
  messages,
  compact = false,
  onSelectMessage,
}: InboxPreviewListProps) {
  if (messages.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-500">
        <p>No messages in your inbox.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-[#181e2d]">
      {messages.map((msg) => {
        const isGrade = msg.category === 'grade'

        const content = (
          <div
            className={`group flex items-start gap-3 py-3 px-2 text-left transition-colors rounded-lg ${
              !msg.read
                ? 'bg-[#121724]'
                : 'hover:bg-[#10141f]'
            }`}
          >
            {/* Clean category indicator */}
            <div className="mt-1 flex size-2 shrink-0 rounded-full">
              {!msg.read ? (
                <span className="size-2 rounded-full bg-blue-500" />
              ) : (
                <span className="size-2 rounded-full bg-transparent" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`truncate text-xs sm:text-sm ${
                    !msg.read ? 'font-semibold text-white' : 'font-medium text-slate-300'
                  }`}
                >
                  {msg.subject}
                </p>
                <span className="text-[11px] text-slate-500 shrink-0">
                  {formatTime(msg.sentAt)}
                </span>
              </div>

              {!compact && (
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-400 leading-relaxed">
                  {msg.preview}
                </p>
              )}

              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                <span>{msg.from}</span>
                <span>•</span>
                <span className="capitalize">{isGrade ? 'Assessment Mark' : msg.category}</span>
              </div>
            </div>
          </div>
        )

        return (
          <li key={msg.id}>
            {onSelectMessage ? (
              <button
                type="button"
                onClick={() => onSelectMessage(msg)}
                className="w-full text-left"
              >
                {content}
              </button>
            ) : (
              <Link to="/student/inbox" className="block">
                {content}
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
