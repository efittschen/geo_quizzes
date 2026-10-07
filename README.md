# Geo Quizzes

GeoGuessr-style quizzes for countries around the world. The home page is a clickable world map; clicking a country opens its page with a list of its quizzes.

Plain HTML/CSS/JS — no build step, so it runs directly on GitHub Pages.

## Structure

```
index.html              Home page with the world map
country.html            Country page (lists quizzes for ?code=<ISO numeric>, for ?area=World or a continent, or for ?suite=Beginner)
quiz.html               Quiz page (loads a quiz from ?id=<id>)
review.html             Review page: learned questions that are due again (see "Review")
coverage.html           Coverage page: the world with Google Street View coverage drawn on it (see "Coverage")
assets/css/base.css     Shared style for every page: colors (light + dark), fonts, buttons
assets/css/style.css    Home, country and multiple-choice quiz pages
assets/js/map.js        Map rendering (D3 + TopoJSON, loaded from CDN)
assets/js/quiz.js       Quiz logic
assets/js/store.js      What the site keeps in the browser: one record per quiz, the settings, the data file (see "Saved data")
assets/js/srs.js        Review: the schedule and the stack of learned questions
data/quizzes.json       List of all quizzes and which country each belongs to
data/suites.json        The suites: short lists of quizzes to play in order (see "Suites")
data/coverage/          Street View coverage: map tiles and meta.json for the Coverage page, home/ for the home map (made by tools/coverage.mjs)
data/quizzes/<id>.json  One file per multiple-choice quiz
quizzes/<name>/         Quizzes with their own custom page
```

## Run locally

The pages load JSON with `fetch`, which doesn't work from `file://`. Start a local server from the project folder:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Add a quiz

A country can have any number of quizzes. Clicking a country on the map lists them.

1. Create `data/quizzes/<id>.json`. The id is lowercase letters, numbers and dashes, e.g. `brazil-license-plates`:

   ```json
   {
     "title": "Brazil: license plates",
     "description": "Short intro shown under the title.",
     "questions": [
       {
         "question": "Which side of the road does Brazil drive on?",
         "options": ["Right", "Left"],
         "answer": 0,
         "explanation": "Optional text shown after answering.",
         "image": "images/brazil-road.jpg",
         "imageAlt": "Optional description of the image"
       }
     ]
   }
   ```

   `answer` is the index of the correct option (0 = first). Options are shuffled when shown. `explanation`, `image` and `imageAlt` are optional.

2. Add it to `data/quizzes.json`:

   ```json
   {
     "quizzes": [
       {
         "id": "brazil-license-plates",
         "country": "076",
         "title": "License plates",
         "levels": 2,
         "description": "Optional one-liner."
       }
     ]
   }
   ```

   `levels` is how many stars the quiz has: one per difficulty level up to its hardest round (Beginner 1, Intermediate 2, Hard 3, Expert 4). A level's star is earned when every round of that level is played perfectly; the quiz page saves this progress in the browser, and the home and country pages show it.

   `role` says what a quiz is for its country, which sets where it stands on the country's page: `"regions"` first, then `"cities"` (with the `"names"` quiz, the town names, inside its entry: they are two folders of one thing, and each of the two pages has a tab to the other, `data-folders` on `<body>`), then the codes, `"area-codes"` and `"postcodes"`. A quiz without a role is special to its country and comes after them. The page shows them in three groups, each under its heading: Basics (regions, cities, town names), Codes and Extra.

   `country` is the country's [ISO 3166-1 numeric code](https://en.wikipedia.org/wiki/ISO_3166-1_numeric) as a 3-digit string (keep leading zeros, e.g. `"076"` for Brazil). That's how the map knows which country the quiz belongs to. A quiz covering several countries can list them all, e.g. `["356", "524"]`, and give an `area` name for the "All quizzes" list.

   `"hidden": true` sets a quiz aside: its page stays and still opens by its address, but the home page, the country pages, the suites and the reviews leave it out, as if it weren't listed (`loadIndex` in `assets/js/common.js`). Roads, bollards, companies (power, lines, bins), the Red Line and the Mennonite colonies are hidden for now, to be looked at one by one.

   A quiz about the whole world or a whole continent has a `scope` instead of a `country`: `"World"`, or the continent's name as in `continents` (`"Europe"`). The home page links the world and each continent with such quizzes above the map (`country.html?area=Europe`), and "All quizzes" lists them first: the world in a folder of its own, a continent's before its countries.

### Suites

A suite is a short list of quizzes to play in order. The home page links the suites above the map, and a suite's page lists its quizzes, numbered (`country.html?suite=Beginner`). They are in a file of their own, `data/suites.json`, each a list of quiz ids from `data/quizzes.json`:

