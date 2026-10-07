# One-off builds

Scripts that built one quiz's map or tables and are not general tools. Each folder holds the scripts and the small inputs that were written by hand. Downloads and intermediate files are large and live in `tools/cache/builds/<name>/`, which is not committed; `run.sh` copies the scripts there and runs them in that folder.

- `new-zealand-codes/`: the 102 local calling areas of `quizzes/new-zealand-codes`.
- `ukraine-codes/`: the 561 local code areas and the code list of `quizzes/ukraine-codes`.
- `senegal-bolivia-codes/`: the number counts behind the finer levels of `quizzes/senegal-codes` and `quizzes/bolivia-codes` (analysis only; the tables themselves are in the quiz configs).
- `postcodes/build-all.sh`: the `tools/postcodes.mjs` command of every postcode quiz.
- `postcodes/areas.mjs`: the postcodes that have an area of their own (US: Census Bureau ZIP Code Tabulation Areas; Australia: ABS Postal Areas), for `tools/postcodes.mjs --areas`.
- `postcodes/brazil-cnefe.mjs`: Brazil's postcodes with their place on the map, from the address register of the 2022 census (IBGE, CNEFE; 3.7 GB of downloads), as points for `tools/postcodes.mjs --points`.
- `code-zones/build.mjs`: the maps of `quizzes/bolivia-codes`, `quizzes/senegal-codes` and `quizzes/kazakhstan-codes`, where several codes lay on one department or district: each code gets the land nearest to the places it is known in (`<cc>.tsv`), inside the old area's border.
- `us-counties/build.mjs`: the county map and the data of `quizzes/us-states` (states and their 3,143 counties), from the Census Bureau's 2021 cartographic boundaries.
- `town-names/choose.mjs`: which parts of town names the quizzes ask, over all countries at once: `places.mjs` and `ratio.py` (smoothed ratio maps, Python) per country, then the 500 best by split × share → `tools/cache/builds/town-names/chosen.json`; run before `build.mjs`. `countries.mjs`: the countries and their codes.
- `town-names/build.mjs`: `tools/townnames.mjs` for every country with a cities quiz (the parts from `chosen.json`), plus each quiz's page and its entry in `data/quizzes.json`.
- `town-names/india-places.mjs`: India's own list of places for its town-name quiz (village register + habitations) → `tools/cache/places_IN.tsv`; run before `build.mjs india`.
