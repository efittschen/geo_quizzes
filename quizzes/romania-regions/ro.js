// Romania: county facts shared by the Romania map quizzes (regions, languages, roads, area codes), on the areas of
// ./data.js. Each map area is one county (județ), or the part of a county with minority-language place names on signs.
//   n     name; ab: landline code digits after 02/03 (ANCOM Decision 375/2013, PNN annex: 021/031 Bucharest and Ilfov,
//         02AB/03AB one county each); seat: county seat; pl: county code (Wikidata P395), not shown
//   hist  historical region the county mostly lies in (counties split between regions go to the larger part:
//         Arad, Sălaj and Satu Mare to Crișana, Olt and Vâlcea to Oltenia, Mehedinți to Oltenia, Suceava to Bukovina,
//         Vrancea to Moldavia, Hunedoara to Transylvania); approximate, as the regions have no official borders
//   band  first digit of the national roads (DN) with the most length in the county, measured on OpenStreetMap ref
//         tags (© OpenStreetMap contributors, ODbL; 2026-10-01; 16,687 km of DN); none for Bucharest and Ilfov, where
//         all seven spokes start
// Sign languages (data.js langs): the UATs where a minority makes up over 20% of residents in the 2021 census (INS,
// Tabel 2.02; Codul administrativ art. 195) plus the UATs with localities listed in HG 1206/2001 annexes 1/1–1/23
// (bilingual place-name signs); the language of each listed name from its Wikidata label, Cyrillic names from the
// UAT's largest Cyrillic-script minority. Romani is left out (no place names in the HG list).

