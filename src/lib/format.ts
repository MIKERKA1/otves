export type Range = readonly [number, number];

const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
const NBSP = ' ';

export const num = (n: number): string => nf.format(n);
export const rub = (n: number): string => `${num(n)}${NBSP}₽`;

/** Compact range for receipts and tables: «18 000–26 000 ₽». */
export const rubRange = ([min, max]: Range): string =>
  min === max ? rub(min) : `${num(min)}–${num(max)}${NBSP}₽`;

/** Readable range for sentences: «от 1 500 до 3 500 ₽». */
export const rubBetween = ([min, max]: Range): string =>
  min === max ? rub(min) : `от${NBSP}${num(min)} до${NBSP}${rub(max)}`;

export const rubFrom = (n: number, unit?: string): string =>
  `от${NBSP}${rub(n)}${unit ? ` ${unit}` : ''}`;
