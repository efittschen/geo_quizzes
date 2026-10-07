/* Painting quiz: a place name is shown with one part of it marked; the player paints, with one broad brush, the
   region where names with that part are found. Then the answer lights up, whether the drawing was accepted or not:
   the part's 80% area and every place with the part (the one asked in green for a while). The score says whether
   the player knew where to look: the share of the part's places covered minus the share of all places painted
   (painting at random gives nothing, the right region nearly everything), as a percentage of what painting the
   part's 80% area gets (the smallest area holding 80% of its smoothed places, worked out by
   tools/builds/town-names/ratio.py: part.cover and part.painted). PASS or more is accepted.

   Rounds, and size alone sets a round's level, as everywhere: Common (the 9 parts with the most places, in a
   country with 10 or more), one per side of the country (north, east, south, west: every part on it, when that is
   3 or more and not all of them), and always All, last. A round with every drawing accepted is perfect; stars are
   kept as in the map quizzes.

   Explore shows a round without the quiz: all its parts on the map and in a list, one at a time with its places.

   The map behind is the drawn one or, by the picker on the map, the street map in the same projection
   (map-tiles.js): with the region borders on it (overlay) or alone. A switch beside the picker lays Street View
   coverage on top of any of them (the layer of the Coverage page).

   Data: NAMES (names.js, made by tools/townnames.mjs) on the map of the country's city quiz (CITIES, its cities.js).
   With ?trace in the address the places show from the start, the parts come in their listed order, and every
   drawing is sent to the server it was loaded from (tools/draw-server.mjs keeps them). */
