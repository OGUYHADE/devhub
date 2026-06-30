export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tab bar skeleton */}
        <div className="flex gap-2 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-28 skeleton-shimmer rounded-full" />
          ))}
        </div>

        {/* Card skeletons */}
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-dark-surface rounded-2xl border border-dark-border/60 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-16 skeleton-shimmer rounded-full" />
                <div className="h-3 w-20 skeleton-shimmer rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 skeleton-shimmer rounded-full" />
                <div className="h-4 w-4/5 skeleton-shimmer rounded-full" />
              </div>
              <div className="flex gap-4 mt-4">
                <div className="h-3 w-10 skeleton-shimmer rounded-full" />
                <div className="h-3 w-10 skeleton-shimmer rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
