-- Support belonging to multiple households: a per-user "last active
-- household" so the switcher remembers what you picked last time, plus
-- permission to rename a household you belong to.

create table punar.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_household_id uuid references punar.households(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table punar.user_settings enable row level security;

create policy "users manage their own settings" on punar.user_settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on punar.user_settings to authenticated;

-- households previously had no update policy (renaming happened nowhere).
create policy "members can rename their household" on punar.households
  for update using (punar.is_household_member(id)) with check (punar.is_household_member(id));
