import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Paper, Typography } from '@mui/material';

export interface TrendPoint {
  label: string;
  fact: number | null;
  norm: number | null;
}

interface MetricTrendChartProps {
  title: string;
  data: TrendPoint[];
  factLabel?: string;
  normLabel?: string;
}

// Colors from the project's validated dataviz palette (references/palette.md):
// fact = categorical slot 1 (blue); norm is a reference/target line, not a
// competing series identity, so it stays in the muted-ink/dashed treatment.
const FACT_COLOR = '#2a78d6';
const NORM_COLOR = '#898781';
const GRID_COLOR = '#e1e0d9';
const AXIS_COLOR = '#c3c2b7';

/**
 * Fact vs. individual norm for one metric, across months. The norm line is
 * intentionally not flat — a new hire's norm ramps up 30% -> 50% -> 70% -> 100%
 * month to month, which is the whole reason fact and norm are plotted together.
 */
export function MetricTrendChart({ title, data, factLabel = 'Факт', normLabel = 'Норматив' }: MetricTrendChartProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{title}</Typography>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="label" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
          <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11 }} width={40} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="norm" name={normLabel} stroke={NORM_COLOR} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 4 }} connectNulls />
          <Line type="monotone" dataKey="fact" name={factLabel} stroke={FACT_COLOR} strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
