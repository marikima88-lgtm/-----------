import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../settings/defaultSettings';
import { Employee, MonthlyFact } from '../types';
import {
  applyRounding, calcAdaptationFactor, calcDynamics, calcIndividualNorm, calcOverallPercent,
  calcPercent, calcRating, computeMonthlyResult,
} from './engine';

// ---------------------------------------------------------------------------
// Adaptation factor / individual norm — section "2.1"/"2.2" of DESIGN.md,
// mirrors the worked examples from the brief (section 1 of the task).
// ---------------------------------------------------------------------------

describe('calcAdaptationFactor', () => {
  it('returns the correct bracket for months 1-3 and 4+', () => {
    expect(calcAdaptationFactor(1, DEFAULT_SETTINGS)).toBe(0.3);
    expect(calcAdaptationFactor(2, DEFAULT_SETTINGS)).toBe(0.5);
    expect(calcAdaptationFactor(3, DEFAULT_SETTINGS)).toBe(0.7);
    expect(calcAdaptationFactor(4, DEFAULT_SETTINGS)).toBe(1);
    expect(calcAdaptationFactor(12, DEFAULT_SETTINGS)).toBe(1);
  });

  it('treats month 0 or negative the same as month 1 (defensive)', () => {
    expect(calcAdaptationFactor(0, DEFAULT_SETTINGS)).toBe(0.3);
  });
});

describe('applyRounding', () => {
  it('rounds up by default (ceil)', () => {
    expect(applyRounding(107.7 * 1, 'ceil')).toBe(108);
    expect(applyRounding(251.3, 'ceil')).toBe(252);
  });

  it('supports round and floor for configurability', () => {
    expect(applyRounding(251.3, 'round')).toBe(251);
    expect(applyRounding(251.9, 'floor')).toBe(251);
  });
});

describe('calcIndividualNorm — worked examples from the brief', () => {
  it('month 1: 30% of base norms', () => {
    expect(calcIndividualNorm(1200, 1, DEFAULT_SETTINGS)).toBe(360);
    expect(calcIndividualNorm(359, 1, DEFAULT_SETTINGS)).toBe(108); // 107.7 -> ceil -> 108
    expect(calcIndividualNorm(15, 1, DEFAULT_SETTINGS)).toBe(5); // 4.5 -> ceil -> 5
  });

  it('month 2: 50% of base norms', () => {
    expect(calcIndividualNorm(1200, 2, DEFAULT_SETTINGS)).toBe(600);
    expect(calcIndividualNorm(359, 2, DEFAULT_SETTINGS)).toBe(180); // 179.5 -> ceil -> 180
    expect(calcIndividualNorm(15, 2, DEFAULT_SETTINGS)).toBe(8); // 7.5 -> ceil -> 8
  });

  it('month 3: 70% of base norms — phoneNumbers corrects a typo in the brief (251 -> 252 under ceil)', () => {
    expect(calcIndividualNorm(1200, 3, DEFAULT_SETTINGS)).toBe(840);
    expect(calcIndividualNorm(359, 3, DEFAULT_SETTINGS)).toBe(252); // 251.3 -> ceil -> 252, see DESIGN.md note
    expect(calcIndividualNorm(15, 3, DEFAULT_SETTINGS)).toBe(11); // 10.5 -> ceil -> 11
  });

  it('with roundingMode "round" the phoneNumbers month-3 figure matches the brief\'s literal 251', () => {
    const roundSettings = { ...DEFAULT_SETTINGS, roundingMode: 'round' as const };
    expect(calcIndividualNorm(359, 3, roundSettings)).toBe(251);
  });

  it('month 4+: 100% of base norms', () => {
    expect(calcIndividualNorm(1200, 4, DEFAULT_SETTINGS)).toBe(1200);
    expect(calcIndividualNorm(359, 4, DEFAULT_SETTINGS)).toBe(359);
    expect(calcIndividualNorm(15, 4, DEFAULT_SETTINGS)).toBe(15);
  });

  it('applies the proration factor multiplicatively (mid-month hire, example D)', () => {
    // 22 worked days out of a 30-day month => factor 22/30
    const factor = 22 / 30;
    expect(calcIndividualNorm(1200, 6, DEFAULT_SETTINGS, factor)).toBe(880);
    expect(calcIndividualNorm(359, 6, DEFAULT_SETTINGS, factor)).toBe(264); // 263.27 -> ceil -> 264
    expect(calcIndividualNorm(15, 6, DEFAULT_SETTINGS, factor)).toBe(11);
  });
});

// ---------------------------------------------------------------------------
// Percent / overall percent / rating — sections "2.3"-"2.5"
// ---------------------------------------------------------------------------

