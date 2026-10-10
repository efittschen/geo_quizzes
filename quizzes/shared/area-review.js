// Review mode for the map quizzes: the spaced-repetition side of area-quiz.js, which loads this file (and the
// schedule, ../../assets/js/srs.js) itself, so quiz pages need no changes.
//
// A round played perfectly puts its questions on this page's stack. "Review" on the setup screen asks the ones that
// are due, or all of them, in shuffled order whatever their kind of question. Each card is asked the way the last
// perfect round with it was played: on that map (the quiz map, the overlay, the street map; a city quiz's dots or its
// map by distance) and, in a city quiz, with that background, whatever is chosen on the setup screen now. Every
// perfect round keeps that with its cards, new ones and those on the stack already; for a card not played perfectly
// since, the engine works the map out from the best results (see reviewModes there). Cards asked the same way stay
// together in a review, so the map changes as seldom as it can.
// A review over several quizzes, started on the review page or a country page, is shuffled in groups: a card can
// only be asked on its own quiz's page, and changing page takes a moment, so a page (…?review=1) asks three of its
// cards, picked at random, before the review moves on to another quiz, picked at random too.
// Every question has a clock instead of Anki's four buttons:
//   easy   (instantly)  right on the first click within the "easy" time
//   good   (known)      right on the first click within the "known" time
//   hard   (unsure)     right on the first click, but slower
//   again  (not known)  a wrong click (the answer shows at once: no second try), or the time limit runs out
// A question that wasn't known comes back at the end of the review until it is answered right, and those answers
// count like any other, except that they are never "easy": the answer was just shown. Only the last answer
// stays colored on the map, and the areas of everything learned so far stay lit (not just the ones asked), so the
// map gives nothing away. The review starts from the whole map, and from then on the map stays where the player has
// it; an answer shown outside the view is flown to, and the next question returns. On a page that has only just
// appeared, the first question's clock starts a moment late. A review asks 50 cards at most, and the due ones only
// until 200 cards have been reviewed that day (both are settings on the review page).
//
// Ordinary rounds count too, quietly (no clock is shown), for questions already on the stack: a wrong click, the
// first one already, is "not known", and a first-try answer within the "known" time is "known" (or "instantly").
// A slower right answer changes nothing.
//
// The engine calls learned (after a perfect round), asked, missed, grade, answered and finished; E is what it shares.