```json
{ "suites": [{ "name": "Beginner", "title": "Which country", "quizzes": ["world-countries", "world-driving-side"] }] }
```

The three suites follow the order in which guides teach the game (the [Plonk It beginner's guide](https://www.plonkit.net/beginners-guide): country recognition first, then basic regionguessing in the bigger countries, then the fine detail):

- **Beginner**, which country: where the Street View countries are, then the clues seen in most rounds: driving side, script and language, bollards; then flags, domains and calling codes.
- **Intermediate**, which region: the states or regions of the ten largest countries with Street View (US, Russia, Brazil, Canada, Australia, India, Indonesia, Mexico, Argentina, Kazakhstan), and India's scripts.
- **Hard**, which area code: the phone area codes of the same ten countries.

A suite's name says who it is for. It is not a round's level: inside every quiz, a round's level still comes from its size alone.

### What gets a quiz

- Only clues that can be read in Street View. No license-plate codes: plates are blurred.
- One quiz per system, with all its levels inside: an area-code quiz runs from first digit to every code (`quizzes/germany-codes/`), a regions quiz from states down to districts or municipalities (`quizzes/finland-regions/`).
- A code is built down to its finest real layer, not only its first digit.
- One kind of clue per quiz. Postcodes, power companies, sign languages and road numbers each get their own page, even when they share a map with the regions quiz (`data-kinds`, see below).

### Custom quiz pages

A quiz that needs its own interface lives in its own folder under `quizzes/` and is registered in `data/quizzes.json` with a `url`, so it opens that page instead of the multiple-choice one:

```json
{ "id": "brazil-ddd", "country": "076", "title": "Area Codes", "url": "quizzes/brazil-ddd/index.html" }
```

### Map quizzes ("click the right area")

Regions, area codes, postcodes and the other clues that share their maps are all the same quiz: layers of labels on a map, coarse to fine, each asked by name or by code. They share one engine, `quizzes/shared/area-quiz.js` (+ `area-quiz.css`), and one base script, `quizzes/shared/layer-config.js`, which builds a quiz from data alone. No such quiz has code of its own. Each quiz folder has:

- `data.js`: the map areas as SVG paths, with their fields (names, codes, the region each lies in)
- `geo.js`: the same areas as latitude/longitude polygons, used by the street map (hard mode) and the overlay
- `layers.js`: the quiz's data, `LAYERS`: for each layer its items, where they are and what is shown with them. A table is written as a pattern where one fits (`"{name}, {@city}"`); the format is described at the top of `layer-config.js`
- `style.css`: which hint color each map area gets, from the shared palette (`--h1`…`--h24` in `quizzes/shared/area-quiz.css`). The palette has no greens, yellows, oranges or reds, so hints never look like the answer colors, and hints fade while playing
- `index.html`: the page, which holds only what is its own: the head (title, fonts, stylesheets), the back link, the title and the credits, and its scripts. The panel and the map are the same on every quiz page and come from `quizzes/shared/quiz-page.js`, the first script a page loads (so the panel is on screen while the data loads). Two things are said on `<body>`: `data-dial="+49 (#)··· ····"`, the frame of a phone-number question (country code, brackets around the code, the rest as dots), and `data-page="paint"` on the town-name pages, which have another panel

Rounds are not in the data. The engine makes them by one rule for every such quiz (`standardRounds` in `area-quiz.js`):

- A layer of under 10 items is one round, named after the layer ("First digit", "States").
- A bigger layer is cut by the layers above it and by its own groups, and ends with all of it ("All Kreise"). Names get one round per unit of 3 items or more ("Bavaria"; and "West", "East" from the layer above that). Codes are cut by the first digit, neighbours joined while a round stays under 30 ("First two digits · 02–04").
- A layer's quick selections are rounds too ("Big cities").
- The same items in another language or under another label are not rounds of their own: they are buttons in the round's box ("English | Japanese", "Names | Letters"). A language is offered only where its script is not Latin.

18 quizzes still have a hand-written config (`quiz.js`, with its own `rounds`): 15 of the hidden ones (road numbers, power networks, US bollards), Russia's languages and Canada's sign languages, plus the South Asia scripts quiz, whose signs are drawn at random.

A quiz with a `geo.js` can be played on three maps, chosen with the picker on the map itself (bottom left, on the setup screen): the **quiz map** (the areas with their borders and colors), the **street map** (hard: nothing but the map itself) and the **overlay** (the street map with the quiz map's outlines and colors on it). The overlay behaves like the quiz map: areas outside the round are dimmed, the "color areas" option applies, groups of areas are drawn as one shape, and the labels show. The street map uses standard OpenStreetMap tiles (free for light use, credited on the page). The map buttons are built by the engine.

A quiz with several layers shows them as folders: tabs under the list of rounds, just above Start, one per layer ("Regions", "Départements"; "First digit", "Area codes"). The open folder lists its own rounds, its saved quizzes and a custom quiz of its kind; the star at a level's heading is that folder's. A quiz with one layer has no tabs.

Rounds are listed by size: Beginner (under 10 items), Intermediate (under 30), Hard (under 60) and Expert. Size alone sets a round's level. A hand-written config lists its rounds: a round is a kind plus the items to ask, e.g. `{ kind: 'codes', label: 'Southeast', groups: ['1x', '2x', '3x'] }`, `{ kind: 'codes', label: '20 largest areas', top: 20 }` or `{ kind: 'codes', label: 'Big cities', preset: 'Big cities' }`. The map (quiz map, overlay or street map) is chosen separately and works with any round; best scores are kept per map. A round can come in several languages (a kind that is `of` another kind, each with its `lang`): its box then has a button per language, and the rounds are written once. Players can also build a custom quiz, save it under a name (in their browser) and share it as a link.

When a mode's answers are groups of areas (first-digit or two-digit zones, states, federal districts), the quiz map and the overlay draw each group as one shape: only the group's outline, in one color. Zones keep their hint color when they fit inside one (two-digit zones colored by first digit); named places like states get a color each, different from their neighbours. Set `merge: false` on a kind to keep every area separate, or `unitColors(areas)` to choose the colors a group can take (Australia uses its area-code shades).

One set of data can serve several pages. The page's `<body>` lists which question types it shows and where it saves scores, e.g. `quizzes/brazil-states/index.html` reuses Brazil's files with `<body data-kinds="states" data-key="dddstates">`, while the area-code page has `<body data-kinds="codes digits">`.

### City quizzes ("click the city")

`quizzes/<country>-cities/` asks for a country's largest cities: the top 200 by population plus every capital. Each city is a dot on the country's map with its regions drawn in. The dots keep their size on screen at every zoom, so crowded areas come apart when you zoom in. A city is asked by its English name. Where the local language is written in another script than Latin (Thai, Russian, Japanese…), every round also offers that language: its box has a button per language, where a round's small label would be, and the language picked last is the one every box starts with. A round in the local language asks the round's cities that have a name in it, so its count can be lower (Cambodia, Malaysia's Jawi). Names in Latin letters get no second language: they are nearly always the English name again. Rounds go from the 8 largest cities to all of them, and custom quizzes can be grouped by region.

City quizzes can be played two ways, chosen with the same picker on the map: **Map** (the default; no dots: click anywhere on the map) or **Dots** (click the city's dot, three tries). Map play scores each answer by distance like GeoGuessr, 5000 · e^(−10 · d / D) with D the map's diagonal in km, and shows the city, the distance and the points. The distance shown is the real one: the click is turned back into a place on Earth with the map's projection. An answer of 4,000 points or more counts as close; a round with only close answers counts as perfect for the stars. Best scores are kept per way of playing. Cities that share a name are asked with their region ("Portland, Oregon").

Insets (Alaska and Hawaii, the Azores and Madeira, Rapa Nui, San Andrés, the Galápagos, the Chatham Islands) are found automatically: a city whose x/y is not where the projection puts it belongs to an inset. Inside an inset, points follow the distance as drawn, so it is as forgiving per pixel as the main map; a click on the main map for an inset city (or the reverse) scores by the real distance. Inset cities drawn at another scale carry `k` (km per map unit) in cities.js.

The US list follows a different order: how often a city is the name on direction signs. In every 100 km square, the place named on OpenStreetMap direction signs (destination tags) in the most 10 km cells gets a point, and the runner-up half a point; squares without tagged signs are decided by a pull model (big and close places win each direction). The 200 places with the most points come first, then the state capitals. A cities.js marks such an order with `order: 'signs'`; custom quizzes can then take the top N by that order or by population.

A page needs only `cities.js` (the data, made by `tools/cities.mjs`), an optional `CITY_OPTS` (e.g. `{ key: 'thcities', lang: 'Thai' }`; `lang` names the local language and is set only when its script is not Latin), `shared/city-config.js` (which builds the quiz config) and the usual engine. Copy `quizzes/thailand-cities/index.html`. Cities come from GeoNames (CC BY 4.0) and names from Wikidata (CC0). There is no street map, because its tiles print the city names.

### Postcode quizzes

`quizzes/<country>-postcodes/` (also `us-zip`, `india-pin`) ask for the zone of a postcode's first digits: one level per prefix length ("First digit", "Two digits", "Three digits"), or one level of letter zones (UK postcode areas, Canadian postal districts). They share one config, `quizzes/shared/post-config.js`, which builds the quiz from a map and `post.js` (made by `tools/postcodes.mjs` from the GeoNames postal codes, CC BY 4.0). A page sets `POST_OPTS = { key: 'depost' }` and loads the map, `post.js`, `post-config.js` and the engine. Copy `quizzes/germany-postcodes/index.html`.

The zones are drawn in one of two ways. Where a map with small areas exists (municipalities, districts, area-code areas), those areas are the building blocks and the page loads that map: each area gets the zones of the postcodes inside it, so an area on a zone border answers for both. Otherwise the zones get a map of their own: each point of land belongs to the zone of the nearest postcode, state by state, so zones that follow state lines get the real line. Either way the borders are approximate and the page says so.

Three countries get more than the standard file. The UK is drawn from every unit postcode (GeoNames' full file, `--full`), so the lines between areas hold in central London too. In the US and Australia whole zones are PO boxes or single organisations with no land; `--areas` takes the list of postcodes that have an area (Census Bureau ZIP Code Tabulation Areas, ABS Postal Areas, fetched by `tools/builds/postcodes/areas.mjs`) and leaves out the zones with none. A zone too small for the map's simplifying (a campus, a few suburbs inside a city's zone) keeps its own shape, drawn finer and above its neighbours.

Brazil is the one country not drawn from GeoNames, which has a single postcode per municipality there. Its zones come from the address register of the 2022 census (IBGE, CNEFE: every address with its CEP and coordinates), turned into points by `tools/builds/postcodes/brazil-cnefe.mjs` and given to `tools/postcodes.mjs` with `--points`.

### Picture quizzes ("which country is this?")

`quizzes/world-bollards/` shows a picture of a bollard; the answer is a click on its country on a world map. The same quiz has a page per continent (`quizzes/europe-bollards/` …, `<body data-scope="Europe">`), which keeps that continent's pictures and frames it. The pictures and their data come from [geohints.com/meta/bollards](https://geohints.com/meta/bollards): 949 pictures of 109 countries and territories, each with its rarity there (Common, Uncommon, Rare), some with a note (the US states a bollard is found in), all with their Street View link. geohints states no license for them; the pages credit it.

The rounds are about the common pictures (a country's standard bollard), and size alone sets their level, as everywhere. So the common pictures come in small sets of neighbours, each under 10 (`REGIONS` in `shared/photo-config.js`: "Benelux & France", "Balkans & Turkey", "Southeast Asia" …), then in parts of a continent (under 30: "Northern Europe"), then by continent ("Europe", 54), then all 70. Each such round frames its part of the map (a round's `box`), and every round has pictures of at least two countries. The world page ends with all 949 pictures; a continent page adds its uncommon pictures, its rare ones and everything, each as one round. Continents are geohints' (Russia under Asia, Turkey under Europe). Custom quizzes pick pictures by country, with Common / Uncommon / Rare as quick selections. A click on the picture enlarges it; once answered it comes with its country, rarity and Street View link. Missed pictures are listed as pictures, and Explore shows every picture of the country clicked.

The map is `quizzes/shared/world.js` (made by `tools/worldmap.mjs` from Natural Earth): every country, with places GeoGuessr treats as their own cut out of their country (Réunion, Svalbard, Christmas Island). Places too small to hit (Monaco, Jersey, Gibraltar) are dots that keep their size on screen (`dot: true` on an area). Countries without pictures are plain land. An answer that has to be shown is flown to when the view doesn't show it (`flyAnswer`), and the next question returns to the view before.

A page needs `shared/world.js`, the quiz's `photos.js` and `img/` (made by `tools/geohints.mjs`), an optional `PHOTO_OPTS` (e.g. `{ key: 'bollards', noun: ['bollard', 'bollards'] }`), `shared/photo-config.js` (which builds the quiz config), `shared/photo-quiz.css` and the usual engine. Copy `quizzes/world-bollards/index.html`. Any kind of any map quiz can ask with pictures: `prompt: 'photo'` and `photo(id)`. `quizzes/us-bollards/` does, on the US map: the US bollards that name their states, answered by a click on one of them.

### World quizzes ("which country?")

`quizzes/world-countries/`, `world-flags/`, `world-domains/`, `world-calling-codes/`, `world-driving-side/` and `world-languages/` ask for countries on the world map (`shared/world.js`). They share one config, `quizzes/shared/world-config.js`, which builds the quiz from the facts about every place in `shared/world-facts.js` (made by `tools/worldfacts.mjs`): which places have Street View (those with a [Plonk It guide](https://www.plonkit.net/guide)), which drive on the left (Wikidata), their domain and calling code ([mledoze/countries](https://github.com/mledoze/countries), ODbL) and their flag ([flag-icons](https://github.com/lipis/flag-icons), MIT, copied to `world-flags/img/`).

The rounds are about the places with Street View, the ones a player can land in, and size alone sets their level, as everywhere. So those places come in small sets of neighbours, each under 10 (`REGIONS` in `world-config.js`: "Nordics", "Southern Cone" …), then in parts of a continent, then by continent, then all 131; the last round asks every place on the map. Each such round frames its part of the map. Custom quizzes pick from every place, by region.

- **Countries**: a name, click the country.
- **Flags**: a flag, click a place that flies it. A place whose only official flag is its country's (Réunion, Svalbard) answers for that flag.
- **Domains**: a top-level domain (`.de`), click its country. Places without a domain in use (Kosovo, Svalbard) are left out.
- **Calling Codes**: a code (`+49`), click a place that dials it. Shared codes are one question (`+7` Russia and Kazakhstan, `+44` the UK and the Crown Dependencies); North American numbers outside the US and Canada are asked with their area code (`+1 876`).
- **Driving Side**: a part of the world, click every place in it that drives on the left (`clickAll`). Every place stays lit, and a right-driving place is a wrong click.
- **Scripts & Languages**: a few words as written on signs, click a place where they are written. Scripts come first (Cyrillic, Thai, Arabic …), then the languages that share a script (Latin, Cyrillic, Arabic, Devanagari, Chinese), told apart by their letters. The words, the letters that give a language away and the places are in `world-languages/data.js`; a sign is drawn anew from a language's words every time it is asked, and its meaning comes with the answer. India's regional scripts are one item here: `south-asia-scripts/` tells them apart.

A page loads `shared/world.js`, `shared/world-facts.js`, sets `WORLD_OPTS = { type: 'flags', key: 'world-flags' }` and loads `shared/world-config.js`, `shared/photo-quiz.css` (the dots for small places), `shared/world-quiz.css` and the usual engine. Copy `quizzes/world-domains/index.html`.

### Town-name quizzes ("paint the region")

`quizzes/<country>-town-names/` shows a real place name with one part of it marked ("Hammoor") and asks where names with that part are found. The answer is painted on the map with one broad brush; Clear starts over. Done lights up every place with the part, the one that was asked in green for a while. The score says whether the player knew where to look: the share of the part's places covered minus the share of all places painted (a random patch gives nothing, the right region nearly everything, however generously painted), as a percentage of what painting exactly the part's 80% area gets (the smallest area that holds 80% of the part's places, smoothed; see below). 50 or more is accepted (`PASS` in `shared/paint-quiz.js`); the 80% area itself is not shown.

The places are GeoNames' populated places without the sections inside a city: GeoNames lists the neighbourhoods of some cities one by one, and Kobe's streets alone made "-dori" look like a pattern of western Japan. A city is a place of 100,000 people or more, reaching 5 km from its middle at that size and further with the root of its size (19 km for Kobe); sections outside cities stay, as some countries file their rural localities under the same code (Chile, Hungary's tanyák, Paraguay's compañías). The parts are endings and beginnings of 2 to 7 letters and separate words of names of several words. Which ones are asked is decided over all countries at once (`tools/builds/town-names/choose.mjs`, which runs `ratio.py` per country), by smoothed ratio maps: a part's places and all places are each smoothed with one Gaussian width per country (the best leave-one-out width for 60 random places, the median of 30 tries), and the map of the part over all places shows where it is more common (red) and less common (blue). A part needs 200 places or more; its bits (how far its smoothed places differ from all places) are counted from what a random set of as many places gets; it may have one or two red regions (squares at least 1.2 times as common as among all places, holding 3 of its places or more; shown only where all places are at least 1/22 as dense as around the median place); its clarity (the share of its places in those regions minus the share of all places there) must be 0.35 or more; and the largest blank piece of land (outside the smallest area holding 90% of its smoothed places, pieces joined across up to one width of sea) must be 30% of the country or more. Of spellings that share their places, nearly the same places keep the longer spelling, a narrower spelling stays beside a broader one when it has 1.1 times its bits beyond chance, and the broader one only while its places without the narrower ones would be a part of their own (0.3 bits and every gate above: so -ing stays and -ng goes, -itz stays and -tz goes). Of all parts kept in all countries, the 500 with the highest split × share are asked: split is the harmonic mean of the largest piece of the area holding 50% of the part's smoothed places and of the largest blank piece (both as shares of the land), share how many of the country's places have the part. Each part carries how many places have it, how much of all places lies outside its 80% area, and the side of the country it is on (north, east, south or west: where the middle of its places lies from the middle of the country). (Without `choose.mjs`'s file, `tools/townnames.mjs` still picks by its older rule: the points a part adds to a guess, `tools/lib/names.mjs`.)

The rounds, and size alone sets their level, as everywhere: Common, the 9 parts with the most places (in a country with 10 or more, so it is a level below All); one round per side of the country (north, east, south, west), with every part on that side, when that is 3 or more and not all of them; and always All, last. A round with every drawing accepted is perfect; best results and stars are kept like those of the map quizzes (`geoquizzes.rating.<id>`).

The round chosen on the setup screen is previewed on the map: every part as its 80% area, the area a drawing is graded against (drawn on the land only; a part without one, from `tools/townnames.mjs`'s older rule, as a blob: one smooth area around its places, strays left out), in a hint colour of its own, with its label where the part is thickest. Of a round with more than 30 parts the 30 with the most places are drawn. Pointing at a shape or a label (or touching it) shows that part alone, which is how the broad, overlapping parts are told apart. The same preview comes back with a round's result. **Explore** (next to Start) shows the chosen round without the quiz: every one of its parts on the map (paler, labelled where there is room) and in a list with its number of places. Pointing at a part, on the map or in the list, shows it alone with its places, the points it gains, how much of all places lies outside its 80% area and six of its names; a click keeps it.

The aim is the part's 80% area: on its smoothed map, the squares holding most of its places, taken until they hold 80% of them. What that area holds of the part's places and of all places is what a perfect drawing gets; a drawing is graded against it (`ratio.py` works it out, `tools/townnames.mjs` writes it as `cover` and `painted`).

It has its own small script, not the map-quiz engine: no custom quizzes, no review. Opened with `?trace` from `node tools/draw-server.mjs`, the page shows the places from the start and keeps every drawing in `tools/cache/drawings/`, to compare what a person draws with the ideal. A page needs the country's `cities.js` (its map: outline, region borders, neighbours; the town-name file does not repeat it), `names.js` (made by `tools/townnames.mjs` on that map), `shared/area-quiz.css` (the layout), `shared/paint-quiz.css`, `shared/quiz-page.js` (with `data-page="paint"` on `<body>`) and `shared/paint-quiz.js`. `tools/builds/town-names/choose.mjs` (Python 3 with numpy, scipy and matplotlib in `tools/cache/pyenv`) picks the parts, then `tools/builds/town-names/build.mjs` makes the quiz for every country that has a cities quiz (data, page and the entry in `data/quizzes.json`); with `--pages` it only writes the pages and the entries again; a country with fewer than 3 chosen parts gets none, and its folder and entry are removed (a round needs three). Places that fall off a country's map (Alaska, the Azores, other insets) are left out, a part with more than 3,000 places is written as a sample of 3,000, and 80 of a part's names are kept to ask with. Russia is read in Cyrillic; the other countries as GeoNames spells them, in Latin letters. India does not use GeoNames, which lists its states very unevenly (155,000 places in Uttar Pradesh, 1,400 in Assam): its places are the villages of the Local Government Directory and, for the states that file lacks (Himachal Pradesh, Jammu and Kashmir, Ladakh, Sikkim and the north-east apart from Assam and Tripura), the habitations of the rural roads programme (PMGSY). `tools/builds/town-names/india-places.mjs` makes that list and has to run before India is built.

## Review (spaced repetition)

Every question of a map quiz is a card. A round played perfectly (every answer right on the first try; "retry missed" rounds don't count) puts its questions on the stack. From then on they come back on Anki's schedule: its SM-2 scheduler with the default settings, without the random spread of intervals, so questions learned together stay due together. A new card is due after 1 minute, then after 10 minutes, then the next day; from there the interval grows (3, 7, 17, 42… days when always known; ease 2.5, unsure × 1.2). A miss starts a card over at one day, after a 10 minute relearning step. Days change at 4 am. A card in a step (1 or 10 minutes) moves on only once that time has passed, so asking it again at once doesn't skip the wait; a miss always counts.

A review asks cards in shuffled order, whatever their kind of question (a state's name, then a code, then another state's letters), on the map chosen on the quiz's setup screen, and grades each answer by the clock instead of by buttons:

- **Known**: right on the first click within the "known" time (6 s by default). Anki's Good.
- **Unsure**: right on the first click, but slower. Anki's Hard.
- **Not known**: a wrong click (the answer shows at once, there is no second try) or no answer within the time limit (15 s). Anki's Again; the card comes back at the end of the review until it is answered right.

Only the last answer stays colored on the map, each question starts from the whole map, and the areas of everything learned on that page stay lit, so the map gives nothing away. A code dialed in several areas gets half the time again per extra area. In map play (cities, click anywhere) a close answer counts as right.

Ordinary rounds count too, quietly, for questions already on the stack: a wrong click (the first one already) is "not known", and a first-try answer within the "known" time is "known". A slower right answer changes nothing, and no clock is shown.

A review covers one quiz, one country or everything, and asks either the cards that are **due** or **all** of them (to refresh everything learned; a card asked early follows Anki's rule for early reviews, so a right answer never shortens its interval):

- a quiz's setup screen has Due and All for that quiz;
- a country page has them for the country's quizzes;
- `review.html` (linked in the header, with the number due) has them for the whole world, per country and per quiz, lists the stack, and holds the settings: the two times of the clock and the two limits.

Two limits keep a review day bearable, both settings: one review asks at most 50 cards, and once 200 cards have been reviewed in a day the due ones wait for the next day (All still works). Due asks the longest due first; All asks the cards not answered for longest, so asking for all again goes on through the stack instead of repeating. Putting new cards on the stack has no limit: players arrive knowing a lot already.

A review over several quizzes is shuffled in groups. A card can only be asked on its own quiz's page (its map), and every change of page has to load, so a quiz page (`…/index.html?review=1`) asks three of its cards, picked at random (fewer if it has fewer left; `GROUP` in `assets/js/srs.js`), and then the review moves to another quiz, picked at random among those with cards left, a quiz with more cards left more often. If that is the same quiz, it simply goes on there. The question count runs across the whole review and no results appear in between. Cards that weren't known are asked again once all the others have been asked. The review ends on the page it was started from, with the result.

Everything is kept in the browser (see "Saved data"), the cards in their quiz's record, and nothing depends on the list of quizzes: a quiz that leaves `data/quizzes.json` is passed over, and a card whose question leaves its quiz is set aside; both are kept and come back with the quiz or question. Quiz pages need no changes: the engine loads `assets/js/srs.js` (the schedule) and `quizzes/shared/area-review.js` (the review round) itself.

## Saved data

What a player has done lives in the browser it was done in (`localStorage`), all of it under `geoquizzes.` and all of it read and written through `assets/js/store.js`, whose first lines describe every field:

- `geoquizzes.quiz.<quiz id>`: one record per quiz page, named by its folder as in `data/quizzes.json`. It holds the page's `stars`, its review `cards`, the `best` result of every round played, the player's `custom` quizzes, what was chosen `last` on the setup screen, and a town-name quiz's `paint` results.
- `geoquizzes.settings`: the review's two times and two limits, and the folders open in "All quizzes".
- `geoquizzes.review`: the cards reviewed today and a review in progress.

Times are written as dates, fields have whole words for names, and a best result is filed under its layer, its map and a short fingerprint of the round's exact items, so it counts for any round or custom quiz that asks just those items and no longer once a round's items change. `stars` is worked out by the quiz page from `best`; it is kept so the home and country pages can show stars without loading every quiz.

"Your data" on the review page moves all of this: **Download** saves one file, `{ app, version, saved, settings, review, quizzes: { <quiz id>: record } }`, the entries as they are, and **Upload** puts such a file in place of what the browser has, after asking once. So a player can change browser or device and carry on. Entries of other pages on the same address are neither read nor touched.

Before this layout the same things lay in many small entries, a quiz's results under a short name of its own (`idregions.best.…`). They are carried over without anyone doing anything: stars, cards and settings when any page of the site loads, a quiz's results and choices when its page next opens, since only the page knows its short name (`key` in its config, still needed for that). Until then they travel in a data file as its `older` part. A quiz page gets the store through `quizzes/shared/quiz-page.js`, which loads it ahead of the page's other scripts.

## Coverage

`coverage.html` is a street map of the world (OpenStreetMap tiles, drawn in grey) with a layer showing where Google Street View has official coverage, colored by the newest capture at each spot. The address keeps the view (`#zoom/lat/lng`), so a place can be bookmarked.

The layer is a set of map tiles in `data/coverage/<z>/<x>/<y>.png` (1024 px, `z` = map zoom − 2) plus `meta.json`, which lists the tiles that exist, the finest zoom, the color steps, the date of the data and the number of locations per country. Its finest level is map zoom 9, about 300 m per pixel: 2,860 tiles, 49 MB. `tools/coverage.mjs` makes both from the location pool of [Vali](https://github.com/slashP/Vali), the map generator behind "An Arbitrary World": road points from OpenStreetMap, each looked up in Google Street View. `fetch` downloads the pool (about 20 GB, once) and keeps position and date of every location in `tools/cache/coverage/` (about 4 GB); `tiles` draws the layer from that cache in about a minute. `--zoom 10` or `11` draws a finer layer (150 m: 134 MB, 75 m: 349 MB); with `--out` and `--also` such a build can be shown next to the layer, each with a button, to compare them.

The pool is a sample, one location per OpenStreetMap node, and not every covered road is in it: a whole town missing from the layer is strong evidence, a single missing road is not. Locations on the same OpenStreetMap way are joined into a line when they are at most 3 km apart (`--gap`). The pool has official coverage only (no user photo spheres) and lags behind Google by the time since its last upload.

The home map uses the same data: while the pointer is on a country, the country turns slate and its roads with coverage are drawn on it in yellow. These are pictures in the home map's own projection, `data/coverage/home/<alpha-2>_<scale>.png` (2, 4, 8 and 16 pixels per map unit; the page takes the one that fits its zoom), listed in `data/coverage/home.json`; `tools/coverage.mjs countries` makes them, together with the pictures for the country pages (102 countries, about 2 MB). A country with no picture has no coverage in the pool.

A country page does the same on its outline of the country (`data/coverage/shape/<alpha-2>.png`, drawn for that outline's own projection), and a click on the outline opens the coverage map on the country in a box over the page: `coverage.html?embed&fit=west,south,east,north&outline=<key>`, the map without its page header, opened on the box around the country's coverage (from `home.json`), with everything outside the country shaded. The borders for that are in `data/coverage/outline/<key>.json` (Natural Earth 1:10m, thinned; 176 countries, 1.8 MB), keyed by ISO numeric code.

The Coverage page keeps panning and zooming light: each street-map tile is turned grey once, when it arrives (not by a filter over the whole map), and the coverage is blended into the map only while the map is still. Tiles are loaded a little beyond the edge of the map (one ring of street-map tiles, 512 px of coverage) and shown without fading in, and the coverage tiles of the next zoom in and out are fetched in quiet moments, so a move or a zoom finds them there.

The home map has a "Street coverage" button in its corner that opens the page.

## Tools (build time only)

`tools/` holds the Node scripts that make the quiz data. The site itself never loads them. Run `npm install` in `tools/` once. Downloads are cached in `tools/cache/`, which is not committed. Usage is at the top of each file:

- `geo2quiz.mjs`: boundary polygons (GeoJSON) → `data.js` + `geo.js`. It fits an equal-area projection to the country, simplifies shared borders once, and adds the neighbouring land.
- `cities.mjs`: GeoNames + Wikidata → `cities.js` for a city quiz, in the same projection as its base map.
- `hints.mjs`: hint colors (`style.css`), so groups that touch never share a color.
- `postcodes.mjs`: GeoNames postal codes → `post.js` (+ `data.js`, `geo.js` when the zones get their own map) for a postcode quiz.
- `worldmap.mjs`: Natural Earth countries → `quizzes/shared/world.js`, the map of the world and continent quizzes.
- `worldfacts.mjs`: Plonk It, Wikidata, mledoze/countries and flag-icons → `quizzes/shared/world-facts.js` + `quizzes/world-flags/img/`, the facts and flags of the world quizzes.
- `geohints.mjs`: a geohints.com meta page → `photos.js` + `img/` for a picture quiz (needs `cwebp`). Pictures are downloaded once, one at a time.
- `townnames.mjs`: GeoNames places + a `cities.js` map → `names.js` for a town-name quiz: the name parts that mark a region, their places and the best drawing for each.
- `learnablemeta.mjs`: every map on learnablemeta.com/maps → `maps.json` + one file per map with its metas (name, note, pictures), in `tools/cache/learnablemeta/`. A second run downloads only the maps that changed.
- `coverage.mjs`: the Vali location pool → `data/coverage/`: the Street View coverage layer of `coverage.html` and the roads the home map draws on a country (needs `bzip2`).
- `smoke.mjs`: opens pages in headless Chromium, reports errors, plays a click and saves screenshots.

`tools/builds/` holds the scripts of one-off builds (New Zealand calling areas, Ukraine local code areas, the Senegal and Bolivia number counts, and the command of every postcode quiz). See `tools/builds/README.md`.

## Deploy to GitHub Pages

1. Create a new repository on GitHub and push this folder to it:

   ```sh
   git init -b main
   git add .
   git commit -m "Initial site"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. On GitHub, go to **Settings → Pages**, set **Source** to "Deploy from a branch", choose `main` and `/ (root)`, and save.
3. The site will be live at `https://<your-username>.github.io/<repo-name>/` in a minute or two.

All links are relative, so it works both at a repo URL and at a custom domain.
