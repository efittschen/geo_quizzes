// Google's map as the street map, for a player who names a key of their own (the review page, "Google street map"),
// or, without one or when the key does not answer, who ticks "Google Maps (unofficial)" there (see unofficial below).
// Otherwise, and whenever Google does not answer, the street map is OpenStreetMap's as before.
//
// The key is a Google Maps Platform API key with the Map Tiles API enabled. It lies in this browser only (store.js,
// `geoquizzes.maps`): no file of the site holds it, the online copy does not take it, and neither does the data file.
// Tiles are asked for in a session (https://tile.googleapis.com/v1/createSession), which says the kind of map and the
// language of its names: the roadmap with English names, as GeoGuessr's map shows them. The bare map has a session of
// its own, whose styles turn off the borders and the names of countries and provinces. A session lasts about two
// weeks and is kept with the key (the bare map's in `bare`), so pages do not each open one. Google counts every tile
// asked for; the browser keeps the ones it has for as long as Google's answer allows, and nothing else of them is
// stored.
//
//   GMAPS.key()                the key, or ''
//   GMAPS.set(key)             names the key ('' removes it) and tries it: resolves to what is wrong, or null
//   GMAPS.tiles(bare)          resolves to { url: a tile address with {z}, {x}, {y}, copyright(bounds, zoom) } or, without a
//                              key or without an answer, null (the fault is then in GMAPS.state()); bare: the bare map's.
//                              A key that does not answer gives way to the public tile address where the box is ticked
//   GMAPS.failed(why, unofficial)  a page tells that tiles did not come: the key's session is dropped, the fault kept; the
//                              public tile address's (unofficial: true, or no key) is dropped for the rest of the visit
//   GMAPS.fallback(bare)       the public tile address's tiles, where the box is ticked and they have not failed this
//                              visit, else null: what a page turns to when the key's tiles are refused
//   GMAPS.state()              { key, fault, at: when the key last answered (ms) }
//   GMAPS.unofficial()         whether the street map is Google's by its public tile address (no key, the box ticked)
//   GMAPS.wanted()             whether the box is ticked; GMAPS.setUnofficial(on) ticks it or not
const GMAPS = (() => {
  const API = 'https://tile.googleapis.com', LANGUAGE = 'en-US', REGION = 'US', SPARE = 3600; // a session is left an hour before it ends
  // The bare map: no borders, no names of countries and provinces (towns keep theirs).
  const BARE = [
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.country', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.province', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ];
  const get = () => STORE.maps(), key = () => get().key || '';
  const state = () => { const { key = '', fault, at } = get(); return { key, fault, at }; };
  // Why Google refused, in a few words: its own message names the cause (the API not enabled, the key restricted…).
  async function why(res) {
    const body = await res.json().catch(() => null), text = body?.error?.message || '';
    if (/not been used|disabled|not enabled|not activated/i.test(text)) return 'Map Tiles API not enabled for this key';
    if (/referer|referrer|restrict|not authorized|blocked/i.test(text)) return 'Key not allowed on this address';
    if (/API key not valid|invalid/i.test(text)) return 'Not a valid key';
    if (/quota|limit|billing/i.test(text)) return res.status === 429 || /quota|limit/i.test(text) ? 'Quota used up' : 'Billing not set up';
    return text ? text.slice(0, 80) : `Refused (${res.status})`;
  }
  const opening = {};
  function session(bare = false) {
    const m = get(), key = m.key || '', { session, expiry } = (bare ? m.bare : m) || {}, kind = bare ? 'bare' : 'street';
    if (!key) return Promise.resolve(null);
    if (session && expiry - SPARE > Date.now() / 1000) return Promise.resolve(session);
    return opening[kind] ||= (async () => {
      let fault = null, out = null;
      try {
        const res = await fetch(`${API}/v1/createSession?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mapType: 'roadmap', language: LANGUAGE, region: REGION, ...(bare ? { styles: BARE } : {}) }) });
        if (res.ok) out = await res.json(); else fault = await why(res);
      } catch (err) { fault = 'Not reached'; }
      if (out && !out.session) { fault = 'No session'; out = null; }
      STORE.setMaps(m => {
        if (m.key !== key) return; // another key was named meanwhile, or none
        const s = bare ? (m.bare ||= {}) : m;
        if (out) { s.session = out.session; s.expiry = +out.expiry || 0; m.at = Date.now(); delete m.fault; }
        else { delete s.session; delete s.expiry; m.fault = fault; }
      });
      opening[kind] = null;
      return out ? out.session : null;
    })();
  }
  // Unofficial: without a key, Google's own public tile address, as Google's websites ask for it (against Google's
  // terms: the player's choice, a box on the review page). English names; the bare map's styled by the address's own
  // apistyle (borders off, the names of countries and provinces off). Dropped for the rest of the visit once its
  // tiles do not come (failed()).
  const OFF = 'geoquizzes.unofficial-off', UNOFFICIAL = 'https://mt{s}.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}';
  const APISTYLE = '&apistyle=' + encodeURIComponent('s.t:1|s.e:g|p.v:off,s.t:17|s.e:l|p.v:off,s.t:18|s.e:l|p.v:off');
  const dropped = () => { try { return sessionStorage.getItem(OFF) === '1'; } catch (err) { return false; } };
  const unofficial = () => !key() && !!get().unofficial && !dropped();
  function setUnofficial(on) { STORE.setMaps(m => { if (on) m.unofficial = true; else delete m.unofficial; }); try { sessionStorage.removeItem(OFF); } catch (err) {} }
  const fallback = (bare = false) => (get().unofficial && !dropped() ? { url: UNOFFICIAL + (bare ? APISTYLE : ''), unofficial: true } : null);
  async function tiles(bare = false) {
    if (unofficial()) return fallback(bare);
    const k = key(), s = await session(bare);
    if (!s) return fallback(bare); // (a key that does not answer: the public address where the box is ticked)
    const auth = `session=${encodeURIComponent(s)}&key=${encodeURIComponent(k)}`;
    return {
      url: `${API}/v1/2dtiles/{z}/{x}/{y}?${auth}`,
      // The credit Google asks to be shown with the tiles in view.
      async copyright(b, zoom) {
        const clampLng = v => Math.max(-180, Math.min(180, v)), clampLat = v => Math.max(-85, Math.min(85, v));
        try {
          const res = await fetch(`${API}/tile/v1/viewport?${auth}&zoom=${zoom}&north=${clampLat(b.north)}&south=${clampLat(b.south)}&east=${clampLng(b.east)}&west=${clampLng(b.west)}`);
          return res.ok ? (await res.json()).copyright || '' : '';
        } catch (err) { return ''; }
      },
    };
  }
  function failed(fault, pub = false) {
    if (pub || !key()) { try { sessionStorage.setItem(OFF, '1'); } catch (err) {} return; }   // (unofficial: OpenStreetMap for the rest of the visit)
    STORE.setMaps(m => { if (!m.key) return; delete m.session; delete m.expiry; delete m.bare; m.fault = fault; });
  }
  async function set(k) {
    k = k.trim();
    STORE.setMaps(m => { for (const f in m) if (f !== 'unofficial') delete m[f]; if (k) m.key = k; });
    if (!k) return null;
    if (!/^[\w-]{20,}$/.test(k)) { failed('Not a valid key'); return 'Not a valid key'; }
    await session();
    return get().fault || null;
  }
  return { key, set, tiles, fallback, failed, state, unofficial, setUnofficial, wanted: () => !!get().unofficial };
})();
