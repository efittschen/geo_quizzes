import fs from 'fs';
import {load,locate,nearest} from './pip.mjs';
const {DATA,GEO}=load('bolivia');
const D=Object.fromEntries(DATA.reg.map(d=>[d.id,d]));
const j=JSON.parse(fs.readFileSync('osm_BO.json','utf8'));
const T2={},T3={},T4={}; let n8=0,n7=0; const recs=[];
for(const e of j.elements){
  const lat=e.lat??e.center?.lat, lng=e.lon??e.center?.lon; if(lat==null)continue;
  const t=e.tags||{};
  const raw=[t.phone,t['contact:phone'],t.fax,t['contact:fax']].filter(Boolean).join(';');
  const nums=new Set();
  for(const part of raw.split(/[;,\/]| o | y /)){
    let d=part.replace(/\D/g,''); if(d.startsWith('00591'))d=d.slice(5); else if(d.startsWith('591')&&d.length>=10)d=d.slice(3);
    if(d.length===8&&/^[234]/.test(d))nums.add(d);
  }
  if(!nums.size)continue;
  let id=locate(GEO,lat,lng); if(!id){const [n,dd]=nearest(GEO,lat,lng); if(dd<0.05)id=n; else continue;}
  for(const n of nums){n8++; recs.push([n,id,lat,lng,t.name||'',t['addr:city']||'']);
    for(const [T,k] of [[T2,2],[T3,3],[T4,4]]){const p=n.slice(0,k);((T[p]??={})[id]??=0);T[p][id]++;}}
}
console.log('8-digit fixed numbers',n8);
const show=(T,min=0)=>{for(const p of Object.keys(T).sort()){const e=Object.entries(T[p]).sort((a,b)=>b[1]-a[1]);const tot=e.reduce((s,x)=>s+x[1],0);if(tot>=min)console.log(p, tot, e.map(([id,n])=>`${D[id].name}:${n}`).join(', '));}};
show(T2); console.log('--- 3 digit'); show(T3); 
fs.writeFileSync('bo_osm_recs.json',JSON.stringify(recs));
fs.writeFileSync('bo_osm_tab.json',JSON.stringify({T2,T3,T4}));
