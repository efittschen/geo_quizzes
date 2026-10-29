# Pick 1000 sample points for one country: draw 1000 simulated A Moving World spawns (seed 7) and move each to the
# nearest Mapillary track with quality > 0.5 captured 2021 or later (from the zoom-8 tiles of tiles.py), on the same
# piece of land (mainland or island, as Natural Earth draws it); a spawn whose piece has no such track gets no point.
# Text plays no part. The good track points are kept in <iso2>_good_tracks.npy, so a rerun skips the tiles.
# Usage: tools/cache/venv/bin/python tools/builds/mapillary/sample.py <ISO2>
# Writes tools/cache/builds/mapillary/<iso2>_sample1000_qy.json: [{lng, lat, spawn_km, spawn: [lng, lat]}]
# (lng, lat and spawn_km null where the spawn's piece of land has no good track).
import numpy as np, json, glob, math, datetime, sys, os
import mapbox_vector_tile as mvt
from scipy.spatial import cKDTree

CC = sys.argv[1]
ROOT = '/Users/elisabethfittschen/geoguessr/tools/cache'
year = lambda p: datetime.datetime.utcfromtimestamp(p['captured_at'] / 1000).year if p.get('captured_at') else 0

def dens(pts):   # points about every 100 m along a line
    out = []
    for (a, b), (c, d) in zip(pts, pts[1:]):
        k = max(1, int(math.hypot((c - a) * 111.3 * math.cos(math.radians(b)), (d - b) * 111.3) / 0.1))
        out += [(a + (c - a) * i / k, b + (d - b) * i / k) for i in range(k)]
    return out + [pts[-1]]

CACHEF = f'{ROOT}/builds/mapillary/{CC.lower()}_good_tracks.npy'
def decode(f):   # one tile -> (track features, good track points about every 100 m)
    _, x, y = f.split('/')[-1][:-4].split('_'); x, y = int(x), int(y); n, out = 0, []
    for L in mvt.decode(open(f, 'rb').read()).values():
        ext = L.get('extent', 4096)
        for ft in L['features']:
            g, p = ft['geometry'], ft['properties']; n += 1
            if p.get('quality_score') is None or p['quality_score'] <= 0.5 or year(p) < 2021: continue
            parts = g['coordinates'] if g['type'] == 'MultiLineString' else [g['coordinates']] if g['type'] == 'LineString' else []
            for part in parts:
                pts = [((x + px / ext) / 256 * 360 - 180,
                        math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + 1 - py / ext) / 256))))) for px, py in part]
                if len(pts) > 1: out += dens(pts)
    return n, out
def main():
    P, total = [], 0
    if not os.path.exists(CACHEF):
        from multiprocessing import Pool
        with Pool(os.cpu_count()) as pool:
            for n, out in pool.imap_unordered(decode, glob.glob(f'{ROOT}/builds/mapillary/tiles8_{CC}/*.mvt'), chunksize=4):
                total += n; P += out
    P = np.load(CACHEF) if os.path.exists(CACHEF) else np.array(P)
    if not os.path.exists(CACHEF): np.save(CACHEF, P)

    ne = json.load(open(f'{ROOT}/ne_10m_admin_0_countries.geojson'))
    feat = next(f for f in ne['features'] if CC in (f['properties'].get('ISO_A2'), f['properties'].get('ISO_A2_EH')))
    polys = feat['geometry']['coordinates'] if feat['geometry']['type'] == 'MultiPolygon' else [feat['geometry']['coordinates']]
    import shapely
    from shapely.geometry import Polygon
    shapes = [Polygon(poly[0]) for poly in polys]
    for g in shapes: shapely.prepare(g)
    def land_of(pts):   # index of the piece of land (polygon) each point lies in, -1 for none
        out = np.full(len(pts), -1)
        for i, g in enumerate(shapes):
            x0, y0, x1, y1 = g.bounds
            js = np.where((out < 0) & (pts[:, 0] >= x0) & (pts[:, 0] <= x1) & (pts[:, 1] >= y0) & (pts[:, 1] <= y1))[0]
            if len(js): out[js[shapely.contains_xy(g, pts[js, 0], pts[js, 1])]] = i
        return out
    land = land_of(P)
    good, gland = P[land >= 0], land[land >= 0]
    print(f'{CC}: {total or "cached"} track features; quality > 0.5 and 2021+ inside the country: ~{len(good) / 10:.0f} km')

    vec = lambda a: np.stack([np.cos(np.radians(a[:, 1])) * np.cos(np.radians(a[:, 0])),
                              np.cos(np.radians(a[:, 1])) * np.sin(np.radians(a[:, 0])), np.sin(np.radians(a[:, 1]))], 1)
    ll = np.fromfile(f'{ROOT}/builds/city-vali/{CC}_MovingWorld_200000.bin', dtype=np.float32).reshape(-1, 2).astype(float)
    S = np.stack([ll[:, 1], ll[:, 0]], 1)
    D = S[np.random.default_rng(7).choice(len(S), 1000, replace=False)]
    # the spawn's piece of land: the polygon it lies in, else (a spawn just off the drawn coast) the one with the nearest vertex
    sland = land_of(D)
    if (sland < 0).any():
        V = np.concatenate([np.array(poly[0]) for poly in polys]); VI = np.concatenate([[i] * len(poly[0]) for i, poly in enumerate(polys)])
        for j in np.where(sland < 0)[0]: sland[j] = VI[np.argmin(((V - D[j]) ** 2).sum(1))]
    pts, dist = np.full((len(D), 2), np.nan), np.full(len(D), np.nan)
    for i in set(sland.tolist()):
        js, G = np.where(sland == i)[0], good[gland == i]
        if not len(G): continue
        dd, ii = cKDTree(vec(G)).query(vec(D[js])); pts[js], dist[js] = G[ii], dd * 6371
    none = np.isnan(dist); dk = dist[~none]
    print(f'1000 spawns -> point: median {np.median(dk):.2f} km; within 1 km {(dk <= 1).sum()}, 1-10 km {((dk > 1) & (dk <= 10)).sum()}, '
          f'beyond 10 km {(dk > 10).sum()}; no good track on their piece of land {none.sum()}; distinct points {len(set(map(tuple, np.round(pts[~none], 5))))}')
    json.dump([{'lng': None if n else float(a), 'lat': None if n else float(b), 'spawn_km': None if n else float(k), 'spawn': [float(sx), float(sy)]}
               for (a, b), k, n, (sx, sy) in zip(pts, dist, none, D)],
              open(f'{ROOT}/builds/mapillary/{CC.lower()}_sample1000_qy.json', 'w'))

if __name__ == '__main__':
    main()
