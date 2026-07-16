import React from 'react';
import { Box, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import { Dynamics } from '../types';

interface DynamicsIndicatorProps {
  dynamics: Dynamics;
  suffix?: string; // e.g. '%' or 'п.п.'
}

export function DynamicsIndicator({ dynamics, suffix = '%' }: DynamicsIndicatorProps) {
  if (dynamics.direction === 'no-data') {
    return <Typography variant="caption" color="text.secondary">—</Typography>;
  }

  const color = dynamics.direction === 'up' ? 'success.main' : dynamics.direction === 'down' ? 'error.main' : 'text.secondary';
  const Icon = dynamics.direction === 'up' ? ArrowUpwardIcon : dynamics.direction === 'down' ? ArrowDownwardIcon : RemoveIcon;
  const sign = dynamics.delta && dynamics.delta > 0 ? '+' : '';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color }}>
      <Icon sx={{ fontSize: 15 }} />
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit' }}>
        {sign}{(dynamics.delta ?? 0).toFixed(1)}{suffix}
      </Typography>
    </Box>
  );
}
