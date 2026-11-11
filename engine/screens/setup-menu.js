// The setup screen's pictures and moving parts, which screens/setup.js draws its menu with: the ways' pictures, the
// direction button, the preview on the map, and the maps as pictures.
//
//   const parts = setupMenu({ quiz, model, map, formats, $ })
//   parts.icon(way)                  the way's picture (24 × 24, in the text colour)
//   parts.spin(from, to, turn)       the direction button: a round blue button with two arrows turning round each other,
//                                    "Kanji →" / "English" under it; a tap turns it half round, then turn()
//   parts.preview.show(play, ids, { label, box, blind })   Show preview: how the round picked is played, with one of its
//                                    items, again and again, on a card at the map's top right, always: the
//                                    question as its format shows it, then the answer as its mode takes it. Where the
//                                    answer is given on the map (Map, Draw) it is played on the map itself, following
//                                    its view; where the question is the place (Name it), the map lights it as the round
//                                    will. blind: a city quiz's Blind, a tap a little off the place joined to it, with the
//                                    distance. box: the round's box, which its small maps frame. The map never moves for it.
//                                    A play not built yet is { kind, way, mode, format: 'name', back, questionName,
//                                    answerName, soon: true }.
//   parts.preview.stop(playing)      gone; playing: the round has begun, and clears the map itself
//   parts.maps.draw(bar, o)          the maps to play on, in the map's bar at its bottom right: a picture of each as it shows the whole country
//                                    when the page opens (the quiz map with the sea and the neighbours, the street map's
//                                    and the satellite's own tiles at that zoom, the overlay's colours on them), no words; the three street
//                                    maps one picture with their steps above it while one is on (Lines, Plain, Bare);
//                                    Coverage a box to tick. On a phone (760 px or less) a picture of the map in use, at
//                                    the map's bottom right just above the card, opens them above it. o: { list, on, attr ('map' or 'back'), labels,
//                                    pick(m), street (the step last picked), keepStreet(m), cover, coverOn, onCover() }

const NS = 'http://www.w3.org/2000/svg';

