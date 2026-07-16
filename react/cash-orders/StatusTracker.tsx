import React from 'react';
import { Box, Chip, Step, StepLabel, Stepper } from '@mui/material';
import { OrderStatus } from './types';

const STEP_LABELS = ['Создана', 'На подтверждении', 'Проведена'];

const STEP_INDEX: Record<Exclude<OrderStatus, 'cancelled'>, number> = {
  draft: 0,
  pending: 1,
  executed: 2,
};

const STATUS_CHIP: Record<OrderStatus, { label: string; color: 'default' | 'warning' | 'success' | 'error' }> = {
  draft: { label: 'Создана', color: 'default' },
  pending: { label: 'На подтверждении', color: 'warning' },
  executed: { label: 'Проведена', color: 'success' },
  cancelled: { label: 'Отменена', color: 'error' },
};

export function StatusTracker({ status }: { status: OrderStatus }) {
  const activeStep = status === 'cancelled' ? -1 : STEP_INDEX[status];
  const chip = STATUS_CHIP[status];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        p: 2,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Stepper activeStep={activeStep} sx={{ flex: 1 }}>
        {STEP_LABELS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Chip label={chip.label} color={chip.color} size="small" sx={{ fontWeight: 700 }} />
    </Box>
  );
}
