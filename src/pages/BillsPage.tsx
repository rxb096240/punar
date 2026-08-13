import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { CategorySectionHeader } from '../components/CategorySectionHeader';
import { AddCategoryTile } from '../components/AddCategoryTile';
import { DueCard } from '../components/DueCard';
import { Fab } from '../components/Fab';
import { AddGroupSheet } from '../components/AddGroupSheet';
import { AddBillSheet } from '../components/AddBillSheet';
import { PayBillSheet } from '../components/PayBillSheet';
import { TemplatesGrid } from '../components/TemplatesGrid';
import { BILL_TEMPLATES } from '../lib/templates';
import { daysUntil, urgency, formatDue } from '../lib/dates';
import type { Bill, IconKey } from '../lib/types';

type WithDays = Bill & { days: number };

const UNCATEGORIZED = '__uncategorized';

export function BillsPage() {
  const { groups, bills } = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);

  const billsByGroup = useMemo(() => {
    const map = new Map<string, WithDays[]>();
    for (const b of bills.bills) {
      const key = b.group_id ?? UNCATEGORIZED;
      const withDays: WithDays = { ...b, days: daysUntil(b.next_due_date) };
      const arr = map.get(key);
      if (arr) arr.push(withDays);
      else map.set(key, [withDays]);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.days - b.days);
    return map;
  }, [bills.bills]);

  const uncategorized = billsByGroup.get(UNCATEGORIZED) ?? [];

  async function useTemplate(index: number) {
    const t = BILL_TEMPLATES[index];
    let group = groups.groups.find((g) => g.name === t.group);
    if (!group) group = await groups.createGroup(t.group, t.icon);
    for (const item of t.items) {
      await bills.addBill({
        groupId: group.id,
        name: item.name,
        amount: null,
        nextDueDate: new Date().toISOString().slice(0, 10),
        intervalDays: item.interval,
        autopay: false,
      });
    }
  }

  function closeSheet() {
    setAddOpen(false);
    setEditingBill(null);
  }

  function renderCard(b: WithDays, icon: IconKey) {
    const amountLabel = b.amount != null ? `$${b.amount.toFixed(2)} · ` : '';
    return (
      <DueCard
        key={b.id}
        icon={icon}
        name={b.name}
        meta={`${amountLabel}due ${formatDue(b.next_due_date)}${b.autopay ? ' · autopay' : ''}`}
        days={b.days}
        urgency={urgency(b.days)}
        doneTitle="Mark paid"
        onDone={() => setPayingBill(b)}
        onEdit={() => setEditingBill(b)}
        onRemove={() => bills.removeBill(b.id)}
      />
    );
  }

  return (
    <>
      {bills.bills.length === 0 ? (
        <TemplatesGrid templates={BILL_TEMPLATES} onUse={useTemplate} emptyHint="track what's due and what you paid" />
      ) : (
        <div className="board">
          {groups.groups.map((g) => {
            const items = billsByGroup.get(g.id) ?? [];
            return (
              <div className="board-col" key={g.id}>
                <CategorySectionHeader icon={g.icon} name={g.name} count={items.length} />
                {items.length === 0 ? (
                  <p className="empty-mini">nothing here yet</p>
                ) : (
                  <div className="col-cards">{items.map((b) => renderCard(b, g.icon))}</div>
                )}
              </div>
            );
          })}

          {uncategorized.length > 0 && (
            <div className="board-col">
              <CategorySectionHeader icon="bill" name="Uncategorized" count={uncategorized.length} />
              <div className="col-cards">{uncategorized.map((b) => renderCard(b, 'bill'))}</div>
            </div>
          )}

          <AddCategoryTile onClick={() => setGroupSheetOpen(true)} />
        </div>
      )}

      <Fab label="add bill" onClick={() => setAddOpen(true)} />

      <AddGroupSheet open={groupSheetOpen} onClose={() => setGroupSheetOpen(false)} onCreate={groups.createGroup} />
      <AddBillSheet
        open={addOpen || !!editingBill}
        onClose={closeSheet}
        groups={groups.groups}
        defaultGroupId={null}
        editing={editingBill}
        onAdd={bills.addBill}
        onUpdate={bills.updateBill}
        onNewGroup={() => {
          setAddOpen(false);
          setGroupSheetOpen(true);
        }}
      />
      <PayBillSheet bill={payingBill} onClose={() => setPayingBill(null)} onPay={bills.payBill} />
    </>
  );
}
