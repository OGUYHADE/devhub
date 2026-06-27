'use server'

import { headers } from 'next/headers'
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
  const progress =
    rawProgress !== '' && rawProgress !== null
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
