import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Paper, Typography } from '@mui/material';
import { Rating } from '../../types';

export interface RatingPoint {
  label: string;
  rating: Rating | null;
}

const RATING_VALUE: Record<Rating, number> = { C: 1, B: 2, A: 3 };
// Status palette (references/palette.md): good/warning/critical — reserved
// roles, distinct from the categorical series colors used elsewhere.
const RATING_COLOR: Record<Rating, string> = { A: '#0ca30c', B: '#c98500', C: '#d03b3b' };
const GRID_COLOR = '#e1e0d9';
const AXIS_COLOR = '#c3c2b7';

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: { value: number | null; rating: Rating | null };
  index?: number;
}

function RatingDot({ cx, cy, payload, index }: DotProps) {
  if (!payload || payload.value == null || cx == null || cy == null) return <React.Fragment key={index} />;
  return <circle key={index} cx={cx} cy={cy} r={5} fill={RATING_COLOR[payload.rating as Rating]} stroke="#fcfcfb" strokeWidth={2} />;
}

/** Letter rating over time, plotted as a step line with per-point status color (never color alone — the axis and tooltip always spell out the letter). */
export function RatingTimelineChart({ data }: { data: RatingPoint[] }) {
  const chartData = data.map((d) => ({ label: d.label, value: d.rating ? RATING_VALUE[d.rating] : null, rating: d.rating }));

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Рейтинг по месяцам</Typography>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="label" stroke={AXIS_COLOR} tick={{ fontSize: 11 }} />
          <YAxis
            stroke={AXIS_COLOR}
            tick={{ fontSize: 11 }}
            domain={[0.5, 3.5]}
            ticks={[1, 2, 3]}
            tickFormatter={(v: number) => (v === 1 ? 'C' : v === 2 ? 'B' : 'A')}
            width={30}
          />
          <Tooltip
            formatter={(_value: number, _name: string, item: { payload?: { rating: Rating | null } }) => [item.payload?.rating ?? 'Нет данных', 'Рейтинг']}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Line type="stepAfter" dataKey="value" stroke={AXIS_COLOR} strokeWidth={2} connectNulls={false} dot={RatingDot as never} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
