import { useEffect, useState } from 'react';

const BREAKPOINTS = [
  { query: '(min-width: 1040px)', columns: 3 },
  { query: '(min-width: 700px)', columns: 2 },
] as const;

function currentColumns(): number {
  for (const bp of BREAKPOINTS) {
    if (window.matchMedia(bp.query).matches) return bp.columns;
  }
  return 1;
}

/** Number of board columns for the current viewport width, kept in sync as it changes. */
export function useResponsiveColumns(): number {
  const [columns, setColumns] = useState(() => (typeof window === 'undefined' ? 1 : currentColumns()));

  useEffect(() => {
    const queries = BREAKPOINTS.map((bp) => window.matchMedia(bp.query));
    const update = () => setColumns(currentColumns());
    queries.forEach((q) => q.addEventListener('change', update));
    return () => queries.forEach((q) => q.removeEventListener('change', update));
  }, []);

  return columns;
}
