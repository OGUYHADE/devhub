'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/app/actions'

type Props = {
  displayName: string
  bio: string
  githubUrl: string
  twitterUrl: string
  skills: string[]
}

export default function ProfileEditForm({ displayName, bio, githubUrl, twitterUrl, skills }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [skillInput, setSkillInput] = useState('')
  const [skillList, setSkillList] = useState<string[]>(skills)

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault()
      const tag = skillInput.trim().replace(/^#/, '')
      if (tag && !skillList.includes(tag) && skillList.length < 10) {
        setSkillList([...skillList, tag])
      }
      setSkillInput('')
    }
    if (e.key === 'Backspace' && !skillInput && skillList.length > 0) {
      setSkillList(skillList.slice(0, -1))
    }
  }

  function removeSkill(tag: string) {
    setSkillList(skillList.filter((s) => s !== tag))
  }

  function handleSubmit(formData: FormData) {
    formData.set('skills', JSON.stringify(skillList))
    startTransition(async () => {
      await updateProfile(formData)
      setOpen(false)
    })
  }

  if (!open) {
    return (
      <div className="flex justify-center mt-4">
        <button onClick={() => setOpen(true)}
          className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-5 py-2 rounded-xl transition">
          プロフィールを編集
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 -mt-2">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
        <p className="text-sm font-semibold text-slate-300 mb-4">プロフィールを編集</p>
        <form action={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">表示名</label>
            <input type="text" name="display_name" defaultValue={displayName} required maxLength={30}
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">自己紹介</label>
            <textarea name="bio" defaultValue={bio} rows={3} maxLength={200}
              placeholder="何を作っている人？どんな技術が好き？"
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition" />
          </div>

          {/* スキルタグ */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">スキルタグ <span className="text-slate-600">（Enterで追加、最大10個）</span></label>
            <div className="flex flex-wrap gap-1.5 items-center bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 min-h-[40px] focus-within:ring-2 focus-within:ring-indigo-500">
              {skillList.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-indigo-900/60 text-indigo-300 text-xs px-2.5 py-1 rounded-full font-medium">
                  {tag}
                  <button type="button" onClick={() => removeSkill(tag)} className="hover:text-white transition leading-none">×</button>
                </span>
              ))}
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={skillList.length < 10 ? 'React, TypeScript...' : ''}
                disabled={skillList.length >= 10}
                className="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">GitHub URL</label>
              <input type="url" name="github_url" defaultValue={githubUrl} placeholder="https://github.com/..."
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">X (Twitter) URL</label>
              <input type="url" name="twitter_url" defaultValue={twitterUrl} placeholder="https://x.com/..."
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setOpen(false)}
              className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl transition">
              キャンセル
            </button>
            <button type="submit" disabled={isPending}
              className="text-sm bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-500 transition font-medium disabled:opacity-60">
              {isPending ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
