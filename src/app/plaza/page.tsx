import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '../ui/shell/AppShell'
import PlazaClient, { type PlazaUser } from './PlazaClient'

export const metadata = { title: 'みんなの広場' }

export default async function PlazaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profiles }, { count: unreadNotifs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, bio, plaza_message')
      .limit(60),
    supabase.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('read', false),
  ])

  const users: PlazaUser[] = (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.display_name ?? 'ユーザー',
    bio: p.bio ?? null,
    message: p.plaza_message ?? null,
  }))

  const myMessage = users.find((u) => u.id === user.id)?.message ?? ''

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0} showRightSidebar={false}>
      <PlazaClient users={users} currentUserId={user.id} initialMessage={myMessage} />
    </AppShell>
  )
}
