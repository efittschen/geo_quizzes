#!/usr/bin/env node
// Brazil's postcodes (CEP) with their place on the map, from the address register of the 2022 census (IBGE, Cadastro
// Nacional de Endereços para Fins Estatísticos, CNEFE): every address in the country with its CEP and coordinates.
// GeoNames has one postcode per municipality for Brazil, too thin to draw the zones inside a state or a city.
//
//   node tools/builds/postcodes/brazil-cnefe.mjs cells    downloads the 27 state files (3.7 GB, into
//                                                         tools/cache/builds/brazil-cep) and counts the addresses per
//                                                         five-digit CEP and patch of land (0.01° each way)
//   node tools/builds/postcodes/brazil-cnefe.mjs points   writes BR.txt in the layout of the GeoNames postal files,
//                                                         for tools/postcodes.mjs --points: the places where each
//                                                         three-digit zone has addresses, finer where zones meet
//   node tools/builds/postcodes/brazil-cnefe.mjs counts quizzes/brazil-postcodes/post.js
//                                                         after the build: the real number of CEPs per zone (IBGE's
//                                                         Agregados por CEP), in place of the number of points
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { spawn, execFileSync } from 'node:child_process';

const DIR = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..', 'cache', 'builds', 'brazil-cep');
const BASE = 'https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/UF/';
const UF = { 11: 'RO', 12: 'AC', 13: 'AM', 14: 'RR', 15: 'PA', 16: 'AP', 17: 'TO', 21: 'MA', 22: 'PI', 23: 'CE', 24: 'RN', 25: 'PB', 26: 'PE', 27: 'AL', 28: 'SE', 29: 'BA', 31: 'MG', 32: 'ES', 33: 'RJ', 35: 'SP', 41: 'PR', 42: 'SC', 43: 'RS', 50: 'MS', 51: 'MT', 52: 'GO', 53: 'DF' };
const STATE = { RO: 'Rondônia', AC: 'Acre', AM: 'Amazonas', RR: 'Roraima', PA: 'Pará', AP: 'Amapá', TO: 'Tocantins', MA: 'Maranhão', PI: 'Piauí', CE: 'Ceará', RN: 'Rio Grande do Norte', PB: 'Paraíba', PE: 'Pernambuco', AL: 'Alagoas', SE: 'Sergipe', BA: 'Bahia', MG: 'Minas Gerais', ES: 'Espírito Santo', RJ: 'Rio de Janeiro', SP: 'São Paulo', PR: 'Paraná', SC: 'Santa Catarina', RS: 'Rio Grande do Sul', MS: 'Mato Grosso do Sul', MT: 'Mato Grosso', GO: 'Goiás', DF: 'Distrito Federal' };
const CELL = 0.01;
fs.mkdirSync(DIR, { recursive: true });

if (process.argv[2] === 'cells') {
  for (const [code, uf] of Object.entries(UF)) {
    const zip = path.join(DIR, `${code}_${uf}.zip`), out = path.join(DIR, `cells_${uf}.tsv`);
    if (fs.existsSync(out)) { console.log(uf, 'done before'); continue; }
    execFileSync('curl', ['-s', '-f', '-C', '-', '-A', 'Mozilla/5.0', '-o', zip, `${BASE}${code}_${uf}.zip`], { stdio: 'inherit' });
    const cells = new Map(); let rows = 0, used = 0, col = null;
    const unzip = spawn('unzip', ['-p', zip]);
    for await (const line of readline.createInterface({ input: unzip.stdout, crlfDelay: Infinity })) {
      const f = line.split(';');
      if (!col) { col = { muni: f.indexOf('COD_MUNICIPIO'), cep: f.indexOf('CEP'), lat: f.indexOf('LATITUDE'), lng: f.indexOf('LONGITUDE') }; continue; }
      rows++;
      const cep = f[col.cep], lat = +f[col.lat], lng = +f[col.lng];
      if (!/^\d{8}$/.test(cep) || cep === '00000000' || !f[col.lat] || !f[col.lng] || !isFinite(lat) || !isFinite(lng)) continue;
      used++;
      const key = `${Math.floor(lat / CELL)}\t${Math.floor(lng / CELL)}\t${cep.slice(0, 5)}`;
      const c = cells.get(key);
      if (c) { c[0]++; c[1] += lat; c[2] += lng; } else cells.set(key, [1, lat, lng, f[col.muni]]);
    }
    fs.writeFileSync(out + '.part', [...cells].map(([k, c]) => `${k}\t${c[0]}\t${(c[1] / c[0]).toFixed(5)}\t${(c[2] / c[0]).toFixed(5)}\t${c[3]}`).join('\n') + '\n');
    fs.renameSync(out + '.part', out);
    console.log(uf, `${rows} addresses, ${used} with a CEP and a position, ${cells.size} patches`);
  }
}

