// By map: the review page's third view of the stack (review.js), the stack on the map. Beside the map a panel goes
// down a level at a time: the world (every place with cards), a place (its quizzes' layers), a layer (its questions,
// its map drawn on the world as the quiz map draws it), a question (its card, card-view.js). Only what is on the stack
// counts: a question with a card, a layer with such a question, a place with such a layer (the user's rule, 2026-11-09).
//
// The map is coloured by Right: the share right at once of each question's last 10 answers that went to one of its
// cards (CARD_VIEW.right), in the colours of the tries (90%+, 70%+, 50%+, less); a layer, a place and the world by
// the mean of their questions'. A question with cards but no such answer yet is grey.
//
// The buttons are the Stack's own: a place's and a layer's Due and Learned (reviewButtons, common.js), the review and
// all of it at the top of the panel, its ⋯ (review.js hands it over), Open quiz; a card's Now, Sooner, Later and
// Practice (card-view.js). The list button goes to the place's or the quiz's line in the Stack.
//
// Drawn by the quiz maps' own drawing (engine/lib/gl-map.js, WebGL 2), from data made once by
// tools/builds/review-map: data/review/world.json (the countries) and data/review/<quiz page>.json (its layers' units,
// on the same plane), each fetched when first needed.
//
//   REVIEW_MAP.show(host, ctx)   draws it into host (once) and shows the stack as ctx has it now: { index, decks,
//                                places: [[name, decks]], codeOf: name -> ISO numeric, back, menu(what), toStack(place, quiz) }
//   REVIEW_MAP.open(place, quiz, kind, item)   goes to a place, a layer, a question (any of them null)

