import { BankOrder, BuhOrder, CashOrder } from './types';

export const CURRENT_ACCOUNTANT = 'Сидорова О.Н.';
export const CURRENT_CASHIER = 'Иванова А.Ю.';

export const BRANCHES = ['АПОРТ', 'Мега Алматы', 'Достык Плаза'];
export const DESKS = ['Касса №1', 'Касса №2', 'Касса №3'];

export const BANK_DATA: Record<string, { name: string; bik: string; bin: string }> = {
  halyk: { name: 'Народный Банк Казахстана', bik: 'HSBKKZKX', bin: '920140000076' },
  kaspi: { name: 'Kaspi Bank', bik: 'CASPKZKX', bin: '971240024151' },
  kkb: { name: 'Казкоммерцбанк', bik: 'KZKOKZKX', bin: '861006451494' },
  forte: { name: 'Forte Bank', bik: 'IRTYKZKA', bin: '930640018395' },
  eurasian: { name: 'Евразийский Банк', bik: 'EURIKZKA', bin: '940540013278' },
  bcc: { name: 'Банк ЦентрКредит', bik: 'KCJBKZKX', bin: '930040000612' },
};

export const NBRK_RATES: Record<string, number> = {
  KZT: 1,
  USD: 503.4,
  EUR: 548.2,
  RUB: 5.48,
  CNY: 69.5,
  GBP: 641.3,
};

export const CONTRACTS = [{ value: 'ДОГ-2026-001', label: 'ДОГ-2026-001 · Народный Банк' }];

export const PODOTCHET_PERSONS = ['Петров С.И.', 'Иванова А.Ю.', 'Смирнова Е.В.', 'Касымов А.Б.', 'Нурланов Е.С.'];

const buhSample: BuhOrder = {
  id: 'КО-2026-10321',
  opTypeKey: 'buh-in',
  opType: 'buh',
  direction: 'in',
  status: 'executed',
  createdAt: '28.06.2026 10:14',
  date: '28.06.2026',
  time: '10:14',
  accountant: CURRENT_ACCOUNTANT,
  cashier: CURRENT_CASHIER,
  currency: 'KZT',
  amount: 500000,
  amountKzt: 500000,
  branch: 'АПОРТ',
  desk: 'Касса №1',
  note: 'Пополнение кассы',
  executedAt: '28.06.2026 10:20',
};

const bankSample: BankOrder = {
  id: 'КО-2026-10322',
  opTypeKey: 'bank-in',
  opType: 'bank',
  direction: 'in',
  status: 'pending',
  createdAt: '01.07.2026 09:02',
  date: '01.07.2026',
  time: '09:02',
  accountant: CURRENT_ACCOUNTANT,
  cashier: CURRENT_CASHIER,
  currency: 'USD',
  amount: 2000,
  amountKzt: 1006800,
  branch: 'АПОРТ',
  desk: 'Касса №1',
  bankKey: 'halyk',
  bankName: 'Народный Банк Казахстана',
  bankBik: 'HSBKKZKX',
  bankBin: '920140000076',
  account: 'KZ0000000000000000',
  contract: 'ДОГ-2026-001',
  rateBuy: 503.4,
  rateNbrk: 503.4,
};

export const initialOrders: CashOrder[] = [buhSample, bankSample];
