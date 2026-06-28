'use client'

import { useState, useEffect, useMemo } from 'react'
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

const STAR_COUNT = 50

/* deterministic 0..1 hash so SSR and client positions match */
function hash01(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

function layoutFor(id: string) {
  const x = 5 + hash01(id) * 86 // 5%..91%
  const y = 48 + hash01(id + '#y') * 40 // 48%..88% (ground band)
  const t = (y - 48) / 40 // 0 (back) .. 1 (front)
  const scale = 0.7 + t * 0.55 // smaller in back, bigger in front
  const z = 10 + Math.round(t * 18) // front avatars overlap back ones
  return { x, y, scale, z }
}

/* ── Wooden sign ─────────────────────────────────────────────── */
function Sign({ message }: { message: string | null }) {
  const trimmed = message?.trim() ?? ''
  const text = trimmed.length > 18 ? trimmed.slice(0, 18) + '…' : trimmed
  const isPlaceholder = !text
  const display = text || 'よろしく！'

  const screw = (
    <span className="absolute w-[5px] h-[5px] rounded-full"
      style={{ background: 'radial-gradient(circle at 30% 30%, #d8d8d8, #6a6a6a 70%, #3a3a3a)' }} />
  )

  return (
    <div className="flex flex-col items-center pointer-events-none">
      <div
        className="relative w-[116px] rounded-[5px] px-2.5 py-2 shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 6px),' +
            'linear-gradient(to bottom, #7a4e26, #5a3719 55%, #3f2611)',
          border: '1px solid #2b1908',
          boxShadow: 'inset 0 1px 0 rgba(255,200,140,0.18), 0 4px 8px rgba(0,0,0,0.5)',
        }}
      >
        <span className="top-[3px] left-[3px] absolute">{screw}</span>
        <span className="top-[3px] right-[3px] absolute">{screw}</span>
        <span className="bottom-[3px] left-[3px] absolute">{screw}</span>
        <span className="bottom-[3px] right-[3px] absolute">{screw}</span>
        <p className={`font-mono text-[10px] leading-tight text-center break-words ${isPlaceholder ? 'text-amber-200/45' : 'text-amber-100'}`}
          style={{ textShadow: '0 1px 1px rgba(0,0,0,0.6)' }}>
          {display}
        </p>
      </div>
      {/* longer support posts */}
      <div className="flex gap-7 -mt-px">
        <span className="w-[5px] h-7 rounded-b-sm" style={{ background: 'linear-gradient(to bottom,#4a2f17,#2b1908)' }} />
        <span className="w-[5px] h-7 rounded-b-sm" style={{ background: 'linear-gradient(to bottom,#4a2f17,#2b1908)' }} />
      </div>
    </div>
  )
}

/* ── Decorative tree ─────────────────────────────────────────── */
function Tree({ className = '', scale = 1 }: { className?: string; scale?: number }) {
  return (
    <div className={`flex flex-col items-center ${className}`} style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}>
      <div className="w-0 h-0" style={{ borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '26px solid #1f5135' }} />
      <div className="w-0 h-0 -mt-3" style={{ borderLeft: '24px solid transparent', borderRight: '24px solid transparent', borderBottom: '30px solid #1a4a2e' }} />
      <div className="w-0 h-0 -mt-3.5" style={{ borderLeft: '28px solid transparent', borderRight: '28px solid transparent', borderBottom: '34px solid #143d26' }} />
      <div className="w-3 h-6 -mt-1 rounded-b" style={{ background: 'linear-gradient(to bottom,#3a2410,#241608)' }} />
    </div>
  )
}

/* ── Street lamp ─────────────────────────────────────────────── */
function StreetLamp({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <div className="w-4 h-4 rounded-full bg-amber-100"
          style={{ boxShadow: '0 0 28px 12px rgba(251,191,36,0.55), 0 0 60px 24px rgba(251,146,60,0.25)' }} />
      </div>
      <div className="w-[3px] h-36" style={{ background: 'linear-gradient(to bottom,#444,#1a1a1a)' }} />
      <div className="w-5 h-1.5 rounded-sm -mt-0.5" style={{ background: '#222' }} />
    </div>
  )
}

