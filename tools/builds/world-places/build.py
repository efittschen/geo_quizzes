# Easy to Hard (quizzes/world-places): MapTap's places of its past days (date, pos, name, lat, lng: from ./days.py)
# -> data/maps/world-places/cities.js for the city quiz (engine/types/city.js) on the plain map of the world.
#
#   python3 tools/builds/world-places/build.py maptap_cities.json [--out data/maps/world-places/cities.js]
#
# Every place as MapTap gives it: its name (descriptions too: "the deepest lake in the United States") and its point.
# An area without a point is placed at its centre (CENTRES); one without a centre here stops the run, and nothing is
# written. Each day's place is a place of its own, at that day's point and position (pos, 1 to 5: easy to hard), so
# one MapTap asked on five days is drawn five times as often (the user's choice, 2026-10-27): a round is one place of
# each position, no name twice (data/maps/world-places/points.js). The map is
# world.js's own (Natural Earth, Web Mercator): the page has no land of its own, the world is drawn under it.
# Each place's own country and continent (cc, ct: for the points' floors) are those of the world map at its point,
# or, where the point lies off every outline (a coast drawn coarser than the town on it: New York, Rio), those of the
# nearest outline within SNAP km (the user's choice, 2026-10-27); else none (Nauru, a point at sea).
import json, sys, os, math, hashlib, collections, argparse
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
a = argparse.ArgumentParser(); a.add_argument('places'); a.add_argument('--out', default=os.path.join(ROOT, 'data/maps/world-places/cities.js'))
o = a.parse_args()
CENTRES = {'Lake Baikal': (53.5, 108.2)}   # (the user's choice, 2026-10-27: the lake's centre)
SNAP = 25
src = json.load(open(o.places))
places = list(src['places'])
for ar in src.get('areas', []):
    if ar.get('highlight') not in CENTRES: sys.exit(f"STOP: no centre for the area {ar.get('highlight')!r} ({ar['date']}); nothing written")
    lat, lng = CENTRES[ar['highlight']]; places.append({**ar, 'lat': lat, 'lng': lng})

w = open(os.path.join(ROOT, 'data/maps/world/world.js'), encoding='utf-8').read()
W = json.loads(w[w.index('{'):w.rindex('}') + 1])
P = W['proj']; RAD = math.pi / 180
my = lambda lat: math.log(math.tan(math.pi / 4 + lat * RAD / 2)) / RAD
r1 = lambda v: round(v * 10) / 10
# the world map's places as rings of map points, with their code (the places without one: the country they lie in)
CODE = {'Somaliland': 'SO', 'Turkish Republic of Northern Cyprus': 'CY'}
REG = []
for r in W['reg']:
    code = r['i2'] if r.get('i2') and len(r['i2']) == 2 else CODE.get(r['n'])
    if not code: continue
    rings = [[tuple(map(float, q.split(','))) for q in part.replace('Z', '').split('L')] for part in r['d'].split('M') if part]
    xs, ys = [q[0] for g in rings for q in g], [q[1] for g in rings for q in g]
    REG.append((code, r['c'], (min(xs), min(ys), max(xs), max(ys)), rings))   # (the box of all its parts: world.js's b holds its main one only)
def inside(rings, x, y):
    s = False
    for pts in rings:
        j = len(pts) - 1
        for i in range(len(pts)):
            (xi, yi), (xj, yj) = pts[i], pts[j]
            if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: s = not s
            j = i
    return s
def seg(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay; t = 0 if not dx and not dy else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)
def country(x, y, lat):
    for code, ct, b, rings in REG:
        if b[0] <= x <= b[2] and b[1] <= y <= b[3] and inside(rings, x, y): return code, ct, 0
    per = 111.32 * math.cos(lat * RAD) / P['k']   # km to a map unit there (Mercator is true to shape)
    reach, best = SNAP / per, None
    for code, ct, b, rings in REG:
        if x < b[0] - reach or x > b[2] + reach or y < b[1] - reach or y > b[3] + reach: continue
        for pts in rings:
            for i in range(len(pts)):
                d = seg(x, y, *pts[i - 1], *pts[i])
                if d <= reach and (not best or d < best[2]): best = (code, ct, d)
    return (best[0], best[1], best[2] * per) if best else (None, None, None)

lst, SNAPPED, NONE = [], [], []
for p in sorted(places, key=lambda p: (p['date'], p['pos'])):
    name = p['name'].strip()
    lst.append({'id': 'm' + hashlib.sha1(f"{p['date']}|{p['pos']}|{name}".encode()).hexdigest()[:10], 'en': name, 'local': None, 'lang': None,
                'lat': p['lat'], 'lng': p['lng'], 'x': r1((p['lng'] - P['lng0']) * P['k']), 'y': r1((P['y0'] - my(p['lat'])) * P['k']),
                'pop': 0, 'adm': 'W', 'fc': None, 'pos': [p['pos']], 'date': p['date']})
    cc, ct, off = country(lst[-1]['x'], lst[-1]['y'], p['lat']); lst[-1].update(cc=cc, ct=ct)
    if off: SNAPPED.append((name, round(off, 1)))
    if not cc: NONE.append(name)
if len({c['id'] for c in lst}) != len(lst): sys.exit('STOP: two places of one day at one position; nothing written')
C = {'country': 'World', 'iso3': 'WLD', 'langs': [], 'w': W['w'], 'h': W['h'], 'kpu': W['kpu'], 'proj': P, 'land': '', 'lines': '',
     'regions': {'W': 'World'}, 'list': lst, 'span': 14917, 'world': True}
head = f"""// Easy to Hard: {len(lst)} places, those of MapTap's past days (maptap.gg, {min(p['date'] for p in places)} to {max(p['date'] for p in places)}), each by its name and at its point
// as MapTap gives them (an area at its centre), made by tools/builds/world-places/build.py. The map is world.js's own: no
// land here, the world is drawn under it (world: true). span: the D of the city quizzes' points formula for a map of the
// world, in km (unused: points.js scores a round). Each day's place is its own (a place MapTap asked on five days is
// here five times). Fields: id, en (the name), local, lang (none), lat/lng, x/y (map units of world.js), pop, adm, fc
// (none), pos ([its position on its day], 1 to 5: easy to hard), date (its day), cc, ct (its country and continent on
// the world map: at its point, else the nearest outline within {SNAP} km; null: none).
"""
os.makedirs(os.path.dirname(o.out), exist_ok=True)
open(o.out, 'w', encoding='utf-8').write(head + 'const CITIES = ' + json.dumps(C, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(f'{len(lst)} places, {len({c["en"] for c in lst})} names -> {os.path.relpath(o.out, ROOT)}')
print('places at each position:', [sum(1 for c in lst if k in c['pos']) for k in range(1, 6)])
print(f'off every outline, given the nearest within {SNAP} km:', len(SNAPPED), '| largest:', sorted(set(SNAPPED), key=lambda s: -s[1])[:6])
print('without a country:', len(NONE), sorted(set(NONE)))
