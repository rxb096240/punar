-- Fix: paying a bill on a fixed-day cadence (e.g. "Monthly" = 30 days) drifts
-- the due date backward over time, since most months aren't 30 days long.
-- Paying on Aug 12 with a 30-day interval landed the next due date on Sep 11,
-- not Sep 12 — and it creeps further with every cycle.
--
-- Adds an explicit interval_months column: when set, the next due date is
-- computed with calendar-month arithmetic (clamped to the target month's
-- last day) instead of a flat day count. interval_days remains the fallback
-- for "Custom…" cadences that are genuinely day-based.

alter table punar.bills
  add column interval_months integer check (interval_months is null or interval_months > 0);

alter table punar.recurring_items
  add column interval_months integer check (interval_months is null or interval_months > 0);

-- Adds `n` calendar months to `d`, clamping the day-of-month into the target
-- month (Jan 31 + 1 month = Feb 28, not the Mar 3 you'd get from naive
-- interval arithmetic).
create or replace function punar.add_calendar_months(d date, n integer)
returns date
language plpgsql
immutable
as $$
declare
  first_of_month date := date_trunc('month', d)::date;
  target_first date := (first_of_month + (n || ' months')::interval)::date;
  last_day_of_target integer := extract(day from ((target_first + interval '1 month') - interval '1 day'))::int;
  target_day integer := least(extract(day from d)::int, last_day_of_target);
begin
  return target_first + (target_day - 1);
end;
$$;

create or replace function punar.pay_bill(p_bill_id uuid, p_amount numeric default null, p_paid_date date default current_date)
returns punar.bills
language plpgsql
security definer
set search_path = punar, public
as $$
declare
  b punar.bills;
begin
  select * into b from punar.bills where id = p_bill_id;
  if not found then
    raise exception 'Bill not found';
  end if;
  if not punar.is_household_member(b.household_id) then
    raise exception 'Not authorized';
  end if;

  insert into punar.bill_payments (bill_id, household_id, amount_paid, paid_date, paid_by)
    values (p_bill_id, b.household_id, coalesce(p_amount, b.amount), p_paid_date, auth.uid());

  update punar.bills
    set next_due_date = case
      when b.interval_months is not null then punar.add_calendar_months(p_paid_date, b.interval_months)
      else p_paid_date + b.interval_days
    end
    where id = p_bill_id
    returning * into b;

  return b;
end;
$$;

-- Re-seed monthly utility bills with calendar-month cadence.
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
  insert into punar.bills (household_id, group_id, name, interval_days, interval_months, next_due_date, created_by)
  values
    (h.id, utilities_group_id, 'Electricity', 30, 1, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Atmos Gas', 30, 1, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Water + Trash', 30, 1, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Internet', 30, 1, current_date, auth.uid()),
    (h.id, utilities_group_id, 'Cable', 30, 1, current_date, auth.uid());

  return h;
end;
$$;
