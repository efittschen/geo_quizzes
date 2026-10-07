#!/bin/zsh
# Rebuilds every postcode quiz (post.js, style.css, and data.js + geo.js where the zones have their own map).
# Each quiz's post.js also records its own command.
cd "$(dirname "$0")/../../.."
T="node tools/postcodes.mjs"
run() { echo "=== $*"; $=T "$@" 2>&1 | tail -6; }
run --cc DE --out quizzes/germany-postcodes --base quizzes/germany-codes --levels 1,2,3 --need-accuracy --skip '^11'
run --cc ES --out quizzes/spain-postcodes --base quizzes/spain-regions --levels 2
run --cc IT --out quizzes/italy-postcodes --base quizzes/italy-regions --levels 1,2
run --cc PT --out quizzes/portugal-postcodes --base quizzes/portugal-regions --levels 1,2 --mask '####-###'
run --cc NO --out quizzes/norway-postcodes --base quizzes/norway-regions --levels 1,2 --parent fy
run --cc FI --out quizzes/finland-postcodes --base quizzes/finland-regions --levels 1,2 --parent reg
run --cc SE --out quizzes/sweden-postcodes --base quizzes/sweden-regions --levels 1,2 --parent lan --mask '### ##'
run --cc PL --out quizzes/poland-postcodes --base quizzes/poland-regions --levels 1,2 --mask '##-###'
run --cc AT --out quizzes/austria-postcodes --base quizzes/austria-codes --levels 1,2
run --cc JP --out quizzes/japan-postcodes --base quizzes/japan-codes --levels 1,2 --mask '###-####'
run --cc TH --out quizzes/thailand-postcodes --base quizzes/thailand-regions --levels 1,2
run --cc IN --out quizzes/india-pin --base quizzes/india-districts --levels 1,2,3 --parent st
run --cc MY --out quizzes/malaysia-postcodes --base quizzes/malaysia-codes --levels 1,2 --parent state
run --cc ID --out quizzes/indonesia-postcodes --base quizzes/indonesia-regions --levels 1,2,3 --parent p
run --cc BD --out quizzes/bangladesh-postcodes --base quizzes/bangladesh-regions --levels 1,2 --match 5:name --alias 'Narshingdi=Narsingdi,Bagherhat=Bagerhat,Jessore=Jashore,Jinaidaha=Jhenaidah,Kustia=Kushtia,Bogra=Bogura,Chapinawabganj=Chapai Nawabganj,Chittagong=Chattogram,Comilla=Cumilla,Khagrachari=Khagrachhari,Jhalokathi=Jhalokati,Hobiganj=Habiganj,Netrakona=Netrokona'
run --cc KE --out quizzes/kenya-postcodes --base quizzes/kenya-regions --levels 1,3 --head --parent county
# UK: every unit postcode (1.8 million), not only the outward codes: the lines between areas are then right to the street.
# Drawn finer than the others (--min-area), for the small areas of central London.
run --cc GB --full --out quizzes/united-kingdom-postcodes --voronoi quizzes/united-kingdom-regions --prefix '^[A-Z]{1,2}' --skip '^(GY|JE|IM)' --min-area 0.3
run --cc KR --out quizzes/south-korea-postcodes --voronoi quizzes/south-korea-codes --levels 1,2,3 --frames base:sido
# US, Australia: whole zones are PO boxes or single organisations there. The lists of postcodes with an area of their own
# (Census Bureau ZIP Code Tabulation Areas, ABS Postal Areas) say which zones are land.
node tools/builds/postcodes/areas.mjs US AU
run --cc US --out quizzes/us-zip --voronoi quizzes/us-cities --levels 1,2,3 --need-region --frames ne --areas tools/cache/builds/postcode-areas/US.txt
run --cc AU --out quizzes/australia-postcodes --voronoi quizzes/australia-cities --levels 1,2 --frames ne --areas tools/cache/builds/postcode-areas/AU.txt
run --cc CA --out quizzes/canada-postcodes --voronoi quizzes/canada-cities --prefix '^[A-Z]' --frames ne

# Brazil: GeoNames has one postcode per municipality there, too thin for zones inside a state. The points come from
# the address register of the 2022 census (IBGE, CNEFE: 111 million addresses with their CEP), 3.7 GB to download.
node tools/builds/postcodes/brazil-cnefe.mjs cells
node tools/builds/postcodes/brazil-cnefe.mjs points
run --cc BR --out quizzes/brazil-postcodes --voronoi quizzes/brazil-cities --levels 1,2,3 --mask '#####-###' --frames ne --points tools/cache/builds/brazil-cep/BR.txt --source 'IBGE, CNEFE: the address register of the 2022 census'
node tools/builds/postcodes/brazil-cnefe.mjs counts quizzes/brazil-postcodes/post.js
