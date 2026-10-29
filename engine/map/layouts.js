// A kind's layout: where its items group areas (zones, states), the areas answered by exactly the same items form a
// unit, drawn as one shape with an outline of its own. Code kinds (clickAll), labels per area (areaLabel) and merge:
// false keep every area. A unit is coloured as its areas' hint group where it has one; else (or for named places:
// prompt 'name', or a kind of places whose hint groups are its answers: hints: false) each unit gets a colour of its own that
// differs from its neighbours' (unitColors: the kind's own list), which says nothing of the answer.
//
// What the map draws, bottom up: the shapes of the units (a unit as one shape: its border alone, geometry.dissolve),
// the areas drawn themselves (those of no such unit, and of those the ones with a state of their own: picked in
// Explore, flashing), the units' outlines, the areas on top. The shape of a unit is in the state all its areas are in.
// Where a unit's areas' borders don't meet point for point, it is drawn as its areas over one shape of all of them in
// their colour, and only its loose areas keep a line of their own colour (geometry.outlines); the others are tight.
//
// Stored shapes (shapes.js beside the page, made by tools/builds/layer-shapes from what dump() gives): each kind's units'
// colours, shapes and outlines (both versions), every line once as an arc, each point with the level of detail that
// needs it. They are used where the units found in the page's data are the ones they were made for (sig).
//
//   const layouts = makeLayouts(quiz, shapes)
//   layouts.of(kind)             { units, pre, color } or null (every area drawn itself)
//   layouts.draw(kind)           the kind drawn as its layout; layouts.drawn: its key
//   layouts.changed(areas)       their states changed: drawn themselves while they have one of their own
//   layouts.dimmed()             a unit whose areas are all dimmed has its outline dimmed, drawn first
//   layouts.detail(s)            the view's detail at s screen pixels per map unit (outline version, band of points)
//   layouts.ahead(prepare, bands)   every zoom step of the layout drawn made ahead, while the page is idle
//   layouts.outline(areas)       their shape as one: by whole units where they make some up
//   layouts.whole(kind, unit)    a unit as one shape (Shape, Learn)
//   layouts.unitAt(area)         the areas of the unit an area is drawn in as one shape, or null
//   layouts.hintLabel(kind)      the text of the option that colours the map
//   layouts.dump(kinds)          for the layer-shapes tool: what shapes.js keeps

import { DETAIL, FINE, arcReader, bandOf, dissolve, neighbours, outlines, pathOf } from './geometry.js';

const PALETTE = Array.from({ length: 10 }, (_, i) => `var(--h${i + 1})`);
// an area's own states, which draw it itself inside a unit drawn as one shape; and its classes that are never its unit's
const OWN_STATE = ['sel', 'flash'], AREA_ONLY = new Set(['r', 'tight', 'top', 'dot']);

