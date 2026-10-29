// Brazil State Flags: the flags of ../shared/flag-config.js. Every state and the Distrito Federal flies its flag on
// schools and offices beside Brazil's; Rio Grande do Sul's is on houses and cars too. The flags (img/<state>.svg) are
// those of Wikimedia Commons, each the one Wikidata names for its state. The map is the states map of ../brazil-cep
// (IBGE), São Paulo's two CEP regions (SP0, SP1) drawn as one.

const AREAS_OF = {};
for (const r of DATA.reg) (AREAS_OF[r.id.slice(0, 2)] ||= []).push(r.id);
const state = (st, name, part) => [st, name, part, AREAS_OF[st], { short: st }];

const FLAGS = {
  key: 'brflags', alt: 'state flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' })), 
    proj: DATA.proj, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
    
    size: [1000, 1051], pad: 18, maxZoom: 20, labelScale: 0.42, fly: { pad: 3, min: 0.15 },
  },
  parts: ['North', 'Northeast', 'Central-West', 'Southeast', 'South'],
  items: [
    state('AC', 'Acre', 'North'), state('AP', 'Amapá', 'North'), state('AM', 'Amazonas', 'North'), state('PA', 'Pará', 'North'), state('RO', 'Rondônia', 'North'),
    state('RR', 'Roraima', 'North'), state('TO', 'Tocantins', 'North'),
    state('AL', 'Alagoas', 'Northeast'), state('BA', 'Bahia', 'Northeast'), state('CE', 'Ceará', 'Northeast'), state('MA', 'Maranhão', 'Northeast'),
    state('PB', 'Paraíba', 'Northeast'), state('PE', 'Pernambuco', 'Northeast'), state('PI', 'Piauí', 'Northeast'), state('RN', 'Rio Grande do Norte', 'Northeast'),
    state('SE', 'Sergipe', 'Northeast'),
    state('DF', 'Distrito Federal', 'Central-West'), state('GO', 'Goiás', 'Central-West'), state('MT', 'Mato Grosso', 'Central-West'), state('MS', 'Mato Grosso do Sul', 'Central-West'),
    state('ES', 'Espírito Santo', 'Southeast'), state('MG', 'Minas Gerais', 'Southeast'), state('RJ', 'Rio de Janeiro', 'Southeast'), state('SP', 'São Paulo', 'Southeast'),
    state('PR', 'Paraná', 'South'), state('RS', 'Rio Grande do Sul', 'South'), state('SC', 'Santa Catarina', 'South'),
  ],
};
