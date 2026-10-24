#!/usr/bin/env python3
# The towns of a country's city quiz, for a map made with Vali: nested levels (10, then 25 holding those 10, then 100
# holding the 25), each by capacity-constrained Lloyd and swaps with nearby towns, on every simulated location.
#
#   tools/cache/venv/bin/python tools/builds/city-vali/lloyd.py <cc> [--map MovingWorld] [--total 200000]
#       [--levels 10,25,100] [--alpha 0.5] [--starts 2] [--tries 1] [--rounds 2] [--merge auto] [--fit 50]
#   --fit 50: a level put between those of an earlier result (_levels.json), which stay as they are: it holds the
#   levels below it and its towns are among those of the level above it (the best 50 of the 100 that hold the 25).
#
# Needs simulate.mjs (the simulated locations) and towns.mjs (the towns). The venv:
#   python3.11 -m venv tools/cache/venv && tools/cache/venv/bin/pip install numpy scipy
#
# The score of a set of K towns: optimal transport. Every simulated location is handed to one town, every town gets
# exactly 1/K of them, and the sum over all locations of distance / (town's population)^alpha is as small as it can
# be. So a larger town may serve its share from farther away; alpha = 0 is distance alone. (Populations are taken
# relative to the middle candidate's, so the score stays in km for a town of that size.)
# The simulated locations are merged where there are many (--merge auto: in groups of the size that leaves at most
# 10,000 points; the US in 33s): each with its nearest not yet merged, into one point at their middle that weighs
# as many; the report says how far a location moved. A town gets 1/K of the weight; a point on the border between two
# towns may be split between them.
# Solved through one price per town (a location goes to the town where its score minus the price is least), by
# Newton's method on the entropy-smoothed problem, the smoothing taken down to 0.3 km; then two numbers:
#   above: the score of the smoothed handing-out (each point spread a little over its nearest towns), its towns'
#   shares scaled to exactly 1/K;
#   below: the dual value of the prices, which no handing-out can beat. Their difference is the error of the score.
# Each level, from --starts starts (the towns of the level before, and new towns at spread-out locations):
#   Lloyd: hand out, move each new town to the candidate with the least score for its share, again until nothing moves;
#   swaps: for each new town, its --tries best other candidates for its share, each solved in full; taken if the score
#   falls; up to --rounds rounds (one for a level above 25, to save time), fewer if one changes nothing.
# The towns of the level before stay. Candidates for a town: the towns within its share's reach (the distance to its
# farthest location); where all of those are taken, the best free town anywhere. A level larger than the number of
# towns becomes all of them.
# Every step is kept in tools/cache/builds/city-vali/trace/ (the towns, each point's town, the score), rewritten as the
# search goes; view.mjs makes a page of them. The result: tools/cache/builds/city-vali/<cc>_..._levels.json.
import argparse, json, math, os, sys, time
os.environ.setdefault('OMP_NUM_THREADS', '1'); os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
import numpy as np
from multiprocessing import Pool
from scipy.spatial import cKDTree

EARTH = 6371.0
ap = argparse.ArgumentParser()
ap.add_argument('cc'); ap.add_argument('--map', default='MovingWorld'); ap.add_argument('--total', default='200000')
ap.add_argument('--levels', default='10,25,100'); ap.add_argument('--alpha', type=float, default=0.5)
ap.add_argument('--starts', type=int, default=2); ap.add_argument('--tries', type=int, default=1)
ap.add_argument('--rounds', type=int, default=2); ap.add_argument('--merge', default='auto')
ap.add_argument('--fit', type=int, default=0)
a = ap.parse_args()
WORK = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'cache', 'builds', 'city-vali')
base = os.path.join(WORK, f'{a.cc}_{a.map}_{a.total}')
meta = json.load(open(base + '.json'))
ll = np.fromfile(base + '.bin', dtype=np.float32).reshape(-1, 2).astype(np.float64)
T = json.load(open(os.path.join(WORK, f'{a.cc}_towns.json')))
towns = T['towns']
pop = np.array([t['pop'] for t in towns], dtype=np.float64)
N, J = len(ll), len(towns)
MERGE = max(1, math.ceil(N / 10000)) if a.merge == 'auto' else int(a.merge)
q = (np.maximum(pop, 1000) / np.median(np.maximum(pop, 1000))) ** a.alpha  # (a town without a population counts as 1,000)

