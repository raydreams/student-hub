const items = [
  { key: 'conversation', label: 'Conversation', className: 'bg-blue-600' },
  { key: 'observation', label: 'Observation', className: 'bg-green-600' },
  { key: 'product', label: 'Product', className: 'bg-orange-600' },
] as const

export function CopLegend({ compact, dark }: { compact?: boolean; dark?: boolean }) {
  return (
    <ul
      className={`flex gap-4 ${compact ? 'flex-col gap-2 text-xs' : 'flex-wrap text-sm'}`}
    >
      {items.map((item) => (
        <li
          key={item.key}
          className={`flex items-center gap-2 ${dark ? 'text-hub-muted' : 'text-slate-600'}`}
        >
          <span
            className={`inline-block size-3 rounded-sm ${item.className}`}
            aria-hidden
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
