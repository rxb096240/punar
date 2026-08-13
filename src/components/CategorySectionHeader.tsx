import type { IconKey } from '../lib/types';
import { Icon } from './icons';

export function CategorySectionHeader({ icon, name, count }: { icon: IconKey; name: string; count: number }) {
  return (
    <div className="section-head">
      <div className="section-icon">
        <Icon name={icon} size={14} />
      </div>
      <h3>{name}</h3>
      <span className="section-count">
        {count} item{count === 1 ? '' : 's'}
      </span>
    </div>
  );
}
