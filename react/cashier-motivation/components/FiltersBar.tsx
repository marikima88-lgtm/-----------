import React from 'react';
import { Box, MenuItem, Paper, TextField } from '@mui/material';
import { useMotivation } from '../MotivationContext';
import { MotivationFilters, Rating, TenureFilter } from '../types';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

interface FiltersBarProps {
  filters: MotivationFilters;
  onChange: (filters: MotivationFilters) => void;
  availableYears: number[];
}

export function FiltersBar({ filters, onChange, availableYears }: FiltersBarProps) {
  const { departments, employees } = useMotivation();

  function patch(update: Partial<MotivationFilters>) {
    onChange({ ...filters, ...update });
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <TextField
          select label="Месяц" size="small" sx={{ minWidth: 140 }}
          value={filters.month} onChange={(e) => patch({ month: Number(e.target.value) })}
        >
          {MONTH_NAMES.map((name, i) => (
            <MenuItem key={name} value={i + 1}>{name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select label="Год" size="small" sx={{ minWidth: 100 }}
          value={filters.year} onChange={(e) => patch({ year: Number(e.target.value) })}
        >
          {availableYears.map((y) => (
            <MenuItem key={y} value={y}>{y}</MenuItem>
          ))}
        </TextField>

        <TextField
          select label="Отделение" size="small" sx={{ minWidth: 170 }}
          value={filters.departmentId} onChange={(e) => patch({ departmentId: e.target.value })}
        >
          <MenuItem value="all">Все отделения</MenuItem>
          {departments.map((d) => (
            <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select label="Кассир" size="small" sx={{ minWidth: 200 }}
          value={filters.employeeId} onChange={(e) => patch({ employeeId: e.target.value })}
        >
          <MenuItem value="all">Все кассиры</MenuItem>
          {employees.map((e) => (
            <MenuItem key={e.id} value={e.id}>{e.fullName}</MenuItem>
          ))}
        </TextField>

        <TextField
          select label="Статус" size="small" sx={{ minWidth: 160 }}
          value={filters.tenure} onChange={(e) => patch({ tenure: e.target.value as TenureFilter })}
        >
          <MenuItem value="all">Новый и действующий</MenuItem>
          <MenuItem value="new">Новый (1-3 мес.)</MenuItem>
          <MenuItem value="active">Действующий (4+ мес.)</MenuItem>
        </TextField>

        <TextField
          select label="Рейтинг" size="small" sx={{ minWidth: 130 }}
          value={filters.rating} onChange={(e) => patch({ rating: e.target.value as 'all' | Rating })}
        >
          <MenuItem value="all">Любой</MenuItem>
          <MenuItem value="A">A</MenuItem>
          <MenuItem value="B">B</MenuItem>
          <MenuItem value="C">C</MenuItem>
        </TextField>
      </Box>
    </Paper>
  );
}
