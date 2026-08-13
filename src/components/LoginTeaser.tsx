import { useMemo } from 'react';

const ICON_PATHS = [
  'M13 2 3 14h9l-1 8 10-12h-9z',
  'M12 22s8-4.5 8-11.8V5l-8-3-8 3v5.2C4 17.5 12 22 12 22z',
  'M4 4v16h16M4 15l4-4 4 3 6-7',
  'M12 2C8 6 5 9.5 5 13a7 7 0 0 0 14 0c0-3.5-3-7-7-11z',
];

type PillKind = 'ok' | 'soon' | 'late';
const PILL_KINDS: PillKind[] = ['ok', 'ok', 'soon', 'soon', 'late'];
const NAME_WIDTHS = [78, 55, 68, 90, 60, 72, 50, 82, 64];
const META_WIDTHS = [45, 38, 50, 42, 35, 48, 40];
const COLUMNS = [
  { items: 4, titleWidth: 40 },
  { items: 3, titleWidth: 55 },
  { items: 3, titleWidth: 35 },
  { items: 2, titleWidth: 48 },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPill(): { kind: PillKind; n: number; u: string } {
  const kind = pick(PILL_KINDS);
  if (kind === 'late') return { kind, n: Math.ceil(Math.random() * 4), u: 'late' };
  if (kind === 'soon') return { kind, n: Math.ceil(Math.random() * 20) + 1, u: 'days' };
  return { kind, n: Math.ceil(Math.random() * 90) + 20, u: 'days' };
}

function generateBoard() {
  return COLUMNS.map((col) => ({
    titleWidth: col.titleWidth,
    icon: pick(ICON_PATHS),
    items: Array.from({ length: col.items }, () => ({
      icon: pick(ICON_PATHS),
      nameWidth: pick(NAME_WIDTHS),
      metaWidth: pick(META_WIDTHS),
      pill: randomPill(),
    })),
  }));
}

/**
 * Decorative preview of a household board behind the sign-in card — desktop
 * only (hidden in CSS below 760px). Category/item names are masked bars,
 * never real or invented text, so nothing identifiable is implied.
 */
export function LoginTeaser() {
  const board = useMemo(() => generateBoard(), []);

  return (
    <div className="login-teaser" aria-hidden="true">
      <div className="teaser-board">
        {board.map((col, ci) => (
          <div className="teaser-col" key={ci}>
            <div className="section-head">
              <div className="section-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={col.icon} />
                </svg>
              </div>
              <span className="skel skel-title" style={{ width: `${col.titleWidth}%` }} />
              <span className="section-count">{col.items.length} items</span>
            </div>
            <div className="col-cards">
              {col.items.map((item, ii) => (
                <div className="item" key={ii}>
                  <div className="item-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <div className="info">
                    <span className="skel skel-name" style={{ width: `${item.nameWidth}%` }} />
                    <span className="skel skel-meta" style={{ width: `${item.metaWidth}%` }} />
                  </div>
                  <div className={`count-pill ${item.pill.kind}`}>
                    <div className="n">{item.pill.n}</div>
                    <div className="u">{item.pill.u}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
