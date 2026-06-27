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
  if (value >= 67)  return '#6366f1'
  if (value >= 34)  return '#f59e0b'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">DevHub</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {user?.user_metadata?.display_name ?? user?.email}
            </span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 transition">
                ログアウト
              </button>
            </form>
          </div>
        </div>

        {/* カテゴリフィルター */}
        <div className="max-w-2xl mx-auto px-4 pb-2 flex gap-1.5 overflow-x-auto">
          <Link
            href="/"
            className={`shrink-0 text-xs px-3 py-1 rounded-full transition
              ${!activeCategory
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:bg-gray-100'
              }`}
          >
            すべて
          </Link>
          {CATEGORIES.map((cat) => {
            const style = CATEGORY_STYLE[cat]
            const active = activeCategory === cat
            return (
              <Link
                key={cat}
                href={active ? '/' : `/?category=${encodeURIComponent(cat)}`}
                className={`shrink-0 text-xs px-3 py-1 rounded-full transition
                  ${active
                    ? `${style.bg} ${style.text} font-medium`
                    : 'text-gray-500 hover:bg-gray-100'
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
              <div key={post.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                      {(post.author_name ?? '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{post.author_name}</p>
                      <p className="text-xs text-gray-400">
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
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catStyle.bg} ${catStyle.text}`}>
                      {post.category}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-800 whitespace-pre-wrap mb-3">
                  {post.content}
                </p>

                {post.progress !== null && (
                  <div className="mb-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">進捗</span>
                      <span className="text-xs font-semibold" style={{ color: progressColor(post.progress) }}>
                        {post.progress}%{post.progress === 100 && ' 完了！'}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${post.progress}%`, backgroundColor: progressColor(post.progress) }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <RespectButton postId={post.id} initialCount={respectCount} initialRespected={respected} />
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center text-gray-400 text-sm py-12">
            {activeCategory ? `「${activeCategory}」の投稿はまだありません` : 'まだ投稿がありません。最初の進捗を共有しましょう！'}
          </div>
        )}
      </main>
    </div>
  )
}
