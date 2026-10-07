// Coverage page: the world as a street map with Google Street View coverage drawn on it.
// The coverage is a tile layer of its own, data/coverage/<z>/<x>/<y>.png, made by tools/coverage.mjs: 1024 px tiles,
// z = map zoom - 2, colored by the newest capture at each spot. meta.json lists the tiles that exist (most of the
// world has none), the finest zoom they were drawn for, the color steps and the date of the data.
// ?tiles=dirA,dirB shows other builds of the layer instead (one at a time, picked in the corner), to compare
// levels of detail before one of them becomes data/coverage.
(async function () {
  // Other builds can be shown next to the layer, to compare levels of detail: those named in the layer's meta.json
  // (`also`, set by tools/coverage.mjs tiles --also) or in the address (?tiles=dirA,dirB). Each gets a button.
  const load = dir => fetch(`${dir}/meta.json`, { cache: 'no-cache' }).then(r => r.ok ? r.json() : null, () => null).then(meta => meta && { dir, meta });
  const params = new URLSearchParams(location.search), asked = params.get('tiles');
  // ?embed: the map alone, without the page header (a country page shows it in a box); ?fit=west,south,east,north:
  // the box the map opens on; ?outline=<key>: the country to pick out, by shading everything else.
  if (params.has('embed')) document.body.classList.add('embed');
  let sets = (await Promise.all((asked || 'data/coverage').split(',').map(load))).filter(Boolean);
  if (!asked && sets[0]?.meta.also) sets = sets.concat((await Promise.all(sets[0].meta.also.map(load))).filter(Boolean));
  const main = sets[0], meta = main.meta;
  sets.sort((a, b) => a.meta.zoom - b.meta.zoom);
  const first = sets.indexOf(main);
  // Standard OpenStreetMap tiles: free for light use with attribution, no API key needed.
  const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const month = new Date(meta.updated).toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });

  // Tiles show the moment they arrive (no fading in), and the layers load `ahead` pixels beyond the edge of the map
  // and look for new tiles twice as often as Leaflet's default while it is dragged: so a move finds its tiles there.
  const map = L.map('cov', { minZoom: 2, maxZoom: Math.max(...sets.map(s => s.meta.zoom)) + 2, worldCopyJump: true, maxBounds: [[-85, -540], [85, 540]], maxBoundsViscosity: 1, fadeAnimation: false });
  const loadsAhead = (Layer) => Layer.extend({
    options: { updateInterval: 100 },
    _getTiledPixelBounds(center) {
      const b = Layer.prototype._getTiledPixelBounds.call(this, center), pad = L.point(this.options.ahead, this.options.ahead);
      return L.bounds(b.min.subtract(pad), b.max.add(pad));
    },
  });
  map.attributionControl.setPrefix(false); // credits name the map data only, not the Leaflet library
  // The place is kept in the address (#zoom/lat/lng), so a view can be bookmarked and shared.
  const at = location.hash.slice(1).split('/').map(Number), fit = (params.get('fit') || '').split(',').map(Number);
  if (at.length === 3 && at.every(isFinite)) map.setView([at[1], at[2]], at[0]);
  else if (fit.length === 4 && fit.every(isFinite)) map.fitBounds([[fit[1], fit[0]], [fit[3], fit[2]]], { padding: [24, 24] });
  else map.setView([30, 10], 3);
  map.on('moveend', () => {
    const c = map.getCenter();
    history.replaceState(null, '', `#${map.getZoom()}/${c.lat.toFixed(4)}/${c.lng.toFixed(4)}`);
  });

  // The street map in grey, so the coverage stands out. Each tile is turned grey once, as it arrives: a CSS filter on
  // the whole layer is worked out again on every frame of a pan or zoom, which made the map slow.
  const GREY = 'grayscale(1) contrast(.88) brightness(1.05)';
  const Grey = loadsAhead(L.GridLayer).extend({
    createTile(c, done) {
      const tile = L.DomUtil.create('canvas', 'leaflet-tile'), size = this.getTileSize(), img = new Image();
      tile.width = size.x; tile.height = size.y;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const ctx = tile.getContext('2d');
        if ('filter' in ctx) ctx.filter = GREY; else tile.style.filter = GREY; // Safari: no filter on a canvas drawing
        ctx.drawImage(img, 0, 0);
        done(null, tile);
      };
      img.onerror = () => done(new Error('tile not loaded'), tile);
      img.src = L.Util.template(TILE_URL, c);
      return tile;
    },
  });
  new Grey({ maxZoom: 19, attribution: TILE_ATTRIBUTION, ahead: 256 }).addTo(map); // one ring of tiles: OpenStreetMap asks not to fetch much ahead
  // Likewise the coverage is blended into the map (so place names stay readable under it) only while the map is
  // still; while it moves it is simply laid over the map (see .moving in style.css).
  map.on('movestart zoomstart', () => map.getContainer().classList.add('moving'));
  map.on('moveend zoomend', () => map.getContainer().classList.remove('moving'));

  const Coverage = loadsAhead(L.TileLayer).extend({
    // Only the tiles that exist are asked for.
    _isValidTile(c) {
      if (!L.TileLayer.prototype._isValidTile.call(this, c)) return false;
      const z = c.z + this.options.zoomOffset, n = 2 ** z, have = this.options.have[z];
      return !!have && have.has(`${((c.x % n) + n) % n}/${c.y}`);
    },
  });
  const layers = sets.map(({ dir, meta: m }) => new Coverage(`${dir}/{z}/{x}/{y}.png`, {
    tileSize: 1024, zoomOffset: -2, minNativeZoom: 2, maxNativeZoom: m.zoom, className: 'cov-tiles', ahead: 512,
    have: Object.fromEntries(Object.entries(m.tiles).map(([z, list]) => [z, new Set(list)])),
    attribution: `Coverage: <a href="https://github.com/slashP/Vali">Vali</a> location pool, ${month}`,
  }));
  layers[first].addTo(map);
  if (layers.length > 1) {
    // Several builds: one button each, named by the size of a pixel of its finest level (at the equator), with its
    // size on disk, and one to hide the coverage.
    const pick = L.control({ position: 'topright' });
    pick.onAdd = () => {
      const el = L.DomUtil.create('div', 'cov-pick');
      L.DomEvent.disableClickPropagation(el);
      const buttons = [...sets, null].map((s, i) => {
        const b = L.DomUtil.create('button', '', el);
        b.type = 'button';
        b.innerHTML = s ? `${Math.round(40075017 / (256 * 2 ** s.meta.zoom) / 25) * 25} m<small>${s.meta.size ? Math.round(s.meta.size / 1e6) + ' MB' : ''}</small>` : 'Off';
        b.onclick = () => show(i);
        return b;
      });
      const show = at => {
        layers.forEach((l, i) => i === at ? l.addTo(map) : l.remove());
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', i === at));
      };
      show(first);
      return el;
    };
    pick.addTo(map);
  }

  // The coverage tiles a zoom would need are fetched ahead, into the browser's cache, in quiet moments: the few
  // of the coarsest levels for the whole world at the start, and after each move those of the next zoom in and out
  // for the part in view.
  if (sets.length === 1) {
    const { dir, meta: m } = sets[0], have = layers[0].options.have, asked = new Set(), held = [];
    const ask = (z, x, y) => {
      const url = `${dir}/${z}/${x}/${y}.png`;
      if (asked.has(url) || !have[z]?.has(`${x}/${y}`)) return;
      asked.add(url);
      const img = new Image(); img.src = url; held.push(img); if (held.length > 80) held.shift();
    };
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 300));
    idle(() => { for (let z = 0; z <= Math.min(3, m.zoom - 2); z++) for (const k of have[z] || []) ask(z, ...k.split('/').map(Number)); });
    const around = () => idle(() => {
      const b = map.getBounds();
      for (const zoom of [map.getZoom() + 1, map.getZoom() - 1]) {
        const z = zoom - 2, n = 2 ** z;
        if (z < 0 || z > m.zoom - 2) continue;
        const col = (lng) => Math.floor((lng + 180) / 360 * n), row = (lat) => Math.floor((1 - Math.log(Math.tan(Math.PI / 4 + Math.max(-85, Math.min(85, lat)) * Math.PI / 360)) / Math.PI) / 2 * n);
        for (let x = col(b.getWest()); x <= col(b.getEast()); x++) for (let y = row(b.getNorth()); y <= row(b.getSouth()); y++) ask(z, ((x % n) + n) % n, y);
      }
    });
    map.on('moveend', around);
    around();
  }

  // One country picked out: everything outside its border (data/coverage/outline/, made by tools/coverage.mjs) is
  // shaded, as one shape, the world with the country's rings cut out of it. A ring is a flat list of whole numbers:
  // latitude and longitude of its first point in thousandths of a degree, then the step to each next point.
  const key = params.get('outline');
  if (key && /^[\w-]+$/.test(key)) {
    fetch(`data/coverage/outline/${key}.json`).then((r) => (r.ok ? r.json() : null), () => null).then((rings) => {
      if (!rings) return;
      const holes = rings.map((flat) => {
        const ring = [];
        for (let i = 0, lat = 0, lng = 0; i < flat.length; i += 2) ring.push([(lat += flat[i]) / 1000, (lng += flat[i + 1]) / 1000]);
        return ring;
      });
      const world = [[-89, -720], [89, -720], [89, 720], [-89, 720]];
      // Leaflet draws shapes only a little beyond the edge of the map and again when a move ends, so a long drag
      // would run out of shading. This one is drawn whole (noClip), in a pane of its own whose picture may show
      // past its frame (.leaflet-shade-pane in style.css): it is there wherever the map is dragged.
      map.createPane('shade').style.zIndex = 350;
      L.polygon([world, ...holes], { pane: 'shade', className: 'cov-others', interactive: false, smoothFactor: 1.5, noClip: true }).addTo(map);
    });
  }

  // Legend: the color steps, newest first.
  const legend = L.control({ position: 'bottomleft' });
  legend.onAdd = () => {
    const el = L.DomUtil.create('div', 'cov-legend'), [a, b] = meta.years, last = +meta.updated.slice(0, 4);
    const rows = [[meta.colors[2], `${b}–${last}`], [meta.colors[1], `${a}–${b - 1}`], [meta.colors[0], `2007–${a - 1}`]];
    el.innerHTML = '<b>Last capture</b>' + rows.map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join('');
    return el;
  };
  legend.addTo(map);
})();
