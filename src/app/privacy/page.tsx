import Link from 'next/link'

export const metadata = { title: 'プライバシーポリシー | DevHub' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/40 group-hover:bg-indigo-400 transition">
              <span className="text-white font-black text-xs">{'</>'}</span>
            </div>
            <span className="text-lg font-black text-white tracking-tight">DevHub</span>
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition">← トップ</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h1 className="text-2xl font-black text-slate-800 mb-2">プライバシーポリシー</h1>
          <p className="text-xs text-slate-400 mb-8">最終更新：2026年6月28日</p>

          <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">1. 収集する情報</h2>
              <p className="mb-2">本サービスでは以下の情報を収集します。</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>メールアドレス（アカウント登録時）</li>
                <li>表示名、自己紹介、GitHubリンク、X（Twitter）リンク（任意）</li>
                <li>投稿内容（テキスト、進捗、カテゴリ）</li>
                <li>リスペクト（いいね）の履歴</li>
                <li>アクセスログ（IPアドレス、ブラウザ情報等）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">2. 情報の利用目的</h2>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>本サービスの提供・運営</li>
                <li>ユーザーサポート</li>
                <li>サービスの改善・分析</li>
                <li>不正利用の防止</li>
                <li>重要なお知らせの送信</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">3. 情報の共有</h2>
              <p>
                DevHubは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 mt-2">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく開示が求められた場合</li>
                <li>サービス運営に必要なサービスプロバイダー（Supabase等）への提供</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">4. データの保存</h2>
              <p>
                ユーザーデータはSupabase（米国）のサーバーに保存されます。
                Supabaseのプライバシーポリシーについては、Supabaseの公式サイトをご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">5. Cookieの利用</h2>
              <p>
                本サービスは認証のためにCookieを使用します。ブラウザの設定でCookieを無効にした場合、
                ログイン機能が正常に動作しない場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">6. ユーザーの権利</h2>
              <p className="mb-2">ユーザーは以下の権利を有します。</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>自分のデータへのアクセス・修正</li>
                <li>投稿の編集・削除</li>
                <li>アカウントの削除（プロフィールページより）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">7. お問い合わせ</h2>
              <p>
                プライバシーに関するご質問は、サービス内のお問い合わせフォームよりご連絡ください。
              </p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <Link href="/terms" className="text-sm text-indigo-600 hover:text-indigo-700 transition">
              利用規約を読む →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
