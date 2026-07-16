export function amountWords(nInput: number): string {
  let n = Math.floor(nInput);
  if (!n) return '';
  const original = n;
  const U = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  const T = [
    'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать',
    'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать',
  ];
  const D = ['', 'десять', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  const H = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

  function pl(v: number, f: [string, string, string, string]) {
    const m = v % 100;
    if (m >= 11 && m <= 19) return f[0];
    const r = v % 10;
    if (r === 1) return f[1];
    if (r >= 2 && r <= 4) return f[2];
    return f[0];
  }

  function thr(v: number, fem: boolean) {
    let s = '';
    const h = Math.floor(v / 100);
    v %= 100;
    s += H[h] ? H[h] + ' ' : '';
    if (v >= 10 && v < 20) {
      s += T[v - 10] + ' ';
      return s;
    }
    const d = Math.floor(v / 10);
    v %= 10;
    s += D[d] ? D[d] + ' ' : '';
    if (fem && v === 1) s += 'одна ';
    else if (fem && v === 2) s += 'две ';
    else s += U[v] ? U[v] + ' ' : '';
    return s;
  }

  const mil = Math.floor(n / 1e6);
  n %= 1e6;
  const tho = Math.floor(n / 1e3);
  n %= 1e3;
  const rem = n;

  let s = '';
  if (mil) s += thr(mil, false) + pl(mil, ['миллионов', 'миллион', 'миллиона', 'миллионов']) + ' ';
  if (tho) s += thr(tho, true) + pl(tho, ['тысяч', 'тысяча', 'тысячи', 'тысяч']) + ' ';
  if (rem) s += thr(rem, false);
  s += pl(original, ['тенге', 'тенге', 'тенге', 'тенге']);

  const r = s.trim();
  return r.charAt(0).toUpperCase() + r.slice(1);
}

export function fmtNum(n: number): string {
  return Number(n).toLocaleString('ru-RU');
}

export function formatAccountNumber(raw: string): string {
  const v = raw
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 20);
  let out = '';
  for (let i = 0; i < v.length; i++) {
    if (i === 2 || i === 6 || i === 10 || i === 14) out += ' ';
    out += v[i];
  }
  return out;
}

let seq = 10000;
export function generateOrderId(prefix = 'КО'): string {
  const year = new Date().getFullYear();
  seq += 1;
  return `${prefix}-${year}-${seq}`;
}

export function nowDateTimeParts() {
  const now = new Date();
  return {
    createdAt: now.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
    date: now.toLocaleDateString('ru-RU'),
    time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export function ruDateToIso(ruDate: string): string {
  const [d, m, y] = ruDate.split('.');
  if (!d || !m || !y) return todayIso();
  return `${y}-${m}-${d}`;
}

export function isoDateToRu(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return parts.reverse().join('.');
}
