// Screens: the panel's parts, each owning its part of the page (the App shows them: app.js). Setup also holds the
// player's choices until Start.
//   screens.setup      the rounds, the ways and maps, the options, a custom quiz (setup.js)
//   screens.question   the play panel around the question: counts, ticks, the hint, the feedback (question.js)
//   screens.results    a round's results (results.js)
//   screens.explore    an area and everything asked about it (explore.js)
//   screens.learn      everything to learn on one sheet (learn.js)
//   screens.stats      My stats: the player's answers on the map (stats.js)
// screens.ui: what they share: $(id), feedback(el, cls, title, lines), plural(n, [one, many]), fmt(ms), toast(text).

import { makeSetup } from './setup.js';
import { makeQuestion } from './question.js';
import { makeResults } from './results.js';
import { makeExplore } from './explore.js';
import { makeLearn } from './learn.js';
import { makeStats } from './stats.js';

export function createScreens(deps) {
  const $ = id => document.getElementById(id);
  let toastTimer = 0;
  const ui = {
    $,
    feedback(el, cls, title, lines) {
      el.className = 'feedback' + (cls ? ' ' + cls : '');
      el.replaceChildren();
      if (title) { const p = document.createElement('p'); p.className = 't'; p.textContent = title; el.appendChild(p); }
      for (const line of [].concat(lines || [])) { const p = document.createElement('p'); p.className = 'c'; p.textContent = line; el.appendChild(p); }
    },
    plural: (n, [one, many]) => `${n} ${n === 1 ? one : many}`,
    fmt: ms => { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); },
    toast(text) { $('toast').textContent = text; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').textContent = ''; }, 4000); },
  };
  const setup = makeSetup({ ...deps, ui });
  return {
    ui, setup,
    question: makeQuestion({ ...deps, setup, ui }),
    results: makeResults({ ...deps, ui }),
    explore: makeExplore({ ...deps, ui }),
    learn: makeLearn({ ...deps, ui }),
    stats: makeStats({ ...deps, ui }),
  };
}
