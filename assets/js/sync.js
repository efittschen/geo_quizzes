// The online copy: a place on the internet that a player names, where the browsers they play in meet. It is the web
// app link of a small script on a Google Sheet of their own (online-copy.gs; set up from the review page), so it
// lies in their account and nobody else's. Everything stays in each browser as before (store.js). With a link set,
// what changes here is also sent there, a moment after it changed, and what changed there is taken in here: when a
// page opens and when it is looked at again. Without a connection everything goes on as before, and is sent later.
//
// Sent are the entries of store.js, each under its name ("settings", "review", "quiz.<quiz id>"), without the parts
// that belong to one browser: a record's `last` and its paint `choice`, the settings' `open`, the review's `run`.
//
// Two copies of an entry become one like this (`merge`), with nothing lost that either side learned:
//   cards      each card from the copy where it was answered last; none from before the stack was removed (`cleared`)
//   best       each round's better result
//   paint      each round's higher number
//   stars      from the copy where they changed last (`changed`); if one doesn't say, the higher of each
//   custom     from the copy where it changed last; if one doesn't say, the quizzes of both
//   title      from the copy with the card answered last
//   settings   from the copy that changed last; if one doesn't say, the settings of both
//   review     the later day's count, or the higher one of the same day
// Where nothing says which is newer, the online copy's is taken, so all browsers come to the same.
//
// The script counts the changes it takes: its revision. A browser asks for what changed after the revision it saw
// last, and sends its own changes along with that revision. They are taken only if none of those entries changed
// there in between; otherwise the browser gets them back, merges, and sends again.
//
// Kept in this browser (store.js, `geoquizzes.sync`):
//   { url, rev: the revision seen last, seen: { <name>: fingerprint of the entry as it is there },
//     at: when the two last talked (ms), fault: why that failed, if it did }
//
// A page hears of two things, as events on the window:
//   geoquizzes:sync    the state changed (`SYNC.state()`: { url, at, fault, busy })
//   geoquizzes:fresh   entries here changed from the online copy. A page that shows them anew itself, or is in the
//                      middle of something, prevents the default; otherwise a page not yet touched is loaded again.

