import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Box, Button, Chip, Grid, InputAdornment, MenuItem, Paper, TextField, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import { BANK_DATA, BRANCHES, CONTRACTS, CURRENT_ACCOUNTANT, CURRENT_CASHIER, DESKS, NBRK_RATES } from '../mockData';
import { fmtNum, formatAccountNumber } from '../utils';
import { Direction } from '../types';

const CURRENCIES = ['USD', 'EUR', 'RUB', 'CNY', 'GBP'];
const WAC_RATE = 498.75;

export interface BankFormValues {
  contract: string;
  currency: string;
  amount: string;
  rateBuy: string;
  account: string;
  note: string;
  branch: string;
  desk: string;
}

interface BankOrderFormProps {
  direction: Direction;
  defaultValues?: Partial<BankFormValues>;
  editable: boolean;
  showCancel: boolean;
  onSaveDraft: (values: BankFormValues) => void;
  onSend: (values: BankFormValues) => void;
  onRequestCancel: () => void;
}

export function BankOrderForm({
  direction,
  defaultValues,
  editable,
  showCancel,
  onSaveDraft,
  onSend,
  onRequestCancel,
}: BankOrderFormProps) {
  const now = useMemo(() => new Date(), []);
  const opNum = useMemo(
    () => `БКО-${now.getFullYear()}-${String(Math.floor(Math.random() * 90000 + 10000))}`,
    [now],
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<BankFormValues>({
    mode: 'onChange',
    defaultValues: {
      contract: '',
      currency: 'USD',
      amount: '',
      rateBuy: '',
      account: '',
      note: '',
      branch: BRANCHES[0],
      desk: DESKS[0],
      ...defaultValues,
    },
  });

  const currency = watch('currency');
  const amount = parseFloat((watch('amount') || '').replace(',', '.')) || 0;
  const rateBuy = parseFloat((watch('rateBuy') || '').replace(',', '.')) || 0;
  const rateNbrk = NBRK_RATES[currency] || 0;
  const totalKzt = amount > 0 && rateBuy > 0 ? Math.round(amount * rateBuy) : 0;
  const account = watch('account') || '';
  const bank = BANK_DATA.halyk;

  return (
    <Box component="form">
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Общие сведения
        </Typography>
        <Chip
          size="small"
          label={direction === 'in' ? '↓ Приход' : '↑ Расход'}
          color={direction === 'in' ? 'success' : 'error'}
          sx={{ mb: 2, fontWeight: 700 }}
        />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <TextField label="Дата" value={now.toLocaleDateString('ru-RU')} disabled fullWidth />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="Время"
              value={now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              disabled
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField label="Пункт" value="АПОРТ" disabled fullWidth />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField label="№ операции" value={opNum} disabled fullWidth />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField label="Бухгалтер" value={CURRENT_ACCOUNTANT} disabled fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Кассир" value={CURRENT_CASHIER} disabled fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="contract"
              control={control}
              rules={{ required: 'Выберите договор' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Договор"
                  required
                  fullWidth
                  disabled={!editable}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                >
                  <MenuItem value="">— Выбрать из реестра —</MenuItem>
                  {CONTRACTS.map((c) => (
                    <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Банковские реквизиты
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField label="Банк (БВУ)" value={bank.name} disabled fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="БИК" value={bank.bik} disabled fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="БИН" value={bank.bin} disabled fullWidth />
          </Grid>
        </Grid>
        <Controller
          name="account"
          control={control}
          rules={{ validate: (v) => v.replace(/\s/g, '').length === 20 || 'Счёт должен содержать ровно 20 символов' }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Банковский счёт (20 символов)"
              required
              fullWidth
              disabled={!editable}
              placeholder="KZ00 0000 0000 0000 0000"
              onChange={(e) => field.onChange(formatAccountNumber(e.target.value))}
              error={!!fieldState.error}
              helperText={fieldState.error?.message || `Введено символов: ${account.replace(/\s/g, '').length} / 20`}
            />
          )}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Валюта и суммы
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Валюта" required fullWidth disabled={!editable}>
                  {CURRENCIES.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="amount"
              control={control}
              rules={{ validate: (v) => parseFloat(v || '0') > 0 || 'Введите сумму' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Сумма в валюте"
                  required
                  fullWidth
                  disabled={!editable}
                  InputProps={{ endAdornment: <InputAdornment position="end">{currency}</InputAdornment> }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="rateBuy"
              control={control}
              rules={{ validate: (v) => parseFloat(v || '0') > 0 || 'Укажите курс' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Курс покупки"
                  required
                  fullWidth
                  disabled={!editable}
                  InputProps={{ endAdornment: <InputAdornment position="end">₸/1</InputAdornment> }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField label="Курс НБРК" value={`${rateNbrk.toFixed(2)} ₸`} disabled fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="WAC (ср. курс)" value={`${WAC_RATE.toFixed(2)} ₸`} disabled fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="note"
              control={control}
              render={({ field }) => <TextField {...field} label="Комментарий" fullWidth disabled={!editable} />}
            />
          </Grid>
        </Grid>

        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Сумма в иностранной валюте
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {amount > 0 ? `${fmtNum(amount)} ${currency}` : '—'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Сумма в тенге (авто)
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {totalKzt > 0 ? `${fmtNum(totalKzt)} ₸` : '— ₸'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Реквизиты
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
            <TextField label="Кассир" value={CURRENT_CASHIER} disabled fullWidth />
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
