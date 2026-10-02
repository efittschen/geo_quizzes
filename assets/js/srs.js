// Spaced repetition for the map quizzes ("Review"). Every question of a quiz is a card. A round played perfectly puts
// its questions on the stack; from then on they come back for review on Anki's schedule (its SM-2 scheduler with the
// default settings, without the random spread of intervals, so questions learned together stay due together):
// a new card after 1 minute, then after 10 minutes, then the next day, and from there after ever longer intervals.
// A review asks the cards that are due, or all of them ("refresh everything"): a card asked before it is due is
// rescheduled by Anki's rule for early reviews, so a right answer never shortens its interval, and a card in a
// learning step moves on only once that step's time has passed.
// Answers are graded by the clock instead of by buttons (see quizzes/shared/area-review.js):
//   known      right on the first click, within the "known" time   → Anki's Good
//   unsure     right on the first click, but slower                → Hard
//   not known  a wrong click, or no answer before the time limit   → Again
// Ordinary rounds count too, for cards on the stack: a wrong click is not known, a quick first-try answer known.
// One review asks at most 50 cards, and at 200 cards reviewed in a day the due ones wait for the next day; both
// limits are settings. Putting new cards on the stack has no limit: players arrive knowing a lot already.
//
// Everything is kept in this browser (localStorage), one entry per quiz page, so quizzes can come and go:
//   geoquizzes.srs.deck.<quiz id>  { t: page title, c: { '<kind>|<item id>': card } }
//     card  { d: due (ms), i: interval in days, e: ease, l: last answered (ms), n: times not known,
//             s: its learning step (2: new, the 1 minute step; 3: new, the 10 minute step; 1: relearning after
//             a miss, 10 minutes; none once it is in review), x: 1 while its question is missing from the quiz }
//   geoquizzes.srs.opts            { fast, limit }: seconds for "known" and for the time limit;
//                                  { round, day }: the most cards one review asks, and the most reviewed in a day
//   geoquizzes.srs.day             { d: the day (its start, ms), n: cards reviewed that day }
//   geoquizzes.srs.run             a review over several quizzes (one quiz, a country's quizzes, or all of them):
//                                  { back: the page it ends on, t: when it began (ms), total: its cards,
//                                    left: { quiz id: [cards still to ask] },
//                                    again: { quiz id: [cards that weren't known, asked again at the end] },
//                                    res: the cards' first answers in order (0 not known, 1 unsure, 2 known) }

