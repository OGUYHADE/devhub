import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: '新規登録' }

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  async function signup(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      options: {
        data: { display_name: formData.get('display_name') as string },
      },
    })
    if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`)
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
          <h1 className="text-2xl font-black text-slate-800">アカウントを作成</h1>
          <p className="text-sm text-slate-500 mt-1">無料で始められます</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <form action={signup} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                表示名
              </label>
              <input
                type="text"
                name="display_name"
                placeholder="オグヤデ"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 placeholder:text-slate-400 transition"
              />
            </div>
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
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                パスワード
              </label>
              <input
                type="password"
                name="password"
                placeholder="8文字以上"
                minLength={8}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 placeholder:text-slate-400 transition"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/30 mt-1"
            >
              登録する
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
