-- Punar: households, recurring items, bills + payments, todos
-- Run this in the Supabase SQL editor (or via `supabase db push`).
--
-- Everything lives in its own `punar` schema rather than `public`, so this
-- can share a Supabase project with other apps without name collisions.
--
-- IMPORTANT: after running this, go to Project Settings → API → Data API
-- and add `punar` to "Exposed schemas" (alongside `public`) — otherwise
-- the auto-generated REST API (which the app's Supabase client talks to)
-- won't be able to see these tables.

create schema if not exists punar;

create extension if not exists pgcrypto;

-- ── Households ──────────────────────────────────────────────

create table punar.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default substr(md5(random()::text), 1, 8),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table punar.household_members (
  household_id uuid not null references punar.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- ── Groups (categories, e.g. House / Bills / Vehicle) ───────

create table punar.groups (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references punar.households(id) on delete cascade,
  name text not null,
  icon text not null default 'star',
  created_at timestamptz not null default now(),
  unique (household_id, name)
);

-- ── Recurring items (chores/maintenance, no money) ──────────

create table punar.recurring_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references punar.households(id) on delete cascade,
  group_id uuid references punar.groups(id) on delete set null,
  name text not null,
  last_date date not null,
  interval_days integer not null check (interval_days > 0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- ── General to-dos (non-recurring) ──────────────────────────

create table punar.todos (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references punar.households(id) on delete cascade,
  title text not null,
  notes text,
  due_date date,
  completed boolean not null default false,
  completed_at timestamptz,
  assigned_to uuid references auth.users(id),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- ── Bills (recurring, with amount + payment history) ────────

create table punar.bills (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references punar.households(id) on delete cascade,
  group_id uuid references punar.groups(id) on delete set null,
  name text not null,
  amount numeric(10, 2),
  interval_days integer not null check (interval_days > 0),
  next_due_date date not null,
  autopay boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table punar.bill_payments (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references punar.bills(id) on delete cascade,
  household_id uuid not null references punar.households(id) on delete cascade,
  amount_paid numeric(10, 2),
  paid_date date not null default current_date,
  paid_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- ── Membership helper (used by RLS policies below) ──────────
-- security definer + owned by the migration role, so it bypasses RLS on
-- household_members internally instead of recursing into the policy below.

create or replace function punar.is_household_member(hid uuid)
returns boolean
language sql
security definer
stable
set search_path = punar, public
as $$
  select exists (
    select 1 from punar.household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

grant execute on function punar.is_household_member(uuid) to authenticated;

-- ── Row level security ───────────────────────────────────────

alter table punar.households enable row level security;
alter table punar.household_members enable row level security;
alter table punar.groups enable row level security;
alter table punar.recurring_items enable row level security;
alter table punar.todos enable row level security;
alter table punar.bills enable row level security;
alter table punar.bill_payments enable row level security;

-- households: no direct insert policy — creation happens via create_household()
create policy "members can view their household" on punar.households
  for select using (punar.is_household_member(id));

create policy "members can view household membership" on punar.household_members
  for select using (punar.is_household_member(household_id));

create policy "members manage groups" on punar.groups
  for all using (punar.is_household_member(household_id)) with check (punar.is_household_member(household_id));

create policy "members manage recurring items" on punar.recurring_items
  for all using (punar.is_household_member(household_id)) with check (punar.is_household_member(household_id));

create policy "members manage todos" on punar.todos
  for all using (punar.is_household_member(household_id)) with check (punar.is_household_member(household_id));

create policy "members manage bills" on punar.bills
  for all using (punar.is_household_member(household_id)) with check (punar.is_household_member(household_id));

create policy "members manage bill payments" on punar.bill_payments
  for all using (punar.is_household_member(household_id)) with check (punar.is_household_member(household_id));

-- ── RPCs ─────────────────────────────────────────────────────

-- Create a household and add the caller as its owner.
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

-- Join an existing household by its invite code.
create or replace function punar.join_household(code text)
returns punar.households
language plpgsql
security definer
set search_path = punar, public
as $$
declare
  h punar.households;
begin
  select * into h from punar.households where invite_code = code;
  if not found then
    raise exception 'Invalid invite code';
  end if;

  insert into punar.household_members (household_id, user_id, role)
    values (h.id, auth.uid(), 'member')
    on conflict do nothing;

  return h;
end;
$$;

-- Record a bill payment and advance the bill's next due date.
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
    set next_due_date = p_paid_date + interval_days
    where id = p_bill_id
    returning * into b;

  return b;
end;
$$;

grant execute on function punar.create_household(text) to authenticated;
grant execute on function punar.join_household(text) to authenticated;
grant execute on function punar.pay_bill(uuid, numeric, date) to authenticated;

-- ── Schema-level grants ──────────────────────────────────────
-- Custom (non-public) schemas need explicit grants for PostgREST to route
-- requests to them at all — RLS above still governs row-level access.

grant usage on schema punar to authenticated;
grant select, insert, update, delete on all tables in schema punar to authenticated;
alter default privileges in schema punar grant select, insert, update, delete on tables to authenticated;
