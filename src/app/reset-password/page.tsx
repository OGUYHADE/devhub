import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions'

export const metadata = { title: 'パスワードリセット' }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>
}) {
  const { sent, error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">{'</>'}</span>
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">DevHub</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-800">パスワードリセット</h1>
          <p className="text-sm text-slate-500 mt-1">
            登録済みのメールアドレスにリセットリンクを送信します
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📬</div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">メールを送信しました</h2>
              <p className="text-sm text-slate-500 mb-6">
                リセットリンクが届いていない場合は迷惑メールフォルダをご確認ください。
              </p>
              <Link href="/login" className="text-sm text-indigo-600 hover:underline">
                ログインページに戻る
              </Link>
            </div>
          ) : (
            <form action={requestPasswordReset} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  {decodeURIComponent(error)}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  メールアドレス
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 placeholder:text-slate-400 transition"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/30"
              >
                リセットリンクを送信
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          <Link href="/login" className="text-indigo-600 hover:underline">
            ← ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
