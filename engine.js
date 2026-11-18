
const $=i=>document.getElementById(i),C=$('c'),X=C.getContext('2d'),MM=$('mm'),MX=MM.getContext('2d');
const W=2500,CS=40,G=64,RY=1200,FC=['#2b7de9','#d9383a','#e5b822','#2ea85c','#8e44ad'],FN=['Blue','Red','Yellow','Green','Purple'];
const rnd=(a,b)=>a+Math.random()*(b-a),hyp=Math.hypot,cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const ST={scout:{n:'Scout Car',k:'Q',cost:80,hp:60,spd:130,rng:120,dmg:6,rate:.35,vis:420},
inf:{n:'Infantry',k:'F',cost:100,hp:70,spd:55,rng:130,dmg:16,rate:1.3,vis:230},
eng:{n:'Engineer',k:'E',cost:120,hp:80,spd:70,rng:0,dmg:0,rate:1,vis:230},
tank:{n:'Tank',k:'R',cost:220,hp:260,spd:62,rng:200,dmg:32,rate:1.4,vis:270},
art:{n:'Rocket Art.',k:'T',cost:260,hp:90,spd:42,rng:540,dmg:45,rate:3.6,vis:210,splash:70},
truck:{n:'Fuel Truck',hp:50,spd:95,rng:0,dmg:0,vis:170},
mcv:{n:'Mobile HQ',hp:300,spd:50,rng:0,dmg:0,rate:1,vis:300},
blayer:{n:'Bridge Layer',k:'G',cost:150,hp:120,spd:60,rng:0,dmg:0,rate:1,vis:230}};
const ORDER=['scout','inf','eng','tank','art','blayer'];
/* Defences (press B with an engineer). ter: sand = bare sand only, road = roads only, land = anywhere dry that is not a road. */
const DEF={
 sand:{n:'Sandbags',cost:25,spr:'sandbagStraight',hp:160,cover:36,ter:'land',anyGround:1,rot:1,r:8},
 sandc:{n:'Sandbag Corner',cost:25,spr:'sandbagCorner',hp:160,cover:36,ter:'land',anyGround:1,rot:1,r:8},
 trap:{n:'Tank Traps',cost:40,spr:'tankTraps',hp:260,ter:'road',blk:1,r:8},
 gate:{n:'Checkpoint',cost:10,spr:'checkpoint',hp:200,ter:'road',blk:1,gate:1,r:8},
 tower:{n:'Watchtower',cost:60,spr:'watchtower',hp:100,vis:380,ter:'land',r:8},
 mg:{n:'MG Nest',cost:90,base:'emplacement',gun:'mgGun',hp:120,ter:'land',rng:190,dmg:5,rate:.22,sp:600,a:'mg',vs:['inf','eng','scout','truck']},
 at:{n:'AT Gun',cost:140,base:'emplacement',gun:'atGun',hp:140,ter:'land',rng:270,dmg:45,rate:1.6,a:'at',vs:['tank','art','mcv','scout','truck','eng']},
 mortar:{n:'Mortar Pit',cost:150,spr:'mortarPit',hp:100,ter:'land',rng:420,min:90,dmg:24,rate:2.4,splash:45,ar:1,sp:200,a:'art'},
 cram:{n:'C-RAM',cost:200,base:'cramBase',gun:'cramGun',hp:120,ter:'land',rng:330,rate:.6,cram:1},
 bunker:{n:'Bunker',cost:260,spr:'bunker',hp:500,ter:'land',rng:210,dmg:11,rate:.5,sp:550,a:'bunk',r:16,bt:3},
 silo:{n:'Missile Silo',cost:450,spr:'missileSilo',hp:520,ter:'land',r:18,rng:1200,vis:260,silo:1,rate:18}};
const LINE={sand:22,trap:26,trench:12,road:32};
let MAP='desert';
let MYF=0;
/* Vietnam's forest mask is shared by rendering and movement so the canopy is impassable. */
let _fe=null;const forestEntities=()=>_fe||(_fe=[...rigs,...towns,...hqs.filter(h=>h!==hqs[0])].map(e=>[e.x,e.y,e.isHQ?75:e.capital?105:e.t=='rig'?52:62]));
function forestAt(x,y){
 if(MAP!='snow'||drv(x,y))return 0;
 for(const e of forestEntities())if(Math.abs(x-e[0])<e[2]&&Math.abs(y-e[1])<e[2])return 0;
 const m=vn(x,y,70,12)*.65+vn(x,y,20,13)*.35;
 return m>=.46;
}
function forest(g){const K=['treeBroad','treeOlive','treePalm','treeBroad','scrub'],ents=forestEntities(),sg=segs().filter(s=>!s.br);g.imageSmoothingEnabled=true;
 for(let y=10;y<W;y+=10)for(let x=10;x<W;x+=10){const jx=x+hrnd(x,y,1)*8-4,jy=y+hrnd(x,y,2)*8-4;if(!forestAt(jx,jy))continue;
  let bad=0;for(const s of sg){if(segD(jx,jy,s.a,s.b).d<24){bad=1;break}}if(bad)continue;
  const m=vn(jx,jy,70,12)*.65+vn(jx,jy,20,13)*.35,n=K[hrnd(x,y,3)*5|0],cv=Assets.get(n,0),sc=(.6+hrnd(x,y,4)*.45+(m-.46)*.4)*(n=='scrub'?1.2:1);g.drawImage(cv,jx-cv.width*sc/2,jy-cv.height*sc/2,cv.width*sc,cv.height*sc)}
 g.imageSmoothingEnabled=false}
/* the capital sits on a sandy island in the middle of the river; the N-S road is its causeway */
function island(g){for(let y=1138;y<1262;y++)for(let x=1058;x<1342;x++){const nx=(x-1200)/136,ny=(y-1200)/56,d=Math.pow(Math.abs(nx),8)+Math.pow(Math.abs(ny),8)+(hrnd(x>>2,y>>2,5)-.5)*.2;if(d<1){g.fillStyle=d>.8?PAL.ground[4]:(hrnd(x>>2,y>>2,6)<.5?PAL.ground[2]:PAL.ground[3]);g.fillRect(x,y,1,1)}}for(const p of[[1160,1156],[1242,1156],[1162,1246],[1240,1246]]){g.imageSmoothingEnabled=true;g.drawImage(Assets.get(hrnd(p[0],p[1],1)<.5?'treePalm':'treeOlive',0),p[0]-12,p[1]-12,24,24);g.imageSmoothingEnabled=false}}
const WATER=c=>{for(let y=1136;y<1264;y+=16)for(let x=0;x<W;x+=16)Assets.drawK(c,'water',0,x,y)};
function applyMap(kind){MAP=kind;_fe=null;placeCap();WX.fog=kind=='snow'?.4:0;WX.sand=0;WX.kind='clear';WX.next=20;const g=TC.getContext('2d');g.clearRect(0,0,W,W);
 if(kind=='snow'){Terrain.jungle(g,W,W);forest(g);bridges.forEach(b=>{b.hp=0;b.rb=0})}
 else{bridges.forEach(b=>{b.hp=b.mhp;b.rb=0});Terrain.fast(g,W,W);for(let i=0;i<220;i++){const x=hrnd(i,1,1)*W|0,y=hrnd(i,2,2)*W|0;if(Math.abs(y-RY)<110)continue;Assets.draw(g,'rock',0,x,y)}WATER(g);R(g,0,1128,W,8,PAL.ground[3]);R(g,0,1264,W,8,PAL.ground[3]);R(g,0,1132,W,4,PAL.ground[4]);R(g,0,1264,W,4,PAL.ground[4]);island(g);drawRoads(g);drawKits(g)}
 BASE.getContext('2d').drawImage(TC,0,0);if(kind=='snow'){drawRoads(g);drawKits(g)}}

let E=[],P=[],FX=[],CR=[],WR=[],HE=[],nid=1,sel=[],grp={},T=0,over=0,cam={x:0,y:1700,z:1},keys={},mouse={x:0,y:0,in:0,drag:null,pan:null,stroke:null},msgT=0;
const F=FN.map((n,i)=>({i,oil:260,alive:1,vis:new Uint8Array(G*G),gh:new Map(),at:rnd(0,1.5)}));
function mk(o){o.id=nid++;o.ang=o.ang||0;o.cd=0;E.push(o);return o}
function unit(t,f,x,y){const s=ST[t];return mk({t,f,x,y,hp:s.hp,mhp:s.hp,u:1,path:[],tgt:null,act:null,at:null,sc:0,ft:null,stop:0,rt:0})}
const hqs=[[500,2150],[300,300],[1200,260],[1900,2150],[2100,300]].map((p,i)=>mk({t:'town',f:i,x:p[0],y:p[1],r:26,s:1,cap:0,cf:-1,gar:2,capital:0,isHQ:1,dormant:i?0:1,q:[],qt:0}));
E.splice(E.indexOf(hqs[0]),1);
const rigs=[[350,950],[900,850],[1500,850],[2050,950],[350,1500],[900,1550],[1500,1550],[2050,1450],[700,1900],[1700,1900],[1110,1200],[1290,1200]].map(p=>mk({t:'rig',f:-1,x:p[0],y:p[1],r:22,s:1,cap:0,cf:-1,tm:rnd(2,8),tk:null}));
const towns=[];{const taken=[...hqs,...rigs];let tr=0;while(towns.length<16&&tr++<4000){const x=rnd(140,W-140),y=rnd(140,W-140);if(Math.abs(y-RY)<140||taken.some(e=>hyp(e.x-x,e.y-y)<260))continue;const t=mk({t:'town',f:-1,x,y,r:26,s:1,cap:0,cf:-1,gar:0,q:[],qt:0});towns.push(t);taken.push(t)}}
const ALLT=[...hqs.filter(h=>!h.dormant),...towns];
const NAMES=['Al Sharif','Al Nasir','Dar Hakim','Bir Zaman','Qasr Rashid','Al Mansur','Tal Jamil','Wadi Salim','Al Karim','Umm Fahad','Ras Harun','Al Qadir','Bab Idris','Jabal Amin','Ain Mustafa','Al Zahra','Kafr Samir','Dhahab','Al Faris','Hisn Yusuf','Souq Tariq','Al Mahdi','Nahr Khalid','Al Jabir','Qarya Omar','Al Basra'];
{const p=[...NAMES].sort(()=>Math.random()-.5);let i=0;[...hqs,...towns].forEach(e=>e.name=p[i++])}
function tag(g,e){const x=e.isHQ?e.x-34:e.kx+2,y=e.isHQ?e.y+40:e.ky+81;g.font='bold 11px "Courier New",monospace';g.textAlign='left';const w=g.measureText(e.name).width;g.fillStyle='rgba(10,14,9,.7)';g.fillRect(x-2,y-10,w+6,14);g.fillStyle='#e8d9a8';g.fillText(e.name,x+1,y+1);g.font='10px sans-serif'}
const bridges=[600,1800].map(x=>({isB:1,t:'bridge',x,y:RY,hp:500,mhp:500,rb:0}));
const N=[],nd=(x,y)=>{const n={x,y,a:[],i:N.length,s:new Set()};N.push(n);return n};
const l2=(a,b,br)=>{const w=hyp(a.x-b.x,a.y-b.y);a.a.push({n:b,w,br});b.a.push({n:a,w,br})};
const lk=(a,b,br)=>{if(a==b||a.s.has(b))return;a.s.add(b);b.s.add(a);
 const L=hyp(a.x-b.x,a.y-b.y),n=Math.round(L/60);if(br||a.isl||b.isl||n<2){l2(a,b,br);return}
 const sd=(Math.round(a.x+b.x)*7+Math.round(a.y+b.y)*13)%997,nx=-(b.y-a.y)/L,ny=(b.x-a.x)/L,amp=Math.min(55,L*.16),ph=hrnd(sd,1,1)*6.28,fq=1+(sd%2),top=a.y<RY;let pv=a;
 for(let k=1;k<n;k++){const t=k/n,o=amp*Math.sin(t*Math.PI)*(.75*Math.sin(t*Math.PI*fq+ph)+.15*(hrnd(sd,k,2)-.5)),y=a.y+(b.y-a.y)*t+ny*o,m=nd(cl(a.x+(b.x-a.x)*t+nx*o,60,W-60),top?cl(y,60,1105):cl(y,1295,W-60));m.el=1;l2(pv,m);pv=m}l2(pv,b)};
[...hqs,...rigs,...towns].forEach(e=>{if(e.isHQ){e.nd={x:e.x,y:e.y,a:[],s:new Set(),i:-1};const g=e.gate=nd(e.x+(e.x<W/2?80:-80),e.y);if(e.dormant)g.dormant=1;return}
 e.nd=nd(e.x,e.y);e.nd.R=e.r+14;if(Math.abs(e.y-RY)<80)e.nd.isl=1;if(e.t=='town'){e.nd.kit=1;e.nd.kw=48;e.nd.kh=42}});
bridges.forEach(b=>{b.nN=nd(b.x,1060);b.nS=nd(b.x,1340);b.nN.R=b.nS.R=22});
const HUBN=nd(1200,1200);HUBN.isl=1;const IN=nd(1200,1060),IS=nd(1200,1340);IN.R=IS.R=22;
var SG=null;
function buildRoads(){SG=null;const keep=N.filter(n=>!n.el&&!n.dormant);N.length=0;keep.forEach((n,i)=>{n.i=i;n.a=[];n.s=new Set();N.push(n)});
 bridges.forEach(b=>lk(b.nN,b.nS,b));lk(IN,HUBN);lk(HUBN,IS);for(const r of rigs)if(r.nd.isl)lk(HUBN,r.nd);
 const CH=[],o=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x),X2=(a,b,c,d)=>o(a,b,c)*o(a,b,d)<0&&o(c,d,a)*o(c,d,b)<0;
 for(const s of[0,1]){const L=N.filter(n=>!n.isl&&!n.el&&(n.y<RY?0:1)==s),T2=[L[0]],rest=L.slice(1);
  while(rest.length){let bi=0,bj=0,bd=1e9;rest.forEach((r,i)=>T2.forEach((t,j)=>{const d=hyp(r.x-t.x,r.y-t.y);if(d<bd){bd=d;bi=i;bj=j}}));lk(T2[bj],rest[bi]);CH.push([T2[bj],rest[bi]]);T2.push(rest.splice(bi,1)[0])}
  for(const n of L){const c=L.filter(m=>m!=n&&!n.s.has(m)&&hyp(n.x-m.x,n.y-m.y)<450).sort((p,q)=>hyp(p.x-n.x,p.y-n.y)-hyp(q.x-n.x,q.y-n.y)).find(m=>!CH.some(h=>h[0]!=n&&h[0]!=m&&h[1]!=n&&h[1]!=m&&X2(n,m,h[0],h[1])));if(c){lk(n,c);CH.push([n,c])}}}}
buildRoads();
function placeCap(){buildRoads()}
function route(a,b){const D=new Map([[a,0]]),pv=new Map(),Q=[a],dn=new Set();while(Q.length){Q.sort((p,q)=>D.get(p)-D.get(q));const u=Q.shift();if(dn.has(u))continue;dn.add(u);if(u==b)break;for(const e of u.a){if((e.br&&e.br.hp<=0)||e.cut)continue;const d=D.get(u)+e.w;if(!D.has(e.n)||d<D.get(e.n)){D.set(e.n,d);pv.set(e.n,u);Q.push(e.n)}}}
 if(!dn.has(b))return null;const r=[];for(let u=b;u!=a;u=pv.get(u))r.unshift(u);return r}
