'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RealtimeFeed() {
  const [hasNew, setHasNew] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('realtime-posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        () => setHasNew(true)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (!hasNew) return null

  function handleRefresh() {
    setIsRefreshing(true)
    setHasNew(false)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="mb-4 pointer-events-none">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="pointer-events-auto w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:glow-purple text-white text-sm font-semibold py-2.5 px-5 rounded-full transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isRefreshing ? 'animate-spin' : ''}
        >
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        {isRefreshing ? '更新中...' : '新しい投稿があります — タップして更新'}
      </button>
    </div>
  )
}
