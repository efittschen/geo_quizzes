#!/bin/zsh
# Rebuilds every postcode quiz: post.js (and data.js where the zones have their own map) in data/maps/<quiz id>/, the hint
# colours in data/quizzes/<quiz id>/hints.css. --out takes the quiz id, --base and --voronoi the name of a map in data/maps/.
# Each quiz's post.js also records its own command. Costa Rica, Guatemala and Singapore are quizzes of the map type: their
# local scripts named below move the post.js out of data/maps/ into their build's inputs/ and write the quiz out
# (data/quizzes/<quiz id>/settings.js, names.js, facts.js) from it. The local scripts' shared paths and page parts:
# tools/cache/builds/common/layout.mjs.
cd "$(dirname "$0")/../../.."
T="node tools/postcodes.mjs"
run() { echo "=== $*"; $=T "$@" 2>&1 | tail -6; }
echo "=== Germany: own map from the OpenStreetMap postcode areas"; node tools/builds/germany-postcodes/build.mjs 2>&1 | tail -6
run --cc ES --out spain-postcodes --base spain-regions --levels 2
run --cc IT --out italy-postcodes --base italy-regions --levels 1,2
run --cc PT --out portugal-postcodes --base portugal-regions --levels 1,2 --mask '####-###'
run --cc NO --out norway-postcodes --base norway-regions --levels 1,2 --parent fy
run --cc FI --out finland-postcodes --base finland-regions --levels 1,2 --parent reg
run --cc SE --out sweden-postcodes --base sweden-regions --levels 1,2 --parent lan --mask '### ##'
run --cc PL --out poland-postcodes --base poland-regions --levels 1,2 --mask '##-###'
run --cc AT --out austria-postcodes --base austria-codes --levels 1,2
run --cc JP --out japan-postcodes --base japan-codes --levels 1,2 --mask '###-####'
run --cc TH --out thailand-postcodes --base thailand-regions --levels 1,2
run --cc IN --out india-pin --base india-districts --levels 1,2,3 --parent st
run --cc MY --out malaysia-postcodes --base malaysia-codes --levels 1,2 --parent state
run --cc ID --out indonesia-postcodes --base indonesia-regions --levels 1,2,3 --parent p
run --cc BD --out bangladesh-postcodes --base bangladesh-regions --levels 1,2 --match 5:name --alias 'Narshingdi=Narsingdi,Bagherhat=Bagerhat,Jessore=Jashore,Jinaidaha=Jhenaidah,Kustia=Kushtia,Bogra=Bogura,Chapinawabganj=Chapai Nawabganj,Chittagong=Chattogram,Comilla=Cumilla,Khagrachari=Khagrachhari,Jhalokathi=Jhalokati,Hobiganj=Habiganj,Netrakona=Netrokona'
run --cc KE --out kenya-postcodes --base kenya-regions --levels 1,3 --head --parent county
# UK: every unit postcode (1.8 million), not only the outward codes: the lines between areas are then right to the street.
# Drawn finer than the others (--min-area), for the small areas of central London.
run --cc GB --full --out united-kingdom-postcodes --voronoi united-kingdom-regions --prefix '^[A-Z]{1,2}' --skip '^(GY|JE|IM)' --min-area 0.3
run --cc KR --out south-korea-postcodes --voronoi south-korea-codes --levels 1,2,3 --frames base:sido
# US, Australia: whole zones are PO boxes or single organisations there. The lists of postcodes with an area of their own
# (Census Bureau ZIP Code Tabulation Areas, ABS Postal Areas) say which zones are land.
node tools/builds/postcodes/areas.mjs US AU
run --cc US --out us-zip --voronoi us-cities --levels 1,2,3 --need-region --frames ne --areas tools/cache/builds/postcode-areas/US.txt
run --cc AU --out australia-postcodes --voronoi australia-cities --levels 1,2 --frames ne --areas tools/cache/builds/postcode-areas/AU.txt
run --cc CA --out canada-postcodes --voronoi canada-cities --prefix '^[A-Z]' --frames ne

