// France Regional Flags: the flags of ../shared/flag-config.js. The traditional flags people and town halls fly, not
// the official regions' logos: the banners of the old provinces (Bretagne's Gwenn-ha-du, Normandie's two leopards and
// its Saint Olaf cross, Savoie's cross, Corse's Moor's head, and the rarer ones of the centre and west), and the flags
// that cross provinces: Occitanie's cross (also Languedoc's), the Catalan senyera (Roussillon's), the Basque ikurriña,
// and in Alsace Rot un Wiss, flown by people, beside the flag of the arms on town halls. Each on the départements
// where it belongs: a province on those it mostly covers (Picardie with Aisne and Oise, as in its region until 2015; a
// province without a flag of its own, Forez, Périgord, under its old government's, Lyonnais, Guyenne); 64 flies
// Béarn's and the ikurriña, 06 Nice's and Provence's (Grasse), the south many provinces' and Occitanie's. The flags
// (img/<flag>.svg) are those of Wikimedia Commons (public domain or CC0; CC BY-SA: Pays basque, Rouergue, Normandie's
// cross, credited on the page). The map is the départements map of ../france-regions (IGN).

const DEP_NAME = Object.fromEntries(DATA.reg.filter(r => r.id === 'd' + r.dep).map(r => [r.dep, r.name]));
const DEP_OF = Object.fromEntries(DATA.reg.map(r => [r.id, r.dep]));
const AREAS_OF = {};
for (const r of DATA.reg) (AREAS_OF[r.dep] ||= []).push(r.id);
// [flag, name, part, départements, more]
const flag = (id, name, part, deps, more = {}) => [id, name, part, deps.split(' ').flatMap(d => AREAS_OF[d]), more];

const FLAGS = {
  key: 'frflags', alt: 'regional flag',
  map: {
    areas: DATA.reg.map(r => ({ id: r.id, d: r.d, lx: r.lx, ly: r.ly, a: r.a, s: r.s, g: '' })), context: DATA.ctx,
    proj: DATA.proj, kpu: DATA.kpu, // the map made ready in Web Mercator (tools/builds/mercator), the street map under it
    street: {"bounds":[[41.3,-5.2],[51.1,9.6]],"maxBounds":[[36,-15],[56,20]]},
    size: [DATA.w, DATA.h], pad: 16, maxZoom: 30, labelScale: 0.3, fly: { pad: 1.6, min: 0.0375 },
  },
  parts: ['North', 'East', 'Centre', 'West', 'South-West', 'South-East'],
  items: [
    flag('BRE', 'Bretagne', 'North', '22 29 35 44 56'), flag('NOR', 'Normandie', 'North', '14 27 50 61 76'),
    flag('NOR2', 'Normandie', 'North', '14 27 50 61 76', { what: 'Croix de Saint-Olaf' }), flag('PIC', 'Picardie', 'North', '80 02 60'),
    flag('ART', 'Artois', 'North', '62'), flag('FLA', 'Flandre', 'North', '59'), flag('IDF', 'Île-de-France', 'North', '75 77 78 91 92 93 94 95'),
    flag('CHA', 'Champagne', 'East', '08 10 51 52'), flag('LOR', 'Lorraine', 'East', '54 55 57 88'), flag('ALS', 'Alsace', 'East', '67 68'),
    flag('ALS2', 'Alsace', 'East', '67 68', { what: 'Rot un Wiss' }), flag('FRC', 'Franche-Comté', 'East', '25 39 70 90'), flag('BOU', 'Bourgogne', 'East', '01 21 71 89'),
    flag('NIV', 'Nivernais', 'Centre', '58'), flag('BBN', 'Bourbonnais', 'Centre', '03'), flag('BER', 'Berry', 'Centre', '18 36'), flag('ORL', 'Orléanais', 'Centre', '28 41 45'),
    flag('TOU', 'Touraine', 'Centre', '37'), flag('AUV', 'Auvergne', 'Centre', '15 63'), flag('LIM', 'Limousin', 'Centre', '19 87'), flag('MAR', 'Marche', 'Centre', '23'),
    flag('ANJ', 'Anjou', 'West', '49'), flag('MAI', 'Maine', 'West', '53 72'), flag('POI', 'Poitou', 'West', '79 85 86'), flag('SAI', 'Saintonge', 'West', '17'),
    flag('ANG', 'Angoumois', 'West', '16'),
    flag('GUY', 'Guyenne', 'South-West', '33 47 24'), flag('GAS', 'Gascogne', 'South-West', '32 40 65'), flag('BEA', 'Béarn', 'South-West', '64'),
    flag('BAS', 'Pays basque', 'South-West', '64'), flag('OCC', 'Occitanie', 'South-West', '09 11 12 30 31 32 34 46 48 65 81 82 07 43'),
    flag('FOI', 'Comté de Foix', 'South-West', '09'), flag('ROU', 'Rouergue', 'South-West', '12'), flag('CAT', 'Catalogne Nord', 'South-West', '66'),
    flag('LYO', 'Lyonnais', 'South-East', '69 42'), flag('DAU', 'Dauphiné', 'South-East', '05 26 38'), flag('SAV', 'Savoie', 'South-East', '73 74'),
    flag('NIC', 'Comté de Nice', 'South-East', '06'), flag('PRO', 'Provence', 'South-East', '04 06 13 83 84'), flag('VEN', 'Comtat Venaissin', 'South-East', '84'),
    flag('COR', 'Corse', 'South-East', '2A 2B'),
  ],
  areaName: a => DEP_NAME[DEP_OF[a]], areaCode: a => DEP_OF[a],
};
