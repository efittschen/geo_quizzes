/* The bare map's tiles: OpenStreetMap's standard tiles with every administrative border taken out, and the names of
   states and countries (map-tiles.js asks for them for the Bare map). Roads, rivers, towns and their names stay.

   OpenStreetMap's style draws every border in one family of purples (#8d618b, #845283, #a37da1, and its state and
   country names in darker ones of the same hue), laid over the map with "darken" and an opacity of a half or more:
   a border's pixel is what lies under it blended toward a colour m·(1,1,1) + K (K = (14.3, −27, 12.7): as much
   redder and bluer as it is less green). So:
     seeds      a pixel more purple and darker than a neighbour (the end of a ray from it, where the purple shift
                has fallen as far as it goes) and exactly such a blend over it, which no grey blended over it explains
                as well (black text and its white halo, a railway through a forest), in a group of MINC or more
                (single pixels of that kind are the mixed edges of other things)
     under      a seed's colour unblended: its purple shift brought to its neighbour's, its lightness as near that as
                the family allows
     beside     from the seeds on, a pixel beside them taken out too where it is such a blend over what is around (a
                line's edge, the middle of a broad band; a river under the line: unblended as the style's own lines at
                their own strength, the zoom level saying which) or over a mix of what lies on its two sides (a border
                along a forest's edge); those taken out lead on, the others only GROW pixels on. What comes out is put
                to the nearest of the tile's own colours where it is near one
     leftover   then, a few times over, a pixel beside them still purple next to one of its 8 neighbours as they now
                are (lines lying on each other over water): that neighbour's colour
     labels     a group of pixels in the family's own colours (a line is that dark only where two lie on each other)
                whose halo is lighter than what is a little further out: the box around it, LABEL pixels on, painted
                over from around it
   What else is purple in the style is lighter (industrial land, power plants), redder (motorways, hospitals) or
   bluer (ferries, airports) than a blend toward the family can be, and stays.

   BARE(rgba, w, h, zoom) takes the borders out of an ImageData's pixels, in place (zoom: the tile's zoom level, which
   says which of the style's purples its lines are). The page asks for the tiles itself (map-tiles.js, BARE_TILES);
   as a worker (new Worker(…/bare-tiles.js)) this file is given their pixels, { id, pic: an ImageBitmap, z }, and
   answers { id, blob } (a PNG), or { id } for OpenStreetMap's "Access blocked" tile (BARE.blocked). Where a worker
   cannot draw (no OffscreenCanvas), the page loads it as a script and runs BARE itself. */