# Brazil: GeoNames has one postcode per municipality there, too thin for zones inside a state. The points come from
# Czechia and Slovakia (2026-10-20): zones by nearest postcode within each kraj; Slovakia without its PO-box and large-customer codes.
run --cc CZ --out czechia-postcodes --voronoi czechia-regions --levels 1,2,3 --mask '### ##' --frames base:kraj
run --cc SK --out slovakia-postcodes --voronoi slovakia-regions --levels 1,2,3 --mask '### ##' --frames base:kraj --skip '^(81[02-9]|82[02-9]|83[03-9]|84[02-4]|85[03-4]|04[23]|912|012)'

# Croatia (zones on its municipalities) and Slovenia (GURS postal areas, CC BY 4.0: data/maps/slovenia-postcodes/data.js made first by
# geo2quiz from tools/cache/builds/croatia-slovenia/si/posta.geojson; geo2quiz writes a map split, so then
# `node tools/cache/builds/common/layout.mjs data-js slovenia-postcodes` for the data.js the page loads), 2026-10-21.
# The pages: tools/cache/builds/croatia-slovenia/scripts/hr-post-page.mjs, si-post-page.mjs.
run --cc HR --out croatia-postcodes --base croatia-regions --levels 1,2,3 --parent cty
run --cc SI --out slovenia-postcodes --base slovenia-postcodes --levels 1,2,3 --points tools/cache/builds/croatia-slovenia/si/posta-points.tsv --source 'GURS, Register prostorskih enot: postal areas (poštni okoliši), CC BY 4.0'

# Denmark (2026-10-21): two levels only (GeoNames has one point per postcode); afterwards
# tools/cache/builds/ie-dk-scripts/denmark-postcodes.mjs sets the Danish names again.
run --cc DK --out denmark-postcodes --voronoi denmark-regions --levels 1,2 --skip '^0'

# Serbia, North Macedonia and Montenegro (2026-10-21; each followed by the name-fix step of tools/cache/builds/rs-me-mk/run.sh).
run --cc RS --out serbia-postcodes --base serbia-regions --levels 1,2,3 --parent okr
run --cc MK --out north-macedonia-postcodes --base north-macedonia-regions --levels 1,2,3 --parent reg
node tools/cache/builds/rs-me-mk/scripts/me-post-points.mjs
run --cc ME --points tools/cache/builds/rs-me-mk/me/post-points.txt --source 'Pošta Crne Gore: its post offices and their numbers (postacg.me, October 2026), each at its place (OpenStreetMap)' --keep-all --out montenegro-postcodes --voronoi montenegro-regions --frames base:id --levels 2,3,4 --mask '#####'

# Estonia, Latvia, Lithuania (2026-10-21): first `node tools/cache/builds/baltics/post-points.mjs <estonia|latvia|lithuania>`
# (the points files), after each run `node tools/cache/builds/baltics/fix-post.mjs <country>` (local names).
run --cc EE --out estonia-postcodes --voronoi estonia-regions --levels 1,2,3 --frames base:id --skip '^19' --points tools/cache/builds/estonia/dl/post-points.txt --source 'GeoNames postal codes (CC BY 4.0); the postcodes GeoNames lacks (Narva 20xxx, 21xxx and 174 in all) from OpenStreetMap addresses (ODbL); without 19086 (a campus of its own)'
run --cc LV --out latvia-postcodes --voronoi latvia-regions --levels 1,2,3 --mask 'LV-####' --frames base:nov --points tools/cache/builds/latvia/dl/post-points.txt --source 'OpenStreetMap addresses with their postcode (addr:postcode, ODbL)'
run --cc LT --out lithuania-postcodes --voronoi lithuania-regions --levels 1,2,3 --frames base:id --points tools/cache/builds/lithuania/dl/post-points.txt --source 'OpenStreetMap addresses with their postcode (addr:postcode, ODbL), without the post offices own codes (third digit 0) and stray tags'

