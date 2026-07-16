import React from 'react';
import {
  Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { useMotivation } from '../MotivationContext';
import { MonthlyResult } from '../types';
import { ProgressCell } from './ProgressCell';
import { RatingChip } from './RatingChip';
import { DynamicsIndicator } from './DynamicsIndicator';

interface CashiersTableProps {
  results: MonthlyResult[];
  onSelectEmployee: (employeeId: string) => void;
}

function monthLabel(monthsWorked: number | null) {
  if (monthsWorked === null) return '—';
  if (monthsWorked <= 3) return `${monthsWorked}-й мес.`;
  return 'действующий';
}

export function CashiersTable({ results, onSelectEmployee }: CashiersTableProps) {
  const { settings } = useMotivation();

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ФИО</TableCell>
            <TableCell>Отделение</TableCell>
            <TableCell>Месяц работы</TableCell>
            <TableCell>Операции</TableCell>
            <TableCell>Номера</TableCell>
            <TableCell>Отзывы</TableCell>
            <TableCell>Общий %</TableCell>
            <TableCell>Рейтинг</TableCell>
            <TableCell>Динамика</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((r) => (
            <TableRow key={r.employeeId} hover>
              <TableCell>
                <Typography
                  component="span"
                  sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => onSelectEmployee(r.employeeId)}
                >
                  {r.employeeFullName}
                </Typography>
                {r.hireDateMissing && (
                  <Alert severity="warning" variant="outlined" sx={{ mt: 0.5, py: 0, px: 1, fontSize: 11 }}>
                    Не указана дата начала работы
                  </Alert>
                )}
              </TableCell>
              <TableCell>{r.departmentName}</TableCell>
              <TableCell>{monthLabel(r.monthsWorked)}</TableCell>

              {!r.hasData ? (
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">Нет данных за отчётный месяц</Typography>
                </TableCell>
              ) : (
                <>
                  <TableCell>
                    <ProgressCell fact={r.metrics.operations.fact} norm={r.metrics.operations.norm} percent={r.metrics.operations.percent} thresholds={settings.ratingThresholds} />
                  </TableCell>
                  <TableCell>
                    <ProgressCell fact={r.metrics.phoneNumbers.fact} norm={r.metrics.phoneNumbers.norm} percent={r.metrics.phoneNumbers.percent} thresholds={settings.ratingThresholds} />
                  </TableCell>
                  <TableCell>
                    <ProgressCell fact={r.metrics.reviews.fact} norm={r.metrics.reviews.norm} percent={r.metrics.reviews.percent} thresholds={settings.ratingThresholds} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>
                    {r.overallPercent !== null ? `${r.overallPercent.toFixed(1)}%` : '—'}
                  </TableCell>
                  <TableCell>
                    <RatingChip rating={r.rating} capped={r.ratingCapped} />
                  </TableCell>
                  <TableCell>
                    <DynamicsIndicator dynamics={r.dynamicsOverall} suffix=" п.п." />
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          {results.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                Нет кассиров, подходящих под фильтр
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
