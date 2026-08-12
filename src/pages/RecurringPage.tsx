import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { GroupChips } from '../components/GroupChips';
import { DueCard } from '../components/DueCard';
import { Fab } from '../components/Fab';
import { AddGroupSheet } from '../components/AddGroupSheet';
import { AddRecurringSheet } from '../components/AddRecurringSheet';
import { TemplatesGrid } from '../components/TemplatesGrid';
import { RECURRING_TEMPLATES } from '../lib/templates';
import { daysUntilFromLast, urgency, formatDue, addDaysISO } from '../lib/dates';

export function RecurringPage() {
  const { groups, recurring } = useData();
  const [activeGroup, setActiveGroup] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);

  const groupById = useMemo(() => new Map(groups.groups.map((g) => [g.id, g])), [groups.groups]);

  const visible = useMemo(() => {
    return recurring.items
      .filter((it) => activeGroup === 'All' || it.group_id === activeGroup)
      .map((it) => ({ ...it, days: daysUntilFromLast(it.last_date, it.interval_days) }))
      .sort((a, b) => a.days - b.days);
  }, [recurring.items, activeGroup]);

  async function useTemplate(index: number) {
    const t = RECURRING_TEMPLATES[index];
    let group = groups.groups.find((g) => g.name === t.group);
    if (!group) group = await groups.createGroup(t.group, t.icon);
    for (const item of t.items) {
      await recurring.addItem({ groupId: group.id, name: item.name, lastDate: new Date().toISOString().slice(0, 10), intervalDays: item.interval });
    }
    setActiveGroup(group.id);
  }

  return (
    <>
      <GroupChips
        groups={groups.groups}
        active={activeGroup}
        onSelect={setActiveGroup}
        onNewGroup={() => setGroupSheetOpen(true)}
      />

      {recurring.items.length === 0 ? (
        <TemplatesGrid templates={RECURRING_TEMPLATES} onUse={useTemplate} emptyHint="start with a set, or add your own" />
      ) : (
        <div className="cards">
          {visible.length === 0 ? (
            <div className="empty">
              <p>nothing in this group yet</p>
            </div>
          ) : (
            visible.map((it) => {
              const group = it.group_id ? groupById.get(it.group_id) : undefined;
              return (
                <DueCard
                  key={it.id}
                  icon={group?.icon ?? 'star'}
                  name={it.name}
                  meta={`${group?.name ?? 'Uncategorized'} · due ${formatDue(addDaysISO(it.last_date, it.interval_days))}`}
                  days={it.days}
                  urgency={urgency(it.days)}
                  doneTitle="Mark done"
                  onDone={() => recurring.markDone(it.id)}
                  onRemove={() => recurring.removeItem(it.id)}
                />
              );
            })
          )}
        </div>
      )}

      <Fab onClick={() => setAddOpen(true)} />

      <AddGroupSheet open={groupSheetOpen} onClose={() => setGroupSheetOpen(false)} onCreate={groups.createGroup} />
      <AddRecurringSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        groups={groups.groups}
        defaultGroupId={activeGroup === 'All' ? null : activeGroup}
        onAdd={recurring.addItem}
        onNewGroup={() => {
          setAddOpen(false);
          setGroupSheetOpen(true);
        }}
      />
    </>
  );
}