# Iceland, Luxembourg, Malta, Cyprus (2026-10-21): the points of Iceland and Cyprus first (tools/cache/builds/iceland/
# iceland-post-points.mjs, cyprus/cyprus-post-points.mjs; Luxembourg's "L-" strip is in tools/cache/builds/small4/run.sh),
# after each run tools/cache/builds/small4/scripts/fix-post.mjs <country> (names as on signs).
run --cc IS --out iceland-postcodes --voronoi iceland-regions --levels 1,2,3 --points tools/cache/builds/iceland/post/IS.txt --source 'addresses on OpenStreetMap (from Staðfangaskrá), ODbL'
run --cc LU --out luxembourg-postcodes --base luxembourg-regions --levels 1,2 --mask 'L-####' --points tools/cache/builds/luxembourg/post/LU.txt --source 'GeoNames postal codes, CC BY 4.0'
run --cc MT --out malta-postcodes --base malta-regions --prefix '^[A-Z]{3}' --skip '^(MTP|SCM)$'
run --cc CY --out cyprus-postcodes --base cyprus-regions --levels 1,2 --parent ds --skip '^(13|33)' --points tools/cache/builds/cyprus/post/CY.txt --source 'GeoNames postal codes, CC BY 4.0'

# Uruguay (Correo Uruguayo's postal code areas, made first by tools/cache/builds/uy-pa-cr-gt/scripts/uy-cp.mjs and postcodes.mjs),
# Costa Rica (INEC district codes = Correos postcodes), Guatemala (GeoNames on its municipios), 2026-10-21;
# afterwards: node tools/cache/builds/uy-pa-cr-gt/scripts/post-names.mjs && node tools/cache/builds/uy-pa-cr-gt/scripts/post2layers.mjs
# (Costa Rica and Guatemala are of the map type: post-names.mjs moves their post.js to tools/cache/builds/uy-pa-cr-gt/inputs/
# and names the zones there, post2layers.mjs writes their recipes, quiz files and pages)
run --cc UY --out uruguay-postcodes --base uruguay-postcodes --levels 1,2,3 --points tools/cache/builds/uy-pa-cr-gt/dl/uy/cp-points.tsv --source 'Correo Uruguayo, Código Postal (August 2023; Licencia de Datos Abiertos de Uruguay)'
run --cc CR --out costa-rica-postcodes --base costa-rica-postcodes --levels 1,3,5 --points tools/cache/builds/uy-pa-cr-gt/dl/cr/district-points.tsv --source "INEC's district codes (División Territorial Administrativa), the postcodes of Correos de Costa Rica"
run --cc GT --out guatemala-postcodes --base guatemala-regions --levels 2,5 --match 2:name --skip '000$' --parent dep

# Kyrgyzstan (Kyrgyz Pochtasy's offices) and Mongolia (the CRC's zone code of every soum), 2026-10-21; after each run the
# name fix of tools/cache/builds/ge-kg-mn/run.sh (post-names.mjs, then post-fix.mjs).
node tools/cache/builds/ge-kg-mn/scripts/kg-post-points.mjs
run --cc KG --points tools/cache/builds/ge-kg-mn/kg/post-points.txt --source 'Kyrgyz Pochtasy: its post offices with their postcodes and places (post.kg, October 2026)' --out kyrgyzstan-postcodes --base kyrgyzstan-regions --levels 3,4 --parent reg
node tools/cache/builds/ge-kg-mn/scripts/mn-post-points.mjs
run --cc MN --points tools/cache/builds/ge-kg-mn/mn/post-points.txt --source 'Communications Regulatory Commission of Mongolia: the zone code of every soum and district of Ulaanbaatar (zipcode.mn, October 2026), each on its area' --out mongolia-postcodes --base mongolia-regions --levels 1,2,5 --parent reg

# Tunisia, Eswatini, Lesotho (2026-10-21): the points first (tools/cache/builds/tn-bw-sz-ls/scripts/tn-post-points.mjs,
# sz-ls-post-points.mjs), after the runs tn-post-fix.mjs and sz-ls-post-fix.mjs (names).
run --cc TN --out tunisia-postcodes --base tunisia-regions --levels 2,4 --head --parent gov --points tools/cache/builds/tn-bw-sz-ls/dl/post/TN.txt --source 'La Poste Tunisienne, postcode lookup (copy of 2015)'
run --cc SZ --out eswatini-postcodes --voronoi eswatini-regions --prefix '^[HMLS]' --keep-all --points tools/cache/builds/tn-bw-sz-ls/dl/post/SZ.txt --source 'Eswatini Post, postcode list (2026)'
run --cc LS --out lesotho-postcodes --voronoi lesotho-regions --levels 1 --keep-all --points tools/cache/builds/tn-bw-sz-ls/dl/post/LS.txt --source 'Lesotho Post, post offices (2018)'

