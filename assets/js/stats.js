// Stats: the review page's second tab, beside Stack. What the answer log (answers.js)
// and the stack (srs.js) say of the player's play, top down:
//   Today, This week   answers given, the share right at once, the median time (what is due: the page's top, review.js)
//   Forecast           the cards due on each of the next 30 days (today's with those overdue; its column cut where
//                      it would flatten the others), and beside it
//   Retention          in reviews, the share of cards out of their learning steps that were known (unsure counts as
//                      known, as in Anki), over 30 days and week by week from the first week with reviews, against
//                      the target retention (srs.js)
//   Weak spots         the questions of the last 30 days with the lowest share right at once (Accuracy) or the
//                      slowest answers (Speed), asked 3 times or more, by quiz and layer: Practice plays a quiz's,
//                      and on top, all of them, quiz after quiz (SRS.startPractice)
//   Mix-ups            what was given instead of what was asked, two items of a layer, counted both ways, by quiz and
//                      layer: Practice plays the two, a quiz's, or on top all of them, quiz after quiz
//   Quizzes            every quiz with cards or answers, by country: its cards, those out of their learning steps,
//                      those due, the share right, the median time, when it was last played; a quiz opens to its
//                      questions, worst first
//   a question         (a click on one anywhere) every answer to it as a dot, by when and how long it took, and its
//                      card's interval after each answer
// Replays (a question asked again after a miss) count for none of the shares and times, only for the question's dots.
// Practice opens the quiz with a round of exactly those questions (…?practice=<layer>&items=…, see engine/model/custom.js), in
// the way they were answered most and on the map they were answered on most.
// The tab is its own address (review.html#stats). Everything is worked out anew each time the tab is shown.

