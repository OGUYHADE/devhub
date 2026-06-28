'use client'

import { useState, useTransition } from 'react'
import { toggleThreadBookmark } from '@/app/actions'

export default function ThreadBookmarkButton({
  threadId,
  initialBookmarked,
}: {
  threadId: string
  initialBookmarked: boolean
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    setBookmarked((v) => !v)
    startTransition(async () => {
      await toggleThreadBookmark(threadId)
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={bookmarked ? 'ブックマーク解除' : 'ブックマーク'}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition font-medium
        ${
          bookmarked
            ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-amber-500 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950'
        } disabled:opacity-60`}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
      {bookmarked ? 'ブックマーク済み' : 'ブックマーク'}
    </button>
  )
}
