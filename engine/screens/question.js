// The play panel around the question: which question of how many, the first tries (map play: the points), the streak,
// the time, a tick per question in the colour of its result, the hint under the question (a detail; the codes that
// share a place), the feedback of each answer, the sound switch. It follows the Game (game.on).
//
//   const question = makeQuestion(deps)   -> { said(text, lines, cls) }: the review's own lines

const RESULT = ['got', 't2', 't3', 'miss'];

export function makeQuestion({ quiz, map, formats, game, setup, ui }) {
  const { $, plural, feedback, fmt } = ui, fb = $('fb'), sound = $('soundBtn');
  const scoreLabel = $('sScore').nextElementSibling, SCORE = scoreLabel ? scoreLabel.textContent : '';
  const kmText = km => (km < 10 ? km.toFixed(1) : Math.round(km).toLocaleString('en-US')) + ' km';
  const ptsText = n => `${n.toLocaleString('en-US')} ${n === 1 ? 'point' : 'points'}`;
  let timer = 0;
  const free = () => game.def.look.map === 'free';
  // an answer's name as it is told: in a way of its own, with the name answered where that is another (福島県 · Fukushima)
  const told = (P, id) => (P.tell ? P.tell(id) : P.answerName(id) !== P.kind.name(id) ? `${P.kind.name(id)} · ${P.answerName(id)}` : P.kind.name(id));

  sound.onclick = () => { formats.sound = !formats.sound; syncSound(); };
  function syncSound() { const P = game.def && game.def.play; sound.hidden = !(P && formats.canSay(P)); sound.setAttribute('aria-pressed', formats.sound); sound.textContent = formats.sound ? 'Sound on' : 'Sound off'; }

  // (the question's number as it is asked; Pairs: how many are matched)
  function stats(asked) {
    const S = game.round.state, P = game.def.play, n = game.round.queue.length;
    if (P.mode === 'pairs') $('sQ').textContent = `${S.res.filter(t => t !== undefined).length}/${n}`;
    else if (asked) $('sQ').textContent = `${asked.pos + 1}/${n}`;
    $('sScore').textContent = free() ? S.points.toLocaleString('en-US') : S.score;
    $('sStreak').textContent = S.streak;
  }
  game.on('start', def => {
    clearInterval(timer);
    syncSound();
    if (scoreLabel) scoreLabel.textContent = free() ? 'Points' : SCORE;
    $('ticks').replaceChildren(...game.round.queue.map(() => document.createElement('i')));
    feedback(fb, '', '', '');
    formats.looks.sync(def.play, true);
    timer = setInterval(() => { $('sTime').textContent = fmt(performance.now() - game.round.t0); }, 500);
  });
  game.on('ask', q => {
    const P = game.def.play, K = P.kind, ask = $('ask');
    ask.replaceChildren();
    if (q && P.mode !== 'pairs') {
      if (K.detail && setup.options().detail) { const s = document.createElement('strong'); s.textContent = K.detail.text(q.id); ask.append(s); }
      if (P.code) {
        const same = P.code.same(q.id), n = q.group.length, sep = () => (ask.childNodes.length ? ' · ' : '');
        if (same.length > n) ask.append(sep() + `${same.length} codes share this area: any ${n === 1 ? 'one' : n} of them`);
        if (P.code.scope(q.id)) ask.append(sep() + (P.code.scope(q.id) === 'part' ? 'The dashed line is the larger area, which has codes of its own' : 'Its parts (dashed) have codes of their own too'));
      }
    }
    stats(q);
    [...$('ticks').children].forEach((t, i) => t.classList.toggle('now', !!q && P.mode !== 'pairs' && i === q.pos)); // (a board of pairs: none)
  });
  game.on('outcome', out => {
    const P = game.def.play, K = P.kind, id = out.id;
    if (out.kind === 'right') {
      const cls = RESULT[out.result], start = P.mode === 'pairs' ? game.round.queue.indexOf(id) : game.round.state.i - out.members.length;
      out.members.forEach((m, n) => { const t = $('ticks').children[start + n]; if (t) { t.classList.remove('now'); t.classList.add(cls); } });
      if (out.km !== undefined) {
        feedback(fb, out.result === 0 ? 'ok' : 'bad', K.name(id), [`${kmText(out.km)} · ${out.single && out.single.mult > 1 ? `${out.single.base} × ${out.single.mult} = ` : ''}${ptsText(out.points)}`, ...(quiz.single ? [] : [[].concat(K.about(id))[0]])]);
      } else if (P.code) {
        const names = out.got.map(x => K.name(x)).join(' · ');
        feedback(fb, out.result === 0 ? 'ok' : 'bad', out.revealed ? names : `✓ ${names}` + (out.result ? ` · try ${out.result + 1}` : ''), K.about(out.members[0]));
      } else {
        const ok = out.result === 0, title = 'pct' in out || P.mode === 'pairs' ? (ok ? '✓ ' : '') + told(P, id) : out.revealed ? told(P, id) : `✓ ${told(P, id)}` + (out.result ? ` · try ${out.result + 1}` : '');
        feedback(fb, ok ? 'ok' : 'bad', title, K.about(id));
        if ('pct' in out) { const p = document.createElement('p'); p.className = 'pct'; p.textContent = out.pct + '%'; fb.querySelector('.t').after(p); }
        if (K.photo) fb.prepend(formats.thumb(K.photo(id)));
      }
    } else if (out.kind === 'more' && out.found !== undefined) feedback(fb, 'ok', `✓ ${K.name(id)}`, `${out.left} more`);
    else if (out.late) feedback(fb, 'bad', '✗ Time', `→ ${told(P, id)}`);
    else if (P.code && (out.kind === 'more' || out.kind === 'note' || out.kind === 'wrong')) codeFeedback(P, out);
    else if (out.kind === 'wrong') {
      const what = 'area' in out ? K.clicked(out.area, id) : out.extra ? [out.extra.length ? 'Not ' + out.extra.map(a => K.clicked(a, id)).join(', ') : '', out.missing ? `${out.missing} missing` : ''].filter(Boolean).join(' · ') : out.option ? out.option.word : P.mode === 'pairs' ? out.name : out.text;
      if (P.mode === 'pairs') feedback(fb, 'bad', `✗ ${what}`, '');
      else feedback(fb, 'bad', `✗ ${what}`, out.revealed ? `→ ${told(P, id)}` : `${plural(out.left, ['try', 'tries'])} left`);
    }
    stats();
  });
  // Type code: the codes typed so far, how many more, a code used here but over other areas, and once shown all of them
  function codeFeedback(P, out) {
    const K = P.kind, id = out.id, same = P.code.same(id), got = out.got.map(x => K.name(x)).join(' · '), rest = `${out.need - out.got.length} more`;
    const all = out.need === same.length ? same.map(x => K.name(x)).join(' · ') : `any ${out.need} of ${same.map(x => K.name(x)).join(' · ')}`;
    const notes = (out.notes || []).map(n => `${K.name(n.id)} is used here too, but ${n.whole ? 'across the whole larger area' : n.part ? 'only in part of it' : 'over another area'}`);
    if (out.kind === 'wrong') {
      const shown = game.round.asked() && game.round.asked().revealed;
      if (shown) return feedback(fb, 'bad', `✗ ${out.text}`, [`→ ${all}`, ...(out.got.length ? [`✓ ${got} · ${rest}`] : [])]);
      feedback(fb, 'bad', `✗ ${out.text}`, `${plural(out.left, ['try', 'tries'])} left`);
      fb.append(...[...notes, ...(out.got.length ? [`✓ ${got} · ${rest}`] : [])].map(line => { const p = document.createElement('p'); p.className = 'c'; p.textContent = line; return p; }));
      return;
    }
    if (notes.length) return feedback(fb, '', notes[0], [...notes.slice(1), out.got.length ? `✓ ${got} · ${rest}` : P.code.scope(id) === 'part' ? 'The question is the code(s) of this part only' : 'The question is the code(s) of the whole area']);
    const shown = game.round.asked() && game.round.asked().revealed;
    feedback(fb, 'ok', `✓ ${got}`, shown ? [rest, `→ ${all}`] : rest);
  }
  game.on('done', () => { clearInterval(timer); formats.looks.sync(null, false); });

  return {
    told, stop: () => clearInterval(timer),
    said(cls, title, lines) { if (cls != null) fb.className = 'feedback ' + cls; const t = fb.querySelector('.t'); if (t && title != null) t.textContent = title; for (const l of lines || []) { if ([...fb.querySelectorAll('p.c')].some(p => p.textContent === l)) continue; const p = document.createElement('p'); p.className = 'c'; p.textContent = l; fb.append(p); } },
  };
}
