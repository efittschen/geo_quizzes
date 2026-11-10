// text: words in a script on a sign card (text(id) -> { text, cls: its typeface, lang, tag: a small label over it,
// mark: [from, to] the part of it marked, at: [x, y] where it is on the map }), the typeface picked anew each time it is
// asked (reading.js); Type with Reading asks its own text. The text shown stays on the question (q.shown): the place of
// a town name asked is shown with its answer (game.js, points).

export function makeText(P, { $, place }) {
  const text = P.text || P.kind.text;
  return {
    show(id, q) {
      const card = place('text'), t = text(id), sent = $('sent');
      if (t.mark) { const [a, b] = t.mark, m = document.createElement('b'); m.textContent = t.text.slice(a, b); sent.replaceChildren(t.text.slice(0, a), m, t.text.slice(b)); }
      else sent.textContent = t.text;
      sent.className = 'sent ' + (t.cls || ''); sent.lang = t.lang || '';
      card.dataset.tag = t.tag || '';
      if (q) q.shown = t;
    },
    ahead() {}, answered() {}, hide() {},
  };
}
