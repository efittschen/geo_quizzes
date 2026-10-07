import fs from 'fs';
export function load(c){
  const R=decodeURIComponent(new URL('../../../../quizzes/'+c+'-regions/', import.meta.url).pathname);
  const DATA=new Function(fs.readFileSync(R+'data.js','utf8')+';return DATA')();
  const GEO=new Function(fs.readFileSync(R+'geo.js','utf8')+';return GEO')();
  return {DATA,GEO};
}
function inRing(lat,lng,r){let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [yi,xi]=r[i],[yj,xj]=r[j];if((yi>lat)!==(yj>lat)&&lng<(xj-xi)*(lat-yi)/(yj-yi)+xi)c=!c;}return c;}
export function locate(GEO,lat,lng){for(const [id,g] of Object.entries(GEO)){let n=0;for(const r of g.rings)if(inRing(lat,lng,r))n++;if(n%2===1)return id;}return null;}
export function nearest(GEO,lat,lng){let best=null,bd=1e9;for(const [id,g] of Object.entries(GEO))for(const r of g.rings)for(const [y,x] of r){const d=(y-lat)**2+(x-lng)**2;if(d<bd){bd=d;best=id;}}return [best,Math.sqrt(bd)];}
