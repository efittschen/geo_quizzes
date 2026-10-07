#!/bin/bash
cd "$(dirname "$0")"
UA='GeoQuizzes/1.0 (https://github.com/efittschen/geo_quizzes)'
for i in 1 2 3 4 5 6; do
  [ -s osm/r$i.json ] && continue
  [ -f osm/q$i.txt ] || continue
  for try in 1 2 3 4; do
    code=$(curl -sS -m 400 -A "$UA" -o osm/r$i.json.tmp -w '%{http_code}' --data-urlencode "data@osm/q$i.txt" 'https://overpass.openstreetmap.fr/api/interpreter')
    if [ "$code" = 200 ] && head -c 200 osm/r$i.json.tmp | grep -q '"version"' && ! grep -q '"remark"' osm/r$i.json.tmp; then mv osm/r$i.json.tmp osm/r$i.json; echo "OK $i try $try $(wc -c < osm/r$i.json)"; break; fi
    echo "chunk $i try $try: http $code $(grep '"remark"' osm/r$i.json.tmp | head -c 200)"; sleep 30
  done
  sleep 10
done
echo ALLDONE
