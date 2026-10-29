export const meta = {
  name: 'mapillary-text-catalogue',
  description: 'Catalogue all readable text in sampled Mapillary photos of one country: one Sonnet agent per photo, fixed pieces, stop on any missing image',
  phases: [{ title: 'Catalogue', detail: 'one Sonnet agent per photo; writes <out>/<id>.json or replies ERROR' }],
}
// args: { country: "Kenya", out: "text_KE", pano: [ids of 360° photos], flat: [ids of flat photos] }
// Pieces must exist in pieces/<id>/ (whole.jpg, part1-6.jpg). Check the run afterwards with check_text.py.

const items = [
  ...args.pano.map(id => ({ id, pano: true })),
  ...args.flat.map(id => ({ id, pano: false })),
]
log(`${args.country}: ${items.length} photos to catalogue into ${args.out}/`)

const BASE = '/Users/elisabethfittschen/geoguessr/tools/cache/builds/mapillary'
const prompt = ({ id, pano }) => `You are cataloguing every piece of text in one street-level photo from ${args.country}, for a study of which clues a GeoGuessr player can see. Work only from the images, with the Read tool; write your one result file with the Write tool. No web searches, no network requests, no other tools. Never put any personal name or email address into any request.

Photo: ${id}, ${pano ? 'a 360° panorama' : 'a flat photo'}. The folder ${BASE}/pieces/${id}/ holds:
- whole.jpg: the whole photo, reduced, for orientation;
- ${pano
    ? 'part1.jpg … part6.jpg: six pieces at full resolution, the band around the horizon, left to right all the way round, each overlapping its neighbours by about 30%; part6 continues into part1.'
    : 'part1.jpg … part6.jpg: six pieces at full resolution, three columns and two rows, part1-3 the top row left to right, part4-6 the bottom row left to right, each overlapping its neighbours by about 30%.'}
The same item can appear in two pieces: list it once. If text runs across two pieces, join it into one item, using whole.jpg to see how the pieces fit.

Read all seven images, every one of the six pieces even where whole.jpg seems to show no text (small text only shows at full resolution), then write the file.

Stop rule: if any image comes back missing, empty or as "[media removed …]", stop at once: write no file and reply only "ERROR ${id}: <what failed>". Never write the file from images you have not seen, and never record anything you did not see (no text, numbers or names you would expect but cannot read).

Record every item that carries text, exactly as written:
- every advert and billboard, and everything in it: every line, names, dates, phone numbers, web addresses, slogans, prices;
- every shop, business, hotel, church, school or brand name, and everything else on those signs;
- every traffic, direction, distance, place-name or street sign: exact text, numbers and symbols;
- text on buildings, walls, kiosks, fuel price boards, banners, painted road text;
- text on vehicles (company names, slogans, number plates) and on clothing.
Keep capitals and spelling. Mark unreadable parts with [?]. If an item clearly has text but none of it is readable, list it with text "" and legibility "none". Never guess beyond what is visible.

Write one file, ${BASE}/${args.out}/${id}.json, valid JSON:
{ "id": "${id}",
  "items": [ { "kind": "advert | billboard | shop sign | traffic sign | direction sign | place-name sign | price board | banner | wall | vehicle | clothing | road marking | other",
               "text": "exact text, lines separated by ' / '",
               "legibility": "clear | partly | none",
               "where": "short position in the photo" } ],
  "place_names": [ every town, region, road or place named ],
  "languages": [ every language seen ],
  "phone_numbers": [ every phone number, as written ],
  "notes": "one line: anything else that places the photo" }
Write nowhere else.

Reply in one line: number of items, place names.`

let n = 0, errors = 0
const results = await pipeline(items, async (p) => {
  const reply = await agent(prompt(p), { label: p.id, phase: 'Catalogue', model: 'sonnet', agentType: 'general-purpose' })
  n++
  const failed = reply === null || /^\s*ERROR/.test(reply)
  if (failed) { errors++; log(`ERROR on ${p.id}: ${reply === null ? 'agent died' : reply.slice(0, 120)}`) }
  if (n % 50 === 0) log(`${n}/${items.length} done, ${errors} errors`)
  return { id: p.id, reply, failed }
})
log(`finished: ${n} photos, ${errors} errors`)
return results
