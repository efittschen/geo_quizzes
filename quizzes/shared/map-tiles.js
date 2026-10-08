/* Map tiles redrawn in a drawn map's own projection, so that everything on the map (areas, dots, paint, insets,
   distances) stays where it is: the street map behind the map, and Street View coverage over it. For the quizzes
   whose map says how it is projected: city quizzes and town names (a country's cities.js), and the area quizzes with
   a projection in their data.js. The engines load this file when a player first asks for one of the two.

     const tiles = mapTiles(stage, map, ahead)   map: { proj, kpu } and, to find its insets, a cities.js's land, list
                                          and inset, or the map's areas: [{ d, lat, lng, x, y }]. null where the
                                          projection is not one this file knows (d3's conic equal area, Albers USA).
                                          ahead: how far beyond the stage's edges the pictures reach, in pixels
                                          (default 192; 0 for a map that never moves)
     tiles.view(x, y, k)        the map point at the stage's top left corner and the pixels per map unit; call it
                                whenever that changes. The pictures follow at once. While the map is dragged they are
                                drawn again as it goes, so its sides are there before the drag ends; after a zoom
                                they are drawn again when it rests.
     tiles.streets().show(on)   the street map, a canvas at the back of the stage (the standard OpenStreetMap tiles,
                                as on the street map of the other quizzes); its credit stands on the map meanwhile
     tiles.coverage(dir, meta).show(on)   Street View coverage (data/coverage and its meta.json, see the README), a
                                canvas over the map, blended into it
     tiles.insets               { box, land }: SVG paths of the insets' frames and of the land in them. An inset
                                (Alaska, the Azores) is not where the projection puts it, so no tiles fit it: it
                                stays drawn, and no coverage is laid on it. Frames: `inset` in cities.js (a path of
                                boxes) or, for Albers USA, d3's own; else the land around the cities that are off the
                                projection. Of an area map: the areas that are off the projection. */