const BARE = (() => {
  const R = 9, MINC = 5, GROW = 3, LABEL = 4, SPILL = 4, AMIN = 0.1, PALETTE = 40, NEAR = 45;
  let pal = [];
  const KR = 14.3, KG = -27, KB = 12.7, FC = (KR + KB) / 2 - KG;   // the family: m(1,1,1) + K; FC, its purple shift
  const DX = [1, -1, 0, 0, 1, -1, 1, -1], DY = [0, 0, 1, -1, 1, -1, -1, 1];   // (opposite directions in pairs)
  let NB = 0, B = null;   // the buffers, for tiles of NB pixels
  const ends = new Int32Array(8), res8 = new Float64Array(8);
  // the result of fit(): how far toward the family, that colour's grey, what is left, what is left of greys, |p − n|
  let fa = 0, fm = 0, fres = 0, fgrey = 0, fe = 0;
  // p as a blend toward the family over n (p − n = x1 (1,1,1) + a (K − n)) and as greys blended over n
  // (p − n = y1 (1,1,1) − y2 n): false if it is not darker toward the family at all.
  function fit(pr, pg, pb, nr, ng, nb) {
    const er = pr - nr, eg = pg - ng, eb = pb - nb, b1 = er + eg + eb;
    const ur = KR - nr, ug = KG - ng, ub = KB - nb, s12 = ur + ug + ub, s22 = ur * ur + ug * ug + ub * ub, b2 = er * ur + eg * ug + eb * ub, det = 3 * s22 - s12 * s12;
    const t12 = -(nr + ng + nb), t22 = nr * nr + ng * ng + nb * nb, c2 = -(er * nr + eg * ng + eb * nb), dt = 3 * t22 - t12 * t12;
    if (det <= 0 || dt <= 0) return false;
    const x1 = (b1 * s22 - b2 * s12) / det, a = (3 * b2 - s12 * b1) / det;
    if (a <= 0) return false;
    const y1 = (b1 * t22 - c2 * t12) / dt, y2 = (3 * c2 - t12 * b1) / dt;
    let rr = er - x1 - a * ur, rg = eg - x1 - a * ug, rb = eb - x1 - a * ub;
    fa = a; fm = x1 / a; fres = Math.sqrt(rr * rr + rg * rg + rb * rb);
    rr = er - y1 + y2 * nr; rg = eg - y1 + y2 * ng; rb = eb - y1 + y2 * nb;
    fgrey = Math.sqrt(rr * rr + rg * rg + rb * rb); fe = Math.sqrt(er * er + eg * eg + eb * eb);
    return true;
  }

  // The style's lines as they lie over the map, [r, g, b, opacity], the likeliest first: below zoom level 10 a
  // border's broad line is #8d618b at a half, from 10 on #a37da1; the narrow line on it #845283 at 0.6; the two on
  // each other 0.8 of their mix.
  const P = [141, 97, 139], Wd = [163, 125, 161], Nw = [132, 82, 131], on = (A, B) => [0, 1, 2].map(c => (0.2 * A[c] + 0.6 * B[c]) / 0.8);
  const LOW = [[...P, 0.5], [...on(P, Nw), 0.8], [...Nw, 0.6]], HIGH = [[...Wd, 0.5], [...on(Wd, Nw), 0.8], [...Nw, 0.6], [...P, 0.5]];
  let lines = LOW;
  return function unborder(d, W, H, z) {
    lines = z >= 10 ? HIGH : LOW;
    const N = W * H;
    if (N !== NB) {
      NB = N;
      B = { f: new Float32Array(N), lum: new Float32Array(N), F: new Int16Array(N), L: new Int16Array(N), dirty: new Uint8Array(N),
        out: new Uint8ClampedArray(N * 4), ref: new Int32Array(N), kind: new Uint8Array(N), done: new Uint8Array(N), gap: new Uint8Array(N), comp: new Int32Array(N),
        core: new Int32Array(N), region: new Uint8Array(N), queue: new Int32Array(N), list: new Int32Array(N), now: new Float32Array(N * 4) };
    }
    const { f, lum, F, L, dirty, out, ref, kind, done, gap, comp, core, region, queue, list, now } = B;
    for (let i = 0, j = 0; i < N; i++, j += 4) {
      const r = d[j], g = d[j + 1], b = d[j + 2];
      F[i] = r + b - 2 * g; L[i] = r + g + b; f[i] = F[i] / 2; lum[i] = L[i] / 3;
    }
    out.set(d); ref.fill(-1); kind.fill(0); done.fill(0); gap.fill(255); comp.fill(-1);
    // The tile's own colours: those of pixels like the ones right of and below them (land, water, forest, a broad
    // road; not a border's), the PALETTE most common. What comes out from under a border is put to the nearest of
    // them when it is near one (NEAR), and kept where it is nearer still (a mixed edge).
    {
      const count = new Map();
      for (let y = 0; y < H - 1; y += 1) for (let x = (y & 1); x < W - 1; x += 2) {
        const i = y * W + x, j = i * 4, r = j + 4, b = j + W * 4;
        if (F[i] >= 50 || d[j] !== d[r] || d[j + 1] !== d[r + 1] || d[j + 2] !== d[r + 2] || d[j] !== d[b] || d[j + 1] !== d[b + 1] || d[j + 2] !== d[b + 2]) continue;
        const c = d[j] << 16 | d[j + 1] << 8 | d[j + 2]; count.set(c, (count.get(c) || 0) + 1);
      }
      pal = [...count].filter(e => e[1] >= 4).sort((a, b) => b[1] - a[1]).slice(0, PALETTE).map(e => e[0]);
    }

    // The ends of the 8 rays from a pixel: where its purple shift falls to the least before rising again, if that is
    // less purple and lighter than the pixel (else −1).
    function rays(i) {
      const x = i % W, y = (i - x) / W, fi = f[i];
      for (let q = 0; q < 8; q++) {
        const dx = DX[q], dy = DY[q];
        let low = fi, n = -1, at = 0;
        for (let r = 1; r <= R; r++) {
          const x2 = x + dx * r, y2 = y + dy * r; if (x2 < 0 || y2 < 0 || x2 >= W || y2 >= H) break;
          const k = y2 * W + x2, g = f[k];
          if (g > low + 0.5) break;
          if (g < low - 0.5) { low = g; n = k; at = r; } else if (n >= 0 && r - at >= 2 && low < fi - 2.5) break;
        }
        ends[q] = n >= 0 && fi - low >= 2.5 && lum[i] <= lum[n] - 1 ? n : -1;
      }
    }
    // A pixel measured against those ends: its reference is the one it is best explained by; a seed if that is close
    // and greys would not do as well.
    function measure(i) {
      done[i] = 1; rays(i);
      const j = i * 4, pr = d[j], pg = d[j + 1], pb = d[j + 2];
      let bestRes = Infinity, bestN = -1, anyRes = Infinity, anyN = -1;
      for (let q = 0; q < 8; q++) {
        const n = ends[q]; if (n < 0) continue;
        const nj = n * 4;
        if (!fit(pr, pg, pb, d[nj], d[nj + 1], d[nj + 2])) continue;
        if (fres < anyRes) { anyRes = fres; anyN = n; }
        if (fa < AMIN || fa > 0.92 || fm < 80 || fm > 165 || fres >= bestRes || fres > 3 + 0.05 * fe || fgrey < fres + Math.max(2, 12 * fa)) continue;
        bestRes = fres; bestN = n;
      }
      ref[i] = bestN >= 0 ? bestN : anyN;
      if (bestN >= 0) kind[i] = 1;
    }
    // A colour come out from under a border written to out: as it is near one of the tile's own colours, that colour
    // a little further off; false (nothing written) if it is far from all of them and strict.
    function put(j, r, g, b, strict) {
      let best = Infinity, c = -1;
      for (const v of pal) { const dr = r - (v >> 16), dg = g - (v >> 8 & 255), db = b - (v & 255), e = dr * dr + dg * dg + db * db; if (e < best) { best = e; c = v; } }
      if (best > NEAR * NEAR) { if (strict) return false; }
      else if (best > 100) { r = c >> 16; g = c >> 8 & 255; b = c & 255; }
      out[j] = r; out[j + 1] = g; out[j + 2] = b;
      return true;
    }
    // What lies under a pixel blended toward the family over n, unblended. strict (a pixel beside a seed, not one):
    // only if it was plainly blended toward the family, not explained better by a grey unless it is plainly purple
    // itself (a grey over the map's colours is not: a railway through a forest), and comes out like what is around.
    // Written to out; false if not.
    function under(i, n, strict) {
      const a = Math.min(0.92, (f[i] - f[n]) / (FC - f[n]));
      if (a <= 0) return false;
      const j = i * 4, nj = n * 4;
      if (strict && (a < 0.12 || f[i] - f[n] < 4 || f[i] < -2 || (f[i] < 6 && fit(d[j], d[j + 1], d[j + 2], d[nj], d[nj + 1], d[nj + 2]) && fgrey < fres - 2))) return false;
      // first the style's own lines at their own strength (the middle of a line over something else than n: water)
      if (strict && f[i] >= 6) for (const [cr, cg, cb, h] of lines) {
        const k = 1 / (1 - h), br = (d[j] - h * cr) * k, bg = (d[j + 1] - h * cg) * k, bb = (d[j + 2] - h * cb) * k, l = (br + bg + bb) / 3;
        if (Math.min(br, bg, bb) < -4 || Math.max(br, bg, bb) > 259 || (br + bb) / 2 - bg > f[n] + 4 || l < lum[n] - 70 || l <= lum[i]) continue;
        if (put(j, br, bg, bb, true)) return true;
      }
      let m = (lum[i] - (1 - a) * lum[n]) / a;
      if (strict && (m < 40 || m > 190)) return false;
      m = m < 100 ? 100 : m > 150 ? 150 : m;
      const k = 1 / (1 - a), br = (d[j] - a * (m + KR)) * k, bg = (d[j + 1] - a * (m + KG)) * k, bb = (d[j + 2] - a * (m + KB)) * k;
      if (strict && (Math.min(br, bg, bb) < -10 || Math.max(br, bg, bb) > 265 || (br + bg + bb) / 3 < lum[n] - 40)) return false;
      return put(j, br, bg, bb, strict);
    }
    // A pixel on the edge between two things: blended toward the family over a mix of the ends of two opposite rays,
    // p − n2 = μ (n1 − n2) + a (K − n2) + x1 (1,1,1) (Cramer's rule), unless a grey over such a mix would do too (a
    // railway along a forest's edge); what is under it, λ n1 + (1 − λ) n2. (fresh: the ends are its own already)
    function between(i, fresh) {
      if (!fresh) rays(i);   // (ends untouched since: under() does not walk)
      const j = i * 4, er = d[j], eg = d[j + 1], eb = d[j + 2];
      let best = 0, br = 0, bg = 0, bb = 0;
      for (let q = 0; q < 8; q += 2) {
        const n1 = ends[q], n2 = ends[q + 1]; if (n1 < 0 || n2 < 0) continue;
        const u = n1 * 4, v = n2 * 4;
        const ar = d[u] - d[v], ag = d[u + 1] - d[v + 1], ab = d[u + 2] - d[v + 2];
        const cr = KR - d[v], cg = KG - d[v + 1], cb = KB - d[v + 2];
        const pr = er - d[v], pg = eg - d[v + 1], pb = eb - d[v + 2];
        const det = ar * (cg - cb) - cr * (ag - ab) + (ag * cb - ab * cg);
        const scale = Math.sqrt((ar * ar + ag * ag + ab * ab) * (cr * cr + cg * cg + cb * cb) * 3);
        if (!scale || Math.abs(det) < 0.05 * scale || Math.abs(det) / scale <= best) continue;
        const mu = (pr * (cg - cb) - cr * (pg - pb) + (pg * cb - pb * cg)) / det;
        const a = (ar * (pg - pb) - pr * (ag - ab) + (ag * pb - ab * pg)) / det;
        if (a < 0.15 || a > 0.9 || mu < -0.02 || mu > 1 - a + 0.02) continue;
        const m = (ar * (cg * pb - cb * pg) - cr * (ag * pb - ab * pg) + pr * (ag * cb - ab * cg)) / det / a;
        if (m < 80 || m > 165) continue;
        const gr = -d[v], gg = -d[v + 1], gb = -d[v + 2], dg = ar * (gg - gb) - gr * (ag - ab) + (ag * gb - ab * gg);
        if (dg) {
          const mu2 = (pr * (gg - gb) - gr * (pg - pb) + (pg * gb - pb * gg)) / dg, t = (ar * (pg - pb) - pr * (ag - ab) + (ag * pb - ab * pg)) / dg;
          const g2 = (ar * (gg * pb - gb * pg) - gr * (ag * pb - ab * pg) + pr * (ag * gb - ab * gg)) / dg / t;
          if (t > 0.03 && t <= 1 && mu2 > -0.03 && mu2 < 1 - t + 0.03 && g2 > -5 && g2 < 260) continue;
        }
        const l = Math.max(0, Math.min(1, mu / (1 - a)));
        best = Math.abs(det) / scale; br = l * d[u] + (1 - l) * d[v]; bg = l * d[u + 1] + (1 - l) * d[v + 1]; bb = l * d[u + 2] + (1 - l) * d[v + 2];
      }
      return best ? put(j, br, bg, bb, true) : false;
    }

    /* ---------- seeds: a pixel more purple and darker than something within 2 pixels of it ---------- */
    // (a pixel like the one before it, which had nothing of the kind near it, need only look at the column the
    // square around it adds)
    let nl = 0;
    for (let y = 0; y < H; y++) {
      const ya = y > 1 ? y - 2 : 0, yb = y < H - 2 ? y + 2 : H - 1;
      let had = true;
      for (let x = 0; x < W; x++) {
        const i = y * W + x, Fi = F[i] - 5, Li = L[i] + 3;
        let hit = false;
        if (!had && F[i] === F[i - 1] && L[i] === L[i - 1]) {
          if (x < W - 2) for (let k = ya * W + x + 2; k <= yb * W + x + 2; k += W) if (F[k] <= Fi && L[k] >= Li) { hit = true; break; }
        } else {
          const xa = x > 1 ? x - 2 : 0, xb = x < W - 2 ? x + 2 : W - 1;
          for (let yy = ya; yy <= yb && !hit; yy++) for (let k = yy * W + xa, e = yy * W + xb; k <= e; k++) if (F[k] <= Fi && L[k] >= Li) { hit = true; break; }
        }
        if (hit) list[nl++] = i;
        had = hit;
      }
    }
    for (let h = 0; h < nl; h++) measure(list[h]);
    // in groups of MINC or more
    for (let s0 = 0; s0 < N; s0++) {
      if (kind[s0] !== 1 || comp[s0] >= 0) continue;
      let size = 0; queue[size++] = s0; comp[s0] = s0;   // (the group, in queue)
      for (let h = 0; h < size; h++) {
        const i = queue[h], x = i % W, y = (i - x) / W;
        for (let yy = Math.max(0, y - 2); yy <= Math.min(H - 1, y + 2); yy++) for (let k = yy * W + Math.max(0, x - 2), e = yy * W + Math.min(W - 1, x + 2); k <= e; k++) if (kind[k] === 1 && comp[k] < 0) { comp[k] = s0; queue[size++] = k; }
      }
      if (size < MINC) for (let h = 0; h < size; h++) kind[queue[h]] = 0;
    }

    /* ---------- the seeds, and beside them ---------- */
    let nq = 0;
    for (let i = 0; i < N; i++) if (kind[i] === 1) { under(i, ref[i], false); gap[i] = 0; queue[nq++] = i; }
    for (let h = 0; h < nq; h++) {
      const i = queue[h], x = i % W, y = (i - x) / W;
      for (let q = 0; q < 8; q++) {
        const x2 = x + DX[q], y2 = y + DY[q]; if (x2 < 0 || y2 < 0 || x2 >= W || y2 >= H) continue;
        const k = y2 * W + x2; if (gap[k] !== 255) continue;
        let took = false;
        // (what is plainly less purple than the pixel it is beside, and no more purple than its own neighbours, is
        // not looked at: the land beside a line)
        let low = f[k];
        if (f[k] < f[i] - 3) for (let r = 0; r < 8; r++) { const x3 = x2 + DX[r], y3 = y2 + DY[r]; if (x3 >= 0 && y3 >= 0 && x3 < W && y3 < H && f[y3 * W + x3] < low) low = f[y3 * W + x3]; }
        if (f[k] >= f[i] - 3 || f[k] - low >= 2.5) {
          if (!done[k]) measure(k); else rays(k);
          if (kind[k] === 1) took = under(k, ref[k], false);
          else {
            // against each end of its rays not taken out itself (on the line too: a river under it), the best
            // explained first
            const j = k * 4; let tried = 0;
            for (let q = 0; q < 8; q++) { const n = ends[q]; res8[q] = n >= 0 && !kind[n] && fit(d[j], d[j + 1], d[j + 2], d[n * 4], d[n * 4 + 1], d[n * 4 + 2]) ? fres : Infinity; }
            while (!took) {
              let n = -1; for (let q = 0; q < 8; q++) if (res8[q] < Infinity && !(tried & (1 << q)) && (n < 0 || res8[q] < res8[n])) n = q;
              if (n < 0) break;
              tried |= 1 << n; took = under(k, ends[n], true);
            }
            if (!took) took = f[k] > f[i] - 8 && between(k, true);
          }
        }
        if (took) { kind[k] = 2; gap[k] = 0; queue[nq++] = k; }
        else { kind[k] = 0; if (gap[i] < GROW) { gap[k] = gap[i] + 1; queue[nq++] = k; } }
      }
    }

    /* ---------- leftover ---------- */
    // (after the first step, only around what the last one changed)
    dirty.fill(1);
    for (let step = 0; step < 4; step++) {
      let nn = 0;
      for (let h = 0; h < nq; h++) {
        const k = queue[h]; if (gap[k] > 2 || !dirty[k]) continue;
        const x = k % W, y = (k - x) / W, j = k * 4, fk = (out[j] + out[j + 2]) / 2 - out[j + 1] - 1.5;
        let best = Infinity, bu = -1;
        for (let q = 0; q < 8; q++) {
          const x2 = x + DX[q], y2 = y + DY[q]; if (x2 < 0 || y2 < 0 || x2 >= W || y2 >= H) continue;
          const u = (y2 * W + x2) * 4; if ((out[u] + out[u + 2]) / 2 - out[u + 1] > fk) continue;
          if (fit(out[j], out[j + 1], out[j + 2], out[u], out[u + 1], out[u + 2]) && fa >= 0.05 && fm >= 60 && fm <= 190 && fres <= 3 + 0.1 * fe && fgrey >= fres + 1 && fres < best) { best = fres; bu = u; }
        }
        if (bu >= 0) { now[nn++] = j; now[nn++] = out[bu]; now[nn++] = out[bu + 1]; now[nn++] = out[bu + 2]; }
      }
      if (!nn) break;
      dirty.fill(0);
      for (let h = 0; h < nn; h += 4) {
        const j = now[h], k = j >> 2, x = k % W, y = (k - x) / W; out[j] = now[h + 1]; out[j + 1] = now[h + 2]; out[j + 2] = now[h + 3];
        for (let yy = Math.max(0, y - 1); yy <= Math.min(H - 1, y + 1); yy++) dirty.fill(1, yy * W + Math.max(0, x - 1), yy * W + Math.min(W - 1, x + 1) + 1);
      }
    }

    /* ---------- labels ---------- */
    const purple = k => { const j = k * 4; return F[k] >= 50 && Math.abs(d[j] - d[j + 2]) <= 10 && L[k] >= 210 && L[k] <= 504; };
    core.fill(-1); let labels = 0;
    for (let s0 = 0; s0 < N; s0++) {
      if (core[s0] !== -1) continue;
      if (!purple(s0)) { core[s0] = -2; continue; }
      const g = [s0]; core[s0] = s0;
      for (let h = 0; h < g.length; h++) {
        const i = g[h], x = i % W, y = (i - x) / W;
        for (let yy = Math.max(0, y - 2); yy <= Math.min(H - 1, y + 2); yy++) for (let k = yy * W + Math.max(0, x - 2), e = yy * W + Math.min(W - 1, x + 2); k <= e; k++) {
          if (core[k] !== -1) continue;
          if (!purple(k)) { core[k] = -2; continue; }
          core[k] = s0; g.push(k);
        }
      }
      if (g.length < 3) continue;
      // its halo: the pixels 1 and 2 out, lighter than the middle of those 4 to 6 out
      const near = [g], seen = new Set(g);
      for (let r = 1; r <= 6; r++) {
        const next = [];
        for (const i of near[r - 1]) { const x = i % W, y = (i - x) / W; for (let q = 0; q < 8; q++) { const x2 = x + DX[q], y2 = y + DY[q]; if (x2 < 0 || y2 < 0 || x2 >= W || y2 >= H) continue; const k = y2 * W + x2; if (!seen.has(k)) { seen.add(k); next.push(k); } } }
        near.push(next);
      }
      const ring = near[4].concat(near[5], near[6]), mid = v => v.sort((a, b) => a - b)[v.length >> 1];
      const med = mid(ring.map(k => L[k])), medF = mid(ring.map(k => F[k]));
      let lighter = 0; for (const k of near[1]) if (L[k] >= med + 9) lighter++; for (const k of near[2]) if (L[k] >= med + 9) lighter++;
      if (lighter < 0.3 * (near[1].length + near[2].length)) continue;
      // The label: in the box around its darkest letters (LABEL pixels on), and on from there up to SPILL pixels,
      // what is the label's (its letters: taken out, purple, or more purple than around; its halo: lighter than
      // around), and a pixel around that. The rest (a road under it) stays.
      let x0 = W, y0 = H, x1 = 0, y1 = 0;
      for (const i of g) { const x = i % W, y = (i - x) / W; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (!labels) region.fill(0);
      x0 = Math.max(0, x0 - LABEL); y0 = Math.max(0, y0 - LABEL); x1 = Math.min(W - 1, x1 + LABEL); y1 = Math.min(H - 1, y1 + LABEL);
      const its = k => kind[k] || purple(k) || L[k] >= med + 9 || F[k] >= medF + 8;
      let nn = 0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const k = y * W + x; if (!region[k] && its(k)) { region[k] = 1; list[nn++] = k; } }
      for (let step = 0, from = 0; step < SPILL && from < nn; step++) {
        const to = nn;
        for (let h = from; h < to; h++) { const i = list[h], x = i % W, y = (i - x) / W; for (let q = 0; q < 8; q++) { const x2 = x + DX[q], y2 = y + DY[q]; if (x2 < 0 || y2 < 0 || x2 >= W || y2 >= H) continue; const k = y2 * W + x2; if (!region[k] && its(k)) { region[k] = 1; list[nn++] = k; } } }
        from = to;
      }
      for (let h = 0, e = nn; h < e; h++) { const i = list[h], x = i % W, y = (i - x) / W; for (let q = 0; q < 8; q++) { const x2 = x + DX[q], y2 = y + DY[q]; if (x2 >= 0 && y2 >= 0 && x2 < W && y2 < H && !region[y2 * W + x2]) { region[y2 * W + x2] = 1; } } }
      labels++;
    }
    if (labels) {
      // painted over from outside in, a ring at a time: each pixel the mean of the pixels around it already done
      d.set(out);
      let nr = 0;
      for (let i = 0; i < N; i++) if (region[i]) { const x = i % W, y = (i - x) / W; for (let q = 0; q < 8; q++) { const x2 = x + DX[q], y2 = y + DY[q]; if (x2 >= 0 && y2 >= 0 && x2 < W && y2 < H && !region[y2 * W + x2]) { queue[nr++] = i; region[i] = 2; break; } } }
      while (nr) {
        for (let h = 0; h < nr; h++) {
          const i = queue[h], x = i % W, y = (i - x) / W, j = i * 4;
          let sr = 0, sg = 0, sb = 0, c = 0;
          for (let q = 0; q < 8; q++) { const x2 = x + DX[q], y2 = y + DY[q]; if (x2 < 0 || y2 < 0 || x2 >= W || y2 >= H) continue; const k = y2 * W + x2; if (region[k] && region[k] !== 3) continue; const u = k * 4; sr += d[u]; sg += d[u + 1]; sb += d[u + 2]; c++; }
          if (c) { now[h * 3] = sr / c; now[h * 3 + 1] = sg / c; now[h * 3 + 2] = sb / c; } else { now[h * 3] = d[j]; now[h * 3 + 1] = d[j + 1]; now[h * 3 + 2] = d[j + 2]; }
        }
        for (let h = 0; h < nr; h++) { const j = queue[h] * 4; d[j] = out[j] = now[h * 3]; d[j + 1] = out[j + 1] = now[h * 3 + 1]; d[j + 2] = out[j + 2] = now[h * 3 + 2]; region[queue[h]] = 3; }
        let nx = 0;
        for (let h = 0; h < nr; h++) { const i = queue[h], x = i % W, y = (i - x) / W; for (let q = 0; q < 8; q++) { const x2 = x + DX[q], y2 = y + DY[q]; if (x2 < 0 || y2 < 0 || x2 >= W || y2 >= H) continue; const k = y2 * W + x2; if (region[k] === 1) { region[k] = 2; list[nx++] = k; } } }
        for (let h = 0; h < nx; h++) queue[h] = list[h];
        nr = nx;
      }
    }
    d.set(out);
    return { seeds: nq, labels, kind };
  };
})();

