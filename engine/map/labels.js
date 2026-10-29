// Names on the map: one label per item of the kind drawn, items at the same spot sharing one ("495 / 499"); a kind with
// areaLabel one fixed label per area, one with labelPerArea one per area listing every item there. Pins (the town a
// code belongs to) and map play's guess (a line from the tap to the place). Their sizes are on the screen, set once:
// an area's name its size on the map from 9 px up to NAME (gl-map shrinks it as the map zooms), a city's CITY above its
// dot, a pin's PIN.
//
//   const labels = makeLabels(quiz, shapes)
//   labels.label(kind, id, on), labels.only(kind, ids), labels.all(kind), labels.clear()
//   labels.tag(kind, area, tag, on)     a tag on an area's own label (a pick; 'area:…' while it flashes): shown while it
//                                       has one
//   labels.out()                        an area's own label dimmed with its area (a board of tiles keeps them on show)
//   labels.pin(p), labels.unpin(), labels.guess(from, to), labels.unguess()
//   labels.size(s, dot)                 the dots (dot px across) and the circles of the pin and the guess sized for s
//                                       screen pixels per map unit
//   labels.shown()                      the labels on show, their text (for the tools)

// (px on the screen; a pin's name stands PIN_UP px above its point)
const NAME = 15, CITY = 12, PIN = 13, PIN_UP = -9;

export function makeLabels(quiz, shapes) {
  const { S, svg } = shapes, A = shapes.area;
  let key = null, entries = [], ofItem = {}, ofArea = {}, sized = 0, dotPx = 11;

  // an item's label point: its area's, or for an item over several areas the one nearest their weighted middle (which
  // may lie in none of them: a zone over Central Russia and the Far East)
  function middle(areas) {
    let a = 0, x = 0, y = 0;
    for (const id of areas) { const r = A(id), w = r.a || 1; a += w; x += r.lx * w; y += r.ly * w; }
    const m = { x: x / a, y: y / a, area: a };
    if (areas.length > 1) {
      const d = id => Math.hypot(A(id).lx - m.x, A(id).ly - m.y), near = areas.reduce((b, id) => (d(id) < d(b) ? id : b));
      m.x = A(near).lx; m.y = A(near).ly;
    }
    return m;
  }
  function build(K) {
    if (key === K.key) return;
    clear();
    key = K.key; entries = []; ofItem = {}; ofArea = {}; S.labels.replaceChildren();
    const at = {};
    const entry = (k, m) => {
      if (at[k]) return at[k];
      const e = (at[k] = { ...m, K, ids: [], shown: new Set(), el: S.el('text') });
      e.el.setAttribute('x', m.x); e.el.setAttribute('y', m.y); e.el.setAttribute('class', 'off');
      e.el.setAttribute('font-size', quiz.dots ? CITY : NAME);
      e.el.dataset.raw = (Math.sqrt(m.area) * quiz.labelScale).toPrecision(5); // (its size on the map, which gl-map holds from 9 px up to NAME)
      S.labels.appendChild(e.el); entries.push(e);
      return e;
    };
    const own = (e, id) => { e.ids.push(id); (ofItem[id] ??= []).push(e); };
    if (K.areaLabel) for (const a of shapes.ids) {
      const e = (ofArea[a] = entry(a, middle([a])));
      e.fixed = K.areaLabel(a); e.el.textContent = e.fixed;
      for (const id of K.at[a] || []) own(e, id);
    }
    else if (K.labelPerArea) for (const a of shapes.ids) {
      const ids = K.at[a]; if (!ids) continue;
      const e = (ofArea[a] = entry(a, middle([a]))), main = K.primary(a);
      for (const id of [main, ...ids.filter(x => x !== main)]) own(e, id);
    }
    else for (const id of K.ids) { const m = middle(K.areas[id]), e = entry(Math.round(m.x) + ',' + Math.round(m.y), m); e.ids.push(id); ofItem[id] = [e]; }
    out();
  }
  // what a label says: its items shown (named alike, once); a fixed one its text while anything is shown; an area
  // flashed ('area:…' shown) everything on it
  function render(e) {
    const all = [...e.shown].some(s => s.startsWith('area:'));
    const text = e.fixed !== undefined ? (e.shown.size ? e.fixed : '') : [...new Set(e.ids.filter(id => all || e.shown.has(id)).map(id => e.K.short(id)))].join(' / ');
    if (e.fixed === undefined) e.el.textContent = text;
    e.el.classList.toggle('off', !text);
  }
  function clear() { for (const e of entries) { e.shown.clear(); render(e); } }
  function only(K, ids) {
    build(K); clear();
    for (const id of ids) for (const e of ofItem[id] || []) e.shown.add(id);
    for (const e of entries) render(e);
  }
  function out() { for (const a in ofArea) ofArea[a].el.classList.toggle('out', shapes.el(a).classList.contains('out')); }

  function pin(p) {
    unpin();
    if (!p) return;
    const c = S.el('circle'), t = S.el('text');
    c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
    t.setAttribute('x', p.x); t.setAttribute('y', p.y); t.setAttribute('font-size', PIN); t.setAttribute('dy', PIN_UP); t.textContent = p.label;
    S.pins.append(c, t); size(sized, dotPx);
  }
  function unpin() { S.pins.replaceChildren(); }
  function guess(from, to) {
    const line = S.el('line'), dot = S.el('circle');
    line.setAttribute('x1', from.x); line.setAttribute('y1', from.y); line.setAttribute('x2', to.x); line.setAttribute('y2', to.y);
    dot.setAttribute('cx', from.x); dot.setAttribute('cy', from.y);
    S.free.replaceChildren(line, dot); size(sized, dotPx);
  }

  function size(s, dot) {
    sized = s; dotPx = dot;
    svg.style.setProperty('--dot', dot.toFixed(1) + 'px');
    for (const c of S.pins.querySelectorAll('circle')) c.setAttribute('r', (4.5 / s).toFixed(3));
    for (const c of S.free.querySelectorAll('circle')) c.setAttribute('r', (5 / s).toFixed(3));
  }

  return {
    label(K, id, on = true) { build(K); for (const e of ofItem[id] || []) { if (on) e.shown.add(id); else e.shown.delete(id); render(e); } },
    only, all: K => only(K, K.ids), clear, out,
    tag(K, area, tag, on) { build(K); const e = ofArea[area]; if (!e) return; if (on) e.shown.add(tag); else e.shown.delete(tag); render(e); },
    pin, unpin, guess, unguess: () => S.free.replaceChildren(),
    size, get sized() { return sized; },
    shown: () => entries.filter(e => !e.el.classList.contains('off')).map(e => e.el.textContent),
  };
}
