import React, { useMemo, useState } from 'react';
import {
  Alert, Box, Chip, Divider, Drawer, Grid, IconButton, Paper, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useMotivation } from '../MotivationContext';
import { MetricKey } from '../types';
import { RatingChip } from './RatingChip';
import { ProgressCell } from './ProgressCell';
import { DynamicsIndicator } from './DynamicsIndicator';
import { MetricTrendChart } from './charts/MetricTrendChart';
import { OverallPercentChart } from './charts/OverallPercentChart';
import { RatingTimelineChart } from './charts/RatingTimelineChart';

const METRIC_LABELS: Record<MetricKey, string> = {
  operations: 'Операции',
  phoneNumbers: 'Номера клиентов',
  reviews: 'Отзывы',
};

interface CashierCardProps {
  employeeId: string | null;
  year: number;
  month: number;
  onClose: () => void;
}

export function CashierCard({ employeeId, year, month, onClose }: CashierCardProps) {
  const { employees, getMonthlyResult, getEmployeeHistory, settings } = useMotivation();
  const [periodMonths, setPeriodMonths] = useState<6 | 12>(6);

  const employee = employeeId ? employees.find((e) => e.id === employeeId) : undefined;
  const current = employeeId ? getMonthlyResult(employeeId, year, month) : null;
  const history = employeeId ? getEmployeeHistory(employeeId, year, month, periodMonths) : [];

  const chartLabel = (y: number, m: number) => `${String(m).padStart(2, '0')}.${String(y).slice(2)}`;

  const trendData = useMemo(() => {
    const build = (key: MetricKey) => history.map((r) => ({
      label: chartLabel(r.year, r.month),
      fact: r.hasData ? r.metrics[key].fact : null,
      norm: r.hasData ? r.metrics[key].norm : null,
    }));
    return {
      operations: build('operations'),
      phoneNumbers: build('phoneNumbers'),
      reviews: build('reviews'),
    };
  }, [history]);

  const overallData = useMemo(
    () => history.map((r) => ({ label: chartLabel(r.year, r.month), overallPercent: r.hasData ? r.overallPercent : null })),
    [history],
  );

  const ratingData = useMemo(
    () => history.map((r) => ({ label: chartLabel(r.year, r.month), rating: r.hasData ? r.rating : null })),
    [history],
  );

  return (
    <Drawer anchor="right" open={!!employeeId} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 640 }, p: 3 } }}>
      {employee && current && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={800}>{employee.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {current.departmentName} · начало работы: {employee.hireDate ?? '—'}
              </Typography>
            </Box>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Box>

          {current.hireDateMissing && (
            <Alert severity="warning" sx={{ mb: 2 }}>Не указана дата начала работы — применён норматив 100%.</Alert>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Chip
              label={current.monthsWorked === null ? 'Действующий' : current.monthsWorked <= 3 ? `Адаптация: ${current.monthsWorked}-й месяц` : 'Действующий кассир'}
              variant="outlined"
            />
            <RatingChip rating={current.rating} capped={current.ratingCapped} size="medium" />
            <DynamicsIndicator dynamics={current.dynamicsOverall} suffix=" п.п." />
          </Box>

          {!current.hasData ? (
            <Alert severity="info" sx={{ mb: 2 }}>Нет данных за отчётный месяц.</Alert>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
              <Grid container spacing={2}>
                {(Object.keys(METRIC_LABELS) as MetricKey[]).map((key) => (
                  <Grid item xs={12} sm={4} key={key}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {METRIC_LABELS[key]}
                    </Typography>
                    <ProgressCell
                      fact={current.metrics[key].fact}
                      norm={current.metrics[key].norm}
                      percent={current.metrics[key].percent}
                      thresholds={settings.ratingThresholds}
                    />
                    <Box sx={{ mt: 0.5 }}>
                      <DynamicsIndicator dynamics={current.dynamicsMetrics[key]} suffix=" п.п." />
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">Общий % выполнения</Typography>
              <Typography variant="h4" fontWeight={800}>
                {current.overallPercent !== null ? `${current.overallPercent.toFixed(1)}%` : '—'}
              </Typography>
            </Paper>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>Динамика</Typography>
            <ToggleButtonGroup
              size="small"
              value={periodMonths}
              exclusive
              onChange={(_e, val) => val && setPeriodMonths(val)}
            >
              <ToggleButton value={6}>6 мес.</ToggleButton>
              <ToggleButton value={12}>12 мес.</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MetricTrendChart title="Операции: факт / норматив" data={trendData.operations} />
            <MetricTrendChart title="Номера клиентов: факт / норматив" data={trendData.phoneNumbers} />
            <MetricTrendChart title="Отзывы: факт / норматив" data={trendData.reviews} />
            <OverallPercentChart data={overallData} aMin={settings.ratingThresholds.aMin} bMin={settings.ratingThresholds.bMin} />
            <RatingTimelineChart data={ratingData} />
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
