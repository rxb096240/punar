import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import type { Group } from '../lib/types';
import { todayISO } from '../lib/dates';

const INTERVAL_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '6 months' },
  { value: '365', label: '1 year' },
  { value: 'custom', label: 'Custom…' },
];

export function AddRecurringSheet({
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
  onAdd: (input: { groupId: string; name: string; lastDate: string; intervalDays: number }) => Promise<void>;
  onNewGroup: () => void;
}) {
  const [groupId, setGroupId] = useState('');
  const [name, setName] = useState('');
  const [lastDate, setLastDate] = useState(todayISO());
  const [interval, setInterval] = useState('90');
  const [customDays, setCustomDays] = useState('');
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
      setError('Give the item a name.');
      return;
    }
    if (!lastDate) {
      setError('Pick when you last did it.');
      return;
    }
    const intervalDays = interval === 'custom' ? parseInt(customDays, 10) : parseInt(interval, 10);
    if (!intervalDays || intervalDays <= 0) {
      setError('Set how often it repeats.');
      return;
    }

    setBusy(true);
    try {
      await onAdd({ groupId, name: name.trim(), lastDate, intervalDays });
      setName('');
      setLastDate(todayISO());
      setCustomDays('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2>New item</h2>
      <p className="hint">group stays selected so you can add a few in a row</p>

      <label htmlFor="rGroup">Group</label>
      {groups.length === 0 ? (
        <button type="button" className="link-btn" onClick={onNewGroup}>
          + create a group first
        </button>
      ) : (
        <select id="rGroup" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      )}

      <label htmlFor="rName">What is it?</label>
      <input id="rName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AC filter" />

      <label htmlFor="rLast">Last done</label>
      <input id="rLast" type="date" value={lastDate} onChange={(e) => setLastDate(e.target.value)} />

      <label htmlFor="rInterval">Repeats every</label>
      <select id="rInterval" value={interval} onChange={(e) => setInterval(e.target.value)}>
        {INTERVAL_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {interval === 'custom' && (
        <>
          <label htmlFor="rCustom">Days</label>
          <input
            id="rCustom"
            type="number"
            min={1}
            value={customDays}
            onChange={(e) => setCustomDays(e.target.value)}
            placeholder="e.g. 45"
          />
        </>
      )}

      {error && <p className="error">{error}</p>}
      <button className="save" onClick={save} disabled={busy || groups.length === 0}>
        Save it
      </button>
    </Sheet>
  );
}