describe('calcPercent', () => {
  it('matches the brief\'s example: 900 of 1200 = 75%', () => {
    expect(calcPercent(900, 1200)).toBe(75);
  });

  it('is not capped at 100% — overperformance is visible', () => {
    expect(calcPercent(1500, 1200)).toBe(125);
  });

  it('returns null instead of dividing by zero when the norm is 0', () => {
    expect(calcPercent(10, 0)).toBeNull();
  });
});

describe('calcOverallPercent', () => {
  it('averages three equally-weighted percents', () => {
    const percents = { operations: 75, phoneNumbers: 83.56, reviews: 66.67 };
    const overall = calcOverallPercent(percents, DEFAULT_SETTINGS.weights);
    expect(overall).toBeCloseTo((75 + 83.56 + 66.67) / 3, 4);
  });

  it('normalizes weights that do not sum to 1', () => {
    const percents = { operations: 100, phoneNumbers: 50, reviews: 0 };
    const weights = { operations: 2, phoneNumbers: 1, reviews: 1 }; // sums to 4, not 1
    // weighted = (100*2 + 50*1 + 0*1) / 4 = 250/4 = 62.5
    expect(calcOverallPercent(percents, weights)).toBeCloseTo(62.5, 6);
  });
});

describe('calcRating', () => {
  it('assigns A at 100% and above', () => {
    const percents = { operations: 105, phoneNumbers: 102, reviews: 100 };
    expect(calcRating(102, percents, DEFAULT_SETTINGS).rating).toBe('A');
  });

  it('assigns B between 80% and 99.99%', () => {
    const percents = { operations: 85, phoneNumbers: 90, reviews: 80 };
    expect(calcRating(85, percents, DEFAULT_SETTINGS).rating).toBe('B');
  });

  it('assigns C below 80%', () => {
    const percents = { operations: 75, phoneNumbers: 83.56, reviews: 66.67 };
    const overall = (75 + 83.56 + 66.67) / 3;
    expect(calcRating(overall, percents, DEFAULT_SETTINGS).rating).toBe('C');
  });

  it('caps the rating at C when any single metric is below the 50% floor, even if the overall is B', () => {
    // Example C from DESIGN.md: overall ~89.36% (would be B) but reviews at 40%.
    const percents = { operations: 116.6667, phoneNumbers: 111.4206, reviews: 40 };
    const overall = calcOverallPercent(percents, DEFAULT_SETTINGS.weights);
    expect(overall).toBeGreaterThan(80);
    const { rating, capped } = calcRating(overall, percents, DEFAULT_SETTINGS);
    expect(rating).toBe('C');
    expect(capped).toBe(true);
  });

  it('does not report "capped" when the base rating is already C', () => {
    const percents = { operations: 40, phoneNumbers: 40, reviews: 40 };
    const { rating, capped } = calcRating(40, percents, DEFAULT_SETTINGS);
    expect(rating).toBe('C');
    expect(capped).toBe(false);
  });
});

describe('calcDynamics', () => {
  it('reports an upward change with a positive delta', () => {
    expect(calcDynamics(90, 80)).toEqual({ delta: 10, direction: 'up' });
  });

  it('reports a downward change with a negative delta', () => {
    expect(calcDynamics(70, 80)).toEqual({ delta: -10, direction: 'down' });
  });

  it('reports flat when unchanged', () => {
    expect(calcDynamics(80, 80)).toEqual({ delta: 0, direction: 'flat' });
  });

  it('reports no-data when either side is missing, rather than treating it as 0', () => {
    expect(calcDynamics(80, null)).toEqual({ delta: null, direction: 'no-data' });
    expect(calcDynamics(null, 80)).toEqual({ delta: null, direction: 'no-data' });
  });
});

// ---------------------------------------------------------------------------
// computeMonthlyResult — end-to-end pipeline, matches the worked examples
// A/B/C in DESIGN.md and the special cases from section 11 of the brief.
// ---------------------------------------------------------------------------

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 'emp-1',
    fullName: 'Тестова Т.Т.',
    departmentId: 'dep-1',
    hireDate: '2025-01-01',
    status: 'active',
    departmentHistory: [],
    ...overrides,
  };
}

function makeFact(overrides: Partial<MonthlyFact> = {}): MonthlyFact {
  return {
    id: 'fact-1',
    employeeId: 'emp-1',
    departmentId: 'dep-1',
    year: 2026,
    month: 6,
    operations: 0,
    phoneNumbers: 0,
    reviews: 0,
    absenceDays: 0,
    hasData: true,
    ...overrides,
  };
}

