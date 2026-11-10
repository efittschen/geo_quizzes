// The words of a layer that is not open: its tables stand empty in the page's names.js until names-<layer>.js fills them
// (<body data-words="…/names-">, written by tools/builds/open-layer). A layer's words are brought when it is opened.
//
//   const words = makeWords(kinds)
//   words.bring(key)     a promise: the layer's words are here (at once where they are)

export function makeWords(kinds) {
  const from = document.body.dataset.words, bringing = new Map();
  const bring = key => {
    if (!kinds.later.has(key)) return Promise.resolve();
    if (bringing.has(key)) return bringing.get(key);
    const job = new Promise((done, failed) => {
      const s = document.createElement('script');
      s.src = from + key + '.js';
      s.onload = () => { kinds.got(key); done(); };
      s.onerror = () => { s.remove(); bringing.delete(key); failed(new Error('no words: ' + key)); };
      document.head.append(s);
    });
    bringing.set(key, job);
    return job;
  };
  return { bring };
}
