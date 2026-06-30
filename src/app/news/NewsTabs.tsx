'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { timeAgo } from '@/lib/timeago'
import type { NewsItem, NewsSource } from '@/lib/news'

type TabKey = 'hn' | 'devto' | 'zenn'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'hn', label: '🔥 話題（HN）' },
  { key: 'devto', label: '🤖 AI（Dev.to）' },
  { key: 'zenn', label: '🇯🇵 日本語（Zenn）' },
]

const SOURCE_BADGE: Record<NewsSource, string> = {
  hn: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  devto: 'bg-white/10 text-slate-200 border-white/20',
  zenn: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-glow block bg-gradient-to-br from-dark-surface to-dark-elevated rounded-2xl border border-dark-border/60 p-4 sm:p-5 transition-all duration-200 group"
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span
          className={clsx(
            'text-[11px] font-bold px-2 py-0.5 rounded-full border',
            SOURCE_BADGE[item.source]
          )}
        >
          {item.sourceName}
        </span>
        {item.author && (
          <span className="text-xs text-slate-500 font-mono truncate max-w-[160px]">
            {item.author}
          </span>
        )}
        <span className="text-slate-700">·</span>
        <span className="text-xs text-slate-600">{timeAgo(item.publishedAt)}</span>
      </div>

      <h3 className="text-[15px] font-bold text-slate-100 leading-snug group-hover:text-accent-purple-light transition-colors">
        {item.title}
      </h3>

      {item.source === 'hn' && (
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="text-orange-400">▲</span> {item.points ?? 0}
          </span>
          <span className="flex items-center gap-1">💬 {item.comments ?? 0}</span>
        </div>
      )}

      <div className="flex items-center gap-1 mt-3 text-xs text-slate-600 group-hover:text-accent-cyan transition-colors">
        <span>記事を開く</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </div>
    </a>
  )
}

export default function NewsTabs({
  hn,
  devto,
  zenn,
}: {
  hn: NewsItem[]
  devto: NewsItem[]
  zenn: NewsItem[]
}) {
  const [active, setActive] = useState<TabKey>('hn')
  const items: Record<TabKey, NewsItem[]> = { hn, devto, zenn }
  const current = items[active]

  return (
    <div>
      {/* Tabs */}
      <div className="sticky top-0 z-20 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 mb-4 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border/50">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={clsx(
                'shrink-0 text-sm px-4 py-1.5 rounded-full transition font-medium',
                active === key
                  ? 'bg-accent-purple/20 text-accent-purple-light border border-accent-purple/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-dark-hover'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {current.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-400 font-medium">ニュースを取得できませんでした</p>
          <p className="text-slate-600 text-sm mt-1">しばらくしてからもう一度お試しください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {current.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
