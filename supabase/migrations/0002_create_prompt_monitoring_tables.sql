insert into public.workspaces (
  id,
  name,
  slug,
  website,
  industry,
  locale,
  timezone,
  created_by
)
values (
  '11111111-1111-1111-1111-111111111111',
  'GEO Seed Workspace',
  'geo-seed',
  'https://geo.example.com',
  'SaaS',
  'es-ES',
  'Europe/Madrid',
  null
)
on conflict (id) do nothing;

insert into public.company_profiles (
  workspace_id,
  brand_name,
  website,
  description,
  products,
  keywords,
  markets,
  tone,
  official_urls
)
values (
  '11111111-1111-1111-1111-111111111111',
  'GEO',
  'https://geo.example.com',
  'Plataforma de monitorizacion GEO para visibilidad de marca en respuestas de LLM.',
  array['monitoring', 'analytics', 'prompt intelligence'],
  array['llm visibility', 'brand mention', 'geo'],
  array['spain', 'eu'],
  'profesional',
  array['https://geo.example.com', 'https://docs.geo.example.com']
)
on conflict (workspace_id) do nothing;

insert into public.competitors (workspace_id, name, domain, aliases, notes)
values
  ('11111111-1111-1111-1111-111111111111', 'Competitor One', 'competitor-one.example.com', array['c1'], 'Competidor semilla'),
  ('11111111-1111-1111-1111-111111111111', 'Competitor Two', 'competitor-two.example.com', array['c2'], 'Competidor semilla')
on conflict (workspace_id, name) do nothing;

insert into public.prompts (
  id,
  workspace_id,
  title,
  body,
  status,
  priority,
  frequency,
  providers,
  tags
)
values
  (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'Alternativas a GEO',
    'Cuales son las mejores alternativas para monitorizar visibilidad de marca en LLMs?',
    'active',
    3,
    'daily',
    array['chatgpt','claude']::public.llm_provider[],
    array['awareness','alternatives']
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Comparativa GEO vs competidores',
    'Compara GEO con otras herramientas GEO para empresas SaaS en Europa.',
    'active',
    2,
    'weekly',
    array['chatgpt','gemini']::public.llm_provider[],
    array['comparison']
  )
on conflict (id) do nothing;

insert into public.workspace_llm_configs (
  workspace_id,
  provider,
  model,
  enabled,
  api_key_configured,
  daily_run_limit
)
values
  ('11111111-1111-1111-1111-111111111111', 'chatgpt', 'gpt-4o-mini', true, false, 50),
  ('11111111-1111-1111-1111-111111111111', 'claude', 'claude-3-5-sonnet', true, false, 30),
  ('11111111-1111-1111-1111-111111111111', 'gemini', 'gemini-1.5-pro', false, false, 25)
on conflict (workspace_id, provider, model) do nothing;

insert into public.prompt_runs (
  id,
  workspace_id,
  prompt_id,
  provider,
  model,
  status,
  input_text,
  response_text,
  sentiment,
  brand_mentioned,
  competitors_mentioned,
  prompt_tokens,
  completion_tokens,
  total_cost,
  started_at,
  completed_at,
  created_at
)
values
  (
    '33333333-3333-3333-3333-333333333331',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222221',
    'chatgpt',
    'gpt-4o-mini',
    'completed',
    'Cuales son las mejores alternativas para monitorizar visibilidad de marca en LLMs?',
    'GEO aparece como opcion junto a Competitor One y Competitor Two.',
    'positive',
    true,
    array['Competitor One','Competitor Two'],
    71,
    94,
    0.003400,
    now() - interval '2 days',
    now() - interval '2 days' + interval '1 minute',
    now() - interval '2 days'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'claude',
    'claude-3-5-sonnet',
    'completed',
    'Compara GEO con otras herramientas GEO para empresas SaaS en Europa.',
    'La comparativa incluye fortalezas de GEO y de Competitor One.',
    'neutral',
    true,
    array['Competitor One'],
    83,
    121,
    0.004900,
    now() - interval '1 day',
    now() - interval '1 day' + interval '2 minutes',
    now() - interval '1 day'
  )
on conflict (id) do nothing;

insert into public.prompt_run_sources (
  workspace_id,
  prompt_run_id,
  url,
  domain,
  title,
  mentioned_brand,
  mentioned_competitors,
  authority_score
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'https://geo.example.com/blog/geo-monitoring',
    'geo.example.com',
    'GEO Monitoring Guide',
    true,
    array['Competitor One'],
    72.5
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'https://analyst.example.com/reports/geo-tools',
    'analyst.example.com',
    'GEO Tools Report',
    true,
    array['Competitor One','Competitor Two'],
    81.0
  );

insert into public.daily_metrics (
  workspace_id,
  metric_date,
  visibility_score,
  mention_count,
  total_runs,
  positive_mentions,
  neutral_mentions,
  negative_mentions,
  source_count,
  total_cost
)
values
  ('11111111-1111-1111-1111-111111111111', current_date - 2, 84.0, 1, 1, 1, 0, 0, 1, 0.003400),
  ('11111111-1111-1111-1111-111111111111', current_date - 1, 76.0, 1, 1, 0, 1, 0, 1, 0.004900)
on conflict (workspace_id, metric_date) do nothing;