(() => {
  const N = NAMES, $ = id => document.getElementById(id);
  const app = $('app'), stage = $('stage'), cv = $('paint'), ctx = cv.getContext('2d');
  const land = new Path2D(CITIES.land), lines = new Path2D(CITIES.lines), around = new Path2D(CITIES.ctx);
  const css = n => getComputedStyle(stage).getPropertyValue(n).trim();   // (the stage keeps the light colors on the street map)
  const HERE = document.currentScript.src.replace(/[^/]*$/, '');
  const layer = document.createElement('canvas'), reveal = document.createElement('canvas');   // the paint; the answer
  const r = N.brush / N.cell, GLOW = 6000, PASS = 50, TRACE = new URLSearchParams(location.search).has('trace');
  const pct = v => (v < 0.0995 ? (v * 100).toFixed(1) : Math.round(v * 100)) + '%';
  let back = 'quiz', tiles = null, insetBox = null, insetLand = null;   // the map behind, and coverage on top: see useBack, useCover
  let view = { k: 1, x: 0, y: 0, W: 0, H: 0, d: 1 }, part = null, asked = 0, mask = null, strokes = [], shown = false, since = 0, down = false, last = null, frame = 0;

  /* ---------- the map ---------- */
  function fit() {
    const W = stage.clientWidth, H = stage.clientHeight, d = window.devicePixelRatio || 1, pad = 14;
    const k = Math.min((W - 2 * pad) / N.w, (H - 2 * pad) / N.h);
    view = { k, x: (W - N.w * k) / 2, y: (H - N.h * k) / 2, W, H, d };
    for (const c of [cv, layer, reveal, preview]) { c.width = Math.round(W * d); c.height = Math.round(H * d); }
    if (tiles) tiles.view(-view.x / k, -view.y / k, k);
    repaint(); if (part && (shown || TRACE)) drawReveal();
    if (previewOf) drawPreview(previewOf);
    draw();
  }
  // A canvas context set to map units.
  function mapped(c) {
    const x = c.getContext('2d');
    x.setTransform(view.d * view.k, 0, 0, view.d * view.k, view.d * view.x, view.d * view.y);
    return x;
  }
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    const m = mapped(cv), px = 1 / view.k, streets = tiles && back !== 'quiz';
    if (streets) {   // the street map shows through; an inset has no tiles and stays drawn
      m.fillStyle = css('--sea'); m.fill(insetBox); m.fillStyle = css('--land'); m.fill(insetLand);
      m.strokeStyle = css('--edge'); m.lineWidth = 0.8 * px; m.stroke(insetBox); m.stroke(insetLand);
    } else { m.fillStyle = css('--ctx'); m.fill(around); m.fillStyle = css('--land'); m.fill(land); }
    if (!streets || back === 'overlay') {
      m.strokeStyle = css(streets ? '--state' : '--edge'); m.lineWidth = 0.8 * px; m.globalAlpha = streets ? 0.6 : 1; m.stroke(lines);
      m.strokeStyle = css('--state'); m.lineWidth = 1.2 * px; m.globalAlpha = 0.75; m.stroke(land); m.globalAlpha = 1;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (!part) {
      if (!previewOf) return;
      const one = focus ?? pinned;
      if (one == null) { ctx.drawImage(preview, 0, 0); return; }
      ctx.globalAlpha = 0.3; ctx.drawImage(preview, 0, 0); ctx.globalAlpha = 1;
      shape(ctx, one, exploring ? 0.55 : 0.8, 1);
      if (exploring) {   // and its places
        const p = N.parts[one], dots = mapped(cv), many = p.n > 1200;
        dots.fillStyle = css('--ink'); dots.globalAlpha = many ? 0.6 : 0.85;
        for (let i = 0; i < p.x.length; i++) { dots.beginPath(); dots.arc(p.x[i], p.y[i], (many ? 1.3 : 1.9) * px, 0, 6.2832); dots.fill(); }
        dots.globalAlpha = 1; dots.setTransform(1, 0, 0, 1, 0, 0);
      }
      plate(ctx, one);
      return;
    }
    ctx.globalAlpha = 0.5; ctx.drawImage(layer, 0, 0); ctx.globalAlpha = 1;
    if (shown) shape(ctx, G.ids[G.at], 0.5, 1);   // the answer: the part's 80% area, under its places
    if (shown || TRACE) ctx.drawImage(reveal, 0, 0);
    if (!shown) return;
    // The place that was asked: green, with a ring that pulses for a while.
    mapped(cv);
    const t = performance.now() - since, x = part.x[asked], y = part.y[asked];
    if (t < GLOW) { const u = (t % 1200) / 1200; m.beginPath(); m.arc(x, y, (7 + 16 * u) * px, 0, 6.2832); m.strokeStyle = css('--ok'); m.lineWidth = 2.5 * px; m.globalAlpha = 1 - u; m.stroke(); m.globalAlpha = 1; }
    m.beginPath(); m.arc(x, y, 5.5 * px, 0, 6.2832); m.fillStyle = css('--ok'); m.fill(); m.strokeStyle = css('--halo'); m.lineWidth = 2 * px; m.stroke();
    if (t < GLOW) frame = requestAnimationFrame(draw);
  }
  // The paint again from its strokes (after a change of size).
  function repaint() {
    const m = mapped(layer);
    m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, layer.width, layer.height); m.restore();
    for (const s of strokes) for (let i = 0; i < s.length; i += 2) line(m, s[Math.max(0, i - 2)], s[Math.max(1, i - 1)], s[i], s[i + 1]);
  }
  function line(m, x0, y0, x1, y1) {
    m.strokeStyle = css('--yellow'); m.lineWidth = 2 * N.brush; m.lineCap = 'round'; m.lineJoin = 'round';
    m.beginPath(); m.moveTo(x0, y0); m.lineTo(x1, y1 + 0.01); m.stroke();
  }
  // The answer: every place with the part.
  function drawReveal() {
    const m = mapped(reveal), px = 1 / view.k;
    m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.clearRect(0, 0, reveal.width, reveal.height); m.restore();
    const many = part.n > 1200;
    m.fillStyle = css('--ink'); m.globalAlpha = many ? 0.6 : 0.85;
    for (let i = 0; i < part.x.length; i++) { m.beginPath(); m.arc(part.x[i], part.y[i], (many ? 1.3 : 1.9) * px, 0, 6.2832); m.fill(); }
    m.globalAlpha = 1;
  }

  /* ---------- the preview of a round ----------
     On the setup screen (and with the result) the round shows on the map: every part as its 80% area (the smallest
     area holding 80% of its smoothed places, what a drawing is graded against; `area` in names.js, see blobOf), in a
     colour of its own, with its label where the part is thickest. Colours are the hint colours of the map quizzes; parts near each other get different ones.
     Pointing at a shape (or touching it) shows that part alone, the others faded. */
  const preview = document.createElement('canvas');
  const SHAPES = 30;
  let previewOf = null, focus = null, tint = new Map(), boxes = new Map(), drawn = [];
  let exploring = false, pinned = null;   // Explore: every part of the round on the map; the part chosen there
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`; };
  // Where a part is thickest: the middle of its places in the fullest square of 30 map units (with its neighbours).
  function spotOf(p) {
    if (p.spot) return p.spot;
    const cell = 30, key = i => Math.floor(p.x[i] / cell) * 1000 + Math.floor(p.y[i] / cell), count = new Map();
    for (let i = 0; i < p.x.length; i++) count.set(key(i), (count.get(key(i)) || 0) + 1);
    let best = null, most = -1;
    for (const k of count.keys()) { let s = 0; for (const d of [-1001, -1000, -999, -1, 0, 1, 999, 1000, 1001]) s += count.get(k + d) || 0; if (s > most) { most = s; best = k; } }
    let x = 0, y = 0, n = 0;
    for (let i = 0; i < p.x.length; i++) if (key(i) === best) { x += p.x[i]; y += p.y[i]; n++; }
    return p.spot = [x / n, y / n];
  }
  // The places that make up a part's shape: those with three fellow places or more close by (within three dots);
  // the strays are left out of the preview.
  function coreOf(p) {
    if (p.core) return p.core;
    const cell = 3 * p.dot, key = i => Math.floor(p.x[i] / cell) * 1000 + Math.floor(p.y[i] / cell), bins = new Map();
    for (let i = 0; i < p.x.length; i++) (bins.get(key(i)) || bins.set(key(i), []).get(key(i))).push(i);
    return p.core = p.x.map((_, i) => i).filter(i => {
      let near = -1;
      for (const d of [-1001, -1000, -999, -1, 0, 1, 999, 1000, 1001]) for (const j of bins.get(key(i) + d) || []) if ((p.x[j] - p.x[i]) ** 2 + (p.y[j] - p.y[i]) ** 2 <= cell * cell && ++near >= 3) return true;
      return false;
    });
  }
  // A part's blob: its places as one smooth area. The places (strays left out) are stamped on a grid of BLOB map
  // units, each a little larger than its dot, the grid is blurred, and the blob is where it stays above a half:
  // gaps between neighbours close, the bumps of single places go. Its outline is traced between the grid's points
  // (marching squares) and rounded.
  const BLOB = 4, hit = document.createElement('canvas').getContext('2d');
  function blobOf(p) {
    if (p.blob) return p.blob;
    // A part with its 80% area (names.js `area`: rings of x, y): that outline, rounded through the middles of its
    // sides like the blobs below; its holes stay holes.
    if (p.area) {
      const path = new Path2D();
      for (const r of p.area) {
        const q = [], mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        for (let k = 0; k < r.length; k += 2) q.push([r[k], r[k + 1]]);
        const first = mid(q[q.length - 1], q[0]); path.moveTo(first[0], first[1]);
        q.forEach((a, k) => { const m = mid(a, q[(k + 1) % q.length]); path.quadraticCurveTo(a[0], a[1], m[0], m[1]); });
        path.closePath();
      }
      return p.blob = { path, has: (x, y) => hit.isPointInPath(path, x, y, 'evenodd'), clip: true };
    }
    const core = coreOf(p), R = 1.5 * p.dot / BLOB, soft = Math.max(1, Math.round(p.dot / BLOB)), pad = Math.ceil(R) + 4 * soft + 2;
    if (!core.length) return p.blob = { path: new Path2D(), has: () => false };
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const k of core) { x0 = Math.min(x0, p.x[k]); x1 = Math.max(x1, p.x[k]); y0 = Math.min(y0, p.y[k]); y1 = Math.max(y1, p.y[k]); }
    const ox = Math.floor(x0 / BLOB) - pad, oy = Math.floor(y0 / BLOB) - pad, w = Math.ceil(x1 / BLOB) - ox + pad + 1, h = Math.ceil(y1 / BLOB) - oy + pad + 1;
    let g = new Float32Array(w * h);
    for (const k of core) {
      const cx = p.x[k] / BLOB - ox, cy = p.y[k] / BLOB - oy;
      for (let j = Math.floor(cy - R); j <= Math.ceil(cy + R); j++) for (let i = Math.floor(cx - R); i <= Math.ceil(cx + R); i++) if ((i - cx) ** 2 + (j - cy) ** 2 <= R * R) g[j * w + i] = 1;
    }
    // Blurred: the mean over 2 x soft + 1 points, along the rows and then the columns, twice.
    const box = (src, across) => {
      const out = new Float32Array(w * h), n = across ? w : h, m = across ? h : w, step = across ? 1 : w, row = across ? w : 1, acc = new Float32Array(n + 1);
      for (let j = 0; j < m; j++) {
        for (let i = 0; i < n; i++) acc[i + 1] = acc[i] + src[j * row + i * step];
        for (let i = 0; i < n; i++) out[j * row + i * step] = (acc[Math.min(n, i + soft + 1)] - acc[Math.max(0, i - soft)]) / (2 * soft + 1);
      }
      return out;
    };
    for (let pass = 0; pass < 2; pass++) g = box(box(g, true), false);
    // The outline: where it crosses the lines between grid points (those along a row have even keys, those down a
    // column odd ones), and for every square of four points which crossings belong together.
    const cross = (i, j, down) => { const a = g[j * w + i], b = g[down ? (j + 1) * w + i : j * w + i + 1], u = (0.5 - a) / (b - a); return [(ox + i + (down ? 0 : u)) * BLOB, (oy + j + (down ? u : 0)) * BLOB]; };
    const at = new Map(), next = new Map(), join = (a, b) => { (next.get(a) || next.set(a, []).get(a)).push(b); (next.get(b) || next.set(b, []).get(b)).push(a); };
    for (let j = 0; j < h - 1; j++) for (let i = 0; i < w - 1; i++) {
      const v = [g[j * w + i], g[j * w + i + 1], g[(j + 1) * w + i + 1], g[(j + 1) * w + i]], kind = (v[0] >= 0.5) | (v[1] >= 0.5) << 1 | (v[2] >= 0.5) << 2 | (v[3] >= 0.5) << 3;
      if (!kind || kind === 15) continue;
      const T = 2 * (j * w + i), B = 2 * ((j + 1) * w + i), L = T + 1, Rt = 2 * (j * w + i + 1) + 1, whole = v[0] + v[1] + v[2] + v[3] >= 2;
      const pairs = { 1: [[L, T]], 2: [[T, Rt]], 3: [[L, Rt]], 4: [[Rt, B]], 5: whole ? [[T, Rt], [B, L]] : [[L, T], [Rt, B]], 6: [[T, B]], 7: [[L, B]], 8: [[B, L]], 9: [[T, B]], 10: whole ? [[L, T], [Rt, B]] : [[T, Rt], [B, L]], 11: [[Rt, B]], 12: [[L, Rt]], 13: [[T, Rt]], 14: [[L, T]] }[kind];
      for (const [a, b] of pairs) {
        for (const k of [a, b]) if (!at.has(k)) { const c = k >> 1; at.set(k, cross(c % w, Math.floor(c / w), k & 1)); }
        join(a, b);
      }
    }
    // Every closed ring of crossings, drawn through the middles of its sides with the crossings as bends.
    const path = new Path2D(), seen = new Set();
    for (const start of at.keys()) {
      if (seen.has(start)) continue;
      const ring = [];
      for (let k = start, from = -1; k != null && !seen.has(k);) { seen.add(k); ring.push(at.get(k)); const to = next.get(k).find(o => o !== from && !seen.has(o)); from = k; k = to; }
      if (ring.length < 3) continue;
      const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], first = mid(ring[ring.length - 1], ring[0]);
      path.moveTo(first[0], first[1]);
      ring.forEach((q, i) => { const m = mid(q, ring[(i + 1) % ring.length]); path.quadraticCurveTo(q[0], q[1], m[0], m[1]); });
      path.closePath();
    }
    const has = (x, y) => { const i = Math.round(x / BLOB) - ox, j = Math.round(y / BLOB) - oy; return i >= 0 && j >= 0 && i < w && j < h && g[j * w + i] >= 0.5; };
    return p.blob = { path, has };
  }
  // A part's colour: the one it has in the round's preview, else one of the palette (a part the preview leaves out).
  const colourOf = i => tint.get(i) || css('--h' + (i % 24 + 1));
  // A part's shape on a canvas: its 80% area (or blob), filled, with a darker edge.
  function shape(out, i, fill, edge) {
    const blob = blobOf(N.parts[i]), colour = colourOf(i), s = view.d * view.k;
    out.save(); out.setTransform(s, 0, 0, s, view.d * view.x, view.d * view.y);
    if (blob.clip) out.clip(land);   // an 80% area can reach over the sea: drawn on the land only
    out.globalAlpha = fill; out.fillStyle = colour; out.fill(blob.path, 'evenodd');
    out.globalAlpha = edge; out.strokeStyle = mix(colour, css('--ink'), 0.55); out.lineWidth = 1.6 / view.k; out.lineJoin = 'round'; out.stroke(blob.path);
    out.restore();
  }
  // A part's label: a small plate in its colour.
  function plate(out, i) {
    const h = 19;
    out.save(); out.setTransform(view.d, 0, 0, view.d, 0, 0);
    out.font = `700 15px ${css('--cond')}`; out.textAlign = 'center'; out.textBaseline = 'middle';
    const [sx, sy] = spotOf(N.parts[i]), [x, y, w] = boxes.get(i) || [view.x + sx * view.k, view.y + sy * view.k, out.measureText(N.parts[i].label).width + 12];   // a label left out of the full view: at its spot
    out.beginPath(); out.roundRect(x - w / 2, y - h / 2, w, h, 5); out.fillStyle = tint.get(i); out.fill(); out.strokeStyle = css('--ink'); out.lineWidth = 1; out.stroke();
    out.fillStyle = '#15283A'; out.fillText(N.parts[i].label, x, y + 1);
    out.restore();
  }
  function drawPreview(round) {
    previewOf = round; focus = null; tint = new Map(); boxes = new Map();
    const out = preview.getContext('2d');
    out.setTransform(1, 0, 0, 1, 0, 0); out.clearRect(0, 0, preview.width, preview.height);
    // Of a large round only the parts with the most places are drawn (more than SHAPES is no longer readable);
    // Explore draws them all, paler, and labels those that find room.
    const ids = [...round.ids].sort((a, b) => N.parts[b].n - N.parts[a].n).slice(0, exploring ? Infinity : SHAPES), palette = Array.from({ length: 24 }, (_, i) => css('--h' + (i + 1)));
    drawn = ids;
    // The colour whose nearest part of the same colour is furthest away (an unused colour first).
    for (const i of ids) {
      const [x, y] = spotOf(N.parts[i]);
      const far = palette.map(c => Math.min(Infinity, ...[...tint].filter(([, t]) => t === c).map(([j]) => Math.hypot(spotOf(N.parts[j])[0] - x, spotOf(N.parts[j])[1] - y))));
      tint.set(i, palette[far.indexOf(Math.max(...far))]);
    }
    const crowd = ids.length > SHAPES;
    for (const i of ids) shape(out, i, crowd ? 0.16 : 0.42, crowd ? 0.55 : 0.9);
    // The labels, the commonest parts first; one that would sit on another moves aside.
    out.setTransform(view.d, 0, 0, view.d, 0, 0); out.font = `700 15px ${css('--cond')}`;
    const h = 21, taken = [];
    for (const i of ids) {
      const p = N.parts[i], [sx, sy] = spotOf(p), w = out.measureText(p.label).width + 12;
      let x = view.x + sx * view.k, y = view.y + sy * view.k;
      let room = false;
      for (const [dx, dy] of [[0, 0], [0, -h], [0, h], [w * 0.8, 0], [-w * 0.8, 0], [0, -2 * h], [0, 2 * h], [w * 0.8, -h], [-w * 0.8, h], [w * 0.8, h], [-w * 0.8, -h]]) {
        if (!taken.some(b => Math.abs(b[0] - x - dx) < (b[2] + w) / 2 && Math.abs(b[1] - y - dy) < h)) { x += dx; y += dy; room = true; break; }
      }
      if (!room && crowd) continue;
      taken.push([x, y, w]); boxes.set(i, [x, y, w]);
    }
    for (const i of [...ids].reverse()) if (boxes.has(i)) plate(out, i);
    if (ids.length < round.ids.length) {   // how many of the round's parts the map shows
      out.font = `600 13px ${css('--sans')}`; out.textAlign = 'left'; out.textBaseline = 'alphabetic'; out.lineJoin = 'round';
      const note = `${ids.length} of ${round.ids.length} shown · most common`;
      out.strokeStyle = css('--halo'); out.lineWidth = 4; out.strokeText(note, 14, view.H - 14); out.fillStyle = css('--muted'); out.fillText(note, 14, view.H - 14);
    }
  }
  // The part under the pointer: of the parts whose blob is there, the one with the fewest places.
  function pointed(ev) {
    if (!previewOf) return null;
    const [x, y] = toMap(ev), b = cv.getBoundingClientRect(), sx = ev.clientX - b.left, sy = ev.clientY - b.top;
    let best = null;
    for (const i of drawn) {
      const p = N.parts[i], [bx, by, bw] = boxes.get(i) || [];
      if (bw && Math.abs(bx - sx) < bw / 2 && Math.abs(by - sy) < 10) return i;
      if (best != null && N.parts[best].n <= p.n) continue;
      if (blobOf(p).has(x, y)) best = i;
    }
    return best;
  }
  const look = f => { if (f !== focus) { focus = f; draw(); if (exploring) tell(); } };
  cv.addEventListener('pointermove', ev => { if (!part) look(pointed(ev)); });
  cv.addEventListener('pointerdown', ev => { if (part) return; const f = pointed(ev); if (exploring) pin(f); look(f); });
  cv.addEventListener('pointerleave', () => { if (!part) look(null); });

  /* ---------- painting ---------- */
  const toMap = ev => { const b = cv.getBoundingClientRect(); return [(ev.clientX - b.left - view.x) / view.k, (ev.clientY - b.top - view.y) / view.k]; };
  function dab(gx, gy) {
    for (let b = Math.max(0, Math.floor(gy - r)); b <= Math.min(N.gh - 1, Math.ceil(gy + r)); b++)
      for (let a = Math.max(0, Math.floor(gx - r)); a <= Math.min(N.gw - 1, Math.ceil(gx + r)); a++)
        if ((a + 0.5 - gx) ** 2 + (b + 0.5 - gy) ** 2 <= r * r) mask[b * N.gw + a] = 1;
  }
  function stroke(ev) {
    const [x, y] = toMap(ev), from = last || [x, y], s = strokes[strokes.length - 1];
    const steps = Math.max(1, Math.ceil(Math.hypot(x - from[0], y - from[1]) / (N.brush / 2)));
    for (let i = 0; i <= steps; i++) dab((from[0] + (x - from[0]) * i / steps) / N.cell, (from[1] + (y - from[1]) * i / steps) / N.cell);
    s.push(x, y); line(mapped(layer), from[0], from[1], x, y);
    last = [x, y];
    cancelAnimationFrame(frame); frame = requestAnimationFrame(draw);
  }
  cv.addEventListener('pointerdown', ev => { if (!part || shown) return; ev.preventDefault(); cv.setPointerCapture(ev.pointerId); down = true; last = null; strokes.push([]); stroke(ev); });
  cv.addEventListener('pointermove', ev => { if (down) stroke(ev); });
  for (const t of ['pointerup', 'pointercancel']) cv.addEventListener(t, () => { down = false; last = null; });

  /* ---------- rounds ---------- */
  const TIERS = [[10, 'Beginner'], [30, 'Intermediate'], [60, 'Hard'], [Infinity, 'Expert']], tierOf = n => TIERS.findIndex(([max]) => n < max);
  const SIDES = [['N', 'North'], ['E', 'East'], ['S', 'South'], ['W', 'West']];
  const byPlaces = N.parts.map((_, i) => i).sort((a, b) => N.parts[b].n - N.parts[a].n);
  const ROUNDS = [];
  // The rounds: Common (the 9 parts with the most places, when there are 10 or more, so it is a level below All),
  // one per side of the country with every part on it (when that is 3 or more and not every part), and always All,
  // last. A round with just the parts of one before it is left out.
  const add = (id, label, sub, ids) => { if (ids.length >= 3 && ids.length < N.parts.length && !ROUNDS.some(q => q.ids.length === ids.length && q.ids.every(i => ids.includes(i)))) ROUNDS.push({ id, label, sub, ids }); };
  if (N.parts.length >= 10) add('common9', 'Common', '', byPlaces.slice(0, 9));
  for (const [s, name] of SIDES) add(s, name, '', byPlaces.filter(i => N.parts[i].side === s));
  ROUNDS.push({ id: 'all', label: 'All', sub: '', ids: byPlaces });

  // Kept in this browser, in the page's record (store.js): under `paint` the best result of every round and the round
  // chosen last; and, for the home and country pages, the progress per level (`stars`, as area-quiz.js keeps it).
  const PAGE_ID = document.body.dataset.quiz || location.pathname.replace(/\/(index\.html)?$/, '').split('/').pop();
  const saved = STORE.quiz(PAGE_ID).paint || {};
  saved.best = saved.best || {};
  const keep = () => STORE.setQuiz(PAGE_ID, r => { r.paint = saved; });
  function levelProgress() {
    const top = Math.max(...ROUNDS.map(q => tierOf(q.ids.length))), levels = [];
    for (let t = top; t >= 0; t--) {
      const own = ROUNDS.filter(q => tierOf(q.ids.length) === t);
      levels[t] = own.length ? own.reduce((sum, q) => sum + (saved.best[q.id] || 0) / q.ids.length, 0) / own.length : levels[t + 1];
    }
    return levels;
  }
  function saveRating() {
    const levels = levelProgress();
    STORE.setQuiz(PAGE_ID, r => { r.stars = levels; });
  }
  const STAR = 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z';
  const starHtml = p => { const svg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg>`; return `<span class="star${p >= 1 ? ' done' : p > 0 ? ' part' : ''}" role="img" aria-label="${p >= 1 ? 'Level done' : `${Math.round(p * 100)}% done`}">${svg}<span class="fill" style="width:${Math.round(Math.min(p, 1) * 100)}%">${svg}</span></span>`; };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  /* ---------- the map behind, and coverage on top ---------- */
  const BACKS = [['quiz', 'Quiz map', 'drawn'], ['overlay', 'Overlay', 'borders on streets'], ['street', 'Street map', 'no borders']];
  const mapBar = el('div', 'mapbar'), backSeg = el('div', 'maps'), coverSeg = el('div', 'maps'), coverBtn = el('button', null, 'Coverage');
  backSeg.setAttribute('role', 'group'); backSeg.setAttribute('aria-label', 'Map');
  backSeg.replaceChildren(...BACKS.map(([m, t, sub]) => { const b = el('button', null, t); b.type = 'button'; b.dataset.back = m; b.title = sub; b.onclick = () => useBack(m); return b; }));
  coverBtn.type = 'button'; coverBtn.title = 'Street View coverage'; coverBtn.onclick = () => useCover(!saved.cover);
  coverSeg.append(coverBtn); mapBar.append(backSeg, coverSeg); stage.append(mapBar);
  // The tiles are drawn by map-tiles.js, loaded when first asked for.
  let waiting = null;
  function withTiles(then) {
    if (tiles) return then();
    if (waiting) return waiting.push(then);
    waiting = [then];
    const s = document.createElement('script'); s.src = HERE + 'map-tiles.js';
    s.onload = () => { tiles = mapTiles(stage, CITIES, 0); insetBox = new Path2D(tiles.insets.box); insetLand = new Path2D(tiles.insets.land); for (const f of waiting) f(); };
    document.head.append(s);
  }
  function useBack(m) {
    back = m; if (saved.map !== m) { saved.map = m; keep(); }
    for (const b of backSeg.children) b.setAttribute('aria-pressed', b.dataset.back === m);
    if (m !== 'quiz' || tiles) withTiles(() => { tiles.streets().show(back !== 'quiz'); fit(); });
  }
  // Street View coverage over the map: the layer of the Coverage page (data/coverage, see the README).
  const COVER = HERE + '../../data/coverage';
  let coverMeta = null;
  function useCover(on) {
    if (!!saved.cover !== on) { saved.cover = on; keep(); }
    coverBtn.setAttribute('aria-pressed', on);
    if (on || coverMeta) (coverMeta ||= fetch(COVER + '/meta.json').then(r => r.json())).then(meta => withTiles(() => { tiles.coverage(COVER, meta).show(!!saved.cover); fit(); }), () => {});
  }

  let choice = ROUNDS.some(q => q.id === saved.choice) ? saved.choice : ROUNDS[0].id;
  function buildRounds() {
    const wrap = $('rounds'), levels = levelProgress(); wrap.replaceChildren();
    TIERS.forEach(([, name], tier) => {
      const own = ROUNDS.filter(q => tierOf(q.ids.length) === tier); if (!own.length) return;
      const h = el('h3', 'tier-t'), lvl = el('span', 'lvl'); lvl.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < TIERS.length; i++) lvl.append(el('i', i <= tier ? 'on' : ''));
      h.append(lvl, name); h.insertAdjacentHTML('beforeend', starHtml(levels[tier]));
      const d = el('div', 'tier'); d.append(h);
      for (const q of own) {
        const b = el('button', 'round'); b.type = 'button'; b.setAttribute('aria-pressed', q.id === choice);
        b.append(el('b', null, q.label), el('span', 'n', q.ids.length + ' names'));
        if (q.sub) b.append(el('small', null, q.sub));
        const best = saved.best[q.id]; if (best != null) b.append(el('span', 'best', (best === q.ids.length ? '✓ ' : '') + `${best}/${q.ids.length}`));
        b.onclick = () => { choice = q.id; saved.choice = choice; keep(); buildRounds(); };
        d.append(b);
      }
      wrap.append(d);
    });
    saveRating();
    if (view.W) { drawPreview(ROUNDS.find(q => q.id === choice)); draw(); } else previewOf = ROUNDS.find(q => q.id === choice);
  }

  /* ---------- a round ---------- */
  let G = null;   // { round, ids, at, results: [{ i, score, ok }], counts }
  const screen = name => { for (const id of ['setup', 'play', 'done', 'explore']) $(id).hidden = id !== name; $('startbar').hidden = mapBar.hidden = name !== 'setup'; app.classList.toggle('playing', name === 'play'); };
  // The name with the part cut out of it: [before, part, after].
  function split(name, p) {
    const s = p.label.replace(/^-|-$/g, ''), low = name.toLowerCase().replace(/ё/g, 'е'), edge = '[\\s\\-\\/]', esc = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(p.where === 'ending' ? `${esc}(?=$|${edge})` : p.where === 'beginning' ? `(?<=^|${edge})${esc}` : `(?<=^|${edge})${esc}(?=$|${edge})`);
    const m = low.length === name.length ? re.exec(low) : null;
    return m ? [name.slice(0, m.index), name.slice(m.index, m.index + s.length), name.slice(m.index + s.length)] : [name, '', ''];
  }
  function start(round, ids) {
    ids = [...ids]; if (!TRACE) ids.sort(() => Math.random() - 0.5);
    G = { round, ids, at: -1, results: [], counts: ids.length === round.ids.length };
    screen('play'); next();
  }
  function ticks() {
    $('ticks').replaceChildren(...G.ids.map((_, k) => el('i', k < G.results.length ? (G.results[k].ok ? 'got' : 'miss') : k === G.at ? 'now' : '')));
  }
  function next() {
    if (++G.at >= G.ids.length) return finish();
    part = N.parts[G.ids[G.at]]; asked = Math.floor(Math.random() * part.names.length);   // names come with the first places only
    mask = new Uint8Array(N.gw * N.gh); strokes = []; shown = false;
    const [a, m, z] = split(part.names[asked], part), mark = el('b', null, m);
    $('pname').replaceChildren(...(TRACE ? [part.label] : [a, mark, z]));
    $('sQ').textContent = `${G.at + 1}/${G.ids.length}`;
    for (const id of ['sCover', 'sPaint', 'sScore']) $(id).textContent = '–';
    $('sGood').textContent = `${G.results.filter(x => x.ok).length}/${G.results.length}`;
    $('fb').className = 'feedback'; $('fb').replaceChildren();
    $('clearBtn').hidden = false; $('doneBtn').textContent = 'Done'; $('key').hidden = true;
    ticks(); cancelAnimationFrame(frame); repaint(); if (TRACE) drawReveal(); draw();
  }
  function done() {
    let painted = 0, hit = 0;
    for (let c = 0; c < mask.length; c++) if (mask[c]) painted += N.counts[c];
    for (let i = 0; i < part.x.length; i++) if (mask[Math.min(N.gh - 1, Math.max(0, Math.floor(part.y[i] / N.cell))) * N.gw + Math.min(N.gw - 1, Math.max(0, Math.floor(part.x[i] / N.cell)))]) hit++;
    const cover = hit / part.x.length, share = painted / N.total, score = Math.round(100 * Math.max(0, Math.min(1, (cover - share) / (part.cover / 100 - part.painted / 100)))), ok = score >= PASS;
    G.results.push({ i: G.ids[G.at], score, ok });
    $('sCover').textContent = Math.round(cover * 100) + '%'; $('sPaint').textContent = pct(share); $('sScore').textContent = score;
    $('sGood').textContent = `${G.results.filter(x => x.ok).length}/${G.results.length}`;
    const fb = $('fb'); fb.className = 'feedback ' + (ok ? 'ok' : 'bad'); fb.replaceChildren(el('p', 't', ok ? 'Accepted' : `Under ${PASS}`));
    if (TRACE) {
      const q = $('sQ'), body = JSON.stringify({ iso2: N.iso2, label: part.label, brush: N.brush, strokes: strokes.map(s => s.map(Math.round)), cover: Math.round(cover * 100), painted: Math.round(share * 100), bestCover: part.cover, bestPainted: part.painted, score, accepted: ok, at: Date.now() });
      fetch('/__drawing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).then(res => res.ok, () => false).then(sent => { q.textContent += sent ? ' · saved' : ' · not saved'; });
    }
    shown = true; since = performance.now();
    $('clearBtn').hidden = true; $('doneBtn').textContent = G.at + 1 < G.ids.length ? 'Next' : 'Finish'; $('key').hidden = false;
    $('keyZone').style.background = colourOf(G.ids[G.at]);
    ticks(); drawReveal(); cancelAnimationFrame(frame); draw();
  }
  function finish() {
    const good = G.results.filter(x => x.ok).length, missed = G.results.filter(x => !x.ok);
    if (G.counts && good > (saved.best[G.round.id] ?? -1)) { saved.best[G.round.id] = good; keep(); saveRating(); }
    $('rScore').textContent = `${good} of ${G.results.length}`;
    $('rLine').textContent = `${G.round.label} · score ${Math.round(G.results.reduce((s, x) => s + x.score, 0) / G.results.length)}`;
    $('missWrap').hidden = !missed.length; $('retryBtn').hidden = !missed.length;
    $('chips').replaceChildren(...missed.map(x => el('span', 'chip miss', `${N.parts[x.i].label} ${x.score}`)));
    part = null; cancelAnimationFrame(frame); draw();
    screen('done');
  }
  function menu() { G = null; part = null; exploring = false; pinned = focus = null; cancelAnimationFrame(frame); draw(); buildRounds(); screen('setup'); }

  /* ---------- Explore ----------
     The chosen round without the quiz: every part of it on the map and in a list. Pointing at a part (on the map
     or in the list) shows it alone with its places; a click keeps it. */
  function explore() {
    const round = ROUNDS.find(q => q.id === choice);
    exploring = true; pinned = focus = null;
    drawPreview(round); draw();
    $('xParts').replaceChildren(...drawn.map(i => {
      const b = el('button', 'chip'), dot = el('i'); b.type = 'button'; b.dataset.i = i; dot.style.background = tint.get(i);
      b.append(dot, N.parts[i].label, el('span', 'n', N.parts[i].n.toLocaleString('en')));
      b.onclick = () => { pin(pinned === i ? null : i); look(null); };
      b.onpointerenter = ev => { if (ev.pointerType === 'mouse') look(i); };
      b.onpointerleave = () => look(null);
      return b;
    }));
    tell(); screen('explore');
  }
  function pin(i) { pinned = i; draw(); tell(); }
  // The panel: the part shown (or the round), how many places it has, the points knowing it adds to a guess, how
  // much its outlines leave outside, and some of its names.
  function tell() {
    const one = focus ?? pinned, p = one == null ? null : N.parts[one];
    $('xName').textContent = p ? p.label : previewOf.label;
    $('xPlaces').textContent = p ? p.n.toLocaleString('en') : '–';
    $('xGain').textContent = p && p.gain != null ? '+' + p.gain.toLocaleString('en') : '–';
    $('xOut').textContent = p ? p.cut + '%' : '–';
    $('xCount').textContent = previewOf.ids.length;
    $('xEx').replaceChildren(...(p ? p.names.slice(0, 6).flatMap((name, k) => { const [a, m, z] = split(name, p); return [k ? ' · ' : '', a, el('b', null, m), z]; }) : []));
    for (const b of $('xParts').children) b.setAttribute('aria-pressed', +b.dataset.i === pinned);
  }
  $('startBtn').addEventListener('click', () => { const q = ROUNDS.find(q => q.id === choice); start(q, q.ids); });
  $('doneBtn').addEventListener('click', () => shown ? next() : done());
  $('clearBtn').addEventListener('click', () => { mask.fill(0); strokes = []; repaint(); draw(); });
  $('endBtn').addEventListener('click', menu);
  $('menuBtn').addEventListener('click', menu);
  $('exploreBtn').addEventListener('click', explore);
  $('xBack').addEventListener('click', menu);
  $('againBtn').addEventListener('click', () => start(G.round, G.round.ids));
  $('retryBtn').addEventListener('click', () => start(G.round, G.results.filter(x => !x.ok).map(x => x.i)));
  document.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !exploring && !ev.target.closest('button')) (G && !$('play').hidden ? $('doneBtn') : $('startBtn')).click(); });

  new ResizeObserver(fit).observe(stage);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', fit);
  menu();
  useBack(BACKS.some(([m]) => m === saved.map) ? saved.map : 'quiz');
  useCover(!!saved.cover);
})();