if (process.argv[2] === 'points') {
  // municipality names (IBGE's list of localities), for the place column
  const namesFile = path.join(DIR, 'municipios.json');
  if (!fs.existsSync(namesFile)) execFileSync('curl', ['-s', '-f', '-o', namesFile, 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios']);
  const NAME = Object.fromEntries(JSON.parse(fs.readFileSync(namesFile, 'utf8')).map(m => [String(m.id), m.nome]));
  // One point per three-digit zone and block of land (0.05° each way) with MIN addresses or more. Where a block
  // holds more than one zone, a border runs through it: there the points are its patches (0.01°), so the line
  // between two zones is drawn to about a kilometre, and to about five where nothing meets.
  const MIN = 3, BLOCK = 5;
  const blocks = new Map(); // block -> zone -> patch -> point
  for (const uf of Object.values(UF)) for (const line of fs.readFileSync(path.join(DIR, `cells_${uf}.tsv`), 'utf8').split('\n')) {
    if (!line) continue;
    const [la, lo, cep5, n, lat, lng, muni] = line.split('\t'), zone = cep5.slice(0, 3);
    const b = `${Math.floor(la / BLOCK)}\t${Math.floor(lo / BLOCK)}`, patch = `${la}\t${lo}`;
    if (!blocks.has(b)) blocks.set(b, new Map());
    const zones = blocks.get(b); if (!zones.has(zone)) zones.set(zone, new Map());
    const pts = zones.get(zone), p = pts.get(patch);
    if (p) { p.n += +n; p.lat += lat * n; p.lng += lng * n; if (+n > p.top) { p.top = +n; p.cep5 = cep5; p.muni = muni; } }
    else pts.set(patch, { n: +n, lat: lat * n, lng: lng * n, top: +n, cep5, muni });
  }
  const join = list => list.reduce((a, p) => ({ n: a.n + p.n, lat: a.lat + p.lat, lng: a.lng + p.lng, ...(p.top > a.top ? { top: p.top, cep5: p.cep5, muni: p.muni } : { top: a.top, cep5: a.cep5, muni: a.muni }) }), { n: 0, lat: 0, lng: 0, top: 0 });
  const out = []; let fine = 0;
  for (const zones of blocks.values()) {
    const real = [...zones].map(([zone, pts]) => [zone, [...pts.values()]]).filter(([, pts]) => pts.reduce((s, p) => s + p.n, 0) >= MIN);
    if (real.length > 1) { fine++; for (const [, pts] of real) out.push(...pts.filter(p => p.n >= MIN)); }
    else for (const [, pts] of real) out.push(join(pts));
  }
  const rows = out.map(p => ['BR', p.cep5 + '000', NAME[p.muni] || '', STATE[UF[p.muni.slice(0, 2)]], UF[p.muni.slice(0, 2)], '', '', '', '', (p.lat / p.n).toFixed(5), (p.lng / p.n).toFixed(5), '6'].join('\t'));
  fs.writeFileSync(path.join(DIR, 'BR.txt'), rows.join('\n') + '\n');
  console.log(`${blocks.size} blocks with addresses, ${fine} of them hold more than one zone -> ${rows.length} points in BR.txt`);
}

// The number of postcodes per zone in post.js: the tool counts the points it was given, the register has every CEP.
if (process.argv[2] === 'counts') {
  const file = process.argv[3], n = {};
  for (const line of execFileSync('unzip', ['-p', path.join(DIR, 'agregados_cep.zip')], { maxBuffer: 1 << 28 }).toString('latin1').split('\n').slice(1)) {
    const cep = line.split(';')[0]; if (!/^\d{8}$/.test(cep)) continue;
    for (const l of [1, 2, 3]) n[cep.slice(0, l)] = (n[cep.slice(0, l)] || 0) + 1;
  }
  const src = fs.readFileSync(file, 'utf8'), at = src.indexOf('const POST = '), POST = JSON.parse(src.slice(at + 13).replace(/;\s*$/, ''));
  for (const z in POST.n) if (n[z]) POST.n[z] = n[z];
  fs.writeFileSync(file, src.slice(0, at) + `const POST = ${JSON.stringify(POST)};\n`);
  console.log(`postcodes counted for ${Object.keys(POST.n).length} zones, ${Object.values(n).length ? Object.entries(n).filter(([z]) => z.length === 1).reduce((s, [, v]) => s + v, 0) : 0} in all`);
}
