import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FollowButton from '@/app/ui/FollowButton'
import AppShell from '@/app/ui/shell/AppShell'
import PageHeader from '@/app/ui/shell/PageHeader'
import EmptyState from '@/app/ui/EmptyState'
import { toHandle } from '@/lib/handle'

export const metadata = { title: 'フォロワー' }

export default async function FollowersPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: followers }, { count: unreadNotifs }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle(),
    supabase.from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(id, display_name)')
      .eq('following_id', userId),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
  ])

  if (!profile && !followers?.length) notFound()

  const followerIds = (followers ?? []).map((f) => f.follower_id)
  const { data: myFollows } = followerIds.length > 0
    ? await supabase.from('follows').select('following_id').eq('follower_id', user.id).in('following_id', followerIds)
    : { data: [] }
  const followingSet = new Set((myFollows ?? []).map((f) => f.following_id))

  const displayName = profile?.display_name ?? 'ユーザー'

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0} showRightSidebar={false}>
      <PageHeader title={`${displayName} のフォロワー (${followers?.length ?? 0})`} backHref={`/profile/${userId}`} />

      {!followers?.length ? (
        <EmptyState icon="users" title="まだフォロワーがいません" />
      ) : (
        <div className="space-y-3">
          {followers.map((f) => {
            const prof = f.profiles as unknown as { id: string; display_name: string } | null
            const fid = f.follower_id
            const name = prof?.display_name ?? 'ユーザー'
            const isMe = fid === user.id
            return (
              <div key={fid} className="flex items-center gap-3 bg-dark-surface rounded-2xl border border-dark-border/60 p-4">
                <Link href={fid === user.id ? '/profile' : `/profile/${fid}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                    {name[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm group-hover:text-accent-purple-light transition truncate">{name}</p>
                    <p className="text-xs text-slate-500 font-mono truncate">@{toHandle(name)}</p>
                  </div>
                </Link>
                {!isMe && <FollowButton targetUserId={fid} initialFollowing={followingSet.has(fid)} size="sm" />}
              </div>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
