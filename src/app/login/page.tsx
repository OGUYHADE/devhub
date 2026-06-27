import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default function LoginPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">DevHub</h1>
        <form action={login} className="flex flex-col gap-4">
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
            placeholder="パスワード"
            required
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-indigo-700 transition"
          >
            ログイン
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
