import type { IconKey } from '../lib/types';
import { Icon, EditIcon } from './icons';

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
      <h3>{name}</h3>
      {onEdit && (
        <button type="button" className="section-edit" onClick={onEdit} title="Edit category" aria-label="Edit category">
          <EditIcon />
        </button>
      )}
      <span className="section-count">
        {count} item{count === 1 ? '' : 's'}
      </span>
    </div>
  );
}
