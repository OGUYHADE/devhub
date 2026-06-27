'use client'

import { useState } from 'react'
import { createPost } from '@/app/actions'
import { CATEGORIES, CATEGORY_STYLE, type Category } from '@/lib/categories'

function progressColor(value: number) {
  if (value === 100) return '#22c55e'
  if (value >= 67) return '#6366f1'
  if (value >= 34) return '#f59e0b'
  return '#f97316'
}

export default function PostForm() {
  const [showProgress, setShowProgress] = useState(false)
  const [progress, setProgress] = useState(50)
  const [category, setCategory] = useState<Category | null>(null)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <p className="text-sm font-semibold text-slate-700 mb-3">今日の進捗を共有しよう</p>
      <form action={createPost} className="flex flex-col gap-3">
        <textarea
          name="content"
          rows={3}
          placeholder="何を作った？何を学んだ？"
          required
          maxLength={500}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 placeholder:text-slate-400 transition"
        />

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const style = CATEGORY_STYLE[cat]
            const selected = category === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(selected ? null : cat)}
                className={`text-xs px-3 py-1 rounded-full border transition font-medium
                  ${selected
                    ? `${style.bg} ${style.text} border-transparent shadow-sm`
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'
                  }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
        <input type="hidden" name="category" value={category ?? ''} />

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={showProgress}
            onChange={(e) => setShowProgress(e.target.checked)}
            className="rounded accent-indigo-500"
          />
          <span className="text-xs text-slate-500">進捗バーを追加</span>
        </label>

        {showProgress && (
          <div className="space-y-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: progressColor(progress) }}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                name="progress"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="flex-1 accent-indigo-500"
              />
              <span className="text-sm font-bold w-10 text-right" style={{ color: progressColor(progress) }}>
                {progress}%
              </span>
            </div>
          </div>
        )}
        {!showProgress && <input type="hidden" name="progress" value="" />}

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 text-white text-sm font-semibold px-6 py-2 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition shadow-sm shadow-indigo-600/30"
          >
            投稿する
          </button>
        </div>
      </form>
    </div>
  )
}
