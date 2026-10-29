// The map quiz engine (docs.local/SPEC.md, "The engine"). A quiz page loads its data and its type's config, which make
// QUIZ, then this module, which puts the blocks together and starts the quiz. Each block is a folder whose index.js
// makes it (create…): it is handed the blocks it may call and gives back its interface; its state stays inside it.
//
//   model     every rule, no page: the kinds and plays, the rounds, a round's run, answer checks, best results and
//             stars, the review's rules, custom quizzes (tested in Node, with its clock, randomness and storage handed in)
//   storage   what a player keeps (store.js, answers.js, srs.js underneath)
//   map       the quiz map and everything on it; the only block that touches a shape
//   formats   how a question is shown: name, code, text, picture, outline, shape
//   modes     how a question is answered: map, map play, all areas, list, type, picks, pairs, draw
//   screens   the panel's parts: setup, the play panel, results, explore, learn, my stats
//   app       the views and where the map's taps go (app.js); a round played (game.js); the review run (review.js)
// For the layer-shapes tool (window.SHAPES_DUMP): what shapes.js keeps, in window.SHAPES_OUT.

import { readQuiz } from './model/quiz.js';
import { createModel } from './model/index.js';
import { createStorage } from './storage/index.js';
import { createMap } from './map/index.js';
import { createFormats } from './formats/index.js';
import { createModes } from './modes/index.js';
import { createScreens } from './screens/index.js';
import { createGame } from './app/game.js';
import { createApp } from './app/app.js';

const root = new URL('../', import.meta.url).href; // (the site)
const page = document.body.dataset.quiz || location.pathname.replace(/\/(index\.html)?$/, '').split('/').pop();
const quiz = readQuiz(QUIZ, document.body.dataset);
const storage = createStorage(quiz, { page, root });
const map = createMap(quiz, { root });
const model = createModel(quiz, { now: () => performance.now(), random: Math.random, storage, geo: { area: map.area } });
if (window.SHAPES_DUMP) window.SHAPES_OUT = map.dump(model.kinds.list);
const formats = createFormats({ quiz, model, map, storage });
const game = createGame({ quiz, model, map, storage, formats });
const modes = createModes({ quiz, model, map, formats, game, storage });
const screens = createScreens({ quiz, model, map, formats, storage, game });
const app = createApp({ quiz, model, map, game, modes, formats, screens, storage, root });
app.start();
