// Which pages have a map to make ready in Web Mercator, which files hold it, and whether the pages that share a file
// make it the same way (the same frame). Writes nothing; prints a summary.
import { runPage, pages } from './pages.mjs';
const out = { quiz: [], cities: [], none: [], failed: [] };
const frames = new Map(); // map file -> [page, frame]
for (const page of pages()) {
  let P;
  try { P = runPage(page); } catch (e) { out.failed.push(`${page}: ${e.message.split('\n')[0].slice(0, 90)}`); continue; }
  const M = P.ctx.MERCATOR, files = P.scripts.filter((s) => !s.startsWith('quizzes/shared/') && !s.startsWith('assets/'));
  let did = false;
  if (P.QUIZ) {
    const Qz = { ...P.QUIZ, areas: P.QUIZ.areas.map((a) => ({ ...a })), kinds: P.QUIZ.kinds };
    try { did = M.quiz(Qz); } catch (e) { out.failed.push(`${page}: quiz() ${e.message.slice(0, 80)}`); continue; }
    if (did) {
      out.quiz.push(page);
      const f = `${Qz.size[0]}x${Qz.size[1]} k${Qz.proj.k.toFixed(6)} lng0 ${Qz.proj.lng0.toFixed(4)} y0 ${Qz.proj.y0.toFixed(4)} g${Qz.grain}`;
      for (const file of files.filter((x) => /\/(data|provinces|prefs|states|post)\.js$/.test(x))) (frames.get(file) || frames.set(file, []).get(file)).push([page, f]);
    } else if (M.left.length) out.none.push(`${page} (${M.left.join('; ')})`);
  }
  if (P.CITIES && P.CITIES.proj && P.CITIES.proj.type !== 'mercator') { out.cities.push(page + (P.NAMES ? ' +names' : '')); did = true; }
  if (!did && !P.QUIZ && !P.CITIES) out.none.push(page + ' (no map config)');
}
console.log(`area maps made ready: ${out.quiz.length} pages · city maps: ${out.cities.length} pages · failed: ${out.failed.length}`);
console.log('\nfailed:\n' + out.failed.join('\n'));
const split = [...frames].filter(([, l]) => new Set(l.map((x) => x[1])).size > 1);
console.log(`\nmap files shared by pages that frame them differently: ${split.length} of ${frames.size}`);
for (const [file, l] of split) console.log(file + '\n  ' + l.map(([p, f]) => `${p}: ${f}`).join('\n  '));
console.log('\nnot made ready (left as they are):\n' + out.none.filter((x) => !/no map config/.test(x)).join('\n'));
console.log('\nno map config: ' + out.none.filter((x) => /no map config/.test(x)).length + ' pages');
