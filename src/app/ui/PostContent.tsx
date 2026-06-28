'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const YT_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const CODE_BLOCK_REGEX = /(```[\s\S]*?```)/g
const URL_REGEX = /(https?:\/\/[^\s]+)/g

function parseCodeBlock(raw: string): { lang: string; code: string } {
  const inner = raw.slice(3, -3)
  const firstNewline = inner.indexOf('\n')
  if (firstNewline === -1) return { lang: '', code: inner.trim() }
  const firstLine = inner.slice(0, firstNewline).trim()
  const isLang = /^[a-zA-Z0-9+#-]{1,20}$/.test(firstLine)
  return {
    lang: isLang ? firstLine : '',
    code: isLang ? inner.slice(firstNewline + 1) : inner,
  }
}

function renderInline(text: string) {
  // Split on hashtags and URLs
  const parts = text.split(/(#[\w぀-鿿＀-￯]+|https?:\/\/[^\s]+)/g)
  return parts.map((part, i) => {
    if (/^#[\w぀-鿿＀-￯]+$/.test(part)) {
      return (
        <Link
          key={i}
          href={`/search?q=${encodeURIComponent(part)}`}
          className="text-accent-purple-light hover:text-accent-purple font-medium transition"
        >
          {part}
        </Link>
      )
    }
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-cyan underline underline-offset-2 hover:text-accent-cyan/80 transition break-all"
        >
          {part}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function renderSegments(text: string) {
  const parts = text.split(CODE_BLOCK_REGEX)
  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const { lang, code } = parseCodeBlock(part)
      return (
        <div
          key={i}
          className="my-3 rounded-xl overflow-hidden border border-dark-border/60 border-l-4 border-l-accent-purple/50 bg-dark-bg"
        >
          {lang && (
            <div className="px-4 py-1.5 text-xs font-mono text-slate-500 border-b border-dark-border/50">
              {lang}
            </div>
          )}
          <SyntaxHighlighter
            language={lang || 'text'}
            style={oneDark}
            customStyle={{
              margin: 0,
              background: 'transparent',
              padding: '1rem',
              fontSize: '0.75rem',
              lineHeight: 1.6,
            }}
            codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
          >
            {code.replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      )
    }
    return (
      <span key={i} className="whitespace-pre-wrap">
        {renderInline(part)}
      </span>
    )
  })
}

const COLLAPSE_THRESHOLD = 200

export default function PostContent({ content }: { content: string }) {
  const ytMatch = content.match(YT_REGEX)
  const ytId = ytMatch?.[1]
  const hasCodeBlock = CODE_BLOCK_REGEX.test(content)
  CODE_BLOCK_REGEX.lastIndex = 0

  const isLong = content.length > COLLAPSE_THRESHOLD && !hasCodeBlock
  const [expanded, setExpanded] = useState(!isLong)

  const displayContent = expanded ? content : content.slice(0, COLLAPSE_THRESHOLD)

  return (
    <>
      <div className="text-[15px] text-slate-200 mb-3 leading-relaxed">
        {renderSegments(displayContent)}
        {!expanded && <span className="text-slate-500">...</span>}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-accent-purple-light hover:text-accent-purple font-medium mb-3 transition"
        >
          {expanded ? '折りたたむ' : '続きを読む'}
        </button>
      )}
      {ytId && (
        <a
          href={`https://www.youtube.com/watch?v=${ytId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative rounded-xl overflow-hidden mb-4 group aspect-video bg-dark-elevated border border-dark-border/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
            alt="YouTube動画"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition flex items-center justify-center">
            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-xl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        </a>
      )}
    </>
  )
}
