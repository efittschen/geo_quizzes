#!/usr/bin/env node
// hints: hint colors for an area quiz's groups, so groups that touch never share a color.
//
//   node tools/hints.mjs --in areas.geojson --group zone [--name "first digit"] --out quizzes/<folder>/style.css
//
// Each feature's properties[--group] is the value the quiz puts in the area's data-g (quiz.js: g). Groups are
// colored greedily, most neighbours first, from the shared palette (--h1…--h24 in shared/area-quiz.css, which
// avoids the answer colors). Writes `.r[data-g="…"]{--hint:var(--hN)}` rules into --out, inside a marked block
// that is replaced on the next run (so several groupings can live in one style.css). Several --group properties
// can be given, comma separated, each getting its own block.
import fs from 'node:fs';
import { parseArgs } from 'node:util';
import { topology } from 'topojson-server';
import { neighbors } from 'topojson-client';
import { readGeoJSON } from './lib/geo.mjs';

const { values: o } = parseArgs({ options: { in: { type: 'string' }, group: { type: 'string', default: 'id' }, out: { type: 'string' }, name: { type: 'string' } } });
if (!o.in || !o.out) { console.error('usage: hints --in areas.geojson --group <property> --out style.css'); process.exit(1); }
const fc = readGeoJSON(o.in);
const topo = topology({ a: fc }, 1e5);
const nb = neighbors(topo.objects.a.geometries);
const PAL = 24;
let css = fs.existsSync(o.out) ? fs.readFileSync(o.out, 'utf8') : '';

for (const prop of o.group.split(',').map(s => s.trim())) {
  const key = i => String(fc.features[i].properties[prop]);
  const adj = {};
  fc.features.forEach((f, i) => { adj[key(i)] ??= new Set(); for (const j of nb[i]) if (key(j) !== key(i)) adj[key(i)].add(key(j)); });
  const groups = Object.keys(adj).sort((a, b) => adj[b].size - adj[a].size || a.localeCompare(b));
  const color = {}, used = Array(PAL).fill(0);
  for (const g of groups) {
    const taken = new Set([...adj[g]].map(n => color[n]).filter(c => c !== undefined));
    const free = [...Array(PAL).keys()].filter(i => !taken.has(i));
    const pick = (free.length ? free : [...Array(PAL).keys()]).sort((a, b) => used[a] - used[b] || a - b)[0];
    color[g] = pick; used[pick]++;
  }
  const clash = groups.filter(g => [...adj[g]].some(n => color[n] === color[g])).length;
  const rules = groups.sort().map(g => `.r[data-g="${g.replace(/"/g, '\\"')}"]{--hint:var(--h${color[g] + 1})}`);
  const label = o.name || prop;
  const block = `/* hints: ${label} (tools/hints.mjs) */\n${rules.join(' ')}\n/* end hints: ${label} */`;
  const re = new RegExp(`/\\* hints: ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\(tools/hints\\.mjs\\) \\*/[\\s\\S]*?/\\* end hints: [^*]*\\*/`);
  css = re.test(css) ? css.replace(re, block) : (css ? css.trimEnd() + '\n' : '') + block + '\n';
  console.log(`${label}: ${groups.length} groups, ${clash ? clash + ' with a same-colored neighbour' : 'no neighbouring groups share a color'}`);
}
fs.writeFileSync(o.out, css);
