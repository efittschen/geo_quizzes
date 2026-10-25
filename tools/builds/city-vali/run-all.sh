#!/bin/sh
# lloyd.py for every country of tools/cache/builds/city-vali/ccs.txt, five at a time, each as soon as its simulation
# is ready (simulate.log names its .bin); a country whose 100 level is done already is skipped.
#   sh tools/builds/city-vali/run-all.sh
cd "$(dirname "$0")/../../.."
W=tools/cache/builds/city-vali
if [ -n "$1" ]; then
  until grep -q "/$1_MovingWorld_200000.bin" $W/simulate.log 2>/dev/null; do sleep 15; done
  grep -q '"k": 100\|"towns": [0-9]' $W/$1_MovingWorld_200000_levels.json 2>/dev/null && [ -f $W/$1_levels.log ] && grep -q "^->" $W/$1_levels.log && exit 0
  tools/cache/venv/bin/python -u tools/builds/city-vali/lloyd.py $1 > $W/$1_levels.log 2>&1 && echo "$1 done" || echo "$1 FAILED"
  exit 0
fi
xargs -P 5 -n 1 sh "$0" < $W/ccs.txt
