import ExcelJS from 'exceljs';
import { Employee, MonthlyResult, MotivationSettings } from './types';

interface ExportRow {
  fullName: string;
  department: string;
  reportMonth: string;
  monthsWorked: string;
  opsFact: number;
  opsNorm: number;
  opsPercent: number | string;
  phoneFact: number;
  phoneNorm: number;
  phonePercent: number | string;
  reviewsFact: number;
  reviewsNorm: number;
  reviewsPercent: number | string;
  overallPercent: number | string;
  rating: string;
  dynamics: number | string;
}

const COLUMNS: { header: string; key: keyof ExportRow; width: number }[] = [
  { header: 'ФИО', key: 'fullName', width: 26 },
  { header: 'Отделение', key: 'department', width: 18 },
  { header: 'Отчётный месяц', key: 'reportMonth', width: 14 },
  { header: 'Месяц работы', key: 'monthsWorked', width: 16 },
  { header: 'Операции, факт', key: 'opsFact', width: 14 },
  { header: 'Операции, норматив', key: 'opsNorm', width: 16 },
  { header: 'Операции, %', key: 'opsPercent', width: 12 },
  { header: 'Номера, факт', key: 'phoneFact', width: 12 },
  { header: 'Номера, норматив', key: 'phoneNorm', width: 14 },
  { header: 'Номера, %', key: 'phonePercent', width: 10 },
  { header: 'Отзывы, факт', key: 'reviewsFact', width: 12 },
  { header: 'Отзывы, норматив', key: 'reviewsNorm', width: 14 },
  { header: 'Отзывы, %', key: 'reviewsPercent', width: 10 },
  { header: 'Общий %', key: 'overallPercent', width: 10 },
  { header: 'Рейтинг', key: 'rating', width: 9 },
  { header: 'Динамика к пред. месяцу', key: 'dynamics', width: 18 },
];

function monthLabel(monthsWorked: number | null): string {
  if (monthsWorked === null) return 'нет даты найма';
  if (monthsWorked <= 3) return `${monthsWorked}-й месяц (адаптация)`;
  return 'действующий';
}

function resultToRow(r: MonthlyResult): ExportRow {
  if (!r.hasData) {
    return {
      fullName: r.employeeFullName,
      department: r.departmentName,
      reportMonth: `${String(r.month).padStart(2, '0')}.${r.year}`,
      monthsWorked: monthLabel(r.monthsWorked),
      opsFact: 0, opsNorm: 0, opsPercent: 'нет данных',
      phoneFact: 0, phoneNorm: 0, phonePercent: 'нет данных',
      reviewsFact: 0, reviewsNorm: 0, reviewsPercent: 'нет данных',
      overallPercent: 'нет данных', rating: 'нет данных', dynamics: 'нет данных',
    };
  }
  return {
    fullName: r.employeeFullName,
    department: r.departmentName,
    reportMonth: `${String(r.month).padStart(2, '0')}.${r.year}`,
    monthsWorked: monthLabel(r.monthsWorked),
    opsFact: r.metrics.operations.fact,
    opsNorm: r.metrics.operations.norm,
    opsPercent: r.metrics.operations.percent !== null ? Number(r.metrics.operations.percent.toFixed(1)) : 'нет данных',
    phoneFact: r.metrics.phoneNumbers.fact,
    phoneNorm: r.metrics.phoneNumbers.norm,
    phonePercent: r.metrics.phoneNumbers.percent !== null ? Number(r.metrics.phoneNumbers.percent.toFixed(1)) : 'нет данных',
    reviewsFact: r.metrics.reviews.fact,
    reviewsNorm: r.metrics.reviews.norm,
    reviewsPercent: r.metrics.reviews.percent !== null ? Number(r.metrics.reviews.percent.toFixed(1)) : 'нет данных',
    overallPercent: r.overallPercent !== null ? Number(r.overallPercent.toFixed(1)) : 'нет данных',
    rating: r.rating ?? 'нет данных',
    dynamics: r.dynamicsOverall.delta !== null ? Number(r.dynamicsOverall.delta.toFixed(1)) : 'нет данных',
  };
}

