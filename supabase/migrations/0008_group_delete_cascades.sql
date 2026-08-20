-- Deleting a group used to orphan its recurring items into "Uncategorized"
-- (on delete set null). Users expect deleting a category to remove what's
-- in it, so cascade the delete instead.

alter table punar.recurring_items
  drop constraint recurring_items_group_id_fkey;

alter table punar.recurring_items
  add constraint recurring_items_group_id_fkey
  foreign key (group_id) references punar.groups(id) on delete cascade;