const TC=document.createElement('canvas');TC.width=TC.height=W;const BASE=document.createElement('canvas');BASE.width=BASE.height=W;
(function(){const g=TC.getContext('2d');Terrain.fast(g,W,W);
 for(let i=0;i<220;i++){const x=hrnd(i,1,1)*W|0,y=hrnd(i,2,2)*W|0;if(Math.abs(y-RY)<110)continue;Assets.draw(g,'rock',0,x,y)}
 WATER(g);
 R(g,0,1128,W,8,PAL.ground[3]);R(g,0,1264,W,8,PAL.ground[3]);R(g,0,1132,W,4,PAL.ground[4]);R(g,0,1264,W,4,PAL.ground[4]);island(g);
 BASE.getContext('2d').drawImage(TC,0,0);drawRoads(g);drawKits(g)})();
function drawRoads(g){const S=[],md=(p,q)=>[(p.x+q.x)/2,(p.y+q.y)/2],pt=n=>[n.x,n.y];
 /* straight bits + quadratic curves through every winding node = smooth roads */
 for(const n of N){for(const e of n.a){const m=e.n;if(e.br||e.hid||n.i>=m.i||(n.el&&m.el))continue;const c=md(n,m);S.push({a:n.el?c:pt(n),b:m.el?c:pt(m)})}
  if(n.el){const nb=n.a.filter(e=>!e.br&&!e.hid);if(nb.length==2)S.push({a:md(n,nb[0].n),b:md(n,nb[1].n),c:pt(n)})}}
 if(MAP!='snow')for(const b of bridges)S.push({a:[b.x,b.nN.y],b:[b.x,1136]},{a:[b.x,1264],b:[b.x,b.nS.y]});
 const path=()=>{g.beginPath();for(const q of S){g.moveTo(q.a[0],q.a[1]);if(q.c)g.quadraticCurveTo(q.c[0],q.c[1],q.b[0],q.b[1]);else g.lineTo(q.b[0],q.b[1])}};
 const st=(w,c,al)=>{g.globalAlpha=al||1;g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';path();g.stroke();g.globalAlpha=1};
 st(24,'rgba(70,52,28,.14)');st(19,'rgba(70,52,28,.2)');
 st(14,PAL.road);
 st(9,'rgba(30,22,12,.22)');st(3.5,PAL.road);
 st(2,PAL.roadHi,.4);
 /* gravel / dirt speckle */
 for(const q of S){const L=hyp(q.b[0]-q.a[0],q.b[1]-q.a[1]),n=Math.ceil(L/3);
  for(let i=0;i<n;i++){const t=(i+hrnd(i,L|0,21))/n,u=1-t;
   const x=q.c?u*u*q.a[0]+2*u*t*q.c[0]+t*t*q.b[0]:q.a[0]+(q.b[0]-q.a[0])*t,y=q.c?u*u*q.a[1]+2*u*t*q.c[1]+t*t*q.b[1]:q.a[1]+(q.b[1]-q.a[1])*t,
   r=hrnd(x|0,y|0,22),ox=(hrnd(x|0,y|0,23)-.5)*15,oy=(hrnd(x|0,y|0,24)-.5)*15;
   g.fillStyle=r<.5?'rgba(40,30,18,.35)':'rgba(210,190,150,.3)';g.fillRect(Math.round(x+ox),Math.round(y+oy),r<.15?2:1,1)}}
 for(const n of N){if(n.el||!n.R||n.kit)continue;const rr=n.R,x=Math.round(n.x),y=Math.round(n.y);disc(g,x,y,rr+2,'rgba(40,40,30,.3)');disc(g,x,y,rr,PAL.road);disc(g,x,y,rr-2,PAL.roadHi);disc(g,x,y,rr-4,PAL.road);disc(g,x,y,rr-9,'#6f7a45');disc(g,x,y,2,'#3f4e2a')}}
/* towns are drawn from the 2x kit onto a temp canvas, then scaled down into the world map */
function kit(g,x0,y0,w,h,seed,team,cap){const cv=document.createElement('canvas');cv.width=w*2;cv.height=h*2;const c=cv.getContext('2d');if(cap)Town2.capital(c,0,0,w*2,h*2,seed,team);else Town2.small(c,0,0,w*2,h*2,seed,team);g.imageSmoothingEnabled=true;g.drawImage(cv,x0,y0,w,h);g.imageSmoothingEnabled=false}
function drawKits(g){for(const e of ALLT){if(e.isHQ){e.kx=Math.round(e.x-48);e.ky=Math.round(e.y-42);continue}if(e.capital){const cw=MAP=='snow'?160:256,ch=MAP=='snow'?128:96,x0=Math.round(e.x-cw/2),y0=Math.round(e.y-ch/2);e.kx=x0;e.ky=y0;e.kw=cw;e.kh=ch;e.nd.kw=cw/2;e.nd.kh=ch/2;kit(g,x0,y0,cw,ch,3+(e.f<0?0:e.f),5,1)}else{const x0=Math.round(e.x-48),y0=Math.round(e.y-42);e.kx=x0;e.ky=y0;kit(g,x0,y0,96,84,e.id%7+1,5,0)}}}
const BC=[];function bridgeCv(k){if(BC[k])return BC[k];const cv=document.createElement('canvas');cv.width=80;cv.height=32;const c=cv.getContext('2d');for(let i=0;i<3;i++){c.save();c.translate(i*32,0);NS.water.draw(c);c.restore()}
 if(k==0)deck(c,0,80);else if(k==1){deck(c,0,80);for(let y=6;y<26;y++)for(let x=24;x<56;x++){const d=Math.hypot((x-40)*.5,y-15.5)+(hrnd(x,y,3)-.5)*6;if(d<6)dot(c,x,y,'#1f4050');else if(d<8){const r=hrnd(x,y,8);dot(c,x,y,r<.3?'#8a4b2a':'rgba(20,15,10,.5)')}}dot(c,28,12,'#e67e22');dot(c,52,19,'#e67e22');dot(c,52,18,'#f5d76e')}
 else{deck(c,0,7);deck(c,73,80);for(let i=0;i<90;i++){const x=7+(hrnd(i,1,9)*66|0),y=8+(hrnd(i,2,9)*15|0),q=hrnd(i,3,9);rect(c,x,y,2+(hrnd(i,4,9)*3|0),2+(hrnd(i,5,9)*2|0),q<.4?'#6f726e':q<.8?'#9a9c96':'#8a4b2a')}dot(c,30,14,'#e67e22');dot(c,50,17,'#e67e22');dot(c,50,16,'#f5d76e')}
 return BC[k]=cv}
const FCV=document.createElement('canvas');FCV.width=FCV.height=600;const FG=FCV.getContext('2d'),FI=FG.createImageData(600,600),BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
let fogSig=null;function updFog(){const v=F[MYF].vis;let sg=0;for(let i=0;i<v.length;i++)sg=(sg*31+v[i]+i)|0;if(sg===fogSig)return;fogSig=sg;const D=new Float32Array(G*G);for(let i=0;i<D.length;i++)D[i]=v[i]==2?0:v[i]?.5:.93;const d=FI.data;
 for(let y=0;y<600;y++){const gy=(y+.5)/10-.5,iy=Math.floor(gy),fy=gy-iy,y0=cl(iy,0,G-1),y1=cl(iy+1,0,G-1);for(let x=0;x<600;x++){const gx=(x+.5)/10-.5,ix=Math.floor(gx),fx=gx-ix,x0=cl(ix,0,G-1),x1=cl(ix+1,0,G-1);
  const a=D[y0*G+x0],b=D[y0*G+x1],c=D[y1*G+x0],e=D[y1*G+x1],Dv=a+(b-a)*fx+(c-a)*fy+(a-b-c+e)*fx*fy,q=Math.floor(Dv*4+(BAY[(y&3)*4+(x&3)]+.5)/16)/4,i=(y*600+x)*4;d[i]=8;d[i+1]=9;d[i+2]=7;d[i+3]=Math.min(235,q*255)}}FG.putImageData(FI,0,0)}
const vi=(f,x,y)=>F[f].vis[cl(y/CS|0,0,G-1)*G+cl(x/CS|0,0,G-1)];
const seen=(f,e)=>e.f==f||(e.s?vi(f,e.x,e.y)>0:vi(f,e.x,e.y)==2);
function reveal(v,x,y,r){const c=r/CS|0,cx=x/CS|0,cy=y/CS|0;for(let j=-c;j<=c;j++)for(let i=-c;i<=c;i++){const a=cx+i,b=cy+j;if(a>=0&&b>=0&&a<G&&b<G&&i*i+j*j<=c*c)v[b*G+a]=2}}
function updVis(){for(const f of F){const v=f.vis;for(let i=0;i<v.length;i++)if(v[i]==2)v[i]=1}
for(const e of E)if(e.f>=0&&F[e.f].alive)reveal(F[e.f].vis,e.x,e.y,(e.u?ST[e.t].vis:e.def?e.vis:e.isHQ?420:e.t=='town'?300:200)*vm());for(const h of HE){reveal(F[h.f].vis,h.x,h.y,300);if(h.st<2)reveal(F[h.f].vis,h.tx,h.ty,260)}}
function updGh(dt){for(const f of F){for(const [k,g] of f.gh){if(g.u){g.age+=dt;if(g.age>45||vi(f.i,g.x,g.y)==2)f.gh.delete(k)}else if(g.def&&g.e.dead&&vi(f.i,g.x,g.y)==2)f.gh.delete(k)}
 for(const e of E)if(e.f!=f.i&&(e.u||e.s)&&(e.s?vi(f.i,e.x,e.y)==2:vi(f.i,e.x,e.y)==2))f.gh.set(e.id,{e,id:e.id,x:e.x,y:e.y,t:e.t,f:e.f,ang:e.ang,u:e.u,age:0,def:e.def,k:e.k,rot:e.rot,gang:e.gang});
 if(f.i==MYF)for(const e of [...rigs,...towns,...(hqs[MYF].dormant?[]:[hqs[MYF]])])if(vi(MYF,e.x,e.y)==2)f.gh.set(e.id,{e,id:e.id,x:e.x,y:e.y,t:e.t,f:e.f,u:0,age:0})}}
const mult=(a,t)=>{let m=1;if(a=='inf')m=t=='inf'?.6:1.7;if(a=='tank'&&t=='inf')m=.65;if(a=='tank'&&t=='scout')m=1.3;if(a=='scout'&&(t=='tank'||t=='hq'||t=='art'))m=.35;if(a=='art'&&t=='tank')m=1.1;if(a=='art'&&t=='hq')m=1.4;if(a=='mg')m=t=='tank'||t=='art'||t=='mcv'?.15:1.4;if(a=='at')m=t=='inf'?.4:1.3;return m};
function fx(x,y,r){FX.push({x,y,r,t:0})}
function say(s){$('msg').textContent=s;msgT=3}
function hurt(e,d){if(e.hp<=0||e.drop>0)return;if(e.u)d*=cov(e);e.hp-=d;if(e.hp<=0)kill(e)}
function cov(e){let m=1;if(trenches.some(t=>t.f==e.f&&segD(e.x,e.y,t.a,t.b).d<t.r))m=e.t=='inf'?.4:.65;if(E.some(s=>s.cover&&s.f==e.f&&hyp(s.x-e.x,s.y-e.y)<s.cover))m=Math.min(m,e.t=='inf'?.45:.7);return m}
function hurtB(b,d){if(b.hp<=0)return;b.hp-=d;if(b.hp<=0){b.hp=0;fx(b.x,b.y,60);say('A bridge was destroyed!')}}
function kill(e,q){if(e.dead)return;orphanJobs(e,q);e.dead=1;e.hp=0;E.splice(E.indexOf(e),1);sel=sel.filter(s=>s!=e);
if(e.def&&e.site&&F[e.f])F[e.f].oil+=DEF[e.k].cost*.5;
if(e.def&&e.k=='bunker'){TC.getContext('2d').drawImage(Assets.get('bunkerRubble',0),Math.round(e.x-16),Math.round(e.y-16))}if(!q)fx(e.x,e.y,e.t=='hq'?70:16);
if(!q&&e.u&&e.t!='inf'){WR.push({x:e.x,y:e.y,ang:e.ang,k:e.t=='tank'||e.t=='art'?'wreckTank':'wreckTruck'});if(WR.length>70)WR.shift()}
if(e.t=='truck'){if(e.src)e.src.tk=null;if(!q)CR.push({x:e.x,y:e.y,o:60,l:45})}if(e.t=='hq')elim(e.f)}
function elim(f){F[f].alive=0;for(const e of E.slice())if(e.f==f){if(e.u||e.def)kill(e);else if(e.t!='hq'){e.f=-1;e.cap=0;e.gar=0}}
say(FN[f]+' eliminated!');if(f==MYF)end('DEFEAT');else if(F.filter(x=>x.alive).length==1)end('VICTORY')}
function end(t){over=1;const d=$('end');d.style.display='flex';d.textContent=t;const b=document.createElement('button');b.textContent='Play again';b.style.cssText='margin-left:24px;font:inherit;font-size:18px;padding:6px 14px;cursor:pointer;pointer-events:auto';b.onclick=()=>location.reload();d.appendChild(b)}
function find(u,r){let b=null,bd=r;for(const t of E){if(t.f<0||t.f==u.f||!(t.u||t.t=='hq'||(t.def&&(t.gun||t.blk)))||!seen(u.f,t))continue;const d=hyp(t.x-u.x,t.y-u.y)-(t.u?0:t.r);if(d<bd){bd=d;b=t}}return b}
function fire(u,t,s,a){u.cd=s.rate;u.ang=Math.atan2(t.y-u.y,t.x-u.x);const ar=u.t=='art'||!!s.ar;P.push({x:u.x,y:u.y,tx:t.x,ty:t.y,f:u.f,d:s.dmg,spl:s.splash||0,sp:s.sp||(ar?260:u.t=='inf'?320:520),tg:ar||t.isB?null:t,bt:t.isB?t:null,a:a||u.t,ar,rk:ar||u.t=='inf',tot:hyp(t.x-u.x,t.y-u.y),sx:u.x,sy:u.y})}
function launchBarrage(silo,x,y){if(silo.cd>0){say('Missile Silo reloading');return}const d=DEF.silo;silo.cd=d.rate;silo.gang=Math.atan2(y-silo.y,x-silo.x);
 for(let i=0;i<7;i++){const a=rnd(0,Math.PI*2),r=rnd(0,90),tx=cl(x+Math.cos(a)*r,70,W-70),ty=cl(y+Math.sin(a)*r,70,W-70),sp=220+rnd(-25,25);P.push({x:silo.x,y:silo.y,tx,ty,f:silo.f,d:105,spl:110,sp,ar:1,rk:1,a:'silo',tot:hyp(tx-silo.x,ty-silo.y),sx:silo.x,sy:silo.y,delay:i*.22})}
 say('Missile barrage launched')}
function roadHit(p){const r=roadAt(p.tx,p.ty);if(!r||r.e.cut||hyp(r.x-p.tx,r.y-p.ty)>p.spl*.5+6)return;const e=r.e;if(T-(e.ht||-99)>25)e.hn=0;e.ht=T;if(++e.hn>=3){const re=e.n.a.find(q=>q.n==r.n);e.cut=re.cut=1;e.cx=re.cx=r.x;e.cy=re.cy=r.y;fx(r.x,r.y,40);if(vi(MYF,r.x,r.y)>0)say('A road was blown apart!')}}
function impact(p){fx(p.tx,p.ty,p.spl?p.spl*.7:9);if(p.spl)roadHit(p);if(p.spl){TC.getContext('2d').drawImage(Assets.get('scorch',0),Math.round(p.tx-16),Math.round(p.ty-16))}if(p.spl){for(const e of E.slice())if(e.f!=p.f&&e.hp>0){const d=hyp(e.x-p.tx,e.y-p.ty)-(e.t=='hq'?e.r:0);if(d<p.spl)hurt(e,p.d*mult(p.a,e.t)*(1-d/p.spl*.5))}}else if(p.tg&&p.tg.hp>0)hurt(p.tg,p.d*mult(p.a,p.tg.t));
if(p.bt)hurtB(p.bt,p.d*(p.ar?1.6:p.a=='tank'?1.2:p.a=='scout'?.2:.8))}
const isl=(x,y)=>Math.abs(x-1200)<16||(x>1064&&x<1336&&y>1144&&y<1256),isW=(x,y)=>MAP!='snow'&&Math.abs(y-RY)<60&&!isl(x,y)&&!bridges.some(b=>b.hp>0&&Math.abs(x-b.x)<40);
const side=y=>y<RY?0:1;
function plan(x,y,tx,ty){const p=[],IS=(a,b)=>MAP!='snow'&&Math.abs(a-1200)<140&&Math.abs(b-RY)<56;
 if(IS(tx,ty)&&!IS(x,y))return[{x:1200,y:y<RY?1100:1300},{x:1200,y:1200},{x:tx,y:ty}];
 if(IS(x,y)&&!IS(tx,ty)){const wy=ty<RY?1100:1300;return[{x:1200,y:1200},{x:1200,y:wy},...plan(1200,wy,tx,ty)]}
if(MAP!='snow'&&side(y)!=side(ty)){let bt=null,bd=1e9;for(const b of bridges)if(b.hp>0){const d=hyp(b.x-x,b.y-y)+hyp(b.x-tx,b.y-ty);if(d<bd){bd=d;bt=b}}
 const s=side(y);if(bt)p.push({x:bt.x,y:s?1330:1070},{x:bt.x,y:s?1070:1330});else return [{x,y:s?1290:1110}]}p.push({x:tx,y:ty});return p}
const RB=t=>t=='tank'||t=='art';
function segs(){if(SG)return SG;SG=[];for(const n of N)for(const e of n.a)if(n.i<e.n.i&&(n.x!=e.n.x||n.y!=e.n.y))SG.push({a:n,b:e.n,br:e.br,e});return SG}
function roadAtMake(x,y,max=18){let b=null,bd=max;for(const r of MRS)if(!r.site&&!r.hq){const p=segD(x,y,r.a,r.b);if(p.d<bd){bd=p.d;b={s:r,x:p.x,y:p.y}}}return b}
function drv(x,y){for(const s of segs()){if(s.br&&s.br.hp<=0)continue;if(segD(x,y,s.a,s.b).d<=(s.br?17:7.5))return 1}if(roadAtMake(x,y))return 1;
 for(const n of N){if(n.el||n.dormant)continue;if(n.kit){if((Math.abs(x-n.x)<8&&Math.abs(y-n.y)<n.kh)||(Math.abs(y-n.y)<8&&Math.abs(x-n.x)<n.kw))return 1}else if(n.R&&hyp(x-n.x,y-n.y)<n.R-2)return 1}return 0}
function nearRoad(x,y){const sy=side(y);let b=null,bd=1e9;for(const s of segs()){if(s.e.cut)continue;if(s.br){if(s.br.hp<=0||Math.abs(x-s.br.x)>60)continue}else if(side((s.a.y+s.b.y)/2)!=sy)continue;const p=segD(x,y,s.a,s.b);if(p.d<bd){bd=p.d;b={s,x:p.x,y:p.y}}}const mr=roadAtMake(x,y,bd);if(mr&&mr.s&&mr.s!==b?.s)b=mr;return b}
function rpath(u,tx,ty){const p0=nearRoad(u.x,u.y),p1=nearRoad(tx,ty);if(!p0||!p1)return[];const end=drv(tx,ty)?{x:tx,y:ty}:{x:p1.x,y:p1.y};
 if(p0.s.road||p1.s.road)return p0.s==p1.s?[{x:p0.x,y:p0.y},end]:[{x:p0.x,y:p0.y},{x:p1.x,y:p1.y},end];
 if(p0.s==p1.s)return[{x:p0.x,y:p0.y},end];let best=null;
 for(const s of[p0.s.a,p0.s.b])for(const t of[p1.s.a,p1.s.b]){const r=s==t?[]:route(s,t);if(!r)continue;let c=hyp(p0.x-s.x,p0.y-s.y)+hyp(t.x-p1.x,t.y-p1.y),pv=s;for(const n of r){c+=hyp(n.x-pv.x,n.y-pv.y);pv=n}if(!best||c<best.c)best={c,w:[s,...r]}}
 return best?[{x:p0.x,y:p0.y},...best.w.map(n=>({x:n.x,y:n.y})),end]:[]}
function go(u,x,y,stop){u.path=RB(u.t)?rpath(u,x,y):plan(u.x,u.y,x,y);u.stop=stop||6;u.rt=T;u.pg={x,y}}
function cmd(u){u.act=null;u.at=null;u.tgt=null;u.path=[];u.bq=[]}
function buildBusy(u){return !!(u.act=='build'&&u.at&&u.at.site&&!u.at.dead)||!!(u.act=='dig'&&u.at&&u.at.pt)||(u.bq&&u.bq.length>0)}
function stepMove(u,dt){const p=u.path[0];if(!p)return;
 /* stuck watchdog for road-bound units: if a waypoint takes far too long, snap to the road and re-plan */
 if(RB(u.t)){if(u.wp!==p){u.wp=p;u.wd=T+hyp(p.x-u.x,p.y-u.y)/ST[u.t].spd*1.8+2}
  else if(T>u.wd){u.wd=T+3;const q=nearRoad(u.x,u.y);if(q){u.x=q.x;u.y=q.y}if(u.pg)u.path=rpath(u,u.pg.x,u.pg.y);return}}
 const dx=p.x-u.x,dy=p.y-u.y,d=hyp(dx,dy),slow=u.t=='tank'&&roadAtMake(u.x,u.y),sp=ST[u.t].spd*dt*(slow?.55:1),rb=RB(u.t);
 if(d<=Math.max(sp,u.path.length>1?(rb?5:12):u.stop)){u.path.shift();return}const nx=u.x+dx/d*sp,ny=u.y+dy/d*sp;u.ang=Math.atan2(dy,dx);if(isW(nx,ny)&&!isW(u.x,u.y))return;
 if(rb){/* road-bound: may leave sand to reach a road, but never drive off one (slides along it instead); enemy tank traps block the way */
  if(drv(u.x,u.y)&&!drv(nx,ny)){for(const[ax,ay]of[[nx,u.y],[u.x,ny]])if(drv(ax,ay)&&hyp(p.x-ax,p.y-ay)<d-.01){u.x=ax;u.y=ay;break}return}
  }
 if(forestAt(nx,ny))return;
 const bk=blockAt(u,nx,ny);if(bk){if(bk.hp!==undefined&&bk.f!=u.f&&ST[u.t].dmg&&!u.tgt){u.tgt=bk;u.auto=1}if(!rb){for(const[ax,ay]of[[nx,u.y],[u.x,ny]])if(!forestAt(ax,ay)&&!blockAt(u,ax,ay)&&!(isW(ax,ay)&&!isW(u.x,u.y))){u.x=ax;u.y=ay;break}}return}
 u.x=nx;u.y=ny}
/* tank traps stop every vehicle; checkpoints stop only enemy vehicles; infantry crosses trenches */
function trenchHit(t,x,y){const a=t.a||{x:t.x-Math.cos(t.ang||0)*26,y:t.y-Math.sin(t.ang||0)*26},b=t.b||{x:t.x+Math.cos(t.ang||0)*26,y:t.y+Math.sin(t.ang||0)*26};return segD(x,y,a,b).d<t.r+2}
function blockAt(u,x,y){if(u.t=='inf')return null;
 for(const e of E){if(!e.def||e.site||!(e.k=='trap'||e.k=='sand'||e.k=='sandc'||(e.k=='gate'&&e.f!=u.f)))continue;const d=hyp(e.x-x,e.y-y);if(d<e.r+2&&d<hyp(e.x-u.x,e.y-u.y))return e}
 for(const t of trenches)if(trenchHit(t,x,y)&&!trenchHit(t,u.x,u.y))return t;
 return null}
function truckStep(t,dt){const dw=ALLT.filter(x=>x.f==t.f).sort((p,q)=>hyp(p.x-t.x,p.y-t.y)-hyp(q.x-t.x,q.y-t.y))[0];if(!dw){t.stall=1;return}const hn=dw.gate||dw.nd;
 if(!t.rt.length){if(t.cur==hn){F[t.f].oil+=100;kill(t,1);return}const r=route(t.cur,hn);t.stall=!r;if(r)t.rt=r;return}
 const n=t.rt[0],e=t.cur.a.find(e=>e.n==n);
 if(e&&((e.br&&e.br.hp<=0)||e.cut)&&!t.rv){if(hyp(t.x-t.cur.x,t.y-t.cur.y)<2){t.rt=[];t.stall=1;return}const c=t.cur;t.cur=n;t.rt=[c];t.rv=1}
 const m=t.rt[0],dx=m.x-t.x,dy=m.y-t.y,d=hyp(dx,dy),s=ST.truck.spd*dt;
 if(d<=s){t.x=m.x;t.y=m.y;t.cur=t.rt.shift();t.rv=0}else{const nx=t.x+dx/d*s,ny=t.y+dy/d*s;if(blockAt(t,nx,ny))return;t.x=nx;t.y=ny;t.ang=Math.atan2(dy,dx)}}
function queue(p,t){if(!p||p.f<0||!F[p.f].alive||p.q.length>=4)return;if(F[p.f].oil<ST[t].cost)return;F[p.f].oil-=ST[t].cost;p.q.push(t)}
function prod(e,dt){if(!e.q.length){e.qt=0;return}e.qt+=dt;if(e.qt>=4){e.qt=0;const u=unit(e.q.shift(),e.f,e.x+rnd(-40,40),e.y+(e.y<RY?60:-60));if(e.f==MYF)say(ST[u.t].n+' ready')}}
function turret(e,dt){if(e.drop>0){e.drop-=dt;return}prod(e,dt);if(e.t=='town'&&e.gar<=0)return;const hq=!!e.isHQ,s={dmg:hq?14:6+3*e.gar,rate:1,rng:hq?230:170,sp:450};
 for(const u of E)if(u.u&&u.f==e.f&&u.t!='inf'&&u.hp<u.mhp&&hyp(u.x-e.x,u.y-e.y)<(hq?110:120))u.hp=Math.min(u.mhp,u.hp+(hq?4:6)*dt);
 if(e.cd<=0){const t=find(e,s.rng);if(t)fire(e,t,s,'tank')}}
function unitAI(u,dt){const s=ST[u.t];if(u.drop>0){u.drop-=dt;return}if(u.t=='truck')return truckStep(u,dt);
 if(!u.act&&u.bq&&u.bq.length){const n=u.bq.shift();if(!n.dead&&(n.site||n.pt)){u.act=n.site?'build':'dig';u.at=n;u.w=0}}
 if(u.t=='blayer'&&!u.act&&!u.path.length&&T>(u.sc||0)){u.sc=T+1;const b=bridges.find(b=>b.hp<=0&&hyp(b.x-u.x,RY-u.y)<420);if(b){u.act='rep';u.at=b}}
 if(u.act){const t=u.at,gone=!t||(t.hp<=0&&!t.isB&&t.u!==undefined&&t.t!='rig'&&t.t!='town'&&t.t!='hq')||(u.act=='gar'&&t.f!=u.f)||(u.act=='cap'&&t.f==u.f)||t.dead||((u.act=='build'||u.act=='road')&&!t.site);
  if(gone){u.act=null;u.at=null}else{const tx=t.x,ty=t.isB?(side(u.y)?1295:1105):t.y,d=hyp(tx-u.x,ty-u.y),need=u.act=='cap'?30:t.isB?30:u.act=='dig'?70:t.def?t.r+24:44;
   if(d>need){if(!u.path.length||(T-u.rt>1&&!RB(u.t))){go(u,tx,ty,need*.7);if(RB(u.t)){const q=u.path[u.path.length-1];if(!q||hyp(q.x-tx,q.y-ty)>need+6){u.act=null;u.at=null;u.path=[]}}}}else{u.path=[];
    if(u.act=='gar'){if(t.gar<4){t.gar++;kill(u,1);return}u.act=null}
    else if(u.act=='blow'){u.w=(u.w||0)+dt;if(u.w>=3){u.w=0;if(t.hp>0)hurtB(t,9999);u.act=null}}
    else if(u.act=='dig'){u.w=(u.w||0)+dt;if(u.w>=DIGT){u.w=0;if(!isW(t.x,t.y)&&!trenchOnRoad(t)){const a={x:t.x-Math.cos(t.ang||0)*26,y:t.y-Math.sin(t.ang||0)*26},b={x:t.x+Math.cos(t.ang||0)*26,y:t.y+Math.sin(t.ang||0)*26};const pa=t.a?{x:t.a.x,y:t.a.y}:a,pb=t.a?{x:t.x,y:t.y}:b;trenches.push({x:t.x,y:t.y,r:16,f:u.f,ang:t.ang||0,a:pa,b:pb,sid:t.sid,k:t.k});const m=trenches.filter(q=>q.f==u.f);if(m.length>600)trenches.splice(trenches.indexOf(m[0]),1);if(u.f==MYF&&!u.bq.length)say('Trench dug')}u.act=null}}
    else if(u.act=='cut'){u.w=(u.w||0)+dt;if(u.w>=3){u.w=0;const r=roadAt(t.x,t.y);if(r){const c=!r.e.cut,re=r.e.n.a.find(q=>q.n==r.n);r.e.cut=re.cut=c;r.e.cx=re.cx=r.x;r.e.cy=re.cy=r.y;fx(r.x,r.y,40);say(c?'Road blown':'Road repaired')}u.act=null}}
    else if(u.act=='build'){t.prog=Math.min(1,t.prog+dt/t.bt);t.hp=Math.max(t.hp,t.mhp*(.25+.75*t.prog));if(t.prog>=1){finishDef(t);u.act=null;if(u.f==MYF)say(DEF[t.k].n+' complete')}}
    else if(u.act=='road'){t.prog=Math.min(1,t.prog+dt/t.bt);if(t.prog>=1){t.site=0;u.act=null;if(u.f==MYF)say('Makeshift road complete')}}
    else if(u.act=='rep'){if(t.isB&&t.hp<=0){t.rb+=dt/(u.t=='blayer'?2:6);if(t.rb>=1){t.rb=0;t.hp=t.mhp*(u.t=='blayer'?.7:.5);say('Bridge repaired')}}else{t.hp=Math.min(t.mhp,t.hp+(u.t=='blayer'?70:30)*dt);if(t.hp>=t.mhp)u.act=null}}}}}
 if(u.t=='eng'){for(const o of E)if(o.f==u.f&&o!=u&&o.hp<o.mhp&&hyp(o.x-u.x,o.y-u.y)<80)o.hp=Math.min(o.mhp,o.hp+10*dt)}
 if(s.dmg>0){
  if(u.tgt){const t=u.tgt;if(t.hp<=0||(!t.isB&&!seen(u.f,t))||(u.auto&&hyp(t.x-u.x,t.y-u.y)>s.vis*1.1))u.tgt=null;
   else{const d=hyp(t.x-u.x,t.y-u.y);if(d<=s.rng)u.path=[];else if(T-u.rt>.8&&(!u.path.length||!RB(u.t)||!u.pg||hyp(u.pg.x-t.x,u.pg.y-t.y)>60)){u.pg={x:t.x,y:t.y};u.path=RB(u.t)?rpath(u,t.x,t.y):[{x:t.x,y:t.y}];u.stop=s.rng*.8;u.rt=T}}}
  if(!u.act){if(T>u.sc){u.sc=T+.3+rnd(0,.1);u.ft=find(u,s.rng);}}
  const ft=u.tgt&&hyp(u.tgt.x-u.x,u.tgt.y-u.y)<=s.rng?u.tgt:u.ft;
  if(ft&&ft.hp>0&&u.cd<=0&&hyp(ft.x-u.x,ft.y-u.y)<=s.rng)fire(u,ft,s)}
 stepMove(u,dt)}
function explore(u,me){for(let i=0;i<25;i++){const c=rnd(0,G*G)|0;if(!me.vis[c]){go(u,(c%G)*CS+20,(c/G|0)*CS+20);return}}go(u,rnd(100,2300),rnd(100,2300))}
function aiThink(f){const me=F[f],hq=hqs[f],ms=E.filter(e=>e.f==f&&e.u&&e.t!='truck'),c=t=>ms.filter(u=>u.t==t).length+hq.q.filter(q=>q==t).length;
 const ptw=ALLT.find(x=>x.f==f);if(ptw&&ptw.q.length<2){const dead=bridges.some(b=>b.hp<=0);const t=!c('scout')?'scout':(dead&&!c('eng'))?'eng':c('inf')<2?'inf':['tank','tank','art','inf','scout'][rnd(0,5)|0];if(ms.length<18&&me.oil>=ST[t].cost)queue(ptw,t)}
 const gh=[...me.gh.values()],claimed=new Set(ms.filter(u=>u.act=='cap').map(u=>u.at));
 let caps=gh.filter(g=>(g.t=='rig'||g.t=='town')&&g.f!=f&&!claimed.has(g.e)),cmb=ms.filter(u=>u.t=='tank'||u.t=='art'||u.t=='inf');
 if(cmb.length>=7)me.push=1;if(cmb.length<=3)me.push=0;
 const ens=gh.filter(g=>g.f>=0&&g.f!=f&&(g.t=='hq'||g.u)),hg=ens.filter(g=>g.t=='hq')[0]||gh.find(g=>(g.t=='rig'||g.t=='town')&&g.f>=0&&g.f!=f)||ens[0];
 for(const u of ms.filter(u=>!u.path.length&&!u.tgt&&!u.act)){
  if(u.t=='eng'){const b=bridges.find(b=>b.hp<=0&&vi(f,b.x,RY)>0);if(b){u.act='rep';u.at=b}else{const r=Math.random();if(me.push&&r<.2){const bb=bridges.find(b=>b.hp>0&&vi(f,b.x,RY)>0);if(bb){u.act='blow';u.at=bb;u.w=0}}else if(r<.35){u.act='dig';u.w=0;u.at={x:hq.x+rnd(-160,160),y:hq.y+(hq.y<RY?1:-1)*rnd(80,200),t:'pt',pt:1}}}continue}
  if(caps.length&&(u.t!='art')&&(u.t!='tank'||ms.length<9)){caps.sort((a,b)=>hyp(a.x-u.x,a.y-u.y)-hyp(b.x-u.x,b.y-u.y));const g=caps.shift();u.act='cap';u.at=g.e;continue}
  if(u.t=='scout'){const tr=gh.find(g=>g.t=='truck'&&g.f!=f);if(tr)go(u,tr.x,tr.y);else explore(u,me);continue}
  if(me.push){if(hg){if(Math.random()<.12){const b=bridges.filter(b=>b.hp>0&&vi(f,b.x,RY)>0)[0];if(b&&u.t!='inf'){u.tgt=b;u.auto=0;continue}}
   let tx=hg.x,ty=hg.y;if(u.t=='art'){const a=Math.atan2(hq.y-ty,hq.x-tx);tx+=Math.cos(a)*380;ty+=Math.sin(a)*380}go(u,tx+rnd(-50,50),ty+rnd(-50,50),20)}else explore(u,me);continue}
  if(u.post&&hyp(u.post.x-u.x,u.post.y-u.y)<200)continue;
  const own=rigs.filter(r=>r.f==f),pt=own.length&&Math.random()<.7?own[rnd(0,own.length)|0]:hq;u.post={x:pt.x+rnd(-90,90),y:pt.y+rnd(-90,90)};go(u,u.post.x,u.post.y)}}
function pickAt(x,y){let b=null,bd=1e9;for(const e of E){const d=hyp(e.x-x,e.y-y);if(d<(e.u?14:e.r)+6/cam.z&&d<bd&&(e.f==MYF||seen(MYF,e))){b=e;bd=d}}
 if(!b&&MAP!='snow')for(const br of bridges)if(Math.abs(x-br.x)<46&&Math.abs(y-RY)<66)b=br;return b}
function order(x,y){const t=pickAt(x,y),silo=sel.length==1&&sel[0].def&&sel[0].k=='silo'&&sel[0].f==MYF&&!sel[0].site?sel[0]:null;
 if(silo){if(hyp(x-silo.x,y-silo.y)>DEF.silo.rng){say('Target is out of missile range');return}if(!seen(MYF,{x,y,s:1,f:-1})){say('Target area is not visible');return}launchBarrage(silo,x,y);return}
 const us=sel.filter(e=>e.u&&e.f==MYF&&e.t!='truck');if(!us.length)return;
 if(t&&t.t=='mcv'&&t.f==MYF&&us.includes(t)){deploy(t);return}
 fx(x,y,10);
 if(tool){const es=us.filter(u=>u.t=='eng');if(es.length){const rr=tool=='cut'?roadAt(x,y):null;if(tool=='cut'&&!rr)say('No road there');else{const px=rr?rr.x:x,py=rr?rr.y:y;es.forEach(u=>{cmd(u);u.act=tool;u.at={x:px,y:py,t:'pt'};u.w=0});say('Engineers heading out to '+(rr.e.cut?'repair':'blow')+' the road')}tool=null;return}tool=null}
 const es=us.filter(u=>u.t=='eng'),rr=roadAt(x,y);
 if(es.length&&rr&&rr.e.cut){es.forEach(u=>{cmd(u);u.act='cut';u.at={x:rr.x,y:rr.y,t:'pt'};u.w=0});say('Engineers heading out to repair the road');return}
 if(t&&!t.isB&&t.f!=MYF&&t.f>=0&&(t.u||t.t=='hq'||t.def)){for(const u of us){cmd(u);if(ST[u.t].dmg){u.tgt=t;u.auto=0}else go(u,t.x,t.y,60)}return}
 if(t&&t.isB){for(const u of us){cmd(u);if((u.t=='eng'||u.t=='blayer')&&t.hp<t.mhp){u.act='rep';u.at=t}else if(u.t=='eng'&&t.hp>0){u.act='blow';u.at=t;u.w=0}else if(ST[u.t].dmg&&t.hp>0){u.tgt=t;u.auto=0}else go(u,t.x,side(u.y)?1295:1105)}return}
 if(t&&t.s&&t.t!='hq'&&t.f!=MYF){for(const u of us){cmd(u);if(u.t!='art'&&u.t!='mcv'){u.act='cap';u.at=t}else go(u,t.x,t.y,80)}return}
 if(t&&t.t=='town'&&t.f==MYF){for(const u of us){cmd(u);if(u.t=='inf'){u.act='gar';u.at=t}else go(u,t.x,t.y,60)}return}
 if(t&&t.def&&t.f==MYF&&t.site&&us.some(u=>u.t=='eng')){for(const u of us){cmd(u);if(u.t=='eng'){u.act='build';u.at=t}else go(u,t.x,t.y,50)}return}
 if(t&&t.f==MYF&&t.hp<t.mhp&&us.some(u=>u.t=='eng')){for(const u of us){cmd(u);if(u.t=='eng'&&u!=t){u.act='rep';u.at=t}else go(u,t.x,t.y,50)}return}
 if(us.some(u=>RB(u.t))&&!drv(x,y))say('Tanks & artillery stay on roads');
 const cols=Math.ceil(Math.sqrt(us.length));us.forEach((u,i)=>{cmd(u);go(u,x+((i%cols)-(cols-1)/2)*28,y+((i/cols|0)-(cols-1)/2)*28)})}
/* ================= DEFENCES: placement, construction, firing ================= */
const gband=(x,y)=>{const X=(x|0)>>2<<2,Y=(y|0)>>2<<2;let v=.62*vn(X,Y,72,1)+.3*vn(X,Y,20,2)+.08*hrnd(X>>2,Y>>2,3);v=(v-.2)*1.55;return Math.max(0,Math.min(4,Math.floor(v*5)))};
const DS=1.5;
function placeCheck(k,x,y){const d=DEF[k],r=(d.r||8)*DS;let rt=null;
 if(x<50||x>W-50||y<50||y>W-50)return{ok:0,m:'Out of bounds',x,y};
 if(d.ter!='road'&&!d.anyGround&&(isW(x,y)||(MAP!='snow'&&Math.abs(y-RY)<80)))return{ok:0,m:'Cannot build on the river',x,y};
 if(d.ter=='road'){if(isW(x,y)||!drv(x,y))return{ok:0,m:'Road defences go on roads',x,y};const q=roadSurfaceAt(x,y);if(q&&hyp(q.x-x,q.y-y)<16){x=q.x;y=q.y;rt=q.rot}}
 else if(!d.anyGround){if(drv(x,y))return{ok:0,m:'Cannot build on a road',x,y};if(d.ter=='sand'&&gband(x,y)<3)return{ok:0,m:'Needs bare sand (the pale ground)',x,y}}
 if(d.ter!='road'){for(const e of rigs)if(hyp(e.x-x,e.y-y)<24+r+6)return{ok:0,m:'Too close to an oil rig',x,y};
  for(const e of ALLT){const w=e.capital?(e.kw||160):96,h=e.capital?(e.kh||128):84;if(x>e.kx-r&&x<e.kx+w+r&&y>e.ky-r&&y<e.ky+h+r)return{ok:0,m:'Too close to a town',x,y}}}
 for(const e of E)if(e.def&&hyp(e.x-x,e.y-y)<(e.r+r)*.7)return{ok:0,m:'Something is in the way',x,y};
 return{ok:1,x,y,rot:rt}}
function mkDef(k,f,x,y,rot,site){const d=DEF[k],e=mk({t:'def',def:1,k,f,x,y,r:(d.r||8)*DS,hp:site?d.hp*.25:d.hp,mhp:d.hp,s:1,rot:rot||0,gang:-Math.PI/2,site:site?1:0,prog:0,bt:d.bt||Math.max(1,d.cost/50),vis:d.vis||(d.rng?d.rng+60:150)});if(!site)finishDef(e);return e}
function roadCheck(x,y){return x>=50&&x<=W-50&&y>=50&&y<=W-50&&!isW(x,y)&&(MAP=='snow'||Math.abs(y-RY)>=80)}
function mkRoad(a,b,site=1){const r={road:1,site:site?1:0,prog:0,bt:1.6,x:(a.x+b.x)/2,y:(a.y+b.y)/2,a:{x:a.x,y:a.y},b:{x:b.x,y:b.y}};MRS.push(r);return r}
function finishDef(e){const d=DEF[e.k];e.site=0;e.prog=1;e.hp=e.mhp;if(d.cover)e.cover=d.cover;if(d.rng||d.blk)e.gun=1}
function defTarget(e,d){let b=null,bd=d.rng+1;for(const t of E){if(t.f<0||t.f==e.f||t.hp<=0||t.drop>0)continue;
  if(t.u){if(d.vs&&!d.vs.includes(t.t))continue}else if(d.vs||!(t.def&&!t.site&&(t.gun||t.blk)))continue;
  if(!seen(e.f,t))continue;const q=hyp(t.x-e.x,t.y-e.y)-(t.u?0:t.r);if(q<(d.min||0)||q>d.rng)continue;if(q<bd){bd=q;b=t}}return b}
function defAI(e,dt){const d=DEF[e.k];
 if(d.cram){if(e.cd<=0){let b=null,bd=d.rng;for(const p of P){if(p.f==e.f||!p.rk||p.delay>0)continue;const q=hyp(p.x-e.x,p.y-e.y);if(q<bd){bd=q;b=p}}
   if(b){P.splice(P.indexOf(b),1);fx(b.x,b.y,16);e.gang=Math.atan2(b.y-e.y,b.x-e.x);e.cd=d.rate}}return}
 if(!d.dmg)return;
 if(T>(e.sc||0)){e.sc=T+.25;e.ft=defTarget(e,d)}
 const t=e.ft;if(!t)return;if(t.hp<=0||t.dead||hyp(t.x-e.x,t.y-e.y)>d.rng+(t.u?0:t.r)){e.ft=null;return}
 e.gang=Math.atan2(t.y-e.y,t.x-e.x);if(e.cd<=0)fire(e,t,d,d.a)}
function place(x,y,keep){const k=placing.k,d=DEF[k],us=sel.filter(u=>u.t=='eng'&&u.f==MYF);
 if(!us.length){say('Select an engineer to build');placing=null;return}
 const c=placeCheck(k,x,y,placing.rot);if(!c.ok){say(c.m);return}
 if(F[MYF].oil<d.cost){say('Not enough oil');return}
 F[MYF].oil-=d.cost;const st=mkDef(k,MYF,c.x,c.y,c.rot!=null?c.rot:placing.rot*Math.PI/2,1);for(const u of us){if(buildBusy(u))(u.bq=u.bq||[]).push(st);else{cmd(u);u.act='build';u.at=st}}
 fx(c.x,c.y,10);say('Building '+d.n);if(!keep)placing=null}
function drawD(g,e,tm,a){const d=DEF[e.k];g.globalAlpha=a*(e.site?.5:1);
 if(d.spr)spr(g,e.k=='silo'&&e.cd>d.rate-3?'missileSiloOpen':d.spr,tm,e.x,e.y,e.rot||0,DS);else{spr(g,d.base,tm,e.x,e.y,0,DS);spr(g,d.gun,tm,e.x,e.y,(e.gang==null?-Math.PI/2:e.gang)+Math.PI/2,DS)}g.globalAlpha=1}
function hudBuild(en){const b=$('b_bld');b.style.display=en?'':'none';b.style.borderColor=menu?'#e8b04a':'';b.style.color=menu?'#e8b04a':'';
 if(!en){menu=0;placing=null}$('dm').style.display=menu&&!placing?'flex':'none';$('d_road').disabled=F[MYF].oil<15;for(const k in DEF)$('d_'+k).disabled=F[MYF].oil<DEF[k].cost}
function producer(){const s=sel.find(e=>e.f==MYF&&e.t=='town');return s}
const bt=$('btns');ORDER.forEach(t=>{const b=document.createElement('button');b.id='b_'+t;b.onclick=()=>queue(producer()||ALLT.find(x=>x.f==MYF),t);bt.appendChild(b)});
{const b=document.createElement('button');b.id='b_bld';b.textContent='B Build';b.style.display='none';b.onclick=()=>{menu=menu?0:1;placing=null;tool=null};bt.appendChild(b)}
{const dm=$('dm'),h=document.createElement('div');h.textContent='BUILD - needs an engineer (Esc closes)';h.style.cssText='color:#e8b04a;margin-bottom:2px';dm.appendChild(h);
 const rb=document.createElement('button');rb.id='d_road';rb.innerHTML='Makeshift Road <b>15</b><br><small style="opacity:.7">any dry ground | tanks move slower | drag for a line</small>';rb.onclick=()=>{placing={k:'road',rot:0};menu=0;tool=null;say('Hold the left mouse button and drag to build a makeshift road')};dm.appendChild(rb);
 Object.keys(DEF).forEach(k=>{const d=DEF[k],b=document.createElement('button');b.id='d_'+k;const tr=d.ter=='sand'?'bare sand':d.ter=='road'?'roads only':'open ground',
  st=d.dmg?' | range '+d.rng+', '+d.dmg+' dmg':d.cram?' | shoots down rockets':d.vis?' | sees far':d.cover?' | cover for infantry':d.gate?' | blocks enemy vehicles only':d.blk?' | blocks ALL vehicles':'';
  b.innerHTML=d.n+' <b>'+d.cost+'</b><br><small style="opacity:.7">'+tr+st+(LINE[k]?' | drag for a line':'')+'</small>';
  b.onclick=()=>{placing={k,rot:0};menu=0;tool=null;say((LINE[k]?'Click, or drag a line, to place ':'Click to place ')+d.n+(d.rot?' (Z rotates)':'')+' - right-click cancels')};dm.appendChild(b)})}
[ ['cut','C Cut road','cut'],['dig','V Dig trench','dig']].forEach(([id,txt,tl])=>{const b=document.createElement('button');b.id='b_'+id;b.textContent=txt;b.style.display='none';b.onclick=()=>{if(tl=='dig'){placing={k:'trench',rot:0};menu=0;tool=null;say('Drag a freehand curve to dig a trench; infantry can cross, vehicles cannot');return}tool=tool==tl?null:tl;say(tool?'Right-click a road to blow/repair it':'')};bt.appendChild(b)});
{const db=document.createElement('button');db.id='b_dep';db.textContent='H Deploy HQ';db.style.display='none';db.onclick=()=>deploy(sel.find(e=>e.t=='mcv'));bt.appendChild(db)}
function hud(){const mine=E.filter(e=>e.f==MYF),tr=mine.filter(e=>e.t=='truck').length;
 $('top').innerHTML=`<span>Oil <b>${F[MYF].oil|0}</b></span><span>Rigs <b>${rigs.filter(r=>r.f==MYF).length}</b>/${rigs.length}</span><span>Trucks en route <b>${tr}</b></span><span>Factions <b>${F.filter(f=>f.alive).length}</b>/5</span><span>Weather <b>${WX.kind=='clear'?(MAP=='snow'?'Mist':'Clear'):WX.kind=='rain'?'Rain':WX.kind=='fog'?'Heavy Fog':'Sandstorm'}</b></span>`;
 const hasHQ=ALLT.some(x=>x.f==MYF);ORDER.forEach(t=>{const b=$('b_'+t);b.textContent=`${ST[t].k} ${ST[t].n} ${ST[t].cost}`;b.disabled=F[MYF].oil<ST[t].cost||!F[MYF].alive||!hasHQ});
 $('b_dep').style.display=sel.some(e=>e.t=='mcv')?'':'none';{const en=sel.some(e=>e.t=='eng');hudBuild(en);for(const k of ['cut','dig']){const b=$('b_'+k),on=k=='cut'?tool=='cut':(placing&&placing.k=='trench');b.style.display=en?'':'none';b.style.borderColor=on?'#e8b04a':'';b.style.color=on?'#e8b04a':''}}
 const u=sel.filter(e=>e.u),s1=sel[0];let h='';if(sel.length==1&&s1)h=`${s1.u?ST[s1.t].n:s1.def?DEF[s1.k].n:(s1.name||s1.t.toUpperCase())}<br>HP ${s1.hp|0}/${s1.mhp||'-'}${s1.t=='town'?'<br>Garrison '+s1.gar+'/4':''}${s1.q&&s1.q.length?'<br>Queue '+s1.q.length:''}${s1.site?'<br>Under construction '+(s1.prog*100|0)+'%':''}${s1.k=='silo'&&!s1.site?'<br>RMB: launch 7-missile barrage':''}`;
 else if(sel.length){const c={};u.forEach(e=>c[e.t]=(c[e.t]||0)+1);h=Object.entries(c).map(([k,v])=>v+' '+ST[k].n).join('<br>')}else h=hasHQ?'Select units. Right-click to act.<br>Q/F/E/R/T build when HQ selected.':'Select the Mobile HQ, then press H or double-click it to deploy.';
 $('info').innerHTML=h+(sel.some(s=>s.t=='mcv')?'<br>H / double-click: deploy HQ':'')+(sel.some(s=>s.t=='eng')?'<br>B build · C road · V trench · drag to build lines · RMB broken road: repair'+(tool?'<br>Tool: '+tool:''):'')}
function resize(){C.width=innerWidth;C.height=innerHeight}resize();addEventListener('resize',resize);
const w2=(sx,sy)=>({x:sx/cam.z+cam.x,y:sy/cam.z+cam.y});
C.addEventListener('mousedown',e=>{mouse.x=e.clientX;mouse.y=e.clientY;if(e.button==0){mouse.drag={x:e.clientX,y:e.clientY};mouse.stroke=placing&&placing.k=='trench'?[w2(e.clientX,e.clientY)]:null}if(e.button==1){mouse.pan={x:e.clientX,y:e.clientY};e.preventDefault()}});
C.addEventListener('contextmenu',e=>{e.preventDefault();if(placing){placing=null;mouse.drag=null;return}const p=w2(e.clientX,e.clientY);order(p.x,p.y)});
C.addEventListener('dblclick',e=>{const p=w2(e.clientX,e.clientY),t=pickAt(p.x,p.y);if(t&&t.t=='mcv'&&t.f==MYF)deploy(t)});
addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.in=e.target==C;if(mouse.stroke){const cs=e.getCoalescedEvents?e.getCoalescedEvents():[];for(const ce of cs.length?cs:[e]){const p=w2(ce.clientX,ce.clientY),last=mouse.stroke[mouse.stroke.length-1];if(hyp(p.x-last.x,p.y-last.y)>2)mouse.stroke.push(p)}}if(mouse.pan){cam.x-=(e.clientX-mouse.pan.x)/cam.z;cam.y-=(e.clientY-mouse.pan.y)/cam.z;mouse.pan={x:e.clientX,y:e.clientY}}});
addEventListener('mouseup',e=>{if(e.button==1)mouse.pan=null;if(e.button!=0||!mouse.drag)return;const d=mouse.drag,stroke=mouse.stroke;mouse.drag=null;mouse.stroke=null;const a=w2(d.x,d.y),b=w2(e.clientX,e.clientY);if(dropping){doDrop(b.x,b.y);return}
 if(placing){mouse.stroke=stroke;placeDrag(a,b,e.shiftKey);mouse.stroke=null;return}
 if(hyp(e.clientX-d.x,e.clientY-d.y)<6){const t=pickAt(b.x,b.y),ns=t&&t.f==MYF&&!t.isB?[t]:[];sel=e.shiftKey?[...new Set([...sel,...ns])]:ns}
 else{const x0=Math.min(a.x,b.x),x1=Math.max(a.x,b.x),y0=Math.min(a.y,b.y),y1=Math.max(a.y,b.y),r=E.filter(u=>u.f==MYF&&u.u&&u.x>x0&&u.x<x1&&u.y>y0&&u.y<y1);sel=e.shiftKey?[...new Set([...sel,...r])]:r}});
