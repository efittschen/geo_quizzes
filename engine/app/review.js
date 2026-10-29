// The review, as it runs on a page (the rules: model/review.js; the cards and their schedule: srs.js, storage.schedule).
//
// Due and All beside the page's title start a review of this page's cards: the due ones, or all of them. A review over
// several quizzes, started on the review page or a country page, comes here as ?review=1 and asks three of this page's
// cards drawn at random, then goes on to the next quiz the run draws. Every question has a clock: a bar under it that
// runs down to the time limit, green while a right answer still counts as known, a notch where "easy" ends and one where
// "known" ends; run out, the answer shows and must still be given. A card not known comes back at the end of the review;
// asked again (a replay), answered right it is rated by hand: Easy, Good or Hard in a column over the map (the keys 4,
// 3, 2; Enter: Hard), Hard when its bar runs out, and nothing goes on until then. Only a card's first answer counts for
// the review's result and the day's count. Only the last answer stays coloured on the map, and the areas of everything
// learned so far stay lit, so the map gives nothing away. A map picked during a review is the one for the rest of it.
// Ordinary rounds count too, quietly, for cards on the stack: a wrong try is "not known", a first-try answer within the
// known time "known"; a perfect round puts its questions on the stack.
//
//   const review = makeReview(deps)   (deps.play(def): a round started as the App starts one)
//   review.hooks          what the Game asks of it (game.review): grade, asked, missed, answered, after, finished
//   review.look(look)     a map picked during the review: for the rest of it
//   review.active()       a review is being played

const RATE_TIME = 4000, LEAD = 1500, GROUP_PAUSE = 700;

