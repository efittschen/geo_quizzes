#!/bin/bash
cd "$(dirname "$0")"
for i in 0 1 2 3 4 5; do
  [ -s osm/r$i.json ] && continue
  ./op.sh osm/q$i.txt osm/r$i.json 400
  sleep 15
done
echo ALLDONE; ls -la osm
