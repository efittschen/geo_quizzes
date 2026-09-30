// Australia Phone Numbers: config for ../shared/area-quiz.js. An Australian landline's area code (02, 03, 07, 08) plus
// the first two digits of the local number puts it in one of 55 regions (ACMA charging districts). Every real prefix
// counts: the classic ones from the pre-1990s area codes (02 49 was Newcastle's (049)) and the newer ranges that reuse
// the same regions (02 40/41 are Newcastle too). Questions show just those digits, e.g. "(02) 49·· ····", picking one
// of the region's prefixes at random. Easier modes ask for the first digit, or only the area code.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const REGION_IDS = DATA.reg.map(r => r.id).sort((a, b) => R[a].lab.localeCompare(R[b].lab));
const AREA_CODES = [...new Set(DATA.reg.map(r => r.k[0][0]))].sort();
const pick = a => a[Math.random() * a.length | 0];
const regionsWith = p => REGION_IDS.filter(id => R[id].k.some(k => k.startsWith(p)));
const names = ids => ids.map(id => R[id].nm).join('; ');
const shuffled = a => a.map(x => [Math.random(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

// First-digit zones: area code + first local digit, from every real prefix, newer ranges included, so a zone can
// span regions far apart ((02) 3 is the Central Coast, Goulburn, Tamworth and Wagga Wagga). Digits that lead to the same
// regions are one zone (Sydney's 7, 8 and 9 are "(02) 7/8/9").
const ZONE_OF = {}, ZONES = [];
for (const p of [...new Set(DATA.reg.flatMap(r => r.k.map(k => k.slice(0, 2))))].sort()) {
  const key = regionsWith(p).join(',');
  const z = ZONES.find(z => z.key === key && z.code === p[0]);
  if (z) z.digits.push(p[1]); else ZONES.push({ id: p, code: p[0], digits: [p[1]], key });
}
for (const z of ZONES) ZONE_OF[z.id] = z;
// Zones are colored in their area code's shades (the same ones the regions use), so the hint keeps meaning "area code".
const shadesOf = areas => [0, 1, 2, 3].map(i => `var(--au${R[areas[0]].k[0][0]}${i})`);
const zoneLabel = id => `(0${ZONE_OF[id].code}) ${ZONE_OF[id].digits.join('/')}`;
const zoneRegions = id => ZONE_OF[id].digits.flatMap(d => regionsWith(ZONE_OF[id].code + d)).filter((x, i, a) => a.indexOf(x) === i);

// Dial parts: the digits that matter in bold, the rest of the number as dots.
const dial = (code, digits, rest) => [['(0', 'cold'], [code, 'hot'], [') ', 'cold'], ...(digits ? [[digits, 'hot']] : []), [rest, 'cold']];

const QUIZ = {
  key: 'aupre',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: `${r.k[0][0]}-${r.sh}` })),
  borders: DATA.ent,
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 50, labelScale: 0.25, fly: { pad: 1.6, min: 1.5 / 50 },
  geo: GEO,
  street: { bounds: [[-43.7, 113], [-10.6, 153.7]], maxBounds: [[-50, 95], [0, 170]] },
  hintLabel: 'Color by area code',
  exploreKind: 'two',
  explore: id => ({ code: R[id].lab, title: R[id].nm, sub: [R[id].st.join(', ') + (R[id].also.length ? ` · also ${R[id].also.join(', ')}` : ''), R[id].hubs.join(', ')] }),
  rounds: [
    { kind: 'areacode', label: 'Area codes only', sub: '02, 03, 07, 08' },
    { kind: 'one', label: 'First digit', sub: 'Area code plus one digit' },
    { kind: 'two', label: 'New South Wales & ACT', sub: '(02) numbers', groups: ['(02)'] },
    { kind: 'two', label: 'All regions' },
  ],
  kinds: [
    {
      key: 'two', label: 'Two digits', sub: `${REGION_IDS.length} regions`, noun: ['region', 'regions'], pickTitle: 'Regions to practice',
      groups: AREA_CODES.map(c => ({ title: `(0${c})`, sub: '', ids: REGION_IDS.filter(id => R[id].k[0][0] === c) })),
      presets: [
        { label: '10 random', ids: () => shuffled(REGION_IDS).slice(0, 10) },
        { label: '25 random', ids: () => shuffled(REGION_IDS).slice(0, 25) },
      ],
      areasOf: id => [id],
      short: id => R[id].lab, name: id => R[id].lab,
      about: id => [R[id].nm + (R[id].also.length ? ` · also ${R[id].also.join(', ')}` : ''), R[id].hubs.join(', ')],
      clicked: area => `${R[area].lab} · ${R[area].nm}`,
      prompt: 'dial', dial: id => { const k = pick(R[id].k); return dial(k[0], k.slice(1), '·· ····'); },
      detail: { label: 'Show state', text: id => R[id].st.join(' / ') },
      chip: id => R[id].lab, chipTitle: id => R[id].nm,
    },
    {
      key: 'one', label: 'First digit', sub: `${ZONES.length} zones`, noun: ['zone', 'zones'], pickTitle: 'Zones to practice',
      groups: AREA_CODES.map(c => ({ title: `(0${c})`, sub: '', ids: ZONES.filter(z => z.code === c).map(z => z.id) })),
      areasOf: zoneRegions,
      short: zoneLabel, name: zoneLabel,
      about: id => names(zoneRegions(id)),
      clicked: area => `${R[area].lab} · ${R[area].nm}`,
      prompt: 'dial', dial: id => dial(ZONE_OF[id].code, pick(ZONE_OF[id].digits), '··· ····'),
      unitColors: shadesOf,
      chip: zoneLabel, chipTitle: id => names(zoneRegions(id)),
    },
    {
      key: 'areacode', label: 'Area code only', sub: 'Beginner', noun: ['area code', 'area codes'], pickTitle: 'Area codes to practice',
      groups: [{ title: 'Area codes', sub: '', ids: AREA_CODES }],
      areasOf: c => REGION_IDS.filter(id => R[id].k[0][0] === c),
      short: c => `(0${c})`, name: c => `(0${c})`,
      about: c => [...new Set(DATA.reg.filter(r => r.k[0][0] === c).flatMap(r => r.st))].join(', '),
      clicked: area => `${R[area].lab} · ${R[area].nm}`,
      prompt: 'dial', dial: c => dial(c, '', '···· ····'),
      hints: false, // coloring by area code would give the answer away
      unitColors: areas => [shadesOf(areas)[1]],
      chip: c => `(0${c})`, chipTitle: c => [...new Set(DATA.reg.filter(r => r.k[0][0] === c).flatMap(r => r.st))].join(', '),
    },
  ],
};
