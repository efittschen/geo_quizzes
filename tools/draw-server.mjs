#!/usr/bin/env node
// draw-server: serves the site and keeps the drawings made in a town-name quiz opened with ?trace.
//
//   node tools/draw-server.mjs [port]        (default 8010)
//   then open http://localhost:8010/quizzes/germany-town-names/index.html?trace
//
// Every finished drawing is added as one line to tools/cache/drawings/<ISO2>.jsonl: the part's label, the strokes
// (x, y in map units, in turn), what the drawing covered and painted, and the same for the best drawing.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, CACHE } from './lib/geo.mjs';

const PORT = +(process.argv[2] || 8010), DIR = path.join(CACHE, 'drawings');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
fs.mkdirSync(DIR, { recursive: true });
http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/__drawing') {
    let body = '';
    req.on('data', d => { body += d; if (body.length > 2e6) req.destroy(); });
    req.on('end', () => {
      try {
        const d = JSON.parse(body);
        if (!/^[A-Z]{2}$/.test(d.iso2) || !Array.isArray(d.strokes)) throw new Error('not a drawing');
        fs.appendFileSync(path.join(DIR, `${d.iso2}.jsonl`), JSON.stringify(d) + '\n');
        console.log(`${d.iso2} ${d.label}: covered ${d.cover}%, painted ${d.painted}%`);
        res.writeHead(204); res.end();
      } catch (e) { res.writeHead(400); res.end(String(e.message)); }
    });
    return;
  }
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log(`http://localhost:${PORT}/quizzes/germany-town-names/index.html?trace`));
