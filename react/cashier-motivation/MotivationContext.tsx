import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { computeMonthlyResult } from './calc/engine';
import { DEPARTMENTS, EMPLOYEES, MONTHLY_FACTS } from './mockData';
import { DEFAULT_SETTINGS } from './settings/defaultSettings';
import { Department, Employee, MonthlyFact, MonthlyResult, MotivationSettings } from './types';

interface MotivationContextValue {
  departments: Department[];
  employees: Employee[];
  settings: MotivationSettings;
  updateSettings: (patch: Partial<MotivationSettings>) => void;
  getDepartmentName: (departmentId: string) => string;
  /** Computed result for one employee in one reporting month (facts + prior month, run through the engine). */
  getMonthlyResult: (employeeId: string, year: number, month: number) => MonthlyResult;
  /** Computed results for every employee for one reporting month — backs the main table. */
  getResultsForMonth: (year: number, month: number) => MonthlyResult[];
  /** Oldest-to-newest computed history for one employee, for the trend charts on the employee card. */
  getEmployeeHistory: (employeeId: string, year: number, month: number, monthsBack: number) => MonthlyResult[];
}

const MotivationContext = createContext<MotivationContextValue | null>(null);

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const total = (month - 1) + delta;
  const y = year + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12 + 1;
  return { year: y, month: m };
}

function findFact(facts: MonthlyFact[], employeeId: string, year: number, month: number): MonthlyFact | undefined {
  return facts.find((f) => f.employeeId === employeeId && f.year === year && f.month === month);
}

export function MotivationProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<MotivationSettings>(DEFAULT_SETTINGS);

  const departments = DEPARTMENTS;
  const employees = EMPLOYEES;
  const facts = MONTHLY_FACTS;

  const updateSettings = useCallback((patch: Partial<MotivationSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const getDepartmentName = useCallback(
    (departmentId: string) => departments.find((d) => d.id === departmentId)?.name ?? '—',
    [departments],
  );

  const getMonthlyResult = useCallback(
    (employeeId: string, year: number, month: number): MonthlyResult => {
      const employee = employees.find((e) => e.id === employeeId);
      if (!employee) throw new Error(`Unknown employee: ${employeeId}`);

      const currentFact = findFact(facts, employeeId, year, month);
      const prevMonth = shiftMonth(year, month, -1);
      const previousFact = findFact(facts, employeeId, prevMonth.year, prevMonth.month);
      const departmentId = currentFact?.departmentId ?? employee.departmentId;

      return computeMonthlyResult({
        employee,
        departmentName: getDepartmentName(departmentId),
        fact: currentFact,
        previousFact,
        reportYear: year,
        reportMonth: month,
        settings,
      });
    },
    [employees, facts, settings, getDepartmentName],
  );

  const getResultsForMonth = useCallback(
    (year: number, month: number) => employees.map((e) => getMonthlyResult(e.id, year, month)),
    [employees, getMonthlyResult],
  );

  const getEmployeeHistory = useCallback(
    (employeeId: string, year: number, month: number, monthsBack: number) => {
      const points: MonthlyResult[] = [];
      for (let i = monthsBack - 1; i >= 0; i--) {
        const { year: y, month: m } = shiftMonth(year, month, -i);
        points.push(getMonthlyResult(employeeId, y, m));
      }
      return points;
    },
    [getMonthlyResult],
  );

  const value = useMemo<MotivationContextValue>(
    () => ({
      departments, employees, settings, updateSettings, getDepartmentName,
      getMonthlyResult, getResultsForMonth, getEmployeeHistory,
    }),
    [departments, employees, settings, updateSettings, getDepartmentName, getMonthlyResult, getResultsForMonth, getEmployeeHistory],
  );

  return <MotivationContext.Provider value={value}>{children}</MotivationContext.Provider>;
}

export function useMotivation(): MotivationContextValue {
  const ctx = useContext(MotivationContext);
  if (!ctx) throw new Error('useMotivation must be used within MotivationProvider');
  return ctx;
}
