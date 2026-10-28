// The answer log: every answer given in a quiz, in an ordinary round or a review, whatever the way to answer (on the
// map, List, Type, Pairs, Pick, Type code, Draw; a city quiz's dots or its map by distance; a town-name painting): when,
// where and how it was given, how long it took, and what was given instead. The review page's Stats (stats.js) and a
// quiz page's My stats (quizzes/shared/area-stats.js) are worked out from it.
//
// It is kept in this browser in IndexedDB (database "geoquizzes", store "log"), since it only grows. A page hands an
// answer over (add) and goes on: answers are written some seconds later, several at once, so that the rating of a
// replay, which comes after its answer (area-review.js), is in it (graded, called by srs.js). Answers not yet written
// when a page closes wait in localStorage ("geoquizzes.answers") until the next page opens, which writes them.
//
// The log is in chunks, each a browser's answers of one day: id "<browser>.<yyyymmdd>.<part>", the browser being a
// random id of its own (store "meta", "device"), a new part after PART answers. Only the browser a chunk is named after
// adds to it, so of two copies of a chunk the longer one holds the other, and the logs of two browsers together are
// the union of their chunks: an answer is never counted twice. A chunk: { id, t0, s, n, a, sent }
//   t0     the day's start (midnight there, ms)
//   s      the texts its answers refer to, by their place in it: quiz ids, layers, items, maps, modes, typed texts
//   n      what its items and layers are called, as their quiz says them: { "<quiz>.<layer>.<item>" or "<quiz>.<layer>"
//          (places in s): name }
//   a      the answers, an array each, its parts after `ms` only as far as there is something:
//          [t, quiz, layer, item, look, mode, f, r, ms, g, iv, v, ...given]
//            t       seconds after t0
//            quiz, layer, item, look, mode   places in s: the quiz page (its folder), the layer (the kind, without its
//                    mode), the item, the map it was answered on ("quiz", "overlay", "street", "bare", "sat", "free", with a
//                    city quiz's background after a "+"), and how ("map", "list", "type", "pairs", "pick",
//                    "pickback", "code", "draw", "paint")
//            f       1 in a review, 2 a replay (asked again after a miss: later in the review, or in a Retry round),
//                    4 its card was still in its learning steps
//            r       the tries: 0 right at once, 1 and 2 right at the second and third, 3 missed (the answer shown,
//                    out of time, a drawing or painting under its bar); by distance: 4,000 points or more, 2,500,
//                    1,000, fewer
//            ms      how long it took
//            g       the rating its card got (srs.js: 0 not known, 1 unsure, 2 known, 3 instantly; a replay's by hand)
//            iv      minutes from then until the card was due again
//            v       a drawing's share (%), a painting's score, or by distance [points, km]
//            given   what was given instead, places in s: an item of the layer, or a text typed (with a " before it)
//   sent   how many of its answers the online copy has (this browser's own note, not sent)
// About 30 characters an answer. The online copy keeps each chunk under "quiz._log.<id>" (see sync.js); the data
// file holds them as `answers` (see store.js).

