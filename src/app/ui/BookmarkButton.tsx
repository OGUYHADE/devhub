'use client'

import { useOptimistic, useTransition } from 'react'
import clsx from 'clsx'
import { toggleBookmark } from '@/app/actions'
import { BookmarkIcon } from './icons'

type Props = {
  postId: string
  initialBookmarked: boolean
}

export default function BookmarkButton({ postId, initialBookmarked }: Props) {
  const [, startTransition] = useTransition()
  const [optimistic, addOptimistic] = useOptimistic(
    { bookmarked: initialBookmarked },
    (state) => ({ bookmarked: !state.bookmarked })
  )

  function handleClick() {
    startTransition(async () => {
      addOptimistic(undefined)
      await toggleBookmark(postId)
    })
  }

  return (
    <button
      onClick={handleClick}
      title={optimistic.bookmarked ? 'ブックマーク解除' : 'ブックマーク'}
      className={clsx(
        'flex items-center gap-1 text-sm px-2.5 py-1.5 rounded-full transition-colors duration-150 active:scale-95',
        optimistic.bookmarked
          ? 'text-accent-purple'
          : 'text-slate-500 hover:text-accent-purple hover:bg-accent-purple/10'
      )}
    >
      <svg
        width="15" height="15" viewBox="0 0 24 24"
        fill={optimistic.bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    </button>
  )
}
