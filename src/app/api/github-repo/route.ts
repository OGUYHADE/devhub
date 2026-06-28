import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const repo = request.nextUrl.searchParams.get('repo')
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    return NextResponse.json(null, { status: 400 })
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
      next: { revalidate: 3600 },
    })
    if (!res.ok) return NextResponse.json(null, { status: res.status })
    const data = await res.json()
    return NextResponse.json({
      name: data.name,
      full_name: data.full_name,
      description: data.description ?? null,
      stargazers_count: data.stargazers_count ?? 0,
      language: data.language ?? null,
      html_url: data.html_url,
    })
  } catch {
    return NextResponse.json(null, { status: 500 })
  }
}
