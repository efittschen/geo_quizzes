// Answer checks.
//
//   plainName(s)               a name as it is compared: no capitals, accents, spaces or punctuation ("&" is "and")
//   typedOf(forms)             typed(id, text): one of the item's forms (plain), or one slip from one of six letters or
//                              more (a letter added, dropped or changed, two swapped), unless it is another item's form
//   codeChecks(kind)           Type code: the codes' forms, the code typed, codes with the same areas, how an outline
//                              lies among the others
//   namedChecks(kind, answerName)   Name it, Shape: the names to pick, every form that counts, the name as told
//   askText(kind, id)          a question as words (a pick's, a pair's): its text, its name, or its chip
//   options(…), board(…)       the four to pick from; a board of pairs
//   distance(km, span)         map play: { points, cls }
//   drawing(…)                 Draw: how much the drawing and the place have in common

export const plainName = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^\p{L}\p{N}]+/gu, '');

function oneSlip(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  const rest = (x, y) => a.slice(x) === b.slice(y);
  return rest(i + 1, i + 1) || rest(i, i + 1) || rest(i + 1, i) || (a[i] === b[i + 1] && a[i + 1] === b[i] && rest(i + 2, i + 2));
}

export function typedOf(forms) {
  const owned = new Set(Object.values(forms).flat());
  return (id, text) => {
    const t = plainName(text), mine = forms[id] || [];
    if (mine.includes(t)) return true;
    if (owned.has(t)) return false;
    return t.length >= 6 && mine.some(f => f.length >= 6 && oneSlip(t, f));
  };
}

/* ---------- Type code ---------- */

// A code counts as it is written in the quiz, its short name and its name: only its digits (a plate code its letters
// and digits, in capitals), with or without leading zeros; "021 · 031" is either, "(07) 2/3" 072 or 073. A form two
// codes share counts for neither. A plate code typed without its marks (ck for ČK) counts where no other is written so.
export function codeChecks(K) {
  const norm = t => (K.plates ? String(t).toUpperCase().replace(/[^\p{L}\p{N}]/gu, '') : String(t).replace(/\D/g, ''));
  const ids = [...new Set(K.ids)], count = new Map(), owner = new Map();
  for (const id of ids) {
    const forms = new Set();
    for (const written of [K.short ? K.short(id) : id, K.name ? K.name(id) : '']) for (const part of String(written).split('·')) {
      const alt = !K.plates && part.match(/^(.*?)(\d+)\/(\d+)\s*$/);
      for (const p of alt ? [alt[1] + alt[2], alt[1] + alt[3]] : [part]) {
        const d = norm(p); if (!d) continue;
        forms.add(d);
        if (/^\d+$/.test(d)) forms.add(d.replace(/^0+(?=\d)/, ''));
      }
    }
    for (const f of forms) { count.set(f, (count.get(f) || 0) + 1); owner.set(f, id); }
  }
  const bare = t => t.normalize('NFD').replace(/\p{M}/gu, ''), unmarked = new Map();
  if (K.plates) for (const [f, n] of count) {
    const b = bare(f);
    if (b !== f && !count.has(b)) unmarked.set(b, unmarked.has(b) || n > 1 ? null : owner.get(f));
  }
  const codeOf = text => {
    let t = norm(text);
    if (!count.has(t) && /^\d+$/.test(t)) t = t.replace(/^0+(?=\d)/, '');
    if (!t) return null;
    if (count.get(t) === 1) return owner.get(t);
    return (!count.has(t) && unmarked.get(bare(t))) || null;
  };
  // Codes with exactly the same areas look alike outlined: they are asked together. How an outline lies among the
  // others that share an area with it: inside a larger one (a part: the smallest around it), or with others inside or
  // across it (a whole); the outlines wholly inside it are asked first (depth).
  const outline = id => [...new Set(K.areas[id])].sort().join(' '), same = new Map();
  for (const id of ids) { const o = outline(id); (same.get(o) || same.set(o, []).get(o)).push(id); }
  const keys = [...same.keys()], sets = keys.map(o => new Set(o.split(' '))), at = new Map(), lies = new Map();
  sets.forEach((O, i) => { for (const a of O) (at.get(a) || at.set(a, []).get(a)).push(i); });
  sets.forEach((O, i) => {
    const shared = new Map(); // outline -> how many of this one's areas it has
    for (const a of O) for (const j of at.get(a)) if (j !== i) shared.set(j, (shared.get(j) || 0) + 1);
    const parts = []; let around = null, depth = 0;
    for (const j of [...shared.keys()].sort((x, y) => x - y)) {
      const X = sets[j], n = shared.get(j);
      if (n === O.size) { if (!around || X.size < around.length) around = [...X]; }
      else { parts.push([...X].filter(a => O.has(a))); if (n === X.size) depth++; }
    }
    lies.set(keys[i], { parts, around, depth });
  });
  const lie = id => lies.get(outline(id));
  // what is typed, as codes: apart by , ; + & / or "and"; words apart by spaces only where each of them is a code
  const tokens = text => String(text).split(/[,;+&/]|\band\b/i).map(s => s.trim()).filter(Boolean)
    .flatMap(t => { const w = t.split(/\s+/); return w.length > 1 && w.every(codeOf) ? w : [t]; });
  return {
    codeOf, tokens, typed: (id, text) => codeOf(text) === id,
    same: id => same.get(outline(id)),
    scope: id => (lie(id).around ? 'part' : lie(id).parts.length ? 'whole' : ''),
    around: id => lie(id).around, parts: id => lie(id).parts, depth: id => lie(id).depth,
  };
}

