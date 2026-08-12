import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import type { Group } from '../lib/types';
import { todayISO } from '../lib/dates';

const INTERVAL_OPTIONS = [
  { value: '30', label: 'Monthly' },
  { value: '90', label: 'Quarterly' },
  { value: '180', label: '6 months' },
  { value: '365', label: 'Yearly' },
  { value: 'custom', label: 'Custom…' },
];

export function AddBillSheet({
  open,
  onClose,
  groups,
  defaultGroupId,
  onAdd,
  onNewGroup,
}: {
  open: boolean;
  onClose: () => void;
  groups: Group[];
  defaultGroupId: string | null;
  onAdd: (input: {
    groupId: string;
    name: string;
    amount: number | null;
    nextDueDate: string;
    intervalDays: number;
    autopay: boolean;
  }) => Promise<void>;
  onNewGroup: () => void;
}) {
  const [groupId, setGroupId] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [nextDueDate, setNextDueDate] = useState(todayISO());
  const [interval, setInterval] = useState('30');
  const [customDays, setCustomDays] = useState('');
  const [autopay, setAutopay] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setGroupId(defaultGroupId && groups.some((g) => g.id === defaultGroupId) ? defaultGroupId : groups[0]?.id ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
    const intervalDays = interval === 'custom' ? parseInt(customDays, 10) : parseInt(interval, 10);
    if (!intervalDays || intervalDays <= 0) {
      setError('Set how often it repeats.');
      return;
    }

    setBusy(true);
    try {
      await onAdd({
        groupId,
        name: name.trim(),
        amount: amount.trim() ? parseFloat(amount) : null,
        nextDueDate,
        intervalDays,
        autopay,
      });
      setName('');
      setAmount('');
      setNextDueDate(todayISO());
      setCustomDays('');
      setAutopay(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2>New bill</h2>
      <p className="hint">group stays selected so you can add a few in a row</p>

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
      <input id="bDue" type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} />

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
        Save it
      </button>
    </Sheet>
  );
}
