// Learn (quiz.learn: { title, sub, sections: [{ title, sub, areas, photos }] }, or a function giving it): everything to
// learn on one sheet over the page, a card per section: a small map of the whole with its areas lit (a ring around
// a part too small to see there), its title and lines, its pictures (a tap shows one large). Learn beside Explore opens
// it, Close or Escape shuts it. Built when first opened.
//
//   const learn = makeLearn(deps)   -> { open(), close(), shown() }

const NS = 'http://www.w3.org/2000/svg';

export function makeLearn({ quiz, map, formats, ui }) {
  const { $ } = ui, button = $('learnBtn');
  let sheet = null;
  if (button) button.hidden = !quiz.learn;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const svg = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  function build() {
    const L = typeof quiz.learn === 'function' ? quiz.learn() : quiz.learn;
    sheet = el('div', 'learn'); sheet.id = 'learn';
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', L.title || 'Learn');
    const head = el('header', 'learn-head'), close = el('button', 'ghost small', 'Close');
    close.type = 'button'; close.onclick = learn.close;
    head.append(el('h2', '', L.title || 'Learn'), ...(L.sub ? [el('p', '', L.sub)] : []), close);
    // the map's areas once; each card's map uses them
    const [W, H] = quiz.size, [x0, y0, x1, y1] = quiz.home || [0, 0, W, H], pad = quiz.pad, side = Math.max(x1 - x0, y1 - y0);
    const defs = svg('svg', { class: 'learn-defs', 'aria-hidden': 'true' }), all = svg('g', { id: 'learnAll' });
    for (const a of quiz.areas) all.append(svg('path', { d: a.d, id: 'learn-' + a.id, 'vector-effect': 'non-scaling-stroke' }));
    defs.append(all);
    const use = (href, cls) => svg('use', { href: '#' + href, ...(cls ? { class: cls } : {}) });
    const grid = el('div', 'learn-grid');
    for (const s of L.sections) {
      const card = el('section', 'learn-card'), small = svg('svg', { class: 'learn-map', viewBox: `${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`, 'aria-hidden': 'true' });
      small.append(use('learnAll', 'base'), ...(s.areas || []).map(a => use('learn-' + a, 'on')));
      const parts = (s.areas || []).map(map.area).filter(Boolean);
      if (parts.length) {
        const r = A => Math.sqrt(A.a || 0) / 2;
        const bx0 = Math.min(...parts.map(A => A.lx - r(A))), bx1 = Math.max(...parts.map(A => A.lx + r(A))), by0 = Math.min(...parts.map(A => A.ly - r(A))), by1 = Math.max(...parts.map(A => A.ly + r(A)));
        if (Math.max(bx1 - bx0, by1 - by0) < side * .08) small.append(svg('circle', { class: 'ring', 'vector-effect': 'non-scaling-stroke', cx: (bx0 + bx1) / 2, cy: (by0 + by1) / 2, r: side * .06 }));
      }
      const text = el('div', 'learn-text'), photos = el('div', 'learn-photos');
      text.append(el('h3', '', s.title), ...[].concat(s.sub || []).map(line => el('p', '', line)));
      photos.append(...(s.photos || []).map(formats.thumb));
      card.append(small, text, photos); grid.append(card);
    }
    sheet.append(defs, head, grid);
    document.body.append(sheet);
  }
  const learn = {
    open() { if (!sheet) build(); sheet.hidden = false; sheet.scrollTop = 0; sheet.querySelector('.learn-head button').focus({ preventScroll: true }); },
    close() { if (sheet) sheet.hidden = true; if (button) button.focus({ preventScroll: true }); },
    shown: () => !!sheet && !sheet.hidden,
  };
  return learn;
}
