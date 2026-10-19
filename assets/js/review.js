// Review page: what is on the stack (see srs.js), by country and quiz, each with buttons to review it (the whole
// world at the top), the settings: the clock's times, the limits per review and per day and the schedule, and "Your data":
// what this browser keeps, as a file to download or put back, and "Online copy": a place of the player's own where their
// browsers meet (see sync.js). Only quizzes listed in data/quizzes.json are shown; the stack of a quiz
// that left the list is kept.

const $ = (id) => document.getElementById(id);
const BACK = "review.html";

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
  $("today").textContent = `Today ${SRS.today(now)}`;
  const result = reviewResult();
  document.querySelector(".run")?.remove();
  if (result) $("review-go").after(result);

  // Countries (or areas like South Asia, or the world or a continent as a whole) with their quizzes, most due first.
  const places = new Map();
  for (const d of decks) {
    const place = d.quiz.area ?? d.quiz.scope ?? nameByCode.get(quizCountries(d.quiz)[0]) ?? d.title;
    places.set(place, [...(places.get(place) ?? []), d]);
  }
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
    cell(sum(list, "due"), sum(list, "due") ? "num due" : "num");
    cell(sum(list, "total"), "num");
    cell(SRS.until(Math.min(...list.map((d) => d.next)), now), "next");
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
    return [row("place", th, list), ...list.map((d) => {
      const td = document.createElement("td");
      const a = document.createElement("a");
      a.href = quizUrl(d.quiz);
      a.textContent = d.quiz.title;
      td.append(a);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "linkbtn";
      remove.textContent = "Remove";
      remove.onclick = () => {
        if (!window.confirm(`Remove “${d.title}” from the stack?`)) return;
        SRS.remove(d.id);
        render(index, nameByCode);
      };
      // A quiz with cards of several layers (island groups, provinces…): each layer on a line of its own, to be
      // reviewed or removed by itself. The quiz's own line is then named as the sum of them ("All - Area Codes (2 layers)"), and a layer named
      // like its quiz (the "Area codes" of "Area Codes", next to "First digit") is told apart: "Full codes".
      // A layer with cards played on several maps (the quiz map, the street map…) has a line for each map under it;
      // a quiz with one layer has them under its own line ("All - Area Codes (2 maps)").
      const several = d.layers.length > 1, onlyMaps = !several && d.layers[0].maps.length > 1;
      if (several) a.textContent = `All - ${d.quiz.title} (${d.layers.length} layers)`;
      else if (onlyMaps) a.textContent = `All - ${d.quiz.title} (${d.layers[0].maps.length} maps)`;
      const same = (label) => label.toLowerCase() === d.quiz.title.toLowerCase();
      const named = d.layers.map((l) => ({ ...l, label: !same(l.label) ? l.label : d.quiz.role === "area-codes" ? "Full codes" : `${l.label} only` }));
      const city = ["cities", "cities-coverage"].includes(d.quiz.role);
      const dropper = (what, ...part) => {
        const drop = document.createElement("button");
        drop.type = "button";
        drop.className = "linkbtn";
        drop.textContent = "Remove";
        drop.onclick = () => {
          if (!window.confirm(`Remove ${what} of “${d.title}” from the stack?`)) return;
          SRS.remove(d.id, ...part);
          render(index, nameByCode);
        };
        return drop;
      };
      // The maps of a layer, hanging from it (deep: under a layer line, else under the quiz's own line).
      const mapRows = (l, deep, more) => l.maps.map((m, i) => {
        const cell = document.createElement("td");
        cell.textContent = lookLabel(m.look, city);
        const cls = ["layer", deep ? "map" : "", deep && more ? "more" : "", i === l.maps.length - 1 ? "last" : ""].filter(Boolean).join(" ");
        return row(cls, cell, [m], [dropper(`the ${lookLabel(m.look, city)} cards of “${l.label}”`, l.key, m.look)], { id: d.id, key: l.key, look: m.look, quiz: d.quiz });
      });
      // The layers hang from the sum's line on a branch, indented under it (see .decks tr.sum, tr.layer).
      const layers = several ? named.flatMap((l, i) => {
        const last = i === named.length - 1, maps = l.maps.length > 1;
        const cell = document.createElement("td");
        cell.textContent = l.label;
        const cls = ["layer", maps ? "parent" : "", last ? "last" : ""].filter(Boolean).join(" ");
        return [row(cls, cell, [l], [dropper(`“${l.label}”`, l.key)], { id: d.id, key: l.key, quiz: d.quiz }), ...(maps ? mapRows(l, true, !last) : [])];
      }) : onlyMaps ? mapRows(named[0], false, false) : [];
      return [row(several || onlyMaps ? "sum" : "", td, [d], [remove]), ...layers];
    }).flat()];
  }));
  $("decks").hidden = !decks.length;
  $("empty").hidden = decks.length > 0;
}