C.addEventListener('wheel',e=>{e.preventDefault();const p=w2(e.clientX,e.clientY);cam.z=cl(cam.z*(e.deltaY<0?1.1:.9),.2,2.5);cam.x=p.x-e.clientX/cam.z;cam.y=p.y-e.clientY/cam.z},{passive:false});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if((e.ctrlKey||e.altKey)&&/^Digit[1-5]$/.test(e.code)){e.preventDefault();grp[e.code[5]]=sel.map(s=>s.id);return}
 if(/^[1-5]$/.test(k)){sel=E.filter(s=>(grp[k]||[]).includes(s.id));return}
 if(k==' '){e.preventDefault();const hp=hqs[MYF].dormant?(E.find(u=>u.t=='mcv'&&u.f==MYF)||hqs[MYF]):hqs[MYF];cam.x=hp.x-C.width/cam.z/2;cam.y=hp.y-C.height/cam.z/2;return}
 if(k=='h'){const m=sel.find(s=>s.t=='mcv');if(m){deploy(m);return}}
 if(k=='escape'){tool=null;placing=null;menu=0}if(k=='b'&&sel.some(s=>s.t=='eng')){menu=menu?0:1;placing=null;tool=null;return}if(k=='z'&&placing&&(placing.k=='trench'||(DEF[placing.k]&&DEF[placing.k].rot))){placing.rot=(placing.rot+1)%4;return}
 if(k=='v'&&sel.some(s=>s.t=='eng')){placing={k:'trench',rot:0};menu=0;tool=null;say('Drag a freehand curve to dig a trench; infantry can cross, vehicles cannot');return}
 if(k=='c'&&sel.some(s=>s.t=='eng')){placing=null;menu=0;tool='cut';say('Right-click a road to blow/repair it');return}
 if((k=='delete'||k=='x')&&sel.some(s=>s.def&&s.f==MYF)){for(const d of sel.filter(s=>s.def&&s.f==MYF))kill(d,1);say('Defence removed');return}
 const pr=producer(),i='qfertg'.indexOf(k);if(pr&&i>=0&&!e.ctrlKey){queue(pr,ORDER[i]);return}keys[k]=1});
