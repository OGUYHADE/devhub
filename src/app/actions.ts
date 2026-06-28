'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Post, ReactionData, CommentWithExtras } from '@/lib/types'

const FEED_LIMIT = 20

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const content = (formData.get('content') as string).trim()
  if (!content) return

  const rawProgress = formData.get('progress')
  const progress =
    rawProgress !== '' && rawProgress !== null
      ? Math.min(100, Math.max(0, Number(rawProgress)))
      : null

  const rawCategory = formData.get('category')
  const category = rawCategory !== '' ? (rawCategory as string) : null

  const rawGithubUrl = (formData.get('github_url') as string | null)?.trim()
  const rawDemoUrl = (formData.get('demo_url') as string | null)?.trim()
  const github_url = rawGithubUrl || null
  const demo_url = rawDemoUrl || null

  const rawIsPublic = formData.get('is_public')
  const is_public = rawIsPublic !== 'false'

  const quotedPostId = (formData.get('quoted_post_id') as string | null) || null

  let tech_stack: string[] | null = null
  const rawTech = formData.get('tech_stack')
  if (rawTech) {
    try {
      const parsed = JSON.parse(rawTech as string)
      if (Array.isArray(parsed) && parsed.length > 0) tech_stack = parsed
    } catch { /* ignore */ }
  }

  // Handle image upload
  let image_url: string | null = null
  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${user.id}/${Date.now()}.${ext}`
    const { data: upload } = await supabase.storage
      .from('post-images')
      .upload(path, imageFile, { upsert: false, contentType: imageFile.type })
    if (upload) {
      const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(upload.path)
      image_url = publicUrl
    }
  }

  const { error } = await supabase.from('posts').insert({
    content,
    user_id: user.id,
    author_name: user.user_metadata?.display_name ?? user.email,
    is_public,
    ...(progress !== null && { progress }),
    ...(category && { category }),
    ...(github_url && { github_url }),
    ...(demo_url && { demo_url }),
    ...(image_url && { image_url }),
    ...(quotedPostId && { quoted_post_id: quotedPostId }),
    ...(tech_stack && { tech_stack }),
  })

  if (error) throw error
  revalidatePath('/')
}

export async function updatePost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const postId = formData.get('postId') as string
  const content = (formData.get('content') as string).trim()
  if (!content) return

  const { error } = await supabase
    .from('posts')
    .update({ content })
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/')
}

export async function deletePost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const postId = formData.get('postId') as string

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/')
}

export async function toggleRespect(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const [{ data: existing }, { data: post }] = await Promise.all([
    supabase
      .from('respects')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .maybeSingle(),
  ])

  if (existing) {
    await supabase.from('respects').delete().eq('id', existing.id)
    // Delete the associated notification (silently ignore if table doesn't exist)
    await supabase
      .from('notifications')
      .delete()
      .eq('actor_id', user.id)
      .eq('post_id', postId)
      .eq('type', 'respect')
  } else {
    await supabase.from('respects').insert({ post_id: postId, user_id: user.id })
    // Create notification if respecting someone else's post
    if (post && post.user_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: post.user_id,
        actor_id: user.id,
        actor_name: user.user_metadata?.display_name ?? user.email ?? 'ユーザー',
        post_id: postId,
        type: 'respect',
      })
      // Error is silently ignored if notifications table doesn't exist
    }
  }

  revalidatePath('/')
}

// ── Comment types ──────────────────────────────────────────────────────────────
export type Comment = {
  id: string
  author_name: string
  content: string
  user_id: string
  created_at: string
}

export async function getComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comments')
    .select('id, author_name, content, user_id, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  return (data ?? []) as Comment[]
}

export async function getCommentsWithExtras(postId: string): Promise<CommentWithExtras[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: allComments } = await supabase
    .from('comments')
    .select('id, author_name, content, user_id, created_at, parent_id')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  const comments = allComments ?? []
  if (comments.length === 0) return []

  const commentIds = comments.map((c) => c.id)
  const [{ data: allLikes }, { data: myLikes }] = await Promise.all([
    supabase.from('comment_likes').select('comment_id').in('comment_id', commentIds),
    user
      ? supabase.from('comment_likes').select('comment_id').eq('user_id', user.id).in('comment_id', commentIds)
      : Promise.resolve({ data: [] }),
  ])

  const likeCountMap = new Map<string, number>()
  for (const l of allLikes ?? []) {
    likeCountMap.set(l.comment_id, (likeCountMap.get(l.comment_id) ?? 0) + 1)
  }
  const myLikedIds = new Set((myLikes ?? []).map((l) => l.comment_id))

  const topLevel: CommentWithExtras[] = []
  const replyMap = new Map<string, CommentWithExtras['replies']>()

  for (const c of comments) {
    const enriched = {
      id: c.id,
      author_name: c.author_name,
      content: c.content,
      user_id: c.user_id,
      created_at: c.created_at,
      parent_id: c.parent_id ?? null,
      like_count: likeCountMap.get(c.id) ?? 0,
      liked_by_me: myLikedIds.has(c.id),
      replies: [] as CommentWithExtras['replies'],
    }
    if (!c.parent_id) {
      topLevel.push(enriched)
    } else {
      const arr = replyMap.get(c.parent_id) ?? []
      arr.push(enriched)
      replyMap.set(c.parent_id, arr)
    }
  }
  for (const comment of topLevel) {
    comment.replies = replyMap.get(comment.id) ?? []
  }
  return topLevel
}

export async function updatePlazaMessage(message: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const trimmed = message.trim().slice(0, 60)
  await supabase.from('profiles').upsert({
    id: user.id,
    display_name: user.user_metadata?.display_name ?? user.email ?? 'ユーザー',
    plaza_message: trimmed || null,
    updated_at: new Date().toISOString(),
  })

  revalidatePath('/plaza')
}

export async function createComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const postId = formData.get('postId') as string
  const content = (formData.get('content') as string).trim()
  if (!content) return

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    author_name: user.user_metadata?.display_name ?? user.email ?? 'ユーザー',
    content,
  })
  if (error) throw error
}

export async function deleteComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const commentId = formData.get('commentId') as string
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)
  if (error) throw error
}

export async function toggleBookmark(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id)
  } else {
    await supabase.from('bookmarks').insert({ post_id: postId, user_id: user.id })
  }

  revalidatePath('/')
  revalidatePath('/bookmarks')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https')
  const redirectTo = `${proto}://${host}/reset-password/confirm`

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  }
  redirect('/reset-password?sent=true')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const display_name = (formData.get('display_name') as string).trim()
  const bio = (formData.get('bio') as string).trim()
  const github_url = (formData.get('github_url') as string).trim()
  const twitter_url = (formData.get('twitter_url') as string).trim()

  let skills: string[] = []
  const rawSkills = formData.get('skills')
  if (rawSkills) {
    try { skills = JSON.parse(rawSkills as string) } catch { /* ignore */ }
  }

  await Promise.all([
    supabase.auth.updateUser({ data: { display_name, bio, github_url, twitter_url } }),
    supabase.from('profiles').upsert({
      id: user.id,
      display_name,
      bio,
      github_url,
      twitter_url,
      skills,
      updated_at: new Date().toISOString(),
    }),
  ])

  revalidatePath('/profile')
}

