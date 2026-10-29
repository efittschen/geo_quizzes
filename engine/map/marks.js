// What the areas show: their states, as the stylesheets draw them (got, t2, t3, miss: the tries; ans: the answer shown;
// flash: a wrong tap; found, pick: an item of several areas; sel: Explore's; pre: the setup's preview; rare; out: not in
// the round), a state for a moment, the results fading, the answer's outline, the place asked, the area under a mouse.
//
//   const marks = makeMarks(quiz, shapes, layouts, labels, view)
//   marks.mark(areas, states, on), marks.blink(key, areas, state, ms, after), marks.fade(ms, labelsToo), marks.unfade()
//   marks.dim(areas)            every area not in the set dimmed (the street map's stylesheet ignores it: borders)
//   marks.clear()               every state, label, pin, highlight and blink off
//   marks.highlight(areas)      the answer's outline (null: none)
//   marks.ask(areas, around), marks.unask()   the place asked, outlined, brought into view (see ask)
//   marks.reveal(areas, how)    a shown answer brought into view -> the view it left, or null
//   marks.hover(areas)          the outline of the areas under the mouse (null: none)
//   marks.box(area), marks.edges(areas)   an area's box; the outline of areas as one place
//   marks.stateOf(area), marks.states()   for the tools

const RESULT = ['got', 't2', 't3', 'miss'], ALL = ['got', 't2', 't3', 'miss', 'ans', 'sel', 'pick', 'flash', 'found', 'rare', 'out', 'pre'];

