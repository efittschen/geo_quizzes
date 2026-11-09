// cards: the question on a card in the middle of the page, a little smaller than it, which turns over to the map with
// the place lit and what is said of it under the map; the player rates it there, Easy, Good, Hard or Missed (the keys
// 4, 3, 2, 1), never the clock. Show (Space) turns it the first time and shows the answer (game.show); after that a
// click on the card, a tap on its map that doesn't move it, or Space turns it back and forth, so that the question can
// be looked at again. A rating turns it back, and the Game asks the next card once it is edge-on (CARD_TURN), when the
// last card's place leaves the map and the map shows all of the round again. A card whose answer is no place on the
// map but a picture (a Plonkit map: answerPhoto) has that picture on its back instead of the map.
// While a round of cards is played the panel is a line above the card (.app.cards, quiz-page.css), and the map
// (#stage), the question's places (the format's, formats/index.js) and the answer's box (#fb) are on the card; after
// it, back where they were. At rest nothing on the card is turned: the map on it is the map as anywhere else.

const TURN = 500; // ms, as .flip-card.turning in quiz-page.css
const RATINGS = [['Easy', 3, '4'], ['Good', 2, '3'], ['Hard', 1, '2'], ['Missed', 0, '1']]; // (the review's grades: INSTANT, KNOWN, UNSURE, MISSED)
const PLACES = '.shape, #photo, .looks, #bigname, #card, #dial';
const PLACED = ['ans', 'flash', 'found', 'pick', 'got', 't2', 't3', 'miss']; // (a card's place, as the map showed it)

export function makeCards({ game, map, $ }) {
  const flip = document.createElement('div');
  flip.className = 'flip'; flip.hidden = true;
  flip.innerHTML = '<div class="flip-card" data-side="front">'
    + '<div class="flip-face flip-front"><div class="flip-q"></div><div class="flip-bar"><button type="button" class="primary flip-show"><span>Show</span><kbd>Space</kbd></button></div></div>'
    + '<div class="flip-face flip-back"><div class="flip-pic"><img alt=""></div><div class="flip-bar flip-rate" role="group" aria-label="Rating"></div></div>'
    + '</div>';
  const card = flip.firstChild, [front, back] = card.children, question = front.firstChild, showBar = front.lastChild;
  const pic = back.firstChild, rateBar = back.lastChild;
  rateBar.append(...RATINGS.map(([label, g, key]) => {
    const b = document.createElement('button'), k = document.createElement('kbd');
    b.type = 'button'; b.className = ['miss', 'hard', '', ''][g];
    k.textContent = key; b.append(label, k);
    b.onclick = () => { b.blur(); rate(g); };
    return b;
  }));
  $('app').append(flip);

  // side: the one up; moved: what is on the card while a round of cards is played, each with the mark of its place
  let side = 'front', timer = 0, moved = null, asked = null, last = null;
  const shown = () => game.shownAt != null, turning = () => card.classList.contains('turning');

  function open() {
    if (moved) return;
    moved = [];
    const put = (el, into, before = null) => { const mark = document.createComment(''); el.before(mark); moved.push([mark, el]); into.insertBefore(el, before); };
    for (const el of [...$('play').children].filter(e => e.matches(PLACES))) put(el, question);
    put($('stage'), back, pic);
    put($('fb'), back, rateBar);
    $('app').classList.add('cards'); flip.hidden = false;
    rest('front');
  }
  function close() {
    if (!moved) return;
    for (const [mark, el] of moved) mark.replaceWith(el);
    moved = null;
    $('app').classList.remove('cards'); flip.hidden = true;
    rest('front');
  }

  // At rest, the side up and nothing turned; turning, both sides on the card, each seen from its own side only.
  function rest(to) {
    clearTimeout(timer);
    side = to; card.dataset.side = to;
    card.classList.remove('turning'); card.style.transition = ''; card.style.transform = '';
    if (to === 'back') showBar.hidden = shown(); // (Show only until the card has been turned)
  }
  function turn(to) {
    if (side === to || turning()) return;
    const from = side;
    side = to; card.dataset.side = to;
    card.classList.add('turning');
    card.style.transition = 'none'; card.style.transform = `rotateY(${from === 'front' ? 0 : 180}deg)`;
    void card.offsetWidth;
    card.style.transition = ''; card.style.transform = `rotateY(${from === 'front' ? 180 : 360}deg)`;
    timer = setTimeout(() => rest(to), TURN);
  }
  // Show, a click on the card, Space: the answer shown the first time, then over and back
  function turnOver() {
    if (!moved || game.rating) return;
    if (side === 'back') { turn('front'); return; }
    if (!shown()) { game.show(); if (!shown()) return; answerPicture(); }
    turn('back');
  }
  // a card whose answer is a picture, not a place: the picture where the map would be
  function answerPicture() {
    const K = game.def.play.kind, p = !(K.areas[asked] || []).length && K.answerPhoto ? K.answerPhoto(asked) : null;
    back.classList.toggle('pic', !!p);
    pic.firstChild.src = p ? p.src : ''; pic.firstChild.alt = p ? p.label || '' : '';
  }
  function rate(g) {
    if (side !== 'back' || turning() || !shown() || game.rating) return;
    last = asked;
    if (game.answer({ rated: g })) turn('front');
  }

  // the card turned by a click on it; on its front, not the picture enlarged (its flag looks keep their buttons), on
  // its back, not on its buttons and links, nor the map (a tap on it: tap)
  front.addEventListener('click', e => {
    if (e.target.closest('.looks')) return;
    e.stopPropagation();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    turnOver();
  }, true);
  back.addEventListener('click', e => { if (!e.target.closest('button, a, input, select, #stage')) turnOver(); });

  return () => ({
    ask(id) {
      open();
      asked = id; showBar.hidden = false;
      if (side === 'back') turn('front'); // (a rating has turned it already)
      // the last card's place off the map, and all of the round in view, while the map is out of sight
      if (last != null) { const K = game.def.play.kind; map.mark(K.areas[last] || [], PLACED, false); last = null; }
      if (game.def.box && !map.plain()) map.frame(game.def.box); else map.home();
    },
    board() {},
    tap(area, point, ok) { if (ok && side === 'back') turnOver(); },
    key(e) {
      if (e.ctrlKey || e.metaKey || e.altKey || !moved) return;
      if (e.key === ' ' || (e.key === 'Enter' && side === 'front')) { e.preventDefault(); if (!e.repeat) turnOver(); return; }
      const r = RATINGS.find(x => x[2] === e.key);
      if (r && side === 'back') { e.preventDefault(); if (!e.repeat) rate(r[1]); }
    },
    close,
  });
}
