// Country signs in the city quizzes: the asked city on one of its country's road signs (town entry, exit, direction,
// motorway, ...), drawn after GeoHints pictures and Wikimedia Commons photos (tools/builds/signs writes this folder:
// lib.js, parts/, countries/, fonts/, index.js). Only drawings reviewed against their pictures are used (index.js).
// Every other place name on a sign (the next town, a second destination) is blurred, so the sign shows one name.
//
// city-config.js calls CitySigns.init(base, iso3, version) and then signs.draw(place, el, caption):
//   place   { name, alt, region, next, nextAlt, next2, km }: the asked city as written on its signs, its second
//           script, region, and its nearest towns (names as on the signs) with the distance to the first
//   el      the element the sign goes into; draw returns false (and leaves el alone) while nothing is loaded or the
//           country has no sign for that region, and the page shows the plain name.
window.CitySigns = {
  init(base, iso3, version) {
    const q = version ? `?v=${version}` : '';
    const add = (src) => new Promise((ok, fail) => { const s = document.createElement('script'); s.src = base + src + q; s.onload = ok; s.onerror = fail; document.head.append(s); });
    let C = null;   // { cc, ids } once the country's drawings are there
    add('index.js').then(async () => {
      const entry = (window.SIGN_INDEX || {}).countries?.[iso3];
      if (!entry) return;
      const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = base + 'fonts.css' + q; document.head.append(css);
      await add('lib.js');
      for (const p of SIGN_INDEX.parts) await add('parts/' + p);
      await add('countries/' + entry.cc + '.js');
      C = { cc: entry.cc, ids: new Set(entry.ids) };
      // the sources on the page's credit line
      const note = document.querySelector('p.note');
      if (note) note.append(` · Signs: after GeoHints and Wikimedia Commons pictures${entry.credit ? ' · ' + entry.credit : ''}`);
    }).catch(() => {});   // no signs: the plain name stays

    // the same text with its letters turned round by one: as long and as wide, but different
    const turn = (s) => (s && [...s].length > 1 ? [...s].slice(1).join('') + [...s][0] : s && s + s);
    const texts = (svg) => { const d = document.createElement('div'); d.innerHTML = svg; return [d.firstElementChild, [...d.querySelectorAll('text')].map((t) => t.textContent)]; };
    let uid = 0;

    return {
      draw(place, el, caption) {
        if (!C || !window.TS) return false;
        const list = TS.forPlace(C.cc, { region: place.region }).filter((t) => C.ids.has(t.id));
        if (!list.length) return false;
        const t = list[Math.floor(Math.random() * list.length)];
        const f = { name: place.name, alt: place.alt, region: place.region, next: place.next, nextAlt: place.nextAlt, next2: place.next2, km: place.km };
        let svg, own, near, dist;
        try {
          svg = TS.render(C.cc, t.id, f);
          own = texts(TS.render(C.cc, t.id, { ...f, name: turn(f.name), alt: turn(f.alt) }))[1];
          near = texts(TS.render(C.cc, t.id, { ...f, next: turn(f.next), nextAlt: turn(f.nextAlt), next2: turn(f.next2) }))[1];
          dist = texts(TS.render(C.cc, t.id, { ...f, km: f.km + 13 }))[1];
        } catch (e) { return false; }
        const [node, base] = texts(svg);
        // Blurred: a text that changes with the neighbours' names but not with the asked one (another place), and a
        // road, exit or route number (the drawing's own, not that of a road to the city: "6", "B 223", "A 104", "EXIT 23").
        // Generic words and the distances (they change with km) stay as they are.
        const same = base.length === own.length && base.length === near.length && base.length === dist.length;
        const road = /^[([]?\s*(?:[\p{Lu}]{1,4}[\s.\-]?)?\d{1,4}[a-z]?(?:[\s.\-+]\d{1,4})?(?:\s?[A-Z]{1,2})?\s*[)\]]?$/u;
        const blur = same ? base.map((s, i) => s === own[i] && (s !== near[i] || (s === dist[i] && road.test(s.trim())))) : base.map(() => false);
        const all = [...node.querySelectorAll('text')], ns = 'http://www.w3.org/2000/svg';
        const defs = document.createElementNS(ns, 'defs');
        all.forEach((el2, i) => {
          if (!blur[i]) return;
          const size = parseFloat(el2.getAttribute('font-size')) || 20, id = `sgb${++uid}`;
          const fl = document.createElementNS(ns, 'filter');
          fl.setAttribute('id', id); fl.setAttribute('x', '-30%'); fl.setAttribute('y', '-60%'); fl.setAttribute('width', '160%'); fl.setAttribute('height', '220%');
          const g = document.createElementNS(ns, 'feGaussianBlur'); g.setAttribute('stdDeviation', (size * 0.16).toFixed(1));
          fl.append(g); defs.append(fl);
          el2.setAttribute('filter', `url(#${id})`); el2.setAttribute('aria-hidden', 'true');
        });
        if (defs.childNodes.length) node.prepend(defs);
        node.setAttribute('role', 'img'); node.setAttribute('aria-label', place.name);
        el.replaceChildren(node);
        if (caption) { const c = document.createElement('span'); c.className = 'signcap'; c.textContent = caption; el.append(c); }
        // names are sized to their room in the real font, once it is there (TS.fitDOM, lib.js)
        const fit = () => TS.fitDOM(node);
        fit(); document.fonts.ready.then(fit); setTimeout(fit, 500);
        return true;
      },
    };
  },
};
