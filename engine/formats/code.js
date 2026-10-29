// code: a phone or plate code in the page's frame (the dial page.js makes from <body data-dial>: country code,
// brackets, the code's place), in parts where the kind says which part is which (dial(id): [[text, 'hot' | 'cold']…]).
// A dial wider than the panel is drawn smaller (formats.css: --fit), so a long code or frame is never cut.

export function makeCode(P, { $, place, fit }) {
  const K = P.kind;
  return {
    show(id) {
      const dial = place('code'), code = $('code');
      if (K.dial) code.replaceChildren(...K.dial(id).map(([text, cls]) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; return s; }));
      else code.textContent = K.short(id);
      fit(dial);
    },
    ahead() {}, answered() {}, hide() {},
  };
}
