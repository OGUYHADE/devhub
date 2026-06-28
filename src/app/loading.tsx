import { SkeletonFeed } from '@/app/ui/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-dark-surface rounded-2xl border border-dark-border/60 p-5">
          <div className="h-20 skeleton-shimmer rounded-xl mb-4" />
          <div className="flex justify-end">
            <div className="h-9 w-20 skeleton-shimmer rounded-full" />
          </div>
        </div>
        <SkeletonFeed />
      </div>
    </div>
  )
}
