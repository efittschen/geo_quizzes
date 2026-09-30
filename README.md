# Geo Quizzes

GeoGuessr-style quizzes for countries around the world. The home page is a clickable world map; clicking a country opens its page with a list of its quizzes.

Plain HTML/CSS/JS — no build step, so it runs directly on GitHub Pages.

## Structure

```
index.html              Home page with the world map
country.html            Country page (lists quizzes for ?code=<ISO numeric>)
quiz.html               Quiz page (loads a quiz from ?id=<id>)
assets/css/base.css     Shared style for every page: colors (light + dark), fonts, buttons
assets/css/style.css    Home, country and multiple-choice quiz pages
assets/js/map.js        Map rendering (D3 + TopoJSON, loaded from CDN)
assets/js/quiz.js       Quiz logic
data/quizzes.json       List of all quizzes and which country each belongs to
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

   `country` is the country's [ISO 3166-1 numeric code](https://en.wikipedia.org/wiki/ISO_3166-1_numeric) as a 3-digit string (keep leading zeros, e.g. `"076"` for Brazil). That's how the map knows which country the quiz belongs to. A quiz covering several countries can list them all, e.g. `["356", "524"]`, and give an `area` name for the "All quizzes" list.

### Custom quiz pages

A quiz that needs its own interface lives in its own folder under `quizzes/` and is registered in `data/quizzes.json` with a `url`, so it opens that page instead of the multiple-choice one:

```json
{ "id": "brazil-ddd", "country": "076", "title": "Area Codes", "url": "quizzes/brazil-ddd/index.html" }
```

### Map quizzes ("click the right area")

`quizzes/brazil-ddd/`, `quizzes/russia-codes/`, `quizzes/mexico-codes/`, `quizzes/us-codes/` and `quizzes/south-asia-scripts/` (plus their states/regions pages) share one engine, `quizzes/shared/area-quiz.js` (+ `area-quiz.css`). Each quiz folder has:

- `data.js`: the map areas as SVG paths, plus names, cities and codes
- `geo.js`: the same areas as latitude/longitude polygons, used by the street map (hard mode)
- `quiz.js`: the `QUIZ` config: which questions can be asked (e.g. area codes, zones, states), their wording and grouping, and `rounds`, the ready-made rounds offered on the setup screen
- `style.css`: which hint color each map area gets, from the shared palette (`--h1`…`--h24` in `quizzes/shared/area-quiz.css`). The palette has no greens, yellows, oranges or reds, so hints never look like the answer colors, and hints fade while playing
- `index.html`: the page itself

The street map uses standard OpenStreetMap tiles (free for light use, credited on the page).

Rounds are listed by size: Beginner (under 10 items), Intermediate (under 30), Hard (under 60) and Expert. A round is a kind plus the items to ask, e.g. `{ kind: 'codes', label: 'Southeast', groups: ['1x', '2x', '3x'] }`, `{ kind: 'codes', label: '20 largest areas', top: 20 }` or `{ kind: 'codes', label: 'Big cities', preset: 'Big cities' }`. The map (quiz map or street map) is chosen separately and works with any round. Players can also build a custom quiz, save it under a name (in their browser) and share it as a link.

When a mode's answers are groups of areas (first-digit or two-digit zones, states, federal districts), the quiz map draws each group as one shape: only the group's outline, in one color. Zones keep their hint color when they fit inside one (two-digit zones colored by first digit); named places like states get a color each, different from their neighbours. Set `merge: false` on a kind to keep every area separate, or `unitColors(areas)` to choose the colors a group can take (Australia uses its area-code shades).

One config can serve several pages. The page's `<body>` lists which question types it shows and where it saves scores, e.g. `quizzes/brazil-states/index.html` reuses Brazil's files with `<body data-kinds="states" data-key="dddstates">`, while the area-code page has `<body data-kinds="codes digits">`.

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