addEventListener('keyup',e=>delete keys[e.key.toLowerCase()]);
document.addEventListener('mouseleave',()=>mouse.in=0);
function mmGo(e){const r=MM.getBoundingClientRect();cam.x=(e.clientX-r.left)/r.width*W-C.width/cam.z/2;cam.y=(e.clientY-r.top)/r.height*W-C.height/cam.z/2}
MM.addEventListener('mousedown',e=>{mmGo(e);const mv=ev=>mmGo(ev),up=()=>{removeEventListener('mousemove',mv);removeEventListener('mouseup',up)};addEventListener('mousemove',mv);addEventListener('mouseup',up)});
let tool=null,dropping=1,placing=null,menu=0;const trenches=[],MRS=[];
/* ---- Weather: clear -> rain (with lightning) / sandstorm (-30% vision) ---- */
const WX={kind:'clear',next:25,rain:0,sand:0,fog:0,flash:0};
const vm=()=>Math.max(.15,(1-.8*WX.sand)*(1-.6*WX.fog)*(1-.25*WX.rain));
function updWx(dt){WX.next-=dt;const j=MAP=='snow';if(WX.next<=0){WX.next=rnd(30,70);const r=Math.random();WX.kind=j?(r<.25?'clear':r<.55?'rain':'fog'):(r<.35?'clear':r<.55?'rain':'sand');if(WX.kind!='clear')say(WX.kind=='rain'?(j?'Monsoon rain closing in':'Rain is rolling in'):WX.kind=='fog'?'Dense fog - you cannot see a thing':'SANDSTORM! Visibility almost zero')}
 const k=Math.min(1,dt*.4);WX.rain+=((WX.kind=='rain'?1:0)-WX.rain)*k;WX.sand+=((WX.kind=='sand'?1:0)-WX.sand)*k;WX.fog+=((WX.kind=='fog'?1:(j?.4:0))-WX.fog)*k;
 if(WX.rain>.6&&WX.flash<=0&&Math.random()<dt*(j?.16:.08))WX.flash=1;WX.flash=Math.max(0,WX.flash-dt*2.5)}
