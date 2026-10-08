// Calculator formulas. Pure functions, no DOM: tested in tests/unit/pricing.test.ts.
// All rates are demo values for a fictional company.
import type { Range } from '../lib/format.ts';

export type ServiceId = 'remont' | 'potolki' | 'okna' | 'santehnika' | 'elektrika';

export interface Line {
  label: string;
  range: Range;
}

export interface Estimate {
  lines: Line[];
  total: Range;
  notIncluded: string[];
  included?: string;
}

export type RemontLevel = 'cosmetic' | 'capital' | 'turnkey';
export type Bathroom = 'none' | 'combined' | 'separate';

export interface RemontInput {
  area: number;
  level: RemontLevel;
  bathroom: Bathroom;
  demolition: boolean;
  materials: boolean;
  debris: boolean;
}

export type Finish = 'matte' | 'satin' | 'glossy' | 'fabric';

export interface PotolkiInput {
  area: number;
  rooms: number;
  finish: Finish;
  spots: number;
  chandeliers: number;
  shadow: boolean;
}

export interface OknaInput {
  regular: number;
  triple: number;
  balcony: number;
  warm: boolean;
  slopes: boolean;
  sills: boolean;
  nets: boolean;
}

export interface SantehnikaInput {
  mixer: number;
  toilet: number;
  installation: number;
  sink: number;
  bath: number;
  shower: number;
  appliance: number;
  towel: number;
  piping: boolean;
}

export interface ElektrikaInput {
  full: boolean;
  area: number;
  outlets: number;
  newPoints: number;
  spots: number;
  chandeliers: number;
  panel: boolean;
}

export const REMONT_RATES: Record<RemontLevel, Range> = {
  cosmetic: [4500, 6500],
  capital: [9000, 12500],
  turnkey: [14000, 19000],
};

export const REMONT_LEVEL_NAMES: Record<RemontLevel, string> = {
  cosmetic: 'Косметический ремонт',
  capital: 'Капитальный ремонт',
  turnkey: 'Ремонт под ключ',
};

const BATHROOM: Record<Exclude<Bathroom, 'none'>, Range> = {
  combined: [70000, 120000],
  separate: [95000, 160000],
};

export const FINISH_RATES: Record<Finish, Range> = {
  matte: [650, 850],
  satin: [750, 950],
  glossy: [800, 1000],
  fabric: [1600, 2200],
};

export const FINISH_NAMES: Record<Finish, string> = {
  matte: 'матовое',
  satin: 'сатиновое',
  glossy: 'глянцевое',
  fabric: 'тканевое',
};

export const WINDOW_PRICES = {
  regular: [18000, 26000] as Range,
  triple: [26000, 36000] as Range,
  balcony: [32000, 45000] as Range,
};

type PlumbingItem = Exclude<keyof SantehnikaInput, 'piping'>;

export const PLUMBING_PRICES: Record<PlumbingItem | 'piping', Range> = {
  mixer: [1500, 2500],
  toilet: [3500, 5000],
  installation: [8000, 11000],
  sink: [2500, 4000],
  bath: [6000, 9000],
  shower: [7000, 11000],
  appliance: [2000, 3500],
  towel: [4000, 6500],
  piping: [28000, 45000],
};

export const PLUMBING_NAMES: Record<PlumbingItem | 'piping', string> = {
  mixer: 'Смеситель',
  toilet: 'Унитаз',
  installation: 'Подвесной унитаз с инсталляцией',
  sink: 'Раковина',
  bath: 'Ванна',
  shower: 'Душевой поддон и ограждение',
  appliance: 'Подключение стиральной или посудомоечной машины',
  towel: 'Полотенцесушитель',
  piping: 'Разводка труб в санузле',
};

export const ELECTRIC_PRICES = {
  outlets: [450, 700] as Range,
  newPoints: [1800, 2600] as Range,
  spots: [600, 900] as Range,
  chandeliers: [1500, 2500] as Range,
  panel: [12000, 20000] as Range,
  fullPerM2: [1900, 2600] as Range,
};

export const MIN_ORDER = 2000;

