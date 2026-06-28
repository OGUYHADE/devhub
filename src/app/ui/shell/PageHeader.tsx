import Link from 'next/link'

export default function PageHeader({
  title,
  backHref,
  children,
}: {
  title: string
  backHref?: string
  children?: React.ReactNode
}) {
  return (
    <div className="sticky top-0 z-20 -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 mb-4 bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border/50 flex items-center gap-3">
      {backHref && (
        <Link
          href={backHref}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover transition shrink-0"
          aria-label="戻る"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      )}
      <h1 className="text-base font-bold text-white truncate flex-1 min-w-0">{title}</h1>
      {children}
    </div>
  )
}
