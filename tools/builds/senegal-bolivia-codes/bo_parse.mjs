import fs from 'fs';
const L = fs.readFileSync('itu_bo_s.txt','utf8').split('\n').map(s=>s.replace(/\s+/g,' ').trim());
const start = L.indexOf('Nuevos números locales de teléfonos fijos de Bolivia');
const hdr = new Set(['Nuevos números locales de teléfonos fijos de Bolivia','Departamento','Ciudad/localidad','Número local antiguo','Número local nuevo (siete cifras)','Marcación de larga distancia','Empresa','']);
const DEPS = ['BENI','CHUQUISACA','COCHABAMBA','LA PAZ','ORURO','PANDO','POTOSÍ','SANTA CRUZ','TARIJA'];
const rows=[]; let cur=null; let tail=[];
const body = L.slice(start).filter(s=>!hdr.has(s));
// rows of 6
let i=0;
while(i<body.length){
  if(DEPS.includes(body[i]) && /^X+$/.test(body[i+2]||'')){ rows.push(body.slice(i,i+6)); i+=6; }
  else { tail.push(i+': '+body[i]); i++; }
}
for(const r of rows) console.log(r.join(' | '));
console.log('TAIL', tail.length); console.log(tail.slice(0,80).join('\n'));
fs.writeFileSync('bo_rows.json', JSON.stringify(rows));
