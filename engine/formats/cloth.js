// A flag as cloth (the picture format's Waving and Hanging), by the model of three.js's former cloth example: a grid of
// points, each held to its neighbours (across, down and both diagonals) and, weakly, to the next but one (against
// bending), the edge at the pole pinned along it; let go under gravity, in a gusting wind or none, and stepped by Verlet
// integration until it has settled (hanging) or for a while (waving), kept out of the pole. Then seen from a little
// below, at an angle around the pole, lit by the sun and the sky, and drawn as triangles of the flag picture, the far
// ones first, in front of a sky and its pole; its light and shade softened and laid over it.
//
//   clothPicture(src, look, W, H) -> Promise of the picture's address (a JPEG), drawn in a worker where the browser
//                                    can draw there (OffscreenCanvas), else on the page

// The picture to cut the cloth from: drawn whole on a canvas first (Firefox cuts an SVG's parts wrongly), an SVG at the
// size of its viewBox (it has no other), a photo of a flag without the even margin around it (a letterbox).
const sources = new Map();
function source(src) {
  if (!sources.has(src)) sources.set(src, (async () => {
    const svg = /\.svg(\?|$)/.test(src);
    let url = src;
    if (svg) {
      const text = await (await fetch(src)).text(), vb = text.match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
      const sized = /<svg[^>]*\swidth=/.test(text) || !vb ? text : text.replace('<svg', `<svg width="${vb[1]}" height="${vb[2]}"`);
      url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
    }
    const img = new Image(); img.src = url; await img.decode();
    const cv = document.createElement('canvas');
    cv.width = img.naturalWidth || 640; cv.height = img.naturalHeight || 480;
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    return svg ? cv : untrimmed(cv);
  })());
  return sources.get(src);
}
// without a margin of one even colour all around it, where it has one (a flag drawn into a larger frame)
function untrimmed(cv) {
  const w = cv.width, h = cv.height, px = cv.getContext('2d').getImageData(0, 0, w, h).data;
  const same = (x, y) => { const i = (y * w + x) * 4; return Math.abs(px[i] - px[0]) + Math.abs(px[i + 1] - px[1]) + Math.abs(px[i + 2] - px[2]) < 30; };
  const row = y => { for (let x = 0; x < w; x++) if (!same(x, y)) return false; return true; };
  const col = x => { for (let y = 0; y < h; y++) if (!same(x, y)) return false; return true; };
  if (!(row(0) && row(h - 1) && col(0) && col(w - 1))) return cv;
  let top = 0, bottom = h - 1, left = 0, right = w - 1;
  while (top < h / 3 && row(top)) top++;
  while (bottom > h * 2 / 3 && row(bottom)) bottom--;
  while (left < w / 3 && col(left)) left++;
  while (right > w * 2 / 3 && col(right)) right--;
  const out = document.createElement('canvas');
  out.width = right - left + 1; out.height = bottom - top + 1;
  out.getContext('2d').drawImage(cv, left, top, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

// The cloth, self-contained (it runs in a worker as it is): pic the flag (canvas or bitmap), W × H the picture (small:
// a tile of pairs), canvas(w, h) a new canvas.
function cloth(pic, look, W, H, canvas) {
  const rnd = Math.random, small = W < 400, cols = small ? 16 : 22, rows = Math.max(small ? 6 : 8, Math.round(cols * pic.height / pic.width)), n = cols * rows;
  const at = (i, j) => j * cols + i, pos = new Float64Array(n * 3), prev = new Float64Array(n * 3), fixed = new Uint8Array(n);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const k = at(i, j) * 3;
    pos[k] = i; pos[k + 1] = -j; pos[k + 2] = (rnd() - .5) * .01;
    if (i === 0) fixed[at(i, j)] = 1;
  }
  prev.set(pos);
  // the links: two points, their length at rest, how stiff
  const la = [], lb = [], rest = [], stiff = [];
  const link = (a, b, k) => { la.push(a); lb.push(b); stiff.push(k); rest.push(Math.hypot(pos[a * 3] - pos[b * 3], pos[a * 3 + 1] - pos[b * 3 + 1], pos[a * 3 + 2] - pos[b * 3 + 2])); };
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    if (i + 1 < cols) link(at(i, j), at(i + 1, j), 1);
    if (j + 1 < rows) link(at(i, j), at(i, j + 1), 1);
    if (i + 1 < cols && j + 1 < rows) { link(at(i, j), at(i + 1, j + 1), 1); link(at(i + 1, j), at(i, j + 1), 1); }
    if (i + 2 < cols) link(at(i, j), at(i + 2, j), .15);
    if (j + 2 < rows) link(at(i, j), at(i, j + 2), .15);
  }
  const waving = look === 'waving', wind = waving ? 80 + rnd() * 60 : 0, steps = waving ? 220 : 260, dt = .016;
  const gravity = -9.8 * (waving ? 6 : 12), damping = waving ? .985 : .965, pole = .25, phase = rnd() * 100;
  for (let s = 0; s < steps; s++) {
    const t = s * dt + phase;
    for (let p = 0; p < n; p++) {
      if (fixed[p]) continue;
      const i = p % cols, j = (p / cols) | 0, k = p * 3;
      let fx = 0, fz = 0;
      if (wind) { const w = wind * (.75 + .25 * Math.sin(t * 1.3 + i * .25) + .15 * Math.sin(t * 3.1 + j * .4)); fx = w; fz = w * .35 * Math.sin(t * 2 + i * .5 + j * .3); }
      const force = [fx, gravity, fz];
      for (let c = 0; c < 3; c++) { const x = pos[k + c], v = (x - prev[k + c]) * damping; prev[k + c] = x; pos[k + c] = x + v + force[c] * dt * dt; }
    }
    for (let pass = 0; pass < 4; pass++) {
      for (let l = 0; l < la.length; l++) {
        const a = la[l] * 3, b = lb[l] * 3, dx = pos[b] - pos[a], dy = pos[b + 1] - pos[a + 1], dz = pos[b + 2] - pos[a + 2];
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6, f = (len - rest[l]) / len * .5 * stiff[l];
        if (!fixed[la[l]]) { pos[a] += dx * f; pos[a + 1] += dy * f; pos[a + 2] += dz * f; }
        if (!fixed[lb[l]]) { pos[b] -= dx * f; pos[b + 1] -= dy * f; pos[b + 2] -= dz * f; }
      }
      // (out of the pole)
      for (let p = 0; p < n; p++) {
        if (fixed[p]) continue;
        const k = p * 3, r = Math.hypot(pos[k], pos[k + 2]);
        if (r < pole) { const m = pole / (r || 1e-6); pos[k] *= m; pos[k + 2] *= m; }
      }
    }
  }
  // seen from a little below, at an angle around the pole
  const yaw = (rnd() - .5) * 1.6, pitch = .12 + rnd() * .15, sun = [.45, .65, .6];
  const seen = (x, y, z) => {
    const x1 = x * Math.cos(yaw) - z * Math.sin(yaw), z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
    return [x1, y * Math.cos(pitch) - z1 * Math.sin(pitch), y * Math.sin(pitch) + z1 * Math.cos(pitch)];
  };
  const V = Array.from({ length: n }, (_, p) => seen(pos[p * 3], pos[p * 3 + 1], pos[p * 3 + 2]));
  const top = seen(0, 1.2, 0), foot = seen(0, -rows * 3.5, 0);
  let x0 = top[0], x1 = top[0], y0 = top[1], y1 = top[1];
  for (const v of V) { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); }
  const sc = Math.min(W * .8 / (x1 - x0 || 1), H * .82 / (y1 - y0 || 1)), ox = W / 2 - (x0 + x1) / 2 * sc, oy = H * .08 + y1 * sc;
  const screen = v => [ox + v[0] * sc, oy - v[1] * sc];

  const out = canvas(W, H), ctx = out.getContext('2d');
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#b4c9da'); sky.addColorStop(1, '#e6ecf0');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  const [px, py] = screen(top), pb = screen(foot)[1], pw = Math.max(small ? 3 : 4, sc * pole * 1.6);
  const metal = ctx.createLinearGradient(px - pw / 2, 0, px + pw / 2, 0);
  metal.addColorStop(0, '#5f666c'); metal.addColorStop(.5, '#d6dade'); metal.addColorStop(1, '#5a6166');
  const drawPole = c => { c.fillStyle = metal; c.fillRect(px - pw / 2, py, pw, Math.max(pb, H) - py); c.fillStyle = '#8e969b'; c.beginPath(); c.arc(px, py, pw * .8, 0, 2 * Math.PI); c.fill(); };
  // the flag smaller (cheaper to cut from); the cloth on a layer of its own, its light on another
  const k = Math.min(1, (small ? 200 : 360) / pic.width), flag = canvas(Math.round(pic.width * k), Math.round(pic.height * k));
  flag.getContext('2d').drawImage(pic, 0, 0, flag.width, flag.height);
  const layer = canvas(W, H), lc = layer.getContext('2d'), shade = canvas(W, H), sh = shade.getContext('2d');
  // each point's light, from the tilt of the cloth around it (either side lit alike)
  const P = p => [pos[p * 3], pos[p * 3 + 1], pos[p * 3 + 2]], light = new Float64Array(n);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const e = P(at(Math.min(cols - 1, i + 1), j)), w = P(at(Math.max(0, i - 1), j)), up = P(at(i, Math.max(0, j - 1))), down = P(at(i, Math.min(rows - 1, j + 1)));
    const u = [e[0] - w[0], e[1] - w[1], e[2] - w[2]], v = [down[0] - up[0], down[1] - up[1], down[2] - up[2]];
    const nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0], nl = Math.hypot(nx, ny, nz) || 1;
    light[at(i, j)] = .42 + .68 * Math.abs((nx * sun[0] + ny * sun[1] + nz * sun[2]) / nl);
  }
  const tris = [];
  for (let j = 0; j + 1 < rows; j++) for (let i = 0; i + 1 < cols; i++) {
    const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
    const u0 = i / (cols - 1) * flag.width, v0 = j / (rows - 1) * flag.height, u1 = (i + 1) / (cols - 1) * flag.width, v1 = (j + 1) / (rows - 1) * flag.height;
    tris.push([[a, b, c], [[u0, v0], [u1, v0], [u1, v1]]], [[a, c, d], [[u0, v0], [u1, v1], [u0, v1]]]);
  }
  const depth = t => (V[t[0][0]][2] + V[t[0][1]][2] + V[t[0][2]][2]) / 3;
  tris.sort((p, q) => depth(p) - depth(q));
  let poled = false;
  for (const [pts, uv] of tris) {
    if (!poled && depth([pts]) > 0) { drawPole(lc); poled = true; }
    const d = pts.map(p => screen(V[p])), cx = (d[0][0] + d[1][0] + d[2][0]) / 3, cy = (d[0][1] + d[1][1] + d[2][1]) / 3;
    const grown = d.map(([x, y]) => { const m = Math.hypot(x - cx, y - cy) || 1; return [x + (x - cx) / m * .7, y + (y - cy) / m * .7]; }); // (a little larger: no seams)
    // the picture's triangle onto the screen's: an affine map
    const [[a0, b0], [a1, b1], [a2, b2]] = uv, [[X0, Y0], [X1, Y1], [X2, Y2]] = d;
    const det = a0 * (b1 - b2) + a1 * (b2 - b0) + a2 * (b0 - b1); if (!det) continue;
    const m = (A, B, C) => [(A * (b1 - b2) + B * (b2 - b0) + C * (b0 - b1)) / det, (A * (a2 - a1) + B * (a0 - a2) + C * (a1 - a0)) / det, (A * (a1 * b2 - a2 * b1) + B * (a2 * b0 - a0 * b2) + C * (a0 * b1 - a1 * b0)) / det];
    const [ma, mc, me] = m(X0, X1, X2), [mb, md, mf] = m(Y0, Y1, Y2);
    const tri = c => { c.beginPath(); c.moveTo(grown[0][0], grown[0][1]); c.lineTo(grown[1][0], grown[1][1]); c.lineTo(grown[2][0], grown[2][1]); c.closePath(); };
    lc.save(); tri(lc); lc.clip(); lc.setTransform(ma, mb, mc, md, me, mf); lc.drawImage(flag, 0, 0); lc.restore();
    // its light as a grey: 128 leaves the cloth as it is, darker shades it, lighter lights it
    const g = Math.round(Math.max(0, Math.min(255, (light[pts[0]] + light[pts[1]] + light[pts[2]]) / 3 * 128)));
    sh.fillStyle = `rgb(${g},${g},${g})`; tri(sh); sh.fill();
  }
  if (!poled) drawPole(lc);
  // the light softened (drawn small and back up), kept to the cloth, laid over it
  const tiny = canvas(Math.max(1, W >> 2), Math.max(1, H >> 2)), soft = canvas(W, H), so = soft.getContext('2d');
  tiny.getContext('2d').drawImage(shade, 0, 0, tiny.width, tiny.height);
  so.imageSmoothingEnabled = true; so.drawImage(tiny, 0, 0, W, H);
  so.globalCompositeOperation = 'destination-in'; so.drawImage(shade, 0, 0);
  lc.globalCompositeOperation = 'overlay'; lc.drawImage(soft, 0, 0); lc.globalCompositeOperation = 'source-over';
  ctx.drawImage(layer, 0, 0);
  return out;
}

