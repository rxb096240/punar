import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { GroupChips } from '../components/GroupChips';
import { DueCard } from '../components/DueCard';
import { Fab } from '../components/Fab';
import { AddGroupSheet } from '../components/AddGroupSheet';
import { AddBillSheet } from '../components/AddBillSheet';
import { PayBillSheet } from '../components/PayBillSheet';
import { TemplatesGrid } from '../components/TemplatesGrid';
import { BILL_TEMPLATES } from '../lib/templates';
import { daysUntil, urgency, formatDue } from '../lib/dates';
import type { Bill } from '../lib/types';

export function BillsPage() {
  const { groups, bills } = useData();
  const [activeGroup, setActiveGroup] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [groupSheetOpen, setGroupSheetOpen] = useState(false);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);

  const groupById = useMemo(() => new Map(groups.groups.map((g) => [g.id, g])), [groups.groups]);

  const visible = useMemo(() => {
    return bills.bills
      .filter((b) => activeGroup === 'All' || b.group_id === activeGroup)
      .map((b) => ({ ...b, days: daysUntil(b.next_due_date) }))
      .sort((a, b) => a.days - b.days);
  }, [bills.bills, activeGroup]);

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

      {bills.bills.length === 0 ? (
        <TemplatesGrid templates={BILL_TEMPLATES} onUse={useTemplate} emptyHint="track what's due and what you paid" />
      ) : (
        <div className="cards">
          {visible.length === 0 ? (
            <div className="empty">
              <p>nothing in this group yet</p>
            </div>
          ) : (
            visible.map((b) => {
              const group = b.group_id ? groupById.get(b.group_id) : undefined;
              const amountLabel = b.amount != null ? `$${b.amount.toFixed(2)} · ` : '';
              return (
                <DueCard
                  key={b.id}
                  icon={group?.icon ?? 'bill'}
                  name={b.name}
                  meta={`${amountLabel}${group?.name ?? 'Uncategorized'} · due ${formatDue(b.next_due_date)}${b.autopay ? ' · autopay' : ''}`}
                  days={b.days}
                  urgency={urgency(b.days)}
                  doneTitle="Mark paid"
                  onDone={() => setPayingBill(b)}
                  onRemove={() => bills.removeBill(b.id)}
                />
              );
            })
          )}
        </div>
      )}

      <Fab label="add bill" onClick={() => setAddOpen(true)} />

      <AddGroupSheet open={groupSheetOpen} onClose={() => setGroupSheetOpen(false)} onCreate={groups.createGroup} />
      <AddBillSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        groups={groups.groups}
        defaultGroupId={activeGroup === 'All' ? null : activeGroup}
        onAdd={bills.addBill}
        onNewGroup={() => {
          setAddOpen(false);
          setGroupSheetOpen(true);
        }}
      />
      <PayBillSheet bill={payingBill} onClose={() => setPayingBill(null)} onPay={bills.payBill} />
    </>
  );
}
