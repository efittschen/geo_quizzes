// Land units (Stats NZ SA2 2026; SA2s that straddle calling areas are replaced by their meshblocks 2026) -> local
// calling area (LICA). Lookup, not geometry:
//   1. One NZ's indicative calling-area map: its border lines are barriers on a ~1 km land grid, its markers are seeds;
//   2. exchange towns (Wikipedia "List of dialling codes in New Zealand"), each with the LICA its number ranges have in
//      the NAD register, are seeds too (GeoNames position);
//   3. every land cell goes to the seed reached first without crossing a border line; a unit takes the LICA of most of
//      its cells; the unit's area code (earlier build of the five-code map) is enforced.
import fs from 'node:fs';
const D = decodeURIComponent(new URL('./', import.meta.url).pathname); // this folder: scripts, inputs, downloads and intermediates
const OLD = D + 'old/'; // units.geojson of the earlier five-code build
let units = JSON.parse(fs.readFileSync(OLD + 'units.geojson', 'utf8')).features;
const LCA = JSON.parse(fs.readFileSync(D + 'onenz_lca.json', 'utf8'));
const REN = { 'Chevoit': 'Cheviot', 'Culverden/Waiau/Hamner Springs': 'Culverden', 'Franz Josef Glacier': 'Franz Josef', 'Golden Bay': 'Takaka', 'Kapiti': 'Paraparaumu',
  'Kiakoura': 'Kaikoura', 'Marlborough': 'Blenheim', 'Morrinsville / Te Aroha': 'Morrinsville', 'Mt. Cook': 'Mt Cook', 'Otautua': 'Otautau', 'Otorohonga': 'Otorohanga',
  'Silverdale': 'Hibiscus Coast', 'South Wairarapa': 'Featherston', 'Tokoroa / Putaruru': 'Putaruru/Tokoroa', 'Wanganui': 'Whanganui', 'Bulls': 'Marton' };
for (const l of LCA) l.lica = REN[l.name] || l.name;
const reg = JSON.parse(fs.readFileSync(D + 'nad_geo.json', 'utf8')); // [area code, code, carrier, status, lica]
const AC = {};
for (const r of reg) if (r[3] === 'assigned' && r[4] && r[4] !== 'Not In Use') { if (AC[r[4]] && AC[r[4]] !== r[0]) throw new Error('two codes ' + r[4]); AC[r[4]] = r[0]; }
const CHAT = 'Waitangi (Chatham Is.)';
const NAMES = Object.keys(AC).sort(), IDX = Object.fromEntries(NAMES.map((n, i) => [n, i]));

// meshblocks replace the SA2s they were fetched for
const polysOf = g => g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
if (fs.existsSync(D + 'mb')) {
  const bySa2 = {}; for (const u of units) (bySa2[u.properties.sa2.replace(/[NS]$/, '')] ??= []).push(u);
  const WATER = new Set(['Inlet', 'Oceanic', 'Inland Water', 'Other']);
  const seen = new Set(), add = [];
  for (const f of fs.readdirSync(D + 'mb')) for (const x of JSON.parse(fs.readFileSync(D + 'mb/' + f, 'utf8')).features) {
    const p = x.properties, sa2 = p.SA22026_V1_00; if (!x.geometry || WATER.has(p.LANDWATER_NAME) || seen.has(p.MB2026_V1_00) || !bySa2[sa2] || sa2 === '187000') continue;
    seen.add(p.MB2026_V1_00);
    const src = bySa2[sa2][0].properties;
    add.push({ type: 'Feature', properties: { sa2: sa2 + ':' + p.MB2026_V1_00, name: src.name, ta: src.ta, rc: src.rc, code: src.code, of: sa2 }, geometry: x.geometry });
  }
  const gone = new Set(add.map(a => a.properties.of));
  units = units.filter(u => !gone.has(u.properties.sa2)).concat(add);
  console.log('meshblocks:', add.length, 'for', gone.size, 'SA2s; units now', units.length);
}

