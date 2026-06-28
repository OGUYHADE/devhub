'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import {
  getCommentsWithExtras,
  createComment,
  deleteComment,
  toggleCommentLike,
  createCommentReply,
  searchUsers,
} from '@/app/actions'
import type { CommentWithExtras } from '@/lib/types'

type Reply = CommentWithExtras['replies'][number]

function CommentBubble({
  comment,
  postId,
  currentUserId,
  onRefresh,
  depth = 0,
}: {
  comment: CommentWithExtras | Reply
  postId: string
  currentUserId: string
  onRefresh: () => void
  depth?: number
}) {
  const [likeCount, setLikeCount] = useState(comment.like_count)
  const [likedByMe, setLikedByMe] = useState(comment.liked_by_me)
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleLike() {
    setLikedByMe((v) => !v)
    setLikeCount((v) => (likedByMe ? v - 1 : v + 1))
    startTransition(async () => {
      await toggleCommentLike(comment.id)
    })
  }

  function handleDelete() {
    const fd = new FormData()
    fd.append('commentId', comment.id)
    startTransition(async () => {
      await deleteComment(fd)
      onRefresh()
    })
  }

  function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!replyContent.trim()) return
    const fd = new FormData()
    fd.append('postId', postId)
    fd.append('parentId', comment.id)
    fd.append('content', replyContent)
    startTransition(async () => {
      await createCommentReply(fd)
      setReplyContent('')
      setShowReply(false)
      onRefresh()
    })
  }

  const hasReplies = 'replies' in comment && (comment as CommentWithExtras).replies.length > 0

  return (
    <div className={depth > 0 ? 'ml-8 mt-1.5' : ''}>
      <div className="flex gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
          {(comment.author_name ?? '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
            <div className="flex items-baseline justify-between gap-1 flex-wrap mb-0.5">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {comment.author_name}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                {new Date(comment.created_at).toLocaleString('ja-JP', {
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1 pl-1">
            <button
              onClick={handleLike}
              disabled={isPending}
              className={`flex items-center gap-0.5 text-[11px] transition ${
                likedByMe
                  ? 'text-red-500'
                  : 'text-slate-400 hover:text-red-400 dark:hover:text-red-400'
              }`}
            >
              <span>{likedByMe ? '❤️' : '♡'}</span>
              {likeCount > 0 && <span className="font-medium tabular-nums">{likeCount}</span>}
            </button>

            {depth === 0 && (
              <button
                onClick={() => setShowReply((v) => !v)}
                className="text-[11px] text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
              >
                返信
              </button>
            )}

            {comment.user_id === currentUserId && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-[11px] text-slate-300 dark:text-slate-600 hover:text-red-400 transition disabled:opacity-50"
              >
                削除
              </button>
            )}
          </div>

          {showReply && depth === 0 && (
            <form onSubmit={handleReplySubmit} className="mt-2 flex gap-2">
              <input
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`@${comment.author_name} への返信...`}
                maxLength={200}
                className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={isPending || !replyContent.trim()}
                className="text-xs font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shrink-0"
              >
                送信
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <div className="space-y-1.5 mt-1.5">
          {(comment as CommentWithExtras).replies.map((reply) => (
            <CommentBubble
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              onRefresh={onRefresh}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CommentSection({
  postId,
  currentUserId,
}: {
  postId: string
  currentUserId: string
}) {
  const [comments, setComments] = useState<CommentWithExtras[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // @mention state
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionUsers, setMentionUsers] = useState<{ id: string; name: string }[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const cursorPosRef = useRef(0)

  const refresh = () => {
    getCommentsWithExtras(postId).then((data) => {
      setComments(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    refresh()
  }, [postId])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    const cursor = e.target.selectionStart ?? 0
    setInput(value)
    cursorPosRef.current = cursor

    const textBefore = value.slice(0, cursor)
    const lastAt = textBefore.lastIndexOf('@')
    if (lastAt !== -1) {
      const query = textBefore.slice(lastAt + 1)
      if (/^\w*$/.test(query) && query.length <= 20) {
        if (query.length >= 1) {
          searchUsers(query).then((users) => {
            setMentionUsers(users)
            setShowMentions(users.length > 0)
          })
        } else {
          setShowMentions(false)
        }
        setMentionQuery(query)
        return
      }
    }
    setShowMentions(false)
    setMentionQuery('')
  }

  function handleMentionSelect(user: { id: string; name: string }) {
    const cursor = cursorPosRef.current
    const textBefore = input.slice(0, cursor)
    const lastAt = textBefore.lastIndexOf('@')
    const before = input.slice(0, lastAt)
    const after = input.slice(cursor)
    const newInput = `${before}@${user.name} ${after}`
    setInput(newInput)
    setShowMentions(false)
    setMentionUsers([])
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!input.trim()) return
    setShowMentions(false)
    const fd = new FormData()
    fd.append('postId', postId)
    fd.append('content', input)
    startTransition(async () => {
      await createComment(fd)
      setInput('')
      refresh()
    })
  }

  if (loading) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 text-center py-2 animate-pulse">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
      {comments.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-1">まだコメントがありません</p>
      )}

      {comments.map((c) => (
        <CommentBubble
          key={c.id}
          comment={c}
          postId={postId}
          currentUserId={currentUserId}
          onRefresh={refresh}
        />
      ))}

      <form onSubmit={handleSubmit} className="flex gap-2 pt-1 relative">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            name="content"
            value={input}
            onChange={handleInputChange}
            onBlur={() => setTimeout(() => setShowMentions(false), 150)}
            placeholder="コメントを追加... (@でメンション)"
            maxLength={200}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-400"
          />
          {showMentions && mentionUsers.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-20">
              {mentionUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleMentionSelect(user) }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-center gap-2 transition"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-[9px] shrink-0">
                    {user.name[0]?.toUpperCase()}
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">@{user.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="text-xs font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shrink-0"
        >
          送信
        </button>
      </form>
    </div>
  )
}
