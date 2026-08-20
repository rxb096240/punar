import type { IconKey } from '../lib/types';
import { Icon } from './icons';

export function CategorySectionHeader({
  icon,
  name,
  count,
  onEdit,
}: {
  icon: IconKey;
  name: string;
  count: number;
  onEdit?: () => void;
}) {
  return (
    <div className="section-head">
      <div className="section-icon">
        <Icon name={icon} size={14} />
      </div>
      {onEdit ? (
        <h3
          className="section-name-edit"
          role="button"
          tabIndex={0}
          onClick={onEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onEdit();
            }
          }}
        >
          {name}
        </h3>
      ) : (
        <h3>{name}</h3>
      )}
      <span className="section-count">
        {count} item{count === 1 ? '' : 's'}
      </span>
    </div>
  );
}