/* clouds: seamless noise tile, used as white cloud layer, ground shadows and jungle mist */
const CLD=(()=>{const N2=256,cv=document.createElement('canvas');cv.width=cv.height=N2;const c=cv.getContext('2d'),im=c.createImageData(N2,N2),d=im.data;
 const pn=(x,y,s,k)=>{const P=N2/s,gx=x/s,gy=y/s,ix=Math.floor(gx),iy=Math.floor(gy);let fx=gx-ix,fy=gy-iy;fx*=fx*(3-2*fx);fy*=fy*(3-2*fy);const h=(i,j)=>hrnd(((i%P)+P)%P,((j%P)+P)%P,k),a=h(ix,iy),b=h(ix+1,iy),e=h(ix,iy+1),f=h(ix+1,iy+1);return a+(b-a)*fx+(e-a)*fy+(a-b-e+f)*fx*fy};
 for(let y=0;y<N2;y++)for(let x=0;x<N2;x++){const v=pn(x,y,64,5)*.6+pn(x,y,32,6)*.3+pn(x,y,16,7)*.1,i=(y*N2+x)*4;d[i]=d[i+1]=d[i+2]=255;d[i+3]=Math.floor(Math.max(0,Math.min(1,(v-.48)*3.5))*4)/4*255}
 c.putImageData(im,0,0);const sh=document.createElement('canvas');sh.width=sh.height=N2;const q=sh.getContext('2d');q.drawImage(cv,0,0);q.globalCompositeOperation='source-in';q.fillStyle='#000';q.fillRect(0,0,N2,N2);return{w:cv,b:sh,pw:null,pb:null}})();
function cloudLayer(g,which,ox,oy,s,a){const k=which=='w'?'pw':'pb';CLD[k]=CLD[k]||g.createPattern(CLD[which],'repeat');g.save();g.imageSmoothingEnabled=true;g.globalAlpha=a;g.translate(ox,oy);g.scale(s,s);g.fillStyle=CLD[k];g.fillRect(-ox/s,-oy/s,(C.width+Math.abs(ox)*0+0)/s+2,C.height/s+2);g.restore()}
/* clouds live in world space (same place at every scroll/zoom), drawn as big hard pixels; shadows trail them */
function cloudsW(g,vw,vh,k){const sh=k=='b',ox=Math.round(T*14/4)*4+(sh?56:0),oy=Math.round(T*5/4)*4+(sh?40:0),a=sh?Math.min(.5,.3*(1-.5*WX.sand)+.15*WX.rain):Math.min(.7,.42*(1-.5*WX.sand)+.2*WX.rain),p='p'+k;
 CLD[p]=CLD[p]||g.createPattern(CLD[k],'repeat');g.save();g.imageSmoothingEnabled=false;g.globalAlpha=a;g.translate(ox,oy);g.scale(4,4);g.fillStyle=CLD[p];g.fillRect((cam.x-ox)/4-1,(cam.y-oy)/4-1,vw/4+2,vh/4+2);g.restore()}
