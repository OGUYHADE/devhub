import { SkeletonProfile, SkeletonFeed } from '@/app/ui/Skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <SkeletonProfile />
        <div className="mt-6">
          <SkeletonFeed />
        </div>
      </div>
    </div>
  )
}
