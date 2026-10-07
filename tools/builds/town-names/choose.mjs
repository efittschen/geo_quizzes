#!/usr/bin/env node
// choose: the parts of town names the quizzes ask, picked over all countries at once.
//   node tools/builds/town-names/choose.mjs [--fresh]      (from the repository root; --fresh: export the places again)
//
// Per country (countries.mjs): places.mjs, then ratio.py (Python 3 with numpy, scipy and matplotlib in
// tools/cache/pyenv: python3 -m venv tools/cache/pyenv && tools/cache/pyenv/bin/pip install numpy scipy matplotlib),
// one after the other (ratio.py uses every core); their files and logs in tools/cache/builds/town-names/ratio/.
// Then, of the parts ratio.py keeps in all countries, the TOP with the highest split x share (split: how cleanly the
// part divides its country into where it is and where it is not, see ratio.py; share: how many of the country's
// towns have it, i.e. how often it comes up) -> tools/cache/builds/town-names/chosen.json, read by build.mjs:
//   { ISO2: [{ label, n, split, share, cover, painted, area }] }, best first; cover and painted: what the part's 80%
//   area (the smallest area holding 80% of its smoothed towns) holds of its towns and of all towns, which the quiz
//   grades a drawing against; area: that area's outline (rings of x, y on the quiz map), which the quiz draws.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ROOT, CACHE } from '../../lib/geo.mjs';
import { ISO2 } from './countries.mjs';

const TOP = 500, HERE = path.dirname(fileURLToPath(import.meta.url)), DIR = path.join(CACHE, 'builds', 'town-names', 'ratio');
const PY = path.join(ROOT, 'tools', 'cache', 'pyenv', 'bin', 'python'), FRESH = process.argv.includes('--fresh');
if (!fs.existsSync(PY)) { console.error(`no ${path.relative(ROOT, PY)}: see the top of this file`); process.exit(1); }
fs.mkdirSync(DIR, { recursive: true });
const run = (cmd, args, log) => { const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 }); fs.appendFileSync(log, (r.stdout || '') + (r.stderr || '')); return r.status === 0; };

const kept = [];
for (const [slug, cc] of Object.entries(ISO2)) {
  if (!fs.existsSync(path.join(ROOT, 'quizzes', `${slug}-cities`, 'cities.js'))) continue;
  const places = path.join(DIR, `${cc}.places.json`), out = path.join(DIR, `${cc}.json`), log = path.join(DIR, `${cc}.log`), t0 = Date.now();
  fs.writeFileSync(log, '');
  const ok = (!FRESH && fs.existsSync(places) || run(process.execPath, ['--max-old-space-size=8192', path.join(HERE, 'places.mjs'), slug, cc, places], log)) && run(PY, ['-u', path.join(HERE, 'ratio.py'), places, out], log);
  if (!ok) { console.log(`${slug}: failed, see ${path.relative(ROOT, log)}`); continue; }
  const towns = JSON.parse(fs.readFileSync(out, 'utf8')).towns, mine = JSON.parse(fs.readFileSync(out.replace(/\.json$/, '.all.json'), 'utf8')).filter(p => p.kept);
  for (const p of mine) kept.push({ cc, label: p.l, n: p.n, split: p.split, share: p.n / towns, cover: p.aim_cover, painted: p.aim_painted, area: p.area });
  console.log(`${slug}: ${mine.length} kept of ${towns.toLocaleString('en')} towns (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
}
const top = kept.sort((a, b) => b.split * b.share - a.split * a.share).slice(0, TOP), chosen = {};
for (const { cc, ...p } of top) (chosen[cc] ||= []).push(Object.fromEntries(Object.entries(p).map(([k, v]) => [k, typeof v === 'number' && !Number.isInteger(v) ? +v.toFixed(4) : v])));
fs.writeFileSync(path.join(CACHE, 'builds', 'town-names', 'chosen.json'), JSON.stringify(chosen));
console.log(`\n${kept.length} parts kept in all; the ${top.length} best: ` + Object.entries(chosen).sort((a, b) => b[1].length - a[1].length).map(([cc, v]) => `${cc} ${v.length}`).join(', '));
