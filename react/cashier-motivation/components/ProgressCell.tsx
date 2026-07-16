import React from 'react';
import { Box, Typography } from '@mui/material';
import { RatingThresholds } from '../types';

export type IndicatorColor = 'success' | 'warning' | 'error' | 'default';

/** Green >= aMin, yellow in [bMin, aMin), red below bMin — per section 7 of the brief. */
export function getIndicatorColor(percent: number | null, thresholds: RatingThresholds): IndicatorColor {
  if (percent === null) return 'default';
  if (percent >= thresholds.aMin) return 'success';
  if (percent >= thresholds.bMin) return 'warning';
  return 'error';
}

const DOT_COLOR: Record<IndicatorColor, string> = {
  success: '#1BA85D',
  warning: '#F5A623',
  error: '#D93025',
  default: '#9AA0A6',
};

interface ProgressCellProps {
  fact: number;
  norm: number;
  percent: number | null;
  thresholds: RatingThresholds;
}

export function ProgressCell({ fact, norm, percent, thresholds }: ProgressCellProps) {
  const color = getIndicatorColor(percent, thresholds);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DOT_COLOR[color], flexShrink: 0 }} />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {percent === null ? '—' : `${percent.toFixed(1)}%`}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {fact} / {norm}
        </Typography>
      </Box>
    </Box>
  );
}
