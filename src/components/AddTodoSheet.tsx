import { useState } from 'react';
import { Sheet } from './Sheet';

export function AddTodoSheet({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (input: { title: string; notes?: string; dueDate?: string | null }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!title.trim()) {
      setError('Give the to-do a title.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onAdd({ title: title.trim(), notes: notes.trim(), dueDate: dueDate || null });
      setTitle('');
      setNotes('');
      setDueDate('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2>New to-do</h2>
      <p className="hint">one-off tasks, no repeat needed</p>

      <label htmlFor="tTitle">What needs doing?</label>
      <input id="tTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Call the plumber" />

      <label htmlFor="tNotes">Notes (optional)</label>
      <textarea id="tNotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any details…" />

      <label htmlFor="tDue">Due date (optional)</label>
      <input id="tDue" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

      {error && <p className="error">{error}</p>}
      <button className="save" onClick={save} disabled={busy}>
        Save it
      </button>
    </Sheet>
  );
}
