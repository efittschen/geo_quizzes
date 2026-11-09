// Review page: what is on the stack (see srs.js), by country and quiz, each with buttons to review it (the whole
// world at the top). Its settings are on the settings page (settings.js). Only quizzes listed in data/site/quizzes.json
// are shown; the stack of a quiz that left the list is kept.

const $ = (id) => document.getElementById(id);
const BACK = "review.html";
// The stack's two views ("tree": by place and quiz, down to every card; "due": every card by when it is due), and
// the tree's branches the player opened or closed, kept while the page shows its numbers anew: places start open
// (their quizzes show), everything under a quiz closed.
let VIEW = "tree";
const FLIPPED = new Set();
const isOpen = (node) => node.startsWith("p:") !== FLIPPED.has(node);
// A card's interval, short: 12 d, 1.5 y.
const span = (days) => (days >= 365 ? `${(days / 365).toFixed(1)} y` : days >= 1 ? `${Math.round(days)} d` : days > 0 ? `${Math.max(1, Math.round(days * 24))} h` : "");
// When a card is due, short, for the stack on a phone: now, 40 min, 5 h, 9 d, 3 mo, 1.5 y (days as SRS.until counts them).
function dueShort(ts, now) {
  if (ts <= now) return "now";
  const n = SRS.days(now, ts), m = Math.ceil((ts - now) / 60000);
  if (n < 1) return m < 60 ? `${m} min` : `${Math.round(m / 60)} h`;
  return n < 60 ? `${n} d` : n < 730 ? `${Math.round(n / 30.4)} mo` : `${(n / 365).toFixed(1)} y`;
}
// When something is due, as the stack says it: "in 9 days", or on a phone "9 d" (see .due-short).
function dueWhen(ts, now) {
  const out = document.createDocumentFragment(), long = document.createElement("span"), short = document.createElement("span");
  long.className = "due-long"; long.textContent = SRS.until(ts, now);
  short.className = "due-short"; short.textContent = dueShort(ts, now);
  out.append(long, short);
  return out;
}
// Country names too long for the stack, in their usual short form.
const SHORT_NAMES = { "United States of America": "USA", "United Kingdom": "UK", "United Arab Emirates": "UAE" };
// A city quiz (its maps: by distance, or the dots), and the maps a quiz's cards can be on, as its page says them.
const cityOf = (d) => d.quiz.role === "cities";
const looksOf = (d) => SRS.looksOf(d.id) ?? (cityOf(d) ? ["free", "quiz"] : ["quiz", "overlay", "street", "bare", "sat"]);
// A row's actions behind ⋯ (a select: on a phone its own list): groups of [label, value] under their headings, then
// Remove where there is remove(); act(value) or remove() does it and says whether anything changed, and changed()
// follows if so.
function moreMenu(what, groups, act, remove = null, changed = () => {}) {
  const pick = document.createElement("select");
  pick.className = "more";
  pick.title = "More";
  pick.setAttribute("aria-label", `More: ${what}`);
  pick.append(new Option("⋯", ""), ...groups.filter(([, items]) => items.length).map(([heading, items]) => {
    const group = document.createElement("optgroup");
    group.label = heading;
    group.append(...items.map(([label, value]) => new Option(label, `do:${value}`)));
    return group;
  }), ...(remove ? [new Option("Remove", "remove")] : []));
  pick.onchange = () => {
    const v = pick.value;
    pick.value = "";
    if (v === "remove" ? remove() : v && act(v.slice(3))) changed();
  };
  return pick;
}
// A card's name in a cell: the question, and what more the quiz says of it, smaller (short: the question alone; all
// of it on hover either way).
function cardCell(called, c, short = false) {
  const td = document.createElement("td"), [ask, more] = called[`${c.kind}|${c.item}`] ?? [c.item];
  td.title = more ? `${ask} · ${more}` : ask;
  td.append(ask);
  if (more && !short) { const small = document.createElement("small"); small.textContent = more; td.append(" ", small); }
  return td;
}

