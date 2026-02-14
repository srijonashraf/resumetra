create table public.users (
  id uuid not null default gen_random_uuid (),
  google_sub text not null,
  email text null,
  name text null,
  picture text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),

  constraint users_pkey primary key (id),
  constraint users_google_sub_key unique (google_sub)
) TABLESPACE pg_default;

create index if not exists idx_users_email on public.users using btree (email) TABLESPACE pg_default;

create trigger update_users_updated_at
before update on users
for each row
execute function update_updated_at_column ();

