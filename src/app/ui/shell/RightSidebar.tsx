import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SearchBox from './SearchBox'
import FollowButton from '../FollowButton'

async function getTrendingHashtags(): Promise<{ tag: string; count: number }[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('posts')
    .select('content')
    .eq('is_public', true)
    .gte('created_at', since)
    .limit(200)

  const counts = new Map<string, number>()
  for (const post of data ?? []) {
    const matches = post.content.match(/#[\w぀-鿿＀-￯]+/g) ?? []
    for (const tag of matches) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }))
}

async function getRecommendedUsers(
  currentUserId: string
): Promise<{ id: string; name: string; followers: number }[]> {
  const supabase = await createClient()

  const { data: myFollows } = await supabase
    .from('follows').select('following_id').eq('follower_id', currentUserId)
  const followingIds = new Set((myFollows ?? []).map((f) => f.following_id))
  followingIds.add(currentUserId)

  const { data: profiles } = await supabase
    .from('profiles').select('id, display_name').limit(30)
  if (!profiles?.length) return []

  const profileIds = profiles.map((p) => p.id).filter((id) => !followingIds.has(id))
  if (!profileIds.length) return []

  const { data: followerCounts } = await supabase
    .from('follows').select('following_id').in('following_id', profileIds)

  const counts = new Map<string, number>()
  for (const row of followerCounts ?? []) {
    counts.set(row.following_id, (counts.get(row.following_id) ?? 0) + 1)
  }

  return profileIds
    .map((id) => {
      const prof = profiles.find((p) => p.id === id)
      return { id, name: prof?.display_name ?? 'ユーザー', followers: counts.get(id) ?? 0 }
    })
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 3)
}

function handle(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 14) || 'dev'
}

export default async function RightSidebar({ currentUserId }: { currentUserId: string }) {
  const [trending, recommended] = await Promise.all([
    getTrendingHashtags(),
    getRecommendedUsers(currentUserId),
  ])

  return (
    <aside className="hidden lg:flex flex-col sticky top-0 h-screen shrink-0 w-[320px] bg-dark-surface/60 backdrop-blur-xl border-l border-dark-border/50 px-5 py-5 gap-5 overflow-y-auto">
      <SearchBox />

      {/* Trending */}
      <div className="bg-dark-elevated/60 rounded-2xl border border-dark-border/50 p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
          <span className="text-accent-purple font-mono">#</span> トレンド
        </h3>
        {trending.length > 0 ? (
          <ul className="space-y-1">
            {trending.map(({ tag, count }, i) => (
              <li key={tag}>
                <Link
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="flex items-center justify-between group rounded-lg px-2 py-1.5 -mx-2 hover:bg-dark-hover transition"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-slate-600 font-mono w-3">{i + 1}</span>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-accent-purple-light truncate">
                      {tag}
                    </span>
                  </span>
                  <span className="text-xs text-accent-cyan font-mono shrink-0">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-600">まだトレンドがありません</p>
        )}
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <div className="bg-dark-elevated/60 rounded-2xl border border-dark-border/50 p-4">
          <h3 className="text-sm font-bold text-white mb-3">おすすめユーザー</h3>
          <ul className="space-y-3">
            {recommended.map((u) => (
              <li key={u.id} className="flex items-center gap-2.5">
                <Link href={`/profile/${u.id}`} className="flex items-center gap-2.5 flex-1 min-w-0 group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {u.name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white truncate transition">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-600 font-mono truncate">@{handle(u.name)}</p>
                  </div>
                </Link>
                <FollowButton targetUserId={u.id} initialFollowing={false} size="sm" />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 px-1 text-xs text-slate-600">
        <Link href="/terms" className="hover:text-slate-400 transition">利用規約</Link>
        <Link href="/privacy" className="hover:text-slate-400 transition">プライバシー</Link>
        <span className="font-mono">© 2026 DevHub</span>
      </div>
    </aside>
  )
}
