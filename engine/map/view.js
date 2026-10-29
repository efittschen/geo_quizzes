// The view: the box of the map on screen (vb, in map units), drawn by gl-map.js in the stage every frame anew. Moving
// and zooming change only the view: nothing is rebuilt per frame. While a finger, the mouse or the wheel moves it, each
// frame tells `move` (the outlines take the view's detail); once the hand rests (REST ms), `rest` (the dots and the
// pins take the zoom's size). Both also tell `near` (the tiles follow the view).
//
//   const view = makeView(quiz, shapes, glm)
//   view.get(), view.set(v)         the view as it is, and back to one as it was
//   view.go(v), view.keep()         to a view kept to the map; the view as it is, kept to the map
//   view.home(), view.zoom(f)       all of the map (its home part), and zoomed in or out at the middle
//   view.frame(box), view.frameBoxes(boxes), view.framePoints(points)   a part brought into view (see each)
//   view.scale(), view.base         screen pixels per map unit; the view of all of it
//   view.toMap(x, y), view.toScreen(x, y), view.stageBox()
//   view.dot(s)                     a dot's size on the screen at scale s
//   view.deep(max)                  how far it zooms: the quiz's maxZoom, or the street map's tiles (screen pixels per
//                                   map unit at their finest), null again for the quiz map
//   view.input(at)                  the player's gestures; at(e, exact): the area under a pointer event
//   view.receive(r), view.capture(c), view.space(on)   who gets taps and hovers; Draw takes the pointer; Space held
//   view.hooks                      { move(s), rest(s), near() }, set by the Map

const REST = 120, TAP_SLOP = 10;

