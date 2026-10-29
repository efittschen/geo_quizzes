// name: the item's name, big (a pick back: the name answered). A city may show on its country's road sign instead
// (kind.sign draws it, with the Sign option on), the name asked kept for the tools (data-name). A page of one round puts
// each question's tag over it (single.tag).

export function makeName(P, { quiz, place }) {
  const K = P.kind;
  return {
    show(id, { pos }) {
      const el = place('name');
      el.classList.remove('asking', 'signed');
      const sign = !P.back && K.sign && document.getElementById('optSign') && document.getElementById('optSign').checked;
      const signed = !!sign && K.sign(id, el);
      if (!signed) el.textContent = P.back ? P.answerName(id) : K.name(id);
      if (quiz.single) { const tag = document.createElement('span'); tag.className = 'tier'; tag.textContent = quiz.single.tag(pos); el.prepend(tag); }
      el.classList.toggle('signed', signed);
      if (signed) el.dataset.name = K.name(id); else delete el.dataset.name;
    },
    ahead() {}, answered() {}, hide() {},
  };
}