/* ── Fountain ────────────────────────────────────────────────── */
function Fountain() {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[30%] z-[4] animate-pulse" style={{ animationDuration: '4s' }}>
      <svg width="150" height="120" viewBox="0 0 150 120" style={{ filter: 'drop-shadow(0 0 14px rgba(59,130,246,0.55))' }}>
        {/* pool */}
        <ellipse cx="75" cy="104" rx="68" ry="15" fill="#13243a" />
        <ellipse cx="75" cy="101" rx="60" ry="12" fill="#1d4ed8" opacity="0.55" />
        <ellipse cx="75" cy="100" rx="46" ry="8" fill="#60a5fa" opacity="0.5" />
        {/* lower column + basin */}
        <rect x="67" y="58" width="16" height="44" fill="#39506b" />
        <ellipse cx="75" cy="58" rx="30" ry="8" fill="#13243a" />
        <ellipse cx="75" cy="56" rx="26" ry="6" fill="#3b82f6" opacity="0.7" />
        {/* upper column + basin */}
        <rect x="70" y="30" width="10" height="28" fill="#39506b" />
        <ellipse cx="75" cy="30" rx="14" ry="4.5" fill="#13243a" />
        <ellipse cx="75" cy="29" rx="11" ry="3.5" fill="#60a5fa" opacity="0.8" />
        {/* water jets */}
        <path d="M75 26 C71 14 67 12 63 8" stroke="#93c5fd" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M75 26 C79 14 83 12 87 8" stroke="#93c5fd" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M75 24 C75 14 75 12 75 4" stroke="#bfdbfe" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

/* ── City silhouette ─────────────────────────────────────────── */
function CitySilhouette() {
  const buildings = [
    [0, 70], [55, 110], [120, 60], [175, 130], [250, 85], [320, 150],
    [400, 70], [460, 120], [540, 95], [610, 160], [700, 80], [770, 115],
    [850, 65], [910, 140], [1000, 90], [1070, 125], [1150, 70],
  ]
  return (
    <svg viewBox="0 0 1200 180" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[37%] w-full h-[150px] z-0">
      <g fill="#0b0614">
        {buildings.map(([x, h], i) => (
          <rect key={i} x={x} y={180 - h} width={i % 3 === 0 ? 58 : 44} height={h} />
        ))}
      </g>
      {/* a few lit windows */}
      <g fill="#ffb347" opacity="0.35">
        {buildings.flatMap(([x, h], i) =>
          h > 90 ? [<rect key={`w${i}`} x={x + 10} y={180 - h + 14} width="6" height="8" />,
                   <rect key={`w2${i}`} x={x + 26} y={180 - h + 30} width="6" height="8" />] : []
        )}
      </g>
    </svg>
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
      Array.from({ length: STAR_COUNT }, (_, i) => {
        const top = Math.random() * 50
        const brightness = 0.2 + (1 - top / 50) * 0.8 // bright high up, faint near sunset
        return {
          id: i,
          left: Math.random() * 100,
          top,
          size: Math.random() * 2 + 1,
          dur: Math.random() * 3 + 2,
          delay: Math.random() * 3,
          brightness,
        }
      }),
    []
  )

  const reflections = useMemo(
    () => [
      { left: 18, bottom: 14, dur: 3 },
      { left: 44, bottom: 8, dur: 4.5 },
      { left: 70, bottom: 18, dur: 3.8 },
      { left: 88, bottom: 11, dur: 5 },
    ],
    []
  )

  async function saveMessage() {
    setModalOpen(false)
    setUsers((prev) => prev.map((u) => (u.id === currentUserId ? { ...u, message: draft.trim() || null } : u)))
    await updatePlazaMessage(draft)
    toast.success('看板を更新しました')
  }

  return (
    <div className="relative -mx-3 sm:-mx-4 -my-4 min-h-[calc(100vh-2rem)] overflow-hidden">
      {/* Dusk sky */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, #1a0a2e 0%, #4a1a6b 35%, #ff6b35 78%, #ff9500 100%)' }}
      />

      {/* Moon */}
      <div className="absolute top-10 right-12 w-16 h-16 rounded-full bg-[#fdf6e3] z-0"
        style={{ boxShadow: '0 0 40px 12px rgba(253,246,227,0.5), 0 0 90px 30px rgba(253,246,227,0.18)' }} />

      {/* Stars (brightness fades toward sunset) */}
      {stars.map((s) => (
        <span key={s.id} className="absolute z-0" style={{ left: `${s.left}%`, top: `${s.top}%`, opacity: s.brightness }}>
          <span className="block rounded-full bg-white star"
            style={{ width: s.size, height: s.size, ['--dur' as string]: `${s.dur}s`, animationDelay: `${s.delay}s` }} />
        </span>
      ))}

      {/* City silhouette */}
      <CitySilhouette />

      {/* Ground: cobblestone */}
      <div
        className="absolute bottom-0 inset-x-0 h-[40%] z-[1]"
        style={{
          backgroundColor: '#1a1a1a',
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 40px),' +
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 40px),' +
            'linear-gradient(to bottom, #2c2c2c, #161616)',
        }}
      >
        {/* cracks / extra texture */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 70px), repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 90px)' }} />
        {/* warm light reflections on the stones */}
        {reflections.map((r, i) => (
          <span key={i} className="absolute rounded-[50%] bg-amber-300/20 blur-md animate-pulse"
            style={{ left: `${r.left}%`, bottom: `${r.bottom}%`, width: 70, height: 14, animationDuration: `${r.dur}s` }} />
        ))}
      </div>

      {/* Fountain */}
      <Fountain />

      {/* Street lamps */}
      <StreetLamp className="absolute left-[4%] bottom-[26%] z-[5]" />
      <StreetLamp className="absolute right-[4%] bottom-[26%] z-[5]" />

      {/* Edge trees */}
      <div className="absolute left-[10%] bottom-[34%] z-[3]"><Tree scale={1.1} /></div>
      <div className="absolute right-[12%] bottom-[33%] z-[3]"><Tree scale={0.85} /></div>
      <div className="absolute left-[26%] bottom-[36%] z-[2]"><Tree scale={0.7} /></div>

      {/* Header */}
      <div className="absolute inset-x-0 top-0 z-40 px-5 pt-5 pb-10"
        style={{ background: 'linear-gradient(to bottom, rgba(10,5,20,0.55), transparent)' }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
              🌳 みんなの広場
            </h1>
            <p className="text-sm text-amber-100/90 mt-1 font-medium" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              ⭐ {users.length}人の開発者が集まっています
            </p>
          </div>
          <button
            onClick={() => { setDraft(initialMessage); setModalOpen(true) }}
            className="shrink-0 flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 rounded-full shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-105 transition active:scale-95"
          >
            🪧 看板を設定
          </button>
        </div>
      </div>

      {/* Avatars scattered on the plaza */}
      {users.map((u) => {
        const { x, y, scale, z } = layoutFor(u.id)
        const isNew = newIds.has(u.id)
        return (
          <motion.button
            key={u.id}
            onClick={() => setSelected(u)}
            className="absolute flex flex-col items-center group"
            style={{ left: `${x}%`, top: `${y}%`, zIndex: z, transformOrigin: 'bottom center' }}
            initial={isNew ? { opacity: 0, scale: 0, y: -40 } : { opacity: 1, scale, y: 0 }}
            animate={{ opacity: 1, scale, y: 0 }}
            whileHover={{ y: -14 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          >
            <Sign message={u.message} />
            <div className="relative mt-0.5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/10 transition-all duration-200 group-hover:ring-amber-300/70">
                {u.name[0]?.toUpperCase() ?? '?'}
              </div>
              {/* hover glow */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition"
                style={{ boxShadow: '0 0 22px 6px rgba(251,191,36,0.45)' }} />
            </div>
            <p className="text-[11px] text-white mt-1 max-w-[70px] truncate font-semibold"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
              {u.name}
            </p>
            {/* ground shadow */}
            <div className="w-9 h-2 rounded-[50%] bg-black/45 blur-[2px] -mt-0.5" />
          </motion.button>
        )
      })}

      {/* Profile popup */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-dark-elevated/95 backdrop-blur border border-amber-400/30 rounded-2xl p-5 w-full max-w-xs"
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
                  className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold py-2 rounded-full shadow-lg shadow-orange-500/30 hover:scale-105 transition active:scale-95"
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
              <h3 className="font-bold text-white mb-1">🪧 広場の看板メッセージ</h3>
              <p className="text-xs text-slate-500 mb-3">あなたの看板に表示されます（最大18文字推奨）</p>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={60}
                autoFocus
                placeholder="例: 個人開発楽しい!"
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-sm text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-slate-600"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setModalOpen(false)}
                  className="text-sm text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition active:scale-95">
                  キャンセル
                </button>
                <button onClick={saveMessage}
                  className="text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full font-medium shadow-lg shadow-orange-500/30 hover:scale-105 transition active:scale-95">
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
