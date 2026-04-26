create table public.token_usage (
  id              uuid        not null default gen_random_uuid(),
  analysis_id     uuid        null,
  user_id         uuid        null,
  endpoint        text        not null,
  phase           text        not null,
  model           text        not null,
  input_tokens    integer     not null default 0,
  output_tokens   integer     not null default 0,
  total_tokens    integer     not null default 0,
  created_at      timestamptz not null default timezone('utc'::text, now()),

  constraint token_usage_pkey primary key (id),
  constraint token_usage_analysis_fkey foreign key (analysis_id)
    references public.resume_analyses (id) on delete cascade,
  constraint token_usage_user_fkey foreign key (user_id)
    references public.users (id) on delete cascade
);

create index idx_token_usage_analysis_id on public.token_usage (analysis_id);
create index idx_token_usage_user_id     on public.token_usage (user_id);
create index idx_token_usage_created_at  on public.token_usage (created_at desc);
