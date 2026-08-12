import { ICON_KEYS, Icon } from './icons';
import type { IconKey } from '../lib/types';

export function IconPicker({ selected, onSelect }: { selected: IconKey; onSelect: (k: IconKey) => void }) {
  return (
    <div className="icon-grid">
      {ICON_KEYS.map((k) => (
        <button
          key={k}
          type="button"
          className={`icon-opt ${k === selected ? 'sel' : ''}`}
          onClick={() => onSelect(k)}
        >
          <Icon name={k} size={18} />
        </button>
      ))}
    </div>
  );
}
