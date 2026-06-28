import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PostForm from './ui/PostForm'
import RealtimeFeed from './ui/RealtimeFeed'
import AnnouncementBanner from './ui/AnnouncementBanner'
import InfiniteScrollFeed, { type PostWithReactions } from './ui/InfiniteScrollFeed'
import AppShell from './ui/shell/AppShell'
import EmptyState from './ui/EmptyState'
import { CATEGORIES } from '@/lib/categories'
import type { Post, ReactionData } from '@/lib/types'

const FEED_LIMIT = 20

function buildUrl(params: { sort?: string; category?: string }) {
  const p = new URLSearchParams()
  if (params.sort) p.set('sort', params.sort)
  if (params.category) p.set('category', params.category)
  const qs = p.toString()
  return qs ? `/?${qs}` : '/'
}

const MOCK_POSTS = [
  {
    name: 'たろう',
    handle: 'taro_dev',
    time: '2分前',
    content: 'ポートフォリオサイトをNext.jsで作り直し中。ダークモード対応がやっと完了した！🎨 次はアニメーション周り。',
    category: 'Web開発',
    progress: 70,
    reactions: [{ emoji: '🔥', count: 12 }, { emoji: '👍', count: 8 }],
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'みさき',
    handle: 'misaki',
    time: '1時間前',
    content: '個人開発のSaaS、ついに初課金が入った…！半年間コツコツ作ってきてよかった。泣きそう😭 #個人開発',
    category: '個人開発',
    progress: 100,
    reactions: [{ emoji: '🎉', count: 24 }, { emoji: '🔥', count: 15 }],
    color: 'from-pink-500 to-rose-600',
  },
  {
    name: 'けん',
    handle: 'ken_codes',
    time: '3時間前',
    content: 'Rustの所有権でまた詰まってる…。借用チェッカーと格闘する毎日。でも楽しい。誰か助けて〜',
    category: '学習',
    progress: 30,
    reactions: [{ emoji: '💡', count: 6 }, { emoji: '👍', count: 4 }],
    color: 'from-cyan-500 to-blue-600',
  },
]

function progressColorLanding(value: number) {
  if (value === 100) return '#10b981'
  if (value >= 67) return '#7c3aed'
  if (value >= 34) return '#06b6d4'
  return '#ec4899'
}