const ANSWERS = (() => {
  const NAME = 'geoquizzes', LOG = 'log', META = 'meta';
  const PART = 500; // answers in a chunk's part (some 15,000 characters: a sheet's cell holds 50,000)
  const WAIT = 6000; // ms an answer waits before it is written (a replay is rated within 4 s)
  const KEEP = 120000; // ms within which a rating finds its answer
  const SPILL = 'geoquizzes.answers', SYNCED = 'quiz._log.', ID = /^[a-z0-9]+\.\d{8}\.\d+$/;

  /* ---------- the database ---------- */
  let db = null, broken = false;
  const open = () => db ||= new Promise((done, fail) => {
    const r = indexedDB.open(NAME, 1);
    r.onupgradeneeded = () => { const d = r.result; for (const s of [LOG, META]) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, s === LOG ? { keyPath: 'id' } : undefined); };
    r.onsuccess = () => done(r.result);
    r.onerror = () => { broken = true; fail(r.error); };
  });
  const req = r => new Promise((done, fail) => { r.onsuccess = () => done(r.result); r.onerror = () => fail(r.error); });
  // f(log, meta) inside one transaction (its requests chained by await); resolves with its result once written.
  async function tx(mode, f) {
    const t = (await open()).transaction([LOG, META], mode);
    const end = new Promise((done, fail) => { t.oncomplete = done; t.onerror = t.onabort = () => fail(t.error); });
    const [out] = await Promise.all([f(t.objectStore(LOG), t.objectStore(META)), end]);
    return out;
  }
  const heard = [];
  const tell = why => { for (const f of heard) f(why); }; // why: 'written' (answers given here), 'taken' (from elsewhere)

  /* ---------- writing ---------- */
  // A local day as "yyyymmdd", and its start.
  const two = n => String(n).padStart(2, '0');
  const dayOf = ms => { const d = new Date(ms); return `${d.getFullYear()}${two(d.getMonth() + 1)}${two(d.getDate())}`; };
  const startOf = day => new Date(+day.slice(0, 4), +day.slice(4, 6) - 1, +day.slice(6)).getTime();
  let device = null, timer = 0, writing = Promise.resolve();
  const parts = {}; // '<browser>.<day>.' -> the part written last
  let pending = []; // answers not written yet, as add takes them
  const early = new Map(); // ratings that came before their answer: '<quiz>|<card kind>|<item>' -> { g, iv, step, t }

  // An answer as a chunk keeps it (see above): its texts are put in s as they come.
  function row(c, ix, a) {
    const at = x => { let i = ix.get(x); if (i === undefined) { i = c.s.push(x) - 1; ix.set(x, i); } return i; };
    const q = at(a.quiz), k = at(a.kind);
    const out = [Math.round((a.at - c.t0) / 1000), q, k, at(a.item), at(a.look), at(a.mode), a.f, a.r, Math.max(0, Math.round(a.ms || 0)), a.g ?? null, a.iv ?? null, a.v ?? null, ...(a.given || []).map(at)];
    while (out[out.length - 1] == null) out.pop();
    for (const [id, name] of Object.entries(a.names || {})) { const key = `${q}.${k}.${at(String(id))}`; if (name && !(key in c.n)) c.n[key] = name; }
    if (a.layer && !(`${q}.${k}` in c.n)) c.n[`${q}.${k}`] = a.layer;
    return out;
  }
  function write(list) {
    return tx('readwrite', async (log, meta) => {
      device ||= await req(meta.get('device'));
      if (!device) { device = Math.random().toString(36).slice(2, 10).padEnd(8, '0'); meta.put(device, 'device'); }
      const byDay = new Map();
      for (const a of list) { const d = dayOf(a.at); (byDay.get(d) || byDay.set(d, []).get(d)).push(a); }
      for (const [day, answers] of byDay) {
        const pre = `${device}.${day}.`;
        let part = parts[pre] ?? Math.max(0, ...(await req(log.getAllKeys(IDBKeyRange.bound(pre, pre + '￿')))).map(k => +k.slice(pre.length)));
        let c = null, ix = null;
        const next = async () => { // the part being filled: the first one with room (another tab may have filled one)
          for (;;) {
            c = (await req(log.get(pre + part))) || { id: pre + part, t0: startOf(day), s: [], n: {}, a: [], sent: 0 };
            if (c.a.length < PART) { ix = new Map(c.s.map((x, i) => [x, i])); return; }
            part++;
          }
        };
        await next();
        for (const a of answers) {
          if (c.a.length >= PART) { log.put(c); part++; await next(); }
          c.a.push(row(c, ix, a));
        }
        log.put(c); parts[pre] = part;
      }
    });
  }
  // Writes the answers that have waited long enough (all: every one), after those being written.
  function flush(all = false) {
    clearTimeout(timer); timer = 0;
    const now = Date.now(), ready = all ? pending : pending.filter(a => now - a.at >= WAIT);
    pending = pending.filter(a => !ready.includes(a));
    if (ready.length) writing = writing.then(() => write(ready)).then(() => tell('written'), () => {});
    if (pending.length) timer = setTimeout(() => flush(), WAIT);
    return writing;
  }

  // An answer: { at, quiz, kind, item, look, mode, review, replay, r, ms, v, given, names: { item: name }, layer: the
  // layer's name, card: '<card kind>|<item>' (the card it counts for, see area-review.js) }.
  function add(a) {
    if (broken || !a || !a.quiz || a.item == null) return;
    const e = { at: a.at || Date.now(), quiz: a.quiz, kind: a.kind, item: String(a.item), look: a.look || '', mode: a.mode || 'map',
      f: (a.review ? 1 : 0) | (a.replay ? 2 : 0), r: a.r, ms: a.ms, v: a.v, given: (a.given || []).filter(x => x != null && x !== '').map(String), names: a.names, layer: a.layer, card: a.card ? `${a.quiz}|${a.card}` : null };
    const it = e.card && early.get(e.card);
    if (it && it.t >= e.at - (e.ms || 0) - 1000) { rate(e, it); early.delete(e.card); }
    pending.push(e);
    if (!timer) timer = setTimeout(() => flush(), WAIT);
  }
  // A card answered (srs.js, after its schedule changed): its rating goes with the answer it was for, whether that
  // comes before (a review's first answer) or after (a replay rated by hand). step: the card was in its learning steps.
  function graded(quiz, key, g, card, step) {
    const bar = key.indexOf('|'), at = key.lastIndexOf('@', bar), join = `${quiz}|${key.slice(0, at >= 0 ? at : bar)}|${key.slice(bar + 1)}`;
    const now = Date.now(), it = { g, iv: card && card.d ? Math.max(0, Math.round((card.d - now) / 6e4)) : null, step: !!step, t: now };
    for (const [k, v] of early) if (now - v.t > KEEP) early.delete(k);
    const a = [...pending, ...spilled].reverse().find(a => a.card === join && now - a.at < KEEP);
    if (!a) { early.set(join, it); return; }
    rate(a, it);
    if (spilled.includes(a)) spill();
  }
  // (an answer graded twice, a miss then a rating: the card's state is the one before the first)
  const rate = (a, it) => { if (!a.rated && it.step) a.f |= 4; a.rated = true; a.g = it.g; a.iv = it.iv; };

  // A page closing: the answers not written go to localStorage, at once; the next page to open writes them. (A rating
  // given as it closes, after this, is put with its answer there.)
  let spilled = [], before = null;
  function spill() {
    clearTimeout(timer); timer = 0;
    if (before === null) { try { before = JSON.parse(localStorage.getItem(SPILL)) || []; } catch (e) { before = []; } }
    spilled.push(...pending); pending = [];
    if (spilled.length) try { localStorage.setItem(SPILL, JSON.stringify([...before, ...spilled].slice(-5000))); } catch (e) {}
  }
  function unspill() {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(SPILL)) || []; localStorage.removeItem(SPILL); } catch (e) {}
    spilled = []; before = null;
    if (Array.isArray(list) && list.length) { pending.push(...list.filter(a => a && a.quiz && a.at)); flush(true); }
  }

  /* ---------- reading ---------- */
  const chunks = () => (broken ? Promise.resolve([]) : tx('readonly', log => req(log.getAll())).catch(() => []));
  const decoded = a => ({ review: !!(a.f & 1), replay: !!(a.f & 2), learning: !!(a.f & 4), r: a.r, ms: a.ms, g: a.g ?? null, iv: a.iv ?? null, v: a.v ?? null });
  // Every answer, oldest first: { at, quiz, kind, item, look, mode, review, replay, learning, r, ms, g, iv, v, given }
  // (given: item ids, or texts with a " before them); and names: '<quiz>|<layer>|<item>' -> what the item is called,
  // '<quiz>|<layer>' -> what the layer is.
  async function all() {
    const answers = [], names = new Map();
    for (const c of await chunks()) {
      const s = c.s;
      for (const [key, name] of Object.entries(c.n || {})) { const [q, k, i] = key.split('.'); names.set(i == null ? `${s[q]}|${s[k]}` : `${s[q]}|${s[k]}|${s[i]}`, name); }
      for (const [t, q, k, i, l, m, f, r, ms, g, iv, v, ...given] of c.a)
        answers.push({ at: c.t0 + t * 1000, quiz: s[q], kind: s[k], item: s[i], look: s[l], mode: s[m], ...decoded({ f, r, ms, g, iv, v }), given: given.map(x => s[x]) });
    }
    for (const a of [...pending, ...spilled]) {
      answers.push({ at: a.at, quiz: a.quiz, kind: a.kind, item: a.item, look: a.look, mode: a.mode, ...decoded(a), given: a.given });
      for (const [id, name] of Object.entries(a.names || {})) if (name && !names.has(`${a.quiz}|${a.kind}|${id}`)) names.set(`${a.quiz}|${a.kind}|${id}`, name);
      if (a.layer && !names.has(`${a.quiz}|${a.kind}`)) names.set(`${a.quiz}|${a.kind}`, a.layer);
    }
    answers.sort((x, y) => x.at - y.at);
    return { answers, names };
  }

  /* ---------- the online copy and the data file ---------- */
  const plain = c => ({ t0: c.t0, s: c.s, n: c.n, a: c.a });
  const valid = (id, v) => ID.test(id) && v && Number.isFinite(v.t0) && Array.isArray(v.s) && Array.isArray(v.a);
  const isLog = name => name.startsWith(SYNCED);
  // The chunks the online copy lacks answers of: [{ name, value, n }].
  async function outgoing() {
    return (await chunks()).filter(c => c.a.length > (c.sent || 0)).map(c => ({ name: SYNCED + c.id, value: plain(c), n: c.a.length }));
  }
  // … sent: the online copy has their n answers.
  const sent = list => tx('readwrite', async log => {
    for (const { name, n } of list) { const c = await req(log.get(name.slice(SYNCED.length))); if (c && n > (c.sent || 0)) { c.sent = n; log.put(c); } }
  }).catch(() => {});
  // Chunks from elsewhere, [[id, chunk]]: each kept as the longer of the two copies, their names together. there: they
  // are the online copy's, as it has them now (else, from a data file, it is told of what it lacks).
  const take = (list, there) => (broken || !list.length ? Promise.resolve() : tx('readwrite', async log => {
    for (const [id, v] of list) {
      if (!valid(id, v)) continue;
      const c = await req(log.get(id)), n = { ...(c && c.n), ...v.n };
      if (!c || v.a.length > c.a.length) log.put({ id, t0: v.t0, s: v.s, n, a: v.a, sent: there ? v.a.length : (c && c.sent) || 0 });
      else log.put({ ...c, n, sent: there ? v.a.length : c.sent || 0 }); // (the copy there shorter: the rest is sent again)
    }
  }).then(() => tell('taken'), () => {}));
  // The online copy was emptied, or is another one: everything is sent again.
  const resend = () => tx('readwrite', async log => { for (const c of await req(log.getAll())) if (c.sent) { c.sent = 0; log.put(c); } }).catch(() => {});
  const file = async () => (await chunks()).map(c => ({ id: c.id, ...plain(c) }));
  const load = list => take((Array.isArray(list) ? list : []).map(c => [c && c.id, c]), false);

  // Chunks that a page without this file took from the online copy into localStorage, as if quiz records: moved here.
  function adopt() {
    const P = 'geoquizzes.' + SYNCED, list = [];
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(P)) continue;
        try { list.push([key.slice(P.length), JSON.parse(localStorage.getItem(key))]); } catch (e) {}
        localStorage.removeItem(key);
      }
    } catch (e) {}
    if (list.length) take(list, true);
  }

  if (typeof indexedDB === 'undefined') broken = true;
  else {
    addEventListener('pagehide', spill);
    addEventListener('pageshow', e => { if (e.persisted) unspill(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(true); });
    unspill(); adopt();
  }

  return { add, graded, flush, all, outgoing, sent, take, resend, file, load, isLog, listen: f => heard.push(f), SYNCED };
})();
