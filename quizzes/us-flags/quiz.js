// US State Flags: config for ../shared/area-quiz.js. See a state's flag, name the state: picked from a list that what
// is typed narrows ("new" leaves New Hampshire, New Jersey, New Mexico, New York), so nothing has to be spelled (the
// mode a page starts in), or clicked on the map, typed, or matched in pairs (see MODES in area-quiz.js). The
// state lights up on the map once it is named. Two ways to see the flags, each a round box's switch: Clear, and
// Blurred (the picture blurred until answered: the colors and the layout, not the seal's detail). Each has its own
// best results and its own review cards. The flags (img/<USPS>.jpg) are those of Wikimedia Commons (public domain),
// the current ones (Minnesota and Utah 2024), drawn into a 640x400 picture. 50 states and the District of Columbia.
// Once a flag is answered, the answer box says what is on it and why (SYMBOLS).
// The map is the area-code map of ../us-codes/data.js, each state one area, as in ../us-bollards.

const USPS = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT',
  'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI',
  'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH',
  'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN',
  'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'Washington, D.C.': 'DC', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY',
};
// US Census Bureau regions (the District of Columbia with the South).
const CENSUS = [
  ['Northeast', ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'New Jersey', 'New York', 'Pennsylvania', 'Rhode Island', 'Vermont']],
  ['Midwest', ['Illinois', 'Indiana', 'Iowa', 'Kansas', 'Michigan', 'Minnesota', 'Missouri', 'Nebraska', 'North Dakota', 'Ohio', 'South Dakota', 'Wisconsin']],
  ['South', ['Alabama', 'Arkansas', 'Delaware', 'Florida', 'Georgia', 'Kentucky', 'Louisiana', 'Maryland', 'Mississippi', 'North Carolina', 'Oklahoma', 'South Carolina', 'Tennessee', 'Texas', 'Virginia', 'Washington, D.C.', 'West Virginia']],
  ['West', ['Alaska', 'Arizona', 'California', 'Colorado', 'Hawaii', 'Idaho', 'Montana', 'Nevada', 'New Mexico', 'Oregon', 'Utah', 'Washington', 'Wyoming']],
];
// What a flag shows and why, said once the flag is answered.
const SYMBOLS = {
  "Alabama": "A crimson saltire (St Andrew's cross) on white, adopted in 1895.",
  "Alaska": "The Big Dipper and the North Star in gold: the North Star for the northernmost state. Blue for the sky and the forget-me-not, the state flower. Designed by Benny Benson, aged 13, and adopted in 1927.",
  "Arizona": "Thirteen red and gold rays for the original colonies and the western sunset, a copper star for the state's copper mining, and blue from the US flag.",
  "Arkansas": "A diamond, as the only state with a diamond mine; 25 stars as the 25th state. Inside, three stars for the nations that held it (Spain, France, the US) and one above for the Confederacy.",
  "California": "The grizzly bear and red star of the 1846 Bear Flag Revolt, with \"California Republic\".",
  "Colorado": "A C for Colorado around a gold disk for sunshine; blue for the sky, white for the snow-capped mountains, red for the earth.",
  "Connecticut": "Three grapevines for the first settlements, transplanted from England, with the motto Qui Transtulit Sustinet (\"he who transplanted still sustains\").",
  "Delaware": "A buff diamond on colonial blue, the colors of George Washington's uniform. The date, December 7, 1787, is when Delaware became the first state to ratify the Constitution.",
  "Washington, D.C.": "Three red stars over two red bars, taken from George Washington's family coat of arms.",
  "Florida": "A red saltire on white, as in Alabama's flag, with the state seal: a Seminole woman scattering flowers, a steamboat, a sabal palm and the sun.",
  "Georgia": "Patterned on the first Confederate flag (the Stars and Bars): 13 stars for the original states around the state arms, an arch on three pillars for the three branches of government.",
  "Hawaii": "The Union Jack, for the kingdom's ties with Britain, and eight stripes for the eight main islands.",
  "Idaho": "The state seal on blue, the only one designed by a woman (Emma Edwards Green): a woman for justice and liberty, a miner, an elk's head, and the motto Esto Perpetua (\"let it be forever\").",
  "Illinois": "A bald eagle on a rock holding the banner \"State Sovereignty, National Union\"; the dates are statehood (1818) and the seal's (1868). \"ILLINOIS\" was added in 1970.",
  "Indiana": "A torch for liberty and enlightenment. Of its 19 stars, 13 are for the original states, 5 for the next states, and the large one for Indiana, the 19th.",
  "Iowa": "Blue, white and red stripes from the French flag, for the Louisiana Purchase. The eagle carries the motto \"Our liberties we prize and our rights we will maintain\".",
  "Kansas": "The state seal (sunrise, a farmer ploughing, a wagon train, a bison hunt) under a sunflower, the state flower, with the motto Ad Astra per Aspera (\"to the stars through difficulties\").",
  "Kentucky": "Two men embracing in the seal, with the motto \"United we stand, divided we fall\", in a wreath of goldenrod, the state flower.",
  "Louisiana": "A mother pelican feeding her young with her own blood, for self-sacrifice and care, with the motto \"Union, Justice, Confidence\".",
  "Maine": "A farmer and a sailor (land and sea), a moose under a white pine, and the North Star with the motto Dirigo (\"I lead\").",
  "Maryland": "The banners of the Calvert (gold and black) and Crossland (red and white crosses) families of the Lords Baltimore, the colony's founders.",
  "Massachusetts": "A Native American of the Massachusett people with his arrow pointing down, for peace, a star for a state, and an arm holding a sword above.",
  "Michigan": "An elk and a moose hold a shield on which a man by the water raises one hand for peace and holds a gun for defense. Mottos: Tuebor (\"I will defend\") and \"If you seek a pleasant peninsula, look about you\".",
  "Minnesota": "Since 2024: the state's shape in dark blue with the eight-pointed North Star (L'Étoile du Nord), and light blue for its lakes and waters.",
  "Mississippi": "Since 2020: a magnolia, the state flower, in a ring of 20 stars for the 20th state, a gold star for its Native peoples, and \"In God We Trust\".",
  "Missouri": "Red, white and blue stripes; the seal with two grizzly bears and a crescent, ringed by 24 stars as the 24th state.",
  "Montana": "The seal's plough, shovel and pick (farming and mining) by the Great Falls of the Missouri, with the motto Oro y Plata (\"gold and silver\").",
  "Nebraska": "The state seal in gold: a blacksmith, a settler's cabin and wheat, a steamboat on the Missouri, a train heading for the Rockies, and the motto \"Equality Before the Law\".",
  "Nevada": "A silver star, for the Silver State, in a wreath of sagebrush, the state flower, and \"Battle Born\": statehood came during the Civil War.",
  "New Hampshire": "The frigate Raleigh, built at Portsmouth in 1776, in a laurel wreath with nine stars: New Hampshire was the ninth state to ratify the Constitution.",
  "New Jersey": "A buff field from the Continental Army's uniforms. Liberty and Ceres (agriculture) hold a shield of three ploughs under a horse's head: \"Liberty and Prosperity\", 1776.",
  "New Mexico": "The Zia Pueblo sun symbol, whose four rays of four are the sacred number four (directions, seasons, times of day, stages of life), in the red and gold of Spain.",
  "New York": "Liberty and Justice hold a shield with the sun rising over the Hudson; an eagle stands on a globe above the motto Excelsior (\"ever upward\").",
  "North Carolina": "N★C with two dates: May 20, 1775 (the Mecklenburg Declaration) and April 12, 1776 (the Halifax Resolves), early calls for independence.",
  "North Dakota": "The regimental flag of the state's infantry: an eagle with an olive branch and arrows, 13 stars, and E pluribus unum.",
  "Ohio": "The only state flag that is not a rectangle, a swallowtail. Its 17 stars are for the 17th state, and the red disk in a white ring is an O for Ohio (and a buckeye). The triangles stand for hills and valleys, the stripes for roads and waterways.",
  "Oklahoma": "An Osage warrior's buffalo-hide shield with eagle feathers and crosses, under an olive branch and a peace pipe, both for peace.",
  "Oregon": "\"STATE OF OREGON\", the seal's shield and 1859, the year of statehood. It is the only state flag with two different sides: the back shows a beaver, the state animal.",
  "Pennsylvania": "Two horses hold the state arms, with a ship (commerce), a plough and wheat (agriculture), an eagle above, and the motto \"Virtue, Liberty and Independence\".",
  "Rhode Island": "A gold anchor for hope, with the motto HOPE, in a ring of 13 stars for the original colonies.",
  "South Carolina": "A white palmetto, after the palmetto-log fort on Sullivan's Island that held off the British fleet in 1776, and the crescent the colony's troops wore on their caps.",
  "South Dakota": "The state seal in a ring of gold rays, with \"South Dakota\" and \"The Mount Rushmore State\".",
  "Tennessee": "Three stars for the state's three Grand Divisions (East, Middle and West Tennessee), bound in a circle for unity.",
  "Texas": "The Lone Star of the Republic of Texas: blue for loyalty, white for purity, red for bravery.",
  "Utah": "Since 2024: a beehive, for industry, in a honeycomb hexagon, a star for statehood (1896), snowy mountains, and red for the canyons.",
  "Vermont": "A pine tree, a cow and wheat before the Green Mountains, a deer's head above, and the motto \"Freedom and Unity\".",
  "Virginia": "Virtue stands over a fallen tyrant and his crown: Sic Semper Tyrannis (\"thus always to tyrants\").",
  "Washington": "The only green state flag, and the only one with a US president: George Washington, after whom the state is named, in its seal.",
  "West Virginia": "A farmer and a miner beside a rock dated June 20, 1863 (statehood), with the motto Montani Semper Liberi (\"mountaineers are always free\"), in rhododendron, the state flower.",
  "Wisconsin": "A sailor and a miner (work on water and land) hold the arms under a badger, the state animal, and the motto \"Forward\"; 1848 is statehood.",
  "Wyoming": "A bison carrying the state seal like a brand; blue for the sky and mountains, white for purity, red for the Native peoples and the pioneers.",
};
// "Blue hell": the flags of an emblem on a plain blue field, the hardest to tell apart (not Wyoming's, its bison in a
// red and white border, nor the blue ones of 2024, Minnesota's and Utah's).
const BLUE_HELL = ['Alaska', 'Connecticut', 'Idaho', 'Indiana', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Michigan', 'Montana', 'Nebraska',
  'Nevada', 'New Hampshire', 'New York', 'North Dakota', 'Oklahoma', 'Oregon', 'Pennsylvania', 'South Carolina', 'South Dakota', 'Vermont',
  'Virginia', 'Wisconsin'];