function mapTiles(stage, C, AHEAD = 192) {
  if (!C.proj || !C.kpu || !/^(conicEqualArea|albersUsa|mercator)$/.test(C.proj.type)) return null;
  const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', RAD = Math.PI / 180;

  /* ---------- the map's projection (d3's geoConicEqualArea; of Albers USA its lower 48), as in city-config.js ---------- */
  const usa = C.proj.type === 'albersUsa', merc = C.proj.type === 'mercator';   // (a Mercator map, mercator.js: the tiles' own projection, so they lie under it unbent)
  const PR = usa ? { parallels: [29.5, 45.5], rotate: [96, 0], center: [-0.6, 38.7], scale: C.proj.scale, translate: C.proj.translate } : merc ? { parallels: [0, 0], rotate: [0, 0] } : C.proj;
  const sy0 = Math.sin(PR.parallels[0] * RAD), cn = (sy0 + Math.sin(PR.parallels[1] * RAD)) / 2, cc = 1 + sy0 * (2 * cn - sy0), r0 = Math.sqrt(cc) / cn;
  const raw = (l, f) => { const r = Math.sqrt(cc - 2 * cn * Math.sin(f)) / cn; return [r * Math.sin(l * cn), r0 - r * Math.cos(l * cn)]; };
  const CEN = PR.center || [0, 33.6442], [pcx, pcy] = raw(CEN[0] * RAD, CEN[1] * RAD);
  const my = lat => Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2)) / RAD;
  const forward = merc ? (lng, lat) => [((lng < C.proj.lng0 - 90 ? lng + 360 : lng) - C.proj.lng0) * C.proj.k, (C.proj.y0 - my(lat)) * C.proj.k]
    : (lng, lat) => { const [x, y] = raw(((lng + PR.rotate[0] + 540) % 360 - 180) * RAD, lat * RAD); return [PR.translate[0] + PR.scale * (x - pcx), PR.translate[1] - PR.scale * (y - pcy)]; };
  // [lat, lng] of a map point; lng runs on past 180 (Chukotka follows Siberia), null off the projection.
  const invert = merc ? (X, Y) => [(2 * Math.atan(Math.exp((C.proj.y0 - Y / C.proj.k) * RAD)) - Math.PI / 2) / RAD, C.proj.lng0 + X / C.proj.k] : (X, Y) => {
    const x = (X - PR.translate[0]) / PR.scale + pcx, y = (PR.translate[1] - Y) / PR.scale + pcy, ry = r0 - y;
    let l = Math.atan2(x, Math.abs(ry)) * Math.sign(ry);
    if (ry * cn < 0) l -= Math.PI * Math.sign(x) * Math.sign(ry);
    const s = (cc - (x * x + ry * ry) * cn * cn) / (2 * cn);
    return Math.abs(s) > 1 ? null : [Math.asin(s) / RAD, l / cn / RAD - PR.rotate[0]];
  };

  /* ---------- insets ---------- */
  const off = c => { const [x, y] = forward(c.lng, c.lat); return Math.hypot(x - c.x, y - c.y) > 2; };   // not where the projection puts it
  const nums = d => (d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number);
  const rings = (C.land || '').split('M').filter(Boolean).map(s => {
    const n = nums(s), pts = []; let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i + 1 < n.length; i += 2) { pts.push([n[i], n[i + 1]]); x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]); }
    return { d: 'M' + s, pts, box: [x0, y0, x1, y1] };
  }).filter(r => r.pts.length > 2);
  const inRing = (pts, x, y) => { let s = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) s = !s; } return s; };
  const inBox = (b, x, y, pad = 0) => x >= b[0] - pad && x <= b[2] + pad && y >= b[1] - pad && y <= b[3] + pad;
  const near = (a, b, gap) => a[0] <= b[2] + gap && b[0] <= a[2] + gap && a[1] <= b[3] + gap && b[1] <= a[3] + gap;
  const boxOf = list => list.reduce((u, r) => [Math.min(u[0], r.box[0]), Math.min(u[1], r.box[1]), Math.max(u[2], r.box[2]), Math.max(u[3], r.box[3])], [Infinity, Infinity, -Infinity, -Infinity]);
  let frames = [];   // [x0, y0, x1, y1] each
  if (usa) { const k = C.proj.scale, [tx, ty] = C.proj.translate; frames = [[tx - 0.425 * k, ty + 0.12 * k, tx - 0.214 * k, ty + 0.234 * k], [tx - 0.214 * k, ty + 0.166 * k, tx - 0.115 * k, ty + 0.234 * k]]; }
  else if (C.inset) frames = C.inset.split('M').filter(Boolean).map(s => { const n = nums(s.replace(/[HV]/g, ' ')), xs = [n[0], n[2]], ys = [n[1], n[3]]; return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; });
  let inset = [];
  if (frames.length) inset = rings.filter(r => frames.some(f => inBox(f, (r.box[0] + r.box[2]) / 2, (r.box[1] + r.box[3]) / 2)));
  else if (C.list) {
    // No frame on record: the land at the cities that are off the projection, with the islands within GAP of it.
    const GAP = 25;
    const away = C.list.filter(off), home = C.list.filter(c => !off(c));
    const main = new Set(rings.filter(r => home.some(c => inBox(r.box, c.x, c.y) && inRing(r.pts, c.x, c.y))));
    inset = rings.filter(r => !main.has(r) && away.some(c => inBox(r.box, c.x, c.y, 6)));
    for (let grown = true; grown;) { grown = false; for (const r of rings) if (!main.has(r) && !inset.includes(r) && inset.some(o => near(o.box, r.box, GAP))) { inset.push(r); grown = true; } }
    const left = new Set(inset);
    while (left.size) {   // one frame per group of them
      const group = [left.values().next().value]; left.delete(group[0]);
      for (let grown = true; grown;) { grown = false; for (const r of left) if (group.some(o => near(o.box, r.box, GAP))) { group.push(r); left.delete(r); grown = true; } }
      const b = boxOf(group); frames.push([b[0] - 5, b[1] - 5, b[2] + 5, b[3] + 5]);
    }
  }
  const insets = { box: frames.map(([x0, y0, x1, y1]) => `M${x0},${y0}H${x1}V${y1}H${x0}Z`).join(''), land: inset.map(r => r.d).join('') };
  const holes = new Path2D(insets.box + (C.areas || []).filter(off).map(a => a.d).join(''));   // where no tiles fit

  /* ---------- the pictures ---------- */
  const credits = stage.querySelector('.credits'), list = stage.querySelector('.note');
  const said = html => { const e = document.createElement('span'); e.innerHTML = html; e.hidden = true; if (list) list.append(e); return e; };   // a credit in the page's list
  let want = null;
  const layers = [];
  // A layer of tiles: { id, over (on top of the map, else at the back of the stage), size (of a tile, in pixels),
  // minZ, maxZ, url(z, x, y) -> its address or null where there is none, shown(on) }
  function layer(L) {
    const SIZE = L.size, MAX_Z = L.maxZ, cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    cv.id = L.id; cv.className = 'tiles'; cv.hidden = true;
    if (L.over) stage.querySelector('#map, #paint').after(cv); else stage.prepend(cv);
    const pics = new Map(), ROOM = Math.round(40e6 / SIZE / SIZE);   // address -> its picture, once it has come (null: it will not); kept: 40 megapixels
    const tile = (z, x, y) => {
      const n = 2 ** z, url = L.url(z, ((x % n) + n) % n, y);
      if (!url) return Promise.resolve(null);
      if (!pics.has(url)) {
        if (pics.size > ROOM) for (const k of [...pics.keys()].slice(0, ROOM >> 1)) pics.delete(k);
        pics.set(url, new Promise(done => { const img = new Image(); img.onload = () => done(img); img.onerror = () => done(null); img.src = url; }));
      }
      return pics.get(url);
    };
    let on = false, drawn = null, timer = 0, busy = false, stale = false, began = 0;
    // The picture as it is, moved and sized to the view asked for, until the new one is drawn.
    const place = () => { if (drawn && want) cv.style.transform = `translate(${(drawn.x - want.x) * want.k}px,${(drawn.y - want.y) * want.k}px) scale(${want.k / drawn.k})`; };
    // One picture is drawn at a time; a move meanwhile has the next one drawn as soon as this one is done.
    async function render() {
      if (busy) { stale = true; return; }
      if (!on || !want || !stage.clientWidth || !stage.clientHeight) return;
      busy = true; stale = false; began = performance.now();
      try { await draw(); } finally { busy = false; if (stale && on) soon(); }
    }
    const soon = () => { clearTimeout(timer); timer = setTimeout(render, !drawn ? 0 : want.k === drawn.k ? Math.max(0, 150 - (performance.now() - began)) : 140); };
    async function draw() {
      // The picture reaches AHEAD pixels beyond the stage on every side: v is the map point at its top left corner.
      const W = stage.clientWidth + 2 * AHEAD, H = stage.clientHeight + 2 * AHEAD, v = { x: want.x - AHEAD / want.k, y: want.y - AHEAD / want.k, k: want.k };
      const q = Math.min(window.devicePixelRatio || 1, 2), mid = invert(v.x + W / 2 / v.k, v.y + H / 2 / v.k) || [0, 0];
      // The zoom level whose tiles are about as fine as the screen: Web Mercator has 156.543 km to a pixel at level 0.
      const kpu = merc ? 111.32 * Math.cos(mid[0] * RAD) / C.proj.k : C.kpu;   // km to a map unit there
      let z = Math.max(L.minZ, Math.min(MAX_Z, Math.round(Math.log2(156.543 * Math.cos(mid[0] * RAD) * v.k * (q > 1.4 ? 2 : 1) / kpu * 256 / SIZE))));
      // A mesh over the stage: where each of its points lies on the tiles. Between them the tiles are laid on flat.
      const STEP = 48, nx = Math.ceil(W / STEP), ny = Math.ceil(H / STEP);
      let node, need;
      for (; ; z--) {
        const world = SIZE * 2 ** z; node = []; need = new Map();
        for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
          const ll = invert(v.x + i * STEP / v.k, v.y + j * STEP / v.k);
          node.push(ll && Math.abs(ll[0]) < 85 ? [(ll[1] + 180) / 360 * world, (0.5 - Math.log(Math.tan(Math.PI / 4 + ll[0] * RAD / 2)) / (2 * Math.PI)) * world] : null);
        }
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
          const c = [node[j * (nx + 1) + i], node[j * (nx + 1) + i + 1], node[(j + 1) * (nx + 1) + i], node[(j + 1) * (nx + 1) + i + 1]];
          if (c.some(p => !p)) continue;
          const u0 = Math.min(...c.map(p => p[0])), u1 = Math.max(...c.map(p => p[0])), v0 = Math.min(...c.map(p => p[1])), v1 = Math.max(...c.map(p => p[1]));
          if (u1 - u0 > 4 * SIZE || v1 - v0 > 4 * SIZE) continue;   // a fold of the projection
          for (let ty = Math.floor(v0 / SIZE); ty <= Math.floor(v1 / SIZE); ty++) for (let tx = Math.floor(u0 / SIZE); tx <= Math.floor(u1 / SIZE); tx++) if (ty >= 0 && ty < 2 ** z) need.set(tx + ',' + ty, [tx, ty]);
        }
        if (need.size * SIZE * SIZE <= 17e6 || z <= L.minZ) break;   // 260 street tiles at most, 16 of coverage
      }
      const got = new Map();
      await Promise.all([...need].map(([key, [tx, ty]]) => tile(z, tx, ty).then(img => got.set(key, img))));
      if (!on) return;
      const out = document.createElement('canvas'), o = out.getContext('2d');
      out.width = Math.round(W * q); out.height = Math.round(H * q);
      const tri = (a, b, c, A, B, D) => {   // the tiles' triangle a b c onto the stage's A B D
        const det = (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]); if (!det) return;
        const m = (p, r, s) => [((r - p) * (c[1] - a[1]) - (s - p) * (b[1] - a[1])) / det, ((s - p) * (b[0] - a[0]) - (r - p) * (c[0] - a[0])) / det];
        const [ma, mc] = m(A[0], B[0], D[0]), [mb, md] = m(A[1], B[1], D[1]), cx = (A[0] + B[0] + D[0]) / 3, cy = (A[1] + B[1] + D[1]) / 3;
        const wide = p => { const r = Math.hypot(p[0] - cx, p[1] - cy) || 1; return [p[0] + (p[0] - cx) / r * 2, p[1] + (p[1] - cy) / r * 2]; };   // a little over every edge: no seams
        o.save(); o.setTransform(q, 0, 0, q, 0, 0); o.beginPath(); o.moveTo(...wide(A)); o.lineTo(...wide(B)); o.lineTo(...wide(D)); o.closePath(); o.clip();
        o.transform(ma, mb, mc, md, A[0] - ma * a[0] - mc * a[1], A[1] - mb * a[0] - md * a[1]);
        for (let ty = Math.floor(Math.min(a[1], b[1], c[1]) / SIZE); ty <= Math.floor(Math.max(a[1], b[1], c[1]) / SIZE); ty++)
          for (let tx = Math.floor(Math.min(a[0], b[0], c[0]) / SIZE); tx <= Math.floor(Math.max(a[0], b[0], c[0]) / SIZE); tx++) { const img = got.get(tx + ',' + ty); if (img) o.drawImage(img, tx * SIZE, ty * SIZE, SIZE + 0.5, SIZE + 0.5); }
        o.restore();
      };
      // (tile coordinates from the mesh's first corner on: the numbers stay small)
      const base = node.find(Boolean) || [0, 0], bx = Math.floor(base[0] / SIZE) * SIZE, by = Math.floor(base[1] / SIZE) * SIZE, shifted = new Map();
      for (const [key, img] of got) { const [tx, ty] = need.get(key); shifted.set((tx - bx / SIZE) + ',' + (ty - by / SIZE), img); }
      got.clear(); for (const [k, img] of shifted) got.set(k, img);
      const at = (i, j) => { const p = node[j * (nx + 1) + i]; return p && [p[0] - bx, p[1] - by]; };
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1); if (!a || !b || !c || !d) continue;
        if (Math.max(a[0], b[0], c[0], d[0]) - Math.min(a[0], b[0], c[0], d[0]) > 4 * SIZE || Math.max(a[1], b[1], c[1], d[1]) - Math.min(a[1], b[1], c[1], d[1]) > 4 * SIZE) continue;
        const A = [i * STEP, j * STEP], B = [(i + 1) * STEP, j * STEP], Cc = [i * STEP, (j + 1) * STEP], D = [(i + 1) * STEP, (j + 1) * STEP];
        tri(a, b, c, A, B, Cc); tri(b, d, c, B, D, Cc);
      }
      if (L.over) { o.setTransform(q * v.k, 0, 0, q * v.k, -v.x * v.k * q, -v.y * v.k * q); o.globalCompositeOperation = 'destination-out'; o.fill(holes); }   // none on an inset
      cv.width = out.width; cv.height = out.height; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.drawImage(out, 0, 0);
      drawn = { ...v }; place();
    }
    const me = {
      show(yes) { on = yes; cv.hidden = !yes; L.shown(yes); if (yes) render(); },
      moved() { if (!on) return; place(); soon(); },
    };
    layers.push(me);
    return me;
  }
  let streets = null, coverage = null;
  return {
    insets,
    view(x, y, k) { want = { x, y, k }; for (const l of layers) l.moved(); },
    streets() {
      if (streets) return streets;
      const credit = said(' · Street map ' + OSM + ' contributors'), osm = credits && !credits.querySelector('.osm') ? document.createElement('span') : null;
      if (osm) { osm.className = 'osm'; osm.innerHTML = OSM; osm.hidden = true; credits.prepend(osm); }   // on the map itself, unless the page shows it anyway
      return streets = layer({ id: 'streets', size: 256, minZ: 1, maxZ: 19, url: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
        shown(yes) { credit.hidden = !yes; if (osm) osm.hidden = !yes; stage.classList.toggle('streets', yes); } });
    },
    coverage(dir, meta) {
      if (coverage) return coverage;
      const have = Object.fromEntries(Object.entries(meta.tiles).map(([z, l]) => [z, new Set(l)]));
      const credit = said(` · Coverage: <a href="https://github.com/slashP/Vali">Vali</a> location pool, ${new Date(meta.updated).toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })}`);
      return coverage = layer({ id: 'coverage', over: true, size: 1024, minZ: 0, maxZ: meta.zoom - 2, url: (z, x, y) => have[z] && have[z].has(x + '/' + y) ? `${dir}/${z}/${x}/${y}.png` : null,
        shown(yes) { credit.hidden = !yes; } });
    },
  };
}
