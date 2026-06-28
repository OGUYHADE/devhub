import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BOARD_CATEGORIES, BOARD_CATEGORY_META, type BoardCategory } from '../constants'
import AppShell from '@/app/ui/shell/AppShell'
import PageHeader from '@/app/ui/shell/PageHeader'
import { timeAgo } from '@/lib/timeago'

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  return { title: `${decodeURIComponent(category)} | 掲示板` }
}

export default async function BoardCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ sort?: string }>
}) {
  const { category: rawCategory } = await params
  const { sort } = await searchParams
  const category = decodeURIComponent(rawCategory) as BoardCategory

  if (!BOARD_CATEGORIES.includes(category)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const meta = BOARD_CATEGORY_META[category]

  const [{ data: threads }, { count: unreadNotifs }] = await Promise.all([
    supabase
      .from('board_threads')
      .select('id, title, author_name, user_id, created_at, solved, pinned, board_replies(count)')
      .eq('category', category)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
  ])

  const sorted = sort === 'popular'
    ? [...(threads ?? [])].sort((a, b) => (b.board_replies?.[0]?.count ?? 0) - (a.board_replies?.[0]?.count ?? 0))
    : (threads ?? [])

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0} showRightSidebar={false}>
      <PageHeader title={`${meta.icon} ${category}`} backHref="/board">
        <Link href="/board/new"
          className="text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1.5 rounded-full hover:glow-purple-sm transition font-semibold shrink-0 active:scale-95">
          + 投稿
        </Link>
      </PageHeader>

      {/* Sort tabs */}
      <div className="flex gap-1 mb-4">
        {[{ key: undefined, label: '新着' }, { key: 'popular', label: '人気' }].map(({ key, label }) => (
          <Link key={label} href={key ? `?sort=${key}` : `?`}
            className={`text-xs px-3 py-1 rounded-full font-medium transition ${
              sort === key ? 'bg-accent-purple/20 text-accent-purple-light border border-accent-purple/30' : 'text-slate-500 hover:text-slate-300 hover:bg-dark-hover'
            }`}>
            {label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-16 bg-dark-surface rounded-2xl border border-dark-border/60">
            <div className="text-3xl mb-3">{meta.icon}</div>
            <p className="font-medium">まだスレッドがありません</p>
            <Link href="/board/new" className="inline-block mt-4 text-sm text-accent-purple-light hover:text-accent-purple font-medium">
              スレッドを作成 →
            </Link>
          </div>
        ) : sorted.map((thread) => {
          const replyCount = thread.board_replies?.[0]?.count ?? 0
          return (
            <Link key={thread.id} href={`/board/thread/${thread.id}`}
              className="card-glow block bg-gradient-to-br from-dark-surface to-dark-elevated rounded-2xl border border-dark-border/60 p-4 transition-all duration-200 group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {thread.pinned && <span className="text-xs text-amber-500">📌</span>}
                    {thread.solved && (
                      <span className="text-xs bg-accent-emerald/15 text-accent-emerald px-2 py-0.5 rounded-full font-semibold border border-accent-emerald/30">解決済み</span>
                    )}
                    <h2 className="text-sm font-semibold text-white group-hover:text-accent-purple-light transition line-clamp-2">
                      {thread.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>{thread.author_name}</span>
                    <span>·</span>
                    <span>{timeAgo(thread.created_at)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {replyCount}
                    </span>
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 group-hover:text-accent-purple shrink-0 mt-1 transition">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </AppShell>
  )
}
