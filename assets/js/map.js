// Home page: interactive world map. Clicking a country opens its country page,
// which lists that country's quizzes.

const WIDTH = 960;
const HEIGHT = 500;

// "All quizzes": continents, then countries (or an area like South Asia), then quizzes, each level folding open
// like a folder. Which folders are open is remembered in this browser.
const OPEN_KEY = "geoquizzes.open";
function loadOpen() {
  try { return new Set(JSON.parse(localStorage.getItem(OPEN_KEY)) ?? []); } catch (e) { return new Set(); }
}
function saveOpen(open) {
  try { localStorage.setItem(OPEN_KEY, JSON.stringify([...open])); } catch (e) {}
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

function renderQuizList(index, nameByCode) {
  const tree = document.getElementById("quiz-tree");
  document.getElementById("quiz-links-empty").hidden = index.quizzes.length > 0;
  const legend = document.getElementById("rating-help");
  legend.replaceChildren(starEl(1), " level completed · ", starEl(0.5), " in progress");
  legend.title = RATING_HELP;

  const continents = new Map(); // continent -> place -> quizzes
  for (const quiz of index.quizzes) {
    const code = quizCountries(quiz)[0];
    const continent = index.continents?.[code] ?? "Other";
    const place = quiz.area ?? nameByCode.get(code) ?? quiz.title;
    if (!continents.has(continent)) continents.set(continent, new Map());
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

  const byName = ([a], [b]) => a.localeCompare(b);
  for (const [continent, places] of [...continents].sort(byName)) {
    const all = [...places.values()].flat();
    const placeFolders = [...places].sort(byName).map(([place, quizzes]) => {
      const ul = document.createElement("ul");
      ul.className = "files";
      ul.append(...quizzes.map(file));
      return folder(`${continent}/${place}`, "place", place, quizzes, [ul]);
    });
    tree.append(folder(continent, "continent", continent, all, placeFolders));
  }
  const setAll = (value) => tree.querySelectorAll("details").forEach((d) => (d.open = value));
  document.getElementById("open-all").addEventListener("click", () => setAll(true));
  document.getElementById("close-all").addEventListener("click", () => setAll(false));
}

function renderMap(world, quizzesByCode) {
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
    .on("mouseleave", () => (tooltip.hidden = true))
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

  const zoom = d3
    .zoom()
    .scaleExtent([1, 12])
    .translateExtent([[0, 0], [WIDTH, HEIGHT]])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
      tooltip.hidden = true;
    });
  svg.call(zoom);

  document.getElementById("reset-zoom").addEventListener("click", () => {
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
  });

  return new Map(countries.map((f) => [f.id, f.properties.name]));
}

async function init() {
  const status = document.getElementById("map-status");
  try {
    const [world, index] = await Promise.all([
      d3.json(WORLD_URL),
      d3.json("data/quizzes.json"),
    ]);
    // Quizzes are keyed by ISO 3166-1 numeric code, which world-atlas uses as feature ids.
    const quizzesByCode = new Map();
    for (const q of index.quizzes) for (const code of quizCountries(q)) quizzesByCode.set(code, [...(quizzesByCode.get(code) || []), q]);
    const nameByCode = renderMap(world, quizzesByCode);
    renderQuizList(index, nameByCode);
    status.textContent = "";
  } catch (err) {
    console.error(err);
    status.textContent = "Couldn't load the map. If you opened this file directly, run a local server (see README).";
  }
}

init();
