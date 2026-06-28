export function SkeletonCard() {
  return (
    <div className="bg-dark-surface rounded-2xl border border-dark-border/60 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full skeleton-shimmer shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-28 skeleton-shimmer rounded-full" />
          <div className="h-2.5 w-20 skeleton-shimmer rounded-full" />
        </div>
        <div className="h-5 w-16 skeleton-shimmer rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 skeleton-shimmer rounded-full" />
        <div className="h-3 skeleton-shimmer rounded-full w-5/6" />
        <div className="h-3 skeleton-shimmer rounded-full w-3/4" />
      </div>
      <div className="flex gap-3 pt-3 border-t border-dark-border/50">
        <div className="h-7 w-16 skeleton-shimmer rounded-full" />
        <div className="h-7 w-12 skeleton-shimmer rounded-full" />
        <div className="h-7 w-12 skeleton-shimmer rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonFeed() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div>
      <div className="h-32 rounded-2xl skeleton-shimmer mb-12" />
      <div className="px-4 -mt-16 space-y-3">
        <div className="w-24 h-24 rounded-full skeleton-shimmer" />
        <div className="h-6 w-40 skeleton-shimmer rounded-full" />
        <div className="h-4 w-28 skeleton-shimmer rounded-full" />
        <div className="h-16 skeleton-shimmer rounded-2xl mt-4" />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-3 skeleton-shimmer rounded-full"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}