export function makeMarks(quiz, shapes, layouts, labels, view) {
  const { S } = shapes, A = shapes.area, el = shapes.el, ids = shapes.ids;
  const blinks = new Map();
  let fading = 0;

  function mark(areas, states, on = true) {
    const list = [].concat(states);
    for (const a of areas) for (const n of list) el(a).classList.toggle(n, on);
    layouts.changed(areas);
  }
  function blink(key, areas, state, ms, after) {
    clearTimeout(blinks.get(key));
    mark(areas, state, true);
    blinks.set(key, setTimeout(() => { mark(areas, state, false); blinks.delete(key); if (after) after(); }, ms));
  }
  function fade(ms, labelsToo) {
    clearTimeout(fading);
    const go = () => { mark(ids, [...RESULT, 'rare'], false); if (labelsToo) labels.clear(); };
    if (ms) fading = setTimeout(go, ms); else go();
  }
  function dim(areas) {
    const keep = new Set(areas);
    for (const a of ids) el(a).classList.toggle('out', !keep.has(a));
    layouts.changed(ids); labels.out(); layouts.dimmed();
  }
  function clear() {
    labels.unpin(); labels.unguess(); clearTimeout(fading);
    for (const t of blinks.values()) clearTimeout(t);
    blinks.clear();
    for (const a of ids) el(a).classList.remove(...ALL);
    layouts.changed(ids);
    labels.clear(); labels.out();
    highlight(null); ask(null);
  }
  const highlight = areas => S.ansUse.setAttribute('d', areas ? layouts.outline(areas) : '');

  const box = a => { const s = shapes.hit(a); return { x: s.x0, y: s.y0, width: s.x1 - s.x0, height: s.y1 - s.y0 }; };
  const boundsOf = areas => {
    const bs = areas.map(box);
    return [Math.min(...bs.map(b => b.x)), Math.min(...bs.map(b => b.y)), Math.max(...bs.map(b => b.x + b.width)), Math.max(...bs.map(b => b.y + b.height))];
  };
  // The outline of some areas as one place: their edges but those two of them share (a code used across a province of
  // two parts is one outline). Where neighbours' borders don't line up, a line between them stays. A place drawn as a
  // circle: its own outline, whole.
  function edges(areas) {
    const q = shapes.q, pt = p => Math.round(p[0] * q) + ',' + Math.round(p[1] * q), key = (p, n) => { const a = pt(p), b = pt(n); return a < b ? a + ' ' + b : b + ' ' + a; };
    const curved = a => /[AaCcQqSsTtHhVv]/.test(A(a).d), own = [...new Set(areas)].filter(a => A(a));
    const rings = own.filter(a => !curved(a)).flatMap(shapes.rings), count = new Map();
    for (const r of rings) { let p = r[r.length - 1]; for (const n of r) { const k = key(p, n); count.set(k, (count.get(k) || 0) + 1); p = n; } }
    let d = '';
    for (const r of rings) {
      let p = r[r.length - 1], on = false;
      for (const n of r) {
        const keep = count.get(key(p, n)) === 1 && (p[0] !== n[0] || p[1] !== n[1]);
        if (keep) { if (!on) d += `M${+p[0].toFixed(2)},${+p[1].toFixed(2)}`; d += `L${+n[0].toFixed(2)},${+n[1].toFixed(2)}`; }
        on = keep; p = n;
      }
    }
    return d + own.filter(curved).map(a => A(a).d).join('');
  }

  // The place asked (outline: Name it, Type code): filled and outlined, and flown to when it is out of view or too small
  // to see. around (Type code): { around: the larger area it is part of, tinted under it, or parts: its parts that have
  // codes of their own, dashed }; a part is shown with the larger area in view. A dot (a city): ringed, the map centred
  // on it, at most a third of the map wide, unless it is near the middle of a view as narrow already.
  function ask(areas, around) {
    const dots = !!areas && areas.length > 0 && (quiz.dots || areas.every(a => A(a).dot));
    S.askUse.setAttribute('d', areas ? layouts.outline(areas) : '');
    S.askLine.setAttribute('d', areas ? (dots ? layouts.outline(areas) : edges(areas)) : '');
    for (const p of [S.askUse, S.askLine]) p.classList.toggle('dot', dots);
    S.askCtx.setAttribute('d', areas && around ? (around.around ? layouts.outline(around.around) : around.parts.map(edges).join('')) : '');
    S.askCtx.setAttribute('class', around && around.around ? 'around' : 'parts');
    if (!areas || !areas.length) return;
    if (around && around.around) areas = [...new Set([...areas, ...around.around])];
    const [x0, y0, x1, y1] = boundsOf(areas), v = view.get(), base = view.base, ar = base.w / base.h;
    if (dots) {
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, w = Math.min(v.w, base.w / 3);
      if (v.w <= base.w / 3 && Math.abs(cx - v.x - v.w / 2) < v.w * .35 && Math.abs(cy - v.y - v.h / 2) < v.h * .35) return;
      view.go({ x: cx - w / 2, y: cy - w / ar / 2, w, h: w / ar });
      return;
    }
    if (x0 >= v.x && x1 <= v.x + v.w && y0 >= v.y && y1 <= v.y + v.h && Math.max(x1 - x0, y1 - y0) * view.scale() >= 24) return;
    // with room around it (four times its size, a twelfth of the map at least): its neighbours place it
    const w = Math.min(base.w, Math.max((x1 - x0) * 4, (y1 - y0) * 4 * ar, base.w / 12));
    view.go({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - w / ar / 2, w, h: w / ar });
  }
  function unask() { S.askUse.setAttribute('d', ''); if (S.askLine.classList.contains('dot')) S.askLine.setAttribute('d', ''); }

  // A shown answer the view doesn't show is brought into view: on the overlay when it lies outside the view; elsewhere
  // where the quiz says so (flyAnswer) or always (a review), when it lies outside the view or is a speck there.
  function reveal(areas, { overlay, always }) {
    const v = view.get();
    if (overlay) {
      if (areas.length && !areas.some(a => { const b = box(a); return b.x < v.x + v.w && b.x + b.width > v.x && b.y < v.y + v.h && b.y + b.height > v.y; })) view.frameBoxes(areas.map(box));
      return null;
    }
    if (!(quiz.flyAnswer || always) || !areas.length) return null;
    const s = view.scale();
    const seen = areas.some(a => {
      const b = box(a), x = b.x + b.width / 2, y = b.y + b.height / 2;
      return x > v.x && x < v.x + v.w && y > v.y && y < v.y + v.h && (!quiz.flyAnswer || A(a).dot || Math.max(b.width, b.height) * s >= 16);
    });
    if (seen) return null;
    view.frameBoxes(areas.map(box));
    return v;
  }

  let hovered = null;
  function hover(area, areas) {
    if (hovered !== area) { if (hovered) el(hovered).classList.remove('hover'); if (area) el(area).classList.add('hover'); hovered = area; }
    S.hoverUse.setAttribute('d', areas ? layouts.outline(areas) : '');
  }

  return {
    mark, blink, fade, unfade: () => clearTimeout(fading), dim, clear, highlight, ask, unask, reveal, hover, box, edges,
    stateOf: a => ALL.filter(c => el(a).classList.contains(c)),
    states: () => Object.fromEntries(ids.map(a => [a, ALL.filter(c => el(a).classList.contains(c))]).filter(([, s]) => s.length)),
  };
}
