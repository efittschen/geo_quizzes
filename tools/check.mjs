#!/usr/bin/env node
// Pre-push check, in Firefox, in a few minutes: page loads, map answers and Hard mode, Draw, Name it and Shape, a
// review with its replays' rating, the answer log and Stats, Cards per map off, the bare map, the satellite map, the
// online copy's merge.
// A check whose feature the site lacks is SKIP, not FAIL. Nothing leaves this computer (tiles from the recorded ones).
//
//   node tools/check.mjs [--root <site folder>] [--only a,c,e] [--jobs 4] [--pages]
//   (--pages: the pages check a would load, and nothing else)
//
// Exit code 1 on a failure.
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { TOOLS, TILE_COUNT, serve, launch, open, go, visible, mapStill, startRound, askedItem, clickItem, otherItem, feedback, drawOne, asked, listed, hasLog, lastAnswers, card, standin } from './check-lib.mjs';

const { values: o } = parseArgs({ options: { root: { type: 'string' }, only: { type: 'string' }, jobs: { type: 'string', default: '4' }, pages: { type: 'boolean' } } });
const ROOT = path.resolve(o.root || path.join(TOOLS, '..')), ONLY = o.only ? o.only.split(',') : null, JOBS = Math.max(1, +o.jobs || 4);
const LIMIT = 290e3; // ms: past this, what still runs is a failure
const T0 = Date.now();
const sec = ms => (ms / 1000).toFixed(1) + ' s';
if (!fs.existsSync(path.join(ROOT, 'data', 'site', 'quizzes.json'))) { console.error('no data/site/quizzes.json in ' + ROOT); process.exit(2); }
const exists = rel => fs.existsSync(path.join(ROOT, rel));

if (o.pages) { for (const p of pickPages()) console.log(p.kind.padEnd(13), p.url); process.exit(0); }
const { server, base } = await serve(ROOT);
const browser = await launch();
console.log(`root ${ROOT}\nFirefox ${browser.version()} · ${JOBS} at once · launched in ${sec(Date.now() - T0)}`);

// A check: its failures (fail), a reason to skip it (skip), notes; the pages' script errors count as failures.
class Skip extends Error {}
function checker() {
  const c = { fails: [], notes: [], pages: [] };
  c.ok = (cond, label, info) => { if (!cond) c.fails.push(label + (info !== undefined && info !== '' ? ': ' + (typeof info === 'string' ? info : JSON.stringify(info)) : '')); return !!cond; };
  c.skip = why => { throw new Skip(why); };
  c.open = async (url, opts) => { const p = await open(browser, url && base + url, opts); c.pages.push(p); return p; };
  return c;
}
// Playwright's clock (installed before the page loads) stopped where the page is: its timers wait for runFor.
// (a moment ahead, as time goes on meanwhile: further ahead where that has passed already)
async function pause(page) {
  for (const ahead of [300, 1500]) {
    try { return await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + ahead)); } catch (e) { if (!/past/.test(e.message)) throw e; }
  }
  await page.clock.pauseAt(new Date((await page.evaluate(() => Date.now())) + 5000));
}
const STATES = 'quizzes/germany-regions/index.html', GERMAN_STATES = ['BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV', 'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH']; // the test page of most checks: 16 states, every mode and map

