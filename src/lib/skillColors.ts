// Maps a skill/tech name to accent classes for pill badges.
const MAP: Record<string, string> = {
  react: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'react native': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  nextjs: 'bg-slate-200/10 text-slate-200 border-slate-400/30',
  'next.js': 'bg-slate-200/10 text-slate-200 border-slate-400/30',
  vue: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  svelte: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  angular: 'bg-red-500/15 text-red-300 border-red-500/30',
  typescript: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  javascript: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  python: 'bg-yellow-400/15 text-yellow-200 border-yellow-400/30',
  rust: 'bg-orange-600/15 text-orange-300 border-orange-600/30',
  go: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  golang: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  java: 'bg-red-600/15 text-red-300 border-red-600/30',
  kotlin: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  swift: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  ruby: 'bg-red-500/15 text-red-300 border-red-500/30',
  php: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  'c++': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  'c#': 'bg-green-600/15 text-green-300 border-green-600/30',
  dart: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  flutter: 'bg-sky-400/15 text-sky-200 border-sky-400/30',
  docker: 'bg-blue-400/15 text-blue-200 border-blue-400/30',
  kubernetes: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  aws: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  supabase: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  firebase: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  postgresql: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  tailwind: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'tailwindcss': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
}

export function skillColor(skill: string): string {
  return MAP[skill.toLowerCase().trim()] ?? 'bg-accent-purple/15 text-accent-purple-light border-accent-purple/30'
}
