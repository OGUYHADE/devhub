import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type Category } from '@/lib/categories'
import { calculateStreak } from '@/lib/streak'
import { toHandle } from '@/lib/handle'
import { skillColor } from '@/lib/skillColors'
import { timeAgo } from '@/lib/timeago'
import ActivityGraph from '@/app/ui/ActivityGraph'
import FollowButton from '@/app/ui/FollowButton'
import AppShell from '@/app/ui/shell/AppShell'

function progressColor(value: number) {
  if (value === 100) return '#10b981'
  if (value >= 67) return '#7c3aed'
  if (value >= 34) return '#06b6d4'
  return '#ec4899'
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  if (userId === user.id) redirect('/profile')

  const [
    { data: profile },
    { data: posts },
    { count: followerCount },
    { count: followingCount },
    { data: myFollow },
    { count: unreadNotifs },
  ] = await Promise.all([
    supabase.from('profiles').select('display_name, bio, github_url, twitter_url, skills').eq('id', userId).maybeSingle(),
    supabase
      .from('posts')
      .select('id, content, author_name, created_at, progress, category, pinned, respects(count)')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', userId),
    supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', userId).maybeSingle(),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
  ])

  const safePosts = posts ?? []
  if (!profile && safePosts.length === 0) notFound()

  const displayName = profile?.display_name ?? safePosts[0]?.author_name ?? 'ユーザー'
  const bio = profile?.bio ?? ''
  const githubUrl = profile?.github_url ?? ''
  const twitterUrl = profile?.twitter_url ?? ''
  const skills: string[] = (profile?.skills as string[] | null) ?? []
  const isFollowing = !!myFollow

  const totalPosts = safePosts.length
  const postDates = safePosts.map((p) => p.created_at.slice(0, 10))
  const { current: streakCurrent, max: streakMax } = calculateStreak(postDates)

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0} showRightSidebar={false}>
      {/* Banner */}
      <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 grid-overlay opacity-20" />
      </div>

      <div className="px-1 -mt-12 mb-5">
        <div className="flex items-end justify-between mb-3">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl ring-4 ring-dark-bg">
            {displayName[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex items-center gap-2 mb-2">
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-dark-hover transition" title="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
                </svg>
              </a>
            )}
            {twitterUrl && (
              <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-dark-hover transition text-sm font-bold" title="X">𝕏</a>
            )}
            <FollowButton targetUserId={userId} initialFollowing={isFollowing} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white">{displayName}</h1>
        <p className="font-mono text-slate-500">@{toHandle(displayName)}</p>
        {bio && <p className="text-slate-400 leading-relaxed mt-2">{bio}</p>}

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skills.map((skill) => (
              <span key={skill} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${skillColor(skill)}`}>
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-6 mt-4">
          <div>
            <span className="text-xl font-bold text-accent-purple">{totalPosts}</span>
            <span className="text-sm text-slate-500 ml-1">投稿</span>
          </div>
          <Link href={`/profile/${userId}/followers`} className="hover:opacity-80 transition">
            <span className="text-xl font-bold text-accent-purple">{followerCount ?? 0}</span>
            <span className="text-sm text-slate-500 ml-1">フォロワー</span>
          </Link>
          <Link href={`/profile/${userId}/following`} className="hover:opacity-80 transition">
            <span className="text-xl font-bold text-accent-purple">{followingCount ?? 0}</span>
            <span className="text-sm text-slate-500 ml-1">フォロー</span>
          </Link>
          <div>
            <span className="text-xl font-bold text-accent-pink">{streakCurrent}🔥</span>
            <span className="text-sm text-slate-500 ml-1">連続</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-dark-surface rounded-2xl border border-dark-border/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">活動記録</p>
            <p className="text-xs text-slate-500">最長ストリーク <span className="font-bold text-accent-purple-light">{streakMax}日</span></p>
          </div>
          <ActivityGraph postDates={postDates} />
        </div>

        {safePosts.length > 0 ? (
          safePosts.map((post) => {
            const respectCount = post.respects?.[0]?.count ?? 0
            return (
              <div key={post.id}
                className="card-glow bg-gradient-to-br from-dark-surface to-dark-elevated rounded-2xl border border-dark-border/60 p-5 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{timeAgo(post.created_at)}</span>
                    {post.pinned && <span title="ピン留め">📌</span>}
                  </div>
                  {post.category && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-accent-purple/20 text-accent-purple-light border border-accent-purple/30">
                      # {post.category as Category}
                    </span>
                  )}
                </div>
                <p className="text-[15px] text-slate-200 whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>
                {post.progress !== null && (
                  <div className="mb-4 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-500">進捗</span>
                      <span className="text-xs font-bold font-mono" style={{ color: progressColor(post.progress) }}>
                        {post.progress}%{post.progress === 100 && ' 🎉'}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-dark-border overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${post.progress}%`, backgroundColor: progressColor(post.progress) }} />
                    </div>
                  </div>
                )}
                <div className="flex items-center pt-2 border-t border-dark-border/50">
                  <span className="flex items-center gap-1.5 text-sm text-accent-pink px-1 py-1">
                    ♥ <span className="font-medium tabular-nums">{respectCount}</span>
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center text-slate-500 text-sm py-16 bg-dark-surface rounded-2xl border border-dark-border/60">
            まだ投稿がありません
          </div>
        )}
      </div>
    </AppShell>
  )
}
