import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'
import PostForm from './ui/PostForm'
import PostCard, { type Post } from './ui/PostCard'
import { CATEGORIES, type Category } from '@/lib/categories'

const FEED_LIMIT = 20

function buildUrl(params: { sort?: string; category?: string; page?: number }) {
  const p = new URLSearchParams()
  if (params.sort) p.set('sort', params.sort)
  if (params.category) p.set('category', params.category)
  if (params.page && params.page > 1) p.set('page', String(params.page))
  const qs = p.toString()
  return qs ? `/?${qs}` : '/'
}

// ── Landing page for unauthenticated visitors ────────────────────────────────
function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/40">
              <span className="text-white font-black text-sm">{'</>'}</span>
            </div>
            <span className="text-xl font-black text-white tracking-tight">DevHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition">
              ログイン
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-400 transition font-semibold shadow-sm shadow-indigo-500/30"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <span>✨</span>
            <span>個人開発者のためのコミュニティ</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 leading-tight">
            個人開発の進捗を、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              シェアしよう。
            </span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto">
            今日作ったもの、学んだこと、詰まったこと。<br />
            毎日のアウトプットが、あなたの成長を証明する。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-base font-bold hover:bg-indigo-500 transition shadow-xl shadow-indigo-500/30"
            >
              無料で始める →
            </Link>
            <Link
              href="/login"
              className="bg-slate-800 text-slate-300 px-8 py-3.5 rounded-2xl text-base font-semibold hover:bg-slate-700 transition border border-slate-700"
            >
              ログインする
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-black text-slate-800 text-center mb-14">
          開発者のための、開発者による
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '📊', title: '進捗を可視化', desc: 'プロジェクトの進捗をバーで表現。毎日の積み重ねが一目でわかる。' },
            { icon: '👊', title: 'リスペクトで応援', desc: '仲間の頑張りを👊で応援しよう。あなたのリスペクトが誰かのモチベーションになる。' },
            { icon: '🏷️', title: 'カテゴリで整理', desc: 'Web / アプリ / ゲーム / AI/ML。自分のジャンルで投稿を整理・発見できる。' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-900 py-20 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">今日から始めよう</h2>
          <p className="text-slate-400 text-base mb-8">アカウント登録は無料。30秒でスタートできる。</p>
          <Link href="/signup" className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-500 transition shadow-xl shadow-indigo-500/30">
            無料で始める →
          </Link>
        </div>
      </div>

      <footer className="bg-slate-950 py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-black">{'</>'}</span>
            <span className="text-slate-600 font-bold text-sm">DevHub</span>
          </div>
          <p className="text-slate-700 text-xs">© 2025 DevHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

// ── Feed page for authenticated users ────────────────────────────────────────
export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; page?: string }>
}) {
  const { category: activeCategory, sort, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr ?? 1))

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <LandingPage />

  // For respect/trend sorts we skip pagination and sort in JS
  const usePagination = !sort || sort === 'new'
  const offset = usePagination ? (page - 1) * FEED_LIMIT : 0

  let query = supabase
    .from('posts')
    .select('id, content, author_name, user_id, created_at, progress, category, respects(count)')

  if (activeCategory) query = query.eq('category', activeCategory)
  if (sort === 'trend') {
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    query = query.gte('created_at', since)
  }

  query = query.order('created_at', { ascending: false })

  if (usePagination) {
    query = query.range(offset, offset + FEED_LIMIT - 1)
  } else {
    query = query.limit(50)
  }

  const [{ data: rawPosts }, { data: myRespects }] = await Promise.all([
    query,
    supabase.from('respects').select('post_id').eq('user_id', user.id),
  ])

  let posts: Post[] = (rawPosts ?? []) as Post[]
  if (sort === 'respect' || sort === 'trend') {
    posts = [...posts].sort(
      (a, b) => (b.respects?.[0]?.count ?? 0) - (a.respects?.[0]?.count ?? 0)
    )
  }

  const respectedPostIds = new Set((myRespects ?? []).map((r) => r.post_id))
  const displayName = user.user_metadata?.display_name ?? user.email ?? ''
  const hasMore = usePagination && posts.length === FEED_LIMIT

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 sticky top-0 z-10">
        {/* Brand + user nav */}
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/40 group-hover:bg-indigo-400 transition">
              <span className="text-white font-black text-xs">{'</>'}</span>
            </div>
            <span className="text-lg font-black text-white tracking-tight">DevHub</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/search"
              className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
              aria-label="検索"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </Link>
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
              <button type="submit" className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-slate-800">
                ログアウト
              </button>
            </form>
          </div>
        </div>

        {/* Category filter */}
        <div className="max-w-2xl mx-auto px-4 pb-2.5 flex gap-1.5 overflow-x-auto scrollbar-hide">
          <Link
            href={buildUrl({ sort, category: undefined })}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition font-medium
              ${!activeCategory ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            すべて
          </Link>
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat
            return (
              <Link
                key={cat}
                href={active ? buildUrl({ sort, category: undefined }) : buildUrl({ sort, category: cat })}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full transition font-medium
                  ${active ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                {cat}
              </Link>
            )
          })}
        </div>

        {/* Sort tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-2.5 flex gap-0.5 border-t border-slate-800/60 pt-2">
          {(
            [
              { key: undefined, label: '新着' },
              { key: 'respect', label: '人気' },
              { key: 'trend', label: 'トレンド（48h）' },
            ] as { key: string | undefined; label: string }[]
          ).map(({ key, label }) => {
            const active = sort === key
            return (
              <Link
                key={label}
                href={buildUrl({ sort: key, category: activeCategory })}
                className={`text-xs px-3 py-1 rounded-full transition font-medium
                  ${active ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {page === 1 && <PostForm />}

        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                respected={respectedPostIds.has(post.id)}
                currentUserId={user.id}
              />
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              {page > 1 ? (
                <Link
                  href={buildUrl({ sort, category: activeCategory, page: page - 1 })}
                  className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                >
                  ← 前へ
                </Link>
              ) : (
                <div />
              )}
              {hasMore && (
                <Link
                  href={buildUrl({ sort, category: activeCategory, page: page + 1 })}
                  className="text-sm text-slate-600 hover:text-slate-800 px-6 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition font-medium"
                >
                  もっと見る →
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-slate-400 text-sm py-16 bg-white rounded-2xl border border-slate-100">
            {activeCategory
              ? `「${activeCategory}」の投稿はまだありません`
              : sort === 'trend'
              ? '過去48時間にトレンドの投稿がありません'
              : 'まだ投稿がありません。最初の進捗を共有しましょう！'}
          </div>
        )}
      </main>
    </div>
  )
}
