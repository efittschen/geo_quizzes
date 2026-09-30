// Quiz page: loads data/quizzes/<id>.json based on ?id=<id> and runs
// a multiple-choice quiz, one question at a time.

const $ = (id) => document.getElementById(id);

const state = {
  quiz: null,
  questions: [],
  index: 0,
  score: 0,
};

function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showError(message) {
  $("quiz-title").textContent = "Quiz not found";
  $("error-message").textContent = message;
  $("error").hidden = false;
}

function start() {
  // Shuffle the answer options but remember which one is correct.
  state.questions = state.quiz.questions.map((q) => ({
    ...q,
    options: shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer }))),
  }));
  state.index = 0;
  state.score = 0;
  $("results").hidden = true;
  $("quiz").hidden = false;
  renderQuestion();
}

function renderQuestion() {
  const q = state.questions[state.index];
  $("progress").textContent = `Question ${state.index + 1} / ${state.questions.length}`;
  $("score").textContent = `Score: ${state.score}`;
  $("question").textContent = q.question;

  const img = $("question-image");
  if (q.image) {
    img.src = q.image;
    img.alt = q.imageAlt ?? "";
    img.hidden = false;
  } else {
    img.hidden = true;
    img.removeAttribute("src");
  }

  const options = $("options");
  options.replaceChildren();
  q.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.textContent = opt.text;
    btn.addEventListener("click", () => answer(btn, opt));
    options.appendChild(btn);
  });

  $("feedback").hidden = true;
  $("next").hidden = true;
}

function answer(clicked, opt) {
  const q = state.questions[state.index];
  const buttons = [...$("options").children];
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (q.options[i].correct) btn.classList.add("correct");
  });
  if (opt.correct) {
    state.score++;
  } else {
    clicked.classList.add("wrong");
  }
  $("score").textContent = `Score: ${state.score}`;

  const feedback = $("feedback");
  feedback.replaceChildren();
  const verdict = document.createElement("strong");
  verdict.className = opt.correct ? "correct" : "wrong";
  verdict.textContent = opt.correct ? "Correct! " : "Not quite. ";
  feedback.appendChild(verdict);
  if (q.explanation) feedback.appendChild(document.createTextNode(q.explanation));
  feedback.hidden = false;

  const next = $("next");
  next.textContent = state.index < state.questions.length - 1 ? "Next" : "See results";
  next.hidden = false;
  next.focus();
}

function nextQuestion() {
  state.index++;
  if (state.index < state.questions.length) {
    renderQuestion();
  } else {
    $("quiz").hidden = true;
    $("final-score").textContent = `${state.score} / ${state.questions.length}`;
    $("results").hidden = false;
  }
}

async function init() {
  const id = new URLSearchParams(window.location.search).get("id") ?? "";
  // Quiz ids are simple lowercase names; reject anything else before building a path.
  if (!/^[a-z0-9-]+$/.test(id)) {
    showError("No quiz selected. Pick a country on the map.");
    return;
  }

  try {
    const res = await fetch(`data/quizzes/${id}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.quiz = await res.json();
  } catch (err) {
    console.error(err);
    showError("This quiz doesn't exist.");
    return;
  }

  $("quiz-title").textContent = state.quiz.title;
  $("quiz-description").textContent = state.quiz.description ?? "";
  document.title = `${state.quiz.title} · Geo Quizzes`;

  $("next").addEventListener("click", nextQuestion);
  $("retry").addEventListener("click", start);
  start();
}

init();
