import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { CategorySectionHeader } from '../components/CategorySectionHeader';
import { AddCategoryTile } from '../components/AddCategoryTile';
import { DueCard } from '../components/DueCard';
import { Fab } from '../components/Fab';
import { AddGroupSheet } from '../components/AddGroupSheet';
import { AddRecurringSheet } from '../components/AddRecurringSheet';
import { TemplatesGrid } from '../components/TemplatesGrid';
import { RECURRING_TEMPLATES } from '../lib/templates';
import { daysUntilFromLast, urgency, formatDue, addDaysISO } from '../lib/dates';
import type { IconKey, RecurringItem } from '../lib/types';

type WithDays = RecurringItem & { days: number };

const UNCATEGORIZED = '__uncategorized';

export function RecurringPage() {
  const { groups, recurring } = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);

  const itemsByGroup = useMemo(() => {
    const map = new Map<string, WithDays[]>();
    for (const it of recurring.items) {
      const key = it.group_id ?? UNCATEGORIZED;
      const withDays: WithDays = { ...it, days: daysUntilFromLast(it.last_date, it.interval_days) };
      const arr = map.get(key);
      if (arr) arr.push(withDays);
      else map.set(key, [withDays]);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.days - b.days);
    return map;
  }, [recurring.items]);

  const uncategorized = itemsByGroup.get(UNCATEGORIZED) ?? [];

  async function useTemplate(index: number) {
    const t = RECURRING_TEMPLATES[index];
    let group = groups.groups.find((g) => g.name === t.group);
    if (!group) group = await groups.createGroup(t.group, t.icon);
    for (const item of t.items) {
      await recurring.addItem({
        groupId: group.id,
        name: item.name,
        lastDate: new Date().toISOString().slice(0, 10),
        intervalDays: item.interval,
      });
    }
  }

  function closeSheet() {
    setAddOpen(false);
    setEditingItem(null);
  }

  function renderCard(it: WithDays, icon: IconKey) {
    return (
      <DueCard
        key={it.id}
        icon={icon}
        name={it.name}
        meta={`due ${formatDue(addDaysISO(it.last_date, it.interval_days))}`}
        days={it.days}
        urgency={urgency(it.days)}
        doneTitle="Mark done"
        onDone={() => recurring.markDone(it.id)}
        onEdit={() => setEditingItem(it)}
        onRemove={() => recurring.removeItem(it.id)}
      />
    );
  }

  return (
    <>
      {recurring.items.length === 0 ? (
        <TemplatesGrid templates={RECURRING_TEMPLATES} onUse={useTemplate} emptyHint="start with a set, or add your own" />
      ) : (
        <div className="board">
          {groups.groups.map((g) => {
            const items = itemsByGroup.get(g.id) ?? [];
            return (
              <div className="board-col" key={g.id}>
                <CategorySectionHeader icon={g.icon} name={g.name} count={items.length} />
                {items.length === 0 ? (
                  <p className="empty-mini">nothing here yet</p>
                ) : (
                  <div className="col-cards">{items.map((it) => renderCard(it, g.icon))}</div>
                )}
              </div>
            );
          })}

          {uncategorized.length > 0 && (
            <div className="board-col">
              <CategorySectionHeader icon="star" name="Uncategorized" count={uncategorized.length} />
              <div className="col-cards">{uncategorized.map((it) => renderCard(it, 'star'))}</div>
            </div>
          )}

          <AddCategoryTile onClick={() => setGroupSheetOpen(true)} />
        </div>
      )}

      <Fab onClick={() => setAddOpen(true)} />

      <AddGroupSheet open={groupSheetOpen} onClose={() => setGroupSheetOpen(false)} onCreate={groups.createGroup} />
      <AddRecurringSheet
        open={addOpen || !!editingItem}
        onClose={closeSheet}
        groups={groups.groups}
        defaultGroupId={null}
        editing={editingItem}
        onAdd={recurring.addItem}
        onUpdate={recurring.updateItem}
        onNewGroup={() => {
          setAddOpen(false);
          setGroupSheetOpen(true);
        }}
      />
    </>
  );
}
