import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Box, Button, Chip, Grid, InputAdornment, MenuItem, Paper, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import { BRANCHES, CURRENT_ACCOUNTANT, CURRENT_CASHIER, DESKS } from '../mockData';
import { amountWords, todayIso } from '../utils';
import { Direction } from '../types';

export interface BuhFormValues {
  date: string;
  amount: string;
  note: string;
  branch: string;
  desk: string;
}

interface BuhOrderFormProps {
  direction: Direction;
  defaultValues?: Partial<BuhFormValues>;
  editable: boolean;
  showCancel: boolean;
  onSaveDraft: (values: BuhFormValues) => void;
  onSend: (values: BuhFormValues) => void;
  onRequestCancel: () => void;
}

export function BuhOrderForm({
  direction,
  defaultValues,
  editable,
  showCancel,
  onSaveDraft,
  onSend,
  onRequestCancel,
}: BuhOrderFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<BuhFormValues>({
    mode: 'onChange',
    defaultValues: {
      date: todayIso(),
      amount: '',
      note: '',
      branch: BRANCHES[0],
      desk: DESKS[0],
      ...defaultValues,
    },
  });

  const amount = watch('amount');
  const words = amount ? amountWords(parseInt(amount, 10) || 0) : '';

  return (
    <Box component="form">
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Сведения об операции
        </Typography>
        <Chip
          size="small"
          label={direction === 'in' ? '↓ Приход' : '↑ Расход'}
          color={direction === 'in' ? 'success' : 'error'}
          sx={{ mb: 2, fontWeight: 700 }}
        />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField label="От кого" value={`${CURRENT_ACCOUNTANT} (Бухгалтер)`} disabled fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="date"
              control={control}
              rules={{ required: 'Укажите дату' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Дата операции"
                  required
                  fullWidth
                  disabled={!editable}
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField label="Валюта" value="KZT — Тенге" disabled fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="amount"
              control={control}
              rules={{ validate: (v) => parseInt(v || '0', 10) > 0 || 'Сумма должна быть больше 0' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Сумма"
                  required
                  fullWidth
                  disabled={!editable}
                  InputProps={{ endAdornment: <InputAdornment position="end">₸</InputAdornment> }}
                  error={!!fieldState.error}
                  helperText={fieldState.error ? fieldState.error.message : words}
                />
              )}
            />
          </Grid>
        </Grid>
        <Controller
          name="note"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Комментарий / Примечание" multiline minRows={3} fullWidth disabled={!editable} />
          )}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Реквизиты
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="branch"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Отделение" fullWidth disabled={!editable}>
                  {BRANCHES.map((b) => (
                    <MenuItem key={b} value={b}>{b}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="desk"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Касса" fullWidth disabled={!editable}>
                  {DESKS.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="ФИО бухгалтера" value={CURRENT_ACCOUNTANT} disabled fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="ФИО кассира" value={CURRENT_CASHIER} disabled fullWidth />
          </Grid>
        </Grid>
      </Paper>

      {editable && (
        <Box sx={{ display: 'flex', gap: 1.5, pt: 2, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
          {showCancel && (
            <Button color="error" variant="outlined" startIcon={<CancelIcon />} onClick={onRequestCancel}>
              Отменить
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" startIcon={<SaveIcon />} disabled={!isValid} onClick={handleSubmit(onSaveDraft)}>
            Сохранить черновик
          </Button>
          <Button variant="contained" startIcon={<SendIcon />} disabled={!isValid} onClick={handleSubmit(onSend)}>
            Отправить на исполнение
          </Button>
        </Box>
      )}
    </Box>
  );
}
