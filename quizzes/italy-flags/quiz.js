// Italy Regional Flags: the flags of ../shared/flag-config.js. Every region has a flag, flown on its offices beside
// Italy's and the EU's; Sardegna's four Moors, Sicilia's trinacria, Veneto's lion and Friuli's eagle on houses too,
// and in Trentino-Alto Adige the flags of its two provinces, Südtirol's red and white above all. The flags (img/<ISO
// code>.svg) are those of Wikimedia Commons, each the one Wikidata names for its region or province. The map is the
// provinces map of ../italy-regions (ISTAT), each region its provinces drawn as one; names as there.

const AREAS_OF = {}, BY_SIGLA = {};
for (const r of DATA.reg) { (AREAS_OF[r.reg] ||= []).push(r.id); (BY_SIGLA[r.sigla] ||= []).push(r.id); }
// [ISO 3166-2 code, ISTAT region, name, part]
const REGIONS = [
  ['21', '1', 'Piemonte', 'North-West'], ['23', '2', "Valle d'Aosta/Vallée d'Aoste", 'North-West'], ['25', '3', 'Lombardia', 'North-West'], ['42', '7', 'Liguria', 'North-West'],
  ['32', '4', 'Trentino-Alto Adige/Südtirol', 'North-East'], ['34', '5', 'Veneto', 'North-East'], ['36', '6', 'Friuli-Venezia Giulia', 'North-East'], ['45', '8', 'Emilia-Romagna', 'North-East'],
  ['52', '9', 'Toscana', 'Centre'], ['55', '10', 'Umbria', 'Centre'], ['57', '11', 'Marche', 'Centre'], ['62', '12', 'Lazio', 'Centre'],
  ['65', '13', 'Abruzzo', 'South'], ['67', '14', 'Molise', 'South'], ['72', '15', 'Campania', 'South'], ['75', '16', 'Puglia', 'South'], ['77', '17', 'Basilicata', 'South'], ['78', '18', 'Calabria', 'South'],
  ['82', '19', 'Sicilia', 'Islands'], ['88', '20', 'Sardegna', 'Islands'],
];

const FLAGS = {
  key: 'itflags', alt: 'regional flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' })), context: DATA.ctx,
    proj: DATA.proj, kpu: DATA.kpu, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
    street: {"bounds":[[35.4,6.6],[47.1,18.6]],"maxBounds":[[31,0],[51,26]]},
    size: [1000, 1304], pad: 16, maxZoom: 30, labelScale: 0.22, fly: { pad: 1.6, min: 0.05 },
  },
  parts: ['North-West', 'North-East', 'Centre', 'South', 'Islands'],
  items: [
    ...REGIONS.map(([id, reg, name, part]) => [id, name, part, AREAS_OF[reg]]),
    ['BZ', 'Südtirol/Alto Adige', 'North-East', BY_SIGLA.BZ, { what: 'Provinz' }], ['TN', 'Trentino', 'North-East', BY_SIGLA.TN, { what: 'Provincia' }],
  ],
};