const RO = (() => {
  const C = {"AB":{"n":"Alba","ab":"58","seat":"Alba Iulia","hist":"TRA","band":7,"pl":"AB"},"AR":{"n":"Arad","ab":"57","seat":"Arad","hist":"CRI","band":7,"pl":"AR"},"AG":{"n":"Argeș","ab":"48","seat":"Pitești","hist":"MUN","band":7,"pl":"AG"},"BC":{"n":"Bacău","ab":"34","seat":"Bacău","hist":"MOL","band":1,"pl":"BC"},"BH":{"n":"Bihor","ab":"59","seat":"Oradea","hist":"CRI","band":1,"pl":"BH"},"BN":{"n":"Bistrița-Năsăud","ab":"63","seat":"Bistrița","hist":"TRA","band":1,"pl":"BN"},"BT":{"n":"Botoșani","ab":"31","seat":"Botoșani","hist":"MOL","band":2,"pl":"BT"},"BV":{"n":"Brașov","ab":"68","seat":"Brașov","hist":"TRA","band":1,"pl":"BV"},"BR":{"n":"Brăila","ab":"39","seat":"Brăila","hist":"MUN","band":2,"pl":"BR"},"B":{"n":"București","ab":"1","seat":"București","hist":"MUN","band":null,"pl":"B"},"BZ":{"n":"Buzău","ab":"38","seat":"Buzău","hist":"MUN","band":2,"pl":"BZ"},"CS":{"n":"Caraș-Severin","ab":"55","seat":"Reșița","hist":"BAN","band":5,"pl":"CS"},"CL":{"n":"Călărași","ab":"42","seat":"Călărași","hist":"MUN","band":3,"pl":"CL"},"CJ":{"n":"Cluj","ab":"64","seat":"Cluj-Napoca","hist":"TRA","band":1,"pl":"CJ"},"CT":{"n":"Constanța","ab":"41","seat":"Constanța","hist":"DOB","band":3,"pl":"CT"},"CV":{"n":"Covasna","ab":"67","seat":"Sfântu Gheorghe","hist":"TRA","band":1,"pl":"CV"},"DB":{"n":"Dâmbovița","ab":"45","seat":"Târgoviște","hist":"MUN","band":7,"pl":"DB"},"DJ":{"n":"Dolj","ab":"51","seat":"Craiova","hist":"OLT","band":5,"pl":"DJ"},"GL":{"n":"Galați","ab":"36","seat":"Galați","hist":"MOL","band":2,"pl":"GL"},"GR":{"n":"Giurgiu","ab":"46","seat":"Giurgiu","hist":"MUN","band":5,"pl":"GR"},"GJ":{"n":"Gorj","ab":"53","seat":"Târgu Jiu","hist":"OLT","band":6,"pl":"GJ"},"HR":{"n":"Harghita","ab":"66","seat":"Miercurea Ciuc","hist":"TRA","band":1,"pl":"HR"},"HD":{"n":"Hunedoara","ab":"54","seat":"Deva","hist":"TRA","band":7,"pl":"HD"},"IL":{"n":"Ialomița","ab":"43","seat":"Slobozia","hist":"MUN","band":2,"pl":"IL"},"IS":{"n":"Iași","ab":"32","seat":"Iași","hist":"MOL","band":2,"pl":"IS"},"IF":{"n":"Ilfov","ab":"1","seat":"","hist":"MUN","band":null,"pl":"IF"},"MM":{"n":"Maramureș","ab":"62","seat":"Baia Mare","hist":"MAR","band":1,"pl":"MM"},"MH":{"n":"Mehedinți","ab":"52","seat":"Drobeta-Turnu Severin","hist":"OLT","band":5,"pl":"MH"},"MS":{"n":"Mureș","ab":"65","seat":"Târgu Mureș","hist":"TRA","band":1,"pl":"MS"},"NT":{"n":"Neamț","ab":"33","seat":"Piatra Neamț","hist":"MOL","band":1,"pl":"NT"},"OT":{"n":"Olt","ab":"49","seat":"Slatina","hist":"OLT","band":6,"pl":"OT"},"PH":{"n":"Prahova","ab":"44","seat":"Ploiești","hist":"MUN","band":1,"pl":"PH"},"SM":{"n":"Satu Mare","ab":"61","seat":"Satu Mare","hist":"CRI","band":1,"pl":"SM"},"SJ":{"n":"Sălaj","ab":"60","seat":"Zalău","hist":"CRI","band":1,"pl":"SJ"},"SB":{"n":"Sibiu","ab":"69","seat":"Sibiu","hist":"TRA","band":1,"pl":"SB"},"SV":{"n":"Suceava","ab":"30","seat":"Suceava","hist":"BUK","band":1,"pl":"SV"},"TR":{"n":"Teleorman","ab":"47","seat":"Alexandria","hist":"MUN","band":6,"pl":"TR"},"TM":{"n":"Timiș","ab":"56","seat":"Timișoara","hist":"BAN","band":5,"pl":"TM"},"TL":{"n":"Tulcea","ab":"40","seat":"Tulcea","hist":"DOB","band":2,"pl":"TL"},"VS":{"n":"Vaslui","ab":"35","seat":"Vaslui","hist":"MOL","band":2,"pl":"VS"},"VL":{"n":"Vâlcea","ab":"50","seat":"Râmnicu Vâlcea","hist":"OLT","band":6,"pl":"VL"},"VN":{"n":"Vrancea","ab":"37","seat":"Focșani","hist":"MOL","band":2,"pl":"VN"}};
  // Historical regions, north-west to south-east.
  const HIST = [
    ['MAR', 'Maramureș'], ['CRI', 'Crișana'], ['TRA', 'Transilvania'], ['BAN', 'Banat'], ['BUK', 'Bucovina'],
    ['MOL', 'Moldova'], ['OLT', 'Oltenia'], ['MUN', 'Muntenia'], ['DOB', 'Dobrogea'],
  ];
  const HISTN = Object.fromEntries(HIST);
  const LANGS = [
    ['hu', 'Hungarian'], ['de', 'German'], ['uk', 'Ukrainian'], ['sr', 'Serbian'], ['ru', 'Russian (Lipovan)'],
    ['bg', 'Bulgarian'], ['sk', 'Slovak'], ['cs', 'Czech'], ['hr', 'Croatian'], ['pl', 'Polish'], ['tr', 'Turkish & Tatar'],
  ];
  const LANGN = Object.fromEntries(LANGS);
  const CYRILLIC = new Set(['uk', 'sr', 'ru', 'bg']);
  const A = Object.fromEntries(DATA.reg.map(r => [r.id, r]));
  const langsOf = id => A[id].langs ? A[id].langs.split('.') : [];
  const areasOfCounty = iso => DATA.reg.filter(r => r.iso === iso).map(r => r.id);
  // Counties in Romanian alphabetical order.
  const COUNTIES = Object.keys(C).sort((a, b) => C[a].n.localeCompare(C[b].n, 'ro'));
  const countiesIn = h => COUNTIES.filter(i => C[i].hist === h);
  const name = iso => C[iso].n;
  const county = id => C[A[id].iso];
  const codes = iso => C[iso].ab === '1' ? ['21', '31'] : ['2' + C[iso].ab, '3' + C[iso].ab];
  const facts = id => {
    const c = county(id), ls = langsOf(id);
    return [
      `${HISTN[c.hist]}${c.seat ? ' · ' + c.seat : ''}`,
      `${codes(A[id].iso).map(k => '0' + k).join(' · ')}${c.band ? ' · DN' + c.band + 'x' : ''}`,
      ...(ls.length ? [ls.map(l => LANGN[l]).join(', ')] : []),
    ];
  };
  return { C, A, HIST, HISTN, LANGS, LANGN, CYRILLIC, COUNTIES, langsOf, areasOfCounty, countiesIn, name, county, codes, facts };
})();
