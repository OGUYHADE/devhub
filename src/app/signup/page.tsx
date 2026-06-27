import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default function SignupPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">DevHub 新規登録</h1>
        <form action={signup} className="flex flex-col gap-4">
          <input
            type="text"
            name="display_name"
            placeholder="表示名"
            required
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            name="email"
            placeholder="メールアドレス"
            required
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            name="password"
            placeholder="パスワード（8文字以上）"
            minLength={8}
            required
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition"
          >
            登録する
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