const scale = ([a, b]: Range, k: number): Range => [a * k, b * k];
const add = (x: Range, y: Range): Range => [x[0] + y[0], x[1] + y[1]];
const clampInt = (n: number, min: number, max: number) =>
  Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : min;

/** Rounds the lower bound down and the upper bound up to a step that fits the amount. */
export function roundRange([min, max]: Range): Range {
  const step = max < 10000 ? 100 : max < 100000 ? 500 : 1000;
  return [Math.floor(min / step) * step, Math.ceil(max / step) * step];
}

function finish(lines: Line[], notIncluded: string[], included?: string, minimum = 0): Estimate {
  const raw = lines.reduce<Range>((sum, l) => add(sum, l.range), [0, 0]);
  const total = roundRange([Math.max(raw[0], minimum), Math.max(raw[1], minimum)]);
  return { lines: lines.map((l) => ({ ...l, range: roundRange(l.range) })), total, notIncluded, included };
}

export function estimateRemont(input: RemontInput): Estimate {
  const area = clampInt(input.area, 10, 250);
  const { level } = input;
  const lines: Line[] = [{ label: `${REMONT_LEVEL_NAMES[level]}, ${area} м²`, range: scale(REMONT_RATES[level], area) }];

  if (input.bathroom !== 'none') {
    const k = level === 'cosmetic' ? 0.5 : 1;
    const name = input.bathroom === 'combined' ? 'Совмещённый санузел' : 'Раздельный санузел';
    lines.push({ label: name, range: scale(BATHROOM[input.bathroom], k) });
  }
  // Capital and turnkey already include demolition; turnkey also includes materials and debris.
  if (input.demolition && level === 'cosmetic') {
    lines.push({ label: 'Снять старую отделку', range: scale([350, 600], area) });
  }
  if (input.materials && level !== 'turnkey') {
    const rate: Range = level === 'cosmetic' ? [800, 1500] : [2500, 4000];
    lines.push({ label: 'Черновые материалы', range: scale(rate, area) });
  }
  if (input.debris && level !== 'turnkey') {
    const r = scale([150, 250], area);
    lines.push({ label: 'Вывоз мусора', range: [Math.max(r[0], 8000), Math.max(r[1], 12000)] });
  }

  const included =
    level === 'turnkey'
      ? 'Демонтаж, черновые материалы, уборка и вывоз мусора уже входят в ремонт под ключ.'
      : level === 'capital'
        ? 'Демонтаж до бетона уже входит в капитальный ремонт.'
        : undefined;
  return finish(lines, ['Чистовые материалы: плитка, ламинат, обои, краска', 'Мебель и бытовая техника'], included);
}

export function estimatePotolki(input: PotolkiInput): Estimate {
  const area = clampInt(input.area, 2, 300);
  const rooms = clampInt(input.rooms, 1, 12);
  const perRoom = area / rooms;
  const rate = FINISH_RATES[input.finish];
  // A small room still needs a full profile and a separate canvas, hence the per-room minimum.
  const canvas: Range = [Math.max(rate[0] * perRoom, 4000) * rooms, Math.max(rate[1] * perRoom, 4500) * rooms];
  const lines: Line[] = [
    { label: `Полотно ${FINISH_NAMES[input.finish]}, ${area} м², комнат: ${rooms}`, range: canvas },
  ];
  const spots = clampInt(input.spots, 0, 80);
  const chandeliers = clampInt(input.chandeliers, 0, 20);
  if (spots) lines.push({ label: `Точечные светильники, ${spots} шт.`, range: scale([600, 900], spots) });
  if (chandeliers) lines.push({ label: `Люстры, ${chandeliers} шт.`, range: scale([500, 800], chandeliers) });
  if (input.shadow) {
    const perimeter = Math.round(rooms * 4.2 * Math.sqrt(perRoom));
    lines.push({ label: `Теневой профиль, около ${perimeter} м`, range: scale([700, 1000], perimeter) });
  }
  return finish(lines, ['Сами светильники и люстры: монтаж посчитан, приборы покупаете вы или мы по чеку'],
    'Замер, стандартный профиль, обход труб и уборка входят в цену.');
}