def vec(lat, lng):
    lat, lng = np.radians(lat), np.radians(lng)
    return np.stack([np.cos(lat) * np.cos(lng), np.cos(lat) * np.sin(lng), np.sin(lat)], axis=-1)
TV = vec(np.array([t['lat'] for t in towns]), np.array([t['lng'] for t in towns]))
TT = cKDTree(TV)
ALLOWED = None  # (--fit: the towns a level may take, else all)
def ok(t): return ALLOWED is None or t in ALLOWED
def dist(X, Y): return np.arccos(np.clip(X @ Y.T, -1, 1)) * EARTH
fmt = lambda v: f'{v / 1e6:.1f}M' if v >= 1e6 else f'{round(v / 1000)}k'
def log(*s): print(*s, flush=True)

# ---------- the locations, merged: each with its nearest not yet merged ----------
def merge(X, size):
    tree, used, groups, left = cKDTree(X), np.zeros(len(X), bool), [], len(X)
    for i in np.random.default_rng(0).permutation(len(X)):
        if used[i]: continue
        used[i] = True; left -= 1; g = [i]; k = 4 * size
        while len(g) < size and left:
            for j in tree.query(X[i], k=min(k, len(X)))[1]:
                if not used[j]:
                    used[j] = True; left -= 1; g.append(j)
                    if len(g) == size: break
            k *= 4
        groups.append(g)
    return groups
X = vec(ll[:, 0], ll[:, 1])
if MERGE > 1:
    groups = merge(X, MERGE)
    w = np.array([len(g) for g in groups], dtype=np.float64)
    P = np.array([X[g].mean(0) for g in groups]); P /= np.linalg.norm(P, axis=1, keepdims=True)
    moved = np.concatenate([dist(X[g], P[[i]])[:, 0] for i, g in enumerate(groups)])
else:
    w, P, moved = np.ones(N), X, np.zeros(N)
M = len(P)
w32 = w.astype(np.float32)  # the transport works in float32 (distances worked out in float64, then rounded): twice as fast

# ---------- transport for one set (K = its size; each town's share c = N / K) ----------
def G(psi, D, eps):
    Z = (psi.astype(np.float32)[None, :] - D) / np.float32(eps); mx = Z.max(1)
    return -eps * w @ (np.log(np.exp(Z - mx[:, None]).sum(1)) + mx).astype(np.float64) + N / D.shape[1] * psi.sum()

def newton(D, psi, eps):
    c = N / D.shape[1]
    for _ in range(40):
        Z = (psi.astype(np.float32)[None, :] - D) / np.float32(eps); mx = Z.max(1, keepdims=True); E = np.exp(Z - mx); s = E.sum(1, keepdims=True)
        g0 = -eps * w @ (np.log(s[:, 0]) + mx[:, 0]).astype(np.float64) + c * psi.sum()
        E /= s; mass = (w32 @ E).astype(np.float64); grad = c - mass
        if np.abs(grad).max() < max(0.5, 0.002 * c): break  # every share within 0.2%
        H = (E.T @ (E * w32[:, None])).astype(np.float64) / eps - np.diag(mass) / eps
        if not np.isfinite(H).all(): break
        step = np.linalg.lstsq(H, -grad, rcond=None)[0]
        if np.abs(step).max() > 200: step *= 200 / np.abs(step).max()  # no wild jumps from a poor start
        t = 1.0
        while t > 1e-4 and G(psi + t * step, D, eps) < g0: t /= 2
        psi = psi + t * step; psi -= psi.mean()
    return psi

def transport(S, psi=None, km=None, changed=None):
    S = list(S); K = len(S); c = N / K
    km = dist(P, TV[S]).astype(np.float32) if km is None else km
    D = km / q[S][None, :].astype(np.float32)
    cold = psi is None
    psi = np.zeros(K) if cold else psi.copy()
    if changed is not None:  # a new town in place `changed`: its price such that its share prefers it
        Z = D - psi[None, :]; Z[:, changed] = np.inf
        u = D[:, changed] - Z.min(1); o = np.argsort(u); k = int(np.searchsorted(np.cumsum(w[o]), c))
        psi[changed] = u[o[min(k, M - 1)]]
    for eps in ([100, 30, 10, 3, 1, 0.3] if cold else [3, 1, 0.3]):
        psi = newton(D, psi, eps)
    # the handing-out: the smoothed plan of the last step (each point spread over the towns by the softmax of price
    # minus score, smoothing 0.3 km), its columns scaled to exactly 1/K each; a point's own town is where most of it goes
    Z = (psi.astype(np.float32)[None, :] - D) / np.float32(0.3); E = np.exp(Z - Z.max(1, keepdims=True)); E /= E.sum(1, keepdims=True)
    E *= w32[:, None]; E *= (c / E.sum(0, dtype=np.float64)).astype(np.float32)[None, :]
    asg = E.argmax(1)
    return dict(S=S, km=km, psi=psi, asg=asg, score=(E * D).sum(dtype=np.float64) / N,
                below=(w @ (D.astype(np.float64) - psi[None, :]).min(1) + c * psi.sum()) / N, avg_km=(E * km).sum(dtype=np.float64) / N)

