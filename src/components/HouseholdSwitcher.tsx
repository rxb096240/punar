import { useEffect, useRef, useState } from 'react';
import type { Household } from '../lib/types';
import { ChevronDownIcon, CheckIcon, EditIcon, PlusIcon } from './icons';
import { AddHouseholdSheet } from './AddHouseholdSheet';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function HouseholdSwitcher({
  household,
  households,
  onSelect,
  onRename,
  onCreate,
}: {
  household: Household;
  households: Household[];
  onSelect: (id: string) => void;
  onRename: (id: string, name: string) => Promise<void>;
  onCreate: (name: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const [renameBusy, setRenameBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setRenamingId(null);
      }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  function startRename(h: Household) {
    setRenamingId(h.id);
    setRenameValue(h.name);
    setRenameError('');
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameError('');
  }

  async function commitRename() {
    const id = renamingId;
    const value = renameValue.trim();
    if (!id) return;
    if (!value) {
      setRenameError('Name can’t be empty.');
      return;
    }
    setRenameBusy(true);
    setRenameError('');
    try {
      await onRename(id, value);
      setRenamingId(null);
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Could not rename.');
    } finally {
      setRenameBusy(false);
    }
  }

  return (
    <div className="hh-root" ref={rootRef}>
      <button type="button" className="hh-switch" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((v) => !v)}>
        {household.name}
        <ChevronDownIcon />
      </button>

      <div className={`hh-panel${open ? ' open' : ''}`} role="menu">
        <div className="hh-list">
          {households.map((h) =>
            renamingId === h.id ? (
              <div className="hh-rename-wrap" key={h.id}>
                <div className="hh-rename">
                  <input
                    autoFocus
                    value={renameValue}
                    disabled={renameBusy}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') cancelRename();
                    }}
                  />
                  <button type="button" className="confirm" title="Save" disabled={renameBusy} onClick={commitRename}>
                    <CheckIcon />
                  </button>
                  <button type="button" className="cancel" title="Cancel" disabled={renameBusy} onClick={cancelRename}>
                    ×
                  </button>
                </div>
                {renameError && <p className="hh-error">{renameError}</p>}
              </div>
            ) : (
              <div
                key={h.id}
                className={`hh-row${h.id === household.id ? ' active' : ''}`}
                role="menuitemradio"
                aria-checked={h.id === household.id}
                onClick={() => {
                  onSelect(h.id);
                  setOpen(false);
                }}
              >
                <span className="hh-avatar">{initials(h.name)}</span>
                <span className="hh-name">{h.name}</span>
                <span className="hh-check">
                  <CheckIcon />
                </span>
                <button
                  type="button"
                  className="hh-edit"
                  title={`Rename ${h.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    startRename(h);
                  }}
                >
                  <EditIcon />
                </button>
              </div>
            )
          )}
        </div>
        <div className="hh-divider" />
        <button
          type="button"
          className="hh-add"
          onClick={() => {
            setOpen(false);
            setAddOpen(true);
          }}
        >
          <span className="plus-icon">
            <PlusIcon />
          </span>
          Add household
        </button>
      </div>

      <AddHouseholdSheet open={addOpen} onClose={() => setAddOpen(false)} onCreate={onCreate} />
    </div>
  );
}
