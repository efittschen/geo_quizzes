/* The quiz map, drawn by WebGL 2 (for the engine's Map, engine/map/; loaded with the page by page.js).

   mapShapes(): the map's shapes are plain records, one list for each layer of the map, drawn in this order: ctx (the
   world under the map, a city quiz's land, the neighbours), free (map play's last guess), regions (the areas and their
   units), borders, hl (the highlights), sketch (Draw), labels, pins. A shape has the few operations of a page element
   the engine uses on it (classes, data, attributes, an inline style, children, remove) and nothing else: no layout,
   no style of its own. A change marks what it changes (outlines, looks, labels) in its layer for the next frame.

   Looks are the stylesheets', as they were for the SVG map: each distinct look (the layer, the groups around the shape,
   its tag, id, classes, data, attributes and inline style) is read once from a hidden sample in the page's svg#map,
   which holds nothing else and is never shown, and kept until the map's classes, the stage's or the theme change. The
   sample sits where the shape would, so every selector of the stylesheets (a page's own too) applies to it as it did.

   A shape's triangles come from its outline alone: a closed outline (an area) is cut into the triangles of its fill
   (earcut.js) and the strips of its line, an open one into its line; lines are strips of their width on the screen
   (dashed where the look says so), dots (lines of no length with round caps) discs, circles rings. They are kept on
   the shape until its outline changes, and those of the outlines a zoom step will need are made ahead while the page
   is idle (prepare). Each layer is one block of triangles on the graphics card, built anew only when the layer's
   shapes or outlines change: a look picks only the colours, from a small table the graphics card reads (STYLE),
   see-through where it paints no fill or no line, so a change of look rewrites that table and nothing else. Moving the
   map only moves the view: each frame is drawn anew from the same blocks. The looks' animations (quiz-map.css: pulse,
   dotpulse, tint) are drawn frame by frame while one is shown, and a layer see-through as a whole (the sketch) is
   drawn apart and laid on as one. Each label is a picture of its text drawn by the browser, in any script, with its
   halo, at its size on the screen, once, in its own font (a label waits for its font to come); the pictures lie in the
   pages of one texture. Labels never hold the map back: a frame that builds blocks anew shows them at once, and the
   labels follow in the next.

   While the map zooms, nothing waits for it to rest: the dots that grow with the zoom (--dot) grow at once (their
   width is the dot's size times their share of it), and labels keep their size on the screen (city names above their
   dot, an area's name its size on the map from 9 px up to the size it is drawn at); none is drawn again.

     const S = mapShapes()           S.ctx, S.free, S.regions, S.borders, S.hl, S.sketch, S.labels, S.pins: the layers;
                                      S.el(tag): a new shape ('g', 'path', 'circle', 'line', 'text')
     const g = glMap(stage, svg, S)  null without WebGL 2 or earcut; g.canvas: where the map is, taking its pointer
     g.view(vb, dot)                 the box of the map shown in the stage (engine/map/view.js) and the dots' size on the
                                      screen now (px); drawn at the next frame
     g.at(p)                         the shape under map point p that takes taps, or null
     g.prepare(d, kinds)             makes the triangles of an outline ahead: kinds 'e' (filled, evenodd), 's'
                                      (outline), 'r' (outline with round caps)
*/
function mapShapes() {
  const LAYERS = ['ctx', 'free', 'regions', 'borders', 'hl', 'sketch', 'labels', 'pins'];
  const S = { LAYERS, changed: () => {} };
  const GEOMETRY = new Set(['d', 'transform', 'cx', 'cy', 'r', 'x1', 'y1', 'x2', 'y2']), TEXT = new Set(['x', 'y', 'dy', 'font-size']);
  const kebab = k => k.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
  // what a change touches: nothing while the shape is in no layer (it is read when it is put in one)
  function touch(n, what) {
    n.key = null;
    if (what === 'classes') what = 'looks';
    let top = n; while (top.parentNode) top = top.parentNode;
    if (!top.layer) return;
    S.changed(top.layer === 'labels' || n.tag === 'text' ? 'labels' : what, top.layer, n);
  }
  class Flags { // classList
    constructor(n) { this.n = n; this.set = new Set(); }
    get value() { return [...this.set].join(' '); }
    get length() { return this.set.size; }
    [Symbol.iterator]() { return this.set[Symbol.iterator](); }
    contains(c) { return this.set.has(c); }
    add(...cs) { let ch = false; for (const c of cs) if (!this.set.has(c)) { this.set.add(c); ch = true; } if (ch) touch(this.n, 'classes'); }
    remove(...cs) { let ch = false; for (const c of cs) if (this.set.delete(c)) ch = true; if (ch) touch(this.n, 'classes'); }
    toggle(c, on) { const now = on === undefined ? !this.set.has(c) : !!on; if (now) this.add(c); else this.remove(c); return now; }
    replace(a, b) { if (!this.set.has(a)) return false; this.set.delete(a); this.set.add(b); touch(this.n, 'classes'); return true; }
    reset(v) { this.set = new Set(String(v).split(/\s+/).filter(Boolean)); touch(this.n, 'classes'); }
  }
  class Shape {
    constructor(tag) {
      this.tag = tag; this.attrs = new Map(); this.parentNode = null; this.kids = []; this.text = ''; this.key = null;
      this.geo = null; this.item = null; // (gl-map's: its outline as drawn, and its place in its layer's block)
      this.classList = new Flags(this);
      const props = new Map(), n = this;
      // an inline style: style.strokeWidth = …, style.setProperty('--hint', …)
      this.style = new Proxy({
        setProperty(k, v) { if (props.get(k) !== String(v)) { props.set(k, String(v)); touch(n, 'looks'); } },
        getPropertyValue: k => props.get(k) || '',
        removeProperty(k) { if (props.delete(k)) touch(n, 'looks'); return ''; },
      }, {
        get: (t, k) => (k in t ? t[k] : k === 'cssText' ? [...props].map(([a, b]) => `${a}:${b}`).join(';') : props.get(kebab(String(k))) || ''),
        set: (t, k, v) => { if (v === '' || v == null) t.removeProperty(kebab(k)); else t.setProperty(kebab(k), v); return true; },
      });
      this.dataset = new Proxy({}, {
        get: (t, k) => (typeof k === 'string' && n.attrs.has('data-' + kebab(k)) ? n.attrs.get('data-' + kebab(k)) : undefined),
        set: (t, k, v) => { n.setAttribute('data-' + kebab(k), v); return true; },
        has: (t, k) => n.attrs.has('data-' + kebab(String(k))),
        deleteProperty: (t, k) => { n.removeAttribute('data-' + kebab(String(k))); return true; },
      });
    }
    get id() { return this.attrs.get('id') || ''; }
    set id(v) { this.setAttribute('id', v); }
    setAttribute(k, v) {
      v = String(v);
      if (k === 'class') return this.classList.reset(v);
      if (this.attrs.get(k) === v) return;
      this.attrs.set(k, v); touch(this, GEOMETRY.has(k) ? 'shapes' : TEXT.has(k) ? 'labels' : 'looks');
    }
    getAttribute(k) { return k === 'class' ? this.classList.value : this.attrs.has(k) ? this.attrs.get(k) : null; }
    removeAttribute(k) { if (k === 'class') return this.classList.reset(''); if (this.attrs.delete(k)) touch(this, GEOMETRY.has(k) ? 'shapes' : 'looks'); }
    get textContent() { return this.text; }
    set textContent(v) { v = String(v); if (v !== this.text) { this.text = v; touch(this, 'labels'); } }
    // children
    get children() { return this.kids; }
    get firstChild() { return this.kids[0] || null; }
    get lastChild() { return this.kids[this.kids.length - 1] || null; }
    get isConnected() { let t = this; while (t.parentNode) t = t.parentNode; return !!t.layer; }
    contains(n) { for (; n; n = n.parentNode) if (n === this) return true; return false; }
    insertBefore(n, ref) {
      if (n.parentNode) n.parentNode.drop(n);
      const i = ref ? this.kids.indexOf(ref) : -1;
      if (i < 0) this.kids.push(n); else this.kids.splice(i, 0, n);
      n.parentNode = this; touch(this, 'shapes'); return n;
    }
    appendChild(n) { return this.insertBefore(n, null); }
    append(...ns) { for (const n of ns) this.insertBefore(n, null); }
    prepend(...ns) { const first = this.kids[0] || null; for (const n of ns) this.insertBefore(n, first); }
    replaceChildren(...ns) {
      for (const k of this.kids) k.parentNode = null;
      this.kids = [];
      for (const n of ns) { if (n.parentNode) n.parentNode.drop(n); n.parentNode = this; this.kids.push(n); }
      touch(this, 'shapes');
    }
    remove() { const p = this.parentNode; if (p) { p.drop(this); touch(p, 'shapes'); } }
    drop(n) { const i = this.kids.indexOf(n); if (i >= 0) this.kids.splice(i, 1); n.parentNode = null; }
    // (only what the engine asks: a tag, a class or tag.class)
    querySelectorAll(sel) {
      const [tag, cls] = sel.split('.'), out = [];
      const walk = n => { for (const k of n.kids) { if ((!tag || k.tag === tag) && (!cls || k.classList.contains(cls))) out.push(k); walk(k); } };
      walk(this); return out;
    }
    querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  }
  S.el = tag => new Shape(tag);
  for (const id of LAYERS) { const g = new Shape('g'); g.layer = id; g.attrs.set('id', id); S[id] = g; }
  // the highlights, as the page had them (#hl: the larger area of the place asked, the place asked and its outline,
  // the area under the pointer, the answer shown)
  for (const id of ['askCtx', 'askUse', 'askLine', 'hoverUse', 'ansUse']) { const p = new Shape('path'); p.attrs.set('id', id); p.attrs.set('d', ''); S.hl.kids.push(p); p.parentNode = S.hl; S[id] = p; }
  return S;
}