const REVIEW_MAP = (() => {
  const LEVELS = [0.9, 0.7, 0.5], CLASSES = ["got", "t2", "t3", "miss"], DAY = 864e5;
  const binOf = (v) => (v == null ? "none" : CLASSES[LEVELS.findIndex((l) => v >= l) < 0 ? 3 : LEVELS.findIndex((l) => v >= l)]);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const pct = (x) => (x == null ? "–" : `${Math.round(x * 100)}%`);
  const num = (n) => n.toLocaleString("en-US");
  const parts = (n) => { const i = n.indexOf(" · "); return i < 0 ? [n, ""] : [n.slice(0, i), n.slice(i + 3)]; };
  const base = (k) => k.split("@")[0].split("~")[0];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const keptState = () => { try { return JSON.parse(sessionStorage.getItem("geoquizzes.byMap")) || {}; } catch (e) { return {}; } };
  const keepState = () => { try { sessionStorage.setItem("geoquizzes.byMap", JSON.stringify(st)); } catch (e) {} };

  let ctx = null, ui = null, data = null, sig = "";
  const st = { place: null, layer: null, item: null, sort: "worst", ...keptState() }; // layer: "<quiz>|<layer key>"
  const fetched = new Map();
  const reviewData = (id) => (fetched.has(id) ? fetched.get(id) : fetched.set(id, fetch(`data/review/${id}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null)).get(id));

  /* ---------- the stack's numbers ---------- */
  // places: name -> { name, code, decks, layers: [L], items: Set } ; layers: "<quiz>|<key>" -> { key, quiz, deck, label, place, items: [item keys] }
  // items: "<quiz>|<kind>|<item>" -> { right, rat: [4], last: [answers], due, cards, next }
  function compute() {
    const now = Date.now(), by = data.by, items = new Map(), layers = new Map(), places = new Map();
    for (const [name, decks] of ctx.places) {
      const P = { name, code: ctx.codeOf(name), decks, layers: [], items: new Set() };
      places.set(name, P);
      for (const d of decks) {
        const cards = SRS.cardList(d.id);
        for (const l of d.layers) {
          const L = { key: l.key, quiz: d.quiz, deck: d, l, label: l.label, place: name, items: [], id: `${d.id}|${l.key}` };
          for (const c of cards.filter((c) => c.kind === l.key)) {
            const k = `${d.id}|${base(c.kind)}|${c.item}`;
            let it = items.get(k);
            if (!it) {
              const list = by.get(k) || [], rat = [0, 0, 0, 0];
              for (const a of list) if (a.review && !a.replay && a.g != null && a.at >= now - 30 * DAY) rat[a.g]++;
              it = { key: k, quiz: d.id, kind: base(c.kind), item: c.item, right: CARD_VIEW.right(list), rat, list, due: 0, cards: 0, next: Infinity };
              items.set(k, it);
            }
            it.cards++; if (c.due <= now) it.due++; it.next = Math.min(it.next, c.due);
            if (!L.items.includes(k)) L.items.push(k);
            P.items.add(k);
          }
          if (L.items.length) { layers.set(L.id, L); P.layers.push(L); }
        }
      }
      if (!P.layers.length) places.delete(name);
    }
    return { items, layers, places, now };
  }
  function agg(keys, n) {
    let sum = 0, cnt = 0; const rat = [0, 0, 0, 0];
    for (const k of keys) { const it = n.items.get(k); if (!it) continue; if (it.right != null) { sum += it.right; cnt++; } for (let i = 0; i < 4; i++) rat[i] += it.rat[i]; }
    return { right: cnt ? sum / cnt : null, rat };
  }
  let N = null; // the numbers now

  /* ---------- pieces ---------- */
  function rightChip(v) { const s = el("span", "rm-v " + binOf(v), pct(v)); s.title = "Right at once · last 10 card answers"; return s; }
  function ratingBar(rat) {
    const n = rat.reduce((a, b) => a + b, 0), b = el("span", "rm-bar" + (n ? "" : " nil"));
    if (n) rat.forEach((c, i) => { if (c) { const s = el("i", "r" + i); s.style.flex = String(c); b.append(s); } });
    b.title = n ? ["Missed", "Hard", "Good", "Easy"].map((r, i) => `${r} ${rat[i]}`).join(" · ") + " · 30 days" : "No reviews · 30 days";
    return b;
  }
  function lastDots(it, n = 6) {
    const d = el("span", "rm-dots");
    for (const a of it.list.filter((a) => a.g != null && !a.replay).slice(-n)) { const i = el("i", "r" + a.g); i.title = `${new Date(a.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${a.r === 0 ? "Right" : "Wrong"}`; d.append(i); }
    return d;
  }
  const whenShort = (ts) => { if (!isFinite(ts)) return ""; const s = ts - Date.now(); if (s <= 0) return "now"; const m = Math.ceil(s / 6e4), d = Math.round(s / DAY); return s < DAY ? (m < 60 ? `${m} min` : `${Math.round(m / 60)} h`) : d < 60 ? `${d} d` : d < 730 ? `${Math.round(d / 30.4)} mo` : `${(d / 365).toFixed(1)} y`; };
  const layerName = (L) => (L.quiz.title.toLowerCase().includes(L.label.toLowerCase()) ? L.quiz.title : `${L.quiz.title} · ${L.label}`);
  // a row of the panel: its name (and under it more, and its ratings), its cells, and where a tap on it goes
  function row(cls, name, sub, bar, cells, go, sel) {
    const r = el("div", "rm-row" + (cls ? " " + cls : "") + (sel ? " sel" : "")); r.tabIndex = 0; r.setAttribute("role", "button");
    const nm = el("span", "nm"); nm.append(el("b", "", name)); if (sub) nm.append(el("small", "", sub)); if (bar) nm.append(bar);
    r.append(nm, ...cells);
    r.onclick = (e) => { if (!e.target.closest("button, a, select")) go(); };
    r.onkeydown = (e) => { if (e.key === "Enter" && e.target === r) go(); };
    return r;
  }
  const cell = (...kids) => { const c = el("span", "c"); c.append(...kids); return c; };
  // the Stack's two buttons for a place or a layer (chip look), or when its next card is due
  function chips(quizzes, layer, made, next) {
    const [due, all] = reviewButtons(ctx.index, quizzes, ctx.back, "chip", layer, made) ?? [];
    const sum = made.reduce((s, x) => s + x.due, 0);
    return [due && sum ? cell(due) : cell(el("span", "when", whenShort(next))), cell(all || "")];
  }
  const colHead = (cls, labels) => { const h = el("div", "rm-colh" + (cls ? " " + cls : "")); h.append(el("span"), ...labels.map((t) => el("span", "", t))); return h; };

  /* ---------- the panel ---------- */
  function level() { return st.item ? "item" : st.layer ? "layer" : st.place ? "place" : "world"; }
  function crumbs() {
    const c = el("nav", "rm-crumbs"); c.setAttribute("aria-label", "Where");
    const add = (label, go) => { if (c.childNodes.length) c.append(el("span", "sep", "›")); if (go) { const b = el("button", "linkbtn", label); b.type = "button"; b.onclick = go; c.append(b); } else c.append(el("b", "", label)); };
    const P = st.place && N.places.get(st.place), L = st.layer && N.layers.get(st.layer), lv = level();
    add("World", lv === "world" ? null : () => go(null));
    if (P) add(P.name, lv === "place" ? null : () => go(P.name));
    if (L) add(layerName(L), lv === "layer" ? null : () => go(P.name, L.id));
    if (st.item) { const it = N.items.get(st.item); add(it ? parts(nameOfItem(it))[0] : "", null); }
    return c;
  }
  const nameOfItem = (it) => {
    const n = data.names.get(it.key);
    if (n) return n;
    const called = STORE.quiz(it.quiz).called || {}, c = called[`${it.kind}|${it.item}`] ?? Object.entries(called).find(([k]) => k.startsWith(it.kind + "~") && k.endsWith("|" + it.item))?.[1];
    return c ? c.filter(Boolean).join(" · ") : it.item;
  };
  function fill() {
    const p = ui.panel, lv = level(), P = st.place && N.places.get(st.place), L = st.layer && N.layers.get(st.layer);
    const keep = p.scrollTop;
    p.replaceChildren(crumbs());
    if (lv === "item") {
      const it = N.items.get(st.item), q = it && CARD_VIEW.questionOf(it.quiz, it.kind, it.item), host = el("div", "rm-card");
      p.append(host);
      if (q) CARD_VIEW.render(host, q, { changed: () => ctx.redraw() });
      return;
    }
    const keys = lv === "layer" ? L.items : lv === "place" ? [...P.items] : [...N.items.keys()];
    const s = agg(keys, N), decks = lv === "layer" ? [L.deck] : lv === "place" ? P.decks : ctx.decks;
    const cards = lv === "layer" ? L.l.total : decks.reduce((a, d) => a + d.total, 0), due = lv === "layer" ? L.l.due : decks.reduce((a, d) => a + d.due, 0);
    // the head: its name, the list button, its numbers
    const head = el("div", "rm-head"), h = el("h2", "", lv === "layer" ? layerName(L) : lv === "place" ? P.name : "World");
    h.append(el("small", "", lv === "layer" ? P.name : lv === "place" ? (P.code ? "" : "Not on the map") : `${N.places.size} places`));
    head.append(h);
    if (lv !== "world") {
      const b = el("button", "rm-icon"); b.type = "button"; b.title = b.ariaLabel = "In the Stack";
      b.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 4h8.5M5.5 8h8.5M5.5 12h8.5"/><path d="M2 4h.6M2 8h.6M2 12h.6" stroke-width="2.2"/></svg>';
      b.onclick = () => ctx.toStack(P.name, L ? L.deck.id : null);
      head.append(b);
    }
    p.append(head);
    const sum = el("p", "rm-sum"); sum.append(rightChip(s.right), ` ${num(cards)} cards · ${num(due)} due`);
    if (lv === "layer") { const t = layerTotal(L); if (t) sum.append(` · ${num(L.items.length)}/${num(t)} learned`); }
    p.append(sum, ratingBar(s.rat));
    // its buttons: the Stack's
    if (lv !== "world") {
      const acts = el("div", "rm-acts"), made = lv === "layer" ? [L.l] : decks;
      const btns = reviewButtons(ctx.index, decks.map((d) => d.quiz), ctx.back, "top", lv === "layer" ? { id: L.deck.id, key: L.key, quiz: L.quiz } : null, made) ?? [];
      acts.append(...btns);
      if (lv === "layer" && L.quiz.url) { const a = el("a", "ghost", "Open quiz"); a.href = L.quiz.url; acts.append(a); }
      acts.append(el("span", "sp"));
      const menu = ctx.menu(lv === "layer" ? { deck: L.deck, layer: L.l } : { place: P.name });
      if (menu) acts.append(menu);
      p.append(acts);
    }
    // what is one level down
    if (lv === "world") {
      const sect = el("div", "rm-sect"), sorts = el("div", "view-pick");
      for (const [k, t] of [["worst", "Worst first"], ["cards", "Most cards"], ["az", "A–Z"]]) { const b = el("button", "", t); b.type = "button"; b.setAttribute("aria-pressed", st.sort === k); b.onclick = () => { st.sort = k; keepState(); fill(); }; sorts.append(b); }
      sect.append(el("h3", "", "Places"), sorts);
      p.append(legend(), sect, colHead("", ["Right", "Due", "Learned"]));
      const list = el("div", "rm-rows"), all = [...N.places.values()].map((P) => ({ P, s: agg([...P.items], N), cards: P.decks.reduce((a, d) => a + d.total, 0) }));
      all.sort(st.sort === "az" ? (a, b) => a.P.name.localeCompare(b.P.name) : st.sort === "cards" ? (a, b) => b.cards - a.cards : (a, b) => (a.s.right ?? 9) - (b.s.right ?? 9) || b.cards - a.cards);
      for (const { P, s, cards } of all) list.append(row("", P.name, `${num(cards)} cards${P.code ? "" : " · not on the map"}`, ratingBar(s.rat), [cell(rightChip(s.right)), ...chips(P.decks.map((d) => d.quiz), null, P.decks, Math.min(...P.decks.map((d) => d.next)))], () => go(P.name), false));
      p.append(list);
    } else if (lv === "place") {
      p.append(el("h3", "rm-sect", "Quizzes"), colHead("", ["Right", "Due", "Learned"]));
      const list = el("div", "rm-rows");
      const all = P.layers.map((L) => ({ L, s: agg(L.items, N) })).sort((a, b) => (a.s.right ?? 9) - (b.s.right ?? 9) || b.L.l.total - a.L.l.total);
      for (const { L, s } of all) {
        const t = layerTotal(L);
        list.append(row("", layerName(L), [t ? `${num(L.items.length)}/${num(t)} learned` : null, `${num(L.l.total)} cards`].filter(Boolean).join(" · "), ratingBar(s.rat),
          [cell(rightChip(s.right)), ...chips([L.quiz], { id: L.deck.id, key: L.key, quiz: L.quiz }, [L.l], L.l.next)], () => go(P.name, L.id), false));
      }
      p.append(list);
    } else {
      p.append(el("h3", "rm-sect", "Questions · worst first"), colHead("q", ["Right", "Last", "Due"]));
      const list = el("div", "rm-rows"), its = L.items.map((k) => N.items.get(k)).sort((a, b) => (a.right ?? 9) - (b.right ?? 9) || b.list.length - a.list.length);
      for (const it of its) { const [a, b] = parts(nameOfItem(it)); list.append(row("q", a, b, null, [cell(rightChip(it.right)), cell(lastDots(it)), cell(el("span", "when", it.due ? "now" : whenShort(it.next)))], () => go(P.name, L.id, it.key), st.item === it.key)); }
      p.append(list);
    }
    p.scrollTop = keep;
  }
  function legend() {
    const ul = el("ul", "rm-legend");
    for (const [c, t] of [["got", "90%+"], ["t2", "70%+"], ["t3", "50%+"], ["miss", "Under 50%"], ["none", "No card answers"]]) { const li = el("li"); li.append(el("i", c), t); ul.append(li); }
    return ul;
  }
  const layerTotal = (L) => { const r = reviewCache.get(L.deck.id); const k = r && r.kinds && (r.kinds[base(L.key)] || r.kinds[L.key]); return k ? k.n : null; };
  const reviewCache = new Map(); // quiz id -> its review data, once fetched

  /* ---------- the map ---------- */
  let plane = null; // { W, H } of data/review/world.json
  // the quiz maps' drawing (gl-map.js, with earcut.js), fetched the first time the map is shown
  let libs = null;
  const loadLibs = () => (libs ||= Promise.all(["engine/lib/earcut.js", "engine/lib/gl-map.js"].map((src) => new Promise((ok) => {
    const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ok; document.head.append(s);
  }))));
  function build(host) {
    host.replaceChildren();
    const root = el("div", "rm"), stage = el("div", "rm-stage"), svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"), panel = el("aside", "rm-panel");
    svg.setAttribute("class", "rm-svg"); svg.setAttribute("aria-label", "Map of the stack");
    const tag = el("div", "rm-tag"); tag.hidden = true;
    const zoom = el("div", "rm-zoom"), zin = el("button", "", "+"), zout = el("button", "", "−");
    zin.type = zout.type = "button"; zin.ariaLabel = "Zoom in"; zout.ariaLabel = "Zoom out"; zoom.append(zin, zout);
    const tip = el("div", "rm-tip"); tip.hidden = true;
    stage.append(svg, tag, zoom, tip); root.append(stage, panel); host.append(root);
    const S = typeof mapShapes === "function" ? mapShapes() : null, gl = S && glMap(stage, svg, S);
    if (!gl) { stage.append(el("p", "rm-nogl", "WebGL 2 needed")); }
    // (the fills, then every outline above them all, as the quiz maps draw them: no fill covers a neighbour's line)
    const g = { world: S && S.el("g"), units: S && S.el("g"), worldLines: S && S.el("g"), unitLines: S && S.el("g") };
    if (S) {
      for (const [k, cls] of [["world", "world"], ["units", "units"], ["worldLines", "world-lines"], ["unitLines", "unit-lines"]]) g[k].setAttribute("class", cls);
      S.ctx.append(g.world); S.regions.append(g.units); S.borders.append(g.worldLines, g.unitLines);
    }
    ui = { root, stage, svg, panel, tag, tip, S, gl, g, zin, zout, v: null, anim: 0, countries: new Map(), units: [], shown: null };
    if (gl) wire();
  }
  // An outline for the drawing: in numbers where gl-map.js takes them (ReadyPath), else as a path's text.
  const outline = (parts) => (typeof ReadyPath === "function" ? new ReadyPath(parts) : parts.map(({ p, closed }) => { let d = ""; for (let i = 0; i < p.length; i += 2) d += (i ? "L" : "M") + p[i] + "," + p[i + 1]; return closed ? d + "Z" : d; }).join(""));
  const ring = (a) => { const p = [a[0], a[1]]; let x = a[0], y = a[1]; for (let i = 2; i < a.length; i += 2) { x += a[i]; y += a[i + 1]; p.push(x, y); } return p; };
  const boxOfRings = (rs) => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const p of rs) for (let i = 0; i < p.length; i += 2) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]); } return isFinite(x0) ? [x0, y0, x1 - x0, y1 - y0] : null; };
  async function drawWorld() {
    if (!ui.gl || ui.countries.size) return;
    const w = await fetch("data/review/world.json").then((r) => (r.ok ? r.json() : null)).catch(() => null);
    if (!w) return;
    plane = { W: w.W, H: w.H };
    for (const c of w.countries) {
      const rs = c.r.map(ring), n = ui.S.el("path"), line = ui.S.el("path"), d = outline(rs.map((p) => ({ p, closed: true })));
      n.setAttribute("d", d); n.setAttribute("class", "c"); n.dataset.c = c.id;
      line.setAttribute("d", d); line.setAttribute("class", "co");
      ui.g.world.append(n); ui.g.worldLines.append(line);
      ui.countries.set(c.id, { n, line, name: c.n, box: boxOfRings(rs.length > 1 ? rs.filter((p) => p.length >= 6) : rs) });
    }
    if (!ui.v) setView([0, 0, plane.W, plane.H]);
  }
  // the units of a layer drawn (null: none), each a shape with the items it stands for
  async function drawLayer(L) {
    const want = L ? L.id : null;
    if (ui.shown === want) return;
    ui.shown = want; ui.units = []; ui.g.units.replaceChildren(); ui.g.unitLines.replaceChildren(); ui.box = null;
    if (!L) return;
    const r = await reviewData(L.deck.id); reviewCache.set(L.deck.id, r);
    if (ui.shown !== want || !r || !r.kinds) return;
    const K = r.kinds[base(L.key)] || r.kinds[L.key];
    if (!K || !K.units) return;
    ui.box = K.box;
    const dots = [];
    for (const u of K.units) {
      const n = ui.S.el("path"), items = u.i.map((i) => `${L.deck.id}|${base(L.key)}|${i}`);
      // (a dot or a line of no question on the stack is not drawn: a city not learned yet is not on the map; an area
      // is, as land, so that the country keeps its shape)
      if ((u.p || !u.r) && !items.some((k) => N.items.has(k))) continue;
      if (u.p) { n.setAttribute("d", outline([{ p: [u.p[0], u.p[1], u.p[0], u.p[1]], closed: false }])); n.setAttribute("class", "dt"); n.rings = [[u.p[0], u.p[1]]]; dots.push(n); }
      else {
        const parts = [...(u.r || []).map((a) => ({ p: ring(a), closed: true })), ...(u.l || []).map((a) => ({ p: ring(a), closed: false }))], d = outline(parts);
        n.rings = parts.map((s) => s.p);
        n.setAttribute("d", d); n.setAttribute("class", u.r ? "u" : "ln"); ui.g.units.append(n);
        if (u.r) { n.line = ui.S.el("path"); n.line.setAttribute("d", d); n.line.setAttribute("class", "uo"); ui.g.unitLines.append(n.line); }
      }
      n.items = items; ui.units.push(n);
    }
    for (const n of dots) ui.g.units.append(n); // (dots on top)
  }
  function paint() {
    if (!ui.gl) return;
    const P = st.place && N.places.get(st.place), lv = level(), under = !!ui.shown;
    for (const [code, c] of ui.countries) {
      const places = [...N.places.values()].filter((x) => x.code === code);
      let cls = "c";
      if (places.length) cls += " has";
      if (places.length && !under && (!P || P.code === code)) cls += " " + binOf(agg(places.flatMap((x) => [...x.items]), N).right);
      if (P && P.code !== code) cls += " dim";
      if (under) cls += " under";
      c.n.setAttribute("class", cls);
      // (the place shown: its line firm; under its quiz's own places none, theirs being finer than the world's)
      c.line.setAttribute("class", "co" + (places.length ? " has" : "") + (under ? " under" : "") + (P && P.code === code ? (under ? " self" : " own") : ""));
    }
    for (const n of ui.units) {
      const its = n.items.map((k) => N.items.get(k)).filter(Boolean), vs = its.map((it) => it.right).filter((v) => v != null);
      let cls = n.getAttribute("class").split(" ")[0];
      cls += " " + (vs.length ? binOf(vs.reduce((a, b) => a + b, 0) / vs.length) : its.length ? "none" : "empty");
      if (st.item && n.items.includes(st.item)) cls += " sel";
      n.setAttribute("class", cls);
      n.dataset.on = its.length ? "1" : "0";
      if (n.line) { const sel = st.item && n.items.includes(st.item); n.line.setAttribute("class", "uo" + (its.length ? "" : " empty") + (sel ? " sel" : "")); if (sel) ui.g.unitLines.append(n.line); } // (the chosen one's line on top)
    }
    const L = st.layer && N.layers.get(st.layer);
    ui.tag.textContent = L ? layerName(L) : ""; ui.tag.hidden = !L || !ui.units.length;
    void lv;
  }
  // where the map goes: the layer's frame, else the place's country, else the world; a question: closer to it
  function frame() {
    const P = st.place && N.places.get(st.place);
    let box = ui.box || (P && P.code && ui.countries.get(P.code)?.box) || (plane && [0, 0, plane.W, plane.H]);
    if (st.item && box) {
      const n = ui.units.find((u) => u.items.includes(st.item));
      const b = n && boxOfRings(n.rings || []);
      if (b) { const mw = box[2] / 3.2, mh = box[3] / 3.2; if (b[2] < mw && b[3] < mh) { const cx = b[0] + b[2] / 2, cy = b[1] + b[3] / 2; box = [cx - mw / 2, cy - mh / 2, mw, mh]; } }
    }
    if (box) fly(box);
  }

  /* ---------- the view: moving, zooming, flying ---------- */
  // The dots' size on the screen as the quiz maps have it (engine/map/view.js): 11 px where the layer (or the world)
  // fits the map, growing with the square root of the zoom past that (the stylesheet sizes them by --dot).
  function setView(v) {
    ui.v = v;
    const r = ui.stage.getBoundingClientRect(), fit = (b) => Math.min((r.width || 1) / b[2], (r.height || 1) / b[3]);
    const s = fit(v), s0 = fit(ui.box || [0, 0, plane.W, plane.H]), dot = 11 * Math.sqrt(Math.max(1, s / s0));
    ui.svg.style.setProperty("--dot", dot.toFixed(2) + "px");
    ui.gl.view({ x: v[0], y: v[1], w: v[2], h: v[3] }, dot);
  }
  function fly(t) {
    const r = ui.stage.getBoundingClientRect(), aspect = (r.width || 800) / (r.height || 500), pad = 0.08;
    let [x, y, w, h] = t; w = Math.max(w, plane.W / 4000); h = Math.max(h, plane.W / 4000);
    x -= w * pad; y -= h * pad; w *= 1 + 2 * pad; h *= 1 + 2 * pad;
    if (w / h < aspect) { const nw = h * aspect; x -= (nw - w) / 2; w = nw; } else { const nh = w / aspect; y -= (nh - h) / 2; h = nh; }
    const to = [x, y, w, h], from = ui.v || to;
    cancelAnimationFrame(ui.anim);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setView(to);
    const t0 = performance.now(), D = 520;
    const step = (ts) => {
      const k = Math.min(1, (ts - t0) / D), e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
      const lw = Math.exp(Math.log(from[2]) + (Math.log(to[2]) - Math.log(from[2])) * e), lh = Math.exp(Math.log(from[3]) + (Math.log(to[3]) - Math.log(from[3])) * e);
      const cx = from[0] + from[2] / 2 + (to[0] + to[2] / 2 - from[0] - from[2] / 2) * e, cy = from[1] + from[3] / 2 + (to[1] + to[3] / 2 - from[1] - from[3] / 2) * e;
      setView([cx - lw / 2, cy - lh / 2, lw, lh]);
      if (k < 1) ui.anim = requestAnimationFrame(step);
    };
    ui.anim = requestAnimationFrame(step);
  }
  // a point on the screen as a point of the plane (the view fits the stage as gl-map fits it)
  function toMap(cx, cy) {
    const r = ui.stage.getBoundingClientRect(), [x, y, w, h] = ui.v, s = Math.min(r.width / w, r.height / h);
    return { x: x + (cx - r.left - (r.width - w * s) / 2) / s, y: y + (cy - r.top - (r.height - h * s) / 2) / s, s };
  }
  function zoomAt(f, cx, cy) {
    const r = ui.stage.getBoundingClientRect(); cx ??= r.left + r.width / 2; cy ??= r.top + r.height / 2;
    const p = toMap(cx, cy), [x, y, w, h] = ui.v, nw = Math.min(plane.W * 1.5, Math.max(plane.W / 20000, w * f)), k = nw / w;
    cancelAnimationFrame(ui.anim);
    setView([p.x - (p.x - x) * k, p.y - (p.y - y) * k, w * k, h * k]);
  }
  function wire() {
    const c = ui.gl.canvas, ptrs = new Map();
    let drag = null, moved = false;
    c.addEventListener("pointerdown", (e) => { ptrs.set(e.pointerId, [e.clientX, e.clientY]); if (ptrs.size === 1) { drag = { x: e.clientX, y: e.clientY, v: ui.v.slice() }; moved = false; } else drag = null; c.setPointerCapture(e.pointerId); });
    c.addEventListener("pointermove", (e) => {
      if (ptrs.has(e.pointerId)) {
        const was = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
        if (ptrs.size === 2) { // pinch
          const [a, b] = [...ptrs.values()], other = [...ptrs.entries()].find(([id]) => id !== e.pointerId)[1];
          const d0 = Math.hypot(was[0] - other[0], was[1] - other[1]), d1 = Math.hypot(a[0] - b[0], a[1] - b[1]);
          if (d0 > 0 && d1 > 0) zoomAt(d0 / d1, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
          moved = true; hideTip(); return;
        }
        if (drag) {
          const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
          if (!moved && Math.hypot(dx, dy) > 5) { moved = true; ui.svg.classList.add("grab"); hideTip(); cancelAnimationFrame(ui.anim); }
          if (moved) { const s = toMap(0, 0).s; setView([drag.v[0] - dx / s, drag.v[1] - dy / s, drag.v[2], drag.v[3]]); return; }
        }
      }
      if (e.pointerType === "mouse") hover(e);
    });
    const up = (e) => {
      const was = ptrs.has(e.pointerId); ptrs.delete(e.pointerId);
      if (!was || ptrs.size) return;
      ui.svg.classList.remove("grab");
      if (!moved && drag) tap(e);
      drag = null;
    };
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", (e) => { ptrs.delete(e.pointerId); drag = null; ui.svg.classList.remove("grab"); });
    c.addEventListener("pointerleave", hideTip);
    c.addEventListener("wheel", (e) => { e.preventDefault(); zoomAt(Math.exp(e.deltaY * 0.0016), e.clientX, e.clientY); }, { passive: false });
    ui.zin.onclick = () => zoomAt(0.6); ui.zout.onclick = () => zoomAt(1 / 0.6);
    new ResizeObserver(() => { if (ui.v) setView(ui.v); }).observe(ui.stage);
  }
  const shapeAt = (e) => ui.gl.at(toMap(e.clientX, e.clientY));
  // A tap: on a question's place, that question (of the layer drawn); on a country with cards, that place; on nothing
  // with cards (the sea, a country or a place without), one level up (the user's rule, 2026-11-10).
  function tap(e) {
    const n = shapeAt(e), up = () => (st.item ? go(st.place, st.layer || ui.shown) : st.layer ? go(st.place) : st.place ? go(null) : null);
    const its = n && n.items ? n.items.filter((k) => N.items.has(k)) : [];
    if (its.length) {
      its.sort((a, b) => (N.items.get(a).right ?? 2) - (N.items.get(b).right ?? 2));
      return go(st.place, st.layer || ui.shown, its[0]);
    }
    const P = n && n.dataset.c ? [...N.places.values()].find((x) => x.code === n.dataset.c) : null;
    if (P && P.name !== st.place) return go(P.name);
    if (P && !st.layer && !st.item) return; // (the place shown, tapped where it has no question drawn: stays)
    up();
  }
  function hover(e) {
    const n = shapeAt(e);
    if (n && n.items) {
      const its = n.items.map((k) => N.items.get(k)).filter(Boolean);
      if (!its.length) return hideTip();
      showTip(e, its.slice(0, 4).map((it) => { const [a, b] = parts(nameOfItem(it)); return `<b>${esc(a)}</b>${b ? ` <span>${esc(b)}</span>` : ""} · ${pct(it.right)}`; }).join("<br>") + (its.length > 4 ? `<br><span>+${its.length - 4}</span>` : ""));
    } else if (n && n.dataset.c) {
      const places = [...N.places.values()].filter((x) => x.code === n.dataset.c), name = ui.countries.get(n.dataset.c)?.name || "";
      if (!places.length) return showTip(e, `<span>${esc(name)}</span>`);
      const s = agg(places.flatMap((x) => [...x.items]), N), cards = places.reduce((a, x) => a + x.decks.reduce((b, d) => b + d.total, 0), 0);
      showTip(e, `<b>${esc(places[0].name)}</b> · Right ${pct(s.right)}<br><span>${num(cards)} cards</span>`);
    } else hideTip();
  }
  function showTip(e, html) {
    const t = ui.tip, r = ui.stage.getBoundingClientRect(); t.innerHTML = html; t.hidden = false;
    const w = t.offsetWidth, h = t.offsetHeight; let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
    if (x + w > r.width - 6) x = e.clientX - r.left - w - 14; if (y + h > r.height - 6) y = e.clientY - r.top - h - 14;
    t.style.left = `${Math.max(4, x)}px`; t.style.top = `${Math.max(4, y)}px`;
  }
  const hideTip = () => { if (ui) ui.tip.hidden = true; };

  /* ---------- going somewhere ---------- */
  // the layer a place opens on: one with a map, regions first, then the most cards
  async function leadOf(P) {
    const rs = await Promise.all(P.layers.map((L) => reviewData(L.deck.id).then((r) => { reviewCache.set(L.deck.id, r); return r; })));
    const withMap = P.layers.filter((L, i) => { const k = rs[i] && rs[i].kinds && (rs[i].kinds[base(L.key)] || rs[i].kinds[L.key]); return k && k.units; });
    return withMap.sort((a, b) => (b.quiz.role === "regions") - (a.quiz.role === "regions") || b.l.total - a.l.total)[0] || null;
  }
  async function go(place = null, layer = null, item = null) {
    st.place = place; st.layer = layer; st.item = item; keepState();
    hideTip();
    if (!N) return;
    const P = place && N.places.get(place);
    if (P) await Promise.all(P.layers.map((L) => reviewData(L.deck.id).then((r) => reviewCache.set(L.deck.id, r))));
    fill();
    if (!ui.gl) return;
    const L = layer ? N.layers.get(layer) : P ? await leadOf(P) : null;
    await drawLayer(L);
    paint(); frame();
  }

  /* ---------- shown ---------- */
  async function show(host, c) {
    ctx = c;
    if (!ui || !host.contains(ui.root)) { await loadLibs(); if (!ui || !host.contains(ui.root)) build(host); }
    data = await CARD_VIEW.data();
    const now = Date.now(), s = ctx.decks.map((d) => `${d.id}:${d.total}:${d.due}`).join(",") + "|" + data.answers.length + "|" + Math.floor(now / 6e4);
    if (s === sig && N && !wanted) return; // (nothing shown has changed)
    sig = s;
    N = compute();
    if (ui) ui.shown = undefined; // (the layer drawn anew: what is on the stack may have changed)
    if (wanted) { aim(wanted); wanted = null; }
    // (a place or a layer gone from the stack: up to what is left)
    if (st.item && !N.items.has(st.item)) st.item = null;
    if (st.layer && !N.layers.has(st.layer)) st.layer = null;
    if (st.place && !N.places.has(st.place)) { st.place = null; st.layer = null; st.item = null; }
    await drawWorld();
    await go(st.place, st.layer, st.item);
  }
  // from elsewhere (a Stack line's map button, a card's Map): a place by name, or a quiz's layer, or a question
  // (asked before the map has its numbers: done once it has them, in show)
  let wanted = null;
  function aim([place, quiz, kind, item]) {
    st.place = place; st.layer = null; st.item = null;
    // (a quiz without a layer named: its layer with the most cards)
    const of = quiz ? [...N.layers.values()].filter((L) => L.deck.id === quiz).sort((a, b) => b.l.total - a.l.total) : [];
    const L = kind ? of.find((L) => L.key === kind) || of.find((L) => base(L.key) === base(kind)) : of[0];
    if (L) { st.place = L.place; st.layer = L.id; if (item != null) st.item = `${quiz}|${base(L.key)}|${item}`; }
    keepState();
  }
  function open(place, quiz, kind, item) {
    wanted = [place, quiz, kind, item];
    if (N && ui && ui.root.isConnected) { aim(wanted); wanted = null; go(st.place, st.layer, st.item); }
  }
  return { show, open };
})();
