'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-9xl font-black text-slate-200 mb-2 select-none leading-none">
          500
        </div>
        <h1 className="text-2xl font-bold text-slate-700 mb-2">
          エラーが発生しました
        </h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          一時的な問題が発生しています。しばらく待ってから再試行してください。
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/20"
          >
            再試行する
          </button>
          <Link
            href="/"
            className="bg-white text-slate-600 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition border border-slate-200"
          >
            ホームへ
          </Link>
        </div>
      </div>
    </div>
  )
}
