// The review, as it runs on a page (the rules: model/review.js; the cards and their schedule: srs.js, storage.schedule).
//
// Due and All beside the page's title start a review of this page's cards: the due ones, or all of them. A review over
// several quizzes, started on the review page or a country page, comes here as ?review=1 and asks three of this page's
// cards drawn at random, then goes on to the next quiz the run draws. A practice over several quizzes (the review
// page's Practice for a whole list) comes here as ?run=<n> and goes on the same way once its round is played. Every
// question has a clock: a bar under it that runs down to the time limit, green while a right answer still counts as known, a notch where "easy" ends and one where
// "known" ends; run out, the answer shows and must still be given. A card not known comes back at the end of the review;
// asked again (a replay), answered right it is rated by hand: Easy, Good or Hard in a column over the map (the keys 4,
// 3, 2; Enter: the one filled, Hard), Hard when its bar runs out, and nothing goes on until then. Only a card's first
// answer counts for the review's result and the day's count. Only the last answer stays coloured on the map, and the
// areas of everything learned so far stay lit, so the map gives nothing away (on the overlay all of them, each there to
// be tapped). A map picked during a review is the one for the rest of it.
// The setting "Rating" (srs.js) rates every right answer by hand instead, in the same column, the clock's grade filled
// (a replay's: Hard), and taken if none is picked:
//   Pick in 4 s     the next question asked at once, its clock running: the column stays 4 s, or until the next
//                   answer; after the last question on the page (before the next quiz's page, or the results) the
//                   review waits for it. The keys rate only where the next question's way to answer takes none
//                   (a tap on the map, Pairs), and never in a field
//   Pick and wait   the answer green on the map, the review waiting until a grade is picked (no bar)
//   Pick when slow  as Pick and wait for an answer slower than "known" (and a replay); quicker ones by the clock
//   Pick at the end every answer by the clock at once (a replay: Hard), and listed in the results with Easy, Good,
//                   Hard to grade it again there (SRS.regrade); a review over several quizzes lists them on the page
//                   it ends on
// Whatever the column, a click anywhere else on the page (not a drag of the map) takes the one filled; what it clicks
// still does its own job, but a tap on the map never answers the next question as well.
// Cards (modes/cards.js) are rated by the player on the card itself, Easy, Good, Hard or Missed, never by the clock:
// no bar, no column, whatever the setting Rating says, and a replay is rated the same way.
// Ordinary rounds count too, quietly, for cards on the stack: a wrong try is "not known", a first-try answer within the
// known time "known", a card of Cards as it is rated; a perfect round puts its questions on the stack.
//
//   const review = makeReview(deps)   (deps.play(def): a round started as the App starts one)
//   review.hooks          what the Game asks of it (game.review): grade, asked, missed, answered, after, finished
//   review.look(look)     a map picked during the review: for the rest of it
//   review.active()       a review is being played
//   review.away()         End with nothing answered: back to where a run or a practice was started (true), or not

const RATE_TIME = 4000, LEAD = 1500, GROUP_PAUSE = 700;

