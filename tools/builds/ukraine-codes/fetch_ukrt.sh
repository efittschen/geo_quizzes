#!/bin/bash
UA='GeoQuizzes/1.0 (https://github.com/efittschen/geo_quizzes)'
cd "$(dirname "$0")"
grep -E '/code(/print)?\?q=&qa=%(A|B|C[0-9A-F]|D[0-9A-F])[0-9A-F]?&region=&page=[0-9]' cdx.txt | grep -v '%C2%AE' | while read ts url len; do
  key=$(echo "$url" | sed -E 's/.*code(\/print)?\?q=&qa=%([0-9A-F]+)&region=&page=([0-9]+)/\2_p\3\1/; s/\/print/_print/')
  out="ukrt/$key.html"
  [ -s "$out" ] && continue
  for try in 1 2 3; do
    code=$(curl -sS -m 90 -L -A "$UA" -H 'Accept-Encoding: identity' -o "$out" -w '%{http_code}' "https://web.archive.org/web/${ts}id_/${url}")
    [ "$code" = 200 ] && break
    rm -f "$out"; sleep 8
  done
  echo "$key $code $(wc -c < "$out" 2>/dev/null)"
  sleep 2
done
echo DONE
