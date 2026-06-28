import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/app/ui/shell/AppShell'
import PageHeader from '@/app/ui/shell/PageHeader'
import { toHandle } from '@/lib/handle'

export const metadata = { title: 'ランキング' }

type RankedUser = {
  userId: string
  name: string
  respects: number
  posts: number
}

const PERIOD_LABELS: Record<string, string> = {
  week: '今週',
  month: '今月',
  all: '全期間',
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period = 'all' } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  let query = supabase.from('posts').select('user_id, author_name, respects(count)')
  if (period === 'week') {
    query = query.gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
  } else if (period === 'month') {
    query = query.gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
  }

  const [{ data: posts }, { count: unreadNotifs }] = await Promise.all([
    query.limit(1000),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
  ])

  const userMap = new Map<string, RankedUser>()
  for (const post of posts ?? []) {
    const rc = (post.respects as { count: number }[])?.[0]?.count ?? 0
    const existing = userMap.get(post.user_id)
    if (existing) {
      existing.respects += rc
      existing.posts++
    } else {
      userMap.set(post.user_id, { userId: post.user_id, name: post.author_name, respects: rc, posts: 1 })
    }
  }

  const rankings = [...userMap.values()].sort((a, b) => b.respects - a.respects).slice(0, 20)
  const myRank = rankings.findIndex((r) => r.userId === user.id)
  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0} showRightSidebar={false}>
      <PageHeader title="ランキング" backHref="/">
        <div className="flex gap-1 shrink-0">
          {(['week', 'month', 'all'] as const).map((p) => (
            <Link key={p} href={`/ranking?period=${p}`}
              className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                period === p
                  ? 'bg-accent-purple/20 text-accent-purple-light border border-accent-purple/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-dark-hover'
              }`}>
              {PERIOD_LABELS[p]}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="space-y-3">
        {myRank >= 0 && (
          <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-2xl px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-accent-purple-light font-semibold">あなたの順位</span>
            <span className="text-lg font-black text-accent-purple-light">{myRank + 1}位 / {rankings.length}人中</span>
          </div>
        )}

        {rankings.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-20 bg-dark-surface rounded-2xl border border-dark-border/60">
            <div className="text-4xl mb-3">🏆</div>
            <p className="font-medium">まだデータがありません</p>
          </div>
        ) : (
          <div className="bg-dark-surface rounded-2xl border border-dark-border/60 overflow-hidden divide-y divide-dark-border/40">
            {rankings.map((r, i) => (
              <Link
                key={r.userId}
                href={r.userId === user.id ? '/profile' : `/profile/${r.userId}`}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-dark-hover transition-colors ${r.userId === user.id ? 'bg-accent-purple/5' : ''}`}
              >
                <div className="w-8 text-center shrink-0">
                  {i < 3 ? <span className="text-2xl">{MEDALS[i]}</span> : <span className="text-base font-black text-slate-600 font-mono">{i + 1}</span>}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                  {r.name[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${r.userId === user.id ? 'text-accent-purple-light' : 'text-white'}`}>
                    {r.name}
                    {r.userId === user.id && <span className="ml-1.5 text-xs font-normal text-accent-purple">（あなた）</span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">@{toHandle(r.name)} · {r.posts}投稿</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-accent-pink">{r.respects.toLocaleString()}</div>
                  <div className="text-xs text-slate-500">リスペクト</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-600 text-center pt-2 font-mono">// 最大1000件の投稿から集計</p>
      </div>
    </AppShell>
  )
}
