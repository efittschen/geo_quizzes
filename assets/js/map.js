// Home page: interactive world map. Clicking a country opens its country page,
// which lists that country's quizzes.

const WIDTH = 960;
const HEIGHT = 500;

// "All quizzes": continents, then countries (or an area like South Asia), then quizzes, each level folding open
// like a folder. Which folders are open is remembered in this browser (the settings' `open`, see store.js).
function loadOpen() {
  const open = STORE.settings().open;
  return new Set(Array.isArray(open) ? open : []);
}
function saveOpen(open) {
  STORE.setSettings((s) => { s.open = [...open]; });
}
const quizCount = (n) => `${n} ${n === 1 ? "quiz" : "quizzes"}`;
const CHEVRON = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

// Stars earned over stars possible for a folder, e.g. "★ 4/18". Levels still in progress don't count.
function starTotal(quizzes) {
  const earned = quizzes.reduce((sum, q) => sum + earnedStars(quizLevels(q)), 0);
  const possible = quizzes.reduce((sum, q) => sum + quizLevels(q).length, 0);
  const span = document.createElement("span");
  span.className = earned ? "total earned" : "total";
  span.title = `${earned} of ${possible} stars`;
  span.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;
  span.append(`${earned}/${possible}`);
  return span;
}

function renderQuizList(index, nameByCode, suites) {
  const tree = document.getElementById("quiz-tree");
  document.getElementById("quiz-links-empty").hidden = index.quizzes.length > 0;
  const legend = document.getElementById("rating-help");
  legend.replaceChildren(starEl(1), " level completed · ", starEl(0.5), " in progress");
  legend.title = RATING_HELP;

  // Quizzes about the whole world get a folder of their own, on top; a continent's own quizzes come first in its
  // folder, before its countries.
  const continents = new Map(); // continent -> place -> quizzes
  const whole = new Map(); // continent or "World" -> its own quizzes
  const languages = index.quizzes.filter((q) => q.scope === LANGUAGE_SCOPE); // listed apart, below
  for (const quiz of index.quizzes) {
    if (quiz.scope === LANGUAGE_SCOPE) continue;
    const code = quizCountries(quiz)[0];
    const continent = quiz.scope ?? index.continents?.[code] ?? "Other";
    if (quiz.scope) whole.set(continent, [...(whole.get(continent) ?? []), quiz]);
    if (quiz.scope === WORLD_SCOPE) continue;
    if (!continents.has(continent)) continents.set(continent, new Map());
    if (quiz.scope) continue;
    const place = quiz.area ?? nameByCode.get(code) ?? quiz.title;
    const places = continents.get(continent);
    places.set(place, [...(places.get(place) ?? []), quiz]);
  }

  const open = loadOpen();
  function folder(key, level, title, quizzes, children) {
    const details = document.createElement("details");
    details.className = `folder ${level}`;
    details.open = open.has(key);
    const summary = document.createElement("summary");
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = title;
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = quizCount(quizzes.length);
    summary.innerHTML = CHEVRON;
    summary.append(name, count, starTotal(quizzes));
    details.append(summary, ...children);
    details.addEventListener("toggle", () => {
      if (details.open) open.add(key);
      else open.delete(key);
      saveOpen(open);
    });
    return details;
  }
  function file(quiz) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = quizUrl(quiz);
    const name = document.createElement("span");
    name.className = "name";
    name.textContent = quiz.title;
    const stars = starsEl(quizLevels(quiz));
    if (!loadRating(quiz.id)?.played) stars.classList.add("unplayed");
    a.append(name, stars);
    li.append(a);
    return li;
  }

  const files = (quizzes, className) => {
    const ul = document.createElement("ul");
    ul.className = className;
    ul.append(...quizzes.map(file));
    return ul;
  };
  const own = (area) => (whole.has(area) ? [files(whole.get(area), "files own")] : []);
  if (whole.has(WORLD_SCOPE)) tree.append(folder(WORLD_SCOPE, "continent", WORLD_SCOPE, whole.get(WORLD_SCOPE), own(WORLD_SCOPE)));
  const byName = ([a], [b]) => a.localeCompare(b);
  for (const [continent, places] of [...continents].sort(byName)) {
    const all = [...(whole.get(continent) ?? []), ...[...places.values()].flat()];
    const placeFolders = [...places].sort(byName).map(([place, quizzes]) => {
      return folder(`${continent}/${place}`, "place", place, quizzes, [files(inOrder(quizzes), "files")]);
    });
    tree.append(folder(continent, "continent", continent, all, [...own(continent), ...placeFolders]));
  }

  // The language quizzes, in their section: a plain list, as there are no places to fold them under.
  document.getElementById("language-list").hidden = !languages.length;
  document.getElementById("language-tree").replaceChildren(files(languages, "files flat"));
  document.getElementById("language-link").hidden = !languages.length;

  // The world and the continents with quizzes of their own, and the suites, as links above the map: only on a page
  // that has a place for them (<nav id="areas">, <nav id="suites">); the home page has none at present.
  const areas = [...whole.keys(), ...(languages.length ? [LANGUAGE_SCOPE] : [])].sort((a, b) => (b === WORLD_SCOPE) - (a === WORLD_SCOPE) || a.localeCompare(b));
  document.getElementById("areas")?.replaceChildren(...areas.map((area) => {
    const a = document.createElement("a");
    a.className = "ghost small";
    a.href = areaUrl(area);
    a.textContent = area;
    return a;
  }));
  // The suites, as links above them: name, what they teach, and their stars.
  document.getElementById("suites")?.replaceChildren(...suites.map((suite) => {
    const a = document.createElement("a");
    a.className = "suite";
    a.href = suiteUrl(suite.name);
    const name = document.createElement("b");
    name.textContent = suite.name;
    const title = document.createElement("small");
    title.textContent = suite.title;
    a.append(name, title, starTotal(suiteQuizzes(index, suite)));
    return a;
  }));
  const setAll = (value) => tree.querySelectorAll("details").forEach((d) => (d.open = value));
  document.getElementById("open-all").addEventListener("click", () => setAll(true));
  document.getElementById("close-all").addEventListener("click", () => setAll(false));
}

