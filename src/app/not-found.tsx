import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-9xl font-black text-slate-200 mb-2 select-none leading-none">
          404
        </div>
        <h1 className="text-2xl font-bold text-slate-700 mb-2">
          ページが見つかりません
        </h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          お探しのページは存在しないか、削除されました。
        </p>
        <Link
          href="/"
          className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/20"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}