function render(index, nameByCode) {
  const now = Date.now();
  const decks = SRS.overview(index.quizzes, now);
  const sum = (list, key) => list.reduce((total, d) => total + d[key], 0);

  // The whole world, and when nothing is due, when the next card is.
  $("review-go").replaceChildren(...(reviewButtons(index, index.quizzes, BACK) ?? []));
  if (decks.length && !sum(decks, "due")) {
    const next = document.createElement("span");
    next.className = "label";
    next.textContent = `Next ${SRS.until(decks[0].next, now)}`;
    $("review-go").append(next);
  }
  const result = reviewResult();
  document.querySelector(".run")?.remove();
  if (result) $("review-go").after(result);

  // Countries (or areas like South Asia, or the world or a continent as a whole) with their quizzes, most due first.
  const places = new Map(), placeOf = new Map();
  for (const d of decks) {
    const country = nameByCode.get(quizCountries(d.quiz)[0]), place = d.quiz.area ?? d.quiz.scope ?? (country && (SHORT_NAMES[country] ?? country)) ?? d.title;
    places.set(place, [...(places.get(place) ?? []), d]);
    placeOf.set(d.id, place);
  }
  for (const b of document.querySelectorAll("#view-pick button")) b.setAttribute("aria-pressed", b.dataset.view === VIEW);
  $("view-pick").hidden = !decks.length;
  $("decks").hidden = !decks.length || VIEW !== "tree";
  $("due-list").hidden = !decks.length || VIEW !== "due";
  $("empty").hidden = decks.length > 0;
  if (VIEW === "due") { renderDue(decks, placeOf, now); return; }
  // The tree: each row a branch (node) under another (parent), shown while every branch above it is open.
  const parents = new Map();
  const showTree = () => {
    const open = (node) => { for (let n = node; n; n = parents.get(n)) if (!isOpen(n)) return false; return true; };
    for (const tr of $("deck-rows").children) {
      tr.hidden = !!tr.dataset.parent && !open(tr.dataset.parent);
      const twist = tr.dataset.node && tr.querySelector(".twist");
      if (twist) { twist.setAttribute("aria-expanded", isOpen(tr.dataset.node)); twist.setAttribute("aria-label", isOpen(tr.dataset.node) ? "Close" : "Open"); }
    }
  };
  const redraw = () => render(index, nameByCode);
  // Converting cards to another map (jobs: [quiz id, kind, look, to], see SRS.convert): where a question then has two
  // cards on that map, the one answered last stays, asked first.
  const converting = (what, label, jobs) => {
    const c = jobs.map(([id, kind, look, to]) => SRS.clash(id, kind, look, to)).reduce((s, x) => ({ moving: s.moving + x.moving, merged: s.merged + x.merged }), { moving: 0, merged: 0 });
    const n = (k, one) => `${k} ${one}${k === 1 ? "" : "s"}`;
    if (c.merged && !window.confirm(`${what} → ${label}: ${n(c.moving, "card")}\n${n(c.merged, "question")} with two cards there: the one answered last stays\n\nConvert?`)) return false;
    for (const [id, kind, look, to] of jobs) SRS.convert(id, kind, look, to);
    return true;
  };
  const tree = (tr, node, parent = null) => {
    if (parent) tr.dataset.parent = parent;
    if (node) {
      tr.dataset.node = node;
      if (parent) parents.set(node, parent);
      const twist = document.createElement("button");
      twist.type = "button";
      twist.className = "twist";
      twist.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5l4.5 4.5L6 12.5"/></svg>';
      twist.onclick = () => { if (FLIPPED.has(node)) FLIPPED.delete(node); else FLIPPED.add(node); showTree(); };
      tr.firstElementChild.prepend(twist);
    }
    return tr;
  };
  const row = (cls, head, list, extra = [], layer = null) => {
    const tr = document.createElement("tr");
    tr.className = cls;
    const cell = (content, className) => {
      const td = document.createElement("td");
      td.append(content);
      if (className) td.className = className;
      tr.append(td);
    };
    tr.append(head);
    const next = Math.min(...list.map((d) => d.next)); // (when the soonest of its cards is due)
    cell(dueWhen(next, now), next <= now ? "num due" : "num");
    cell(sum(list, "total"), "num learned");
    const acts = document.createElement("div");
    acts.className = "acts";
    acts.append(...(reviewButtons(index, layer ? [layer.quiz] : list.map((d) => d.quiz), BACK, true, layer) ?? []), ...extra);
    cell(acts);
    return tr;
  };
  const byDue = (a, b) => sum(b[1], "due") - sum(a[1], "due") || a[0].localeCompare(b[0]);
  $("deck-rows").replaceChildren(...[...places].sort(byDue).flatMap(([place, list]) => {
    const th = document.createElement("th");
    th.scope = "rowgroup";
    th.textContent = place;
    th.title = place;
    const P = `p:${place}`;
    // A place's ⋯: its quizzes' maps (a city quiz's apart, its "quiz" being the dots), each converting the cards of
    // the quizzes that have it; or all of them off the stack.
    const targets = new Map(), kindOfQuiz = (d) => (cityOf(d) ? "c" : "a");
    for (const d of list) for (const x of looksOf(d)) targets.set(`${kindOfQuiz(d)}:${x}`, lookLabel(x, cityOf(d)));
    const ORDER = ["a:quiz", "a:overlay", "a:street", "a:bare", "a:sat", "c:free", "c:quiz"], rank = (k) => (ORDER.indexOf(k) + 1 || 99);
    const placeMenu = moreMenu(`“${place}”`, [["Convert to", [...targets].sort((a, b) => rank(a[0]) - rank(b[0])).map(([k, label]) => [label, k])]], (k) => {
      const [q, x] = k.split(":");
      return converting(`“${place}”`, targets.get(k), list.filter((d) => kindOfQuiz(d) === q && looksOf(d).includes(x)).map((d) => [d.id, null, null, x]));
    }, () => {
      if (!window.confirm(`Remove “${place}” from the stack?`)) return false;
      for (const d of list) SRS.remove(d.id);
      return true;
    }, redraw);
    return [tree(row("place", th, list, [placeMenu]), P), ...list.map((d) => {
      const Q = `q:${d.id}`, cards = SRS.cardList(d.id).sort((a, b) => a.due - b.due), called = STORE.quiz(d.id).called || {};
      // A container's cards, each on a line of its own (depth: how far in; lines: the branches above that go on past
      // them, at those offsets).
      const cardRows = (list, parent, depth, lines = []) => list.map((c) => {
        const tr = document.createElement("tr");
        tr.className = `cardline d${depth}`;
        const name = cardCell(called, c);
        if (lines.length) name.style.setProperty("--lines", lines.map((x) => `linear-gradient(var(--line),var(--line)) no-repeat ${x}px 0/1.5px 100%`).join(","));
        const cell = (text, cls) => { const td = document.createElement("td"); td.textContent = text; if (cls) td.className = cls; return td; };
        const due = cell("", c.due <= now ? "num due" : "num");
        due.append(dueWhen(c.due, now));
        tr.append(name, due, cell(span(c.interval), "num learned"), cell(""));
        return tree(tr, null, parent);
      });
      const td = document.createElement("td");
      const a = document.createElement("a");
      a.href = d.quiz.url;
      a.textContent = d.quiz.title;
      td.title = d.quiz.title;
      td.append(a);
      // A quiz with cards of several layers (island groups, provinces…): each layer on a line of its own, to be
      // reviewed or removed by itself. The quiz's own line is then the sum of them, and a layer named
      // like its quiz (the "Area codes" of "Area Codes", next to "First digit") is told apart: "Full codes".
      // A layer with cards played on several maps (the quiz map, the street map…) has a line for each map under it;
      // a quiz with one layer has them under its own line.
      const kids = (l) => l.maps.length > 1, grouped = (l) => l.groups.length > 1;
      // (a layer played in a mode, its cards typed or picked rather than clicked, is named on a line of its own even
      // alone: "Area codes · Type code", so its cards are not taken for the map's)
      const several = d.layers.length > 1 || d.layers[0].key.includes("~"), onlyMaps = !several && (kids(d.layers[0]) || grouped(d.layers[0]));
      const same = (label) => label.toLowerCase() === d.quiz.title.toLowerCase();
      const named = d.layers.map((l) => ({ ...l, label: !same(l.label) ? l.label : d.quiz.role === "area-codes" ? "Full codes" : `${l.label} only` }));
      const city = d.quiz.role === "cities";
      // A quiz's, a layer's or a map's ⋯ (kind and look null for all of them): its cards converted to another map of
      // the quiz (here: the maps they are on now; one alone is not offered), or taken off the stack.
      const menu = (what, kind, look, here) => {
        const to = looksOf(d).filter((x) => !(here.length === 1 && here[0] === x));
        return moreMenu(what, [["Convert to", to.map((x) => [lookLabel(x, city), x])]], (x) => converting(what, lookLabel(x, city), [[d.id, kind, look, x]]), () => {
          if (!window.confirm(`Remove ${what} from the stack?`)) return false;
          SRS.remove(d.id, kind, look);
          return true;
        }, redraw);
      };
      // The maps of a layer, hanging from it (deep: under a layer line, else under the quiz's own line).
      const mapRows = (l, deep, more) => {
        const maps = l.maps.length > 1 ? l.maps : [], n = maps.length;
        const cls = (i) => ["layer", deep ? "map" : "", deep && more ? "more" : "", i === n - 1 ? "last" : ""].filter(Boolean).join(" ");
        const rows = maps.flatMap((m, i) => {
          const cell = document.createElement("td"), M = `m:${d.id}|${l.key}|${m.look}`, parent = deep ? `l:${d.id}|${l.key}` : Q;
          cell.textContent = lookLabel(m.look, city);
          const lines = [...(deep && more ? [42] : []), ...(i < n - 1 ? [deep ? 68 : 42] : [])];
          return [tree(row(cls(i), cell, [m], [menu(`“${d.title}”, ${several ? `${l.label}, ` : ""}${lookLabel(m.look, city)}`, l.key, m.look, [m.look])], { id: d.id, key: l.key, look: m.look, quiz: d.quiz }), M, parent),
            ...cardRows(cards.filter((c) => c.kind === l.key && c.look === m.look), M, deep ? 3 : 2, lines)];
        });
        return rows;
      };
      // A layer's groups (Indonesia's kabupaten and kota by province, area codes by their first digits), each on a
      // line of its own to be reviewed by itself, with its maps (where its cards are on several) and its cards.
      // lv: the groups' level (1 under the quiz's line, 2 under a layer's); lines: the branches above that go on past them.
      const groupOf = Object.fromEntries(Object.entries(STORE.quiz(d.id).grouped || {}).map(([kind, list]) => [kind, new Map(list.flatMap(([title, items]) => items.map((it) => [it, title])))]));
      const inGroup = (c, title) => groupOf[c.kind] && groupOf[c.kind].get(c.item) === title;
      const X = (lv) => 16 + 26 * lv, guide = (lines) => lines.map((x) => `linear-gradient(var(--line),var(--line)) no-repeat ${x}px 0/1.5px 100%`).join(",") || "none";
      const levelCls = (lv, last) => ["layer", lv === 2 ? "map" : lv === 3 ? "lv3" : "", last ? "last" : ""].filter(Boolean).join(" ");
      const groupRows = (l, lv, parent, lines) => l.groups.flatMap((g, i) => {
        const last = i === l.groups.length - 1, cell = document.createElement("td"), G = `g:${d.id}|${l.key}|${g.title}`, below = [...lines, ...(last ? [] : [X(lv)])];
        cell.textContent = cell.title = g.title;
        cell.style.setProperty("--lines", guide(lines));
        const maps = g.maps.length > 1 ? g.maps : [];
        // (no ⋯ of its own: a gap as wide, so its buttons line up with the others')
        const gap = () => { const x = document.createElement("span"); x.className = "more-gap"; return x; };
        return [tree(row(levelCls(lv, last), cell, [g], [gap()], { id: d.id, key: l.key, group: g.title, quiz: d.quiz }), G, parent),
          ...(maps.length ? maps.flatMap((m, j) => {
            const mlast = j === maps.length - 1, mc = document.createElement("td"), M = `${G}|${m.look}`;
            mc.textContent = lookLabel(m.look, city);
            mc.style.setProperty("--lines", guide(below));
            return [tree(row(levelCls(lv + 1, mlast), mc, [m], [gap()], { id: d.id, key: l.key, group: g.title, look: m.look, quiz: d.quiz }), M, G),
              ...cardRows(cards.filter((c) => c.kind === l.key && c.look === m.look && inGroup(c, g.title)), M, lv + 2, [...below, ...(mlast ? [] : [X(lv + 1)])])];
          }) : cardRows(cards.filter((c) => c.kind === l.key && inGroup(c, g.title)), G, lv + 1, below))];
      });
      // The layers hang from the sum's line on a branch, indented under it (see .decks tr.sum, tr.layer).
      const layers = several ? named.flatMap((l, i) => {
        const last = i === named.length - 1, maps = kids(l) || grouped(l);
        const cell = document.createElement("td");
        cell.textContent = cell.title = l.label;
        const cls = ["layer", maps ? "parent" : "", last ? "last" : ""].filter(Boolean).join(" "), L = `l:${d.id}|${l.key}`;
        return [tree(row(cls, cell, [l], [menu(`“${d.title}”, ${l.label}`, l.key, null, l.maps.map((m) => m.look))], { id: d.id, key: l.key, quiz: d.quiz }), L, Q),
          ...(grouped(l) ? groupRows(l, 2, L, last ? [] : [42]) : maps ? mapRows(l, true, !last) : cardRows(cards.filter((c) => c.kind === l.key), L, 2, last ? [] : [42]))];
      }) : grouped(named[0]) ? groupRows(named[0], 1, Q, []) : onlyMaps ? mapRows(named[0], false, false) : cardRows(cards, Q, 1);
      return [tree(row(several || onlyMaps ? "sum" : "", td, [d], [menu(`“${d.title}”`, null, null, [...new Set(d.layers.flatMap((l) => l.maps.map((m) => m.look)))])]), Q, P), ...layers];
    }).flat()];
  }));
  showTree();
}

