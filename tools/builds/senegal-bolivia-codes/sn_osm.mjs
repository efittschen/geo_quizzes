import fs from 'fs';
import {load,locate,nearest} from './pip.mjs';
const {DATA,GEO}=load('senegal');
const D=Object.fromEntries(DATA.reg.map(d=>[d.id,d]));
const j=JSON.parse(fs.readFileSync('osm_SN.json','utf8'));
const tab={}; let nfix=0; const ex={};
for(const e of j.elements){
  const lat=e.lat??e.center?.lat, lng=e.lon??e.center?.lon; if(lat==null)continue;
  const t=e.tags||{};
  const raw=[t.phone,t['contact:phone'],t.fax,t['contact:fax']].filter(Boolean).join(';');
  const nums=new Set();
  for(const part of raw.split(/[;,\/]| ou | - /)){
    let d=part.replace(/\D/g,''); if(d.startsWith('00221'))d=d.slice(5); else if(d.startsWith('221')&&d.length>=12)d=d.slice(3);
    if(d.length===9&&d.startsWith('33'))nums.add(d);
  }
  if(!nums.size)continue;
  let id=locate(GEO,lat,lng); if(!id){const [n,dd]=nearest(GEO,lat,lng); if(dd<0.05)id=n; else continue;}
  for(const n of nums){nfix++; const p3=n.slice(0,4), p4=n.slice(0,5);
    ((tab[p3]??={})[id]??=0); tab[p3][id]++;
    ((ex[p4]??={})[id]??=0); ex[p4][id]++;}
}
console.log('fixed numbers',nfix);
const show=(T)=>{for(const p of Object.keys(T).sort()){const e=Object.entries(T[p]).sort((a,b)=>b[1]-a[1]);console.log(p, e.reduce((s,x)=>s+x[1],0), e.map(([id,n])=>`${D[id].n}[${D[id].rn}]:${n}`).join(', '));}};
show(tab); console.log('--- 4 digit'); show(Object.fromEntries(Object.entries(ex).filter(([p])=>p.startsWith('339'))));
fs.writeFileSync('sn_osm_tab.json',JSON.stringify({tab,ex}));
