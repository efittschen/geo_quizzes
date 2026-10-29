# Check text catalogue agents against their own transcripts.
# A photo passes only if its agent received all 7 images (whole + part1-6), no image
# result was ever removed from a request, and its file was written after the 7th image arrived.
# Usage: python3 -I check_text.py <text dir> <quarantine dir> <transcript dir> [<transcript dir> ...]
# Files that fail are moved to the quarantine dir; their ids are printed for a rerun.
import json, glob, os, re, sys, shutil

TEXT, QUAR, TDIRS = sys.argv[1], sys.argv[2], sys.argv[3:]
PIECES = {'whole'} | {f'part{i}' for i in range(1, 7)}
idre = re.compile(r'mapillary/pieces/(\d+)/(whole|part\d)\.jpg$')
txre = re.compile(r'mapillary/' + re.escape(os.path.basename(TEXT.rstrip('/'))) + r'/(\d+)\.json')

status = {}   # photo -> reason ('' = pass)
for f in [f for d in TDIRS for f in glob.glob(os.path.join(d, '**', 'agent-*.jsonl'), recursive=True)]:
    rows = [json.loads(l) for l in open(f)]
    path_of, got, removed, photo, wrote_ok = {}, set(), 0, None, None
    for r in rows:
        m = r.get('message')
        c = m.get('content') if isinstance(m, dict) else None
        if not isinstance(c, list): continue
        for x in c:
            if x.get('type') == 'tool_use':
                inp = x.get('input', {})
                p = inp.get('file_path', '') or inp.get('command', '')
                mi = idre.search(p)
                if mi: path_of[x['id']] = mi.group(2); photo = photo or mi.group(1)
                mt = txre.search(p)
                if mt and x.get('name') in ('Write', 'Edit', 'Bash') and r.get('type') == 'assistant':
                    photo = photo or mt.group(1)
                    wrote_ok = (wrote_ok is not False) and got >= PIECES
            if x.get('type') == 'tool_result':
                s = json.dumps(x.get('content'))
                if r.get('type') == 'api-request-blob' and 'media removed' in s: removed += 1
                if r.get('type') == 'user' and x.get('tool_use_id') in path_of and '"image"' in s:
                    got.add(path_of[x['tool_use_id']])
    if photo is None: continue
    if removed: why = f'{removed} image(s) removed'
    elif got < PIECES: why = 'missing ' + ','.join(sorted(PIECES - got))
    elif wrote_ok is None: why = 'no file written'
    elif not wrote_ok: why = 'file written before all images arrived'
    else: why = ''
    if photo in status and status[photo] == '': continue   # a later clean rerun of the same photo wins
    status[photo] = why

os.makedirs(QUAR, exist_ok=True)
bad = {p: w for p, w in status.items() if w}
for p, w in bad.items():
    if w == 'no file written': continue   # agent may still be running; never move a file written after the scan
    src = os.path.join(TEXT, f'{p}.json')
    if os.path.exists(src): shutil.move(src, os.path.join(QUAR, f'{p}.json'))
files = len(glob.glob(os.path.join(TEXT, '*.json')))
print(f'agents checked {len(status)} | pass {len(status) - len(bad)} | fail {len(bad)} | files kept {files}')
for p, w in sorted(bad.items()): print(' ', p, w)
