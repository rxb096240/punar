import type { Urgency } from './types';

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Days between today and a due date (negative = overdue). */
export function daysUntil(dueISO: string): number {
  const due = new Date(dueISO);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - t.getTime()) / 86400000);
}

export function daysUntilFromLast(lastDateISO: string, intervalDays: number): number {
  return daysUntil(addDaysISO(lastDateISO, intervalDays));
}

export function urgency(days: number): Urgency {
  return days < 0 ? 'late' : days <= 30 ? 'soon' : 'ok';
}

export function formatDue(dueISO: string): string {
  const due = new Date(dueISO);
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
