// The quiz pages' maps as the browser makes them, here: each page's own scripts run in a sandbox (with the little of
// a page they look at), then mercator.js as area-quiz.js, city-config.js and paint-quiz.js run it. Shared by
// survey.mjs and build.mjs.
import fs from 'node:fs';
import vm from 'node:vm';
export const ROOT = new URL('../../../', import.meta.url).pathname, Q = ROOT + 'quizzes/';
const SHARED_SKIP = /\/shared\/(quiz-page|area-quiz|area-stats|area-review|map-tiles|paint-quiz)\.js$|\/assets\/js\//;
// a page's scripts, in order, as paths from the site's root ({ src } or { inline })
export function scriptsOf(page) {
  const html = fs.readFileSync(`${Q}${page}/index.html`, 'utf8'), out = [];
  for (const m of html.matchAll(/<script(?: src="([^"]+)")?[^>]*>([\s\S]*?)<\/script>/g)) {
    if (m[1]) out.push({ src: new URL(m[1], `http://x/quizzes/${page}/`).pathname.slice(1) });
    else if (m[2].trim()) out.push({ inline: m[2] });
  }
  return out;
}
// Runs a page up to its map: returns the sandbox (QUIZ, CITIES, NAMES… and MERCATOR), or throws.
export function runPage(page) {
  const scripts = scriptsOf(page);
  const el = (src) => ({ src: `http://x/${src}`, dataset: {}, getAttribute: () => null });
  let current = null;
  // (anything else a script touches on the page: a stand-in that takes every call and gives itself back)
  const any = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'then' ? undefined : any), apply: () => any, construct: () => any, set: () => true });
  const document = new Proxy({
    get currentScript() { return current; },
    querySelector: (sel) => { const m = /script\[src\$="([^"]+)"\]/.exec(sel); const s = m && scripts.find((x) => x.src && x.src.endsWith(m[1])); return s ? el(s.src) : null; },
    querySelectorAll: () => [], getElementById: () => any, createElement: () => any,
    body: { dataset: {}, classList: any, append() {}, appendChild() {} }, documentElement: { dataset: {}, lang: 'en', classList: any, style: any }, addEventListener() {},
  }, { get: (t, k) => (k in t ? t[k] : any) });
  const window = { addEventListener() {}, location: { href: `http://x/quizzes/${page}/`, search: '' }, matchMedia: () => ({ matches: false, addEventListener() {} }), localStorage: { getItem: () => null, setItem() {} } };
  const ctx = vm.createContext({ document, window, location: window.location, performance, CSS: { supports: () => true, escape: (x) => x }, FontFace: any, matchMedia: window.matchMedia, getComputedStyle: () => any, requestAnimationFrame: () => 0, requestIdleCallback: () => 0, addEventListener() {}, speechSynthesis: any, SpeechSynthesisUtterance: any, ResizeObserver: any, MutationObserver: any, IntersectionObserver: any, innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1, Image: any, fetch: () => new Promise(() => {}), console: { log() {}, warn() {}, error() {} }, URL, URLSearchParams, navigator: { language: 'en' }, localStorage: window.localStorage, setTimeout: () => 0 });
  ctx.globalThis = ctx; ctx.self = ctx;
  vm.runInContext(fs.readFileSync(Q + 'shared/mercator.js', 'utf8') + '\nthis.MERCATOR = MERCATOR;', ctx, { filename: 'shared/mercator.js' });
  for (const s of scripts) {
    if (s.src && (SHARED_SKIP.test('/' + s.src) || /shared\/mercator\.js$/.test(s.src))) continue;
    current = s.src ? el(s.src) : el(`quizzes/${page}/index.html`);
    const code = s.src ? fs.readFileSync(ROOT + s.src, 'utf8') : s.inline;
    vm.runInContext(code, ctx, { filename: s.src || `${page}/inline` });
  }
  const look = (name) => vm.runInContext(`typeof ${name} === 'undefined' ? undefined : ${name}`, ctx);
  return { ctx, scripts: scripts.filter((s) => s.src).map((s) => s.src), QUIZ: look('QUIZ'), CITIES: look('CITIES'), NAMES: look('NAMES'), look };
}
export const pages = () => fs.readdirSync(Q).filter((d) => fs.existsSync(`${Q}${d}/index.html`)).sort();
