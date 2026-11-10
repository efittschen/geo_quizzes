// The card: a question on the stack, with how it went and what its schedule holds. One view wherever a question is
// opened on the review page: a card's line in the Stack (By quiz, By due), a question on the map (By map,
// review-map.js) and a question of the stack in the Stats tab (stats.js). A question with cards on several maps or in
// several ways shows one of them at a time (chips).
//
// Four ways to see a card (Curve, Log, Strip, Values; the choice kept in this browser):
//   Curve    the chance of recalling it over time as FSRS has it: falling from each answer at the card's stability then,
//            each answer a dot on it (a review's by its rating, a round's right or wrong)
//   Log      every answer (when, rating, result, time, the interval it gave, the way and the map, what was given instead),
//            and the intervals as steps
//   Strip    the answers as squares, day by day
//   Values   FSRS's numbers over time, one chart each: stability, difficulty, the interval, and the chance of recall at
//            each answer. Kept with each rated answer since 2026-11-10 (answers.js, k); before that worked out from the
//            log and the card's values now: the interval as logged; the stability from it (the stability whose
//            interval at the target retention it is); the difficulty back from today's through the logged ratings
//            (FSRS's own rule run backwards); the chance of recall from the stability before. Points worked out are
//            hollow, kept ones filled.
// Right counts only the answers that went to one of the question's cards (a.g set): a round answer on a map or in a
// way it has no card for leaves it alone (the user's rule, 2026-11-10).
//
//   CARD_VIEW.configure({ practiceUrl, onMap })   the Stats tab's practice address, the map's "show it"
//   CARD_VIEW.data()          the answer log, read once and again after it changes: { answers, names } (a promise)
//   CARD_VIEW.questionOf(quiz, kind, item)   { quiz, kind, item, cards } where the question has cards, else null
//   CARD_VIEW.render(host, q, opts)          the card into host (opts.map: a Map button; opts.changed(): after Now…)
//   CARD_VIEW.open(quiz, kind, item, opts)   the card in a pop-up; false where the question has no card
//   CARD_VIEW.right(answers)  the share right at once of a question's last 10 card answers (null: none)

