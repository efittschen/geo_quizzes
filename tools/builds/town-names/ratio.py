# ratio.py: which parts of a country's town names mark a region, by smoothed ratio maps (one country). Used by
# choose.mjs; Python 3 with numpy, scipy and matplotlib (tools/cache/pyenv).
#   tools/cache/pyenv/bin/python tools/builds/town-names/ratio.py <places.json> <out.json>
#   (places.json from places.mjs; writes out.json, the parts for the page of ratio maps, and out.all.json, every part
#   judged in full with its numbers and, if left out, why)
#
#   1. Towns to km: a Lambert equal-area projection centred on the country (distances right across big countries).
#   2. The smoothing width W: the best leave-one-out width of random sets of 60 towns, exactly from their distances;
#      the median over CAL_SAMPLES sets (a sample holding one remote town, e.g. on Okinawa, gets a far wider best
#      width; the median is not pulled by those). Every map, of a part and of all towns, is smoothed at W.
#   3. One grid for everything else: squares of W / PER_WIDTH, with a margin as far as the blur reaches.
#   4. Chance: the bits of random sets of the sizes up to 2,000 towns (above that 0).
#   5. Every part (an ending or beginning of 2 to 7 letters, or a word of a name of several words, as in
#      tools/lib/names.mjs) with MIN_PLACES towns or more, found in one pass over the towns.
#   6. Screening on squares of W / 2: parts whose bits there stay under SCREEN cannot reach the clarity bar.
#   7. The rest in full, on all cores: bits (how far the part's smoothed towns differ from all towns), minus chance;
#      the ratio map (part over all towns, shown where all towns are at least 1/22 of the density the median town
#      sees); its red regions (more common than among all towns, reddest square 1.2x or more, MIN_HELD of the part's
#      towns or more); clarity (share of the part's towns in them minus share of all towns there); and the "where"
#      view: the smallest areas holding 50% (black), 80% (the quiz's aim) and 90% of the part's smoothed towns.
#   8. In: 1 to MOST_REGIONS red regions, clarity CLEAR or more, and the largest blank piece (land outside the 90%
#      area, pieces joined across up to one width of sea) BLANK_MIN of the land or more. Then the spelling families:
#      nearly the same towns -> the longer spelling; a narrower spelling stays beside a broader one if it has SHARPER
#      times its bits beyond chance, and the broader one only while its towns without the narrower ones would be a part
#      of their own: REST bits and every gate above (MIN_PLACES towns, the red regions, clarity, the blank); otherwise
#      the larger. split = harmonic mean of the largest black and blank pieces (shares of the land).
import json, sys, math, time, re, zlib, base64, os
import numpy as np
from scipy.ndimage import gaussian_filter, label as components, maximum as peak_of, binary_dilation
import multiprocessing as mp
from matplotlib.path import Path
MIN_PLACES, PER_WIDTH, TRUNC = int(os.environ.get('MIN_PLACES', 200)), 8, 4.0   # a part needs this many towns (the user: 200, "if I learn it"); the width stays the 60-town one (CAL_N)
CAL_N, CAL_SAMPLES = 60, 30
CHANCE_SIZES, CHANCE_REPS = [60, 90, 128, 180, 250, 350, 500, 700, 1000, 1400, 2000], 20
SCREEN, VISIBLE, MOST_REGIONS, CLEAR, MASK_SHARE = 0.25, math.log2(1.2), 2, 0.35, 0.0451   # 1/22: Germany's old bar (0.3 towns per 36 km²) over its median town's density
SAME, INSIDE, SHARPER, PARTIAL, REST = 0.9, 0.9, 1.1, 0.6, 0.3
BLACK, AIM, SHADED, BLANK_MIN = 0.5, 0.8, 0.9, 0.30   # the "where" bands; the largest blank piece (land outside the 90% area) must be 30%+ of the land
MIN_HELD = 3   # a red region counts only if it holds this many of the part's towns (no blobs from smoothing spilled onto near-empty land)
T0 = time.time(); clock = lambda: f"{time.time() - T0:6.1f} s"
d = json.load(open(sys.argv[1])); N = len(d['names'])

