import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import type { Bill } from '../lib/types';
import { useBillPayments } from '../hooks/useBillPayments';
import { todayISO, formatDue } from '../lib/dates';

export function PayBillSheet({
  bill,
  onClose,
  onPay,
}: {
  bill: Bill | null;
  onClose: () => void;
  onPay: (id: string, amount: number | null, paidDate: string) => Promise<void>;
}) {
  const { payments, refresh } = useBillPayments(bill?.id ?? null);
  const [amount, setAmount] = useState('');
  const [paidDate, setPaidDate] = useState(todayISO());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (bill) {
      setAmount(bill.amount != null ? String(bill.amount) : '');
      setPaidDate(todayISO());
      setError('');
    }
  }, [bill]);

  if (!bill) return null;

  async function save() {
    if (!bill) return;
    setBusy(true);
    setError('');
    try {
      await onPay(bill.id, amount.trim() ? parseFloat(amount) : null, paidDate);
      await refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not record payment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={!!bill} onClose={onClose}>
      <h2>Mark paid — {bill.name}</h2>
      <p className="hint">records a payment and moves the next due date forward</p>

      <label htmlFor="pAmount">Amount paid</label>
      <input id="pAmount" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 120.00" />

      <label htmlFor="pDate">Paid on</label>
      <input id="pDate" type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />

      {error && <p className="error">{error}</p>}
      <button className="save" onClick={save} disabled={busy}>
        Confirm payment
      </button>

      {payments.length > 0 && (
        <>
          <label style={{ marginTop: 18 }}>Payment history</label>
          <div className="history-list">
            {payments.map((p) => (
              <div className="history-row" key={p.id}>
                <span>{formatDue(p.paid_date)}</span>
                <span>{p.amount_paid != null ? `$${p.amount_paid.toFixed(2)}` : '—'}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}
