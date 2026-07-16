import { describe, expect, it } from 'vitest';
import { calcMonthsWorked, calcProrationFactor, countCalendarDays, countWorkDays, daysInMonth } from './dates';

describe('daysInMonth', () => {
  it('returns 30 for June and 31 for July', () => {
    expect(daysInMonth(2026, 6)).toBe(30);
    expect(daysInMonth(2026, 7)).toBe(31);
  });

  it('handles February in a leap year', () => {
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
  });
});

describe('countCalendarDays', () => {
  it('is inclusive of both endpoints', () => {
    expect(countCalendarDays(new Date(2026, 5, 15), new Date(2026, 5, 30))).toBe(16);
    expect(countCalendarDays(new Date(2026, 5, 1), new Date(2026, 5, 1))).toBe(1);
  });
});

describe('countWorkDays', () => {
  it('excludes Saturdays and Sundays', () => {
    // Mon 2026-06-01 .. Sun 2026-06-07 = 5 working days
    expect(countWorkDays(new Date(2026, 5, 1), new Date(2026, 5, 7))).toBe(5);
  });
});

describe('calcMonthsWorked', () => {
  it('returns null when hire date is missing', () => {
    expect(calcMonthsWorked(null, 2026, 6)).toBeNull();
  });

  it('counts the hire month as month 1', () => {
    expect(calcMonthsWorked('2026-06-15', 2026, 6)).toBe(1);
    expect(calcMonthsWorked('2026-06-15', 2026, 7)).toBe(2);
    expect(calcMonthsWorked('2026-06-15', 2026, 9)).toBe(4);
  });

  it('handles year rollover', () => {
    expect(calcMonthsWorked('2025-11-01', 2026, 2)).toBe(4);
  });
});

describe('calcProrationFactor', () => {
  it('is 1 for a full month with no absences', () => {
    const factor = calcProrationFactor({
      year: 2026, month: 6, hireDateIso: '2026-01-01', absenceDays: 0, method: 'calendarDays',
    });
    expect(factor).toBe(1);
  });

  it('prorates a mid-month hire by calendar days', () => {
    // Hired 2026-06-15, June has 30 days, worked days = 15..30 inclusive = 16
    const factor = calcProrationFactor({
      year: 2026, month: 6, hireDateIso: '2026-06-15', absenceDays: 0, method: 'calendarDays',
    });
    expect(factor).toBeCloseTo(16 / 30, 6);
  });

  it('reduces the factor for absence days within a fully-employed month', () => {
    const factor = calcProrationFactor({
      year: 2026, month: 6, hireDateIso: '2026-01-01', absenceDays: 8, method: 'calendarDays',
    });
    expect(factor).toBeCloseTo(22 / 30, 6);
  });

  it('never goes negative when absences exceed worked days', () => {
    const factor = calcProrationFactor({
      year: 2026, month: 6, hireDateIso: '2026-06-25', absenceDays: 30, method: 'calendarDays',
    });
    expect(factor).toBe(0);
  });

  it('returns 0 when hired after the reporting month', () => {
    const factor = calcProrationFactor({
      year: 2026, month: 6, hireDateIso: '2026-07-01', absenceDays: 0, method: 'calendarDays',
    });
    expect(factor).toBe(0);
  });
});
