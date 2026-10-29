#!/bin/bash
# Crop part of an original Mapillary photo for viewing.
# Usage: crop.sh <photo id> <left> <top> <right> <bottom>   (fractions 0-1 of the photo)
# Prints the path of the crop: at most 1568 px on its long side, small crops enlarged to 1000 px.
set -e
ORIG=/Users/elisabethfittschen/geoguessr/tools/cache/builds/mapillary/originals/$1.jpg
OUT=/Users/elisabethfittschen/geoguessr/tools/cache/builds/mapillary/crops
[ -f "$ORIG" ] || { echo "ERROR: no original for $1" >&2; exit 1; }
read W H < <(sips -g pixelWidth -g pixelHeight "$ORIG" | awk '/pixelWidth/{w=$2} /pixelHeight/{h=$2} END{print w, h}')
read X Y CW CH < <(awk -v w=$W -v h=$H -v l=$2 -v t=$3 -v r=$4 -v b=$5 'BEGIN{
  if (l<0||t<0||r>1||b>1||r<=l||b<=t) { print "bad"; exit }
  x=int(l*w); y=int(t*h); printf "%d %d %d %d\n", x, y, int(r*w)-x, int(b*h)-y }')
[ "$X" != bad ] || { echo "ERROR: give 0 <= left < right <= 1 and 0 <= top < bottom <= 1" >&2; exit 1; }
mkdir -p "$OUT"
F="$OUT/$1_$(date +%s%N | cut -c1-16)_$RANDOM.jpg"
sips -c "$CH" "$CW" --cropOffset "$Y" "$X" "$ORIG" --out "$F" >/dev/null
L=$(( CW > CH ? CW : CH ))
if [ "$L" -gt 1568 ]; then sips -Z 1568 "$F" >/dev/null; elif [ "$L" -lt 1000 ]; then sips -Z 1000 "$F" >/dev/null; fi
echo "$F  (original pixels: ${CW}x${CH} of ${W}x${H})"
