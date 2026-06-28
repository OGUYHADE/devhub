export function calculateStreak(postDates: string[]): { current: number; max: number } {
  if (!postDates.length) return { current: 0, max: 0 }

  const unique = [...new Set(postDates)].sort()

  let max = 1, run = 1
  for (let i = 1; i < unique.length; i++) {
    const diff = Math.round(
      (new Date(unique[i]).getTime() - new Date(unique[i - 1]).getTime()) / 86400000
    )
    if (diff === 1) { run++; if (run > max) max = run }
    else run = 1
  }

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  if (!unique.includes(today) && !unique.includes(yesterday)) {
    return { current: 0, max }
  }

  let check = unique.includes(today) ? today : yesterday
  let current = 0
  for (let i = unique.length - 1; i >= 0; i--) {
    if (unique[i] === check) {
      current++
      const d = new Date(check)
      d.setDate(d.getDate() - 1)
      check = d.toISOString().slice(0, 10)
    } else if (unique[i] < check) {
      break
    }
  }

  return { current, max }
}