# 1. km
ll = np.radians(np.array(d['ll'])); phi, lam = ll[:, 0], ll[:, 1]; phi0, lam0 = phi.mean(), lam.mean()
k = np.sqrt(2 / (1 + np.sin(phi0) * np.sin(phi) + np.cos(phi0) * np.cos(phi) * np.cos(lam - lam0)))
X = 6371 * k * np.cos(phi) * np.sin(lam - lam0); Y = 6371 * k * (np.cos(phi0) * np.sin(phi) - np.sin(phi0) * np.cos(phi) * np.cos(lam - lam0))
print(f"{clock()} {d['country']}: {N} towns, {X.max() - X.min():.0f} x {Y.max() - Y.min():.0f} km")

# 2. the width: exact leave-one-out on 60 towns (Gaussian kernel), best by golden section on log width
rng = np.random.default_rng(1)
def loo(ids, w):
    dx = X[ids][:, None] - X[ids][None, :]; dy = Y[ids][:, None] - Y[ids][None, :]
    K = np.exp(-(dx * dx + dy * dy) / (2 * w * w)) / (2 * math.pi * w * w); np.fill_diagonal(K, 0)
    return float(np.sum(np.log(np.maximum(K.sum(1) / (len(ids) - 1), 1e-300))))
def best(ids, lo=2.0, hi=600.0):
    a, b, g = math.log(lo), math.log(hi), (math.sqrt(5) - 1) / 2
    c, e = b - g * (b - a), a + g * (b - a); fc, fe = loo(ids, math.exp(c)), loo(ids, math.exp(e))
    for _ in range(40):
        if fc > fe: b, e, fe = e, c, fc; c = b - g * (b - a); fc = loo(ids, math.exp(c))
        else: a, c, fc = c, e, fe; e = a + g * (b - a); fe = loo(ids, math.exp(e))
    return math.exp((a + b) / 2)
widths = [best(rng.choice(N, CAL_N, replace=False)) for _ in range(CAL_SAMPLES)]; W = float(np.median(widths))
print(f"{clock()} width for {CAL_N} towns: {W:.1f} km (median; mean {np.mean(widths):.1f}; from {min(widths):.0f} to {max(widths):.0f} over {CAL_SAMPLES} samples)")

# 3. the grid
CELL = W / PER_WIDTH; M = int(math.ceil(TRUNC * PER_WIDTH)) + 1
gx = np.floor((X - X.min()) / CELL).astype(int) + M; gy = np.floor((Y - Y.min()) / CELL).astype(int) + M
GW, GH = gx.max() + M + 1, gy.max() + M + 1
def grid(ids, gx=gx, gy=gy, shape=None):
    g = np.zeros(shape or (GH, GW)); np.add.at(g, (gy[ids], gx[ids]), 1); return g
blur = lambda g, s=PER_WIDTH: gaussian_filter(g, s, mode='constant', truncate=TRUNC)
ALL = grid(np.arange(N)); Q = blur(ALL); Q /= Q.sum()
print(f"{clock()} grid: {GW} x {GH} = {GW * GH:,} squares of {CELL:.1f} km ({int((ALL > 0).sum()):,} with towns)")
def kl(P, Qn):
    p = P / P.sum(); m = p > 1e-12; return float(np.sum(p[m] * np.log2(p[m] / np.maximum(Qn[m], 1e-15))))

# 4. chance
chance_at = {s: float(np.mean([kl(blur(grid(rng.choice(N, s, replace=False))), Q) for _ in range(CHANCE_REPS)])) for s in CHANCE_SIZES if s < N / 4}
chance = lambda n: 0.0 if n > max(chance_at) else float(np.interp(math.log(n), np.log(list(chance_at)), list(chance_at.values())))
print(f"{clock()} chance: " + ', '.join(f"{s}: {v:.2f}" for s, v in chance_at.items()))

# 5. the parts, in one pass
def words_of(name):
    return [w for w in re.split(r"[\s\-/]+", re.sub(r"\(.*?\)", "", name).lower().replace('ё', 'е')) if w and all(ch.isalpha() or ch in "'’." for ch in w)]
