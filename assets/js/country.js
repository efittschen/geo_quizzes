// Country page: shows the country's outline and lists its quizzes (country.html?code=<ISO numeric>). The same page
// lists the quizzes about the whole world or a whole continent (country.html?area=World, …?area=Europe) and the
// quizzes of a suite, in order (country.html?suite=Beginner).

const $ = (id) => document.getElementById(id);

function showEmpty(message) {
  $("empty").textContent = message;
  $("empty").hidden = false;
}

// The country's outline. With the pointer on it, the roads there with Google Street View coverage are drawn on it:
// a picture made for exactly this outline (data/coverage/shape/, by tools/coverage.mjs countries; `roads` is the
// country's entry in data/coverage/home.json). A click opens the coverage map on the country, in a box over the page.
function drawShape(feature, roads) {
  const size = 120;
  const svg = d3.select("#country-shape").attr("viewBox", `0 0 ${size} ${size}`);
  // centred on the country, so one that lies across the 180th meridian (Russia, Fiji) is drawn in one piece
  const projection = d3.geoMercator().rotate([-d3.geoCentroid(feature)[0], 0]).fitSize([size, size], feature);
  svg.append("path").attr("d", d3.geoPath(projection)(feature));
  if (roads) svg.append("image").attr("class", "roads").attr("href", `data/coverage/shape/${roads[0]}.png`).attr("width", size).attr("height", size);

  // The map opens on the country's coverage, or on the country itself if it has none (on its largest piece of land
  // where it lies across the 180th meridian and its box would span the globe).
  let box = roads?.[5];
  if (!box) {
    let [[w, s], [e, n]] = d3.geoBounds(feature);
    if (w > e && feature.geometry.type === "MultiPolygon") {
      const land = feature.geometry.coordinates.map((p) => ({ type: "Polygon", coordinates: p })).sort((a, b) => d3.geoArea(b) - d3.geoArea(a))[0];
      [[w, s], [e, n]] = d3.geoBounds(land);
    }
    box = [w, s, w > e ? 180 : e, n]; // still across it: up to the meridian
  }
  // the country's border for that map: by its ISO numeric code, or its name where it has none (see tools/coverage.mjs)
  const key = feature.id || feature.properties.name.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
  const open = () => openCoverage(feature.properties.name, box, key);
  svg.attr("role", "button").attr("tabindex", "0").attr("aria-label", "Coverage map").attr("aria-hidden", null)
    .on("click", open)
    .on("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      open();
    });
}

// The coverage map (coverage.html, without its page header) in a box over the page, opened on [west, south, east, north],
// with everything but the country (`key`: its border file) shaded.
function openCoverage(name, box, key) {
  let dialog = $("coverage-box");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "coverage-box";
    dialog.className = "coverage-box";
    dialog.innerHTML = '<header><b></b><button type="button" class="ghost small" aria-label="Close">✕</button></header><iframe title="Street View coverage"></iframe>';
    document.body.append(dialog);
    dialog.querySelector("button").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); }); // a click beside the box
  }
  dialog.querySelector("b").textContent = name;
  dialog.querySelector("iframe").src = `coverage.html?embed&fit=${box.join(",")}&outline=${key}`;
  dialog.showModal();
}

// placeOf(quiz): on a suite's page, the country of each quiz. It leads there, with the quiz's title under it
// ("Brazil", "States"); a quiz about the world or a continent keeps its title on top ("Flags", "World").
// inside(quiz): a quiz shown within this one's entry (the town names within the cities), as a smaller entry under it.
// group(quiz): the heading a quiz stands under ("Basics"); a heading is put before the first quiz of each group.
function renderQuizzes(quizzes, placeOf, inside = () => null, group = null) {
  const list = $("quiz-cards");
  const within = new Set(quizzes.map(inside).filter(Boolean));
  let heading = null;
  for (const quiz of quizzes) {
    if (within.has(quiz)) continue;
    if (group && group(quiz) !== heading) {
      heading = group(quiz);
      const h = document.createElement("li");
      h.className = "group-t";
      h.textContent = heading;
      list.appendChild(h);
    }
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "quiz-card";
    a.href = quizUrl(quiz);
    const title = document.createElement("strong");
    const place = placeOf && !quiz.scope ? placeOf(quiz) : "";
    title.textContent = place || quiz.title;
    a.appendChild(title);
    if (placeOf) {
      const sub = document.createElement("span");
      sub.className = "desc";
      sub.textContent = place ? quiz.title : quiz.scope;
      a.appendChild(sub);
    }
    const row = document.createElement("span");
    row.className = "card-rating";
    const stars = starsEl(quizLevels(quiz));
    if (!loadRating(quiz.id)?.played) stars.classList.add("unplayed");
    row.append(stars);
    row.title = RATING_HELP;
    a.appendChild(row);
    li.appendChild(a);
    const more = inside(quiz);
    if (more) {
      a.classList.add("has-inside");
      const b = document.createElement("a");
      b.className = "quiz-card inside";
      b.href = quizUrl(more);
      const name = document.createElement("strong");
      name.textContent = more.title;
      const stars = starsEl(quizLevels(more));
      if (!loadRating(more.id)?.played) stars.classList.add("unplayed");
      b.append(name, stars);
      li.appendChild(b);
    }
    list.appendChild(li);
  }
}