export function makeReview({ quiz, model, map, game, storage, screens, setup, play, root, srs: SRS }) {
  const { $, feedback, fmt } = screens.ui, rules = model.review, page = storage.page;
  const { MISSED, UNSURE, KNOWN, INSTANT } = SRS, CLASS = [3, 1, 0, 0], RESULT = ['got', 't2', 't3', 'miss'];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const here = () => rules.lookOf({ map: game.def.look.map, back: map.backShown });
  const cardFor = (P, id, look) => SRS.keyOf(page, rules.cardKey(P, id, look));
  const how = () => ({ chosen: setup.look, asked: setup.asked ? setup.asked() : [] });
  const stack = () => rules.stack(SRS, storage, how());
  const title = () => (document.querySelector('.brand h1') || {}).textContent || document.title;
  let S = null, P = null, raf = 0, pend = [], R = null;

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
      res: [], total: keys.length, n: [0, 0, 0], counted: new Set(),
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
  function nextRound() {
    const { play: key, ids, way } = S.rounds.shift(), P0 = model.kinds.playOf(key), fb = $('fb');
    S.way = way;
    // a new round clears the panel and the map; the last answer and what was said of it stay
    const said = S.asked ? [fb.className, [...fb.childNodes]] : null;
    play({ play: P0, items: ids, retry: true, review: true, look: { map: way.map, back: way.back, ...lookFor(way) }, t0: S.t0 });
    if (P0.kind.dim !== false) map.dim(S.lit(P0));
    const label = $('sScore').nextElementSibling; if (label) label.textContent = 'Known';
    if (said) { fb.className = said[0]; fb.replaceChildren(...said[1]); }
    if (S.prev) map.mark(S.prev.areas, S.prev.cls);
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
    const state = res.length + '/' + total;
    if (state === shown && ticks.children.length === total) return;
    shown = state;
    ticks.replaceChildren(...Array.from({ length: total }, (_, i) => { const t = document.createElement('i'); t.className = i < res.length ? RESULT[CLASS[res[i]]] : i === res.length ? 'now' : ''; return t; }));
  }

  /* ---------- several quizzes ---------- */
  let index = null;
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
    rate(UNSURE, false); // (a rating left open by a round begun anew: Hard)
    if (!q) return;
    const P0 = game.def.play, o = SRS.opts(), t = rules.times(P0, q.id, { all: game.round.needAll(), group: q.group }, o);
    // a card asked again after a miss was just shown: never "easy" by the clock
    const key = cardFor(P0, q.id, game.def.review ? S.way.look : here());
    const replay = game.def.review ? (S.chain ? (SRS.run().again[page] || []).includes(key) : S.counted.has(key)) : game.def.retry;
    const easy = replay ? -1 : t.easy;
    if (!game.def.review) { P = { t: performance.now() + (q.pos ? 0 : LEAD), easy, fast: t.known, missed: false }; return; }
    if (S.prev && P0.kind.areas[q.id].some(a => S.prev.areas.includes(a))) unmark(); // (the last answer must not give this one away)
    Object.assign(S, { t: performance.now() + (S.asked ? 0 : LEAD), easy, fast: t.known, limit: t.limit, late: false });
    if (!S.asked) map.home();
    showStats();
    bar.hidden = false;
    bar.style.setProperty('--easy', `${100 - S.easy / S.limit * 100}%`); bar.style.setProperty('--known', `${100 - S.fast / S.limit * 100}%`);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  function tick() {
    if (!game.def || !game.def.review || $('play').hidden) { bar.hidden = true; return; }
    const q = game.round.asked();
    if (q && !q.revealed && !R) { // (no clock while a replay is rated)
      const t = performance.now() - S.t;
      fill.style.transform = `scaleX(${Math.min(1, Math.max(0, 1 - t / S.limit))})`;
      bar.classList.toggle('slow', t > S.fast);
      if (t >= S.limit) { S.late = true; game.timeUp(); }
    }
    raf = requestAnimationFrame(tick);
  }
  function grade(missed) {
    const t = Math.max(0, performance.now() - S.t);
    S.g = rules.grade({ ms: t, wrong: missed, late: S.late, easy: S.easy, known: S.fast });
    S.secs = t / 1000;
    return CLASS[S.g];
  }
  // an ordinary round: the first wrong try on a question counts as not known (once), for its card on the map played
  function missed(id) {
    if (!P || P.missed) return;
    P.missed = true;
    SRS.answer(page, cardFor(game.def.play, id, here()), MISSED, Date.now());
  }
  function answered(id, result, n) {
    const P0 = game.def.play, K = P0.kind, right = result === 0;
    if (!game.def.review) {
      if (n && !right && P) P.missed = false; // (each missed code of a group counts as missed)
      const key = cardFor(P0, id, here()), c = SRS.deck(page).c[key];
      if (!right) missed(id);
      else if (game.def.retry) { if (c && !c.x && P && !P.missed) pend.push(key); } // (the Retry round: a replay, rated by hand)
      else if (P && !P.missed && performance.now() - P.t <= P.fast) SRS.answer(page, key, performance.now() - P.t <= P.easy ? INSTANT : KNOWN, Date.now());
      return null;
    }
    const g = S.g, now = Date.now(), key = cardFor(P0, id, S.way.look); // (the card asked, whatever map is picked meanwhile)
    // a card's first answer in a review is graded by the clock and counts; asked again (a replay): right, rated by hand;
    // wrong, not known again
    const first = S.chain ? SRS.ran(page, key, g) : !S.counted.has(key), replay = !first && g !== MISSED;
    const card = replay ? null : SRS.answer(page, key, g, now);
    if (replay) pend.push(key);
    S.counted.add(key); S.res.push(g); S.asked++;
    if (first) { S.n[Math.min(g, KNOWN)]++; SRS.reviewed(now); }
    if (S.prev) unmark();
    S.prev = { K, id, areas: K.areas[id], cls: RESULT[CLASS[g]] };
    const told = screens.question.told(P0, id);
    queueMicrotask(() => { // (after the Game has said its own)
      screens.question.said(['bad', 'unsure', 'ok', 'ok'][g], g === MISSED ? told : `✓ ${told} · ${S.secs.toFixed(1)} s`, card ? [`Next ${SRS.until(card.d, now)}`] : []);
    });
    if (g === MISSED && !S.chain) {
      if (S.rounds.length) rules.enqueue(S.rounds, P0.key, id, S.way); else { game.round.again(id); $('ticks').append(document.createElement('i')); }
      S.total++;
    }
    queueMicrotask(() => {
      if (!game.def || !game.def.review) return;
      showStats();
      // (map play waits a moment before its results; with more to ask, here or on another page, on at once)
      if (R || game.round.asked() || $('play').hidden) return;
      if (S.rounds.length) nextRound(); else if (S.chain) leave();
    });
    return { replay: !first };
  }

  /* ---------- a replay's rating, by hand ---------- */
  const rateBox = document.createElement('div'), col = document.createElement('div'), rateBar = document.createElement('span'), rateFill = document.createElement('i');
  rateBox.className = 'rv-rate'; rateBox.setAttribute('role', 'group'); rateBox.setAttribute('aria-label', 'Rating');
  col.append(...[['Easy', INSTANT, '4'], ['Good', KNOWN, '3'], ['Hard', UNSURE, '2']].map(([label, g, key]) => {
    const b = document.createElement('button'), k = document.createElement('kbd');
    b.type = 'button'; b.onclick = () => rate(g); k.textContent = key; b.append(label, k);
    if (g === UNSURE) { b.className = 'def'; b.title = 'Enter'; }
    return b;
  }));
  rateBar.append(rateFill); rateBox.append(rateBar, col);
  function after(go) {
    if (!pend.length) { go(); return; }
    R = { keys: pend, go, end: performance.now() + RATE_TIME };
    pend = [];
    (document.querySelector('.app.nomap') ? document.body : $('stage')).append(rateBox);
    R.timer = setTimeout(() => rate(UNSURE), RATE_TIME);
    const run = () => { if (!R) return; rateFill.style.transform = `scaleY(${Math.max(0, (R.end - performance.now()) / RATE_TIME)})`; R.raf = requestAnimationFrame(run); };
    run();
  }
  // the rating given to the replays; on: then go on (not where the round went on without it: Hard then)
  function rate(g, on = true) {
    const r = R || (pend.length ? { keys: pend } : null);
    if (!r) return;
    R = null; pend = [];
    clearTimeout(r.timer); cancelAnimationFrame(r.raf);
    rateBox.remove();
    const now = Date.now();
    for (const key of r.keys) { const card = SRS.answer(page, key, g, now, true); if (card && game.def.review && on) screens.question.said(null, null, [`Next ${SRS.until(card.d, now)}`]); }
    if (on && r.go) r.go();
  }
  addEventListener('keydown', e => {
    if (!R || e.ctrlKey || e.metaKey || e.altKey) return;
    const g = e.key === 'Enter' ? (rateBox.contains(e.target) ? null : UNSURE) : { 2: UNSURE, 3: KNOWN, 4: INSTANT }[e.key];
    if (g == null) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (!e.repeat) rate(g);
  }, true);
  addEventListener('pagehide', () => rate(UNSURE, false));

  function finished(result) {
    rate(UNSURE, false); // (End round while a replay is rated: Hard)
    const P0 = result.def.play;
    // a perfect round puts its questions on the stack, as cards of the map it was played on
    if (!quiz.single && result.complete && !result.def.retry && result.score === result.n) {
      const n = SRS.add(page, title(), result.items.map(id => rules.cardKey(P0, id, here())), Date.now(), { m: result.def.look.map, ...(map.backShown !== 'quiz' ? { b: map.backShown } : {}) });
      if (n) $('rLine').textContent += ` · +${n} review`;
    }
    syncButtons();
    if (!result.def.review || !S || S.leaving) return;
    if (!result.ended && S.rounds.length) { nextRound(); return; }
    cancelAnimationFrame(raf); bar.hidden = true;
    if (!result.ended && S.chain) { leave(); return; }
    const [no, unsure, known] = S.chain ? SRS.tally(SRS.run().res) : S.n;
    $('rScore').textContent = `${known} of ${no + unsure + known}`;
    $('rLine').textContent = `${unsure} unsure · ${no} not known · ${fmt(performance.now() - S.t0)}`;
    [...$('done').querySelectorAll('.legend li')].forEach((li, i) => { li.lastChild.textContent = ['Known', 'Unsure', '', 'Not known'][i]; });
  }

  syncButtons();
  // ?cards: opened out of sight by the review page, to give old cards their map (stack): done
  if (window.parent !== window && new URLSearchParams(location.search).has('cards')) parent.postMessage('geoquizzes:cards', '*');
  if (new URLSearchParams(location.search).has('review')) queueMicrotask(travel);

  return {
    hooks: { grade, asked, missed, answered, after, finished },
    active: () => !!(game.def && game.def.review),
    rating: () => !!R,
    look(l) { if (!S) return; S.look = { ...S.look, ...l }; if (S.chain) { const r = SRS.run(); r.look = S.look; SRS.setRun(r); } },
  };
}
