import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useHousehold } from './HouseholdContext';
import { useGroups } from '../hooks/useGroups';
import { useRecurringItems } from '../hooks/useRecurringItems';
import { useTodos } from '../hooks/useTodos';
import { daysUntil } from '../lib/dates';
import type { IconKey } from '../lib/types';

type DataContextValue = {
  groups: ReturnType<typeof useGroups>;
  recurring: ReturnType<typeof useRecurringItems>;
  todos: ReturnType<typeof useTodos>;
  nextUp: { icon: IconKey; label: string; days: number } | null;
};

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { household } = useHousehold();
  const householdId = household?.id;

  const groups = useGroups(householdId);
  const recurring = useRecurringItems(householdId);
  const todos = useTodos(householdId);

  const nextUp = useMemo(() => {
    const groupIcon = new Map(groups.groups.map((g) => [g.id, g.icon]));
    const candidates: { icon: IconKey; label: string; days: number }[] = [];

    for (const it of recurring.items) {
      // Autopay items roll their own due date forward without any action
      // from you, so they're never something to surface as "up next" —
      // only items you might actually need to do something about, and
      // only once they're close enough to matter.
      if (it.payment_method === 'auto') continue;
      const days = daysUntil(it.next_due_date);
      if (days >= 10) continue;
      candidates.push({
        icon: (it.group_id && groupIcon.get(it.group_id)) || 'star',
        label: it.name,
        days,
      });
    }
    for (const t of todos.todos) {
      if (t.completed || !t.due_date) continue;
      candidates.push({ icon: 'cal', label: t.title, days: daysUntil(t.due_date) });
    }

    candidates.sort((a, b) => a.days - b.days);
    return candidates[0] ?? null;
  }, [groups.groups, recurring.items, todos.todos]);

  return (
    <DataContext.Provider value={{ groups, recurring, todos, nextUp }}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