parts = {}
for i, name in enumerate(d['names']):
    ws = words_of(name)
    if not ws: continue
    long = [w for w in ws if len(w) >= 4]; mine = set()
    if long:
        last, first = long[-1], long[0]
        mine.update('-' + last[-L:] for L in range(2, 8) if len(last) > L + 1)
        mine.update(first[:L] + '-' for L in range(2, 8) if len(first) > L + 1)
    if len(ws) > 1: mine.update(ws)
    for lab in mine: parts.setdefault(lab, []).append(i)
parts = {lab: np.array(parts[lab]) for lab in sorted(parts) if len(parts[lab]) >= MIN_PLACES}   # by name: the same order every run (sets are not)
quiz = set(d['quiz'])
print(f"{clock()} {len(parts):,} parts with {MIN_PLACES}+ towns")

# 6. screening on squares of W / 2 (blur of 2 squares)
f4 = PER_WIDTH // 2; cx, cy = gx // f4, gy // f4; cshape = (GH // f4 + 1, GW // f4 + 1)
Qc = blur(grid(np.arange(N), cx, cy, cshape), 2.0); Qc /= Qc.sum()
screen = {lab: kl(blur(grid(ids, cx, cy, cshape), 2.0), Qc) - chance(len(ids)) for lab, ids in parts.items()}
full = [lab for lab, b in screen.items() if b >= SCREEN]
print(f"{clock()} screening: {len(full):,} of {len(parts):,} parts at {SCREEN}+ bits go on")

# 7. in full, on all cores
# squares where all towns' smoothed count is worth reading: at least 1/22 of the density the median town sees (the
# country's own, so sparse countries are not blanked out by a bar set on a dense one)
counts_all = ALL; density = Q * N / (CELL * CELL); show = density > MASK_SHARE * np.median(density[gy, gx])
print(f"{clock()} shown: squares above {MASK_SHARE * np.median(density[gy, gx]):.5f} towns per km² (median town {np.median(density[gy, gx]):.4f}); {1 - show[gy, gx].mean():.1%} of towns hidden")
# the page's data: the map squares placed on the quiz map (a plane fitted through the squares with towns)
xy = np.array(d['xy'], float); sx = grid(np.arange(N)) * 0; sy = sx.copy(); np.add.at(sx, (gy, gx), xy[:, 0]); np.add.at(sy, (gy, gx), xy[:, 1])
yy, xx = np.mgrid[0:GH, 0:GW]; has = ALL > 0; A = np.c_[xx[has], yy[has], np.ones(has.sum())]
cxp = np.linalg.lstsq(A, sx[has] / ALL[has], rcond=None)[0]; cyp = np.linalg.lstsq(A, sy[has] / ALL[has], rcond=None)[0]
# the country's land on the grid (square centres inside the map outline; even-odd, so lakes and enclaves drop out)
def rings(path):
    out, cur = [], []
    for cmd, nums in re.findall(r'([MLZmlz])([^MLZmlz]*)', path):
        v = [float(x) for x in re.findall(r'-?\d*\.?\d+(?:e-?\d+)?', nums)]
        if cmd in 'Mm' and len(cur) > 2: out.append(np.array(cur))
        if cmd in 'Mm': cur = []
        cur += [v[i:i + 2] for i in range(0, len(v) - 1, 2)]
        if cmd in 'Zz':
            if len(cur) > 2: out.append(np.array(cur))
            cur = []
    return out + ([np.array(cur)] if len(cur) > 2 else [])
centres = np.c_[(cxp[0] * xx + cxp[1] * yy + cxp[2]).ravel(), (cyp[0] * xx + cyp[1] * yy + cyp[2]).ravel()]; inside = np.zeros(len(centres), bool)
for ring in rings(d['land']): inside ^= Path(ring).contains_points(centres)
land = inside.reshape(GH, GW); LAND = int(land.sum()); SIDES = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]])
# sea: neither the country nor its neighbours (the map's ctx outline), inside the map's frame; areas may join across it
foreign = np.zeros(len(centres), bool)
for ring in rings(d.get('ctx', '')): foreign ^= Path(ring).contains_points(centres)
frame = (centres[:, 0] >= 0) & (centres[:, 0] <= d['w']) & (centres[:, 1] >= 0) & (centres[:, 1] <= d['h'])
sea = (~inside & ~foreign & frame).reshape(GH, GW)
R = PER_WIDTH // 2; DISK = np.add.outer(np.arange(-R, R + 1) ** 2, np.arange(-R, R + 1) ** 2) <= R * R   # half a width
print(f"{clock()} land: {LAND:,} squares = {LAND * CELL * CELL:,.0f} km²; sea {int(sea.sum()):,} squares")
def biggest(mask):
    # the largest connected piece of mask (squares sharing a side), as a share of the land; pieces join across sea up to
    # one width wide (sea within half a width of the piece on both sides), and only their land counts
    lab_, n_ = components(mask | (binary_dilation(mask, DISK) & sea), structure=SIDES)
    return int(np.bincount(lab_[mask], minlength=n_ + 1)[1:].max()) / LAND if n_ and mask.any() else 0.0