// Review buttons for this page's quizzes, and the result of a review that ended here (back: this page's address).
function renderReview(index, quizzes, back) {
  const buttons = reviewButtons(index, quizzes, back);
  if (!buttons) return;
  $("review-go").append(...buttons);
  $("review-go").hidden = false;
  const result = reviewResult();
  if (result) $("review-go").after(result);
}

// The world or a continent (country.html?area=Europe): the quizzes about it as a whole. No outline to draw.
function renderArea(index, area) {
  const quizzes = index.quizzes.filter((q) => q.scope === area);
  document.title = `${area} · Geo Quizzes`;
  $("country-name").textContent = area;
  $("country-count").textContent = quizzes.length ? `${quizzes.length} quiz${quizzes.length === 1 ? "" : "zes"}` : "";
  $("country-shape").remove();
  if (quizzes.length) renderQuizzes(quizzes);
  else showEmpty(`No quizzes for ${area} yet.`);
  renderReview(index, quizzes, areaUrl(area));
  showReviewDue(index);
}

// A suite (country.html?suite=Beginner): its quizzes in order, numbered, each with its place. No outline to draw.
function renderSuite(index, world, suites, name) {
  const suite = suites.find((s) => s.name === name);
  $("country-shape").remove();
  if (!suite) {
    $("country-name").textContent = "Suite not found";
    showEmpty("Pick a suite on the map page.");
    return;
  }
  const quizzes = suiteQuizzes(index, suite);
  const nameByCode = new Map(world.objects.countries.geometries.map((g) => [g.id, g.properties.name]));
  document.title = `${suite.name} · Geo Quizzes`;
  $("country-name").textContent = suite.name;
  $("country-count").textContent = `${suite.title} · ${quizzes.length} quiz${quizzes.length === 1 ? "" : "zes"}`;
  $("quiz-cards").classList.add("ordered");
  renderQuizzes(quizzes, (q) => q.area ?? nameByCode.get(quizCountries(q)[0]) ?? "");
  renderReview(index, quizzes, suiteUrl(suite.name));
  showReviewDue(index);
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") ?? "";
  try {
    if (params.get("area")) return renderArea(await loadIndex(), params.get("area"));
    if (params.get("suite")) {
      const [world, index, suites] = await Promise.all([d3.json(WORLD_URL), loadIndex(), loadSuites()]);
      return renderSuite(index, world, suites, params.get("suite"));
    }
    const [world, index, roads] = await Promise.all([
      d3.json(WORLD_URL),
      loadIndex(),
      // the countries' roads with coverage; the page works without them
      fetch("data/coverage/home.json").then((r) => (r.ok ? r.json() : null), () => null),
    ]);
    const feature = topojson
      .feature(world, world.objects.countries)
      .features.find((f) => f.id === code);
    if (!feature) {
      $("country-name").textContent = "Country not found";
      showEmpty("Pick a country on the map.");
      return;
    }

    const name = feature.properties.name;
    const quizzes = index.quizzes.filter((q) => quizCountries(q).includes(code));
    document.title = `${name} · Geo Quizzes`;
    $("country-name").textContent = name;
    $("country-count").textContent = quizzes.length
      ? `${quizzes.length} quiz${quizzes.length === 1 ? "" : "zes"}`
      : "";
    drawShape(feature, roads && (roads.ids[code] ?? roads.names[name]));
    const ordered = inOrder(quizzes);
    if (quizzes.length) renderQuizzes(ordered, null, (q) => (q.role === "cities" ? ordered.find((x) => x.role === "names") : null), quizGroup);
    else showEmpty(`No quizzes for ${name} yet.`);
    renderReview(index, quizzes, countryUrl(code));
    showReviewDue(index);
  } catch (err) {
    console.error(err);
    $("country-name").textContent = "Something went wrong";
    showEmpty("Couldn't load this page. If you opened the file directly, run a local server (see README).");
  }
}

init();
