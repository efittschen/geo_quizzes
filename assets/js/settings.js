// Settings page: the review settings: the clock's times, the limits per review and per day, "Cards per map" and the
// schedule; "Your data": what this browser keeps, as a file to download or put back; "Google street map": the
// player's own key; and "Online copy": a place of the player's own where their browsers meet (see sync.js).

const $ = (id) => document.getElementById(id);

// The settings (see srs.js): the three times of the clock, the two limits, "Cards per map", and the schedule: which
// scheduler (FSRS or SM-2), and its options, with the names they have in Anki; only those of the chosen scheduler show.
// onChange: the limits change the buttons; onCards: "Cards per map" turned off has made a question's cards one.
function initSettings(onChange, onCards) {
  const NUMBERS = ["easy", "fast", "limit", "round", "day", "retain", "restep", "keep", "first", "ease", "hard", "max"];
  const SCHEDULE = ["algo", "steps", ...NUMBERS.slice(5)];
  const show = () => {
    const o = SRS.opts();
    for (const key of NUMBERS) $(key).value = o[key];
    $("perMap").checked = o.perMap;
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
  // (turned off: a question's cards on several maps become one at once; turned on: they stay one)
  $("perMap").addEventListener("change", (event) => {
    SRS.setOpts({ perMap: event.target.checked });
    if (!event.target.checked) { SRS.single(); onCards(); }
  });
  $("defaults").addEventListener("click", () => { SRS.resetOpts(SCHEDULE); show(); });
  show();
  return show;
}

// "Your data": everything the site keeps in this browser as one file to download, and the way back: a file put in
// place of what is kept here (see store.js for both, and for what the file holds), its answers joining the log's.
function initData() {
  $("download").addEventListener("click", async () => {
    const file = STORE.file();
    if (typeof ANSWERS === "object") file.answers = await ANSWERS.file();
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
    if (typeof ANSWERS === "object" && file.answers) await ANSWERS.load(file.answers);
    location.reload();
  });
}

// "Google street map" (see gmaps.js): the player's own Google Maps key, kept in this browser, and whether it answers;
// and, for a player without one, the box "Google Maps (unofficial)" (Google's public tile address), kept there too.
function initMaps() {
  $("maps-unofficial").checked = GMAPS.wanted();
  $("maps-unofficial").addEventListener("change", (event) => GMAPS.setUnofficial(event.target.checked));
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

// Cards reviewed today, beside the day's limit.
const showToday = () => { $("today").textContent = `Today ${SRS.today(Date.now())}`; };

function init() {
  const showSettings = initSettings(showToday, () => {});
  initData();
  initOnline(() => { showSettings(); showToday(); });
  initMaps();
  showToday();
  document.addEventListener("visibilitychange", () => { if (!document.hidden) showToday(); });
}

init();
