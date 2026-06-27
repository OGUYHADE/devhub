import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'ログイン' }

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  async function login(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
    if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
    redirect('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/40">
              <span className="text-white font-black text-sm">{'</>'}</span>
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">DevHub</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-800">おかえりなさい</h1>
          <p className="text-sm text-slate-500 mt-1">アカウントにログインしてください</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form action={login} className="flex flex-col gap-4">
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
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600">
                  パスワード
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-indigo-600 hover:underline"
                >
                  パスワードを忘れた方
                </Link>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 placeholder:text-slate-400 transition"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/30 mt-1"
            >
              ログイン
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" className="text-indigo-600 hover:underline font-medium">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
