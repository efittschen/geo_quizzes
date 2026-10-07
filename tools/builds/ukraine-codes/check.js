// Every item of every kind has an area; rounds and their sizes.
const fs = require('fs'), vm = require('vm');
const dir = require('path').resolve(__dirname, '../../../../quizzes/ukraine-codes') + '/';
const ctx = {}; vm.createContext(ctx);
vm.runInContext(['fine.js', 'fine-geo.js', 'names.js', 'codes.js', 'quiz.js'].map(f => fs.readFileSync(dir + f, 'utf8')).join('\n') + '\nthis.Q = QUIZ;', ctx);
const Q = ctx.Q, areaIds = new Set(Q.areas.map(a => a.id));
console.log('areas', areaIds.size, 'geo', Object.keys(Q.geo).length, 'missing geo', Q.areas.filter(a => !Q.geo[a.id]).length);
const K = {};
for (const k of Q.kinds) {
  const ids = k.groups.flatMap(g => g.ids); K[k.key] = { ...k, ids };
  const bad = ids.filter(id => { const a = k.areasOf(id); return !a.length || a.some(x => !areaIds.has(x)); });
  const covered = new Set(ids.flatMap(id => k.areasOf(id)));
  console.log(`kind ${k.key}: ${ids.length} items (${new Set(ids).size} distinct), without area: ${bad.length} ${bad.slice(0, 5)}, areas never asked: ${[...areaIds].filter(a => !covered.has(a)).length}`);
  for (const id of ids) { k.short(id); k.name(id); [].concat(k.about(id)); k.chip(id); if (k.chipTitle) k.chipTitle(id); if (k.dial) k.dial(id); if (k.detail) k.detail.text(id); if (k.pin) { const p = k.pin(id); if (!(p.x > 0 && p.y > 0 && p.ll)) console.log('bad pin', id); } }
  for (const a of areaIds) { k.clicked(a); if (k.primary && !ids.includes(k.primary(a))) console.log('primary not an item', k.key, a); }
}
for (const a of areaIds) Q.explore(a);
const sizes = [];
for (const r of Q.rounds) {
  const k = K[r.kind]; let ids = k.ids;
  if (r.groups) { const miss = r.groups.filter(t => !k.groups.some(g => g.title === t)); if (miss.length) console.log('round', r.label, 'unknown groups', miss); ids = k.groups.filter(g => r.groups.includes(g.title)).flatMap(g => g.ids); }
  else if (r.preset) ids = k.presets.find(p => p.label === r.preset).ids;
  else if (r.top) ids = k.rankings[r.rank - 1].order.slice(0, r.top);
  const bad = ids.filter(id => !k.ids.includes(id));
  sizes.push([r.kind, r.label, r.sub || '', ids.length, bad.length ? 'BAD ' + bad : '']);
}
const tier = n => n < 10 ? 'Beginner' : n < 30 ? 'Intermediate' : n < 60 ? 'Hard' : 'Expert';
for (const t of ['Beginner', 'Intermediate', 'Hard', 'Expert']) console.log(t + ':', sizes.filter(s => tier(s[3]) === t).map(s => `${s[1]}${s[2] ? ' (' + s[2] + ')' : ''} ${s[3]}${s[4]}`).join(' | '));
console.log('rounds', sizes.length, 'largest', Math.max(...sizes.map(s => s[3])));