near_towns = Q * N >= 1e-5
def judge(lab, ids=None):
    ids = parts[lab] if ids is None else ids; n = len(ids); P = blur(grid(ids)); b = kl(P, Q); p = P / P.sum()
    full = np.log2(np.maximum(p, 1e-15) / np.maximum(Q, 1e-15)); lr = np.where(show, full, np.nan)
    red, m = components(np.nan_to_num(lr, nan=-9) > 0, structure=np.ones((3, 3)))
    top = np.array(peak_of(np.nan_to_num(lr, nan=-9), red, np.arange(1, m + 1))) if m else np.array([])
    here = grid(ids); held = np.bincount(red.ravel(), weights=here.ravel(), minlength=m + 1)[1:]
    visible = 1 + np.nonzero((top >= VISIBLE) & (held >= MIN_HELD))[0]; seen = np.isin(red, visible)
    covered, painted = float(here[seen].sum() / n), float(counts_all[seen].sum() / N)
    # the map for the page: the ratio in every square (also hidden ones: the page's "where" view needs them), as bytes of
    # 1/8 bit from -16 to +16 bits; which squares are shown goes once per country
    # squares beyond about 3.3 widths of every town (under 0.00001 towns) carry nothing either view needs: 0, which packs small
    code = np.where(near_towns, np.clip(np.round((full + 16) * 8), 0, 255), 0).astype(np.uint8)
    # the "where" view: squares from most to least of the part; black = the first 50% of it, blank = land after the first 90%
    flat = p.ravel(); o = np.argsort(-flat, kind='stable'); before = np.empty(flat.size); before[o] = np.concatenate([[0], np.cumsum(flat[o])[:-1]])
    before = before.reshape(GH, GW); bk, bl = biggest((before < BLACK) & land), biggest((before >= SHADED) & land)
    # the quiz's aim: the 80% area (the smallest holding 80% of the part's smoothed towns); the shares of the part's
    # towns and of all towns inside it are what a perfect drawing gets
    aim = before < AIM; aim_cover, aim_painted = float(here[aim].sum() / n), float(counts_all[aim].sum() / N)
    return {'l': lab, 'n': n, 'was': lab in quiz, 'bits': round(b, 3), 'chance': round(chance(n), 3), 'beyond': round(b - chance(n), 3),
            'regions': len(visible), 'held': sorted([int(held[v - 1]) for v in visible], reverse=True), 'covered': round(covered, 3), 'painted': round(painted, 3),
            'clarity': round(covered - painted, 3), 'black': round(bk, 3), 'blank': round(bl, 3), 'aim_cover': round(aim_cover, 4), 'aim_painted': round(aim_painted, 4), 'split': round(2 * bk * bl / (bk + bl), 3) if bk + bl else 0.0, 'map': base64.b64encode(zlib.compress(code.tobytes(), 9)).decode()}
with mp.get_context('fork').Pool(os.cpu_count()) as pool: res = pool.map(judge, full, chunksize=8)
print(f"{clock()} {len(res):,} parts in full")