function drawWx(g){const w=C.width,h=C.height,j=MAP=='snow';
  if(WX.fog>.02){const f=WX.fog;g.fillStyle='rgba(125,145,125,'+.4*f+')';g.fillRect(0,0,w,h);for(const[sp,s,a]of[[18,5,.5],[-11,8,.4]]){const ox=((-cam.x*cam.z*.6+T*sp)%1280+1280)%1280;for(const dx of[-1280,0])for(const dy of[-1280,0]){cloudLayer(g,'w',ox+dx,((-cam.y*cam.z*.6+T*5)%1280+1280)%1280+dy,s,a*f)}}}
 if(WX.rain>.02){g.fillStyle='rgba(20,35,50,'+.22*WX.rain+')';g.fillRect(0,0,w,h);g.strokeStyle='rgba(190,210,230,.55)';g.lineWidth=1;g.beginPath();
  for(let i=0,n=Math.floor(350*WX.rain*(j?1.6:1));i<n;i++){const sp=700+hrnd(i,3,5)*300,x=((hrnd(i,1,5)*w-T*sp*.25)%w+w)%w,y=(hrnd(i,2,5)*h+T*sp)%h;g.moveTo(x,y);g.lineTo(x-4,y+14)}g.stroke();
  if(WX.flash>0){g.fillStyle='rgba(220,230,255,'+.35*WX.flash+')';g.fillRect(0,0,w,h)}}
 if(WX.sand>.02){g.fillStyle='rgba(176,132,70,'+.62*WX.sand+')';g.fillRect(0,0,w,h);g.strokeStyle='rgba(235,200,130,.55)';g.lineWidth=1.5;g.beginPath();
  for(let i=0,n=Math.floor(520*WX.sand);i<n;i++){const sp=700+hrnd(i,3,6)*700,x=(hrnd(i,1,6)*w+T*sp)%w,y=((hrnd(i,2,6)*h+Math.sin(T+i)*20)%h+h)%h;g.moveTo(x,y);g.lineTo(x-24-hrnd(i,4,6)*30,y+3)}g.stroke()}}
/* ---- Drag-a-line building (sandbags, tank traps, trenches) ---- */
function linePts(a,b,sp){const L=hyp(b.x-a.x,b.y-a.y),ang=Math.atan2(b.y-a.y,b.x-a.x),n=L<sp*.8?0:Math.floor(L/sp),p=[];
 for(let i=0;i<=n;i++)p.push(n?{x:a.x+Math.cos(ang)*i*sp,y:a.y+Math.sin(ang)*i*sp}:{x:b.x,y:b.y});return{p,ang:n?ang:0,n}}
function trenchPts(points){
 const clean=[];for(const p of points)if(!clean.length||hyp(p.x-clean[clean.length-1].x,p.y-clean[clean.length-1].y)>1.5)clean.push(p);
 if(clean.length<2)return[{x:clean[0].x,y:clean[0].y,ang:placing.rot*Math.PI/2}];
 const out=[{x:clean[0].x,y:clean[0].y,ang:Math.atan2(clean[1].y-clean[0].y,clean[1].x-clean[0].x)}];let carry=0;
 for(let i=1;i<clean.length;i++){const a=clean[i-1],b=clean[i],dx=b.x-a.x,dy=b.y-a.y,L=hyp(dx,dy),ang=Math.atan2(dy,dx);if(!L)continue;
  let d=LINE.trench-carry;while(d<=L){const t=d/L;out.push({x:a.x+dx*t,y:a.y+dy*t,ang});d+=LINE.trench}carry=LINE.trench-(d-L)}
 const last=clean[clean.length-1],prev=clean[clean.length-2];if(hyp(last.x-out[out.length-1].x,last.y-out[out.length-1].y)>.5)out.push({x:last.x,y:last.y,ang:Math.atan2(last.y-prev.y,last.x-prev.x)});
 return out;
}
function trenchDragPoints(a,b){return mouse.stroke&&mouse.stroke.length>1?trenchPts([...mouse.stroke,b]):a?trenchPts([a,b]):trenchPts([b])}
function draggableTrenchAngle(a,b,ls,p){return a&&hyp(b.x-a.x,b.y-a.y)>=LINE.trench*.8?ls.ang:p.rot*Math.PI/2}
function drawLine(g){if(!placing)return 0;const k=placing.k,sp=LINE[k];if(!sp)return 0;
 const p=w2(mouse.x,mouse.y),dr=mouse.drag,ls=dr?linePts(w2(dr.x,dr.y),p,sp):{p:[p],ang:0,n:0};
 if(k!='trench'&&!ls.n)return 0;placing.chk=null;
 if(k=='road'&&dr){const ok=roadCheck(w2(dr.x,dr.y).x,w2(dr.x,dr.y).y)&&roadCheck(p.x,p.y);g.save();g.globalAlpha=.65;g.lineCap='butt';g.strokeStyle=ok?(MAP=='snow'?'#d6dddd':'#a18358'):'#e54';g.lineWidth=20;g.beginPath();g.moveTo(w2(dr.x,dr.y).x,w2(dr.x,dr.y).y);g.lineTo(p.x,p.y);g.stroke();g.restore();return 1}
 const trenchAng=draggableTrenchAngle(dr&&w2(dr.x,dr.y),p,ls,placing),trenchPath=k=='trench'?trenchDragPoints(dr&&w2(dr.x,dr.y),p):null;
 if(k=='trench')drawTrenchGhost(g,trenchPath,trenchAng);for(const q of k=='trench'?[]:ls.p){if(k=='trench'){}
  else{const c=placeCheck(k,q.x,q.y);drawD(g,{k,x:c.x,y:c.y,rot:k=='trap'?0:ls.ang,gang:-Math.PI/2},0,c.ok?.7:.3);g.strokeStyle=c.ok?'#8f8':'#e54';g.lineWidth=1.5;g.beginPath();g.arc(c.x,c.y,12,0,6.28);g.stroke()}}
 return 1}
function placeDrag(a,b,keep){const k=placing.k,sp=LINE[k],us=sel.filter(u=>u.t=='eng'&&u.f==MYF);
 if(!us.length){say('Select an engineer to build');placing=null;return}
 const ls=sp?linePts(a,b,sp):{p:[b],ang:0,n:0};if(k=='road'&&!ls.n){say('Drag to lay a road');return}if(k!='trench'&&!ls.n)return place(b.x,b.y,keep);
 const d=DEF[k]||{},jobs=[];let bad=0,poor=0;
 if(k=='road'){if(!roadCheck(a.x,a.y)||!roadCheck(b.x,b.y)){say('Makeshift roads need dry ground');return}if(F[MYF].oil<15){say('Not enough oil');return}F[MYF].oil-=15;const r=mkRoad(a,b,1),u=us[0];cmd(u);u.act='road';u.at={x:(a.x+b.x)/2,y:(a.y+b.y)/2,road:r,site:1};u.at=r;u.w=0;say('Building makeshift road');if(!keep)placing=null;return}
 const trenchAng=draggableTrenchAngle(a,b,ls,placing),trenchPath=k=='trench'?trenchDragPoints(a,b):null;const sid=++trenchSid;
 for(const q of k=='trench'?trenchPath:ls.p){if(k=='trench'){if(isW(q.x,q.y)||(MAP!='snow'&&Math.abs(q.y-RY)<80)||trenchOnRoad(pieceOf(trenchPath,q,trenchAng))){bad++;continue}{const qi=trenchPath.indexOf(q),pv=qi>0?trenchPath[qi-1]:null,an=q.ang||trenchAng;jobs.push({x:q.x,y:q.y,t:'pt',pt:1,ang:an,sid,k:qi,a:pv?{x:pv.x,y:pv.y}:{x:q.x-Math.cos(an)*8,y:q.y-Math.sin(an)*8}})}continue}
  const c=placeCheck(k,q.x,q.y);if(!c.ok){bad++;continue}if(F[MYF].oil<d.cost){poor=1;break}F[MYF].oil-=d.cost;jobs.push(mkDef(k,MYF,c.x,c.y,k=='trap'?0:ls.ang,1))}
 jobs.forEach((j,i)=>{const u=us[i%us.length],busy=buildBusy(u)||(u.act=='dig'&&u.at&&u.at.pt);
  if(busy)(u.bq=u.bq||[]).push(j);else{cmd(u);u.act=j.pt?'dig':'build';u.at=j;u.w=0}});
 say(!jobs.length?(poor?'Not enough oil':'Cannot build there'):(k=='trench'?'Digging ':'Building ')+jobs.length+(bad?' ('+bad+' blocked)':'')+(poor?' - ran out of oil':''));
 if(!keep)placing=null}
function moveHQ(h,x,y){
 h.x=h.nd.x=x;h.y=h.nd.y=y;h.kx=Math.round(x-48);h.ky=Math.round(y-42);
 const gt=h.gate,hx=x+(x<W/2?30:-30);gt.x=x+(x<W/2?80:-80);gt.y=y;gt.dormant=0;gt.a=[];gt.s=new Set();gt.i=N.length;N.push(gt);SG=null;
 const hl=(p,q)=>{const w=hyp(p.x-q.x,p.y-q.y);p.a.push({n:q,w,hid:1});q.a.push({n:p,w,hid:1})};
 const sn=nd(hx,y);hl(sn,gt);mkRoad({x:hx,y},gt,0).hq=1;
 let b=null,bd=1e9;
 for(const s of segs()){if(s.br||s.e.cut||s.e.hid||side((s.a.y+s.b.y)/2)!=side(gt.y))continue;const p=segD(gt.x,gt.y,s.a,s.b);if(p.d<bd){bd=p.d;b={s,x:p.x,y:p.y}}}
 if(b){const A=b.s.a,B=b.s.b;let j;
  if(hyp(A.x-b.x,A.y-b.y)<14)j=A;else if(hyp(B.x-b.x,B.y-b.y)<14)j=B;
  else{A.a=A.a.filter(q=>q.n!=B);B.a=B.a.filter(q=>q.n!=A);j=nd(b.x,b.y);l2(A,j);l2(j,B)}
  hl(gt,j);mkRoad(gt,j,0).hq=1}
 SG=null}
function airlift(f,x,y,list,msg){const sx=x<W/2?-140:W+140,sy=y+(y<RY?-160:160);HE.push({f,x:sx,y:sy,sx,sy,tx:x,ty:y,ang:Math.atan2(y-sy,x-sx),list,n:0,st:0,dt:0,k:0,sel:f==MYF,msg})}
function updHeli(dt){for(let i=HE.length;i--;){const h=HE[i];h.k+=dt;
 if(h.st==0){const dx=h.tx-h.x,dy=h.ty-h.y,d=hyp(dx,dy),s=320*dt;h.ang=Math.atan2(dy,dx);if(d<=s){h.x=h.tx;h.y=h.ty;h.st=1;h.dt=.3}else{h.x+=dx/d*s;h.y+=dy/d*s}}
 else if(h.st==1){h.dt-=dt;if(h.dt<=0){if(h.n<h.list.length){const a=h.n*2.4,r=h.n?60:0,u=unit(h.list[h.n],h.f,h.tx+Math.cos(a)*r,h.ty+Math.sin(a)*r);u.drop=1;if(h.sel){if(!h.n)sel=[];sel.push(u)}h.n++;h.dt=.45}else{h.st=2;if(h.msg)say(h.msg)}}}
 else{const dx=h.sx-h.x,dy=h.sy-h.y,d=hyp(dx,dy),s=320*dt;h.ang=Math.atan2(dy,dx);h.x+=dx/d*s;h.y+=dy/d*s;if(d<=s*2)HE.splice(i,1)}}}
function doDrop(x,y){x=cl(x,120,W-120);y=cl(y,120,W-120);if(isW(x,y)||(MAP!='snow'&&Math.abs(y-RY)<130)){say('Pick dry land');return}if(hqs.some(h=>h.f>0&&hyp(h.x-x,h.y-y)<220)){say('Too close to an enemy town');return}
 airlift(0,x,y,['mcv','scout','tank','inf'],'Select the Mobile HQ and press H (or double-click it) to deploy');
 dropping=0;updVis();updFog();for(const [k,g] of F[MYF].gh)if(g.u)F[MYF].gh.delete(k);cam.z=1;cam.x=x-C.width/2;cam.y=y-C.height/2;say('Transport helicopter inbound...')}
function deploy(m){if(!m||m.t!='mcv'||m.dead||m.drop>0)return;const x=m.x,y=m.y,h=hqs[MYF];
 if(isW(x,y)||(MAP!='snow'&&Math.abs(y-RY)<110)||x<70||x>W-70||y<60||y>W-60){say('Cannot deploy here');return}
 if(ALLT.some(t=>t!=h&&hyp(t.x-x,t.y-y)<150)||rigs.some(r=>hyp(r.x-x,r.y-y)<100)){say('Too close to another settlement');return}
 kill(m,1);h.dormant=0;h.nd.dormant=0;h.f=0;h.capital=0;h.cap=0;h.cf=-1;h.gar=2;h.q=[];h.qt=0;h.drop=1.2;
 E.push(h);ALLT.push(h);moveHQ(h,x,y);fx(x,y,70);F[MYF].gh.delete(h.id);sel=[h];say('HQ deployed - Q/F/E/R/T to build')}
function segD(px,py,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=cl(((px-a.x)*dx+(py-a.y)*dy)/(dx*dx+dy*dy),0,1);return{d:hyp(px-a.x-t*dx,py-a.y-t*dy),x:a.x+t*dx,y:a.y+t*dy}}
function roadAt(x,y){let b=null,bd=40;for(const n of N)for(const e of n.a)if(!e.br&&n.i<e.n.i){const s=segD(x,y,n,e.n);if(s.d<bd){bd=s.d;b={n,e,x:s.x,y:s.y}}}return b}
function roadSurfaceAt(x,y){const q=roadAt(x,y);if(q)return{...q,rot:Math.atan2(q.e.n.y-q.n.y,q.e.n.x-q.n.x)};
 const b=bridges.find(b=>b.hp>0&&Math.abs(x-b.x)<40&&Math.abs(y-RY)<60);return b?{x:b.x,y:RY,rot:Math.PI/2,bridge:b}:null}