// The other view: every card on the stack by when it is due, soonest first, with the quiz it is in (and its layer
// and map, where the quiz has cards of several).
function renderDue(decks, placeOf, now) {
  const rows = decks.flatMap((d) => {
    const called = STORE.quiz(d.id).called || {}, cards = SRS.cardList(d.id), city = d.quiz.role === "cities";
    // (a layer named like its quiz, its main one, is not named again: "Brazil · Area Codes", not "… · Area codes")
    const layerOf = new Map(d.layers.filter((l) => l.label.toLowerCase() !== d.quiz.title.toLowerCase()).map((l) => [l.key, l.label])), maps = new Set(cards.map((c) => c.look)).size > 1;
    const groupOf = Object.fromEntries(Object.entries(STORE.quiz(d.id).grouped || {}).map(([kind, list]) => [kind, new Map(list.flatMap(([title, items]) => items.map((it) => [it, title])))]));
    const shown = new Set(d.layers.filter((l) => l.groups.length > 1).map((l) => l.key)); // (layers whose cards are in several groups)
    return cards.map((c) => ({ c, d, called, within: [...(d.layers.length > 1 || c.kind.includes("~") ? [layerOf.get(c.kind)] : []), ...(shown.has(c.kind) && groupOf[c.kind] ? [groupOf[c.kind].get(c.item)] : []), ...(maps && c.look ? [lookLabel(c.look, city)] : [])].filter(Boolean) }));
  }).sort((a, b) => a.c.due - b.c.due || a.d.quiz.title.localeCompare(b.d.quiz.title));
  $("due-rows").replaceChildren(...rows.map(({ c, d, called, within }) => {
    const tr = document.createElement("tr");
    const due = document.createElement("td");
    due.className = c.due <= now ? "num due" : "num";
    due.append(dueWhen(c.due, now));
    // the place, the quiz (a link to it), and its layer and map
    const quiz = document.createElement("td"), a = document.createElement("a"), place = document.createElement("small"), rest = document.createElement("small");
    a.href = d.quiz.url;
    a.textContent = d.quiz.title;
    place.className = "q-place";
    place.textContent = `${placeOf.get(d.id)} · `;
    // (on a phone the country's code instead of its name: BR · Area Codes)
    const code = document.createElement("small");
    code.className = "q-code";
    const where = placeOf.get(d.id), short = Object.values(SHORT_NAMES).includes(where); // (USA, UK, UAE as they are: not US, GB, AE)
    code.textContent = `${(!short && quizCode(d.quiz)) || where} · `;
    rest.textContent = within.map((w) => ` · ${w}`).join("");
    quiz.append(place, code, a, rest);
    // When the player wants it asked, given by hand: now, sooner or later (SRS.reschedule), its history kept and
    // no answer counted. The row stays where it is, with its new time, until the list is shown anew.
    // (as buttons where there is room, else behind ⋯: see .grades)
    const grades = document.createElement("td"), box = document.createElement("div"), WHEN = [["Now", "now"], ["Sooner", "sooner"], ["Later", "later"]];
    box.className = "acts grades";
    const move = (how) => {
      const at = Date.now(), card = SRS.reschedule(d.id, c.key, how, at);
      if (card) { due.className = card.d <= at ? "num due" : "num"; due.replaceChildren(dueWhen(card.d, at)); }
      return false; // (the row stays where it is)
    };
    box.append(...WHEN.map(([label, how]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ghost small";
      b.textContent = label;
      b.onclick = () => move(how);
      return b;
    }), moreMenu(cardCell(called, c).title, [["Review", WHEN]], move));
    grades.append(box);
    tr.append(due, cardCell(called, c, true), quiz, grades);
    return tr;
  }));
}