// The name of a map cards are played on (their look, see srs.js): the quiz map, the overlay, the street map; in a
// city quiz the map by distance or the dots, on the drawn map, the overlay or the street map.
function lookLabel(look, city) {
  const NAMES = { quiz: "Quiz map", overlay: "Overlay", street: "Street map" };
  if (!look) return "Map not recorded yet";
  const [map, back] = look.split("+");
  if (!city && map !== "free") return NAMES[map] ?? map;
  return (map === "free" ? "Map" : "Dots") + (back ? ` · ${NAMES[back] ?? back}` : "");
}

// The settings (see srs.js): the three times of the clock, the two limits, and the schedule: which scheduler (FSRS or
// SM-2), and its options, with the names they have in Anki; only those of the chosen scheduler show.
// onChange: the limits change the buttons.
function initSettings(onChange) {
  const NUMBERS = ["easy", "fast", "limit", "round", "day", "retain", "restep", "keep", "first", "ease", "hard", "max"];
  const SCHEDULE = ["algo", "steps", ...NUMBERS.slice(5)];
  const show = () => {
    const o = SRS.opts();
    for (const key of NUMBERS) $(key).value = o[key];
    $("algo").value = o.algo;
    $("steps").value = o.steps.join(" "); // minutes, one step after the other: "1 10"
    for (const label of document.querySelectorAll("[data-algo]")) label.hidden = label.dataset.algo !== o.algo;
  };
  const save = () => {
    const number = (id, min = 1, max = Infinity) => Math.min(max, Math.max(min, Math.round(+$(id).value) || 0));
    const easy = number("easy", 0), fast = Math.max(easy + 1, number("fast")); // easy 0: no answer is "easy"
    SRS.setOpts({
      easy, fast, limit: Math.max(fast + 1, number("limit")), round: number("round"), day: number("day"),
      algo: $("algo").value, retain: number("retain", 70, 97),
      steps: $("steps").value.split(/[\s,;]+/).map(Number).filter((m) => m > 0),
      restep: number("restep", 0), keep: number("keep", 0, 100), first: number("first"),
      ease: number("ease", 130), hard: number("hard", 50), max: number("max"),
    });
    show();
    onChange();
  };
  for (const key of ["algo", "steps", ...NUMBERS]) $(key).addEventListener("change", save);
  $("defaults").addEventListener("click", () => { SRS.resetOpts(SCHEDULE); show(); });
  show();
  return show;
}