describe('computeMonthlyResult', () => {
  it('example A: new hire, month 1, hired mid-month — rating A', () => {
    const employee = makeEmployee({ hireDate: '2026-06-15' });
    const fact = makeFact({ operations: 210, phoneNumbers: 60, reviews: 3 });

    const result = computeMonthlyResult({
      employee, departmentName: 'АПОРТ', fact, previousFact: undefined,
      reportYear: 2026, reportMonth: 6, settings: DEFAULT_SETTINGS,
    });

    expect(result.monthsWorked).toBe(1);
    expect(result.isNewHire).toBe(true);
    expect(result.metrics.operations.norm).toBe(192);
    expect(result.metrics.phoneNumbers.norm).toBe(58);
    expect(result.metrics.reviews.norm).toBe(3);
    expect(result.overallPercent).toBeCloseTo(104.27, 1);
    expect(result.rating).toBe('A');
  });

  it('example B: established cashier, month 5, full month — rating C', () => {
    const employee = makeEmployee({ hireDate: '2026-01-01' });
    const fact = makeFact({ year: 2026, month: 5, operations: 900, phoneNumbers: 300, reviews: 10 });

    const result = computeMonthlyResult({
      employee, departmentName: 'АПОРТ', fact, previousFact: undefined,
      reportYear: 2026, reportMonth: 5, settings: DEFAULT_SETTINGS,
    });

    expect(result.monthsWorked).toBe(5);
    expect(result.isNewHire).toBe(false);
    expect(result.metrics.operations.norm).toBe(1200);
    expect(result.overallPercent).toBeCloseTo(75.08, 1);
    expect(result.rating).toBe('C');
  });

  it('example C: strong overall but one metric under 50% — capped to C', () => {
    const employee = makeEmployee({ hireDate: '2025-01-01' });
    const fact = makeFact({ operations: 1400, phoneNumbers: 400, reviews: 6 });

    const result = computeMonthlyResult({
      employee, departmentName: 'АПОРТ', fact, previousFact: undefined,
      reportYear: 2026, reportMonth: 6, settings: DEFAULT_SETTINGS,
    });

    expect(result.overallPercent).toBeGreaterThan(80);
    expect(result.rating).toBe('C');
    expect(result.ratingCapped).toBe(true);
  });

  it('missing hire date: treated as active (month 4+, 100% norm) with hireDateMissing flagged', () => {
    const employee = makeEmployee({ hireDate: null });
    const fact = makeFact({ operations: 1200, phoneNumbers: 359, reviews: 15 });

    const result = computeMonthlyResult({
      employee, departmentName: 'АПОРТ', fact, previousFact: undefined,
      reportYear: 2026, reportMonth: 6, settings: DEFAULT_SETTINGS,
    });

    expect(result.hireDateMissing).toBe(true);
    expect(result.monthsWorked).toBeNull();
    expect(result.metrics.operations.norm).toBe(1200); // full norm, not adaptation-reduced
    expect(result.rating).toBe('A');
  });

  it('no data for the month: status is "no data", not an automatic C rating', () => {
    const employee = makeEmployee();

    const result = computeMonthlyResult({
      employee, departmentName: 'АПОРТ', fact: undefined, previousFact: undefined,
      reportYear: 2026, reportMonth: 6, settings: DEFAULT_SETTINGS,
    });

    expect(result.hasData).toBe(false);
    expect(result.rating).toBeNull();
    expect(result.overallPercent).toBeNull();
  });

  it('computes month-over-month dynamics from the previous fact', () => {
    const employee = makeEmployee({ hireDate: '2025-01-01' });
    const fact = makeFact({ year: 2026, month: 6, operations: 1200, phoneNumbers: 359, reviews: 15 });
    const previousFact = makeFact({ year: 2026, month: 5, operations: 900, phoneNumbers: 300, reviews: 10 });

    const result = computeMonthlyResult({
      employee, departmentName: 'АПОРТ', fact, previousFact,
      reportYear: 2026, reportMonth: 6, settings: DEFAULT_SETTINGS,
    });

    expect(result.dynamicsOverall.direction).toBe('up');
    expect(result.dynamicsOverall.delta).toBeGreaterThan(0);
  });

  it('reduces the norm proportionally for absence days (example D)', () => {
    const employee = makeEmployee({ hireDate: '2025-01-01' });
    const fact = makeFact({ operations: 880, phoneNumbers: 264, reviews: 11, absenceDays: 8 });

    const result = computeMonthlyResult({
      employee, departmentName: 'АПОРТ', fact, previousFact: undefined,
      reportYear: 2026, reportMonth: 6, settings: DEFAULT_SETTINGS,
    });

    expect(result.metrics.operations.norm).toBe(880);
    expect(result.metrics.phoneNumbers.norm).toBe(264);
    expect(result.metrics.reviews.norm).toBe(11);
    // Fact exactly matches the reduced norm => ~100% on each metric.
    expect(result.metrics.operations.percent).toBeCloseTo(100, 0);
  });
});
