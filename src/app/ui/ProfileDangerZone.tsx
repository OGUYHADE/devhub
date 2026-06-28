'use client'

import { useState, useTransition } from 'react'
import { deleteAccount } from '@/app/actions'

export default function ProfileDangerZone() {
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm'>('idle')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleDelete() {
    setError('')
    startTransition(async () => {
      try {
        await deleteAccount()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'エラーが発生しました')
        setDeleteStep('idle')
      }
    })
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">アカウント管理</p>
      <div className="space-y-3">
        <a href="/api/export" download="devhub-export.json"
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">データをエクスポート</p>
            <p className="text-xs text-slate-400 mt-0.5">投稿データをJSONファイルでダウンロード</p>
          </div>
          <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </a>

        <div className="border border-red-100 dark:border-red-900 rounded-xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">アカウントを削除</p>
              <p className="text-xs text-slate-400 mt-0.5">全データが完全に削除されます。この操作は取り消せません</p>
            </div>
            {deleteStep === 'idle' && (
              <button onClick={() => setDeleteStep('confirm')}
                className="text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 transition shrink-0 ml-3">
                削除する
              </button>
            )}
          </div>
          {deleteStep === 'confirm' && (
            <div className="bg-red-50 dark:bg-red-950 border-t border-red-100 dark:border-red-900 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">本当に削除しますか？</p>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setDeleteStep('idle')}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition">
                  キャンセル
                </button>
                <button onClick={handleDelete} disabled={isPending}
                  className="text-xs bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-60">
                  {isPending ? '削除中...' : '完全に削除'}
                </button>
              </div>
            </div>
          )}
          {error && <p className="text-xs text-red-500 px-4 pb-3">{error}</p>}
        </div>
      </div>
    </div>
  )
}
