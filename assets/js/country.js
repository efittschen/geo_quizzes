// Country page: shows the country's outline and lists its quizzes (country.html?code=<ISO numeric>).

const $ = (id) => document.getElementById(id);

function showEmpty(message) {
  $("empty").textContent = message;
  $("empty").hidden = false;
}

function drawShape(feature) {
  const size = 120;
  const svg = d3.select("#country-shape").attr("viewBox", `0 0 ${size} ${size}`);
  const projection = d3.geoMercator().fitSize([size, size], feature);
  svg.append("path").attr("d", d3.geoPath(projection)(feature));
}

function renderQuizzes(quizzes) {
  const list = $("quiz-cards");
  for (const quiz of quizzes) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.className = "quiz-card";
    a.href = quizUrl(quiz);
    const title = document.createElement("strong");
    title.textContent = quiz.title;
    a.appendChild(title);
    const row = document.createElement("span");
    row.className = "card-rating";
    const stars = starsEl(quizLevels(quiz));
    if (!loadRating(quiz.id)?.played) stars.classList.add("unplayed");
    row.append(stars);
    row.title = RATING_HELP;
    a.appendChild(row);
    li.appendChild(a);
    list.appendChild(li);
  }
}

async function init() {
  const code = new URLSearchParams(window.location.search).get("code") ?? "";
  try {
    const [world, index] = await Promise.all([d3.json(WORLD_URL), d3.json("data/quizzes.json")]);
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
    drawShape(feature);
    if (quizzes.length) renderQuizzes(quizzes);
    else showEmpty(`No quizzes for ${name} yet.`);
  } catch (err) {
    console.error(err);
    $("country-name").textContent = "Something went wrong";
    showEmpty("Couldn't load this page. If you opened the file directly, run a local server (see README).");
  }
}

init();
