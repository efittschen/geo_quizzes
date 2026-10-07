// Russia M Highways: config for ../shared/area-quiz.js, on the federal-subject map of ../russia-codes.
// See a federal М route number (blue route plate 6.14.1) and click every region the route runs through.
//
// Routes and their spurs ("подъезды"): the list of federal roads (Government decree No. 928 of 17.11.2010 as amended,
// incl. decree No. 1830 of 01.11.2023: М-7 shortened to Kazan, М-12 extended to Yekaterinburg and Tyumen), via the
// Russian Wikipedia list of federal roads. Regions crossed: OpenStreetMap route relations of each road (ODbL), a region
// counting when at least 5 km of the route's ways lie in it (geoBoundaries ADM1), checked against the route articles.
// Additions/removals against OSM: М-5 also runs in Saratov Oblast (its spur to Saratov, per the decree); М-12 also runs
// in Tyumen Oblast (ex-Р-351, per decree 1830; not yet tagged М-12 in OSM); OSM's М-7 bypass of Ivanovo is left out
// (Ivanovo is not among М-7's spurs in the current decree). Moscow city counts only where the route runs 5 km or more
// in it (М-3 through New Moscow, М-11); every route starts at the MKAD.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const ROUTES = {
  'М-1': { n: 'Беларусь', via: 'Москва — граница с Белоруссией', r: ['MOS', 'SMO'] },
  'М-2': { n: 'Крым', via: 'Москва — Тула — Орёл — Курск — Белгород — граница с Украиной', r: ['MOS', 'TUL', 'ORL', 'KRS', 'BEL'] },
  'М-3': { n: 'Украина', via: 'Москва — Калуга — Брянск — граница с Украиной', r: ['MOW', 'MOS', 'KLU', 'BRY', 'KRS'] },
  'М-4': { n: 'Дон', via: 'Москва — Воронеж — Ростов-на-Дону — Краснодар — Новороссийск', r: ['MOS', 'TUL', 'LIP', 'VOR', 'ROS', 'KDA', 'AD'] },
  'М-5': { n: 'Урал', via: 'Москва — Рязань — Пенза — Самара — Уфа — Челябинск', r: ['MOS', 'RYA', 'MO', 'PNZ', 'SAR', 'ULY', 'SAM', 'ORE', 'TA', 'BA', 'CHE', 'SVE'], x: 'Spurs: Saransk, Saratov, Ulyanovsk, Orenburg, Orsk, Yekaterinburg' },
  'М-7': { n: 'Волга', via: 'Москва — Владимир — Нижний Новгород — Казань', r: ['MOS', 'VLA', 'NIZ', 'CU', 'TA'], x: 'Kazan–Ufa: М-7 until 2023' },
  'М-8': { n: 'Холмогоры', via: 'Москва — Ярославль — Вологда — Архангельск', r: ['MOS', 'VLA', 'YAR', 'VLG', 'ARK'] },
  'М-9': { n: 'Балтия', via: 'Москва — Волоколамск — граница с Латвией', r: ['MOS', 'TVE', 'PSK'] },
  'М-10': { n: 'Россия', via: 'Москва — Тверь — Великий Новгород — Санкт-Петербург', r: ['MOS', 'TVE', 'NGR', 'LEN'] },
  'М-11': { n: 'Нева', via: 'Москва — Санкт-Петербург', r: ['MOW', 'MOS', 'TVE', 'NGR', 'LEN', 'SPE'], x: 'Toll motorway' },
  'М-12': { n: 'Восток', via: 'Москва — Казань — Екатеринбург — Тюмень', r: ['MOS', 'VLA', 'NIZ', 'CU', 'TA', 'BA', 'PER', 'SVE', 'TYU'], x: 'Opened 2023–2025 · ex-М-7, Р-242, Р-351' },
};
const IDS = Object.keys(ROUTES);
const routesAt = a => IDS.filter(id => ROUTES[id].r.includes(a));
const WEST = ['М-1', 'М-3', 'М-9', 'М-10', 'М-11'];

const QUIZ = {
  key: 'ruhighways',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.fd })),
  borders: DATA.fd,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 45, labelScale: 0.3, fly: { pad: 1.6, min: 1 / 30 },
  hintLabel: 'Color by federal district',
  hintsDefault: false,
  exploreKind: 'routes',
  explore: a => ({ code: routesAt(a).join(' ') || '–', title: R[a].n, sub: routesAt(a).map(id => `${id} «${ROUTES[id].n}»`) }),
  rounds: [
    { kind: 'routes', label: 'West & Northwest', sub: 'М-1, М-3, М-9, М-10, М-11', ids: WEST },
    { kind: 'routes', label: 'South & East', sub: 'М-2, М-4, М-5, М-7, М-8, М-12', ids: IDS.filter(id => !WEST.includes(id)) },
    { kind: 'routes', label: 'All М routes' },
  ],
  kinds: [
    {
      key: 'routes', label: 'М routes', sub: `${IDS.length} federal routes`, noun: ['route', 'routes'], pickTitle: 'Routes to practice',
      groups: [{ title: 'Federal М routes', sub: '', ids: IDS }],
      areasOf: id => ROUTES[id].r, clickAll: true, flashArea: true,
      primary: a => routesAt(a)[0],
      short: id => id, name: id => `${id} «${ROUTES[id].n}»`,
      about: id => [ROUTES[id].via, ...(ROUTES[id].x ? [ROUTES[id].x] : [])],
      clicked: a => routesAt(a).length ? `${R[a].n} (${routesAt(a).join(', ')})` : R[a].n,
      prompt: 'text', text: id => ({ text: id.replace('-', ''), lang: 'ru', cls: 'plate' }),
      chip: id => id, chipTitle: id => `«${ROUTES[id].n}» · ${ROUTES[id].via}`,
    },
  ],
};
