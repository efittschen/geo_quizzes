// What every quiz page draws in Firefox once its map is in Web Mercator: the quiz map (areas, borders, size,
// projection), a city map (land, lines, dots) and the town names' (places, 80% areas, grid). Kept per page in
// tools/cache/builds/mercator/<label>/<page>.json.gz, to compare the pages before and after the maps are made ready.
//   node tools/builds/mercator/record.mjs <label> [page…]
import fs from 'node:fs';
import zlib from 'node:zlib';
import { serve, launch, open } from '../../check-lib.mjs';
import { ROOT, pages } from './pages.mjs';
const [label, ...only] = process.argv.slice(2);
if (!label) throw new Error('usage: record.mjs <label> [page…]');
const OUT = `${ROOT}tools/cache/builds/mercator/${label}/`;
fs.mkdirSync(OUT, { recursive: true });
const HOOK = `
;(() => { // (record.mjs: what the page's map ends as)
  const q = MERCATOR.quiz, c = MERCATOR.cities, n = MERCATOR.names;
  MERCATOR.quiz = function (Q) { const r = q.apply(this, arguments); window.__MQ = Q; return r; };
  MERCATOR.cities = function (C) { const r = c.apply(this, arguments); window.__MC = C; return r; };
  MERCATOR.names = function (N) { const r = n.apply(this, arguments); window.__MN = N; return r; };
})();`;
const mercator = fs.readFileSync(ROOT + 'quizzes/shared/mercator.js', 'utf8') + HOOK;
const list = only.length ? only : pages();
const { server, base } = await serve(ROOT);
const b = await launch();
let i = 0, done = 0, failed = [];
async function worker() {
  while (i < list.length) {
    const page = list[i++];
    let ctx;
    try {
      const o = await open(b, null, { viewport: { width: 1280, height: 800 } }); ctx = o.ctx;
      await o.page.route('**/quizzes/shared/mercator.js', (r) => r.fulfill({ body: mercator, contentType: 'text/javascript' }));
      await o.page.goto(`${base}quizzes/${page}/index.html`, { waitUntil: 'load' });
      await o.page.waitForTimeout(600);
      const rec = await o.page.evaluate(() => {
        const Q = window.__MQ, C = window.__MC, N = window.__MN, out = {};
        if (Q) out.quiz = { size: Q.size, proj: Q.proj, kpu: Q.kpu, grain: Q.grain, world: !!Q.world, context: Q.context || null, areas: Q.areas.map(a => [a.id, a.d, a.lx, a.ly, a.a, a.size ?? null]), borders: Q.borders || [] };
        if (C) out.cities = { w: C.w, h: C.h, kpu: C.kpu, proj: C.proj, span: C.span ?? null, world: !!C.world, land: C.land || '', lines: C.lines || '', list: C.list.map(c => [c.id ?? c.n ?? c.name, c.x, c.y]) };
        if (N) out.names = { w: N.w, h: N.h, kpu: N.kpu, gw: N.gw, gh: N.gh, brush: N.brush, counts: Array.from(N.counts || []), parts: N.parts.map(p => [p.x, p.y, p.area || null, p.dot ?? null]) };
        out.errors = [];
        return out;
      });
      rec.errors = o.errors.slice();
      if (rec.quiz || rec.cities || rec.names) fs.writeFileSync(`${OUT}${page}.json.gz`, zlib.gzipSync(JSON.stringify(rec)));
      if (rec.errors.length) failed.push(`${page}: ${rec.errors[0].slice(0, 100)}`);
    } catch (e) { failed.push(`${page}: ${e.message.split('\n')[0].slice(0, 100)}`); }
    finally { if (ctx) await ctx.close().catch(() => {}); done++; if (done % 50 === 0) console.log(`${done}/${list.length}`); }
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
await b.close(); server.close();
console.log(`recorded ${fs.readdirSync(OUT).length} pages into ${OUT}; ${failed.length} with errors`);
if (failed.length) console.log(failed.join('\n'));
