// The page of every quiz: the site's header (its name, the quiz's title, the way back), the panel (setup, play,
// result, explore) and the map. A page says only what is its own: in <body>, its back link, title and credits
// (<a class="back">, <h1>, <p class="note">), then its scripts, this one first, so the panel is on screen while the
// data loads. The title and the way back go to the header; the credits to the bottom right corner of the map, as a ©
// that opens them. On <body>:
//   data-dial="+49 (#)··· ····"   the frame of a phone-number question: country code, brackets around the code (#),
//                                 and the rest of the number as dots; without it the code stands alone
//   data-sign="nz-shield"         a class for that frame where it is a road sign: ./formats.css draws each country's
//   data-han="sc"                 the shape of Chinese characters on the page: Simplified (sc), Traditional (tc);
//                                 else as Japanese draws them (../../assets/css/base.css)
//   data-folders="Cities|Town names=../x-town-names/index.html"
//                                 folders that are pages of their own (the town names beside the cities): tabs above
//                                 Start, the one without an address being this page
//   data-kinds, data-key          one config, several pages: see engine/model/quiz.js
// What the site keeps in the browser goes through assets/js/store.js, which every script after this one relies on:
// it is loaded from here, in place and before them, so a page does not have to name it.
document.write(`<script src="${new URL('../assets/js/store.js', document.currentScript.src).href}"><\/script>`);
// And answers.js, the log of every answer given (before sync.js, which sends it to the online copy too).
document.write(`<script src="${new URL('../assets/js/answers.js', document.currentScript.src).href}"><\/script>`);
// With it sync.js, the online copy of a player who named one. What it takes in shows when the page is loaded again,
// which it does by itself as long as the page wasn't touched; not during a round.
// (Not in a page the review page opens out of sight to give old review cards their map, ?cards: it talks to the
// online copy itself.)
if (window.parent === window || !new URLSearchParams(location.search).has('cards')) document.write(`<script src="${new URL('../assets/js/sync.js', document.currentScript.src).href}"><\/script>`);
window.addEventListener('geoquizzes:fresh', e => { if (document.getElementById('setup')?.hidden) e.preventDefault(); });
// And gmaps.js: Google's map as the street map, for a player who named a key of their own on the review page.
document.write(`<script src="${new URL('../assets/js/gmaps.js', document.currentScript.src).href}"><\/script>`);
// Likewise mercator.js: a map's Web Mercator projection, and where the plain map of the world lies under it.
document.write(`<script src="${new URL('lib/mercator.js', document.currentScript.src).href}"><\/script>`);
// And the map's drawing, gl-map.js (WebGL 2) and earcut.js, which cuts its fills into triangles. The engine is the
// page's last script, a module (engine/main.js, run once the page and its data are read); its modules are preloaded
// here, so they are fetched at once and not one import after another.
{
  for (const f of ['earcut.js', 'gl-map.js']) document.write(`<script src="${new URL('lib/' + f, document.currentScript.src).href}"><\/script>`);
  for (const f of ['app/app', 'app/game', 'app/review', 'app/words', 'formats/cloth', 'formats/code', 'formats/index', 'formats/name', 'formats/outline', 'formats/picture', 'formats/shape', 'formats/text', 'main', 'map/geometry', 'map/index', 'map/labels', 'map/layouts', 'map/marks', 'map/shapes', 'map/test', 'map/tiles', 'map/view', 'map/world', 'model/checks', 'model/custom', 'model/index', 'model/kinds', 'model/quiz', 'model/results', 'model/review', 'model/round', 'model/rounds', 'modes/all-areas', 'modes/draw', 'modes/index', 'modes/map-play', 'modes/map-tap', 'modes/pairs', 'modes/picks', 'modes/typed', 'screens/explore', 'screens/index', 'screens/learn', 'screens/question', 'screens/results', 'screens/setup', 'screens/setup-menu', 'screens/stats', 'storage/index']) document.head.append(Object.assign(document.createElement('link'), { rel: 'modulepreload', href: new URL(`${f}.js`, document.currentScript.src).href }));
}
// And the setup screen's own stylesheet (css/setup-menu.css: its menu, the preview, the maps as pictures, a phone's
// card), after the page's, which it builds on.
document.write(`<link rel="stylesheet" href="${new URL('css/setup-menu.css', document.currentScript.src).href}">`);
// And gamepad.js, which lets a game controller play the page as a mouse would.
document.write(`<script src="${new URL('../assets/js/gamepad.js', document.currentScript.src).href}"><\/script>`);
// And the two links that make the site an app on a phone's home screen (manifest.webmanifest and the icon for
// iPhones), and the icon in the browser's tab, which the pages in the root carry in their <head>.
for (const [rel, file] of [['manifest', 'manifest.webmanifest'], ['apple-touch-icon', 'assets/icons/apple-touch-icon.png'], ['icon', 'assets/icons/favicon-32.png']])
  document.head.append(Object.assign(document.createElement('link'), { rel, href: new URL('../' + file, document.currentScript.src).href }));