# Albania (Posta Shqiptare's offices) and Bosnia and Herzegovina (the three operators' lists), 2026-10-21; Albania's names after:
# node tools/cache/builds/al-ba-ad-sm-li/scripts/post-fix.mjs data/maps/albania-postcodes '{"Tirana":"Tiranë","Kopliku i Siperm":"Koplik i Sipërm"}'
run --cc AL --out albania-postcodes --base albania-regions --levels 1,2 --parent qk --points tools/cache/builds/al-ba-ad-sm-li/al/post-points.txt --source "Posta Shqiptare: its post offices and their codes (postashqiptare.al, Kodi postar, October 2026), at GeoNames' point for the code (CC BY 4.0) or at the place the office is named after"
run --cc BA --out bosnia-and-herzegovina-postcodes --base bosnia-and-herzegovina-regions --levels 1,2,3 --match 5:name --parent gk --points tools/cache/builds/al-ba-ad-sm-li/ba/post-points.txt --source "the three operators' lists: Pošte Srpske's Usmjerivač BiH (December 2025: every settlement with its delivery post office and municipality), BH Pošta's and Pošte Srpske's office maps and HP Mostar's office search (October 2026); each code at its place (GeoNames, CC BY 4.0, or the operator's office point)"

# Singapore (GeoNames, each point of land to its nearest postcode; then tools/cache/builds/rw-ug-la-sg-cn/scripts/singapore-postcodes.mjs
# writes the zones' map split (data/maps/singapore-postcodes/shapes.js), moves post.js to that build's inputs/, writes
# the quiz of the map type from its recipe and the page) and China (first digit and two digits only: GeoNames puts most
# codes at their prefecture's centre; the page: tools/cache/builds/rw-ug-la-sg-cn/scripts/china-postcodes.mjs), 2026-10-21.
run --cc SG --out singapore-postcodes --voronoi singapore-regions --levels 1,2 --skip '^(88|91)'
run --cc CN --out china-postcodes --base china-regions --levels 1,2 --parent pv

# Jordan (Jordan Post's offices), 2026-10-21; then tools/cache/builds/arab5/jordan/postcodes.mjs (names, page).
run --cc JO --out jordan-postcodes --base jordan-regions --levels 1,2 --points tools/cache/builds/arab5/jordan/post/JO.txt --source 'Jordan Post offices, opendata.gov.jo (Jordanian Open Government Data License)'

# Nepal (the GPO's codes of 2025, one per local level = province, district, local level), 2026-10-21: a quiz of the map type on
# data/maps/nepal-regions, no tools/postcodes.mjs
node tools/cache/builds/np-bt/scripts/nepal-postcodes.mjs
# Bhutan (Bhutan Post's 38 post offices on the gewogs), 2026-10-21: writes the points, runs
# tools/postcodes.mjs --cc BT --points tools/cache/builds/np-bt/dl/btn/post-points.txt --out bhutan-postcodes --base bhutan-regions --levels 1,2,5 --parent dc --keep-all, then names the zones
node tools/cache/builds/np-bt/scripts/bhutan-postcodes.mjs

# the address register of the 2022 census (IBGE, CNEFE: 111 million addresses with their CEP), 3.7 GB to download.
node tools/builds/postcodes/brazil-cnefe.mjs cells
node tools/builds/postcodes/brazil-cnefe.mjs points
run --cc BR --out brazil-postcodes --voronoi brazil-cities --levels 1,2,3 --mask '#####-###' --frames ne --points tools/cache/builds/brazil-cep/BR.txt --source 'IBGE, CNEFE: the address register of the 2022 census'
node tools/builds/postcodes/brazil-cnefe.mjs counts data/maps/brazil-postcodes/post.js

# Czechia's and Slovakia's places and regions under the names the countries use (Praha, Plzeň, Banskobystrický kraj)
node tools/builds/postcodes/czsk-names.mjs