export function makeView(quiz, shapes, glm) {
  const { stage, svg } = shapes, [W, H] = quiz.size, pad = quiz.pad, home = quiz.home || [0, 0, W, H];
  const onWorld = !!quiz.proj && !quiz.worldMap;
  const hooks = { move() {}, rest() {}, near() {} };
  const surface = glm.canvas || stage;
  let base = { x: 0, y: 0, w: W, h: H }, vb = { ...base }, deepest = 0, restTimer = 0, raf = 0, drawn = null, size = '', refitLater = false;
  let receiver = null, capture = null, space = false;

  const stageBox = () => stage.getBoundingClientRect();
  const scaleOf = (v, r = stageBox()) => Math.min(r.width / v.w, r.height / v.h);
  const scale = () => scaleOf(vb) || 1;
  function toMap(cx, cy, v = vb) {
    const r = stageBox(), s = scaleOf(v, r);
    return { x: v.x + (cx - r.left - (r.width - v.w * s) / 2) / s, y: v.y + (cy - r.top - (r.height - v.h * s) / 2) / s };
  }
  function toScreen(x, y) {
    const r = stageBox(), s = scaleOf(vb, r);
    return [r.left + (r.width - vb.w * s) / 2 + (x - vb.x) * s, r.top + (r.height - vb.h * s) / 2 + (y - vb.y) * s];
  }
  // Dots are 11 px across zoomed out and grow with the square root of the zoom (twice as large at 4 times).
  const dot = s => { const r = stageBox(), s0 = r.width ? scaleOf(base, r) : s; return 11 * Math.sqrt(Math.max(1, s / s0)); };

  // all of the map: its home part with the padding, to the stage's shape
  function fit() {
    const r = stageBox(); if (!r.width || !r.height) return;
    const a = r.width / r.height;
    let w = home[2] - home[0] + pad * 2, h = home[3] - home[1] + pad * 2;
    if (w / h < a) w = h * a; else h = w / a;
    base = { x: (home[0] + home[2]) / 2 - w / 2, y: (home[1] + home[3]) / 2 - h / 2, w, h };
  }
  // A view kept to the map: zoomed in no further than maxZoom (on the tiles: as far as they go), out no further than
  // the whole (a map lying on the world's: three times that), and never more than half of it off the map.
  function clamp(v) {
    const r = stageBox(), deep = deepest && r.width;
    const minW = deep ? Math.min(r.width, r.height * v.w / v.h) / deepest : base.w / quiz.maxZoom, maxW = base.w * (onWorld ? 3 : 1.15);
    const k = Math.min(Math.max(v.w, minW), maxW) / v.w;
    if (k !== 1) { const cx = v.x + v.w / 2, cy = v.y + v.h / 2; v.w *= k; v.h *= k; v.x = cx - v.w / 2; v.y = cy - v.h / 2; }
    v.x = Math.min(Math.max(v.x, -v.w / 2), W - v.w / 2); v.y = Math.min(Math.max(v.y, -v.h / 2), H - v.h / 2);
    return v;
  }
  // the view drawn at rest, and while it moves
  function render() {
    cancelAnimationFrame(raf); clearTimeout(restTimer);
    drawn = { ...vb };
    const s = scale();
    glm.view(vb, dot(s));
    hooks.rest(s); hooks.near();
    if (capture && capture.live()) capture.follow();
  }
  function frame() {
    const r = stageBox();
    if (!drawn || !r.width || !r.height) return render();
    const s = scale();
    glm.view(vb, dot(s));
    hooks.move(s); hooks.near();
    if (capture && capture.live()) capture.follow();
    clearTimeout(restTimer); restTimer = setTimeout(render, REST);
  }
  const glide = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
  const to = v => { vb = clamp(v); render(); };

  function zoomAt(cx, cy, f, from = vb, show = render) {
    const p = toMap(cx, cy, from), w = from.w / f, h = from.h / f, r = stageBox(), s = Math.min(r.width / w, r.height / h);
    vb = clamp({ x: p.x - (cx - r.left - (r.width - w * s) / 2) / s, y: p.y - (cy - r.top - (r.height - h * s) / 2) / s, w, h });
    show();
  }
  const zoom = f => { const r = stageBox(); zoomAt(r.left + r.width / 2, r.top + r.height / 2, f); };
  const goHome = () => { fit(); vb = { ...base }; render(); };
  // A part of the map, [x0, y0, x1, y1] (a round's box), with the padding; none: all of it.
  function frame_(box) {
    goHome();
    if (!box) return;
    const ar = base.w / base.h, w = Math.max(box[2] - box[0], (box[3] - box[1]) * ar) + pad * 2, h = w / ar;
    to({ x: (box[0] + box[2]) / 2 - w / 2, y: (box[1] + box[3]) / 2 - h / 2, w, h });
  }
  // boxes [{ x, y, width, height }] with the quiz's fly padding (fly: pad, and the least share of the map shown)
  function frameBoxes(bs) {
    const x0 = Math.min(...bs.map(b => b.x)), y0 = Math.min(...bs.map(b => b.y)), x1 = Math.max(...bs.map(b => b.x + b.width)), y1 = Math.max(...bs.map(b => b.y + b.height));
    const ar = base.w / base.h, w = Math.max((x1 - x0) * quiz.fly.pad, (y1 - y0) * quiz.fly.pad * ar, base.w * quiz.fly.min), h = w / ar;
    to({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h });
  }
  // points the same way, never zooming in
  function framePoints(ps) {
    const xs = ps.map(p => p.x), ys = ps.map(p => p.y), ar = base.w / base.h;
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const w = Math.max((x1 - x0) * quiz.fly.pad, (y1 - y0) * quiz.fly.pad * ar, base.w * quiz.fly.min, vb.w), h = w / ar;
    to({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h });
  }
  // The stage changes size (on a phone the panel above the map grows and shrinks): the map keeps its middle and its
  // zoom. While a finger is on it, once it lets go.
  const held = new Map();
  function refit() {
    const r = stageBox(), now = r.width + 'x' + r.height;
    if (!r.width || now === size) return;
    if (held.size) { refitLater = true; return; }
    size = now; refitLater = false;
    const c = { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 }, k = vb.w / base.w;
    fit();
    const w = base.w * k, h = base.h * k;
    to({ x: c.x - w / 2, y: c.y - h / 2, w, h });
  }

  /* ---------- the pointer ---------- */
  // A tap goes to the receiver: tap(area, point, ok): the area under the press (or null), the map point, and whether
  // it was a plain click or tap that began on the map; hover(area) for a mouse. Draw takes the pointer while it draws
  // (capture: { active(), live(), owns(id), from(e), to(e), end(), drop(), follow() }).
  function input(at) {
    let drag = null, pinch = null, downArea = null, moved = false;
    const exact = () => !!(receiver && receiver.exact);
    stage.addEventListener('scroll', () => { stage.scrollLeft = stage.scrollTop = 0; });
    surface.addEventListener('wheel', e => { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * (e.deltaMode ? .05 : .0022)), vb, glide); }, { passive: false });
    surface.addEventListener('pointerdown', e => {
      surface.setPointerCapture(e.pointerId);
      held.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const drawing = capture && capture.active();
      // (Draw: one finger, the pen or the left button draws; the right or middle button, or Space held, moves the map)
      if (held.size === 1 && drawing && (e.pointerType === 'touch' || e.button === 0) && !space) { moved = true; capture.from(e); return; }
      if (held.size === 1) {
        if (e.button === 1 && drawing) e.preventDefault();
        drag = { x: e.clientX, y: e.clientY, v: { ...vb }, s: scale() }; moved = false; downArea = at(e, exact());
      } else if (held.size === 2) {
        if (capture) capture.drop();
        const [a, b] = [...held.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, m: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, v: { ...vb } };
        moved = true; drag = null;
      }
    });
    surface.addEventListener('contextmenu', e => { if (capture && capture.active()) e.preventDefault(); });
    surface.addEventListener('pointermove', e => {
      if (!held.has(e.pointerId)) { if (e.pointerType === 'mouse' && receiver && receiver.hover) receiver.hover(at(e, exact())); return; }
      held.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (capture && capture.owns(e.pointerId)) capture.to(e);
      else if (pinch && held.size === 2) {
        const [a, b] = [...held.values()], m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, f = Math.hypot(a.x - b.x, a.y - b.y) / pinch.d;
        const p = toMap(pinch.m.x, pinch.m.y, pinch.v), w = pinch.v.w / f, h = pinch.v.h / f, r = stageBox(), s = Math.min(r.width / w, r.height / h);
        vb = clamp({ x: p.x - (m.x - r.left - (r.width - w * s) / 2) / s, y: p.y - (m.y - r.top - (r.height - h * s) / 2) / s, w, h });
        glide();
      } else if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        // (a finger wobbles more than a mouse: a tap within TAP_SLOP pixels is still a tap; the grabbing hand is a mouse's)
        if (!moved && Math.hypot(dx, dy) > (e.pointerType === 'touch' ? TAP_SLOP : 6)) { moved = true; if (e.pointerType === 'mouse') svg.classList.add('grab'); }
        if (moved) { vb = clamp({ ...drag.v, x: drag.v.x - dx / drag.s, y: drag.v.y - dy / drag.s }); glide(); }
      }
    });
    const up = e => {
      if (capture && capture.owns(e.pointerId)) capture.end();
      const had = held.delete(e.pointerId); // (false: the press began off the map)
      // one finger of a pinch lifted: the other goes on moving the map from where it is
      if (pinch && held.size === 1) { const [p] = held.values(); drag = { x: p.x, y: p.y, v: { ...vb }, s: scale() }; }
      if (held.size < 2) pinch = null;
      if (held.size) return;
      svg.classList.remove('grab');
      if (!drawn || ['x', 'y', 'w', 'h'].some(k => drawn[k] !== vb[k])) render();
      if (refitLater) refit();
      if (!moved && e.type === 'pointerup' && receiver && receiver.tap) receiver.tap(downArea, toMap(e.clientX, e.clientY), had && (e.pointerType !== 'mouse' || e.button === 0));
      drag = null; downArea = null;
    };
    surface.addEventListener('pointerup', up);
    surface.addEventListener('pointercancel', up);
    surface.addEventListener('pointerleave', () => { if (receiver && receiver.hover) receiver.hover(null); });
  }

  { const r = stageBox(); size = r.width + 'x' + r.height; }
  window.addEventListener('resize', refit);
  if (window.ResizeObserver) new ResizeObserver(refit).observe(stage);

  return {
    hooks, surface, input, render, stageBox, scale, toMap, toScreen, dot, zoom, frameBoxes, framePoints,
    home: goHome, frame: frame_,
    get base() { return base; },
    get: () => ({ ...vb }),
    set: v => { vb = { ...v }; render(); },
    go: v => to({ ...v }),
    keep: () => to({ ...vb }),
    deep: max => { deepest = max || 0; },
    receive: r => { receiver = r; },
    capture: c => { capture = c; },
    space: on => { space = on; svg.classList.toggle('space', on); },
    spaceHeld: () => space,
  };
}
