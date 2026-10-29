// pairs: a board over the map, questions left and names right (model.check.board), matched one pair after another: a
// tile, then a tile of the other side (a second of the same side replaces the first). A wrong pair flashes and counts
// against both questions (a name of none: against the question alone); a match puts both out of play in the colour of
// its result. The map lies under the board and shows the answers once the round is over.

export function makePairs({ formats, game, $ }) {
  const el = document.createElement('div');
  el.className = 'pairs'; el.hidden = true;
  $('stage').append(el);
  const RESULT = ['got', 't2', 't3', 'miss'];
  let selected = null;
  return P => {
    const pick = b => {
      if (b.disabled || game.rating) return;
      if (!selected || selected.dataset.side === b.dataset.side) { if (selected) selected.classList.remove('sel'); selected = b; b.classList.add('sel'); return; }
      const first = selected; selected = null; first.classList.remove('sel');
      const q = first.dataset.side === 'q' ? first : b, a = q === first ? b : first;
      const out = game.match(q.question, a.tile);
      if (!out) return;
      if (out.kind === 'wrong') { for (const t of [q, a]) { t.classList.add('no'); setTimeout(() => t.classList.remove('no'), 600); } return; }
      for (const t of [q, a]) { t.disabled = true; t.classList.add(RESULT[Math.min(out.wrongs, 3)]); }
    };
    const tile = (side, content, data, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.side = side; b.dataset.i = i; b.style.gridColumn = side === 'q' ? '1' : '2';
      if (side === 'q') b.append(content); else b.textContent = b.dataset.name = content;
      Object.assign(b, data);
      b.onclick = () => pick(b);
      return b;
    };
    return {
      ask() {},
      board({ questions, names }) {
        for (const id of ['dial', 'bigname', 'card', 'photo']) $(id).hidden = true;
        el.hidden = false; selected = null;
        // (each tile with its question's place in the round: data-i, a name of none -1)
        const at = id => String(id == null ? -1 : game.round.queue.indexOf(id, game.round.state.i));
        el.replaceChildren(...questions.map(id => tile('q', formats.tile(P, id), { question: id }, at(id))), ...names.map(t => tile('a', t.name, { tile: t }, at(t.owner))));
        el.scrollTop = 0;
        formats.looks.redraw = () => { for (const b of el.querySelectorAll('[data-side=q]')) if (b.querySelector('img')) b.replaceChildren(formats.tile(P, b.question)); };
      },
      tap() {}, key() {},
      close() { el.hidden = true; el.replaceChildren(); selected = null; },
    };
  };
}
