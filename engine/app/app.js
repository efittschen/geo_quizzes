// The App: the view on screen and who gets the map's taps in it, the page's buttons and keys, what the page's link asks
// for, the review (review.js, once srs.js is there).
//
//   view       shows                                   the map's taps go to
//   setup      the rounds and choices (Start)           Setup: a custom quiz made by tapping
//   play       the question, the answer mode            the answer mode in use
//   done       the results                              nobody
//   explore    an area and what is asked of it; My stats   Explore, or My stats (the area under the tap, exact)
// Learn is a sheet over all of them.
//
//   const app = createApp(deps)
//   app.start()          the page opened: Setup (a practice from the review page: played at once)
//   app.show(view)

import { makeReview } from './review.js';

export function createApp({ quiz, model, map, game, modes, formats, screens, storage, root }) {
  const { $ } = screens.ui, { setup, explore, stats, learn, results } = screens;
  let view = 'setup', review = null, hold = { def: null };

  // The kind on the map: the one played, picked on the setup screen, or explored (My stats: the one it shows).
  const activeKind = () => (view === 'explore' ? model.kinds.byKey[stats.kind() || quiz.exploreKind] : view === 'setup' ? model.kinds.byKey[setup.kind()] : game.def.play.kind);
  // the kind drawn as its layout, with the options' looks: its colours (not where they would give the answer away),
  // every label (lettersLabel, while playing)
  function layout() {
    const K = activeKind(), o = setup.options();
    map.draw(view === 'play' || view === 'done' ? game.def.play.drawn : K, { hints: o.hints, letters: o.letters && view === 'play', asking: view === 'play' });
  }
  setup.onMap = layout;
  // the item under the mouse outlined (a kind that picks areas: the area alone); in play not where the place asked is
  // outlined already, nor while drawing
  function hover(area) {
    const P = view === 'play' && game.def ? game.def.play : null;
    if (!area || (P && (P.format === 'outline' || P.mode === 'draw'))) return map.hover(area, null);
    const K = activeKind(), id = K.primary(area);
    map.hover(area, K.pickAll ? [area] : id ? K.areas[id] : null);
  }
  const RECEIVERS = {
    setup: { hover, tap: area => { if (area) setup.tap(area); } },
    play: { hover, tap: (area, point, ok) => { if (game.mode && !game.rating) game.mode.tap(area, point, ok); } },
    done: { hover, tap() {} },
    explore: { hover, exact: true, tap: area => { if (!area) return; if (stats.kind()) stats.tap(area); else explore.tap(area); } },
  };

  function show(id) {
    view = id;
    const P = game.def && game.def.play, playing = id === 'play' || id === 'done';
    // a way that answers without the map (a list, typing, four to pick from, a shape) has none while playing and on its
    // results: the panel takes the page (.nomap)
    $('app').classList.toggle('nomap', playing && !!P && ['list', 'type', 'pick', 'pickback', 'shape'].includes(P.way));
    $('app').classList.toggle('naming', id === 'play' && !!P && P.way === 'name'); // (Name it: on a phone the answer under the field)
    if (id !== 'play') formats.hide();
    for (const x of ['setup', 'play', 'done', 'explore']) $(x).hidden = x !== id;
    $('app').classList.toggle('playing', id !== 'setup');
    $('startbar').hidden = id !== 'setup';
    // the map picker: on the setup screen, and during a review (the map its cards are asked on)
    const picking = id === 'setup' || (id === 'play' && !!review && review.active());
    $('mapSeg').hidden = !picking || !!quiz.free || $('mapSeg').childElementCount < 2;
    setup.bar.hidden = !picking;
    map.look('picking', id === 'setup');
    map.look('fade', playing); // (hint colours fade while playing and on the results: the answers' colours stand out)
    map.look('freeplay', id === 'play' && map.shown === 'free'); // (map play hides the dots still to be asked)
    $('app').classList.toggle('reviewing', !!review && review.active() && playing);
    if (id !== 'setup') setup.close();
    map.receive(RECEIVERS[id]);
    layout();
  }

  function play(def) {
    hold.def = def;
    game.play(def, modes.make(def.play, def.look.map), setup.options());
  }
  game.on('start', () => show('play'));
  game.on('done', r => { results.show(r); show('done'); });
  function openSetup() {
    if (game.mode) game.mode.close();
    stats.close();
    show('setup');
    setup.open();
    layout();
  }
  // the view to go back to: the round's box (the street map alone stays where it is; all: the whole map)
  function frame(all) {
    const box = view === 'play' && game.def ? game.def.box : view === 'setup' ? setup.box() : null;
    if (map.plain()) { if (all) map.home(); return; }
    map.frame(box);
  }

  /* ---------- buttons and keys ---------- */
  $('startBtn').onclick = () => { const def = setup.choice(); if (def) play(def); };
  const again = retry => play({ ...hold.def, items: quiz.single ? quiz.single.draw() : hold.def.items, retry });
  $('restartBtn').onclick = () => again(hold.def.retry);
  $('againBtn').onclick = () => again(hold.def.retry);
  $('retryBtn').onclick = () => play({ ...hold.def, items: game.round.result().missed, retry: true });
  $('endBtn').onclick = () => { if (!game.round.state.res.some(r => r !== undefined)) openSetup(); else game.stop(); };
  $('menuBtn').onclick = openSetup;
  $('eBack').onclick = openSetup;
  $('exploreBtn').onclick = () => { enterExplore(); explore.open(); };
  function enterExplore() { if (game.mode) game.mode.close(); map.use(setup.look.map); map.clear(); show('explore'); }
  stats.button.onclick = () => { stats.close(); enterExplore(); explore.hidePick(true); stats.open(setup.kind()); };
  stats.pick.onchange = () => { enterExplore(); explore.hidePick(true); stats.open(stats.pick.value); };
  $('eBack').addEventListener('click', () => { if (stats.kind()) stats.close(); explore.hidePick(false); });
  if ($('learnBtn')) $('learnBtn').onclick = learn.open;
  $('zIn').onclick = () => map.zoom(1.6); $('zOut').onclick = () => map.zoom(1 / 1.6); $('zFit').onclick = () => frame(true);
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'Escape') { if (learn.shown()) learn.close(); return; }
    if (view === 'play' && game.mode && !(e.key === 'Enter' && e.target.tagName === 'BUTTON')) {
      if (e.key === ' ' && game.def.play.mode === 'draw') { e.preventDefault(); map.space(true); return; }
      game.mode.key(e);
      if (e.defaultPrevented) return;
    }
    if (e.key === '+' || e.key === '=') map.zoom(1.4); else if (e.key === '-') map.zoom(1 / 1.4); else if (e.key === '0') frame(true);
  });
  const spaceUp = () => map.space(false);
  document.addEventListener('keyup', e => { if (e.key === ' ' && map.spaceHeld()) { e.preventDefault(); spaceUp(); } });
  addEventListener('blur', spaceUp);

  /* ---------- the review ---------- */
  storage.schedule().then(SRS => {
    review = makeReview({ quiz, model, map, game, storage, screens, setup, play, root, srs: SRS });
    game.review = review.hooks;
    // a map picked during a review: for the rest of it, from the question on screen; the setup's choice stays
    setup.onPick = look => {
      if (!(view === 'play' && review.active())) return false;
      if (look.map) map.use(look.map, true);
      if (look.back) map.back(look.back);
      layout(); setup.pressLook({ map: map.shown, back: map.backShown });
      review.look(look);
      return true;
    };
    if (setup.practice && view === 'setup') $('startBtn').click(); // (Practice: at once, with its review counting)
  });

  return {
    show,
    start() { openSetup(); requestAnimationFrame(() => frame()); },
  };
}
