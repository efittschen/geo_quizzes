// Review page: what is on the stack (see srs.js), by country and quiz, each with buttons to review it (the whole
// world at the top), the settings: the clock's times, the limits per review and per day and the schedule, and "Your data":
// what this browser keeps, as a file to download or put back. Only quizzes listed in data/quizzes.json are shown; the stack of a quiz
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
  const row = (cls, head, list, extra = []) => {
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
    acts.append(...reviewButtons(index, list.map((d) => d.quiz), BACK, true), ...extra);
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
      return row("", td, [d], [remove]);
    })];
  }));
  $("decks").hidden = !decks.length;
  $("empty").hidden = decks.length > 0;
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

async function init() {
  let refresh = () => {};
  initSettings(() => refresh());
  initData();
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