const SYNC = (() => {
  const APP = 'geo-quizzes', WHAT = /^(settings|review|quiz\.[\w.-]+)$/;
  const WAIT = 2000, APART = 20000, RETRY = 60000; // a change is sent 2 s after it; the two talk at most every 20 s; after a failure, again in a minute
  const WEB_APP = /^https:\/\/script\.google\.com\/(a\/macros\/[^/]+|macros)\/s\/[\w-]+\/exec$/;

  /* ---------- two copies become one ---------- */
  const when = t => STORE.ms(t) || 0, empty = v => !Object.keys(v || {}).length;
  // A value as text that reads the same whatever order its parts were written in, and a fingerprint of it (FNV-1a).
  const text = v => (Array.isArray(v) ? `[${v.map(x => text(x))}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${text(v[k])}`)}}` : JSON.stringify(v ?? null));
  function print(v) {
    const s = text(v);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return `${s.length}-${(h >>> 0).toString(36)}`;
  }
  const names = (a, b) => [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])];

  // An entry as it is sent: without what belongs to this browser, and without a town-name quiz not played yet.
  function sent(name, v) {
    if (name === 'settings') { const { open, ...rest } = v; return rest; }
    if (name === 'review') { const { run, ...rest } = v; return rest; }
    const { last, ...rest } = v;
    if (rest.paint) { const { choice, ...paint } = rest.paint; if (empty(paint.best)) delete rest.paint; else rest.paint = paint; }
    return rest;
  }

  function card(mine, theirs) {
    if (!mine || !theirs) return mine || theirs;
    return when(mine.last) > when(theirs.last) ? mine : theirs;
  }
  // A round's better result: as the quiz counts it, by points on a map played for points, else by the score, then by
  // the time. The higher score is kept with either.
  function result(mine, theirs) {
    if (!mine || !theirs) return mine || theirs;
    const points = mine.points != null || theirs.points != null;
    const ahead = points ? (mine.points || 0) - (theirs.points || 0) : mine.score - theirs.score;
    const [won, lost] = ahead > 0 || (ahead === 0 && mine.ms < theirs.ms) ? [mine, theirs] : [theirs, mine];
    return { ...won, score: Math.max(mine.score, theirs.score), ...(won.name || lost.name ? { name: won.name || lost.name } : {}) };
  }
  // A part taken as a whole: which copy it comes from (1 mine, -1 theirs), or 0 if one of them doesn't say when it
  // changed, or both say the same.
  const newer = (a, b) => (when(a) && when(b) ? Math.sign(when(a) - when(b)) : 0);
  const later = (a, b) => (when(a) > when(b) ? a : b);

  function record(mine, theirs) {
    const out = { ...theirs, ...mine };
    const cleared = later(mine.cleared, theirs.cleared);
    if (cleared) out.cleared = cleared;
    if (mine.cards || theirs.cards) {
      out.cards = {};
      for (const k of names(mine.cards, theirs.cards)) {
        const c = card(mine.cards?.[k], theirs.cards?.[k]);
        if (!cleared || when(c.last) > when(cleared)) out.cards[k] = c;
      }
      if (empty(out.cards)) delete out.cards;
    }
    if (mine.best || theirs.best) out.best = Object.fromEntries(names(mine.best, theirs.best).map(k => [k, result(mine.best?.[k], theirs.best?.[k])]));
    if (theirs.paint) {
      const best = { ...mine.paint?.best };
      for (const [k, n] of Object.entries(theirs.paint.best || {})) best[k] = Math.max(best[k] ?? n, n);
      out.paint = { ...mine.paint, best };
    }
    const newest = r => Object.values(r.cards || {}).reduce((t, c) => Math.max(t, when(c.last)), 0);
    const title = (newest(mine) > newest(theirs) ? [mine, theirs] : [theirs, mine]).find(r => r.title);
    if (title) out.title = title.title;

    const changed = {};
    const whole = (part, both) => {
      const side = newer(mine.changed?.[part], theirs.changed?.[part]), at = later(mine.changed?.[part], theirs.changed?.[part]);
      const v = side ? (side > 0 ? mine : theirs)[part] : mine[part] && theirs[part] ? both(mine[part], theirs[part]) : mine[part] || theirs[part];
      if (v) out[part] = v; else delete out[part];
      if (at) changed[part] = at;
    };
    whole('stars', (a, b) => Array.from({ length: Math.max(a.length, b.length) }, (_, i) => Math.max(a[i] || 0, b[i] || 0)));
    whole('custom', (a, b) => [...b, ...a.filter(q => !b.some(p => text(p) === text(q)))]);
    if (empty(changed)) delete out.changed; else out.changed = changed;
    return out;
  }

  function settings(mine, theirs) {
    const here = sent('settings', mine), side = newer(mine.changed, theirs.changed), changed = later(mine.changed, theirs.changed);
    // If one doesn't say when it changed: the settings of both, and where they differ those of the one that does.
    const out = side > 0 ? here : side < 0 ? { ...theirs } : when(mine.changed) > when(theirs.changed) ? { ...theirs, ...here } : { ...here, ...theirs };
    if (changed) out.changed = changed;
    return mine.open ? { ...out, open: mine.open } : out;
  }

  function review(mine, theirs) {
    const a = mine.day, b = theirs.day;
    const day = !a || !b ? a || b : when(a.date) !== when(b.date) ? (when(a.date) > when(b.date) ? a : b) : (a.reviewed >= b.reviewed ? a : b);
    return day ? { ...mine, day } : { ...mine };
  }

  // This browser's entry and the online copy's, as one: what this browser then keeps.
  const merge = (name, mine, theirs) => (name === 'settings' ? settings : name === 'review' ? review : record)(mine, sent(name, theirs));

  /* ---------- talking to the online copy ---------- */
  const state = () => { const { url, at, fault } = STORE.sync(); return { url, at, fault, busy }; };
  let busy = false, again = false, timer = 0, unsent = false, touched = false;
  const tell = type => window.dispatchEvent(new Event('geoquizzes:' + type, { cancelable: true }));

  // One request. What is sent goes as plain text: that is a request a page may make to another site without asking
  // it first, a question a Google script has no way to answer. A page being left sends a small request to the end.
  async function ask(url, since, items, leaving) {
    let res;
    try {
      const body = items && JSON.stringify({ app: APP, since, items });
      res = items
        ? await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body, credentials: 'omit', keepalive: !!leaving && body.length < 60000 })
        : await fetch(`${url}${url.includes('?') ? '&' : '?'}since=${since}`, { credentials: 'omit', cache: 'no-store' });
    } catch (err) { throw new Error('Not reached'); }
    const out = await res.json().catch(() => null);
    if (out?.app !== APP) throw new Error('Not a Geo Quizzes link');
    if (out.error) throw new Error('Refused');
    return out;
  }

  // Sends what is not there as it is here, takes in what changed there, and so on until both hold the same (a few
  // rounds at most: the second sends what the first one's merges left to say). Returns whether entries here changed.
  async function talk(leaving) {
    let fresh = false;
    for (let round = 0; round < 5; round++) {
      const { url, rev = 0, seen = {} } = STORE.sync();
      const items = {}, prints = {};
      for (const name of STORE.names()) {
        const v = sent(name, STORE.entry(name)), p = print(v);
        if (!empty(v) && p !== seen[name]) { items[name] = v; prints[name] = p; }
      }
      if (round && empty(items)) break;
      const out = await ask(url, rev, empty(items) ? null : items, leaving);
      if (STORE.sync().url !== url) break; // another link was set meanwhile, or none
      const taken = out.ok ? prints : {};
      for (const [name, theirs] of Object.entries(out.items || {})) {
        if (!WHAT.test(name) || !theirs || typeof theirs !== 'object') continue;
        const mine = STORE.entry(name), merged = merge(name, mine, theirs);
        if (text(merged) !== text(mine)) { STORE.place(name, merged); fresh = true; }
        taken[name] = print(sent(name, theirs));
      }
      // A revision below the one seen last: the copy was emptied, or the link now leads to another one.
      STORE.setSync(s => { s.seen = { ...(out.rev < rev ? {} : s.seen), ...taken }; s.rev = out.rev; });
    }
    return fresh;
  }

  async function run(leaving) {
    clearTimeout(timer);
    if (!STORE.sync().url) return;
    if (busy) { again = true; return; }
    busy = true; unsent = false; tell('sync');
    let fresh = false, fault = null;
    try { fresh = await talk(leaving); } catch (err) { fault = err.message; unsent = true; }
    STORE.setSync(s => { if (!s.url) return; s.at = Date.now(); if (fault) s.fault = fault; else delete s.fault; });
    busy = false; tell('sync');
    if (fresh && tell('fresh') && !touched) location.reload();
    if (again) { again = false; soon(); } else if (fault) soon(RETRY);
  }
  // Soon, but no sooner than the two may talk again.
  function soon(wait = 0) {
    clearTimeout(timer);
    if (STORE.sync().url) timer = setTimeout(run, Math.max(wait, (STORE.sync().at || 0) + APART - Date.now()));
  }

  // The link of a script's web app (or, for trying it out, of a stand-in on this computer). Returns what is wrong
  // with it, or else, once the two have talked, why that failed, if it did.
  async function connect(url) {
    url = url.trim();
    if (!WEB_APP.test(url) && !/^http:\/\/(localhost|127\.0\.0\.1)[:/]/.test(url)) return 'Not a web app link';
    STORE.setSync(s => { for (const k in s) delete s[k]; s.url = url; });
    await run();
    return STORE.sync().fault || null;
  }
  function disconnect() {
    clearTimeout(timer);
    STORE.setSync(s => { for (const k in s) delete s[k]; });
    tell('sync');
  }

  STORE.listen(() => { unsent = true; soon(WAIT); });
  for (const type of ['pointerdown', 'keydown']) window.addEventListener(type, () => { touched = true; }, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { touched = false; soon(); }
    else if (unsent && !busy) run(true); // on the way out: now, not in a moment
  });
  window.addEventListener('pageshow', e => { if (e.persisted) soon(); });
  window.addEventListener('online', () => soon());
  soon();

  return { connect, disconnect, state, merge, sent, text };
})();
