// The plain map of the world under a country's map: the neighbours, and what lies between a country's far-off parts.
// From data/maps/world/under.bin.gz (tools/worldunder.mjs): every quiz takes the same file, which the browser keeps, as
// numbers with the triangles of the fills already cut. A view goes only so far (view.reach), so a map holds only the
// rings it can ever show. One shape per copy of the world, every country's land with its coasts and borders: the
// graphics card draws all of it with every frame, and nothing of it changes as the view moves. A map over the 180th
// meridian has a second copy (mercator.js, MERCATOR.world). Where the file can't be read: world.js, as text.
//
//   makeWorld(quiz, shapes, view, { root })

async function readUnder(root) {
  const res = await fetch(root + 'data/maps/world/under.bin.gz');
  if (!res.ok) throw new Error('no world');
  const b = new Uint8Array(await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  const head = new DataView(b.buffer, 0, 16);
  let o = 16;
  const num = () => { let v = 0, m = 1, c; do { c = b[o++]; v += (c & 127) * m; m *= 128; } while (c > 127); return v; };
  const sig = () => { const v = num(); return v % 2 ? -(v + 1) / 2 : v / 2; };
  const R = num(), rings = [];
  let points = 0, corners = 0;
  for (let i = 0; i < R; i++) { const n = num(); rings.push({ from: points, n }); points += n; }
  for (const r of rings) { r.at = corners; r.t = num(); corners += r.t; }
  const P = new Float64Array(points * 2), C = new Uint16Array(corners);
  for (const r of rings) {
    let x = 0, y = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = r.from * 2, end = i + r.n * 2; i < end; i += 2) {
      x += sig(); y += sig();
      const px = P[i] = x / 10, py = P[i + 1] = y / 10;
      if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py;
    }
    r.box = [x0, y0, x1, y1];
  }
  for (const r of rings) { let k = 0; for (let i = r.at, end = i + r.t; i < end; i++) { k += sig(); C[i] = k; } }
  // a ring as gl-map's outlines have it (made when a map first holds it)
  const part = r => (r.part ??= (() => {
    const p = P.subarray(r.from * 2, (r.from + r.n) * 2), n = new Float32Array(r.t * 2);
    for (let i = 0; i < r.t; i++) { const k = C[r.at + i]; n[2 * i] = p[2 * k]; n[2 * i + 1] = p[2 * k + 1]; }
    return { p, closed: true, n };
  })());
  return { proj: { k: head.getFloat64(0, true), y0: head.getFloat64(8, true) }, rings, part };
}

export function makeWorld(quiz, { S, stage }, view, { root }) {
  const credit = () => {
    const note = stage.querySelector('.note');
    if (note && !/Natural Earth/.test(note.textContent)) note.append(' · World: Natural Earth');
  };
  // one shape per copy of the world, under what the page has laid there; d(copy): its outline
  const shapes = (W, d) => MERCATOR.world(W, quiz.proj, quiz.size[0]).map(copy => {
    const g = S.el('g'), land = S.el('path');
    land.setAttribute('class', 'world'); land.setAttribute('d', d(copy));
    g.setAttribute('transform', `translate(${copy[1]},${copy[2]}) scale(${copy[0]})`); g.append(land); S.ctx.prepend(g);
    return land;
  });
  const asText = () => {
    const lay = () => { const d = WORLD.reg.filter(r => r.a).map(r => r.d).join(''); shapes(WORLD, () => d); credit(); };
    if (typeof WORLD === 'object') setTimeout(lay); // (after the page's own scripts, which may lay theirs first)
    else { const s = document.createElement('script'); s.src = root + 'data/maps/world/world.js'; s.onload = lay; document.head.append(s); }
  };
  readUnder(root).then(({ proj, rings, part }) => {
    // the rings of a copy within a box of the map (none: all of them)
    const within = ([s, dx, dy], box) => {
      const held = rings.filter(({ box: b }) => !box || (b[2] * s + dx >= box[0] && b[0] * s + dx <= box[2] && b[3] * s + dy >= box[1] && b[1] * s + dy <= box[3]));
      return held.length ? new ReadyPath(held.map(part)) : '';
    };
    let box = view.reach();
    const copies = MERCATOR.world({ proj }, quiz.proj, quiz.size[0]);
    const lands = shapes({ proj }, copy => within(copy, box));
    credit();
    // the stage takes another shape (a phone turned, a panel grown) and the view could go past what is held: more of it
    if (box && window.ResizeObserver) new ResizeObserver(() => {
      const now = view.reach();
      if (!now || (now[0] >= box[0] && now[1] >= box[1] && now[2] <= box[2] && now[3] <= box[3])) return;
      box = [Math.min(box[0], now[0]), Math.min(box[1], now[1]), Math.max(box[2], now[2]), Math.max(box[3], now[3])];
      lands.forEach((land, i) => land.setAttribute('d', within(copies[i], box)));
    }).observe(stage);
  }).catch(asText);
}