function addResultsSheet(workbook: ExcelJS.Workbook, name: string, results: MonthlyResult[]) {
  const sheet = workbook.addWorksheet(name);
  sheet.columns = COLUMNS;
  sheet.getRow(1).font = { bold: true };
  results.forEach((r) => sheet.addRow(resultToRow(r)));
  sheet.autoFilter = { from: 'A1', to: `${sheet.getColumn(COLUMNS.length).letter}1` };
  return sheet;
}

export interface BuildWorkbookInput {
  /** Results for the currently selected reporting month, already filtered by department/employee/tenure/rating — backs "Сводка по кассирам". */
  summaryResults: MonthlyResult[];
  /** Results for the same employee scope across several months — backs "Динамика по месяцам". */
  historyResults: MonthlyResult[];
  /** Unfiltered results for the reporting month — ratings A/B/C and "не выполнившие" sheets are always company-wide by design. */
  allCurrentMonthResults: MonthlyResult[];
  employees: Employee[];
  settings: MotivationSettings;
}

export async function buildMotivationWorkbook({
  summaryResults, historyResults, allCurrentMonthResults, settings,
}: BuildWorkbookInput): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ecash — Мотивация кассиров';
  workbook.created = new Date();

  addResultsSheet(workbook, 'Сводка по кассирам', summaryResults);
  addResultsSheet(workbook, 'Динамика по месяцам', historyResults);
  addResultsSheet(workbook, 'Рейтинг A', allCurrentMonthResults.filter((r) => r.rating === 'A'));
  addResultsSheet(workbook, 'Рейтинг B', allCurrentMonthResults.filter((r) => r.rating === 'B'));
  addResultsSheet(workbook, 'Рейтинг C', allCurrentMonthResults.filter((r) => r.rating === 'C'));
  addResultsSheet(
    workbook,
    'Невыполненные нормативы',
    allCurrentMonthResults.filter((r) => r.hasData && (r.overallPercent ?? 0) < 100),
  );

  const settingsSheet = workbook.addWorksheet('Настройки нормативов');
  settingsSheet.columns = [
    { header: 'Параметр', key: 'param', width: 40 },
    { header: 'Значение', key: 'value', width: 20 },
  ];
  settingsSheet.getRow(1).font = { bold: true };
  settingsSheet.addRows([
    { param: 'Норматив: операции (действующий кассир)', value: settings.baseNorms.operations },
    { param: 'Норматив: номера клиентов (действующий кассир)', value: settings.baseNorms.phoneNumbers },
    { param: 'Норматив: отзывы (действующий кассир)', value: settings.baseNorms.reviews },
    { param: 'Адаптация, 1-й месяц', value: `${settings.adaptationPercents.month1 * 100}%` },
    { param: 'Адаптация, 2-й месяц', value: `${settings.adaptationPercents.month2 * 100}%` },
    { param: 'Адаптация, 3-й месяц', value: `${settings.adaptationPercents.month3 * 100}%` },
    { param: 'Адаптация, с 4-го месяца', value: `${settings.adaptationPercents.fromMonth4 * 100}%` },
    { param: 'Вес: операции', value: `${(settings.weights.operations * 100).toFixed(2)}%` },
    { param: 'Вес: номера клиентов', value: `${(settings.weights.phoneNumbers * 100).toFixed(2)}%` },
    { param: 'Вес: отзывы', value: `${(settings.weights.reviews * 100).toFixed(2)}%` },
    { param: 'Рейтинг A от', value: `${settings.ratingThresholds.aMin}%` },
    { param: 'Рейтинг B от', value: `${settings.ratingThresholds.bMin}%` },
    { param: 'Мин. выполнение показателя (порог капа рейтинга)', value: `${settings.minMetricThreshold}%` },
    { param: 'Округление норматива', value: settings.roundingMode },
    { param: 'Расчёт неполного месяца', value: settings.partialMonthMethod },
  ]);

  return workbook;
}

/** Builds the workbook and triggers a browser download — call from a click handler. */
export async function exportMotivationWorkbook(input: BuildWorkbookInput, fileName = 'Мотивация кассиров.xlsx') {
  const workbook = await buildMotivationWorkbook(input);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
