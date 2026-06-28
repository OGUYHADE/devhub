export type BoardCategory = '質問・相談' | '作品紹介' | 'コラボ募集' | '雑談' | 'アドバイス求む'

export const BOARD_CATEGORIES: BoardCategory[] = [
  '質問・相談',
  '作品紹介',
  'コラボ募集',
  '雑談',
  'アドバイス求む',
]

export const BOARD_CATEGORY_META: Record<BoardCategory, { icon: string; color: string; bg: string }> = {
  '質問・相談':    { icon: '❓', color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-950' },
  '作品紹介':      { icon: '🎨', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950' },
  'コラボ募集':    { icon: '🤝', color: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-950' },
  '雑談':          { icon: '💬', color: 'text-slate-600 dark:text-slate-400',   bg: 'bg-slate-50 dark:bg-slate-800' },
  'アドバイス求む': { icon: '💡', color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-950' },
}
