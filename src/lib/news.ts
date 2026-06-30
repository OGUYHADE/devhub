import Parser from 'rss-parser'

export type NewsSource = 'hn' | 'devto' | 'zenn'

export type NewsItem = {
  id: string
  title: string
  url: string
  source: NewsSource
  sourceName: string
  /** ISO timestamp */
  publishedAt: string
  points?: number
  comments?: number
  author?: string
}

const REVALIDATE = 1800 // 30 min

/** Hacker News top stories (top 30) */
export async function fetchHackerNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) throw new Error(`HN topstories ${res.status}`)
    const ids: number[] = await res.json()

    const items = await Promise.all(
      ids.slice(0, 30).map(async (id) => {
        const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          next: { revalidate: REVALIDATE },
        })
        if (!r.ok) return null
        return r.json()
      })
    )

    return items
      .filter((it): it is Record<string, unknown> => !!it && typeof it.title === 'string')
      .map((it) => {
        const id = String(it.id)
        return {
          id: `hn-${id}`,
          title: it.title as string,
          url: (it.url as string) || `https://news.ycombinator.com/item?id=${id}`,
          source: 'hn' as const,
          sourceName: 'Hacker News',
          publishedAt: new Date((it.time as number) * 1000).toISOString(),
          points: typeof it.score === 'number' ? it.score : 0,
          comments: typeof it.descendants === 'number' ? it.descendants : 0,
          author: it.by as string | undefined,
        }
      })
  } catch (err) {
    console.error('[news] Hacker News fetch failed:', err)
    return []
  }
}

/** Dev.to AI-tagged articles */
export async function fetchDevTo(): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://dev.to/api/articles?tag=ai&per_page=20', {
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) throw new Error(`Dev.to ${res.status}`)
    const articles: Array<Record<string, unknown>> = await res.json()

    return articles.map((a) => ({
      id: `devto-${a.id}`,
      title: a.title as string,
      url: a.url as string,
      source: 'devto' as const,
      sourceName: 'DEV',
      publishedAt: a.published_at as string,
      author: (a.user as { name?: string } | undefined)?.name,
    }))
  } catch (err) {
    console.error('[news] Dev.to fetch failed:', err)
    return []
  }
}

let zennParser: Parser | null = null

/** Zenn RSS (Japanese articles) */
export async function fetchZenn(): Promise<NewsItem[]> {
  try {
    const res = await fetch('https://zenn.dev/feed', { next: { revalidate: REVALIDATE } })
    if (!res.ok) throw new Error(`Zenn ${res.status}`)
    const xml = await res.text()
    zennParser ??= new Parser()
    const feed = await zennParser.parseString(xml)

    return feed.items.slice(0, 20).map((it, i) => ({
      id: `zenn-${it.guid ?? it.link ?? i}`,
      title: it.title ?? '(無題)',
      url: it.link ?? 'https://zenn.dev',
      source: 'zenn' as const,
      sourceName: 'Zenn',
      publishedAt: it.isoDate ?? it.pubDate ?? new Date().toISOString(),
      author: it.creator,
    }))
  } catch (err) {
    console.error('[news] Zenn fetch failed:', err)
    return []
  }
}
