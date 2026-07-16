import { Department, Employee, MonthlyFact } from './types';

/** "Current" reporting month for the demo dataset. */
export const REPORT_YEAR = 2026;
export const REPORT_MONTH = 7; // July

export const DEPARTMENTS: Department[] = [
  { id: 'dep-apo', name: 'АПОРТ' },
  { id: 'dep-mega', name: 'Мега Алматы' },
  { id: 'dep-dostyk', name: 'Достык Плаза' },
];

/**
 * Ten employees, each chosen to exercise one storyline from the brief:
 * new hire ramping up (months 1-3), strong/average/weak established cashiers,
 * the <50% rating cap, a missing hire date, a month with no submitted data,
 * a department transfer, and a month with sick/vacation days.
 */
export const EMPLOYEES: Employee[] = [
  {
    id: 'emp-smirnova', fullName: 'Смирнова Е.В.', departmentId: 'dep-apo',
    hireDate: '2026-07-15', status: 'active', departmentHistory: [],
  },
  {
    id: 'emp-kasymov', fullName: 'Касымов А.Б.', departmentId: 'dep-mega',
    hireDate: '2026-06-01', status: 'active', departmentHistory: [],
  },
  {
    id: 'emp-nurlanov', fullName: 'Нурланов Е.С.', departmentId: 'dep-dostyk',
    hireDate: '2026-05-01', status: 'active', departmentHistory: [],
  },
  {
    id: 'emp-petrov', fullName: 'Петров С.И.', departmentId: 'dep-apo',
    hireDate: '2025-01-10', status: 'active', departmentHistory: [],
  },
  {
    id: 'emp-akhmetova', fullName: 'Ахметова Д.К.', departmentId: 'dep-apo',
    hireDate: '2024-03-01', status: 'active', departmentHistory: [],
  },
  {
    id: 'emp-baizhanov', fullName: 'Байжанов Т.М.', departmentId: 'dep-mega',
    hireDate: '2023-11-15', status: 'active', departmentHistory: [],
  },
  {
    id: 'emp-ospanova', fullName: 'Оспанова Г.Р.', departmentId: 'dep-dostyk',
    hireDate: '2022-05-01', status: 'active', departmentHistory: [],
  },
  {
    id: 'emp-zhumabaeva', fullName: 'Жумабаева С.А.', departmentId: 'dep-apo',
    hireDate: null, status: 'active', departmentHistory: [], // triggers "hire date missing" warning
  },
  {
    id: 'emp-tulegenova', fullName: 'Тулегенова А.С.', departmentId: 'dep-mega',
    hireDate: '2024-08-01', status: 'active', departmentHistory: [], // no fact for the report month
  },
  {
    id: 'emp-dyusembaeva', fullName: 'Дюсембаева К.Н.', departmentId: 'dep-apo',
    hireDate: '2023-02-01', status: 'active',
    departmentHistory: [
      { departmentId: 'dep-mega', dateFrom: '2023-02-01', dateTo: '2026-03-31' },
      { departmentId: 'dep-apo', dateFrom: '2026-04-01', dateTo: null },
    ],
  },
];

let factSeq = 0;
function fact(input: Omit<MonthlyFact, 'id' | 'hasData' | 'absenceDays'> & Partial<Pick<MonthlyFact, 'hasData' | 'absenceDays'>>): MonthlyFact {
  factSeq += 1;
  return { hasData: true, absenceDays: 0, ...input, id: `fact-${factSeq}` };
}

