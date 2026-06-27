'use client'

import { useState, useTransition } from 'react'
import RespectButton from './RespectButton'
import { updatePost, deletePost } from '@/app/actions'
import { CATEGORY_STYLE, type Category } from '@/lib/categories'

export type Post = {
  id: string
  content: string
  author_name: string
  user_id: string
  created_at: string
  progress: number | null
  category: string | null
  respects: { count: number }[]
}

function progressColor(value: number) {
  if (value === 100) return '#22c55e'
  if (value >= 67) return '#6366f1'
  if (value >= 34) return '#f59e0b'
  return '#f97316'
}

export default function PostCard({
  post,
  respected,
  currentUserId,
}: {
  post: Post
  respected: boolean
  currentUserId: string
}) {
  const [mode, setMode] = useState<'view' | 'edit' | 'deleting'>('view')
  const [displayContent, setDisplayContent] = useState(post.content)
  const [isPending, startTransition] = useTransition()
  const isOwn = post.user_id === currentUserId
  const respectCount = post.respects?.[0]?.count ?? 0
  const catStyle = post.category ? CATEGORY_STYLE[post.category as Category] : null

  function handleUpdate(formData: FormData) {
    const newContent = formData.get('content') as string
    setDisplayContent(newContent)
    startTransition(async () => {
      await updatePost(formData)
      setMode('view')
    })
  }

  function handleDelete(formData: FormData) {
    startTransition(() => deletePost(formData))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
              {(post.author_name ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{post.author_name}</p>
              <p className="text-xs text-slate-400">
                {new Date(post.created_at).toLocaleString('ja-JP', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          {catStyle && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${catStyle.bg} ${catStyle.text}`}>
              {post.category}
            </span>
          )}
        </div>

        {/* Content / edit form */}
        {mode === 'edit' ? (
          <form action={handleUpdate} className="mb-2">
            <input type="hidden" name="postId" value={post.id} />
            <textarea
              name="content"
              defaultValue={displayContent}
              rows={4}
              required
              maxLength={500}
              autoFocus
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 mb-2 placeholder:text-slate-400"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="text-sm text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg transition hover:bg-slate-100"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-60"
              >
                {isPending ? '保存中...' : '保存する'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4 leading-relaxed">
            {displayContent}
          </p>
        )}

        {/* Progress bar */}
        {mode !== 'edit' && post.progress !== null && (
          <div className="mb-4 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">進捗</span>
              <span className="text-xs font-bold" style={{ color: progressColor(post.progress) }}>
                {post.progress}%{post.progress === 100 && ' 🎉'}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${post.progress}%`, backgroundColor: progressColor(post.progress) }}
              />
            </div>
          </div>
        )}

        {/* Footer row */}
        {mode === 'view' && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <div className="flex items-center gap-0.5">
              <RespectButton postId={post.id} initialCount={respectCount} initialRespected={respected} />
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(`${post.content.slice(0, 120)}\n\n#DevHub`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-sky-500 px-2.5 py-1.5 rounded-lg hover:bg-sky-50 transition"
              >
                X
              </a>
            </div>
            {isOwn && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setMode('edit')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  編集
                </button>
                <button
                  onClick={() => setMode('deleting')}
                  className="text-xs text-slate-400 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition"
                >
                  削除
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation banner */}
      {mode === 'deleting' && (
        <div className="flex items-center justify-between bg-red-50 border-t border-red-100 px-5 py-3">
          <p className="text-sm text-red-600 font-medium">この投稿を削除しますか？</p>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('view')}
              className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-white transition"
            >
              キャンセル
            </button>
            <form action={handleDelete}>
              <input type="hidden" name="postId" value={post.id} />
              <button
                type="submit"
                disabled={isPending}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-60"
              >
                {isPending ? '削除中...' : '削除する'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
