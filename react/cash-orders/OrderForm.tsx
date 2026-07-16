import React, { useState } from 'react';
import { Box, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { StatusTracker } from './StatusTracker';
import { CancelDialog } from './CancelDialog';
import { BuhOrderForm, BuhFormValues } from './forms/BuhOrderForm';
import { BankOrderForm, BankFormValues } from './forms/BankOrderForm';
import { PodOrderForm, PodFormValues } from './forms/PodOrderForm';
import { useOrders } from './OrdersContext';
import { BANK_DATA, CURRENT_ACCOUNTANT, CURRENT_CASHIER } from './mockData';
import { generateOrderId, isoDateToRu, nowDateTimeParts, ruDateToIso } from './utils';
import { CashOrder, OpTypeKey, OP_TYPE_OPTIONS, OrderStatus } from './types';

interface OrderFormProps {
  orderId?: string;
  onSent: (order: CashOrder) => void;
  onCancelled: (order: CashOrder) => void;
}

export function OrderForm({ orderId, onSent, onCancelled }: OrderFormProps) {
  const { getOrder, saveOrder, setStatus } = useOrders();
  const existing = orderId ? getOrder(orderId) : undefined;

  const [opTypeKey, setOpTypeKey] = useState<OpTypeKey | ''>(existing?.opTypeKey ?? '');
  const [cancelOpen, setCancelOpen] = useState(false);

  const status: OrderStatus = existing?.status ?? 'draft';
  const editable = status === 'draft' || status === 'pending';
  const [base, direction] = (opTypeKey || 'buh-in').split('-') as ['buh' | 'bank' | 'pod', 'in' | 'out'];

  function persist(values: BuhFormValues | BankFormValues | PodFormValues, nextStatus: OrderStatus): CashOrder | undefined {
    if (!opTypeKey) return undefined;
    const { createdAt, date, time } = nowDateTimeParts();
    const id = existing?.id ?? generateOrderId();
    const [type, dir] = opTypeKey.split('-') as ['buh' | 'bank' | 'pod', 'in' | 'out'];

    let order: CashOrder;
    if (type === 'buh') {
      const v = values as BuhFormValues;
      const amount = parseInt(v.amount, 10) || 0;
      order = {
        id, opTypeKey, opType: 'buh', direction: dir, status: nextStatus,
        createdAt: existing?.createdAt ?? createdAt,
        date: isoDateToRu(v.date) || date,
        time,
        accountant: CURRENT_ACCOUNTANT, cashier: CURRENT_CASHIER,
        currency: 'KZT', amount, amountKzt: amount,
        branch: v.branch, desk: v.desk, note: v.note,
      };
    } else if (type === 'bank') {
      const v = values as BankFormValues;
      const amount = parseFloat(v.amount.replace(',', '.')) || 0;
      const rateBuy = parseFloat(v.rateBuy.replace(',', '.')) || 0;
      const bank = BANK_DATA.halyk;
      order = {
        id, opTypeKey, opType: 'bank', direction: dir, status: nextStatus,
        createdAt: existing?.createdAt ?? createdAt, date, time,
        accountant: CURRENT_ACCOUNTANT, cashier: CURRENT_CASHIER,
        currency: v.currency, amount, amountKzt: Math.round(amount * rateBuy),
        rateBuy, rateNbrk: 0,
        bankKey: 'halyk', bankName: bank.name, bankBik: bank.bik, bankBin: bank.bin,
        account: v.account.replace(/\s/g, ''), contract: v.contract,
        branch: v.branch, desk: v.desk, note: v.note,
      };
    } else {
      const v = values as PodFormValues;
      const amount = parseInt(v.amount, 10) || 0;
      order = {
        id, opTypeKey, opType: 'pod', direction: dir, status: nextStatus,
        createdAt: existing?.createdAt ?? createdAt,
        date: isoDateToRu(v.date) || date,
        time,
        accountant: CURRENT_ACCOUNTANT, cashier: CURRENT_CASHIER,
        currency: 'KZT', amount, amountKzt: amount,
        person: v.person, branch: v.branch, desk: v.desk, note: v.note,
      };
    }

    saveOrder(order);
    return order;
  }

  function handleSaveDraft(values: BuhFormValues | BankFormValues | PodFormValues) {
    persist(values, 'draft');
  }

  function handleSend(values: BuhFormValues | BankFormValues | PodFormValues) {
    const order = persist(values, 'pending');
    if (order) onSent(order);
  }

  function handleConfirmCancel(reason: string) {
    if (!existing) return;
    const { createdAt } = nowDateTimeParts();
    setStatus(existing.id, 'cancelled', { cancelReason: reason, cancelledAt: createdAt });
    setCancelOpen(false);
    onCancelled({ ...existing, status: 'cancelled', cancelReason: reason });
  }

  const buhDefaults = existing && existing.opType === 'buh'
    ? { date: ruDateToIso(existing.date), amount: String(existing.amount), note: existing.note ?? '', branch: existing.branch, desk: existing.desk }
    : undefined;

  const podDefaults = existing && existing.opType === 'pod'
    ? { person: existing.person, date: ruDateToIso(existing.date), amount: String(existing.amount), note: existing.note ?? '', branch: existing.branch, desk: existing.desk }
    : undefined;

  const bankDefaults = existing && existing.opType === 'bank'
    ? {
      contract: existing.contract, currency: existing.currency, amount: String(existing.amount),
      rateBuy: String(existing.rateBuy), account: existing.account, note: existing.note ?? '',
      branch: existing.branch, desk: existing.desk,
    }
    : undefined;

  return (
    <Box>
      <StatusTracker status={status} />

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Тип операции
        </Typography>
        <TextField
          select
          fullWidth
          label="Выберите тип"
          required
          value={opTypeKey}
          disabled={!!existing}
          onChange={(e) => setOpTypeKey(e.target.value as OpTypeKey)}
        >
          <MenuItem value="">— Выберите из справочника —</MenuItem>
          {OP_TYPE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
      </Paper>

      {opTypeKey === '' ? null : base === 'buh' ? (
        <BuhOrderForm
          direction={direction}
          defaultValues={buhDefaults}
          editable={editable}
          showCancel={!!existing}
          onSaveDraft={handleSaveDraft}
          onSend={handleSend}
          onRequestCancel={() => setCancelOpen(true)}
        />
      ) : base === 'bank' ? (
        <BankOrderForm
          direction={direction}
          defaultValues={bankDefaults}
          editable={editable}
          showCancel={!!existing}
          onSaveDraft={handleSaveDraft}
          onSend={handleSend}
          onRequestCancel={() => setCancelOpen(true)}
        />
      ) : (
        <PodOrderForm
          direction={direction}
          defaultValues={podDefaults}
          editable={editable}
          showCancel={!!existing}
          onSaveDraft={handleSaveDraft}
          onSend={handleSend}
          onRequestCancel={() => setCancelOpen(true)}
        />
      )}

      <CancelDialog open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={handleConfirmCancel} />
    </Box>
  );
}
