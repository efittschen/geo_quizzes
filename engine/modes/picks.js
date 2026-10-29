// picks: four to pick from under the question (Pick: names for it; Pick back: questions for the name, in their script),
// its own and three others (model.check.options). A wrong one is put out of play, a try less; once the answer shows,
// only it goes on. The number keys pick too.

export function makePicks({ model, game, $ }) {
  const el = document.createElement('div');
  el.className = 'picks'; el.hidden = true;
  $('dial').after(el);
  return P => ({
    ask(id) {
      const K = P.kind, lang = P.back && K.prompt === 'text' && K.text(id).lang;
      el.hidden = false;
      el.replaceChildren(...model.check.options(P, id, game.def.items, Math.random).map(option => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = option.word;
        if (lang) b.lang = lang;
        b.onclick = () => {
          const q = game.round && game.round.asked();
          if (b.disabled || game.rating || !q) return;
          const out = game.answer({ option });
          if (!out || out.kind !== 'wrong' || !out.counted) return;
          b.disabled = true; b.classList.add('no');
          if (out.revealed) for (const o of el.children) o.classList.toggle('ans', o.textContent === (P.back ? model.check.askText(K, id) : P.answerName(id)));
        };
        return b;
      }));
    },
    board() {}, tap() {},
    key(e) { const n = +e.key; if (n >= 1 && n <= el.children.length && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); el.children[n - 1].click(); } },
    close() { el.hidden = true; el.replaceChildren(); },
  });
}
