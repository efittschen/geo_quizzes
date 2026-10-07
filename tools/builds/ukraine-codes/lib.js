const fs = require('fs'), vm = require('vm');
const REPO = require('path').resolve(__dirname, '../../../..'); // this folder is tools/cache/builds/ukraine-codes
function loadConst(file, name) { const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(file, 'utf8') + `\nthis.__v = ${name};`, ctx); return ctx.__v; }
const GEO = loadConst(REPO + '/quizzes/ukraine-codes/geo.js', 'GEO');
const UA = loadConst(REPO + '/quizzes/ukraine-codes/names.js', 'UA');
function inRing(r, lat, lng) { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [y0, x0] = r[i], [y1, x1] = r[j]; if ((y0 > lat) !== (y1 > lat) && lng < (x1 - x0) * (lat - y0) / (y1 - y0) + x0) c = !c; } return c; }
function oblastAt(lat, lng) { // kyiv and sevastopol first (they sit inside/next to others)
  for (const id of ['kyiv', 'sevastopol', ...Object.keys(GEO).filter(k => k !== 'kyiv' && k !== 'sevastopol')]) { let c = false; for (const r of GEO[id].rings) if (inRing(r, lat, lng)) c = !c; if (c) return id; }
  return null;
}
module.exports = { GEO, UA, oblastAt, loadConst, REPO, inRing };
