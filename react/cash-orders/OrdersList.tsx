import React from 'react';
import {
  Box, Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useOrders } from './OrdersContext';
import { CashOrder, OrderStatus } from './types';
import { fmtNum } from './utils';

const STATUS_CHIP: Record<OrderStatus, { label: string; color: 'default' | 'warning' | 'success' | 'error' }> = {
  draft: { label: 'Черновик', color: 'default' },
  pending: { label: 'На подтверждении', color: 'warning' },
  executed: { label: 'Проведена', color: 'success' },
  cancelled: { label: 'Отменена', color: 'error' },
};

const OP_LABELS: Record<string, string> = { buh: 'Касса бухгалтерии', bank: 'Банк (БВУ)', pod: 'Подотчётное лицо' };

interface OrdersListProps {
  onSelect: (order: CashOrder) => void;
  onCreate: () => void;
}

export function OrdersList({ onSelect, onCreate }: OrdersListProps) {
  const { orders } = useOrders();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={800}>Кассовые ордера</Typography>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>Новый ордер</Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Направление</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Создана</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id} hover sx={{ cursor: 'pointer' }} onClick={() => onSelect(o)}>
                <TableCell sx={{ fontFamily: 'monospace' }}>{o.id}</TableCell>
                <TableCell>{OP_LABELS[o.opType]}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={o.direction === 'in' ? 'Приход' : 'Расход'}
                    color={o.direction === 'in' ? 'success' : 'error'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">{fmtNum(o.amountKzt)} ₸</TableCell>
                <TableCell>
                  <Chip size="small" label={STATUS_CHIP[o.status].label} color={STATUS_CHIP[o.status].color} />
                </TableCell>
                <TableCell>{o.createdAt}</TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Ордеров пока нет
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
