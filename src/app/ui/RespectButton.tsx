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
      className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-full transition
        ${optimistic.respected
          ? 'bg-orange-100 text-orange-600 font-medium'
          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
        }`}
    >
      <span>👊</span>
      <span>{optimistic.count}</span>
    </button>
  )
}
