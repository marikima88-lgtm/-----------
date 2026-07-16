import React, { useState } from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useMotivation } from '../MotivationContext';
import { exportMotivationWorkbook } from '../excelExport';
import { MonthlyResult, MotivationFilters } from '../types';

interface ExcelExportButtonProps {
  filters: MotivationFilters;
  /** Fully filtered results — exactly what is on screen — backs "Сводка по кассирам". */
  summaryResults: MonthlyResult[];
  /** Filtered only by department (not by rating/tenure/employee) — backs the rating-split and "Динамика" sheets, which should stay department-wide even when the table view is narrowed to one cashier or one rating. */
  departmentScopedResults: MonthlyResult[];
}

export function ExcelExportButton({ filters, summaryResults, departmentScopedResults }: ExcelExportButtonProps) {
  const { employees, settings, getEmployeeHistory } = useMotivation();
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const scopedEmployeeIds = new Set(departmentScopedResults.map((r) => r.employeeId));
      const historyResults = employees
        .filter((e) => scopedEmployeeIds.has(e.id))
        .flatMap((e) => getEmployeeHistory(e.id, filters.year, filters.month, 6));

      await exportMotivationWorkbook(
        {
          summaryResults,
          historyResults,
          allCurrentMonthResults: departmentScopedResults,
          employees,
          settings,
        },
        `Мотивация кассиров — ${String(filters.month).padStart(2, '0')}.${filters.year}.xlsx`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} disabled={loading}>
      {loading ? 'Формирование файла…' : 'Экспорт в Excel'}
    </Button>
  );
}