function renderMap(world, quizzesByCode, roads) {
  const countries = topojson
    .feature(world, world.objects.countries)
    .features.filter((f) => f.properties.name !== "Antarctica");

  const svg = d3.select("#map").attr("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);
  const projection = d3
    .geoNaturalEarth1()
    .fitSize([WIDTH, HEIGHT], { type: "FeatureCollection", features: countries });
  const path = d3.geoPath(projection);
  const g = svg.append("g");

  const wrap = document.getElementById("map-wrap");
  const tooltip = document.getElementById("tooltip");
  const quizzesFor = (d) => quizzesByCode.get(d.id) ?? [];

  function showTooltip(event, d) {
    const count = quizzesFor(d).length;
    tooltip.replaceChildren();
    const name = document.createElement("strong");
    name.textContent = d.properties.name;
    const info = document.createElement("span");
    info.className = "soon";
    info.textContent = count ? ` · ${count} quiz${count === 1 ? "" : "zes"}` : " · no quizzes yet";
    tooltip.append(name, info);
    const rect = wrap.getBoundingClientRect();
    tooltip.style.left = `${event.clientX - rect.left + 12}px`;
    tooltip.style.top = `${event.clientY - rect.top + 12}px`;
    tooltip.hidden = false;
  }

  function open(d) {
    // A few disputed areas (e.g. Kosovo) have no ISO code in the map data.
    if (d.id) window.location.href = countryUrl(d.id);
  }

  g.selectAll("path")
    .data(countries)
    .join("path")
    .attr("class", (d) => (quizzesFor(d).length ? "country has-quiz" : "country"))
    .attr("d", path)
    .each(function (d) {
      if (!quizzesFor(d).length) return;
      // Make countries with quizzes reachable by keyboard.
      this.setAttribute("tabindex", "0");
      this.setAttribute("role", "link");
      this.setAttribute("aria-label", `${d.properties.name} quizzes`);
    })
    .on("mousemove", showTooltip)
    .on("mouseenter focus", (event, d) => showRoads(d))
    .on("mouseleave blur", () => {
      tooltip.hidden = true;
      showRoads(null);
    })
    .on("click", (event, d) => {
      if (event.defaultPrevented) return; // ignore clicks that ended a drag
      open(d);
    })
    .on("keydown", (event, d) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open(d);
      }
    });

  // While the pointer is on a country, the roads there with Google Street View coverage are drawn on it: a picture
  // in the map's own projection (data/coverage/home/, made by tools/coverage.mjs countries), which comes in several
  // scales (pixels per map unit); the one that fits the zoom and the screen is shown. Each country has a picture element
  // of its own, made when it is first pointed at: a browser may go on showing an element's last picture until the next
  // one is ready (Firefox does), and in one shared element that was another country's roads, stretched to this
  // country's box for a moment.
  const roadImages = new Map();
  const roadImage = (r) => {
    if (!roadImages.has(r[0])) roadImages.set(r[0], g.append("image").attr("class", "roads").attr("preserveAspectRatio", "none").attr("x", r[1]).attr("y", r[2]).attr("width", r[3]).attr("height", r[4]).attr("display", "none"));
    return roadImages.get(r[0]);
  };
  const roadsOf = (d) => roads && (roads.ids[d.id] ?? roads.names[d.properties.name]);
  const roadUrl = (r, k) => {
    const need = (k * svg.node().clientWidth / WIDTH) * devicePixelRatio;
    return `data/coverage/home/${r[0]}_${roads.scales.find((s) => s >= need) ?? roads.scales.at(-1)}.png`;
  };
  let pointed = null;
  let shown = null;
  let zoomed = 1;
  function showRoads(d) {
    pointed = d;
    const r = d && roadsOf(d);
    const image = r ? roadImage(r) : null;
    if (shown && shown !== image) shown.attr("display", "none");
    shown = image;
    if (image) image.attr("href", roadUrl(r, zoomed)).attr("display", null);
  }
  // The pictures for the starting zoom are fetched ahead, so the roads are there the moment a country is pointed at.
  if (roads) setTimeout(() => [...Object.values(roads.ids), ...Object.values(roads.names)].forEach((r) => (new Image().src = roadUrl(r, 1))), 300);

  const zoom = d3
    .zoom()
    .scaleExtent([1, 12])
    .translateExtent([[0, 0], [WIDTH, HEIGHT]])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
      tooltip.hidden = true;
      zoomed = event.transform.k;
      if (pointed) showRoads(pointed);
    });
  svg.call(zoom);

  return new Map(countries.map((f) => [f.id, f.properties.name]));
}

async function init() {
  const status = document.getElementById("map-status");
  try {
    const [world, index, suites, roads] = await Promise.all([
      d3.json(WORLD_URL),
      loadIndex(),
      loadSuites(),
      // the countries' roads with coverage; the map works without them
      fetch("data/coverage/home.json").then((r) => (r.ok ? r.json() : null), () => null),
    ]);
    // Quizzes are keyed by ISO 3166-1 numeric code, which world-atlas uses as feature ids.
    const quizzesByCode = new Map();
    for (const q of index.quizzes) for (const code of quizCountries(q)) quizzesByCode.set(code, [...(quizzesByCode.get(code) || []), q]);
    const nameByCode = renderMap(world, quizzesByCode, roads);
    renderQuizList(index, nameByCode, suites);
    showReviewDue(index);
    status.textContent = "";
  } catch (err) {
    console.error(err);
    status.textContent = "Couldn't load the map. If you opened this file directly, run a local server (see README).";
  }
}

init();
