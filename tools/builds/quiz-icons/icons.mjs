// Which picture (assets/js/quiz-icons.js) a quiz of data/site/quizzes.json shows on its card: by its role, else by its
// title; a title of a few quizzes takes the nearest picture. The builders that write entries of the list
// (town-names, plonkit, languages) take theirs from here too.

const BY_ROLE = { regions: 'regions', cities: 'cities', 'area-codes': 'codes', postcodes: 'post', names: 'names' };

const BY_TITLE = {
  regions: ['Budapest Districts', 'Vienna Districts', 'Buenos Aires Partidos', 'Greater Buenos Aires', 'Mennonite Colonies', 'Red Line', 'State Metas', 'Regions', 'Prefectures in Kanji', 'Ontario Counties', 'Rulers'],
  codes: ['Calling Codes'],
  post: ['London Postcodes'],
  names: ['Region Names'],
  plates: ['Plates', 'Plate Codes', 'Registration Stickers', 'ISO Codes: Communities', 'ISO Codes: Provinces'],
  letters: ['Letters', 'Scripts', 'Alphabets', 'Which Script', 'Cyrillic to Latin', 'Jawi Signs'],
  words: ['Words'],
  langs: ['Languages', 'Sign Languages', 'Regional Languages', 'Minority Signs', 'Scripts & Languages', 'Minority Languages'],
  roads: ['Road Numbers', 'Road Numbering', 'Road Prefixes', 'Road Letters', 'Road Shields', 'Highway Shields', 'Highways', 'Interstates', 'National Routes', 'M Highways', 'Road Grid', 'Roads & Signs', 'County Road Signs', 'Driving Side', 'Road Lines', 'Victoria C Roads', 'Route Numbers', 'SS Roads', 'State Highways', 'Road Diamonds'],
  flags: ['Flags', 'State Flags', 'Province Flags', 'Regional Flags', 'Department Flags', 'Canton Flags'],
  countries: ['Countries', 'Easy to Hard', 'Domains', 'Currencies'],
  parks: ['National Parks', 'National Forests'],
  signs: ['Adoption Signs', 'Historical Markers', 'NY Reference Markers', 'California Postmiles', 'Kilometre Markers'],
  speed: ['Speed Signs'],
  chevrons: ['Chevrons'],
  bollards: ['Bollards'],
  poles: ['Utility Poles', 'Poles', 'Transformers', 'Pole Plates'],
  bus: ['Bus Stops', 'Bus Stop Signs', 'Buses', 'Bike Sharing'],
  postbox: ['Post Boxes'],
  car: ['Google Vehicles', 'Camera Generations', 'Coverage', 'Coverage Years'],
  houses: ['Architecture', 'House Numbers'],
  scenery: ['Scenery', 'Snow', 'Snow Coverage'],
  stop: ['Stop Signs'],
  yield: ['Yield Signs'],
  animals: ['Animal Warning Signs'],
  walkers: ['Pedestrian Signs'],
  direction: ['Direction Signs'],
  citysigns: ['City Signs'],
  streetnames: ['Street Name Signs', 'Street Sign Codes', 'Street Sign Symbols', 'Street Suffixes'],
  signposts: ['Sign Posts'],
  backs: ['Back of Signs'],
  rivers: ['River Signs'],
  tramspeed: ['Tram Speed Signs'],
  railway: ['Railway Crossings'],
  lights: ['Traffic Lights'],
  fuel: ['Gas Stations', 'Chains'],
  beer: ['Beer'],
  rifts: ['Rifts'],
  sidewalks: ['Sidewalks'],
  trams: ['Tram Stops', 'Streetcars'],
  nature: ['Nature'],
  posthorn: ['Post'],
  follow: ['Follow Cars'],
  power: ['Power Companies', 'Power Networks', 'Lines Companies', 'Power Company Logos'],
  misc: ['Misc', 'Bin Companies'],
};
const TITLE = {};
for (const [icon, titles] of Object.entries(BY_TITLE)) for (const t of titles) TITLE[t] = icon;

// the picture of an entry ({ role, title, scope }), or undefined when none is set for it
export const iconOf = q => q.role && q.role !== 'plonkit' && BY_ROLE[q.role] ? BY_ROLE[q.role] : TITLE[q.title] || (q.scope === 'Languages' ? 'letters' : undefined);
