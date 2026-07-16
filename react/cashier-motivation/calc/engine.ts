import {
  Dynamics, Employee, MetricKey, MetricResult, MetricResults, MonthlyFact, MonthlyResult,
  MotivationSettings, Rating, RoundingMode,
} from '../types';
import { calcMonthsWorked, calcProrationFactor } from './dates';

const METRIC_KEYS: MetricKey[] = ['operations', 'phoneNumbers', 'reviews'];

/** Applies the configured rounding rule. Default per the brief is "round up" (ceil). */
export function applyRounding(value: number, mode: RoundingMode): number {
  switch (mode) {
    case 'ceil': return Math.ceil(value);
    case 'floor': return Math.floor(value);
    case 'round': return Math.round(value);
    default: return Math.ceil(value);
  }
}

/** Adaptation factor (0..1) for a given number of full months worked. */
export function calcAdaptationFactor(monthsWorked: number, settings: MotivationSettings): number {
  const { adaptationPercents } = settings;
  if (monthsWorked <= 1) return adaptationPercents.month1;
  if (monthsWorked === 2) return adaptationPercents.month2;
  if (monthsWorked === 3) return adaptationPercents.month3;
  return adaptationPercents.fromMonth4;
}

/**
 * Individual norm for one metric: base norm × adaptation factor × proration factor,
 * rounded per settings. `monthsWorked = null` (missing hire date) is treated as month 4+ (100%)
 * per the "missing hire date" special case — caller decides monthsWorked upstream.
 */
export function calcIndividualNorm(
  baseNorm: number,
  monthsWorked: number,
  settings: MotivationSettings,
  prorationFactor = 1,
): number {
  const adaptationFactor = calcAdaptationFactor(monthsWorked, settings);
  const raw = baseNorm * adaptationFactor * prorationFactor;
  return applyRounding(raw, settings.roundingMode);
}

/** Percent of norm achieved. Not capped at 100 — overperformance is visible as-is. */
export function calcPercent(fact: number, norm: number): number | null {
  if (norm <= 0) return null;
  return (fact / norm) * 100;
}

/** Weighted average of the three metric percents. Weights are normalized, need not sum to 1. */
export function calcOverallPercent(
  percents: Record<MetricKey, number>,
  weights: Record<MetricKey, number>,
): number {
  const totalWeight = METRIC_KEYS.reduce((sum, k) => sum + weights[k], 0);
  if (totalWeight <= 0) return 0;
  const weighted = METRIC_KEYS.reduce((sum, k) => sum + percents[k] * weights[k], 0);
  return weighted / totalWeight;
}

/**
 * Letter rating from the overall percent, with the override rule: if any single metric is
 * below `minMetricThreshold`, the rating can never be better than C — regardless of the
 * overall average.
 */
export function calcRating(
  overallPercent: number,
  percents: Record<MetricKey, number>,
  settings: MotivationSettings,
): { rating: Rating; capped: boolean } {
  let base: Rating;
  if (overallPercent >= settings.ratingThresholds.aMin) base = 'A';
  else if (overallPercent >= settings.ratingThresholds.bMin) base = 'B';
  else base = 'C';

  const minMetricPercent = Math.min(...METRIC_KEYS.map((k) => percents[k]));
  const shouldCap = minMetricPercent < settings.minMetricThreshold && base !== 'C';

  return { rating: shouldCap ? 'C' : base, capped: shouldCap };
}

/** Change vs. the previous period. `null` inputs mean "no data to compare" rather than 0. */
export function calcDynamics(current: number | null, previous: number | null): Dynamics {
  if (current === null || previous === null) return { delta: null, direction: 'no-data' };
  const delta = current - previous;
  if (delta > 0) return { delta, direction: 'up' };
  if (delta < 0) return { delta, direction: 'down' };
  return { delta: 0, direction: 'flat' };
}

export interface ComputeMonthlyResultInput {
  employee: Employee;
  departmentName: string;
  fact: MonthlyFact | undefined; // undefined => no data for this month
  previousFact: MonthlyFact | undefined;
  reportYear: number;
  reportMonth: number;
  settings: MotivationSettings;
}

/**
 * Orchestrates the full per-employee, per-month computation: norms → percents → overall →
 * rating → dynamics. This is the single function the UI and the Excel export both call, so
 * there is exactly one place that implements the business rules.
 */
