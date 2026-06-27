import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'
import RespectButton from './ui/RespectButton'
import PostForm from './ui/PostForm'
import { CATEGORIES, CATEGORY_STYLE, type Category } from '@/lib/categories'

type Post = {
  id: string
  content: string
  author_name: string
  created_at: string
  progress: number | null
  category: string | null
  respects: { count: number }[]
}

function progressColor(value: number) {
  if (value === 100) return '#22c55e'
  if (value >= 67) return '#6366f1'
  if (value >= 34) return '#f59e0b'
  return '#f97316'
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: activeCategory } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('posts')
    .select('id, content, author_name, created_at, progress, category, respects(count)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (activeCategory) {
    query = query.eq('category', activeCategory)
  }

  const [{ data: posts }, { data: myRespects }] = await Promise.all([
    query,
    supabase.from('respects').select('post_id').eq('user_id', user!.id),
  ])

  const respectedPostIds = new Set((myRespects ?? []).map((r) => r.post_id))
  const displayName = user?.user_metadata?.display_name ?? user?.email ?? ''

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/40 group-hover:bg-indigo-400 transition">
              <span className="text-white font-black text-xs">{'</>'}</span>
            </div>
            <span className="text-lg font-black text-white tracking-tight">DevHub</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition px-2 py-1.5 rounded-lg hover:bg-slate-800"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {displayName[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-sm hidden sm:block">{displayName}</span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
          <Link
            href="/"
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition font-medium
              ${!activeCategory
                ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            すべて
          </Link>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat
            return (
              <Link
                key={cat}
                href={active ? '/' : `/?category=${encodeURIComponent(cat)}`}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition font-medium
                  ${active
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {cat}
              </Link>
            )
          })}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <PostForm />

        {posts && posts.length > 0 ? (
          posts.map((post: Post) => {
            const respectCount = post.respects?.[0]?.count ?? 0
            const respected = respectedPostIds.has(post.id)
            const catStyle = post.category ? CATEGORY_STYLE[post.category as Category] : null
            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 p-5 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                      {(post.author_name ?? '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{post.author_name}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(post.created_at).toLocaleString('ja-JP', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {catStyle && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${catStyle.bg} ${catStyle.text}`}>
                      {post.category}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4 leading-relaxed">
                  {post.content}
                </p>

                {post.progress !== null && (
                  <div className="mb-4 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-500">進捗</span>
                      <span className="text-xs font-bold" style={{ color: progressColor(post.progress) }}>
                        {post.progress}%{post.progress === 100 && ' 🎉'}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${post.progress}%`, backgroundColor: progressColor(post.progress) }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center pt-2 border-t border-slate-50">
                  <RespectButton postId={post.id} initialCount={respectCount} initialRespected={respected} />
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center text-slate-400 text-sm py-16 bg-white rounded-2xl border border-slate-100">
            {activeCategory
              ? `「${activeCategory}」の投稿はまだありません`
              : 'まだ投稿がありません。最初の進捗を共有しましょう！'}
          </div>
        )}
      </main>
    </div>
  )
}