const SRS = (() => {
  const PREFIX = "geoquizzes.srs.";
  const MISSED = 0, UNSURE = 1, KNOWN = 2;
  const DAY = 864e5, MINUTE = 6e4;
  const ROLLOVER = 4; // a day starts at 4 am, as in Anki
  const EASE = 2.5, MIN_EASE = 1.3, HARD = 1.2, MAX_DAYS = 36500;
  const LEARN = [1, 10], RELEARN = [10]; // steps in minutes: for a new card, and after a miss
  const OPTS = { fast: 6, limit: 15, round: 50, day: 200 };

  const read = k => { try { return JSON.parse(localStorage.getItem(PREFIX + k)); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) {} };

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
  const fresh = now => ({ d: now + LEARN[0] * MINUTE, i: 1, e: EASE, l: now, n: 0, s: 2 });
  function grade(card, g, now) {
    if (card.s) {
      // Learning steps (s: 1 relearning; 2, 3… a new card's). Known moves on to the next step, or after the last one
      // into review with the card's interval; unsure repeats the step (after the mean of it and the next one, or
      // 1.5 × the last); not known goes back to the first step. Right answers before the step is due change nothing.
      const steps = card.s === 1 ? RELEARN : LEARN, at = card.s === 1 ? 0 : card.s - 2;
      if (g === MISSED) { if (card.s > 1) card.s = 2; card.d = now + steps[0] * MINUTE; }
      else if (card.d <= now) {
        if (g === UNSURE) card.d = now + (steps[at] + Math.max(steps[at], steps[at + 1] ?? steps[at] * 2)) / 2 * MINUTE;
        else if (at + 1 < steps.length) { card.s++; card.d = now + steps[at + 1] * MINUTE; }
        else { delete card.s; card.d = dayStart(now, card.i); }
      }
    } else if (g === MISSED) {
      // A lapse: the interval starts over at a day, the ease drops, and the card is relearned first.
      Object.assign(card, { n: (card.n || 0) + 1, e: Math.max(MIN_EASE, card.e - 0.2), i: 1, s: 1, d: now + RELEARN[0] * MINUTE });
    } else {
      const ivl = card.i, ease = card.e;
      if (g === UNSURE) card.e = Math.max(MIN_EASE, ease - 0.15);
      if (card.d > now) {
        // Reviewed before it was due: only the days that really passed count, and known never shortens the interval.
        const passed = Math.max(0, ivl - days(now, card.d));
        card.i = Math.floor(Math.max(1, g === UNSURE ? Math.max(ivl * HARD / 2, passed * HARD) : Math.max(ivl, passed * ease)));
      } else {
        // Unsure: 1.2 × the interval. Known: the interval (plus half the days overdue) × ease. Each a day more at least.
        const hard = Math.max(ivl + 1, Math.floor(ivl * HARD));
        card.i = g === UNSURE ? hard : Math.max(hard + 1, Math.floor((ivl + Math.floor(days(card.d, now) / 2)) * ease));
      }
      card.i = Math.min(card.i, MAX_DAYS);
      card.d = dayStart(now, card.i);
    }
    card.l = now;
    return card;
  }

  /* ---------- decks: the cards of one quiz page ---------- */
  function deck(id) { const d = read("deck." + id); return d && d.c ? d : { t: "", c: {} }; }
  function save(id, d) { write("deck." + id, d); }
  function remove(id) { try { localStorage.removeItem(PREFIX + "deck." + id); } catch (e) {} }
  function decks() {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(PREFIX + "deck.")) { const id = k.slice(PREFIX.length + 5); out.push({ id, ...deck(id) }); }
      }
    } catch (e) {}
    return out;
  }
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
  const today = now => { const t = read("day"); return t && t.d === dayStart(now) ? t.n : 0; };
  const dayLeft = now => Math.max(0, opts().day - today(now));
  const reviewed = now => write("day", { d: dayStart(now), n: today(now) + 1 });
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
  const run = () => ({ back: "review.html", t: Infinity, total: 0, left: {}, again: {}, res: [], ...read("run") });
  const setRun = r => write("run", r);
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
  // [not known, unsure, known] among answers (a run's res).
  const tally = res => [MISSED, UNSURE, KNOWN].map(g => res.filter(x => x === g).length);
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

  function opts() {
    const o = { ...OPTS, ...read("opts") };
    if (!(o.fast >= 1)) o.fast = OPTS.fast;
    if (!(o.limit > o.fast)) o.limit = Math.max(OPTS.limit, o.fast * 2);
    if (!(o.round >= 1)) o.round = OPTS.round;
    if (!(o.day >= 1)) o.day = OPTS.day;
    return o;
  }
  const setOpts = o => write("opts", o);

  // How long until ts: "now", "in 10 min", "tomorrow", "in 5 days".
  function until(ts, now) {
    if (ts <= now) return "now";
    const n = days(now, ts);
    if (n < 1) { const m = Math.ceil((ts - now) / MINUTE); return m < 60 ? `in ${m} min` : `in ${Math.round(m / 60)} h`; }
    return n === 1 ? "tomorrow" : n < 60 ? `in ${n} days` : n < 730 ? `in ${Math.round(n / 30.4)} months` : `in ${(n / 365).toFixed(1)} years`;
  }

  return { MISSED, UNSURE, KNOWN, grade, deck, save, remove, decks, all, due, stats, pick, today, dayLeft, reviewed, add, answer, overview, run, setRun, nextStop, stretch, ran, tally, stopUrl, startRun, opts, setOpts, until, dayStart, days };
})();
