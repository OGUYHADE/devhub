import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BOARD_CATEGORIES, BOARD_CATEGORY_META } from './constants'
import AppShell from '@/app/ui/shell/AppShell'
import PageHeader from '@/app/ui/shell/PageHeader'

export const metadata = { title: '掲示板' }

export default async function BoardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: threads }, { count: unreadNotifs }] = await Promise.all([
    supabase.from('board_threads').select('category, created_at, id').order('created_at', { ascending: false }),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
  ])

  const countByCategory = Object.fromEntries(
    BOARD_CATEGORIES.map((cat) => [cat, (threads ?? []).filter((t) => t.category === cat).length])
  )
  const latestByCategory = Object.fromEntries(
    BOARD_CATEGORIES.map((cat) => {
      const latest = (threads ?? []).find((t) => t.category === cat)
      return [cat, latest?.created_at ?? null]
    })
  )

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0} showRightSidebar={false}>
      <PageHeader title="掲示板" backHref="/">
        <Link href="/board/new"
          className="text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1.5 rounded-full hover:glow-purple-sm transition font-semibold shrink-0 active:scale-95">
          + 作成
        </Link>
      </PageHeader>

      <p className="text-xs text-slate-500 px-1 mb-3 font-mono">// カテゴリを選んでスレッドを閲覧・投稿</p>

      <div className="space-y-3">
        {BOARD_CATEGORIES.map((cat) => {
          const meta = BOARD_CATEGORY_META[cat]
          const count = countByCategory[cat] ?? 0
          const latest = latestByCategory[cat]
          return (
            <Link key={cat} href={`/board/${encodeURIComponent(cat)}`}
              className="card-glow flex items-center gap-4 bg-gradient-to-br from-dark-surface to-dark-elevated rounded-2xl border border-dark-border/60 p-5 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-2xl bg-accent-purple/15 border border-accent-purple/20 flex items-center justify-center text-2xl shrink-0">
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base text-white group-hover:text-accent-purple-light transition">{cat}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {count}スレッド
                  {latest && ` · ${new Date(latest).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}`}
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 group-hover:text-accent-purple transition shrink-0">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          )
        })}
      </div>
    </AppShell>
  )
}