export function computeMonthlyResult({
  employee, departmentName, fact, previousFact, reportYear, reportMonth, settings,
}: ComputeMonthlyResultInput): MonthlyResult {
  const hireDateMissing = !employee.hireDate;
  const monthsWorkedRaw = calcMonthsWorked(employee.hireDate, reportYear, reportMonth);
  // Missing hire date => treat as a fully-ramped, active employee (100% norm), per spec.
  const monthsWorked = monthsWorkedRaw ?? 4;

  const base: Omit<MonthlyResult, 'metrics' | 'overallPercent' | 'rating' | 'ratingCapped' | 'dynamicsOverall' | 'dynamicsMetrics'> = {
    employeeId: employee.id,
    employeeFullName: employee.fullName,
    departmentId: fact?.departmentId ?? employee.departmentId,
    departmentName,
    year: reportYear,
    month: reportMonth,
    monthsWorked: monthsWorkedRaw,
    isNewHire: monthsWorkedRaw !== null && monthsWorkedRaw <= 3,
    hireDateMissing,
    hasData: !!fact?.hasData,
  };

  if (!fact || !fact.hasData) {
    const emptyMetric: MetricResult = { fact: 0, norm: 0, percent: null };
    return {
      ...base,
      metrics: { operations: emptyMetric, phoneNumbers: emptyMetric, reviews: emptyMetric },
      overallPercent: null,
      rating: null,
      ratingCapped: false,
      dynamicsOverall: { delta: null, direction: 'no-data' },
      dynamicsMetrics: {
        operations: { delta: null, direction: 'no-data' },
        phoneNumbers: { delta: null, direction: 'no-data' },
        reviews: { delta: null, direction: 'no-data' },
      },
    };
  }

  const prorationFactor = calcProrationFactor({
    year: reportYear,
    month: reportMonth,
    hireDateIso: employee.hireDate,
    absenceDays: fact.absenceDays,
    method: settings.partialMonthMethod,
  });

  const factByMetric: Record<MetricKey, number> = {
    operations: fact.operations,
    phoneNumbers: fact.phoneNumbers,
    reviews: fact.reviews,
  };
  const baseNormByMetric: Record<MetricKey, number> = {
    operations: settings.baseNorms.operations,
    phoneNumbers: settings.baseNorms.phoneNumbers,
    reviews: settings.baseNorms.reviews,
  };

  const metrics = {} as MetricResults;
  const percentsForRating: Record<MetricKey, number> = { operations: 0, phoneNumbers: 0, reviews: 0 };

  METRIC_KEYS.forEach((key) => {
    const norm = calcIndividualNorm(baseNormByMetric[key], monthsWorked, settings, prorationFactor);
    const percent = calcPercent(factByMetric[key], norm);
    metrics[key] = { fact: factByMetric[key], norm, percent };
    percentsForRating[key] = percent ?? 0;
  });

  const overallPercent = calcOverallPercent(percentsForRating, settings.weights);
  const { rating, capped } = calcRating(overallPercent, percentsForRating, settings);

  const prevPercentsForRating: Record<MetricKey, number> | null = previousFact?.hasData
    ? (() => {
      const prevMonthsWorked = calcMonthsWorked(employee.hireDate, previousFact.year, previousFact.month) ?? 4;
      const prevProration = calcProrationFactor({
        year: previousFact.year,
        month: previousFact.month,
        hireDateIso: employee.hireDate,
        absenceDays: previousFact.absenceDays,
        method: settings.partialMonthMethod,
      });
      const result: Record<MetricKey, number> = { operations: 0, phoneNumbers: 0, reviews: 0 };
      METRIC_KEYS.forEach((key) => {
        const norm = calcIndividualNorm(baseNormByMetric[key], prevMonthsWorked, settings, prevProration);
        const prevFactValue = key === 'operations' ? previousFact.operations
          : key === 'phoneNumbers' ? previousFact.phoneNumbers : previousFact.reviews;
        result[key] = calcPercent(prevFactValue, norm) ?? 0;
      });
      return result;
    })()
    : null;

  const prevOverallPercent = prevPercentsForRating ? calcOverallPercent(prevPercentsForRating, settings.weights) : null;

  const dynamicsMetrics = {} as Record<MetricKey, Dynamics>;
  METRIC_KEYS.forEach((key) => {
    dynamicsMetrics[key] = calcDynamics(metrics[key].percent, prevPercentsForRating ? prevPercentsForRating[key] : null);
  });

  return {
    ...base,
    metrics,
    overallPercent,
    rating,
    ratingCapped: capped,
    dynamicsOverall: calcDynamics(overallPercent, prevOverallPercent),
    dynamicsMetrics,
  };
}
