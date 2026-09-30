// Shared engine for "click the right area" map quizzes (used by quizzes/brazil-ddd and quizzes/russia-codes).
//
// A quiz page defines a global QUIZ config before loading this file:
//   key          localStorage prefix
//   areas        [{ id, d, lx, ly, a, g }]  SVG path, label point, size and hint-color group of each map area
//                (lx/ly/a may be left out: they're then computed from the path); top: true draws the area above
//                its neighbours with its own border (e.g. a tiny city enlarged so it can be seen)
//   borders      [d]                         thicker outlines drawn on top (states, federal districts…)
//   size, pad    SVG map size [w, h] and padding; maxZoom, labelScale, fly: { pad, min } tune the quiz map
//   geo          { [areaId]: { rings: [[[lat, lng]…]…], lab: [lat, lng] } } for the street map
//   street       { bounds, maxBounds } in [lat, lng]
//   hintLabel    text of the "color areas" option
//   kinds        what can be asked, see KINDS below
//   explore(areaId) -> { code, title, sub }  (sub may be an array of lines)
//   context      optional SVG path drawn under the areas (neighbouring countries), not clickable
//   geo/street   leave out to offer the quiz map only (no street-map mode)
//   hintsDefault whether "color areas" starts ticked (default true)
//   lettersLabel optional option text: show every area's label while playing
//   (per kind)   merge: false keeps every area drawn separately even when the kind's items group them;
//                unitColors(areas) -> [css colors] picks each group's color from its own list (default: the palette)
//   rounds       ready-made quizzes offered on the setup screen: [{ kind, label, sub?, and one of groups: [group
//                titles] | top: N (largest first, or rank: i for another ranking) | preset: label | ids: [...] or
//                () => [...] }]; with none of them a round is every item of its kind. Rounds are grouped by size into
//                Beginner (under 10), Intermediate (under 30), Hard (under 60) and Expert; rounds of kinds not on
//                the page are left out. Without rounds, each kind is offered whole.
//
// One config can serve several pages: <body data-kinds="states" data-key="dddstates"> keeps only the listed
// kinds and saves scores under its own key (e.g. an area-code quiz and a states quiz on the same map).
//
// Besides the rounds, players can pick their own items ("Custom quiz"), save them under a name (localStorage)
// and share them as a link: ?quiz=<kind>.<bits>&name=…, one bit per item of the kind, in the kind's order.
//
// Seterra-style play: a wrong click flashes red and you try again; after MAX_TRIES wrong clicks the
// answer flashes and you click it to move on. Answered areas are colored by the number of attempts.

