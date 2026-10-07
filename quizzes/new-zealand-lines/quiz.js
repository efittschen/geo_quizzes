// New Zealand Lines Companies: config for ../shared/area-quiz.js. Each map area is an Electricity Authority network
// reporting region (2016) served by one of the 29 electricity distribution businesses; some companies serve several
// (Powerco, Unison Networks, Aurora Energy, Vector). Names are the companies' current trading names (Counties Power is
// now Counties Energy, Eastland Network Firstlight Network, Horizon Energy Horizon Networks, Electricity Ashburton
// EA Networks). Great Barrier, Little Barrier and Stewart Island are on no company's network.

const R = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
const slug = s => 'co-' + s.toLowerCase().replace(/[^a-z]+/g, '-');
const COS = [...new Set(DATA.reg.map(r => r.co).filter(Boolean))];
const CO = Object.fromEntries(COS.map(c => [slug(c), c]));
// Network reporting regions 1–23 (and Great/Little Barrier) are in the North Island, 24–39 (and Stewart Island) in the South.
const north = r => /^n(\d+|GBI|LBI)$/.test(r.id) && (isNaN(+r.id.slice(1)) || +r.id.slice(1) <= 23);
const islandOf = c => DATA.reg.some(r => r.co === c && north(r)) ? 'North Island' : 'South Island';
const areasOf = id => DATA.reg.filter(r => r.co === CO[id]).map(r => r.id);
const networks = id => areasOf(id).map(a => R[a].area).join(', ');
const byName = (a, b) => CO[a].localeCompare(CO[b], 'en');

const QUIZ = {
  key: 'nzlines',
  areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: r.co || 'none' })),
  borders: [],
  context: DATA.ctx,
  size: [DATA.w, DATA.h], pad: 16, maxZoom: 40, labelScale: 0.22, fly: { pad: 1.6, min: 1.5 / 40 },
  geo: GEO,
  street: { bounds: [[-47.4, 166.3], [-34.3, 178.7]], maxBounds: [[-55, 155], [-28, 190]] },
  hintLabel: 'Color each company',
  exploreKind: 'lines',
  explore: id => ({ code: R[id].co || '–', title: R[id].area, sub: R[id].co ? islandOf(R[id].co) : 'No lines company' }),
  rounds: [
    { kind: 'lines', label: 'North Island', groups: ['North Island'] },
    { kind: 'lines', label: 'South Island', groups: ['South Island'] },
    { kind: 'lines', label: 'All lines companies' },
  ],
  kinds: [
    {
      key: 'lines', label: 'Lines companies', sub: `All ${COS.length}`, noun: ['company', 'companies'], pickTitle: 'Companies to practice',
      groups: ['North Island', 'South Island'].map(t => ({ title: t, sub: '', ids: COS.filter(c => islandOf(c) === t).map(slug).sort(byName) })),
      areasOf,
      short: id => CO[id], name: id => CO[id],
      about: id => networks(id),
      clicked: a => R[a].co ? `${R[a].co} (${R[a].area})` : R[a].area,
      prompt: 'name',
      chip: id => CO[id], chipTitle: networks,
    },
  ],
};