window.areaReview = E => {
  const { $, Q, G, KINDS, PAGE, ROOT } = E;
  const { MISSED, UNSURE, KNOWN, INSTANT } = SRS;
  const CLASS = [3, 1, 0, 0]; // answer -> the engine's result class: miss, t2, got, got
  const LEAD = 1500; // ms before the clock starts on a map that has only just appeared
  const cardKey = (kind, id) => kind + '|' + id;
  const pageTitle = () => (document.querySelector('.brand h1') || {}).textContent || document.title;
  let S = null; // the review being played
  let P = null; // an ordinary round's question: { t: when it was asked, easy, fast: the "easy" and "known" times, missed }
  let raf = 0;

  // This page's stack. Cards whose question is no longer in the quiz are kept but set aside (x) until it is back.
  function stack() {
    const deck = SRS.deck(PAGE), items = {}; // card key -> [kind, item id]
    for (const k in KINDS) for (const id of KINDS[k].ids) items[cardKey(k, id)] = [k, id];
    let changed = false;
    for (const c in deck.c) {
      const gone = !items[c];
      if (!!deck.c[c].x !== gone) { if (gone) deck.c[c].x = 1; else delete deck.c[c].x; changed = true; }
    }
    if (changed) SRS.save(PAGE, deck);
    return { deck, items };
  }

  /* ---------- setup screen: Due and All, two small buttons to the right of the title: the due cards, or all of
     this page's ---------- */
  const wrap = document.createElement('div'); wrap.className = 'rv-go'; wrap.id = 'reviewWrap';
  wrap.innerHTML = '<button class="ghost small" id="reviewDue" type="button"></button><button class="ghost small" id="reviewAll" type="button"></button>';
  { const h1 = document.querySelector('.brand h1'), row = document.createElement('div'); row.className = 'brand-row'; h1.replaceWith(row); row.append(h1, wrap); }
  const dueBtn = wrap.querySelector('#reviewDue'), allBtn = wrap.querySelector('#reviewAll');
  function syncButtons() {
    const now = Date.now(), s = SRS.stats(stack().deck, now);
    wrap.hidden = !s.total;
    const limit = !SRS.dayLeft(now); // enough cards reviewed for today
    dueBtn.disabled = !s.due || limit;
    dueBtn.textContent = `Due ${s.due}`; allBtn.textContent = `All ${s.total}`;
    dueBtn.title = !s.total ? '' : !s.due ? `Next ${SRS.until(s.next, now)}` : limit ? 'Daily limit' : ''; // why it can't be pressed
  }
  dueBtn.onclick = () => open('due');
  allBtn.onclick = () => open('all');
  // Cards come due while the setup screen is open (a new card after a minute).
  const syncIfShown = () => { if (!document.hidden && !$('setup').hidden) syncButtons(); };
  document.addEventListener('visibilitychange', syncIfShown);
  setInterval(syncIfShown, 15000);

  // The clock: a bar that runs down to the time limit, green while a right answer still counts as known, with a
  // notch where "easy" ends and one where "known" ends.
  const bar = document.createElement('div'); bar.className = 'rv-timer'; bar.hidden = true;
  const fill = document.createElement('i'); bar.append(fill);
  $('ask').after(bar);

  /* ---------- a review: cards in shuffled order, whatever their kind of question ---------- */
  // The engine plays one kind of question per round, so the shuffled cards are cut into stretches of the same kind,
  // played as rounds one after the other. The panel shows them as one: this file's own ticks, count, streak and time.
  const ticks = document.createElement('div'); ticks.className = 'ticks'; ticks.id = 'rvTicks';
  $('ticks').after(ticks);
  // which: 'due' or 'all' of this page's cards, or 'run': the group of cards drawn for this page in a review over
  // several quizzes ({ keys, next: the quiz to go to afterwards }, see travel).
  function open(which, drawn) {
    const { deck, items } = stack(), run = which === 'run' ? SRS.run() : null;
    // (on its own, a page asks as many of its cards as the limits per review and per day allow: see SRS.pick)
    const keys = run ? drawn.keys.filter(c => items[c]) : E.shuffle(SRS.pick([{ id: PAGE, ...deck }], which === 'all', Date.now()).map(c => c.key));
    if (!keys.length) return false;
    S = {
      chain: !!run, next: run && drawn.next, leaving: false,
      res: [], total: keys.length, n: [0, 0, 0], counted: new Set(), // n: each card's first answer
      // the clock of a review over several quizzes started when the review did
      t0: performance.now() - (run && isFinite(run.t) ? Date.now() - run.t : 0),
      asked: 0, prev: null, rounds: [],
      lit: kind => SRS.all(deck).filter(c => items[c][0] === kind).flatMap(c => KINDS[kind].areas[items[c][1]]),
    };
    // Cards asked the same way stay together, in the order their ways first come up.
    const modeOf = E.reviewModes(), ways = new Map();
    for (const c of keys) { const m = modeOf(...items[c], deck.c[c]), k = m.map + '/' + m.back; (ways.get(k) || ways.set(k, [m, []]).get(k))[1].push(c); }
    for (const [mode, cards] of ways.values()) for (const c of cards) enqueue(...items[c], mode);
    $('app').classList.remove('moving');
    nextRound();
    return true;
  }
  // Put a card at the end of the review: in its last round if that asks the same kind the same way (mode: { map,
  // back }), else in a new one.
  function enqueue(kind, id, mode) {
    const last = S.rounds[S.rounds.length - 1];
    if (last && last[0] === kind && last[2] === mode) last[1].push(id); else S.rounds.push([kind, [id], mode]);
  }
  function nextRound() {
    const [kind, ids, mode] = S.rounds.shift();
    S.mode = mode;
    // A new round clears the panel and the map; the last answer and what was said about it stay.
    const fb = $('fb'), said = S.asked ? [fb.className, [...fb.childNodes]] : null;
    E.start(kind, ids, { retry: true, review: true, ...mode });
    G.t0 = S.t0;
    if (KINDS[kind].dim !== false) E.markOut(S.lit(kind));
    const label = $('sScore').nextElementSibling; if (label) label.textContent = 'Known';
    if (said) { fb.className = said[0]; fb.replaceChildren(...said[1]); }
    if (S.prev) for (const p of E.pathsOf(S.prev.areas)) p.classList.add(S.prev.cls);
    showStats();
  }
  // The review's answers so far, how many cards it has, and how many were known. A review over several quizzes
  // keeps them in its record, so they carry on from page to page.
  function progress() {
    if (!S.chain) return { res: S.res, total: S.total, known: S.n[KNOWN] };
    const run = SRS.run();
    return { res: run.res, total: Math.max(run.total, run.res.length, 1), known: SRS.tally(run.res)[KNOWN] };
  }
  let shown = ''; // what the ticks show
  function showStats() {
    if (!G.review) return;
    const { res, total, known } = progress();
    let streak = 0; while (streak < res.length && res[res.length - 1 - streak] >= KNOWN) streak++;
    $('sQ').textContent = `${Math.min(res.length + 1, total)}/${total}`;
    $('sScore').textContent = known; $('sStreak').textContent = streak;
    const state = res.length + '/' + total;
    if (state === shown && ticks.children.length === total) return;
    shown = state;
    ticks.replaceChildren(...Array.from({ length: total }, (_, i) => {
      const t = document.createElement('i');
      t.className = i < res.length ? E.RESULT_CLASS[CLASS[res[i]]] : i === res.length ? 'now' : '';
      return t;
    }));
  }

  /* ---------- a review over several quizzes, on this page ---------- */
  // Arriving (…?review=1) or going on: ask the cards drawn for this quiz, or move on if there are none.
  let index = null; // the quizzes of data/quizzes.json that aren't hidden, read once; if that fails the review ends with this page
  async function travel() {
    stack(); // sets aside cards whose question is gone, so that none are drawn
    index ||= fetch(ROOT + 'data/quizzes.json').then(r => r.json()).then(j => j.quizzes.filter(q => !q.hidden)).catch(() => [{ id: PAGE, url: location.pathname }]);
    const drawn = SRS.stretch(await index, PAGE);
    if (!open('run', drawn)) location.href = SRS.stopUrl(ROOT, drawn.next);
  }
  // This page's group of cards is asked: on to the next quiz, after a moment in which the last answer stays on
  // screen (the page is kept looking as it does while playing). With no cards left anywhere, those that weren't known
  // are asked again; then the review ends on the page it began on.
  function leave() {
    S.leaving = true;
    $('app').classList.add('moving');
    setTimeout(async () => {
      const stop = S.next || SRS.nextStop(await index);
      if (stop && stop.id === PAGE) travel(); else location.href = SRS.stopUrl(ROOT, stop);
    }, 700);
  }

  // Take the last answer's color (and label) off the map.
  function unmark() {
    const { kind, id, areas } = S.prev;
    for (const p of E.pathsOf(areas)) p.classList.remove(...E.RESULT_CLASS);
    if (kind === G.kind) E.showLabel(kind, id, false);
    S.prev = null;
  }
  function asked() {
    const K = KINDS[G.kind], id = G.queue[G.i], o = SRS.opts();
    // An item with several areas to click gets half the time again for each extra one.
    const k = E.needAll(K, id) ? 1 + (K.areas[id].length - 1) / 2 : 1;
    // A card asked again after a miss was just shown: answering it quickly says nothing, so it is never "easy"
    // (an "easy" time below zero), in a review and in an ordinary round of the missed ones alike.
    const key = cardKey(G.kind, id), shown = G.review ? (S.chain ? (SRS.run().again[PAGE] || []).includes(key) : S.counted.has(key)) : G.retry;
    const easy = shown ? -1 : o.easy * 1000 * k;
    if (!G.review) { P = { t: performance.now() + (G.i ? 0 : LEAD), easy, fast: o.fast * 1000 * k, missed: false }; return; }
    // The last answer must not stay on the map if this question is about the same place.
    if (S.prev && K.areas[id].some(a => S.prev.areas.includes(a))) unmark();
    Object.assign(S, { t: performance.now() + (S.asked ? 0 : LEAD), easy, fast: o.fast * 1000 * k, limit: o.limit * 1000 * k, late: false });
    if (!S.asked) E.home();
    showStats();
    bar.hidden = false;
    bar.style.setProperty('--easy', `${100 - S.easy / S.limit * 100}%`); bar.style.setProperty('--known', `${100 - S.fast / S.limit * 100}%`);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  function tick() {
    if (!G.review || $('play').hidden) { bar.hidden = true; return; }
    if (G.i < G.queue.length && !G.revealed) {
      const t = performance.now() - S.t;
      fill.style.transform = `scaleX(${Math.min(1, Math.max(0, 1 - t / S.limit))})`;
      bar.classList.toggle('slow', t > S.fast);
      if (t >= S.limit) timeUp();
    }
    raf = requestAnimationFrame(tick);
  }
  // Out of time: the answer shows, as after a wrong click, and a click on it moves on.
  function timeUp() {
    const K = KINDS[G.kind], id = G.queue[G.i];
    S.late = true; G.revealed = true;
    const rest = K.areas[id].filter(a => !G.found.has(a));
    if (!E.free()) for (const p of E.pathsOf(rest)) p.classList.add('ans');
    if (E.onStreet()) E.flyTo(K.areas[id]); else E.showAnswer(rest);
    E.mark(rest);
    E.setFeedback($('fb'), 'bad', '✗ Time', `→ ${K.name(id)}`);
  }
  // The engine asks for the answer's result class when a question is done; wrong = a wrong click or a shown answer.
  function grade(wrong) {
    const t = Math.max(0, performance.now() - S.t);
    S.g = wrong || S.late ? MISSED : t <= S.easy ? INSTANT : t <= S.fast ? KNOWN : UNSURE;
    S.secs = t / 1000;
    return CLASS[S.g];
  }
  // An ordinary round: the first wrong click on a question counts as not known (once).
  function missed(id) {
    if (!P || P.missed) return;
    P.missed = true;
    SRS.answer(PAGE, cardKey(G.kind, id), MISSED, Date.now());
  }
  // right: answered on the first try (or, in map play, close).
  function answered(id, right) {
    if (!G.review) {
      if (!right) missed(id);
      else if (P && !P.missed && performance.now() - P.t <= P.fast) SRS.answer(PAGE, cardKey(G.kind, id), performance.now() - P.t <= P.easy ? INSTANT : KNOWN, Date.now());
      return;
    }
    const K = KINDS[G.kind], g = S.g, now = Date.now(), key = cardKey(G.kind, id);
    const card = SRS.answer(PAGE, key, g, now);
    // A card's first answer in a review is the one its result and the day's count go by.
    const first = S.chain ? SRS.ran(PAGE, key, g) : !S.counted.has(key);
    S.counted.add(key); S.res.push(g); S.asked++;
    if (first) { S.n[Math.min(g, KNOWN)]++; SRS.reviewed(now); }
    if (S.prev) unmark();
    S.prev = { kind: G.kind, id, areas: K.areas[id], cls: E.RESULT_CLASS[CLASS[g]] };
    const fb = $('fb'), t = fb.querySelector('.t');
    fb.className = 'feedback ' + ['bad', 'unsure', 'ok', 'ok'][g];
    if (t) t.textContent = g === MISSED ? K.name(id) : `✓ ${K.name(id)} · ${S.secs.toFixed(1)} s`;
    if (card) { const p = document.createElement('p'); p.className = 'c'; p.textContent = `Next ${SRS.until(card.d, now)}`; fb.append(p); }
    if (g === MISSED && !S.chain) {
      // It comes back at the end of the review: in this round if it is the last one, else in a later one.
      // (A review over several quizzes has noted it, and asks it again at its own end.)
      if (S.rounds.length) enqueue(G.kind, id, S.mode); else { G.queue.push(id); $('ticks').append(document.createElement('i')); }
      S.total++;
    }
    queueMicrotask(() => {
      if (!G.review) return;
      showStats(); // after the engine has written its own numbers
      // Map play waits a moment before a round's results; with more to ask, here or on another page, go on at once.
      if (G.i < G.queue.length || $('play').hidden) return;
      if (S.rounds.length) nextRound(); else if (S.chain) leave();
    });
  }

  function finished() {
    syncButtons();
    if (!G.review || S.leaving) return;
    const ended = G.i < G.queue.length; // "End round"
    if (!ended && S.rounds.length) { nextRound(); return; }
    cancelAnimationFrame(raf); bar.hidden = true;
    if (!ended && S.chain) { leave(); return; }
    const [missed, unsure, known] = S.chain ? SRS.tally(SRS.run().res) : S.n;
    $('rScore').textContent = `${known} of ${missed + unsure + known}`;
    $('rLine').textContent = `${unsure} unsure · ${missed} not known · ${E.fmt(performance.now() - S.t0)}`;
    [...$('done').querySelectorAll('.legend li')].forEach((li, i) => { li.lastChild.textContent = ['Known', 'Unsure', '', 'Not known'][i]; });
  }

  // A perfect round: its questions go on the stack, and all of them keep how it was played.
  function learned(kind, ids) {
    const n = SRS.add(PAGE, pageTitle(), ids.map(id => cardKey(kind, id)), Date.now(), E.played());
    if (n) $('rLine').textContent += ` · +${n} review`;
    syncButtons();
  }

  syncButtons();
  // ?review=1: this page's part of a review over several quizzes starts at once. (A moment later, that is: the
  // engine must hold the calls returned below before a round starts.)
  if (new URLSearchParams(location.search).has('review')) queueMicrotask(travel);

  return { learned, asked, missed, grade, answered, finished };
};
