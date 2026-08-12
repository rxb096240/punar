import type { IconKey } from '../lib/types';
import { Icon } from './icons';

export function TemplatesGrid({
  templates,
  onUse,
  emptyHint,
}: {
  templates: { group: string; icon: IconKey; items: { name: string; interval: number }[] }[];
  onUse: (index: number) => void;
  emptyHint: string;
}) {
  return (
    <>
      <div className="empty">
        <p>{emptyHint}</p>
      </div>
      <div className="templates">
        {templates.map((t, i) => (
          <button className="template" key={t.group} onClick={() => onUse(i)}>
            <div className="t-icon">
              <Icon name={t.icon} size={20} />
            </div>
            <div className="t-info">
              <div className="t-name">{t.group}</div>
              <div className="t-sub">{t.items.length} common items</div>
            </div>
            <div className="t-add">add</div>
          </button>
        ))}
      </div>
    </>
  );
}
