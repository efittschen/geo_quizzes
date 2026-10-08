// Spaced repetition for the map quizzes ("Review"). Every question of a quiz is a card. A round played perfectly puts
// its questions on the stack; from then on they come back for review: a new card after 1 minute, then after 10
// minutes, and from there after ever longer intervals, without the random spread Anki gives them, so questions
// learned together stay due together.
// Those intervals come from FSRS, the scheduler Anki now recommends, as it is, with nothing added: it keeps a model
// of how well each card is remembered, and schedules it for when the chance of recalling it has fallen to the
// target retention (90%). A card that is missed comes back after a few days, not at the start. Anki's older
// scheduler, SM-2, is the other choice in the settings: fixed factors (good × the card's ease, hard × 1.2).
// Both take a card through the steps the way Anki does: again goes back to the first step, hard repeats the step,
// good moves on, easy ends them. Every answer counts, whenever it is given: there is no waiting for a step to be
// due, and a card asked again after a miss is answered for real.
// A review asks the cards that are due, or all of them ("refresh everything").
// Answers are rated by the clock instead of by buttons (see quizzes/shared/area-review.js), with Anki's four ratings:
//   again  (not known)  a wrong click, or no answer before the time limit
//   hard   (unsure)     right on the first click, but slower than the "known" time
//   good   (known)      right on the first click within the "known" time
//   easy   (instantly)  right on the first click within the "easy" time
// Ordinary rounds count too, for cards on the stack: a wrong click is not known, a quick first-try answer known.
// One review asks at most 50 cards, and at 200 cards reviewed in a day the due ones wait for the next day; both
// limits are settings. Putting new cards on the stack has no limit: players arrive knowing a lot already.
//
// Everything is kept in this browser, through store.js, which says how it is written there. Here it is:
//   a deck, the cards of one quiz page (in the page's record, so quizzes can come and go):
//     { t: page title, c: { '<kind>|<item id>': card } }
//     card  { d: due (ms), i: interval in days, e: ease (SM-2), st, df: stability in days and difficulty (FSRS; a
//             card without them gets them from i and e), l: last answered (ms), n: times it was missed in review,
//             s: its learning step (2, 3…: a new card's first, second… step; 1: the step after a miss, if the
//             settings have one; none once it is in review), x: 1 while its question is missing from the quiz }
//   the settings  { easy, fast, limit }: seconds for "easy", for "known" and for the time limit;
//                 { round, day }: the most cards one review asks, and the most reviewed in a day;
//                 the schedule, named as in Anki's options: { algo: "fsrs" or "sm2", retain: FSRS's target
//                 retention in %, steps: a new card's learning steps in minutes,
//                 restep: the relearning step after a miss in minutes (0: none), max: the longest interval in days,
//                 and for SM-2 only: keep: the new interval after a miss in % of the old one, first: the graduating
//                 interval in days, ease: the starting ease in %, hard: the interval after an unsure answer in % }
//   the day       { d: the day (its start, ms), n: cards reviewed that day }
//   the run       a review over several quizzes (one quiz, a country's quizzes, or all of them):
//                 { back: the page it ends on, t: when it began (ms), total: its cards,
//                   left: { quiz id: [cards still to ask] },
//                   again: { quiz id: [cards that weren't known, asked again at the end] },
//                   res: the cards' first answers in order (0 not known, 1 unsure, 2 known, 3 instantly) }

