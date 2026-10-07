// out/data.js + out/geo.js (tools/geo2quiz.mjs) + the register -> quizzes/new-zealand-codes/data.js, geo.js
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { topology } = require('topojson-server');
const { neighbors } = require('topojson-client');
const D = decodeURIComponent(new URL('./', import.meta.url).pathname); // this folder: scripts, inputs, downloads and intermediates
const Q = decodeURIComponent(new URL('../../../../quizzes/new-zealand-codes/', import.meta.url).pathname);
const load = (f, v) => new Function(fs.readFileSync(f, 'utf8') + `;return ${v}`)();
const DATA = load(D + 'out/data.js', 'DATA'), GEO = load(D + 'out/geo.js', 'GEO');
const r1 = v => Math.round(v * 10) / 10;

// display names (Stats NZ spellings); the register writes them without macrons
const NM = { 'Whangarei': 'Whangārei', 'Kaitaia': 'Kaitāia', 'Maungaturoto': 'Maungatūroto', 'Otorohanga': 'Ōtorohanga', 'Putaruru/Tokoroa': 'Putāruru/Tokoroa', 'Te Kuiti': 'Te Kūiti', 'Waihi': 'Waihī',
  'Whangamata': 'Whangamatā', 'Taupo': 'Taupō', 'Whakatane': 'Whakatāne', 'Opotiki': 'Ōpōtiki', 'Ruatoria': 'Ruatōria', 'Hawera': 'Hāwera', 'Opunake': 'Ōpunake', 'Ohakune': 'Ōhakune', 'Waiouru': 'Waiōuru',
  'Takaka': 'Tākaka', 'Kaikoura': 'Kaikōura', 'Wanaka': 'Wānaka', 'Otautau': 'Ōtautau', 'Te Anau': 'Te Ānau', 'Mt Cook': 'Aoraki/Mount Cook', 'Waitangi (Chatham Is.)': 'Chatham Islands' };

// register: every assigned block of a local calling area
const reg = JSON.parse(fs.readFileSync(D + 'nad_geo.json', 'utf8')); // [area code, code, carrier, status, lica]
const K = {}; let notInUse = 0, blocks = 0;
for (const [ac, code, , st, lica] of reg) { if (st !== 'assigned' || !lica) continue; if (lica === 'Not In Use') { notInUse++; continue; } (K[lica] ??= []).push(code); blocks++; }

// shades: neighbours get different ones (4 per area code family)
const fc = JSON.parse(fs.readFileSync(D + 'lica_inset.geojson', 'utf8'));
const topo = topology({ a: fc }, 1e5), nb = neighbors(topo.objects.a.geometries);
const ids = fc.features.map(f => f.properties.id), sh = {};
// only neighbours with the same area code share a color family, so only they need different shades (DSATUR, backtracking)
const codeOf = fc.features.map(f => f.properties.code);
const adj = nb.map((l, i) => l.filter(j => codeOf[j] === codeOf[i]));
const col = new Array(ids.length).fill(-1); let steps = 0;
const solve = left => { if (!left) return true; if (++steps > 2e6) throw new Error('coloring: too many steps');
  let best = -1, bs = -1, bd = -1;
  for (let i = 0; i < ids.length; i++) { if (col[i] >= 0) continue; const s = new Set(adj[i].map(j => col[j]).filter(c => c >= 0)).size; if (s > bs || (s === bs && adj[i].length > bd)) { best = i; bs = s; bd = adj[i].length; } }
  const used = new Set(adj[best].map(j => col[j]));
  const count = [0, 1, 2, 3].map(c => col.filter(x => x === c).length);
  for (const c of [0, 1, 2, 3].sort((x, y) => count[x] - count[y])) { if (used.has(c)) continue; col[best] = c; if (solve(left - 1)) return true; } col[best] = -1; return false; };
if (!solve(ids.length)) throw new Error('no 4-coloring');
ids.forEach((id, i) => sh[id] = col[i]);
console.log('coloring steps', steps);

