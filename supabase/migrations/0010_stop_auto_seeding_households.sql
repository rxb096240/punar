-- Every new household used to get a "Utilities" group + 5 bills seeded
-- automatically. Now that there are several starter sets worth offering
-- (Utilities, Housing, Home maintenance, Vehicle, Health, Subscriptions),
-- treat all of them the same way: opt-in tiles in the empty-state template
-- picker (see RECURRING_TEMPLATES in src/lib/templates.ts), not something
-- forced onto every signup. create_household() goes back to just creating
-- the household and membership.

create or replace function punar.create_household(household_name text)
returns punar.households
language plpgsql
security definer
set search_path = punar, public
as $$
declare
  h punar.households;
begin
  insert into punar.households (name, created_by) values (household_name, auth.uid()) returning * into h;
  insert into punar.household_members (household_id, user_id, role) values (h.id, auth.uid(), 'owner');
  return h;
end;
$$;