const SRS = (() => {
  const MISSED = 0, UNSURE = 1, KNOWN = 2, INSTANT = 3; // the answers; as ratings (1 to 4): again, hard, good, easy
  const DAY = 864e5, MINUTE = 6e4;
  const ROLLOVER = 4; // a day starts at 4 am, as in Anki
  const MIN_EASE = 1.3, EASY_BONUS = 1.3, EASY_DAYS = 4; // SM-2, as in Anki: the least ease, and what easy adds
  const OPTS = { easy: 2, fast: 6, limit: 15, round: 50, day: 200, algo: "fsrs", retain: 90, steps: [1, 10], restep: 10, keep: 50, first: 1, ease: 250, hard: 120, max: 36500 };


  // Start (4 am) of the day ts falls in, or of the day n days later: by the calendar, so clock changes don't shift it.
  function dayStart(ts, n = 0) {
    const d = new Date(ts);
    d.setHours(d.getHours() - ROLLOVER);
    d.setHours(ROLLOVER, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d.getTime();
  }
  const days = (from, to) => Math.round((dayStart(to) - dayStart(from)) / DAY);

  /* ---------- the schedule ---------- */
  // FSRS-6, the Free Spaced Repetition Scheduler, with its default parameters: the formulas of the reference
  // implementation (open-spaced-repetition/py-fsrs 6.3.2). It keeps two numbers per card: its stability st, the
  // days after which the chance of recalling it has fallen to 90%, and its difficulty df, from 1 to 10. From the
  // days since the last answer it works out that chance (the retrievability), from the answer the new stability and
  // difficulty, and from the stability the interval after which the chance is the target retention.
  const W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
  const DECAY = -W[20], FACTOR = 0.9 ** (1 / DECAY) - 1, MIN_STABILITY = 0.001;
  const AGAIN = 1, HARD = 2, GOOD = 3, EASY = 4; // its ratings
  const within = (x, min, max) => Math.min(max, Math.max(min, x));
  const firstDifficulty = r => W[4] - Math.exp(W[5] * (r - 1)) + 1;
  const retrievability = (t, st) => (1 + FACTOR * t / st) ** DECAY;
  const fsrsInterval = (st, o) => within(Math.round(st / FACTOR * ((o.retain / 100) ** (1 / DECAY) - 1)), 1, o.max);
  // The memory of a card after an answer. Asked again the same day, its stability changes by the short-term rule.
  function remember(card, g, now) {
    const r = g + 1, t = days(card.l, now), st = card.st, df = card.df, recalled = retrievability(t, st);
    const sameDay = Math.exp(W[17] * (r - 3 + W[18])) * st ** -W[19]; // a right answer never lowers the stability
    if (t < 1) card.st = st * (r === AGAIN ? sameDay : Math.max(1, sameDay));
    else if (r === AGAIN) card.st = Math.min(W[11] * df ** -W[12] * ((st + 1) ** W[13] - 1) * Math.exp((1 - recalled) * W[14]), st / Math.exp(W[17] * W[18]));
    else card.st = st * (1 + Math.exp(W[8]) * (11 - df) * st ** -W[9] * (Math.exp((1 - recalled) * W[10]) - 1) * (r === HARD ? W[15] : 1) * (r === EASY ? W[16] : 1));
    card.st = Math.max(MIN_STABILITY, card.st);
    card.df = within(W[7] * firstDifficulty(EASY) + (1 - W[7]) * (df + (10 - df) * -W[6] * (r - 3) / 9), 1, 10);
  }
  // A card without that memory gets one: a card in review that SM-2 scheduled, by FSRS's own conversion (the
  // stability its interval stands for at 90%, the difficulty its ease stands for); any other as a new card whose
  // first answer was known, which is how cards get on the stack.
  const learned = card => Object.assign(card, { st: W[GOOD - 1], df: within(firstDifficulty(GOOD), 1, 10) });
  function recollect(card) {
    if (card.st != null && card.df != null) return;
    if (card.s || !(card.i >= 1) || !(card.e > 1)) { learned(card); return; }
    card.st = Math.max(card.i, MIN_STABILITY);
    card.df = within(11 - (card.e - 1) / (Math.exp(W[8]) * card.st ** -W[9] * (Math.exp(0.1 * W[10]) - 1)), 1, 10);
  }

  // A new card: on its first learning step, or in review at once if the settings have no steps.
  function fresh(now) {
    const o = opts(), card = { i: o.first, e: o.ease / 100, l: now, n: 0 };
    if (o.algo === "fsrs") { learned(card); card.i = fsrsInterval(card.st, o); }
    return o.steps.length ? { ...card, d: now + o.steps[0] * MINUTE, s: 2 } : { ...card, d: dayStart(now, card.i) };
  }
  // An answer to a card, by the scheduler of the settings: FSRS, or SM-2 (Anki's older one), each as it is in Anki.
  // Both take a card through its steps the same way (s: 2, 3… a new card's; 1: the one after a miss): not known goes
  // back to the first step, unsure repeats the step (the first one after the mean of it and the second, or 1.5 × it
  // if it is the only one), known moves on to the next step, or after the last one into review with the card's
  // interval, and instantly goes into review at once.
  function grade(card, g, now) {
    const o = opts(), fsrs = o.algo === "fsrs";
    if (fsrs) { recollect(card); remember(card, g, now); }
    const intoReview = () => { delete card.s; if (fsrs) card.i = fsrsInterval(card.st, o); card.d = dayStart(now, card.i); };
    if (card.s) {
      const after = card.s === 1, steps = (after ? [o.restep] : o.steps).filter(m => m > 0), at = after ? 0 : card.s - 2;
      if (!steps.length || (at >= steps.length && g !== MISSED) || g === INSTANT || (g === KNOWN && at + 1 >= steps.length)) {
        if (!fsrs && !after && g === INSTANT) card.i = Math.max(card.i, EASY_DAYS);
        intoReview();
      } else if (g === MISSED) { if (!after) card.s = 2; card.d = now + steps[0] * MINUTE; }
      else if (g === UNSURE) card.d = now + (at > 0 ? steps[at] : steps.length > 1 ? (steps[0] + steps[1]) / 2 : steps[0] * 1.5) * MINUTE;
      else { card.s = at + 3; card.d = now + steps[at + 1] * MINUTE; }
    } else if (g === MISSED) {
      // A lapse. FSRS has lowered the stability by its rule for a forgotten card; SM-2 keeps a share of the interval
      // (none, in Anki) and lowers the ease. The card is learned again first if the settings have a step for that.
      card.n = (card.n || 0) + 1;
      if (!fsrs) Object.assign(card, { e: Math.max(MIN_EASE, card.e - 0.2), i: Math.max(1, Math.floor(card.i * o.keep / 100)) });
      if (o.restep) { card.s = 1; card.d = now + o.restep * MINUTE; if (fsrs) card.i = fsrsInterval(card.st, o); } else intoReview();
    } else if (fsrs) intoReview();
    else {
      const ivl = card.i, ease = card.e, hard = o.hard / 100;
      card.e = Math.max(MIN_EASE, ease + [0, -0.15, 0, 0.15][g]);
      if (card.d > now) {
        // Reviewed before it was due: only the days that really passed count, and known never shortens the interval.
        const passed = Math.max(0, ivl - days(now, card.d));
        card.i = Math.floor(Math.max(1, g === UNSURE ? Math.max(ivl * hard / 2, passed * hard) : Math.max(ivl, passed * ease) * (g === INSTANT ? (EASY_BONUS + 1) / 2 : 1)));
      } else {
        // Unsure: 1.2 × the interval. Known: the interval (plus half the days overdue) × ease. Instantly: the interval
        // (plus the days overdue) × ease × 1.3. Each a day more at least than the one before.
        const late = days(card.d, now), slow = Math.max(hard > 1 ? ivl + 1 : 1, Math.floor(ivl * hard));
        const good = Math.max(slow + 1, Math.floor((ivl + Math.floor(late / 2)) * ease));
        card.i = g === UNSURE ? slow : g === KNOWN ? good : Math.max(good + 1, Math.floor((ivl + late) * ease * EASY_BONUS));
      }
      card.i = Math.min(card.i, o.max);
      card.d = dayStart(now, card.i);
    }
    if (!fsrs) { delete card.st; delete card.df; } // SM-2 doesn't keep them up: FSRS would work them out anew
    card.l = now;
    return card;
  }

  /* ---------- decks: the cards of one quiz page ---------- */
  const cards = (list, as) => Object.fromEntries(Object.entries(list).map(([k, c]) => [k, as(c)]));
  function deck(id) { const r = STORE.quiz(id); return { t: r.title || "", c: cards(r.cards || {}, STORE.cardIn) }; }
  function save(id, d) { STORE.setQuiz(id, r => { if (d.t) r.title = d.t; r.cards = cards(d.c, STORE.cardOut); }); }
  function remove(id) { STORE.setQuiz(id, r => { delete r.cards; }); }
  const decks = () => STORE.quizIds().filter(id => STORE.quiz(id).cards).map(id => ({ id, ...deck(id) }));
  // Cards that can be asked (their question is still in the quiz), and the ones due now, longest due first.
  const all = d => Object.keys(d.c).filter(k => !d.c[k].x);
  const due = (d, now) => all(d).filter(k => d.c[k].d <= now).sort((a, b) => d.c[a].d - d.c[b].d);
  function stats(d, now) {
    const keys = all(d), times = keys.map(k => d.c[k].d);
    return { total: keys.length, due: times.filter(t => t <= now).length, next: times.reduce((m, t) => Math.min(m, t), Infinity) };
  }
  // A review's cards, out of these decks: [{ id, key }]. The due ones, longest due first, as many as the limits per
  // review and per day allow. Or, with every, out of all cards those not answered for longest (the limit per review
  // only), so that asking for all again goes on through the stack. Cards that tie are picked at random.
  function pick(list, every, now) {
    const o = opts(), cap = every ? o.round : Math.min(o.round, dayLeft(now));
    return shuffle(list.flatMap(d => (every ? all(d) : due(d, now)).map(k => ({ id: d.id, key: k, at: every ? d.c[k].l : d.c[k].d }))))
      .sort((a, b) => a.at - b.at).slice(0, cap);
  }
  // Cards reviewed today (a day starts at 4 am), how many more the day's limit allows, and counting one.
  const today = now => { const t = STORE.review().day; return t && STORE.ms(t.date) === dayStart(now) ? t.reviewed : 0; };
  const dayLeft = now => Math.max(0, opts().day - today(now));
  const reviewed = now => { const n = today(now) + 1; STORE.setReview(r => { r.day = { date: STORE.time(dayStart(now)), reviewed: n }; }); };
  // Put questions on the stack (those not on it yet), at a new card's first step: due in a minute. Returns how many.
  function add(id, title, keys, now) {
    const d = deck(id); let n = 0;
    for (const k of keys) if (!d.c[k]) { d.c[k] = fresh(now); n++; }
    if (n) { d.t = title; save(id, d); }
    return n;
  }
  function answer(id, key, g, now) {
    const d = deck(id), card = d.c[key];
    if (!card) return null;
    grade(card, g, now); save(id, d);
    return card;
  }

  /* ---------- across quizzes: a review of one quiz, one country or everything ---------- */
  // The decks whose quiz is in data/quizzes.json (its "quizzes"), with their numbers; longest due first.
  function overview(quizzes, now) {
    const byId = new Map(quizzes.filter(q => q.url).map(q => [q.id, q]));
    return decks().filter(d => byId.has(d.id))
      .map(d => ({ id: d.id, quiz: byId.get(d.id), title: d.t || byId.get(d.id).title, ...stats(d, now) }))
      .filter(d => d.total).sort((a, b) => a.next - b.next);
  }
  // A review over several quizzes is shuffled in groups: a card can only be asked on its own quiz's page (its map),
  // and every change of page has to load, so a page asks a few of its cards before the review moves on to a quiz
  // picked at random (see area-review.js). Cards that weren't known are asked again at the end, until they are.
  const GROUP = 3; // cards asked on a quiz's page before the review may move to another
  const run = () => ({ back: "review.html", t: Infinity, total: 0, left: {}, again: {}, res: [], ...STORE.review().run });
  const setRun = r => STORE.setReview(v => { v.run = r; });
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // The run's cards still to ask, per quiz: [{ id, quiz, keys }]. Once every card has been asked, those that weren't
  // known. Quizzes that are not (or no longer) listed in data/quizzes.json are left out, and so are cards whose
  // question is gone.
  function pools(quizzes) {
    const r = run(), byId = new Map(quizzes.filter(q => q.url).map(q => [q.id, q]));
    const pool = lists => decks().filter(d => byId.has(d.id))
      .map(d => ({ id: d.id, quiz: byId.get(d.id), keys: (lists[d.id] || []).filter(k => d.c[k] && !d.c[k].x) })).filter(p => p.keys.length);
    const first = pool(r.left);
    return first.length ? first : pool(r.again);
  }
  // The quiz of a card drawn at random from those left: a quiz with more cards left comes up more often.
  function draw(list) {
    let n = Math.random() * list.reduce((sum, p) => sum + p.keys.length, 0);
    return list.find(p => (n -= p.keys.length) < 0) || null;
  }
  // The quiz whose page the run goes to next, or null when the run is over.
  const nextStop = quizzes => draw(pools(quizzes));
  // On the page of quiz id: its cards to ask now, in order, and the quiz to go to afterwards (null: no cards left
  // anywhere else). A group of this quiz's cards, picked at random (all of them if it has no more than a group left),
  // then the draw of the next quiz; if that is this quiz again, another group follows at once.
  function stretch(quizzes, id) {
    const list = pools(quizzes), mine = list.find(p => p.id === id), keys = [];
    if (!mine) return { keys, next: draw(list) };
    mine.keys = shuffle(mine.keys);
    for (;;) {
      keys.push(...mine.keys.splice(0, GROUP));
      const pool = draw(list);
      if (pool !== mine) return { keys, next: pool };
    }
  }
  // Note an answer given in the run. Returns whether it was the card's first answer in it (those make its result).
  function ran(id, key, g) {
    const r = run(), again = r.again[id] || [], first = !again.includes(key);
    if (first) r.res.push(g);
    r.left[id] = (r.left[id] || []).filter(k => k !== key);
    r.again[id] = g === MISSED ? [...again.filter(k => k !== key), key] : again.filter(k => k !== key);
    setRun(r);
    return first;
  }
  // [not known, unsure, known] among answers (a run's res); instantly is known too.
  const tally = res => [MISSED, UNSURE, KNOWN].map(g => res.filter(x => Math.min(x, KNOWN) === g).length);
  // The address of a quiz in review mode (…?review), or of the page the run ends on (…?done). root: the site.
  function stopUrl(root, stop) {
    const u = new URL(stop ? stop.quiz.url : run().back, root);
    u.searchParams.set(stop ? "review" : "done", "1");
    return u.href;
  }
  // Start a run over the quizzes with these ids (null: all of them) and return the address to open first.
  // all: out of every learned card instead of only the due ones (see pick); back: the page to end on.
  function startRun(root, quizzes, { ids = null, all: every = false, back = "review.html" } = {}) {
    const now = Date.now(), listed = new Set(quizzes.filter(q => q.url).map(q => q.id)), left = {};
    const cards = pick(decks().filter(d => listed.has(d.id) && (!ids || ids.includes(d.id))), every, now);
    for (const c of cards) (left[c.id] ||= []).push(c.key);
    setRun({ back, t: now, total: cards.length, left, again: {}, res: [] });
    return stopUrl(root, nextStop(quizzes));
  }

  // The settings' names in store.js.
  const KEPT_AS = [["easy", "easy"], ["fast", "known"], ["limit", "limit"], ["round", "perReview"], ["day", "perDay"], ["algo", "scheduler"], ["retain", "retention"],
    ["steps", "steps"], ["restep", "missStep"], ["keep", "kept"], ["first", "firstInterval"], ["ease", "ease"], ["hard", "unsure"], ["max", "longest"]];
  function opts() {
    const kept = STORE.settings(), o = { ...OPTS };
    for (const [here, there] of KEPT_AS) if (kept[there] != null) o[here] = kept[there];
    const sane = (key, min, max = Infinity) => { if (!(o[key] >= min && o[key] <= max)) o[key] = OPTS[key]; };
    sane("fast", 1); sane("round", 1); sane("day", 1);
    if (!(o.limit > o.fast)) o.limit = Math.max(OPTS.limit, o.fast * 2);
    if (!(o.easy >= 0 && o.easy < o.fast)) o.easy = Math.min(OPTS.easy, o.fast / 2); // 0: no answer is "easy"
    if (o.algo !== "sm2") o.algo = "fsrs";
    if (!Array.isArray(o.steps) || !o.steps.every(m => m > 0)) o.steps = OPTS.steps;
    sane("retain", 70, 97); sane("restep", 0); sane("keep", 0, 100); sane("first", 1); sane("ease", MIN_EASE * 100); sane("hard", 50); sane("max", 1);
    return o;
  }
  const setOpts = o => STORE.setSettings(s => { for (const [here, there] of KEPT_AS) if (o[here] != null) s[there] = o[here]; });
  // Back to the defaults, for these settings.
  const resetOpts = keys => STORE.setSettings(s => { for (const [here, there] of KEPT_AS) if (keys.includes(here)) delete s[there]; });

  // How long until ts: "now", "in 10 min", "tomorrow", "in 5 days".
  function until(ts, now) {
    if (ts <= now) return "now";
    const n = days(now, ts);
    if (n < 1) { const m = Math.ceil((ts - now) / MINUTE); return m < 60 ? `in ${m} min` : `in ${Math.round(m / 60)} h`; }
    return n === 1 ? "tomorrow" : n < 60 ? `in ${n} days` : n < 730 ? `in ${Math.round(n / 30.4)} months` : `in ${(n / 365).toFixed(1)} years`;
  }

  return { MISSED, UNSURE, KNOWN, INSTANT, grade, deck, save, remove, decks, all, due, stats, pick, today, dayLeft, reviewed, add, answer, overview, run, setRun, nextStop, stretch, ran, tally, stopUrl, startRun, opts, setOpts, resetOpts, until, dayStart, days };
})();
