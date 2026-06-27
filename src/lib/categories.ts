export const CATEGORIES = ['Web', 'アプリ', 'ゲーム', 'AI/ML', 'その他'] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_STYLE: Record<Category, { bg: string; text: string }> = {
  'Web':   { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  'アプリ': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'ゲーム': { bg: 'bg-green-100',  text: 'text-green-700'  },
  'AI/ML': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'その他': { bg: 'bg-gray-100',   text: 'text-gray-600'   },
}
