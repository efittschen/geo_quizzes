/* The quiz map drawn by WebGL (area-quiz.js; ?svg=1 or a browser without WebGL 2: the SVG as before). The SVG map's groups of shapes (the
   world under the map, the areas, units and their outlines, the borders) and its labels stay what the engine works on:
   it puts shapes in and takes them out, changes their outlines and classes as before. But they are no longer drawn
   (svg.gl: display none, so the browser neither lays them out nor paints them): this file draws them on a canvas
   behind the SVG, which keeps the few things on top (the highlights, a pin, the line of a tap, a drawing). Until the
   first picture is ready the SVG map shows as before.

   Every shape is read from its element: its outline (d, and the transforms of the groups it is in) and its look as
   the stylesheet makes it (fill, stroke and their opacity, stroke width, vector-effect, visibility: getComputedStyle),
   so every look of the map stays the stylesheet's. Fills are cut into triangles (earcut.js), outlines into strips of
   their width on the screen, dots (lines of no length with round caps) into discs, and each label into a picture of
   its text drawn by the browser, in any script, with its halo. The triangles are kept by outline (a path's pieces
   each, where its rings stand alone: the world's countries and lines), and those of the outlines a zoom step will
   need are made ahead while the page is idle (prepare): changing the detail in the middle of a zoom only puts made
   triangles in place. A look that changes rewrites one row of a small table the graphics card reads its colors from
   (STYLE). Moving the map only moves the view: each frame is drawn anew from the same triangles.

   While the map zooms, nothing waits for it to rest: the dots that grow with the zoom (--dot) grow at once (their
   width is the dot's size times their share of it), and labels keep their size on the screen as at rest (city
   names 12 px above their dot, an area's name its size on the map within 9 to 15 px).

   Taps: at(p) is the element a tap at map point p is on, as the browser would find it on the SVG (the topmost one
   whose fill holds the point, or a dot within its width), so the engine's handling of a tap stays as it was.

     const g = glMap(stage, svg)   null without WebGL 2 or earcut
     g.view(vb, dot)                the box of the map shown in the stage (area-quiz.js: vb) and the dots' size on the
                                    screen now (px); drawn at the next frame
     g.at(p)                        the element under map point p, or null
     g.prepare(d, kinds)            makes the triangles of an outline ahead: kinds 'e' (filled, evenodd), 's' (outline),
                                    'r' (outline with round caps)
*/
function glMap(stage, svg) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { antialias: true, premultipliedAlpha: true, alpha: true });
  if (!gl || typeof earcut !== 'function') return null;
  canvas.className = 'glmap'; canvas.hidden = true;
  stage.insertBefore(canvas, svg);
  const GROUPS = ['ctx', 'regions', 'borders'].map(id => svg.querySelector('#' + id)).filter(Boolean);
  const LABELS = svg.querySelector('#labels');
  const SHAPES = '#ctx path, #regions path, #borders path';

  /* ---------- programs ---------- */
  function program(vs, fs) {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; for (let i = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i--;) { const n = gl.getActiveUniform(p, i).name; u[n] = gl.getUniformLocation(p, n); }
    return { p, u, a: n => gl.getAttribLocation(p, n) };
  }
  // A vertex: its map point, its offset (an outline's side, a disc's rim: times half its width on the screen), the
  // shape's row in STYLE, and whether it is of the shape's fill (0) or its outline (1). The width: on the screen (px),
  // in map units, and as a share of the dots' size now (u_dot).
  const SHAPE = program(`#version 300 es
    in vec2 a_pos; in vec2 a_off; in float a_id; in float a_kind;
    uniform sampler2D u_style; uniform vec2 u_org, u_shift, u_size; uniform float u_s, u_dot;
    out vec4 v_col;
    void main() {
      int id = int(a_id + .5); ivec2 t = ivec2(id % 1024, (id / 1024) * 3);
      vec4 w = texelFetch(u_style, t + ivec2(0, 2), 0);
      float half_ = a_kind > .5 ? (w.x + w.y * u_s + w.z * u_dot) * .5 : 0.;
      vec2 p = (a_pos - u_org) * u_s + u_shift + a_off * half_;
      gl_Position = vec4(p.x / u_size.x * 2. - 1., 1. - p.y / u_size.y * 2., 0., 1.);
      v_col = texelFetch(u_style, t + ivec2(0, a_kind > .5 ? 1 : 0), 0);
    }`, `#version 300 es
    precision mediump float; in vec4 v_col; out vec4 o;
    void main() { o = v_col; }`);
  // A label's corner: its anchor (a map point), the corner's offset on the screen at the size it was drawn at (px0),
  // its place in the picture of the labels, and how its size follows the zoom (a_size: kind, raw, px0): 0 as drawn,
  // 1 an area's name (raw: its size on the map, held within 9 to 15 px), 2 a city's name (12 px, above its dot).
  const LABEL = program(`#version 300 es
    in vec2 a_pos; in vec2 a_off; in vec2 a_uv; in vec3 a_size;
    uniform vec2 u_org, u_shift, u_size; uniform float u_s, u_dot;
    out vec2 v_uv;
    void main() {
      float f = a_size.x > .5 && a_size.x < 1.5 ? clamp(a_size.y * u_s, 9., 15.) / a_size.z : 1.;
      vec2 up = a_size.x > 1.5 ? vec2(0., -(u_dot / 2. + 7.5)) : vec2(0.);
      vec2 p = (a_pos - u_org) * u_s + u_shift + up + a_off * f;
      gl_Position = vec4(p.x / u_size.x * 2. - 1., 1. - p.y / u_size.y * 2., 0., 1.);
      v_uv = a_uv;
    }`, `#version 300 es
    precision mediump float; in vec2 v_uv; uniform sampler2D u_tex; out vec4 o;
    void main() { o = texture(u_tex, v_uv); }`);

  /* ---------- the shapes' outlines ---------- */
  const TOK = /[MmLlHhVvZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
  // The parts of a path of M, L, H, V and Z commands: { p: [x, y, x, y, …], closed }.
  function parse(d) {
    const out = [], t = d.match(TOK) || []; let cur = null, x = 0, y = 0, sx = 0, sy = 0, cmd = 'M';
    const to = () => { if (!cur) { cur = { p: [x, y], closed: false }; out.push(cur); } else cur.p.push(x, y); };
    for (let i = 0; i < t.length;) {
      const c = t[i];
      if (c >= 'A') {
        i++;
        if (c === 'Z' || c === 'z') { if (cur) cur.closed = true; cur = null; x = sx; y = sy; } else cmd = c;
        continue;
      }
      if (cmd === 'M' || cmd === 'm') {
        x = cmd === 'm' ? x + +t[i] : +t[i]; y = cmd === 'm' ? y + +t[i + 1] : +t[i + 1]; i += 2;
        cur = { p: [x, y], closed: false }; out.push(cur); sx = x; sy = y; cmd = cmd === 'M' ? 'L' : 'l';
      } else if (cmd === 'L' || cmd === 'l') { x = cmd === 'l' ? x + +t[i] : +t[i]; y = cmd === 'l' ? y + +t[i + 1] : +t[i + 1]; i += 2; to(); }
      else if (cmd === 'H' || cmd === 'h') { x = cmd === 'h' ? x + +t[i] : +t[i]; i++; to(); }
      else if (cmd === 'V' || cmd === 'v') { y = cmd === 'v' ? y + +t[i] : +t[i]; i++; to(); }
      else i++;
    }
    return out;
  }
  // The transforms of the groups an element is in (translate and scale: the world laid under the map), as [k, dx, dy].
  function placeOf(el) {
    let k = 1, dx = 0, dy = 0;
    for (let n = el.parentNode; n && n !== svg && !GROUPS.includes(n); n = n.parentNode) {
      const t = n.getAttribute && n.getAttribute('transform'); if (!t) continue;
      const tr = /translate\(\s*([-\d.e]+)[ ,]+([-\d.e]+)\s*\)/.exec(t), sc = /scale\(\s*([-\d.e]+)/.exec(t);
      const s = sc ? +sc[1] : 1, ox = tr ? +tr[1] : 0, oy = tr ? +tr[2] : 0;
      k *= s; dx = dx * s + ox; dy = dy * s + oy; // (an outer group's transform applies after the inner one's)
    }
    return [k, dx, dy];
  }
  const placed = (parts, [k, dx, dy]) => { if (k !== 1 || dx || dy) for (const s of parts) for (let i = 0; i < s.p.length; i += 2) { s.p[i] = s.p[i] * k + dx; s.p[i + 1] = s.p[i + 1] * k + dy; } return parts; };
  const areaOf = p => { let a = 0; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) a += p[j] * p[i + 1] - p[i] * p[j + 1]; return a / 2; };
  const boxOf = p => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (let i = 0; i < p.length; i += 2) { if (p[i] < x0) x0 = p[i]; if (p[i] > x1) x1 = p[i]; if (p[i + 1] < y0) y0 = p[i + 1]; if (p[i + 1] > y1) y1 = p[i + 1]; } return [x0, y0, x1, y1]; };
  function inRing(p, x, y) { let c = false; for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) { const yi = p[i + 1], yj = p[j + 1]; if ((yi > y) !== (yj > y) && x < (p[j] - p[i]) * (y - yi) / (yj - yi) + p[i]) c = !c; } return c; }
  const zero = p => { for (let i = 2; i < p.length; i += 2) if (p[i] !== p[0] || p[i + 1] !== p[1]) return false; return true; };
  // The triangles of a fill, as [x, y, …]. Evenodd: rings in rings are holes (and islands in those holes shapes
  // again); nonzero (the world's land, its countries side by side): every ring a shape of its own.
  function fillOf(parts, evenodd) {
    const rings = parts.filter(s => s.p.length >= 6).map(s => ({ p: s.p, a: Math.abs(areaOf(s.p)), b: boxOf(s.p), depth: 0, holes: null }));
    const polys = [];
    if (!evenodd) for (const r of rings) polys.push([r]);
    else {
      rings.sort((u, v) => v.a - u.a);
      rings.forEach((r, i) => {
        let parent = null;
        for (let j = i - 1; j >= 0; j--) { const o = rings[j]; if (r.b[0] >= o.b[0] && r.b[2] <= o.b[2] && r.b[1] >= o.b[1] && r.b[3] <= o.b[3] && inRing(o.p, r.p[0], r.p[1])) { parent = o; break; } }
        r.depth = parent ? parent.depth + 1 : 0;
        if (r.depth % 2 === 0) { r.holes = [r]; polys.push(r.holes); } else parent.holes.push(r);
      });
    }
    let n = 0; const tris = [];
    for (const poly of polys) {
      const flat = [], holes = [];
      for (let k = 0; k < poly.length; k++) { if (k) holes.push(flat.length / 2); for (const v of poly[k].p) flat.push(v); }
      const idx = earcut(flat, holes.length ? holes : null, 2);
      tris.push(flat, idx); n += idx.length;
    }
    const out = new Float32Array(n * 2); let o = 0;
    for (let i = 0; i < tris.length; i += 2) { const flat = tris[i]; for (const k of tris[i + 1]) { out[o++] = flat[2 * k]; out[o++] = flat[2 * k + 1]; } }
    return out;
  }
  // An outline's vertices, [x, y, side x, side y] each: two triangles a segment (its width added on the screen), and
  // a disc for a part of no length with round caps (a dot).
  const DISC = 16;
  function strokeOf(parts, round) {
    let n = 0;
    for (const s of parts) { const m = s.p.length / 2; n += zero(s.p) ? (round ? DISC * 3 : 0) : (m - 1 + (s.closed ? 1 : 0)) * 6; }
    const out = new Float32Array(n * 4); let o = 0;
    const v = (x, y, ox, oy) => { out[o++] = x; out[o++] = y; out[o++] = ox; out[o++] = oy; };
    for (const s of parts) {
      const p = s.p;
      if (zero(p)) {
        if (round) for (let i = 0; i < DISC; i++) { const a = 2 * Math.PI * i / DISC, b = 2 * Math.PI * (i + 1) / DISC; v(p[0], p[1], 0, 0); v(p[0], p[1], Math.cos(a), Math.sin(a)); v(p[0], p[1], Math.cos(b), Math.sin(b)); }
        continue;
      }
      const m = p.length / 2, last = s.closed ? m : m - 1;
      for (let i = 0; i < last; i++) {
        const x0 = p[2 * i], y0 = p[2 * i + 1], j = (i + 1) % m, x1 = p[2 * j], y1 = p[2 * j + 1], dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
        v(x0, y0, nx, ny); v(x0, y0, -nx, -ny); v(x1, y1, nx, ny); v(x1, y1, nx, ny); v(x0, y0, -nx, -ny); v(x1, y1, -nx, -ny);
      }
    }
    return out.subarray(0, o);
  }
  const join = (arrs, n) => { if (arrs.length === 1) return arrs[0]; let len = 0; for (const a of arrs) len += a.length; const out = new Float32Array(len); let o = 0; for (const a of arrs) { out.set(a, o); o += a.length; } return out; };
  // The triangles of an outline, kept: whole, or (a nonzero fill, an outline: rings that stand alone) by its pieces,
  // each "M…" of it, so that a path made of pieces met before (the world under the map) is cut only where it is new.
  const PIECES = new Map(), WHOLES = new Map();
  const keep = (map, key, make) => { let v = map.get(key); if (v === undefined) { v = make(); map.set(key, v); if (map.size > 20000) map.delete(map.keys().next().value); } return v; };
  const SPLIT = /(?=M)/;
  function trianglesOf(d, place, kind) {
    const pk = place.join(',');
    if (kind === 'e') return keep(WHOLES, kind + pk + d, () => fillOf(placed(parse(d), place), true));
    const make = piece => kind === 'n' ? fillOf(placed(parse(piece), place), false) : strokeOf(placed(parse(piece), place), kind === 'r');
    if (/[mlhvz]/.test(d.replace(/z/g, ''))) return keep(WHOLES, kind + pk + d, () => make(d)); // (relative steps: not to be cut apart)
    const pieces = d.split(SPLIT).filter(Boolean);
    if (pieces.length === 1) return keep(PIECES, kind + pk + d, () => make(d));
    return join(pieces.map(p => keep(PIECES, kind + pk + p, () => make(p))));
  }
  // An element's parts and box, for taps (worked out when first asked for)
  const PARTS = new Map();
  const partsOf = (d, place) => keep(PARTS, place.join(',') + d, () => { const parts = placed(parse(d), place), all = parts.flatMap(s => s.p); return { parts, box: all.length ? boxOf(all) : [0, 0, 0, 0] }; });

  /* ---------- looks: the stylesheet's, read from each element ---------- */
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  probe.canvas.width = probe.canvas.height = 1;
  const COLORS = new Map();
  // A CSS color as [r, g, b, a] (0 to 1), whatever its syntax (color-mix too): the browser paints it, we read it.
  function rgba(c) {
    let v = COLORS.get(c); if (v) return v;
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = 'rgba(0,0,0,0)'; probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data; v = [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
    COLORS.set(c, v); return v;
  }
  const paint = (c, alpha) => { if (!c || c === 'none' || c.startsWith('url(')) return null; const v = rgba(c), a = v[3] * alpha; return [v[0] * a, v[1] * a, v[2] * a, a]; };
  // whether a group between the element and its layer is not shown (display: none)
  function hiddenAbove(el, seen) {
    for (let n = el.parentNode; n && !GROUPS.includes(n) && n !== svg; n = n.parentNode) {
      if (!seen.has(n)) seen.set(n, getComputedStyle(n).display === 'none');
      if (seen.get(n)) return true;
    }
    return false;
  }
  function lookOf(el, seen, dot) {
    const cs = getComputedStyle(el), shown = cs.visibility === 'visible' && cs.display !== 'none' && !hiddenAbove(el, seen), op = shown ? +cs.opacity : 0;
    const sw = parseFloat(cs.strokeWidth) || 0, scaled = cs.vectorEffect !== 'non-scaling-stroke';
    // a dot whose size follows the dots' (--dot, which grows with the zoom): its share of it
    const share = !scaled && dot && (el.classList.contains('dot') || (svg.classList.contains('dots') && el.classList.contains('r'))) ? sw / dot : 0;
    return {
      fill: paint(cs.fill, +cs.fillOpacity * op), stroke: sw > 0 ? paint(cs.stroke, +cs.strokeOpacity * op) : null,
      wpx: scaled || share ? 0 : sw, wmap: scaled ? sw : 0, wdot: share,
      // what decides the triangles: whether a fill or an outline is painted at all (a hidden one keeps its triangles,
      // so that showing it needs none made), how holes count, and dots
      hasFill: cs.fill !== 'none', hasStroke: cs.stroke !== 'none' && sw > 0, evenodd: cs.fillRule === 'evenodd', round: cs.strokeLinecap === 'round',
      events: shown && cs.pointerEvents !== 'none',
    };
  }

  /* ---------- the picture: what is drawn, and how it is updated ---------- */
  const vbuf = gl.createBuffer(), lbuf = gl.createBuffer(), styleTex = gl.createTexture(), labelTex = gl.createTexture();
  let EL = [], LOOK = [], KEYS = [], PLACE = [], count = 0, styleRows = 0;
  let dirty = { shapes: true, looks: true, labels: true }, frame = 0, want = null, dotNow = 0, ready = false;
  const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
  const dotOf = () => parseFloat(svg.style.getPropertyValue('--dot')) || 0;
  function update() {
    if (dirty.shapes || dirty.looks) {
      const els = [...svg.querySelectorAll(SHAPES)], seen = new Map(), dot = dotOf();
      const looks = els.map(el => lookOf(el, seen, dot)), places = els.map(placeOf);
      const keys = els.map((el, i) => { const l = looks[i]; return (el.getAttribute('d') || '') + '|' + places[i].join(',') + '|' + (l.hasFill ? (l.evenodd ? 'e' : 'n') : '') + (l.hasStroke ? (l.round ? 'r' : 's') : ''); });
      const same = els.length === EL.length && els.every((el, i) => el === EL[i] && keys[i] === KEYS[i]);
      EL = els; LOOK = looks; PLACE = places;
      if (!same) { KEYS = keys; buildShapes(); }
      writeStyle();
      dirty.shapes = dirty.looks = false;
    }
    if (dirty.labels) { buildLabels(); dirty.labels = false; }
  }
  // The triangles of every element drawn, in the order the SVG paints them (each fill, then its outline).
  function buildShapes() {
    let n = 0;
    const parts = EL.map((el, i) => {
      const l = LOOK[i], d = el.getAttribute('d') || '';
      const f = l.hasFill ? trianglesOf(d, PLACE[i], l.evenodd ? 'e' : 'n') : null, k = l.hasStroke ? trianglesOf(d, PLACE[i], l.round ? 'r' : 's') : null;
      n += (f ? f.length / 2 : 0) + (k ? k.length / 4 : 0);
      return [f, k];
    });
    const data = new Float32Array(n * 6); let o = 0;
    parts.forEach(([f, k], id) => {
      if (f) for (let i = 0; i < f.length; i += 2) { data[o] = f[i]; data[o + 1] = f[i + 1]; data[o + 4] = id; o += 6; }
      if (k) for (let i = 0; i < k.length; i += 4) { data[o] = k[i]; data[o + 1] = k[i + 1]; data[o + 2] = k[i + 2]; data[o + 3] = k[i + 3]; data[o + 4] = id; data[o + 5] = 1; o += 6; }
    });
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    count = n;
  }
  // STYLE: three rows of texels for every 1024 elements, a column each: its fill, its outline (premultiplied colors),
  // and its outline's width (on the screen, in map units, as a share of the dots' size).
  function writeStyle() {
    const rows = Math.max(1, Math.ceil(EL.length / 1024)) * 3, data = new Float32Array(1024 * rows * 4);
    LOOK.forEach((l, id) => {
      const col = id % 1024, row = Math.floor(id / 1024) * 3, at = r => ((row + r) * 1024 + col) * 4;
      if (l.fill) data.set(l.fill, at(0));
      if (l.stroke) data.set(l.stroke, at(1));
      data[at(2)] = l.wpx; data[at(2) + 1] = l.wmap; data[at(2) + 2] = l.wdot;
    });
    gl.bindTexture(gl.TEXTURE_2D, styleTex);
    if (rows !== styleRows) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 1024, rows, 0, gl.RGBA, gl.FLOAT, data); styleRows = rows; }
    else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 1024, rows, gl.RGBA, gl.FLOAT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  /* ---------- labels: each a picture of its text, drawn by the browser (kept: drawn once for each text and size) ---------- */
  const atlas = document.createElement('canvas').getContext('2d'), PICS = new Map();
  let labelCount = 0;
  function picOf(it, dpr) {
    const key = [it.text, it.font, it.halo, it.fill, it.stroke, it.alpha].join('|');
    return keep(PICS, key, () => {
      const c = document.createElement('canvas').getContext('2d'); c.font = it.font;
      const w = Math.ceil(c.measureText(it.text).width + it.halo * 2 + 4), h = Math.ceil(it.px * dpr * 1.35 + it.halo * 2 + 4);
      c.canvas.width = w; c.canvas.height = h;
      c.font = it.font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.globalAlpha = it.alpha;
      if (it.halo > 0 && it.stroke !== 'none') { c.strokeStyle = it.stroke; c.lineWidth = it.halo; c.strokeText(it.text, w / 2, h / 2); }
      c.fillStyle = it.fill; c.fillText(it.text, w / 2, h / 2);
      return c.canvas;
    });
  }
  function buildLabels() {
    const s = view().s, dpr = Math.min(window.devicePixelRatio || 1, 2), items = [], dots = svg.classList.contains('dots');
    if (LABELS) for (const el of LABELS.querySelectorAll('text')) {
      const text = el.textContent; if (!text) continue;
      const cs = getComputedStyle(el); if (cs.display === 'none') continue;
      const fs = parseFloat(el.getAttribute('font-size')) || parseFloat(cs.fontSize) || 1, px = fs * s;
      if (!(px > 1)) continue;
      const raw = parseFloat(el.dataset.raw), kind = dots ? 2 : raw > 0 ? 1 : 0;
      const halo = (parseFloat(cs.strokeWidth) || 0) * s * dpr, font = `${cs.fontStyle} ${cs.fontWeight} ${(px * dpr).toFixed(2)}px ${cs.fontFamily}`;
      const it = { text, font, px, halo: +halo.toFixed(2), fill: cs.fill, stroke: cs.stroke, alpha: +cs.opacity, kind, raw: raw || 0,
        x: +el.getAttribute('x'), y: +el.getAttribute('y') + (kind === 2 ? 0 : (parseFloat(el.getAttribute('dy')) || 0)) };
      it.pic = picOf(it, dpr); items.push(it);
    }
    // shelves of labels, in a picture as wide as needed (up to 2048 device pixels)
    const W = 2048; let x = 0, y = 0, row = 0;
    for (const it of items) { const w = it.pic.width, h = it.pic.height; if (x + w > W) { x = 0; y += row; row = 0; } it.u = x; it.v = y; x += w; row = Math.max(row, h); }
    const H = Math.min(4096, Math.max(1, y + row));
    atlas.canvas.width = W; atlas.canvas.height = H;
    const data = new Float32Array(items.length * 54); let o = 0, n = 0;
    for (const it of items) {
      const w = it.pic.width, h = it.pic.height; if (it.v + h > H) break;
      atlas.drawImage(it.pic, it.u, it.v);
      // the corners on the screen (px) at the size drawn; the picture's place in u and v
      const hw = w / 2 / dpr, hh = h / 2 / dpr, u0 = it.u / W, v0 = it.v / H, u1 = (it.u + w) / W, v1 = (it.v + h) / H;
      for (const [dx, dy, u, v] of [[-hw, -hh, u0, v0], [hw, -hh, u1, v0], [-hw, hh, u0, v1], [-hw, hh, u0, v1], [hw, -hh, u1, v0], [hw, hh, u1, v1]]) { data.set([it.x, it.y, dx, dy, u, v, it.kind, it.raw, it.px], o); o += 9; }
      n++;
    }
    gl.bindTexture(gl.TEXTURE_2D, labelTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindBuffer(gl.ARRAY_BUFFER, lbuf); gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, o), gl.DYNAMIC_DRAW);
    labelCount = n * 6;
  }

  /* ---------- drawing ---------- */
  // Where the view puts the map in the stage, as area-quiz.js has it: its scale and the room left beside it.
  function view() {
    const W = stage.clientWidth, H = stage.clientHeight, v = want || { x: 0, y: 0, w: W || 1, h: H || 1 };
    const s = Math.min(W / v.w, H / v.h) || 1;
    return { W, H, s, v, ox: (W - v.w * s) / 2, oy: (H - v.h * s) / 2 };
  }
  function attrib(P, name, size, stride, offset) { const at = P.a(name); if (at < 0) return; gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, size, gl.FLOAT, false, stride, offset); }
  function draw() {
    frame = 0;
    if (svg.style.display === 'none') { canvas.hidden = true; return; }
    update();
    const { W, H, s, v, ox, oy } = view(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    canvas.classList.toggle('overlay', svg.classList.contains('overlay'));
    gl.viewport(0, 0, cw, ch); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const uniforms = P => { gl.uniform2f(P.u.u_org, v.x, v.y); gl.uniform2f(P.u.u_shift, ox, oy); gl.uniform2f(P.u.u_size, W, H); gl.uniform1f(P.u.u_s, s); gl.uniform1f(P.u.u_dot, dotNow || dotOf()); };
    if (count) {
      gl.useProgram(SHAPE.p); uniforms(SHAPE);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, styleTex); gl.uniform1i(SHAPE.u.u_style, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
      attrib(SHAPE, 'a_pos', 2, 24, 0); attrib(SHAPE, 'a_off', 2, 24, 8); attrib(SHAPE, 'a_id', 1, 24, 16); attrib(SHAPE, 'a_kind', 1, 24, 20);
      gl.drawArrays(gl.TRIANGLES, 0, count);
    }
    if (labelCount) {
      gl.useProgram(LABEL.p); uniforms(LABEL);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, labelTex); gl.uniform1i(LABEL.u.u_tex, 1);
      gl.bindBuffer(gl.ARRAY_BUFFER, lbuf);
      attrib(LABEL, 'a_pos', 2, 36, 0); attrib(LABEL, 'a_off', 2, 36, 8); attrib(LABEL, 'a_uv', 2, 36, 16); attrib(LABEL, 'a_size', 3, 36, 24);
      gl.drawArrays(gl.TRIANGLES, 0, labelCount);
    }
    // the first picture is there: the SVG's shapes and labels go (until now they showed as before)
    if (!ready) { ready = true; canvas.hidden = false; svg.classList.add('gl'); }
    canvas.hidden = false;
  }

  /* ---------- what changes the picture ---------- */
  const watch = new MutationObserver(list => {
    for (const m of list) {
      const inLabels = LABELS && LABELS.contains(m.target);
      if (inLabels) dirty.labels = true;
      else if (m.type === 'childList' || m.attributeName === 'd' || m.attributeName === 'transform') dirty.shapes = true;
      else dirty.looks = true;
    }
    schedule();
  });
  for (const g of GROUPS) watch.observe(g, { subtree: true, childList: true, attributes: true, attributeFilter: ['d', 'class', 'style', 'transform'] });
  if (LABELS) watch.observe(LABELS, { subtree: true, childList: true, attributes: true, characterData: true });
  // the map's own classes (its look), the stage's (the street map's colors), the page's theme: every look is read
  // again. Not what changes with every frame of a move (its transform, the dots' size --dot: drawn from u_dot) nor
  // the classes of a move (zooming, grab).
  let mapState = '';
  const stateOf = () => [...svg.classList].filter(c => c !== 'zooming' && c !== 'grab' && c !== 'gl').join(' ') + '|' + stage.className + '|' + document.documentElement.getAttribute('data-theme');
  const restyle = () => { const now = stateOf(); if (now !== mapState) { mapState = now; dirty.looks = dirty.labels = true; } schedule(); };
  new MutationObserver(restyle).observe(svg, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(restyle).observe(stage, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(restyle).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  mapState = stateOf();
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { mapState = ''; restyle(); });
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(stage);
  if (document.fonts) document.fonts.ready.then(() => { PICS.clear(); dirty.labels = true; schedule(); });
  canvas.addEventListener('webglcontextlost', e => e.preventDefault());
  canvas.addEventListener('webglcontextrestored', () => location.reload());
  schedule();

  /* ---------- taps ---------- */
  // The element a tap at map point p is on: the topmost one drawn that takes taps, whose fill holds the point (by
  // even-odd counting, as its rings are drawn), or a dot within its half width.
  function at(p) {
    update();
    const s = view().s, dot = dotNow || dotOf();
    for (let i = EL.length - 1; i >= 0; i--) {
      const l = LOOK[i]; if (!l || !l.events) continue;
      const sh = partsOf(EL[i].getAttribute('d') || '', PLACE[i]);
      const pad = l.round ? ((l.wpx + l.wdot * dot) / s + l.wmap) / 2 : 0, b = sh.box;
      if (p.x < b[0] - pad || p.x > b[2] + pad || p.y < b[1] - pad || p.y > b[3] + pad) continue;
      if (l.hasFill) { let c = false; for (const part of sh.parts) if (part.p.length >= 6 && inRing(part.p, p.x, p.y)) c = !c; if (c) return EL[i]; }
      if (l.round && l.hasStroke) for (const part of sh.parts) if (zero(part.p) && Math.hypot(p.x - part.p[0], p.y - part.p[1]) <= pad) return EL[i];
    }
    return null;
  }

  return {
    view(v, dot) { want = { ...v }; if (dot) dotNow = dot; schedule(); },
    at,
    prepare(d, kinds) { if (d) for (const k of kinds) trianglesOf(d, [1, 0, 0], k); },
  };
}
