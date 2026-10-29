// The Game: a round played. It holds the running Round (the Model's) and the answer mode in use: it asks each question
// (the format shows it, the mode takes the answer), hands each answer to the Round, shows what came of it on the map,
// logs it, and goes on, or ends the round. The screens hear of it through events.
//
//   const game = createGame({ quiz, model, map, storage, formats })
//   game.play(def, mode, opts)    a round: def { play, items, retry, review, look: { map, back }, box, t0 }; mode: the
//                                 answer mode (modes.make); opts: { hints, letters, hard } (the setup's options)
//   game.answer(input)            what the mode was given (see model/round.js); -> the outcome
//   game.match(question, tile)    Pairs: a pair picked
//   game.giveUp(), game.timeUp()  Type code's Give up; a review's time run out (the answer shown, still to be given)
//   game.stop()                   End round: the results of what was answered
//   game.round, game.def, game.mode, game.asked
//   game.on(event, fn)            'start' (def), 'ask' (question), 'outcome' (outcome), 'done' (result)
//   game.review                   the review's side, set by it: { grade(missed), asked(q), missed(id), answered(id,
//                                 result, members), after(go), finished(result, ended) }; null: none

const RESULT = ['got', 't2', 't3', 'miss'], FRESH_MS = 700;

export function createGame({ quiz, model, map, storage, formats }) {
  const listeners = {};
  const emit = (event, value) => { for (const f of listeners[event] || []) f(value); };
  let round = null, def = null, mode = null, format = null, opts = {}, asked = null, askedAt = 0, back = null, ending = 0, lastTap = 0, lastPoint = null;
  const now = () => performance.now();
  const K = () => def.play.kind;

  function play(d, m, o = {}) {
    clearTimeout(ending);
    if (mode) mode.close();
    def = { ...d, look: { ...d.look } };
    const P = def.play;
    // (a way other than the map answers on a city quiz's dots, not by distance; a shape is asked without a map: its
    // results and cards are the quiz map's; a page of one round is played by distance on its own background)
    if (P.way !== 'map' && def.look.map === 'free') def.look.map = 'quiz';
    if (P.format === 'shape') def.look.map = 'quiz';
    if (quiz.single) { def.look.map = 'free'; def.look.back = quiz.back || def.look.back; }
    mode = m; opts = o; format = formats.of(P);
    round = model.round({ play: P, items: def.items, retry: def.retry, review: def.review, look: def.look, t0: def.t0 });
    map.use(def.look.map); layout(); map.back(def.look.back || 'quiz'); map.clear();
    if (def.box && !map.plain()) map.frame(def.box);
    map.dim(K().dim === false ? map.ids : def.items.flatMap(id => K().areas[id]));
    emit('start', def);
    if (quiz.board) map.frame(def.box);
    if (P.mode === 'pairs') board(); else ask();
  }
  function layout() { map.draw(def.play.drawn, { hints: opts.hints, letters: opts.letters, asking: true }); }

  function ask() {
    asked = round.asked();
    if (!asked) return;
    askedAt = now();
    map.highlight(null);
    if (back) { map.setView(back); back = null; } // (the view before it flew to a shown answer)
    format.show(asked.id, asked);
    const next = round.queue[asked.pos + (asked.group ? asked.group.length : 1)];
    if (next !== undefined) format.ahead(next);
    mode.ask(asked.id, asked);
    emit('ask', asked);
    if (game.review) game.review.asked(asked);
  }
  function board() {
    const b = round.board();
    if (!b) return;
    asked = round.asked(); askedAt = now();
    mode.board(b);
    emit('ask', asked);
    if (game.review) game.review.asked(asked);
  }

  const grade = () => (game.review && def.review ? game.review.grade : null);
  function answer(input) {
    if (!round || !asked || rating) return null;
    if ('point' in input) { // (a broken point, or a double click's second: no answer)
      if (!Number.isFinite(input.point.x + input.point.y) || now() - lastTap < 350) return null;
      lastTap = now(); lastPoint = input.point;
    }
    const out = round.answer(input, grade());
    if (out) handle(out);
    return out;
  }
  function match(question, tile) {
    if (!round || rating) return null;
    const out = round.match(question, tile, grade());
    if (out) handle(out);
    return out;
  }
  function giveUp() {
    if (!round || !asked || rating) return null;
    const out = round.giveUp(grade());
    if (out) { if (out.gaveUp && game.review && !def.review) game.review.missed(asked.id); handle(out); }
    return out;
  }
  function timeUp() {
    const out = round && round.reveal();
    if (!out) return;
    if (def.look.map !== 'free') map.mark(out.rest, 'ans');
    showAnswer(out.rest);
    map.highlight(out.rest);
    emit('outcome', { ...out, late: true });
  }
  function showAnswer(rest) {
    if (map.onStreet() && !map.overlaid()) map.frameAreas(K().areas[asked.id]);
    else { const was = map.reveal(rest, def.review); if (was) back = was; }
  }

  function handle(out) {
    const k = K(), P = def.play;
    if (out.kind === 'wrong') {
      if (out.counted && game.review && !def.review) game.review.missed(out.id);
      if (out.revealed && out.rest) { map.mark(out.rest, 'ans'); map.highlight(out.rest); showAnswer(out.rest); }
      emit('outcome', out);
      return;
    }
    if (out.kind === 'more' && out.found !== undefined) {
      if (out.fresh) {
        map.mark([out.found], ['ans', 'flash'], false); map.mark([out.found], 'found');
        map.mark([out.found], 'rare', !!(k.rare && k.rare(out.id, out.found)));
        map.tag(k, out.found, out.id, true);
        if (round.asked().revealed) map.highlight(round.rest());
      }
      emit('outcome', out);
      return;
    }
    if (out.kind !== 'right') { emit('outcome', out); return; }
    const cls = RESULT[out.result], fresh = P.fresh || k.fresh;
    if (fresh || opts.hard) map.fade(0, opts.hard);
    for (const m of out.members) {
      map.mark(k.areas[m], ['ans', 'flash', 'found', 'pick', ...RESULT], false); map.mark(k.areas[m], cls);
      if (k.rare) for (const a of k.areas[m]) map.mark([a], 'rare', !!k.rare(m, a));
      map.label(k, m);
    }
    if (fresh || opts.hard) map.fade(FRESH_MS, opts.hard);
    format.answered(out.id, cls);
    if (out.km !== undefined) { // map play: the tap joined to the place, both in view
      const A = map.area(k.areas[out.id][0]), v = map.view();
      map.guess(lastPoint, { x: A.lx, y: A.ly });
      if (A.lx < v.x || A.lx > v.x + v.w || A.ly < v.y || A.ly > v.y + v.h) map.framePoints([lastPoint, { x: A.lx, y: A.ly }]);
    }
    if (k.pin) map.pin(k.pin(out.id));
    formats.say(P, out.id);
    const ms = now() - askedAt;
    out.members.forEach((m, n) => {
      const seen = game.review ? game.review.answered(m, out.result, n) : null;
      log(m, out, ms, !!(seen && seen.replay));
    });
    if (P.mode === 'pairs') askedAt = now(); // (the next pair's clock starts)
    emit('outcome', out);
    onward(() => {
      if (P.mode === 'pairs') { if (out.cleared) { if (round.asked()) ending = setTimeout(board, 450); else ending = setTimeout(finish, 450); } return; }
      if (round.asked()) ask();
      else if (def.look.map === 'free') ending = setTimeout(finish, 1500);
      else finish();
    });
  }

  // On from an answer: at once, or once a replay among it is rated (the review's side holds it meanwhile).
  let rating = false;
  function onward(go) {
    if (!game.review) return go();
    rating = true;
    game.review.after(() => { rating = false; go(); });
  }

  // The answer log: one row per question, once its result is known.
  function log(id, out, ms, replay) {
    const k = K(), P = def.play;
    const r = 'pct' in out ? (out.result === 0 ? 0 : 3) : out.km !== undefined ? (out.single ? out.result : out.cls) : P.mode === 'pairs' ? Math.min(out.wrongs, 3) : out.revealed ? 3 : Math.min(out.wrongs, 3);
    const given = (out.given || []).filter(x => x != null && x !== id), items = given.filter(x => !String(x).startsWith('"'));
    storage.log({
      kind: k.key, item: id, look: def.look.map + (def.look.back && def.look.back !== 'quiz' ? '+' + def.look.back : ''),
      mode: P.way === 'map' ? (k.typed ? (k.choices ? 'list' : 'type') : 'map') : P.way,
      review: !!def.review, replay: def.review ? replay : !!def.retry, r, ms,
      v: 'pct' in out ? out.pct : out.km !== undefined ? [out.points, Math.round(out.km * 10) / 10] : undefined,
      given, names: Object.fromEntries([id, ...items].map(x => [x, labelOf(k, x)])), layer: k.label, card: P.cards + '|' + id,
    });
  }
  // (an item as its card is called on the review page: the question asked, and the first word of what is said of it)
  function labelOf(k, x) {
    try {
      const ask = String(k.prompt === 'text' && k.text ? k.text(x).text : k.prompt === 'photo' ? k.name(x) : k.chip(x)).split(' · ')[0].trim();
      const more = k.prompt === 'photo' || !k.chipTitle ? '' : String(k.chipTitle(x) || '').split(' · ')[0].split(', ')[0].trim();
      return more && !ask.includes(more) ? `${ask} · ${more}` : ask;
    } catch (err) { return String(x); }
  }

  function finish() {
    clearTimeout(ending);
    const k = K(), R = { ...round.result(), retry: def.retry };
    map.highlight(null); map.ask(null);
    for (const id of def.items) map.label(k, id);
    if (opts.hard && !k.fresh) { map.unfade(); R.queue.forEach((id, i) => { if (R.res[i] !== undefined) map.mark(k.areas[id], RESULT[R.res[i]]); }); }
    const kept = def.review ? { prev: null, better: false } : model.results.keep(def.play, R, def.look.map);
    mode.close(); format.hide();
    const result = { ...R, ...kept, def, ended: R.n < R.items.length };
    emit('done', result);
    if (game.review) game.review.finished(result);
  }

  const game = {
    play, answer, match, giveUp, timeUp, layout,
    stop() { if (round) finish(); },
    get round() { return round; }, get def() { return def; }, get mode() { return mode; }, get asked() { return asked; },
    get rating() { return rating; }, get opts() { return opts; },
    on(event, fn) { (listeners[event] ||= []).push(fn); },
    review: null,
  };
  return game;
}
