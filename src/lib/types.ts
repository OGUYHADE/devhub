export type Post = {
  id: string
  content: string
  author_name: string
  user_id: string
  created_at: string
  progress: number | null
  category: string | null
  github_url: string | null
  demo_url: string | null
  pinned: boolean
  is_public: boolean
  view_count: number
  image_url: string | null
  tech_stack?: string[] | null
  quoted_post_id: string | null
  quoted_post: {
    id: string
    content: string
    author_name: string
    user_id: string
  }[] | null
  respects: { count: number }[]
  comments: { count: number }[]
}

export type ReactionData = {
  emoji: string
  count: number
  reactedByMe: boolean
}

export type CommentWithExtras = {
  id: string
  author_name: string
  content: string
  user_id: string
  created_at: string
  parent_id: string | null
  like_count: number
  liked_by_me: boolean
  replies: {
    id: string
    author_name: string
    content: string
    user_id: string
    created_at: string
    parent_id: string | null
    like_count: number
    liked_by_me: boolean
  }[]
}