/* ---------- a. page loads: varied pages from data/site/quizzes.json, each with a round started ---------- */
function pickPages() {
  const quizzes = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'site', 'quizzes.json'), 'utf8')).quizzes.filter(q => !q.hidden && q.url && exists(q.url));
  const kindOf = q => {
    const h = fs.readFileSync(path.join(ROOT, q.url), 'utf8'), s = [...h.matchAll(/src="([^"]+\.js)"/g)].map(m => (/engine\//.test(m[1]) ? m[1].replace(/^.*engine\//, '') : m[1].split('/').pop()));
    const has = n => s.includes(n);
    if (has('paint.js')) return 'town names';
    if (has('types/flag.js')) return 'flags';
    if (has('types/world.js')) return 'world';
    if (has('types/lang.js')) return 'letters';
    if (has('types/post.js') || q.role === 'postcodes') return 'postcodes';
    if (has('types/city.js') || /^cities/.test(q.role || '')) return 'cities';
    if (has('photos.js')) return 'pictures';
    if (has('types/country-set.js')) return 'sets';
    if (q.role === 'area-codes') return 'codes';
    if (q.role === 'regions') return 'regions';
    if (has('types/layer.js')) return 'layers';
    return 'other';
  };
  const WANT = { regions: 3, codes: 3, postcodes: 3, cities: 3, 'town names': 2, flags: 2, world: 2, letters: 2, pictures: 3, sets: 1, layers: 2, other: 2 };
  const by = {};
  for (const q of quizzes) (by[kindOf(q)] ??= []).push(q);
  const out = [];
  for (const [k, n] of Object.entries(WANT)) {
    const qs = (by[k] || []).sort((a, b) => a.id.localeCompare(b.id));
    for (let i = 0; i < Math.min(n, qs.length); i++) out.push({ kind: k, url: qs[Math.floor((i + 0.5) * qs.length / Math.min(n, qs.length))].url });
  }
  const country = quizzes.find(q => q.country)?.country || '276';
  out.push({ kind: 'home', url: 'index.html', wait: '#quiz-tree a' }, { kind: 'country page', url: `country.html?code=${country}`, wait: '#quiz-cards a' }, { kind: 'review page', url: 'review.html', wait: 'main' });
  return out;
}
async function loadOne(p) {
  const { page, ctx, errors } = await open(browser, null), t0 = Date.now();
  let started = false, err = '';
  try {
    await go(page, base + p.url, p.wait || '#rounds .round');
    if (!p.wait) { await startRound(page); started = true; }
    else started = true;
    await page.waitForTimeout(250);
  } catch (e) { err = e.message.split('\n')[0]; }
  await ctx.close();
  return { ...p, started, ms: Date.now() - t0, errors: err ? [err, ...errors] : errors };
}

/* ---------- b. a region quiz: an answer right, one wrong then right; Hard mode leaves no colour after the fade ---------- */
async function mapAnswers(c) {
  const { page } = await c.open(STATES, { clock: true });
  const modes = await startRound(page, { round: 'All states', mode: 'Map', hard: true });
  if (!c.ok(modes.started, 'a round started', modes.join(' '))) return;
  const log = await hasLog(page);
  await pause(page); // (the page's time stands still unless moved on: a slow machine sees the colour before its fade)
  let it = await askedItem(page, 'states');
  await clickItem(page, 'states', it.id);
  let fb = await feedback(page);
  c.ok(/ok/.test(fb.cls) && fb.t.startsWith('✓'), 'a right click: ✓', fb.t);
  const colored = () => page.evaluate(() => Object.values(QUIZ_MAP.states()).filter(s => s.some(c => ['got', 't2', 't3', 'miss'].includes(c))).length);
  c.ok(await colored() > 0, 'the answer coloured at once');
  if (modes.hard) {
    await page.clock.runFor(1200);
    c.ok(await colored() === 0, 'Hard mode: no colour after the fade', await colored());
    const labels = await page.evaluate(() => QUIZ_MAP.labels().length);
    c.ok(labels === 0, 'Hard mode: no names left on the map', labels);
  } else c.notes.push('no Hard mode');
  it = await askedItem(page, 'states');
  await clickItem(page, 'states', await otherItem(page, 'states', it.id));
  fb = await feedback(page);
  c.ok(/bad/.test(fb.cls), 'a wrong click: a try less', `${fb.t} ${fb.c.join(' ')}`);
  await clickItem(page, 'states', it.id);
  fb = await feedback(page);
  c.ok(/try 2/.test(fb.t), 'then right: try 2', fb.t);
  if (log) {
    const a = await lastAnswers(page, 2);
    c.ok(a.length === 2 && a[0].r === 0 && a[1].r > 0 && a.every(x => x.mode === 'map' && x.quiz === 'germany-regions'), 'answer log: the two answers', a.map(x => `${x.mode}:${x.item}:${x.r}`).join(' '));
  } else c.notes.push('no answer log');
}