export async function togglePin(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: post } = await supabase
    .from('posts')
    .select('pinned')
    .eq('id', postId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!post) throw new Error('Not found')

  await supabase
    .from('posts')
    .update({ pinned: !post.pinned })
    .eq('id', postId)
    .eq('user_id', user.id)

  revalidatePath('/profile')
}

export async function togglePostVisibility(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: post } = await supabase
    .from('posts')
    .select('is_public')
    .eq('id', postId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!post) throw new Error('Not found')

  await supabase
    .from('posts')
    .update({ is_public: !post.is_public })
    .eq('id', postId)
    .eq('user_id', user.id)

  revalidatePath('/')
  revalidatePath('/profile')
}

export async function reportPost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.from('reports').insert({
    post_id: postId,
    reporter_id: user.id,
  })
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const admin = createAdminClient()
  await supabase.auth.signOut()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) throw new Error(error.message)

  redirect('/')
}

export async function createCommentReply(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const postId = formData.get('postId') as string
  const parentId = formData.get('parentId') as string
  const content = (formData.get('content') as string).trim()
  if (!content) return

  await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    author_name: user.user_metadata?.display_name ?? user.email ?? 'ユーザー',
    content,
    parent_id: parentId,
  })
}

export async function toggleCommentLike(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: existing } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('comment_likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id })
  }
}

export async function toggleReaction(postId: string, emoji: string) {
  const VALID = ['👍', '🔥', '💡', '🚀', '❤️']
  if (!VALID.includes(emoji)) throw new Error('Invalid emoji')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('emoji', emoji)
    .maybeSingle()

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id)
  } else {
    await supabase.from('reactions').insert({ post_id: postId, user_id: user.id, emoji })
  }

  revalidatePath('/')
}

