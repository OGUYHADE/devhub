import Link from 'next/link'

export const metadata = { title: '利用規約 | DevHub' }

export default function TermsPage() {
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
          <h1 className="text-2xl font-black text-slate-800 mb-2">利用規約</h1>
          <p className="text-xs text-slate-400 mb-8">最終更新：2026年6月28日</p>

          <div className="space-y-8 text-sm text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">第1条（適用）</h2>
              <p>
                本規約は、DevHub（以下「本サービス」）を利用するすべてのユーザー（以下「ユーザー」）に適用されます。
                ユーザーは、本サービスに登録または利用を開始した時点で本規約に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">第2条（禁止事項）</h2>
              <p className="mb-2">ユーザーは以下の行為を行ってはなりません。</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>法令または公序良俗に違反する行為</li>
                <li>他のユーザーへの誹謗中傷、嫌がらせ、差別的表現を含む投稿</li>
                <li>虚偽の情報の投稿</li>
                <li>スパム、迷惑メッセージの送信</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>他者の知的財産権、プライバシーを侵害する行為</li>
                <li>不正アクセス、ハッキング等の行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">第3条（コンテンツ）</h2>
              <p>
                ユーザーが本サービスに投稿したコンテンツの著作権はユーザー本人に帰属します。
                ただし、ユーザーは本サービスに対し、コンテンツを本サービス内で表示・提供するための
                非独占的なライセンスを付与するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">第4条（免責事項）</h2>
              <p>
                本サービスは現状有姿で提供されます。サービスの中断、データの損失、その他のトラブルについて、
                DevHubは可能な限り対応しますが、いかなる場合においても損害賠償責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">第5条（サービスの変更・終了）</h2>
              <p>
                DevHubは、ユーザーへの事前通知なく、本サービスの内容を変更または終了することがあります。
                これによりユーザーに損害が生じた場合でも、DevHubは責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">第6条（規約の変更）</h2>
              <p>
                DevHubは、必要と判断した場合に本規約を変更できます。変更後の規約はサービス上での公表をもって効力を生じます。
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-800 mb-3">第7条（準拠法）</h2>
              <p>本規約は日本法に準拠し、解釈されます。</p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <Link href="/privacy" className="text-sm text-indigo-600 hover:text-indigo-700 transition">
              プライバシーポリシーを読む →
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