/* ---------- c. Draw: a perfect outline passes, a circle beside it fails ---------- */
async function draw(c) {
  const { page } = await c.open(STATES);
  const modes = await startRound(page, { round: 'All states', mode: 'Draw' });
  if (!modes.started) c.skip('no Draw');
  for (const how of ['outline', 'beside']) {
    const { item, fb } = await drawOne(page, how);
    if (!c.ok(fb, `${how}: drawn`, item ? item.id : 'no item found')) return;
    const pct = parseInt(fb.pct, 10);
    if (how === 'outline') c.ok(pct >= 70 && /ok/.test(fb.cls), `perfect outline of ${item.id} passes`, fb.pct);
    else c.ok(pct < 70 && /bad/.test(fb.cls), `circle beside ${item.id} fails`, fb.pct);
    c.notes.push(`${how} ${item.id} ${fb.pct}`);
    await page.waitForTimeout(300);
  }
}

/* ---------- d. Name it and Shape: a name typed right, another typed wrong ---------- */
async function nameShape(c) {
  const { page } = await c.open(STATES);
  let ran = 0;
  for (const mode of ['Name it', 'Shape']) {
    if (ran) { await page.locator('#endBtn').click(); await page.locator('#menuBtn').click(); await page.waitForSelector('#setup', { state: 'visible', timeout: 5000 }); }
    const modes = await startRound(page, { round: 'All states', mode });
    if (!modes.started) { c.notes.push('no ' + mode); continue; }
    ran++;
    let a = await asked(page, 'states');
    if (!c.ok(a, `${mode}: the place asked found`)) continue;
    const q0 = await page.locator('#sQ').textContent();
    await page.locator('#typed').fill(a.latin); await page.keyboard.press('Enter');
    await page.waitForFunction(q0 => document.getElementById('sQ').textContent !== q0, q0, { timeout: 3000, polling: 30 }).catch(() => {});
    let fb = await feedback(page);
    c.ok(/ok/.test(fb.cls) && fb.t.startsWith('✓'), `${mode}: ${a.latin} typed, right`, fb.t);
    await page.waitForTimeout(100);
    a = await asked(page, 'states');
    // the list starts folded (nothing offered while typing); opened with its button, names are picked from it
    if (mode === 'Name it') c.ok(await page.locator('#typedList').isHidden(), `${mode}: the list starts folded`);
    if (await page.locator('#typedList').isHidden()) await page.locator('#typedListBtn').click();
    const names = await listed(page), wrong = names.find(n => n !== a.own && !n.startsWith(a.own) && !a.own.startsWith(n) && !names.some(m => m !== n && m.startsWith(n)));
    await page.locator('#typed').fill(wrong);
    const first = (await listed(page))[0];
    if (first === wrong) await page.keyboard.press('Enter');
    else await page.locator('#typedList .opt').filter({ hasText: wrong }).first().click();
    await page.waitForFunction(() => /bad/.test(document.getElementById('fb').className), null, { timeout: 2000, polling: 30 }).catch(() => {});
    fb = await feedback(page);
    c.ok(/bad/.test(fb.cls) && fb.c.some(x => /tries? left/.test(x)), `${mode}: ${wrong} typed for ${a.own}, wrong`, `${fb.t} ${fb.c.join(' ')}`);
    if (await hasLog(page)) { // (the wrong one is written once its question is answered)
      const [l] = await lastAnswers(page, 1), want = mode === 'Shape' ? 'shape' : 'name';
      c.ok(l && l.mode === want && l.r === 0, `${mode}: answer log has the mode`, l && l.mode + ':' + l.r);
    }
  }
  if (!ran) c.skip('no Name it or Shape');
}

