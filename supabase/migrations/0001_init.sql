-- Punar: households, recurring items, bills + payments, todos
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists pgcrypto;

-- ── Households ──────────────────────────────────────────────

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default substr(md5(random()::text), 1, 8),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- ── Groups (categories, e.g. House / Bills / Vehicle) ───────

create table groups (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  icon text not null default 'star',
  created_at timestamptz not null default now(),
  unique (household_id, name)
);

-- ── Recurring items (chores/maintenance, no money) ──────────

create table recurring_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  group_id uuid references groups(id) on delete set null,
  name text not null,
  last_date date not null,
  interval_days integer not null check (interval_days > 0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- ── General to-dos (non-recurring) ──────────────────────────

create table todos (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
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

create table bills (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  group_id uuid references groups(id) on delete set null,
  name text not null,
  amount numeric(10, 2),
  interval_days integer not null check (interval_days > 0),
  next_due_date date not null,
  autopay boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table bill_payments (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references bills(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  amount_paid numeric(10, 2),
  paid_date date not null default current_date,
  paid_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- ── Membership helper (used by RLS policies below) ──────────
-- security definer + owned by the migration role, so it bypasses RLS on
-- household_members internally instead of recursing into the policy below.

create or replace function is_household_member(hid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

grant execute on function is_household_member(uuid) to authenticated;

-- ── Row level security ───────────────────────────────────────

alter table households enable row level security;
alter table household_members enable row level security;
alter table groups enable row level security;
alter table recurring_items enable row level security;
alter table todos enable row level security;
alter table bills enable row level security;
alter table bill_payments enable row level security;

-- households: no direct insert policy — creation happens via create_household()
create policy "members can view their household" on households
  for select using (is_household_member(id));

create policy "members can view household membership" on household_members
  for select using (is_household_member(household_id));

create policy "members manage groups" on groups
  for all using (is_household_member(household_id)) with check (is_household_member(household_id));

create policy "members manage recurring items" on recurring_items
  for all using (is_household_member(household_id)) with check (is_household_member(household_id));

create policy "members manage todos" on todos
  for all using (is_household_member(household_id)) with check (is_household_member(household_id));

create policy "members manage bills" on bills
  for all using (is_household_member(household_id)) with check (is_household_member(household_id));

create policy "members manage bill payments" on bill_payments
  for all using (is_household_member(household_id)) with check (is_household_member(household_id));

-- ── RPCs ─────────────────────────────────────────────────────

-- Create a household and add the caller as its owner.
create or replace function create_household(household_name text)
returns households
language plpgsql
security definer
set search_path = public
as $$
declare
  h households;
begin
  insert into households (name, created_by) values (household_name, auth.uid()) returning * into h;
  insert into household_members (household_id, user_id, role) values (h.id, auth.uid(), 'owner');
  return h;
end;
$$;

-- Join an existing household by its invite code.
create or replace function join_household(code text)
returns households
language plpgsql
security definer
set search_path = public
as $$
declare
  h households;
begin
  select * into h from households where invite_code = code;
  if not found then
    raise exception 'Invalid invite code';
  end if;

  insert into household_members (household_id, user_id, role)
    values (h.id, auth.uid(), 'member')
    on conflict do nothing;

  return h;
end;
$$;

-- Record a bill payment and advance the bill's next due date.
create or replace function pay_bill(p_bill_id uuid, p_amount numeric default null, p_paid_date date default current_date)
returns bills
language plpgsql
security definer
set search_path = public
as $$
declare
  b bills;
begin
  select * into b from bills where id = p_bill_id;
  if not found then
    raise exception 'Bill not found';
  end if;
  if not is_household_member(b.household_id) then
    raise exception 'Not authorized';
  end if;

  insert into bill_payments (bill_id, household_id, amount_paid, paid_date, paid_by)
    values (p_bill_id, b.household_id, coalesce(p_amount, b.amount), p_paid_date, auth.uid());

  update bills
    set next_due_date = p_paid_date + interval_days
    where id = p_bill_id
    returning * into b;

  return b;
end;
$$;

grant execute on function create_household(text) to authenticated;
grant execute on function join_household(text) to authenticated;
grant execute on function pay_bill(uuid, numeric, date) to authenticated;
