import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '../actions'
import AppShell from '../ui/shell/AppShell'
import ProfileDangerZone from '../ui/ProfileDangerZone'

export const metadata = { title: '設定' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { count: unreadNotifs } = await supabase
    .from('notifications').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('read', false)

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0} showRightSidebar={false}>
      <h1 className="text-xl font-bold text-white mb-1">設定</h1>
      <p className="text-sm text-slate-500 mb-6 font-mono">@{user.email}</p>

      <div className="space-y-4">
        <div className="bg-dark-surface border border-dark-border/60 rounded-2xl p-5">
          <p className="text-sm font-semibold text-white mb-4">アカウント</p>
          <div className="space-y-2">
            <Link href="/profile"
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-dark-border hover:bg-dark-hover transition group">
              <span className="text-sm text-slate-300 group-hover:text-white">プロフィールを編集</span>
              <span className="text-slate-600 group-hover:text-slate-400">→</span>
            </Link>
            <form action={signOut}>
              <button type="submit"
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-dark-border hover:bg-dark-hover transition group">
                <span className="text-sm text-slate-300 group-hover:text-white">ログアウト</span>
                <span className="text-slate-600 group-hover:text-slate-400">→</span>
              </button>
            </form>
          </div>
        </div>

        <ProfileDangerZone />
      </div>
    </AppShell>
  )
}
