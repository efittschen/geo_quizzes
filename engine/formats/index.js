// Formats: how a question is shown. A play has one format (play.format); each gives the same interface, and shows the
// question in the play panel's place for it (the others hidden) or on the map:
//   const f = formats.of(play)
//   f.show(id, ask)       the question (ask: { pos, group: Type code's codes asked together })
//   f.ahead(id)           what the next question needs, fetched ahead (a picture)
//   f.answered(id, cls)   the question answered, in the colour of its result (Shape: the shape; Name it: the place)
//   f.hide()
// And for every format and screen: formats.fit(el) (a line that must not wrap drawn smaller to fit: the dial),
// formats.tile(play, id) (a question on a tile of pairs), formats.thumb(photo) and
// formats.zoom(photo, answered) (a picture small, and large over the page), formats.say(play, id) (the answer said
// aloud), formats.sound (on or off: a setting for every quiz), formats.looks (the flags' look: flat, waving…).
//
//   name      the item's name; a city may show on its country's road sign (kind.sign, the Sign option)
//   code      a phone or plate code in the page's frame (<body data-dial>)
//   text      words in a script on a sign card, in a typeface picked anew each time
//   picture   a picture: flat, waving or hanging (a flag), or blurred until answered
//   outline   the item's areas outlined on the map
//   shape     the item's shape alone, without the map

import { makeName } from './name.js';
import { makeCode } from './code.js';
import { makeText } from './text.js';
import { makePictures } from './picture.js';
import { makeOutline } from './outline.js';
import { makeShape } from './shape.js';

export function createFormats({ quiz, model, map, storage }) {
  const $ = id => document.getElementById(id);
  // the play panel's places for a question; one is shown at a time, popping up as it changes
  const places = { name: $('bigname'), code: $('dial'), text: $('card'), picture: $('photo'), outline: $('bigname') };
  const shapeEl = document.createElement('div');
  shapeEl.className = 'shape'; shapeEl.hidden = true;
  shapeEl.innerHTML = '<svg preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g class="fill"></g><path class="line"/></svg>';
  $('bigname').before(shapeEl);
  places.shape = shapeEl;
  const all = [...new Set(Object.values(places))].filter(Boolean);
  function place(format) {
    const el = places[format];
    for (const e of all) e.hidden = e !== el;
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    return el;
  }
  // a line of text that must not wrap (the dial) drawn smaller where it is wider than the room it has
  function fit(el) {
    el.style.setProperty('--fit', 1);
    const room = el.parentElement.clientWidth, need = el.scrollWidth;
    el.style.setProperty('--fit', room && need > room ? (room / need).toFixed(3) : 1);
  }
  const pictures = makePictures({ model, storage, $ });
  const deps = { quiz, model, map, $, place, pictures, shapeEl, fit };
  const make = { name: makeName, code: makeCode, text: makeText, picture: pictures.format, outline: makeOutline, shape: makeShape };
  const made = new Map();

  // The answer said aloud (a kind with say) in a voice of the device for its language (zh-TW, else zh): what has no
  // such voice stays silent. The sound is on unless turned off, for every quiz.
  const speaks = typeof speechSynthesis === 'object' && typeof SpeechSynthesisUtterance === 'function';
  if (speaks) speechSynthesis.getVoices();
  const voiceOf = lang => {
    const V = speechSynthesis.getVoices(), tag = v => v.lang.replace('_', '-').toLowerCase(), l = String(lang).toLowerCase();
    return V.find(v => tag(v) === l) || V.find(v => tag(v).split('-')[0] === l.split('-')[0]);
  };
  let sound = storage.settings().sound !== false;

  return {
    of: P => { if (!made.has(P.key)) made.set(P.key, make[P.format](P, deps)); return made.get(P.key); },
    hide: () => { for (const e of all) e.hidden = true; },
    tile: pictures.tile, thumb: pictures.thumb, zoom: pictures.zoom, looks: pictures.looks, fit,
    canSay: P => speaks && !!(P.say || P.kind.say),
    say(P, id) {
      const say = P.say || P.kind.say;
      if (!speaks || !sound || !say) return;
      const s = say(id), voice = s && s.text && voiceOf(s.lang);
      if (!voice) return;
      const u = new SpeechSynthesisUtterance(s.text);
      u.voice = voice; u.lang = voice.lang; u.rate = .8;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    },
    get sound() { return sound; },
    set sound(on) {
      sound = on;
      storage.keepSettings(s => { if (on) delete s.sound; else s.sound = false; });
      if (!on && speaks) speechSynthesis.cancel();
    },
  };
}
