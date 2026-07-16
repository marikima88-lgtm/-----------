import React from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Paper, Typography } from '@mui/material';

export interface OverallPercentPoint {
  label: string;
  overallPercent: number | null;
}

interface OverallPercentChartProps {
  data: OverallPercentPoint[];
  aMin: number;
  bMin: number;
}

const LINE_COLOR = '#2a78d6';
const GRID_COLOR = '#e1e0d9';
const AXIS_COLOR = '#c3c2b7';
const GOOD = '#0ca30c';
const WARNING_COLOR = '#c98500'; // darker step than the raw status yellow, for legible axis text

/** Single series, so no legend — the A/B rating thresholds are shown as direct-labeled reference lines instead. */
export function OverallPercentChart({ data, aMin, bMin }: OverallPercentChartProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Общий % выполнения</Typography>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 28, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="label" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
          <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11 }} width={40} />
          <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'Общий %']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <ReferenceLine y={aMin} stroke={GOOD} strokeDasharray="4 4" label={{ value: `A ${aMin}%`, position: 'right', fontSize: 11, fill: GOOD }} />
          <ReferenceLine y={bMin} stroke={WARNING_COLOR} strokeDasharray="4 4" label={{ value: `B ${bMin}%`, position: 'right', fontSize: 11, fill: WARNING_COLOR }} />
          <Line type="monotone" dataKey="overallPercent" stroke={LINE_COLOR} strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
