// draw: the place drawn on the map, answered by how well the two match (model.check.drawing). Outline: a line that
// closes itself and is filled once let go; Brush: a broad round brush, as wide on the screen at every zoom (zoomed in it
// draws finer). As many pieces as it takes, Undo (Backspace, Z) the last, Clear all, Done (Enter) answers: one try. One
// finger draws, two move and zoom the map; with a mouse the left button draws, the wheel zooms, the right or middle
// button or Space held moves the map. The drawing stays until the next one begins.
//
// A drawing is pieces in map units, so it stays where it was drawn as the map moves: { tool, pts: [x, y, …], r: the
// brush's half width }. The piece being drawn is drawn on a canvas over the map; let go, it is a path in the map's own
// picture (map.sketch), moved and drawn with it: yellow, half see-through, the pieces as one.

const TOOLS = [['outline', 'Outline'], ['brush', 'Brush']], BRUSH = 14, EDGE = 5;

export function makeDraw({ model, map, game, storage, $ }) {
  const kept = storage.last().tool;
  let tool = TOOLS.some(([t]) => t === kept) ? kept : 'outline', pieces = [], old = false, live = null, raf = 0, P = null;
  const canvas = document.createElement('canvas');
  canvas.className = 'sketch-live';
  $('map').after(canvas);
  const css = n => getComputedStyle($('stage')).getPropertyValue(n).trim();
  // a piece as a path, to the map's own grain
  const pathOf = p => {
    const q = v => Math.round(v * map.q) / map.q, a = p.pts;
    let d = `M${q(a[0])},${q(a[1])}`;
    for (let i = 2; i < a.length; i += 2) d += `L${q(a[i])},${q(a[i + 1])}`;
    return d + (a.length < 4 ? `L${q(a[0]) + 1 / map.q},${q(a[1])}` : '') + (p.tool === 'outline' ? 'Z' : '');
  };
  // where the map lies in the stage: s screen pixels to a map unit, its corner at (ox, oy)
  const onStage = () => { const r = map.stageBox(), v = map.view(), s = Math.min(r.width / v.w, r.height / v.h); return { r, s, ox: (r.width - v.w * s) / 2 - v.x * s, oy: (r.height - v.h * s) / 2 - v.y * s }; };
  const drawing = () => !!P && !!game.round && !!game.round.asked() && !game.rating;

  const bar = document.createElement('div'), tools = document.createElement('div');
  bar.className = 'drawbar'; bar.hidden = true;
  tools.className = 'tools'; tools.setAttribute('role', 'group'); tools.setAttribute('aria-label', 'Tool');
  const button = (label, cls, onclick, key) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = label; if (key) b.title = key; b.onclick = () => { onclick(); b.blur(); }; return b; };
  tools.append(...TOOLS.map(([t, label]) => { const b = button(label, '', () => { tool = t; storage.keepLast(r => { r.tool = t; }); sync(); }); b.dataset.tool = t; return b; }));
  const undo = button('Undo', 'ghost small', () => { if (old || !pieces.length) return; pieces.pop(); map.sketch.undo(); sync(); }, 'Z');
  const clear = button('Clear', 'ghost small', () => wipe());
  const done = button('Done', 'primary', () => finish(), 'Enter');
  bar.append(tools, undo, clear, done);
  $('ask').after(bar);

  function wipe() { pieces = []; old = false; map.sketch.clear(); sync(); }
  function sync() {
    const mine = !old && pieces.length > 0, q = game.round && game.round.asked();
    bar.hidden = !P; map.look('sketch', !!P);
    for (const b of tools.children) b.setAttribute('aria-pressed', b.dataset.tool === tool);
    undo.disabled = !mine; clear.disabled = !mine && !old; // (Clear takes the last question's drawing off its answer too)
    done.disabled = !(mine || (q && q.revealed && drawing())); // (a review's time run out: Done goes on)
  }
  const soon = () => { if (!raf) raf = requestAnimationFrame(paint); };
  function paint() {
    raf = 0;
    const { r, s, ox, oy } = onStage(), k = window.devicePixelRatio || 1, w = Math.round(r.width * k), h = Math.round(r.height * k), x = canvas.getContext('2d');
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; } else x.clearRect(0, 0, w, h);
    if (!live) return;
    x.setTransform(k * s, 0, 0, k * s, k * ox, k * oy); x.lineCap = x.lineJoin = 'round';
    const path = new Path2D(pathOf(live)), yellow = css('--yellow');
    x.globalAlpha = .5;
    if (live.tool === 'brush') { x.strokeStyle = yellow; x.lineWidth = 2 * live.r; x.stroke(path); }
    else { x.fillStyle = yellow; x.fill(path); x.globalAlpha = 1; x.strokeStyle = css('--ink'); x.lineWidth = 2 / s; x.stroke(path); }
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
  }
  const end = () => {
    const p = live; live = null; soon();
    if (p.tool === 'brush' || p.pts.length >= 6) { pieces.push(p); map.sketch.add(pathOf(p), p.tool, p.tool === 'brush' ? 2 * p.r : 0); }
    sync();
  };
  map.capture({
    active: drawing, live: () => !!live, owns: id => !!live && live.id === id, follow: soon,
    from(e) {
      if (old) { wipe(); if (game.opts.hard) map.fade(0, true); }
      const { r, s, ox, oy } = onStage();
      live = { id: e.pointerId, tool, pts: [(e.clientX - r.left - ox) / s, (e.clientY - r.top - oy) / s], r: BRUSH / s, t: performance.now(), len: 0 };
      soon(); sync();
    },
    to(e) {
      const { r, s, ox, oy } = onStage(), p = live.pts;
      for (const c of (e.getCoalescedEvents && e.getCoalescedEvents().length ? e.getCoalescedEvents() : [e])) {
        const x = (c.clientX - r.left - ox) / s, y = (c.clientY - r.top - oy) / s, d = Math.hypot(x - p[p.length - 2], y - p[p.length - 1]) * s;
        if (d < 2) continue; // (closer than 2 screen pixels: nothing to add)
        p.push(x, y); live.len += d;
      }
      soon();
    },
    end,
    // a second finger: the map is moved; what it began just before goes, a piece drawn a while stays
    drop() { if (!live) return; if (performance.now() - live.t > 300 && live.len > 24) end(); else { live = null; soon(); sync(); } },
  });

  // Done: one try. The place shows in the colour of the result, the drawing over it and the share they have in common
  // under its name; a place out of view widens the view to both.
  function finish() {
    const q = game.round && game.round.asked(), mine = old ? [] : pieces;
    if (!drawing() || live || (!mine.length && !q.revealed)) return;
    const K = P.kind, areas = K.areas[q.id], rs = mine.map(p => p.r).sort((a, b) => a - b);
    const edge = rs.length ? rs[rs.length >> 1] * EDGE / BRUSH : 0; // (in map units, at the zoom of the middle piece)
    const score = model.check.drawing({ place: map.rings(areas), pieces: mine.map(p => ({ brush: p.tool === 'brush' ? p.r : 0, pts: p.pts })), dot: BRUSH / map.scale(), edge, weight: map.weight });
    game.answer({ drawn: score });
    old = true; map.sketch.old();
    const bs = areas.map(map.box), x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y)), x1 = Math.max(...bs.map(b => b.x + b.width)), y1 = Math.max(...bs.map(b => b.y + b.height)), v = map.view();
    if (x1 < v.x || x0 > v.x + v.w || y1 < v.y || y0 > v.y + v.h) map.framePoints([{ x: x0, y: y0 }, { x: x1, y: y1 }, ...mine.flatMap(p => p.pts.filter((_, i) => i % 2 === 0).map((x, i) => ({ x, y: p.pts[2 * i + 1] })))]);
    sync();
  }

  return play => ({
    ask() { P = play; sync(); },
    board() {}, tap() {},
    key(e) {
      if (!P) return;
      if (e.key === 'Enter') { e.preventDefault(); finish(); }
      else if (e.key === 'Backspace' || e.key === 'z' || e.key === 'Z') { e.preventDefault(); undo.onclick(); }
    },
    close() { P = null; wipe(); sync(); },
  });
}
