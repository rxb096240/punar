import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import type { Todo } from '../lib/types';
import { openDatePicker } from '../lib/openDatePicker';

export function AddTodoSheet({
  open,
  onClose,
  editing,
  onAdd,
  onUpdate,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Todo | null;
  onAdd: (input: { title: string; notes?: string; dueDate?: string | null }) => Promise<void>;
  onUpdate: (id: string, input: { title: string; notes?: string; dueDate?: string | null }) => Promise<void>;
}) {
  const isEditing = !!editing;
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setNotes(editing.notes ?? '');
      setDueDate(editing.due_date ?? '');
    } else {
      setTitle('');
      setNotes('');
      setDueDate('');
    }
    setError('');
  }, [open, editing]);

  async function save() {
    if (!title.trim()) {
      setError('Give the to-do a title.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const input = { title: title.trim(), notes: notes.trim(), dueDate: dueDate || null };
      if (isEditing && editing) {
        await onUpdate(editing.id, input);
      } else {
        await onAdd(input);
      }
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
      <h2>{isEditing ? 'Edit to-do' : 'New to-do'}</h2>
      <p className="hint">{isEditing ? 'update the details below' : 'one-off tasks, no repeat needed'}</p>

      <label htmlFor="tTitle">What needs doing?</label>
      <input id="tTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Call the plumber" />

      <label htmlFor="tNotes">Notes (optional)</label>
      <textarea id="tNotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any details…" />

      <label htmlFor="tDue">Due date (optional)</label>
      <input id="tDue" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} onClick={openDatePicker} />

      {error && <p className="error">{error}</p>}
      <button className="save" onClick={save} disabled={busy}>
        {isEditing ? 'Save changes' : 'Save it'}
      </button>
    </Sheet>
  );
}
