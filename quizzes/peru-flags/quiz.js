// Peru Regional Flags: the flags of ../shared/flag-config.js. Every region has a flag, flown on its offices, most
// adopted lately and rarely seen elsewhere; Cusco's rainbow flag (the city's until 2021) flies all over its region.
// The flags (img/<ISO code>.svg, three .png) are those of Wikimedia Commons, each the one Wikidata names for its region. The map
// is the departments map of ../peru-regions (INEI), each department its parts drawn as one; Lima's department holds
// both the Lima region and Lima Metropolitana, each with a flag of its own.

const PNG = new Set(['APU', 'CAL', 'UCA']); // flags Commons has only as pictures, not drawings
const AREAS_OF = {};
for (const r of DATA.reg) (AREAS_OF[r.dep] ||= []).push(r.id);
// [ISO 3166-2 code, INEI department, name, part]
const REGIONS = [
  ['AMA', '01', 'Amazonas', 'North'], ['CAJ', '06', 'Cajamarca', 'North'], ['LAL', '13', 'La Libertad', 'North'], ['LAM', '14', 'Lambayeque', 'North'],
  ['PIU', '20', 'Piura', 'North'], ['TUM', '24', 'Tumbes', 'North'],
  ['ANC', '02', 'Áncash', 'Centre'], ['CAL', '07', 'Callao', 'Centre'], ['HUV', '09', 'Huancavelica', 'Centre'], ['HUC', '10', 'Huánuco', 'Centre'], ['ICA', '11', 'Ica', 'Centre'],
  ['JUN', '12', 'Junín', 'Centre'], ['LIM', '15', 'Lima', 'Centre'], ['LMA', '15', 'Lima Metropolitana', 'Centre'], ['PAS', '19', 'Pasco', 'Centre'],
  ['APU', '03', 'Apurímac', 'South'], ['ARE', '04', 'Arequipa', 'South'], ['AYA', '05', 'Ayacucho', 'South'], ['CUS', '08', 'Cusco', 'South'], ['MOQ', '18', 'Moquegua', 'South'],
  ['PUN', '21', 'Puno', 'South'], ['TAC', '23', 'Tacna', 'South'],
  ['LOR', '16', 'Loreto', 'Amazon'], ['MDD', '17', 'Madre de Dios', 'Amazon'], ['SAM', '22', 'San Martín', 'Amazon'], ['UCA', '25', 'Ucayali', 'Amazon'],
];

const FLAGS = {
  key: 'peflags', alt: 'regional flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, g: '' })), context: DATA.ctx,
    geo: GEO, proj: DATA.proj, kpu: DATA.kpu, // the map redrawn in Web Mercator (mercator.js), the street map under it
    street: {"bounds":[[-18.4,-81.4],[-0.03,-68.65]],"maxBounds":[[-26,-92],[6,-58]]},
    size: [1000, 1474], pad: 16, maxZoom: 40, labelScale: 0.25, fly: { pad: 1.6, min: 0.0375 },
  },
  parts: ['North', 'Centre', 'South', 'Amazon'],
  items: [
    ...REGIONS.map(([id, dep, name, part]) => [id, name, part, AREAS_OF[dep], PNG.has(id) ? { file: id + '.png' } : {}]),
    ['CUS2', 'Cusco', 'South', AREAS_OF['08'], { what: 'Rainbow flag' }], // the city's flag until 2021, still flown all over the region
  ],
};
