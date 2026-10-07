# Ukraine local code areas

Builds `quizzes/ukraine-codes/fine.js`, `fine-geo.js` (the 561 code areas) and `codes.js` (the codes with their names).

    sh tools/builds/ukraine-codes/run.sh

needs the working folder `tools/cache/builds/ukraine-codes/` with the downloads listed below. The `.js` scripts are CommonJS (see `package.json`).

## Steps (`run_all.sh`)

1. `codes_build.js`: Ukrtelecom's towns and codes (`ukrt_rows.json`), placed with GeoNames (`geocode.js`) → `towns.json`.
2. `assemble.js`: OpenStreetMap relations (`osm/r*.json`) → the raions and city territories as before July 2020, each with the towns inside it → `units.json`, `placed.json`.
3. `build.js`: one area per code, cut to the coast (`land.json`, made by `land.js`) → `ukr_code_areas.geojson`.
4. `tools/geo2quiz.mjs` → `fine.js`, `fine-geo.js`.
5. `mkcodes.mjs`: names (`names.js`, `name_fix.json`) → `codes.js`.
6. `check.js`: every item of every kind has an area.

`xcheck.js` compares the result with ru.wikipedia's code table (`ru_rows.json`). `encl.js`, `holes.js` and `overlaps.js` look for enclaves, gaps and overlaps.

## Downloads

- `fetch_osm.sh`, `fetch_fr.sh`, `op.sh`: the Overpass queries `osm/q0.txt`–`q7.txt` → `osm/r*.json`. Be gentle: one query at a time.
- `fetch_ukrt.sh`: Ukrtelecom's code pages from web.archive.org (the captures listed in `cdx.txt`) → `ukrt/`.
- By hand: GeoNames `UA.txt` into `gn/` and the alternate names into `gnalt/`; OSM simplified land polygons (osmdata.openstreetmap.de) into `land/`.

## Tables made with one-off commands that were not kept (in this folder)

- `ukrt_rows.json`: the rows of the Ukrtelecom pages.
- `rel_index.json`: which OSM relation is which raion or city council.
- `ru_rows.json`: ru.wikipedia's code table.
- `name_fix.json`: today's name of towns that GeoNames matches wrongly (written by hand).

## Sources

- Ukrtelecom, "Коди автоматичного міжміського зв'язку" (archived 2016–2019)
- National Numbering Plan of Ukraine, Order 758 of 26.08.2023 (the 27 zone codes)
- OpenStreetMap contributors (ODbL): boundaries and land polygons
- GeoNames (CC BY 4.0); Wikipedia (code tables, cross-check)