// grid
const LAT0 = -34.2, LAT1 = -47.5, LNG0 = 166.2, LNG1 = 178.8, DY = 0.009, DX = 0.012; // ~1 km
const H = Math.ceil((LAT0 - LAT1) / DY), W = Math.ceil((LNG1 - LNG0) / DX);
const row = lat => Math.floor((LAT0 - lat) / DY), col = lng => Math.floor((lng - LNG0) / DX);
const cellUnit = new Int32Array(W * H).fill(-1);
const unitCells = units.map(() => []);
const cent = units.map(u => { let best = null, bA = -1; for (const p of polysOf(u.geometry)) { const r = p[0]; let A = 0, cx = 0, cy = 0; for (let i = 0; i < r.length - 1; i++) { const c = r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; A += c; cx += (r[i][0] + r[i + 1][0]) * c; cy += (r[i][1] + r[i + 1][1]) * c; } if (Math.abs(A) > bA) { bA = Math.abs(A); best = [cx / (3 * A), cy / (3 * A)]; } } return best; });
const isChat = u => u.properties.ta === 'Chatham Islands Territory';
units.forEach((u, ui) => {
  if (isChat(u)) return;
  for (const p of polysOf(u.geometry)) {
    let y0 = 90, y1 = -90; for (const [, y] of p[0]) { if (y < y0) y0 = y; if (y > y1) y1 = y; }
    for (let r = Math.max(0, row(y1)); r <= Math.min(H - 1, row(y0)); r++) {
      const lat = LAT0 - (r + 0.5) * DY, xs = [];
      for (const ring of p) for (let i = 0; i < ring.length - 1; i++) { const [xa, ya] = ring[i], [xb, yb] = ring[i + 1]; if ((ya > lat) !== (yb > lat)) xs.push(xa + (lat - ya) / (yb - ya) * (xb - xa)); }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let c = Math.max(0, Math.ceil((xs[k] - LNG0) / DX - 0.5)); c <= Math.min(W - 1, Math.floor((xs[k + 1] - LNG0) / DX - 0.5)); c++) { cellUnit[r * W + c] = ui; unitCells[ui].push(r * W + c); }
    }
  }
});
units.forEach((u, ui) => { if (isChat(u) || unitCells[ui].length) return; const i = row(cent[ui][1]) * W + col(cent[ui][0]); unitCells[ui].push(i); if (cellUnit[i] < 0) cellUnit[i] = ui; });

// barriers
const barrier = new Uint8Array(W * H);
const line = (a, b) => {
  const n = Math.ceil(Math.max(Math.abs(a[0] - b[0]) / DY, Math.abs(a[1] - b[1]) / DX) * 3) + 1;
  let pr = null, pc = null;
  for (let i = 0; i <= n; i++) { const la = a[0] + (b[0] - a[0]) * i / n, ln = a[1] + (b[1] - a[1]) * i / n, r = row(la), c = col(ln);
    if (r < 0 || r >= H || c < 0 || c >= W) continue; barrier[r * W + c] = 1;
    if (pr !== null && pr !== r && pc !== c) barrier[pr * W + c] = 1;
    pr = r; pc = c; }
};
const EXT = 0.04;
for (const l of LCA) { const b = l.border; if (b.length < 2) continue;
  const ext = (p, q) => { const d = Math.hypot(p[0] - q[0], (p[1] - q[1]) * 0.75) || 1; return [p[0] + (p[0] - q[0]) / d * EXT, p[1] + (p[1] - q[1]) / d * EXT / 0.75]; };
  const pts = [ext(b[0], b[1]), ...b, ext(b[b.length - 1], b[b.length - 2])];
  for (let i = 0; i + 1 < pts.length; i++) line(pts[i], pts[i + 1]); }

