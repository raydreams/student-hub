export function AsyncState({
  loading,
  error,
  children,
}: {
  loading: boolean
  error: string | null
  children: React.ReactNode
}) {
  if (loading) {
    return (
      <div className="hub-card flex items-center justify-center gap-3 p-8">
        <span className="size-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm text-hub-muted">Loading…</p>
      </div>
    )
  }
  if (error) {
    return (
      <p className="hub-card border-red-500/30 p-6 text-sm text-red-300" role="alert">
        {error}
      </p>
    )
  }
  return children
}