export function makeLayouts(quiz, shapes) {
  const { S, svg, spare, ids, q } = shapes, el = shapes.el, A = shapes.area;
  const stored = typeof SHAPES === 'object' && SHAPES.v === 1 && SHAPES.q === q && !window.SHAPES_DUMP ? SHAPES : null;
  const arcs = stored && arcReader(stored), banded = !!(stored && stored.lv);
  const made = new Map();
  let drawn, lines = [], under = [], underOf = {}, version = 0, band = 0; // (drawn: the key of the layout on the map, null for none; undefined before the first)

  // A unit's points at band T (a ring left with fewer than four corners keeps all its points: an island too small to
  // see stays one), as a path.
  const ringsD = (runs, T) => runs.map(r => { let p = arcs.run(r, T); if (T && p.length < 5) p = arcs.run(r, 0); return 'M' + p.slice(0, -1).join('L') + 'Z'; }).join('');
  const runsD = (runs, T) => runs.map(r => 'M' + arcs.run(r, T).join('L')).join('');

  // (a fingerprint of the units and of the outlines they are made of, as the page's data writes them)
  function sigOf(units) {
    let n = 0; for (const u of units) for (const a of u) n += A(a).d.length;
    const [w, h] = shapes.size, s = units.map(u => u.join(',')).join('|') + '|' + Math.round(w) + 'x' + Math.round(h) + '|' + n + '|' + ((quiz.proj && quiz.proj.grain) || '');
    let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
    return (x >>> 0).toString(36) + ':' + units.length;
  }

  function of(K) {
    if (made.has(K.key)) return made.get(K.key);
    let L = null;
    if (!K.clickAll && !K.areaLabel && K.merge !== false) {
      const by = new Map();
      for (const a of ids) { const k = K.at[a] ? [...K.at[a]].sort().join('|') : 'area:' + a; by.set(k, [...(by.get(k) || []), a]); }
      const units = [...by.values()];
      if (units.some(u => u.length > 1)) {
        const P = stored && (stored.kinds[K.key] || stored.kinds[K.like]), pre = P && P.sig === sigOf(units) ? P : null;
        // (stored colours where shapes.js has them; a kind whose hint colours would give the answer away gets its own)
        L = { key: K.key, units, pre, color: pre && pre.color ? Object.fromEntries(units.flatMap((u, i) => u.map(a => [a, pre.color[i]]))) : pre && !own(K) ? null : colours(K, units) };
      }
    }
    made.set(K.key, L);
    return L;
  }

  // (a kind of places whose hint colours are its answers: colours of its own; a picture's kind keeps none)
  const own = K => K.hints === false && K.prompt !== 'photo';
  function colours(K, units) {
    if (!K.unitColors && K.prompt !== 'name' && !own(K) && units.every(u => u.every(a => A(a).g === A(u[0]).g))) return null;
    const near = neighbours(units, shapes.rings, ...shapes.size), col = [], used = new Map();
    const options = units.map(u => (K.unitColors ? K.unitColors(u) : PALETTE));
    for (const i of units.map((_, i) => i).sort((a, b) => near[b].size - near[a].size)) {
      const taken = new Set([...near[i]].map(j => col[j])), free = options[i].filter(c => !taken.has(c));
      col[i] = (free.length ? free : options[i]).reduce((m, c) => ((used.get(c) || 0) < (used.get(m) || 0) ? c : m));
      used.set(col[i], (used.get(col[i]) || 0) + 1);
    }
    return Object.fromEntries(units.flatMap((u, i) => u.map(a => [a, col[i]])));
  }

  // a unit's areas drawn as one shape (not those on top, nor dots)
  const fillOf = u => u.filter(a => !A(a).top && !A(a).dot);
  function whole(L, i, T) {
    const at = ((L.whole ??= {})[L.pre ? T : 0] ??= []);
    if (i in at) return at[i];
    if (L.pre) return (at[i] = L.pre.fill[i] && ringsD(L.pre.fill[i], T));
    const rings = dissolve(fillOf(L.units[i]).map(shapes.rings), q);
    return (at[i] = rings && pathOf(rings, true));
  }
  // the outlines of version d at band T: a path per unit, and the loose areas
  function linesOf(L, d, T) {
    if (L.pre) {
      const at = ((L.bands ??= {})[d + ':' + T] ??= Object.assign([], { loose: new Set(L.pre.loose[d]) }));
      return { line: i => (at[i] ??= runsD(L.pre.lines[d][i], T)), loose: at.loose };
    }
    const o = ((L.lines ??= [])[d] ??= worked(L, d));
    return { line: i => o.paths[i], loose: o.loose };
  }
  function worked(L, d) {
    const unitOf = new Map(L.units.flatMap((u, i) => u.map(a => [a, i])));
    const { lines: runs, loose } = outlines(ids.filter(a => !A(a).top).map(shapes.hit), unitOf, L.units.length, DETAIL[d], q);
    return { paths: runs.map(r => pathOf(r, false)), loose };
  }

  function draw(K) {
    const L = K && of(K), key = L ? K.key : null;
    if (key === drawn) return;
    drawn = key;
    for (const p of [...lines, ...under]) if (p) p.remove();
    lines = []; under = []; underOf = {};
    for (const a of ids) { el(a).style.removeProperty('--hint'); el(a).classList.remove('tight'); }
    svg.classList.toggle('merged', !!L);
    if (L) {
      if (L.color) for (const a of ids) el(a).style.setProperty('--hint', L.color[a]);
      lines = L.units.map(() => { const p = S.el('path'); p.setAttribute('class', 'unit'); return p; });
      under = L.units.map((u, i) => {
        const areas = fillOf(u); if (areas.length < 2) return null;
        const p = S.el('path'), d = whole(L, i, band), hint = el(areas[0]).style.getPropertyValue('--hint');
        p.setAttribute('d', d || areas.map(a => A(a).d).join(''));
        p.dataset.g = A(areas[0]).g; p.dataset.u = i;
        if (hint) p.style.setProperty('--hint', hint);
        for (const a of areas) underOf[a] = i;
        p.areas = areas; p.whole = !!d;
        return p;
      });
      under.forEach((_, i) => paint(i));
    }
    place();
    if (L) { drawLines(); dimmed(); }
  }

  const itself = a => { const p = under[underOf[a]]; return !p || !p.whole || OWN_STATE.some(c => el(a).classList.contains(c)); };
  function place() {
    const shown = ids.filter(itself);
    S.regions.replaceChildren(...under.filter(Boolean), ...shown.filter(a => !A(a).top).map(el), ...lines, ...shown.filter(a => A(a).top).map(el));
    spare.replaceChildren(...ids.filter(a => !el(a).isConnected).map(el));
  }
  function changed(areas) {
    if (!under.length) return;
    const units = new Set();
    for (const a of areas) {
      const i = underOf[a]; if (i === undefined) continue;
      units.add(i);
      if (under[i] && under[i].whole) {
        const want = itself(a), e = el(a);
        if (want !== e.isConnected) { if (want) S.regions.insertBefore(e, lines.find(l => l.isConnected) || null); else spare.appendChild(e); }
      }
    }
    for (const i of units) paint(i);
  }
  function paint(i) {
    const p = under[i]; if (!p) return;
    const [first, ...rest] = p.areas;
    const cls = ['r', 'under', ...(p.whole ? ['whole'] : []), ...[...el(first).classList].filter(c => !AREA_ONLY.has(c) && rest.every(a => el(a).classList.contains(c)))].join(' ');
    if (p.getAttribute('class') !== cls) p.setAttribute('class', cls);
  }
  function drawLines() {
    const L = made.get(drawn), o = linesOf(L, version, band);
    lines.forEach((p, i) => p.setAttribute('d', o.line(i)));
    for (const a of ids) el(a).classList.toggle('tight', underOf[a] !== undefined && !o.loose.has(a));
    // (the other version, worked out here, as soon as the page has nothing to do)
    if (!L.pre && !L.idle) { L.idle = true; idle(() => DETAIL.forEach((_, d) => linesOf(L, d, 0)), 4000); }
  }
  function dimmed() {
    if (!drawn) return;
    const out = made.get(drawn).units.map(u => u.every(a => el(a).classList.contains('out')));
    lines.forEach((p, i) => p.classList.toggle('out', out[i]));
    for (const o of [true, false]) for (const p of lines) if (p.classList.contains('out') === o) S.regions.appendChild(p);
    for (const a of ids) if (A(a).top && el(a).isConnected) S.regions.appendChild(el(a));
  }
  function detail(s) {
    const d = s >= FINE ? 1 : 0, T = banded ? bandOf(s, q) : 0;
    if (d === version && T === band) return;
    const newBand = T !== band;
    version = d; band = T;
    if (!drawn) return;
    const L = made.get(drawn);
    if (newBand && L.pre) under.forEach((p, i) => { if (p && p.whole) p.setAttribute('d', whole(L, i, band)); });
    drawLines();
  }

  // With stored shapes, every zoom step of the layout on the map is made from the moment it is drawn: its shapes, its
  // outlines and their triangles (prepare), the band on screen and its neighbours first, a unit at a time while the page
  // has nothing else to do. A layout drawn later goes first.
  const todo = [];
  let working = false;
  function ahead(prepare, widest) {
    const L = drawn && made.get(drawn);
    if (!L || !L.pre || L.queued) return;
    L.queued = true;
    const steps = Array.from({ length: widest + 1 }, (_, T) => T).sort((a, b) => Math.abs(a - band) - Math.abs(b - band) || a - b), tasks = [];
    for (const T of steps) {
      // (band T holds the scales from q/2 / 2^T to q/2 / 2^(T-1) screen pixels to a map unit; FINE and above: version 1)
      const hi = T ? .5 * q / 2 ** (T - 1) : Infinity, lo = T ? .5 * q / 2 ** T : .5 * q;
      const versions = [...(hi >= FINE ? [1] : []), ...(lo < FINE ? [0] : [])];
      L.units.forEach((_, i) => tasks.push(() => {
        const w = whole(L, i, T);
        if (w) prepare(w, ['e', 's']);
        for (const d of versions) prepare(linesOf(L, d, T).line(i), ['r']);
      }));
    }
    todo.unshift(...tasks);
    if (!working) { working = true; soon(work); }
    function work(deadline) {
      const t0 = performance.now(), more = deadline ? () => deadline.timeRemaining() > 2 : () => performance.now() - t0 < 8;
      do todo.shift()(); while (todo.length && more());
      if (todo.length) soon(work); else working = false;
    }
  }
  const idle = (f, timeout) => (window.requestIdleCallback ? requestIdleCallback(f, { timeout }) : setTimeout(f, 1500));
  const soon = f => (window.requestIdleCallback ? requestIdleCallback(f, { timeout: 1000 }) : setTimeout(f, 40));

  function outline(areas) {
    const done = new Set();
    return areas.map(a => { const p = under[underOf[a]]; if (!p || !p.whole) return A(a).d; if (done.has(p)) return ''; done.add(p); return p.getAttribute('d'); }).join(' ');
  }
  const unitAt = a => { const p = under[underOf[a]]; return p ? p.areas : null; };
  const underAt = i => under[i] || null;

  function hintLabel(K) {
    const L = of(K);
    return K.hintLabel || (L && L.color && !K.unitColors ? `Color each ${K.noun[0]}` : quiz.hintLabel);
  }

  function dump(kinds) {
    const out = {};
    for (const K of kinds) {
      const L = of(K); if (!L) continue;
      const versions = DETAIL.map((_, d) => worked(L, d));
      out[K.key] = {
        sig: sigOf(L.units),
        color: L.color && L.units.map(u => L.color[u[0]]),
        fill: L.units.map((u, i) => (fillOf(u).length < 2 ? null : whole(L, i, 0))),
        lines: versions.map(v => v.paths.slice()), loose: versions.map(v => [...v.loose]),
      };
    }
    return { v: 1, q, kinds: out };
  }

  return {
    of, draw, changed, dimmed, detail, ahead, outline, unitAt, underAt, hintLabel, dump,
    get drawn() { return drawn; },
    whole: (K, i) => { const L = of(K); return L ? whole(L, i, band) : null; },
    // a unit as one shape at the band of k screen pixels per map unit (Shape, Learn)
    wholeAt: (L, i, k) => whole(L, i, banded && k > 0 ? bandOf(k, q) : 0),
  };
}
