'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon } from '../icons'

export default function SearchBox() {
  const [q, setQ] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim()) return
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
        <SearchIcon size={16} />
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="検索..."
        className="w-full bg-dark-elevated rounded-full pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 border border-transparent focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/40 transition"
      />
    </form>
  )
}
