// Answer modes: how a question is answered. A play has one mode (play.mode, the Model's rule); each makes its controls
// once and gives every play the same interface, so the Game has no special cases:
//   const m = modes.make(play)
//   m.ask(id, question)        the controls for the question (the map is its own: its taps come to tap)
//   m.board(board)             Pairs: a board of questions and names
//   m.tap(area, point, ok)     a tap on the map, while Play is the view (ok: a plain tap that began on the map)
//   m.key(e)                   a key the page didn't take (the number keys pick)
//   m.close()                  its controls put away
// A mode tells the Game its answers (game.answer, game.match, game.giveUp).
//
//   map     a tap on the item's area, three tries
//   free    map play: a tap anywhere, points by distance
//   all     every area of the item: tapped one by one (clickAll), or picked and checked (pickAll)
//   list    the name picked from a list, narrowed by typing
//   type    the name typed (or a code's digits)
//   picks   one of four
//   pairs   questions matched with names on a board
//   draw    the place drawn on the map

import { makeMapTap } from './map-tap.js';
import { makeMapPlay } from './map-play.js';
import { makeAllAreas } from './all-areas.js';
import { makeTyped } from './typed.js';
import { makePicks } from './picks.js';
import { makePairs } from './pairs.js';
import { makeDraw } from './draw.js';

export function createModes(deps) {
  const $ = id => document.getElementById(id), { map, game } = deps;
  // A wrong place flashes, named on the map for a moment (its label stays once it is answered in the round).
  const answeredYet = id => { const r = game.round; return !!r && r.queue.some((x, i) => x === id && r.state.res[i] !== undefined); };
  const flash = (K, id) => {
    map.label(K, id, true);
    map.blink(K.key + ':' + id, K.areas[id], 'flash', 800, () => { if (!answeredYet(id)) map.label(K, id, false); });
  };
  const flashArea = (K, area) => {
    const key = 'area:' + area;
    map.tag(K, area, key, true);
    map.blink(key, [area], 'flash', 800, () => map.tag(K, area, key, false));
  };
  const shared = { ...deps, $, flash, flashArea };
  const makers = { map: makeMapTap, free: makeMapPlay, all: makeAllAreas, list: makeTyped, type: makeTyped, picks: makePicks, pairs: makePairs, draw: makeDraw };
  const made = {};
  return {
    make(P, look) {
      const name = look === 'free' && P.way === 'map' ? 'free' : P.mode, key = name === 'type' ? 'list' : name;
      return (made[key] ||= makers[name](shared))(P);
    },
  };
}
