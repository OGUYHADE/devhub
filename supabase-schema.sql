-- Supabase SQL Editor で実行する

-- postsテーブル
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  author_name text not null,
  content text not null check (char_length(content) <= 500),
  created_at timestamptz default now() not null
);

-- インデックス（フィード表示の高速化）
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- Row Level Security を有効化
alter table public.posts enable row level security;

-- 読み取り：全員OK（認証済みユーザー）
create policy "authenticated users can read posts"
  on public.posts for select
  to authenticated
  using (true);

-- 書き込み：自分の投稿のみ
create policy "users can insert own posts"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 削除：自分の投稿のみ
create policy "users can delete own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = user_id);
