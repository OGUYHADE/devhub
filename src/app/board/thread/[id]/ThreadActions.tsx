'use client'

import { useTransition } from 'react'
import { markSolved, deleteThread } from '../../actions'

export default function ThreadActions({
  threadId,
  solved,
}: {
  threadId: string
  solved: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleSolve() {
    const fd = new FormData()
    fd.append('threadId', threadId)
    fd.append('solved', String(solved))
    startTransition(() => markSolved(fd))
  }

  function handleDelete() {
    if (!confirm('このスレッドを削除しますか？返信もすべて削除されます。')) return
    const fd = new FormData()
    fd.append('threadId', threadId)
    startTransition(() => deleteThread(fd))
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSolve}
        disabled={isPending}
        className={`text-xs px-3 py-1.5 rounded-full font-medium transition active:scale-95
          ${solved
            ? 'bg-dark-elevated text-slate-400 border border-dark-border hover:text-red-400 hover:border-red-500/40'
            : 'bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 hover:bg-accent-emerald/25'
          }`}
      >
        {solved ? '✓ 解決済み（解除）' : '解決済みにする'}
      </button>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-slate-500 hover:text-red-400 px-3 py-1.5 rounded-full hover:bg-red-500/10 transition active:scale-95"
      >
        削除
      </button>
    </div>
  )
}
