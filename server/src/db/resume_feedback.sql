create table public.resume_feedback (
  id                      uuid    not null default gen_random_uuid(),
  analysis_id             uuid    not null unique,

  summary                 text    not null,
  hiring_recommendation   text    not null,

  strengths               text[]  not null default '{}',
  weaknesses              text[]  not null default '{}',
  improvement_areas       text[]  not null default '{}',
  missing_skills          text[]  not null default '{}',
  red_flags               text[]  not null default '{}',

  suggestions_immediate   text[]  not null default '{}',
  suggestions_short_term  text[]  not null default '{}',
  suggestions_long_term   text[]  not null default '{}',

  created_at              timestamptz not null default timezone('utc'::text, now()),

  constraint resume_feedback_pkey         primary key (id),
  constraint resume_feedback_analysis_fkey foreign key (analysis_id)
    references public.resume_analyses (id) on delete cascade,
  constraint check_hiring_recommendation check (
    hiring_recommendation = any (array[
      'Strong Hire', 'Hire', 'Maybe', 'No Hire', 'Needs More Info'
    ])
  )
);

create index idx_resume_feedback_analysis_id    on public.resume_feedback (analysis_id);
create index idx_resume_feedback_missing_skills on public.resume_feedback using gin (missing_skills);
create index idx_resume_feedback_hiring         on public.resume_feedback (hiring_recommendation);
