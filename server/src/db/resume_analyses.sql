create table public.resume_analyses (
  id                  uuid        not null default gen_random_uuid(),
  user_id             uuid        not null,

  input_text_hash     varchar(64) not null,
  original_file_name  text        null,
  source_type         text        not null,

  ai_model_version    text        null,
  analysis_version    integer     not null default 1,
  processing_time_ms  integer     null,

  created_at          timestamptz not null default timezone('utc'::text, now()),
  updated_at          timestamptz not null default timezone('utc'::text, now()),

  constraint resume_analyses_pkey             primary key (id),
  constraint resume_analyses_user_hash_unique unique (user_id, input_text_hash),
  constraint resume_analyses_user_fkey        foreign key (user_id)
    references public.users (id) on delete cascade,
  constraint resume_analyses_source_type_check check (
    source_type = any (array['pdf', 'docx', 'text', 'linkedin'])
  )
);

create index idx_resume_analyses_user_id on public.resume_analyses (user_id);
create index idx_resume_analyses_hash    on public.resume_analyses (input_text_hash);

create trigger update_resume_analyses_updated_at
  before update on public.resume_analyses for each row
  execute function update_updated_at_column();