// The name of a map cards are played on (their look, see srs.js): the quiz map, the overlay, the street map, the bare
// map, the satellite map; in a city quiz the map by distance or the dots, on the drawn map, the overlay, the street
// map, the bare map or the satellite map.
function lookLabel(look, city) {
  const NAMES = { quiz: "Quiz map", overlay: "Overlay", street: "Street map", bare: "Bare map", sat: "Satellite" };
  const [map, back] = look.split("+");
  if (!city && map !== "free") return NAMES[map] ?? map;
  return (map === "free" ? "Map" : "Dots") + (back ? ` · ${NAMES[back] ?? back}` : "");
}

// Two things only a card's quiz page knows (see engine/app/review.js): what the card is called (the record's `called`), and,
// for a card from before a card was a question on one map that doesn't say its map, which map that is (the one
// worked out from the best results, by the page's own rounds). So each quiz page with a card that lacks either is
// opened here out of sight (…?cards), one after another, and says when it is done (or 20 s pass); the list is shown
// anew after each. Once: from then on the cards have both, and the quiz page keeps them up to date. (Cards whose
// question is no longer in the quiz, `missing`, wait for it to be back.)
async function fillIn(index, shown) {
  const urls = new Map(index.quizzes.filter((q) => q.url).map((q) => [q.id, q.url]));
  const lacking = (id) => {
    const r = STORE.quiz(id), named = r.called || {};
    return Object.entries(r.cards || {}).some(([k, c]) => {
      const bar = k.indexOf("|"), at = k.lastIndexOf("@", bar), item = (at < 0 ? k.slice(0, bar) : k.slice(0, at)) + k.slice(bar);
      return !c.missing && ((at < 0 && !c.map) || !named[item]);
    });
  };
  for (const id of STORE.quizIds().filter((id) => urls.has(id) && lacking(id))) {
    await new Promise((done) => {
      const frame = document.createElement("iframe");
      frame.setAttribute("aria-hidden", "true");
      frame.tabIndex = -1;
      frame.style.cssText = "position:fixed;left:-10000px;top:0;width:1024px;height:768px;border:0;visibility:hidden";
      const end = () => { clearTimeout(timer); window.removeEventListener("message", heard); frame.remove(); done(); };
      const heard = (event) => { if (event.source === frame.contentWindow && event.data === "geoquizzes:cards") end(); };
      const timer = setTimeout(end, 20000);
      window.addEventListener("message", heard);
      frame.src = urls.get(id) + "?cards=1";
      document.body.append(frame);
    });
    shown();
  }
}

