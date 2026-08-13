import type { Todo } from '../lib/types';
import { CheckIcon, TrashIcon } from './icons';
import { daysUntil, formatDue, urgency } from '../lib/dates';

export function TodoCard({
  todo,
  onToggle,
  onEdit,
  onRemove,
}: {
  todo: Todo;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const days = todo.due_date ? daysUntil(todo.due_date) : null;
  const u = days != null ? urgency(days) : null;
  const metaColor = todo.completed ? 'var(--muted)' : u === 'late' ? 'var(--coral)' : u === 'soon' ? 'var(--peach-ink)' : 'var(--muted)';

  return (
    <div
      className="item"
      role="button"
      tabIndex={0}
      style={{ opacity: todo.completed ? 0.6 : 1 }}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit();
        }
      }}
    >
      <div className="item-icon" style={todo.completed ? { background: 'var(--mint)', color: 'var(--mint-ink)' } : undefined}>
        <CheckIcon />
      </div>
      <div className="info">
        <div className="name" style={todo.completed ? { textDecoration: 'line-through' } : undefined}>
          {todo.title}
        </div>
        <div className="meta" style={{ color: metaColor }}>
          {todo.due_date ? `due ${formatDue(todo.due_date)}` : 'no due date'}
        </div>
      </div>
      <div className="actions">
        <button
          className={todo.completed ? '' : 'done'}
          title={todo.completed ? 'Mark not done' : 'Mark done'}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <CheckIcon />
        </button>
        <button
          title="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