// the ways' pictures (24 × 24, drawn in the text colour: f a light fill, s and d filled, b a bolder line)
const ICON = {
  map: '<path d="M4 7l5-2 6 2 5-2v12l-5 2-6-2-5 2z" class="f"/><circle cx="12" cy="11" r="3.2"/><circle cx="12" cy="11" r="1" class="d"/>',
  all: '<path d="M4 7l5-2 6 2 5-2v12l-5 2-6-2-5 2z" class="f"/><circle cx="9" cy="10" r="1.6" class="d"/><circle cx="15" cy="13" r="1.6" class="d"/>',
  name: '<path d="M5 6.5c3-2 6-1 8 0s4 3 3 6-4 5-7 4-6-2-6-5 0-4 2-5z" class="b"/><path d="M8 20h8"/>',
  shape: '<path d="M5 6.5c3-2 6-1 8 0s4 3 3 6-4 5-7 4-6-2-6-5 0-4 2-5z" class="s"/>',
  draw: '<path d="M4 20l1-4.2L16.3 4.5a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.2 19z" class="f"/><path d="M14.5 6.3l3.2 3.2M4 20l4.2-1"/>',
  list: '<rect x="4" y="4" width="16" height="4.5" rx="1.2"/><path d="M6 12.5h10M6 16h8M6 19.5h11"/>',
  type: '<rect x="3" y="8" width="18" height="8" rx="1.6"/><path d="M7 10.5v3M7 12h2.5"/><path d="M13 10v4"/>',
  pick: '<rect x="4" y="4" width="7" height="7" rx="1.4"/><rect x="13" y="4" width="7" height="7" rx="1.4" class="s"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/>',
  pickback: '<rect x="4" y="4" width="7" height="7" rx="1.4" class="s"/><rect x="13" y="4" width="7" height="7" rx="1.4"/><rect x="4" y="13" width="7" height="7" rx="1.4"/><rect x="13" y="13" width="7" height="7" rx="1.4"/>',
  pairs: '<rect x="3" y="4" width="6" height="5" rx="1.2"/><rect x="3" y="15" width="6" height="5" rx="1.2"/><rect x="15" y="4" width="6" height="5" rx="1.2"/><rect x="15" y="15" width="6" height="5" rx="1.2"/><path d="M9 6.5l6 11M9 17.5l6-11"/>',
  code: '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 10v4M10.5 10l-1 4M13 10h2.5l-1.5 4"/>',
  cards: '<rect x="7" y="3" width="12" height="15" rx="1.8" class="f"/><rect x="4" y="6" width="12" height="15" rx="1.8"/>',
};
// (a city quiz's Map: on its dots, or blind, the map alone)
ICON.dots = '<path d="M4 7l5-2 6 2 5-2v12l-5 2-6-2-5 2z" class="f"/><circle cx="8.5" cy="10" r="1.5" class="d"/><circle cx="15" cy="8.6" r="1.5" class="d"/><circle cx="13" cy="14.6" r="1.5" class="d"/>';
ICON.blind = '<path d="M4 7l5-2 6 2 5-2v12l-5 2-6-2-5 2z" class="f"/><path d="M9 5v12M15 7v12"/>';
ICON.listback = ICON.list; ICON.typeback = ICON.type;
const icon = way => `<svg class="sm-ic" viewBox="0 0 24 24" aria-hidden="true">${ICON[way] || ICON.pick}</svg>`;
const ARROW = '<svg class="sm-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M14 7l5 5-5 5"/></svg>';
const POINTER = '<path d="M0 0l11 4.5-4.6 1.6L4.6 11z"/>';
const SPIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 9.5A8 8 0 0 0 5.2 7.6M4.5 14.5a8 8 0 0 0 14.3 1.9"/><path d="M5 3.5v4.3h4.3M19 20.5v-4.3h-4.3"/></svg>';
// Street View coverage: the car from the side, facing right, its camera on a pole, all in blues; a blue strand comes out
// from behind its back wheel and winds up and away, thinner as it goes (its own colours, in the dark look too)
const COVER = '<g stroke="none"><path d="M11.83,17.10 L11.15,17.27 L10.51,17.41 L9.91,17.51 L9.35,17.57 L8.83,17.61 L8.35,17.61 L7.91,17.59 L7.51,17.54 L7.15,17.47 L6.82,17.39 L6.53,17.29 L6.27,17.18 L6.04,17.05 L5.83,16.92 L5.66,16.78 L5.51,16.64 L5.38,16.49 L5.27,16.33 L5.18,16.17 L5.10,16.01 L5.05,15.83 L5.01,15.66 L4.99,15.48 L4.99,15.29 L5.01,15.10 L5.05,14.91 L5.11,14.72 L5.19,14.53 L5.29,14.35 L5.42,14.16 L5.56,13.99 L5.73,13.82 L5.93,13.66 L6.15,13.51 L6.40,13.38 L6.67,13.26 L6.99,13.13 L7.30,12.99 L7.59,12.84 L7.86,12.68 L8.12,12.50 L8.37,12.32 L8.60,12.12 L8.81,11.91 L9.01,11.69 L9.19,11.47 L9.36,11.23 L9.51,10.99 L9.64,10.75 L9.75,10.49 L9.85,10.23 L9.92,9.97 L9.98,9.71 L10.02,9.44 L10.04,9.17 L10.03,8.90 L10.01,8.63 L9.97,8.36 L9.91,8.10 L9.84,7.84 L9.74,7.58 L9.62,7.33 L9.48,7.08 L9.33,6.84 L9.15,6.61 L8.96,6.39 L8.75,6.17 L8.52,5.96 L8.28,5.76 L8.01,5.57 L7.73,5.38 L7.43,5.21 L7.30,5.14 L7.18,5.06 L7.07,4.98 L6.97,4.90 L6.88,4.82 L6.80,4.74 L6.72,4.65 L6.66,4.57 L6.60,4.49 L6.55,4.41 L6.51,4.33 L6.48,4.25 L6.45,4.17 L6.43,4.09 L6.42,4.02 L6.41,3.94 L6.41,3.86 L6.42,3.78 L6.43,3.70 L6.45,3.62 L6.48,3.54 L6.51,3.46 L6.56,3.38 L6.61,3.29 L6.67,3.21 L6.73,3.13 L6.81,3.05 L6.89,2.97 L6.99,2.90 L7.09,2.82 L7.20,2.75 L7.32,2.68 L7.44,2.62 L7.58,2.55 L7.72,2.49 L7.87,2.44 L7.73,1.96 L7.55,2.01 L7.39,2.07 L7.23,2.13 L7.07,2.20 L6.92,2.27 L6.78,2.34 L6.65,2.43 L6.53,2.51 L6.41,2.61 L6.30,2.70 L6.20,2.81 L6.10,2.91 L6.02,3.02 L5.94,3.14 L5.87,3.26 L5.82,3.39 L5.77,3.51 L5.73,3.65 L5.71,3.78 L5.69,3.92 L5.69,4.06 L5.69,4.20 L5.71,4.34 L5.74,4.47 L5.79,4.61 L5.84,4.75 L5.91,4.89 L5.98,5.02 L6.07,5.15 L6.17,5.28 L6.27,5.41 L6.39,5.53 L6.52,5.65 L6.66,5.76 L6.81,5.88 L6.97,5.99 L7.22,6.16 L7.45,6.33 L7.65,6.51 L7.84,6.69 L8.01,6.87 L8.15,7.06 L8.28,7.25 L8.40,7.43 L8.49,7.62 L8.57,7.81 L8.64,7.99 L8.68,8.18 L8.72,8.36 L8.74,8.54 L8.74,8.72 L8.73,8.89 L8.72,9.07 L8.68,9.24 L8.64,9.40 L8.58,9.57 L8.51,9.73 L8.43,9.89 L8.34,10.04 L8.24,10.19 L8.13,10.34 L8.00,10.48 L7.86,10.62 L7.71,10.75 L7.56,10.87 L7.38,10.99 L7.20,11.10 L7.01,11.21 L6.80,11.30 L6.59,11.39 L6.36,11.47 L6.13,11.54 L5.69,11.68 L5.28,11.86 L4.90,12.06 L4.54,12.30 L4.21,12.56 L3.91,12.85 L3.64,13.16 L3.41,13.49 L3.20,13.84 L3.04,14.21 L2.91,14.59 L2.81,14.99 L2.76,15.39 L2.75,15.80 L2.78,16.21 L2.85,16.62 L2.97,17.03 L3.13,17.43 L3.34,17.82 L3.59,18.19 L3.88,18.54 L4.21,18.87 L4.58,19.17 L4.99,19.45 L5.44,19.69 L5.92,19.90 L6.44,20.08 L6.99,20.22 L7.57,20.33 L8.19,20.41 L8.84,20.44 L9.52,20.43 L10.23,20.39 L10.98,20.30 L11.76,20.18 L12.57,20.00Z" fill="#2F80ED"/><circle cx="7.8" cy="2.2" r="0.25" fill="#2F80ED"/><g transform="translate(-1.84 -1.324) scale(1.08)"><path d="M16.2 9.6V6.3" stroke="#174E9E" stroke-width="1.3" stroke-linecap="round"/><circle cx="16.2" cy="4.9" r="2" fill="#174E9E"/><circle cx="16.2" cy="4.9" r=".75" fill="#9CC4F7"/><path d="M10 18.3V14.6c0-.7.4-1.2 1.1-1.3l1.5-.2 1.3-2.4c.3-.5.8-.8 1.4-.8h3.2c.6 0 1.1.3 1.4.8l1.4 2.4h.4c.7 0 1.3.6 1.3 1.3v3.9z" fill="#2F80ED" stroke="#1C63C9" stroke-width=".8" stroke-linejoin="round"/><path d="M14.3 13l.9-1.7c.1-.2.3-.3.5-.3h1.4v2z M18 13v-2h1.1c.2 0 .4.1.5.3l1 1.7z" fill="#DCEBFD"/><circle cx="13" cy="18.4" r="1.9" fill="#174E9E"/><circle cx="13" cy="18.4" r=".7" fill="#9CC4F7"/><circle cx="20" cy="18.4" r="1.9" fill="#174E9E"/><circle cx="20" cy="18.4" r=".7" fill="#9CC4F7"/></g></g>';
const STEPS = [['overlay', 'Lines'], ['street', 'Plain'], ['bare', 'Bare']];
const POINT = /^M[-\d.]+,[-\d.]+l0,0$/; // (an area that is a point, a city: drawn as a dot)

