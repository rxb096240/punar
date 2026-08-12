import { useState } from 'react';
import { Sheet } from './Sheet';
import { IconPicker } from './IconPicker';
import type { Group, IconKey } from '../lib/types';

export function AddGroupSheet({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, icon: IconKey) => Promise<Group>;
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconKey>('star');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim()) {
      setError('Give it a name.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onCreate(name.trim(), icon);
      setName('');
      setIcon('star');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create group.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2>New group</h2>
      <p className="hint">name it and pick an icon</p>
      <label htmlFor="gsName">Name</label>
      <input id="gsName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vehicle" />
      <label>Icon</label>
      <IconPicker selected={icon} onSelect={setIcon} />
      {error && <p className="error">{error}</p>}
      <button className="save" onClick={save} disabled={busy}>
        Create group
      </button>
    </Sheet>
  );
}
