# New Zealand calling areas

Builds `quizzes/new-zealand-codes/data.js` and `geo.js`: one map area per local calling area (LICA) of the NAD number register, with the number blocks of each area.

    sh tools/builds/new-zealand-codes/run.sh

needs `npx` (for mapshaper) and the working folder `tools/cache/builds/new-zealand-codes/` with the downloads listed below.

## Steps

1. `fetch_ur.mjs`: Stats NZ meshblocks with their SA2 and urban area → `mb_ur.json`.
2. `towns.py`: the exchange towns of Wikipedia's "List of dialling codes in New Zealand" (`old/wp_lca.txt`), each with the calling area its number ranges have in the register, placed with GeoNames (`NZ.txt`) → `towns.json`.
3. `assign2.mjs`: which land unit belongs to which calling area → `unit_lica.json`, and `split.json`, the SA2s that straddle two areas.
4. `fetch_mb.mjs`: the meshblocks of the SA2s in `split.json` → `mb/`. Then `assign2.mjs` again with `WRITE=1` → `units_lica.geojson`.
5. `build.sh`: dissolve and simplify (mapshaper), move the Chatham Islands into an inset (`prep.mjs`), `tools/geo2quiz.mjs`, then `finish.mjs` adds names and number blocks and writes the quiz files.
6. `check.mjs`: every item of every kind has an area.

`run.sh` runs steps 4 (second half) to 6.

## Inputs written by hand (in this folder)

- `groups.json`: NAD's major calling areas and their minor ones (from the NAD "LICA Areas" PDF).
- `manual_seeds.json`: Milford Sound as a seed for Te Anau (Fiordland has no marker on the One NZ map).
- `fix_units.json`, `fix_ur.json`: Mangawhai Heads, Mangawhai Rural, Kaiwaka and Puhoi go to Warkworth, and one meshblock at Whangaehu to Whanganui. These rest on local knowledge of the numbers, not on a source.
- `skip_towns.json`: towns to leave out as seeds (none).
- `nad_geo.json`: the NAD number register (export of 2 October 2026) as `[area code, prefix, carrier, status, calling area]`. Made from `nad.csv` with a one-off command that was not kept.

## Only in the working folder

- `old/units.geojson`: the land units (Stats NZ SA2 2026, each with its area code) from the earlier five-code build. Its script was not kept.
- `onenz_lca.json`: border lines and markers read from One NZ's local calling map (`lca.js`). It is not open data, so it is not committed. It decides which unit belongs to which area; none of its geometry is in the quiz.
- `nad.csv`, `lica.pdf`, `NZ.txt`, `mb/`, `mb_ur.json` and every intermediate file.

## Sources

- NAD number register: https://www.nad.org.nz/number-register
- NAD LICA areas: https://www.nad.org.nz/assets/Uploads/LICA-Areas.pdf
- One NZ local calling map: https://one.nz/help/home-phone-wireless/local-calling-map/
- Stats NZ SA2 2026 and Meshblock Higher Geographies 2026 (CC BY 4.0)
- Wikipedia, "List of dialling codes in New Zealand"; GeoNames NZ (CC BY 4.0)
