'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleRespect } from '@/app/actions'

type Props = {
  postId: string
  initialCount: number
  initialRespected: boolean
}

export default function RespectButton({ postId, initialCount, initialRespected }: Props) {
  const [, startTransition] = useTransition()
  const [optimistic, addOptimistic] = useOptimistic(
    { count: initialCount, respected: initialRespected },
    (state) => ({
      count: state.respected ? state.count - 1 : state.count + 1,
      respected: !state.respected,
    })
  )

  function handleClick() {
    startTransition(async () => {
      addOptimistic(undefined)
      await toggleRespect(postId)
    })
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-all duration-150
        ${optimistic.respected
          ? 'bg-orange-50 text-orange-600 font-semibold ring-1 ring-orange-200'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
        }`}
    >
      <span>👊</span>
      <span className="font-medium tabular-nums">{optimistic.count}</span>
    </button>
  )
}
