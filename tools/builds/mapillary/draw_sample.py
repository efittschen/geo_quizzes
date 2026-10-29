# Map of one country's sample: Mapillary tracks (grey all, green quality > 0.5 and 2021+), the 1000 sampled spawns
# and the point on a good track each was moved to (blue within 1 km, yellow 1-10 km, purple beyond 10 km).
# Usage: tools/cache/venv/bin/python tools/builds/mapillary/draw_sample.py <ISO2> <out.png>
import numpy as np, json, glob, math, datetime, sys
import mapbox_vector_tile as mvt
from PIL import Image, ImageDraw

CC, OUTPNG = sys.argv[1], sys.argv[2]
ROOT = '/Users/elisabethfittschen/geoguessr/tools/cache'
year = lambda p: datetime.datetime.utcfromtimestamp(p['captured_at'] / 1000).year if p.get('captured_at') else 0
merc = lambda g, a: ((g + 180) / 360, (1 - math.asinh(math.tan(math.radians(a))) / math.pi) / 2)

pts = json.load(open(f'{ROOT}/builds/mapillary/{CC.lower()}_sample1000_qy.json'))
ll = np.fromfile(f'{ROOT}/builds/city-vali/{CC}_MovingWorld_200000.bin', dtype=np.float32).reshape(-1, 2).astype(float)
S = np.stack([ll[:, 1], ll[:, 0]], 1); D = S[np.random.default_rng(7).choice(len(S), 1000, replace=False)]
L0, L1 = S[:, 0].min() - 0.3, S[:, 0].max() + 0.3; A0, A1 = S[:, 1].min() - 0.3, S[:, 1].max() + 0.3
x0, y0 = merc(L0, A1); x1, y1 = merc(L1, A0); H = 1300; W = int(H * (x1 - x0) / (y1 - y0))
P = lambda g, a: ((merc(g, a)[0] - x0) / (x1 - x0) * W, (merc(g, a)[1] - y0) / (y1 - y0) * H)

im = Image.new('RGB', (W, H), 'white'); d = ImageDraw.Draw(im)
good, other = [], []
for f in glob.glob(f'{ROOT}/builds/mapillary/tiles8_{CC}/*.mvt'):
    _, x, y = f.split('/')[-1][:-4].split('_'); x, y = int(x), int(y)
    for L in mvt.decode(open(f, 'rb').read()).values():
        ext = L.get('extent', 4096)
        for ft in L['features']:
            g, p = ft['geometry'], ft['properties']
            parts = g['coordinates'] if g['type'] == 'MultiLineString' else [g['coordinates']] if g['type'] == 'LineString' else []
            ok = p.get('quality_score') is not None and p['quality_score'] > 0.5 and year(p) >= 2021
            for part in parts:
                line = [((x + px / ext) / 256 * 360 - 180, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + 1 - py / ext) / 256))))) for px, py in part]
                if len(line) > 1: (good if ok else other).append(line)
for line in other: d.line([P(*q) for q in line], fill=(200, 200, 200), width=1)
for line in good: d.line([P(*q) for q in line], fill=(40, 160, 70), width=1)
ne = json.load(open(f'{ROOT}/ne_10m_admin_0_countries.geojson'))
feat = next(f for f in ne['features'] if CC in (f['properties'].get('ISO_A2'), f['properties'].get('ISO_A2_EH')))
for poly in (feat['geometry']['coordinates'] if feat['geometry']['type'] == 'MultiPolygon' else [feat['geometry']['coordinates']]):
    q = [P(g, a) for g, a in poly[0]]
    if all(-50 < x < W + 50 and -50 < y < H + 50 for x, y in q): d.line(q + [q[0]], fill=(0, 0, 0), width=2)
for (g, a), p in zip(D, pts):
    if p['lng'] is None: continue
    d.line([P(g, a), P(p['lng'], p['lat'])], fill=(120, 120, 120), width=1)
for (g, a) in D:
    x, y = P(g, a); d.ellipse([x - 2.5, y - 2.5, x + 2.5, y + 2.5], fill=(220, 60, 40))
for p in pts:
    if p['lng'] is None: continue
    k = p['spawn_km']; c = (30, 90, 210) if k <= 1 else (255, 200, 0) if k <= 10 else (130, 0, 170)
    x, y = P(p['lng'], p['lat']); d.ellipse([x - 3.5, y - 3.5, x + 3.5, y + 3.5], fill=c, outline=(0, 0, 0))
d.rectangle([0, 0, W, 22], fill='white')
d.text((8, 5), f'{CC}: tracks (grey), quality > 0.5 and 2021+ (green); sampled spawns (red) moved to the nearest green track: '
               'blue within 1 km, yellow 1-10 km, purple beyond 10 km', fill=(0, 0, 0))
im.save(OUTPNG); print(OUTPNG, W, H)
