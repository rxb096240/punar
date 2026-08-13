import type { Urgency } from './types';

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Adds calendar months to a date, clamping the day into the target month
 * (e.g. Jan 31 + 1 month = Feb 28, not the overflow-into-March you get from
 * naive day-count math). Matches punar.add_calendar_months() in the DB.
 */
export function addCalendarMonthsISO(dateISO: string, months: number): string {
  const [y, m, day] = dateISO.split('-').map(Number);
  const targetFirst = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDayOfTarget = new Date(Date.UTC(targetFirst.getUTCFullYear(), targetFirst.getUTCMonth() + 1, 0)).getUTCDate();
  targetFirst.setUTCDate(Math.min(day, lastDayOfTarget));
  return targetFirst.toISOString().slice(0, 10);
}

/** Advances a date by a bill/recurring item's cadence, preferring calendar months when set. */
export function advanceDateISO(dateISO: string, intervalDays: number, intervalMonths: number | null): string {
  return intervalMonths != null ? addCalendarMonthsISO(dateISO, intervalMonths) : addDaysISO(dateISO, intervalDays);
}

/** Days between today and a due date (negative = overdue). */
export function daysUntil(dueISO: string): number {
  const due = new Date(dueISO);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - t.getTime()) / 86400000);
}

export function daysUntilFromLast(lastDateISO: string, intervalDays: number, intervalMonths: number | null = null): number {
  return daysUntil(advanceDateISO(lastDateISO, intervalDays, intervalMonths));
}

export function urgency(days: number): Urgency {
  return days < 0 ? 'late' : days <= 30 ? 'soon' : 'ok';
}

export function formatDue(dueISO: string): string {
  const due = new Date(dueISO);
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