// Chatham Islands: inset frame on the map, true position on the street map
const bbox = d => { const t = d.match(/[MmLlZz]|-?(?:\d+\.?\d*|\.\d+)/g); let x = 0, y = 0, mode = 'M', b = [1e9, 1e9, -1e9, -1e9];
  for (let i = 0; i < t.length;) { if (/[A-Za-z]/.test(t[i])) { mode = t[i++]; continue; } const a = +t[i], c = +t[i + 1]; i += 2;
    if (mode === 'm' || mode === 'l') { x += a; y += c; } else { x = a; y = c; } if (mode === 'M') mode = 'L'; if (mode === 'm') mode = 'l';
    b = [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)]; } return b; };
const chat = DATA.reg.find(r => r.id === 'waitangi-chatham');
const B = bbox(chat.d), p = 14;
DATA.inset = `M${r1(B[0] - p)},${r1(B[1] - p)}H${r1(B[2] + p)}V${r1(B[3] + p)}H${r1(B[0] - p)}Z`;
{ const g = GEO[chat.id]; g.rings = g.rings.map(ring => ring.map(([la, ln]) => [Math.round((la + 1.5) * 1e3) / 1e3, Math.round((ln + 7) * 1e3) / 1e3])); g.lab = [Math.round((g.lab[0] + 1.5) * 1e4) / 1e4, Math.round((g.lab[1] + 7) * 1e4) / 1e4]; }

DATA.reg = DATA.reg.map(r => { if (!K[r.lica]) throw new Error('no blocks ' + r.lica); return { id: r.id, nm: NM[r.lica] || r.lica, lica: r.lica, code: r.code, main: r.main, sh: sh[r.id], k: K[r.lica].sort(), d: r.d, lx: r.lx, ly: r.ly, a: r.a }; });
delete DATA.ctx;
const missing = Object.keys(K).filter(l => !DATA.reg.some(r => r.lica === l)); if (missing.length) throw new Error('areas missing: ' + missing);
fs.writeFileSync(Q + 'data.js', `// New Zealand local calling areas (LICAs) of the NAD number register, one map area each: nm (name), lica (the register's
// spelling), code (area code), main (id of its main calling area, NAD "LICA Areas"), sh (hint shade), k (every number
// block assigned to it in the register, ${blocks} in all: the three or four digits after the area code; three digits =
// 10,000 numbers, four = 1,000; export of 2 October 2026; the ${notInUse} blocks the register lists as "Not In Use" have no
// place and are left out). Areas: Stats NZ statistical area 2 (2026) land areas, and meshblocks (2026) where an SA2
// straddles calling areas (CC BY 4.0), merged and simplified. Which calling area a unit belongs to is approximate:
// looked up on One NZ's indicative calling-area map (its border lines and markers) and from the exchange towns of
// Wikipedia's "List of dialling codes in New Zealand" (their number ranges checked against the register); the five
// area codes keep the borders of ../new-zealand-regions/data.js. ${DATA.w}x${DATA.h} map units, kpu = kilometres per map
// unit. The Chatham Islands are drawn as an inset (inset: its frame) south-east of the South Island; geo.js has their
// true position.
const DATA = ${JSON.stringify(DATA)};\n`);
fs.writeFileSync(Q + 'geo.js', `// Street-map rings [lat, lng] for the areas in data.js (same simplification; Chatham Islands at their true position)
const GEO = ${JSON.stringify(GEO)};\n`);
console.log('areas', DATA.reg.length, 'blocks', blocks, 'not in use (left out)', notInUse, 'inset', DATA.inset);
for (const f of ['data.js', 'geo.js']) console.log(f, (fs.statSync(Q + f).size / 1024).toFixed(0), 'KB');
const cnt = {}; for (const r of DATA.reg) cnt[r.code + '-' + r.sh] = (cnt[r.code + '-' + r.sh] || 0) + 1; console.log(cnt);
