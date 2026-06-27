'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const content = (formData.get('content') as string).trim()
  if (!content) return

  const rawProgress = formData.get('progress')
  const progress = rawProgress !== '' && rawProgress !== null
    ? Math.min(100, Math.max(0, Number(rawProgress)))
    : null

  const rawCategory = formData.get('category')
  const category = rawCategory !== '' ? (rawCategory as string) : null

  const { error } = await supabase.from('posts').insert({
    content,
    user_id: user.id,
    author_name: user.user_metadata?.display_name ?? user.email,
    ...(progress !== null && { progress }),
    ...(category && { category }),
  })

  if (error) throw error
  revalidatePath('/')
}

export async function toggleRespect(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: existing } = await supabase
    .from('respects')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('respects').delete().eq('id', existing.id)
  } else {
    await supabase.from('respects').insert({ post_id: postId, user_id: user.id })
  }

  revalidatePath('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
