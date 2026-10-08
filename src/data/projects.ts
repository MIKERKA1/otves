// Demo cases. Photos: immo RENOVATION on Unsplash (Unsplash License), a real renovation in Switzerland
// used as illustration. Tasks, prices, durations and reviews are invented for the portfolio.
import type { ImageMetadata } from 'astro';
import type { ServiceId } from './pricing.ts';
import type { Range } from '../lib/format.ts';
import bathBefore from '../assets/photos/bath-before.jpg';
import bathTiling from '../assets/photos/bath-tiling.jpg';
import bathAfter from '../assets/photos/bath-after.jpg';
import bathSink from '../assets/photos/bath-sink.jpg';
import showerTiling from '../assets/photos/shower-tiling.jpg';
import showerAfter from '../assets/photos/shower-after.jpg';
import showerDetail from '../assets/photos/shower-detail.jpg';
import stairsBefore from '../assets/photos/stairs-before.jpg';
import stairsAfter from '../assets/photos/stairs-after.jpg';
import livingRoom from '../assets/photos/living-room.jpg';
import roomWiring from '../assets/photos/room-wiring.jpg';
import socketBox from '../assets/photos/socket-box.jpg';
import roomAfter from '../assets/photos/room-after.jpg';
import kitchenDuring from '../assets/photos/kitchen-during.jpg';
import kitchenAfter from '../assets/photos/kitchen-after.jpg';
import kitchenDetail from '../assets/photos/kitchen-detail.jpg';
import wcAfter from '../assets/photos/wc-after.jpg';

export type Stage = 'Было' | 'В процессе' | 'Стало';

export interface Project {
  id: string;
  title: string;
  services: ServiceId[];
  task: string;
  done: string[];
  materials: string[];
  area?: string;
  duration: string;
  cost: Range;
  result: string;
  cover: { src: ImageMetadata; alt: string };
  photos: { src: ImageMetadata; alt: string; stage: Stage }[];
  review: { text: string; author: string };
}

