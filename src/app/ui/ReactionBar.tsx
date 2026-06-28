'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { toggleReaction } from '@/app/actions'
import type { ReactionData } from '@/lib/types'

const EMOJIS = ['👍', '🔥', '💡', '🚀', '❤️'] as const

export default function ReactionBar({
  postId,
  initialReactions,
}: {
  postId: string
  initialReactions: ReactionData[]
}) {
  const [isPending, startTransition] = useTransition()
  const [showPicker, setShowPicker] = useState(false)

  const [optimisticReactions, updateOptimistic] = useOptimistic(
    initialReactions,
    (prev: ReactionData[], { emoji, remove }: { emoji: string; remove: boolean }) => {
      const existing = prev.find((r) => r.emoji === emoji)
      if (remove) {
        return prev
          .map((r) =>
            r.emoji === emoji ? { ...r, count: r.count - 1, reactedByMe: false } : r
          )
          .filter((r) => r.count > 0)
      }
      if (existing) {
        return prev.map((r) =>
          r.emoji === emoji ? { ...r, count: r.count + 1, reactedByMe: true } : r
        )
      }
      return [...prev, { emoji, count: 1, reactedByMe: true }]
    }
  )

  function handleReact(emoji: string) {
    const existing = optimisticReactions.find((r) => r.emoji === emoji)
    const remove = existing?.reactedByMe ?? false
    setShowPicker(false)
    startTransition(async () => {
      updateOptimistic({ emoji, remove })
      await toggleReaction(postId, emoji)
    })
  }

  return (
    <div className="relative flex items-center gap-1 flex-wrap">
      {optimisticReactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleReact(r.emoji)}
          disabled={isPending}
          title={r.emoji}
          className={`flex items-center gap-0.5 text-xs px-2 py-1 rounded-full border transition-all active:scale-95
            ${
              r.reactedByMe
                ? 'bg-accent-purple/15 text-accent-purple-light border-accent-purple/40'
                : 'bg-dark-elevated text-slate-400 border-dark-border hover:border-accent-purple/30'
            }`}
        >
          <span>{r.emoji}</span>
          <span className="font-medium tabular-nums">{r.count}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker((v) => !v)}
          className="text-xs text-slate-500 hover:text-accent-purple-light px-1.5 py-1 rounded-full hover:bg-accent-purple/10 transition active:scale-95"
          title="リアクションを追加"
        >
          {showPicker ? '✕' : '＋😊'}
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-0 mb-1.5 flex items-center gap-1 bg-dark-elevated border border-dark-border rounded-xl px-2.5 py-2 shadow-xl z-20">
            {EMOJIS.map((emoji) => {
              const reacted = optimisticReactions.find((r) => r.emoji === emoji)?.reactedByMe
              return (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={`text-lg hover:scale-125 transition-transform p-0.5 rounded ${
                    reacted ? 'opacity-50' : ''
                  }`}
                  title={emoji}
                >
                  {emoji}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
