import { withBase } from '../lib/url.ts';

export const site = {
  name: 'Отвес',
  slogan: 'Делаем ровно',
  title: 'Отвес: ремонт квартир, потолки, окна, сантехника и электрика',
  description:
    'Демо-сайт вымышленной ремонтной компании: ремонт квартир, натяжные потолки, окна, сантехника и электрика одной командой, с ценой до начала работ.',
  // +7 (000) is not an assigned Russian code, so the demo number cannot ring a real person.
  phone: { display: '+7 (000) 123-45-67', href: 'tel:+70001234567' },
  email: 'hello@otves.example',
  hours: 'Ежедневно с 9 до 21',
  area: 'Выезжаем по городу и пригородам',
} as const;

export const nav = [
  { href: withBase('/#uslugi'), label: 'Услуги' },
  { href: withBase('/#raschet'), label: 'Цены' },
  { href: withBase('/#raboty'), label: 'Работы' },
  { href: withBase('/#etapy'), label: 'Как работаем' },
  { href: withBase('/#voprosy'), label: 'Вопросы' },
] as const;

export const legalLinks = [
  { href: withBase('/privacy/'), label: 'Политика конфиденциальности' },
  { href: withBase('/terms/'), label: 'Условия использования' },
  { href: withBase('/cookies/'), label: 'Политика cookie' },
  { href: withBase('/data/'), label: 'Ваши данные и их удаление' },
] as const;