/* ---------- Name it, Shape ---------- */

// The kind's own names to pick from (a kind in another script its text, as it asks it, where that is always the
// same: 福島県); every form counts typed (its name, its own one, the one answered, answers(id)), and an item with the
// same areas counts too, since the place shown is either of them.
export function namedChecks(K, answerName) {
  const textOf = id => (K.text(id) || {}).text;
  const fixed = K.prompt === 'text' && K.text && K.ids.every(id => [1, 2, 3, 4].every(() => textOf(id) === textOf(id)));
  const ownName = id => (fixed && textOf(id)) || K.name(id), all = {};
  for (const id of K.ids) all[id] ??= [...new Set([ownName(id), K.name(id), answerName(id), ...[].concat(K.answers ? K.answers(id) : [])].filter(Boolean).map(String))];
  const typed = typedOf(Object.fromEntries(Object.entries(all).map(([id, l]) => [id, [...new Set(l.map(plainName))]])));
  const outline = id => [...new Set(K.areas[id])].sort().join(' '), alike = new Map(), forms = new Map();
  for (const id of new Set(K.ids)) { const o = outline(id); (alike.get(o) || alike.set(o, []).get(o)).push(id); }
  for (const id of K.ids) { const n = ownName(id); forms.set(n, [...new Set([...(forms.get(n) || []), ...all[id]])]); }
  return {
    ownName,
    choices: [...forms.keys()].sort((a, b) => a.localeCompare(b)),
    choiceForms: name => (forms.get(name) || [name]),
    typed: (id, text) => alike.get(outline(id)).some(x => typed(x, text)),
    tell: id => { const out = []; for (const p of [K.name(id), ownName(id), answerName(id)]) if (p && !out.some(o => String(o).includes(p))) out.push(p); return out.join(' · '); },
  };
}

/* ---------- picks and pairs ---------- */

export const askText = (K, id) => (K.prompt === 'text' ? K.text(id).text : K.prompt === 'name' || K.prompt === 'area' ? K.name(id) : K.chip(id));