def candidates(st, j):
    mine = st['asg'] == j
    if not mine.any(): return [st['S'][j]]
    reach = st['km'][mine, j].max()
    return [t for t in TT.query_ball_point(TV[st['S'][j]], 2 * np.sin(reach / (2 * EARTH))) if ok(t)] or [st['S'][j]]

def share_score(st, j, cand):
    ii = np.nonzero(st['asg'] == j)[0]
    return w[ii] @ dist(P[ii], TV[cand]) / q[cand]

# ---------- one level from one start: the towns of the level before stay ----------
def run(job):
    global ALLOWED
    K, fixed, seed, *allowed = job
    ALLOWED = allowed[0] if allowed else None  # (set here: a worker process does not share the main one's globals)
    nf = len(fixed)
    rng = np.random.default_rng(seed)
    d2 = np.full(M, 4.0)
    for t in fixed: d2 = np.minimum(d2, ((P - TV[t]) ** 2).sum(1))
    pick = []
    for _ in range(K - nf):
        k = rng.choice(M, p=w * d2 / (w @ d2)) if (w @ d2) > 0 else rng.integers(M)
        pick.append(k); d2 = np.minimum(d2, ((P - P[k]) ** 2).sum(1))
    S = list(fixed)
    for i in pick:
        S.append(next(int(t) for t in np.argsort(dist(P[[i]], TV)[0]) if t not in S and ok(t)))
    TRACE = os.path.join(WORK, 'trace', f'{a.cc}_k{K}_m{MERGE}_a{a.alpha:g}_s{seed}.json'); steps = []
    def keep(st, what):
        steps.append(dict(what=what, S=st['S'], score=st['score'], below=st['below'], avg_km=st['avg_km'], people=pop[st['S']].sum(), asg=st['asg'].astype(int).tolist()))
        json.dump(dict(cc=a.cc, k=K, merge=MERGE, alpha=a.alpha, seed=seed, steps=steps), open(TRACE + '.part', 'w')); os.replace(TRACE + '.part', TRACE)
    st = transport(S); keep(st, 'start')
    t0 = time.time()
    for it in range(60):  # Lloyd, the new towns only
        S = list(fixed)
        for j in range(nf, K):
            cand = candidates(st, j); sc = share_score(st, j, cand)
            free = [int(cand[i]) for i in np.argsort(sc) if cand[i] not in S]
            if not free:  # every town within reach taken by the towns before: the best free town anywhere
                rest = np.array([t for t in range(J) if t not in S and ok(t)]); free = [int(rest[np.argmin(share_score(st, j, rest))])]
            S.append(free[0])
        if S == st['S']: break
        new = transport(S)
        if new['score'] >= st['score'] - 1e-9: break
        st = new; keep(st, f'Lloyd {it + 1}')
    rounds, most = 0, a.rounds if K <= 25 else 1
    while rounds < most:  # swaps with nearby towns, the new towns only
        rounds += 1; changed = False
        for j in range(nf, K):
            cand = [t for t in candidates(st, j) if t not in st['S']]
            if not cand: continue
            sc = share_score(st, j, np.array(cand))
            for i in np.argsort(sc)[:a.tries]:
                S = list(st['S']); old = S[j]; S[j] = int(cand[i])
                km = st['km'].copy(); km[:, j] = dist(P, TV[[S[j]]])[:, 0]
                new = transport(S, st['psi'], km, changed=j)
                if new['score'] < st['score'] - 1e-6:
                    st, changed = new, True; keep(st, f'swap: {towns[S[j]]["name"]} in place of {towns[old]["name"]}')
                    break
        if not changed: break
    log(f'{a.cc} {K} towns, start {seed}: Lloyd {it + 1} steps, {rounds} swap round(s), score {st["score"]:.2f} (below {st["below"]:.2f}), {st["avg_km"]:.0f} km, {fmt(pop[st["S"]].sum())} people ({time.time() - t0:.0f} s)')
    return dict(seed=seed, S=st['S'], score=st['score'], below=st['below'], avg_km=st['avg_km'], people=pop[st['S']].sum())

