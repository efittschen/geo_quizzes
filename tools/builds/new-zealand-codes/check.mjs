import fs from 'node:fs';
const Qd = decodeURIComponent(new URL('../../../../quizzes/new-zealand-codes/', import.meta.url).pathname);
const src = ['data.js', 'geo.js', 'quiz.js'].map(f => fs.readFileSync(Qd + f, 'utf8')).join('\n');
const { QUIZ, DATA, GEO, P_AREA, P_MAIN } = new Function(src + ';return { QUIZ, DATA, GEO, P_AREA, P_MAIN };')();
const areaIds = new Set(QUIZ.areas.map(a => a.id));
let bad = 0;
for (const k of QUIZ.kinds) {
  const ids = k.groups.flatMap(g => g.ids);
  if (new Set(ids).size !== ids.length) { console.log('duplicate ids in', k.key); bad++; }
  const covered = new Set();
  for (const id of ids) {
    const a = k.areasOf(id);
    if (!a.length || a.some(x => !areaIds.has(x))) { console.log('NO AREA', k.key, id); bad++; }
    a.forEach(x => covered.add(x));
    const d = k.dial(id).map(p => p[0]).join('');
    if (!/^\(0\d\) [\d·]{3} [\d·]{4}$/.test(d)) { console.log('bad dial', k.key, id, JSON.stringify(d)); bad++; }
    for (const f of ['short', 'name', 'chip', 'chipTitle']) if (typeof k[f](id) !== 'string' || !k[f](id)) { console.log('bad', f, k.key, id); bad++; }
    const ab = k.about(id); if (![].concat(ab).every(s => typeof s === 'string' && s)) { console.log('bad about', k.key, id, ab); bad++; }
  }
  console.log(k.key, 'items', ids.length, 'areas covered', covered.size, 'of', areaIds.size, '| groups', k.groups.map(g => g.title + ':' + g.ids.length).join(' '));
}
for (const a of QUIZ.areas) { if (!GEO[a.id]) { console.log('no geo', a.id); bad++; } for (const k of QUIZ.kinds) if (typeof k.clicked(a.id) !== 'string') bad++; const e = QUIZ.explore(a.id); if (!e.code || !e.title) bad++; }
// rounds
for (const r of QUIZ.rounds) { const K = QUIZ.kinds.find(k => k.key === r.kind); let ids = K.groups.flatMap(g => g.ids);
  if (r.groups) { const miss = r.groups.filter(t => !K.groups.some(g => g.title === t)); if (miss.length) { console.log('round group missing', r.label, miss); bad++; } ids = K.groups.filter(g => r.groups.includes(g.title)).flatMap(g => g.ids); }
  if (r.top) ids = K.rankings[r.rank - 1].order.slice(0, r.top);
  console.log('round', r.label.padEnd(26), ids.length, r.top ? ids.map(i => K.name(i)).join(', ') : ''); }
// every block can be asked and leads back to its area: check the prefix tables
let blocks = 0, w = 0; for (const r of DATA.reg) for (const c of r.k) { blocks++; const hit = P_AREA[r.id].find(([p]) => c.startsWith(p)); if (!hit) { console.log('block without prefix', r.id, c); bad++; } }
for (const [id, list] of Object.entries(P_AREA)) for (const [p] of list) for (const r of DATA.reg) if (r.id !== id && r.code === DATA.reg.find(x => x.id === id).code && r.k.some(c => c.startsWith(p))) { console.log('prefix not unique', id, p, r.id); bad++; }
for (const [id, list] of Object.entries(P_MAIN)) for (const [p] of list) for (const r of DATA.reg) if (r.main !== id && r.code === DATA.reg.find(x => x.id === id).code && r.k.some(c => c.startsWith(p))) { console.log('main prefix not unique', id, p, r.id); bad++; }
console.log('blocks', blocks, 'problems', bad);
const A = QUIZ.kinds[2], Mk = QUIZ.kinds[1];
for (const id of ['christchurch', 'gore', 'edendale', 'kaikoura', 'twizel', 'maungaturoto', 'cheviot', 'auckland', 'wellington', 'paraparaumu', 'invercargill', 'waitangi-chatham']) console.log(' ', A.name(id), '|', A.about(id).join(' | '), '|', [1, 2, 3, 4].map(() => A.dial(id).map(p => p[0]).join('')).join('  '));
for (const id of ['m-christchurch', 'm-wellington', 'm-invercargill', 'm-hamilton', 'm-warkworth', 'm-rotorua']) console.log(' ', Mk.name(id), '|', Mk.about(id).join(' | '), '|', [1, 2, 3].map(() => Mk.dial(id).map(p => p[0]).join('')).join('  '));
console.log(JSON.stringify(A.dial('gore')), JSON.stringify(QUIZ.kinds[0].dial('3')));
console.log(QUIZ.explore('gore'), QUIZ.explore('rotorua'), A.clicked('wellington'));
