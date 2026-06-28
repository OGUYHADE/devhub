'use client'

import { useState } from 'react'

export default function AnnouncementBanner({ message }: { message: string }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm shrink-0">📢</span>
        <p className="text-sm font-medium truncate">{message}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-indigo-200 hover:text-white transition shrink-0 p-0.5"
        aria-label="閉じる"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}
