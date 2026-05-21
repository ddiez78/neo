create table if not exists public.prompt_generation_batches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'running', 'completed', 'failed')),
  requested_by uuid references auth.users(id) on delete set null,
  pipeline_version text not null default 'proprietary-v1',
  metadata jsonb not null default '{}',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.prompt_candidates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  batch_id uuid not null references public.prompt_generation_batches(id) on delete cascade,
  title text not null,
  body text not null,
  intent text not null,
  funnel_stage text not null,
  category text not null,
  score numeric(5,2) not null default 50,
  rationale text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'edited')),
  created_prompt_id uuid references public.prompts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompt_generation_batches_workspace_idx
  on public.prompt_generation_batches(workspace_id, created_at desc);

create index if not exists prompt_candidates_workspace_status_idx
  on public.prompt_candidates(workspace_id, status, score desc);

alter table public.prompt_generation_batches enable row level security;
alter table public.prompt_candidates enable row level security;

grant select, insert, update on public.prompt_generation_batches to authenticated;
grant select, insert, update on public.prompt_candidates to authenticated;
grant all on public.prompt_generation_batches to service_role;
grant all on public.prompt_candidates to service_role;

drop policy if exists "prompt generation batches member read" on public.prompt_generation_batches;
create policy "prompt generation batches member read"
on public.prompt_generation_batches
for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "prompt generation batches member write" on public.prompt_generation_batches;
create policy "prompt generation batches member write"
on public.prompt_generation_batches
for all
using (public.has_workspace_role(workspace_id, '{owner,admin,member}'))
with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

drop policy if exists "prompt candidates member read" on public.prompt_candidates;
create policy "prompt candidates member read"
on public.prompt_candidates
for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "prompt candidates member write" on public.prompt_candidates;
create policy "prompt candidates member write"
on public.prompt_candidates
for all
using (public.has_workspace_role(workspace_id, '{owner,admin,member}'))
with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));
