// Storage: what a player keeps, saved as it is given. It decides nothing. Underneath, the site's own scripts:
// store.js (STORE: the page's record in localStorage) and answers.js (ANSWERS: the answer log), which page.js loads
// before the engine, and srs.js (SRS: the review cards), loaded when first needed (schedule).
//
//   const storage = createStorage(quiz, { page, root })   page: the quiz's id (its folder); root: the site's address
//   storage.best(key) / keepBest(key, best, of, name)       a best result { s, t, p } (see model/results.js), and all
//                                                           of them (bests)
//   storage.keepStars(levels)                               each level's stars, for the home and country pages
//   storage.last() / keepLast(f)                            the last choices on the setup screen
//   storage.customs() / keepCustoms(list)                   the player's own quizzes: [{ name, kind, ids }]
//   storage.cardKeys(), storage.moved()                     the review cards kept, and the keys cards were moved from
//   storage.settings() / keepSettings(f)                    the site's settings
//   storage.log(answer), storage.answers(), storage.canLog()   an answer into the answer log; all of it (a promise);
//                                                           whether there is one
//   storage.schedule()                                      -> Promise of SRS: the review cards and their schedule
//   storage.print(ids)                                      a set of items as "<their number>-<fingerprint>"
// (srs.js both chooses and keeps today; the choosing moves to the Model with the site scripts, PLAN step 8.)

export function createStorage(quiz, { page, root }) {
  STORE.adopt(page, quiz.key, quiz.kinds.map(k => k.key));
  // the record, read once per task
  let held = null;
  const record = () => held || (queueMicrotask(() => { held = null; }), (held = STORE.quiz(page)));
  const keep = f => { STORE.setQuiz(page, f); held = null; };
  let srs = null;
  return {
    page,
    best: key => STORE.bestIn((record().best || {})[key]),
    bests: () => record().best || {},
    keepBest: (key, best, of, name) => keep(r => { (r.best ||= {})[key] = STORE.bestOut(best, of, name); }),
    nameBests: names => keep(r => { for (const [key, name] of names) if (r.best && r.best[key]) r.best[key].name = name; }),
    keepStars: levels => keep(r => { r.stars = levels; }),
    last: () => record().last || {},
    keepLast: f => keep(r => f((r.last ||= {}))),
    customs: () => record().custom || [],
    cardKeys: () => Object.keys(record().cards || {}),
    moved: () => record().moved || {},
    keepCustoms: list => keep(r => { r.custom = list; }),
    settings: () => STORE.settings(),
    keepSettings: f => STORE.setSettings(f),
    log: answer => { if (typeof ANSWERS === 'object') ANSWERS.add({ quiz: page, ...answer }); },
    canLog: () => typeof ANSWERS === 'object',
    answers: () => ANSWERS.all(),
    print: ids => STORE.print(ids),
    schedule: () => (srs ||= typeof SRS === 'object' ? Promise.resolve(SRS) : new Promise((done, fail) => {
      const s = document.createElement('script');
      s.src = root + 'assets/js/srs.js'; s.onload = () => done(SRS); s.onerror = fail;
      document.head.append(s);
    })),
  };
}
