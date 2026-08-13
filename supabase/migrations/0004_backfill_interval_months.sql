-- Bills and recurring items created before 0003 (or created after 0003's
-- column existed but before the app started sending interval_months) still
-- have interval_months = null, so they fall back to flat day-count math and
-- keep drifting — most visibly on "Yearly" (365 days), which loses a day
-- across any leap-year boundary. Backfill interval_months for rows whose
-- interval_days matches one of the standard calendar cadences.

update punar.bills
  set interval_months = case interval_days
    when 30 then 1
    when 90 then 3
    when 180 then 6
    when 365 then 12
    else interval_months
  end
  where interval_months is null
    and interval_days in (30, 90, 180, 365);

update punar.recurring_items
  set interval_months = case interval_days
    when 180 then 6
    when 365 then 12
    else interval_months
  end
  where interval_months is null
    and interval_days in (180, 365);