export function estimateOkna(input: OknaInput): Estimate {
  const counts = {
    regular: clampInt(input.regular, 0, 30),
    triple: clampInt(input.triple, 0, 30),
    balcony: clampInt(input.balcony, 0, 10),
  };
  const k = input.warm ? 1.25 : 1;
  const names = { regular: 'Двустворчатое окно', triple: 'Трёхстворчатое окно', balcony: 'Балконный блок' };
  const lines: Line[] = [];
  for (const key of ['regular', 'triple', 'balcony'] as const) {
    if (counts[key]) {
      lines.push({ label: `${names[key]}, ${counts[key]} шт.`, range: scale(WINDOW_PRICES[key], counts[key] * k) });
    }
  }
  const total = counts.regular + counts.triple + counts.balcony;
  if (total) {
    if (input.slopes) lines.push({ label: `Откосы, ${total} шт.`, range: scale([3500, 5000], total) });
    if (input.sills) lines.push({ label: `Подоконники, ${total} шт.`, range: scale([2000, 3500], total) });
    if (input.nets) lines.push({ label: `Москитные сетки, ${total} шт.`, range: scale([1500, 2500], total) });
  }
  return finish(lines, ['Остекление балкона: считаем отдельно после замера', 'Ремонт стены вокруг проёма, если она разрушена'],
    `${input.warm ? 'Тёплый профиль с энергосберегающим стеклом. ' : ''}Демонтаж, вывоз старых окон, отлив и монтаж с трёхслойным швом входят в цену.`);
}

export function estimateSantehnika(input: SantehnikaInput): Estimate {
  const lines: Line[] = [];
  for (const key of ['mixer', 'toilet', 'installation', 'sink', 'bath', 'shower', 'appliance', 'towel'] as const) {
    const n = clampInt(input[key], 0, 10);
    if (n) lines.push({ label: `${PLUMBING_NAMES[key]}, ${n} шт.`, range: scale(PLUMBING_PRICES[key], n) });
  }
  if (input.piping) lines.push({ label: PLUMBING_NAMES.piping, range: PLUMBING_PRICES.piping });
  return finish(lines, ['Сантехника и смесители: ставим ваши или привозим по чеку', 'Плитка и отделка вокруг'],
    'Выезд и проверка под давлением входят в цену. Минимальный заказ 2 000 ₽.',
    lines.length ? MIN_ORDER : 0);
}

export function estimateElektrika(input: ElektrikaInput): Estimate {
  const lines: Line[] = [];
  if (input.full) {
    const area = clampInt(input.area, 10, 250);
    lines.push({ label: `Замена проводки, ${area} м²`, range: scale(ELECTRIC_PRICES.fullPerM2, area) });
  } else {
    const outlets = clampInt(input.outlets, 0, 60);
    const newPoints = clampInt(input.newPoints, 0, 60);
    if (outlets) lines.push({ label: `Замена розеток и выключателей, ${outlets} шт.`, range: scale(ELECTRIC_PRICES.outlets, outlets) });
    if (newPoints) lines.push({ label: `Новые точки со штроблением, ${newPoints} шт.`, range: scale(ELECTRIC_PRICES.newPoints, newPoints) });
    if (input.panel) lines.push({ label: 'Сборка щитка', range: ELECTRIC_PRICES.panel });
  }
  const spots = clampInt(input.spots, 0, 80);
  const chandeliers = clampInt(input.chandeliers, 0, 20);
  if (spots) lines.push({ label: `Точечные светильники, ${spots} шт.`, range: scale(ELECTRIC_PRICES.spots, spots) });
  if (chandeliers) lines.push({ label: `Люстры и бра, ${chandeliers} шт.`, range: scale(ELECTRIC_PRICES.chandeliers, chandeliers) });
  return finish(lines,
    input.full
      ? ['Сами розетки, выключатели и светильники', 'Заделка штроб под чистовую отделку, если ремонта нет']
      : ['Сами розетки, выключатели и светильники'],
    input.full ? 'Новый щиток с автоматами и УЗО, кабель, подрозетники и акты скрытых работ входят в цену.' : undefined,
    lines.length ? MIN_ORDER : 0);
}
