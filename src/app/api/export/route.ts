import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const [{ data: posts }, { data: bookmarks }, { data: comments }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, content, created_at, progress, category, github_url, demo_url, is_public, pinned, respects(count), comments(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('bookmarks')
      .select('post_id, created_at')
      .eq('user_id', user.id),
    supabase
      .from('comments')
      .select('id, post_id, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name,
    },
    posts: posts ?? [],
    bookmarks: bookmarks ?? [],
    comments: comments ?? [],
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="devhub-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
