# Which neighbour tiles a country still needs after its spawn tiles ("the US strategy"): a spawn whose nearest good
# track (from sample.py) is farther than the edge of its own zoom-8 tile may have a closer one next door, so the
# adjacent tiles that its search circle reaches are listed. Writes <cc>_neighbours.json for tiles.py --tiles.
# Usage: python3 -I tools/builds/mapillary/neighbours.py <ISO2>
import json, math, glob, sys

CC = sys.argv[1].upper(); D = '/Users/elisabethfittschen/geoguessr/tools/cache/builds/mapillary'; n = 256
tx = lambda lon: (lon + 180) / 360 * n
ty = lambda lat: (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
have = {tuple(map(int, f.split('/')[-1][:-4].split('_')[1:])) for f in glob.glob(f'{D}/tiles8_{CC}/*.mvt')}
need, spawns = set(), 0
for p in json.load(open(f'{D}/{CC.lower()}_sample1000_qy.json')):
    lon, lat = p['spawn']; X, Y = tx(lon), ty(lat); x, y = int(X), int(Y)
    r = (p['spawn_km'] if p['spawn_km'] is not None else 1e9) / (40075 * math.cos(math.radians(lat)) / n)   # in tile widths
    if r <= min(X - x, x + 1 - X, Y - y, y + 1 - Y): continue
    spawns += 1
    for i in (x - 1, x, x + 1):
        for j in (y - 1, y, y + 1):
            cx, cy = min(max(X, i), i + 1), min(max(Y, j), j + 1)
            if (cx - X) ** 2 + (cy - Y) ** 2 <= r * r: need.add((i, j))
json.dump(sorted(need - have), open(f'{D}/{CC.lower()}_neighbours.json', 'w'))
print(f'{CC}: {spawns} spawns may have a closer track next door; {len(need - have)} neighbour tiles to fetch')
