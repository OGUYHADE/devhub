type Props = { postDates: string[] }

function cellColor(count: number): string {
  if (count === 0) return '#e2e8f0'   // slate-200
  if (count === 1) return '#c7d2fe'   // indigo-200
  if (count === 2) return '#818cf8'   // indigo-400
  return '#4f46e5'                    // indigo-600
}

export default function ActivityGraph({ postDates }: Props) {
  const counts = new Map<string, number>()
  for (const d of postDates) counts.set(d, (counts.get(d) ?? 0) + 1)

  const today = new Date()
  // Align start to the Sunday 52 weeks before today's week-start
  const firstDay = new Date(today)
  firstDay.setDate(firstDay.getDate() - 52 * 7)
  firstDay.setDate(firstDay.getDate() - firstDay.getDay()) // back to Sunday

  // Fill to end of current week (Saturday)
  const endDay = new Date(today)
  endDay.setDate(endDay.getDate() + (6 - today.getDay()))

  type Cell = { date: string; count: number; future: boolean }
  const cells: Cell[] = []
  const cursor = new Date(firstDay)
  while (cursor <= endDay) {
    const isFuture = cursor > today
    const dateStr = cursor.toISOString().slice(0, 10)
    cells.push({ date: dateStr, count: counts.get(dateStr) ?? 0, future: isFuture })
    cursor.setDate(cursor.getDate() + 1)
  }

  // Build month labels: find first column index for each month
  type MonthLabel = { label: string; col: number }
  const monthLabels: MonthLabel[] = []
  for (let i = 0; i < cells.length; i++) {
    if (i % 7 === 0) {
      const d = new Date(cells[i].date)
      const month = d.getMonth()
      const prev = i > 0 ? new Date(cells[i - 7]?.date ?? '').getMonth() : -1
      if (month !== prev) {
        monthLabels.push({
          label: `${d.getMonth() + 1}月`,
          col: Math.floor(i / 7),
        })
      }
    }
  }

  const totalCols = Math.ceil(cells.length / 7)

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${totalCols}, 14px)`,
          gap: '2px',
          marginBottom: '4px',
        }}
      >
        {Array.from({ length: totalCols }).map((_, col) => {
          const label = monthLabels.find((m) => m.col === col)
          return (
            <div key={col} className="text-xs text-slate-400 leading-none h-3 overflow-visible whitespace-nowrap">
              {label?.label}
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: 'repeat(7, 12px)',
          gridAutoFlow: 'column',
          gap: '2px',
          width: 'fit-content',
        }}
      >
        {cells.map(({ date, count, future }, i) => (
          <div
            key={i}
            title={future ? undefined : `${date}: ${count}件`}
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              backgroundColor: future ? 'transparent' : cellColor(count),
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-xs text-slate-400">少</span>
        {[0, 1, 2, 3].map((n) => (
          <div
            key={n}
            style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: cellColor(n) }}
          />
        ))}
        <span className="text-xs text-slate-400">多</span>
      </div>
    </div>
  )
}