function MockPostCard({ post }: { post: (typeof MOCK_POSTS)[number] }) {
  return (
    <div className="card-glow bg-gradient-to-br from-dark-surface to-dark-elevated rounded-2xl border border-dark-border/60 p-5 text-left">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${post.color} flex items-center justify-center text-white font-bold shadow-sm shrink-0`}>
            {post.name[0]}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-base truncate">{post.name}</p>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-mono text-sm">@{post.handle}</span>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-slate-600">{post.time}</span>
            </div>
          </div>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-accent-purple/20 text-accent-purple-light border border-accent-purple/30 shrink-0">
          # {post.category}
        </span>
      </div>
      <p className="text-[15px] text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-slate-500">進捗</span>
          <span className="text-xs font-bold font-mono" style={{ color: progressColorLanding(post.progress) }}>
            {post.progress}%{post.progress === 100 && ' 🎉'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-dark-border overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${post.progress}%`, backgroundColor: progressColorLanding(post.progress) }} />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3 mt-3 border-t border-dark-border/50">
        {post.reactions.map((r) => (
          <span key={r.emoji} className="flex items-center gap-1 text-xs bg-dark-elevated border border-dark-border rounded-full px-2.5 py-1 text-slate-300">
            <span>{r.emoji}</span>
            <span className="font-mono tabular-nums">{r.count}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-slate-100">
      <header className="border-b border-dark-border/50 bg-dark-surface/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-accent-purple">D</span>evHub
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition">
              ログイン
            </Link>
            <Link href="/signup"
              className="text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-full hover:glow-purple transition font-semibold active:scale-95">
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden py-28 px-4">
        <div className="absolute inset-0 grid-overlay opacity-30" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-purple/20 rounded-full blur-[120px]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple-light text-xs font-semibold px-4 py-2 rounded-full mb-8 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
            個人開発者のためのコミュニティ
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 leading-tight">
            作ってるものを、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple-light via-accent-purple to-accent-cyan">
              見せ合おう。
            </span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto">
            毎日の進捗・作品・悩みをシェアして、<br className="hidden sm:block" />
            同じ熱量の開発者とつながるコミュニティ
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup"
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-3.5 rounded-full text-base font-bold hover:glow-purple transition active:scale-95">
              無料で始める →
            </Link>
            <a href="#preview"
              className="bg-transparent text-slate-300 px-8 py-3.5 rounded-full text-base font-semibold hover:bg-dark-hover transition border border-dark-border active:scale-95">
              どんな場所か見る↓
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-black text-center mb-14">開発者のための、開発者による</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: '🚀', title: '進捗シェア', desc: '今日作ったものを投稿して記録に残す。積み重ねが成長の証になる。' },
            { icon: '🤝', title: 'つながる', desc: 'リスペクト・コメント・フォローで開発者同士が繋がる。' },
            { icon: '🌳', title: 'みんなの広場', desc: 'アバターで集まるユニークなコミュニティスペース。' },
          ].map((f) => (
            <div key={f.title}
              className="card-glow bg-gradient-to-br from-dark-surface to-dark-elevated rounded-2xl border border-dark-border/60 p-8 text-center transition-all duration-200">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SNS-style preview */}
      <div id="preview" className="scroll-mt-20 border-t border-dark-border/50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">こんな投稿が毎日流れています</h2>
            <p className="text-slate-400 text-base">進捗も、喜びも、つまずきも。リアルな開発の日々をのぞいてみよう。</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MOCK_POSTS.map((post) => (
              <MockPostCard key={post.handle} post={post} />
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-4 border-t border-dark-border/50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">今日から始めよう</h2>
          <p className="text-slate-400 text-base mb-8">アカウント登録は無料。30秒でスタートできる。</p>
          <Link href="/signup"
            className="inline-block bg-gradient-to-r from-violet-600 to-purple-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:glow-purple transition active:scale-95">
            無料で始める →
          </Link>
        </div>
      </div>

      <footer className="border-t border-dark-border/50 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-600">
          <span className="font-bold text-sm">
            <span className="text-accent-purple">D</span>evHub
          </span>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/terms" className="hover:text-slate-400 transition">利用規約</Link>
            <Link href="/privacy" className="hover:text-slate-400 transition">プライバシーポリシー</Link>
            <span className="font-mono">© 2026 DevHub by ざりがにGAMES（@OGUYHADE）</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>
}) {
  const { category: activeCategory, sort } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <LandingPage />

  const isFollowingTab = sort === 'following'
  const useInfiniteScroll = !sort || sort === 'new' || sort === 'following'

  const POST_SELECT =
    'id, content, author_name, user_id, created_at, progress, category, github_url, demo_url, pinned, is_public, view_count, image_url, tech_stack, quoted_post_id, quoted_post:quoted_post_id(id,content,author_name,user_id), respects(count), comments(count)'

  let rawPosts: Post[] = []
  let noFollowsYet = false

  if (isFollowingTab) {
    const { data: followData } = await supabase
      .from('follows').select('following_id').eq('follower_id', user.id)
    const followingIds = (followData ?? []).map((f) => f.following_id)
    if (followingIds.length === 0) {
      noFollowsYet = true
    } else {
      const { data } = await supabase
        .from('posts').select(POST_SELECT)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .range(0, FEED_LIMIT - 1)
      rawPosts = (data ?? []) as unknown as Post[]
    }
  } else {
    let query = supabase.from('posts').select(POST_SELECT)
      .or(`is_public.eq.true,user_id.eq.${user.id}`)
    if (activeCategory) query = query.eq('category', activeCategory)
    if (sort === 'trend') {
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      query = query.gte('created_at', since)
    }
    query = query.order('created_at', { ascending: false })
    if (useInfiniteScroll) {
      query = query.range(0, FEED_LIMIT - 1)
    } else {
      query = query.limit(50)
    }
    const { data } = await query
    rawPosts = (data ?? []) as unknown as Post[]
  }

  // Sort client-side for respect/trend modes
  if (sort === 'respect' || sort === 'trend') {
    rawPosts = [...rawPosts].sort(
      (a, b) => (b.respects?.[0]?.count ?? 0) - (a.respects?.[0]?.count ?? 0)
    )
  }

  const postIds = rawPosts.map((p) => p.id)

  const [{ data: myRespects }, { data: myBookmarks }, { count: unreadNotifs }, { data: announcement }, { data: reactionData }] = await Promise.all([
    postIds.length > 0
      ? supabase.from('respects').select('post_id').eq('user_id', user.id).in('post_id', postIds)
      : Promise.resolve({ data: [] }),
    postIds.length > 0
      ? supabase.from('bookmarks').select('post_id').eq('user_id', user.id).in('post_id', postIds)
      : Promise.resolve({ data: [] }),
    supabase.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('read', false),
    supabase.from('announcements').select('content').eq('active', true)
      .order('created_at', { ascending: false }).limit(1).maybeSingle(),
    postIds.length > 0
      ? supabase.from('reactions').select('post_id, emoji, user_id').in('post_id', postIds)
      : Promise.resolve({ data: [] }),
  ])
  const notifCount = unreadNotifs ?? 0

  const respectedPostIds = new Set((myRespects ?? []).map((r) => r.post_id))
  const bookmarkedPostIds = new Set((myBookmarks ?? []).map((b) => b.post_id))

  const reactionsByPost: Record<string, ReactionData[]> = {}
  for (const r of reactionData ?? []) {
    if (!reactionsByPost[r.post_id]) reactionsByPost[r.post_id] = []
    const existing = reactionsByPost[r.post_id].find((x) => x.emoji === r.emoji)
    if (existing) {
      existing.count++
      if (r.user_id === user.id) existing.reactedByMe = true
    } else {
      reactionsByPost[r.post_id].push({ emoji: r.emoji, count: 1, reactedByMe: r.user_id === user.id })
    }
  }

  const postsWithReactions: PostWithReactions[] = rawPosts.map((p) => ({
    ...p,
    initialReactions: reactionsByPost[p.id] ?? [],
  }))

  const hasMore = useInfiniteScroll && rawPosts.length === FEED_LIMIT

  return (
    <AppShell currentUserId={user.id} notifCount={notifCount}>
      {announcement?.content && (
        <div className="mb-4">
          <AnnouncementBanner message={announcement.content} />
        </div>
      )}

      {/* Sort tabs */}
      <div className="sticky top-0 z-20 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 mb-4 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border/50">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {([
            { key: undefined, label: '新着' },
            { key: 'respect', label: '人気' },
            { key: 'trend', label: 'トレンド' },
            { key: 'following', label: 'フォロー中' },
          ] as { key: string | undefined; label: string }[]).map(({ key, label }) => (
            <Link key={label} href={buildUrl({ sort: key, category: activeCategory })}
              className={`shrink-0 text-sm px-4 py-1.5 rounded-full transition font-medium ${
                sort === key
                  ? 'bg-accent-purple/20 text-accent-purple-light border border-accent-purple/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-dark-hover'
              }`}>
              {label}
            </Link>
          ))}
        </div>
        {/* Category filter */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mt-2">
          <Link href={buildUrl({ sort, category: undefined })}
            className={`shrink-0 text-xs px-3 py-1 rounded-full transition font-medium ${
              !activeCategory ? 'bg-dark-elevated text-white border border-dark-border' : 'text-slate-500 hover:text-slate-300'
            }`}>
            すべて
          </Link>
          {CATEGORIES.map((cat) => (
            <Link key={cat}
              href={activeCategory === cat ? buildUrl({ sort, category: undefined }) : buildUrl({ sort, category: cat })}
              className={`shrink-0 text-xs px-3 py-1 rounded-full transition font-medium ${
                activeCategory === cat ? 'bg-dark-elevated text-white border border-dark-border' : 'text-slate-500 hover:text-slate-300'
              }`}>
              # {cat}
            </Link>
          ))}
        </div>
      </div>

      <RealtimeFeed />

      <PostForm />

      {noFollowsYet ? (
        <EmptyState
          icon="users"
          title="まだ誰もフォローしていません"
          description="投稿者名をクリックしてプロフィールを開き、気になる開発者をフォローしましょう"
        />
      ) : (
        <InfiniteScrollFeed
          initialPosts={postsWithReactions}
          initialRespectedIds={[...respectedPostIds]}
          initialBookmarkedIds={[...bookmarkedPostIds]}
          currentUserId={user.id}
          sort={sort}
          category={activeCategory}
          hasMore={hasMore}
        />
      )}
    </AppShell>
  )
}
