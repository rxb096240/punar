import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { CategorySectionHeader } from '../components/CategorySectionHeader';
import { AddCategoryTile } from '../components/AddCategoryTile';
import { DueCard } from '../components/DueCard';
import { Fab } from '../components/Fab';
import { AddGroupSheet } from '../components/AddGroupSheet';
import { AddRecurringSheet } from '../components/AddRecurringSheet';
import { CompleteItemSheet } from '../components/CompleteItemSheet';
import { TemplatesGrid } from '../components/TemplatesGrid';
import { RECURRING_TEMPLATES } from '../lib/templates';
import { daysUntil, urgency, formatDue, todayISO } from '../lib/dates';
import type { Group, IconKey, RecurringItem } from '../lib/types';

type WithDays = RecurringItem & { days: number };

const UNCATEGORIZED = '__uncategorized';

export function RecurringPage() {
  const { groups, recurring } = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [payingItem, setPayingItem] = useState<RecurringItem | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const itemsByGroup = useMemo(() => {
    const map = new Map<string, WithDays[]>();
    for (const it of recurring.items) {
      const key = it.group_id ?? UNCATEGORIZED;
      const withDays: WithDays = { ...it, days: daysUntil(it.next_due_date) };
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
        nextDueDate: todayISO(),
        intervalDays: item.interval,
        intervalMonths: item.intervalMonths,
      });
    }
  }

  function closeSheet() {
    setAddOpen(false);
    setEditingItem(null);
  }

  function renderCard(it: WithDays, icon: IconKey) {
    const amountLabel = it.amount != null ? `$${it.amount.toFixed(2)} · ` : '';
    return (
      <DueCard
        key={it.id}
        icon={icon}
        name={it.name}
        meta={`${amountLabel}due ${formatDue(it.next_due_date)}${it.payment_method === 'auto' ? ' · autopay' : ''}`}
        days={it.days}
        urgency={urgency(it.days)}
        doneTitle={it.amount != null ? 'Mark paid' : 'Mark done'}
        onDone={() => (it.amount != null ? setPayingItem(it) : recurring.completeItem(it.id))}
        onEdit={() => setEditingItem(it)}
        onRemove={() => recurring.removeItem(it.id)}
      />
    );
  }

  return (
    <>
      {recurring.items.length === 0 ? (
        <>
          <TemplatesGrid templates={RECURRING_TEMPLATES} onUse={useTemplate} emptyHint="start with a set, or add your own" />
          <AddCategoryTile onClick={() => setGroupSheetOpen(true)} />
        </>
      ) : (
        <div className="board">
          {groups.groups.map((g) => {
            const items = itemsByGroup.get(g.id) ?? [];
            return (
              <div className="board-col" key={g.id}>
                <CategorySectionHeader icon={g.icon} name={g.name} count={items.length} onEdit={() => setEditingGroup(g)} />
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

      <AddGroupSheet
        open={groupSheetOpen || !!editingGroup}
        onClose={() => {
          setGroupSheetOpen(false);
          setEditingGroup(null);
        }}
        editing={editingGroup}
        onCreate={groups.createGroup}
        onUpdate={groups.updateGroup}
      />
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
      <CompleteItemSheet item={payingItem} onClose={() => setPayingItem(null)} onComplete={recurring.completeItem} />
    </>
  );
}
