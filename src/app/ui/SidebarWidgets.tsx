import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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

async function getRecommendedUsers(currentUserId: string): Promise<{ id: string; name: string; followers: number }[]> {
  const supabase = await createClient()

  // Get users the current user already follows
  const { data: myFollows } = await supabase
    .from('follows').select('following_id').eq('follower_id', currentUserId)
  const followingIds = new Set((myFollows ?? []).map((f) => f.following_id))
  followingIds.add(currentUserId)

  // Get top follower counts from profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .limit(30)

  if (!profiles?.length) return []

  const profileIds = profiles.map((p) => p.id).filter((id) => !followingIds.has(id))
  if (!profileIds.length) return []

  const { data: followerCounts } = await supabase
    .from('follows')
    .select('following_id')
    .in('following_id', profileIds)

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

export default async function SidebarWidgets({ currentUserId }: { currentUserId: string }) {
  const [trending, recommended] = await Promise.all([
    getTrendingHashtags(),
    getRecommendedUsers(currentUserId),
  ])

  return (
    <aside className="hidden xl:block w-72 shrink-0 space-y-4">
      {/* Trending hashtags */}
      {trending.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">トレンドタグ 🔥</p>
          <div className="space-y-2">
            {trending.map(({ tag, count }, i) => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}
                className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg px-2 py-1.5 -mx-2 transition">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-4 font-mono">{i + 1}</span>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500">{tag}</span>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500">{count}件</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommended users */}
      {recommended.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">おすすめユーザー 👥</p>
          <div className="space-y-3">
            {recommended.map(({ id, name, followers }) => (
              <div key={id} className="flex items-center gap-3">
                <Link href={`/profile/${id}`} className="flex items-center gap-2.5 flex-1 min-w-0 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">{name}</p>
                    <p className="text-xs text-slate-400">{followers}フォロワー</p>
                  </div>
                </Link>
                <Link href={`/profile/${id}`}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium px-2.5 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 transition shrink-0">
                  見る
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer links */}
      <div className="px-2 flex flex-wrap gap-x-3 gap-y-1">
        {[['利用規約', '/terms'], ['プライバシー', '/privacy']].map(([label, href]) => (
          <Link key={href} href={href} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
            {label}
          </Link>
        ))}
        <span className="text-xs text-slate-300 dark:text-slate-700">© 2026 DevHub</span>
      </div>
    </aside>
  )
}
