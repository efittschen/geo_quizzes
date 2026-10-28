# MapTap's day files (as saved by fetch_maptap_days.ipynb: { "October26": "<the file's text>", … }) -> the places of
# the days before today: { places: [{ date, pos, name, lat, lng }], areas: [{ date, pos, name, highlight }] }.
#
#   python3 tools/builds/world-places/days.py day_map_365_days.json maptap_cities.json
#
# The files are read as text, never run: each `cities = [ … ]`, its places' own fields only (not those of anything
# inside them, nor commented out). pos: the place's position on its day (1–5), as MapTap asks them: easy to hard.
# A file of today or later is left out, whatever its format: some old-format files of the coming weeks already hold
# this year's puzzle. An area without a point (a lake, a strait: `highlight`) is kept apart. A place that cannot be
# read stops the run and nothing is written.
import json, re, sys, datetime

def skip_str(t, i):   # t[i] is a quote; returns the index after the closing one
    q = t[i]; i += 1
    while t[i] != q: i += 2 if t[i] == '\\' else 1
    return i + 1

def skip_comment(t, i):
    if t.startswith('//', i): j = t.find('\n', i); return len(t) if j < 0 else j
    if t.startswith('/*', i): return t.index('*/', i) + 2
    return None

def array_after(t, name):   # the text inside `name = [ … ]`
    m = re.search(r'(?m)^\s*(?:let |var |const )?' + name + r'\s*=\s*\[', t)
    if not m: return None
    i, depth, start = m.end(), 1, m.end()
    while depth:
        c = t[i]
        if c in '"\'`': i = skip_str(t, i); continue
        s = skip_comment(t, i)
        if s is not None: i = s; continue
        if c in '[{': depth += 1
        elif c in ']}': depth -= 1
        i += 1
    return t[start:i - 1]

def objects(a):   # the top-level { … } in an array's text
    out, i, depth, start = [], 0, 0, None
    while i < len(a):
        c = a[i]
        if c in '"\'`': i = skip_str(a, i); continue
        s = skip_comment(a, i)
        if s is not None: i = s; continue
        if c in '[{':
            if depth == 0 and c == '{': start = i + 1
            depth += 1
        elif c in ']}':
            depth -= 1
            if depth == 0 and c == '}': out.append(a[start:i])
        i += 1
    return out

def fields(o):   # top-level key: value pairs of an object's text (values as text)
    out, i, depth, key, vstart = {}, 0, 0, None, None
    pat = re.compile(r'\s*([A-Za-z_]\w*)\s*:')
    while i <= len(o):
        if depth == 0 and key is None:
            while True:   # (whitespace and comments before a key)
                while i < len(o) and o[i].isspace(): i += 1
                s = skip_comment(o, i)
                if s is None: break
                i = s
            m = pat.match(o, i)
            if not m: break
            key, i, vstart = m.group(1), m.end(), m.end(); continue
        if i == len(o) or (depth == 0 and o[i] == ','):
            out[key] = o[vstart:i].strip(); key = None; i += 1; continue
        c = o[i]
        if c in '"\'`': i = skip_str(o, i); continue
        s = skip_comment(o, i)
        if s is not None: i = s; continue
        if c in '[{(': depth += 1
        elif c in ']})': depth -= 1
        i += 1
    return out

def string(v):
    q = v[0]
    if q not in '"\'`' or v[-1] != q: raise ValueError('not a string: ' + v[:40])
    s = v[1:-1]
    return json.loads('"' + s.replace('\\' + q, q).replace('"', '\\"').replace('\\\\"', '\\"') + '"') if q != '"' else json.loads(v)

TODAY = datetime.date(2026, 10, 27)
def date_of(key):   # this year's date of a file: one after today may hold this year's upcoming puzzle, so it is left out
    mo, d = re.match(r'([A-Za-z]+)(\d+)$', key).groups()
    return datetime.date(TODAY.year, datetime.datetime.strptime(mo, '%B').month, int(d))

src, out_path = sys.argv[1], sys.argv[2]
days = json.load(open(src))
places, areas, skipped, problems = [], [], {'today or later': 0, 'no places in file': []}, []
for key, t in days.items():
    if key == 'February29' or date_of(key) >= TODAY: skipped['today or later'] += 1; continue
    a = array_after(t, 'cities')
    if a is None or not objects(a): skipped['no places in file'].append(key); continue
    for pos, o in enumerate(objects(a), 1):
        f = fields(o)
        if 'lat' not in f and 'highlight' in f or 'lat' not in f and 'lng' not in f:   # an area to tap, no point
            areas.append({'date': date_of(key).isoformat(), 'pos': pos, 'name': string(f['name']), 'highlight': string(f['highlight']) if 'highlight' in f else None}); continue
        try:
            name, lat, lng = string(f['name']), float(f['lat']), float(f['lng'])
        except Exception as e:
            problems.append((key, str(e)[:80], list(f), o[:300].replace('\n', ' '))); continue
        pid = string(f['id']) if 'id' in f else None
        date = datetime.date.fromisoformat(pid[:10]) if pid and re.match(r'\d{4}-\d\d-\d\d', pid) else date_of(key)
        if date != date_of(key): problems.append((key, f'id dated {date}', [], '')); continue
        places.append({'date': date.isoformat(), 'pos': pos, 'name': name, 'lat': lat, 'lng': lng})
if problems:
    for p in problems[:40]: print('PROBLEM', p)
    sys.exit(f'STOP: {len(problems)} places could not be read; nothing written')
places.sort(key=lambda p: (p['date'], p['pos']))
json.dump({'places': places, 'areas': sorted(areas, key=lambda a: a['date'])}, open(out_path, 'w'), ensure_ascii=False, indent=1)
per_day = {}
for p in places: per_day[p['date']] = per_day.get(p['date'], 0) + 1
print(len(places), 'places on', len(per_day), 'days ->', out_path)
print('places a day:', {n: sum(1 for v in per_day.values() if v == n) for n in sorted(set(per_day.values()))})
print('files skipped (today or later, 29 Feb):', skipped['today or later'], '| files without places:', skipped['no places in file'])
print('areas without a point:', len(areas), [a['name'] for a in areas])
print('places with an empty name:', [(p['date'], p['lat'], p['lng']) for p in places if not p['name'].strip()])
print('dates', places[0]['date'], 'to', places[-1]['date'])
