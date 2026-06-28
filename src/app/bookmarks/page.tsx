import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostCard, { type Post } from '@/app/ui/PostCard'
import AppShell from '@/app/ui/shell/AppShell'
import PageHeader from '@/app/ui/shell/PageHeader'
import EmptyState from '@/app/ui/EmptyState'

export const metadata = { title: 'ブックマーク' }

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [{ data: bookmarkRows }, { count: unreadNotifs }] = await Promise.all([
    supabase
      .from('bookmarks')
      .select('post_id, posts(id, content, author_name, user_id, created_at, progress, category, github_url, demo_url, pinned, is_public, view_count, image_url, tech_stack, quoted_post_id, quoted_post:quoted_post_id(id,content,author_name,user_id), respects(count), comments(count))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
  ])

  const posts = ((bookmarkRows ?? [])
    .map((b) => (b.posts as unknown as Post))
    .filter(Boolean)) as Post[]

  const postIds = posts.map((p) => p.id)
  const [{ data: myRespects }, { data: myBookmarks }] = await Promise.all([
    postIds.length > 0
      ? supabase.from('respects').select('post_id').eq('user_id', user.id).in('post_id', postIds)
      : Promise.resolve({ data: [] }),
    postIds.length > 0
      ? supabase.from('bookmarks').select('post_id').eq('user_id', user.id).in('post_id', postIds)
      : Promise.resolve({ data: [] }),
  ])
  const respectedIds = new Set((myRespects ?? []).map((r) => r.post_id))
  const bookmarkedIds = new Set((myBookmarks ?? []).map((b) => b.post_id))

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0}>
      <PageHeader title="ブックマーク" backHref="/" />

      {posts.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="ブックマークがありません"
          description="気になった投稿のブックマークアイコンをタップして保存しましょう"
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 px-1 font-mono">{posts.length}件のブックマーク</p>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              respected={respectedIds.has(post.id)}
              bookmarked={bookmarkedIds.has(post.id)}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </AppShell>
  )
}
