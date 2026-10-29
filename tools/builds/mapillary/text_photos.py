# Which picked photos may show text: Mapillary detected a sign, banner, traffic sign or text marking facing the camera
# (labels object--sign*, object--banner*, *traffic-sign*, regulatory--*, warning--*, information--*, complementary--*,
# *text*; not those seen from behind, *back, nor bare frames, object--support--*). This reproduces Kenya's 501 exactly.
# Usage: python3 -I tools/builds/mapillary/text_photos.py <ISO2>
# Reads <CC>_picked_qy.json and <CC>_detections.json; writes <CC>_text_photos.json ([{id, pano, ...photo fields}]).
import json, re, sys

CC = sys.argv[1].upper()
D = '/Users/elisabethfittschen/geoguessr/tools/cache/builds/mapillary'
RX = r'object--sign|object--banner|traffic-sign|^regulatory|^warning|^information|^complementary|text'
ok = lambda l: re.search(RX, l) and not re.search(r'back$|^object--support', l)
picked = json.load(open(f'{D}/{CC}_picked_qy.json'))
det = json.load(open(f'{D}/{CC}_detections.json'))
photos = {str(p['photo']['id']): p['photo'] for p in picked if p['photo']}
missing = [i for i in photos if i not in det]
if missing: sys.exit(f'{CC}: {len(missing)} picked photos have no detections fetched; fetch them first')
sel = [dict(photos[i], id=i, pano=bool(photos[i]['pano'])) for i in photos if any(ok(l) for l in det[i]['counts'])]
json.dump(sel, open(f'{D}/{CC}_text_photos.json', 'w'))
print(f'{CC}: {len(photos)} picked photos, {len(sel)} may show text ({sum(p["pano"] for p in sel)} of them 360°)')