// "Your data": everything the site keeps in this browser as one file to download, and the way back: a file put in
// place of what is kept here (see store.js for both, and for what the file holds).
function initData() {
  $("download").addEventListener("click", () => {
    const file = STORE.file();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify(file, null, 1)], { type: "application/json" }));
    link.download = `geo-quizzes-${file.saved.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
  const input = $("upload-file");
  $("upload").addEventListener("click", () => input.click());
  input.addEventListener("change", async () => {
    const chosen = input.files[0];
    input.value = "";
    if (!chosen) return;
    let file = null;
    try { file = JSON.parse(await chosen.text()); } catch (e) {}
    if (file?.app !== "geo-quizzes" || !(file.quizzes || file.data)) return alert("Not a Geo Quizzes file");
    if (!confirm("Replace what is saved here?")) return;
    if (!STORE.restore(file)) return alert("Not a Geo Quizzes file");
    location.reload();
  });
}

// "Google street map" (see gmaps.js): the player's own Google Maps key, kept in this browser, and whether it answers.
function initMaps() {
  const show = (busy) => {
    const { key, fault, at } = GMAPS.state();
    $("maps-key").readOnly = !!key;
    $("maps-key").value = key;
    $("maps-on").hidden = !!key;
    $("maps-off").hidden = !key;
    $("maps-state").textContent = !key ? "" : busy ? "Trying" : fault ?? (at ? "Works" : "");
  };
  $("maps-on").addEventListener("click", async () => {
    const typed = $("maps-key").value;
    if (!typed.trim()) return;
    const trying = GMAPS.set(typed);
    show(true);
    await trying;
    show();
  });
  $("maps-key").addEventListener("keydown", (event) => { if (event.key === "Enter" && !GMAPS.key()) $("maps-on").click(); });
  $("maps-off").addEventListener("click", () => { GMAPS.set(""); show(); });
  show();
}

// "Online copy" (see sync.js): the web app link of the player's own script, which every change is then also sent to
// and read from, how that goes, and the script itself, to copy while setting it up (the steps under "Setup").
// onFresh: entries here changed from the online copy.
function initOnline(onFresh) {
  const show = () => {
    const { url, at, fault, busy } = SYNC.state();
    $("sync-url").readOnly = !!url;
    if (url) $("sync-url").value = url;
    $("sync-on").hidden = !!url;
    $("sync-off").hidden = !url;
    const time = at ? new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    $("sync-state").textContent = !url ? "" : busy ? "Syncing" : fault ?? (time && `Synced ${time}`);
  };
  $("sync-on").addEventListener("click", async () => {
    const fault = await SYNC.connect($("sync-url").value);
    show();
    if (fault) $("sync-state").textContent = fault;
  });
  $("sync-url").addEventListener("keydown", (event) => { if (event.key === "Enter" && !SYNC.state().url) $("sync-on").click(); });
  $("sync-off").addEventListener("click", () => {
    SYNC.disconnect();
    $("sync-url").value = "";
  });
  // The script is fetched when the steps are opened, so that a click copies it at once.
  let script = null;
  const load = () => (script ||= fetch("assets/js/online-copy.gs").then((r) => r.text()));
  $("sync-steps").addEventListener("toggle", load);
  $("sync-script").addEventListener("click", async () => {
    await navigator.clipboard.writeText(await load());
    $("sync-script").textContent = "Copied";
  });
  window.addEventListener("geoquizzes:sync", show);
  window.addEventListener("geoquizzes:fresh", (event) => { event.preventDefault(); onFresh(); });
  show();
}

async function init() {
  let refresh = () => {};
  const showSettings = initSettings(() => refresh());
  initData();
  initOnline(() => { showSettings(); refresh(); });
  initMaps();
  try {
    const json = async (url) => (await fetch(url)).json();
    // Country names come with the world map; without it the quizzes are still listed, under their own titles.
    const [index, world] = await Promise.all([loadIndex(), json(WORLD_URL).catch(() => null)]);
    const nameByCode = new Map((world?.objects.countries.geometries ?? []).map((g) => [g.id, g.properties.name]));
    render(index, nameByCode);
    // Cards come due while the page is open (a new card after a minute), here or in another tab.
    refresh = () => { if (!document.hidden) render(index, nameByCode); };
    document.addEventListener("visibilitychange", refresh);
    setInterval(refresh, 15000);
  } catch (err) {
    console.error(err);
    $("empty").textContent = "Couldn't load this page. If you opened the file directly, run a local server (see README).";
    $("empty").hidden = false;
  }
}

init();
