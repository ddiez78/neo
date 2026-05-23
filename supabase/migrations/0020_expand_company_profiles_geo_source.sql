alter table public.company_profiles
  add column if not exists ai_extracted_profile jsonb not null default '{}',
  add column if not exists verified_profile jsonb not null default '{}',
  add column if not exists field_verification jsonb not null default '{}',
  add column if not exists business_type text not null default 'local',
  add column if not exists country text,
  add column if not exists market text,
  add column if not exists language text not null default 'es',
  add column if not exists locations text[] not null default '{}',
  add column if not exists categories text[] not null default '{}',
  add column if not exists subcategories text[] not null default '{}',
  add column if not exists value_proposition text,
  add column if not exists target_audience text,
  add column if not exists products_services text[] not null default '{}',
  add column if not exists key_features text[] not null default '{}',
  add column if not exists pricing_strategy text,
  add column if not exists revenue_streams text[] not null default '{}',
  add column if not exists partnerships text[] not null default '{}',
  add column if not exists social_proof text[] not null default '{}',
  add column if not exists aliases text[] not null default '{}',
  add column if not exists approved_claims text[] not null default '{}',
  add column if not exists prohibited_claims text[] not null default '{}',
  add column if not exists legal_notes text,
  add column if not exists misunderstood_facts text[] not null default '{}',
  add column if not exists entity_gaps text[] not null default '{}';

alter table public.monthly_reports
  add column if not exists entity_state jsonb not null default '{}';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.company_profiles'::regclass
      and contype = 'u'
      and conkey = array[
        (
          select attnum
          from pg_attribute
          where attrelid = 'public.company_profiles'::regclass
            and attname = 'workspace_id'
        )
      ]::smallint[]
  ) then
    alter table public.company_profiles
      add constraint company_profiles_workspace_id_unique unique (workspace_id);
  end if;
end $$;

create index if not exists company_profiles_business_type_idx
  on public.company_profiles(workspace_id, business_type);
