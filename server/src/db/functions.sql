-- Generic helper function to keep updated_at in sync with latest changes.
-- Must be created BEFORE any tables that reference it in triggers.
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

