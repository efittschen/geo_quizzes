/** @OnlyCurrentDoc */
// Geo Quizzes: a player's online copy, kept in this spreadsheet, on a sheet of its own ("Geo Quizzes"). The site
// sends what changed in a browser and asks for what changed elsewhere (assets/js/sync.js, which also says how two
// copies become one); this script only stores and hands out, and reaches nothing but this spreadsheet.
// Setup: the site's review page, "Online copy".
//
//   row 1   A: "Geo Quizzes"   B: the revision, a count of the changes taken so far
//   a row   A: what it is ("settings", "review", "quiz.<quiz id>")   B: the revision it last changed at
//           C…: its text (JSON), in pieces, since a cell holds 50,000 characters at most. Every piece starts with
//           "|", so that the sheet takes none of them for a number, a date or a formula.
//
//   GET  ?since=<revision>                    →  { app, rev, items: { <what>: value } }: the rows changed after it
//   POST { app, since: <revision>, items }    →  { app, ok, rev, items }
//        The items are taken if none of them changed here after `since`. Otherwise nothing is taken, and the site
//        sends again once it has merged what comes back: `items`, the rows changed after `since`.
//   A `since` above the revision (the sheet was emptied, or is another one) counts as none: everything comes back.
const APP = 'geo-quizzes', SHEET = 'Geo Quizzes', PIECE = 45000;
const WHAT = /^(settings|review|quiz\.[\w.-]+)$/;

function doGet(e) {
  return reply(() => {
    const s = sheet(), rev = revision(s), since = +e.parameter.since || 0;
    return { rev, items: since === rev ? {} : changed(rows(s), since > rev ? 0 : since) };
  });
}

function doPost(e) {
  return reply(() => {
    const sent = JSON.parse(e.postData.contents);
    if (sent.app !== APP || !sent.items || typeof sent.items !== 'object') throw new Error('Not a Geo Quizzes request');
    const lock = LockService.getScriptLock();
    lock.waitLock(20000); // one at a time, so two browsers cannot both count the same revision
    try { return take(+sent.since || 0, sent.items); } finally { lock.releaseLock(); }
  });
}

function take(since, items) {
  const s = sheet(), rev = revision(s), list = rows(s), others = changed(list, since > rev ? 0 : since);
  const keys = Object.keys(items).filter(k => WHAT.test(k));
  if (keys.some(k => k in others)) return { ok: false, rev, items: others };
  const next = rev + 1, rowOf = new Map(list.map(r => [r.key, r.row])), fresh = [];
  for (const k of keys) {
    const text = JSON.stringify(items[k]), line = [k, next];
    for (let i = 0; i < text.length; i += PIECE) line.push('|' + text.slice(i, i + PIECE));
    if (rowOf.has(k)) write(s, rowOf.get(k), [line]); else fresh.push(line);
  }
  if (fresh.length) write(s, s.getLastRow() + 1, fresh);
  s.getRange(1, 2).setValue(next); // last: a reader in between sees the old revision and asks again
  return { ok: true, rev: next, items: others };
}

function reply(f) {
  let out;
  try { out = f(); } catch (err) { out = { error: String((err && err.message) || err) }; }
  return ContentService.createTextOutput(JSON.stringify({ app: APP, ...out })).setMimeType(ContentService.MimeType.JSON);
}

function sheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let s = book.getSheetByName(SHEET);
  if (!s) { s = book.insertSheet(SHEET); s.getRange(1, 1, 1, 2).setValues([[SHEET, 0]]); }
  return s;
}

const revision = s => +s.getRange(1, 2).getValue() || 0;

// The rows below the first: [{ row, key, rev, text }].
function rows(s) {
  const last = s.getLastRow();
  if (last < 2) return [];
  return s.getRange(2, 1, last - 1, s.getLastColumn()).getValues()
    .map((cells, i) => ({ row: i + 2, key: String(cells[0]), rev: +cells[1] || 0, text: cells.slice(2).map(c => String(c).slice(1)).join('') }))
    .filter(r => r.key);
}

// What the rows changed after a revision hold. A row whose text was damaged by hand is left out.
function changed(list, since) {
  const items = {};
  for (const r of list) if (r.rev > since) { try { items[r.key] = JSON.parse(r.text); } catch (err) {} }
  return items;
}

// Rows are written at the sheet's full width, so that a shorter text leaves nothing of the longer one before it.
function write(s, row, lines) {
  const width = Math.max(s.getLastColumn(), ...lines.map(l => l.length)), end = row + lines.length - 1;
  if (width > s.getMaxColumns()) s.insertColumnsAfter(s.getMaxColumns(), width - s.getMaxColumns());
  if (end > s.getMaxRows()) s.insertRowsAfter(s.getMaxRows(), end - s.getMaxRows());
  s.getRange(row, 1, lines.length, width).setValues(lines.map(l => [...l, ...Array(width - l.length).fill('')]));
}