export function makeReview({ quiz, model, map, game, storage, screens, setup, play, root, srs: SRS }) {
  const { $, feedback, fmt } = screens.ui, rules = model.review, page = storage.page;
  const { MISSED, UNSURE, KNOWN, INSTANT } = SRS, CLASS = [3, 1, 0, 0], RESULT = ['got', 't2', 't3', 'miss'], SAID = ['bad', 'unsure', 'ok', 'ok'];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const here = () => rules.lookOf({ map: game.def.look.map, back: map.backShown });
  const cardFor = (P, id, look) => SRS.keyOf(page, rules.cardKey(P, id, look));
  const how = () => ({ chosen: setup.look, asked: setup.asked ? setup.asked() : [] });
  const stack = () => rules.stack(SRS, storage, how());
  const title = () => (document.querySelector('.brand h1') || {}).textContent || document.title;
  // S: the review being played; P: an ordinary round's question; pend: a Retry round's replays, rated once the round
  // goes on; hand: the column an answer is to open (made as its members are answered); C: the column open (see below)
  let S = null, P = null, raf = 0, pend = [], hand = null, C = null;

  /* ---------- Due and All ---------- */
  const wrap = document.createElement('div'); wrap.className = 'rv-go'; wrap.id = 'reviewWrap';
  wrap.innerHTML = '<button class="ghost small" id="reviewDue" type="button"></button><button class="ghost small" id="reviewAll" type="button"></button>';
  { const h1 = document.querySelector('.brand h1'), row = document.createElement('div'); row.className = 'brand-row'; h1.replaceWith(row); row.append(h1, wrap); }
  const due = wrap.querySelector('#reviewDue'), all = wrap.querySelector('#reviewAll');
  function syncButtons() {
    const now = Date.now(), s = SRS.stats(stack().deck, now), limit = !SRS.dayLeft(now);
    wrap.hidden = !s.total;
    due.disabled = !s.due || limit;
    due.textContent = `Due ${s.due}`; all.textContent = `All ${s.total}`;
    due.title = !s.total ? '' : !s.due ? `Next ${SRS.until(s.next, now)}` : limit ? 'Daily limit' : '';
  }
  due.onclick = () => open('due');
  all.onclick = () => open('all');
  const syncIfShown = () => { if (!document.hidden && !$('setup').hidden) syncButtons(); };
  document.addEventListener('visibilitychange', syncIfShown);
  setInterval(syncIfShown, 15000);

  /* ---------- the clock ---------- */
  const bar = document.createElement('div'), fill = document.createElement('i');
  bar.className = 'rv-timer'; bar.hidden = true; bar.append(fill);
  $('ask').after(bar);
  const ticks = document.createElement('div'); ticks.className = 'ticks'; ticks.id = 'rvTicks';
  $('ticks').after(ticks);

  /* ---------- a review: cards in shuffled order, whatever their kind ---------- */
  function open(which, drawn) {
    const { deck, items } = stack(), run = which === 'run' ? SRS.run() : null;
    const keys = run ? drawn.keys.filter(c => items[c]) : shuffle(SRS.pick([{ id: page, ...deck }], which === 'all', Date.now()).map(c => c.key));
    if (!keys.length) return false;
    S = {
      chain: !!run, next: run && drawn.next, leaving: false,
      res: [], total: keys.length, n: [0, 0, 0], counted: new Set(), list: [],
      t0: performance.now() - (run && isFinite(run.t) ? Date.now() - run.t : 0), // (a review over several quizzes: since it began)
      asked: 0, prev: null, look: (run && run.look) || {},
      rounds: rules.plan(SRS, keys, items, deck, how()),
      lit: P0 => SRS.all(deck).filter(c => items[c] && items[c][0] === P0.key).flatMap(c => P0.kind.areas[items[c][1]]),
    };
    $('app').classList.remove('moving');
    nextRound();
    return true;
  }
  // (the map picked during the review, as far as this page has it)
  const lookFor = way => {
    const l = S.look, out = {};
    if (l.map && way.map !== 'free' && quiz.maps.includes(l.map)) out.map = l.map;
    if (l.back && quiz.backs.includes(l.back)) out.back = l.back;
    return out;
  };
  const light = P0 => { if (P0.kind.dim !== false) map.dim(map.overlaid() ? map.ids : S.lit(P0)); };
  function nextRound() {
    const { play: key, ids, way } = S.rounds.shift(), P0 = model.kinds.playOf(key), fb = $('fb');
    S.way = way;
    // a new round clears the panel and the map; the last answer and what was said of it stay
    const said = S.asked ? [fb.className, [...fb.childNodes]] : null;
    play({ play: P0, items: ids, retry: true, review: true, look: { map: way.map, back: way.back, ...lookFor(way) }, t0: S.t0 });
    light(P0);
    const label = $('sScore').nextElementSibling; if (label) label.textContent = 'Known';
    if (said) { fb.className = said[0]; fb.replaceChildren(...said[1]); }
    if (S.prev && P0.mode !== 'cards') map.mark(S.prev.areas, S.prev.cls); // (a card's map shows its own place alone)
    showStats();
  }
  // the review's answers so far: kept in the run over several quizzes, so they carry on from page to page
  function progress() {
    if (!S.chain) return { res: S.res, total: S.total, known: S.n[KNOWN] };
    const run = SRS.run();
    return { res: run.res, total: Math.max(run.total, run.res.length, 1), known: SRS.tally(run.res)[KNOWN] };
  }
  let shown = '';
  function showStats() {
    if (!S || !game.def || !game.def.review) return;
    const { res, total, known } = progress();
    let streak = 0; while (streak < res.length && res[res.length - 1 - streak] >= KNOWN) streak++;
    $('sQ').textContent = `${Math.min(res.length + 1, total)}/${total}`;
    $('sScore').textContent = known; $('sStreak').textContent = streak;
    // (an answer waiting for its pick shows green, as on the map)
    const green = C && C.green ? C.items[0].tick : -1, cls = i => RESULT[CLASS[i === green ? KNOWN : res[i]]];
    const state = res.length + '/' + total + ':' + res.map((g, i) => cls(i)).join();
    if (state === shown && ticks.children.length === total) return;
    shown = state;
    ticks.replaceChildren(...Array.from({ length: total }, (_, i) => { const t = document.createElement('i'); t.className = i < res.length ? cls(i) : i === res.length ? 'now' : ''; return t; }));
  }

  /* ---------- several quizzes ---------- */
  let index = null;
  // (this page as a stop of a practice over several quizzes: its place in it, from 1; see srs.js startPractice)
  const practiceAt = Math.max(0, parseInt(new URLSearchParams(location.search).get('run'), 10) || 0);
  // (the page a practice of this quiz goes back to, ?return: the review page's tab it was started on; only this site's pages)
  const practiceBack = (() => { const b = new URLSearchParams(location.search).get('return'); if (!b) return null; try { const u = new URL(b, root); return u.origin === new URL(root).origin ? u.href : null; } catch (e) { return null; } })();
  async function travel() {
    stack();
    index ||= fetch(root + 'data/site/quizzes.json').then(r => r.json()).then(j => j.quizzes.filter(q => !q.hidden)).catch(() => [{ id: page, url: location.pathname }]);
    const drawn = SRS.stretch(await index, page);
    if (!open('run', drawn)) location.href = SRS.stopUrl(root, drawn.next);
  }
  // this page's cards asked: on to the next quiz after a moment (the page keeps looking as it does while playing)
  function leave() {
    S.leaving = true;
    $('app').classList.add('moving');
    setTimeout(async () => {
      const stop = S.next || SRS.nextStop(await index);
      if (stop && stop.id === page) travel(); else location.href = SRS.stopUrl(root, stop);
    }, GROUP_PAUSE);
  }

  /* ---------- a question ---------- */
  function unmark() {
    const { K, id, areas } = S.prev;
    map.mark(areas, RESULT, false);
    if (K === game.def.play.kind) map.label(K, id, false);
    S.prev = null;
  }
  function asked(q) {
    // (a rating the review waits for, left open by a round begun anew, or a Retry round's replays: the one filled)
    if ((C && C.wait) || pend.length) rate(null, 'quiet');
    hand = null;
    if (!q) return;
    const P0 = game.def.play, o = SRS.opts(), cards = P0.mode === 'cards';
    if (cards) { // (rated by hand: no clock)
      if (!game.def.review) { P = null; return; }
      if (S.prev) unmark();
      Object.assign(S, { t: performance.now(), late: false, again: false, rate: o.rate });
      if (!S.asked) map.home();
      showStats(); bar.hidden = true; cancelAnimationFrame(raf);
      return;
    }
    const t = rules.times(P0, q.id, { all: game.round.needAll(), group: q.group }, o);
    // a card asked again after a miss was just shown: never "easy" by the clock
    const key = cardFor(P0, q.id, game.def.review ? S.way.look : here());
    const replay = game.def.review ? (S.chain ? (SRS.run().again[page] || []).includes(key) : S.counted.has(key)) : game.def.retry;
    const easy = replay ? -1 : t.easy;
    if (!game.def.review) { P = { t: performance.now() + (q.pos ? 0 : LEAD), easy, fast: t.known, missed: false }; return; }
    if (S.prev && P0.kind.areas[q.id].some(a => S.prev.areas.includes(a))) unmark(); // (the last answer must not give this one away)
    Object.assign(S, { t: performance.now() + (S.asked ? 0 : LEAD), easy, fast: t.known, limit: t.limit, late: false, again: replay, rate: o.rate });
    if (!S.asked) map.home();
    showStats();
    bar.hidden = false;
    bar.style.setProperty('--easy', `${100 - S.easy / S.limit * 100}%`); bar.style.setProperty('--known', `${100 - S.fast / S.limit * 100}%`);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  function tick() {
    if (!game.def || !game.def.review || $('play').hidden) { bar.hidden = true; return; }
    const q = game.round.asked();
    if (q && !q.revealed && !(C && C.go)) { // (no clock while the review waits for a rating)
      const t = performance.now() - S.t;
      fill.style.transform = `scaleX(${Math.min(1, Math.max(0, 1 - t / S.limit))})`;
      bar.classList.toggle('slow', t > S.fast);
      if (t >= S.limit) { S.late = true; game.timeUp(); }
    }
    raf = requestAnimationFrame(tick);
  }
  // (rated: Cards' rating, taken as it is)
  function grade(missed, rated) {
    if (C && !C.wait) rate(null, 'next'); // (Pick in 4 s: an answer closes the rating still open)
    const t = Math.max(0, performance.now() - S.t);
    S.g = rated ?? rules.grade({ ms: t, wrong: missed, late: S.late, easy: S.easy, known: S.fast });
    S.secs = t / 1000;
    S.how = rated == null ? byHand(S.g, S.again) : null;
    return CLASS[S.how && S.how.green ? KNOWN : S.g]; // (a pick waited for: green on the map meanwhile)
  }
  // How the setting "Rating" has a right answer rated: null, by the clock; else { wait: the review waits for it,
  // timed: 4 s, then the one filled, green: green on the map while it waits }
  function byHand(g, replay) {
    if (g === MISSED) return null;
    switch (S.rate) {
      case 'quick': return { wait: false, timed: true };
      case 'wait': return { wait: true, timed: false, green: true };
      case 'slow': return g === UNSURE || replay ? { wait: true, timed: false, green: true } : null;
      case 'end': return null;
      default: return replay ? { wait: true, timed: true } : null; // (Clock only: a replay's rating, as before)
    }
  }
  // an ordinary round: the first wrong try on a question counts as not known (once), for its card on the map played
  function missed(id) {
    if (!P || P.missed) return;
    P.missed = true;
    SRS.answer(page, cardFor(game.def.play, id, here()), MISSED, Date.now());
  }
  // (rated: Cards' rating, whatever the round: the card's schedule takes it as it is)
  function answered(id, result, n, rated) {
    const P0 = game.def.play, K = P0.kind, right = result === 0, cards = rated != null;
    if (!game.def.review) {
      if (n && !right && P) P.missed = false; // (each missed code of a group counts as missed)
      const key = cardFor(P0, id, here()), c = SRS.deck(page).c[key];
      if (cards) SRS.answer(page, key, rated, Date.now(), true);
      else if (!right) missed(id);
      else if (game.def.retry) { if (c && !c.x && P && !P.missed) pend.push(key); } // (the Retry round: a replay, rated by hand)
      else if (P && !P.missed && performance.now() - P.t <= P.fast) SRS.answer(page, key, performance.now() - P.t <= P.easy ? INSTANT : KNOWN, Date.now());
      return null;
    }
    const g = S.g, now = Date.now(), key = cardFor(P0, id, S.way.look); // (the card asked, whatever map is picked meanwhile)
    // a card's first answer in a review is graded by the clock and counts; asked again (a replay): right, rated by hand;
    // wrong, not known again. With the setting "Rating", right answers by hand too (byHand), or by the clock and
    // listed for the results (Pick at the end).
    const first = S.chain ? SRS.ran(page, key, g) : !S.counted.has(key), replay = !first && g !== MISSED;
    const ri = S.chain && first ? SRS.run().res.length - 1 : null, si = S.res.length; // (its places in the results)
    const how = cards ? null : byHand(g, replay), listed = !cards && S.rate === 'end', told = screens.question.told(P0, id);
    const rec = cards ? g : replay ? UNSURE : SRS.clocked(page, key, g, now); // (the one filled: the clock's, a replay's Hard)
    const before = listed && g !== MISSED ? SRS.deck(page).c[key] : null;
    let card = null;
    if (how) (hand ||= { items: [], rec, ...how }).items.push({ key, at: now, first, si, ri, tick: S.chain ? ri : si });
    else card = SRS.answer(page, key, listed ? rec : g, now, replay || cards);
    if (listed) {
      const e = { q: page, k: key, n: told, s: Math.round(S.secs * 10) / 10, g: g === MISSED ? MISSED : rec, r: replay ? 1 : 0, b: before, at: now, i: ri, si, f: first };
      if (S.chain) SRS.keepRated(e); else S.list.push(e);
    }
    S.counted.add(key); S.res.push(g); S.asked++;
    if (first) { S.n[Math.min(g, KNOWN)]++; SRS.reviewed(now); }
    if (listed && g !== MISSED && rec !== g) settle({ key, first, si, ri }, rec); // (a replay listed as Hard)
    if (S.prev) unmark();
    S.prev = { K, id, key, areas: K.areas[id], cls: RESULT[CLASS[how && how.green ? KNOWN : g]] };
    queueMicrotask(() => { // (after the Game has said its own)
      screens.question.said(how && how.green ? 'ok' : SAID[g], g === MISSED ? told : cards ? `✓ ${told}` : `✓ ${told} · ${S.secs.toFixed(1)} s`, card ? [`Next ${SRS.until(card.d, now)}`] : []);
    });
    if (g === MISSED && !S.chain) {
      if (S.rounds.length) rules.enqueue(S.rounds, P0.key, id, S.way); else { game.round.again(id); $('ticks').append(document.createElement('i')); }
      S.total++;
    }
    queueMicrotask(() => {
      if (!game.def || !game.def.review) return;
      showStats();
      // (map play waits a moment before its results; with more to ask, here or on another page, on at once)
      if ((C && C.go) || game.round.asked() || $('play').hidden) return;
      if (S.rounds.length) nextRound(); else if (S.chain) leave();
    });
    return { replay: !first };
  }

  /* ---------- rating by hand: the column ---------- */
  // Easy, Good, Hard over the map, the one taken if none is picked filled (rec: the clock's grade, or Hard for a
  // replay), with the bar of its 4 s where it has them. C: { items: [{ key, at: when answered (ms), first, si, ri,
  // tick: its places in the results and the ticks }] (a Retry round's: { key } only), rec, wait, timed, green, go: how
  // the round goes on, where it waits for the rating }.
  const rateBox = document.createElement('div'), col = document.createElement('div'), rateBar = document.createElement('span'), rateFill = document.createElement('i');
  rateBox.className = 'rv-rate'; rateBox.setAttribute('role', 'group'); rateBox.setAttribute('aria-label', 'Rating');
  col.append(...[['Easy', INSTANT, '4'], ['Good', KNOWN, '3'], ['Hard', UNSURE, '2']].map(([label, g, key]) => {
    const b = document.createElement('button'), k = document.createElement('kbd');
    b.type = 'button'; b.dataset.g = g; b.onclick = () => rate(g, 'pick'); k.textContent = key; b.append(label, k);
    return b;
  }));
  rateBar.append(rateFill); rateBox.append(rateBar, col);
  function column(c) {
    C = c;
    for (const b of col.children) { const on = +b.dataset.g === c.rec; b.classList.toggle('def', on); b.title = on ? 'Enter' : ''; }
    rateBar.hidden = !c.timed;
    (document.querySelector('.app.nomap') ? document.body : $('stage')).append(rateBox);
    if (c.timed) {
      c.end = performance.now() + RATE_TIME;
      c.timer = setTimeout(() => { if (C === c) rate(null, 'time'); }, RATE_TIME);
      const run = () => { if (C !== c) return; rateFill.style.transform = `scaleY(${Math.max(0, (c.end - performance.now()) / RATE_TIME)})`; c.raf = requestAnimationFrame(run); };
      run();
    }
    if (S && game.def && game.def.review) showStats();
  }
  // An answer's column, once all its members are answered, or a Retry round's replays: the round goes on at once, or
  // once it is rated (the review waits for it; Pick in 4 s after the last question on the page).
  function after(go) {
    const c = hand || (pend.length ? { items: pend.map(key => ({ key })), rec: UNSURE, wait: true, timed: true } : null);
    hand = null; pend = [];
    if (!c) { go(); return; }
    column(c);
    if (c.wait || (game.def.review && !game.round.asked() && !S.rounds.length)) c.go = go; else go();
  }
  // The column closed: g picked, or (null) the one filled. how: 'pick' (a button or key, or a click elsewhere), 'time'
  // (its 4 s), 'next' (the next question answered), 'quiet' (the round ended or begun anew, the page left: the round
  // doesn't go on from here).
  function rate(g, how) {
    const c = C || (pend.length ? { items: pend.map(key => ({ key })), rec: UNSURE } : null);
    if (!c) return;
    C = null; pend = [];
    clearTimeout(c.timer); cancelAnimationFrame(c.raf);
    rateBox.remove();
    const final = g ?? c.rec, now = Date.now(), said = how === 'pick' || how === 'time';
    for (const it of c.items) {
      const card = SRS.answer(page, it.key, final, it.at ?? now, g != null || !it.first, it.at != null);
      if (it.si == null) { if (card && said && game.def && game.def.review) screens.question.said(null, null, [`Next ${SRS.until(card.d, now)}`]); continue; }
      settle(it, final);
      if (said && S && game.def && game.def.review) screens.question.said(SAID[final], null, card ? [`Next ${SRS.until(card.d, now)}`] : []);
    }
    if (S && game.def && game.def.review) showStats();
    if (said && c.go) c.go();
  }
  // A grade given by hand, in the review's records: its result, the ticks, and its colour on the map if it is the last
  // answer there.
  function settle(it, g) {
    const was = S.res[it.si];
    if (it.first && was !== g) { S.n[Math.min(was, KNOWN)]--; S.n[Math.min(g, KNOWN)]++; }
    S.res[it.si] = g;
    if (S.chain && it.ri != null) SRS.rerun(it.ri, g);
    if (S.prev && S.prev.key === it.key) { map.mark(S.prev.areas, RESULT, false); S.prev.cls = RESULT[CLASS[g]]; map.mark(S.prev.areas, S.prev.cls); }
  }
  // The keys 4, 3, 2 and Enter, while the column is open. With the next question asked (Pick in 4 s), only where its
  // way to answer takes no keys, and never in a field.
  const KEYLESS = new Set(['map', 'free', 'pairs']);
  addEventListener('keydown', e => {
    if (!C || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!C.wait && !C.go && (!game.def || !KEYLESS.has(game.def.play.mode) || (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')))) return;
    const g = e.key === 'Enter' ? (rateBox.contains(e.target) ? null : C.rec) : { 2: UNSURE, 3: KNOWN, 4: INSTANT }[e.key];
    if (g == null) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (!e.repeat) rate(g, 'pick');
  }, true);
  // A click anywhere but the column takes the one filled: one that began while that column was open (Pick in 4 s: the
  // tap that answers the next question opens that answer's column) and moved no more than a tap does (a drag of the
  // map is no click). What it clicked still does its own job; the rating is taken just after, so a tap on the map,
  // ignored while the review waits, never answers the next question as well.
  const TAP = 8; // px
  let down = null;
  addEventListener('pointerdown', e => { down = C && !rateBox.contains(e.target) ? { c: C, x: e.clientX, y: e.clientY } : null; }, true);
  addEventListener('click', e => {
    const d = down; down = null;
    if (!d || C !== d.c || rateBox.contains(e.target) || Math.hypot(e.clientX - d.x, e.clientY - d.y) > TAP) return;
    setTimeout(() => { if (C === d.c) rate(null, 'pick'); });
  }, true);
  addEventListener('pagehide', () => rate(null, 'quiet'));

  /* ---------- Pick at the end: the review's answers in its results, each to be graded again ---------- */
  const listBox = document.createElement('div'); listBox.hidden = true;
  $('rLine').parentElement.after(listBox);
  function results() {
    const [no, unsure, known] = S.chain ? SRS.tally(SRS.run().res) : S.n;
    $('rScore').textContent = `${known} of ${no + unsure + known}`;
    $('rLine').textContent = `${unsure} unsure · ${no} not known · ${fmt((S.tEnd ??= performance.now()) - S.t0)}`;
  }
  function listed() {
    const list = S.chain ? SRS.run().rated || [] : S.list;
    listBox.replaceChildren();
    listBox.hidden = !list.length;
    if (!list.length) return;
    const quizzes = [...new Set(list.map(e => e.q))], titles = quizzes.length > 1 ? Object.fromEntries(quizzes.map(q => [q, SRS.deck(q).t || q])) : null;
    listBox.append(SRS.gradeList(list, (j, g) => {
      if (S.chain) { if (!SRS.regradeRun(j, g)) return false; }
      else {
        const e = S.list[j];
        if (!SRS.regrade(e, g)) return false;
        if (e.f) { S.n[Math.min(S.res[e.si], KNOWN)]--; S.n[Math.min(g, KNOWN)]++; }
        S.res[e.si] = g;
      }
      results();
      return true;
    }, titles));
  }

  function finished(result) {
    // (a rating left open: its filled one; Pick in 4 s carries it on into the page's next round)
    if (!(C && !C.wait && !C.go && result.def.review && !result.ended && S && S.rounds.length)) rate(null, 'quiet');
    listBox.hidden = true;
    const P0 = result.def.play;
    // a perfect round puts its questions on the stack, as cards of the map it was played on
    if (!quiz.single && result.complete && !result.def.retry && result.score === result.n) {
      const n = SRS.add(page, title(), result.items.map(id => rules.cardKey(P0, id, here())), Date.now(), { m: result.def.look.map, ...(map.backShown !== 'quiz' ? { b: map.backShown } : {}) });
      if (n) $('rLine').textContent += ` · +${n} review`;
    }
    syncButtons();
    // a stop of a practice over several quizzes (?run): its round played, on to the next stop after a moment, as a
    // review goes from quiz to quiz; ended early, the practice is over: back to the page it was started on
    if (practiceAt && !result.def.review) {
      $('app').classList.add('moving');
      setTimeout(() => { location.href = SRS.practiceStop(root, result.ended ? Infinity : practiceAt); }, GROUP_PAUSE);
      return;
    }
    // a practice of one quiz from the review page (?practice…&return=): back there once played, or ended early
    if (practiceBack && setup.practice && !result.def.review) {
      $('app').classList.add('moving');
      setTimeout(() => { location.href = practiceBack; }, GROUP_PAUSE);
      return;
    }
    if (!result.def.review || !S || S.leaving) return;
    // a review over several quizzes ended early: over, back to the page it was started on, its result there
    if (result.ended && S.chain) { S.leaving = true; $('app').classList.add('moving'); const r = SRS.run(); r.left = {}; r.again = {}; SRS.setRun(r); setTimeout(() => { location.href = SRS.stopUrl(root, null); }, GROUP_PAUSE); return; }
    if (!result.ended && S.rounds.length) { nextRound(); return; }
    cancelAnimationFrame(raf); bar.hidden = true;
    if (!result.ended && S.chain) { leave(); return; }
    results();
    listed();
    [...$('done').querySelectorAll('.legend li')].forEach((li, i) => { li.lastChild.textContent = ['Known', 'Unsure', '', 'Not known'][i]; });
  }

  // End before anything is answered: a review over several quizzes, or a practice started on the review page, goes
  // back to the page it was started on as well (true: it goes)
  function away() {
    if (practiceAt) { location.href = SRS.practiceStop(root, Infinity); return true; }
    if (practiceBack && setup.practice) { location.href = practiceBack; return true; }
    if (S && S.chain && game.def && game.def.review) { S.leaving = true; const r = SRS.run(); r.left = {}; r.again = {}; SRS.setRun(r); location.href = SRS.stopUrl(root, null); return true; }
    return false;
  }

  syncButtons();
  // ?cards: opened out of sight by the review page, to give old cards their map (stack): done
  if (window.parent !== window && new URLSearchParams(location.search).has('cards')) parent.postMessage('geoquizzes:cards', '*');
  if (new URLSearchParams(location.search).has('review')) queueMicrotask(travel);

  return {
    hooks: { grade, asked, missed, answered, after, finished },
    away,
    active: () => !!(game.def && game.def.review),
    rating: () => !!C,
    look(l) { if (!S) return; S.look = { ...S.look, ...l }; light(game.def.play); if (S.chain) { const r = SRS.run(); r.look = S.look; SRS.setRun(r); } },
  };
}
