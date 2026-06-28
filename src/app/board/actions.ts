'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createThread(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = (formData.get('title') as string).trim()
  const content = (formData.get('content') as string).trim()
  const category = formData.get('category') as string

  if (!title || !content || !category) return

  const { data, error } = await supabase.from('board_threads').insert({
    user_id: user.id,
    author_name: user.user_metadata?.display_name ?? user.email ?? 'ユーザー',
    title,
    content,
    category,
  }).select('id').single()

  if (error) throw error
  redirect(`/board/thread/${data.id}`)
}

export async function createReply(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const threadId = formData.get('threadId') as string
  const content = (formData.get('content') as string).trim()
  if (!content) return

  const { error } = await supabase.from('board_replies').insert({
    thread_id: threadId,
    user_id: user.id,
    author_name: user.user_metadata?.display_name ?? user.email ?? 'ユーザー',
    content,
  })
  if (error) throw error

  revalidatePath(`/board/thread/${threadId}`)
}

export async function deleteReply(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const replyId = formData.get('replyId') as string
  const threadId = formData.get('threadId') as string

  await supabase.from('board_replies').delete()
    .eq('id', replyId).eq('user_id', user.id)

  revalidatePath(`/board/thread/${threadId}`)
}

export async function markSolved(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const threadId = formData.get('threadId') as string
  const solved = formData.get('solved') === 'true'

  await supabase.from('board_threads').update({ solved: !solved })
    .eq('id', threadId).eq('user_id', user.id)

  revalidatePath(`/board/thread/${threadId}`)
}

export async function deleteThread(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const threadId = formData.get('threadId') as string
  await supabase.from('board_threads').delete()
    .eq('id', threadId).eq('user_id', user.id)

  redirect('/board')
}
