import type { Group } from '../lib/types';
import { Icon } from './icons';

export function GroupChips({
  groups,
  active,
  onSelect,
  onNewGroup,
}: {
  groups: Group[];
  active: string; // 'All' or group id
  onSelect: (id: string) => void;
  onNewGroup: () => void;
}) {
  if (groups.length === 0) return null;
  return (
    <div className="chips">
      <button className={`chip ${active === 'All' ? 'active' : ''}`} onClick={() => onSelect('All')}>
        All
      </button>
      {groups.map((g) => (
        <button
          key={g.id}
          className={`chip ${active === g.id ? 'active' : ''}`}
          onClick={() => onSelect(g.id)}
        >
          <Icon name={g.icon} size={14} />
          {g.name}
        </button>
      ))}
      <button className="chip new" onClick={onNewGroup}>
        + group
      </button>
    </div>
  );
}
