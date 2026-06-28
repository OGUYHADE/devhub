import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PostCard from '@/app/ui/PostCard'
import AppShell from '@/app/ui/shell/AppShell'
import PageHeader from '@/app/ui/shell/PageHeader'
import EmptyState from '@/app/ui/EmptyState'
import { SearchIcon } from '@/app/ui/icons'
import type { Post } from '@/lib/types'

export const metadata = { title: '検索' }

const POST_SELECT =
  'id, content, author_name, user_id, created_at, progress, category, github_url, demo_url, pinned, is_public, view_count, image_url, tech_stack, quoted_post_id, quoted_post:quoted_post_id(id,content,author_name,user_id), respects(count), comments(count)'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const trimmed = q?.trim() ?? ''

  let posts: Post[] = []
  let myRespectedIds = new Set<string>()
  let myBookmarkedIds = new Set<string>()

  const { count: unreadNotifs } = await supabase
    .from('notifications').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('read', false)

  if (trimmed) {
    const [{ data: results }, { data: myRespects }, { data: myBookmarks }] = await Promise.all([
      supabase
        .from('posts')
        .select(POST_SELECT)
        .or(`content.ilike.%${trimmed}%,author_name.ilike.%${trimmed}%`)
        .or(`is_public.eq.true,user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase.from('respects').select('post_id').eq('user_id', user.id),
      supabase.from('bookmarks').select('post_id').eq('user_id', user.id),
    ])
    posts = (results ?? []) as unknown as Post[]
    myRespectedIds = new Set((myRespects ?? []).map((r) => r.post_id))
    myBookmarkedIds = new Set((myBookmarks ?? []).map((b) => b.post_id))
  }

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0} showRightSidebar={false}>
      <PageHeader title="探す" backHref="/" />

      <form action="/search" method="get" className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          <SearchIcon size={18} />
        </span>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="投稿・ユーザーを検索..."
          autoFocus
          className="w-full bg-dark-elevated rounded-full pl-12 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 border border-transparent focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/40 transition"
        />
      </form>

      {!trimmed ? (
        <EmptyState icon="rocket" title="キーワードを入力して検索" description="投稿の内容やユーザー名で検索できます" />
      ) : posts.length > 0 ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 px-1 font-mono">「{trimmed}」の検索結果 — {posts.length}件</p>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              respected={myRespectedIds.has(post.id)}
              bookmarked={myBookmarkedIds.has(post.id)}
              currentUserId={user.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon="rocket" title="見つかりませんでした" description={`「${trimmed}」に一致する投稿はありません`} />
      )}
    </AppShell>
  )
}