let worker = null, jobs = 0;
const waiting = new Map();
export async function clothPicture(src, look, W, H) {
  const pic = await source(src);
  if (worker === null) {
    try {
      if (typeof OffscreenCanvas !== 'function') throw new Error('no OffscreenCanvas');
      const code = `const cloth = ${cloth.toString()};\nonmessage = async e => { const { id, pic, look, W, H } = e.data; try { const cv = cloth(pic, look, W, H, (w, h) => new OffscreenCanvas(w, h)); postMessage({ id, blob: await cv.convertToBlob({ type: 'image/jpeg', quality: .88 }) }); } catch (err) { postMessage({ id, error: String(err) }); } };`;
      worker = new Worker(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
      worker.onmessage = e => { const w = waiting.get(e.data.id); waiting.delete(e.data.id); if (w) { if (e.data.error) w.reject(new Error(e.data.error)); else w.resolve(URL.createObjectURL(e.data.blob)); } };
    } catch (err) { worker = false; }
  }
  if (!worker) return cloth(pic, look, W, H, (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h })).toDataURL('image/jpeg', .88);
  const bitmap = await createImageBitmap(pic);
  return new Promise((resolve, reject) => { const id = ++jobs; waiting.set(id, { resolve, reject }); worker.postMessage({ id, pic: bitmap, look, W, H }, [bitmap]); });
}
