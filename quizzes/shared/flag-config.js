// Region flag quizzes: builds the QUIZ config for ./area-quiz.js from a table of flags, each with the areas of the
// page's map where it is flown. See a flag, click where it flies (or name it from a list, type it, match it in pairs:
// MODES there), the flag flat, waving or hanging (LOOKS there). Two ways to see the flags, each a round box's switch:
// Clear, and Blurred (the picture blurred until answered), each with its own best results and review cards. Rounds:
// one per part of the country, then all flags. A page loads its map (data.js, geo.js), sets FLAGS, then loads this
// file and area-quiz.js:
//   FLAGS = { key, alt, map, parts, items, areaName }
//     key       localStorage prefix
//     alt       what the pictures are ('state flag')
//     map       the map's part of the QUIZ config: { areas, context, geo, proj, kpu, street, size, pad, maxZoom,
//               labelScale, fly } (area-quiz.js); geo, so that mercator.js redraws the map in Web Mercator
//     parts     the parts of the country, in order: a round each
//     items     [[id, name, part, areas, more]] a flag each: its name, its part, the ids of its areas on the map (a
//               flag can share areas with another: Occitanie's cross over the provinces of the south of France);
//               its picture img/<id>.svg (more.file: another file name), its short name on the map (more.short, else
//               its name), what kind of flag it is when its place has more than one (more.what: Bayern's lozenges)
//     areaName, areaCode   an area's own name and code (optional): Explore shows them, the flags below; a click on
//               an area that flies none of the flags names the area
// An area flying several flags names them all when clicked, and shows them all in Explore.

const QUIZ = (() => {
  const F = FLAGS;
  const ITEM = Object.fromEntries(F.items.map(([id, name, part, areas, more = {}]) => [id, { id, name, part, areas, ...more }]));
  const ALL = F.items.map(it => it[0]);
  const AT = {}; // area -> the flags flown there
  for (const id of ALL) for (const a of ITEM[id].areas) (AT[a] ||= []).push(id);
  const DIR = new URL('img/', location.href).href; // the page's own folder
  const flag = (id, cls = '') => ({ src: DIR + (ITEM[id].file || `${id}.svg`), alt: F.alt, label: ITEM[id].name, cls, link: '' });
  const about = id => [ITEM[id].what, ITEM[id].part].filter(Boolean).join(' · ');
  const said = a => (AT[a] ? [...new Set(AT[a].map(id => ITEM[id].name))].join(' · ') : F.areaName ? F.areaName(a) : '');
  const GROUPS = F.parts.map(title => ({ title, sub: '', ids: ALL.filter(id => ITEM[id].part === title) }));
  const kind = (key, label, lang, cls, more = {}) => ({
    key, label, lang, sub: `${ALL.length} flags`, noun: ['flag', 'flags'], pickTitle: 'Flags to practice',
    groups: GROUPS,
    areasOf: id => ITEM[id].areas,
    areaRank: false, hints: false,
    short: id => ITEM[id].short || ITEM[id].name, name: id => ITEM[id].name, about,
    clicked: said,
    prompt: 'photo', photo: id => flag(id, cls),
    modes: ['list', 'type', 'pairs'], looks: true,
    chip: id => ITEM[id].name, chipTitle: id => ITEM[id].what || ITEM[id].part,
    ...more,
  });
  return {
    key: F.key,
    borders: [],
    ...F.map,
    hintLabel: '', hintsDefault: false,
    langsAlways: true, // every round box shows Clear | Blurred
    exploreKind: 'flags',
    explore: a => {
      const flags = AT[a] || [], own = F.areaName && F.areaName(a), names = said(a);
      return { code: F.areaCode ? F.areaCode(a) : [...new Set(flags.map(id => ITEM[id].short || id))].join(' '),
        title: own || names, sub: [own && own !== names ? names : '', ...new Set(flags.map(id => ITEM[id].part))].filter(Boolean), photos: flags.map(id => flag(id)) };
    },
    rounds: [...GROUPS.filter(g => g.ids.length).map(g => ({ kind: 'flags', label: g.title, groups: [g.title] })), { kind: 'flags', label: 'All flags' }],
    kinds: [kind('flags', 'Flags', 'Clear', ''), kind('blurred', 'Blurred flags', 'Blurred', 'blur', { of: 'flags' })],
  };
})();