async function init() {
  let refresh = () => {};
  // Entries changed from the online copy (see sync.js): the stack is shown anew, the page not loaded again.
  window.addEventListener("geoquizzes:fresh", (event) => { event.preventDefault(); refresh(); });
  try {
    const json = async (url) => (await fetch(url)).json();
    // Country names come with the world map; without it the quizzes are still listed, under their own titles.
    const [index, world] = await Promise.all([loadIndex(), json(WORLD_URL).catch(() => null)]);
    const nameByCode = new Map((world?.objects.countries.geometries ?? []).map((g) => [g.id, g.properties.name]));
    render(index, nameByCode);
    if (typeof initStats === "function") initStats(index, nameByCode); // the Stats tab (stats.js)
    fillIn(index, () => render(index, nameByCode));
    for (const b of document.querySelectorAll("#view-pick button")) b.onclick = () => { VIEW = b.dataset.view; render(index, nameByCode); };
    // Cards come due while the page is open (a new card after a minute), here or in another tab.
    refresh = () => { if (!document.hidden && VIEW !== "due") render(index, nameByCode); }; // (by due: not sorted anew under the player)
    document.addEventListener("visibilitychange", refresh);
    setInterval(refresh, 15000);
  } catch (err) {
    console.error(err);
    $("empty").textContent = "Couldn't load this page. If you opened the file directly, run a local server (see README).";
    $("empty").hidden = false;
  }
}

init();