// seeds
const seeds = []; // { lica, la, ln, what }
for (const l of LCA) seeds.push({ lica: l.lica, la: l.marker[0], ln: l.marker[1], what: 'marker ' + l.name });
const mk = {}; for (const l of LCA) if (l.name !== 'Bulls') mk[l.lica] = l.marker;
const towns = JSON.parse(fs.readFileSync(D + 'towns.json', 'utf8'));
const MANUAL = JSON.parse(fs.readFileSync(D + 'manual_seeds.json', 'utf8')); // [{ town, lica, la, ln, why }]
const SKIP = new Set(JSON.parse(fs.readFileSync(D + 'skip_towns.json', 'utf8')));
const townSeeds = [];
for (const t of towns) {
  if (SKIP.has(t.town + '|' + t.lica)) continue;
  const m = mk[t.lica]; if (!m || t.share < 0.9) continue;
  const c = t.cands.filter(c => c[2] === 'P').map(c => ({ c, d: Math.hypot(c[0] - m[0], (c[1] - m[1]) * 0.75) * 111 })).sort((a, b) => a.d - b.d);
  if (!c.length || c[0].d > 70) continue;
  townSeeds.push({ lica: t.lica, la: c[0].c[0], ln: c[0].c[1], what: 'town ' + t.town, town: t.town, nums: t.nums.join(' ') });
}
for (const s of MANUAL) townSeeds.push({ ...s, what: 'manual ' + s.town });
seeds.push(...townSeeds);

const owner = new Int16Array(W * H).fill(-1);
let q = [];
for (const s of seeds) {
  let r = row(s.la), c = col(s.ln), i = r * W + c;
  if (cellUnit[i] < 0 || barrier[i]) { let best = -1, bd = 1e9; for (let dr = -6; dr <= 6; dr++) for (let dc = -6; dc <= 6; dc++) { const j = (r + dr) * W + c + dc; if (cellUnit[j] >= 0 && !barrier[j] && dr * dr + dc * dc < bd) { bd = dr * dr + dc * dc; best = j; } } if (best < 0) { console.log('seed dropped (no land near):', s.what); continue; } i = best; }
  if (owner[i] >= 0 && owner[i] !== IDX[s.lica]) console.log('seed cell taken:', s.what, s.lica, 'vs', NAMES[owner[i]]);
  if (owner[i] < 0) { owner[i] = IDX[s.lica]; q.push(i); }
}
while (q.length) { const nq = []; for (const i of q) { const c = i % W; for (const j of [i - W, i + W, c > 0 ? i - 1 : -1, c < W - 1 ? i + 1 : -1]) { if (j < 0 || j >= W * H || owner[j] >= 0 || cellUnit[j] < 0 || barrier[j]) continue; owner[j] = owner[i]; nq.push(j); } } q = nq; }
const own2 = Int16Array.from(owner);
q = []; for (let i = 0; i < W * H; i++) if (own2[i] >= 0) q.push(i);
while (q.length) { const nq = []; for (const i of q) { const r = (i / W) | 0, c = i % W; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc; if (rr < 0 || rr >= H || cc < 0 || cc >= W) continue; const j = rr * W + cc; if (own2[j] >= 0) continue; own2[j] = own2[i]; nq.push(j); } } q = nq; }

// unit -> LICA
const out = {};
const tally = units.map((u, ui) => { const t = {}; for (const i of unitCells[ui]) { const n = NAMES[own2[i]]; t[n] = (t[n] || 0) + 1; } return t; });
let mism = [];
units.forEach((u, ui) => {
  if (isChat(u)) { out[u.properties.sa2] = CHAT; return; }
  const t = Object.entries(tally[ui]).sort((a, b) => b[1] - a[1]);
  const ok = t.filter(([n]) => AC[n] === u.properties.code);
  if (ok.length) { out[u.properties.sa2] = ok[0][0]; if (ok[0][0] !== t[0][0]) mism.push([u.properties.sa2, u.properties.name, u.properties.ta, u.properties.code, t[0][0], '->', ok[0][0], '(minor share)']); }
  else out[u.properties.sa2] = null, mism.push([ui]);
});
const done = units.map((u, ui) => out[u.properties.sa2] ? ui : -1).filter(i => i >= 0);
mism = mism.map(m => { if (m.length > 1) return m; const ui = m[0], u = units[ui]; let best = null, bd = 1e9;
  for (const j of done) { if (units[j].properties.code !== u.properties.code || isChat(units[j])) continue; const d = Math.hypot(cent[ui][1] - cent[j][1], (cent[ui][0] - cent[j][0]) * 0.75); if (d < bd) { bd = d; best = j; } }
  const was = Object.entries(tally[ui]).sort((a, b) => b[1] - a[1])[0][0];
  return [u.properties.sa2, u.properties.name, u.properties.ta, u.properties.code, was, '=>', out[units[best].properties.sa2], '(nearest ' + units[best].properties.name + ', ' + (bd * 111).toFixed(0) + ' km)', ui]; });
