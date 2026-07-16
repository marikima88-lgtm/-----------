export type OpType = 'buh' | 'bank' | 'pod';
export type Direction = 'in' | 'out';
export type OpTypeKey = `${OpType}-${Direction}`;
export type OrderStatus = 'draft' | 'pending' | 'executed' | 'cancelled';

export interface BaseOrder {
  id: string;
  opTypeKey: OpTypeKey;
  opType: OpType;
  direction: Direction;
  status: OrderStatus;
  createdAt: string;
  date: string;
  time: string;
  accountant: string;
  cashier: string;
  currency: string;
  amount: number;
  amountKzt: number;
  branch: string;
  desk: string;
  note?: string;
  executedAt?: string;
  cancelReason?: string;
  cancelledAt?: string;
}

export interface BuhOrder extends BaseOrder {
  opType: 'buh';
}

export interface BankOrder extends BaseOrder {
  opType: 'bank';
  bankKey: string;
  bankName: string;
  bankBik: string;
  bankBin: string;
  account: string;
  contract: string;
  rateBuy: number;
  rateNbrk: number;
}

export interface PodOrder extends BaseOrder {
  opType: 'pod';
  person: string;
}

export type CashOrder = BuhOrder | BankOrder | PodOrder;

export const OP_TYPE_OPTIONS: { value: OpTypeKey; label: string; group: string }[] = [
  { value: 'buh-in', label: 'Получено с кассы бухгалтерии', group: 'Касса бухгалтерии' },
  { value: 'buh-out', label: 'Выдано с кассы бухгалтерии', group: 'Касса бухгалтерии' },
  { value: 'bank-in', label: 'Получено из Банка (БВУ) — подкрепление', group: 'Банк (БВУ)' },
  { value: 'bank-out', label: 'Выдано в Банк (БВУ)', group: 'Банк (БВУ)' },
  { value: 'pod-in', label: 'Возврат от подотчётного лица', group: 'Подотчётное лицо' },
  { value: 'pod-out', label: 'Выдача подотчётному лицу', group: 'Подотчётное лицо' },
];