# 8. the gates and the spelling families (as ratio.py)
for r in res: r['value'] = round(r['beyond'] * r['n'], 1)
# how many towns every two parts share, all at once: (part x town) times its transpose, sparse
from scipy.sparse import csr_matrix
order = [r['l'] for r in res]; at = {l: i for i, l in enumerate(order)}
rows = np.concatenate([np.full(len(parts[l]), i) for i, l in enumerate(order)] or [np.zeros(0, int)]); cols = np.concatenate([parts[l] for l in order] or [np.zeros(0, int)])   # (none in full: an empty matrix)
A = csr_matrix((np.ones(len(rows), np.int32), (rows, cols)), shape=(len(order), N)); O = (A @ A.T).tocsr()
near = [dict(zip(O.indices[O.indptr[i]:O.indptr[i + 1]].tolist(), O.data[O.indptr[i]:O.indptr[i + 1]].tolist())) for i in range(len(order))]
shared = lambda a, b: near[at[a['l']]].get(at[b['l']], 0)
print(f"{clock()} overlaps of {len(order):,} parts")
sets = {}
def set_of(l):
    if l not in sets: sets[l] = set(parts[l].tolist())
    return sets[l]
rest_of = {}
gates_of = {}
def rest_fails(ids):   # why the towns of a broader spelling without its narrower ones would not be a part ('' when they would)
    key = frozenset(ids)
    if key not in gates_of:
        if len(ids) < MIN_PLACES: gates_of[key] = f'under {MIN_PLACES} towns'
        else:
            r = judge('(rest)', np.array(sorted(ids)))
            gates_of[key] = '; '.join(w for w, bad in [(f"{r['regions']} red regions", not 1 <= r['regions'] <= MOST_REGIONS), (f"clarity {r['clarity']:.2f}", r['clarity'] < CLEAR), (f"largest blank {r['blank']:.0%}", r['blank'] < BLANK_MIN)] if bad)
    return gates_of[key]
def rest_bits(ids):
    key = frozenset(ids)
    if key not in rest_of: rest_of[key] = kl(blur(grid(np.array(sorted(ids)))), Q) - chance(len(ids)) if len(ids) >= MIN_PLACES else 0.0
    return rest_of[key]
gone = {r['l']: (f"{r['regions']} red regions" if r['regions'] else 'no red region') if not 1 <= r['regions'] <= MOST_REGIONS
                 else f"clarity {r['clarity']:.2f}" if r['clarity'] < CLEAR else f"largest blank {r['blank']:.0%} of the land"
        for r in res if not 1 <= r['regions'] <= MOST_REGIONS or r['clarity'] < CLEAR or r['blank'] < BLANK_MIN}
while True:
    for r in res:
        for k_ in ('why', 'covers', 'inner'): r.pop(k_, None)
        if r['l'] in gone: r['why'] = gone[r['l']]
    kept = []; keep_at = {}   # label -> its entry in kept
    for r in sorted([r for r in res if r['l'] not in gone], key=lambda r: (-r['n'], -len(r['l']))):
        n_r = r['n']; nb = [(res[j], c) for j, c in near[at[r['l']]].items() if order[j] in keep_at and order[j] != r['l']]
        holders = [k for k, c in nb if c >= INSIDE * n_r]
        if holders:
            k = min(holders, key=lambda k: k['n']); both = shared(k, r)
            if both >= SAME * k['n']:
                if len(r['l']) > len(k['l']): kept[kept.index(k)] = r; del keep_at[k['l']]; keep_at[r['l']] = r; r['covers'] = k.get('covers', []) + [k['l']]; r['inner'] = k.get('inner', []); k['why'] = f"same places as {r['l']}"
                else: r['why'] = f"same places as {k['l']}"; k.setdefault('covers', []).append(r['l'])
            elif r['beyond'] >= SHARPER * k['beyond']: kept.append(r); keep_at[r['l']] = r; k.setdefault('inner', []).append(r)
            else: r['why'] = f"inside {k['l']}, not sharper"; k.setdefault('covers', []).append(r['l'])
            continue
        partial = [k for k, c in nb if c > PARTIAL * min(n_r, k['n'])]
        if partial:
            k = max(partial, key=lambda k: shared(k, r) / min(n_r, k['n']))
            if r['value'] > k['value']: kept[kept.index(k)] = r; del keep_at[k['l']]; keep_at[r['l']] = r; k['why'] = f"overlaps {r['l']}, fewer bits × towns"; r.setdefault('covers', []).append(k['l'])
            else: r['why'] = f"overlaps {k['l']}, fewer bits × towns"; k.setdefault('covers', []).append(r['l'])
            continue
        kept.append(r); keep_at[r['l']] = r
    newly = False
    for k in kept:
        if not k.get('inner'): continue
        rest = set_of(k['l']) - set().union(*[set_of(i['l']) for i in k['inner']]); rb = rest_bits(rest); k['rest'] = round(rb, 2)
        if rb < REST: gone[k['l']] = f"without {', '.join(i['l'] for i in k['inner'])} not a pattern of its own ({len(rest)} towns, {rb:.2f} bits)"; newly = True
        else:   # and every gate a part has to pass: would they be a part of their own?
            why = rest_fails(rest)
            if why: gone[k['l']] = f"without {', '.join(i['l'] for i in k['inner'])} not a part of its own ({len(rest)} towns: {why})"; newly = True
    if not newly: break
