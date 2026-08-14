import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import type { RecurringItem } from '../lib/types';
import { todayISO } from '../lib/dates';
import { openDatePicker } from '../lib/openDatePicker';

export function CompleteItemSheet({
  item,
  onClose,
  onComplete,
}: {
  item: RecurringItem | null;
  onClose: () => void;
  onComplete: (id: string, amount: number | null, completedDate: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [completedDate, setCompletedDate] = useState(todayISO());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (item) {
      setAmount(item.amount != null ? String(item.amount) : '');
      setCompletedDate(todayISO());
      setError('');
    }
  }, [item]);

  if (!item) return null;

  async function save() {
    if (!item) return;
    setBusy(true);
    setError('');
    try {
      await onComplete(item.id, amount.trim() ? parseFloat(amount) : null, completedDate);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={!!item} onClose={onClose}>
      <h2>Mark paid — {item.name}</h2>
      <p className="hint">updates the amount and moves the next due date forward</p>

      <label htmlFor="pAmount">Amount paid</label>
      <input id="pAmount" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120.00" />

      <label htmlFor="pDate">Paid on</label>
      <input id="pDate" type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} onClick={openDatePicker} />

      {error && <p className="error">{error}</p>}
      <button className="save" onClick={save} disabled={busy}>
        Confirm payment
      </button>
    </Sheet>
  );
}