for (const m of mism) if (typeof m[m.length - 1] === 'number') out[m[0]] = m[6];
// towns are not split: every unit of one urban area or rural settlement (Stats NZ urban rural 2026) takes the LICA
// most of that place's units have
{
  const MU = JSON.parse(fs.readFileSync(D + 'mb_ur.json', 'utf8')); // [mb, sa2, ur, ur name, type]
  const urOfMb = {}, urOfSa2 = {};
  for (const [mb, sa2, ur, name, type] of MU) { if (!/urban area|Rural settlement/.test(type)) continue; urOfMb[mb] = ur + ' ' + name; ((urOfSa2[sa2] ??= {})[ur + ' ' + name] ??= 0); urOfSa2[sa2][ur + ' ' + name]++; }
  const mbCount = {}; for (const [, sa2] of MU) mbCount[sa2] = (mbCount[sa2] || 0) + 1;
  const urOf = u => { const id = u.properties.sa2; if (id.includes(':')) return urOfMb[id.split(':')[1]]; const t = urOfSa2[id.replace(/[NS]$/, '')]; if (!t) return; const [n, c] = Object.entries(t).sort((a, b) => b[1] - a[1])[0]; return c * 2 > mbCount[id.replace(/[NS]$/, '')] ? n : undefined; };
  const URFIX = JSON.parse(fs.readFileSync(D + 'fix_ur.json', 'utf8')); // { place: LICA } where the count is a tie or wrong
  const byUr = {};
  units.forEach((u, ui) => { const ur = urOf(u); if (ur) (byUr[ur] ??= []).push(ui); });
  for (const [ur, list] of Object.entries(byUr)) {
    const t = {}; for (const ui of list) { const k = out[units[ui].properties.sa2]; t[k] = (t[k] || 0) + 1; }
    const e = Object.entries(t).sort((a, b) => b[1] - a[1]); if (e.length < 2) continue;
    if (URFIX[ur.replace(/^\d+ /, '')]) { const w = URFIX[ur.replace(/^\d+ /, '')]; e.sort((a, b) => (b[0] === w) - (a[0] === w)); if (e[0][0] !== w) e.unshift([w, 0]); }
    let moved = 0; for (const ui of list) { const u = units[ui]; if (out[u.properties.sa2] !== e[0][0] && AC[e[0][0]] === u.properties.code) { out[u.properties.sa2] = e[0][0]; moved++; } }
    console.log('urban area kept whole:', ur, '|', e.map(x => x.join(':')).join(' '), '| moved', moved);
  }
}
// fixed overrides by unit id (SA2 or SA2:meshblock)
const FIX = JSON.parse(fs.readFileSync(D + 'fix_units.json', 'utf8'));
for (const [k, v] of Object.entries(FIX)) { let n = 0; for (const u of units) if (u.properties.sa2 === k || u.properties.of === k) { if (AC[v] !== u.properties.code) throw new Error('fix breaks area code ' + k); out[u.properties.sa2] = v; n++; } if (!n) console.log('fix: no unit', k); }
// detached parts: a piece of a calling area cut off from its main body by other areas' land (not an island), with no
// exchange town or marker of its own, goes to the neighbour it touches most (same area code)
for (let pass = 0; pass < 3; pass++) {
  const lab = new Int16Array(W * H).fill(-1); for (let i = 0; i < W * H; i++) if (cellUnit[i] >= 0) lab[i] = IDX[out[units[cellUnit[i]].properties.sa2]];
  const comp = new Int32Array(W * H).fill(-1), comps = [];
  for (let i = 0; i < W * H; i++) { if (lab[i] < 0 || comp[i] >= 0) continue; const id = comps.length, cells = [i]; comp[i] = id;
    for (let h = 0; h < cells.length; h++) { const j = cells[h], r = (j / W) | 0, c = j % W; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc; if (rr < 0 || rr >= H || cc < 0 || cc >= W) continue; const k = rr * W + cc; if (lab[k] === lab[i] && comp[k] < 0) { comp[k] = id; cells.push(k); } } }
    comps.push({ lica: lab[i], cells }); }
  const biggest = {}; for (const c of comps) if (!biggest[c.lica] || c.cells.length > biggest[c.lica].cells.length) biggest[c.lica] = c;
  const seedComp = new Set(seeds.map(s => { const i = row(s.la) * W + col(s.ln); return comp[i] >= 0 && lab[i] === IDX[s.lica] ? comp[i] : -1; }));
  let moved = 0;
  comps.forEach((c, id) => {
    if (biggest[c.lica] === c) return;
    const nbr = {}; for (const j of c.cells) { const cc = j % W; for (const k of [j - W, j + W, cc > 0 ? j - 1 : -1, cc < W - 1 ? j + 1 : -1]) if (k >= 0 && k < W * H && lab[k] >= 0 && lab[k] !== c.lica) nbr[lab[k]] = (nbr[lab[k]] || 0) + 1; }
    const e = Object.entries(nbr).sort((a, b) => b[1] - a[1]); if (!e.length) return; // an island
    if (seedComp.has(id)) { if (c.cells.length > 15) console.log('detached but with its own town, kept:', NAMES[c.lica], c.cells.length, 'km2, in', NAMES[e[0][0]]); return; }
    const us = new Set(c.cells.map(j => cellUnit[j])); let n = 0;
    for (const ui of us) { const u = units[ui]; const inC = unitCells[ui].filter(j => comp[j] === id).length; if (inC * 2 < unitCells[ui].length) continue;
      const to = e.find(([l]) => AC[NAMES[l]] === u.properties.code); if (!to) continue; out[u.properties.sa2] = NAMES[to[0]]; n++; }
    if (n) { moved += n; if (c.cells.length > 15) console.log('detached part', NAMES[c.lica], c.cells.length, 'km2 ->', NAMES[e[0][0]], `(${n} units)`); }
  });
  if (!moved) break;
}
const agg = {}; for (const m of mism) { const k = [m[1], m[2], m[3], m[4], m[5], m[6]].join(' | '); agg[k] = (agg[k] || 0) + 1; }
console.log('area-code mismatches:', mism.length); for (const [k, n] of Object.entries(agg)) console.log('  ', n, 'x', k);
const count = {}, areaOf = {}; units.forEach((u, ui) => { const n = out[u.properties.sa2]; count[n] = (count[n] || 0) + 1; areaOf[n] = (areaOf[n] || 0) + unitCells[ui].length; });
console.log('LICAs with units:', Object.keys(count).length, 'missing:', NAMES.filter(n => !count[n]));
console.log('smallest:', Object.entries(areaOf).sort((a, b) => a[1] - b[1]).slice(0, 12).map(x => x.join(' ')).join(', '));

