import { MotivationSettings } from '../types';

/** Values match the defaults specified in the brief (section 13). */
export const DEFAULT_SETTINGS: MotivationSettings = {
  baseNorms: {
    operations: 1200,
    phoneNumbers: 359,
    reviews: 15,
  },
  adaptationPercents: {
    month1: 0.3,
    month2: 0.5,
    month3: 0.7,
    fromMonth4: 1,
  },
  weights: {
    // Equal weight, 33.33% each — normalized at calculation time so they
    // don't have to sum to exactly 1.
    operations: 1 / 3,
    phoneNumbers: 1 / 3,
    reviews: 1 / 3,
  },
  ratingThresholds: {
    aMin: 100,
    bMin: 80,
  },
  minMetricThreshold: 50,
  roundingMode: 'ceil',
  partialMonthMethod: 'calendarDays',
};
