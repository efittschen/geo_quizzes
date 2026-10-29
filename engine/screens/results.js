// Results: the score (map play: the points), the share of it, the time, the best streak and the best before; the map's
// colours explained; the missed items (map play: not close), each tapped shown on the map with what is said of it;
// Play again, Retry missed, Change round.
//
//   const results = makeResults(deps)   -> { show(result) }

const RESULT = ['got', 't2', 't3', 'miss'];

export function makeResults({ quiz, map, formats, ui }) {
  const { $, fmt } = ui, items = [...$('done').querySelectorAll('.legend li')], LEGEND = items.map(li => li.lastChild.textContent);
  const FREE = ['4,000+', '2,500+', '1,000+', 'Under 1,000'], DRAW = ['70%+', '', '', 'Under 70%'];
  const title = $('missWrap').querySelector('h2'), MISSED = title ? title.textContent : '';
  $('chips').addEventListener('click', e => {
    const chip = e.target.closest('[data-id]'); if (!chip || !chip.play) return;
    const K = chip.play.kind, id = chip.item;
    map.highlight(K.areas[id]); $('rPick').textContent = `${K.name(id)}: ${K.about(id)}`;
    map.frameAreas(K.areas[id]);
    if (K.photo) formats.zoom(K.photo(id), true);
  });
  return {
    show(R) {
      const P = R.def.play, K = P.kind, free = R.def.look.map === 'free', n = R.n;
      $('rScore').textContent = free ? R.points.toLocaleString('en-US') : `${R.score} of ${n}`;
      const most = quiz.single ? quiz.single.max(n) : n * 5000, pct = n ? Math.round((free ? R.points / most : R.score / n) * 100) : 0;
      let line = free ? `${pct}% of ${most.toLocaleString('en-US')} · ${R.score}/${n} close · ${fmt(R.ms)}` : `${pct}% · ${fmt(R.ms)} · streak ${R.best}`;
      if (R.prev && R.complete) line += R.better ? ' · new best' : free ? ` · best ${(R.prev.p || 0).toLocaleString('en-US')}` : ` · best ${R.prev.s}/${n}`;
      items.forEach((li, i) => { li.lastChild.textContent = free ? (quiz.single ? quiz.single.legend : FREE)[i] : P.mode === 'draw' ? DRAW[i] : LEGEND[i]; li.hidden = P.mode === 'draw' && !R.def.review && !DRAW[i]; });
      if (items[0]) items[0].parentNode.hidden = !!(K.fresh || P.fresh || K.pickAll);
      $('rLine').textContent = line;
      $('chips').replaceChildren(...R.queue.map((id, i) => [id, R.res[i]]).filter(([, t]) => t > 0).sort((a, b) => K.ids.indexOf(a[0]) - K.ids.indexOf(b[0])).map(([id, t]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'chip ' + RESULT[t]; b.dataset.id = id; b.item = id; b.play = P;
        b.textContent = K.chip(id); b.title = K.chipTitle(id);
        if (K.photo) { const p = K.photo(id), im = document.createElement('img'); im.src = p.src; im.alt = ''; im.loading = 'lazy'; b.classList.add('ph'); b.textContent = K.name(id); b.prepend(im); }
        return b;
      }));
      $('rPick').textContent = '';
      $('missWrap').hidden = !R.missed.length; $('retryBtn').hidden = !R.missed.length || !!quiz.single;
      $('retryBtn').textContent = free ? `Retry (${R.missed.length})` : `Retry missed (${R.missed.length})`;
      if (title) title.textContent = free ? 'Not close' : MISSED;
    },
  };
}
