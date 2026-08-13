import { useEffect, useState } from 'react';
import { Sheet } from './Sheet';

export function AddHouseholdSheet({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName('');
    setError('');
  }, [open]);

  async function save() {
    if (!name.trim()) {
      setError('Give it a name.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onCreate(name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <h2>New household</h2>
      <p className="hint">give it a name you'll recognize in the switcher</p>
      <label htmlFor="hhsName">Name</label>
      <input id="hhsName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lake Cabin" />
      {error && <p className="error">{error}</p>}
      <button className="save" onClick={save} disabled={busy}>
        Create household
      </button>
    </Sheet>
  );
}
