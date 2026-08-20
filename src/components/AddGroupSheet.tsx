import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';
import { IconPicker } from './IconPicker';
import type { Group, IconKey } from '../lib/types';

export function AddGroupSheet({
  open,
  onClose,
  editing,
  onCreate,
  onUpdate,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Group | null;
  onCreate: (name: string, icon: IconKey) => Promise<Group>;
  onUpdate: (id: string, name: string, icon: IconKey) => Promise<Group>;
  onDelete: (id: string) => Promise<void>;
}) {
  const isEditing = !!editing;
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconKey>('star');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setIcon(editing.icon);
    } else {
      setName('');
      setIcon('star');
    }
    setError('');
  }, [open, editing]);

  async function save() {
    if (!name.trim()) {
      setError('Give it a name.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (isEditing && editing) {
        await onUpdate(editing.id, name.trim(), icon);
      } else {
        await onCreate(name.trim(), icon);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!editing) return;
    if (!window.confirm(`Delete "${editing.name}" and everything in it? This can't be undone.`)) return;
    setBusy(true);
    setError('');
    try {
      await onDelete(editing.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete.');
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2>{isEditing ? 'Edit category' : 'New category'}</h2>
      <p className="hint">{isEditing ? 'rename it or change its icon' : 'name it and pick an icon'}</p>
      <label htmlFor="gsName">Name</label>
      <input id="gsName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vehicle" />
      <label>Icon</label>
      <IconPicker selected={icon} onSelect={setIcon} />
      {error && <p className="error">{error}</p>}
      <button className="save" onClick={save} disabled={busy}>
        {isEditing ? 'Save changes' : 'Create group'}
      </button>
      {isEditing && (
        <button type="button" className="link-btn danger" onClick={remove} disabled={busy}>
          Delete category
        </button>
      )}
    </Sheet>
  );
}
