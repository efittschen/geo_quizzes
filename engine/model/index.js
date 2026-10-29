// The Model: every rule of the quiz, and nothing on screen. No page: its clock, its randomness, what a player keeps
// and the map's facts are handed in, so it runs in Node as in the browser.
//
//   const model = createModel(quiz, { now, random, storage, geo })
//     geo: { area(id) -> { lx, ly, a, s }: an area's label point, size on the map and on the ground }
//   model.kinds        the kinds and the plays: a kind asked one way (model/kinds.js)
//   model.rounds       the rounds offered and their items, by level (model/rounds.js); model.level(n), LEVELS
//   model.round(def)   a round to play (model/round.js)
//   model.check        answer checks: names, picks, pairs, map play's points, a drawing (model/checks.js)
//   model.results      best results and stars (model/results.js)
//   model.review       the review's keys, clock, stack and rounds (model/review.js)
//   model.custom       a custom quiz as a link and back, practice (model/custom.js)

import { makeKinds } from './kinds.js';
import { makeRounds, levelOf, LEVELS } from './rounds.js';
import { makeRound } from './round.js';
import * as check from './checks.js';
import { makeResults } from './results.js';
import { makeReview } from './review.js';
import { makeCustom } from './custom.js';

export function createModel(quiz, { now, random, storage, geo }) {
  const kinds = makeKinds(quiz, geo);
  const rounds = makeRounds(quiz, kinds, geo);
  const results = makeResults(quiz, kinds, rounds, storage);
  return {
    kinds, rounds, check, results,
    review: makeReview(quiz, kinds, rounds, results),
    custom: makeCustom(quiz, kinds),
    level: levelOf, LEVELS,
    round: def => makeRound(def, { quiz, random, now }),
  };
}