(() => {
  const Q = { ...QUIZ };
  const pageKinds = document.body.dataset.kinds;
  if (pageKinds) Q.kinds = Q.kinds.filter(k => pageKinds.split(/\s+/).includes(k.key));
  if (document.body.dataset.key) Q.key = document.body.dataset.key;
  // Explore labels by the page's own first kind if the configured one isn't on this page.
  if (!Q.kinds.some(k => k.key === Q.exploreKind)) Q.exploreKind = Q.kinds[0].key;
  const MAX_TRIES = 3;
  const RESULT_CLASS = ['got', 't2', 't3', 'miss']; // index = wrong clicks before the right one
  // Standard OpenStreetMap tiles: free for light use with attribution, no API key needed.
  const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  const NS = 'http://www.w3.org/2000/svg';
  const $ = id => document.getElementById(id);
  const svg = $('map'), gR = $('regions'), gB = $('borders'), gL = $('labels');
  const hoverUse = $('hoverUse'), ansUse = $('ansUse');
  const AREA = {}, EL = {};

  // Label point (centroid of the largest ring) and area (shoelace) of an SVG path made of M/L/Z commands.
  function pathStats(d) {
    const toks = d.match(/[MmLlZz]|-?(?:\d+\.?\d*|\.\d+)/g), rings = []; let ring = null, x = 0, y = 0, sx = 0, sy = 0, mode = 'M';
    for (let i = 0; i < toks.length;) {
      const t = toks[i];
      if (/[A-Za-z]/.test(t)) { i++; if (t === 'z' || t === 'Z') { if (ring) rings.push(ring); ring = null; x = sx; y = sy; } else mode = t; continue; }
      const a = +toks[i], b = +toks[i + 1]; i += 2;
      if (mode === 'M' || mode === 'm') {
        if (mode === 'm') { x += a; y += b; } else { x = a; y = b; }
        if (ring) rings.push(ring); ring = [[x, y]]; sx = x; sy = y; mode = mode === 'M' ? 'L' : 'l';
      } else { if (mode === 'l') { x += a; y += b; } else { x = a; y = b; } ring.push([x, y]); }
    }
    if (ring) rings.push(ring);
    const stats = rings.map(r => {
      let A = 0, cx = 0, cy = 0;
      for (let i = 0; i < r.length; i++) { const [x0, y0] = r[i], [x1, y1] = r[(i + 1) % r.length], c = x0 * y1 - x1 * y0; A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c; }
      return { A: A / 2, cx: cx / (3 * A), cy: cy / (3 * A) };
    });
    const big = stats.reduce((m, r) => Math.abs(r.A) > Math.abs(m.A) ? r : m);
    return { lx: big.cx, ly: big.cy, a: stats.reduce((sum, r) => sum + Math.abs(r.A), 0) };
  }

  /* ---------- build quiz map ---------- */
  for (const a of Q.areas) {
    if (a.lx === undefined || a.a === undefined) Object.assign(a, pathStats(a.d), a.lx === undefined ? {} : { lx: a.lx, ly: a.ly });
    AREA[a.id] = a;
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', a.d); p.setAttribute('class', 'r');
    p.dataset.a = a.id; p.dataset.g = a.g;
    if (a.top) p.classList.add('top');
    gR.appendChild(p); EL[a.id] = p;
  }
  // Areas marked top stay above everything else in the map (they may overlap their neighbours).
  const raiseTops = () => { for (const a of Q.areas) if (a.top) gR.appendChild(EL[a.id]); };
  raiseTops();
  if (Q.context) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', Q.context); $('ctx').appendChild(p); }
  for (const d of Q.borders) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); gB.appendChild(p); }
  const AREAS = Q.areas.map(a => a.id);
  const gPins = document.createElementNS(NS, 'g'); gPins.id = 'pins'; svg.appendChild(gPins);
  let streetPin = null;

  /* ---------- what can be asked ----------
     Each kind: key, label, sub, noun [one, many], pickTitle, groups [{ title, sub, ids }],
     areasOf(id), short(id) for labels, name(id), about(id), clicked(areaId) describes a wrong click,
     prompt 'dial' | 'name', chip(id), chipTitle(id), optional hints: false (coloring would give
     the answer away), detail: { label, text(id) } for an optional hint under the prompt, presets: [{ label, ids }]
     for quick-select buttons next to All / None, rankings: [{ label, order, expand? }] for "Top N by …"
     (expand(id) widens each pick, e.g. ranking cities, then taking every code dialed there; a "largest area"
     ranking comes first unless areaRank: false, with each area's size shared between the items covering it,
     so a code alone in its area outranks one of five codes sharing an area of the same size), primary(areaId) naming the item a click on that area "is", and chipClass(id).
     prompt 'text' shows text(id) -> { text, cls, lang } on the sign card instead. areaLabel(areaId) labels
     each area on its own (e.g. a script's letter) instead of one label per item; flashArea: true flashes
     only the clicked area on a wrong click; clicked(areaId, targetId) may use the target; about(id) and
     presets' ids may be arrays or functions returning them. dim: false keeps every area lit while playing
     (when the answer is the whole map's business, dimming the rest would give it away). labelPerArea: true
     labels every area with all the items dialed there (main one first), so a code covering two areas shows
     on both. clickAll: true makes an item covering several areas need a click on each of them on the quiz
     map, with a counter on the map; on the street map one click still counts and highlights them all.
     dial(id) -> [[text, 'hot' | 'cold'], …] shows the dial code in parts (e.g. only the prefix bold); pin(id) ->
     { x, y, ll, label } marks a place (e.g. the town the code belongs to) after the question is answered. */
  const KINDS = {};
  for (const k of Q.kinds) {
    const ids = k.groups.flatMap(g => g.ids);
    const areas = Object.fromEntries(ids.map(id => [id, k.areasOf(id)]));
    const at = {}; // areaId -> items that include it
    for (const id of ids) for (const a of areas[id]) (at[a] ??= []).push(id);
    const size = id => areas[id].reduce((s, a) => s + (AREA[a].a || 0) / at[a].length, 0);
    const rankings = [...(k.areaRank === false ? [] : [{ label: 'largest area', order: ids.slice().sort((a, b) => size(b) - size(a)) }]), ...(k.rankings || [])];
    KINDS[k.key] = { ...k, ids, areas, at, rankings, primary: k.primary || (a => (at[a] || [])[0]) };
  }

  /* ---------- rounds: ready-made quizzes, grouped by how many items they ask ---------- */
  const TIERS = [[10, 'Beginner'], [30, 'Intermediate'], [60, 'Hard'], [Infinity, 'Expert']];
  const tierOf = n => TIERS.findIndex(([max]) => n < max);
  const uniq = ids => [...new Set(ids)];
  const call = v => typeof v === 'function' ? v() : v;
  const presetOf = r => (KINDS[r.kind].presets || []).find(p => p.label === r.preset);
  function roundIds(r) {
    const K = KINDS[r.kind];
    let ids = K.ids;
    if (r.ids) ids = call(r.ids);
    else if (r.groups) ids = K.groups.filter(g => r.groups.includes(g.title)).flatMap(g => g.ids);
    else if (r.preset) ids = call(presetOf(r).ids);
    else if (r.top) { const rank = K.rankings[r.rank || 0]; ids = rank.order.slice(0, r.top); if (rank.expand) ids = ids.flatMap(rank.expand); }
    return uniq(ids).filter(id => K.areas[id]);
  }
  let ROUNDS = (Q.rounds || []).filter(r => KINDS[r.kind]);
  if (!ROUNDS.length) ROUNDS = Q.kinds.map(k => ({ kind: k.key, label: k.label, sub: k.sub }));
  // Rounds drawn at random (e.g. one sign per script) have no fixed items, so no best score either.
  ROUNDS = ROUNDS.map(r => ({ ...r, id: r.kind + ':' + r.label, random: typeof r.ids === 'function' || (!!r.preset && typeof presetOf(r).ids === 'function') }));

  /* ---------- pan & zoom for the quiz map (viewBox based) ---------- */
  const [MW, MH] = Q.size, PAD = Q.pad;
  let base = { x: 0, y: 0, w: MW, h: MH }, vb = { ...base };
  svg.setAttribute('viewBox', `0 0 ${MW} ${MH}`);
  function fit() {
    const r = svg.getBoundingClientRect(); if (!r.width || !r.height) return;
    const a = r.width / r.height;
    let w = MW + PAD * 2, h = MH + PAD * 2;
    if (w / h < a) w = h * a; else h = w / a;
    base = { x: MW / 2 - w / 2, y: MH / 2 - h / 2, w, h };
  }
  function apply() { svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`); sizeLabels(); }
  function scale() { const r = svg.getBoundingClientRect(); return Math.min(r.width / vb.w, r.height / vb.h) || 1; }
  function toSvg(cx, cy, v) {
    const r = svg.getBoundingClientRect(); const s = Math.min(r.width / v.w, r.height / v.h);
    const ox = (r.width - v.w * s) / 2, oy = (r.height - v.h * s) / 2;
    return { x: v.x + (cx - r.left - ox) / s, y: v.y + (cy - r.top - oy) / s };
  }
  function clampV(v) {
    const minW = base.w / Q.maxZoom, maxW = base.w * 1.15;
    const k = Math.min(Math.max(v.w, minW), maxW) / v.w;
    if (k !== 1) { const cx = v.x + v.w / 2, cy = v.y + v.h / 2; v.w *= k; v.h *= k; v.x = cx - v.w / 2; v.y = cy - v.h / 2; }
    const mx = v.w * .5, my = v.h * .5;
    v.x = Math.min(Math.max(v.x, -mx), MW - v.w + mx); v.y = Math.min(Math.max(v.y, -my), MH - v.h + my);
    return v;
  }
  function zoomAt(cx, cy, f, from = vb) {
    const p = toSvg(cx, cy, from); const w = from.w / f, h = from.h / f;
    const r = svg.getBoundingClientRect(); const s = Math.min(r.width / w, r.height / h);
    const ox = (r.width - w * s) / 2, oy = (r.height - h * s) / 2;
    vb = clampV({ x: p.x - (cx - r.left - ox) / s, y: p.y - (cy - r.top - oy) / s, w, h }); apply();
  }
  function zoomCenter(f) { const r = svg.getBoundingClientRect(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, f); }
  function resetView() { fit(); vb = { ...base }; apply(); }
  let raf = 0;
  svg.addEventListener('wheel', e => { e.preventDefault(); const f = Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0022)); zoomAt(e.clientX, e.clientY, f); }, { passive: false });
  $('zIn').onclick = () => zoomCenter(1.6); $('zOut').onclick = () => zoomCenter(1 / 1.6); $('zFit').onclick = resetView;
  window.addEventListener('resize', () => {
    if (!svg.getBoundingClientRect().width) return;
    const c = { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 }; const k = vb.w / base.w;
    fit(); vb = { w: base.w * k, h: base.h * k }; vb.x = c.x - vb.w / 2; vb.y = c.y - vb.h / 2; vb = clampV(vb); apply();
  });

  const pts = new Map(); let drag = null, pinch = null, downArea = null, moved = false;
  svg.addEventListener('pointerdown', e => {
    svg.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { drag = { x: e.clientX, y: e.clientY, v: { ...vb }, s: scale() }; moved = false; downArea = e.target.dataset ? e.target.dataset.a : null; }
    else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, v: { ...vb } }; moved = true; drag = null; }
  });
  svg.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) { if (e.pointerType === 'mouse') hover(e.target.dataset && e.target.dataset.a); return; }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size === 2) {
      const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const p = toSvg(pinch.m.x, pinch.m.y, pinch.v); const f = d / pinch.d; const w = pinch.v.w / f, h = pinch.v.h / f;
      const r = svg.getBoundingClientRect(); const s = Math.min(r.width / w, r.height / h); const ox = (r.width - w * s) / 2, oy = (r.height - h * s) / 2;
      vb = clampV({ x: p.x - (m.x - r.left - ox) / s, y: p.y - (m.y - r.top - oy) / s, w, h });
      cancelAnimationFrame(raf); raf = requestAnimationFrame(apply);
    } else if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!moved && Math.hypot(dx, dy) > 6) { moved = true; svg.classList.add('grab'); }
      if (moved) { vb = clampV({ ...drag.v, x: drag.v.x - dx / drag.s, y: drag.v.y - dy / drag.s }); cancelAnimationFrame(raf); raf = requestAnimationFrame(apply); }
    }
  });
  function up(e) {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (pts.size === 0) {
      svg.classList.remove('grab');
      if (!moved && downArea && e.type === 'pointerup') pick(downArea);
      drag = null; downArea = null;
    }
  }
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('pointerleave', () => hover(null));

  /* ---------- street map (hard mode) ---------- */
  let lmap = null;
  const SP = {}; // polygon per area
  // Tiles only look crisp at whole zoom levels, so zoom in one extra step if most of the country still fits.
  function fitHome() {
    const b = L.latLngBounds(Q.street.bounds), z = lmap.getBoundsZoom(b), size = lmap.getSize();
    const nw = lmap.project(b.getNorthWest(), z + 1), se = lmap.project(b.getSouthEast(), z + 1);
    const fits = Math.min(size.x / (se.x - nw.x), size.y / (se.y - nw.y)) >= 0.8;
    lmap.setView(b.getCenter(), fits ? z + 1 : z);
  }
  function initStreet() {
    if (lmap) return;
    lmap = L.map('street', { minZoom: 2, maxBounds: Q.street.maxBounds });
    fitHome();
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(lmap);
    for (const a of AREAS) {
      const poly = L.polygon(Q.geo[a].rings, { stroke: false, fillOpacity: 0, bubblingMouseEvents: false }).addTo(lmap);
      poly.getElement().classList.add('ar');
      poly.on('click', () => pick(a));
      SP[a] = poly;
    }
  }

  /* ---------- one interface over both maps ---------- */
  let mapStyle = 'quiz';
  const onStreet = () => mapStyle === 'street';
  const pathsOf = areas => onStreet() ? areas.map(a => SP[a].getElement()) : areas.map(a => EL[a]);

  function useMap(style) {
    clearLabels();
    mapStyle = style;
    $('street').hidden = style !== 'street';
    svg.style.display = style === 'street' ? 'none' : '';
    $('zoomCtl').hidden = style === 'street';
    if (style === 'street') { initStreet(); lmap.invalidateSize(); fitHome(); }
    else resetView();
    syncHints();
  }
  function activeKind() { return view === 'explore' ? Q.exploreKind : view === 'setup' ? choiceKind() : G.kind; }
  function hover(area) {
    const K = KINDS[activeKind()], id = area && K.primary(area);
    if (!id || onStreet()) { hoverUse.setAttribute('d', ''); return; }
    hoverUse.setAttribute('d', K.areas[id].map(a => AREA[a].d).join(' '));
  }
  function mark(areas) { ansUse.setAttribute('d', areas && !onStreet() ? areas.map(a => AREA[a].d).join(' ') : ''); }
  function flyTo(areas) {
    if (onStreet()) { lmap.fitBounds(L.featureGroup(areas.map(a => SP[a])).getBounds(), { padding: [60, 60], maxZoom: 9 }); return; }
    const bs = areas.map(a => EL[a].getBBox());
    const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y));
    const x1 = Math.max(...bs.map(b => b.x + b.width)), y1 = Math.max(...bs.map(b => b.y + b.height));
    const ar = base.w / base.h;
    const w = Math.max((x1 - x0) * Q.fly.pad, (y1 - y0) * Q.fly.pad * ar, base.w * Q.fly.min); const h = w / ar;
    vb = clampV({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h }); apply();
  }

  /* ---------- labels: one per item of a kind; items at the same spot share a label ("495 / 499") ---------- */
  let labelKind = null, ENTRIES = [], ENTRY_OF = {}, AREA_ENTRY = {};
  function itemCentre(areas) {
    let a = 0, x = 0, y = 0, lat = 0, lng = 0;
    for (const id of areas) {
      const r = AREA[id], w = r.a || 1; a += w; x += r.lx * w; y += r.ly * w;
      if (Q.geo) { lat += Q.geo[id].lab[0] * w; lng += Q.geo[id].lab[1] * w; }
    }
    const m = { x: x / a, y: y / a, ll: [lat / a, lng / a], area: a };
    if (areas.length > 1) {
      // Items spread over several areas (e.g. a zone covering Central Russia and the Far East) can have
      // their average point outside all of them, so put the label on the member area closest to it.
      const near = areas.reduce((b, id) => Math.hypot(AREA[id].lx - m.x, AREA[id].ly - m.y) < Math.hypot(AREA[b].lx - m.x, AREA[b].ly - m.y) ? id : b);
      Object.assign(m, { x: AREA[near].lx, y: AREA[near].ly, ll: Q.geo ? Q.geo[near].lab : null });
    }
    return m;
  }
  function buildLabels(kind) {
    if (labelKind === kind) return;
    clearLabels();
    labelKind = kind; ENTRIES = []; ENTRY_OF = {}; AREA_ENTRY = {}; gL.replaceChildren();
    const K = KINDS[kind], byPos = {};
    const entry = (key, m) => {
      let e = byPos[key];
      if (!e) {
        e = byPos[key] = { ...m, ids: [], shown: new Set(), marker: null, el: document.createElementNS(NS, 'text') };
        e.el.setAttribute('x', m.x); e.el.setAttribute('y', m.y); e.el.setAttribute('class', 'off');
        gL.appendChild(e.el); ENTRIES.push(e);
      }
      return e;
    };
    if (K.areaLabel) {
      // One fixed label per area (e.g. its script's letter), shown when any item covering the area is shown.
      for (const a of AREAS) {
        const e = AREA_ENTRY[a] = entry(a, itemCentre([a])); e.fixed = K.areaLabel(a); e.el.textContent = e.fixed;
        for (const id of K.at[a] || []) { e.ids.push(id); (ENTRY_OF[id] ??= []).push(e); }
      }
    } else if (K.labelPerArea) {
      // One label per area listing every item dialed there, the area's main one first.
      for (const a of AREAS) {
        const ids = K.at[a]; if (!ids) continue;
        const e = AREA_ENTRY[a] = entry(a, itemCentre([a])), main = K.primary(a);
        for (const id of [main, ...ids.filter(x => x !== main)]) { e.ids.push(id); (ENTRY_OF[id] ??= []).push(e); }
      }
    } else {
      for (const id of K.ids) {
        const m = itemCentre(K.areas[id]), e = entry(Math.round(m.x) + ',' + Math.round(m.y), m);
        e.ids.push(id); ENTRY_OF[id] = [e];
      }
    }
    sizeLabels();
  }
  function renderEntry(e) {
    const K = KINDS[labelKind];
    // A flashed area ('area:…' in shown) reveals everything on its label for a moment.
    const all = [...e.shown].some(s => s.startsWith('area:'));
    const text = e.fixed !== undefined ? (e.shown.size ? e.fixed : '')
      : e.ids.filter(id => all || e.shown.has(id)).map(id => K.short(id)).join(' / ');
    if (e.fixed === undefined) e.el.textContent = text;
    e.el.classList.toggle('off', !text);
    if (onStreet() && text) {
      if (!e.marker) {
        const span = document.createElement('span');
        e.marker = L.marker(e.ll, { icon: L.divIcon({ className: 'st-label', html: span, iconSize: [0, 0] }), interactive: false, keyboard: false }).addTo(lmap);
      }
      e.marker.getElement().querySelector('span').textContent = text;
    } else if (e.marker) { e.marker.remove(); e.marker = null; }
  }
  function showLabel(kind, id, on = true) {
    buildLabels(kind);
    for (const e of ENTRY_OF[id] || []) { on ? e.shown.add(id) : e.shown.delete(id); renderEntry(e); }
  }
  function showLabels(kind, ids) {
    buildLabels(kind); clearLabels();
    for (const id of ids) for (const e of ENTRY_OF[id] || []) e.shown.add(id);
    for (const e of ENTRIES) renderEntry(e);
  }
  function showAllLabels(kind) { showLabels(kind, KINDS[kind].ids); }
  function clearLabels() { for (const e of ENTRIES) { e.shown.clear(); renderEntry(e); } }
  function sizeLabels() {
    const s = scale();
    for (const c of gPins.querySelectorAll('circle')) c.setAttribute('r', (4.5 / s).toFixed(3));
    for (const t of gPins.querySelectorAll('text')) { t.setAttribute('font-size', (13 / s).toFixed(3)); t.setAttribute('dy', (-9 / s).toFixed(3)); t.style.strokeWidth = (3 / s).toFixed(3) + 'px'; }
    for (const e of ENTRIES) {
      const fs = Math.min(15 / s, Math.max(9 / s, Math.sqrt(e.area) * Q.labelScale));
      e.el.setAttribute('font-size', fs.toFixed(3)); e.el.style.strokeWidth = (3 / s).toFixed(3) + 'px';
    }
  }

  // A pin for the place the last answered question was about (e.g. the town behind a code).
  function showPin(p) {
    clearPin();
    if (!p) return;
    if (onStreet()) {
      streetPin = L.circleMarker(p.ll, { radius: 6, weight: 2, color: '#fff', fillColor: '#15283A', fillOpacity: 1, interactive: false })
        .bindTooltip(p.label, { permanent: true, direction: 'top', offset: [0, -6], className: 'st-pin' }).addTo(lmap);
      return;
    }
    const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y);
    const t = document.createElementNS(NS, 'text'); t.setAttribute('x', p.x); t.setAttribute('y', p.y); t.textContent = p.label;
    gPins.append(c, t); sizeLabels();
  }
  function clearPin() { gPins.replaceChildren(); if (streetPin) { streetPin.remove(); streetPin = null; } }

  const flashTimers = new Map();
  function clearMap() {
    clearPin();
    for (const t of flashTimers.values()) clearTimeout(t);
    flashTimers.clear();
    for (const a of AREAS) {
      EL[a].classList.remove('got', 't2', 't3', 'miss', 'ans', 'sel', 'flash', 'out');
      if (SP[a]) SP[a].getElement().classList.remove('got', 't2', 't3', 'miss', 'ans', 'sel', 'flash', 'pre');
    }
    clearLabels();
    mark(null);
  }
  // Dim quiz-map areas outside the current set. The street map never dims: that would give away borders.
  function markOut(areas) {
    const inSet = new Set(areas);
    for (const a of AREAS) EL[a].classList.toggle('out', !inSet.has(a));
    syncUnitsOut();
  }

  /* ---------- layouts: when a kind's items are groups of areas (zones, states), each group is one shape ----------
     Areas answered by exactly the same items form a unit. The quiz map then draws only the units' outlines and
     colors each unit in one color: the areas' own hint color when a unit has only one, otherwise a color per unit
     that differs from its neighbours'. Code kinds (clickAll) and per-area labels (areaLabel) keep every area. */
  const LAYOUTS = {};
  const PALETTE = Array.from({ length: 10 }, (_, i) => `var(--h${i + 1})`);
  function layoutOf(kind) {
    if (kind in LAYOUTS) return LAYOUTS[kind];
    const K = KINDS[kind];
    let L = null;
    if (!K.clickAll && !K.areaLabel && K.merge !== false) {
      const byKey = new Map();
      for (const a of AREAS) {
        const key = K.at[a] ? [...K.at[a]].sort().join('|') : 'area:' + a;
        byKey.set(key, [...(byKey.get(key) || []), a]);
      }
      const units = [...byKey.values()];
      if (units.some(u => u.length > 1)) L = { units, color: unitColors(K, units) };
    }
    return LAYOUTS[kind] = L;
  }
  // Which units touch: draw each unit in its own color on a canvas and look across the lines between them.
  // Only pixels inside a unit count (all four neighbours the same), so blended edge pixels can't fake a unit.
  function unitAdjacency(units) {
    const S = 1000 / Math.max(MW, MH), w = Math.ceil(MW * S), h = Math.ceil(MH * S);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true }); x.scale(S, S);
    units.forEach((u, i) => { x.fillStyle = `rgb(${(i + 1) & 255},${(i + 1) >> 8},0)`; for (const a of u) x.fill(new Path2D(AREA[a].d), 'evenodd'); });
    const px = x.getImageData(0, 0, w, h).data, adj = units.map(() => new Set());
    const id = k => px[k * 4 + 3] === 255 && px[k * 4 + 2] === 0 ? px[k * 4] + (px[k * 4 + 1] << 8) : 0;
    const pure = k => { const v = id(k); return v && id(k - 1) === v && id(k + 1) === v && id(k - w) === v && id(k + w) === v ? v : 0; };
    for (let j = 1; j < h - 5; j++) for (let i = 1; i < w - 5; i++) {
      const u = pure(j * w + i); if (!u) continue;
      for (const k of [j * w + i + 4, (j + 4) * w + i]) { const v = pure(k); if (v && v !== u) { adj[u - 1].add(v - 1); adj[v - 1].add(u - 1); } }
    }
    return adj;
  }
  function unitColors(K, units) {
    const g = a => AREA[a].g;
    // Zones inside one hint color (e.g. two-digit zones colored by first digit) keep it, so the hint still means
    // something. Named places (states, districts) always get their own colors.
    if (!K.unitColors && K.prompt !== 'name' && units.every(u => u.every(a => g(a) === g(u[0])))) return null;
    const adj = unitAdjacency(units), col = [], used = new Map();
    const options = units.map(u => K.unitColors ? K.unitColors(u) : PALETTE);
    for (const i of units.map((_, i) => i).sort((a, b) => adj[b].size - adj[a].size)) {
      const taken = new Set([...adj[i]].map(j => col[j]));
      const free = options[i].filter(c => !taken.has(c));
      col[i] = (free.length ? free : options[i]).reduce((m, c) => (used.get(c) || 0) < (used.get(m) || 0) ? c : m);
      used.set(col[i], (used.get(col[i]) || 0) + 1);
    }
    return Object.fromEntries(units.flatMap((u, i) => u.map(a => [a, col[i]])));
  }
  // Each unit is drawn as a thick outline and then its areas on top: the areas cover the lines inside the unit,
  // while the outline's outer half stays visible over the units drawn before it. This works even where
  // neighbouring areas' borders don't line up exactly.
  let layoutKind = null, UNIT_LINES = [];
  function applyLayout(kind) {
    const L = layoutOf(kind), key = L ? kind : null;
    if (key === layoutKind) return;
    layoutKind = key;
    for (const p of UNIT_LINES) p.remove();
    UNIT_LINES = [];
    for (const a of AREAS) { gR.appendChild(EL[a]); EL[a].style.removeProperty('--hint'); }
    svg.classList.toggle('merged', !!L);
    if (!L) { raiseTops(); return; }
    for (const u of L.units) {
      const line = document.createElementNS(NS, 'path');
      line.setAttribute('class', 'unit'); line.setAttribute('d', u.map(a => AREA[a].d).join(' '));
      gR.appendChild(line); UNIT_LINES.push(line);
      for (const a of u) { gR.appendChild(EL[a]); if (L.color) EL[a].style.setProperty('--hint', L.color[a]); }
    }
    raiseTops();
    syncUnitsOut();
  }
  function syncUnitsOut() {
    if (!layoutKind) return;
    LAYOUTS[layoutKind].units.forEach((u, i) => UNIT_LINES[i].classList.toggle('out', u.every(a => EL[a].classList.contains('out'))));
  }
  const hintLabelOf = kind => {
    const K = KINDS[kind], L = layoutOf(kind);
    return K.hintLabel || (L && L.color && !K.unitColors ? `Color each ${K.noun[0]}` : Q.hintLabel);
  };

  function syncHints() {
    const kind = activeKind();
    applyLayout(kind);
    svg.classList.toggle('hints', $('optColors').checked && !(view === 'play' && KINDS[kind].hints === false));
    svg.classList.toggle('all-labels', !!(Q.lettersLabel && $('optLetters') && $('optLetters').checked && view === 'play'));
  }

  /* ---------- storage & options ---------- */
  function store(k, v) { try { localStorage.setItem(Q.key + '.' + k, JSON.stringify(v)); } catch (e) {} }
  function load(k) { try { const v = localStorage.getItem(Q.key + '.' + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }

  $('optColorsText').textContent = Q.hintLabel;
  $('optColors').checked = Q.hintsDefault ?? true;
  const lettersOpt = $('optLetters');
  if (lettersOpt) { $('optLettersWrap').hidden = !Q.lettersLabel; $('optLettersText').textContent = Q.lettersLabel || ''; }
  const savedOpts = load('opts');
  if (savedOpts) {
    $('optColors').checked = savedOpts.colors; $('optDetail').checked = savedOpts.detail ?? savedOpts.state ?? false;
    if (lettersOpt) lettersOpt.checked = !!savedOpts.letters;
  }
  function saveOpts() { store('opts', { colors: $('optColors').checked, detail: $('optDetail').checked, letters: lettersOpt ? lettersOpt.checked : false }); }
  $('optColors').addEventListener('change', () => { syncHints(); saveOpts(); });
  $('optDetail').addEventListener('change', saveOpts);
  if (lettersOpt) lettersOpt.addEventListener('change', () => { syncHints(); saveOpts(); });

  /* ---------- helpers ---------- */
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = ms => { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const plural = (n, [one, many]) => `${n} ${n === 1 ? one : many}`;

  function setFeedback(el, cls, title, sub) {
    el.className = 'feedback' + (cls ? ' ' + cls : '');
    el.replaceChildren();
    if (title) { const p = document.createElement('p'); p.className = 't'; p.textContent = title; el.appendChild(p); }
    for (const line of [].concat(sub || [])) { const p = document.createElement('p'); p.className = 'c'; p.textContent = line; el.appendChild(p); }
  }
  function pressed(seg, attr, value) {
    for (const b of $(seg).querySelectorAll('button')) b.setAttribute('aria-pressed', b.dataset[attr] === value);
  }

  let view = 'setup';
  function show(id) {
    view = id;
    ['setup', 'play', 'done', 'explore'].forEach(x => $(x).hidden = x !== id);
    $('app').classList.toggle('playing', id !== 'setup');
    $('startbar').hidden = id !== 'setup';
    svg.classList.toggle('picking', id === 'setup');
    // Hint colors fade while playing and on the results, so the answer colors stand out.
    svg.classList.toggle('fade', id === 'play' || id === 'done');
    if (id !== 'play') countEl.hidden = true;
    syncHints();
  }

  /* ---------- setup: pick a round (or build a custom quiz), a map, and start ---------- */
  $('kindSeg').parentElement.hidden = Q.kinds.length < 2; // nothing to choose between
  for (const k of Q.kinds) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.kind = k.key;
    const t = document.createElement('b'); t.textContent = k.label;
    const s = document.createElement('small'); s.textContent = k.sub;
    b.append(t, s); $('kindSeg').appendChild(b);
    b.onclick = () => { pickKind = k.key; buildPicker(); };
  }

  let pickKind = KINDS[load('kind')] ? load('kind') : Q.kinds[0].key;
  let chosenMap = Q.geo && load('map') === 'street' ? 'street' : 'quiz';
  if (!Q.geo) $('mapSeg').hidden = true;
  const SEL = {};
  for (const k in KINDS) {
    const saved = load('sel.' + k) ?? (k === Q.kinds[0].key ? load('sel') : null);
    SEL[k] = new Set(Array.isArray(saved) ? saved.filter(id => KINDS[k].ids.includes(id)) : KINDS[k].ids);
  }
  let groupEls = [], chipEls = {};

  // Saved quizzes ({ name, kind, ids }) and a quiz shared by link.
  const SAVED = (load('saved') || []).filter(s => KINDS[s.kind] && Array.isArray(s.ids));
  const itemList = kind => uniq(KINDS[kind].ids);
  function encode(kind, ids) {
    const set = new Set(ids), bytes = new Uint8Array(Math.ceil(itemList(kind).length / 8));
    itemList(kind).forEach((id, i) => { if (set.has(id)) bytes[i >> 3] |= 1 << (i & 7); });
    return kind + '.' + btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(s) {
    const [kind, bits] = (s || '').split('.');
    if (!KINDS[kind] || !bits) return null;
    try {
      const bin = atob(bits.replace(/-/g, '+').replace(/_/g, '/'));
      const ids = itemList(kind).filter((id, i) => (bin.charCodeAt(i >> 3) >> (i & 7)) & 1);
      return ids.length ? { kind, ids } : null;
    } catch (e) { return null; }
  }
  const params = new URLSearchParams(location.search);
  const SHARED = decode(params.get('quiz'));
  if (SHARED) SHARED.name = (params.get('name') || '').trim().slice(0, 40) || 'Shared quiz';

  // What Start plays: 'r:<round id>', 's:<saved index>', 'shared' or 'custom'.
  let choice = SHARED ? 'shared' : load('choice') || '';
  const roundOf = key => ROUNDS.find(r => 'r:' + r.id === key);
  const savedOf = key => key.startsWith('s:') ? SAVED[+key.slice(2)] : null;
  function validChoice() {
    if (!(choice === 'custom' || (choice === 'shared' && SHARED) || savedOf(choice) || roundOf(choice))) choice = 'r:' + ROUNDS[0].id;
  }
  function choiceKind() {
    validChoice();
    if (choice === 'custom') return pickKind;
    return (choice === 'shared' ? SHARED : savedOf(choice) || roundOf(choice)).kind;
  }
  function current() {
    const kind = choiceKind();
    if (choice === 'custom') return { kind, ids: KINDS[kind].ids.filter(id => SEL[kind].has(id)) };
    if (choice === 'shared') return SHARED;
    return savedOf(choice) || { kind, ids: roundIds(roundOf(choice)) };
  }
  function choose(key) {
    choice = key; store('choice', key === 'shared' ? '' : key);
    if (key === 'custom') buildPicker(); else syncSetup();
    if (key === 'custom') $('customWrap').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  const bestFor = (kind, ids, map = chosenMap) => load(`best.${kind}.${map}.` + [...ids].sort().join(','));
  // One star per level, up to the quiz's highest: a level's star is earned when every one of its rounds has been
  // played perfectly (all right on the first try, on either map). Until then the star fills with the average best
  // score of those rounds. A level without rounds of its own follows the next harder one; random rounds don't count.
  const STAR = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z';
  const starHtml = p => {
    const svg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg>`;
    return `<span class="star${p >= 1 ? ' done' : p > 0 ? ' part' : ''}" role="img" aria-label="${p >= 1 ? 'Level done' : `${Math.round(p * 100)}% done`}">${svg}` +
      `<span class="fill" style="width:${Math.round(Math.min(p, 1) * 100)}%">${svg}</span></span>`;
  };
  const PAGE_ID = document.body.dataset.quiz || location.pathname.replace(/\/(index\.html)?$/, '').split('/').pop();
  function levelProgress() {
    const rounds = ROUNDS.filter(r => !r.random).map(r => {
      const ids = roundIds(r);
      const best = Math.max(0, ...['quiz', 'street'].map(map => { const b = bestFor(r.kind, ids, map); return b ? b.s / ids.length : 0; }));
      return { tier: tierOf(ids.length), best };
    });
    if (!rounds.length) return [];
    const top = Math.max(...rounds.map(r => r.tier)), levels = [];
    for (let t = top; t >= 0; t--) {
      const own = rounds.filter(r => r.tier === t);
      levels[t] = own.length ? own.reduce((sum, r) => sum + r.best, 0) / own.length : levels[t + 1];
    }
    return levels;
  }
  // Saved for the home and country pages, per quiz folder (e.g. "brazil-ddd").
  function saveRating() {
    const levels = levelProgress(); if (!levels.length) return;
    try { localStorage.setItem('geoquizzes.rating.' + PAGE_ID, JSON.stringify({ levels, played: levels.some(p => p > 0) })); } catch (e) {}
  }
  const ICONS = {
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    del: '<path d="M6 6l12 12M18 6 6 18"/>',
    save: '<path d="M12 5v14M5 12h14"/>',
  };
  function iconBtn(icon, label, onclick) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'icon'; b.title = label; b.setAttribute('aria-label', label);
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[icon]}</svg>`; b.onclick = onclick;
    return b;
  }
  function roundBtn(key, title, sub, kind, ids, random) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'round'; b.dataset.choice = key;
    const t = document.createElement('b'); t.textContent = title;
    const n = document.createElement('span'); n.className = 'n'; n.textContent = plural(ids.length, KINDS[kind].noun);
    b.append(t, n);
    if (sub) { const s = document.createElement('small'); s.textContent = sub; b.append(s); }
    const best = !random && [bestFor(kind, ids, 'quiz'), bestFor(kind, ids, 'street')].filter(Boolean).sort((x, y) => y.s - x.s)[0];
    if (best) { const e = document.createElement('span'); e.className = 'best'; e.textContent = (best.s === ids.length ? '✓ ' : '') + `${best.s}/${ids.length}`; b.append(e); }
    b.onclick = () => choose(key);
    return b;
  }
  const withIcons = (btn, ...icons) => { const d = document.createElement('div'); d.className = 'round-row'; d.append(btn, ...icons); return d; };
  // The quiz's own kind label tells saved quizzes apart when a page has several kinds.
  const kindNote = kind => Q.kinds.length > 1 ? KINDS[kind].label : '';

  function buildRounds() {
    const wrap = $('rounds'); wrap.replaceChildren();
    const levels = levelProgress();
    const section = (tier, title, rows) => {
      if (!rows.length) return;
      const h = document.createElement('h3'); h.className = 'tier-t';
      if (tier >= 0) {
        const lvl = document.createElement('span'); lvl.className = 'lvl'; lvl.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < TIERS.length; i++) { const bar = document.createElement('i'); if (i <= tier) bar.className = 'on'; lvl.append(bar); }
        h.append(lvl);
      }
      h.append(title);
      if (tier >= 0 && levels[tier] !== undefined) h.insertAdjacentHTML('beforeend', starHtml(levels[tier]));
      const d = document.createElement('div'); d.className = 'tier'; d.dataset.tier = tier; d.append(h, ...rows); wrap.append(d);
    };
    if (SHARED) section(-1, 'Shared with you', [withIcons(roundBtn('shared', SHARED.name, kindNote(SHARED.kind), SHARED.kind, SHARED.ids),
      iconBtn('save', 'Save to your quizzes', () => saveQuiz(SHARED.name, SHARED.kind, SHARED.ids)))]);
    const byTier = TIERS.map(() => []);
    for (const r of ROUNDS) { const ids = roundIds(r); byTier[tierOf(ids.length)].push(roundBtn('r:' + r.id, r.label, r.sub, r.kind, ids, r.random)); }
    TIERS.forEach(([, name], i) => section(i, name, byTier[i]));
    section(-1, 'Your quizzes', SAVED.map((s, i) => withIcons(roundBtn('s:' + i, s.name, kindNote(s.kind), s.kind, s.ids),
      iconBtn('link', 'Copy a link to this quiz', () => copyLink(s.kind, s.ids, s.name)),
      iconBtn('del', 'Delete this quiz', () => deleteQuiz(i)))));
    const custom = document.createElement('button'); custom.type = 'button'; custom.className = 'round custom'; custom.dataset.choice = 'custom';
    const ct = document.createElement('b'); ct.textContent = 'Custom quiz';
    const cn = document.createElement('span'); cn.className = 'n'; cn.id = 'customCount';
    const cs = document.createElement('small'); cs.textContent = 'Pick your own';
    custom.append(ct, cn, cs); custom.onclick = () => choose('custom');
    wrap.append(custom);
    syncSetup();
    saveRating();
  }
  function saveQuiz(name, kind, ids) {
    name = (name || '').trim().slice(0, 40) || `My ${KINDS[kind].noun[1]} (${ids.length})`;
    SAVED.push({ name, kind, ids: [...ids] }); store('saved', SAVED);
    choice = 's:' + (SAVED.length - 1); store('choice', choice);
    buildRounds(); toast('Saved');
  }
  function deleteQuiz(i) {
    if (!confirm(`Delete “${SAVED[i].name}”?`)) return;
    SAVED.splice(i, 1); store('saved', SAVED);
    if (choice === 's:' + i) choice = '';
    else if (choice.startsWith('s:') && +choice.slice(2) > i) choice = 's:' + (+choice.slice(2) - 1);
    validChoice(); store('choice', choice); buildRounds();
  }
  function shareUrl(kind, ids, name) {
    const u = new URL(location.href); u.search = ''; u.hash = '';
    u.searchParams.set('quiz', encode(kind, ids)); if (name) u.searchParams.set('name', name);
    return u.href;
  }
  async function copyLink(kind, ids, name) {
    const url = shareUrl(kind, ids, name);
    try { await navigator.clipboard.writeText(url); toast('Link copied'); }
    catch (e) { window.prompt('Link', url); } // no clipboard access (e.g. plain http)
  }
  let toastTimer = 0;
  function toast(msg) { $('toast').textContent = msg; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').textContent = ''; }, 4000); }

  function buildPicker() {
    const K = KINDS[pickKind], sel = SEL[pickKind];
    $('pickTitle').textContent = K.pickTitle;
    $('topBy').replaceChildren(...K.rankings.map((r, i) => { const o = document.createElement('option'); o.value = i; o.textContent = r.label; return o; }));
    $('topn').hidden = !K.rankings.length;
    $('presets').replaceChildren(...(K.presets || []).flatMap(pr => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'linkbtn'; b.textContent = pr.label;
      b.onclick = () => { sel.clear(); (typeof pr.ids === 'function' ? pr.ids() : pr.ids).forEach(id => sel.add(id)); syncPicker(); };
      return [' · ', b];
    }));
    const wrap = $('groups'); wrap.replaceChildren(); groupEls = []; chipEls = {};
    for (const g of K.groups) {
      const div = document.createElement('div'); div.className = 'grp';
      const label = document.createElement('label'); label.className = 'grp-t';
      const box = document.createElement('input'); box.type = 'checkbox';
      box.onchange = () => { for (const id of g.ids) box.checked ? sel.add(id) : sel.delete(id); syncPicker(); };
      const b = document.createElement('b'); b.textContent = g.title;
      const span = document.createElement('span');
      label.append(box, b, span);
      const chips = document.createElement('div'); chips.className = 'codes';
      for (const id of g.ids) {
        const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cd';
        btn.textContent = K.chip(id); btn.title = K.chipTitle(id);
        if (K.chipClass) { const c = K.chipClass(id); if (c) btn.classList.add(c); }
        btn.onclick = () => toggleItems([id]);
        chips.appendChild(btn); chipEls[id] = btn;
      }
      div.append(label, chips); wrap.appendChild(div);
      groupEls.push({ g, box, span });
    }
    syncPicker();
  }
  // Toggle a set of items together: select all of them unless they're all selected already.
  function toggleItems(ids) {
    const sel = SEL[pickKind], all = ids.every(id => sel.has(id));
    for (const id of ids) all ? sel.delete(id) : sel.add(id);
    syncPicker();
  }
  // A click on the map while a round is chosen turns that round into a custom quiz to edit.
  function editAsCustom() {
    const cur = current();
    pickKind = cur.kind; SEL[pickKind] = new Set(cur.ids);
    choice = 'custom'; store('choice', choice); buildPicker();
  }
  function syncPicker() {
    const K = KINDS[pickKind], sel = SEL[pickKind];
    for (const { g, box, span } of groupEls) {
      const n = g.ids.filter(id => sel.has(id)).length;
      box.checked = n === g.ids.length; box.indeterminate = n > 0 && n < g.ids.length;
      span.textContent = (g.sub ? g.sub + ' · ' : '') + `${n}/${g.ids.length}`;
    }
    for (const id of K.ids) chipEls[id].setAttribute('aria-pressed', sel.has(id));
    pressed('kindSeg', 'kind', pickKind);
    store('sel.' + pickKind, [...sel]); store('kind', pickKind);
    syncSetup();
  }
  // Everything that follows from the chosen round and map: start button, help options, the map preview.
  function syncSetup() {
    const cur = current(), K = KINDS[cur.kind], n = cur.ids.length;
    for (const b of $('rounds').querySelectorAll('.round')) b.setAttribute('aria-pressed', b.dataset.choice === choice);
    if ($('customCount')) $('customCount').textContent = choice === 'custom' ? plural(SEL[pickKind].size, KINDS[pickKind].noun) : '';
    $('customWrap').hidden = choice !== 'custom';
    $('startBtn').disabled = n === 0;
    $('startBtn').textContent = n ? `Start with ${plural(n, K.noun)}` : `Pick some ${K.noun[1]}`;
    $('optDetailWrap').hidden = !K.detail;
    if (K.detail) $('optDetailText').textContent = K.detail.label;
    $('optColorsWrap').hidden = chosenMap !== 'quiz' || K.hints === false;
    $('optColorsText').textContent = hintLabelOf(cur.kind);
    $('helpWrap').hidden = [...$('helpWrap').querySelectorAll('.toggle')].every(t => t.hidden);
    pressed('mapSeg', 'map', chosenMap);
    if (view === 'setup') {
      const chosen = cur.ids.flatMap(id => K.areas[id]);
      markOut(chosen);
      // On the street map the round's areas are tinted instead (the map itself has no borders to dim).
      const inRound = new Set(chosen);
      for (const a of AREAS) if (SP[a]) SP[a].getElement().classList.toggle('pre', onStreet() && inRound.has(a));
      showLabels(cur.kind, cur.ids);
      syncHints();
    }
    store('map', chosenMap);
  }
  // "Top N by …": replace the selection with the first N of a ranking (optionally widened by expand).
  $('topN').value = load('topN') || 20;
  $('topGo').onclick = () => {
    const K = KINDS[pickKind], sel = SEL[pickKind];
    const n = Math.max(1, Math.min(K.ids.length, parseInt($('topN').value, 10) || 20));
    $('topN').value = n; store('topN', n);
    const rank = K.rankings[+$('topBy').value || 0];
    let ids = rank.order.slice(0, n);
    if (rank.expand) ids = [...new Set(ids.flatMap(rank.expand))];
    sel.clear(); ids.filter(id => K.areas[id]).forEach(id => sel.add(id)); syncPicker();
  };
  $('selAll').onclick = () => { KINDS[pickKind].ids.forEach(id => SEL[pickKind].add(id)); syncPicker(); };
  $('selNone').onclick = () => { SEL[pickKind].clear(); syncPicker(); };
  // The preview switches with the map choice; best scores are kept per map, so the rounds list follows too.
  for (const b of $('mapSeg').querySelectorAll('button')) b.onclick = () => { chosenMap = b.dataset.map; if (view === 'setup') useMap(chosenMap); buildRounds(); };
  $('saveBtn').onclick = () => {
    const cur = current(); if (!cur.ids.length) return;
    saveQuiz($('saveName').value, cur.kind, cur.ids); $('saveName').value = '';
  };
  $('saveName').addEventListener('keydown', e => { if (e.key === 'Enter') $('saveBtn').click(); });
  $('shareBtn').onclick = () => { const cur = current(); if (cur.ids.length) copyLink(cur.kind, cur.ids, $('saveName').value.trim()); };

  function openSetup() {
    clearInterval(timer); useMap(chosenMap); clearMap();
    show('setup');
    buildPicker(); buildRounds();
  }

  /* ---------- game ---------- */
  const G = { kind: Q.kinds[0].key, items: [], queue: [], i: 0, tries: 0, revealed: false, found: new Set(), score: 0, streak: 0, best: 0, res: [], t0: 0, retry: false, missed: [] };
  let timer = 0;

  // "Areas left" counter, top middle of the map, for items that need a click on each of their areas.
  const countEl = document.createElement('div');
  countEl.className = 'count'; countEl.hidden = true; countEl.setAttribute('aria-live', 'polite');
  $('stage').appendChild(countEl);
  const needAll = (K, id) => K.clickAll && !onStreet() && K.areas[id].length > 1;
  const remaining = (K, id) => K.areas[id].filter(a => !G.found.has(a));
  function updateCount() {
    const K = KINDS[G.kind], id = G.queue[G.i];
    countEl.hidden = !(view === 'play' && id !== undefined && needAll(K, id));
    if (countEl.hidden) return;
    const left = remaining(K, id).length, b = document.createElement('b');
    b.textContent = left;
    countEl.replaceChildren(b, left === K.areas[id].length ? ' areas' : ' more');
  }

  function start(kind, items, { retry = false } = {}) {
    clearInterval(timer);
    Object.assign(G, { kind, items, queue: shuffle(items), i: 0, score: 0, streak: 0, best: 0, res: [], t0: performance.now(), retry });
    useMap(chosenMap); clearMap();
    markOut(KINDS[kind].dim === false ? AREAS : items.flatMap(id => KINDS[kind].areas[id]));
    $('ticks').replaceChildren(...G.queue.map(() => document.createElement('i')));
    setFeedback($('fb'), '', '', '');
    show('play'); ask();
    timer = setInterval(() => $('sTime').textContent = fmt(performance.now() - G.t0), 500);
  }
  function ask() {
    const id = G.queue[G.i], K = KINDS[G.kind];
    G.tries = 0; G.revealed = false; G.found = new Set();
    mark(null);
    const isName = K.prompt === 'name', isText = K.prompt === 'text';
    $('dial').hidden = isName || isText; $('bigname').hidden = !isName;
    if ($('card')) $('card').hidden = !isText;
    const shown = isText ? $('card') : isName ? $('bigname') : $('dial');
    shown.classList.remove('pop'); void shown.offsetWidth; shown.classList.add('pop');
    if (isText) { const t = K.text(id); $('sent').textContent = t.text; $('sent').className = 'sent ' + (t.cls || ''); $('sent').lang = t.lang || ''; }
    else if (isName) $('bigname').textContent = K.name(id);
    else if (K.dial) $('code').replaceChildren(...K.dial(id).map(([text, cls]) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; return s; }));
    else $('code').textContent = K.short(id);
    // The optional hint under the prompt, e.g. the state a code is in; empty (and hidden) otherwise.
    const ask = $('ask'); ask.replaceChildren();
    if (K.detail && $('optDetail').checked) { const s = document.createElement('strong'); s.textContent = K.detail.text(id); ask.append(s); }
    $('sQ').textContent = (G.i + 1) + '/' + G.queue.length;
    $('sScore').textContent = G.score; $('sStreak').textContent = G.streak;
    [...$('ticks').children].forEach((t, i) => t.classList.toggle('now', i === G.i));
    updateCount();
  }
  function pick(area) {
    if (view === 'setup') {
      if (choice !== 'custom') editAsCustom();
      const ids = KINDS[pickKind].at[area]; if (ids) toggleItems(ids); return;
    }
    if (view === 'explore') { explore(area); return; }
    if (view === 'play') answer(area);
  }
  function flash(kind, id) {
    const K = KINDS[kind], key = kind + ':' + id;
    for (const p of pathsOf(K.areas[id])) p.classList.add('flash');
    showLabel(kind, id, true);
    clearTimeout(flashTimers.get(key));
    flashTimers.set(key, setTimeout(() => {
      for (const p of pathsOf(K.areas[id])) p.classList.remove('flash');
      if (!G.res.some((t, i) => G.queue[i] === id)) showLabel(kind, id, false);
      flashTimers.delete(key);
    }, 800));
  }
  // Flash just the clicked area (and its label, when labels are per area).
  function flashArea(area) {
    const key = 'area:' + area, p = pathsOf([area])[0];
    p.classList.add('flash');
    buildLabels(G.kind);
    const e = AREA_ENTRY[area];
    if (e) { e.shown.add(key); renderEntry(e); }
    clearTimeout(flashTimers.get(key));
    flashTimers.set(key, setTimeout(() => { p.classList.remove('flash'); if (e) { e.shown.delete(key); renderEntry(e); } flashTimers.delete(key); }, 800));
  }
  function answer(area) {
    const K = KINDS[G.kind], target = G.queue[G.i];
    clearPin();
    if (K.areas[target].includes(area)) {
      if (needAll(K, target)) {
        // One of several areas: mark it found and wait for the rest.
        const wasFound = G.found.has(area);
        G.found.add(area);
        const left = remaining(K, target).length;
        if (left > 0) {
          if (!wasFound) {
            const p = pathsOf([area])[0]; p.classList.remove('ans', 'flash'); p.classList.add('found');
            buildLabels(G.kind); const e = AREA_ENTRY[area]; if (e) { e.shown.add(target); renderEntry(e); }
            if (G.revealed) mark(remaining(K, target));
          }
          updateCount();
          setFeedback($('fb'), 'ok', `✓ ${K.name(target)}`, `${left} more`);
          return;
        }
      }
      const k = RESULT_CLASS[G.tries];
      for (const p of pathsOf(K.areas[target])) { p.classList.remove('ans', 'flash', 'found', ...RESULT_CLASS); p.classList.add(k); }
      showLabel(G.kind, target);
      const tick = $('ticks').children[G.i]; tick.classList.remove('now'); tick.classList.add(k);
      G.res.push(G.tries);
      if (G.tries === 0) { G.score++; G.streak++; G.best = Math.max(G.best, G.streak); } else G.streak = 0;
      const title = G.revealed ? K.name(target) : `✓ ${K.name(target)}` + (G.tries ? ` · try ${G.tries + 1}` : '');
      setFeedback($('fb'), G.tries === 0 ? 'ok' : 'bad', title, K.about(target));
      if (K.pin) showPin(K.pin(target));
      G.i++;
      if (G.i >= G.queue.length) finish(); else ask();
      return;
    }
    if (K.flashArea || K.labelPerArea) flashArea(area);
    else { const clicked = K.primary(area); if (clicked) flash(G.kind, clicked); }
    const what = K.clicked(area, target);
    if (G.revealed) {
      setFeedback($('fb'), 'bad', `✗ ${what}`, `→ ${K.name(target)}`);
      return;
    }
    G.tries++;
    G.streak = 0; $('sStreak').textContent = 0;
    const left = MAX_TRIES - G.tries;
    if (left > 0) {
      setFeedback($('fb'), 'bad', `✗ ${what}`, `${plural(left, ['try', 'tries'])} left`);
    } else {
      G.revealed = true;
      const rest = remaining(K, target);
      for (const p of pathsOf(rest)) p.classList.add('ans');
      mark(rest);
      if (onStreet()) flyTo(K.areas[target]);
      setFeedback($('fb'), 'bad', `✗ ${what}`, `→ ${K.name(target)}`);
    }
  }
  function finish() {
    clearInterval(timer); const ms = performance.now() - G.t0; const n = G.res.length;
    const K = KINDS[G.kind];
    mark(null);
    for (const id of G.items) showLabel(G.kind, id);
    const complete = n === G.items.length;
    const key = `best.${G.kind}.${mapStyle}.` + [...G.items].sort().join(',');
    const prev = G.retry ? null : load(key);
    const better = !prev || G.score > prev.s || (G.score === prev.s && ms < prev.t);
    if (better && !G.retry && complete) { store(key, { s: G.score, t: ms }); saveRating(); }
    $('rScore').textContent = `${G.score} of ${n}`;
    const pct = n ? Math.round(G.score / n * 100) : 0;
    let line = `${pct}% · ${fmt(ms)} · streak ${G.best}`;
    if (prev && complete) line += better ? ' · new best' : ` · best ${prev.s}/${n}`;
    $('rLine').textContent = line;
    const missed = G.queue.slice(0, n).map((id, i) => [id, G.res[i]]).filter(([, t]) => t > 0)
      .sort((a, b) => K.ids.indexOf(a[0]) - K.ids.indexOf(b[0]));
    $('chips').replaceChildren(...missed.map(([id, t]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip ' + RESULT_CLASS[t];
      b.dataset.id = id; b.textContent = K.chip(id); b.title = K.chipTitle(id); return b;
    }));
    $('rPick').textContent = '';
    $('missWrap').hidden = !missed.length; $('retryBtn').hidden = !missed.length;
    $('retryBtn').textContent = `Retry missed (${missed.length})`;
    G.missed = missed.map(([id]) => id);
    show('done');
  }
  $('chips').addEventListener('click', e => {
    const id = e.target.dataset.id; if (!id) return;
    const K = KINDS[G.kind];
    mark(K.areas[id]); $('rPick').textContent = `${K.name(id)}: ${K.about(id)}`;
    flyTo(K.areas[id]);
  });

  /* ---------- explore ---------- */
  function explore(area) {
    for (const p of pathsOf(AREAS)) p.classList.remove('sel');
    pathsOf([area])[0].classList.add('sel'); mark([area]);
    if (onStreet()) { clearLabels(); for (const id of KINDS[Q.exploreKind].at[area] || []) showLabel(Q.exploreKind, id); }
    const info = Q.explore(area);
    $('eCode').textContent = info.code; $('eDial').classList.toggle('multi', info.code.includes(','));
    setFeedback($('eInfo'), '', info.title, info.sub);
  }

  /* ---------- buttons & keys ---------- */
  $('startBtn').onclick = () => { const cur = current(); if (cur.ids.length) start(cur.kind, cur.ids); };
  $('exploreBtn').onclick = () => {
    useMap(chosenMap); clearMap(); show('explore');
    if (!onStreet()) showAllLabels(Q.exploreKind);
    $('eCode').textContent = '--'; $('eDial').classList.remove('multi');
    setFeedback($('eInfo'), '', '', '');
  };
  $('restartBtn').onclick = () => start(G.kind, G.items, { retry: G.retry });
  $('endBtn').onclick = () => { if (!G.res.length) { openSetup(); return; } finish(); };
  $('againBtn').onclick = () => start(G.kind, G.items, { retry: G.retry });
  $('retryBtn').onclick = () => start(G.kind, G.missed, { retry: true });
  $('menuBtn').onclick = openSetup;
  $('eBack').onclick = openSetup;
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    const zoomIn = e.key === '+' || e.key === '=', zoomOut = e.key === '-', reset = e.key === '0';
    if (onStreet()) { if (zoomIn) lmap.zoomIn(); else if (zoomOut) lmap.zoomOut(); else if (reset) fitHome(); return; }
    if (zoomIn) zoomCenter(1.4); else if (zoomOut) zoomCenter(1 / 1.4); else if (reset) resetView();
  });

  openSetup();
  requestAnimationFrame(resetView);
})();