export function setupMenu({ quiz, model, map, formats, $ }) {
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  let outlined = false;
  // (a phone: the card's height over the map, which the maps sit above (--card-h); the card grows and shrinks; none where
  // the panel is not over the map, as while playing)
  { const panel = document.querySelector('.panel'), stage = $('stage');
    if (panel && stage && window.ResizeObserver) {
      const ro = new ResizeObserver(() => { const s = stage.getBoundingClientRect(), c = panel.getBoundingClientRect(); stage.style.setProperty('--card-h', (c.top > s.top && c.top < s.bottom ? Math.round(s.bottom - c.top) : 0) + 'px'); });
      ro.observe(panel); ro.observe(stage);
    } }
  const needOutlines = () => (outlined ? Promise.resolve() : map.outlines().then(() => { outlined = true; }, () => {}));

  /* ---------- the direction button ---------- */
  function spin(from, to, turn) {
    const b = el('button', 'sm-dir'); b.type = 'button'; b.title = `${from} → ${to}`;
    const txt = el('span', 'sm-dtxt'); txt.textContent = `${from} → ${to}`; // (the words: a tab on the row's top edge)
    b.append(el('span', 'sm-disc', SPIN), txt);
    let busy = false;
    b.onclick = () => { if (busy) return; busy = true; b.classList.add('go'); setTimeout(turn, still ? 0 : 380); };
    return b;
  }

  /* ---------- the preview: its item, small maps, motion ---------- */
  // the item shown: one of the larger ones of the round (seen on a small map), the same each time
  const sampleOf = (K, ids) => {
    const list = [...new Set(ids)].filter(id => K.areas[id] && K.areas[id].length);
    if (!list.length) return ids[0];
    const bySize = list.slice().sort((a, b) => K.size(b) - K.size(a));
    return bySize[Math.min(bySize.length - 1, Math.floor(bySize.length * 0.3))];
  };
  // the words a play is answered with: a play the other way round (List back, Type back) its words in their script
  const wordsOf = P => (P.back && P.mode !== 'picks' && !P.questionName ? i => model.check.askText(P.kind, i) : P.answerName);
  const others = (P, ids, id, n) => { const w = wordsOf(P); return [...new Set(ids.filter(x => x !== id).map(w))].filter(x => x && x !== w(id)).slice(0, n); };
  // the box of some areas, roughly (each area a square of its size around its middle)
  const roughBox = areas => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const a of areas) { const A = map.area(a); if (!A) continue; const h = Math.sqrt(A.a || 0) * 0.7 || 1; x0 = Math.min(x0, A.lx - h); y0 = Math.min(y0, A.ly - h); x1 = Math.max(x1, A.lx + h); y1 = Math.max(y1, A.ly + h); }
    return [x0, y0, x1, y1];
  };
  const mainOf = (K, i) => (K.areas[i] || []).reduce((m, a) => (((map.area(a) || {}).a || 0) > ((map.area(m) || {}).a || 0) ? a : m), (K.areas[i] || [])[0]);
  // a small map: the round's places with the one asked lit (lit), or that place alone (shape); framed on the round's
  // box where it has one
  function miniMap(K, ids, id, own, box, W = 120) {
    const wrap = el('span', 'sm-mini' + (own === 'shape' ? ' sm-shape' : ''));
    const svg = svgEl('svg', { preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' });
    wrap.append(svg);
    const draw = () => {
      const mine = [...new Set(K.areas[id] || [])], all = own === 'shape' ? mine : [...new Set(ids.flatMap(i => K.areas[i] || []))];
      if (!all.length) return;
      // places that are points (a city quiz): the round's as small dots, the one asked larger
      const pt = a => { const A = map.area(a); return A && POINT.test(A.d || '') ? A : null; };
      if (all.every(pt)) {
        const P = all.map(pt), xs = P.map(A => A.lx), ys = P.map(A => A.ly);
        const [x0, y0, x1, y1] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
        const span = Math.max(x1 - x0, y1 - y0, 1), pad = span * 0.1, u = (span + 2 * pad) / 100;
        svg.setAttribute('viewBox', `${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`);
        const ctx = svgEl('g', { class: 'sm-ctx sm-pts' }), lit = svgEl('g', { class: 'sm-own sm-pts' });
        for (const A of P) ctx.append(svgEl('circle', { cx: A.lx, cy: A.ly, r: u * 1.8 }));
        for (const A of mine.map(pt).filter(Boolean)) lit.append(svgEl('circle', { cx: A.lx, cy: A.ly, r: u * 3.6 }));
        svg.append(ctx, lit);
        return;
      }
      // (framed on each item's largest area: a country's far parts, its own areas on a world map, stay out of view)
      const fixed = own !== 'shape' && box;
      let [x0, y0, x1, y1] = fixed ? box : roughBox(own === 'shape' ? mine : [...new Set(ids)].map(i => mainOf(K, i)).filter(Boolean));
      const k = W / Math.max(x1 - x0, y1 - y0, 1);
      const ctx = svgEl('g', { class: 'sm-ctx' }), lit = svgEl('g', { class: 'sm-own' });
      try {
        if (own !== 'shape') for (const d of map.place(K, all, k).parts) if (d) ctx.append(svgEl('path', { d }));
        for (const d of map.place(K, mine, k).parts) if (d) lit.append(svgEl('path', { d }));
        svg.append(ctx, lit);
      } catch (e) { return; }
      // its own box, once drawn (unless far larger than the rough one: a country with parts across the world frames its
      // main part)
      requestAnimationFrame(() => {
        let b = null; try { b = (own === 'shape' ? lit : ctx).getBBox(); } catch (e) { /* (not drawn) */ }
        if (!fixed && b && b.width + b.height > 0 && b.width * b.height < 8 * (x1 - x0) * (y1 - y0)) { x0 = b.x; y0 = b.y; x1 = b.x + b.width; y1 = b.y + b.height; }
        const pad = Math.max(x1 - x0, y1 - y0) * 0.06 || 1;
        svg.setAttribute('viewBox', `${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`);
      });
    };
    needOutlines().then(draw);
    return wrap;
  }
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // steps [[ms, do]] again every period ms, while the element is on the page (with less motion: each done once)
  function timeline(node, period, steps) {
    if (still) { for (const [, f] of steps) f(); return; }
    let seen = false; const born = performance.now();
    const cycle = () => {
      if (node.isConnected) seen = true;
      else if (seen || performance.now() - born > 3000) return; // (gone from the page, or never there)
      for (const [ms, f] of steps) setTimeout(() => { if (node.isConnected || !seen) f(); }, ms);
      setTimeout(cycle, period);
    };
    cycle();
  }
  // text typed letter by letter, the caret after it; held, then typed again. done(true) once typed, done(false) when cleared
  function typer(span, text, done) {
    const chars = [...text], per = 130, start = 300, end = start + chars.length * per;
    timeline(span, end + 1700, [
      [0, () => { span.textContent = ''; if (done) done(false); }],
      ...chars.map((c, i) => [start + i * per, () => { span.textContent = chars.slice(0, i + 1).join(''); }]),
      [end, () => { if (done) done(true); }],
    ]);
  }
  const loadImg = t => { for (const i of t.tagName === 'IMG' ? [t] : t.querySelectorAll('img')) if (!i.getAttribute('src') && i.dataset.src) i.src = i.dataset.src; };
  function question(P, K, ids, id, box) {
    const f = P.format;
    if (f === 'outline') return miniMap(K, ids, id, 'lit', box);
    if (f === 'shape') return miniMap(K, ids, id, 'shape', box);
    const q = el('span', 'sm-q sm-q-' + f);
    if (P.back) { const n = el('span'); n.textContent = (P.questionName || P.answerName)(id); q.append(n); return q; } // (Pick back: the name asked, its texts picked)
    if (f === 'code') q.textContent = model.check.askText(K, id);
    else { const tile = formats.tile(P, id); loadImg(tile); q.append(tile); }
    return q;
  }
  function answer(P, K, ids, id, box) {
    const m = P.mode, word = wordsOf(P)(id), lang = P.answerLang ? P.answerLang(id) : P.back && K.prompt === 'text' ? (K.text(id) || {}).lang : '';
    const wrap = x => { if (lang) x.lang = lang; return x; };
    if (m === 'list') {
      const a = el('span', 'sm-a sm-list'), field = el('span', 'sm-field'), typed = el('span', 'sm-typed');
      field.append(typed, el('i', 'sm-caret'));
      const rows = el('span', 'sm-rows');
      let mine = null;
      for (const w of [word, ...others(P, ids, id, 2)]) { const r = el('span'); r.textContent = w; rows.append(r); if (w === word) mine = r; }
      a.append(field, rows);
      typer(typed, [...word].slice(0, 3).join(''), done => mine.classList.toggle('sm-on', done));
      return wrap(a);
    }
    if (m === 'type') {
      const a = el('span', 'sm-a sm-type'), field = el('span', 'sm-field'), typed = el('span', 'sm-typed');
      field.append(typed, el('i', 'sm-caret')); a.append(field);
      typer(typed, P.code ? model.check.askText(K, id) : word);
      return wrap(a);
    }
    if (m === 'picks') {
      const a = el('span', 'sm-a sm-picks');
      let opts = [];
      if (P.soon) opts = [{ id, word }, ...others(P, ids, id, 3).map(w => ({ id: null, word: w }))].sort((x, y) => x.word.localeCompare(y.word)); // (not built: the right one and three others)
      else try { opts = model.check.options(P, id, ids, Math.random); } catch (e) { /* (too few to pick from) */ }
      for (const o of opts) {
        const b = el('span', o.id === id ? 'sm-on' : ''); if (lang) b.lang = lang;
        if (P.answerPicture || /^(data:|https?:|\.\.?\/|\/)/.test(o.word)) { const im = el('img'); im.src = o.word; im.alt = ''; b.append(im); } else b.textContent = o.word;
        a.append(b);
      }
      return a;
    }
    if (m === 'pairs') {
      const a = el('span', 'sm-a sm-pairs'), qs = [id, ...[...new Set(ids)].filter(x => x !== id).slice(0, 2)], names = qs.map(P.answerName);
      const order = [1, 2, 0];
      let first = null, second = null;
      qs.forEach((q, i) => {
        const l = el('span', 'sm-l'), t = formats.tile(P, q); loadImg(t); l.append(t);
        const r = el('span', 'sm-r'); r.textContent = names[order[i]];
        if (i === 0) first = l; if (order[i] === 0) second = r;
        a.append(l, r);
      });
      // (the question tapped, its name some time later: both lit as a matched pair; then again)
      timeline(a, 4400, [[0, () => { first.classList.remove('sm-lit'); second.classList.remove('sm-lit'); }], [700, () => first.classList.add('sm-lit')], [1900, () => second.classList.add('sm-lit')]]);
      return a;
    }
    if (m === 'cards') {
      const a = el('span', 'sm-a sm-cardsa'), card = el('span', 'sm-card');
      const front = el('span', 'sm-front'), back = el('span', 'sm-back');
      if (P.format === 'outline' || P.format === 'shape') front.append(question(P, K, ids, id, box)); else { const t = formats.tile(P, id); loadImg(t); front.append(t); }
      back.append(miniMap(K, ids, id, 'lit', box, 80));
      card.append(front, back); a.append(card); return a;
    }
    return el('span', 'sm-a');
  }

  /* ---------- the preview on the map ---------- */
  let demo = null, demoRaf = 0, demoAsked = false;
  // (playing: the round has begun, and its start clears the map; the place asked is left to it)
  function stopDemo(playing) { cancelAnimationFrame(demoRaf); demoRaf = 0; if (demo) { demo.remove(); demo = null; } if (demoAsked && !playing) map.ask(null); demoAsked = false; }
  function startDemo(P, ids, { label, box, blind }) {
    stopDemo();
    if (!P || !ids.length) return;
    const K = P.kind, id = sampleOf(K, ids), stage = $('stage');
    const onMap = blind ? 'blind' : ['map', 'all'].includes(P.mode) ? 'ring' : P.mode === 'draw' ? 'sketch' : P.format === 'outline' ? 'lit' : null;
    demo = el('div', 'sm-demo');
    const card = el('div', 'sm-democard'), head = el('div', 'sm-dhead'), name = el('b');
    head.innerHTML = icon(P.icon || P.way); name.textContent = label || model.kinds.wayLabel(K, P.way); head.append(name);
    const body = el('div', 'sm-demobody');
    if (P.format !== 'outline' && P.mode !== 'cards' && P.mode !== 'pairs') body.append(question(P, K, ids, id, box));
    if (!['map', 'all', 'draw'].includes(P.mode)) { if (body.childNodes.length) body.append(el('span', 'sm-arrowbox', ARROW)); body.append(answer(P, K, ids, id, box)); }
    body.classList.toggle('one', body.childNodes.length === 1);
    card.append(head); if (body.childNodes.length) card.append(body);
    demo.append(card);
    stage.append(demo);
    const mine = [...new Set(K.areas[id] || [])], mainA = mainOf(K, id), mineDemo = demo;
    // once the map has stopped moving (the round framed): the answer on the map, or the place lit
    needOutlines().then(settle).then(() => {
      if (demo !== mineDemo || !onMap) return;
      // the place asked (Name it, Type code): lit by the map itself, as the round will show it, where it is (the view stays)
      if (onMap === 'lit') { const v0 = map.view(); map.ask(K.dotOf ? K.askAreas(id) : K.areas[id]); map.setView(v0); demoAsked = true; return; }
      const svg = svgEl('svg', { class: 'sm-demosvg', 'aria-hidden': 'true' }), g = svgEl('g'), tap = svgEl('g', { class: 'sm-tap' });
      svg.append(g); demo.append(svg);
      let p; try { p = map.place(K, mine, map.scale()); } catch (e) { return; }
      const pts = mine.map(a => map.area(a)).filter(A => A && POINT.test(A.d || ''));
      const lit = svgEl('g', { class: onMap === 'ring' ? 'sm-hit' : 'sm-goal' });
      if (pts.length) for (const A of pts) lit.append(svgEl('circle', { cx: A.lx, cy: A.ly, r: 1, class: 'sm-ptdot' }));
      else for (const d of p.parts) if (d) lit.append(svgEl('path', { d }));
      if (onMap !== 'blind') g.append(lit);
      let sketch = null;
      if (onMap === 'sketch') { sketch = pts.length ? svgEl('circle', { cx: pts[0].lx, cy: pts[0].ly, r: 1, class: 'sm-sketch', pathLength: 100 }) : svgEl('path', { d: p.line || p.parts.join(''), class: 'sm-sketch', pathLength: 100 }); g.append(sketch); }
      // Blind: the pointer taps a little off the place (the same on the screen at any zoom), a line joins the tap to the
      // place, then the distance between them
      const BX = -40, BY = 28; let km = null;
      if (onMap === 'blind') {
        const ptr = svgEl('g', { class: 'sm-bptr' }), arrow = svgEl('g', { transform: `translate(${BX + 5} ${BY + 5}) scale(1.9)` }); arrow.innerHTML = POINTER; ptr.append(arrow);
        km = svgEl('text', { x: BX / 2 + 10, y: BY / 2 + 15, class: 'sm-bkm' });
        tap.classList.add('sm-blind');
        tap.append(svgEl('path', { d: `M${BX} ${BY}L0 0`, class: 'sm-bline', pathLength: 100 }), svgEl('circle', { cx: BX, cy: BY, r: 22, class: 'sm-bpulse' }),
          svgEl('circle', { cx: BX, cy: BY, r: 5, class: 'sm-bguess' }), svgEl('circle', { r: 6.5, class: 'sm-btrue' }), km, ptr);
        svg.append(tap);
      }
      if (onMap === 'ring') { tap.append(svgEl('circle', { r: 22, class: 'sm-pulse' }), svgEl('circle', { r: 5, class: 'sm-dot' })); const ptr = svgEl('g', { class: 'sm-ptr', transform: 'translate(5 5) scale(1.9)' }); ptr.innerHTML = POINTER; tap.append(ptr); svg.append(tap); }
      const A = map.area(mainA) || {};
      // (kept on the map as it moves: the drawing follows the view, redrawn where it changed)
      let seen = '';
      const follow = () => {
        if (demo !== mineDemo) return;
        const r = stage.getBoundingClientRect(), [x0, y0] = map.toScreen(0, 0), [x1] = map.toScreen(1, 0), k = x1 - x0, key = [x0, y0, k, r.left, r.top].join();
        if (key !== seen) {
          seen = key;
          g.setAttribute('transform', `matrix(${k} 0 0 ${k} ${x0 - r.left} ${y0 - r.top})`);
          for (const c of g.querySelectorAll('.sm-ptdot')) c.setAttribute('r', 7 / k);
          if (sketch) { sketch.setAttribute('stroke-width', 3 / k); if (pts.length) sketch.setAttribute('r', 20 / k); }
          if (A.lx != null) { const [sx, sy] = map.toScreen(A.lx, A.ly); tap.setAttribute('transform', `translate(${sx - r.left} ${sy - r.top})`); }
          if (km && A.lx != null && quiz.free) { const d = quiz.free.measure({ x: A.lx + BX / k, y: A.ly + BY / k }, id)[0]; km.textContent = `${d < 10 ? d.toFixed(1) : Math.round(d)} km`; }
        }
        demoRaf = requestAnimationFrame(follow);
      };
      follow();
    });
  }
  // until the view has stood still for two frames (at most 1.5 s)
  const settle = () => new Promise(done => {
    let last = '', n = 0; const t0 = performance.now();
    const tick = () => {
      const v = map.view(), k = [v.x, v.y, v.w, v.h].map(x => x.toFixed(3)).join();
      n = k === last ? n + 1 : 0; last = k;
      if (n >= 2 || performance.now() - t0 > 1500) done(); else requestAnimationFrame(tick);
    };
    tick();
  });

  /* ---------- the maps as pictures ---------- */
  // The country in a picture W × H (css pixels): its box in map units (the map's areas, each a square of its size around
  // its middle, centred, with a margin), the tiles that cover it at the zoom that gives it px pixels across, placed.
  let land = null, mapsOpen = false;
  const thumbCache = new Map();
  function landBox() {
    if (land) return land;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const a of map.ids) { const A = map.area(a); if (!A || A.lx == null) continue; const h = Math.sqrt(A.a || 0) * 0.6; x0 = Math.min(x0, A.lx - h); y0 = Math.min(y0, A.ly - h); x1 = Math.max(x1, A.lx + h); y1 = Math.max(y1, A.ly + h); }
    return (land = isFinite(x0) ? [x0, y0, x1, y1] : null);
  }
  function windowOf(W, H, maxZ = 14, px = 2 * W) {
    const P = quiz.proj, B = landBox(); if (!P || !B) return null;
    const cx = (B[0] + B[2]) / 2, cy = (B[1] + B[3]) / 2;
    let ew = (B[2] - B[0]) * 1.12 || 1, eh = (B[3] - B[1]) * 1.12 || 1;
    if (ew / eh < W / H) ew = eh * W / H; else eh = ew * H / W;
    const z = Math.max(0, Math.min(maxZ, Math.round(Math.log2((px / ew) * 360 * P.k / 256)))), n = 2 ** z, T = 256 * n;
    const gx = x => ((x / P.k + P.lng0 + 180) / 360) * T, gy = y => ((1 - ((P.y0 - y / P.k) * Math.PI / 180) / Math.PI) / 2) * T;
    const L = gx(cx - ew / 2), Tp = gy(cy - eh / 2), R = gx(cx + ew / 2), Bm = gy(cy + eh / 2), k = W / (R - L), tiles = [];
    for (let ty = Math.floor(Tp / 256); ty <= Math.floor((Bm - 1) / 256); ty++) for (let tx = Math.floor(L / 256); tx <= Math.floor((R - 1) / 256); tx++) {
      if (ty < 0 || ty >= n) continue;
      tiles.push({ x: ((tx % n) + n) % n, y: ty, z, left: (tx * 256 - L) * k, top: (ty * 256 - Tp) * k, size: 256 * k });
    }
    return { box: [cx - ew / 2, cy - eh / 2, ew, eh], tiles, key: `${W}x${H}` };
  }
  // The quiz map in a picture, as the map draws it: the sea, the world's land under it (quiz), the kind's places in
  // their own colours with their lines (a city quiz: its country and region lines, quiz.base); overlay: those colours
  // and lines alone, laid over the street map's tiles as the overlay lays them.
  function quizSvg(Wd, K, look) {
    const ck = `${Wd.key}|${K.key}|${look}`;
    if (thumbCache.has(ck)) return thumbCache.get(ck).cloneNode(true);
    const svg = svgEl('svg', { viewBox: Wd.box.join(' '), preserveAspectRatio: 'xMidYMid slice', class: 'sm-msvg sm-m' + look, 'aria-hidden': 'true' });
    const country = svgEl('g'), jobs = []; svg.append(country);
    const [x, y, w, h] = Wd.box;
    if (look === 'quiz') jobs.push(map.world([x, y, x + w, y + h]).then(list => { for (const c of list) { const g = svgEl('g', { transform: c.transform }); g.append(svgEl('path', { d: c.d, class: 'world' })); svg.insertBefore(g, country); } }));
    if (quiz.base && quiz.base.land) {
      country.append(svgEl('path', { d: quiz.base.land, class: 'land' }));
      if (quiz.base.lines) country.append(svgEl('path', { d: quiz.base.lines, class: 'lines' }));
    } else jobs.push(needOutlines().then(() => {
      const L = map.layout(K), k = 64 / Math.max(w, 1e-6);
      for (const u of L ? L.units : K.ids.map(i => K.areas[i] || [])) {
        if (!u.length) continue;
        let parts; try { parts = map.place(K, u, k).parts; } catch (e) { continue; }
        const fill = L && L.color && L.color[u[0]];
        for (const d of parts) if (d) { const e = svgEl('path', { d, class: 'r' }); if (fill) e.style.fill = fill; country.append(e); }
      }
    }));
    Promise.all(jobs).then(() => thumbCache.set(ck, svg.cloneNode(true)), () => {});
    return svg;
  }
  // a picture of a map, W × H, the country in the middle
  function thumb(key, K, W, H) {
    const box = el('span', 'sm-th sm-th-' + key); box.style.width = W + 'px'; box.style.height = H + 'px';
    const Wd = windowOf(W, H, key === 'sat' ? 8 : 14, key === 'quiz' || key === 'free' ? 2 * W : Math.max(320, $('stage').clientWidth || 800)); // (the tiles at the zoom the page opens with)
    if (!Wd) return box;
    const tilesOf = url => Wd.tiles.forEach(t => {
      const i = el('img', 'sm-tl'); i.alt = ''; i.loading = 'lazy'; const src = url(t);
      Object.assign(i.style, { left: t.left + 'px', top: t.top + 'px', width: t.size + 1 + 'px', height: t.size + 1 + 'px' });
      i.src = src; box.append(i);
      if (key === 'bare' && typeof BARE_TILES === 'function') BARE_TILES(src).then(b => { if (b) i.src = b; }, () => {}); // (the bare map's own: its names and lines taken out)
    });
    const OSM = t => `https://tile.openstreetmap.org/${t.z}/${t.x}/${t.y}.png`, SAT = t => `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2025_3857/default/g/${t.z}/${t.y}/${t.x}.jpg`;
    if (key === 'quiz' || key === 'free') box.append(quizSvg(Wd, K, 'quiz'));
    else if (key === 'sat') tilesOf(SAT);
    else { tilesOf(OSM); if (key === 'overlay') box.append(quizSvg(Wd, K, 'overlay')); }
    return box;
  }
  // (a phone: a tap off the maps closes them)
  let mapsBar = null;
  document.addEventListener('click', e => { if (mapsOpen && mapsBar && !mapsBar.contains(e.target)) { mapsOpen = false; mapsBar.classList.remove('open'); } });
  function drawMaps(bar, o, K) {
    mapsBar = bar;
    const kids = [];
    if (o.list.length > 1) {
      const by = new Set(o.list), steps = STEPS.filter(([k]) => by.has(k)), onStreet = steps.some(([k]) => k === o.on);
      const streetKey = onStreet ? o.on : steps.some(([k]) => k === o.street) ? o.street : by.has('street') ? 'street' : steps[0] && steps[0][0];
      const col = el('div', 'sm-mcol');
      // Street map's steps, above the pictures, while it is on
      if (onStreet && steps.length > 1) {
        const st = el('div', 'sm-steps'); st.setAttribute('role', 'group'); st.setAttribute('aria-label', 'Street map');
        st.append(...steps.map(([k, word], i) => {
          const t = el('button'); t.type = 'button'; t.dataset[o.attr] = k; t.title = o.labels[k][0]; t.setAttribute('aria-pressed', o.on === k);
          const lv = el('span', 'lvl'); for (let j = 0; j < 3; j++) { const ii = el('i'); if (j <= i) ii.className = 'on'; lv.append(ii); }
          t.append(lv, word); t.onclick = () => { o.keepStreet(k); o.pick(k); };
          return t;
        }));
        col.append(st);
      }
      // the pictures: the maps off the street map's tiles, the street maps as one, the satellite
      const main = [...o.list.filter(k => !steps.some(([s]) => s === k) && k !== 'sat'), ...(steps.length ? [streetKey] : []), ...(by.has('sat') ? ['sat'] : [])];
      const row = el('div', 'sm-strip'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', o.attr === 'map' ? 'Map' : 'Background');
      if (o.attr === 'map') row.id = 'mapSeg';
      row.append(...main.map(k => {
        const street = steps.some(([s]) => s === k), on = street ? onStreet : o.on === k, label = street ? 'Street map' : o.labels[k][0];
        const t = el('button', 'sm-pic'); t.type = 'button'; t.dataset[o.attr] = k; if (street) t.dataset.street = '';
        t.title = label; t.setAttribute('aria-label', label); t.setAttribute('aria-pressed', on);
        t.append(thumb(k, K, 56, 42));
        t.onclick = () => { if (!(street && onStreet)) o.pick(k); };
        return t;
      }));
      col.append(row);
      kids.push(col);
    }
    if (o.cover) { const c = el('button', 'sm-cover'); c.type = 'button'; c.setAttribute('aria-pressed', !!o.coverOn); c.title = 'Street View coverage'; c.innerHTML = `<i class="box"></i><svg class="sm-ic" viewBox="0 0 24 24" aria-hidden="true">${COVER}</svg>`; c.append('Coverage'); c.onclick = () => o.onCover(); kids.unshift(c); } // (left of the pictures)
    bar.classList.toggle('none', !kids.length); // (its hidden is the App's: shown on the setup screen and in a review)
    if (!kids.length) { bar.replaceChildren(); return; }
    // (a phone: the map in use as one picture at the map's bottom right, which opens the rest above it)
    const now = el('button', 'sm-now'); now.type = 'button'; now.title = 'Maps'; now.setAttribute('aria-expanded', mapsOpen);
    now.append(thumb(o.list.length > 1 ? o.on : 'quiz', K, 46, 36));
    now.onclick = e => { e.stopPropagation(); mapsOpen = !mapsOpen; bar.classList.toggle('open', mapsOpen); now.setAttribute('aria-expanded', mapsOpen); };
    const all = el('div', 'sm-maps'); all.append(...kids);
    bar.replaceChildren(now, all); bar.classList.toggle('open', mapsOpen);
  }

  return { icon, spin, preview: { show: startDemo, stop: stopDemo }, maps: { draw: drawMaps } };
}
