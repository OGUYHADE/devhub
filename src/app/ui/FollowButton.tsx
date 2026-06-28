'use client'

import { useOptimistic, useTransition } from 'react'
import clsx from 'clsx'
import { toggleFollow } from '@/app/actions'

export default function FollowButton({
  targetUserId,
  initialFollowing,
  size = 'md',
}: {
  targetUserId: string
  initialFollowing: boolean
  size?: 'sm' | 'md'
}) {
  const [, startTransition] = useTransition()
  const [optimistic, addOptimistic] = useOptimistic(
    { following: initialFollowing },
    (state) => ({ following: !state.following })
  )

  function handleClick() {
    startTransition(async () => {
      addOptimistic(undefined)
      await toggleFollow(targetUserId)
    })
  }

  const sizeCls = size === 'sm' ? 'text-xs px-3 py-1' : 'text-sm px-5 py-1.5'

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'font-semibold rounded-full transition-all duration-200 active:scale-95',
        sizeCls,
        optimistic.following
          ? 'bg-dark-elevated text-slate-300 border border-dark-border hover:border-red-500/40 hover:text-red-400'
          : 'border border-accent-purple/50 text-accent-purple-light hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 hover:text-white hover:border-transparent'
      )}
    >
      {optimistic.following ? 'フォロー中' : 'フォロー'}
    </button>
  )
}
