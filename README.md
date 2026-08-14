# Punar

A household tracker for recurring chores/maintenance, bills (with payment
history), and general to-dos — shared across a household via Supabase.

Built from a static HTML/CSS/JS mockup, now a proper React app backed by
Supabase (Postgres + Auth + Row Level Security).

## Features

- **Recurring items** — chores/maintenance with a last-done date and a
  repeat interval, grouped into categories with icons.
- **Bills** — amount, due date, repeat interval, payment method (auto/manual)
  and notes; marking a bill paid records a payment in its history and
  advances the due date.
- **To-dos** — one-off tasks with an optional due date.
- **Households** — sign up, create or join a household via invite code,
  and everyone in the household sees the same data (enforced by Postgres
  Row Level Security, not just the client).
- Every new household is automatically seeded with a **Utilities** bill
  group (Electricity, Atmos Gas, Water + Trash, Internet, Cable).

## Stack

- React + TypeScript + Vite
- Supabase (Postgres, Auth, RLS) via `@supabase/supabase-js`
- React Router
- Plain CSS (no framework) — ported 1:1 from the original mockup's design
  tokens/fonts (Unbounded + Sora)

## Setup

Punar's tables live in their own `punar` Postgres schema (not `public`), so
it's safe to run this in a Supabase project that already hosts another app
— nothing here will collide with that app's tables.

1. Pick a [Supabase](https://supabase.com) project (new or existing).
2. In the Supabase SQL editor, run the migrations in `supabase/migrations/`
   in order (`0001_init.sql`, then `0002_seed_utilities.sql`). Together
   they create the `punar` schema, all its tables, RLS policies, and the
   RPCs the app calls (`create_household`, `join_household`, `pay_bill`).
3. Go to **Project Settings → API → Data API** and add `punar` to
   **Exposed schemas** (it only exposes `public` by default — without this
   step the app can't see any of its tables).
4. Copy `.env.example` to `.env` and fill in the project's URL and anon
   key (Project Settings → API).
5. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

6. Sign up, then either create a new household or join one with an
   invite code (shown in the app header once you're in one).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — typecheck and build for production
- `npm run lint` — run oxlint
- `npm run preview` — preview the production build locally
