// Ukraine Cities: adds a Hungarian-name mode to the QUIZ from ../shared/city-config.js, for the 11 cities of
// Zakarpattia (CITIES list field hu: Wikidata hu labels). Hungarian or bilingual signs are common near the border
// with Hungary (plonkit.net/ukraine).
(() => {
  const BY = Object.fromEntries(CITIES.list.map(c => [c.id, c]));
  const HU = CITIES.list.filter(c => c.hu).map(c => c.id); // largest first
  const en = QUIZ.kinds.find(k => k.key === 'en');
  QUIZ.kinds.push({
    ...en,
    key: 'hu', label: 'Hungarian names', sub: `${HU.length} cities`,
    groups: [{ title: CITIES.regions[BY[HU[0]].adm], sub: '', ids: HU }],
    rankings: [{ label: 'population', order: HU }],
    presets: [],
    prompt: 'text', text: id => ({ text: BY[id].hu, lang: 'hu', cls: 'city' }),
    name: id => BY[id].hu, short: id => BY[id].hu,
    clicked: a => BY[a].hu ? `${BY[a].hu} · ${BY[a].en}` : BY[a].en,
    chip: id => BY[id].hu, chipTitle: id => `${BY[id].en} · ${BY[id].local}`,
  });
  QUIZ.rounds.push({ kind: 'hu', label: 'Hungarian names', sub: 'Zakarpattia' });
})();
