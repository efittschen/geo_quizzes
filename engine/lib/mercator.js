/* Quiz maps in Web Mercator: the projection of the street map and of GeoGuessr's own map. A quiz is practised on the
   shapes a player guesses on, with every part of a country at its real place, and the street map lies under a quiz map
   as it is, north up. quiz-page.js loads this file on every quiz page.

   A map's `proj` is { type: 'mercator', k, lng0, y0, grain }: k map units per degree of longitude, lng0 its west edge,
   y0 its north edge as Mercator's y in degrees, grain the step its points are rounded to (a city map has none).
   x = (lng − lng0) · k, y = (y0 − my(lat)) · k.

   Every quiz map lies on the plain map of the world (world.js, which tools/worldmap.mjs draws in the same projection):
   MERCATOR.world(W, proj, w) says where. */
const MERCATOR = (() => {
  const RAD = Math.PI / 180;
  const my = lat => Math.log(Math.tan(Math.PI / 4 + Math.max(-85.05, Math.min(85.05, lat)) * RAD / 2)) / RAD; // Mercator's y, in degrees
  const latOf = y => (2 * Math.atan(Math.exp(y * RAD)) - Math.PI / 2) / RAD;
  // A point of a map -> [lat, lng]
  const latlng = (x, y, P) => [latOf(P.y0 - y / P.k), P.lng0 + x / P.k];
  // Where the world's map (world.js: W.proj) goes under a map with projection P that is w map units wide: a list of
  // [scale, dx, dy], one per turn of the globe the map reaches into (a country over the 180th meridian needs two).
  function world(W, P, w) {
    const s = P.k / W.proj.k, out = [];
    for (const t of [0, -1, 1]) { const dx = (360 * t - 180 - P.lng0) * P.k; if (dx < w && dx + 360 * P.k > 0) out.push([s, dx, (P.y0 - W.proj.y0) * P.k]); }
    return out;
  }
  return { world, my, latOf, latlng };
})();
