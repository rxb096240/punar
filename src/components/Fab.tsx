import { PlusIcon } from './icons';

export function Fab({ label = 'add', onClick }: { label?: string; onClick: () => void }) {
  return (
    <button className="fab" onClick={onClick}>
      <PlusIcon />
      {label}
    </button>
  );
}
