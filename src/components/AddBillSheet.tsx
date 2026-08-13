import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import type { Bill, Group } from '../lib/types';
import { todayISO } from '../lib/dates';
import { openDatePicker } from '../lib/openDatePicker';

const INTERVAL_OPTIONS = [
  { value: 'monthly', label: 'Monthly', days: 30, months: 1 },
  { value: 'quarterly', label: 'Quarterly', days: 90, months: 3 },
  { value: 'semiannual', label: '6 months', days: 180, months: 6 },
  { value: 'yearly', label: 'Yearly', days: 365, months: 12 },
  { value: 'custom', label: 'Custom…', days: null, months: null },
] as const;

function intervalToOption(days: number): string {
  const preset = INTERVAL_OPTIONS.find((o) => o.value !== 'custom' && parseInt(o.value, 10) === days);
  return preset ? preset.value : 'custom';
}

export function AddBillSheet({
  open,
  onClose,
  groups,
  defaultGroupId,
  editing,
  onAdd,
  onUpdate,
  onNewGroup,
}: {
  open: boolean;
  onClose: () => void;
  groups: Group[];
  defaultGroupId: string | null;
  editing?: Bill | null;
  onAdd: (input: {
    groupId: string;
    name: string;
    amount: number | null;
    nextDueDate: string;
    intervalDays: number;
    intervalMonths: number | null;
    autopay: boolean;
  }) => Promise<void>;
  onUpdate: (
    id: string,
    input: {
      groupId: string;
      name: string;
      amount: number | null;
      nextDueDate: string;
      intervalDays: number;
      intervalMonths: number | null;
      autopay: boolean;
    }
  ) => Promise<void>;
  onNewGroup: () => void;
}) {
  const isEditing = !!editing;
  const [groupId, setGroupId] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [nextDueDate, setNextDueDate] = useState(todayISO());
  const [interval, setInterval] = useState('monthly');
  const [customDays, setCustomDays] = useState('');
  const [autopay, setAutopay] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setGroupId(editing.group_id ?? '');
      setName(editing.name);
      setAmount(editing.amount != null ? String(editing.amount) : '');
      setNextDueDate(editing.next_due_date);
      const opt = intervalToOption(editing.interval_days);
      setInterval(opt);
      setCustomDays(opt === 'custom' ? String(editing.interval_days) : '');
      setAutopay(editing.autopay);
    } else {
      setGroupId(defaultGroupId && groups.some((g) => g.id === defaultGroupId) ? defaultGroupId : groups[0]?.id ?? '');
      setName('');
      setAmount('');
      setNextDueDate(todayISO());
      setInterval('monthly');
      setCustomDays('');
      setAutopay(false);
    }
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  async function save() {
    setError('');
    if (!groupId) {
      setError('Pick a group.');
      return;
    }
    if (!name.trim()) {
      setError('Give the bill a name.');
      return;
    }
    if (!nextDueDate) {
      setError('Pick the next due date.');
      return;
    }
    const selected = INTERVAL_OPTIONS.find((o) => o.value === interval);
    const intervalDays = interval === 'custom' ? parseInt(customDays, 10) : selected?.days ?? 0;
    if (!intervalDays || intervalDays <= 0) {
      setError('Set how often it repeats.');
      return;
    }
    const intervalMonths = interval === 'custom' ? null : selected?.months ?? null;

    setBusy(true);
    try {
      const input = {
        groupId,
        name: name.trim(),
        amount: amount.trim() ? parseFloat(amount) : null,
        nextDueDate,
        intervalDays,
        intervalMonths,
        autopay,
      };
      if (isEditing && editing) {
        await onUpdate(editing.id, input);
        onClose();
      } else {
        await onAdd(input);
        setName('');
        setAmount('');
        setNextDueDate(todayISO());
        setCustomDays('');
        setAutopay(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2>{isEditing ? 'Edit bill' : 'New bill'}</h2>
      <p className="hint">{isEditing ? 'update the details below' : 'group stays selected so you can add a few in a row'}</p>

      <label htmlFor="bGroup">Group</label>
      {groups.length === 0 ? (
        <button type="button" className="link-btn" onClick={onNewGroup}>
          + create a group first
        </button>
      ) : (
        <select id="bGroup" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      )}

      <label htmlFor="bName">What is it?</label>
      <input id="bName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electricity" />

      <label htmlFor="bAmount">Amount</label>
      <input id="bAmount" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120.00" />

      <label htmlFor="bDue">Next due date</label>
      <input id="bDue" type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} onClick={openDatePicker} />

      <label htmlFor="bInterval">Repeats every</label>
      <select id="bInterval" value={interval} onChange={(e) => setInterval(e.target.value)}>
        {INTERVAL_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {interval === 'custom' && (
        <>
          <label htmlFor="bCustom">Days</label>
          <input id="bCustom" type="number" min={1} value={customDays} onChange={(e) => setCustomDays(e.target.value)} placeholder="e.g. 45" />
        </>
      )}

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, textTransform: 'none', letterSpacing: 0, fontSize: 13 }}>
        <input type="checkbox" style={{ width: 'auto' }} checked={autopay} onChange={(e) => setAutopay(e.target.checked)} />
        Autopay
      </label>

      {error && <p className="error">{error}</p>}
      <button className="save" onClick={save} disabled={busy || groups.length === 0}>
        {isEditing ? 'Save changes' : 'Save it'}
      </button>
    </Sheet>
  );
}
