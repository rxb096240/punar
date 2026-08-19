-- Bills and recurring items are the same concept (a name + a due date + a
-- repeat interval) with two extras bills happened to have: an amount and a
-- payment method/notes. Merge them into one `recurring_items` table so the
-- app has a single board instead of two near-identical pages.
--
-- Also switches recurring_items from `last_date` (last done, next due
-- computed on the fly) to `next_due_date` (stored, advanced explicitly on
-- completion) to match how bills already worked — it supports backdating a
-- completion without drift, using the same calendar-month-safe math bills
-- already use via add_calendar_months().
--
-- Payment history (bill_payments / pay_bill()) is dropped — nothing reads
-- or writes it going forward.

-- Defensive: make sure bills has the payment_method/notes columns from
-- migration 0006, in case this project never had that one applied.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'punar' and table_name = 'bills' and column_name = 'payment_method'
  ) then
    alter table punar.bills
      add column payment_method text not null default 'manual' check (payment_method in ('auto', 'manual'));
    alter table punar.bills add column notes text;

    if exists (
      select 1 from information_schema.columns
      where table_schema = 'punar' and table_name = 'bills' and column_name = 'autopay'
    ) then
      update punar.bills set payment_method = case when autopay then 'auto' else 'manual' end;
      alter table punar.bills drop column autopay;
    end if;
  end if;
end $$;

alter table punar.recurring_items
  add column next_due_date date,
  add column amount numeric(10, 2),
  add column payment_method text check (payment_method in ('auto', 'manual')),
  add column notes text;

update punar.recurring_items
  set next_due_date = case
    when interval_months is not null then punar.add_calendar_months(last_date, interval_months)
    else last_date + interval_days
  end;

alter table punar.recurring_items
  alter column next_due_date set not null;

alter table punar.recurring_items drop column last_date;

insert into punar.recurring_items
  (id, household_id, group_id, name, next_due_date, interval_days, interval_months, amount, payment_method, notes, created_by, created_at)
select id, household_id, group_id, name, next_due_date, interval_days, interval_months, amount, payment_method, notes, created_by, created_at
from punar.bills;

drop function if exists punar.pay_bill(uuid, numeric, date);
drop table punar.bill_payments;
drop table punar.bills;

-- Re-seed the default Utilities group into recurring_items now that bills
-- no longer exists.
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
    (h.id, utilities_group_id, 'Atmos Gas', 30, 1, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Water + Trash', 30, 1, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Internet', 30, 1, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Cable', 30, 1, current_date, auth.uid());

  return h;
end;
$$;
