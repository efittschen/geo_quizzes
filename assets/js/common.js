// Shared by the home and country pages.

const WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// world-atlas feature ids are ISO 3166-1 numeric codes ("076" = Brazil); quizzes use the same codes.
function countryUrl(code) {
  return `country.html?code=${encodeURIComponent(code)}`;
}

// A quiz's `country` is one ISO code or a list of them (a quiz covering several countries).
function quizCountries(quiz) {
  return [].concat(quiz.country);
}

// Quizzes with their own page set `url`; the rest use the generic multiple-choice page.
function quizUrl(quiz) {
  return quiz.url ?? `quiz.html?id=${encodeURIComponent(quiz.id)}`;
}

// Ratings: each map quiz saves its progress per level in this browser (see quizzes/shared/area-quiz.js), keyed by the
// quiz's id: { levels: [0–1 per level, Beginner first], played }. A level's star is earned at 1: every round perfect.
const RATING_HELP = "One star per level · earned when every round of the level is perfect";
function loadRating(id) {
  try { return JSON.parse(localStorage.getItem(`geoquizzes.rating.${id}`)); } catch (e) { return null; }
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
