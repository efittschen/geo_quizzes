# Cut each photo of a list into the pieces the text agents read: whole.jpg (1600 px on the long side) and part1-6.jpg at
# full resolution, each 30% wider and taller than its share so neighbours overlap. Flat photo: 3 columns x 2 rows.
# 360° photo: the band around the horizon (30-70% of the height) in 6 pieces all the way round, part6 into part1.
# Usage: tools/cache/venv/bin/python tools/builds/mapillary/pieces.py <list.json>   (originals/<id>.jpg -> pieces/<id>/)
# Runs on all CPU cores.
import json, os, sys
from multiprocessing import Pool
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

D = '/Users/elisabethfittschen/geoguessr/tools/cache/builds/mapillary'
def cut(p):
    out = f'{D}/pieces/{p["id"]}'
    if all(os.path.exists(f'{out}/{n}.jpg') for n in ['whole'] + [f'part{i}' for i in range(1, 7)]): return 'done'
    try:
        im = Image.open(f'{D}/originals/{p["id"]}.jpg').convert('RGB'); W, H = im.size
        os.makedirs(out, exist_ok=True)
        s = 1600 / max(W, H); im.resize((round(W * s), round(H * s)), Image.LANCZOS).save(f'{out}/whole.jpg', quality=90)
        if p['pano']:
            step, top, bot = W / 6, round(H * 0.3), round(H * 0.7); pw = round(step * 1.3)
            band = im.crop((0, top, W, bot)); wide = Image.new('RGB', (W + pw, bot - top)); wide.paste(band, (0, 0)); wide.paste(band, (W, 0))
            for i in range(6):
                x0 = round(i * step - 0.15 * step) % W
                wide.crop((x0, 0, x0 + pw, bot - top)).save(f'{out}/part{i + 1}.jpg', quality=90)
        else:
            sx, sy = W / 3, H / 2; pw, ph = round(sx * 1.3), round(sy * 1.3)
            for r in range(2):
                for c in range(3):
                    x0 = min(max(0, round(c * sx - 0.15 * sx)), W - pw); y0 = min(max(0, round(r * sy - 0.15 * sy)), H - ph)
                    im.crop((x0, y0, x0 + pw, y0 + ph)).save(f'{out}/part{r * 3 + c + 1}.jpg', quality=90)
        return 'made'
    except Exception as e: return f'{p["id"]}: {e}'

if __name__ == '__main__':
    with Pool(os.cpu_count()) as pool: res = pool.map(cut, json.load(open(sys.argv[1])))
    errors = [r for r in res if r not in ('made', 'done')]
    print(f'pieces: {res.count("made")} cut, {res.count("done")} already there, {len(errors)} errors' + ('\n' + '\n'.join(errors) if errors else ''))
