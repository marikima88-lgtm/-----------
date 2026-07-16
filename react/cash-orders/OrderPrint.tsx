import React from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { CashOrder } from './types';
import { amountWords, fmtNum } from './utils';

interface OrderPrintProps {
  order: CashOrder;
  onClose: () => void;
}

function FieldLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, my: 0.5 }}>
      <Typography sx={{ fontSize: '9pt', minWidth: '28mm', whiteSpace: 'nowrap' }}>{label}</Typography>
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, borderBottom: '1px solid #000', flex: 1 }}>{value}</Typography>
    </Box>
  );
}

function SignatureLine({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '9pt', borderBottom: '1px solid #000', pb: 0.5, mb: 0.5 }}>{value}</Typography>
      <Typography sx={{ fontSize: '7pt', textAlign: 'center', color: '#555' }}>({label}, подпись)</Typography>
    </Box>
  );
}

function OrderColumn({ order }: { order: CashOrder }) {
  const title = order.direction === 'in' ? 'ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР' : 'РАСХОДНЫЙ КАССОВЫЙ ОРДЕР';
  const counterparty =
    order.opType === 'bank' ? order.bankName : order.opType === 'pod' ? order.person : order.accountant;

  return (
    <Box sx={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '10pt', color: '#000' }}>
      <Typography sx={{ textAlign: 'right', fontSize: '7pt', fontStyle: 'italic', mb: 1 }}>
        Форма по ОКУД 0402009
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Typography sx={{ fontSize: '9pt' }}>Организация:</Typography>
        <Typography sx={{ fontSize: '9pt', fontWeight: 700, borderBottom: '1px solid #000', flex: 1 }}>
          ТОО «Ecash»
        </Typography>
      </Box>
      <Box sx={{ border: '1px solid #000', display: 'inline-block', px: 1, py: 0.5, mb: 1 }}>
        <Typography sx={{ fontSize: '9pt', fontWeight: 700 }}>БИН 000000000000</Typography>
      </Box>

      <Typography sx={{ fontSize: '13pt', fontWeight: 700, textTransform: 'uppercase', my: 1.5 }}>{title}</Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mb: 1.5 }}>
        <FieldLine label="Номер документа" value={order.id} />
        <FieldLine label="Дата составления" value={order.date} />
        <FieldLine label="Отделение / Касса" value={`${order.branch} / ${order.desk}`} />
        <FieldLine label="Корр. счёт" value={order.opType === 'bank' ? order.account : '—'} />
      </Box>

      <FieldLine label={order.direction === 'in' ? 'Принято от' : 'Выдать'} value={counterparty} />
      <FieldLine label="Основание" value={order.note || '—'} />

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, my: 1.5 }}>
        <Typography sx={{ fontSize: '9pt', minWidth: '28mm' }}>Сумма</Typography>
        <Typography sx={{ fontSize: '9pt', fontWeight: 700, borderBottom: '1px solid #000', flex: 1 }}>
          {fmtNum(order.amountKzt)} ₸ ({amountWords(order.amountKzt)})
        </Typography>
      </Box>
      {order.opType === 'bank' && (
        <FieldLine label="В т.ч. валюта" value={`${fmtNum(order.amount)} ${order.currency} по курсу ${order.rateBuy.toFixed(2)} ₸`} />
      )}

      <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        <SignatureLine label="Бухгалтер" value={order.accountant} />
        <SignatureLine label="Кассир" value={order.cashier} />
      </Box>
    </Box>
  );
}

export function OrderPrint({ order, onClose }: OrderPrintProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, p: 2, bgcolor: 'grey.100', '@media print': { display: 'none' } }}>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Печать</Button>
        <Button variant="outlined" onClick={onClose}>Закрыть</Button>
      </Box>
      <Box
        sx={{
          width: '297mm',
          minHeight: '210mm',
          mx: 'auto',
          p: '10mm 8mm',
          display: 'grid',
          gridTemplateColumns: '1fr 1px 1fr',
          bgcolor: '#fff',
        }}
      >
        <Box sx={{ pr: '8mm' }}><OrderColumn order={order} /></Box>
        <Divider orientation="vertical" sx={{ borderStyle: 'dashed', borderColor: '#666' }} />
        <Box sx={{ pl: '8mm' }}><OrderColumn order={order} /></Box>
      </Box>
    </Box>
  );
}