// OpenStreetMap's "Access blocked" tile (a 256 × 256 picture with yellow and black stripes down its left edge, and the
// words), which it sends instead of a tile where it refuses one: not a map. BARE.blocked(rgba, w, h).
BARE.blocked = (d, W, H) => {
  let yellow = 0, black = 0, n = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < Math.min(16, W); x += 2) {
    const j = (y * W + x) * 4, r = d[j], g = d[j + 1], b = d[j + 2]; n++;
    if (r > 190 && g > 150 && b < 100 && r - b > 110) yellow++; else if (r < 70 && g < 70 && b < 70) black++;
  }
  return yellow > 0.12 * n && black > 0.12 * n;
};

// As a worker: the pixels of a tile the page has (it asks for the tiles itself, as pictures, as the street map does)
// taken out and given back as a PNG, { id, blob }; { id } where it is the blocked tile; { id, cannot: true } where
// this browser's workers cannot draw (the page does it then).
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  self.onmessage = async e => {
    const { id, pic, z } = e.data;
    try {
      const cv = new OffscreenCanvas(pic.width, pic.height), cx = cv.getContext('2d', { willReadFrequently: true });
      cx.drawImage(pic, 0, 0); if (pic.close) pic.close();
      const img = cx.getImageData(0, 0, cv.width, cv.height);
      if (BARE.blocked(img.data, cv.width, cv.height)) return self.postMessage({ id });
      BARE(img.data, cv.width, cv.height, z);
      cx.putImageData(img, 0, 0);
      self.postMessage({ id, blob: await cv.convertToBlob({ type: 'image/png' }) });
    } catch (err) { self.postMessage({ id, cannot: true }); }
  };
}
