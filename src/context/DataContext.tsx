import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useHousehold } from './HouseholdContext';
import { useGroups } from '../hooks/useGroups';
import { useRecurringItems } from '../hooks/useRecurringItems';
import { useBills } from '../hooks/useBills';
import { useTodos } from '../hooks/useTodos';
import { daysUntil, daysUntilFromLast } from '../lib/dates';
import type { IconKey } from '../lib/types';

type DataContextValue = {
  groups: ReturnType<typeof useGroups>;
  recurring: ReturnType<typeof useRecurringItems>;
  bills: ReturnType<typeof useBills>;
  todos: ReturnType<typeof useTodos>;
  nextUp: { icon: IconKey; label: string; days: number } | null;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { household } = useHousehold();
  const householdId = household?.id;

  const groups = useGroups(householdId);
  const recurring = useRecurringItems(householdId);
  const bills = useBills(householdId);
  const todos = useTodos(householdId);

  const nextUp = useMemo(() => {
    const groupIcon = new Map(groups.groups.map((g) => [g.id, g.icon]));
    const candidates: { icon: IconKey; label: string; days: number }[] = [];

    for (const it of recurring.items) {
      candidates.push({
        icon: (it.group_id && groupIcon.get(it.group_id)) || 'star',
        label: it.name,
        days: daysUntilFromLast(it.last_date, it.interval_days),
      });
    }
    for (const b of bills.bills) {
      candidates.push({
        icon: (b.group_id && groupIcon.get(b.group_id)) || 'bill',
        label: b.name,
        days: daysUntil(b.next_due_date),
      });
    }
    for (const t of todos.todos) {
      if (t.completed || !t.due_date) continue;
      candidates.push({ icon: 'cal', label: t.title, days: daysUntil(t.due_date) });
    }

    candidates.sort((a, b) => a.days - b.days);
    return candidates[0] ?? null;
  }, [groups.groups, recurring.items, bills.bills, todos.todos]);

  return (
    <DataContext.Provider value={{ groups, recurring, bills, todos, nextUp }}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
