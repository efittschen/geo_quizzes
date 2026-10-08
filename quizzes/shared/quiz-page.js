// The page of every quiz: the panel (setup, play, result, explore) and the map. A page says only what is its own:
// in <body>, its back link, title and credits (<a class="back">, <h1>, <p class="note">), then its scripts, this one
// first, so the panel is on screen while the data loads. The credits go to the bottom right corner of the map, as a
// © that opens them. On <body>:
//   data-dial="+49 (#)··· ····"   the frame of a phone-number question: country code, brackets around the code (#),
//                                 and the rest of the number as dots; without it the code stands alone
//   data-sign="shield"            a class for that frame, where a page's own stylesheet draws it as a road sign
//   data-page="paint"             the page of the town-name quizzes (shared/paint-quiz.js) instead of the map quizzes'
//   data-folders="Cities|Town names=../x-town-names/index.html"
//                                 folders that are pages of their own (the town names beside the cities): tabs above
//                                 Start, the one without an address being this page
//   data-kinds, data-key          see shared/area-quiz.js
// What the site keeps in the browser goes through assets/js/store.js, which every script after this one relies on:
// it is loaded from here, in place and before them, so a page does not have to name it.
document.write(`<script src="${new URL('../../assets/js/store.js', document.currentScript.src).href}"><\/script>`);
// Likewise mercator.js, which redraws a page's map in Web Mercator: the scripts that build on a map call it first.
document.write(`<script src="${new URL('mercator.js', document.currentScript.src).href}"><\/script>`);
(() => {
  const body = document.body, own = sel => body.querySelector(':scope > ' + sel);
  const back = own('a.back'), h1 = own('h1'), note = own('p.note'), title = h1 ? h1.textContent : document.title;

  const AREA = `
  <aside class="panel">
    <header class="brand"></header>

    <section id="setup" class="setup">
      <div class="group">
        <h2>Choose a round</h2>
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
      <div class="group" id="helpWrap">
        <h2>Help</h2>
        <label class="toggle" id="optColorsWrap"><input type="checkbox" id="optColors" checked> <span id="optColorsText"></span></label>
        <label class="toggle" id="optDetailWrap"><input type="checkbox" id="optDetail"> <span id="optDetailText"></span></label>
        <label class="toggle" id="optLettersWrap" hidden><input type="checkbox" id="optLetters"> <span id="optLettersText"></span></label>
      </div>
    </section>

    <section id="play" class="group" hidden>
      <button class="photo" id="photo" type="button" aria-label="Enlarge the picture" hidden><img id="photoImg" alt=""></button>
      <div class="bigname" id="bigname" aria-live="polite" hidden></div>
      <div class="card" id="card" hidden><p class="sent" id="sent" dir="auto" aria-live="polite"></p></div>
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
      <div class="row">
        <button class="primary" id="startBtn" type="button">Start</button>
        <button class="ghost" id="exploreBtn" type="button">Explore</button>
      </div>
      <p class="toast" id="toast" role="status" aria-live="polite"></p>
    </div>
  </aside>

  <main class="stage" id="stage">
    <svg id="map" class="hints" preserveAspectRatio="xMidYMid meet">
      <g id="ctx"></g>
      <g id="regions"></g>
      <g id="borders"></g>
      <g id="hl"><path id="hoverUse" d=""/><path id="ansUse" d=""/></g>
      <g id="labels"></g>
    </svg>
    <div class="zoom" id="zoomCtl" aria-label="Map zoom">
      <button id="zIn" type="button" aria-label="Zoom in">+</button>
      <button id="zOut" type="button" aria-label="Zoom out">&minus;</button>
      <button id="zFit" type="button" aria-label="Show the whole map">&#8634;</button>
    </div>
    <div id="street" hidden></div>
    <div class="maps" id="mapSeg" role="group" aria-label="Map"></div>
  </main>
`;

  const PAINT = `
  <aside class="panel">
    <header class="brand"></header>

    <section id="setup" class="setup">
      <div class="group">
        <h2>Choose a round</h2>
        <div class="rounds" id="rounds"></div>
      </div>
    </section>

    <section id="play" class="group" hidden>
      <div class="pname" id="pname" aria-live="polite"></div>
      <div class="muted" id="sQ"></div>
      <div class="stats">
        <div><b id="sCover">–</b><span>Covered</span></div>
        <div><b id="sPaint">–</b><span>Painted</span></div>
        <div><b id="sScore">–</b><span>Score</span></div>
        <div><b id="sGood">0/0</b><span>Accepted</span></div>
      </div>
      <div class="ticks" id="ticks"></div>
      <div class="feedback" id="fb" role="status"></div>
      <ul class="key" id="key" aria-label="Map colors" hidden>
        <li><i class="mine"></i>Painted</li>
        <li><i class="zone" id="keyZone"></i>80% area</li>
        <li><i class="all"></i>Places</li>
        <li><i class="asked"></i>Asked</li>
      </ul>
      <div class="row">
        <button class="primary" id="doneBtn" type="button">Done</button>
        <button class="ghost" id="clearBtn" type="button">Clear</button>
        <button class="ghost" id="endBtn" type="button">End round</button>
      </div>
    </section>

    <section id="done" class="group result" hidden>
      <div>
        <h2 id="rScore"></h2>
        <p id="rLine"></p>
      </div>
      <div class="group" id="missWrap">
        <h2>Under 50</h2>
        <div class="chips" id="chips"></div>
      </div>
      <div class="row">
        <button class="primary" id="againBtn" type="button">Play again</button>
        <button class="ghost" id="retryBtn" type="button">Retry missed</button>
        <button class="ghost" id="menuBtn" type="button">Change round</button>
      </div>
    </section>

    <section id="explore" class="group" hidden>
      <div class="group xhead">
        <div class="row">
          <button class="ghost small" id="xBack" type="button">← Rounds</button>
        </div>
        <div class="pname" id="xName"></div>
        <div class="stats">
          <div><b id="xPlaces">–</b><span>Places</span></div>
          <div><b id="xGain">–</b><span>Points</span></div>
          <div><b id="xOut">–</b><span>Outside</span></div>
          <div><b id="xCount">–</b><span>Names</span></div>
        </div>
        <div class="muted" id="xEx"></div>
      </div>
      <div class="chips" id="xParts"></div>
    </section>

    <div class="startbar" id="startbar">
      <div class="folders" id="folders" role="tablist" aria-label="Layers" hidden></div>
      <div class="row">
        <button class="primary" id="startBtn" type="button">Start</button>
        <button class="ghost" id="exploreBtn" type="button">Explore</button>
      </div>
    </div>
  </aside>

  <main class="stage" id="stage">
    <canvas id="paint" role="img"></canvas>
  </main>
`;

  const app = document.createElement('div');
  app.className = 'app'; app.id = 'app';
  app.innerHTML = body.dataset.page === 'paint' ? PAINT : AREA;
  app.querySelector('.brand').append(...[back, h1].filter(Boolean));
  // The map's corner, bottom right: its zoom buttons and, under them, the credits. The page's list of them is a ©
  // that opens on a click or when pointed at. Only OpenStreetMap asks to be named on the map itself: "© OpenStreetMap"
  // stands beside the © where the page names it for more than the street map (which carries its own line).
  const corner = document.createElement('div'), credits = document.createElement('div'), zoom = app.querySelector('#zoomCtl');
  corner.className = 'corner'; credits.className = 'credits';
  if (zoom) corner.append(zoom);
  if (note) {
    if (note.textContent.split(' · ').some(part => /OpenStreetMap/.test(part) && !/^\s*Street map/i.test(part))) credits.insertAdjacentHTML('beforeend', '<span class="osm">&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a></span>');
    note.tabIndex = 0; note.setAttribute('aria-label', 'Credits'); credits.append(note);
  }
  corner.append(credits);
  app.querySelector('.stage').append(corner);
  app.querySelector('#map, #paint').setAttribute('aria-label', `${title} map`);
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
  body.prepend(app);
})();
