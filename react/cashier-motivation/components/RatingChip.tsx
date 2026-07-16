import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { Rating } from '../types';

const RATING_COLOR: Record<Rating, 'success' | 'warning' | 'error'> = {
  A: 'success',
  B: 'warning',
  C: 'error',
};

interface RatingChipProps {
  rating: Rating | null;
  capped?: boolean;
  size?: 'small' | 'medium';
}

export function RatingChip({ rating, capped, size = 'small' }: RatingChipProps) {
  if (!rating) {
    return <Chip size={size} label="Нет данных" variant="outlined" />;
  }

  const chip = <Chip size={size} label={rating} color={RATING_COLOR[rating]} sx={{ fontWeight: 800, minWidth: 36 }} />;

  if (capped) {
    return (
      <Tooltip title="Рейтинг ограничен: один из показателей выполнен менее чем на 50%">
        {chip}
      </Tooltip>
    );
  }
  return chip;
}
