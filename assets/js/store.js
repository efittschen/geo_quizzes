// Everything the site keeps in this browser (localStorage), all of it under "geoquizzes.":
//
//   geoquizzes.quiz.<quiz id>   one record per quiz page (its folder name, as in data/quizzes.json), with what it has of:
//     title    the page's title (set with its first review card)
//     stars    progress per level, Beginner first; 1 means every round of the level was played perfectly. The quiz
//              page works it out from `best` and keeps it here for the home and country pages, which show the stars
//              without loading the quiz.
//     cards    the review stack (see srs.js): { "<layer>|<item>": { due, last, interval, ease, stability, difficulty, misses, step, missing } }
//              due and last are times; interval is in days; ease is the SM-2 scheduler's number, stability (days)
//              and difficulty (1 to 10) are FSRS's; step is
//              there while the card is still being learned (2, 3…: a new card's steps, 1: learned again after a
//              miss); missing: its question left the quiz
//     best     the best result of every round played, per map: { "<layer>/<map>/<items>": { name, of, score, ms, points } }
//              <items> stands for the round's exact items, as their number and a fingerprint of the list (see `print`),
//              so a result counts for whatever round or custom quiz asks just those items, and no longer once a
//              round's items change. name: the round's label when it was played; of: the number of items;
//              points: map play (city quizzes)
//     custom   the player's own quizzes: [{ name, kind, ids }]
//     last     what was chosen last on the setup screen: { choice, kind, lang, map, topN, opts, sel: { <layer>: [ids] } }
//     paint    a town-name quiz's results: { best: { <round>: places right }, choice }
//   geoquizzes.settings         { easy, known, limit: the review clock's three times in seconds; perReview, perDay: the most
//                                 cards in one review and in one day; the review schedule (see srs.js): scheduler
//                                 ("fsrs" or "sm2"), retention, steps, missStep, kept, firstInterval, ease, unsure, longest;
//                                 open: the folders open in "All quizzes" }
//   geoquizzes.review           { day: { date, reviewed }: cards reviewed today; run: a review in progress (srs.js) }
//
// The data file of the review page ("Your data") is these entries as they are:
//   { app: "geo-quizzes", version: 2, saved, settings, review, quizzes: { <quiz id>: record }, older }
//
// Before, the same things lay in many small entries: stars, cards and settings under other "geoquizzes." names, and a
// quiz's results and choices under a short name of its own ("idregions.best.…"). Entries of the first kind are
// carried over when this file loads; those of the second by their quiz page when it next opens (`adopt`), since only
// the page knows its short name. Until then they are the `older` part of a data file, so nothing is left behind.
const STORE = (() => {
  const P = 'geoquizzes.', QUIZ = P + 'quiz.', SETTINGS = P + 'settings', REVIEW = P + 'review';
  const keys = () => { const out = []; try { for (let i = 0; i < localStorage.length; i++) out.push(localStorage.key(i)); } catch (e) {} return out; };
  const parse = key => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };
  const drop = key => { try { localStorage.removeItem(key); } catch (e) {} };
  const get = key => { const v = parse(key); return v && typeof v === 'object' ? v : {}; };
  const put = (key, v) => { try { if (Object.keys(v).length) localStorage.setItem(key, JSON.stringify(v)); else localStorage.removeItem(key); } catch (e) {} };
  // An entry is read, changed and written in one go, so two tabs on the same quiz do not undo each other's parts.
  const change = (key, f) => { const v = get(key); f(v); put(key, v); };

  // A record is written with its parts in one order, and a best result's too, so the entries read alike.
  const PARTS = ['title', 'stars', 'cards', 'best', 'custom', 'last', 'paint'];
  function tidy(r) {
    const out = {};
    for (const k of PARTS) if (k in r) out[k] = r[k];
    for (const k in r) if (!(k in out)) out[k] = r[k];
    if (out.best) for (const [k, b] of Object.entries(out.best)) out.best[k] = { ...(b.name ? { name: b.name } : {}), of: b.of, score: b.score, ms: b.ms, ...(b.points != null ? { points: b.points } : {}) };
    return out;
  }
  const quiz = id => get(QUIZ + id), setQuiz = (id, f) => { const r = quiz(id); f(r); put(QUIZ + id, tidy(r)); };
  const quizIds = () => keys().filter(k => k.startsWith(QUIZ)).map(k => k.slice(QUIZ.length)).sort();
  const settings = () => get(SETTINGS), setSettings = f => change(SETTINGS, f);
  const review = () => get(REVIEW), setReview = f => change(REVIEW, f);

  // A set of items as "<their number>-<fingerprint>": the fingerprint is a short hash (FNV-1a) of the sorted list.
  function print(ids) {
    const s = [...ids].sort().join(',');
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return `${ids.length}-${(h >>> 0).toString(36)}`;
  }

  // Times are kept as text ("2026-10-07T14:03:12.869Z"); the code counts in milliseconds.
  const time = ms => (Number.isFinite(ms) ? new Date(ms).toISOString() : ms), ms = t => (typeof t === 'string' ? Date.parse(t) : t);
  // A review card as kept, and as srs.js works with it: { d: due, l: last, i: interval, e: ease, st: stability, df: difficulty, n: misses, s: step, x: missing }.
  const memory = (c, st, df, as) => (c[st] != null && c[df] != null ? { [as[0]]: c[st], [as[1]]: c[df] } : {});
  const cardOut = c => ({ due: time(c.d), last: time(c.l), interval: c.i, ease: c.e, ...memory(c, 'st', 'df', ['stability', 'difficulty']), misses: c.n || 0, ...(c.s ? { step: c.s } : {}), ...(c.x ? { missing: true } : {}) });
  const cardIn = c => ({ d: ms(c.due), i: c.interval, e: c.ease, ...memory(c, 'stability', 'difficulty', ['st', 'df']), l: ms(c.last), n: c.misses || 0, ...(c.step ? { s: c.step } : {}), ...(c.missing ? { x: 1 } : {}) });
  // A best result as kept, and as the quiz engine works with it: { s: score, t: time in ms, p: points }.
  const bestOut = (b, of, name) => ({ ...(name ? { name } : {}), of, score: b.s, ms: Math.round(b.t), ...(b.p != null ? { points: b.p } : {}) });
  const bestIn = b => (b ? { s: b.score, t: b.ms, p: b.points } : null);

  /* ---------- entries of the layout before ---------- */
  const OLD_NAMES = ['choice', 'kind', 'lang', 'map', 'topN', 'opts'];
  const OLD = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)?\.(?:choice|kind|lang|map|opts|saved|topN|sel|sel\..+|best\..+)$/;
  const isOld = key => OLD.test(key) || (key.startsWith(P) && !key.startsWith(QUIZ) && key !== SETTINGS && key !== REVIEW);
  // Those under "geoquizzes.": stars, cards, drawings, settings, the review's state.
  function carryOver() {
    for (const key of keys()) {
      if (!key.startsWith(P) || key.startsWith(QUIZ) || key === SETTINGS || key === REVIEW) continue;
      const name = key.slice(P.length), v = parse(key) || {};
      if (name.startsWith('rating.')) { if (Array.isArray(v.levels)) setQuiz(name.slice(7), r => { r.stars = v.levels; }); }
      else if (name.startsWith('srs.deck.')) setQuiz(name.slice(9), r => { if (v.t) r.title = v.t; r.cards = Object.fromEntries(Object.entries(v.c || {}).map(([k, c]) => [k, cardOut(c)])); });
      else if (name.startsWith('paint.')) setQuiz(name.slice(6), r => { r.paint = v; });
      else if (name === 'srs.opts') setSettings(s => { for (const [from, to] of [['fast', 'known'], ['limit', 'limit'], ['round', 'perReview'], ['day', 'perDay']]) if (v[from] != null) s[to] = v[from]; });
      else if (name === 'open') { if (Array.isArray(v)) setSettings(s => { s.open = v; }); }
      else if (name === 'srs.day') { if (v.d != null) setReview(r => { r.day = { date: time(v.d), reviewed: v.n }; }); }
      else if (name === 'srs.run') setReview(r => { r.run = v; });
      else continue; // not one of ours: left alone
      drop(key);
    }
  }
  // Those under a quiz's short name `key`, taken into the record of its page `id`. `kinds` are the page's layers,
  // the first one being where a selection saved without a layer belongs; another page on the same short name keeps
  // what is of its own layers.
  function adopt(id, key, kinds) {
    const pre = key + '.', old = keys().filter(k => k.startsWith(pre) && OLD.test(k));
    if (!old.length) return;
    setQuiz(id, r => {
      for (const k of old) {
        const name = k.slice(pre.length), v = parse(k), best = name.match(/^best\.([^.]+)\.([^.]+)\.(.*)$/);
        if (best) {
          if (!kinds.includes(best[1])) continue;
          const ids = best[3].split(',');
          if (v) (r.best ||= {})[`${best[1]}/${best[2]}/${print(ids)}`] = bestOut(v, ids.length);
        } else if (name === 'saved') {
          const all = Array.isArray(v) ? v : [], mine = all.filter(q => kinds.includes(q.kind)), rest = all.filter(q => !kinds.includes(q.kind));
          if (mine.length) r.custom = [...(r.custom || []), ...mine];
          if (rest.length) { try { localStorage.setItem(k, JSON.stringify(rest)); } catch (e) {} continue; }
        } else if (name === 'sel' || name.startsWith('sel.')) {
          const kind = name === 'sel' ? kinds[0] : name.slice(4), sel = ((r.last ||= {}).sel ||= {});
          if (!kinds.includes(kind)) continue;
          if (name !== 'sel' || !(kind in sel)) sel[kind] = v;
        } else if (OLD_NAMES.includes(name)) (r.last ||= {})[name] = v;
        else continue;
        drop(k);
      }
    });
  }

  /* ---------- the data file ---------- */
  function file() {
    const older = {};
    for (const key of keys().filter(isOld).sort()) older[key] = localStorage.getItem(key);
    return { app: 'geo-quizzes', version: 2, saved: new Date().toISOString(), settings: settings(), review: review(), quizzes: Object.fromEntries(quizIds().map(id => [id, quiz(id)])), older };
  }
  // Puts a data file in place of what is kept here. Entries of other pages on the same address are not touched.
  // Returns false for a file that is not one of ours.
  function restore(f) {
    const first = f?.app === 'geo-quizzes' && f.version === 1 && f.data && typeof f.data === 'object'; // the file format before
    if (!first && !(f?.app === 'geo-quizzes' && f.quizzes && typeof f.quizzes === 'object')) return false;
    for (const key of keys()) if (key.startsWith(P) || OLD.test(key)) drop(key);
    const raw = (entries, text) => { for (const [key, v] of Object.entries(entries || {})) if (isOld(key)) { try { localStorage.setItem(key, text ? v : JSON.stringify(v)); } catch (e) {} } };
    if (first) { raw(f.data, false); raw(f.raw, true); }
    else {
      raw(f.older, true);
      put(SETTINGS, f.settings && typeof f.settings === 'object' ? f.settings : {});
      put(REVIEW, f.review && typeof f.review === 'object' ? f.review : {});
      for (const [id, record] of Object.entries(f.quizzes)) if (record && typeof record === 'object') put(QUIZ + id, tidy(record));
    }
    carryOver();
    return true;
  }

  carryOver();
  return { quiz, setQuiz, quizIds, settings, setSettings, review, setReview, print, time, ms, cardOut, cardIn, bestOut, bestIn, adopt, file, restore };
})();
