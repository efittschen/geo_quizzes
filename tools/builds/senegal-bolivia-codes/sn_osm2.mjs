import fs from 'fs';
import {load,locate,nearest} from './pip.mjs';
const {DATA,GEO}=load('senegal');
const D=Object.fromEntries(DATA.reg.map(d=>[d.id,d]));
const j=JSON.parse(fs.readFileSync('osm_SN.json','utf8'));
const recs=[];
for(const e of j.elements){
  const lat=e.lat??e.center?.lat, lng=e.lon??e.center?.lon; if(lat==null)continue;
  const t=e.tags||{};
  const raw=[t.phone,t['contact:phone'],t.fax,t['contact:fax']].filter(Boolean).join(';');
  const nums=new Set();
  for(const part of raw.split(/[;,\/]| ou | - /)){
    let d=part.replace(/\D/g,''); if(d.startsWith('00221'))d=d.slice(5); else if(d.startsWith('221')&&d.length>=12)d=d.slice(3);
    if(d.length===9&&d.startsWith('33'))nums.add(d);
  }
  let id=locate(GEO,lat,lng); if(!id){const [n,dd]=nearest(GEO,lat,lng); if(dd<0.05)id=n; else continue;}
  for(const n of nums) recs.push([n,id,D[id].n,D[id].rn,lat.toFixed(3),lng.toFixed(3),(t.name||'').slice(0,45),t.amenity||t.tourism||t.shop||t.office||'']);
}
fs.writeFileSync('sn_osm_recs.json',JSON.stringify(recs));
const want=new RegExp(process.argv[2]);
for(const r of recs.filter(r=>want.test(r[0])).sort((a,b)=>a[0]<b[0]?-1:1)) console.log(r[0].replace(/(..)(...)(..)(..)/,'$1 $2 $3 $4'),'|',r[2],'/',r[3],'|',r[4],r[5],'|',r[6],'|',r[7]);
