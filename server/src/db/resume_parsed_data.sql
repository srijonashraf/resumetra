create table public.resume_parsed_data (
  id                      uuid    not null default gen_random_uuid(),
  analysis_id             uuid    not null unique,

  full_name               text    null,
  email                   text    null,
  phone                   text    null,
  location                text    null,

  experience_level        text    null,
  total_experience_years  numeric null,

  technical_skills        text[]  not null default '{}',
  soft_skills             text[]  not null default '{}',
  job_titles              text[]  not null default '{}',

  education               jsonb   not null default '[]'::jsonb,
  work_experiences        jsonb   not null default '[]'::jsonb,
  projects                jsonb   not null default '[]'::jsonb,
  certifications          jsonb   not null default '[]'::jsonb,

  created_at              timestamptz not null default timezone('utc'::text, now()),
  updated_at              timestamptz not null default timezone('utc'::text, now()),

  constraint resume_parsed_data_pkey         primary key (id),
  constraint resume_parsed_data_analysis_fkey foreign key (analysis_id)
    references public.resume_analyses (id) on delete cascade,
  constraint check_experience_level check (
    experience_level is null or experience_level = any (array[
      'Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead/Principal', 'Executive'
    ])
  ),
  constraint check_experience_years check (total_experience_years is null or total_experience_years >= 0)
);

create index idx_resume_parsed_data_analysis_id on public.resume_parsed_data (analysis_id);
create index idx_resume_parsed_data_skills      on public.resume_parsed_data using gin (technical_skills);
create index idx_resume_parsed_data_experience  on public.resume_parsed_data (experience_level);

create trigger update_resume_parsed_data_updated_at
  before update on public.resume_parsed_data for each row
  execute function update_updated_at_column();