function glMap(stage, svg, S) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2', { antialias: true, premultipliedAlpha: true, alpha: true });
  if (!gl || typeof earcut !== 'function') return null;
  canvas.className = 'glmap'; canvas.hidden = true;
  canvas.setAttribute('role', 'img'); if (svg.getAttribute('aria-label')) canvas.setAttribute('aria-label', svg.getAttribute('aria-label'));
  svg.setAttribute('aria-hidden', 'true');
  stage.insertBefore(canvas, svg);

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
  // shape's row in STYLE (counted in its layer: u_base is the layer's first), whether it is of the shape's fill (0) or
  // its outline (1), and how far along its line it lies (map units, for dashes). STYLE's rows: fill, outline
  // (premultiplied colors), the outline's width (on the screen, in map units, as a share of the dots' size now), and its
  // dashes (on, off, px) and animation (1 pulse, 2 dotpulse, 3 tint: quiz-map.css; the color it animates is stored at
  // full opacity).
  const SHAPE = program(`#version 300 es
    in vec2 a_pos; in vec2 a_off; in float a_id; in float a_kind; in float a_len;
    uniform sampler2D u_style; uniform vec2 u_org, u_shift, u_size; uniform float u_s, u_dot, u_t; uniform int u_base;
    out vec4 v_col; out float v_len; out vec2 v_dash;
    void main() {
      int id = int(a_id + .5) + u_base; ivec2 t = ivec2(id % 1024, (id / 1024) * 4);
      vec4 w = texelFetch(u_style, t + ivec2(0, 2), 0), x = texelFetch(u_style, t + ivec2(0, 3), 0);
      int anim = int(x.z + .5);
      float e = .5 - .5 * cos(3.14159265 * u_t), stroke = a_kind > .5 ? 1. : 0.;
      float width = anim == 1 ? mix(2., 5., e) : anim == 2 ? u_dot * mix(1.45, 2.55, e) : w.x + w.y * u_s + w.z * u_dot;
      vec2 p = (a_pos - u_org) * u_s + u_shift + a_off * width * .5 * stroke;
      gl_Position = vec4(p.x / u_size.x * 2. - 1., 1. - p.y / u_size.y * 2., 0., 1.);
      v_col = texelFetch(u_style, t + ivec2(0, a_kind > .5 ? 1 : 0), 0);
      if (anim == 2 && stroke > .5) v_col *= mix(.35, .8, e);
      if (anim == 3 && stroke < .5) v_col *= mix(.04, .24, e);
      v_len = a_len * u_s; v_dash = stroke > .5 ? x.xy : vec2(0.);
    }`, `#version 300 es
    precision mediump float; in vec4 v_col; in float v_len; in vec2 v_dash; out vec4 o;
    void main() { if (v_dash.x > 0. && mod(v_len, v_dash.x + v_dash.y) > v_dash.x) discard; o = v_col; }`);
  // A label's corner: its anchor (a map point), the corner's offset on the screen at the size it was drawn at (px0),
  // its place in the pictures of the labels (u, v, page), and how its size follows the zoom (a_size: kind, raw, px0):
  // 0 as drawn, 1 an area's name (raw: its size on the map, from 9 px up to px0), 2 a city's name (above its dot).
  const LABEL = program(`#version 300 es
    in vec2 a_pos; in vec2 a_off; in vec3 a_uv; in vec3 a_size;
    uniform vec2 u_org, u_shift, u_size; uniform float u_s, u_dot;
    out vec3 v_uv;
    void main() {
      float f = a_size.x > .5 && a_size.x < 1.5 ? clamp(a_size.y * u_s, 9., a_size.z) / a_size.z : 1.;
      vec2 up = a_size.x > 1.5 ? vec2(0., -(u_dot / 2. + 7.5)) : vec2(0.);
      vec2 p = (a_pos - u_org) * u_s + u_shift + up + a_off * f;
      gl_Position = vec4(p.x / u_size.x * 2. - 1., 1. - p.y / u_size.y * 2., 0., 1.);
      v_uv = a_uv;
    }`, `#version 300 es
    precision mediump float; precision mediump sampler2DArray; in vec3 v_uv; uniform sampler2DArray u_tex; out vec4 o;
    void main() { o = texture(u_tex, v_uv); }`);
  // A layer drawn apart (the sketch, see-through as a whole), laid on the map at its opacity.
  const LAYER = program(`#version 300 es
    in vec2 a_pos; out vec2 v_uv;
    void main() { v_uv = a_pos * .5 + .5; gl_Position = vec4(a_pos, 0., 1.); }`, `#version 300 es
    precision mediump float; in vec2 v_uv; uniform sampler2D u_tex; uniform float u_alpha; out vec4 o;
    void main() { o = texture(u_tex, v_uv) * u_alpha; }`);

  /* ---------- the shapes' outlines ---------- */
  const TOK = /[MmLlHhVvQqCcAaZz]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;
  // The parts of a path of M, L, H, V, Q, C, A and Z commands: { p: [x, y, x, y, …], closed }; a curve (the letter
  // boards' tiles have round corners, engine/types/lang.js) in six straight steps. Arcs (the circle of a dot) only where asked
  // (arcs: the highlights and the rest on top, which the browser drew as SVG before): elsewhere a dot drawn as a circle
  // stays the point it starts at, drawn as the dot its look makes of it.
  function parse(d, arcs) {
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
      else if (cmd === 'Q' || cmd === 'q' || cmd === 'C' || cmd === 'c') {
        const rel = cmd === 'q' || cmd === 'c', n = cmd === 'Q' || cmd === 'q' ? 2 : 3, bx = x, by = y, p = [];
        for (let k = 0; k < n; k++) p.push((rel ? bx : 0) + +t[i + 2 * k], (rel ? by : 0) + +t[i + 2 * k + 1]);
        i += 2 * n;
        for (let k = 1; k <= 6; k++) {
          const u = k / 6, w = 1 - u;
          if (n === 2) { x = w * w * bx + 2 * w * u * p[0] + u * u * p[2]; y = w * w * by + 2 * w * u * p[1] + u * u * p[3]; }
          else { x = w * w * w * bx + 3 * w * w * u * p[0] + 3 * w * u * u * p[2] + u * u * u * p[4]; y = w * w * w * by + 3 * w * w * u * p[1] + 3 * w * u * u * p[3] + u * u * u * p[5]; }
          to();
        }
      }
      else if (cmd === 'A' || cmd === 'a') {
        const rel = cmd === 'a', ex = (rel ? x : 0) + +t[i + 5], ey = (rel ? y : 0) + +t[i + 6];
        if (arcs) for (const [px, py] of arcOf(x, y, +t[i], +t[i + 1], +t[i + 2], +t[i + 3], +t[i + 4], ex, ey)) { x = px; y = py; to(); }
        else { x = ex; y = ey; }
        i += 7;
      }
      else i++;
    }
    return out;
  }
  // An SVG arc from (x1, y1) to (x2, y2) as points along it (the endpoint form turned into its centre's, SVG 1.1 F.6.5).
  function arcOf(x1, y1, rx, ry, phi, large, sweep, x2, y2) {
    rx = Math.abs(rx); ry = Math.abs(ry);
    if (!rx || !ry) return [[x2, y2]];
    const f = phi * Math.PI / 180, cf = Math.cos(f), sf = Math.sin(f), dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
    const x1p = cf * dx + sf * dy, y1p = -sf * dx + cf * dy, l = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry);
    if (l > 1) { rx *= Math.sqrt(l); ry *= Math.sqrt(l); }
    const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p, den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
    const k = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, num / den)), cxp = k * rx * y1p / ry, cyp = -k * ry * x1p / rx;
    const cx = cf * cxp - sf * cyp + (x1 + x2) / 2, cy = sf * cxp + cf * cyp + (y1 + y2) / 2;
    const ang = (ux, uy, vx, vy) => { const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a; };
    const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
    let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
    if (!+sweep && dt > 0) dt -= 2 * Math.PI; else if (+sweep && dt < 0) dt += 2 * Math.PI;
    const n = Math.max(4, Math.ceil(Math.abs(dt) / (Math.PI / 12))), out = [];
    for (let j = 1; j <= n; j++) { const t = t1 + dt * j / n, ex = rx * Math.cos(t), ey = ry * Math.sin(t); out.push([cf * ex - sf * ey + cx, sf * ex + cf * ey + cy]); }
    return out;
  }
  // A shape's outline as a path: a path's own, a circle's as a ring of 48 points, a line's.
  function dOf(n) {
    if (n.tag === 'path') return n.attrs.get('d') || '';
    const a = k => +(n.attrs.get(k) || 0);
    if (n.tag === 'line') return `M${a('x1')},${a('y1')}L${a('x2')},${a('y2')}`;
    if (n.tag === 'circle') {
      const cx = a('cx'), cy = a('cy'), r = a('r'); if (!(r > 0)) return '';
      let d = ''; for (let i = 0; i < 48; i++) { const t = i / 48 * 2 * Math.PI; d += (i ? 'L' : 'M') + (cx + r * Math.cos(t)) + ',' + (cy + r * Math.sin(t)); }
      return d + 'Z';
    }
    return '';
  }
  // The transforms of the groups a shape is in (translate and scale: the world laid under the map), as [k, dx, dy].
  function placeOf(n) {
    let k = 1, dx = 0, dy = 0;
    for (let g = n.parentNode; g && !g.layer; g = g.parentNode) {
      const t = g.attrs.get('transform'); if (!t) continue;
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
  // An outline's vertices, [x, y, side x, side y, length along it] each: two triangles a segment (its width added on
  // the screen), and a disc for a part of no length with round caps (a dot).
  const DISC = 16;
  function strokeOf(parts, round) {
    let n = 0;
    for (const s of parts) { const m = s.p.length / 2; n += zero(s.p) ? (round ? DISC * 3 : 0) : (m - 1 + (s.closed ? 1 : 0)) * 6; }
    const out = new Float32Array(n * 5); let o = 0;
    const v = (x, y, ox, oy, l) => { out[o++] = x; out[o++] = y; out[o++] = ox; out[o++] = oy; out[o++] = l; };
    for (const s of parts) {
      const p = s.p;
      if (zero(p)) {
        if (round) for (let i = 0; i < DISC; i++) { const a = 2 * Math.PI * i / DISC, b = 2 * Math.PI * (i + 1) / DISC; v(p[0], p[1], 0, 0, 0); v(p[0], p[1], Math.cos(a), Math.sin(a), 0); v(p[0], p[1], Math.cos(b), Math.sin(b), 0); }
        continue;
      }
      const m = p.length / 2, last = s.closed ? m : m - 1;
      let len = 0;
      for (let i = 0; i < last; i++) {
        const x0 = p[2 * i], y0 = p[2 * i + 1], j = (i + 1) % m, x1 = p[2 * j], y1 = p[2 * j + 1], dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, l1 = len + Math.hypot(dx, dy);
        v(x0, y0, nx, ny, len); v(x0, y0, -nx, -ny, len); v(x1, y1, nx, ny, l1); v(x1, y1, nx, ny, l1); v(x0, y0, -nx, -ny, len); v(x1, y1, -nx, -ny, l1);
        len = l1;
      }
    }
    return out.subarray(0, o);
  }
  const join = arrs => { if (arrs.length === 1) return arrs[0]; let len = 0; for (const a of arrs) len += a.length; const out = new Float32Array(len); let o = 0; for (const a of arrs) { out.set(a, o); o += a.length; } return out; };
  // The triangles of an outline, kept, in its own units (a shape's place is applied as its layer's block is built):
  // whole, or (a nonzero fill, a line: rings that stand alone) by its pieces, each "M…" of it, so that an outline made
  // of pieces met before (a highlight: areas' outlines) is cut only where it is new.
  const PIECES = new Map(), WHOLES = new Map();
  const keep = (map, key, make) => { let v = map.get(key); if (v === undefined) { v = make(); map.set(key, v); if (map.size > 20000) map.delete(map.keys().next().value); } return v; };
  const SPLIT = /(?=M)/;
  function trianglesOf(d, kind, arcs = false) {
    const a = arcs ? 'a' : '';
    if (kind === 'e') return keep(WHOLES, kind + a + d, () => fillOf(parse(d, arcs), true));
    const make = piece => kind === 'n' ? fillOf(parse(piece, arcs), false) : strokeOf(parse(piece, arcs), kind === 'r');
    if (/[mlhvz]/.test(d.replace(/z/g, ''))) return keep(WHOLES, kind + a + d, () => make(d)); // (relative steps: not to be cut apart)
    const pieces = d.split(SPLIT).filter(Boolean);
    if (pieces.length === 1) return keep(PIECES, kind + a + d, () => make(d));
    return join(pieces.map(p => keep(PIECES, kind + a + p, () => make(p))));
  }
  // A shape's outline as it is drawn and tapped, kept on the shape until its outline changes: whether it is closed (an
  // area, which has a fill), its triangles of each kind (asked for as its layer's block is built), and its parts and
  // box where it lies, for taps (worked out at the first tap).
  function geoOf(n, d, arcs) {
    const g = n.geo;
    return g && g.d === d && g.arcs === arcs ? g : (n.geo = { d, arcs, area: /[Zz]/.test(d), tris: {}, tap: null });
  }
  const trisOf = (g, kind) => (g.tris[kind] ??= trianglesOf(g.d, kind, g.arcs));
  function tapOf(g, place) {
    const pk = place.join(',');
    if (!g.tap || g.tap.pk !== pk) { const parts = placed(parse(g.d, false), place), all = parts.flatMap(s => s.p); g.tap = { pk, parts, box: all.length ? boxOf(all) : [0, 0, 0, 0] }; }
    return g.tap;
  }

  /* ---------- looks: the stylesheets', read from a hidden sample ---------- */
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
  // The samples: svg#map holds a group for every layer (with the stylesheets' ids), and in it, at each depth of groups,
  // one sample element of each tag, set up like the shape asked about. The highlights are their own samples (#hl
  // #askUse…: a look may depend on the one before, #askCtx.around + #askUse).
  const NSV = 'http://www.w3.org/2000/svg', SAMPLE_LAYER = {};
  for (const id of S.LAYERS) {
    let g = svg.querySelector(':scope > #' + id);
    if (!g) { g = document.createElementNS(NSV, 'g'); g.id = id; svg.append(g); }
    SAMPLE_LAYER[id] = g;
  }
  for (const n of S.hl.kids) if (!SAMPLE_LAYER.hl.querySelector('#' + n.id)) { const p = document.createElementNS(NSV, 'path'); p.id = n.id; SAMPLE_LAYER.hl.append(p); }
  const OWN = new Set(['d', 'transform', 'cx', 'cy', 'r', 'x1', 'y1', 'x2', 'y2', 'x', 'y', 'dy', 'font-size']);
  // The data attributes a stylesheet's selector asks for ([data-g]: a hint color's group): only those make a look
  // differ, not an area's id (data-a), which would give every area a look of its own to read.
  const STYLED = new Set();
  const selectors = rules => { for (const r of rules) { if (r.selectorText) for (const m of r.selectorText.matchAll(/\[(data-[\w-]+)/g)) STYLED.add(m[1]); if (r.cssRules) selectors(r.cssRules); } };
  for (const sheet of document.styleSheets) { try { selectors(sheet.cssRules); } catch (e) { /* (another site's sheet: the fonts) */ } }
  // a shape's own part of its look's key: tag, attributes but where it is, classes, inline style, an empty outline
  function ownKey(n) {
    if (n.key !== null) return n.key;
    let k = n.tag + '|' + n.classList.value + '|' + n.style.cssText + '|' + (n.tag === 'path' && !n.attrs.get('d') ? 'empty' : '');
    for (const [a, v] of n.attrs) if (!OWN.has(a) && (!a.startsWith('data-') || STYLED.has(a))) k += '|' + a + '=' + v;
    return (n.key = k);
  }
  function setUp(el, n) {
    for (const a of [...el.attributes]) if (a.name !== 'id' && a.name !== 'data-sample') el.removeAttribute(a.name);
    for (const [a, v] of n.attrs) if (a !== 'id' && (!OWN.has(a) || a === 'd')) el.setAttribute(a, a === 'd' ? (v ? 'M0,0' : '') : v);
    if (n.classList.length) el.setAttribute('class', n.classList.value);
    const css = n.style.cssText; if (css) el.setAttribute('style', css);
  }
  // the sample for shape n (chain: the groups between its layer and it)
  function sampleOf(n, layer, chain) {
    let parent = SAMPLE_LAYER[layer];
    setUp(parent, S[layer]);
    if (layer === 'hl' && n.parentNode === S.hl) { for (const h of S.hl.kids) setUp(SAMPLE_LAYER.hl.querySelector('#' + h.id), h); return SAMPLE_LAYER.hl.querySelector('#' + n.id); }
    chain.forEach((g, depth) => {
      let s = parent.querySelector(`:scope > g[data-sample="${depth}"]`);
      if (!s) { s = document.createElementNS(NSV, 'g'); s.setAttribute('data-sample', depth); parent.append(s); }
      setUp(s, g); parent = s;
    });
    let el = parent.querySelector(`:scope > ${n.tag}[data-sample]`);
    if (!el) { el = document.createElementNS(NSV, n.tag); el.setAttribute('data-sample', ''); parent.append(el); }
    setUp(el, n); if (n.id) el.setAttribute('id', n.id); else el.removeAttribute('id');
    return el;
  }
  // whether a group between the sample and its layer is not shown
  const hiddenAbove = el => { for (let g = el.parentNode; g && g !== svg; g = g.parentNode) if (getComputedStyle(g).display === 'none') return true; return false; };
  const ANIMS = { pulse: 1, dotpulse: 2, tint: 3 };
  function readLook(n, layer, chain) {
    const el = sampleOf(n, layer, chain), cs = getComputedStyle(el);
    if (n.tag === 'text') {
      return { text: true, shown: cs.display !== 'none' && cs.visibility === 'visible' && !hiddenAbove(el), fill: cs.fill, stroke: cs.stroke, sw: parseFloat(cs.strokeWidth) || 0, alpha: +cs.opacity, font: [cs.fontStyle, cs.fontWeight, cs.fontFamily], fontPx: parseFloat(cs.fontSize) || 0 };
    }
    const shown = cs.visibility === 'visible' && cs.display !== 'none' && !hiddenAbove(el), op = shown ? +cs.opacity : 0;
    const sw = parseFloat(cs.strokeWidth) || 0, scaled = cs.vectorEffect !== 'non-scaling-stroke';
    const anim = cs.animationName && cs.animationName !== 'none' ? ANIMS[cs.animationName.split(',')[0].trim()] || 0 : 0;
    // a dot whose size follows the dots' (--dot, which grows with the zoom): its share of it
    const dot = dotOf();
    const share = !scaled && dot && (n.classList.contains('dot') || (svg.classList.contains('dots') && n.classList.contains('r'))) ? sw / dot : 0;
    const dash = cs.strokeDasharray && cs.strokeDasharray !== 'none' ? cs.strokeDasharray.split(/[ ,]+/).map(parseFloat).filter(v => v >= 0) : null;
    // (an animated color is kept at full opacity: the animation gives it its own)
    const fillOp = anim === 3 ? op : +cs.fillOpacity * op, strokeOp = anim === 2 ? op : +cs.strokeOpacity * op;
    return {
      fill: paint(cs.fill, fillOp), stroke: sw > 0 || anim ? paint(cs.stroke, strokeOp) : null,
      wpx: scaled || share ? 0 : sw, wmap: scaled ? sw : 0, wdot: share,
      dash: dash && dash.length && dash.some(v => v > 0) ? [dash[0], dash[1] ?? dash[0]] : null, anim,
      // for taps, whether a fill or an outline is painted at all (a see-through fill takes taps); for the triangles, how
      // holes count, and dots (round caps)
      hasFill: cs.fill !== 'none', hasStroke: cs.stroke !== 'none' && (sw > 0 || anim > 0), evenodd: cs.fillRule === 'evenodd', round: cs.strokeLinecap === 'round',
      events: shown && cs.pointerEvents !== 'none', shown,
    };
  }
  const LOOKS = new Map(); // look key -> look, until the map's classes, the stage's or the theme change
  function lookOf(n, layer, chain, chainKey) {
    const key = layer + '/' + chainKey + '/' + ownKey(n) + (layer === 'hl' ? '/' + S.hl.kids.map(ownKey).join('+') : '');
    let l = LOOKS.get(key); if (!l) { l = readLook(n, layer, chain); LOOKS.set(key, l); }
    return l;
  }
  // a layer's own opacity (drawn apart and laid on as one where it is under 1: the sketch)
  const layerAlpha = id => { const g = SAMPLE_LAYER[id]; setUp(g, S[id]); const cs = getComputedStyle(g); return cs.display === 'none' ? 0 : +cs.opacity; };

  /* ---------- the picture: a block of triangles for each layer, and how it is updated ---------- */
  const lbuf = gl.createBuffer(), qbuf = gl.createBuffer(), styleTex = gl.createTexture(), labelTex = gl.createTexture();
  gl.bindBuffer(gl.ARRAY_BUFFER, qbuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  // BLOCKS: for each layer, the shapes drawn in its order (items: shape, look, outline, place, form), its block of
  // vertices (n) and its first row in STYLE (base); and what changed in it since the last frame: its shapes or an
  // outline (all: read again), or the looks of some of its shapes (looks).
  const BLOCKS = Object.fromEntries(S.LAYERS.map(id => [id, { id, items: [], buf: gl.createBuffer(), n: 0, base: 0, all: true, looks: new Set() }]));
  let LRANGES = {}, styleRows = 0, animated = false, labelsChanged = true, frame = 0, want = null, dotNow = 0;
  const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
  const DRAWN = new Set(['path', 'circle', 'line']), ON_TOP = new Set(['free', 'hl', 'sketch', 'pins']), TEXTS = ['labels', 'pins'];
  // A change in layer `layer`: of its shapes or an outline, its shapes are read again; of a shape's look, that look (a
  // group's: every look in the layer; in #hl a look may depend on the one before, so all of them); of a text, the labels.
  S.changed = (what, layer, n) => {
    if (what === 'labels') labelsChanged = true;
    else { const B = BLOCKS[layer]; if (what === 'shapes' || !DRAWN.has(n.tag) || layer === 'hl') B.all = true; else B.looks.add(n); }
    schedule();
  };
  const dotOf = () => parseFloat(svg.style.getPropertyValue('--dot')) || 0;
  // a layer's shapes (or texts), in order: [shape, chain, chainKey]
  function collect(layer, texts) {
    const out = [];
    const walk = (g, chain, chainKey) => {
      for (const n of g.kids) {
        if (n.tag === 'g') walk(n, [...chain, n], chainKey + '>' + ownKey(n));
        else if (texts ? n.tag === 'text' : DRAWN.has(n.tag)) out.push([n, chain, chainKey]);
      }
    };
    walk(S[layer], [], ownKey(S[layer]));
    return out;
  }
  // a shape's triangles as its look asks for them: its fill's, by the look's fill rule (where it is closed), then its
  // line's, round-capped or not ('es', 'ns', 'r'…); whether the look paints them is its colours'
  const formOf = (g, l) => (g.area ? (l.evenodd ? 'e' : 'n') : '') + (l.round ? 'r' : 's');
  // the layers brought up to date; whether a block was built anew
  function update() {
    let looks = false, built = false;
    for (const id of S.LAYERS) {
      const B = BLOCKS[id];
      if (B.all) { built = readLayer(B) || built; looks = true; }
      else if (B.looks.size) { built = relook(B) || built; looks = true; }
    }
    if (looks) writeStyle();
    return built;
  }
  // a layer read again; its block built anew where a shape, an outline, a place or a form is not as it was (true)
  function readLayer(B) {
    B.all = false; B.looks.clear();
    const arcs = ON_TOP.has(B.id), old = B.items;
    B.items = collect(B.id, false).map(([n, chain, chainKey], i) => {
      const look = lookOf(n, B.id, chain, chainKey), g = geoOf(n, dOf(n), arcs);
      return (n.item = { n, i, chain, chainKey, look, g, place: placeOf(n), form: formOf(g, look) });
    });
    const same = B.items.length === old.length && B.items.every((it, i) => { const o = old[i]; return it.n === o.n && it.g === o.g && it.form === o.form && it.place.every((v, k) => v === o.place[k]); });
    if (!same) buildBlock(B);
    return !same;
  }
  // looks changed: their colours; a form changed too (a fill rule, round caps): the block anew (true)
  function relook(B) {
    let form = false;
    for (const n of B.looks) {
      const it = n.item;
      if (!it || B.items[it.i] !== it) return readLayer(B); // (a shape not in the layer as it was read)
      it.look = lookOf(n, B.id, it.chain, it.chainKey);
      const f = formOf(it.g, it.look); if (f !== it.form) { it.form = f; form = true; }
    }
    B.looks.clear();
    if (form) buildBlock(B);
    return form;
  }
  // A layer's block: each shape's fill, then its line, in the layer's order, where the shape lies (the transforms of
  // its groups, translate and scale: a line's sides stay, its length scales)
  function buildBlock(B) {
    let n = 0;
    const parts = B.items.map(({ g, form }) => {
      const f = g.d && form.length > 1 ? trisOf(g, form[0]) : null, k = g.d ? trisOf(g, form[form.length - 1]) : null;
      n += (f ? f.length / 2 : 0) + (k ? k.length / 5 : 0);
      return [f, k];
    });
    const data = new Float32Array(n * 7); let o = 0;
    parts.forEach(([f, k], id) => {
      const [s, dx, dy] = B.items[id].place;
      if (f) for (let i = 0; i < f.length; i += 2) { data[o] = f[i] * s + dx; data[o + 1] = f[i + 1] * s + dy; data[o + 4] = id; o += 7; }
      if (k) for (let i = 0; i < k.length; i += 5) { data[o] = k[i] * s + dx; data[o + 1] = k[i + 1] * s + dy; data[o + 2] = k[i + 2]; data[o + 3] = k[i + 3]; data[o + 4] = id; data[o + 5] = 1; data[o + 6] = k[i + 4] * s; o += 7; }
    });
    B.n = n;
    gl.bindBuffer(gl.ARRAY_BUFFER, B.buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  }
  // STYLE: four rows of texels for every 1024 shapes, a column each (see SHAPE), the layers' shapes one after another
  function writeStyle() {
    let total = 0;
    for (const id of S.LAYERS) { BLOCKS[id].base = total; total += BLOCKS[id].items.length; }
    const rows = Math.max(1, Math.ceil(total / 1024)) * 4, data = new Float32Array(1024 * rows * 4);
    animated = false;
    for (const id of S.LAYERS) BLOCKS[id].items.forEach(({ look: l, g }, i) => {
      const k = BLOCKS[id].base + i, col = k % 1024, row = Math.floor(k / 1024) * 4, at = r => ((row + r) * 1024 + col) * 4;
      if (l.fill) data.set(l.fill, at(0));
      if (l.stroke) data.set(l.stroke, at(1));
      data[at(2)] = l.wpx; data[at(2) + 1] = l.wmap; data[at(2) + 2] = l.wdot;
      if (l.dash) { data[at(3)] = l.dash[0]; data[at(3) + 1] = l.dash[1]; }
      data[at(3) + 2] = l.anim;
      if (l.anim && l.shown && g.d) animated = true;
    });
    gl.bindTexture(gl.TEXTURE_2D, styleTex);
    if (rows !== styleRows) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 1024, rows, 0, gl.RGBA, gl.FLOAT, data); styleRows = rows; }
    else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 1024, rows, gl.RGBA, gl.FLOAT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  /* ---------- labels: each a picture of its text drawn by the browser at its size on the screen, once ---------- */
  // Kept by text and look.
  const sheet = document.createElement('canvas').getContext('2d'), PICS = new Map(), FONTS = new Map(), PAGE = [2048, 1024];
  const pageTex = gl.createTexture(), pageFb = gl.createFramebuffer();
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
  // Whether a font is there to draw with (asked once a font: FONTS 'loading' or 'done'). The browser loads a page's font
  // only once something shows in it, and the labels are the first: one not there yet is asked for, and its labels wait;
  // once it has come, or could not, they are drawn.
  function fontReady(font) {
    const state = FONTS.get(font);
    if (state) return state === 'done';
    if (!document.fonts || document.fonts.check(font)) { FONTS.set(font, 'done'); return true; }
    FONTS.set(font, 'loading');
    const done = () => { FONTS.set(font, 'done'); labelsChanged = true; schedule(); };
    document.fonts.load(font).then(done, done);
    return false;
  }
  // The texts of the layers that show them, each where it is: its size on the screen is its own (font-size, set by the
  // engine's labels) or its look's, and an area's name is drawn at its largest; its dy is on the screen too.
  function buildLabels() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2), items = [], dots = svg.classList.contains('dots');
    for (const layer of TEXTS) for (const [n, chain, chainKey] of collect(layer, true)) {
      const text = n.text; if (!text) continue;
      const l = lookOf(n, layer, chain, chainKey); if (!l.shown) continue;
      const px = parseFloat(n.attrs.get('font-size')) || l.fontPx; if (!(px > 1)) continue;
      const raw = layer === 'labels' ? parseFloat(n.dataset.raw) : NaN, kind = layer !== 'labels' ? 0 : dots ? 2 : raw > 0 ? 1 : 0;
      const font = `${l.font[0]} ${l.font[1]} ${(px * dpr).toFixed(2)}px ${l.font[2]}`; if (!fontReady(font)) continue;
      const it = { text, font, px, halo: +(l.sw * dpr).toFixed(2), fill: l.fill, stroke: l.stroke, alpha: l.alpha, kind, raw: raw || 0, layer,
        x: +(n.attrs.get('x') || 0), y: +(n.attrs.get('y') || 0), dy: kind === 2 ? 0 : parseFloat(n.attrs.get('dy')) || 0 };
      it.pic = picOf(it, dpr); items.push(it);
    }
    // each picture once (however many labels show it), on shelves, page after page
    const [W, H] = PAGE, spot = new Map(); let x = 0, y = 0, row = 0, pages = 1;
    for (const { pic } of items) {
      if (spot.has(pic)) continue;
      const w = Math.min(pic.width, W), h = Math.min(pic.height, H);
      if (x + w > W) { x = 0; y += row; row = 0; }
      if (y + h > H) { x = 0; y = 0; row = 0; pages++; }
      spot.set(pic, [x, y, pages - 1]); x += w; row = Math.max(row, h);
    }
    // (a page goes up as a picture of its own, the browser's quick way from a canvas, and is copied into its layer on
    // the graphics card)
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, labelTex);
    gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, W, H, pages, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    sheet.canvas.width = W; sheet.canvas.height = H;
    gl.bindFramebuffer(gl.FRAMEBUFFER, pageFb);
    for (let p = 0; p < pages; p++) {
      sheet.clearRect(0, 0, W, H);
      for (const [pic, [u, v, q]] of spot) if (q === p) sheet.drawImage(pic, u, v);
      gl.bindTexture(gl.TEXTURE_2D, pageTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sheet.canvas);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pageTex, 0);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, labelTex); gl.copyTexSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, p, 0, 0, W, H);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const data = new Float32Array(items.length * 60); let o = 0;
    LRANGES = {};
    for (const it of items) {
      const [u, v, q] = spot.get(it.pic), w = it.pic.width, h = it.pic.height;
      const r = LRANGES[it.layer] ??= { from: o / 10, n: 0 };
      // the corners on the screen (px) at the size drawn; the picture's place in u, v and its page
      const hw = w / 2 / dpr, hh = h / 2 / dpr, u0 = u / W, v0 = v / H, u1 = (u + w) / W, v1 = (v + h) / H;
      for (const [dx, dy, uu, vv] of [[-hw, -hh, u0, v0], [hw, -hh, u1, v0], [-hw, hh, u0, v1], [-hw, hh, u0, v1], [hw, -hh, u1, v0], [hw, hh, u1, v1]]) { data.set([it.x, it.y, dx, dy + it.dy, uu, vv, q, it.kind, it.raw, it.px], o); o += 10; }
      r.n += 6;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, lbuf); gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, o), gl.DYNAMIC_DRAW);
  }

  /* ---------- drawing ---------- */
  // Where the view puts the map in the stage, as engine/map/view.js has it: its scale and the room left beside it.
  function view() {
    const W = stage.clientWidth, H = stage.clientHeight, v = want || { x: 0, y: 0, w: W || 1, h: H || 1 };
    const s = Math.min(W / v.w, H / v.h) || 1;
    return { W, H, s, v, ox: (W - v.w * s) / 2, oy: (H - v.h * s) / 2 };
  }
  function attrib(P, name, size, stride, offset) { const at = P.a(name); if (at < 0) return; gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, size, gl.FLOAT, false, stride, offset); }
  // the sketch's own picture, laid on as one (the size of the canvas)
  let layerFb = null, layerTex = null, layerSize = '';
  function layerTarget(cw, ch) {
    if (layerSize !== cw + 'x' + ch) {
      layerTex = layerTex || gl.createTexture(); layerFb = layerFb || gl.createFramebuffer();
      gl.bindTexture(gl.TEXTURE_2D, layerTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cw, ch, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.bindFramebuffer(gl.FRAMEBUFFER, layerFb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, layerTex, 0);
      layerSize = cw + 'x' + ch;
    }
    return layerFb;
  }
  function draw() {
    frame = 0;
    // (the map first: the labels in this frame, or in the next where this one builds blocks anew)
    if (update()) { if (labelsChanged) schedule(); }
    else if (labelsChanged) { labelsChanged = false; buildLabels(); }
    const { W, H, s, v, ox, oy } = view(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(W * dpr), ch = Math.round(H * dpr);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    canvas.classList.toggle('overlay', svg.classList.contains('overlay'));
    gl.viewport(0, 0, cw, ch); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const t = animated ? (performance.now() / 1000) % 2 : 0;
    const uniforms = P => { gl.uniform2f(P.u.u_org, v.x, v.y); gl.uniform2f(P.u.u_shift, ox, oy); gl.uniform2f(P.u.u_size, W, H); gl.uniform1f(P.u.u_s, s); gl.uniform1f(P.u.u_dot, dotNow || dotOf()); if (P.u.u_t) gl.uniform1f(P.u.u_t, t > 1 ? 2 - t : t); };
    const shapes = B => {
      if (!B.n) return;
      gl.useProgram(SHAPE.p); uniforms(SHAPE); gl.uniform1i(SHAPE.u.u_base, B.base);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, styleTex); gl.uniform1i(SHAPE.u.u_style, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, B.buf);
      attrib(SHAPE, 'a_pos', 2, 28, 0); attrib(SHAPE, 'a_off', 2, 28, 8); attrib(SHAPE, 'a_id', 1, 28, 16); attrib(SHAPE, 'a_kind', 1, 28, 20); attrib(SHAPE, 'a_len', 1, 28, 24);
      gl.drawArrays(gl.TRIANGLES, 0, B.n);
    };
    const labels = r => {
      if (!r || !r.n) return;
      gl.useProgram(LABEL.p); uniforms(LABEL);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D_ARRAY, labelTex); gl.uniform1i(LABEL.u.u_tex, 1);
      gl.bindBuffer(gl.ARRAY_BUFFER, lbuf);
      attrib(LABEL, 'a_pos', 2, 40, 0); attrib(LABEL, 'a_off', 2, 40, 8); attrib(LABEL, 'a_uv', 3, 40, 16); attrib(LABEL, 'a_size', 3, 40, 28);
      gl.drawArrays(gl.TRIANGLES, r.from, r.n);
    };
    for (const id of S.LAYERS) {
      const B = BLOCKS[id], alpha = id === 'sketch' && B.n ? layerAlpha('sketch') : 1;
      if (id !== 'sketch') shapes(B);
      else if (B.n && alpha > 0) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, layerTarget(cw, ch)); gl.clear(gl.COLOR_BUFFER_BIT);
        shapes(B);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(LAYER.p); gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, layerTex); gl.uniform1i(LAYER.u.u_tex, 2); gl.uniform1f(LAYER.u.u_alpha, alpha);
        gl.bindBuffer(gl.ARRAY_BUFFER, qbuf); attrib(LAYER, 'a_pos', 2, 8, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      if (TEXTS.includes(id)) labels(LRANGES[id]);
    }
    canvas.hidden = false;
    if (animated) schedule(); // (an animation is drawn frame by frame while it shows)
  }

  /* ---------- what changes the picture ---------- */
  // the map's own classes (its look), the stage's (the street map's colors), the page's theme: every look is read
  // again. Not what changes with every frame of a move (the dots' size --dot: drawn from u_dot) nor the class of a
  // move (grab).
  let mapState = '';
  const stateOf = () => [...svg.classList].filter(c => c !== 'grab').join(' ') + '|' + stage.className + '|' + document.documentElement.getAttribute('data-theme') + '|' + document.body.className;
  const restyle = () => { const now = stateOf(); if (now !== mapState) { mapState = now; LOOKS.clear(); for (const id of S.LAYERS) BLOCKS[id].all = true; labelsChanged = true; } schedule(); };
  for (const el of [svg, stage, document.body]) new MutationObserver(restyle).observe(el, { attributes: true, attributeFilter: ['class'] });
  new MutationObserver(restyle).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  mapState = stateOf();
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { mapState = ''; restyle(); });
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(stage);
  canvas.addEventListener('webglcontextlost', e => e.preventDefault());
  canvas.addEventListener('webglcontextrestored', () => location.reload());
  schedule();

  /* ---------- taps ---------- */
  // The shape a tap at map point p is on: the topmost one drawn that takes taps, whose fill holds the point (by
  // even-odd counting, as its rings are drawn), or a dot within its half width.
  function at(p) {
    update();
    const s = view().s, dot = dotNow || dotOf();
    for (let j = S.LAYERS.length - 1; j >= 0; j--) {
      const items = BLOCKS[S.LAYERS[j]].items;
      for (let i = items.length - 1; i >= 0; i--) {
        const { look: l, g, place, n } = items[i]; if (!l.events || !g.d) continue;
        const sh = tapOf(g, place);
        const pad = l.round ? ((l.wpx + l.wdot * dot) / s + l.wmap) / 2 : 0, b = sh.box;
        if (p.x < b[0] - pad || p.x > b[2] + pad || p.y < b[1] - pad || p.y > b[3] + pad) continue;
        if (l.hasFill) { let c = false; for (const part of sh.parts) if (part.p.length >= 6 && inRing(part.p, p.x, p.y)) c = !c; if (c) return n; }
        if (l.round && l.hasStroke) for (const part of sh.parts) if (zero(part.p) && Math.hypot(p.x - part.p[0], p.y - part.p[1]) <= pad) return n;
      }
    }
    return null;
  }

  return {
    canvas,
    view(v, dot) { want = { ...v }; if (dot) dotNow = dot; schedule(); },
    at,
    prepare(d, kinds) { if (d) for (const k of kinds) trianglesOf(d, k); },
  };
}