/* ---------- e. a review: two cards missed, asked again; the replays rated: time-out -> Hard, Good moves on ---------- */
async function review(c) {
  const { page } = await c.open('review.html', { clock: true, wait: 'main' });
  if (!(await page.evaluate(() => typeof SRS === 'object' && typeof SRS.deck === 'function'))) c.skip('no SRS.deck');
  const rating = /rv-rate/.test(fs.readFileSync(path.join(ROOT, 'engine/app/review.js'), 'utf8'));
  if (!rating) c.notes.push('no replay rating');
  const KEYS = ['states@quiz|BY', 'states@quiz|NI'];
  await page.evaluate(keys => {
    const id = 'germany-regions', now = Date.now();
    SRS.add(id, 'Germany States', keys, now, { m: 'quiz' });
    const d = SRS.deck(id);
    for (const k of keys) { const c = d.c[k]; delete c.s; c.i = 3; c.d = now - 1000; c.l = now - 3 * 864e5; }
    SRS.save(id, d);
  }, KEYS);
  await go(page, base + STATES);
  const due = page.locator('#reviewDue');
  if (!(await due.count()) || !(await due.isVisible())) return c.ok(false, 'the Due button');
  await due.click();
  await page.waitForSelector('#play', { state: 'visible', timeout: 8000 });
  await mapStill(page);
  await pause(page); // (the page's time stands still unless moved on: the review's and the rating's clocks wait for the check)
  const other = id => (id === 'BY' ? 'NI' : 'BY'); // (a wrong click on the other card's state: places outside the review's set answer nothing)
  const seen = [], replays = [];
  for (let step = 0; step < 12; step++) {
    if (await visible(page, 'done') || !(await visible(page, 'play'))) break;
    const it = await askedItem(page, 'states', 3000); if (!it) break;
    const key = 'states@quiz|' + it.id, q = await page.locator('#sQ').textContent();
    if (!seen.includes(it.id)) {
      seen.push(it.id);
      await clickItem(page, 'states', other(it.id)); await clickItem(page, 'states', it.id);
      const cd = await card(page, key);
      c.ok(cd && cd.s === 1 && !(await page.locator('.rv-rate').count()), `${it.id} missed: relearning, no rating`, cd && `s:${cd.s}`);
      continue;
    }
    replays.push(it.id);
    await clickItem(page, 'states', it.id);
    if (!rating) continue;
    const rate = await page.evaluate(() => { const r = document.querySelector('.rv-rate'); return r && { def: (r.querySelector('button.def') || {}).textContent, n: r.querySelectorAll('button').length }; });
    if (!c.ok(rate && rate.n === 3, `replay of ${it.id}: the rating column`, rate)) break;
    if (replays.length === 1) {
      await page.clock.runFor(4500);
      const cd = await card(page, key);
      c.ok(!(await page.locator('.rv-rate').count()) && cd.s === 1, 'time-out: Hard, stays in relearning', `s:${cd.s} due in ${((cd.d - cd.l) / 6e4).toFixed(1)} min`);
    } else {
      await page.locator('.rv-rate button', { hasText: 'Good' }).click();
      await page.waitForTimeout(150);
      const cd = await card(page, key), moved = (await visible(page, 'done')) || (await page.locator('#sQ').textContent()) !== q || !(await page.locator('.rv-rate').count());
      c.ok(cd.s == null && cd.i >= 1 && moved, 'Good: out of relearning, moved on', `s:${cd.s} i:${cd.i}`);
    }
  }
  c.ok(seen.length === 2 && (rating ? replays.length === 2 : replays.length >= 1), 'two cards asked, each again after its miss', `asked ${seen.join(' ')}, again ${replays.join(' ')}`);
  if (await hasLog(page)) {
    const l = (await lastAnswers(page, 8)).filter(a => a.quiz === 'germany-regions' && a.review);
    c.ok(l.filter(a => !a.replay && a.r > 0).length === 2 && l.filter(a => a.replay).length >= 2, 'answer log: 2 misses and their replays, as a review', l.map(a => `${a.item}:${a.r}${a.replay ? 'R' : ''}`).join(' '));
  }
}

