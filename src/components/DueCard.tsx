import type { IconKey, Urgency } from '../lib/types';
import { Icon, CheckIcon, TrashIcon, EditIcon } from './icons';

export function DueCard({
  icon,
  name,
  meta,
  days,
  urgency,
  doneTitle,
  onDone,
  onEdit,
  onRemove,
}: {
  icon: IconKey;
  name: string;
  meta: string;
  days: number;
  urgency: Urgency;
  doneTitle: string;
  onDone: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const n = days === 0 ? '!' : Math.abs(days);
  const unit = days < 0 ? 'late' : days === 0 ? 'today' : 'days';

  return (
    <div className="item">
      <div className="item-icon">
        <Icon name={icon} size={20} />
      </div>
      <div className="info">
        <div className="name">{name}</div>
        <div className="meta">{meta}</div>
      </div>
      <div className={`count-pill ${urgency}`}>
        <div className="n">{n}</div>
        <div className="u">{unit}</div>
      </div>
      <div className="actions">
        <button className="done" title={doneTitle} onClick={onDone}>
          <CheckIcon />
        </button>
        <button title="Edit" onClick={onEdit}>
          <EditIcon />
        </button>
        <button title="Remove" onClick={onRemove}>
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
