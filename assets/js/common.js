// Shared by the home and country pages.

const WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// world-atlas feature ids are ISO 3166-1 numeric codes ("076" = Brazil); quizzes use the same codes.
function countryUrl(code) {
  return `country.html?code=${encodeURIComponent(code)}`;
}

// A quiz's `country` is one ISO code or a list of them (a quiz covering several countries).
function quizCountries(quiz) {
  return [].concat(quiz.country ?? []);
}

// A quiz about the whole world or a whole continent has a `scope` instead ("World", or the continent's name as in
// the index's `continents`). Its page lists the quizzes of that scope (country.html?area=<scope>).
const WORLD_SCOPE = "World";
// The quizzes about reading a language (scope "Languages") are no geography: the home page lists them in a section
// of their own, below the others.
const LANGUAGE_SCOPE = "Languages";
function areaUrl(area) {
  return `country.html?area=${encodeURIComponent(area)}`;
}

// A suite is a short list of quizzes to play in order ({ name, title, quizzes: [ids] }), from which country to which
// region to which area code. Its page lists them (country.html?suite=<name>). The suites have a file of their own,
// so nothing that rewrites the list of quizzes can lose them; a missing file means no suites.
const SUITES_URL = "data/suites.json";
async function loadSuites() {
  try { return (await d3.json(SUITES_URL)).suites ?? []; } catch (e) { return []; }
}
function suiteUrl(name) {
  return `country.html?suite=${encodeURIComponent(name)}`;
}
function suiteQuizzes(index, suite) {
  return suite.quizzes.map((id) => index.quizzes.find((q) => q.id === id)).filter(Boolean);
}

// The list of quizzes (data/quizzes.json). A quiz marked `hidden` keeps its page, but no list, suite or review shows
// it: it is set aside until it is looked at again.
async function loadIndex() {
  const index = await (await fetch("data/quizzes.json")).json();
  return { ...index, quizzes: index.quizzes.filter((q) => !q.hidden) };
}

// A country's quizzes come in one order everywhere (their `role` in data/quizzes.json): its regions, its cities with
// the cities picked by Street View coverage and the town names (which belong to the city quiz: on the country page
// they sit inside its entry), its codes (area codes, postcodes), then what is special to the country.
const ROLES = ["regions", "cities", "cities-coverage", "names", "area-codes", "postcodes"];
function inOrder(quizzes) {
  const rank = (q) => (ROLES.includes(q.role) ? ROLES.indexOf(q.role) : ROLES.length);
  return quizzes.slice().sort((a, b) => rank(a) - rank(b));
}
// … and on the country's page in three groups: the basics (regions, cities, town names), the codes, the extras.
const quizGroup = (q) => (["regions", "cities", "cities-coverage", "names"].includes(q.role) ? "Basics" : ROLES.includes(q.role) ? "Codes" : "Extra");

// Quizzes with their own page set `url`; the rest use the generic multiple-choice page.
function quizUrl(quiz) {
  return quiz.url ?? `quiz.html?id=${encodeURIComponent(quiz.id)}`;
}

// Ratings: each map quiz keeps its progress per level in its record in this browser (`stars`, see store.js; worked
// out in quizzes/shared/area-quiz.js): { levels: [0–1 per level, Beginner first], played }. A level's star is earned
// at 1: every round perfect.
const RATING_HELP = "One star per level · earned when every round of the level is perfect";
function loadRating(id) {
  const levels = STORE.quiz(id).stars;
  return Array.isArray(levels) ? { levels, played: levels.some((p) => p > 0) } : null;
}
// Progress per level for a quiz: saved progress, or empty stars for each of its levels (quizzes.json "levels").
function quizLevels(quiz) {
  const saved = loadRating(quiz.id)?.levels;
  return Array.isArray(saved) ? saved : Array(quiz.levels ?? 1).fill(0);
}
const earnedStars = (levels) => levels.filter((p) => p >= 1).length;
const STAR_PATH = "M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z";
// One star per level: solid when earned, filled part-way with a lighter shade while in progress.
function starEl(p) {
  const star = document.createElement("span");
  star.className = p >= 1 ? "star done" : p > 0 ? "star part" : "star";
  const svg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;
  star.innerHTML = `${svg}<span class="fill" style="width:${Math.round(Math.min(p, 1) * 100)}%">${svg}</span>`;
  return star;
}
function starsEl(levels) {
  const span = document.createElement("span");
  span.className = "stars";
  span.setAttribute("role", "img");
  const label = `${earnedStars(levels)} of ${levels.length} stars`;
  span.setAttribute("aria-label", label);
  span.title = label;
  span.append(...levels.map(starEl));
  return span;
}

// Review (see srs.js): learned questions come back on a schedule. The pages that start a review share its buttons,
// its result and the header's link.

// Two buttons that review some of the quizzes: "Due 12" asks their cards that are due, "All 80" everything learned
// in them (one review asks 50 cards at most, and the due ones only until 200 are reviewed in a day: see srs.js).
// index: data/quizzes.json; back: the page the review ends on. Null if nothing is learned in these quizzes.
function reviewButtons(index, quizzes, back, small = false) {
  if (typeof SRS === "undefined") return null;
  const decks = SRS.overview(quizzes, Date.now());
  if (!decks.length) return null;
  const ids = quizzes === index.quizzes ? null : quizzes.map((q) => q.id); // null: every quiz
  const limit = !SRS.dayLeft(Date.now()); // enough cards reviewed for today: the due ones wait
  const button = (label, key, all, className) => {
    const n = decks.reduce((sum, d) => sum + d[key], 0);
    const b = document.createElement("button");
    b.type = "button";
    b.className = className;
    b.textContent = `${label} ${n}`;
    b.disabled = !n || (limit && !all);
    b.addEventListener("click", () => {
      window.location.href = SRS.startRun(window.location.href, index.quizzes, { ids, all, back });
    });
    return b;
  };
  const buttons = [
    button("Due", "due", false, small ? "ghost small" : "primary"),
    button("All", "total", true, small ? "ghost small" : "ghost"),
  ];
  if (limit && !small && decks.some((d) => d.due)) {
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = "Daily limit";
    buttons.push(label);
  }
  return buttons;
}
// The result of the review that just ended on this page (…?done): known, unsure and not known answers.
function reviewResult() {
  if (typeof SRS === "undefined" || !new URLSearchParams(window.location.search).has("done")) return null;
  const [missed, unsure, known] = SRS.tally(SRS.run().res);
  if (!(missed + unsure + known)) return null;
  const ul = document.createElement("ul");
  ul.className = "run";
  ul.setAttribute("aria-label", "Last review");
  for (const [className, n, label] of [["got", known, "Known"], ["t2", unsure, "Unsure"], ["miss", missed, "Not known"]]) {
    const li = document.createElement("li");
    const swatch = document.createElement("i");
    swatch.className = className;
    const count = document.createElement("b");
    count.textContent = n;
    li.append(swatch, count, label);
    ul.append(li);
  }
  return ul;
}
// The header's Review link shows how many cards are due.
function showReviewDue(index) {
  const link = document.getElementById("review-link");
  if (!link || typeof SRS === "undefined") return;
  const due = SRS.overview(index.quizzes, Date.now()).reduce((sum, d) => sum + d.due, 0);
  link.textContent = due ? `Review ${due}` : "Review";
}