// town check (all towns, also the ambiguous ones)
const inside = (u, x, y) => { let inn = false; for (const p of polysOf(u.geometry)) for (const ring of p) for (let i = 0; i < ring.length - 1; i++) { const [xa, ya] = ring[i], [xb, yb] = ring[i + 1]; if ((ya > y) !== (yb > y) && x < xa + (y - ya) / (yb - ya) * (xb - xa)) inn = !inn; } return inn; };
const bb = units.map(u => { let b = [1e9, 1e9, -1e9, -1e9]; for (const p of polysOf(u.geometry)) for (const [x, y] of p[0]) { if (x < b[0]) b[0] = x; if (y < b[1]) b[1] = y; if (x > b[2]) b[2] = x; if (y > b[3]) b[3] = y; } return b; });
const unitExact = (la, ln) => { for (let i = 0; i < units.length; i++) if (ln >= bb[i][0] && ln <= bb[i][2] && la >= bb[i][1] && la <= bb[i][3] && inside(units[i], ln, la)) return i; const r = row(la), c = col(ln); for (let k = 0; k <= 3; k++) for (let dr = -k; dr <= k; dr++) for (let dc = -k; dc <= k; dc++) { const j = (r + dr) * W + c + dc; if (cellUnit[j] >= 0) return cellUnit[j]; } return -1; };
let okN = 0; const bad = [], conflictSa2 = new Set();
for (const s of townSeeds) { const ui = unitExact(s.la, s.ln); if (ui < 0) continue; const got = out[units[ui].properties.sa2]; if (got === s.lica) okN++; else { bad.push(`${s.town} | register ${s.lica} | map ${got} | ${units[ui].properties.sa2} ${units[ui].properties.name} (${unitCells[ui].length} km2) | ${s.la},${s.ln} | ${(s.nums || '').slice(0, 30)}`); conflictSa2.add(units[ui].properties.sa2); } }
console.log('town seeds', townSeeds.length, 'in a unit of their LICA', okN); for (const b of bad) console.log('   conflict:', b);

