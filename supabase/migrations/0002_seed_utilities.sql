-- Seed every new household with a default "Utilities" group + common bills.
-- Run this after 0001_init.sql in the Supabase SQL editor.

create or replace function punar.create_household(household_name text)
returns punar.households
language plpgsql
security definer
set search_path = punar, public
as $$
declare
  h punar.households;
  utilities_group_id uuid;
begin
  insert into punar.households (name, created_by) values (household_name, auth.uid()) returning * into h;
  insert into punar.household_members (household_id, user_id, role) values (h.id, auth.uid(), 'owner');

  insert into punar.groups (household_id, name, icon)
    values (h.id, 'Utilities', 'bill')
    returning id into utilities_group_id;

  -- Water + Trash covers trash pickup, so a separate "Trash" line is left out.
  insert into punar.bills (household_id, group_id, name, interval_days, next_due_date, created_by)
  values
    (h.id, utilities_group_id, 'Electricity', 30, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Atmos Gas', 30, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Water + Trash', 30, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Internet', 30, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Cable', 30, current_date, auth.uid());

  return h;
end;
$$;