const shuffled = (list, random) => {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// Four words to pick from: the item's own and three others of the round's items (of the kind's, where the round has
// too few), each with the item it is the word of. Pick: names for the question; pick back: questions for the name.
export function options(P, id, items, random) {
  const word = P.back ? i => askText(P.kind, i) : P.answerName, right = word(id);
  const others = list => shuffled([...new Set(list.filter(x => x !== id).map(word))].filter(t => t !== right), random);
  let pool = others(items);
  if (pool.length < 3) pool = [...new Set([...pool, ...others(P.kind.ids)])];
  return shuffled([right, ...pool.slice(0, 3)], random).map(w => ({ word: w, id: w === right ? id : [...items, ...P.kind.ids].find(x => word(x) === w) }));
}

// A board of pairs: the next questions (up to PAIRS), a name tile for each ({ name, owner: its question }), and tiles of
// other names that match none of them (of the round's items first, then the kind's: { name, owner: null }) up to PAIRS
// names, so the last pair of a board is never left to match itself. Both columns shuffled. A name two questions share
// matches either.
export const PAIRS = 7;
export function board(P, questions, items, random) {
  const mine = new Set(questions.map(P.answerName));
  const others = [...new Set([...shuffled(items, random), ...shuffled(P.kind.ids, random)].map(P.answerName))].filter(n => !mine.has(n)).slice(0, Math.max(0, PAIRS - mine.size));
  const asked = shuffled(questions, random);
  return { questions: asked, names: shuffled([...questions.map(q => ({ name: P.answerName(q), owner: q })), ...others.map(name => ({ name, owner: null }))], random) };
}

/* ---------- map play ---------- */

// GeoGuessr's points, 5000 · e^(−10 · km / span) (span: the map's diagonal), and how close that is: 0 close (4000 or
// more), 1, 2, 3 far.
export const CLOSE = 4000;
export function distance(km, span) {
  const points = Math.round(5000 * Math.exp(-10 * km / span));
  return { points, cls: points >= CLOSE ? 0 : points >= 2500 ? 1 : points >= 1000 ? 2 : 3 };
}

/* ---------- Draw ---------- */

// How much the drawing and the place have in common: the area both cover, of the place and of what is drawn outside
// it at OUT of its size. A band `edge` wide along the place's own edge (where it meets what is not the place) counts
// for neither. Both are laid on a grid of GRID cells across their box, each row by its real size (weight(y): cos² of
// its latitude on a Web Mercator map). A dot (a place too small to see) is a disc of radius `dot` where it is.
//   place: { rings: [rings of each area], dots: [[x, y]] }, pieces: [{ brush: r or 0, pts: [x, y, …] }]
export const PASS = 70, OUT = .25;
const GRID = 600;

export function drawing({ place, pieces, dot, edge, weight }) {
  const box = [Infinity, Infinity, -Infinity, -Infinity];
  const add = (x, y, r) => { box[0] = Math.min(box[0], x - r); box[1] = Math.min(box[1], y - r); box[2] = Math.max(box[2], x + r); box[3] = Math.max(box[3], y + r); };
  for (const rings of place.rings) for (const r of rings) for (const [x, y] of r) add(x, y, edge);
  for (const [x, y] of place.dots) add(x, y, dot);
  for (const p of pieces) for (let i = 0; i < p.pts.length; i += 2) add(p.pts[i], p.pts[i + 1], p.brush);
  const cell = Math.max(box[2] - box[0], box[3] - box[1]) / GRID || 1, w = Math.ceil((box[2] - box[0]) / cell) + 2, h = Math.ceil((box[3] - box[1]) / cell) + 2;
  const X = i => box[0] + (i - .5) * cell, Y = j => box[1] + (j - .5) * cell; // (a cell's middle; the grid has a cell to spare on each side)
  const inPlace = new Uint8Array(w * h), drawn = new Uint8Array(w * h);
  for (const rings of place.rings) fill(inPlace, rings);
  for (const [x, y] of place.dots) disc(inPlace, x, y, dot);
  for (const p of pieces) {
    if (!p.brush) { const r = []; for (let i = 0; i < p.pts.length; i += 2) r.push([p.pts[i], p.pts[i + 1]]); fill(drawn, [r]); continue; }
    for (let i = 0; i < p.pts.length; i += 2) {
      const j = i + 2 < p.pts.length ? i + 2 : i;
      band(drawn, p.pts[i], p.pts[i + 1], p.pts[j], p.pts[j + 1], p.brush);
    }
  }
  // even-odd, each ring of each area on its own: what lies in two areas is the place still
  function fill(grid, rings) {
    const mine = new Uint8Array(w * h);
    for (const r of rings) for (let a = 0, b = r.length - 1; a < r.length; b = a++) {
      const [x0, y0] = r[b], [x1, y1] = r[a]; if (y0 === y1) continue;
      for (let j = Math.max(0, Math.ceil((Math.min(y0, y1) - box[1]) / cell + .5)); j < h && Y(j) < Math.max(y0, y1); j++) {
        const y = Y(j), x = x0 + (x1 - x0) * (y - y0) / (y1 - y0);
        for (let i = Math.max(0, Math.ceil((x - box[0]) / cell + .5)); i < w; i++) mine[j * w + i] ^= 1;
      }
    }
    for (let k = 0; k < mine.length; k++) if (mine[k]) grid[k] = 1;
  }
  function disc(grid, x, y, r) { band(grid, x, y, x, y, r); }
  function band(grid, x0, y0, x1, y1, r) { // the cells within r of a stretch (a brush's stroke: round ends)
    const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy;
    for (let j = Math.max(0, Math.floor((Math.min(y0, y1) - r - box[1]) / cell)); j < h && Y(j) <= Math.max(y0, y1) + r; j++)
      for (let i = Math.max(0, Math.floor((Math.min(x0, x1) - r - box[0]) / cell)); i < w && X(i) <= Math.max(x0, x1) + r; i++) {
        const px = X(i) - x0, py = Y(j) - y0, t = l2 ? Math.max(0, Math.min(1, (px * dx + py * dy) / l2)) : 0;
        if (Math.hypot(px - t * dx, py - t * dy) <= r) grid[j * w + i] = 1;
      }
  }
  // the band along the place's edge: each cell's distance from the edge, in two passes over the grid
  const R = edge / cell, far = new Float32Array(w * h).fill(Infinity), D = Math.SQRT2;
  if (R > 0) {
    for (let j = 0, k = 0; j < h; j++) for (let i = 0; i < w; i++, k++) {
      const t = inPlace[k];
      if ((i > 0 && inPlace[k - 1] !== t) || (i < w - 1 && inPlace[k + 1] !== t) || (j > 0 && inPlace[k - w] !== t) || (j < h - 1 && inPlace[k + w] !== t)) far[k] = 0;
    }
    const pass = (k, i, j, s) => {
      let d = far[k];
      if (i - s >= 0 && i - s < w) d = Math.min(d, far[k - s] + 1);
      const up = j - s;
      if (up >= 0 && up < h) {
        d = Math.min(d, far[k - s * w] + 1);
        if (i - s >= 0 && i - s < w) d = Math.min(d, far[k - s * w - s] + D);
        if (i + s >= 0 && i + s < w) d = Math.min(d, far[k - s * w + s] + D);
      }
      far[k] = d;
    };
    for (let j = 0, k = 0; j < h; j++) for (let i = 0; i < w; i++, k++) pass(k, i, j, 1);
    for (let j = h - 1, k = w * h - 1; j >= 0; j--) for (let i = w - 1; i >= 0; i--, k--) pass(k, i, j, -1);
  }
  let both = 0, either = 0;
  for (let j = 0; j < h; j++) {
    let b = 0, e = 0;
    for (let k = j * w, end = k + w; k < end; k++) {
      if (far[k] <= R) continue;
      if (inPlace[k] && drawn[k]) b++;
      if (inPlace[k]) e++; else if (drawn[k]) e += OUT;
    }
    const f = weight(Y(j));
    both += b * f; either += e * f;
  }
  return either ? both / either : 0;
}
