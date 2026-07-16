import React, { useMemo, useState } from 'react';
import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import { MotivationProvider, useMotivation } from './MotivationContext';
import { REPORT_YEAR, REPORT_MONTH } from './mockData';
import { MotivationFilters } from './types';
import { FiltersBar } from './components/FiltersBar';
import { SummaryStats } from './components/SummaryStats';
import { CashiersTable } from './components/CashiersTable';
import { CashierCard } from './components/CashierCard';
import { AdminSettingsPanel } from './components/AdminSettingsPanel';
import { ExcelExportButton } from './components/ExcelExportButton';

const AVAILABLE_YEARS = [REPORT_YEAR - 1, REPORT_YEAR, REPORT_YEAR + 1];

function CashiersTab() {
  const { getResultsForMonth } = useMotivation();
  const [filters, setFilters] = useState<MotivationFilters>({
    year: REPORT_YEAR, month: REPORT_MONTH, departmentId: 'all', employeeId: 'all', tenure: 'all', rating: 'all',
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const allCurrentMonthResults = useMemo(
    () => getResultsForMonth(filters.year, filters.month),
    [getResultsForMonth, filters.year, filters.month],
  );

  const departmentScopedResults = useMemo(
    () => allCurrentMonthResults.filter((r) => filters.departmentId === 'all' || r.departmentId === filters.departmentId),
    [allCurrentMonthResults, filters.departmentId],
  );

  const summaryResults = useMemo(
    () => departmentScopedResults.filter((r) => {
      if (filters.employeeId !== 'all' && r.employeeId !== filters.employeeId) return false;
      if (filters.tenure === 'new' && !r.isNewHire) return false;
      if (filters.tenure === 'active' && r.isNewHire) return false;
      if (filters.rating !== 'all' && r.rating !== filters.rating) return false;
      return true;
    }),
    [departmentScopedResults, filters.employeeId, filters.tenure, filters.rating],
  );

  return (
    <Box>
      <SummaryStats results={departmentScopedResults} />
      <FiltersBar filters={filters} onChange={setFilters} availableYears={AVAILABLE_YEARS} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <ExcelExportButton filters={filters} summaryResults={summaryResults} departmentScopedResults={departmentScopedResults} />
      </Box>

      <CashiersTable results={summaryResults} onSelectEmployee={setSelectedEmployeeId} />

      <CashierCard
        employeeId={selectedEmployeeId}
        year={filters.year}
        month={filters.month}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </Box>
  );
}

function MotivationPageContent() {
  const [tab, setTab] = useState<'cashiers' | 'settings'>('cashiers');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Мотивация кассиров</Typography>

      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab value="cashiers" label="Кассиры" />
        <Tab value="settings" label="Настройки нормативов" />
      </Tabs>

      {tab === 'cashiers' ? <CashiersTab /> : <AdminSettingsPanel />}
    </Container>
  );
}

/**
 * Requires: react-hook-form@^7.71.1, @mui/material@^5.10.13, @mui/icons-material@^5,
 * @emotion/react, @emotion/styled, recharts, exceljs.
 */
export function MotivationApp() {
  return (
    <MotivationProvider>
      <MotivationPageContent />
    </MotivationProvider>
  );
}
