import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PostCard, { type Post } from '@/app/ui/PostCard'

export const metadata = { title: '検索' }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const displayName = user.user_metadata?.display_name ?? user.email ?? ''
  const trimmed = q?.trim() ?? ''

  let posts: Post[] = []
  let myRespectedIds = new Set<string>()

  if (trimmed) {
    const [{ data: results }, { data: myRespects }] = await Promise.all([
      supabase
        .from('posts')
        .select('id, content, author_name, user_id, created_at, progress, category, respects(count)')
        .or(`content.ilike.%${trimmed}%,author_name.ilike.%${trimmed}%`)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase.from('respects').select('post_id').eq('user_id', user.id),
    ])
    posts = (results ?? []) as Post[]
    myRespectedIds = new Set((myRespects ?? []).map((r) => r.post_id))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/40 group-hover:bg-indigo-400 transition">
              <span className="text-white font-black text-xs">{'</>'}</span>
            </div>
            <span className="text-lg font-black text-white tracking-tight hidden sm:block">DevHub</span>
          </Link>

          {/* Search bar in header */}
          <form action="/search" method="get" className="flex-1">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="投稿・ユーザーを検索..."
              autoFocus
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </form>

          <Link
            href="/profile"
            className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm"
          >
            {displayName[0]?.toUpperCase() ?? '?'}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {!trimmed ? (
          <div className="text-center text-slate-400 text-sm py-16 bg-white rounded-2xl border border-slate-100">
            <div className="text-3xl mb-3">🔍</div>
            キーワードを入力して検索してください
          </div>
        ) : posts.length > 0 ? (
          <>
            <p className="text-xs text-slate-500 px-1">
              「{trimmed}」の検索結果 — {posts.length}件
            </p>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                respected={myRespectedIds.has(post.id)}
                currentUserId={user.id}
              />
            ))}
          </>
        ) : (
          <div className="text-center text-slate-400 text-sm py-16 bg-white rounded-2xl border border-slate-100">
            「{trimmed}」に一致する投稿が見つかりませんでした
          </div>
        )}
      </main>
    </div>
  )
}
