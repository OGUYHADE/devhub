'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'
import { toggleRespect } from '@/app/actions'
import { HeartIcon } from './icons'

const CONFETTI_COLORS = ['#ec4899', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b']

export default function RespectButton({
  postId,
  initialCount,
  initialRespected,
}: {
  postId: string
  initialCount: number
  initialRespected: boolean
}) {
  const [, startTransition] = useTransition()
  const [burst, setBurst] = useState(0)
  const [optimistic, addOptimistic] = useOptimistic(
    { count: initialCount, respected: initialRespected },
    (state) => ({
      count: state.respected ? state.count - 1 : state.count + 1,
      respected: !state.respected,
    })
  )

  function handleClick() {
    if (!optimistic.respected) setBurst((b) => b + 1)
    startTransition(async () => {
      addOptimistic(undefined)
      await toggleRespect(postId)
    })
  }

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'relative flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-full transition-colors duration-150 active:scale-95',
        optimistic.respected
          ? 'text-accent-pink font-semibold'
          : 'text-slate-500 hover:text-accent-pink hover:bg-accent-pink/10'
      )}
    >
      <motion.span
        key={optimistic.respected ? 'on' : 'off'}
        animate={optimistic.respected ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative flex"
      >
        <HeartIcon size={16} filled={optimistic.respected} />

        {/* Confetti burst */}
        <AnimatePresence>
          {burst > 0 && (
            <span key={burst} className="absolute inset-0 flex items-center justify-center">
              {CONFETTI_COLORS.map((color, i) => {
                const angle = (i / CONFETTI_COLORS.length) * 2 * Math.PI
                const tx = `${Math.cos(angle) * 18}px`
                return (
                  <span
                    key={i}
                    className="confetti-dot"
                    style={{ background: color, ['--tx' as string]: tx }}
                  />
                )
              })}
            </span>
          )}
        </AnimatePresence>
      </motion.span>

      <span className="font-medium tabular-nums">{optimistic.count}</span>
    </button>
  )
}