def fit(K):
    # a level between those of the earlier result: the levels below stay, the towns come from the level above
    global ALLOWED
    out = json.load(open(base + '_levels.json')); idx = {t['id']: j for j, t in enumerate(towns)}
    ks = [l['k'] for l in out['levels']]
    if K in ks or K >= ks[-1] or K <= ks[0]: log(f'{a.cc}: no level {K} to fit in (levels {ks})'); return
    below = [l for l in out['levels'] if l['k'] < K]; above = next(l for l in out['levels'] if l['k'] > K)
    fixed = [idx[i] for l in below for i in l['new']]
    ALLOWED = set(fixed) | {idx[i] for i in above['new']}
    with Pool(a.starts) as pool:
        best = sorted(pool.map(run, [(K, fixed, s, ALLOWED) for s in range(1, a.starts + 1)]), key=lambda r: r['score'])[0]
    new = sorted([t for t in best['S'] if t not in fixed], key=lambda t: -pop[t])
    assert all(t in ALLOWED for t in new), 'a town from outside the level above'
    ids = {towns[t]['id'] for t in new}
    above['new'] = [i for i in above['new'] if i not in ids]
    out['levels'].insert(len(below), dict(k=K, new=[towns[t]['id'] for t in new], **{k: v for k, v in best.items() if k != 'S'}))
    json.dump(out, open(base + '_levels.json', 'w'), indent=1)
    log(f'{a.cc} {K} (fitted between {below[-1]["k"]} and {above["k"]}): {best["avg_km"]:.0f} km, {fmt(best["people"])} people; + ' + ', '.join(f"{towns[t]['name']} {fmt(pop[t])}" for t in new))

if __name__ == '__main__' and a.fit:
    fit(a.fit); sys.exit(0)

if __name__ == '__main__':
    levels = sorted({min(int(k), J) for k in a.levels.split(',')})
    os.makedirs(os.path.join(WORK, 'trace'), exist_ok=True)
    lat, lng = np.degrees(np.arcsin(P[:, 2])), np.degrees(np.arctan2(P[:, 1], P[:, 0]))
    json.dump(dict(lat=np.round(lat, 3).tolist(), lng=np.round(lng, 3).tolist(), w=w.astype(int).tolist(),
                   towns=[dict(name=t['name'], adm=t['adm'], lat=t['lat'], lng=t['lng'], pop=t['pop']) for t in towns]),
              open(os.path.join(WORK, 'trace', f'{a.cc}_m{MERGE}_points.json'), 'w'))
    log(f'{a.cc}: {N} simulated locations ({len(meta["runs"])} runs)' + (f' merged in {MERGE}s into {M} points: a location moved {moved.mean():.1f} km on average, 95% within {np.percentile(moved, 95):.1f} km' if MERGE > 1 else '') + f'; {J} towns; levels {levels}; alpha {a.alpha:g}')
    out, fixed = dict(cc=a.cc, map=a.map, total=a.total, alpha=a.alpha, merge=MERGE, towns=J, floor=T.get('floor'), levels=[]), []
    with Pool(a.starts) as pool:
        for K in levels:
            if K == J:  # every town
                st = transport(list(range(J)))
                best = dict(seed=0, S=st['S'], score=st['score'], below=st['below'], avg_km=st['avg_km'], people=pop.sum())
            else:
                res = sorted(pool.map(run, [(K, fixed, s) for s in range(1, a.starts + 1)]), key=lambda r: r['score'])
                best = res[0]
            new = sorted([t for t in best['S'] if t not in fixed], key=lambda t: -pop[t])
            out['levels'].append(dict(k=K, new=[towns[t]['id'] for t in new], **{k: v for k, v in best.items() if k != 'S'}))
            fixed = list(fixed) + new
            log(f'{a.cc} {K}: {best["avg_km"]:.0f} km, {fmt(best["people"])} people; + ' + ', '.join(f"{towns[t]['name']} {fmt(pop[t])}" for t in new))
            json.dump(out, open(base + '_levels.json', 'w'), indent=1)
    log('->', base + '_levels.json')