const NAME = Object.fromEntries(Object.entries(USPS).map(([name, code]) => [code, name]));
const REGION = Object.fromEntries(CENSUS.flatMap(([region, states]) => states.map(st => [st, region])));
const NAMES = Object.keys(USPS).sort();

// One area per state: its counties of the US Regions map joined (../shared/maps/us-states/states.js).
const STATE_AREAS = Object.keys(USPS).map(st => { const r = US_STATES.reg.find(r => r.id === USPS[st]); return { id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' }; });

const DIR = new URL('img/', document.currentScript.src).href;
const GROUPS = CENSUS.map(([title, states]) => ({ title, sub: '', ids: states }));
// A way to see the flags: Clear, or Blurred (cls 'blur', see area-quiz.js), each a kind of its own.
const kind = (key, label, lang, cls, more = {}) => ({
  key, label, lang, sub: `${NAMES.length} flags`, noun: ['flag', 'flags'], pickTitle: 'Flags to practice',
  groups: GROUPS,
  areasOf: st => [USPS[st]],
  areaLabel: a => a, areaRank: false, hints: false,
  short: st => USPS[st], name: st => st, about: st => [REGION[st], SYMBOLS[st]],
  clicked: a => NAME[a],
  prompt: 'photo', photo: st => ({ src: `${DIR}${USPS[st]}.jpg`, alt: 'state flag', label: st, cls, link: '' }),
  modes: ['list', 'type', 'pairs'], defaultMode: 'list', looks: true,
  chip: st => USPS[st], chipTitle: st => st,
  ...more,
});

const QUIZ = {
  key: 'usflags',
  areas: STATE_AREAS,
  borders: [US_STATES.reg.map(r => r.d).join('')], // every state's outline, also where a round leaves it out
  
  proj: US_STATES.proj, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
  
  size: [US_STATES.w, US_STATES.h], pad: 16, maxZoom: 60, labelScale: 0.14, fly: { pad: 1.6, min: 0.03 },
  hintLabel: '', hintsDefault: false,
  langsAlways: true, // every round box shows Clear | Blurred
  exploreKind: 'flags',
  explore: a => ({ code: a, title: NAME[a], sub: [REGION[NAME[a]], SYMBOLS[NAME[a]]], photos: [{ src: `${DIR}${a}.jpg`, alt: 'state flag', label: NAME[a], link: '' }] }),
  rounds: [...GROUPS.map(g => ({ kind: 'flags', label: g.title, groups: [g.title] })), { kind: 'flags', label: 'Blue hell', ids: BLUE_HELL },
    { kind: 'flags', label: 'All flags' }],
  kinds: [kind('flags', 'Flags', 'Clear', ''), kind('blurred', 'Blurred flags', 'Blurred', 'blur', { of: 'flags' })],
};
