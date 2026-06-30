import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/app/ui/shell/AppShell'
import PageHeader from '@/app/ui/shell/PageHeader'
import { fetchHackerNews, fetchDevTo, fetchZenn } from '@/lib/news'
import NewsTabs from './NewsTabs'

export const metadata = { title: 'ニュース' }
export const revalidate = 1800 // 30 min

export default async function NewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [{ count: unreadNotifs }, hn, devto, zenn] = await Promise.all([
    supabase.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('read', false),
    fetchHackerNews(),
    fetchDevTo(),
    fetchZenn(),
  ])

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0}>
      <PageHeader title="📰 ニュース" />
      <p className="text-sm text-slate-500 mb-4 px-1">
        開発者向けの話題を3つのソースからまとめてチェック。30分ごとに更新されます。
      </p>
      <NewsTabs hn={hn} devto={devto} zenn={zenn} />
    </AppShell>
  )
}
