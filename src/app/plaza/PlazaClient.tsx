'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { updatePlazaMessage } from '@/app/actions'
import { toHandle } from '@/lib/handle'

export type PlazaUser = {
  id: string
  name: string
  bio: string | null
  message: string | null
}

const STAR_COUNT = 40

function Sign({ message }: { message: string | null }) {
  const text = message && message.length > 20 ? message.slice(0, 20) + '…' : message
  if (!text) return <div className="h-3" />
  return (
    <div className="relative mb-1 flex flex-col items-center">
      <div className="relative w-[120px] rounded-md bg-gradient-to-b from-[#2d1a0e] to-[#1a0f08] border border-[#5a3a1a]/60 shadow-lg px-2 py-1.5">
        <p className="font-mono text-[10px] leading-tight text-amber-200 text-center break-words">{text}</p>
      </div>
      {/* posts */}
      <div className="flex gap-6 -mt-px">
        <span className="w-1 h-2.5 bg-[#5a3a1a]" />
        <span className="w-1 h-2.5 bg-[#5a3a1a]" />
      </div>
    </div>
  )
}

export default function PlazaClient({
  users: initialUsers,
  currentUserId,
  initialMessage,
}: {
  users: PlazaUser[]
  currentUserId: string
  initialMessage: string
}) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [selected, setSelected] = useState<PlazaUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState(initialMessage)
  const [newIds, setNewIds] = useState<Set<string>>(new Set())

  // Realtime: new profiles appear
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('plaza-profiles')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
        const p = payload.new as { id: string; display_name: string; bio: string | null; plaza_message: string | null }
        setUsers((prev) => {
          if (prev.some((u) => u.id === p.id)) return prev
          return [...prev, { id: p.id, name: p.display_name ?? 'ユーザー', bio: p.bio, message: p.plaza_message }]
        })
        setNewIds((prev) => new Set(prev).add(p.id))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 65,
        size: Math.random() * 2 + 1,
        dur: Math.random() * 3 + 2,
        delay: Math.random() * 3,
      })),
    []
  )

  async function saveMessage() {
    setModalOpen(false)
    setUsers((prev) => prev.map((u) => (u.id === currentUserId ? { ...u, message: draft.trim() || null } : u)))
    await updatePlazaMessage(draft)
    toast.success('看板を更新しました')
  }

  return (
    <div className="relative -mx-3 sm:-mx-4 -my-4 min-h-[calc(100vh-2rem)] overflow-hidden rounded-none">
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] to-[#0a0a0f]" />
      {/* Stars */}
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white star"
          style={{
            left: `${s.left}%`, top: `${s.top}%`,
            width: s.size, height: s.size,
            ['--dur' as string]: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Trees (top-left, top-right, bottom-left) */}
      <div className="absolute top-10 left-6 flex flex-col items-center opacity-80">
        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-emerald-700 to-emerald-900" />
        <div className="w-1.5 h-5 bg-[#3a2410]" />
      </div>
      <div className="absolute top-16 right-10 flex flex-col items-center opacity-70">
        <div className="w-8 h-8 rounded-full bg-gradient-to-b from-emerald-600 to-emerald-800" />
        <div className="w-1.5 h-4 bg-[#3a2410]" />
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 inset-x-0 h-[35%] bg-gradient-to-b from-[#0f2010] to-[#0a1208]">
        <div className="absolute inset-0 grid-overlay opacity-10" />
      </div>
      <div className="absolute bottom-[33%] left-4 flex flex-col items-center opacity-80">
        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-emerald-700 to-emerald-900" />
        <div className="w-2 h-6 bg-[#3a2410]" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-5 pb-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">🌳 みんなの広場</h1>
          <p className="text-xs text-slate-400 mt-0.5">{users.length}人の開発者がここにいます</p>
        </div>
        <button
          onClick={() => { setDraft(initialMessage); setModalOpen(true) }}
          className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-full hover:glow-purple transition active:scale-95"
        >
          看板を設定
        </button>
      </div>

      {/* Avatar grid */}
      <div className="relative z-10 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-2 px-4 py-8">
        {users.map((u) => (
          <motion.button
            key={u.id}
            layout
            initial={newIds.has(u.id) ? { opacity: 0, scale: 0.5, y: -10 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            whileHover={{ y: -8 }}
            onClick={() => setSelected(u)}
            className="flex flex-col items-center group"
          >
            <Sign message={u.message} />
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:ring-2 group-hover:ring-accent-purple group-hover:ring-offset-2 group-hover:ring-offset-[#0d1117] transition-all">
              {u.name[0]?.toUpperCase() ?? '?'}
            </div>
            <p className="text-[11px] text-slate-300 mt-1.5 max-w-[64px] truncate font-medium">{u.name}</p>
          </motion.button>
        ))}
      </div>

      {/* Profile popup */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-dark-elevated/95 backdrop-blur border border-accent-purple/30 rounded-2xl p-5 w-full max-w-xs"
              initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-3">
                  {selected.name[0]?.toUpperCase() ?? '?'}
                </div>
                <p className="font-bold text-white text-lg">{selected.name}</p>
                <p className="font-mono text-sm text-slate-500">@{toHandle(selected.name)}</p>
                {selected.bio && <p className="text-sm text-slate-400 mt-2 leading-relaxed">{selected.bio}</p>}
                <button
                  onClick={() => router.push(`/profile/${selected.id}`)}
                  className="mt-4 w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold py-2 rounded-full hover:glow-purple-sm transition active:scale-95"
                >
                  プロフィールを見る
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="bg-dark-elevated border border-dark-border/60 rounded-2xl p-5 w-full max-w-sm"
              initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-white mb-1">広場の看板メッセージ</h3>
              <p className="text-xs text-slate-500 mb-3">あなたの看板に表示されます（最大20文字推奨）</p>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={60}
                autoFocus
                placeholder="例: 個人開発楽しい!"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-accent-purple placeholder:text-slate-600"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setModalOpen(false)}
                  className="text-sm text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition active:scale-95">
                  キャンセル
                </button>
                <button onClick={saveMessage}
                  className="text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-1.5 rounded-full font-medium hover:glow-purple-sm transition active:scale-95">
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