const CARD_VIEW = (() => {
  const DAY = 864e5, NS = "http://www.w3.org/2000/svg", LAST = 10;
  // FSRS-6 (srs.js): the decay, the factor, its default weights for the difficulty's rule and a new card's stability
  const W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001];
  const DECAY = -0.1542, FACTOR = 0.9 ** (1 / DECAY) - 1;
  const recall = (days, st) => (1 + FACTOR * days / st) ** DECAY;
  const firstDifficulty = (r) => W[4] - Math.exp(W[5] * (r - 1)) + 1;
  const RATINGS = ["Missed", "Hard", "Good", "Easy"];
  const MODES = { map: "Map", list: "List", type: "Type", pairs: "Pairs", pick: "Pick", pickback: "Pick back", code: "Type code", draw: "Draw", name: "Name it", shape: "Shape", paint: "Paint", cards: "Cards" };
  const LOOKS = { quiz: "Quiz map", overlay: "Overlay", street: "Street map", bare: "Bare map", sat: "Satellite", free: "Map" };
  const VIEWS = [["curve", "Curve"], ["log", "Log"], ["strip", "Strip"], ["values", "Values"]];
  let cfg = { practiceUrl: null, onMap: null };

  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const sv = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  const pct = (x) => (x == null ? "–" : `${Math.round(x * 100)}%`);
  const secs = (ms) => (ms == null ? "–" : ms < 9950 ? `${(ms / 1000).toFixed(1)} s` : `${Math.round(ms / 1000)} s`);
  const dShort = (ms) => new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const dTime = (ms) => `${dShort(ms)} ${new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  const span = (days) => { const m = days * 1440; return m < 60 ? `${Math.max(1, Math.round(m))} min` : m < 1440 ? `${Math.round(m / 60)} h` : days < 60 ? `${Math.round(days)} d` : days < 730 ? `${Math.round(days / 30.4)} mo` : `${(days / 365).toFixed(1)} y`; };
  const median = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const parts = (n) => { const i = n.indexOf(" · "); return i < 0 ? [n, ""] : [n.slice(0, i), n.slice(i + 3)]; };
  const base = (k) => k.split("@")[0].split("~")[0];
  const wayOf = (k) => (k.split("@")[0].split("~")[1] || "");
  // the view chosen: one of the player's settings (store.js; no entry of its own: store.js takes those for old ones);
  // the card chosen of a question with several: only while the page is open
  const viewKept = () => { const v = STORE.settings().cardView; return VIEWS.some(([k]) => k === v) ? v : "curve"; };
  const keepView = (v) => STORE.setSettings((s) => { s.cardView = v; });
  const picked = new Map();

  /* ---------- the answer log, read once ---------- */
  let loaded = null;
  const data = () => (loaded ||= (typeof ANSWERS === "object" ? ANSWERS.all() : Promise.resolve({ answers: [], names: new Map() })).then((d) => {
    const by = new Map();
    for (const a of d.answers) { const k = `${a.quiz}|${a.kind}|${a.item}`; (by.get(k) || by.set(k, []).get(k)).push(a); }
    return { ...d, by };
  }));
  if (typeof ANSWERS === "object") ANSWERS.listen(() => { loaded = null; });

  // Right: the share right at once of the last LAST first answers that went to a card
  const right = (list) => { const l = list.filter((a) => a.g != null && !a.replay).slice(-LAST); return l.length ? l.filter((a) => a.r === 0).length / l.length : null; };

  /* ---------- a question and its cards ---------- */
  function questionOf(quiz, kind, item) {
    const k = base(kind), cards = SRS.cardList(quiz).filter((c) => base(c.kind) === k && c.item === String(item));
    if (!cards.length) return null;
    const deck = SRS.deck(quiz);
    return { quiz, kind: k, item: String(item), cards: cards.map((c) => ({ ...c, way: wayOf(c.key), raw: deck.c[c.key] })) };
  }
  // the answers of one card: rated ones on its map in its way (a card without a way: on the map, or a way none of the
  // question's cards has); all of them where none is such
  function answersOf(q, c, list) {
    const ways = new Set(q.cards.map((x) => x.way).filter(Boolean));
    const mine = list.filter((a) => (a.look || "") === (c.look || "") && (c.way ? a.mode === c.way : !ways.has(a.mode)));
    return mine.length ? mine : list;
  }
  const nameOf = (q, names) => {
    const n = names.get(`${q.quiz}|${q.kind}|${q.item}`);
    if (n) return n;
    const called = STORE.quiz(q.quiz).called || {}, c = called[`${q.kind}|${q.item}`] ?? Object.entries(called).find(([k]) => k.startsWith(q.kind + "~") && k.endsWith("|" + q.item))?.[1];
    return c ? c.filter(Boolean).join(" · ") : q.item;
  };
  const cardLabel = (c) => [LOOKS[(c.look || "quiz").split("+")[0]] || c.look, c.way ? MODES[c.way] || c.way : ""].filter(Boolean).join(" · ");

  /* ---------- FSRS's values at each rated answer: kept, or worked out (see above) ---------- */
  function history(c, ans) {
    const o = SRS.opts(), R = (o.retain || 90) / 100, card = c.raw || {};
    const rated = ans.filter((a) => a.g != null);
    const pts = rated.map((a) => ({ at: a.at, g: a.g, iv: a.iv, learning: a.learning, st: a.st, df: a.df, kept: a.st != null && a.df != null }));
    // the interval and the stability it stands for (a step within the day stands for none)
    for (const p of pts) {
      p.ivDays = p.iv != null ? p.iv / 1440 : null;
      if (!p.kept && p.iv != null && p.iv >= 720) p.st = Math.ceil(p.iv / 1440 - 1e-9) * FACTOR / (R ** (1 / DECAY) - 1);
    }
    // the last answer is the card's own now (it was answered last then), whatever was worked out
    const last = pts[pts.length - 1];
    if (last && card.l && Math.abs(card.l - last.at) < 120000 && card.st != null) { last.st = card.st; last.df = card.df; last.now = true; }
    // the difficulty back from the last known one through the ratings
    let after = null;
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      if (p.df != null && (p.kept || p.now)) after = p.df;
      else if (after != null) p.df = after;
      if (after != null && i > 0) {
        const r = p.g + 1, cc = -W[6] * (r - 3) / 9, x = (after - W[7] * firstDifficulty(4)) / (1 - W[7]);
        after = Math.min(10, Math.max(1, (x - 10 * cc) / (1 - cc)));
      }
    }
    // the chance of recall at each answer, from the stability before it (by the days between, as FSRS counts them)
    for (let i = 1; i < pts.length; i++) { const prev = pts[i - 1]; if (prev.st != null) pts[i].R = recall(Math.max(0, SRS.days(prev.at, pts[i].at)), prev.st); }
    return pts;
  }

  /* ---------- charts ---------- */
  function ticks(t0, t1) {
    const days = (t1 - t0) / DAY, step = days <= 8 ? 1 : days <= 20 ? 3 : days <= 45 ? 7 : days <= 100 ? 14 : 30, out = [];
    const d = new Date(t0); d.setHours(0, 0, 0, 0); let t = d.getTime() + DAY;
    while (t < t1) { out.push(t); t += step * DAY; }
    return out;
  }
  const text = (attrs, s) => { const t = sv("text", attrs); t.textContent = s; return t; };
  const tipOf = (svg, node, html) => { node.addEventListener("pointerenter", () => { const tip = svg.parentNode && svg.parentNode.querySelector(".cv-tip"); if (tip) { tip.innerHTML = html; tip.hidden = false; } }); node.addEventListener("pointerleave", () => { const tip = svg.parentNode && svg.parentNode.querySelector(".cv-tip"); if (tip) tip.hidden = true; }); };
  const dotClass = (a) => (a.g != null ? `r${a.g}` : `o${a.r === 0 ? "" : " bad"}`);
  const what = (a) => (a.g != null ? RATINGS[a.g] : a.r === 0 ? "Right" : "Wrong");
  function frame(w, h, label) { return sv("svg", { viewBox: `0 0 ${w} ${h}`, class: "cv-chart", role: "img", "aria-label": label }); }

  // the predicted recall over time, each answer setting it to 100% again
  function curve(ans, hist, c, width) {
    const Wd = Math.max(300, width), Hd = 210, M = { l: 40, r: 14, t: 18, b: 26 }, svg = frame(Wd, Hd, "Predicted recall over time");
    if (!ans.length) { svg.append(text({ x: Wd / 2, y: Hd / 2, "text-anchor": "middle", class: "ax" }, "No answers")); return svg; }
    const now = Date.now(), due = c.due, t0 = ans[0].at - 3600e3, t1 = Math.max(now, due) + Math.max(DAY * 0.6, (Math.max(now, due) - t0) * 0.04);
    const resets = []; let st = null;
    for (const p of hist) { st = p.st ?? st ?? [0.212, 1.2931, 2.3065, 8.2956][p.g]; resets.push({ t: p.at, st }); }
    const at = (t) => { let r = null; for (const s of resets) { if (s.t <= t) r = s; else break; } return r ? recall(Math.max(0, (t - r.t) / DAY), r.st) : null; };
    const pts = []; let lo = 1;
    resets.forEach((s, k) => { const e = k + 1 < resets.length ? resets[k + 1].t : t1; for (let j = 0; j <= 50; j++) { const t = s.t + (e - s.t) * (j / 50) ** 1.6, r = recall(Math.max(0, (t - s.t) / DAY), s.st); pts.push([t, r]); lo = Math.min(lo, r); } });
    lo = Math.max(0, Math.min(0.5, Math.floor((lo - 0.04) * 10) / 10));
    const x = (t) => M.l + (t - t0) / (t1 - t0) * (Wd - M.l - M.r), y = (r) => M.t + (1 - r) / (1 - lo) * (Hd - M.t - M.b);
    const target = (SRS.opts().retain || 90) / 100;
    for (const r of [...new Set([lo, 0.5, 0.7, target, 1])].filter((r) => r >= lo).sort()) {
      svg.append(sv("line", { x1: M.l, x2: Wd - M.r, y1: y(r), y2: y(r), class: r === target ? "tgt" : "gl" }), text({ x: M.l - 6, y: y(r) + 4, "text-anchor": "end", class: "ax" }, `${Math.round(r * 100)}%`));
    }
    for (const t of ticks(t0, t1)) svg.append(text({ x: x(t), y: Hd - 6, "text-anchor": "middle", class: "ax" }, dShort(t)));
    if (pts.length) {
      const d = pts.map((p, i) => `${i ? "L" : "M"}${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join("");
      svg.append(sv("path", { d: `${d}L${x(pts[pts.length - 1][0]).toFixed(1)} ${y(lo)}L${x(pts[0][0]).toFixed(1)} ${y(lo)}Z`, class: "area" }), sv("path", { d, class: "crv" }));
    }
    svg.append(sv("line", { x1: x(now), x2: x(now), y1: M.t - 4, y2: Hd - M.b, class: "nowl" }), text({ x: x(now), y: M.t - 7, "text-anchor": "middle", class: "lbl" }, "Now"));
    const dx = x(due); svg.append(sv("path", { d: `M${dx} ${y(lo) - 1}l-6 -9h12z`, class: "duem" }), text({ x: Math.min(Wd - M.r, dx), y: y(lo) - 14, "text-anchor": dx > Wd - 60 ? "end" : "middle", class: "lbl" }, `Due ${dShort(due)}`));
    for (const a of ans) {
      const before = at(a.at - 1), p = sv("circle", { cx: x(a.at), cy: y(before ?? 1), r: a.replay ? 3.5 : 5.5, class: "pt " + dotClass(a) });
      tipOf(svg, p, `<b>${dTime(a.at)}</b> · ${what(a)}${a.replay ? " · replay" : ""} · ${secs(a.ms)}<br>${MODES[a.mode] || a.mode} · ${LOOKS[(a.look || "quiz").split("+")[0]] || ""}${before != null ? ` · recall ${pct(before)}` : ""}`);
      svg.append(p);
    }
    return svg;
  }
  // the interval each rated answer gave, as steps (a log scale: minutes to years)
  function steps(ans, width) {
    const Wd = Math.max(300, width), Hd = 140, M = { l: 46, r: 14, t: 10, b: 24 }, svg = frame(Wd, Hd, "Interval after each answer");
    const ivs = ans.filter((a) => a.iv != null); if (!ivs.length) return null;
    const t0 = ivs[0].at - 3600e3, t1 = Date.now() + DAY * 0.5;
    const MK = [[1, "1 min"], [10, "10 min"], [60, "1 h"], [1440, "1 d"], [10080, "1 w"], [43200, "1 mo"], [525600, "1 y"]];
    const hi = Math.max(...ivs.map((a) => a.iv)), marks = MK.slice(0, Math.max(2, (MK.findIndex(([m]) => m >= hi) + 1) || MK.length)), top = marks[marks.length - 1][0];
    const x = (t) => M.l + (t - t0) / (t1 - t0) * (Wd - M.l - M.r), y = (m) => M.t + (1 - Math.log(Math.max(1, m)) / Math.log(top)) * (Hd - M.t - M.b);
    for (const [m, t] of marks) svg.append(sv("line", { x1: M.l, x2: Wd - M.r, y1: y(m), y2: y(m), class: "gl" }), text({ x: M.l - 6, y: y(m) + 4, "text-anchor": "end", class: "ax" }, t));
    for (const t of ticks(t0, t1)) svg.append(text({ x: x(t), y: Hd - 6, "text-anchor": "middle", class: "ax" }, dShort(t)));
    let d = ""; ivs.forEach((a, i) => { const nx = i + 1 < ivs.length ? ivs[i + 1].at : t1; d += `${i ? "L" : "M"}${x(a.at).toFixed(1)} ${y(a.iv).toFixed(1)}L${x(nx).toFixed(1)} ${y(a.iv).toFixed(1)}`; });
    svg.append(sv("path", { d, class: "ln" }));
    for (const a of ivs) { const p = sv("circle", { cx: x(a.at), cy: y(a.iv), r: 4, class: "pt " + dotClass(a) }); tipOf(svg, p, `<b>${dTime(a.at)}</b> · ${what(a)} · next in ${span(a.iv / 1440)}`); svg.append(p); }
    return svg;
  }
  // one of FSRS's numbers over time (key of the points), its own axis
  function series(hist, key, label, fmt, width, { lo = null, hi = null, log = false, dates = false } = {}) {
    const Wd = Math.max(300, width), Hd = dates ? 96 : 80, M = { l: 46, r: 14, t: 18, b: dates ? 22 : 6 }, svg = frame(Wd, Hd, label);
    const ps = hist.filter((p) => p[key] != null);
    svg.append(text({ x: 0, y: 11, class: "lbl" }, label));
    const t0 = (hist[0] ? hist[0].at : Date.now()) - 3600e3, t1 = Date.now() + DAY * 0.5, vals = ps.map((p) => p[key]);
    const x = (t) => M.l + (t - t0) / (t1 - t0) * (Wd - M.l - M.r);
    if (dates) for (const t of ticks(t0, t1)) svg.append(text({ x: x(t), y: Hd - 4, "text-anchor": "middle", class: "ax" }, dShort(t)));
    if (!ps.length) { svg.append(text({ x: Wd / 2, y: Hd / 2 + 2, "text-anchor": "middle", class: "ax" }, "–")); return svg; }
    let a = lo ?? Math.min(...vals), b = hi ?? Math.max(...vals); if (a === b) { a = a * 0.8; b = b * 1.2 || 1; }
    const f = log ? (v) => Math.log(Math.max(v, 1e-3)) : (v) => v;
    const y = (v) => M.t + (1 - (f(v) - f(a)) / (f(b) - f(a))) * (Hd - M.t - M.b);
    for (const v of [a, b]) svg.append(sv("line", { x1: M.l, x2: Wd - M.r, y1: y(v), y2: y(v), class: "gl" }), text({ x: M.l - 6, y: y(v) + 4, "text-anchor": "end", class: "ax" }, fmt(v)));
    svg.append(sv("path", { d: ps.map((p, i) => `${i ? "L" : "M"}${x(p.at).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(""), class: "ln" }));
    for (const p of ps) {
      const dot = sv("circle", { cx: x(p.at), cy: y(p[key]), r: 4, class: "pt " + (p.kept || p.now ? `r${p.g}` : `est r${p.g}`) });
      tipOf(svg, dot, `<b>${dTime(p.at)}</b> · ${RATINGS[p.g]}<br>${label} ${fmt(p[key])}${p.kept ? "" : p.now ? " · now" : " · worked out"}`);
      svg.append(dot);
    }
    return svg;
  }
  function logTable(ans) {
    const w = el("div", "cv-log"), t = el("table");
    t.innerHTML = "<thead><tr><th>When</th><th>Rating</th><th>Result</th><th>Time</th><th>Next</th><th>Way</th><th>Map</th><th>Given</th></tr></thead>";
    const tb = el("tbody");
    for (const a of ans.slice().reverse()) {
      const tr = el("tr"), td = (x, cls) => { const c = el("td", cls); if (x instanceof Node) c.append(x); else c.textContent = x; tr.append(c); };
      td(dTime(a.at)); td(el("span", "rt " + (a.g != null ? `r${a.g}` : "o"), a.g != null ? RATINGS[a.g] : a.replay ? "Replay" : "Round"));
      td(a.r === 0 ? "Right" : a.r === 1 ? "2nd try" : a.r === 2 ? "3rd try" : "Missed"); td(secs(a.ms)); td(a.iv != null ? span(a.iv / 1440) : "–");
      td(MODES[a.mode] || a.mode); td(LOOKS[(a.look || "quiz").split("+")[0]] || ""); td((a.given || []).map((g) => (g.startsWith('"') ? `“${g.slice(1)}”` : g)).join(", "), "g");
      tb.append(tr);
    }
    t.append(tb); w.append(t); return w;
  }
  function strip(ans) {
    const s = el("div", "cv-strip"), days = new Map();
    for (const a of ans) { const k = dShort(a.at); (days.get(k) || days.set(k, []).get(k)).push(a); }
    for (const [k, list] of days) {
      const d = el("div", "day"), cells = el("div", "cells"); d.append(el("span", "", k));
      for (const a of list) { const c = el("div", "cell"), i = el("i", dotClass(a) + (a.replay ? " rp" : "")), u = el("u"); u.style.height = Math.max(2, Math.min(22, (a.ms || 0) / 400)) + "px"; c.append(i, u); c.title = `${dTime(a.at)} · ${what(a)} · ${secs(a.ms)}`; cells.append(c); }
      d.append(cells); s.append(d);
    }
    return s;
  }
  function key(round) {
    const ul = el("ul", "cv-key");
    RATINGS.forEach((r, i) => { const li = el("li"); li.append(el("i", "r" + i), r); ul.append(li); });
    if (round) { const li = el("li"); li.append(el("i", "o"), "Round"); ul.append(li); }
    return ul;
  }

  /* ---------- the card ---------- */
  // q: questionOf(); opts: { pick (the card shown, by its key), map (a Map button), changed (after Now, Sooner, Later),
  // inPop }
  async function render(host, q, opts = {}) {
    const { by, names } = await data();
    const list = by.get(`${q.quiz}|${q.kind}|${q.item}`) || [];
    const c = q.cards.find((x) => x.key === opts.pick) || q.cards.find((x) => x.key === picked.get(`${q.quiz}|${q.kind}|${q.item}`)) || q.cards[0];
    const ans = answersOf(q, c, list), hist = history(c, ans), card = c.raw || {}, now = Date.now();
    const view = viewKept(), width = Math.max(300, (host.clientWidth || 640) - 4);
    const [ask, more] = parts(nameOf(q, names));
    const box = el("div", "cv");
    const head = el("div", "cv-head"), h = el("h2", "", ask); if (more) h.append(el("small", "", more)); head.append(h);
    box.append(head);
    // which card, which view
    const bar = el("div", "cv-bar");
    if (q.cards.length > 1) {
      const pick = el("div", "view-pick"); pick.setAttribute("role", "group"); pick.setAttribute("aria-label", "Card");
      for (const x of q.cards) { const b = el("button", "", cardLabel(x)); b.type = "button"; b.setAttribute("aria-pressed", x === c); b.onclick = () => { picked.set(`${q.quiz}|${q.kind}|${q.item}`, x.key); render(host, q, { ...opts, pick: x.key }); }; pick.append(b); }
      bar.append(pick);
    } else bar.append(el("span", "cv-which", cardLabel(c)));
    const vp = el("div", "view-pick"); vp.setAttribute("role", "group"); vp.setAttribute("aria-label", "View");
    for (const [k, label] of VIEWS) { const b = el("button", "", label); b.type = "button"; b.setAttribute("aria-pressed", k === view); b.onclick = () => { keepView(k); render(host, q, { ...opts, pick: c.key }); }; vp.append(b); }
    bar.append(vp); box.append(bar);
    // the view
    const chart = el("div", "cv-box"), tip = el("div", "cv-tip"); tip.hidden = true;
    if (view === "curve") { chart.append(curve(ans, hist, c, width), tip); box.append(chart, key(true)); }
    else if (view === "log") { box.append(logTable(ans)); const s = steps(ans, width); if (s) { chart.append(s, tip); box.append(chart); } }
    else if (view === "strip") box.append(strip(ans), key(true));
    else {
      const days = (v) => (v < 10 ? `${v.toFixed(1)} d` : span(v)), fixed = (v) => v.toFixed(1);
      chart.classList.add("cv-values");
      chart.append(series(hist, "st", "Stability", days, width, { log: true }), series(hist, "df", "Difficulty", fixed, width, { lo: 1, hi: 10 }),
        series(hist, "ivDays", "Interval", (v) => span(v), width, { log: true }), series(hist, "R", "Recall at the answer", pct, width, { hi: 1, dates: true }), tip);
      const k = key(false), li = el("li"); li.append(el("i", "est"), "Worked out"); k.append(li);
      box.append(chart, k);
    }
    // the facts
    const facts = el("dl", "cv-facts"), fact = (k, v) => { const d = el("div"); d.append(el("dt", "", k), el("dd", "", v)); facts.append(d); };
    const firsts = list.filter((a) => !a.replay), rated = list.filter((a) => a.g != null && !a.replay);
    fact("Due", c.due <= now ? "Now" : SRS.until(c.due, now));
    fact("Interval", c.interval != null ? span(c.interval) : "–");
    if (card.st != null) { fact("Recall now", pct(recall(Math.max(0, SRS.days(card.l, now)), card.st))); fact("Stability", span(card.st)); }
    if (card.df != null) fact("Difficulty", `${card.df.toFixed(1)} / 10`);
    fact("Missed", String(card.n || 0));
    fact("Right", rated.length ? `${pct(right(list))} · ${Math.min(LAST, rated.length)}` : "–");
    fact("Median time", secs(median(firsts.map((a) => a.ms).filter((x) => x != null))));
    if (list.length) fact("First seen", dShort(list[0].at));
    box.append(facts);
    // mix-ups
    const mixed = new Map(); for (const a of ans) for (const g of a.given || []) { const t = g.startsWith('"') ? `“${g.slice(1)}”` : parts(names.get(`${q.quiz}|${q.kind}|${g}`) || g)[0]; mixed.set(t, (mixed.get(t) || 0) + 1); }
    if (mixed.size) { const m = el("p", "cv-mix"); m.append(el("b", "", "Mixed up with")); for (const [t, n] of [...mixed].sort((a, b) => b[1] - a[1]).slice(0, 5)) m.append(el("span", "", `${t} ×${n}`)); box.append(m); }
    // what to do with it: when it is asked (as By due), practice it (as the Stats tab), and the map
    const acts = el("div", "cv-acts");
    for (const [label, how] of [["Now", "now"], ["Sooner", "sooner"], ["Later", "later"]]) {
      const b = el("button", "ghost small", label); b.type = "button";
      b.onclick = () => { SRS.reschedule(q.quiz, c.key, how, Date.now()); q.cards = questionOf(q.quiz, q.kind, q.item)?.cards || q.cards; render(host, q, { ...opts, pick: c.key }); if (opts.changed) opts.changed(); };
      acts.append(b);
    }
    // (back afterwards to the tab it was opened on: Stack, Stats or Map)
    const url = cfg.practiceUrl && cfg.practiceUrl(q.quiz, q.kind, [q.item], list, "review.html" + (["#stats", "#map"].includes(location.hash) ? location.hash : ""));
    const p = el("a", "ghost small", "Practice"); if (url) p.href = url; else { p.setAttribute("aria-disabled", "true"); p.classList.add("off"); }
    acts.append(p, el("span", "sp"));
    if (opts.map && cfg.onMap) { const m = el("button", "ghost small", "Map"); m.type = "button"; m.onclick = () => { if (opts.close) opts.close(); cfg.onMap(q.quiz, q.kind, q.item); }; acts.append(m); }
    box.append(acts);
    host.replaceChildren(box);
    return box;
  }

  // the pop-up: the Stats tab's (.stat-card), with the card in it
  let pop = null;
  function open(quiz, kind, item, opts = {}) {
    const q = questionOf(quiz, kind, item);
    if (!q) return false;
    if (!pop) {
      pop = el("dialog", "stat-card card-pop");
      pop.addEventListener("click", (e) => { if (e.target === pop) pop.close(); });
      document.body.append(pop);
    }
    const close = el("button", "ghost small", "Close"), where = el("small", "cv-where", opts.where || ""), top = el("header", "cv-top"), body = el("div");
    close.type = "button"; close.onclick = () => pop.close();
    top.append(where, close);
    pop.replaceChildren(top, body);
    if (!pop.open) pop.showModal();
    render(body, q, { map: true, ...opts, close: () => pop.close() });
    return true;
  }

  return { configure: (o) => { cfg = { ...cfg, ...o }; }, data, questionOf, render, open, right, base };
})();
