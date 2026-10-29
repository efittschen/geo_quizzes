// picture: a picture (photo(id) -> { src, alt, label, link, linkLabel, cls }), enlarged by a tap; blurred while it is
// asked where its cls says so; once answered with its label and link (the place in Street View). The next question's
// picture is fetched ahead, so it is there when it is asked.
//
// A flag (a kind with looks) is seen as the player picks, under the picture while playing, kept for the page: Flat as it
// is, Waving on its pole in the wind, Hanging limp from it, or Mixed (one of the three for each picture), a picture
// drawn anew for each question (cloth.js). Only how it is shown: results and cards are the same in every look.
//
//   const pictures = makePictures({ model, storage, $ })
//   pictures.format(play, deps)   the format
//   pictures.tile(play, id)       a question on a tile of pairs: its picture (small), its text in its script, its name
//                                 or its code
//   pictures.thumb(photo)         an answered picture, small: a tap shows it large with its label
//   pictures.zoom(photo, answered)   a picture large over the page; a tap anywhere or Escape closes it
//   pictures.looks                the look switch: { el, sync(play, playing), redraw }

import { clothPicture } from './cloth.js';

const LOOKS = [['flat', 'Flat'], ['waving', 'Waving'], ['hanging', 'Hanging'], ['mixed', 'Mixed']];

export function makePictures({ model, storage, $ }) {
  const box = document.createElement('div');
  box.className = 'lightbox'; box.hidden = true;
  box.innerHTML = '<figure><img alt=""><figcaption><span></span><a target="_blank" rel="noopener"></a></figcaption></figure>';
  document.body.append(box);
  box.onclick = e => { if (e.target.tagName !== 'A') box.hidden = true; };
  addEventListener('keydown', e => { if (e.key === 'Escape') box.hidden = true; });

  function zoom(p, answered) {
    const [img, cap] = box.firstChild.children, [label, link] = cap.children;
    img.src = p.src; img.alt = p.alt || ''; img.dataset.look = answered ? '' : p.cls || ''; // (blurred stays so until answered)
    cap.hidden = !answered; label.textContent = p.label || '';
    link.hidden = !p.link;
    if (p.link) { link.href = p.link; link.textContent = p.linkLabel || 'Street View'; }
    box.hidden = false;
  }
  function thumb(p) {
    const b = document.createElement('button'), im = document.createElement('img');
    b.type = 'button'; b.className = 'ph' + (p.cls ? ' ' + p.cls : ''); b.title = p.label || '';
    im.src = p.src; im.alt = p.label || ''; im.loading = 'lazy';
    b.append(im); b.onclick = () => zoom(p, true);
    return b;
  }

  /* ---------- flags as cloth ---------- */
  const lastLook = storage.last().look;
  let look = LOOKS.some(([l]) => l === lastLook) ? lastLook : 'flat';
  const ahead = new Map(); // a flag drawn ahead (the next question's), taken when it is asked
  const dress = async (src, as, small = false) => {
    if (as === 'mixed') as = ['flat', 'waving', 'hanging'][(Math.random() * 3) | 0];
    return as === 'flat' ? src : clothPicture(src, as, small ? 320 : 640, small ? 200 : 400);
  };
  const dressed = src => { const a = ahead.get(src); ahead.delete(src); return a && a.look === look ? a.job : dress(src, look).catch(() => src); };
  // a picture into an img, in the look picked (flat at once, else once drawn); the last one asked for wins
  function into(im, K, small = false) {
    const src = im.dataset.src, token = (im.dataset.token = String(+(im.dataset.token || 0) + 1));
    const put = url => { if (im.src.startsWith('blob:') && im.src !== url) URL.revokeObjectURL(im.src); im.src = url; im.style.visibility = ''; };
    if (!K.looks || look === 'flat') { put(src); return Promise.resolve(src); }
    im.style.visibility = 'hidden';
    return (small ? dress(src, look, true).catch(() => src) : dressed(src)).then(url => { if (im.dataset.token === token) put(url); return url; });
  }

  const looksEl = document.createElement('div');
  looksEl.className = 'looks'; looksEl.hidden = true;
  looksEl.setAttribute('role', 'group'); looksEl.setAttribute('aria-label', 'Look');
  let redraw = () => {};
  looksEl.append(...LOOKS.map(([l, t]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.look = l; b.textContent = t;
    b.onclick = () => { look = l; storage.keepLast(r => { r.look = l; }); sync(); redraw(); };
    return b;
  }));
  $('photo').after(looksEl);
  let shownPlay = null, playing = false;
  function sync(P = shownPlay, on = playing) {
    shownPlay = P; playing = on;
    looksEl.hidden = !(on && P && P.kind.looks);
    for (const b of looksEl.children) b.setAttribute('aria-pressed', b.dataset.look === look);
  }

  let shownSrc = null;
  function format(P, { place }) {
    const K = P.kind;
    const show = p => {
      const im = $('photoImg');
      im.dataset.src = p.src; shownSrc = p.src;
      into(im, K).then(url => { if (im.dataset.src === p.src) shownSrc = url; });
    };
    return {
      show(id) {
        const el = place('picture'), p = K.photo(id);
        show(p);
        $('photoImg').alt = p.alt || ''; el.dataset.look = p.cls || '';
        el.onclick = () => zoom({ ...p, src: shownSrc || p.src }, false);
        redraw = () => show(p);
      },
      ahead(id) { const src = K.photo(id).src; new Image().src = src; if (K.looks && look !== 'flat' && !ahead.has(src)) ahead.set(src, { look, job: dress(src, look).catch(() => src) }); },
      answered() {}, hide() {},
    };
  }

  function tile(P, id) {
    const K = P.kind;
    if (K.prompt === 'photo') {
      const p = K.photo(id), im = document.createElement('img');
      im.alt = p.alt || ''; im.dataset.look = p.cls || ''; im.dataset.src = p.src;
      into(im, K, true);
      return im;
    }
    const s = document.createElement('span');
    s.textContent = model.check.askText(K, id);
    if (K.prompt === 'text' && K.text(id).lang) s.lang = K.text(id).lang;
    return s;
  }

  return { format, tile, thumb, zoom, looks: { el: looksEl, sync, set redraw(f) { redraw = f; } } };
}
