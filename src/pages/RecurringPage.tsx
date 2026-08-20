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
import { useResponsiveColumns } from '../hooks/useResponsiveColumns';
import type { Group, IconKey, RecurringItem } from '../lib/types';

type WithDays = RecurringItem & { days: number };

const UNCATEGORIZED = '__uncategorized';

// Rough per-block heights (px) used only to pick a balanced column, not for layout.
const HEADER_H = 40;
const PADDING_H = 32;
const ITEM_H = 56;
const EMPTY_H = 24;
const ADD_TILE_H = 76;

type BoardBlock =
  | { kind: 'group'; key: string; icon: IconKey; name: string; items: WithDays[]; onEdit?: () => void; onAdd?: () => void }
  | { kind: 'add' };

function blockHeight(block: BoardBlock): number {
  if (block.kind === 'add') return ADD_TILE_H;
  return HEADER_H + PADDING_H + (block.items.length ? block.items.length * ITEM_H : EMPTY_H);
}

/** Distributes board blocks across columns, always appending to the currently-shortest one. */
function layoutColumns(blocks: BoardBlock[], columnCount: number): BoardBlock[][] {
  const columns: BoardBlock[][] = Array.from({ length: columnCount }, () => []);
  const heights = new Array(columnCount).fill(0);
  for (const block of blocks) {
    let shortest = 0;
    for (let i = 1; i < columnCount; i++) {
      if (heights[i] < heights[shortest]) shortest = i;
    }
    columns[shortest].push(block);
    heights[shortest] += blockHeight(block);
  }
  return columns;
}

export function RecurringPage() {
  const { groups, recurring } = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [addGroupId, setAddGroupId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [payingItem, setPayingItem] = useState<RecurringItem | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const itemSheetOpen = addOpen || !!editingItem;

  function openAddItem(groupId: string | null) {
    setAddGroupId(groupId);
    setAddOpen(true);
  }

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

  const uncategorized = useMemo(() => itemsByGroup.get(UNCATEGORIZED) ?? [], [itemsByGroup]);
  const columnCount = useResponsiveColumns();

  const boardColumns = useMemo(() => {
    const blocks: BoardBlock[] = groups.groups.map((g) => ({
      kind: 'group',
      key: g.id,
      icon: g.icon,
      name: g.name,
      items: itemsByGroup.get(g.id) ?? [],
      onEdit: () => setEditingGroup(g),
      onAdd: () => openAddItem(g.id),
    }));
    if (uncategorized.length > 0) {
      blocks.push({ kind: 'group', key: UNCATEGORIZED, icon: 'star', name: 'Uncategorized', items: uncategorized });
    }
    blocks.push({ kind: 'add' });
    return layoutColumns(blocks, columnCount);
  }, [groups.groups, itemsByGroup, uncategorized, columnCount]);

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
    setAddGroupId(null);
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
          {boardColumns.map((column, i) => (
            <div className="board-column" key={i}>
              {column.map((block) =>
                block.kind === 'add' ? (
                  <AddCategoryTile key="add" onClick={() => setGroupSheetOpen(true)} />
                ) : (
                  <div className="board-col" key={block.key}>
                    <CategorySectionHeader
                      icon={block.icon}
                      name={block.name}
                      count={block.items.length}
                      onEdit={block.onEdit}
                      onAdd={block.onAdd}
                    />
                    {block.items.length === 0 ? (
                      <p className="empty-mini">nothing here yet</p>
                    ) : (
                      <div className="col-cards">{block.items.map((it) => renderCard(it, block.icon))}</div>
                    )}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}

      <Fab onClick={() => openAddItem(null)} />

      <AddRecurringSheet
        open={itemSheetOpen}
        onClose={closeSheet}
        groups={groups.groups}
        defaultGroupId={addGroupId}
        editing={editingItem}
        onAdd={recurring.addItem}
        onUpdate={recurring.updateItem}
        onNewGroup={() => setGroupSheetOpen(true)}
      />
      {/* Rendered after AddRecurringSheet so it stacks visually on top when
          both are open (opened via the "+" next to the group dropdown). */}
      <AddGroupSheet
        open={groupSheetOpen || !!editingGroup}
        onClose={() => {
          setGroupSheetOpen(false);
          setEditingGroup(null);
        }}
        editing={editingGroup}
        onCreate={async (name, icon) => {
          const g = await groups.createGroup(name, icon);
          if (itemSheetOpen) setAddGroupId(g.id);
          return g;
        }}
        onUpdate={groups.updateGroup}
        onDelete={async (id) => {
          await groups.removeGroup(id);
          await recurring.refresh();
        }}
      />
      <CompleteItemSheet item={payingItem} onClose={() => setPayingItem(null)} onComplete={recurring.completeItem} />
    </>
  );
}