(() => {
  const body = document.body, own = sel => body.querySelector(':scope > ' + sel);
  const back = own('a.back'), h1 = own('h1'), note = own('p.note'), title = h1 ? h1.textContent : document.title;

  const AREA = `
  <aside class="panel">
    <button class="pickhead" id="pickHead" type="button" aria-expanded="false"><b></b><span class="n"></span><span class="caret" aria-hidden="true"></span></button>

    <section id="setup" class="setup">
      <div class="group" id="roundsGroup">
        <div class="rounds" id="rounds"></div>
      </div>
      <div class="custom-wrap" id="customWrap" hidden>
        <div class="group">
          <h2>What to practice</h2>
          <div class="seg" id="kindSeg"></div>
        </div>
        <div class="group">
          <div class="pick-head">
            <h2 id="pickTitle"></h2>
            <span><button class="linkbtn" id="selAll" type="button">All</button> · <button class="linkbtn" id="selNone" type="button">None</button><span id="presets"></span></span>
          </div>
          <div class="topn" id="topn">
            <span>Top</span> <input type="number" id="topN" min="1" value="20" inputmode="numeric" aria-label="How many">
            <span>by</span> <select id="topBy" aria-label="Rank by"></select>
            <button class="ghost small" id="topGo" type="button">Select</button>
          </div>
          <div class="groups" id="groups"></div>
        </div>
        <div class="group">
          <h2>Save or share it</h2>
          <div class="save">
            <input type="text" id="saveName" maxlength="40" placeholder="Name your quiz" aria-label="Quiz name">
            <button class="ghost small" id="saveBtn" type="button">Save</button>
            <button class="ghost small" id="shareBtn" type="button">Copy link</button>
          </div>
        </div>
      </div>
    </section>

    <section id="play" class="group" hidden>
      <button class="photo" id="photo" type="button" aria-label="Enlarge the picture" hidden><img id="photoImg" alt=""></button>
      <div class="bigname" id="bigname" aria-live="polite" hidden></div>
      <div class="card" id="card" hidden><p class="sent" id="sent" dir="auto" aria-live="polite"></p></div>
      <form class="typed" id="typedForm" hidden><input type="text" id="typed" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" aria-label="Answer"><button class="listbtn" id="typedListBtn" type="button" aria-controls="typedList" aria-expanded="true" hidden><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6l4.5 4.5L12.5 6"/></svg></button><button class="primary small" type="submit">OK</button><button class="ghost small" id="giveUpBtn" type="button" hidden>Give up</button></form>
      <div class="picklist" id="typedList" role="listbox" aria-label="Answers to pick from" hidden></div>
      <button class="primary" id="checkBtn" type="button" hidden>Check</button>
      <div class="dial" id="dial" aria-live="polite"></div>
      <p class="ask" id="ask"></p>
      <div class="stats">
        <div><b id="sQ">1/10</b><span>Question</span></div>
        <div><b id="sScore">0</b><span>First try</span></div>
        <div><b id="sStreak">0</b><span>Streak</span></div>
        <div><b id="sTime">0:00</b><span>Time</span></div>
      </div>
      <div class="ticks" id="ticks"></div>
      <div class="feedback" id="fb" role="status"></div>
      <div class="row">
        <button class="ghost" id="soundBtn" type="button" hidden></button>
        <button class="ghost" id="restartBtn" type="button">Restart</button>
        <button class="ghost" id="endBtn" type="button">End round</button>
      </div>
    </section>

    <section id="done" class="group result" hidden>
      <div>
        <h2 id="rScore"></h2>
        <p id="rLine"></p>
      </div>
      <ul class="legend" aria-label="Map colors">
        <li><i class="got"></i>First try</li>
        <li><i class="t2"></i>Second try</li>
        <li><i class="t3"></i>Third try</li>
        <li><i class="miss"></i>Shown</li>
      </ul>
      <div class="group" id="missWrap">
        <h2>Missed</h2>
        <div class="chips" id="chips"></div>
        <p id="rPick" class="muted"></p>
      </div>
      <div class="row">
        <button class="primary" id="againBtn" type="button">Play again</button>
        <button class="ghost" id="retryBtn" type="button">Retry missed</button>
        <button class="ghost" id="menuBtn" type="button">Change round</button>
      </div>
    </section>

    <section id="explore" class="group info" hidden>
      <div class="dial" id="eDial"><span class="code" id="eCode">--</span></div>
      <div class="feedback" id="eInfo"></div>
      <div class="row"><button class="ghost" id="eBack" type="button">Back</button></div>
    </section>

    <div class="startbar" id="startbar">
      <div class="folders" id="folders" role="tablist" aria-label="Layers" hidden></div>
      <div class="ways" id="ways" role="group" aria-label="Ways to play"></div>
      <div class="opts" id="opts"></div>
      <div class="row">
        <button class="primary" id="startBtn" type="button">Start</button>
        <button class="prevbox" id="previewBtn" type="button" aria-pressed="true"><i class="box"></i>Show preview</button>
        <button class="ghost" id="learnBtn" type="button" hidden>Learn</button>
      </div>
      <p class="toast" id="toast" role="status" aria-live="polite"></p>
    </div>
  </aside>

  <main class="stage" id="stage">
    <svg id="map" class="hints" preserveAspectRatio="xMidYMid meet">
      <g id="ctx"></g>
      <g id="regions"></g>
      <g id="borders"></g>
      <g id="hl"><path id="askCtx" d=""/><path id="askUse" d=""/><path id="askLine" d=""/><path id="hoverUse" d=""/><path id="ansUse" d=""/></g>
      <g id="labels"></g>
    </svg>
  </main>
`;

  const app = document.createElement('div');
  app.className = 'app'; app.id = 'app';
  app.innerHTML = AREA;
  // The header, as the site's other pages have it: the site's name (home), the quiz's title, and at the right the way
  // back (only its arrow on a narrow screen). Where the title would be cut, the site's name gives way to its globe first.
  const head = document.createElement('header'), row = document.createElement('div'), home = document.createElement('a'), nav = document.createElement('nav');
  head.className = 'qbar'; head.id = 'qbar'; row.className = 'qbar-row'; home.className = 'qbar-home';
  home.href = new URL('../index.html', document.currentScript.src).href; home.setAttribute('aria-label', 'Geo Quizzes');
  { const globe = document.createElement('span'), word = document.createElement('span'); globe.textContent = '🌍'; word.className = 'word'; word.textContent = ' Geo Quizzes'; home.append(globe, word); }
  row.append(home); if (h1) row.append(h1);
  if (back) {
    const long = document.createElement('span'), short = document.createElement('span');
    long.className = 'long'; long.textContent = back.textContent; short.className = 'short'; short.textContent = '←'; short.setAttribute('aria-hidden', 'true');
    back.setAttribute('aria-label', back.textContent.replace(/^←\s*/, 'Back to ')); back.replaceChildren(long, short); nav.append(back);
  }
  head.append(row, nav);
  { const fit = () => { const t = head.querySelector('h1'); head.classList.remove('globe'); if (t && t.scrollWidth > t.clientWidth) head.classList.add('globe'); };
    if (window.ResizeObserver) { const ro = new ResizeObserver(fit); ro.observe(head); if (h1) ro.observe(h1); }
    if (document.fonts) document.fonts.ready.then(fit); }
  // The map's corner, bottom right: the credits, the page's list of them a © that opens on a click or when pointed at.
  // Only OpenStreetMap asks to be named on the map itself: "© OpenStreetMap" stands beside the © where the page names
  // it for more than the street map (which carries its own line).
  const corner = document.createElement('div'), credits = document.createElement('div');
  corner.className = 'corner'; credits.className = 'credits';
  if (note) {
    if (note.textContent.split(' · ').some(part => /OpenStreetMap/.test(part) && !/^\s*Street map/i.test(part))) credits.insertAdjacentHTML('beforeend', '<span class="osm">&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a></span>');
    note.tabIndex = 0; note.setAttribute('aria-label', 'Credits'); credits.append(note);
  }
  corner.append(credits);
  app.querySelector('.stage').append(corner);
  app.querySelector('#map').setAttribute('aria-label', `${title} map`);
  // the frame of a phone-number question
  const dial = app.querySelector('#dial');
  if (dial) {
    const [, cc, open, close, rest] = (body.dataset.dial || '#').match(/^(?:(\S+) )?(\()?#(\))?([\s\S]*)$/);
    const span = (cls, text) => { const s = document.createElement('span'); s.className = cls; s.textContent = text; return s; };
    const code = span('code', '---'); code.id = 'code';
    dial.append(...[cc && span('cc', cc), open && span('p', '('), code, close && span('p', ')'), rest && span('rest', rest)].filter(Boolean));
    if (rest) dial.lastChild.setAttribute('aria-hidden', 'true');
    if (body.dataset.sign) dial.classList.add(body.dataset.sign);
  }
  if (body.dataset.folders) {
    const folders = app.querySelector('#folders');
    folders.hidden = false;
    folders.append(...body.dataset.folders.split('|').map(f => {
      const [label, href] = f.split('='), tab = document.createElement(href ? 'a' : 'button');
      tab.textContent = label; tab.setAttribute('role', 'tab');
      if (href) tab.href = href; else { tab.type = 'button'; tab.setAttribute('aria-selected', 'true'); }
      return tab;
    }));
  }
  body.prepend(head, app);
})();