export async function incrementViewCount(postId: string) {
  const supabase = await createClient()
  await supabase.rpc('increment_view_count', { p_post_id: postId })
}

export async function createQuotePost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const content = (formData.get('content') as string).trim()
  const quotedPostId = formData.get('quoted_post_id') as string
  if (!content || !quotedPostId) return

  await supabase.from('posts').insert({
    content,
    user_id: user.id,
    author_name: user.user_metadata?.display_name ?? user.email,
    is_public: true,
    quoted_post_id: quotedPostId,
  })

  revalidatePath('/')
}

export async function toggleThreadBookmark(threadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: existing } = await supabase
    .from('thread_bookmarks')
    .select('id')
    .eq('thread_id', threadId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('thread_bookmarks').delete().eq('id', existing.id)
  } else {
    await supabase.from('thread_bookmarks').insert({ thread_id: threadId, user_id: user.id })
  }

  revalidatePath(`/board/thread/${threadId}`)
}

export async function searchUsers(query: string): Promise<{ id: string; name: string }[]> {
  if (!query || query.length < 1) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name')
    .ilike('display_name', `%${query}%`)
    .limit(5)
  return (data ?? []).map((u) => ({ id: u.id, name: u.display_name ?? 'ユーザー' }))
}

export type FeedPage = {
  posts: Post[]
  respectedIds: string[]
  bookmarkedIds: string[]
  reactionsByPost: Record<string, ReactionData[]>
}

export async function fetchMorePosts({
  page,
  sort,
  category,
}: {
  page: number
  sort?: string
  category?: string
}): Promise<FeedPage> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { posts: [], respectedIds: [], bookmarkedIds: [], reactionsByPost: {} }

  const offset = (page - 1) * FEED_LIMIT
  const POST_SELECT =
    'id, content, author_name, user_id, created_at, progress, category, github_url, demo_url, pinned, is_public, view_count, image_url, tech_stack, quoted_post_id, quoted_post:quoted_post_id(id,content,author_name,user_id), respects(count), comments(count)'

  let rawPosts: Post[] = []

  if (sort === 'following') {
    const { data: followData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
    const followingIds = (followData ?? []).map((f) => f.following_id)
    if (followingIds.length === 0) return { posts: [], respectedIds: [], bookmarkedIds: [], reactionsByPost: {} }
    const { data } = await supabase
      .from('posts')
      .select(POST_SELECT)
      .in('user_id', followingIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + FEED_LIMIT - 1)
    rawPosts = (data ?? []) as unknown as Post[]
  } else {
    let query = supabase
      .from('posts')
      .select(POST_SELECT)
      .or(`is_public.eq.true,user_id.eq.${user.id}`)
    if (category) query = query.eq('category', category)
    const { data } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + FEED_LIMIT - 1)
    rawPosts = (data ?? []) as unknown as Post[]
  }

  if (rawPosts.length === 0) return { posts: [], respectedIds: [], bookmarkedIds: [], reactionsByPost: {} }

  const postIds = rawPosts.map((p) => p.id)
  const [{ data: myRespects }, { data: myBookmarks }, { data: reactionData }] = await Promise.all([
    supabase.from('respects').select('post_id').eq('user_id', user.id).in('post_id', postIds),
    supabase.from('bookmarks').select('post_id').eq('user_id', user.id).in('post_id', postIds),
    supabase.from('reactions').select('post_id, emoji, user_id').in('post_id', postIds),
  ])

  const reactionsByPost: Record<string, ReactionData[]> = {}
  for (const r of reactionData ?? []) {
    if (!reactionsByPost[r.post_id]) reactionsByPost[r.post_id] = []
    const existing = reactionsByPost[r.post_id].find((x) => x.emoji === r.emoji)
    if (existing) {
      existing.count++
      if (r.user_id === user.id) existing.reactedByMe = true
    } else {
      reactionsByPost[r.post_id].push({ emoji: r.emoji, count: 1, reactedByMe: r.user_id === user.id })
    }
  }

  return {
    posts: rawPosts,
    respectedIds: (myRespects ?? []).map((r) => r.post_id),
    bookmarkedIds: (myBookmarks ?? []).map((b) => b.post_id),
    reactionsByPost,
  }
}

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (user.id === targetUserId) return

  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase.from('follows').delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
  } else {
    await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: targetUserId,
    })
  }

  revalidatePath(`/profile/${targetUserId}`)
  revalidatePath('/')
}
