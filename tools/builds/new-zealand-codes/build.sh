#!/bin/sh
# units_lica.geojson (assign2.mjs with WRITE=1) -> quizzes/new-zealand-codes/data.js + geo.js
# Run inside the working folder (tools/builds/new-zealand-codes/run.sh puts the scripts there).
set -e
D="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$D/../../../.." && pwd)"
MS="npx --yes mapshaper"
cd "$D"
$MS units_lica.geojson -clean -dissolve2 lica copy-fields=code -clean -o lica_raw.geojson precision=0.00001 2>&1 | grep -v deprecated | tail -2
$MS lica_raw.geojson -simplify dp interval=60 keep-shapes -clean -o lica_s.geojson precision=0.00001 2>&1 | tail -1
node prep.mjs > /dev/null
(cd "$REPO" && node tools/geo2quiz.mjs --in "$D/lica_inset.geojson" --out "$D/out" --iso3 NZL --props lica,code,main --no-context | tail -1)
node finish.mjs
