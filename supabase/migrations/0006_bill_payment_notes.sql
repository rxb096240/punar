-- Bills: replace the Autopay checkbox with an explicit Payment method
-- (Auto / Manual), and add a free-form Notes field. Both are edit-only in
-- the UI — set after a bill exists, not at creation time; new bills default
-- to Manual until edited.

alter table punar.bills
  add column payment_method text not null default 'manual' check (payment_method in ('auto', 'manual'));

alter table punar.bills add column notes text;

update punar.bills set payment_method = case when autopay then 'auto' else 'manual' end;

alter table punar.bills drop column autopay;
