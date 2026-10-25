#!/usr/bin/env node
// A page to step through lloyd.py's search: each point in its town's color, the towns, the score of each step.
//
//   node tools/builds/city-vali/view.mjs US [--merge 6]
//
// Reads tools/cache/builds/city-vali/trace/, writes tools/cache/builds/city-vali/progress.html (open it in a browser).
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { CACHE } from '../../lib/geo.mjs';

const { values: o, positionals: [arg] } = parseArgs({ allowPositionals: true, options: { merge: { type: 'string', default: '6' } } });
const cc = (arg || 'US').toUpperCase(), DIR = path.join(CACHE, 'builds', 'city-vali', 'trace');
const pts = JSON.parse(fs.readFileSync(path.join(DIR, `${cc}_m${o.merge}_points.json`), 'utf8'));
const traces = fs.readdirSync(DIR).filter(f => f.startsWith(`${cc}_k`) && f.includes(`_m${o.merge}_`) && f.endsWith('.json')).sort()
  .map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const b64 = a => Buffer.from(Uint8Array.from(a)).toString('base64');
const used = new Set(traces.flatMap(t => t.steps.flatMap(s => s.S)));
const data = {
  cc, lat: pts.lat, lng: pts.lng, w: pts.w,
  towns: Object.fromEntries([...used].map(j => [j, pts.towns[j]])),
  runs: traces.map(t => ({ label: `${t.k} towns · α ${t.alpha} · start ${t.seed}`, k: t.k, steps: t.steps.map(s => ({ what: s.what, S: s.S, km: s.avg_km, score: s.score, below: s.below, people: s.people, asg: b64(s.asg) })) })),
};
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Town Search</title>
<style>
:root{--bg:#fff;--fg:#1d1d1f;--mute:#6e6e73;--line:#d2d2d7}
@media (prefers-color-scheme:dark){:root{--bg:#161617;--fg:#f5f5f7;--mute:#a1a1a6;--line:#3a3a3c}}
body{margin:0;background:var(--bg);color:var(--fg);font:14px system-ui,sans-serif}
header{display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:10px 16px;border-bottom:1px solid var(--line)}
select,button{font:inherit;color:inherit;background:transparent;border:1px solid var(--line);border-radius:6px;padding:4px 8px}
input[type=range]{flex:1;min-width:160px}
#info{padding:6px 16px;color:var(--mute);font-variant-numeric:tabular-nums}
canvas{display:block;width:100%;height:auto}
</style></head><body>
<header><select id="run"></select><select id="view"><option value="48">${cc === 'RU' ? 'Main' : '48 states'}</option><option value="all">All</option></select>
<button id="play">▶</button><input type="range" id="step" min="0" value="0"><span id="n"></span></header>
<div id="info"></div><canvas id="c"></canvas>
<script>
const D=${JSON.stringify(data)};
const asgOf=s=>s._a||(s._a=Uint8Array.from(atob(s.asg),c=>c.charCodeAt(0)));
const ext=(()=>{let a=[1e9,-1e9,1e9,-1e9];D.lat.forEach((t,i)=>{const g=D.lng[i];a=[Math.min(a[0],g),Math.max(a[1],g),Math.min(a[2],t),Math.max(a[3],t)];});const m=(a[3]-a[2])*0.03;return[a[0]-m,a[1]+m,a[2]-m,a[3]+m,(a[2]+a[3])/2];})();
const BOX=D.cc==='RU'?{48:[27,180,41,72,58],all:[19,191,41,78,60]}:D.cc==='US'?{48:[-126,-66,24,50,38],all:[-180,-64,17,72,45]}:{48:ext,all:ext};
const wrap=l=>D.cc==='RU'&&l<0?l+360:l;
const cv=document.getElementById('c'),ctx=cv.getContext('2d'),runSel=document.getElementById('run'),viewSel=document.getElementById('view'),slider=document.getElementById('step');
D.runs.forEach((r,i)=>runSel.add(new Option(r.label,i)));
const fmt=v=>v>=1e6?(v/1e6).toFixed(1)+'M':Math.round(v/1e3)+'k';
const hue=j=>'hsl('+((j*137.508)%360)+' 70% 50%)';
function draw(){
  const r=D.runs[runSel.value],s=r.steps[slider.value],a=asgOf(s),[L0,L1,A0,A1,phi]=BOX[viewSel.value];
  const W=Math.min(1800,innerWidth*devicePixelRatio),k=Math.cos(phi*Math.PI/180),H=Math.round(W*(A1-A0)/((L1-L0)*k));
  cv.width=W;cv.height=H;ctx.clearRect(0,0,W,H);
  const X=l=>(wrap(l)-L0)/(L1-L0)*W,Y=l=>(A1-l)/(A1-A0)*H,R=Math.max(1,W/900);
  const cols=Array.from({length:r.k},(_,j)=>hue(j));
  for(let i=0;i<D.lat.length;i++){ctx.fillStyle=cols[a[i]];ctx.fillRect(X(D.lng[i]),Y(D.lat[i]),R,R);}
  ctx.font=(11*devicePixelRatio)+'px system-ui';ctx.lineWidth=3*devicePixelRatio;
  s.S.forEach((t,j)=>{const T=D.towns[t],x=X(T.lng),y=Y(T.lat),rad=(3+Math.log10(T.pop)*1.2)*devicePixelRatio;
    ctx.beginPath();ctx.arc(x,y,rad,0,7);ctx.fillStyle='#000';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.5*devicePixelRatio;ctx.stroke();
    const lab=T.name+' '+fmt(T.pop);ctx.lineWidth=3*devicePixelRatio;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.strokeText(lab,x+rad+2,y+4);ctx.fillStyle='#000';ctx.fillText(lab,x+rad+2,y+4);});
  document.getElementById('n').textContent=(+slider.value+1)+' / '+r.steps.length;
  document.getElementById('info').textContent=s.what+' · '+s.km.toFixed(0)+' km · '+fmt(s.people)+' people · score '+s.score.toFixed(2);
}
function setRun(){slider.max=D.runs[runSel.value].steps.length-1;slider.value=slider.max;draw();}
runSel.onchange=setRun;viewSel.onchange=draw;slider.oninput=draw;addEventListener('resize',draw);
let timer=null;document.getElementById('play').onclick=e=>{if(timer){clearInterval(timer);timer=null;e.target.textContent='▶';return;}
  if(+slider.value>=+slider.max)slider.value=0;e.target.textContent='❚❚';
  timer=setInterval(()=>{if(+slider.value>=+slider.max){clearInterval(timer);timer=null;e.target.textContent='▶';return;}slider.value=+slider.value+1;draw();},700);};
setRun();
</script></body></html>`;
const out = path.join(CACHE, 'builds', 'city-vali', cc === 'US' ? 'progress.html' : `progress_${cc}.html`);
fs.writeFileSync(out, html);
console.log(`${traces.length} runs, ${traces.reduce((n, t) => n + t.steps.length, 0)} steps -> ${out} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB)`);
