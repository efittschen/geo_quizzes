// United Kingdom Flags: the flags of ../shared/flag-config.js. The nations' flags (England's St George's cross,
// Scotland's saltire, Wales' dragon; for Northern Ireland the Ulster Banner, its flag until 1972 and still flown by
// unionists), and the county flags flown in England, those of the historic counties registered with the Flag
// Institute (Yorkshire's white rose, Sussex's martlets, Cornwall's St Piran's cross), each on the ceremonial counties
// it covers today; the City of London's, also on its street signs; and Orkney's and Shetland's, flown on the islands.
// The flags (img/<flag>.svg) are those of Wikimedia Commons, each the one Wikidata names for its place. The map is the
// counties and council areas of ../united-kingdom-regions (ONS, OSNI); names as there.

const NAME = Object.fromEntries(DATA.reg.map(r => [r.id, r.name]));
const NATION = {};
for (const r of DATA.reg) (NATION[r.nation] ||= []).push(r.id);
const en = (...slugs) => slugs.map(s => 'en-' + s);
// [flag, name, part, areas]: a county flag on the ceremonial counties of the same name unless named
const county = (id, name, part, areas = en(id)) => [id, name, part, areas];

const FLAGS = {
  key: 'gbflags', alt: 'flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: '' })), context: DATA.ctx,
    geo: GEO, proj: DATA.proj, kpu: DATA.kpu, // the map redrawn in Web Mercator (mercator.js), the street map under it
    street: {"bounds":[[49.9,-8.2],[60.9,1.8]],"maxBounds":[[45,-20],[64,10]]},
    size: [1000, 1852], pad: 16, maxZoom: 60, labelScale: 0.22, fly: { pad: 1.6, min: 0.025 },
  },
  parts: ['Nations and isles', 'North of England', 'East Midlands', 'West Midlands', 'East of England', 'South East', 'South West'],
  items: [
    ['ENG', 'England', 'Nations and isles', NATION.England], ['SCT', 'Scotland', 'Nations and isles', NATION.Scotland], ['WLS', 'Wales', 'Nations and isles', NATION.Wales],
    ['NIR', 'Northern Ireland', 'Nations and isles', NATION['Northern Ireland'], { what: 'Ulster Banner' }],
    ['orkney', 'Orkney', 'Nations and isles', ['sc-S12000023']], ['shetland', 'Shetland', 'Nations and isles', ['sc-S12000027']],
    county('northumberland', 'Northumberland', 'North of England'), county('durham', 'County Durham', 'North of England', en('county-durham')),
    county('cumberland', 'Cumberland', 'North of England', en('cumbria')), county('westmorland', 'Westmorland', 'North of England', en('cumbria')),
    county('yorkshire', 'Yorkshire', 'North of England', en('north-yorkshire', 'west-yorkshire', 'south-yorkshire', 'east-riding-of-yorkshire')),
    county('lancashire', 'Lancashire', 'North of England', en('lancashire', 'greater-manchester', 'merseyside')), county('cheshire', 'Cheshire', 'North of England'),
    county('derbyshire', 'Derbyshire', 'East Midlands'), county('nottinghamshire', 'Nottinghamshire', 'East Midlands'), county('lincolnshire', 'Lincolnshire', 'East Midlands'),
    county('leicestershire', 'Leicestershire', 'East Midlands'), county('rutland', 'Rutland', 'East Midlands'), county('northamptonshire', 'Northamptonshire', 'East Midlands'),
    county('staffordshire', 'Staffordshire', 'West Midlands'), county('shropshire', 'Shropshire', 'West Midlands'), county('herefordshire', 'Herefordshire', 'West Midlands'),
    county('worcestershire', 'Worcestershire', 'West Midlands'), county('warwickshire', 'Warwickshire', 'West Midlands'),
    county('norfolk', 'Norfolk', 'East of England'), county('suffolk', 'Suffolk', 'East of England'), county('essex', 'Essex', 'East of England'),
    county('cambridgeshire', 'Cambridgeshire', 'East of England'), county('huntingdonshire', 'Huntingdonshire', 'East of England', en('cambridgeshire')),
    county('bedfordshire', 'Bedfordshire', 'East of England'), county('hertfordshire', 'Hertfordshire', 'East of England'),
    county('kent', 'Kent', 'South East'), county('sussex', 'Sussex', 'South East', en('east-sussex', 'west-sussex')), county('surrey', 'Surrey', 'South East'),
    county('hampshire', 'Hampshire', 'South East'), county('isle-of-wight', 'Isle of Wight', 'South East'), county('berkshire', 'Berkshire', 'South East'),
    county('buckinghamshire', 'Buckinghamshire', 'South East'), county('oxfordshire', 'Oxfordshire', 'South East'), county('city-of-london', 'City of London', 'South East'),
    county('cornwall', 'Cornwall', 'South West'), county('devon', 'Devon', 'South West'), county('dorset', 'Dorset', 'South West'), county('somerset', 'Somerset', 'South West'),
    county('wiltshire', 'Wiltshire', 'South West'), county('gloucestershire', 'Gloucestershire', 'South West'),
  ],
  areaName: a => NAME[a],
};
