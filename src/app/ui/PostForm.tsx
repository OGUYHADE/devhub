'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createPost } from '@/app/actions'
import { CATEGORIES, type Category } from '@/lib/categories'
import { ImageIcon, CodeIcon, TagIcon, GitHubIcon } from './icons'

const DRAFT_KEY = 'devhub_draft'
const MAX = 500

function CharCounter({ count }: { count: number }) {
  const remaining = MAX - count
  const pct = Math.min(count / MAX, 1)
  const r = 9
  const circ = 2 * Math.PI * r
  const danger = remaining <= 50
  const color = remaining < 0 ? '#ef4444' : danger ? '#f59e0b' : '#7c3aed'
  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      <svg width="24" height="24" className="-rotate-90">
        <circle cx="12" cy="12" r={r} fill="none" stroke="#2a2a3a" strokeWidth="2.5" />
        <circle
          cx="12" cy="12" r={r} fill="none" stroke={color} strokeWidth="2.5"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.2s, stroke 0.2s' }}
        />
      </svg>
      {danger && (
        <span className={`absolute text-[9px] font-mono font-bold ${remaining < 0 ? 'text-red-400' : 'text-amber-400'}`}>
          {remaining}
        </span>
      )}
    </div>
  )
}

export default function PostForm() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<Category | null>(null)
  const [isPublic, setIsPublic] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showGithub, setShowGithub] = useState(false)
  const [techStack, setTechStack] = useState<string[]>([])
  const [techInput, setTechInput] = useState('')
  const [showTechInput, setShowTechInput] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) setContent(saved)
  }, [])

  function handleContentChange(v: string) {
    setContent(v)
    if (v.trim()) localStorage.setItem(DRAFT_KEY, v)
    else localStorage.removeItem(DRAFT_KEY)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) { setImagePreview(null); return }
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function insertCodeBlock() {
    const ta = textareaRef.current
    const snippet = '\n```\n\n```\n'
    const next = content + snippet
    handleContentChange(next)
    setTimeout(() => { ta?.focus() }, 0)
  }

  function addTech() {
    const t = techInput.trim()
    if (t && !techStack.includes(t) && techStack.length < 8) {
      setTechStack([...techStack, t])
    }
    setTechInput('')
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (content.length > MAX) { toast.error('文字数オーバーです'); return }
    const fd = new FormData(e.currentTarget)
    fd.set('tech_stack', JSON.stringify(techStack))
    startTransition(async () => {
      try {
        await createPost(fd)
        localStorage.removeItem(DRAFT_KEY)
        setContent('')
        setCategory(null)
        setIsPublic(true)
        setImagePreview(null)
        setShowGithub(false)
        setTechStack([])
        setShowTechInput(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        router.refresh()
        toast.success('投稿しました!')
      } catch (err) {
        toast.error('投稿に失敗しました: ' + (err instanceof Error ? err.message : String(err)))
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-dark-surface border border-dark-border/60 rounded-2xl p-5 mb-4"
    >
      <textarea
        ref={textareaRef}
        name="content"
        rows={3}
        placeholder="何を作ってる? 今日の進捗をシェアしよう..."
        required
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        className="w-full bg-transparent border-none resize-none text-[15px] text-slate-100 placeholder:text-slate-600 focus:outline-none leading-relaxed"
      />

      {/* Image preview */}
      {imagePreview && (
        <div className="relative rounded-xl overflow-hidden border border-dark-border/60 my-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview} alt="プレビュー" className="w-full max-h-52 object-cover" />
          <button type="button" onClick={clearImage}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-black/80 transition">
            ✕
          </button>
        </div>
      )}

      {/* Tech stack chips */}
      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 my-2">
          {techStack.map((t) => (
            <span key={t} className="flex items-center gap-1 bg-dark-elevated border border-dark-border text-slate-400 text-xs px-2 py-0.5 rounded-md font-mono">
              {t}
              <button type="button" onClick={() => setTechStack(techStack.filter((x) => x !== t))} className="hover:text-red-400">✕</button>
            </span>
          ))}
        </div>
      )}
      {showTechInput && (
        <input
          value={techInput}
          onChange={(e) => setTechInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTech() } }}
          onBlur={addTech}
          placeholder="技術を入力してEnter (例: React)"
          className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono my-2 focus:outline-none focus:ring-1 focus:ring-accent-purple placeholder:text-slate-600"
        />
      )}

      {/* GitHub link */}
      {showGithub && (
        <input
          type="url"
          name="github_url"
          placeholder="https://github.com/user/repo"
          className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono my-2 focus:outline-none focus:ring-1 focus:ring-accent-purple placeholder:text-slate-600"
        />
      )}
      {!showGithub && <input type="hidden" name="github_url" value="" />}

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {CATEGORIES.map((cat) => {
          const selected = category === cat
          return (
            <button key={cat} type="button" onClick={() => setCategory(selected ? null : cat)}
              className={`text-xs px-2.5 py-1 rounded-full border transition font-medium active:scale-95 ${
                selected
                  ? 'bg-accent-purple/20 text-accent-purple-light border-accent-purple/40'
                  : 'bg-transparent text-slate-500 border-dark-border hover:border-accent-purple/40 hover:text-slate-300'
              }`}>
              # {cat}
            </button>
          )
        })}
      </div>
      <input type="hidden" name="category" value={category ?? ''} />
      <input type="hidden" name="progress" value="" />
      <input type="hidden" name="demo_url" value="" />
      <input type="hidden" name="is_public" value={isPublic ? 'true' : 'false'} />
      <input ref={fileInputRef} type="file" name="image" accept="image/*" onChange={handleImageChange} className="hidden" />

      {/* Toolbar */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-border/50">
        <div className="flex items-center gap-1 text-slate-500">
          <button type="button" onClick={() => fileInputRef.current?.click()} title="画像添付"
            className="p-2 rounded-lg hover:bg-accent-purple/10 hover:text-accent-purple transition active:scale-95">
            <ImageIcon size={18} />
          </button>
          <button type="button" onClick={insertCodeBlock} title="コードブロック"
            className="p-2 rounded-lg hover:bg-accent-purple/10 hover:text-accent-purple transition active:scale-95">
            <CodeIcon size={18} />
          </button>
          <button type="button" onClick={() => setShowTechInput((v) => !v)} title="技術スタック"
            className={`p-2 rounded-lg hover:bg-accent-purple/10 hover:text-accent-purple transition active:scale-95 ${showTechInput ? 'text-accent-purple' : ''}`}>
            <TagIcon size={18} />
          </button>
          <button type="button" onClick={() => setShowGithub((v) => !v)} title="GitHubリンク"
            className={`p-2 rounded-lg hover:bg-accent-purple/10 hover:text-accent-purple transition active:scale-95 ${showGithub ? 'text-accent-purple' : ''}`}>
            <GitHubIcon size={18} />
          </button>
          <button type="button" onClick={() => setIsPublic((v) => !v)} title={isPublic ? '公開' : '非公開'}
            className="p-2 rounded-lg hover:bg-dark-hover transition active:scale-95 text-sm">
            {isPublic ? '🌐' : '🔒'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <CharCounter count={content.length} />
          <button type="submit" disabled={isPending || !content.trim() || content.length > MAX}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition-all hover:glow-purple disabled:opacity-50 disabled:hover:shadow-none active:scale-95">
            {isPending ? '投稿中...' : '投稿'}
          </button>
        </div>
      </div>
    </form>
  )
}
