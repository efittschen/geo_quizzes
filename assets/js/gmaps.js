// Google's map as the street map, for a player who names a key of their own (the review page, "Google street map").
// Without one, and whenever Google does not answer with it, the street map is OpenStreetMap's as before.
//
// The key is a Google Maps Platform API key with the Map Tiles API enabled. It lies in this browser only (store.js,
// `geoquizzes.maps`): no file of the site holds it, the online copy does not take it, and neither does the data file.
// Tiles are asked for in a session (https://tile.googleapis.com/v1/createSession), which says the kind of map and the
// language of its names: the roadmap with English names, as GeoGuessr's map shows them. A session lasts about two
// weeks and is kept with the key, so pages do not each open one. Google counts every tile asked for; the browser
// keeps the ones it has for as long as Google's answer allows, and nothing else of them is stored.
//
//   GMAPS.key()                the key, or ''
//   GMAPS.set(key)             names the key ('' removes it) and tries it: resolves to what is wrong, or null
//   GMAPS.tiles()              resolves to { url: a tile address with {z}, {x}, {y}, copyright(bounds, zoom) } or, without a
//                              key or without an answer, null (the fault is then in GMAPS.state())
//   GMAPS.failed(why)          a page tells that tiles did not come: the session is dropped, the fault kept
//   GMAPS.state()              { key, fault, at: when the key last answered (ms) }
const GMAPS = (() => {
  const API = 'https://tile.googleapis.com', LANGUAGE = 'en-US', REGION = 'US', SPARE = 3600; // a session is left an hour before it ends
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
  let opening = null;
  function session() {
    const { key, session, expiry } = get();
    if (!key) return Promise.resolve(null);
    if (session && expiry - SPARE > Date.now() / 1000) return Promise.resolve(session);
    return opening ||= (async () => {
      let fault = null, out = null;
      try {
        const res = await fetch(`${API}/v1/createSession?key=${encodeURIComponent(key)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mapType: 'roadmap', language: LANGUAGE, region: REGION }) });
        if (res.ok) out = await res.json(); else fault = await why(res);
      } catch (err) { fault = 'Not reached'; }
      if (out && !out.session) { fault = 'No session'; out = null; }
      STORE.setMaps(m => {
        if (m.key !== key) return; // another key was named meanwhile, or none
        if (out) { m.session = out.session; m.expiry = +out.expiry || 0; m.at = Date.now(); delete m.fault; }
        else { delete m.session; delete m.expiry; m.fault = fault; }
      });
      opening = null;
      return out ? out.session : null;
    })();
  }
  async function tiles() {
    const k = key(), s = await session();
    if (!s) return null;
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
  function failed(fault) { STORE.setMaps(m => { if (!m.key) return; delete m.session; delete m.expiry; m.fault = fault; }); }
  async function set(k) {
    k = k.trim();
    STORE.setMaps(m => { for (const f in m) delete m[f]; if (k) m.key = k; });
    if (!k) return null;
    if (!/^[\w-]{20,}$/.test(k)) { failed('Not a valid key'); return 'Not a valid key'; }
    await session();
    return get().fault || null;
  }
  return { key, set, tiles, failed, state };
})();
