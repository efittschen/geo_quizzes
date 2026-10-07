#!/bin/bash
# op.sh <query-file> <out-file> [max-seconds-per-try] : one Overpass query, retried with pauses, alternating the two main servers
UA='GeoQuizzes/1.0 (https://github.com/efittschen/geo_quizzes)'
q="$1"; out="$2"; mt="${3:-300}"
hosts=(https://lambert.openstreetmap.de/api/interpreter https://gall.openstreetmap.de/api/interpreter https://overpass-api.de/api/interpreter)
for try in $(seq 1 24); do
  h=${hosts[$(( (try-1) % 3 ))]}
  code=$(curl -sS -m "$mt" -A "$UA" -o "$out.tmp" -w '%{http_code}' --data-urlencode "data@$q" "$h")
  if [ "$code" = 200 ] && head -c 200 "$out.tmp" | grep -q '"version"'; then
    if grep -q '"remark"' "$out.tmp"; then echo "try $try: remark: $(grep '"remark"' "$out.tmp" | head -c 300)"; else mv "$out.tmp" "$out"; echo "OK try $try $(wc -c < "$out") bytes $h"; exit 0; fi
  else echo "try $try: $h http $code $(sed 's/<[^>]*>//g' "$out.tmp" 2>/dev/null | grep -i 'error' | head -c 120)"; fi
  sleep $((15 + (try > 6 ? 45 : try * 5)))
done
echo FAILED; exit 1
