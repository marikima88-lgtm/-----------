import React, { useState } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import PrintIcon from '@mui/icons-material/Print';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { StatusTracker } from './StatusTracker';
import { CancelDialog } from './CancelDialog';
import { useOrders } from './OrdersContext';
import { fmtNum, nowDateTimeParts } from './utils';
import { CURRENT_CASHIER } from './mockData';

const OP_LABELS: Record<string, string> = { buh: 'Касса бухгалтерии', bank: 'Банк (БВУ)', pod: 'Подотчётное лицо' };
const DIR_LABELS: Record<string, string> = { in: '↓ Получено', out: '↑ Выдано' };

interface OrderExecutionProps {
  orderId: string;
  onBack: () => void;
  onPrint: (orderId: string) => void;
}

export function OrderExecution({ orderId, onBack, onPrint }: OrderExecutionProps) {
  const { getOrder, setStatus } = useOrders();
  const order = getOrder(orderId);
  const [cancelOpen, setCancelOpen] = useState(false);

  if (!order) {
    return <Typography>Ордер не найден</Typography>;
  }

  const isExecuted = order.status === 'executed';
  const isCancelled = order.status === 'cancelled';

  function handleExecute() {
    const { createdAt } = nowDateTimeParts();
    setStatus(order!.id, 'executed', { executedAt: createdAt });
  }

  function handleConfirmCancel(reason: string) {
    const { createdAt } = nowDateTimeParts();
    setStatus(order!.id, 'cancelled', { cancelReason: reason, cancelledAt: createdAt });
    setCancelOpen(false);
  }

  const items: { label: string; value: React.ReactNode; big?: boolean; span?: number; color?: string }[] = [
    { label: 'Номер ордера', value: order.id },
    { label: 'Тип операции', value: OP_LABELS[order.opType] },
    { label: 'Направление', value: DIR_LABELS[order.direction], color: order.direction === 'in' ? 'success.main' : 'error.main' },
    {
      label: 'Сумма',
      value: (order.currency !== 'KZT' ? `${fmtNum(order.amount)} ${order.currency} = ` : '') + `${fmtNum(order.amountKzt)} ₸`,
      big: true,
      span: 3,
    },
  ];
  if (order.opType === 'bank') {
    items.push({ label: 'Банк', value: order.bankName });
    items.push({ label: 'Курс приобретения', value: `${order.rateBuy.toFixed(2)} ₸` });
    items.push({ label: 'Договор', value: order.contract });
  }
  if (order.opType === 'pod') {
    items.push({ label: 'Подотчётное лицо', value: order.person });
  }
  items.push({ label: 'Отделение / Касса', value: `${order.branch} / ${order.desk}` });
  items.push({ label: 'Бухгалтер', value: order.accountant });
  items.push({ label: 'Создана', value: order.createdAt });
  if (order.note) items.push({ label: 'Комментарий', value: order.note, span: 3 });

  return (
    <Box>
      <StatusTracker status={order.status} />

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 2 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Параметры операции
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
          {items.map((it, i) => (
            <Paper
              key={i}
              variant="outlined"
              sx={{ p: 1.5, bgcolor: 'background.default', gridColumn: `span ${it.span ?? 1}` }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                {it.label}
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: it.big ? 20 : 14, color: it.color }}>
                {it.value}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>

      {isExecuted && (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 2, bgcolor: 'success.light', border: '2px solid', borderColor: 'success.main' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" fontWeight={800} color="success.dark">Операция проведена</Typography>
          <Typography variant="body2" color="success.dark">
            Операция {order.id} проведена · {order.executedAt} · {CURRENT_CASHIER}
          </Typography>
        </Paper>
      )}

      {isCancelled && (
        <Paper variant="outlined" sx={{ p: 3, mb: 2, borderColor: 'error.main' }}>
          <Typography variant="subtitle1" fontWeight={800} color="error.main">Операция отменена</Typography>
          {order.cancelReason && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Причина: {order.cancelReason}</Typography>
          )}
        </Paper>
      )}

      {!isExecuted && !isCancelled && (
        <Box sx={{ display: 'flex', gap: 1.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button color="error" variant="outlined" startIcon={<CancelIcon />} onClick={() => setCancelOpen(true)}>
            Отменить операцию
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={handleExecute}>
            Исполнить
          </Button>
        </Box>
      )}

      {isExecuted && (
        <Box sx={{ display: 'flex', gap: 1.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
            К реестру
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => onPrint(order.id)}>
            Распечатать чек
          </Button>
        </Box>
      )}

      {isCancelled && (
        <Box sx={{ display: 'flex', gap: 1.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
            К реестру
          </Button>
        </Box>
      )}

      <CancelDialog open={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={handleConfirmCancel} />
    </Box>
  );
}