export const projects: Project[] = [
  {
    id: 'vannaya-s-oknom',
    title: 'Ванная с окном, переделанная с нуля',
    services: ['remont', 'santehnika', 'elektrika'],
    task: 'Старая ванная: сырые стены, трубы замурованы в штукатурку, одна розетка без заземления.',
    done: [
      'Сняли отделку до кирпича и вынесли старую ванну',
      'Развели воду и канализацию заново, под две раковины',
      'Сделали гидроизоляцию пола и стен в мокрой зоне',
      'Выложили плитку с узором за раковинами, остальное покрасили влагостойкой краской',
      'Поставили полотенцесушитель и влагозащищённые розетки',
    ],
    materials: ['Цементная плитка с узором', 'Влагостойкая краска', 'Полипропиленовые трубы', 'Обмазочная гидроизоляция', 'Столешница из дуба'],
    area: '7 м²',
    duration: '5 недель',
    cost: [410000, 460000],
    result: 'Две раковины под окном, сухие стены и розетки там, где нужны фен и бритва.',
    cover: { src: bathAfter, alt: 'Ванная после ремонта: две раковины на дубовой столешнице, плитка с узором, окна' },
    photos: [
      { src: bathBefore, alt: 'Ванная до ремонта: стены сняты до кирпича, торчат трубы', stage: 'Было' },
      { src: bathTiling, alt: 'Укладка плитки с узором поверх подготовленной стены', stage: 'В процессе' },
      { src: bathAfter, alt: 'Готовая ванная с двумя раковинами под окнами', stage: 'Стало' },
      { src: bathSink, alt: 'Раковина на дубовой столешнице на фоне плитки', stage: 'Стало' },
    ],
    review: {
      text: 'Боялась, что после вскрытия стен начнётся «а тут надо ещё». Не началось: итог совпал со сметой.',
      author: 'Ирина К., ванная 7 м²',
    },
  },
  {
    id: 'dush-bez-poddona',
    title: 'Душ без поддона вместо ванны',
    services: ['remont', 'santehnika'],
    task: 'Заменить старую ванну душем вровень с полом, чтобы не перешагивать бортик.',
    done: [
      'Подняли пол и сделали уклон к трапу',
      'Сделали гидроизоляцию с лентой в углах и на стыках',
      'Выложили крупный керамогранит с системой выравнивания',
      'Встроили нишу для бутылок и скрытый смеситель',
    ],
    materials: ['Керамогранит 60×120', 'Линейный трап', 'Встраиваемый смеситель', 'Гидроизоляционная лента'],
    area: '4 м²',
    duration: '12 дней',
    cost: [190000, 230000],
    result: 'Душ без бортика, вода уходит в трап и не растекается по ванной.',
    cover: { src: showerAfter, alt: 'Душевая зона без поддона, отделанная тёмным керамогранитом' },
    photos: [
      { src: showerTiling, alt: 'Укладка крупной плитки с зажимами системы выравнивания', stage: 'В процессе' },
      { src: showerAfter, alt: 'Готовая душевая зона с нишей и стеклянной перегородкой', stage: 'Стало' },
      { src: showerDetail, alt: 'Тропический душ и ниша для бутылок в тёмной плитке', stage: 'Стало' },
    ],
    review: {
      text: 'Душ без поддона хотели давно, но все отговаривали. Здесь показали уклон на чертеже и сделали.',
      author: 'Андрей и Оксана, душевая 4 м²',
    },
  },
  {
    id: 'gostinaya-s-lestnitsey',
    title: 'Гостиная с лестницей',
    services: ['remont', 'elektrika'],
    task: 'Обновить гостиную в двухуровневой квартире, не повредив лестницу и камин.',
    done: [
      'Укрыли лестницу и камин защитным полотном на всё время работ',
      'Выровняли и покрасили стены',
      'Положили паркет из дуба',
      'Сделали подсветку ступеней и настенные светильники',
    ],
    materials: ['Паркетная доска, дуб', 'Шпаклёвка и интерьерная краска', 'Светодиодная подсветка ступеней'],
    area: '38 м²',
    duration: '6 недель',
    cost: [520000, 590000],
    result: 'Светлая гостиная, тёплый пол из дуба и лестница без единой царапины.',
    cover: { src: stairsAfter, alt: 'Гостиная после ремонта: лестница с подсветкой ступеней, камин и паркет' },
    photos: [
      { src: stairsBefore, alt: 'Гостиная во время ремонта: лестница и камин укрыты защитным полотном', stage: 'Было' },
      { src: stairsAfter, alt: 'Та же гостиная после ремонта', stage: 'Стало' },
      { src: livingRoom, alt: 'Вид на гостиную с паркетом и окнами в сад', stage: 'Стало' },
    ],
    review: {
      text: 'Лестницу укрыли так, что после ремонта на ней ни царапины. Фото присылали каждый вечер.',
      author: 'Павел Д., гостиная 38 м²',
    },
  },
  {
    id: 'komnata-provodka',
    title: 'Комната с новой проводкой',
    services: ['elektrika', 'remont'],
    task: 'В комнате две розетки на старой алюминиевой проводке, удлинители по всему полу.',
    done: [
      'Проложили новый медный кабель от щитка отдельной линией',
      'Поставили восемь розеток там, где стоит мебель и техника',
      'Заделали штробы и выровняли стены',
      'Покрасили акцентную стену',
    ],
    materials: ['Медный кабель ВВГнг-LS', 'Автомат и УЗО в щитке', 'Интерьерная краска'],
    area: '16 м²',
    duration: '9 дней',
    cost: [95000, 120000],
    result: 'Удлинители убраны, автомат больше не выбивает.',
    cover: { src: roomAfter, alt: 'Комната после ремонта: синяя стена, паркет, окна в пол' },
    photos: [
      { src: roomWiring, alt: 'Штроба под новый кабель на стене до отделки', stage: 'В процессе' },
      { src: socketBox, alt: 'Подрозетник с выведенными проводами', stage: 'В процессе' },
      { src: roomAfter, alt: 'Готовая комната с покрашенной стеной', stage: 'Стало' },
    ],
    review: {
      text: 'Думал, проводку в одной комнате не поменять без ремонта всей квартиры. Оказалось, можно.',
      author: 'Сергей Т., комната 16 м²',
    },
  },
  {
    id: 'kuhnya-podgotovka',
    title: 'Кухня: вода и розетки под новый гарнитур',
    services: ['santehnika', 'elektrika'],
    task: 'Гарнитур заказали у мебельщиков. Нужно было подготовить воду, слив и розетки точно по их схеме.',
    done: [
      'Укрыли мебель плёнкой и защитили пол',
      'Вывели воду и канализацию под мойку и посудомойку',
      'Провели отдельные линии под духовку и варочную панель',
      'Сделали подсветку рабочей зоны',
    ],
    materials: ['Медный кабель 6 мм² под варочную панель', 'Полипропиленовые трубы', 'Светодиодная лента'],
    area: '12 м²',
    duration: '6 дней',
    cost: [68000, 85000],
    result: 'Мебельщики поставили гарнитур с первого раза: всё совпало до сантиметра.',
    cover: { src: kitchenAfter, alt: 'Белая кухня с тёмной столешницей и встроенной техникой' },
    photos: [
      { src: kitchenDuring, alt: 'Кухня во время работ: мебель укрыта плёнкой', stage: 'В процессе' },
      { src: kitchenAfter, alt: 'Готовая кухня со встроенной техникой', stage: 'Стало' },
      { src: kitchenDetail, alt: 'Столешница и подсветка рабочей зоны', stage: 'Стало' },
    ],
    review: {
      text: 'Кухню ставила другая фирма, а здесь подготовили воду и розетки по их схеме. Сошлось с первого раза.',
      author: 'Елена В., кухня 12 м²',
    },
  },
  {
    id: 'podvesnoy-unitaz',
    title: 'Подвесной унитаз за один день',
    services: ['santehnika'],
    task: 'Заменить старый напольный унитаз подвесным, не перекладывая всю плитку.',
    done: ['Смонтировали инсталляцию в нише', 'Закрыли нишу влагостойким гипсокартоном и плиткой', 'Повесили унитаз и кнопку смыва'],
    materials: ['Инсталляция для подвесного унитаза', 'Влагостойкий гипсокартон', 'Плитка из запаса клиента'],
    duration: '1 день',
    cost: [9000, 12000],
    result: 'Пол под унитазом свободен, убирать стало проще.',
    cover: { src: wcAfter, alt: 'Подвесной унитаз на фоне плитки с узором' },
    photos: [{ src: wcAfter, alt: 'Подвесной унитаз и кнопка смыва на фоне плитки с узором', stage: 'Стало' }],
    review: {
      text: 'Позвонила в обед, мастер пришёл на следующий день и за четыре часа всё сделал.',
      author: 'Ольга М., санузел',
    },
  },
];
