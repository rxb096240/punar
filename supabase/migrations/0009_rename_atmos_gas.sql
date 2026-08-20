-- "Atmos Gas" named a specific regional provider; just "Gas" reads better
-- for everyone else. Only affects new households going forward.

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
  insert into punar.recurring_items (household_id, group_id, name, interval_days, interval_months, next_due_date, created_by)
  values
    (h.id, utilities_group_id, 'Electricity', 30, 1, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Gas', 30, 1, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Water + Trash', 30, 1, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Internet', 30, 1, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Cable', 30, 1, current_date, auth.uid());

  return h;
end;
$$;