let aiT=0,visT=0;
function update(dt){T+=dt;updWx(dt);updHeli(dt);jobTick(dt);
 for(const e of E.slice()){if(e.dead)continue;if(e.cd>0)e.cd-=dt;if(e.u)unitAI(e,dt);else if(e.t=='hq'||e.t=='town')turret(e,dt);else if(e.def&&!e.site)defAI(e,dt)}
 const us=E.filter(e=>e.u);for(const t of us)if(t.t=='truck'&&!t.dead)for(const u of us)if(u.f!=t.f&&u.t!='truck'&&!(u.drop>0)&&hyp(u.x-t.x,u.y-t.y)<18){kill(t);if(u.f==MYF)say('Enemy fuel truck intercepted - grab the oil!');break}
 for(let i=0;i<us.length;i++)for(let j=i+1;j<us.length;j++){const a=us[i],b=us[j],d=hyp(a.x-b.x,a.y-b.y);if(d<16&&d>.01&&a.f!=b.f){const p=(16-d)/2,dx=(a.x-b.x)/d*p,dy=(a.y-b.y)/d*p;if(!isW(a.x+dx,a.y+dy)||isW(a.x,a.y)){a.x+=dx;a.y+=dy}if(!isW(b.x-dx,b.y-dy)||isW(b.x,b.y)){b.x-=dx;b.y-=dy}}}
 for(const r of [...rigs,...towns,...hqs]){if(r.dormant)continue;const fs=new Set();for(const u of us)if(u.t!='truck'&&u.t!='art'&&u.t!='mcv'&&hyp(u.x-r.x,u.y-r.y)<60)fs.add(u.f);
  if(fs.size==1){const f=[...fs][0];if(f!=r.f){if(r.cf!=f){r.cf=f;r.cap=0}r.cap+=dt/(r.t=='rig'?6:7);if(r.cap>=1){const old=r.f;if(r.q&&old>=0&&F[old])for(const q of r.q)F[old].oil+=ST[q].cost;r.f=f;r.cap=0;r.gar=0;r.tm=6;if(r.q)r.q.length=0;if(f==MYF)say('Captured '+r.t)}}else r.cap=Math.max(0,r.cap-dt*.5)}else if(!fs.size)r.cap=Math.max(0,r.cap-dt*.3)}
 for(const r of rigs)if(r.f>=0&&!r.tk&&F[r.f].alive){r.tm-=dt;if(r.tm<=0){const t=unit('truck',r.f,r.x,r.y);t.cur=r.nd;t.rt=[];t.src=r;r.tk=t;r.tm=6}}
 for(let i=CR.length;i--;){const c=CR[i];c.l-=dt;const u=us.find(u=>u.t!='truck'&&hyp(u.x-c.x,u.y-c.y)<28);if(u){F[u.f].oil+=c.o;CR.splice(i,1)}else if(c.l<=0)CR.splice(i,1)}
 for(let i=P.length;i--;){const p=P[i];if(p.delay>0){p.delay-=dt;continue}if(p.tg&&p.tg.hp>0){p.tx=p.tg.x;p.ty=p.tg.y}const dx=p.tx-p.x,dy=p.ty-p.y,d=hyp(dx,dy),s=p.sp*dt;if(d<=s+4){impact(p);P.splice(i,1)}else{p.x+=dx/d*s;p.y+=dy/d*s;if(p.rk&&(p.sm=(p.sm||0)+dt)>.05){p.sm=0;FX.push({x:p.x,y:p.y,r:0,t:0,k:'smoke'})}}}
 for(let i=FX.length;i--;){FX[i].t+=dt*(FX[i].k?1.2:1.6);if(FX[i].t>1)FX.splice(i,1)}
 aiT-=dt;if(aiT<=0){aiT=1;for(const f of F)if(f.alive&&!over&&!E.some(e=>e.f==f.i&&e.u&&e.t!='truck')&&!ALLT.some(t=>t.f==f.i)&&!HE.some(h=>h.f==f.i))elim(f.i)}
 visT-=dt;if(visT<=0){visT=.2;updVis();updGh(.2);updFog()}
 if(!over) for(const f of F)if(f.i&&f.i!=MYF&&f.alive){f.at-=dt;if(f.at<=0){f.at=1.5;aiThink(f.i)}}
 camStep(dt);
 if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').textContent=''}}
function R(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
/* hi-res (2x) sprites are drawn at half scale with smoothing; old 1x sprites stay pixel-crisp */
function spr(g,n,tm,x,y,ang,sc){const s=S[n],cv=Assets.get(n,tm);g.imageSmoothingEnabled=!!s.hr;sc*=s.k||1;g.save();g.translate(Math.round(x),Math.round(y));if(ang)g.rotate(ang);g.scale(sc,sc);g.drawImage(cv,-cv.width/2,-cv.height/2);g.restore()}
const UN={tank:'tankHull',scout:'scoutCar',inf:'infantry',eng:'engineerTruck',art:'rocketArtillery',truck:'fuelTruck',mcv:'mcv',blayer:'bridgeLayer'};
function drawU(g,t,x,y,ang,c){let tm=FC.indexOf(c);if(tm<0)tm=5;const a=ang+Math.PI/2,sc=t=='tank'?1:1.5;spr(g,UN[t],tm,x,y,t=='inf'?0:a,sc);if(t=='tank')spr(g,'tankTurret',tm,x,y,a,sc)}
function drawS(g,e,f,a){const tm=f<0?5:f;g.globalAlpha=a;if(e.t=='rig')spr(g,'oilRig',tm,e.x,e.y,0,1.4);else if(e.isHQ)spr(g,'hq',tm,e.x,e.y,0,1.5);else if(e.capital)Assets.drawK(g,'palace',tm,Math.round(e.x-24),Math.round(e.y-16));else{Assets.drawK(g,'bldDepot',tm,e.kx+51,e.ky+26);R(g,e.kx+55,e.ky+12,1,14,'#222');R(g,e.kx+56,e.ky+12,8,5,TEAMS[tm][1])}g.globalAlpha=1}
function bar(g,x,y,w,v){R(g,x-w/2,y,w,3,'#000');R(g,x-w/2,y,w*cl(v,0,1),3,v>.5?'#6c6':v>.25?'#ec4':'#e54')}
let fr=0;
function draw(){const g=X,z=cam.z,vw=C.width/z,vh=C.height/z;g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;g.fillStyle='#000';g.fillRect(0,0,C.width,C.height);g.setTransform(z,0,0,z,-cam.x*z,-cam.y*z);
 g.drawImage(TC,0,0);
 if(MAP!='snow')for(const b of bridges){const cv=bridgeCv(b.hp<=0?2:b.hp<b.mhp*.5?1:0);g.imageSmoothingEnabled=false;g.save();g.translate(b.x,b.y);g.rotate(Math.PI/2);g.scale(1.5,1.5);g.drawImage(cv,-40,-16);g.restore();if(b.hp>0&&b.hp<b.mhp)bar(g,b.x,b.y-72,50,b.hp/b.mhp);if(b.rb>0)R(g,b.x-30,b.y-6,60*b.rb,12,'#e8b04a')}
 const inV=e=>e.x>cam.x-60&&e.x<cam.x+vw+60&&e.y>cam.y-60&&e.y<cam.y+vh+60,gh=F[MYF].gh;
 for(const e of [...rigs,...towns,...hqs]){if(!inV(e)||e.dormant)continue;const v=vi(MYF,e.x,e.y);if(!v)continue;
  if(v==2){drawS(g,e,e.f,1);if(e.cap>0&&e.cf>=0){g.strokeStyle=FC[e.cf];g.lineWidth=4;g.beginPath();g.arc(e.x,e.y,e.r+8,-1.57,-1.57+6.28*e.cap);g.stroke()}if(e.t=='town'&&e.gar){g.fillStyle='#fff';g.fillText('G'+e.gar,e.x-8,e.y+34)}if(e.t=='hq')bar(g,e.x,e.y-48,60,e.hp/e.mhp)}
  else{const q=gh.get(e.id);drawS(g,e,q?q.f:-1,.55)}if(e.name)tag(g,e)}
 drawTrenches(g,inV);
 for(const r of MRS){const dx=r.b.x-r.a.x,dy=r.b.y-r.a.y,L=hyp(dx,dy)||1,n=Math.max(1,Math.round(L/32)),an=Math.atan2(dy,dx);g.save();g.globalAlpha=r.site?.45:1;g.imageSmoothingEnabled=false;for(let i=0;i<n;i++){const t=(i+.5)/n,px=r.a.x+dx*t,py=r.a.y+dy*t;if(!inV({x:px,y:py}))continue;g.save();g.translate(px,py);g.rotate(an);g.scale(L/n/32,1);g.drawImage(Assets.get(i%6==3?'dirtRoadPlanks':'dirtRoadStraight',0),-16,-16);g.restore()}g.restore()}
 for(const n of N)for(const e of n.a)if(e.cut&&n.i<e.n.i&&vi(MYF,e.cx,e.cy)>0){R(g,e.cx-14,e.cy-14,28,28,'#2a2116');R(g,e.cx-9,e.cy-9,18,18,'#0c0a06');R(g,e.cx-3,e.cy-17,6,4,'#f84')}
 if(tool&&mouse.in&&!dropping&&sel.some(s=>s.t=='eng'&&s.f==MYF)){const p=w2(mouse.x,mouse.y);
  if(tool=='cut'){const q=roadAt(p.x,p.y);if(q){const col=q.e.cut?'90,230,120':'255,200,60',a=q.n,b=q.e.n;g.lineCap='butt';g.strokeStyle='rgba('+col+',.35)';g.lineWidth=20;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
   g.strokeStyle='rgba('+col+',.9)';g.lineWidth=2;g.setLineDash([6,4]);g.stroke();g.setLineDash([]);
   g.beginPath();g.arc(q.x,q.y,16,0,6.28);g.moveTo(q.x-22,q.y);g.lineTo(q.x+22,q.y);g.moveTo(q.x,q.y-22);g.lineTo(q.x,q.y+22);g.stroke()}}}
 if(placing&&mouse.in&&!dropping&&!drawLine(g)&&DEF[placing.k]){const p=w2(mouse.x,mouse.y),c=placeCheck(placing.k,p.x,p.y),d=DEF[placing.k];placing.chk=c;g.lineWidth=1.5;g.setLineDash([6,5]);
  if(d.rng){g.strokeStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(c.x,c.y,d.rng,0,6.28);g.stroke()}
  if(d.min){g.strokeStyle='rgba(255,90,70,.5)';g.beginPath();g.arc(c.x,c.y,d.min,0,6.28);g.stroke()}
  if(d.cover){g.strokeStyle='rgba(120,230,120,.5)';g.beginPath();g.arc(c.x,c.y,d.cover,0,6.28);g.stroke()}
  g.setLineDash([]);drawD(g,{k:placing.k,x:c.x,y:c.y,rot:c.rot!=null?c.rot:placing.rot*Math.PI/2,gang:-Math.PI/2},0,.65);
  g.strokeStyle=c.ok?'#8f8':'#e54';g.lineWidth=2;g.beginPath();g.arc(c.x,c.y,(d.r||8)*DS+3,0,6.28);g.stroke()}
 for(const w of WR)if(inV(w)&&vi(MYF,w.x,w.y)>0)spr(g,w.k,0,w.x,w.y,w.ang+Math.PI/2,w.k=='wreckTank'?1:1.5);
 for(const c of CR){R(g,c.x-6,c.y-6,12,12,'#111');R(g,c.x-4,c.y-4,8,8,'#e8b04a')}
 for(const q of gh.values())if(q.def&&inV(q)&&vi(MYF,q.x,q.y)<2)drawD(g,q,q.f,.55);
 for(const e of E){if(!e.def||!inV(e)||(e.f!=MYF&&vi(MYF,e.x,e.y)<2))continue;drawD(g,e,e.f,1);if(e.hp<e.mhp&&!e.site)bar(g,e.x,e.y-e.r-5,Math.max(24,e.r*1.6),e.hp/e.mhp);if(e.site)bar(g,e.x,e.y-e.r-5,Math.max(24,e.r*1.6),e.prog)}
 for(const q of gh.values())if(q.u&&inV(q)){drawU(g,q.t,q.x,q.y,q.ang,FC[q.f]||'#999');}
 for(const q of gh.values())if(q.u&&inV(q)){const a=.5*(1-q.age/45);g.globalAlpha=1;g.fillStyle='rgba(0,0,0,'+(.55-a*.6)+')';g.fillRect(q.x-12,q.y-12,24,24);g.strokeStyle=FC[q.f]||'#999';g.globalAlpha=a+.2;g.setLineDash([3,3]);g.strokeRect(q.x-12,q.y-12,24,24);g.setLineDash([]);g.globalAlpha=1}
 for(const e of E){if(!e.u||!inV(e))continue;if(e.f!=MYF&&vi(MYF,e.x,e.y)<2)continue;
  if(sel.includes(e)){g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.ellipse(e.x,e.y,15,12,0,0,6.28);g.stroke()}
  const o=e.drop>0?e.drop*140:0;if(o){R(g,e.x-8,e.y+4,16,5,'rgba(0,0,0,.35)');R(g,e.x-10,e.y-o-24,20,8,'#eee');R(g,e.x-1,e.y-o-16,2,10,'#ccc')}drawU(g,e.t,e.x,e.y-o,e.ang,FC[e.f]);if(e.hp<e.mhp||sel.includes(e))bar(g,e.x,e.y-16,22,e.hp/e.mhp);
  if(e.t=='eng'&&sel.includes(e)){const qs=[...(e.act=='dig'&&e.at&&e.at.pt?[e.at]:[]),...(e.bq||[])].filter(q=>q.pt);if(qs.length)drawDigPlan(g,qs)}
  if(e.t=='eng'&&e.act&&e.at&&e.act!='gar'&&e.act!='cap'){const t=e.at,tx=t.x,ty=t.isB?(side(e.y)?1295:1105):t.y,dur=e.act=='dig'?DIGT:3,bj=e.act=='build',work=(e.act=='rep'||bj)?hyp(tx-e.x,ty-e.y)<=(t.def?t.r+26:50):(e.w||0)>0;
   if(sel.includes(e)&&!work){g.strokeStyle='rgba(255,200,60,.9)';g.lineWidth=2;g.setLineDash([4,4]);g.beginPath();g.arc(tx,ty,12,0,6.28);g.stroke();g.setLineDash([]);g.strokeStyle='rgba(255,200,60,.35)';g.beginPath();g.moveTo(e.x,e.y);g.lineTo(tx,ty);g.stroke()}
   if(work){g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.55)';g.beginPath();g.arc(tx,ty,14,0,6.28);g.stroke();
    if(e.act!='rep'){g.strokeStyle='#e8b04a';g.beginPath();g.arc(tx,ty,14,-1.57,-1.57+6.28*cl(bj?t.prog:(e.w||0)/dur,0,1));g.stroke()}
    g.strokeStyle='#fff';g.beginPath();g.arc(tx,ty,9,T*8,T*8+1.8);g.stroke()}}
  if(sel.includes(e)&&e.path.length){g.strokeStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(e.x,e.y);for(const p of e.path)g.lineTo(p.x,p.y);g.stroke()}}
 drawOrph(g,inV);for(const e of sel)if(!e.u&&e.f==MYF){g.strokeStyle='#fff';g.strokeRect(e.x-e.r-4,e.y-e.r-4,e.r*2+8,e.r*2+8)}
 for(const p of P){if(p.delay>0)continue;const h=p.ar?Math.sin(Math.PI*(1-hyp(p.tx-p.x,p.ty-p.y)/Math.max(1,p.tot)))*50:0;if(vi(MYF,p.x,p.y)<2&&p.f!=MYF)continue;if(p.rk)spr(g,'rocket',p.f,p.x,p.y-h,Math.atan2(p.ty-p.sy,p.tx-p.sx)+Math.PI/2,.9);else R(g,p.x-2,p.y-2,4,4,'#ffe')}
 for(const f of FX){if(vi(MYF,f.x,f.y)<1)continue;if(f.k){g.globalAlpha=.8*(1-f.t);spr(g,'smokePuff',0,f.x,f.y,0,1.5)}else{g.globalAlpha=1;spr(g,'explosion'+Math.min(6,Math.floor(f.t*7)),0,f.x,f.y,0,cl(f.r/16,.7,4))}g.globalAlpha=1}
 for(const h of HE){spr(g,'heliTrans',h.f,h.x,h.y,h.ang+Math.PI/2,2);spr(g,'heliRotor',0,h.x,h.y,h.k*30,2)}
 if(MAP!='snow')cloudsW(g,vw,vh,'b');
 g.imageSmoothingEnabled=false;g.drawImage(FCV,0,0,W,W);if(MAP!='snow')cloudsW(g,vw,vh,'w');
 g.setTransform(1,0,0,1,0,0);drawWx(g);if(!placing&&mouse.drag&&hyp(mouse.x-mouse.drag.x,mouse.y-mouse.drag.y)>6){g.strokeStyle='#8f8';g.lineWidth=1;g.strokeRect(mouse.drag.x,mouse.drag.y,mouse.x-mouse.drag.x,mouse.y-mouse.drag.y)}
 if(placing&&placing.chk&&mouse.in&&!dropping){const d=DEF[placing.k],c=placing.chk;g.font='12px monospace';g.textAlign='left';g.fillStyle='rgba(0,0,0,.7)';const tx=d.n+' '+d.cost+' - '+(c.ok?'click to place'+(d.rot?' | Z rotate':'')+' | shift: keep placing':c.m);g.fillRect(mouse.x+16,mouse.y-24,g.measureText(tx).width+10,18);g.fillStyle=c.ok?'#8f8':'#f88';g.fillText(tx,mouse.x+21,mouse.y-11);g.font='10px sans-serif'}
 if(dropping){const p=w2(mouse.x,mouse.y),bad=isW(p.x,p.y)||(MAP!='snow'&&Math.abs(p.y-RY)<130);g.strokeStyle=bad?'#e54':'#8f8';g.lineWidth=2;g.beginPath();g.arc(mouse.x,mouse.y,40*cam.z,0,6.28);g.stroke();g.fillStyle='#fff';g.font='20px monospace';g.textAlign='center';g.fillText('CHOOSE YOUR DROP ZONE - click anywhere on land',C.width/2,90);g.textAlign='left';g.font='10px sans-serif'}
 if(fr%3==0)mini()}
function mini(){const m=150/W,g=MX;g.drawImage(TC,0,0,150,150);
 if(MAP!='snow')for(const b of bridges){g.fillStyle=b.hp>0?'#7a5a33':'#a33';g.fillRect(b.x*m-2,RY*m-4,4,8)}
 for(const e of [...rigs,...towns,...hqs]){if(e.dormant)continue;const v=vi(MYF,e.x,e.y);if(!v)continue;const q=F[MYF].gh.get(e.id);g.fillStyle=v==2?(e.f<0?'#999':FC[e.f]):(q&&q.f>=0?FC[q.f]:'#999');const s=e.t=='hq'?7:e.t=='town'?5:3;g.fillRect(e.x*m-s/2,e.y*m-s/2,s,s)}
 for(const e of E)if(e.u&&(e.f==MYF||vi(MYF,e.x,e.y)==2)){g.fillStyle=FC[e.f];g.fillRect(e.x*m-1,e.y*m-1,2,2)}
 for(let j=0;j<G;j++)for(let i=0;i<G;i++){const s=F[MYF].vis[j*G+i];if(s==2)continue;g.fillStyle=s?'rgba(0,0,0,.45)':'rgba(0,0,0,.9)';g.fillRect(i*2.5,j*2.5,2.6,2.6)}
 g.strokeStyle='#fff';g.lineWidth=1;g.strokeRect(cam.x*m,cam.y*m,C.width/cam.z*m,C.height/cam.z*m)}
for(const h of hqs){if(!h.f)continue;unit('scout',h.f,h.x+50,h.y+(h.y<RY?70:-70));unit('tank',h.f,h.x-10,h.y+(h.y<RY?80:-80));unit('inf',h.f,h.x-60,h.y+(h.y<RY?70:-70))}
updVis();F[MYF].vis.fill(2);updGh(0);updFog();cam.z=Math.max(.2,Math.min(C.width/W,(C.height-90)/W));cam.x=(W-C.width/cam.z)/2;cam.y=(W-C.height/cam.z)/2;
document.querySelectorAll('#mapMenu button').forEach(b=>b.addEventListener('click',()=>{$('mapMenu').style.display='none';applyMap(b.dataset.map);dropping=1;sel=[];cam.z=Math.max(.2,Math.min(C.width/W,(C.height-90)/W));cam.x=(W-C.width/cam.z)/2;cam.y=(W-C.height/cam.z)/2;say(b.dataset.map=='snow'?'Vietnam Jungle selected':'Desert Front selected')}));
/*jobsites-v1*/
/* Abandoned work: when an engineer dies, whatever it was building (or had queued) becomes a jobsite. */
const ORPH=[],JOB_R=900,JOB_CHUNK=5,JOB_FACTIONS=f=>f==MYF;let jobT=0;
const jobHeld=(j,ex)=>E.some(o=>o!==ex&&o.t=='eng'&&!o.dead&&(o.at===j||(o.bq&&o.bq.includes(j))));
function jobOK(j){if(!j.orph||!F[j.jf]||!F[j.jf].alive)return 0;if(j.road)return !!j.site&&MRS.includes(j);if(j.def)return !j.dead&&!!j.site;return 1}
function orphanJobs(e,q){if(q||e.t!='eng'||!F[e.f]||!F[e.f].alive)return;
 const js=[],add=j=>{if(j&&!j.dead&&!j.orph&&(j.site||j.pt)&&!js.includes(j))js.push(j)};
 if(e.act=='build'||e.act=='dig'||e.act=='road')add(e.at);
 for(const j of e.bq||[])add(j);
 let n=0;for(const j of js){if(jobHeld(j,e))continue;j.orph=1;j.jf=e.f;ORPH.push(j);n++}
 if(n&&e.f==MYF)say('Engineer lost - unfinished work left as a jobsite')}
function takeJob(u,j){
 if(j.pt&&j.sid!==undefined){let r;while((r=ORPH.find(o=>o.pt&&o.jf==j.jf&&o.sid===j.sid&&o.k===j.k-1)))j=r}/* start at the head of the unfinished run */
 const i=ORPH.indexOf(j);if(i>=0)ORPH.splice(i,1);j.orph=0;cmd(u);u.w=0;
 if(j.pt){/* trench: also take the next pieces of the same stroke so the line keeps going */
  const ch=[];for(let n=1;n<JOB_CHUNK;n++){const q=ORPH.find(o=>o.pt&&o.jf==j.jf&&o.sid!==undefined&&o.sid===j.sid&&o.k===j.k+n);if(!q)break;ORPH.splice(ORPH.indexOf(q),1);q.orph=0;ch.push(q)}
  u.act='dig';u.at=j;u.bq=ch}
 else{u.act=j.road?'road':'build';u.at=j}
 if(u.f==MYF)say('Engineer resuming unfinished work')}
function jobTick(dt){jobT-=dt;if(jobT>0)return;jobT=.5;
 for(let i=ORPH.length;i--;)if(!jobOK(ORPH[i])){ORPH[i].orph=0;ORPH.splice(i,1)}
 if(!ORPH.length)return;
 const bridgeUp=MAP=='snow'||bridges.some(b=>b.hp>0);
 for(const u of E){if(u.t!='eng'||u.dead||u.drop>0||!JOB_FACTIONS(u.f)||u.act||u.path.length||(u.bq&&u.bq.length))continue;
  let b=null,bd=JOB_R;
  for(const j of ORPH){if(j.jf!=u.f)continue;if(!bridgeUp&&side(j.y)!=side(u.y))continue;const d=hyp(j.x-u.x,j.y-u.y);if(d<bd){bd=d;b=j}}
  if(b)takeJob(u,b)}}
function drawOrph(g,inV){const mine=ORPH.filter(j=>j.jf==MYF);if(!mine.length)return;
 const pulse=.55+.35*Math.sin(T*4),col='rgba(255,200,60,'+pulse+')',pts=mine.filter(j=>j.pt);
 g.save();g.lineWidth=2;g.setLineDash([4,4]);
 if(pts.length)drawDigPlan(g,pts);
 g.strokeStyle=col;
 const mark=(x,y)=>{if(!inV({x,y}))return;g.beginPath();g.arc(x,y,13,0,6.283);g.stroke();g.fillStyle=col;g.fillRect(x-1,y-6,2,7);g.fillRect(x-1,y+3,2,2)};
 for(const run of trenchRuns(pts))mark(run[0].x,run[0].y);
 for(const j of pts)if(j.sid===undefined)mark(j.x,j.y);
 for(const j of mine){if(j.pt)continue;
  if(j.road){g.beginPath();g.moveTo(j.a.x,j.a.y);g.lineTo(j.b.x,j.b.y);g.stroke();mark(j.x,j.y)}
  else mark(j.x,j.y-j.r-8)}
 g.restore()}
let last=performance.now(),hT=0;
/*fixpatch-v1*/
function roadNear(x,y,m){for(const s of segs()){if(s.br&&s.br.hp<=0)continue;if(segD(x,y,s.a,s.b).d<m)return 1}for(const r of MRS)if(!r.site&&!r.hq&&segD(x,y,r.a,r.b).d<m)return 1;return 0}
/*fixpatch-follow-v3*/
function trenchOnRoad(t){const an=t.ang||0,A=t.a||{x:t.x-Math.cos(an)*26,y:t.y-Math.sin(an)*26},B=t.a?{x:t.x,y:t.y}:{x:t.x+Math.cos(an)*26,y:t.y+Math.sin(an)*26};for(const[px,py]of[[B.x,B.y],[A.x,A.y],[(A.x+B.x)/2,(A.y+B.y)/2]])if(drv(px,py)||roadNear(px,py,22))return 1;return 0}
function pieceOf(path,q,ang){const i=path.indexOf(q),pv=i>0?path[i-1]:null,an=q.ang||ang;return{x:q.x,y:q.y,ang:an,a:pv?{x:pv.x,y:pv.y}:{x:q.x-Math.cos(an)*8,y:q.y-Math.sin(an)*8}}}
/*fixpatch-trench-v2*/
const DIGT=1.2;let trenchSid=0;
function smoothStroke(p){if(p.length<3)return p;let q=p;for(let it=0;it<2;it++){const s=q;q=s.map((c,i)=>i==0||i==s.length-1?c:{x:(s[i-1].x+c.x*2+s[i+1].x)/4,y:(s[i-1].y+c.y*2+s[i+1].y)/4})}return q}
function smoothPath(g,pts){g.moveTo(pts[0].x,pts[0].y);if(pts.length==1){g.lineTo(pts[0].x+.01,pts[0].y);return}
 if(pts.length==2){g.lineTo(pts[1].x,pts[1].y);return}
 for(let i=1;i<pts.length-1;i++){g.quadraticCurveTo(pts[i].x,pts[i].y,(pts[i].x+pts[i+1].x)/2,(pts[i].y+pts[i+1].y)/2)}
 const l=pts[pts.length-1];g.lineTo(l.x,l.y)}
/* group chained pieces by stroke id, order them, and split wherever a piece is missing */
function trenchRuns(list){const by=new Map(),runs=[];
 for(const t of list){if(t.sid===undefined)continue;let a=by.get(t.sid);if(!a)by.set(t.sid,a=[]);a.push(t)}
 for(const a of by.values()){a.sort((p,q)=>p.k-q.k);let run=null;for(const t of a){if(run&&t.k==run[run.length-1].k+1)run.push(t);else{run=[t];runs.push(run)}}}
 return runs}
const runPts=run=>[{x:run[0].a.x,y:run[0].a.y},...run.map(t=>({x:t.x,y:t.y}))];
function drawTrenches(g,inV){const vis=trenches.filter(t=>inV(t)&&(t.f==MYF||vi(MYF,t.x,t.y)>0));if(!vis.length)return;
 const paths=[];for(const t of vis)if(t.sid===undefined)paths.push([t.a,t.b]);
 for(const run of trenchRuns(vis))paths.push(runPts(run));
 g.save();g.lineCap='round';g.lineJoin='round';g.imageSmoothingEnabled=true;
 for(const[w,c]of[[18,'#6b5a3a'],[14,'#2a2116'],[8,'#150f08']]){g.lineWidth=w;g.strokeStyle=c;g.beginPath();for(const p of paths)smoothPath(g,p);g.stroke()}
 g.restore()}
function drawDigPlan(g,qs){g.save();g.lineCap='round';g.lineJoin='round';g.setLineDash([5,5]);g.strokeStyle='rgba(255,200,60,.8)';g.lineWidth=2;g.beginPath();
 for(const run of trenchRuns(qs))smoothPath(g,runPts(run));
 for(const t of qs)if(t.sid===undefined){const c=Math.cos(t.ang||0)*26,s=Math.sin(t.ang||0)*26;smoothPath(g,[{x:t.x-c,y:t.y-s},{x:t.x+c,y:t.y+s}])}
 g.stroke();g.restore()}
function drawTrenchGhost(g,pts,ang){if(!pts.length)return;g.save();g.lineCap='round';g.lineJoin='round';g.globalAlpha=.6;
 g.strokeStyle='#5a4a30';g.lineWidth=12;g.beginPath();smoothPath(g,pts);g.stroke();
 g.strokeStyle='#e54';g.lineWidth=14;g.beginPath();let any=0;
 for(const q of pts)if(isW(q.x,q.y)||(MAP!='snow'&&Math.abs(q.y-RY)<80)||drv(q.x,q.y)||roadNear(q.x,q.y,22)){g.moveTo(q.x,q.y);g.lineTo(q.x+.01,q.y);any=1}
 if(any)g.stroke();g.restore()}
function camStep(dt){const sp=700*dt/cam.z,m=24;let mx=0,my=0;
 if(keys.a||keys.arrowleft)mx=-1;if(keys.d||keys.arrowright)mx=1;if(keys.w||keys.arrowup)my=-1;if(keys.s||keys.arrowdown)my=1;
 if(mouse.in&&!mouse.drag){if(mouse.x<m)mx=-1;if(mouse.x>C.width-m)mx=1;if(mouse.y<m)my=-1;if(mouse.y>C.height-m-80)my=1}
 const cc=(v,vs)=>{const hi=W-vs+200;return hi<-200?(W-vs)/2:cl(v,-200,hi)};
 cam.x=cc(cam.x+mx*sp,C.width/cam.z);cam.y=cc(cam.y+my*sp,C.height/cam.z)}
const warn=(()=>{let n=0;return(w,e)=>{if(n++<5)console.error(w,e)}})();
function loop(n){requestAnimationFrame(loop);const dt=Math.min(.05,(n-last)/1000);last=n;fr++;
 try{if(!dropping){if(over)camStep(dt);else update(dt)}}catch(e){warn('update',e)}
 try{draw()}catch(e){warn('draw',e)}
 hT-=dt;if(hT<=0){hT=.15;try{hud()}catch(e){warn('hud',e)}}}
requestAnimationFrame(loop);say('Capture oil rigs. Protect your fuel trucks. Space = HQ');
