import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert, Box, Button, Grid, MenuItem, Paper, TextField, Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useMotivation } from '../MotivationContext';
import { DEFAULT_SETTINGS } from '../settings/defaultSettings';
import { MotivationSettings } from '../types';

interface SettingsFormValues {
  normOperations: string;
  normPhoneNumbers: string;
  normReviews: string;
  adaptationMonth1: string;
  adaptationMonth2: string;
  adaptationMonth3: string;
  adaptationMonth4: string;
  weightOperations: string;
  weightPhoneNumbers: string;
  weightReviews: string;
  ratingAMin: string;
  ratingBMin: string;
  minMetricThreshold: string;
  roundingMode: MotivationSettings['roundingMode'];
  partialMonthMethod: MotivationSettings['partialMonthMethod'];
}

function settingsToFormValues(s: MotivationSettings): SettingsFormValues {
  return {
    normOperations: String(s.baseNorms.operations),
    normPhoneNumbers: String(s.baseNorms.phoneNumbers),
    normReviews: String(s.baseNorms.reviews),
    adaptationMonth1: String(s.adaptationPercents.month1 * 100),
    adaptationMonth2: String(s.adaptationPercents.month2 * 100),
    adaptationMonth3: String(s.adaptationPercents.month3 * 100),
    adaptationMonth4: String(s.adaptationPercents.fromMonth4 * 100),
    weightOperations: (s.weights.operations * 100).toFixed(2),
    weightPhoneNumbers: (s.weights.phoneNumbers * 100).toFixed(2),
    weightReviews: (s.weights.reviews * 100).toFixed(2),
    ratingAMin: String(s.ratingThresholds.aMin),
    ratingBMin: String(s.ratingThresholds.bMin),
    minMetricThreshold: String(s.minMetricThreshold),
    roundingMode: s.roundingMode,
    partialMonthMethod: s.partialMonthMethod,
  };
}

function formValuesToSettings(v: SettingsFormValues): MotivationSettings {
  const num = (s: string) => parseFloat(s.replace(',', '.')) || 0;
  return {
    baseNorms: {
      operations: num(v.normOperations),
      phoneNumbers: num(v.normPhoneNumbers),
      reviews: num(v.normReviews),
    },
    adaptationPercents: {
      month1: num(v.adaptationMonth1) / 100,
      month2: num(v.adaptationMonth2) / 100,
      month3: num(v.adaptationMonth3) / 100,
      fromMonth4: num(v.adaptationMonth4) / 100,
    },
    weights: {
      operations: num(v.weightOperations) / 100,
      phoneNumbers: num(v.weightPhoneNumbers) / 100,
      reviews: num(v.weightReviews) / 100,
    },
    ratingThresholds: {
      aMin: num(v.ratingAMin),
      bMin: num(v.ratingBMin),
    },
    minMetricThreshold: num(v.minMetricThreshold),
    roundingMode: v.roundingMode,
    partialMonthMethod: v.partialMonthMethod,
  };
}

export function AdminSettingsPanel() {
  const { settings, updateSettings } = useMotivation();
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm<SettingsFormValues>({
    defaultValues: settingsToFormValues(settings),
  });

  // Keep the form in sync if settings change elsewhere (e.g. after a reset-to-defaults save).
  useEffect(() => { reset(settingsToFormValues(settings)); }, [settings, reset]);

  function onSubmit(values: SettingsFormValues) {
    updateSettings(formValuesToSettings(values));
  }

  function onResetToDefaults() {
    reset(settingsToFormValues(DEFAULT_SETTINGS));
    updateSettings(DEFAULT_SETTINGS);
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Alert severity="info" sx={{ mb: 2 }}>
        В демо-версии настройки хранятся в памяти и сбрасываются при перезагрузке страницы. На
        бэкенде рекомендуется хранить версии настроек с датой начала действия — см. DESIGN.md.
      </Alert>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Базовые нормативы (в месяц, действующий кассир)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Controller name="normOperations" control={control} render={({ field }) => (
              <TextField {...field} label="Операции" fullWidth />
            )} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="normPhoneNumbers" control={control} render={({ field }) => (
              <TextField {...field} label="Номера клиентов" fullWidth />
            )} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="normReviews" control={control} render={({ field }) => (
              <TextField {...field} label="Отзывы" fullWidth />
            )} />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Проценты адаптации по месяцам работы
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Controller name="adaptationMonth1" control={control} render={({ field }) => (
              <TextField {...field} label="1-й месяц, %" fullWidth />
            )} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Controller name="adaptationMonth2" control={control} render={({ field }) => (
              <TextField {...field} label="2-й месяц, %" fullWidth />
            )} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Controller name="adaptationMonth3" control={control} render={({ field }) => (
              <TextField {...field} label="3-й месяц, %" fullWidth />
            )} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Controller name="adaptationMonth4" control={control} render={({ field }) => (
              <TextField {...field} label="С 4-го месяца, %" fullWidth />
            )} />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Веса показателей (нормализуются автоматически, не обязаны давать ровно 100%)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Controller name="weightOperations" control={control} render={({ field }) => (
              <TextField {...field} label="Операции, %" fullWidth />
            )} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="weightPhoneNumbers" control={control} render={({ field }) => (
              <TextField {...field} label="Номера, %" fullWidth />
            )} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="weightReviews" control={control} render={({ field }) => (
              <TextField {...field} label="Отзывы, %" fullWidth />
            )} />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Границы рейтинга и минимальный порог показателя
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Controller name="ratingAMin" control={control} render={({ field }) => (
              <TextField {...field} label="Рейтинг A от, %" fullWidth />
            )} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="ratingBMin" control={control} render={({ field }) => (
              <TextField {...field} label="Рейтинг B от, %" fullWidth />
            )} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller name="minMetricThreshold" control={control} render={({ field }) => (
              <TextField {...field} label="Мин. выполнение показателя, %" fullWidth helperText="Ниже этого порога по любому показателю — рейтинг не выше C" />
            )} />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Округление и расчёт неполного месяца
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Controller name="roundingMode" control={control} render={({ field }) => (
              <TextField {...field} select label="Округление норматива" fullWidth>
                <MenuItem value="ceil">В большую сторону (вверх)</MenuItem>
                <MenuItem value="round">До ближайшего целого</MenuItem>
                <MenuItem value="floor">В меньшую сторону (вниз)</MenuItem>
              </TextField>
            )} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="partialMonthMethod" control={control} render={({ field }) => (
              <TextField {...field} select label="Неполный месяц считать по" fullWidth>
                <MenuItem value="calendarDays">Календарным дням</MenuItem>
                <MenuItem value="workDays">Рабочим дням</MenuItem>
              </TextField>
            )} />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
        <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={onResetToDefaults}>
          Сбросить к значениям по умолчанию
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={!isDirty}>
          Сохранить настройки
        </Button>
      </Box>
    </Box>
  );
}