/* ---------- f. Stats: the review page's Stats tab with a seeded log; My stats colours the map ---------- */
const seedLog = page => page.evaluate(async () => {
  let r = 1; const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
  const now = Date.now(), DAY = 864e5, D = 41;
  const states = { BW: 'Baden-Württemberg', BY: 'Bayern', BE: 'Berlin', BB: 'Brandenburg', HB: 'Bremen', HH: 'Hamburg', HE: 'Hessen', MV: 'Mecklenburg-Vorpommern', NI: 'Niedersachsen', NW: 'Nordrhein-Westfalen', RP: 'Rheinland-Pfalz', SL: 'Saarland', SN: 'Sachsen', ST: 'Sachsen-Anhalt', SH: 'Schleswig-Holstein', TH: 'Thüringen' };
  const hard = { SN: 0.45, ST: 0.5, TH: 0.6, HE: 0.7 }, confuse = { SN: 'ST', ST: 'SN', TH: 'HE', HE: 'TH' }, ids = Object.keys(states);
  for (let d = D; d >= 0; d--) {
    // (today's answers fall inside the review day, which starts at SRS.dayStart: 4:00, so not 3 hours back at 5 am)
    const n = d % 3 === 0 ? 30 : d % 2 ? 10 : 0, day = d ? now - d * DAY - 3 * 3600e3 : Math.max(SRS.dayStart(now) + 1000, now - 3 * 3600e3);
    const step = d ? 40e3 : Math.min(40e3, (now - day) / (n + 1));
    for (let i = 0; i < n; i++) {
      const id = ids[Math.floor(rnd() * ids.length)], ok = rnd() < (hard[id] ?? 0.93), g = confuse[id] || ids[Math.floor(rnd() * ids.length)];
      ANSWERS.add({ at: day + i * step, quiz: 'germany-regions', kind: 'states', item: id, look: 'quiz', mode: rnd() < 0.7 ? 'map' : 'list', review: false, replay: false, r: ok ? 0 : 1 + Math.floor(rnd() * 3), ms: 900 + rnd() * 2500, given: ok ? [] : [g], names: { [id]: states[id], [g]: states[g] }, layer: 'States' });
    }
  }
  const chunks = [];
  for (let d = D; d >= 0; d -= 2) {
    const t0 = new Date(now - d * DAY); t0.setHours(0, 0, 0, 0);
    const day = `${t0.getFullYear()}${String(t0.getMonth() + 1).padStart(2, '0')}${String(t0.getDate()).padStart(2, '0')}`;
    const c = { id: `seedrevw.${day}.0`, t0: t0.getTime(), s: ['germany-regions', 'states', 'quiz', 'map', ...ids], n: {}, a: [] };
    for (let i = 0; i < 9; i++) {
      const id = ids[(d + i) % 16], ix = 4 + (d + i) % 16, g = rnd() < 0.86 ? 1 + Math.floor(rnd() * 3) : 0, t = 8 * 3600 + i * 50;
      const iv = g ? Math.round(1440 * (2 + (D - d) / 4) * (g === 3 ? 1.6 : g === 1 ? 0.6 : 1)) : 10;
      c.a.push([t, 0, 1, ix, 2, 3, 1 | (d > D - 6 ? 4 : 0), g ? 0 : 3, Math.round(1200 + rnd() * 2000), g, iv, ...(g ? [] : [null, 4 + ids.indexOf(confuse[id] || 'BW')])]);
      if (!g) c.a.push([t + 120, 0, 1, ix, 2, 3, 3, 0, 800, 2, 1440]);
    }
    chunks.push(c);
  }
  await ANSWERS.load(chunks);
  await ANSWERS.flush(true);
  SRS.add('germany-regions', 'Germany States', ids.map(id => 'states@quiz|' + id), now, { m: 'quiz' });
  STORE.setQuiz('germany-regions', q => { Object.values(q.cards).forEach((c, i) => { c.due = new Date(now + (i % 5 === 0 ? -3600e3 : (i * 37 % 29) * DAY)).toISOString(); c.interval = 1 + i * 3; if (i % 4) delete c.step; }); q.layers = { states: 'States' }; });
  return (await ANSWERS.all()).answers.length;
});
async function stats(c) {
  const { page } = await c.open('review.html', { wait: 'main' });
  if (!(await hasLog(page)) || !(await page.locator('#tabs button[data-tab="stats"], #stats').count())) c.skip('no Stats');
  const n = await seedLog(page);
  await go(page, base + 'review.html#stats', '#stats .tile b');
  const truth = await page.evaluate(async () => {
    const { answers } = await ANSWERS.all(), today = SRS.dayStart(Date.now()), t = answers.filter(a => a.at >= today), f = t.filter(a => !a.replay);
    return { n: t.length, right: Math.round(f.filter(a => a.r === 0).length / f.length * 100) };
  });
  const tiles = await page.locator('.strip .tiles').first().locator('.tile b').allTextContents();
  c.ok(tiles[0] === truth.n.toLocaleString('en-US') && tiles[1] === truth.right + '%', 'Stats tab: today\'s answers and share right', { tiles: tiles.slice(0, 2), truth });
  c.ok(await page.locator('#stats section').nth(1).locator('.chart path.bar').count() === 30, 'Stats tab: forecast of 30 days');
  const ret = await page.locator('#stats section').nth(2).locator('.chart-head').textContent().catch(() => '');
  c.ok(/^\d+% · target/.test(ret), 'Stats tab: retention', ret);
  const empty = await page.locator('#stats .empty').allTextContents();
  c.ok(!empty.length, 'Stats tab: nothing empty', empty);
  c.notes.push(`${n} answers seeded`);
  // My stats on the quiz page: every state played coloured by its share right
  await go(page, base + STATES);
  await page.locator('#rounds .round', { hasText: 'All states' }).first().click({ position: { x: 10, y: 10 } });
  const btn = page.locator('#statsBtn');
  if (!(await btn.count()) || !(await btn.isVisible())) { c.notes.push('no My stats'); return; }
  await btn.click();
  await page.waitForSelector('#explore', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(400);
  const col = await page.evaluate(() => {
    const k = QUIZ.kinds.find(x => x.key === 'states'), ids = [...new Set(k.groups.flatMap(g => g.ids))];
    return ids.filter(id => k.areasOf(id).some(a => QUIZ_MAP.stateOf(a).some(c => ['got', 't2', 't3', 'miss'].includes(c)))).length;
  });
  c.ok(col === 16, 'My stats: the 16 states coloured', col);
}

/* ---------- g. Cards per map off: a perfect round on another map makes no new cards ---------- */
async function cardsPerMap(c) {
  const { page } = await c.open('review.html', { wait: 'main' });
  const box = page.locator('#perMap');
  if (!(await box.count())) c.skip('no Cards per map');
  await box.uncheck();
  c.ok(await page.evaluate(() => SRS.opts().perMap === false), 'the setting stored off');
  await page.evaluate(ids => SRS.add('germany-regions', 'Germany States', ids.map(id => 'states@quiz|' + id), Date.now(), { m: 'quiz' }), GERMAN_STATES);
  await go(page, base + STATES);
  const before = await page.evaluate(() => Object.keys(STORE.quiz('germany-regions').cards).length);
  const modes = await startRound(page, { round: 'East', mode: 'Map', map: 'street' });
  if (!modes.started) return c.ok(false, 'a round on the street map');
  const done = [];
  for (let n = 0; n < 20; n++) {
    if (await visible(page, 'done')) break;
    const it = await askedItem(page, 'states', 2000); if (!it) break;
    if (done.includes(it.id)) { await page.waitForTimeout(60); continue; }
    done.push(it.id); await clickItem(page, 'states', it.id);
  }
  await page.waitForSelector('#done', { state: 'visible', timeout: 5000 }).catch(() => {});
  const score = await page.locator('#rScore').textContent().catch(() => ''), line = await page.locator('#rLine').textContent().catch(() => '');
  const rec = await page.evaluate(() => STORE.quiz('germany-regions').cards), keys = Object.keys(rec);
  c.ok(new RegExp(`^${done.length} of ${done.length}`).test(score) && done.length >= 3, 'a perfect round on the street map', `${score} · ${done.length} asked`);
  c.ok(keys.length === before && !/review/.test(line), 'no new cards', `${before} → ${keys.length} · ${line}`);
  c.ok(done.every(id => rec['states@street|' + id]), 'its cards moved to the street map', keys.filter(k => k.includes('@street|')).length);
}

/* ---------- h, j. the bare map, the satellite map: switching to one shows its tiles ---------- */
async function bareMap(c, look = 'bare') {
  const { page } = await c.open(STATES);
  const btn = page.locator(`#mapSeg button[data-map="${look}"]`);
  if (!(await btn.count())) c.skip(`no ${look} map`);
  const before = { ...TILE_COUNT };
  await btn.click();
  let s = null;
  for (const t0 = Date.now(); Date.now() - t0 < 20000;) {
    s = await page.evaluate(look => {
      const el = document.getElementById(look); if (!el || el.hidden) return { n: 0, ready: 0 };
      if (el.tagName === 'CANVAS') return { n: 1, ready: el.width > 0 ? 1 : 0 };
      const imgs = [...el.querySelectorAll('.sheet:last-child img')];
      return { n: imgs.length, ready: imgs.filter(i => i.getAttribute('src') && i.complete && i.naturalWidth).length };
    }, look);
    if (s.n && s.ready === s.n) break;
    await page.waitForTimeout(150);
  }
  const on = await page.evaluate(look => ({ blind: document.getElementById('map').classList.contains('blind'), shown: !document.getElementById(look)?.hidden, others: ['streets', 'bare', 'sat'].filter(id => id !== look && document.getElementById(id) && !document.getElementById(id).hidden), pressed: document.querySelector('#mapSeg [aria-pressed="true"]')?.dataset.map }), look);
  c.ok(s && s.n > 0 && s.ready === s.n, `${look} tiles shown`, s);
  c.ok(on.blind && on.shown && !on.others.length && on.pressed === look, `the ${look} map picked and shown alone`, on);
  c.notes.push(`${s && s.n} tiles (${TILE_COUNT.cached - before.cached} recorded, ${TILE_COUNT.pixel - before.pixel} blank)`);
}

/* ---------- i. the online copy: two devices merge their cards and answer logs, nothing twice ---------- */
async function sync(c) {
  const S = await standin();
  try {
    const A = await c.open('review.html', { wait: 'main' }), B = await c.open('review.html', { wait: 'main' });
    if (!(await A.page.evaluate(() => typeof SYNC === 'object' && typeof SYNC.connect === 'function'))) c.skip('no SYNC.connect');
    const log = await hasLog(A.page);
    const day = new Date(); day.setHours(0, 0, 0, 0);
    const seed = (page, n, from, mode, key) => page.evaluate(async ({ n, from, mode, key, log }) => {
      const ids = ['BY', 'NW', 'HE', 'SN', 'TH', 'BB'];
      if (log) { for (let i = 0; i < n; i++) ANSWERS.add({ at: from + i * 60000, quiz: 'germany-regions', kind: 'states', item: ids[i % 6], look: 'quiz', mode, r: i % 4 === 0 ? 1 : 0, ms: 900 + i, given: i % 4 === 0 ? [ids[(i + 1) % 6]] : [], names: { [ids[i % 6]]: 'Name ' + ids[i % 6] } }); await ANSWERS.flush(true); }
      SRS.add('germany-regions', 'Germany States', [key], Date.now(), { m: 'quiz' });
    }, { n, from, mode, key, log });
    await seed(A.page, 40, day.getTime() - 864e5 + 3600e3, 'list', 'states@quiz|BY');
    await seed(B.page, 25, day.getTime() + 60e3, 'type', 'states@quiz|NW');
    const talk = async page => { const fault = await page.evaluate(u => SYNC.connect(u), S.url); await page.waitForTimeout(200); return fault; };
    const count = page => page.evaluate(async log => {
      const cards = Object.keys((STORE.quiz('germany-regions') || {}).cards || {}).sort();
      if (!log) return { cards };
      const { answers } = await ANSWERS.all(); return { cards, n: answers.length, uniq: new Set(answers.map(a => a.at + a.item + a.mode)).size };
    }, log);
    for (const [who, d] of [['A', A], ['B', B], ['A', A]]) c.ok(!(await talk(d.page)), `${who} connects`);
    for (let round = 0; round < 2; round++) {
      const a = await count(A.page), b = await count(B.page), want = ['states@quiz|BY', 'states@quiz|NW'];
      const tag = round ? ' (talked again)' : '';
      c.ok(want.every(k => a.cards.includes(k)) && want.every(k => b.cards.includes(k)), 'both devices have both cards' + tag, { a: a.cards, b: b.cards });
      if (log) c.ok(a.n === 65 && a.uniq === 65 && b.n === 65 && b.uniq === 65, 'both logs whole, nothing twice' + tag, { a, b });
      if (!round) { await talk(A.page); await talk(B.page); await talk(A.page); }
    }
    if (!log) c.notes.push('no answer log: cards only');
  } finally { S.server.close(); }
}

/* ---------- running: the long checks first, the page loads between them; at most JOBS pages at once ---------- */
const CHECKS = [
  ['c', 'draw', draw], ['e', 'review', review], ['f', 'stats', stats], ['g', 'cards per map off', cardsPerMap],
  ['d', 'name it, shape', nameShape], ['b', 'map answers, hard mode', mapAnswers], ['h', 'bare map', bareMap], ['j', 'satellite map', c => bareMap(c, 'sat')], ['i', 'sync', sync],
].filter(([k]) => !ONLY || ONLY.includes(k));
const results = {};
function report(k, name, r) {
  results[k] = { name, ...r };
  const tag = r.status.padEnd(5), notes = r.notes && r.notes.length ? '  · ' + r.notes.join(' · ') : '';
  console.log(`${tag} ${k} ${name.padEnd(24)} ${sec(r.ms).padStart(7)}${notes}`);
  for (const f of r.fails || []) console.log(`        ✗ ${f}`.slice(0, 400));
}
async function runCheck([k, name, fn]) {
  const c = checker(), t0 = Date.now();
  let status = 'PASS';
  try {
    await Promise.race([fn(c), new Promise((_, no) => setTimeout(() => no(new Error('timed out after 120 s')), 120e3))]);
  } catch (e) {
    if (e instanceof Skip) status = 'SKIP', c.notes = [e.message];
    else c.fails.push('threw: ' + e.message.split('\n')[0]);
  }
  for (const p of c.pages) { if (status !== 'SKIP') c.ok(!p.errors.length, 'script errors', p.errors.slice(0, 3).join(' | ')); await p.ctx.close().catch(() => {}); }
  if (status !== 'SKIP' && c.fails.length) status = 'FAIL';
  report(k, name, { status, ms: Date.now() - t0, fails: c.fails, notes: c.notes });
}
const pages = !ONLY || ONLY.includes('a') ? pickPages() : [];
const loads = [];
let loadT0 = null, loadsLeft = pages.length;
const jobs = [...CHECKS.map(ch => () => runCheck(ch)), ...pages.map(p => async () => {
  loadT0 ??= Date.now();
  loads.push(await loadOne(p));
  if (!--loadsLeft) {
    const bad = loads.filter(l => !l.started || l.errors.length);
    report('a', `page loads (${loads.length})`, { status: bad.length ? 'FAIL' : 'PASS', ms: Date.now() - loadT0, notes: [[...new Set(loads.map(l => l.kind))].length + ' kinds', 'slowest ' + [...loads].sort((a, b) => b.ms - a.ms).slice(0, 3).map(l => `${l.url.replace(/^quizzes\/|\/index\.html$/g, '')} ${sec(l.ms)}`).join(', ')], fails: bad.map(l => `${l.url}: ${l.started ? '' : 'no round started; '}${l.errors.slice(0, 2).join(' | ')}`) });
  }
})];
const watchdog = setTimeout(() => {
  const left = [...CHECKS.map(([k, n]) => [k, n]).filter(([k]) => !results[k]), ...(loadsLeft ? [['a', `page loads (${loadsLeft} left)`]] : [])];
  for (const [k, n] of left) report(k, n, { status: 'FAIL', ms: Date.now() - T0, fails: ['still running at ' + sec(LIMIT)] });
  finish(true);
}, LIMIT);
let next = 0;
await Promise.all(Array.from({ length: JOBS }, async () => { while (next < jobs.length) await jobs[next++](); }));
clearTimeout(watchdog);
await finish(false);

async function finish(cut) {
  const all = Object.entries(results), total = Date.now() - T0, failed = all.filter(([, r]) => r.status === 'FAIL');
  const slow = all.filter(([, r]) => r.status !== 'SKIP').sort((a, b) => b[1].ms - a[1].ms).slice(0, 3).map(([k, r]) => `${k} ${r.name} ${sec(r.ms)}`);
  console.log(`\nslowest: ${slow.join(' · ')}`);
  console.log(`tiles: ${TILE_COUNT.cached} recorded, ${TILE_COUNT.pixel} blank`);
  console.log(`total ${sec(total)}  ${failed.length ? 'FAIL (' + failed.map(([k, r]) => k + ' ' + r.name).join(', ') + ')' : 'PASS'}${all.some(([, r]) => r.status === 'SKIP') ? '  skipped: ' + all.filter(([, r]) => r.status === 'SKIP').map(([k]) => k).join(',') : ''}`);
  if (cut) process.exit(1);
  await browser.close().catch(() => {}); server.close();
  process.exit(failed.length ? 1 : 0);
}
