#!/bin/bash
# The whole build, from the downloads in osm/, ukrt/, gn/, land/ to the files in quizzes/ukraine-codes.
set -e
cd "$(dirname "$0")"
REPO="$(cd ../../../.. && pwd)"
node codes_build.js | head -1                 # Ukrtelecom rows -> towns.json (canonical codes)
node assemble.js > asm.log 2>&1               # OSM relations -> units.json, towns placed in them
node build.js > build.log 2>&1; tail -12 build.log | cut -c1-160   # codes -> units, one area per code
(cd $REPO && node tools/geo2quiz.mjs --in "$OLDPWD/ukr_code_areas.geojson" --out quizzes/ukraine-codes --iso3 UKR --data-file fine.js --geo-file fine-geo.js --data-var FINE --geo-var FINE_GEO --props g --min-area 0.4 --note "The 561 local code areas: raions and cities of oblast significance as before the 2020 reform, merged where they share a code. Borders: OpenStreetMap contributors (ODbL), coast from OSM's simplified land polygons.")
node mkcodes.mjs | head -3                    # codes.js
node check.js
