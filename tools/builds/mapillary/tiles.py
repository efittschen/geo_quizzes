# Download Mapillary coverage tiles (sequence lines, with captured_at and quality_score) for one country.
# Usage: python3 -I tiles.py <ISO2> <zoom> [--list] [--spawn-tiles] [--tiles <file.json>]
#   --list only counts the tiles, sends nothing; --spawn-tiles only the tiles holding the 1000 sampled spawns;
#   --tiles a JSON list of [x, y] to fetch instead. Downloads run 20 at a time.
# Tiles go to tools/cache/builds/mapillary/tiles<zoom>_<ISO2>/<z>_<x>_<y>.mvt; existing ones are kept.
import json, math, os, sys, subprocess, time

ROOT = '/Users/elisabethfittschen/geoguessr/tools/cache'
cc, z = sys.argv[1], int(sys.argv[2])
ne = json.load(open(f'{ROOT}/ne_10m_admin_0_countries.geojson'))
f = next(f for f in ne['features'] if cc in (f['properties'].get('ISO_A2'), f['properties'].get('ISO_A2_EH')))   # France and Norway are -99 in ISO_A2
polys = f['geometry']['coordinates'] if f['geometry']['type'] == 'MultiPolygon' else [f['geometry']['coordinates']]

def tx(lon): return int((lon + 180) / 360 * 2 ** z)
def ty(lat): return int((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * 2 ** z)
def lon_of(x): return x / 2 ** z * 360 - 180
def lat_of(y): return math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / 2 ** z))))

def inside(lon, lat, ring):
    c, j = False, len(ring) - 1
    for i in range(len(ring)):
        (xi, yi), (xj, yj) = ring[i], ring[j]
        if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi: c = not c
        j = i
    return c

tiles = set()
if '--spawn-tiles' not in sys.argv and '--tiles' not in sys.argv:   # the whole country (slow for huge outlines)
    for poly in polys:
        ring = poly[0]
        lons, lats = [p[0] for p in ring], [p[1] for p in ring]
        for x in range(tx(min(lons)), tx(max(lons)) + 1):
            for y in range(ty(max(lats)), ty(min(lats)) + 1):
                # keep the tile if the border passes through it or a 5x5 grid point of it lies inside
                if any(tx(lo) == x and ty(la) == y for lo, la in ring) or any(
                    inside(lon_of(x + i / 4), lat_of(y + j / 4), ring) for i in range(5) for j in range(5)):
                    tiles.add((x, y))
if '--spawn-tiles' in sys.argv:   # only the tiles holding the 1000 sampled spawns of sample.py (seed 7); needs numpy
    import numpy as np
    ll = np.fromfile(f'{ROOT}/builds/city-vali/{cc}_MovingWorld_200000.bin', dtype=np.float32).reshape(-1, 2).astype(float)
    S = ll[np.random.default_rng(7).choice(len(ll), 1000, replace=False)]
    tiles = {(tx(lon), ty(lat)) for lat, lon in S}
if '--tiles' in sys.argv: tiles = {tuple(t) for t in json.load(open(sys.argv[sys.argv.index('--tiles') + 1]))}
print(f'{cc} zoom {z}: {len(tiles)} tiles')
if '--list' in sys.argv: sys.exit()

out = f'{ROOT}/builds/mapillary/tiles{z}_{cc}'
os.makedirs(out, exist_ok=True)
token = open(f'{ROOT}/mapillary-token').read().strip()
def get(t):
    x, y = t; path = f'{out}/{z}_{x}_{y}.mvt'
    if not os.path.exists(path):
        url = f'https://tiles.mapillary.com/maps/vtp/mly1_public/2/{z}/{x}/{y}?access_token={token}'
        for attempt in range(3):   # Mapillary's tile server sometimes times out; a tile is kept only when complete
            r = subprocess.run(['curl', '-sf', '--max-time', '120', '-o', path + '.part', url])
            if not r.returncode: break
            if os.path.exists(path + '.part'): os.remove(path + '.part')
            time.sleep(5 * (attempt + 1))
        else:
            print('failed after 3 tries', x, y); return 0
        os.rename(path + '.part', path)
    return os.path.getsize(path)
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(20) as pool: total = sum(pool.map(get, sorted(tiles)))
print(f'downloaded to {out}: {total / 1e6:.1f} MB')