export const MONTHLY_FACTS: MonthlyFact[] = [
  // --- Смирнова Е.В. — new hire, month 1 (hired mid-July) — mirrors DESIGN.md Example A
  fact({ employeeId: 'emp-smirnova', departmentId: 'dep-apo', year: 2026, month: 7, operations: 210, phoneNumbers: 60, reviews: 3 }),

  // --- Касымов А.Б. — new hire, month 1 strong, month 2 average
  fact({ employeeId: 'emp-kasymov', departmentId: 'dep-mega', year: 2026, month: 6, operations: 380, phoneNumbers: 110, reviews: 5 }),
  fact({ employeeId: 'emp-kasymov', departmentId: 'dep-mega', year: 2026, month: 7, operations: 480, phoneNumbers: 160, reviews: 6 }),

  // --- Нурланов Е.С. — adaptation months 1-3, improving each month
  fact({ employeeId: 'emp-nurlanov', departmentId: 'dep-dostyk', year: 2026, month: 5, operations: 330, phoneNumbers: 95, reviews: 4 }),
  fact({ employeeId: 'emp-nurlanov', departmentId: 'dep-dostyk', year: 2026, month: 6, operations: 500, phoneNumbers: 150, reviews: 6 }),
  fact({ employeeId: 'emp-nurlanov', departmentId: 'dep-dostyk', year: 2026, month: 7, operations: 820, phoneNumbers: 230, reviews: 9 }),

  // --- Петров С.И. — established top performer, steadily improving (best cashier of the month)
  fact({ employeeId: 'emp-petrov', departmentId: 'dep-apo', year: 2026, month: 2, operations: 1250, phoneNumbers: 370, reviews: 16 }),
  fact({ employeeId: 'emp-petrov', departmentId: 'dep-apo', year: 2026, month: 3, operations: 1280, phoneNumbers: 375, reviews: 16 }),
  fact({ employeeId: 'emp-petrov', departmentId: 'dep-apo', year: 2026, month: 4, operations: 1300, phoneNumbers: 380, reviews: 17 }),
  fact({ employeeId: 'emp-petrov', departmentId: 'dep-apo', year: 2026, month: 5, operations: 1320, phoneNumbers: 385, reviews: 17 }),
  fact({ employeeId: 'emp-petrov', departmentId: 'dep-apo', year: 2026, month: 6, operations: 1350, phoneNumbers: 390, reviews: 18 }),
  fact({ employeeId: 'emp-petrov', departmentId: 'dep-apo', year: 2026, month: 7, operations: 1400, phoneNumbers: 400, reviews: 19 }),

  // --- Ахметова Д.К. — established, result declining month over month
  fact({ employeeId: 'emp-akhmetova', departmentId: 'dep-apo', year: 2026, month: 6, operations: 1100, phoneNumbers: 330, reviews: 13 }),
  fact({ employeeId: 'emp-akhmetova', departmentId: 'dep-apo', year: 2026, month: 7, operations: 1000, phoneNumbers: 300, reviews: 11 }),

  // --- Байжанов Т.М. — reviews collapse in July, triggers the <50% rating cap — mirrors Example C
  fact({ employeeId: 'emp-baizhanov', departmentId: 'dep-mega', year: 2026, month: 6, operations: 1300, phoneNumbers: 380, reviews: 10 }),
  fact({ employeeId: 'emp-baizhanov', departmentId: 'dep-mega', year: 2026, month: 7, operations: 1400, phoneNumbers: 400, reviews: 6 }),

  // --- Оспанова Г.Р. — established, underperforming across all three metrics
  fact({ employeeId: 'emp-ospanova', departmentId: 'dep-dostyk', year: 2026, month: 6, operations: 720, phoneNumbers: 230, reviews: 9 }),
  fact({ employeeId: 'emp-ospanova', departmentId: 'dep-dostyk', year: 2026, month: 7, operations: 700, phoneNumbers: 220, reviews: 8 }),

  // --- Жумабаева С.А. — missing hire date, treated as fully ramped (100% norm)
  fact({ employeeId: 'emp-zhumabaeva', departmentId: 'dep-apo', year: 2026, month: 7, operations: 1250, phoneNumbers: 365, reviews: 16 }),

  // --- Тулегенова А.С. — had data in June, nothing submitted for July ("Нет данных")
  fact({ employeeId: 'emp-tulegenova', departmentId: 'dep-mega', year: 2026, month: 6, operations: 1150, phoneNumbers: 340, reviews: 14 }),

  // --- Дюсембаева К.Н. — department transfer + a sick-leave month + an explicit "no data" month
  fact({ employeeId: 'emp-dyusembaeva', departmentId: 'dep-mega', year: 2026, month: 3, operations: 1150, phoneNumbers: 345, reviews: 14 }),
  fact({ employeeId: 'emp-dyusembaeva', departmentId: 'dep-apo', year: 2026, month: 4, operations: 1180, phoneNumbers: 350, reviews: 14 }),
  fact({
    employeeId: 'emp-dyusembaeva', departmentId: 'dep-apo', year: 2026, month: 5,
    operations: 950, phoneNumbers: 270, reviews: 10, absenceDays: 5,
  }),
  fact({
    employeeId: 'emp-dyusembaeva', departmentId: 'dep-apo', year: 2026, month: 6,
    operations: 0, phoneNumbers: 0, reviews: 0, hasData: false, // extended leave, explicitly marked "no data"
  }),
  fact({ employeeId: 'emp-dyusembaeva', departmentId: 'dep-apo', year: 2026, month: 7, operations: 1200, phoneNumbers: 360, reviews: 15 }),
];
