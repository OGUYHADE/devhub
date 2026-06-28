import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BOARD_CATEGORY_META, type BoardCategory } from '../../constants'
import ThreadActions from './ThreadActions'
import ThreadBookmarkButton from './ThreadBookmarkButton'
import AppShell from '@/app/ui/shell/AppShell'
import PageHeader from '@/app/ui/shell/PageHeader'
import { timeAgo } from '@/lib/timeago'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('board_threads').select('title').eq('id', id).maybeSingle()
  return { title: data?.title ?? 'スレッド' }
}

export default async function ThreadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: thread }, { data: replies }, { data: myBookmark }, { count: unreadNotifs }] = await Promise.all([
    supabase.from('board_threads')
      .select('id, title, content, author_name, user_id, category, created_at, solved, pinned')
      .eq('id', id).maybeSingle(),
    supabase.from('board_replies')
      .select('id, content, author_name, user_id, created_at')
      .eq('thread_id', id).order('created_at', { ascending: true }),
    supabase.from('thread_bookmarks')
      .select('id').eq('thread_id', id).eq('user_id', user.id).maybeSingle(),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
  ])

  if (!thread) notFound()

  const meta = BOARD_CATEGORY_META[thread.category as BoardCategory]
  const isOwn = thread.user_id === user.id

  return (
    <AppShell currentUserId={user.id} notifCount={unreadNotifs ?? 0} showRightSidebar={false}>
      <PageHeader title={`${meta?.icon ?? ''} ${thread.title}`} backHref={`/board/${encodeURIComponent(thread.category)}`}>
        {thread.solved && (
          <span className="text-xs bg-accent-emerald/15 text-accent-emerald px-2 py-0.5 rounded-full font-semibold shrink-0 border border-accent-emerald/30">解決済み</span>
        )}
      </PageHeader>

      <div className="space-y-4">
        {/* Original post */}
        <div className="bg-gradient-to-br from-dark-surface to-dark-elevated rounded-2xl border border-dark-border/60 p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
              {(thread.author_name ?? '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{thread.author_name}</p>
              <p className="text-xs text-slate-500 font-mono">{timeAgo(thread.created_at)}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0 bg-accent-purple/20 text-accent-purple-light border border-accent-purple/30">
              # {thread.category}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mb-3">{thread.title}</h2>
          <p className="text-[15px] text-slate-200 whitespace-pre-wrap leading-relaxed">{thread.content}</p>

          <div className="mt-4 pt-3 border-t border-dark-border/50 flex items-center gap-2">
            <ThreadBookmarkButton threadId={thread.id} initialBookmarked={!!myBookmark} />
            {isOwn && <ThreadActions threadId={thread.id} solved={thread.solved} />}
          </div>
        </div>

        {/* Replies */}
        {(replies ?? []).length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 px-1 font-mono">{replies!.length}件の返信</p>
            {replies!.map((reply, idx) => (
              <div key={reply.id} className="bg-dark-surface rounded-2xl border border-dark-border/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                    {(reply.author_name ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-slate-200">{reply.author_name}</p>
                        <span className="text-[10px] text-slate-500 font-mono">#{idx + 1} · {timeAgo(reply.created_at)}</span>
                      </div>
                      {reply.user_id === user.id && (
                        <form action={async (fd) => {
                          'use server'
                          const { deleteReply } = await import('../../actions')
                          await deleteReply(fd)
                        }}>
                          <input type="hidden" name="replyId" value={reply.id} />
                          <input type="hidden" name="threadId" value={thread.id} />
                          <button type="submit" className="text-[10px] text-slate-600 hover:text-red-400 transition">削除</button>
                        </form>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reply form */}
        <div className="bg-dark-surface rounded-2xl border border-dark-border/60 p-4">
          <p className="text-xs font-semibold text-slate-400 mb-3">返信する</p>
          <form action={async (fd) => {
            'use server'
            const { createReply } = await import('../../actions')
            await createReply(fd)
          }}>
            <input type="hidden" name="threadId" value={thread.id} />
            <textarea name="content" rows={3} required maxLength={1000} placeholder="返信を入力してください..."
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-accent-purple focus:border-accent-purple/50 placeholder:text-slate-600 mb-3" />
            <div className="flex justify-end">
              <button type="submit"
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:glow-purple transition active:scale-95">
                返信する
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
