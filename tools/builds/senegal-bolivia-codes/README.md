# Senegal and Bolivia: where each prefix is used

Neither country publishes which place each landline prefix belongs to, so the finer levels of `quizzes/senegal-codes` and `quizzes/bolivia-codes` were worked out from published numbers. These scripts count them; the resulting tables were then written by hand into `quizzes/senegal-regions/quiz.js` and `quizzes/bolivia-codes/quiz.js`.

Run them inside the working folder `tools/cache/builds/senegal-bolivia-codes/` (copy the scripts there), which holds the downloads.

- `pip.mjs`: which department of the quiz map a coordinate lies in.
- `sn_osm.mjs`, `sn_osm2.mjs`: OpenStreetMap phone numbers in Senegal (`osm_SN.json`, Overpass) by exchange and department → `sn_osm_tab.json`.
- `bo_osm.mjs`: the same for Bolivia (`osm_BO.json`) → `bo_osm_tab.json`.
- `bo_parse.mjs`: the ITU communication of 26.IX.2001 for Bolivia (`itu_bo_s.txt`) → `bo_rows.json`.

Only in the working folder: the downloaded pages and PDFs (ARTP and ITU plans, ministry directories, pharmacy lists, ANSD reports) and their text.

## Sources

- ITU national numbering plans: Senegal (+221), Bolivia (+591)
- ARTP, plan national de numérotation 2012; ATT, Plan Técnico Fundamental de Numeración 2021
- Ministère de la Justice du Sénégal directories; ANSD regional reports; pharmacy list 2021
- OpenStreetMap contributors (ODbL)
