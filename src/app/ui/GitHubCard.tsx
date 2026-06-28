'use client'

import { useEffect, useState } from 'react'

type RepoData = {
  name: string
  full_name: string
  description: string | null
  stargazers_count: number
  language: string | null
  html_url: string
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Dart: '#00B4AB',
  Vue: '#41b883',
}

export default function GitHubCard({ url }: { url: string }) {
  const [repo, setRepo] = useState<RepoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const match = url.match(/github\.com\/([^\/\s#?]+\/[^\/\s#?]+)/)
    if (!match) {
      setLoading(false)
      return
    }
    const repoSlug = match[1].replace(/\/$/, '')
    fetch(`/api/github-repo?repo=${encodeURIComponent(repoSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setRepo(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [url])

  if (loading) {
    return (
      <div className="mt-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3 animate-pulse bg-slate-50 dark:bg-slate-800/50 h-16" />
    )
  }
  if (!repo) return null

  const langColor = repo.language ? (LANG_COLORS[repo.language] ?? '#8b8b8b') : null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition group no-underline"
    >
      <svg
        className="w-5 h-5 shrink-0 mt-0.5 text-slate-600 dark:text-slate-400"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
          {repo.full_name}
        </p>
        {repo.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
            {repo.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
          {repo.language && (
            <span className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                style={{ backgroundColor: langColor ?? '#8b8b8b' }}
              />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-amber-400"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {repo.stargazers_count.toLocaleString()}
          </span>
        </div>
      </div>
    </a>
  )
}