function initStats(index, nameByCode) {
  const DAY = 864e5, NS = "http://www.w3.org/2000/svg";
  const byId = new Map(index.quizzes.filter((q) => q.url).map((q) => [q.id, q]));
  const MODES = { map: "Map", list: "List", type: "Type", pairs: "Pairs", pick: "Pick", pickback: "Pick back", code: "Type code", draw: "Draw", name: "Name it", shape: "Shape", paint: "Paint" };
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
  const median = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const pct = (x) => (x == null ? "–" : `${Math.round(x * 100)}%`);
  const secs = (ms) => (ms == null ? "–" : ms < 9950 ? `${(ms / 1000).toFixed(1)} s` : ms < 59500 ? `${Math.round(ms / 1000)} s` : `${Math.floor(ms / 60000)}:${String(Math.round(ms / 1000) % 60).padStart(2, "0")}`);
  const dateShort = (ms) => new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const dateTime = (ms) => `${dateShort(ms)} ${new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  const most = (list, f) => { const n = new Map(); for (const x of list) { const k = f(x); n.set(k, (n.get(k) || 0) + 1); } return [...n].sort((a, b) => b[1] - a[1])[0]?.[0]; };
  const ago = (ms, now) => { const d = SRS.days(ms, now); return d <= 0 ? "Today" : d === 1 ? "Yesterday" : d < 60 ? `${d} d` : dateShort(ms); };
  const keyOf = (a) => `${a.quiz}|${a.kind}|${a.item}`;
  const city = (quizId) => byId.get(quizId)?.role === "cities";
  const placeOf = (q) => { const country = nameByCode.get(quizCountries(q)[0]); return q.area ?? q.scope ?? (country && (SHORT_NAMES[country] ?? country)) ?? q.title; };
  const titleOf = (quizId) => byId.get(quizId)?.title ?? STORE.quiz(quizId).title ?? quizId;
  // A layer's name: as the log has it, else as the quiz page wrote it for its cards (a layer played only in a mode: that
  // one's, without it).
  function layerOf(quizId, kind) {
    const named = STORE.quiz(quizId).layers || {}, own = NAMES.get(`${quizId}|${kind}`) ?? named[kind] ?? Object.entries(named).find(([k]) => k.startsWith(kind + "~"))?.[1]?.split(" · ")[0];
    return own ?? kind.replace(/[-_]+/g, " ").replace(/^./, (c) => c.toUpperCase());
  }
  let NAMES = new Map();
  // An item's name: as the log has it, else as its card is called on the stack, else its id.
  function nameOf(quizId, kind, item) {
    const n = NAMES.get(`${quizId}|${kind}|${item}`);
    if (n) return n;
    const called = STORE.quiz(quizId).called || {}, c = called[`${kind}|${item}`] ?? Object.entries(called).find(([k]) => k.startsWith(kind + "~") && k.endsWith("|" + item))?.[1];
    return c ? c.filter(Boolean).join(" · ") : item;
  }
  // A layer, where it is: "Germany · Regions · States" (the layer left out where its quiz's title names it).
  const where = (quizId, kind) => { const q = byId.get(quizId), t = titleOf(quizId), l = layerOf(quizId, kind); return [q && placeOf(q), t, t.toLowerCase().includes(l.toLowerCase()) ? "" : l].filter(Boolean).join(" · "); };
  const givenName = (a, g) => (g.startsWith('"') ? `“${g.slice(1)}”` : nameOf(a.quiz, a.kind, g));

  // A round of exactly these items on the quiz's page, the way most of these answers were given (see engine/screens/setup.js).
  // home: the review page's tab the practice comes back to, once played or ended early (engine/app/review.js; ?return, as ?back is the map's background)
  function practiceUrl(quizId, kind, items, answers, home = "review.html#stats") {
    const q = byId.get(quizId);
    if (!q || !items.length || !answers.some((a) => a.look)) return null; // (a quiz without a map has its own page, which knows no Practice)
    const mode = most(answers, (a) => a.mode) || "map", [map, back] = (most(answers, (a) => a.look) || "").split("+");
    const p = new URLSearchParams({ practice: kind, items: items.map((x) => encodeURIComponent(x)).join(","), name: "Practice", return: home });
    if (mode !== "map" && mode !== "paint") p.set("mode", mode);
    if (map) p.set("map", map);
    if (back) p.set("back", back);
    return `${q.url}?${p}`;
  }
  function practiceBtn(label, url) {
    const a = el("a", "ghost small", label);
    if (url) a.href = url; else { a.setAttribute("aria-disabled", "true"); a.classList.add("off"); }
    return a;
  }
  // Practice for a whole list: the practices of its groups (stops, their addresses) one after another, each quiz's
  // straight on to the next as in a review, then back here (SRS.startPractice).
  function practiceAllBtn(label, stops) {
    const a = practiceBtn(label, stops.length ? stops[0] : null);
    if (stops.length) a.onclick = (e) => { e.preventDefault(); window.location.href = SRS.startPractice(window.location.href, stops, "review.html#stats"); };
    return a;
  }
  const empty = (text) => el("p", "empty small", text);
  if (typeof CARD_VIEW === "object") CARD_VIEW.configure({ practiceUrl }); // (a card's Practice is this tab's)

  /* ---------- the tabs ---------- */
  // Three tabs: Stack (the page's own sections), Stats (this), Map (#map-page, review-map.js); each its address, the
  // Stack's none. The page hears which is shown (review:tab), the Map drawn by review.js then.
  const page = document.querySelector("main.review-page"), root = $("stats"), mapPage = $("map-page"), tabs = $("tabs");
  let shown = null;
  const ADDRESS = { stats: "#stats", map: "#map", review: "" };
  const tabOf = (hash) => (hash === "#stats" ? "stats" : hash === "#map" && mapPage ? "map" : "review");
  function pick(tab) {
    for (const s of page.children) if (s !== page.firstElementChild) s.hidden = tab === "stats" ? s !== root : tab === "map" ? s !== mapPage : s === root || s === mapPage;
    for (const b of tabs.querySelectorAll("button")) b.setAttribute("aria-selected", b.dataset.tab === tab);
    if (location.hash !== ADDRESS[tab]) history.replaceState(null, "", location.pathname + location.search + ADDRESS[tab]);
    const was = shown;
    shown = tab;
    if (tab === "stats") draw();
    if (was !== tab) document.dispatchEvent(new CustomEvent("review:tab", { detail: tab }));
  }
  for (const b of tabs.querySelectorAll("button")) b.onclick = () => pick(b.dataset.tab);
  window.addEventListener("hashchange", () => pick(tabOf(location.hash)));

  /* ---------- charts: inline SVG, the site's colors ---------- */
  // A tooltip shared by every chart: shown at a mark while pointed at, or once tapped until the next tap (in the
  // question's card, inside it: the card lies above the page).
  const tip = el("div", "chart-tip");
  tip.hidden = true;
  document.body.append(tip);
  document.addEventListener("pointerdown", () => { tip.hidden = true; }, true);
  function tipOn(target, lines) {
    const show = () => {
      (target.closest("dialog") || document.body).append(tip);
      tip.replaceChildren(...lines.map((l, i) => el(i ? "span" : "b", "", l)));
      tip.hidden = false;
      const r = target.getBoundingClientRect(), w = tip.offsetWidth;
      tip.style.left = `${Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2))}px`;
      tip.style.top = `${Math.max(4, r.top - tip.offsetHeight - 8)}px`;
    };
    target.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") show(); });
    target.addEventListener("pointerdown", show);
    target.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") tip.hidden = true; });
  }
  // Ticks for 0…max: about n clean steps.
  function ticks(max, n = 4) {
    if (max <= 0) return [0, 1];
    const raw = max / n, mag = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw);
    const out = []; for (let v = 0; v <= max + step * 1e-9; v += step) out.push(v);
    if (out[out.length - 1] < max) out.push(out[out.length - 1] + step);
    return out;
  }
  // A chart's frame: an SVG as wide as its box, y from 0 at the bottom; returns it and the plot's sizes.
  function frame(box, height, left = 34, top = 12) {
    const W = Math.max(280, box.clientWidth || 600), H = height, M = { l: left, r: 10, t: top, b: 22 };
    const svg = svgEl("svg", { class: "chart", viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img" });
    return { svg, W, H, M, w: W - M.l - M.r, h: H - M.t - M.b };
  }
  function yAxis(f, values, y, label) {
    for (const v of values) {
      const at = y(v);
      f.svg.append(svgEl("line", { class: "grid", x1: f.M.l, x2: f.W - f.M.r, y1: at, y2: at }));
      const t = svgEl("text", { class: "tick", x: f.M.l - 6, y: at + 4, "text-anchor": "end" }); t.textContent = label(v); f.svg.append(t);
    }
  }
  const xLabel = (f, x, text, anchor = "middle") => { const t = svgEl("text", { class: "tick", x, y: f.H - 6, "text-anchor": anchor }); t.textContent = text; f.svg.append(t); };
  // A column with a rounded top (4 px), square on the baseline.
  function column(x, y0, y1, w) {
    const h = y0 - y1, r = Math.min(4, w / 2, h);
    return svgEl("path", { d: h <= 0 ? "" : `M${x},${y0}V${y1 + r}Q${x},${y1} ${x + r},${y1}H${x + w - r}Q${x + w},${y1} ${x + w},${y1 + r}V${y0}Z` });
  }

  // The cards due on each of the next 30 days (the first: today's and those overdue). Today's column, where it is more
  // than twice the highest of the others, is cut at the top of their scale, with its number over it, so that the
  // other days still show.
  function forecastChart(box, counts, now) {
    const rest = Math.max(...counts.slice(1)), cut = rest > 0 && counts[0] > 2 * rest;
    const f = frame(box, 162, 34, cut ? 24 : 12), t = ticks(cut ? rest : Math.max(...counts), 3), top = t[t.length - 1];
    const slot = f.w / counts.length, bw = Math.min(18, slot - 2), y = (v) => f.M.t + f.h - (Math.min(v, top) / top) * f.h;
    yAxis(f, t, y, (v) => v.toLocaleString("en-US"));
    counts.forEach((n, i) => {
      const x = f.M.l + i * slot + (slot - bw) / 2, bar = column(x, y(0), y(n), bw);
      bar.setAttribute("class", "bar");
      const hit = svgEl("rect", { class: "hit", x: f.M.l + i * slot, y: f.M.t, width: slot, height: f.h });
      tipOn(hit, [i ? dateShort(SRS.dayStart(now, i)) : "Today", `${n.toLocaleString("en-US")} ${n === 1 ? "card" : "cards"}`]);
      f.svg.append(bar);
      if (i === 0 && cut) {
        // (two strokes across the column near its top, in the box's color, and its number over it)
        const at = y(top) + 10, mark = svgEl("path", { class: "cut", d: `M${x - 1},${at + 3}L${x + bw + 1},${at - 3}M${x - 1},${at + 9}L${x + bw + 1},${at + 3}` });
        const label = svgEl("text", { class: "tick big", x: x + bw / 2, y: f.M.t - 7, "text-anchor": "middle" });
        label.textContent = n.toLocaleString("en-US");
        f.svg.append(mark, label);
      }
      f.svg.append(hit);
    });
    for (const i of [0, 7, 14, 21, 28]) if (i < counts.length) xLabel(f, f.M.l + i * slot + slot / 2, i ? dateShort(SRS.dayStart(now, i)) : "Today");
    return f.svg;
  }
  // Retention week by week (dots on a line, weeks with enough reviews, each with its share where there is room), and
  // the target as a line of its own. The scale from 80% (lower where a week or the target is near it) to 100%.
  function retentionChart(box, weeks, target) {
    const low = Math.min(target, ...weeks.filter((w) => w.n >= 5).map((w) => w.r * 100)), lo = Math.max(0, Math.min(80, Math.floor((low - 5) / 10) * 10));
    const f = frame(box, 162), y = (v) => f.M.t + f.h - ((v - lo) / (100 - lo)) * f.h; // (as high as the forecast beside it)
    const step = f.w / Math.max(1, weeks.length - 1), x = (i) => f.M.l + i * step;
    yAxis(f, ticks(100 - lo, 2).map((v) => v + lo).filter((v) => v <= 100), y, (v) => `${v}%`);
    f.svg.append(svgEl("line", { class: "target", x1: f.M.l, x2: f.W - f.M.r, y1: y(target), y2: y(target) }));
    const tl = svgEl("text", { class: "tick target-t", x: f.W - f.M.r, y: y(target) - 5, "text-anchor": "end" }); tl.textContent = `Target ${target}%`; f.svg.append(tl);
    const pts = weeks.map((w, i) => (w.n >= 5 ? [x(i), y(w.r * 100), w, i] : null)).filter(Boolean);
    if (pts.length > 1) f.svg.append(svgEl("polyline", { class: "line", points: pts.map(([a, b]) => `${a},${b}`).join(" ") }));
    for (const [px, py, w] of pts) {
      const dot = svgEl("circle", { class: "dot", cx: px, cy: py, r: 4 });
      tipOn(dot, [`Week of ${dateShort(w.from)}`, `${pct(w.r)} · ${w.n} reviews`]);
      f.svg.append(dot);
      if (step >= 36) { const v = svgEl("text", { class: "tick", x: px, y: py - 9, "text-anchor": "middle" }); v.textContent = pct(w.r); f.svg.append(v); }
    }
    const every = weeks.length <= 6 ? 1 : 4, end = weeks.length - 1;
    weeks.forEach((w, i) => { if (i % every === 0 || i === end) xLabel(f, x(i), dateShort(w.from), i === 0 ? "start" : i === end ? "end" : "middle"); });
    return f.svg;
  }
  // A question's answers: each a dot by when and how long it took (right: a filled dot; wrong: a cross; a replay smaller).
  function answersChart(box, list, now) {
    const f = frame(box, 150, 40), t0 = Math.min(list[0].at, now - DAY), span = Math.max(DAY, now - t0);
    const times = list.map((a) => a.ms || 0), top = ticks(Math.max(1000, ...times.slice().sort((a, b) => a - b).slice(0, Math.ceil(times.length * 0.95))) / 1000, 3);
    const max = top[top.length - 1] * 1000, x = (at) => f.M.l + ((at - t0) / span) * f.w, y = (ms) => f.M.t + f.h - (Math.min(ms, max) / max) * f.h;
    yAxis(f, top, (v) => y(v * 1000), (v) => `${v} s`);
    for (const a of list) {
      const px = x(a.at), py = y(a.ms || 0), right = a.r === 0, r = a.replay ? 3 : 4.5;
      const mark = right ? svgEl("circle", { class: `dot ok${a.replay ? " re" : ""}`, cx: px, cy: py, r })
        : svgEl("path", { class: `cross${a.replay ? " re" : ""}`, d: `M${px - r},${py - r}L${px + r},${py + r}M${px - r},${py + r}L${px + r},${py - r}` });
      const hit = svgEl("circle", { class: "hit", cx: px, cy: py, r: 9 });
      tipOn(hit, [dateTime(a.at), `${right ? "✓" : "✗"} ${secs(a.ms)} · ${MODES[a.mode] ?? a.mode}${a.review ? " · Review" : ""}${a.replay ? " · Replay" : ""}`]);
      f.svg.append(mark, hit);
    }
    xLabel(f, f.M.l, dateShort(t0), "start"); xLabel(f, f.W - f.M.r, "Now", "end");
    return f.svg;
  }
  // A question's cards: the interval each answer gave it (days, on a log scale), a step line per card.
  function intervalChart(box, cards, t0, now) {
    const f = frame(box, 150, 40), span = Math.max(DAY, now - t0), x = (at) => f.M.l + ((at - t0) / span) * f.w;
    const all = cards.flatMap((c) => c.points.map((p) => p[1])), hi = Math.max(1440, ...all), MARKS = [[1, "1 min"], [60, "1 h"], [1440, "1 d"], [10080, "1 w"], [43200, "1 mo"], [525600, "1 y"]];
    const marks = MARKS.slice(0, Math.max(1, MARKS.findIndex(([m]) => m >= hi)) + 1), lo = 1, top = marks[marks.length - 1][0], y = (m) => f.M.t + f.h - (Math.log(Math.max(lo, m) / lo) / Math.log(top / lo)) * f.h;
    for (const [m, label] of marks) {
      f.svg.append(svgEl("line", { class: "grid", x1: f.M.l, x2: f.W - f.M.r, y1: y(m), y2: y(m) }));
      const t = svgEl("text", { class: "tick", x: f.M.l - 6, y: y(m) + 4, "text-anchor": "end" }); t.textContent = label; f.svg.append(t);
    }
    for (const c of cards) {
      // (a step line: across to the next answer, then up or down to its interval)
      const d = c.points.map(([at, iv], i) => (i ? `H${x(at)}V${y(iv)}` : `M${x(at)},${y(iv)}`)).join("") + `H${x(now)}`;
      f.svg.append(svgEl("path", { class: "line", d }));
      for (const [at, iv] of c.points) { const dot = svgEl("circle", { class: "dot small", cx: x(at), cy: y(iv), r: 3 }); tipOn(dot, [dateTime(at), `${c.label} · ${ivText(iv)}`]); f.svg.append(dot); }
      if (cards.length > 1) { const last = c.points[c.points.length - 1], t = svgEl("text", { class: "tick", x: f.W - f.M.r, y: y(last[1]) - 5, "text-anchor": "end" }); t.textContent = c.label; f.svg.append(t); }
    }
    xLabel(f, f.M.l, dateShort(t0), "start"); xLabel(f, f.W - f.M.r, "Now", "end");
    return f.svg;
  }
  const ivText = (min) => (min < 60 ? `${min} min` : min < 1440 ? `${Math.round(min / 60)} h` : span(min / 1440));

  /* ---------- the tab ---------- */
  let DATA = null; // { answers, names, decks, now }
  async function draw() {
    const now = Date.now(), { answers, names } = typeof ANSWERS === "object" ? await ANSWERS.all() : { answers: [], names: new Map() };
    NAMES = names;
    const decks = SRS.decks().filter((d) => byId.has(d.id));
    DATA = { answers, decks, now };
    const charts = el("div", "charts");
    charts.append(forecastSection(decks, now), retentionSection(answers, now));
    root.replaceChildren(stripSection(answers, now), charts, weakSection(answers, now), mixSection(answers), quizSection(answers, decks, now));
    for (const [box, make] of later) box.replaceChildren(make()); // (charts once their boxes have a width)
    later = [];
  }
  let later = [];
  const chartBox = (make) => { const box = el("div", "chart-box"); later.push([box, () => make(box)]); return box; };
  const section = (title, ...kids) => { const s = el("section"); s.append(el("h2", "", title), ...kids); return s; };
  // A section whose head holds more than its title (a switch, Practice for the whole list): the head and a place for
  // those, filled as the list is.
  const headed = (title) => { const s = el("section"), head = el("div", "sec-head"), acts = el("div", "sec-acts"); head.append(el("h2", "", title), acts); s.append(head); return { s, acts }; };
  // A list in a framed box.
  const boxed = (table) => { const box = el("div", "tree"); box.append(table); return box; };
  // first answers (not replays)
  const firsts = (list) => list.filter((a) => !a.replay);
  const summary = (list) => { const f = firsts(list); return { n: list.length, right: f.length ? f.filter((a) => a.r === 0).length / f.length : null, ms: median(f.map((a) => a.ms || 0)) }; };

  // (what is due: at the page's top, see review.js)
  function stripSection(answers, now) {
    const today = SRS.dayStart(now), week = SRS.dayStart(now, -6);
    const t = summary(answers.filter((a) => a.at >= today)), w = summary(answers.filter((a) => a.at >= week));
    const tile = (label, value) => { const d = el("div", "tile"); d.append(el("b", "", value), el("span", "", label)); return d; };
    const group = (title, ...tiles) => { const g = el("div", "tiles"); g.append(el("h3", "", title), ...tiles); return g; };
    const strip = el("div", "strip");
    strip.append(
      group("Today", tile("Answers", t.n.toLocaleString("en-US")), tile("Right", pct(t.right)), tile("Median", secs(t.ms))),
      group("This week", tile("Answers", w.n.toLocaleString("en-US")), tile("Right", pct(w.right)), tile("Median", secs(w.ms))),
    );
    const s = el("section", "first");
    s.append(strip);
    return s;
  }

  function forecastSection(decks, now) {
    const counts = Array.from({ length: 30 }, () => 0);
    for (const d of decks) for (const k of SRS.all(d)) { const i = Math.max(0, SRS.days(now, d.c[k].d)); if (d.c[k].d <= now) counts[0]++; else if (i < 30) counts[i]++; }
    const total = counts.reduce((a, b) => a + b, 0);
    if (!decks.length) return section("Forecast", empty("No cards yet"));
    const head = el("p", "chart-head");
    head.append(el("b", "", total.toLocaleString("en-US")), " cards · 30 days");
    return section("Forecast", head, chartBox((box) => forecastChart(box, counts, now)));
  }

  function retentionSection(answers, now) {
    const target = SRS.opts().retain, reviews = answers.filter((a) => a.review && !a.replay && !a.learning && a.g != null);
    const month = reviews.filter((a) => a.at >= now - 30 * DAY);
    if (!month.length) return section("Retention", empty("No reviews yet"));
    const share = (list) => list.filter((a) => a.g >= SRS.UNSURE).length / list.length;
    const start = SRS.dayStart(now, -7 * 11 - (new Date(SRS.dayStart(now)).getDay() + 6) % 7); // (12 weeks, each from a Monday)
    const all = Array.from({ length: 12 }, (_, i) => { const from = start + i * 7 * DAY, list = reviews.filter((a) => a.at >= from && a.at < from + 7 * DAY); return { from, n: list.length, r: list.length ? share(list) : 0 }; });
    const weeks = all.slice(Math.max(0, all.findIndex((w) => w.n))); // (from the first week with reviews)
    const head = el("p", "chart-head");
    head.append(el("b", "", pct(share(month))), ` · target ${target}% · ${month.length} reviews · 30 days`);
    return section("Retention", head, chartBox((box) => retentionChart(box, weeks, target)));
  }

  // Questions of the last 30 days asked 3 times or more (first answers): the lowest share right, or the slowest.
  let weakBy = "accuracy";
  function weakSection(answers, now) {
    const { s, acts } = headed("Weak spots"), body = el("div"), all = el("span");
    const seg = el("div", "view-pick");
    seg.setAttribute("role", "group"); seg.setAttribute("aria-label", "Weak spots by");
    for (const [v, label] of [["accuracy", "Accuracy"], ["speed", "Speed"]]) {
      const b = el("button", "", label); b.type = "button"; b.setAttribute("aria-pressed", v === weakBy);
      b.onclick = () => { weakBy = v; for (const x of seg.children) x.setAttribute("aria-pressed", x === b); fill(); };
      seg.append(b);
    }
    acts.append(seg, all);
    const by = new Map();
    for (const a of firsts(answers)) if (a.at >= now - 30 * DAY) (by.get(keyOf(a)) || by.set(keyOf(a), []).get(keyOf(a))).push(a);
    const items = [...by.values()].filter((l) => l.length >= 3).map((l) => ({ a: l[0], list: l, right: l.filter((a) => a.r === 0).length / l.length, ms: median(l.map((a) => a.ms || 0)) }));
    function fill() {
      const top = weakBy === "accuracy" ? items.filter((x) => x.right < 1).sort((x, y) => x.right - y.right || y.list.length - x.list.length).slice(0, 20)
        : items.slice().sort((x, y) => y.ms - x.ms).slice(0, 20);
      if (!top.length) { all.replaceChildren(); body.replaceChildren(empty(items.length ? "None" : "Not enough answers yet")); return; }
      // by quiz and layer, in the order of their worst question; Practice for each, and for all of them (on top)
      const groups = new Map();
      for (const x of top) { const g = `${x.a.quiz}|${x.a.kind}`; (groups.get(g) || groups.set(g, []).get(g)).push(x); }
      const stops = [];
      let n = 0;
      const table = el("table", "decks stats-list");
      table.innerHTML = '<thead><tr><th></th><th class="num">Right</th><th class="num">Time</th><th class="num">Asked</th></tr></thead>';
      table.append(...[...groups.values()].map((list) => {
        const { quiz, kind } = list[0].a, tb = el("tbody"), head = el("tr", "place"), th = el("th", "", where(quiz, kind));
        th.colSpan = 3; th.scope = "rowgroup";
        const url = practiceUrl(quiz, kind, list.map((x) => x.a.item), list.flatMap((x) => x.list)), acts = el("td", "acts-cell");
        if (url) { stops.push(url); n += list.length; }
        acts.append(practiceBtn(`Practice ${list.length}`, url));
        head.append(th, acts);
        tb.append(head, ...list.map((x) => itemRow(x.a, [pct(x.right), secs(x.ms), `×${x.list.length}`])));
        return tb;
      }));
      all.replaceChildren(practiceAllBtn(`Practice ${n}`, stops));
      body.replaceChildren(boxed(table));
    }
    fill();
    s.append(body);
    return s;
  }
  // A question's name as two parts: what is asked, and what more its quiz says of it ("Batanes", "Cagayan Valley").
  const parts = (name) => { const i = name.indexOf(" · "); return i < 0 ? [name, ""] : [name.slice(0, i), name.slice(i + 3)]; };
  // A question's line: its name (a click opens it), the rest of it smaller, and some numbers.
  function itemRow(a, nums) {
    const [ask, more] = parts(nameOf(a.quiz, a.kind, a.item)), tr = el("tr", "item"), td = el("td"), b = el("button", "linkish", ask);
    b.type = "button"; b.onclick = () => openItem(a.quiz, a.kind, a.item);
    td.append(b);
    if (more) td.append(" ", el("small", "", more));
    tr.append(td, ...nums.map((n) => el("td", "num", n)));
    return tr;
  }

  // What was given instead of what was asked (items of the same layer), both ways counted as one pair.
  function mixSection(answers) {
    const pairs = new Map();
    for (const a of answers) for (const g of a.given) {
      if (g.startsWith('"') || g === a.item) continue;
      const [x, y] = [a.item, g].sort(), key = `${a.quiz}|${a.kind}|${x}|${y}`;
      const p = pairs.get(key) || pairs.set(key, { quiz: a.quiz, kind: a.kind, x, y, xy: 0, yx: 0, list: [] }).get(key);
      if (a.item === x) p.xy++; else p.yx++;
      p.list.push(a);
    }
    const top = [...pairs.values()].sort((p, q) => q.xy + q.yx - (p.xy + p.yx)).slice(0, 15);
    if (!top.length) return section("Mix-ups", empty("No mix-ups yet"));
    // by quiz and layer, in the order of their biggest pair; Practice for each pair, each group (the questions of its
    // pairs) and all of them (on top)
    const groups = new Map();
    for (const p of top) { const g = `${p.quiz}|${p.kind}`; (groups.get(g) || groups.set(g, []).get(g)).push(p); }
    const { s, acts: all } = headed("Mix-ups"), stops = [], table = el("table", "decks stats-list mixups");
    let n = 0;
    table.append(...[...groups.values()].map((list) => {
      const { quiz, kind } = list[0], items = [...new Set(list.flatMap((p) => [p.x, p.y]))], url = practiceUrl(quiz, kind, items, list.flatMap((p) => p.list));
      if (url) { stops.push(url); n += items.length; }
      const tb = el("tbody"), head = el("tr", "place"), th = el("th", "", where(quiz, kind)), acts = el("td", "acts-cell");
      th.colSpan = 2; th.scope = "rowgroup";
      acts.append(practiceBtn(`Practice ${items.length}`, url));
      head.append(th, acts);
      tb.append(head, ...list.map((p) => {
        const tr = el("tr", "item"), td = el("td"), [from, to] = p.yx > p.xy ? [p.y, p.x] : [p.x, p.y], arrow = p.xy && p.yx ? " ⇄ " : " → ";
        const [a, aMore] = parts(nameOf(quiz, kind, from)), [b, bMore] = parts(nameOf(quiz, kind, to));
        const link = (item, text) => { const x = el("button", "linkish", text); x.type = "button"; x.onclick = () => openItem(quiz, kind, item); return x; };
        // (the names, and under them the rest of them: "Central Luzon (Region III) ⇄ Ilocos Region (Region I)")
        td.append(link(from, a), el("span", "arrow", arrow), link(to, b));
        if (aMore || bMore) td.append(el("small", "also", `${aMore || "–"}${arrow}${bMore || "–"}`));
        const count = el("td", "num", `×${p.xy + p.yx}`), act = el("td", "acts-cell");
        act.append(practiceBtn("Practice", practiceUrl(quiz, kind, [p.x, p.y], p.list)));
        tr.append(td, count, act);
        return tr;
      }));
      return tb;
    }));
    all.append(practiceAllBtn(`Practice ${n}`, stops));
    s.append(boxed(table));
    return s;
  }

  // Every quiz with cards or answers, by country; a quiz opens to its questions.
  const OPEN = new Set();
  function quizSection(answers, decks, now) {
    const by = new Map(), add = (id) => by.get(id) || by.set(id, { id, answers: [], deck: null }).get(id);
    for (const a of answers) if (byId.has(a.quiz)) add(a.quiz).answers.push(a);
    for (const d of decks) add(d.id).deck = d;
    if (!by.size) return section("Quizzes", empty("Nothing played yet"));
    const places = new Map();
    for (const q of by.values()) { const p = placeOf(byId.get(q.id)); (places.get(p) || places.set(p, []).get(p)).push(q); }
    const cardsOf = (q) => { const d = q.deck; if (!d) return [0, 0, 0]; const keys = SRS.all(d); return [keys.length, keys.filter((k) => !d.c[k].s).length, keys.filter((k) => d.c[k].d <= now).length]; };
    const table = el("table", "decks stats-quizzes");
    table.innerHTML = '<thead><tr><th>Quiz</th><th class="num">Cards</th><th class="num hide-s">Learned</th><th class="num">Due</th><th class="num">Right</th><th class="num hide-s">Time</th><th class="num last hide-s">Last</th></tr></thead>';
    const row = (cls, head, list, cards) => {
      const s = summary(list), last = list.length ? list[list.length - 1].at : null, tr = el("tr", cls);
      tr.append(head, ...[[cards[0], ""], [cards[1], "hide-s"], [cards[2], cards[2] ? "due" : ""], [pct(s.right), ""], [secs(s.ms), "hide-s"], [last ? ago(last, now) : "–", "hide-s"]].map(([v, c]) => el("td", `num ${c}`, typeof v === "number" ? v.toLocaleString("en-US") : v)));
      return tr;
    };
    const order = [...places].map(([p, qs]) => [p, qs, Math.max(...qs.map((q) => q.answers.length ? q.answers[q.answers.length - 1].at : 0))]).sort((a, b) => b[2] - a[2] || a[0].localeCompare(b[0]));
    for (const [place, qs] of order) {
      const tb = el("tbody"), th = el("th", "", place); th.scope = "rowgroup";
      const sums = qs.map(cardsOf).reduce((s, c) => s.map((x, i) => x + c[i]), [0, 0, 0]);
      tb.append(row("place", th, qs.flatMap((q) => q.answers).sort((a, b) => a.at - b.at), sums));
      for (const q of qs.sort((a, b) => (b.answers.at(-1)?.at ?? 0) - (a.answers.at(-1)?.at ?? 0))) {
        const td = el("td"), b = el("button", "linkish twisty", titleOf(q.id));
        b.type = "button"; b.setAttribute("aria-expanded", OPEN.has(q.id));
        td.append(b);
        const tr = row("quiz", td, q.answers, cardsOf(q)), rows = [];
        const fillItems = () => {
          for (const r of rows.splice(0)) r.remove();
          if (!OPEN.has(q.id)) return;
          const items = new Map();
          for (const a of q.answers) (items.get(`${a.kind}|${a.item}`) || items.set(`${a.kind}|${a.item}`, []).get(`${a.kind}|${a.item}`)).push(a);
          const list = [...items.values()].map((l) => ({ a: l[0], l, s: summary(l) })).sort((x, y) => (x.s.right ?? 1) - (y.s.right ?? 1) || y.l.length - x.l.length);
          const several = new Set(list.map((x) => x.a.kind)).size > 1;
          for (const x of list.slice(0, 200)) {
            const r = itemRow(x.a, [x.l.length, "", "", pct(x.s.right), secs(x.s.ms), ago(x.l[x.l.length - 1].at, now)]);
            r.className = "item sub";
            [...r.children].forEach((c, i) => { if (i === 2 || i === 5 || i === 6) c.classList.add("hide-s"); });
            if (several) r.firstChild.append(el("small", "", ` ${layerOf(q.id, x.a.kind)}`));
            rows.push(r);
          }
          if (!list.length) { const r = el("tr", "item sub"), c = el("td", "muted", "No answers yet"); c.colSpan = 7; r.append(c); rows.push(r); }
          tr.after(...rows);
        };
        b.onclick = () => { if (OPEN.has(q.id)) OPEN.delete(q.id); else OPEN.add(q.id); b.setAttribute("aria-expanded", OPEN.has(q.id)); fillItems(); };
        tb.append(tr);
        queueMicrotask(fillItems);
      }
      table.append(tb);
    }
    return section("Quizzes", boxed(table));
  }

  /* ---------- a question ---------- */
  const card = el("dialog", "stat-card");
  card.addEventListener("click", (e) => { if (e.target === card) card.close(); });
  card.addEventListener("close", () => { tip.hidden = true; });
  document.body.append(card);
  // A question of the stack opens its card (card-view.js), in this pop-up's place; any other question this.
  function openItem(quiz, kind, item) {
    if (typeof CARD_VIEW === "object" && CARD_VIEW.open(quiz, kind, item, { where: where(quiz, kind) })) return;
    const { answers, now } = DATA, list = answers.filter((a) => a.quiz === quiz && a.kind === kind && a.item === item), s = summary(list);
    const head = el("header"), close = el("button", "ghost small", "Close");
    close.type = "button"; close.onclick = () => card.close();
    const title = el("div");
    title.append(el("b", "", nameOf(quiz, kind, item)), el("small", "", where(quiz, kind)));
    head.append(title, close);
    const nums = el("p", "chart-head");
    nums.append(el("b", "", pct(s.right)), ` · ${secs(s.ms)} · ${list.length} ${list.length === 1 ? "answer" : "answers"}`);
    const kids = [head, nums];
    if (list.length) {
      kids.push(el("h3", "", "Answers"), chartBox((box) => answersChart(box, list, now)));
      const legend = el("ul", "chart-key");
      legend.innerHTML = '<li><i class="k-ok"></i>Right</li><li><i class="k-bad"></i>Wrong</li><li><i class="k-re"></i>Replay</li>';
      kids.push(legend);
      // its cards: one per way of answering and map, those that took a rating
      const cards = new Map();
      for (const a of list) if (a.iv != null) { const k = `${a.mode}|${a.look}`; (cards.get(k) || cards.set(k, { label: `${MODES[a.mode] ?? a.mode} · ${lookLabel(a.look || "quiz", city(quiz))}`, points: [] }).get(k)).points.push([a.at, a.iv]); }
      if (cards.size) kids.push(el("h3", "", "Interval"), chartBox((box) => intervalChart(box, [...cards.values()], Math.min(list[0].at, now - DAY), now)));
      const recent = el("table", "decks stats-list answers"), tb = el("tbody");
      tb.append(...list.slice(-12).reverse().map((a) => {
        const tr = el("tr"), given = a.given.map((g) => givenName(a, g)).join(", ");
        tr.append(el("td", "", dateTime(a.at)), el("td", "", `${MODES[a.mode] ?? a.mode}${a.review ? " · Review" : ""}${a.replay ? " · Replay" : ""}`),
          el("td", a.r === 0 ? "ok" : "bad", (a.r === 0 ? "✓" : a.r < 3 ? `✓ try ${a.r + 1}${given ? " · ✗" : ""}` : "✗") + (given ? ` ${given}` : "") + (a.v != null ? ` · ${Array.isArray(a.v) ? `${a.v[0].toLocaleString("en-US")} · ${a.v[1]} km` : `${a.v}%`}` : "")),
          el("td", "num", secs(a.ms)));
        return tr;
      }));
      recent.append(tb);
      kids.push(el("h3", "", "Last answers"), recent);
    }
    const acts = el("div", "acts");
    acts.append(practiceBtn("Practice", practiceUrl(quiz, kind, [item], list)));
    kids.push(acts);
    card.replaceChildren(...kids);
    card.showModal();
    for (const [box, make] of later) box.replaceChildren(make());
    later = [];
  }

  // Shown anew when looked at again, and when the log took answers from elsewhere.
  document.addEventListener("visibilitychange", () => { if (!document.hidden && shown === "stats" && !card.open) draw(); });
  if (typeof ANSWERS === "object") ANSWERS.listen((why) => { if (why === "taken" && shown === "stats" && !card.open) draw(); });
  let width = window.innerWidth;
  window.addEventListener("resize", () => { if (Math.abs(window.innerWidth - width) > 40 && shown === "stats" && !card.open) { width = window.innerWidth; draw(); } });
  pick(tabOf(location.hash));
}
