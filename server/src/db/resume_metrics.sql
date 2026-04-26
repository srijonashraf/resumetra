create table public.resume_metrics (
  id                           uuid    not null default gen_random_uuid(),
  analysis_id                  uuid    not null unique,

  overall_score                numeric not null,
  ats_compatibility_score      numeric not null,
  content_quality_score        numeric not null,
  impact_score                 numeric not null,
  readability_score            numeric not null,
  section_completeness_score   numeric not null,

  word_count                   integer not null,
  page_count                   integer not null,
  bullet_point_count           integer not null,

  skills_count                 integer not null,
  unique_skills_count          integer not null,
  experience_entries_count     integer not null,
  education_entries_count      integer not null,

  has_email                    boolean not null,
  has_phone                    boolean not null,
  has_linkedin                 boolean not null,
  has_portfolio                boolean not null,

  grammar_issues_count         integer not null,
  spelling_issues_count        integer not null,
  passive_voice_count          integer not null,

  measurable_achievements_count integer null,
  action_verb_count             integer null,
  buzzword_count                integer null,

  ats_issues                   text[]  not null default '{}',

  created_at                   timestamptz not null default timezone('utc'::text, now()),
  updated_at                   timestamptz not null default timezone('utc'::text, now()),

  constraint resume_metrics_pkey          primary key (id),
  constraint resume_metrics_analysis_fkey foreign key (analysis_id)
    references public.resume_analyses (id) on delete cascade,
  constraint check_overall_score          check (overall_score >= 1 and overall_score <= 10),
  constraint check_ats_score              check (ats_compatibility_score >= 1 and ats_compatibility_score <= 10),
  constraint check_content_quality_score  check (content_quality_score >= 1 and content_quality_score <= 10),
  constraint check_impact_score           check (impact_score >= 1 and impact_score <= 10),
  constraint check_readability_score      check (readability_score >= 1 and readability_score <= 10),
  constraint check_section_completeness   check (section_completeness_score >= 0 and section_completeness_score <= 100)
);

create index idx_resume_metrics_analysis_id on public.resume_metrics (analysis_id);
create index idx_resume_metrics_overall      on public.resume_metrics (overall_score desc);

create trigger update_resume_metrics_updated_at
  before update on public.resume_metrics for each row
  execute function update_updated_at_column();
