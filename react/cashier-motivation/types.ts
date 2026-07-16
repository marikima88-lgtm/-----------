export type Rating = 'A' | 'B' | 'C';
export type EmployeeStatus = 'active' | 'terminated';
export type RoundingMode = 'ceil' | 'round' | 'floor';
export type PartialMonthMethod = 'calendarDays' | 'workDays';
export type MetricKey = 'operations' | 'phoneNumbers' | 'reviews';

/** "Новый" = still in the 3-month adaptation window, "действующий" = month 4+. */
export type TenureFilter = 'all' | 'new' | 'active';

export interface MotivationFilters {
  year: number;
  month: number;
  departmentId: string | 'all';
  employeeId: string | 'all';
  tenure: TenureFilter;
  rating: 'all' | Rating;
}

export interface Department {
  id: string;
  name: string;
}

export interface DepartmentHistoryEntry {
  departmentId: string;
  dateFrom: string; // ISO date
  dateTo: string | null; // null = current
}

export interface Employee {
  id: string;
  fullName: string;
  departmentId: string;
  hireDate: string | null; // ISO date; null = "не указана дата начала работы"
  status: EmployeeStatus;
  departmentHistory: DepartmentHistoryEntry[];
}

/** Raw fact record for one employee for one calendar month — the source of truth. */
export interface MonthlyFact {
  id: string;
  employeeId: string;
  departmentId: string; // department at the time this fact was recorded
  year: number;
  month: number; // 1-12
  operations: number;
  phoneNumbers: number;
  reviews: number;
  absenceDays: number; // отпуск/больничный дни в этом месяце
  hasData: boolean; // false => "Нет данных", do not default metrics to 0
}

export interface MetricWeights {
  operations: number;
  phoneNumbers: number;
  reviews: number;
}

export interface BaseNorms {
  operations: number;
  phoneNumbers: number;
  reviews: number;
}

export interface AdaptationPercents {
  month1: number; // fraction 0..1
  month2: number;
  month3: number;
  fromMonth4: number;
}

export interface RatingThresholds {
  aMin: number; // percent, e.g. 100
  bMin: number; // percent, e.g. 80
}

export interface MotivationSettings {
  baseNorms: BaseNorms;
  adaptationPercents: AdaptationPercents;
  weights: MetricWeights;
  ratingThresholds: RatingThresholds;
  minMetricThreshold: number; // percent; below this on ANY metric caps rating at C
  roundingMode: RoundingMode;
  partialMonthMethod: PartialMonthMethod;
}

/** Per-metric computed values for a single monthly result. */
export interface MetricResult {
  fact: number;
  norm: number;
  percent: number | null; // null = "нет данных" (norm was 0 or fact missing)
}

export type MetricResults = Record<MetricKey, MetricResult>;

export interface Dynamics {
  delta: number | null; // null = no data to compare against
  direction: 'up' | 'down' | 'flat' | 'no-data';
}

/** Fully computed row for one employee for one reporting month — derived, never stored directly. */
export interface MonthlyResult {
  employeeId: string;
  employeeFullName: string;
  departmentId: string;
  departmentName: string;
  year: number;
  month: number;
  monthsWorked: number | null; // null when hireDate is missing
  isNewHire: boolean; // monthsWorked !== null && monthsWorked <= 3
  hireDateMissing: boolean;
  hasData: boolean;
  metrics: MetricResults;
  overallPercent: number | null;
  rating: Rating | null; // null when hasData is false
  ratingCapped: boolean; // true if the <50% rule forced the rating down
  dynamicsOverall: Dynamics;
  dynamicsMetrics: Record<MetricKey, Dynamics>;
}
