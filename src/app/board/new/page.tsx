import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BOARD_CATEGORIES, BOARD_CATEGORY_META } from '../constants'
import { createThread } from '../actions'
import AppShell from '@/app/ui/shell/AppShell'
import PageHeader from '@/app/ui/shell/PageHeader'

export const metadata = { title: 'スレッド作成 | 掲示板' }

export default async function NewThreadPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: defaultCategory } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { count: unreadNotifs } = await supabase
    .from('notifications').select('id', { count: 'exact', head: true })
    .eq('user_id', user.id).eq('read', false)

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0} showRightSidebar={false}>
      <PageHeader title="スレッドを作成" backHref="/board" />

      <form action={createThread} className="bg-dark-surface rounded-2xl border border-dark-border/60 p-6 space-y-5">
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">カテゴリ *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BOARD_CATEGORIES.map((cat) => {
              const meta = BOARD_CATEGORY_META[cat]
              return (
                <label key={cat} className="cursor-pointer">
                  <input type="radio" name="category" value={cat} defaultChecked={cat === defaultCategory} required className="sr-only peer" />
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition
                    peer-checked:border-accent-purple peer-checked:bg-accent-purple/15 peer-checked:text-accent-purple-light
                    border-dark-border text-slate-400 hover:border-dark-hover">
                    <span>{meta.icon}</span>
                    <span className="text-xs">{cat}</span>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            タイトル * <span className="text-xs text-slate-500 font-normal">（50文字以内）</span>
          </label>
          <input name="title" type="text" required maxLength={50} placeholder="スレッドのタイトルを入力..."
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-purple focus:border-accent-purple/50 placeholder:text-slate-600" />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            内容 * <span className="text-xs text-slate-500 font-normal">（2000文字以内）</span>
          </label>
          <textarea name="content" required rows={6} maxLength={2000} placeholder="詳細を入力してください..."
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-accent-purple focus:border-accent-purple/50 placeholder:text-slate-600" />
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/board" className="text-sm text-slate-400 hover:text-slate-200 px-5 py-2.5 rounded-full border border-dark-border hover:bg-dark-hover transition active:scale-95">
            キャンセル
          </Link>
          <button type="submit"
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:glow-purple transition active:scale-95">
            スレッドを作成
          </button>
        </div>
      </form>
    </AppShell>
  )
}
