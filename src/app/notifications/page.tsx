import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/app/ui/shell/AppShell'
import PageHeader from '@/app/ui/shell/PageHeader'
import EmptyState from '@/app/ui/EmptyState'
import { timeAgo } from '@/lib/timeago'

type Notification = {
  id: string
  actor_name: string
  post_id: string
  type: string
  read: boolean
  created_at: string
  posts: { content: string }[] | null
}

export const metadata = { title: '通知' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data } = await supabase
    .from('notifications')
    .select('id, actor_name, post_id, type, read, created_at, posts(content)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30)

  const notifications = (data ?? []) as Notification[]
  const unreadCount = notifications.filter((n) => !n.read).length

  // Mark all as read
  if (unreadCount > 0) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
  }

  return (
    <AppShell currentUserId={user.id} notifCount={unreadCount} showRightSidebar={false}>
      <PageHeader title="通知" backHref="/" />

      {notifications.length === 0 ? (
        <EmptyState
          icon="bell"
          title="通知はありません"
          description="誰かがあなたの投稿をリスペクトすると通知が届きます"
        />
      ) : (
        <div className="bg-dark-surface rounded-2xl border border-dark-border/60 overflow-hidden divide-y divide-dark-border/40">
          {notifications.map((n) => (
            <div key={n.id} className={`px-5 py-4 transition-colors ${!n.read ? 'bg-accent-purple/5' : 'hover:bg-dark-hover'}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                  {(n.actor_name ?? '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <span className="font-semibold text-white">{n.actor_name}</span>
                    {' '}があなたの投稿にリスペクトしました
                    <span className="ml-1 text-accent-pink">♥</span>
                  </p>
                  {n.posts?.[0]?.content && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 bg-dark-bg/60 rounded-lg px-3 py-2 border border-dark-border/50">
                      {n.posts[0].content}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-1.5 font-mono">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read && <div className="w-2 h-2 bg-accent-purple rounded-full mt-1.5 shrink-0" aria-label="未読" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
