import { PartialMonthMethod } from '../types';

/** Number of calendar days in a given year/month (month is 1-indexed). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Inclusive count of working days (Mon-Fri) between two dates. Simplified: no holiday calendar. */
export function countWorkDays(start: Date, end: Date): number {
  if (start > end) return 0;
  let count = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= last) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

/** Inclusive count of calendar days between two dates. */
export function countCalendarDays(start: Date, end: Date): number {
  if (start > end) return 0;
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endUtc - startUtc) / 86400000) + 1;
}

/**
 * Full months worked as of the reporting month, counting the hire month as month 1.
 * Returns null when hireDate is missing (caller must apply the "missing hire date" rule).
 */
export function calcMonthsWorked(hireDateIso: string | null, reportYear: number, reportMonth: number): number | null {
  if (!hireDateIso) return null;
  const hireDate = new Date(hireDateIso);
  const hireYear = hireDate.getFullYear();
  const hireMonth = hireDate.getMonth() + 1;
  const months = (reportYear - hireYear) * 12 + (reportMonth - hireMonth) + 1;
  return Math.max(1, months);
}

export interface ProrationInput {
  year: number;
  month: number; // 1-indexed reporting month
  hireDateIso: string | null;
  absenceDays: number;
  method: PartialMonthMethod;
}

/**
 * Fraction (0..1) of the norm that should apply for a month that was only partially
 * worked — either because the employee was hired mid-month, or took leave/sick days.
 */
export function calcProrationFactor({ year, month, hireDateIso, absenceDays, method }: ProrationInput): number {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month - 1, daysInMonth(year, month));
  const hireDate = hireDateIso ? new Date(hireDateIso) : null;
  const periodStart = hireDate && hireDate > monthStart ? hireDate : monthStart;

  if (periodStart > monthEnd) return 0;

  const totalUnits = method === 'workDays' ? countWorkDays(monthStart, monthEnd) : countCalendarDays(monthStart, monthEnd);
  const rawWorkedUnits = method === 'workDays' ? countWorkDays(periodStart, monthEnd) : countCalendarDays(periodStart, monthEnd);
  const workedUnits = Math.max(0, Math.min(rawWorkedUnits - absenceDays, totalUnits));

  if (totalUnits === 0) return 1;
  return workedUnits / totalUnits;
}
