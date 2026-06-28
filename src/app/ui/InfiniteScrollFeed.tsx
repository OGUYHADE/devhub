'use client'

import { useState, useEffect, useRef } from 'react'
import PostCard from './PostCard'
import EmptyState from './EmptyState'
import { fetchMorePosts } from '@/app/actions'
import type { Post, ReactionData } from '@/lib/types'

export type PostWithReactions = Post & { initialReactions: ReactionData[] }

const FEED_LIMIT = 20

type Props = {
  initialPosts: PostWithReactions[]
  initialRespectedIds: string[]
  initialBookmarkedIds: string[]
  currentUserId: string
  sort?: string
  category?: string
  hasMore: boolean
}

export default function InfiniteScrollFeed({
  initialPosts,
  initialRespectedIds,
  initialBookmarkedIds,
  currentUserId,
  sort,
  category,
  hasMore: initialHasMore,
}: Props) {
  const [posts, setPosts] = useState<PostWithReactions[]>(initialPosts)
  const [respectedIds, setRespectedIds] = useState(() => new Set(initialRespectedIds))
  const [bookmarkedIds, setBookmarkedIds] = useState(() => new Set(initialBookmarkedIds))
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const pageRef = useRef(2)
  const loadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin: '500px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore])

  async function loadMore() {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)

    const result = await fetchMorePosts({
      page: pageRef.current,
      sort,
      category,
    })

    const newPosts: PostWithReactions[] = result.posts.map((p) => ({
      ...p,
      initialReactions: result.reactionsByPost[p.id] ?? [],
    }))

    if (newPosts.length < FEED_LIMIT) setHasMore(false)
    setPosts((prev) => [...prev, ...newPosts])
    setRespectedIds((prev) => new Set([...prev, ...result.respectedIds]))
    setBookmarkedIds((prev) => new Set([...prev, ...result.bookmarkedIds]))
    pageRef.current++

    loadingRef.current = false
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          respected={respectedIds.has(post.id)}
          bookmarked={bookmarkedIds.has(post.id)}
          currentUserId={currentUserId}
          initialReactions={post.initialReactions}
        />
      ))}

      {hasMore && <div ref={sentinelRef} className="h-4" />}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-accent-purple border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-xs text-slate-600 py-4 font-mono">// すべての投稿を表示しました</p>
      )}

      {!hasMore && posts.length === 0 && (
        <EmptyState
          icon="rocket"
          title="まだ投稿がありません"
          description="最初の進捗を共有して、コミュニティの一歩を踏み出そう"
        />
      )}
    </div>
  )
}
