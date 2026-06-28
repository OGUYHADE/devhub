'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import RespectButton from './RespectButton'
import BookmarkButton from './BookmarkButton'
import CommentSection from './CommentSection'
import PostContent from './PostContent'
import ReactionBar from './ReactionBar'
import GitHubCard from './GitHubCard'
import { CommentIcon, ShareIcon } from './icons'
import {
  updatePost,
  deletePost,
  togglePin,
  togglePostVisibility,
  reportPost,
  createQuotePost,
  incrementViewCount,
} from '@/app/actions'
import { timeAgo } from '@/lib/timeago'
import { toHandle } from '@/lib/handle'
import type { Post, ReactionData } from '@/lib/types'

export type { Post }

function progressColor(value: number) {
  if (value === 100) return '#10b981'
  if (value >= 67) return '#7c3aed'
  if (value >= 34) return '#06b6d4'
  return '#ec4899'
}

export default function PostCard({
  post,
  respected,
  bookmarked,
  currentUserId,
  initialReactions = [],
}: {
  post: Post
  respected: boolean
  bookmarked: boolean
  currentUserId: string
  initialReactions?: ReactionData[]
}) {
  const [mode, setMode] = useState<'view' | 'edit' | 'deleting' | 'quoting'>('view')
  const [menuOpen, setMenuOpen] = useState(false)
  const [displayContent, setDisplayContent] = useState(post.content)
  const [showComments, setShowComments] = useState(false)
  const [reported, setReported] = useState(false)
  const [quoteContent, setQuoteContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const isOwn = post.user_id === currentUserId
  const respectCount = post.respects?.[0]?.count ?? 0
  const commentCount = post.comments?.[0]?.count ?? 0
  const techStack = post.tech_stack ?? []

  // View count tracking
  const cardRef = useRef<HTMLDivElement>(null)
  const viewCounted = useRef(false)
  useEffect(() => {
    if (viewCounted.current) return
    const el = cardRef.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout>
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewCounted.current) {
          timer = setTimeout(() => {
            viewCounted.current = true
            incrementViewCount(post.id)
          }, 1500)
        } else {
          clearTimeout(timer)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [post.id])

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

  function handlePin() {
    setMenuOpen(false)
    startTransition(() => togglePin(post.id))
  }

  function handleVisibility() {
    setMenuOpen(false)
    startTransition(() => togglePostVisibility(post.id))
  }

  function handleReport() {
    if (reported) return
    setMenuOpen(false)
    startTransition(async () => {
      await reportPost(post.id)
      setReported(true)
      toast.success('通報しました')
    })
  }

  function handleShare() {
    const url = `${window.location.origin}/?post=${post.id}`
    navigator.clipboard.writeText(url).then(
      () => toast.success('コピーしました!'),
      () => toast.error('コピーに失敗しました')
    )
  }

  function handleXShare() {
    const text = `${displayContent.slice(0, 100)}\n\n#DevHub #個人開発`
    const url = `${window.location.origin}/?post=${post.id}`
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(intent, '_blank', 'noopener,noreferrer')
  }

  function handleQuoteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!quoteContent.trim()) return
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      await createQuotePost(fd)
      setQuoteContent('')
      setMode('view')
      toast.success('引用しました')
    })
  }

  const showGitHubCard =
    mode !== 'edit' &&
    post.github_url &&
    /github\.com\/[^/\s#?]+\/[^/\s#?]+/.test(post.github_url)

  const quoted = post.quoted_post?.[0]

  return (
    <div
      ref={cardRef}
      className="card-glow bg-gradient-to-br from-dark-surface to-dark-elevated rounded-2xl border border-dark-border/60 p-5 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/profile/${post.user_id}`} className="shrink-0 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:ring-2 group-hover:ring-accent-purple group-hover:ring-offset-2 group-hover:ring-offset-dark-surface transition-all">
              {(post.author_name ?? '?')[0].toUpperCase()}
            </div>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/profile/${post.user_id}`}
                className="font-bold text-white text-base hover:text-accent-purple-light transition truncate"
              >
                {post.author_name}
              </Link>
              {post.pinned && <span title="ピン留め" className="text-slate-500 text-xs">📌</span>}
              {!post.is_public && <span title="非公開" className="text-slate-500 text-xs">🔒</span>}
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="font-mono text-sm">@{toHandle(post.author_name)}</span>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-slate-600">{timeAgo(post.created_at)}</span>
              {(post.view_count ?? 0) > 0 && (
                <span className="text-xs text-slate-600 font-mono">· 👁 {post.view_count}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {post.category && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-accent-purple/20 text-accent-purple-light border border-accent-purple/30">
              # {post.category}
            </span>
          )}
          {isOwn && mode === 'view' && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="text-slate-500 hover:text-slate-300 hover:bg-dark-hover rounded-lg p-1 transition"
                aria-label="メニュー"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-dark-elevated border border-dark-border/60 rounded-xl shadow-xl overflow-hidden py-1">
                    <button onClick={handlePin} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-dark-hover transition">
                      {post.pinned ? 'ピン留め解除' : 'ピン留め'}
                    </button>
                    <button onClick={handleVisibility} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-dark-hover transition">
                      {post.is_public ? '非公開にする' : '公開する'}
                    </button>
                    <button onClick={() => { setMenuOpen(false); setMode('edit') }} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-dark-hover transition">
                      編集
                    </button>
                    <button onClick={() => { setMenuOpen(false); setMode('deleting') }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition">
                      削除
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          {!isOwn && mode === 'view' && (
            <button
              onClick={handleReport}
              disabled={reported || isPending}
              title={reported ? '通報済み' : '通報'}
              className={clsx(
                'rounded-lg p-1 transition',
                reported ? 'text-slate-700 cursor-default' : 'text-slate-700 hover:text-red-400 hover:bg-dark-hover'
              )}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Quoted post */}
      {mode !== 'edit' && quoted && (
        <Link
          href={`/profile/${quoted.user_id}`}
          className="block mb-3 rounded-xl border border-dark-border/60 p-3 bg-dark-bg/50 hover:border-accent-purple/30 transition"
        >
          <p className="text-[10px] font-semibold text-slate-600 mb-1 uppercase tracking-wide font-mono">quote</p>
          <p className="text-xs font-semibold text-slate-300 mb-0.5">{quoted.author_name}</p>
          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{quoted.content}</p>
        </Link>
      )}

      {/* Content / edit */}
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
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-accent-purple focus:border-accent-purple/50 mb-2 placeholder:text-slate-600"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setMode('view')}
              className="text-sm text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg transition hover:bg-dark-hover active:scale-95">
              キャンセル
            </button>
            <button type="submit" disabled={isPending}
              className="text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1.5 rounded-lg hover:glow-purple-sm transition font-medium disabled:opacity-60 active:scale-95">
              {isPending ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      ) : (
        <PostContent content={displayContent} />
      )}

      {/* Image */}
      {mode !== 'edit' && post.image_url && (
        <div className="mt-3 mb-1 rounded-xl overflow-hidden border border-dark-border/60 bg-dark-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt="投稿画像" className="w-full max-h-80 object-cover" />
        </div>
      )}

      {/* GitHub card */}
      {showGitHubCard && <GitHubCard url={post.github_url!} />}

      {/* Tech stack */}
      {mode !== 'edit' && techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {techStack.map((tech) => (
            <span key={tech}
              className="bg-dark-elevated border border-dark-border text-slate-400 text-xs px-2 py-0.5 rounded-md font-mono">
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Progress */}
      {mode !== 'edit' && post.progress !== null && (
        <div className="mb-1 mt-3 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-500">進捗</span>
            <span className="text-xs font-bold font-mono" style={{ color: progressColor(post.progress) }}>
              {post.progress}%{post.progress === 100 && ' 🎉'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-dark-border overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${post.progress}%`, backgroundColor: progressColor(post.progress) }} />
          </div>
        </div>
      )}

      {/* Demo link */}
      {mode !== 'edit' && post.demo_url && (
        <a href={post.demo_url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-accent-cyan bg-accent-cyan/10 hover:bg-accent-cyan/20 px-3 py-1.5 rounded-lg transition font-medium mt-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          デモを見る
        </a>
      )}

      {/* Reactions */}
      {mode === 'view' && (
        <div className="mt-3">
          <ReactionBar postId={post.id} initialReactions={initialReactions} />
        </div>
      )}

      {/* Action bar */}
      {mode === 'view' && (
        <div className="flex items-center gap-1 pt-3 mt-3 border-t border-dark-border/50">
          <RespectButton postId={post.id} initialCount={respectCount} initialRespected={respected} />
          <button
            onClick={() => setShowComments((v) => !v)}
            className={clsx(
              'flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-full transition-colors active:scale-95',
              showComments ? 'text-accent-cyan' : 'text-slate-500 hover:text-accent-cyan hover:bg-accent-cyan/10'
            )}
          >
            <CommentIcon size={15} />
            <span className="font-medium tabular-nums text-xs">{commentCount}</span>
          </button>
          <BookmarkButton postId={post.id} initialBookmarked={bookmarked} />
          <button
            onClick={() => setMode('quoting')}
            title="引用"
            className="text-slate-500 hover:text-accent-purple hover:bg-accent-purple/10 px-2.5 py-1.5 rounded-full transition-colors active:scale-95"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </button>
          <button
            onClick={handleXShare}
            title="Xでシェア"
            aria-label="Xでシェア"
            className="ml-auto text-slate-500 hover:text-white hover:bg-white/10 px-2.5 py-1.5 rounded-full transition-colors active:scale-95"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            title="リンクをコピー"
            aria-label="リンクをコピー"
            className="text-slate-500 hover:text-accent-emerald hover:bg-accent-emerald/10 px-2.5 py-1.5 rounded-full transition-colors active:scale-95"
          >
            <ShareIcon size={15} />
          </button>
        </div>
      )}

      {/* Quote form */}
      {mode === 'quoting' && (
        <form onSubmit={handleQuoteSubmit} className="mt-3 pt-3 border-t border-dark-border/50 space-y-3">
          <input type="hidden" name="quoted_post_id" value={post.id} />
          <textarea
            name="content"
            value={quoteContent}
            onChange={(e) => setQuoteContent(e.target.value)}
            placeholder="コメントを追加して引用..."
            rows={2}
            required
            maxLength={500}
            autoFocus
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-sm text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-accent-purple focus:border-accent-purple/50 placeholder:text-slate-600"
          />
          <div className="rounded-xl border border-dark-border/60 p-3 bg-dark-bg/50">
            <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wide mb-1 font-mono">quote</p>
            <p className="text-xs font-semibold text-slate-300 mb-0.5">{post.author_name}</p>
            <p className="text-xs text-slate-500 line-clamp-2">{displayContent}</p>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setMode('view')}
              className="text-sm text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-lg transition active:scale-95">
              キャンセル
            </button>
            <button type="submit" disabled={isPending || !quoteContent.trim()}
              className="text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1.5 rounded-lg hover:glow-purple-sm transition font-medium disabled:opacity-60 active:scale-95">
              {isPending ? '投稿中...' : '引用投稿'}
            </button>
          </div>
        </form>
      )}

      {/* Delete confirm */}
      {mode === 'deleting' && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mt-3">
          <p className="text-sm text-red-400 font-medium">この投稿を削除しますか？</p>
          <div className="flex gap-2">
            <button onClick={() => setMode('view')}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-dark-hover transition active:scale-95">
              キャンセル
            </button>
            <form action={handleDelete}>
              <input type="hidden" name="postId" value={post.id} />
              <button type="submit" disabled={isPending}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-500 transition font-medium disabled:opacity-60 active:scale-95">
                {isPending ? '削除中...' : '削除する'}
              </button>
            </form>
          </div>
        </div>
      )}

      {mode === 'view' && showComments && (
        <CommentSection postId={post.id} currentUserId={currentUserId} />
      )}
    </div>
  )
}