// units still split between areas
const split = [];
units.forEach((u, ui) => { if (isChat(u) || u.properties.of) return; const t = Object.entries(tally[ui]).filter(([n]) => AC[n] === u.properties.code).sort((a, b) => b[1] - a[1]); const tot = t.reduce((s, x) => s + x[1], 0);
  if ((t.length > 1 && t[1][1] >= +(process.env.MINKM || 25) && t[1][1] / tot > 0.12) || conflictSa2.has(u.properties.sa2)) split.push([u.properties.sa2.replace(/[NS]$/, ''), u.properties.name, u.properties.ta, tot, t.map(x => x.join(':')).join(' ')]); });
console.log('SA2s to split by meshblock:', split.length); if (process.env.SHOWSPLIT) for (const s of split) console.log('  ', s.join(' | '));
fs.writeFileSync(D + 'split.json', JSON.stringify([...new Set(split.map(s => s[0]))]));
fs.writeFileSync(D + 'unit_lica.json', JSON.stringify(out));
if (process.env.WRITE) {
  for (const u of units) { u.properties.lica = out[u.properties.sa2]; if (!u.properties.lica) throw new Error('unassigned ' + u.properties.sa2); }
  fs.writeFileSync(D + 'units_lica.geojson', JSON.stringify({ type: 'FeatureCollection', features: units }));
}
if (process.env.PPM) { const hue = i => { const h = (i * 137) % 360, s = 0.55, l = 0.62, a = s * Math.min(l, 1 - l), f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); }; return [f(0), f(8), f(4)]; };
  const buf = Buffer.alloc(W * H * 3); const seedCell = new Set(seeds.map(s => row(s.la) * W + col(s.ln)));
  for (let i = 0; i < W * H; i++) { const u = cellUnit[i]; let c = u < 0 ? [225, 235, 242] : hue(IDX[out[units[u].properties.sa2]]);
    if (u >= 0 && barrier[i]) c = c.map(v => v * 0.55 | 0); if (seedCell.has(i)) c = [0, 0, 0];
    buf[i * 3] = c[0]; buf[i * 3 + 1] = c[1]; buf[i * 3 + 2] = c[2]; }
  fs.writeFileSync(D + 'flood.ppm', Buffer.concat([Buffer.from(`P6\n${W} ${H}\n255\n`), buf])); }
if (process.env.DEBUG) for (const s of seeds) if (process.env.DEBUG.split(',').some(d => s.what.includes(d))) {
  const r = row(s.la), c = col(s.ln), i = r * W + c;
  console.log('DEBUG', s.what, s.lica, 'cell', r, c, 'unit', cellUnit[i] >= 0 ? units[cellUnit[i]].properties.sa2 : -1, 'barrier', barrier[i], 'owner', NAMES[owner[i]], 'own2', NAMES[own2[i]]);
  for (let dr = -4; dr <= 4; dr++) console.log('   ', Array.from({ length: 13 }, (_, k) => { const j = (r + dr) * W + c + k - 6; return barrier[j] ? '####' : cellUnit[j] < 0 ? '~~~~' : (NAMES[owner[j]] || '????').slice(0, 4); }).join(' '));
}
