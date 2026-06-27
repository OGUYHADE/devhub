'use client'

import { useState } from 'react'
import { createPost } from '@/app/actions'
import { CATEGORIES, CATEGORY_STYLE, type Category } from '@/lib/categories'

export default function PostForm() {
  const [showProgress, setShowProgress] = useState(false)
  const [progress, setProgress] = useState(50)
  const [category, setCategory] = useState<Category | null>(null)

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <p className="text-sm font-medium text-gray-700 mb-2">今日の進捗を共有しよう</p>
      <form action={createPost} className="flex flex-col gap-3">
        <textarea
          name="content"
          rows={3}
          placeholder="何を作った？何を学んだ？"
          required
          maxLength={500}
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* カテゴリ選択 */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const style = CATEGORY_STYLE[cat]
            const selected = category === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(selected ? null : cat)}
                className={`text-xs px-2.5 py-1 rounded-full border transition
                  ${selected
                    ? `${style.bg} ${style.text} border-transparent font-medium`
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
        <input type="hidden" name="category" value={category ?? ''} />

        {/* 進捗バートグル */}
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={showProgress}
            onChange={(e) => setShowProgress(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-gray-500">進捗バーを追加</span>
        </label>

        {showProgress && (
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
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
              <span className="text-sm font-medium w-10 text-right">{progress}%</span>
            </div>
          </div>
        )}
        {!showProgress && <input type="hidden" name="progress" value="" />}

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-indigo-600 text-white text-sm font-medium px-5 py-1.5 rounded-lg hover:bg-indigo-700 transition"
          >
            投稿する
          </button>
        </div>
      </form>
    </div>
  )
}

function progressColor(value: number) {
  if (value === 100) return '#22c55e'
  if (value >= 67)  return '#6366f1'
  if (value >= 34)  return '#f59e0b'
  return '#f97316'
}
