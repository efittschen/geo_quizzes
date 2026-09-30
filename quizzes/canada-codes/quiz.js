// Canada Area Codes: config for ../shared/area-quiz.js. Each map area has a main code (its id) and overlay
// codes dialed in the same place (Toronto: 416, 647, 437, 942). A few overlays cover two areas (778: the
// Vancouver and Victoria areas), so a code can be answered by clicking any area it rings in.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const BY = {}; // area code -> area ids
for (const r of DATA.reg) for (const k of r.k) (BY[k] ??= []).push(r.id);
const CODES = Object.keys(BY).sort();
const PROVINCE_GROUPS = [...new Set(DATA.reg.map(r => r.st))].sort();
const place = id => `${R[id].ct.join(', ')} (${R[id].st})`;
const sameArea = k => [...new Set(BY[k].flatMap(i => R[i].k))].filter(x => x !== k);

const QUIZ = {
  key: 'cacodes',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.id[0] })),
  borders: DATA.ent,
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 50, labelScale: 0.38, fly: { pad: 1.6, min: 1.5 / 50 },
  geo: GEO,
  street: { bounds: [[41.7, -141], [62, -52.6]], maxBounds: [[35, -175], [85, -40]] },
  hintLabel: 'Color by first digit',
  hintsDefault: false,
  exploreKind: 'codes',
  explore: id => ({
    code: id, title: R[id].ct.join(', '),
    sub: R[id].st + (R[id].k.length > 1 ? ` · also ${R[id].k.slice(1).join(', ')}` : ''),
  }),
  rounds: [
    { kind: 'codes', label: 'Atlantic & the North', groups: ['New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia / Prince Edward Island', 'Yukon / Northwest Territories / Nunavut'] },
    { kind: 'codes', label: 'Quebec', groups: ['Quebec'] },
    { kind: 'codes', label: 'The West', sub: 'British Columbia to Manitoba', groups: ['British Columbia', 'Alberta', 'Saskatchewan', 'Manitoba'] },
    { kind: 'codes', label: 'Ontario', groups: ['Ontario'] },
    { kind: 'codes', label: 'All area codes' },
  ],
  kinds: [
    {
      key: 'codes', labelPerArea: true, clickAll: true, label: 'Area codes', sub: `All ${CODES.length}`, noun: ['code', 'codes'], pickTitle: 'Codes to practice',
      groups: PROVINCE_GROUPS.map(st => ({ title: st, sub: '', ids: CODES.filter(k => BY[k].some(id => R[id].st === st)) })),
      // A click on an area is that area's main code, never an overlay it shares with a neighbour.
      primary: area => area,
      areasOf: k => BY[k],
      short: k => k, name: k => `(${k})`,
      about: k => BY[k].map(place).join('; ') + (sameArea(k).length ? ` · same area: ${sameArea(k).join(', ')}` : ''),
      clicked: area => `(${R[area].k.join(', ')}), ${R[area].ct[0]}`,
      prompt: 'dial',
      detail: { label: 'Show province', text: k => R[BY[k][0]].st },
      chip: k => k, chipTitle: k => BY[k].map(place).join('; '),
      chipClass: k => R[k] ? '' : 'ov',
    },
  ],
};
