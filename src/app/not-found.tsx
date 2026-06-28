import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="rounded-xl border border-dark-border/60 bg-dark-surface overflow-hidden shadow-2xl">
          {/* Terminal title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-dark-elevated border-b border-dark-border/60">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs text-slate-500 font-mono">zsh — devhub — 80×24</span>
          </div>
          {/* Terminal body */}
          <div className="p-6 font-mono text-sm leading-relaxed">
            <p className="text-slate-400">
              <span className="text-accent-emerald">$</span> find / -name &quot;page&quot;
            </p>
            <p className="text-slate-600 mt-1">searching filesystem...</p>
            <p className="text-red-400 mt-1">Error: 404 — page not found</p>
            <p className="text-slate-500 mt-1">
              fatal: the route you requested does not exist
            </p>
            <p className="text-accent-emerald mt-4 terminal-cursor">
              $ cd ~ &amp;&amp; <span className="text-slate-300">return home</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2.5 text-sm font-semibold hover:glow-purple transition active:scale-95"
          >
            ホームに戻る
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full border border-dark-border text-slate-300 px-6 py-2.5 text-sm font-semibold hover:bg-dark-hover transition active:scale-95"
          >
            探す
          </Link>
        </div>
      </div>
    </div>
  )
}
