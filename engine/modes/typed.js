// list and type: the answer in the field under the question.
//   type   the name typed (or a code's digits: Type code, the phone's digit keyboard); one slip is forgiven
//   list   the name picked from a list of the play's names. What is typed narrows it (names that start with it first,
//          then those with a word that does, then those that contain it); a tap puts a name in the field (a double tap
//          answers with it), the arrow keys move the mark, Enter or OK answers with the name marked. The list starts
//          folded: then nothing is offered, and Enter answers with what is typed, as in Type. The button by the field
//          opens it and folds it again, for every quiz (the settings' listOpen); in Hard mode there is no list.
// Name it and Shape: a name tapped answers at once (a second tap within a moment of an answer that went on answers
// nothing); what finds no name in the list is taken as typed; a wrong name flashes its place. On a touch screen the
// field is not focused by itself (the keyboard would cover the map). Type code: Give up shows the codes and goes on,
// the question missed; once they are shown it is Next, as is Enter with nothing typed.

export function makeTyped({ map, game, $, flash, storage }) {
  const form = $('typedForm'), field = $('typed'), list = $('typedList'), listBtn = $('typedListBtn'), giveUp = $('giveUpBtn');
  const plain = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  let P = null, listed = [], marked = 0, steered = false, pickedAt = { t: 0, q: null };
  let folded = !storage.settings().listOpen;
  const hidden = () => folded || game.opts.hard;
  const named = () => P && (P.way === 'name' || P.way === 'shape');

  function sync() {
    const choices = P && P.choices;
    listBtn.hidden = !P || !choices || game.opts.hard;
    if (!P || !choices) { list.hidden = true; return; }
    const q = plain(field.value.trim()), forms = P.choiceForms ? n => P.choiceForms(n).map(plain) : n => [plain(n)], seen = new Set();
    const tiers = !q ? [choices] : [choices.filter(n => forms(n).some(f => f.startsWith(q))), choices.filter(n => forms(n).some(f => f.split(/[\s,.-]+/).some(w => w.startsWith(q)))), choices.filter(n => forms(n).some(f => f.includes(q)))];
    listed = tiers.flat().filter(n => !seen.has(n) && seen.add(n));
    marked = Math.max(0, Math.min(marked, listed.length - 1));
    list.replaceChildren(...(hidden() ? [] : listed.map((n, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'opt' + (i === marked ? ' on' : ''); b.textContent = n;
      b.setAttribute('role', 'option'); b.setAttribute('aria-selected', i === marked);
      b.onclick = () => (named() ? pick(n) : fill(n));
      b.ondblclick = () => { if (named()) return; fill(n); form.requestSubmit(); };
      return b;
    })));
    list.hidden = hidden();
    listBtn.setAttribute('aria-expanded', !folded);
    listBtn.title = folded ? 'Show the list' : 'Hide the list'; listBtn.setAttribute('aria-label', listBtn.title);
  }
  function fill(n) { field.value = n; marked = 0; steered = true; sync(); marked = Math.max(0, listed.indexOf(n)); sync(); field.focus({ preventScroll: true }); }
  function pick(n) {
    const t = performance.now(), q = game.asked;
    if (t - pickedAt.t < 400 && q !== pickedAt.q) return;
    pickedAt = { t, q };
    field.value = n; steered = true; marked = Math.max(0, listed.indexOf(n));
    form.requestSubmit();
  }
  const syncGiveUp = () => { const q = game.round && game.round.asked(); giveUp.hidden = !(P && P.code); giveUp.textContent = q && q.revealed ? 'Next' : 'Give up'; };

  field.addEventListener('input', () => { marked = 0; steered = false; sync(); });
  field.addEventListener('keydown', e => {
    if (!P || !P.choices || !listed.length) return;
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !hidden()) {
      e.preventDefault(); marked = (marked + (e.key === 'ArrowDown' ? 1 : -1) + listed.length) % listed.length; steered = true; sync();
      list.querySelector('.on')?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') { e.preventDefault(); form.requestSubmit(); }
  });
  listBtn.onclick = () => {
    folded = !folded;
    storage.keepSettings(s => { delete s.listMin; if (folded) delete s.listOpen; else s.listOpen = true; });
    sync();
    list.querySelector('.on')?.scrollIntoView({ block: 'nearest' });
    field.focus({ preventScroll: true });
  };
  giveUp.onclick = () => { if (P && P.code) { game.giveUp(); syncGiveUp(); field.focus({ preventScroll: true }); } };
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!P || game.rating || !game.round || !game.round.asked()) return;
    const typed = field.value.trim();
    // (an answer from a list is the name marked in it, however it was sent; with nothing typed and nothing marked by the
    // arrow keys a stray Enter answers nothing)
    const text = P.choices && !hidden() ? (typed || steered ? listed[marked] || (named() ? typed : '') : '') : typed;
    if (P.code && !text && game.round.asked().revealed) { game.giveUp(); syncGiveUp(); return; }
    if (!text) return;
    const out = game.answer({ text });
    if (P.code) { field.value = ''; field.focus({ preventScroll: true }); syncGiveUp(); return; }
    if (out && out.kind === 'wrong') {
      if (P.way === 'name' && out.other !== undefined) flash(P.kind, out.other); // (the place named lights up, as one tapped)
      if (P.choices) { field.value = ''; marked = 0; sync(); } else field.select();
    }
  });

  return play => ({
    ask() {
      P = play;
      form.hidden = false;
      if (P.keyboard) field.setAttribute('inputmode', P.keyboard); else field.removeAttribute('inputmode');
      field.value = '';
      if (!(P.way === 'name' && matchMedia('(pointer: coarse)').matches)) field.focus({ preventScroll: true });
      marked = 0; steered = false; sync(); syncGiveUp();
    },
    board() {}, tap() {}, key() {},
    close() { P = null; form.hidden = true; list.hidden = true; listBtn.hidden = true; giveUp.hidden = true; },
  });
}
