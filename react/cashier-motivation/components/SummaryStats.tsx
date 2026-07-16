import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { MonthlyResult } from '../types';

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, minWidth: 150, flex: '1 1 150px' }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5 }}>{value}</Typography>
      {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
    </Paper>
  );
}

interface SummaryStatsProps {
  results: MonthlyResult[];
}

/** Aggregates covering section 9 of the brief: department-level headline numbers. */
export function SummaryStats({ results }: SummaryStatsProps) {
  const stats = useMemo(() => {
    const withData = results.filter((r) => r.hasData);
    const countA = withData.filter((r) => r.rating === 'A').length;
    const countB = withData.filter((r) => r.rating === 'B').length;
    const countC = withData.filter((r) => r.rating === 'C').length;
    const avgPercent = withData.length
      ? withData.reduce((sum, r) => sum + (r.overallPercent ?? 0), 0) / withData.length
      : null;
    const best = withData.reduce<MonthlyResult | null>((top, r) => {
      if (!top || (r.overallPercent ?? -Infinity) > (top.overallPercent ?? -Infinity)) return r;
      return top;
    }, null);
    const declined = withData.filter((r) => r.dynamicsOverall.direction === 'down');
    const belowNorm = withData.filter((r) => (r.overallPercent ?? 0) < 100);

    return { total: results.length, withData: withData.length, countA, countB, countC, avgPercent, best, declined, belowNorm };
  }, [results]);

  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
      <StatTile label="Кассиров" value={stats.total} hint={stats.withData < stats.total ? `${stats.total - stats.withData} без данных` : undefined} />
      <StatTile label="Рейтинг A" value={stats.countA} />
      <StatTile label="Рейтинг B" value={stats.countB} />
      <StatTile label="Рейтинг C" value={stats.countC} />
      <StatTile label="Средний % выполнения" value={stats.avgPercent !== null ? `${stats.avgPercent.toFixed(1)}%` : '—'} />
      <StatTile label="Лучший кассир месяца" value={stats.best ? stats.best.employeeFullName : '—'} hint={stats.best?.overallPercent != null ? `${stats.best.overallPercent.toFixed(1)}%` : undefined} />
      <StatTile label="Результат снизился" value={stats.declined.length} hint="кассиров к прошлому месяцу" />
      <StatTile label="Не выполнили норматив" value={stats.belowNorm.length} hint="общий % ниже 100" />
    </Box>
  );
}
