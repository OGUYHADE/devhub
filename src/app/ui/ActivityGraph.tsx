'use client'

type Props = { postDates: string[] }

export default function ActivityGraph({ postDates }: Props) {
  const counts = new Map<string, number>()
  for (const d of postDates) counts.set(d, (counts.get(d) ?? 0) + 1)

  // Last 30 days, oldest first
  const cells: { date: string; count: number }[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    cells.push({ date: dateStr, count: counts.get(dateStr) ?? 0 })
  }

  function color(count: number) {
    if (count === 0) return 'rgb(42 42 58)' // dark-border
    if (count === 1) return 'rgba(124,58,237,0.5)'
    if (count === 2) return 'rgba(124,58,237,0.7)'
    return 'rgba(124,58,237,0.95)'
  }

  return (
    <div>
      <div className="grid grid-cols-6 gap-2 w-fit">
        {cells.map(({ date, count }, i) => {
          const label = new Date(date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
          return (
            <div
              key={i}
              title={`${label}: ${count}件`}
              className="w-8 h-8 rounded-md transition-transform hover:scale-110 hover:ring-1 hover:ring-accent-purple cursor-default"
              style={{ backgroundColor: color(count) }}
            />
          )
        })}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
        <span>少</span>
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="w-3.5 h-3.5 rounded" style={{ backgroundColor: color(n) }} />
        ))}
        <span>多</span>
        <span className="ml-auto font-mono">過去30日</span>
      </div>
    </div>
  )
}