for r in res: r['kept'] = 'why' not in r; r.pop('inner', None)
kept = sorted([r for r in res if r['kept']], key=lambda r: -r['value'])
print(f"{clock()} {len(kept)} kept (of {len(res)} judged in full, {len(parts):,} parts)")

# the 80% area of every kept part as outlines on the quiz map (what the quiz draws and grades against): the contour of
# its smoothed towns at the density above which 80% of them lie, each ring as x, y in whole map units
from contourpy import contour_generator
def area_of(lab):
    P = blur(grid(parts[lab])); p = P / P.sum(); v = np.sort(p.ravel())[::-1]; level = v[np.searchsorted(np.cumsum(v), AIM)]
    rings = []
    for line in contour_generator(z=p).lines(level):
        if len(line) < 4: continue
        x = cxp[0] * line[:, 0] + cxp[1] * line[:, 1] + cxp[2]; y = cyp[0] * line[:, 0] + cyp[1] * line[:, 1] + cyp[2]
        ring = np.rint(np.c_[x, y]).astype(int); ring = ring[np.r_[True, np.any(ring[1:] != ring[:-1], axis=1)]]   # no repeated points
        if len(ring) >= 4: rings.append(ring.ravel().tolist())
    return rings
for r in kept: r['area'] = area_of(r['l'])
print(f"{clock()} 80% areas of the {len(kept)} kept parts")

for r in res: r['h'] = round(W, 1)
dropped = sorted([r for r in res if not r['kept']], key=lambda r: -r['value'])
page = kept + dropped[:250] + [r for r in dropped[250:] if r['was']]
curve = [{'n': CAL_N, 'mean': W, 'min': min(widths), 'max': max(widths), 'all': [round(w, 1) for w in widths]}] + [{'n': s, 'mean': W, 'min': W, 'max': W, 'all': [], 'bits': v} for s, v in chance_at.items() if s != CAL_N]
curve[0]['bits'] = chance_at.get(CAL_N, 0)
# every page part's towns for the dots view: map units as 16-bit pairs (at most 3,000, evenly picked), compressed
xy16 = np.rint(xy).astype(np.int16)
def pts(l):
    ids = parts[l]; ids = ids[::math.ceil(len(ids) / 3000)]
    return base64.b64encode(zlib.compress(xy16[ids].tobytes(), 9)).decode()
json.dump({'country': d['country'], 'w': d['w'], 'h': d['h'], 'land': d['land'], 'grid': [int(GH), int(GW)], 'origin': [float(cxp[2]), float(cyp[2])], 'step': [[float(cxp[0]), float(cxp[1])], [float(cyp[0]), float(cyp[1])]],
           'square': round(CELL, 2), 'h_all': round(W, 1), 'curve': curve, 'total': len(parts), 'min': MIN_PLACES, 'towns': N,
           'show': base64.b64encode(zlib.compress(np.packbits(show.ravel()).tobytes(), 9)).decode(),       # shown squares, a bit each
           'qall': base64.b64encode(zlib.compress(Q.astype(np.float32).tobytes(), 9)).decode(),            # all towns, smoothed (sums to 1)
           'parts': [{**r, 'pts': pts(r['l'])} for r in page]}, open(sys.argv[2], 'w'))
json.dump(res, open(sys.argv[2].replace('.json', '.all.json'), 'w'))
print(f"{clock()} written: {len(page)} parts on the page")
print('kept, top 40:', ', '.join(f"{r['l']} {round(r['value'])}" for r in kept[:40]))
