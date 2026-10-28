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
     tiles.streets().show(on)   the street map, at the back of the stage (the standard OpenStreetMap tiles): a canvas
                                drawn from them, or on a Mercator map the tiles themselves (see sheets); its credit
                                stands on the map meanwhile. On a Mercator map, a player who named a Google Maps key
                                of their own (assets/js/gmaps.js), or ticked Google Maps (unofficial), gets Google's
                                tiles instead, laid as they come
     tiles.bare().show(on)      the bare map: the street map without any borders, nor the names of states and
                                countries (OpenStreetMap's tiles with them taken out, see BARE_TILES; Google's drawn
                                without them)
     tiles.sat().show(on)       the satellite map: Sentinel-2 photos from above (EOX's cloudless mosaic, see SAT), no
                                names, roads or borders on them; never Google's
     tiles.street(look)         shows the street map as it looks, 'street', 'bare' or 'sat', and hides the others
                                (null: all)
     tiles.coverage(dir, meta).show(on)   Street View coverage (data/coverage and its meta.json, see the README), a
                                canvas over the map, blended into it
     tiles.insets               { box, land }: SVG paths of the insets' frames and of the land in them. An inset
                                (Alaska, the Azores) is not where the projection puts it, so no tiles fit it: it
                                stays drawn, and no coverage is laid on it. Frames: `inset` in cities.js (a path of
                                boxes) or, for Albers USA, d3's own; else the land around the cities that are off the
                                projection. Of an area map: the areas that are off the projection. */
/* The bare map's pictures of OpenStreetMap's tiles: BARE_TILES(address) -> a promise of the address of the tile with
   its borders taken out (shared/bare-tiles.js), or of null where it did not come. Each tile is asked for as the
   street map asks for it, as a picture (with the page's address as its referrer: OpenStreetMap answers a request
   without one with its "Access blocked" tile), anonymously, so that it can be read (OpenStreetMap sends its tiles to
   any page: Access-Control-Allow-Origin: *), LOADING at a time, the newest asked for first (they are where the map
   is now). Its pixels are done in workers (WORKERS of them), or, where a worker cannot draw, on the page itself, one
   at a time. Each is kept for the rest of the visit as a picture of the page's own (an object URL, a PNG of some 30
   to 140 kB): the last KEEP asked for. One that did not come, or came as the blocked tile, is not kept, and not asked
   for again for AGAIN ms. */
const BARE_TILES = (() => {
  const HERE = document.currentScript.src.replace(/[^/]*$/, ''), KEEP = 200, LOADING = 8, AGAIN = 30000;
  const WORKERS = Math.max(1, Math.min(3, (navigator.hardwareConcurrency || 2) - 1));
  const kept = new Map(), failed = new Map(), waiting = [], asked = new Map(), ready = [];   // address -> promise, or when it failed; [{ url, done }], newest last; id -> job; loaded jobs
  let pool = null, ids = 0, loading = 0, onPage = null, paging = false;
  const zoomOf = url => +(url.match(/\/(\d+)\/\d+\/\d+\.png/) || [])[1];
  const fail = job => { failed.set(job.url, Date.now()); job.done(null); };
  // the pictures, newest first
  function load() {
    while (loading < LOADING && waiting.length) {
      const job = waiting.pop(), img = new Image(); loading++;
      img.crossOrigin = 'anonymous'; img.decoding = 'async';
      img.onload = () => { loading--; job.img = img; ready.push(job); work(); load(); };
      img.onerror = () => { loading--; fail(job); load(); };
      img.src = job.url;
    }
  }
  // their pixels, in a worker if one is free
  function work() {
    if (!pool) {
      pool = [];
      if (typeof Worker === 'function' && typeof OffscreenCanvas === 'function' && typeof createImageBitmap === 'function') for (let k = 0; k < WORKERS; k++) {
        try { const w = new Worker(HERE + 'bare-tiles.js'); w.n = 0; w.onmessage = answer; w.onerror = () => broke(w); pool.push(w); } catch (err) { break; }
      }
    }
    if (!pool.length) return page();
    for (const w of pool) while (w.n < 2 && ready.length) {
      const job = ready.pop(), id = ++ids; asked.set(id, { ...job, w }); w.n++;
      createImageBitmap(job.img).then(pic => w.postMessage({ id, pic, z: zoomOf(job.url) }, [pic]), () => { asked.delete(id); w.n--; fail(job); work(); });
    }
  }
  function answer(e) {
    const { id, blob, cannot } = e.data, job = asked.get(id); if (!job) return;
    if (cannot) return broke(job.w);   // (a worker that cannot draw: on the page instead)
    asked.delete(id); job.w.n--;
    if (blob) job.done(URL.createObjectURL(blob)); else fail(job);
    work();
  }
  // A worker that failed: what it was given goes back, to the others or to the page.
  function broke(w) {
    pool = pool.filter(o => o !== w); w.terminate();
    for (const [id, job] of asked) if (job.w === w) { asked.delete(id); ready.push({ url: job.url, done: job.done, img: job.img }); }
    work();
  }
  // On the page: bare-tiles.js loaded as a script (BARE), a tile at a time.
  async function page() {
    if (paging || !ready.length) return;
    paging = true;
    await (onPage ||= new Promise(ok => { if (typeof BARE === 'function') return ok(); const s = document.createElement('script'); s.src = HERE + 'bare-tiles.js'; s.onload = s.onerror = ok; document.head.append(s); }));
    const job = ready.pop(), img = job.img;
    const src = await new Promise(done => {
      try {
        const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
        const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
        const px = cx.getImageData(0, 0, cv.width, cv.height);
        if (BARE.blocked(px.data, cv.width, cv.height)) return done(null);
        BARE(px.data, cv.width, cv.height, zoomOf(job.url)); cx.putImageData(px, 0, 0);
        cv.toBlob(b => done(b ? URL.createObjectURL(b) : null), 'image/png');
      } catch (err) { done(null); }
    });
    if (src) job.done(src); else fail(job);
    paging = false; setTimeout(page, 0);
  }
  return url => {
    let p = kept.get(url);
    if (p) { kept.delete(url); kept.set(url, p); return p; }   // (the last asked for, last)
    if (Date.now() - (failed.get(url) || -Infinity) < AGAIN) return Promise.resolve(null);
    p = new Promise(done => waiting.push({ url, done }));
    kept.set(url, p);
    p.then(src => { if (!src && kept.get(url) === p) kept.delete(url); });
    for (const [u, q] of kept) { if (kept.size <= KEEP) break; kept.delete(u); q.then(src => src && URL.revokeObjectURL(src)); }
    load();
    return p;
  };
})();
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
  // minZ, maxZ, url(z, x, y) -> its address or null where there is none, pic(address) -> a promise of the address of
  // the picture to show for it, or of null (optional: else the tile itself), shown(on) }
  function layer(L) {
    if (merc) return sheets(L);
    const SIZE = L.size, MAX_Z = L.maxZ, cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    cv.id = L.id; cv.className = 'tiles'; cv.hidden = true;
    if (L.over) stage.querySelector('#map, #paint').after(cv); else stage.prepend(cv);
    const pics = new Map(), ROOM = Math.round(40e6 / SIZE / SIZE);   // address -> its picture, once it has come (null: it will not); kept: 40 megapixels
    const tile = (z, x, y) => {
      const n = 2 ** z, url = L.url(z, ((x % n) + n) % n, y);
      if (!url) return Promise.resolve(null);
      if (!pics.has(url)) {
        if (pics.size > ROOM) for (const k of [...pics.keys()].slice(0, ROOM >> 1)) pics.delete(k);
        pics.set(url, new Promise(done => {
          const img = new Image(); img.onload = () => done(img); img.onerror = () => done(null);
          if (L.pic) L.pic(url).then(src => { if (src) img.src = src; else { pics.delete(url); done(null); } }); else img.src = url;
        }));
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
      reset() { pics.clear(); if (on) soon(); },   // the addresses changed: every tile is asked for again
    };
    layers.push(me);
    return me;
  }
  /* A Mercator map is in the tiles' own projection, so its tiles lie on it as they are: each is a picture of its own,
     placed once on a sheet that holds one zoom level's tiles, and a move or a zoom only moves and sizes the sheet (as
     the street map's own library does it). Nothing is drawn again: the browser moves pictures it has. A sheet of
     another zoom level is laid over the last one, which goes once the new one's tiles are there; while the map is being
     zoomed through levels, only once it has stayed at one for SETTLE ms. Tiles are looked for while the map moves
     (every FILL ms), AHEAD pixels beyond the stage. (A tile's pixel is 1/k · 360 / (SIZE · 2^z)
     map units; zoom level: the one whose tiles are as fine as the screen's pixels, as on the street map.) */
  function sheets(L) {
    const SIZE = L.size, FILL = 100, SETTLE = 250, { k: kp, lng0, y0 } = C.proj, box = document.createElement('div');
    box.id = L.id; box.className = 'tiles'; box.hidden = true;
    if (L.over) stage.querySelector('#map, #paint').after(box); else stage.prepend(box);
    let on = false, sheet = null, old = null, timer = 0, filled = 0;
    // A sheet of zoom level z: unit, map units to a tile pixel; B, its own pixels to a map unit (a tile is a whole
    // px of them); [mx, my], the map point at its corner; its tiles by 'column,row' (null: none there).
    function make(z) {
      const n = 2 ** z, unit = kp * 360 / (SIZE * n), px = Math.max(1, Math.round(SIZE * unit * want.k)), el = document.createElement('div');
      el.className = 'sheet'; box.append(el);
      return { z, n, unit, px, B: px / (SIZE * unit), mx: want.x, my: want.y, el, tiles: new Map(), wait: 0, cx: (lng0 + 180) / 360 * SIZE * n, cy: (180 - y0) / 360 * SIZE * n };
    }
    const place = s => { s.el.style.transform = `translate(${(s.mx - want.x) * want.k}px,${(s.my - want.y) * want.k}px) scale(${want.k / s.B})`; };
    const level = () => Math.max(L.minZ, Math.min(L.maxZ, Math.round(Math.log2(want.k * kp * 360 / SIZE))));
    function fill() {
      clearTimeout(timer); timer = 0; filled = performance.now();
      if (!on || !want || !stage.clientWidth || !stage.clientHeight) return;
      const z = level();
      if (!sheet || sheet.z !== z) { if (old) old.el.remove(); old = sheet; sheet = make(z); }
      const s = sheet, a = AHEAD / want.k, W = stage.clientWidth / want.k, H = stage.clientHeight / want.k;
      const col = x => Math.floor((s.cx + x / s.unit) / SIZE), row = y => Math.floor((s.cy + y / s.unit) / SIZE);
      const c0 = col(want.x - a), c1 = col(want.x + W + a), r0 = Math.max(0, row(want.y - a)), r1 = Math.min(s.n - 1, row(want.y + H + a));
      for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
        const key = c + ',' + r; if (s.tiles.has(key)) continue;
        const url = L.url(s.z, ((c % s.n) + s.n) % s.n, r);
        if (!url) { s.tiles.set(key, null); continue; }
        const img = new Image(); img.decoding = 'async'; img.alt = ''; img.draggable = false;
        // (a whole pixel of the sheet apart, one more wide: no seams)
        img.style.left = Math.round(((c * SIZE - s.cx) * s.unit - s.mx) * s.B) + 'px'; img.style.top = Math.round(((r * SIZE - s.cy) * s.unit - s.my) * s.B) + 'px';
        img.style.width = img.style.height = s.px + 1 + 'px';
        s.wait++;
        img.onload = img.onerror = () => { img.onload = img.onerror = null; if (!img.naturalWidth) { img.remove(); if (L.failed) L.failed(url); } if (!--s.wait && s === sheet && old) { old.el.remove(); old = null; } };
        if (L.pic) L.pic(url).then(src => { if (src) img.src = src; else { if (s.tiles.get(key) === img) s.tiles.delete(key); if (img.onerror) img.onerror(); } }); else img.src = url;
        s.el.append(img); s.tiles.set(key, img);
      }
      // the tiles more than a stage away go (the browser keeps the pictures for a while: coming back loads none)
      for (const [key, img] of s.tiles) { const [c, r] = key.split(',').map(Number); if (c < c0 - (c1 - c0) || c > c1 + (c1 - c0) || r < r0 - (r1 - r0) || r > r1 + (r1 - r0)) { if (img) img.remove(); s.tiles.delete(key); } }
      place(s); if (old) place(old);
    }
    const me = {
      show(yes) { on = yes; box.hidden = !yes; L.shown(yes); if (yes) fill(); },
      reset() { if (sheet) sheet.el.remove(); if (old) old.el.remove(); sheet = old = null; if (on) fill(); },   // the addresses changed
      moved() {
        if (!on || !want) return;
        if (sheet) place(sheet); if (old) place(old);
        if (sheet && level() !== sheet.z) { clearTimeout(timer); timer = setTimeout(fill, SETTLE); } // (waits while the zoom goes on)
        else if (!timer) timer = setTimeout(fill, Math.max(0, FILL - (performance.now() - filled)));
      },
    };
    layers.push(me);
    return me;
  }
  // The street map as it looks: 'street' (its tiles as they are), 'bare' (with the borders taken out) or 'sat' (the
  // satellite map); and for each, whether it is shown and, with Google's tiles, what asks Google for the credit of the
  // tiles in view.
  const looks = {}, shown = {}, owed = {};
  let credit = null, osm = null, coverage = null;
  const backed = () => { stage.classList.toggle('streets', !!(shown.street || shown.bare || shown.sat)); stage.classList.toggle('sat', !!shown.sat); };
  // The satellite map: EOX's cloudless mosaic of the Sentinel-2 photos of 2025 (as MapTap's photos, Sentinel-2's), up
  // to zoom level 8 as MapTap has them for free, enlarged closer in. Free with this credit, not for commercial use.
  const SAT = (z, x, y) => `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2025_3857/default/g/${z}/${y}/${x}.jpg`;
  const EOX = '<a href="https://cloudless.eox.at">EOxCloudless</a> by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2025)';
  function satellite() {
    const note = said(' · Satellite ' + EOX + ', <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>');
    const own = credits ? document.createElement('span') : null;
    if (own) { own.className = 'sat'; own.innerHTML = '&copy; <a href="https://cloudless.eox.at">EOX</a> · Copernicus Sentinel data 2025'; own.hidden = true; credits.prepend(own); }
    return layer({ id: 'sat', size: 256, minZ: 1, maxZ: 8, url: SAT,
      shown(yes) { shown.sat = yes; note.hidden = !yes; if (own) own.hidden = !yes; backed(); } });
  }
  function street(look) {
    if (looks[look]) return looks[look];
    if (look === 'sat') return looks.sat = satellite();
    // one credit for both: in the page's list, and on the map itself unless the page shows it anyway
    if (!credit) {
      credit = said(' · Street map ' + OSM + ' contributors'); osm = credits && !credits.querySelector('.osm') ? document.createElement('span') : null;
      if (osm) { osm.className = 'osm'; osm.innerHTML = OSM; osm.hidden = true; credits.prepend(osm); }
    }
    let text = OSM + ' contributors';
    const credited = html => { text = html; if (shown[look]) { credit.innerHTML = ' · Street map ' + html; if (osm) osm.innerHTML = html; } };
    const FROM_OSM = (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    // Google's map, for a player with a key of their own (gmaps.js), on a Mercator map only: there its tiles lie
    // as they come, not redrawn. Until its session answers there are no tiles; without an answer, or after a few
    // tiles refused (the key's quota used up, the key restricted), OpenStreetMap's are asked for instead. The bare
    // map's session has Google draw it without borders; OpenStreetMap's tiles have them taken out (BARE_TILES). The
    // same with Google's public tile address (the box "Google Maps (unofficial)" ticked, see gmaps.js): without a key,
    // or once the key's session or tiles are refused; only when those fail too does OpenStreetMap's map come.
    let from = FROM_OSM, google = null, refused = 0, me = null;
    // Google's tiles (by the key or the public address): their credit, and the one Google asks for those in view.
    const use = g => {
      google = g; refused = 0; from = (z, x, y) => g.url.replace('{z}', z).replace('{x}', x).replace('{y}', y).replace('{s}', (x + y) % 4);
      credited('&copy; Google'); owed[look] = null; me.reset();
      if (!g.copyright) return;   // (Google's public tile address, unofficial: no credit asked for beyond its name)
      // The copyright Google asks to be shown for the tiles in view, once the map rests.
      let timer = 0;
      owed[look] = () => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          if (!want || google !== g) return;
          const a = invert(want.x, want.y), b = invert(want.x + stage.clientWidth / want.k, want.y + stage.clientHeight / want.k);
          if (!a || !b) return;
          const z = Math.max(0, Math.min(19, Math.round(Math.log2(want.k * C.proj.k * 360 / 256))));
          const text = await g.copyright({ north: a[0], south: b[0], east: b[1], west: a[1] }, z);
          if (text && google === g) credited(text.replace(/[<>&]/g, ''));
        }, 1200);
      };
      if (shown[look]) owed[look]();
    };
    // Tiles refused: the key's give way to the public address's where the box is ticked; those, to OpenStreetMap's.
    const back = fault => {
      const pub = !!(google && google.unofficial), next = pub ? null : GMAPS.fallback(look === 'bare');
      GMAPS.failed(fault, pub); google = null; owed[look] = null;
      if (next) { use(next); return; }
      from = FROM_OSM; credited(OSM + ' contributors'); me.reset();
    };
    if (merc && typeof GMAPS === 'object' && (GMAPS.key() || GMAPS.unofficial())) {
      from = () => null;
      GMAPS.tiles(look === 'bare').then(g => { if (g) use(g); else { from = FROM_OSM; me.reset(); } });
    }
    return looks[look] = me = layer({ id: look === 'bare' ? 'bare' : 'streets', size: 256, minZ: 1, maxZ: 19, url: (z, x, y) => from(z, x, y),
      pic: look === 'bare' ? url => (url.startsWith('https://tile.openstreetmap.org/') ? BARE_TILES(url) : Promise.resolve(url)) : null,
      // (only tiles of the source in use count: those still on their way from the one before may fail after it is left)
      failed(url) { if (google && String(url).startsWith(google.url.slice(0, google.url.indexOf('{'))) && ++refused >= 3) back('Tiles refused'); },
      shown(yes) {
        shown[look] = yes;
        if (yes) credited(text);
        const any = shown.street || shown.bare;
        credit.hidden = !any; if (osm) osm.hidden = !any; backed();
        if (yes && owed[look]) owed[look]();
      } });
  }
  return {
    insets,
    view(x, y, k) { want = { x, y, k }; for (const l of layers) l.moved(); for (const l in owed) if (owed[l] && shown[l]) owed[l](); },
    streets: () => street('street'),
    bare: () => street('bare'),
    sat: () => street('sat'),
    // The street map shown as it looks ('street', 'bare' or 'sat'), the others hidden; null: none.
    street(look) { for (const l of ['street', 'bare', 'sat']) if (l !== look && looks[l]) looks[l].show(false); if (look) street(look).show(true); },
    coverage(dir, meta) {
      if (coverage) return coverage;
      const have = Object.fromEntries(Object.entries(meta.tiles).map(([z, l]) => [z, new Set(l)]));
      const credit = said(` · Coverage: <a href="https://github.com/slashP/Vali">Vali</a> location pool, ${new Date(meta.updated).toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })}`);
      return coverage = layer({ id: 'coverage', over: true, size: 1024, minZ: 0, maxZ: meta.zoom - 2, url: (z, x, y) => have[z] && have[z].has(x + '/' + y) ? `${dir}/${z}/${x}/${y}.png` : null,
        shown(yes) { credit.hidden = !yes; } });
    },
  };
}
