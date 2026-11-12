// Every entry of data/site/quizzes.json gets its picture ("icon", after its title; icons.mjs), written as text so
// that nothing else in the file changes. Stops, writing nothing, when an entry has none.
//   node tools/builds/quiz-icons/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { iconOf } from './icons.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const FILE = path.join(ROOT, 'data/site/quizzes.json');
const text = fs.readFileSync(FILE, 'utf8');
const { quizzes } = JSON.parse(text);
const missing = quizzes.filter(q => !iconOf(q));
if (missing.length) { console.error('no picture for: ' + missing.map(q => `${q.id} (${q.title})`).join(', ')); process.exit(1); }

const start = text.indexOf('"quizzes": [');
let n = 0;
const out = text.slice(0, start) + text.slice(start).replace(/\n( +)\{\n\1  "id": "([^"]+)",[\s\S]*?\n\1\}/g, (block, ind, id) => {
  const q = quizzes.find(x => x.id === id);
  const lines = block.split('\n').filter(l => !/^ +"icon": /.test(l));
  const at = lines.findIndex(l => /^ +"title": /.test(l));
  const last = at === lines.length - 2;
  if (last) lines[at] += ',';
  lines.splice(at + 1, 0, `${ind}  "icon": "${iconOf(q)}"${last ? '' : ','}`);
  n++;
  return lines.join('\n');
});
const check = JSON.parse(out).quizzes;
if (check.length !== quizzes.length || check.some(q => !q.icon)) { console.error('the list came out wrong; nothing written'); process.exit(1); }
fs.writeFileSync(FILE, out);
const count = {};
for (const q of check) count[q.icon] = (count[q.icon] || 0) + 1;
console.log(`${n} entries: ` + Object.entries(count).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '));
