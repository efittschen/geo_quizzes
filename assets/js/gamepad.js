// Controller support. A game controller (any the browser's Gamepad API sees: Xbox, PlayStation, Switch Pro, Steam Deck…)
// moves a cursor of its own over the page and clicks with it, through the same pointer, mouse and wheel events a mouse
// sends. So every page and every quiz works with it as with a mouse, without code of its own: the map quizzes
// (shared/area-quiz.js) and their street map (Leaflet), the town names' painting (shared/paint-quiz.js), the home map
// (D3) and the coverage map, also inside a country page's box (a frame of the same site, driven from the page around it).
//
//   left stick     the cursor; the left trigger held slows it, for small areas
//   A (✕)          a click; held, a drag: pans a map, paints a town name's region
//   B (○)          back: leaves a text field, closes a box, an enlarged picture or this list
//   right stick    pans the map under the cursor, or scrolls the list under it
//   LB / RB        zoom out / in where the cursor is
//   D-pad          the cursor jumps to the next button that way; on a focused number field or list, up and down change it
//   X (□)          the whole map again (the 0 key)
//   Start          the page's main button (Start, Play again, Done, Next)
//   Select         the list of these controls
//
// The cursor shows with the first use of the controller and hides when the mouse moves. Its place is kept for the next
// page in this tab (sessionStorage), so a review that moves from quiz to quiz keeps it. The browser hides the controller
// from each page it opens until a button is pressed there; that press counts. Loaded by every page in the root
// and, through quizzes/shared/quiz-page.js, by every quiz page.
(() => {
  if (window.top !== window || !navigator.getGamepads) return;
  const ID = 7351; // the pointerId of the controller's cursor
  const A = 0, B = 1, X = 2, LB = 4, RB = 5, LT = 6, SELECT = 8, START = 9, UP = 12, DOWN = 13, LEFT = 14, RIGHT = 15;
  const DEAD = 0.15, WHEEL = 200, SAVE = 'geoquizzes-gamepad';
  const CLICKABLE = 'a[href], button, input:not([type=hidden]), select, textarea, summary, label.toggle, [role=tab], [role=link], [tabindex]:not([tabindex="-1"])';
  const FIELD = 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=file]), select, textarea';
  const MAP = '#map, .leaflet-container'; // what the right stick pans: the town names' canvas has no panning, and a drag there paints
  const CONTROLS = [
    ['Left stick', 'Move the cursor (hold LT to slow it)'], ['A / ✕', 'Click; hold to drag a map or paint'],
    ['B / ○', 'Back: leave a field, close a box or picture'], ['Right stick', 'Pan the map, or scroll a list'],
    ['LB / RB', 'Zoom out / in at the cursor'], ['D-pad', 'Jump to the next button that way'],
    ['X / □', 'Show the whole map'], ['Start', 'Start, Play again, Done, Next'], ['Select', 'Show these controls'],
  ];

  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  let x = innerWidth / 2, y = innerHeight / 2, shown = false, hinted = false;
  try { const s = JSON.parse(sessionStorage.getItem(SAVE)); if (s) { x = clamp(s.x, 0, innerWidth - 1); y = clamp(s.y, 0, innerHeight - 1); shown = !!s.shown; hinted = !!s.hinted; } } catch (e) {}
  let cursor = null, help = null, note = null, noteTimer = 0, lit = null, over = null, capture = null;
  let held = null; // the press of A: { el, compat }
  let pan = null;  // a drag made by the right stick: { x, y, x0, y0, compat }

  /* ---------- events as a mouse sends them ---------- */
  // Coordinates are the top page's; an element in a frame gets them in its own.
  const parentOf = n => (n.parentNode && n.parentNode.nodeType === 1 ? n.parentNode : n.ownerDocument.defaultView.frameElement);
  const chain = el => { const out = []; for (let n = el; n; n = parentOf(n)) out.push(n); return out; };
  function local(el, cx, cy) {
    for (let w = el.ownerDocument.defaultView; w.frameElement; w = w.parent) { const f = w.frameElement, r = f.getBoundingClientRect(); cx -= r.left + f.clientLeft; cy -= r.top + f.clientTop; }
    return [cx, cy];
  }
  function hit(cx, cy) {
    let el = document.elementFromPoint(cx, cy);
    while (el && el.tagName === 'IFRAME') {
      let doc = null; try { doc = el.contentDocument; } catch (e) {}
      if (!doc) break;
      const r = el.getBoundingClientRect(); cx -= r.left + el.clientLeft; cy -= r.top + el.clientTop;
      el = doc.elementFromPoint(cx, cy) || doc.documentElement;
    }
    return el || document.documentElement;
  }
  function fire(el, type, cx, cy, init = {}) {
    const [lx, ly] = local(el, cx, cy), view = el.ownerDocument.defaultView, pointer = type.startsWith('pointer'), down = held || pan;
    const Type = type === 'wheel' ? view.WheelEvent : pointer ? view.PointerEvent : view.MouseEvent, through = !/enter|leave/.test(type);
    return el.dispatchEvent(new Type(type, {
      bubbles: through, cancelable: through, composed: true, view, clientX: lx, clientY: ly, screenX: lx, screenY: ly, button: 0, buttons: down ? 1 : 0,
      ...(pointer ? { pointerId: ID, pointerType: 'mouse', isPrimary: true, width: 1, height: 1, pressure: down ? 0.5 : 0 } : {}), ...init,
    }));
  }
  // The engines capture the pointer they are pressed with, which the browser refuses for a pointer it doesn't know: for
  // this one the capture is kept here, and its pointer events go to the element holding it.
  const proto = Element.prototype, { setPointerCapture: setCapture, releasePointerCapture: releaseCapture, hasPointerCapture: hasCapture } = proto;
  proto.setPointerCapture = function (id) { if (id === ID) capture = this; else return setCapture.call(this, id); };
  proto.releasePointerCapture = function (id) { if (id === ID) { if (capture === this) capture = null; } else return releaseCapture.call(this, id); };
  proto.hasPointerCapture = function (id) { return id === ID ? capture === this : hasCapture.call(this, id); };

  function hover(el) {
    if (over && !over.isConnected) over = null;
    if (el === over) return;
    const was = over ? chain(over) : [], now = el ? chain(el) : [];
    if (over) for (const t of ['pointerout', 'mouseout']) fire(over, t, x, y, { relatedTarget: el });
    for (const n of was) if (!now.includes(n)) for (const t of ['pointerleave', 'mouseleave']) fire(n, t, x, y, { relatedTarget: el });
    if (el) for (const t of ['pointerover', 'mouseover']) fire(el, t, x, y, { relatedTarget: over });
    for (const n of [...now].reverse()) if (!was.includes(n)) for (const t of ['pointerenter', 'mouseenter']) fire(n, t, x, y, { relatedTarget: over });
    over = el;
    const c = el && el.closest(CLICKABLE);
    if (c !== lit) { lit?.classList.remove('gp-hover'); lit = c; lit?.classList.add('gp-hover'); }
  }
  function moved() {
    const el = hit(x, y); hover(el);
    fire(capture || el, 'pointermove', x, y);
    if (!held || held.compat) fire(el, 'mousemove', x, y);
  }
  function press() {
    const el = hit(x, y); hover(el);
    held = { el, compat: true };
    held.compat = fire(el, 'pointerdown', x, y); // a page that cancels the press gets no mouse events for it, as from a mouse
    if (held.compat && fire(el, 'mousedown', x, y)) {
      const field = el.closest(FIELD), active = document.activeElement;
      if (field) field.focus({ preventScroll: true }); else if (active && active.matches(FIELD)) active.blur();
    }
  }
  function release() {
    const down = held; held = null;
    const el = hit(x, y), target = capture || el, ups = chain(target);
    fire(target, 'pointerup', x, y);
    if (down.compat) fire(el, 'mouseup', x, y);
    capture = null;
    const both = chain(down.el).find(n => ups.includes(n));
    if (both && fire(both, 'click', x, y, { detail: 1 })) { const list = both.closest('select'); if (list) nudge(list, 1); }
  }
  // A list (<select>) does not open for a click that isn't the mouse's: a click picks the next choice instead.
  function nudge(field, dir) {
    if (field.tagName === 'SELECT') { const n = field.options.length; if (!n) return; field.selectedIndex = (field.selectedIndex + dir + n) % n; }
    else if (field.type === 'number') { try { if (dir > 0) field.stepUp(); else field.stepDown(); } catch (e) { return; } }
    else return;
    for (const t of ['input', 'change']) field.dispatchEvent(new Event(t, { bubbles: true }));
  }

  function panBy(dx, dy) {
    if (!pan) {
      const el = hit(x, y);
      if (!el.closest(MAP)) return false;
      pan = { x, y, x0: x, y0: y, compat: true };
      pan.compat = fire(el, 'pointerdown', x, y);
      if (pan.compat) fire(el, 'mousedown', x, y);
    }
    pan.x -= dx; pan.y -= dy;
    const el = hit(pan.x, pan.y);
    fire(capture || el, 'pointermove', pan.x, pan.y);
    if (pan.compat) fire(el, 'mousemove', pan.x, pan.y);
    return true;
  }
  function panEnd() {
    const p = pan; pan = null;
    const el = hit(p.x, p.y), far = Math.hypot(p.x - p.x0, p.y - p.y0) > 8;
    fire(capture || el, far ? 'pointerup' : 'pointercancel', p.x, p.y); // a short drag would count as a click on the map
    if (p.compat) fire(el, 'mouseup', p.x, p.y);
    capture = null;
  }

  const rest = [0, 0];
  function scroll(dx, dy) {
    for (let n = hit(x, y); n; n = parentOf(n)) {
      const doc = n.ownerDocument, view = doc.defaultView, root = n === doc.documentElement, box = root ? doc.scrollingElement : n;
      if (!box) continue;
      const css = view.getComputedStyle(n);
      const open = root ? !/hidden|clip/.test(css.overflowY + view.getComputedStyle(doc.body).overflowY) : /auto|scroll/.test(css.overflowY + css.overflowX);
      if (!open || !((dy && box.scrollHeight > box.clientHeight + 1) || (dx && box.scrollWidth > box.clientWidth + 1))) continue;
      rest[0] += dx; rest[1] += dy;
      const sx = Math.trunc(rest[0]), sy = Math.trunc(rest[1]); rest[0] -= sx; rest[1] -= sy;
      box.scrollBy(sx, sy);
      return;
    }
  }
  // The D-pad: to the nearest button, link or field that way, of those in view and not covered.
  function jump(dx, dy) {
    const near = [];
    for (const el of document.querySelectorAll(CLICKABLE)) {
      if (el.disabled || (el.tagName === 'INPUT' && el.closest('label.toggle'))) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) continue;
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) continue;
      const cx = clamp((r.left + r.right) / 2, 1, innerWidth - 2), cy = clamp((r.top + r.bottom) / 2, 1, innerHeight - 2);
      const along = (cx - x) * dx + (cy - y) * dy, across = Math.abs((cx - x) * dy - (cy - y) * dx);
      if (along > 0) near.push({ el, cx, cy, score: along + across * 2.5 });
    }
    near.sort((a, b) => a.score - b.score);
    const to = near.find(({ el, cx, cy }) => { const top = document.elementFromPoint(cx, cy); return top && (top === el || el.contains(top)); });
    if (!to) { scroll(dx * innerWidth * 0.5, dy * innerHeight * 0.5); return; }
    to.el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const r = to.el.getBoundingClientRect();
    x = clamp((r.left + r.right) / 2, 1, innerWidth - 2); y = clamp((r.top + r.bottom) / 2, 1, innerHeight - 2);
    moved();
  }

  const visible = el => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  function main() { const b = [...document.querySelectorAll('button.primary, a.primary')].find(b => !b.disabled && visible(b)); if (b) b.click(); }
  function key(k, code) { const t = document.activeElement || document.body; for (const type of ['keydown', 'keyup']) t.dispatchEvent(new KeyboardEvent(type, { key: k, code, bubbles: true, cancelable: true })); }
  function back() {
    if (help && !help.hidden) { help.hidden = true; return; }
    const active = document.activeElement;
    if (active && active.matches(FIELD)) { active.blur(); return; }
    const box = [...document.querySelectorAll('dialog[open]')].pop();
    if (box) { box.close(); return; }
    key('Escape', 'Escape');
  }

  /* ---------- the cursor and the list of controls ---------- */
  const style = document.createElement('style');
  style.textContent = `
.gp-cursor{position:fixed;left:0;top:0;z-index:2147483647;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 0 1.5px rgba(21,40,58,.85),inset 0 0 0 1.5px rgba(21,40,58,.85);pointer-events:none;transition:width .08s,height .08s,margin .08s,border-color .08s}
.gp-cursor::after{content:"";position:absolute;left:50%;top:50%;width:5px;height:5px;margin:-2.5px 0 0 -2.5px;border-radius:50%;background:var(--yellow,#F2B705);box-shadow:0 0 0 1px rgba(21,40,58,.85)}
.gp-cursor.down{width:18px;height:18px;margin:-9px 0 0 -9px;border-color:var(--yellow,#F2B705)}
.gp-cursor[hidden],.gp-help[hidden],.gp-note[hidden]{display:none}
.gp-hover{outline:3px solid var(--yellow,#F2B705)!important;outline-offset:2px}
.gp-help,.gp-note{position:fixed;z-index:2147483646;left:50%;transform:translateX(-50%);background:var(--card,#fff);color:var(--ink,#15283A);border:1.5px solid var(--line,#C9D3D8);border-radius:var(--radius,10px);box-shadow:var(--shadow,0 2px 8px rgba(0,0,0,.12));font:400 15px/1.4 var(--sans,system-ui,sans-serif);pointer-events:none}
.gp-help{top:50%;transform:translate(-50%,-50%);padding:16px 20px;min-width:min(420px,92vw)}
.gp-help h2{margin:0 0 10px;font:600 1.1rem/1.2 var(--cond,system-ui,sans-serif)}
.gp-help dl{display:grid;grid-template-columns:auto 1fr;gap:6px 16px;margin:0}
.gp-help dt{font-weight:600;white-space:nowrap}
.gp-help dd{margin:0;color:var(--muted,#5A6B78)}
.gp-note{bottom:24px;padding:8px 16px}`;
  document.head.append(style);

  // A box opened as a dialog lies above everything else, whatever its z-index: what is shown here goes into it meanwhile.
  const host = () => [...document.querySelectorAll('dialog[open]')].pop() || document.body;
  const lay = el => { const h = host(); if (el.parentNode !== h) h.append(el); };
  function place() {
    if (!cursor) { cursor = document.createElement('div'); cursor.className = 'gp-cursor'; cursor.setAttribute('aria-hidden', 'true'); }
    lay(cursor);
    cursor.hidden = !shown;
    cursor.style.transform = `translate(${x}px,${y}px)`;
    cursor.classList.toggle('down', !!(held || pan));
    if (help && !help.hidden) lay(help);
  }
  function toggleHelp() {
    if (!help) {
      help = document.createElement('div'); help.className = 'gp-help'; help.hidden = true; help.setAttribute('role', 'dialog'); help.setAttribute('aria-label', 'Controller');
      help.innerHTML = `<h2>Controller</h2><dl>${CONTROLS.map(([b, what]) => `<dt>${b}</dt><dd>${what}</dd>`).join('')}</dl>`;
    }
    help.hidden = !help.hidden;
    lay(help);
  }
  function tell(text) {
    if (!note) { note = document.createElement('div'); note.className = 'gp-note'; note.setAttribute('role', 'status'); }
    note.textContent = text; note.hidden = false; lay(note);
    clearTimeout(noteTimer); noteTimer = setTimeout(() => { note.hidden = true; }, 4000);
  }
  function hide() {
    if (held) release();
    if (pan) panEnd();
    hover(null);
    shown = false; place();
  }
  addEventListener('mousemove', e => { if (e.isTrusted && shown && (e.movementX || e.movementY)) hide(); }, true);
  addEventListener('pagehide', () => { try { sessionStorage.setItem(SAVE, JSON.stringify({ x, y, shown, hinted })); } catch (e) {} });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (held) release(); if (pan) panEnd(); } });

  /* ---------- reading the controller ---------- */
  const curve = (ax = 0, ay = 0) => { const m = Math.hypot(ax, ay); if (m < DEAD) return [0, 0]; const k = Math.min(1, (m - DEAD) / (1 - DEAD)) ** 2 / m; return [ax * k, ay * k]; };
  let prev = null, padIndex = -1, last = 0, running = false, nextLook = 0;
  const repeatAt = {};
  function tick(pad, dt, now) {
    const on = pad.buttons.map(b => b.pressed);
    // A button already down when the controller is first read while the page loads (the press that opened it) waits
    // for its release. Later, it is the press that showed the controller to this page, and counts.
    if (!prev || pad.index !== padIndex) { prev = now < 1500 ? on.slice() : on.map(() => false); padIndex = pad.index; if (on.some(Boolean)) shown = true; }
    const pressed = i => on[i] && !prev[i];
    const again = i => {
      if (!on[i]) { delete repeatAt[i]; return false; }
      if (!prev[i]) { repeatAt[i] = now + 380; return true; }
      if (now >= (repeatAt[i] ?? Infinity)) { repeatAt[i] = now + 120; return true; }
      return false;
    };
    const [lx, ly] = curve(pad.axes[0], pad.axes[1]), [rx, ry] = curve(pad.axes[2], pad.axes[3]), size = Math.max(innerWidth, innerHeight);
    const wasShown = shown;
    if (lx || ly || rx || ry || on.some((b, i) => b && !prev[i])) shown = true;
    if (shown && !hinted) { hinted = true; tell('Controller connected · Select shows the controls'); }

    if ((lx || ly) && !pan) {
      const speed = size * 0.9 * ((pad.buttons[LT]?.value ?? 0) > 0.3 ? 0.25 : 1);
      x = clamp(x + lx * speed * dt, 0, innerWidth - 1); y = clamp(y + ly * speed * dt, 0, innerHeight - 1);
      moved();
    } else if (shown && now > nextLook) { nextLook = now + 150; hover(hit(x, y)); } // the page may have changed under the cursor

    if (pressed(A)) { if (pan) panEnd(); if (wasShown) press(); }
    else if (!on[A] && held) release();

    if ((rx || ry) && !held) { if (pan || panBy(0, 0)) panBy(rx * size * 0.9 * dt, ry * size * 0.9 * dt); else scroll(rx * size * 1.4 * dt, ry * size * 1.4 * dt); }
    else if (pan) panEnd();

    if (again(LB)) fire(hit(x, y), 'wheel', x, y, { deltaY: WHEEL, deltaMode: 0 });
    if (again(RB)) fire(hit(x, y), 'wheel', x, y, { deltaY: -WHEEL, deltaMode: 0 });
    const active = document.activeElement, field = active && active.matches('select, input[type=number]') ? active : null, list = field && field.tagName === 'SELECT';
    if (again(UP)) { if (field) nudge(field, list ? -1 : 1); else jump(0, -1); }
    if (again(DOWN)) { if (field) nudge(field, list ? 1 : -1); else jump(0, 1); }
    if (again(LEFT)) jump(-1, 0);
    if (again(RIGHT)) jump(1, 0);
    if (pressed(B)) back();
    if (pressed(X)) key('0', 'Digit0');
    if (pressed(START)) main();
    if (pressed(SELECT)) toggleHelp();

    prev = on;
    if (shown || wasShown) place();
  }
  function loop(t) {
    let pads = [];
    try { pads = [...navigator.getGamepads()].filter(p => p && p.connected); } catch (e) {}
    if (!pads.length) { running = false; prev = null; if (held) release(); if (pan) panEnd(); return; }
    const pad = pads.reduce((a, b) => (b.timestamp > a.timestamp ? b : a)); // the one used last
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    try { tick(pad, dt, t); } finally { requestAnimationFrame(loop); }
  }
  const connected = () => { try { return [...navigator.getGamepads()].some(p => p && p.connected); } catch (e) { return false; } };
  function run() { if (!running) { running = true; last = 0; if (note) note.hidden = true; requestAnimationFrame(loop); } }
  addEventListener('gamepadconnected', run);
  if (connected()) run();
  // A browser shows the controller to each new page only once a button is pressed on it, and not every browser tells
  // the page with an event: in a tab that has used a controller, it is looked for.
  if (hinted) {
    setInterval(() => { if (!running && connected()) run(); }, 500);
    setTimeout(() => { if (!running) tell('Press any button to use the controller on this page'); }, 800);
  }
  if (shown) requestAnimationFrame(place);
})();
