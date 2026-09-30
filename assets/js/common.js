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

// Ratings: each map quiz saves its stars in this browser (see quizzes/shared/area-quiz.js), keyed by the quiz's id.
const RATING_LEGEND = "★ 50% · ★★ 80% · ★★★ 100%";
// The rule in a few words, for hover labels: first-try score at the quiz's hardest level; easier rounds give ★ at 80%.
const RATING_HELP = "Best first-try score at the hardest level · easier rounds: ★ at 80%";
function loadRating(id) {
  try { return JSON.parse(localStorage.getItem(`geoquizzes.rating.${id}`)); } catch (e) { return null; }
}
const STAR_PATH = "M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z";
// Three stars, the first n filled.
function starsEl(n, label) {
  const span = document.createElement("span");
  span.className = "stars";
  span.setAttribute("role", "img");
  span.setAttribute("aria-label", label ?? `${n} of 3 stars`);
  span.title = label ?? `${n} of 3 stars`;
  span.innerHTML = [0, 1, 2].map((i) => `<svg viewBox="0 0 24 24" aria-hidden="true"${i < n ? ' class="on"' : ""}><path d="${STAR_PATH}"/></svg>`).join("");
  return span;
}
