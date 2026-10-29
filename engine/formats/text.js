// text: words in a script on a sign card (text(id) -> { text, cls: its typeface, lang, tag: a small label over it }),
// the typeface picked anew each time it is asked (reading.js); Type with Reading asks its own text.

export function makeText(P, { $, place }) {
  const text = P.text || P.kind.text;
  return {
    show(id) {
      const card = place('text'), t = text(id), sent = $('sent');
      sent.textContent = t.text; sent.className = 'sent ' + (t.cls || ''); sent.lang = t.lang || '';
      card.dataset.tag = t.tag || '';
    },
    ahead() {}, answered() {}, hide() {},
  };
}
