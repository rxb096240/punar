import type { IconKey } from '../lib/types';

const PATHS: Record<IconKey, string> = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  bill: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2Z"/><path d="M9 8h6M9 12h6"/>',
  car: '<path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13"/><path d="M4 13h16v5H4z"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/>',
  health: '<path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20Z"/>',
  pet: '<circle cx="8" cy="9" r="2"/><circle cx="16" cy="9" r="2"/><circle cx="6" cy="15" r="1.8"/><circle cx="18" cy="15" r="1.8"/><path d="M12 13c-2.5 0-4 2-4 3.8C8 18.5 9.6 19 12 19s4-.5 4-2.2c0-1.8-1.5-3.8-4-3.8Z"/>',
  plant: '<path d="M12 21V10"/><path d="M12 12C9 12 6 10 6 6c4 0 6 2 6 6Z"/><path d="M12 14c3 0 6-2 6-6-4 0-6 2-6 6Z"/>',
  tech: '<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M8 20h8"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/>',
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6Z"/>',
  tool: '<path d="M14.5 6a3.5 3.5 0 0 0 4.6 4.6L21 12.5 12.5 21 4 12.5 6.4 4.9A3.5 3.5 0 0 0 14.5 6Z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  star: '<path d="M12 3.5l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.9l6-.8Z"/>',
};

export const ICON_KEYS = Object.keys(PATHS) as IconKey[];

export function Icon({ name, size = 18 }: { name: IconKey; size?: number }) {
  const path = PATHS[name] ?? PATHS.star;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}

export function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
