create extension if not exists vector;

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_file text not null,
  source_title text not null,
  source_url text,
  source_domain text,
  heading_path text[] not null default '{}',
  content text not null,
  content_hash text not null,
  tags text[] not null default '{}',
  category text,
  authority_tier int not null default 3 check (authority_tier between 1 and 5),
  published_at timestamptz,
  token_count integer not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists knowledge_chunks_dedup
  on public.knowledge_chunks(source_file, content_hash);

create index if not exists knowledge_chunks_embedding_idx
  on public.knowledge_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 16);

alter table public.knowledge_chunks enable row level security;

drop policy if exists "knowledge chunks authenticated read" on public.knowledge_chunks;
create policy "knowledge chunks authenticated read"
on public.knowledge_chunks
for select
to authenticated
using (true);

create or replace function public.match_knowledge_chunks(
  query_embedding vector(1536),
  match_count int default 8,
  similarity_threshold float default 0.3
)
returns table (
  id uuid,
  source_file text,
  source_title text,
  source_url text,
  source_domain text,
  heading_path text[],
  content text,
  tags text[],
  category text,
  authority_tier int,
  similarity float
)
language sql
stable
as $$
  select
    kc.id,
    kc.source_file,
    kc.source_title,
    kc.source_url,
    kc.source_domain,
    kc.heading_path,
    kc.content,
    kc.tags,
    kc.category,
    kc.authority_tier,
    1 - (kc.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks kc
  where 1 - (kc.embedding <=> query_embedding) > similarity_threshold
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_knowledge_chunks(vector, int, float) to authenticated, service_role;
