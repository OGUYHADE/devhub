import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CATEGORY_STYLE, type Category } from '@/lib/categories'

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

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const displayName = user.user_metadata?.display_name ?? user.email ?? 'ユーザー'

  const { data: posts } = await supabase
    .from('posts')
    .select('id, content, author_name, created_at, progress, category, respects(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const safePosts: Post[] = posts ?? []
  const totalPosts = safePosts.length
  const totalRespects = safePosts.reduce((sum, p) => sum + (p.respects?.[0]?.count ?? 0), 0)

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
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800"
          >
            <span>←</span>
            <span>フィード</span>
          </Link>
        </div>
      </header>

      {/* Profile hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 pb-14 pt-10">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-3xl mx-auto mb-4 shadow-2xl shadow-indigo-500/40 ring-4 ring-slate-700">
            {displayName[0]?.toUpperCase() ?? '?'}
          </div>
          <h1 className="text-2xl font-black text-white mb-8">{displayName}</h1>

          <div className="inline-flex gap-8 bg-slate-800/60 rounded-2xl px-8 py-4 border border-slate-700/50">
            <div className="text-center">
              <div className="text-2xl font-black text-white">{totalPosts}</div>
              <div className="text-xs text-slate-400 mt-0.5">投稿</div>
            </div>
            <div className="w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-black text-white">{totalRespects}</div>
              <div className="text-xs text-slate-400 mt-0.5">リスペクト</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 -mt-6 pb-12 space-y-4">
        {safePosts.length > 0 ? (
          safePosts.map((post) => {
            const respectCount = post.respects?.[0]?.count ?? 0
            const catStyle = post.category ? CATEGORY_STYLE[post.category as Category] : null
            return (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 p-5 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-slate-400">
                    {new Date(post.created_at).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
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
                        className="h-full rounded-full"
                        style={{ width: `${post.progress}%`, backgroundColor: progressColor(post.progress) }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center pt-2 border-t border-slate-50">
                  <span className="flex items-center gap-1.5 text-sm text-slate-400 px-3 py-1.5">
                    <span>👊</span>
                    <span className="font-medium tabular-nums">{respectCount}</span>
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center text-slate-400 text-sm py-16 bg-white rounded-2xl border border-slate-100">
            まだ投稿がありません
          </div>
        )}
      </main>
    </div>
  )
}
