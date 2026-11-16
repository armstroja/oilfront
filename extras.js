/* extras.js - load AFTER engine.js. Hooks into engine functions instead of editing them. */
const XT={pause:0,speed:1,al:-99,pings:[],arm:0,pump:0,mute:0,ac:null,amb:null};

/* ---------- reconnaissance drone ---------- */
ST.drone={n:'Strike Drone',hp:45,spd:210,rng:0,dmg:0,vis:520};
DEF.drone={n:'Drone Facility',cost:320,hp:360,ter:'land',r:18,drone:1,vis:300};
const DRONE_COST=90,DRONE_FLIGHT=24,DRONE_BLAST=115;

function drawDrone(g,x,y,ang,team){
 const c=FC[team]||'#e8b04a';
 g.save();g.translate(x,y);g.rotate(ang+Math.PI/2);g.globalAlpha=.35;g.fillStyle='#000';g.beginPath();g.ellipse(0,8,18,5,0,0,6.28);g.fill();g.globalAlpha=1;
 g.fillStyle='#252b2f';g.fillRect(-5,-8,10,16);g.fillStyle=c;g.fillRect(-3,-7,6,5);g.fillStyle='#9ca7a1';g.fillRect(-2,-2,4,8);
 g.strokeStyle='#59635d';g.lineWidth=2;for(const s of [-1,1]){g.beginPath();g.moveTo(0,0);g.lineTo(s*15,-8);g.moveTo(0,0);g.lineTo(s*15,8);g.stroke()}
 g.fillStyle='#e8b04a';g.fillRect(-1,8,2,4);g.restore();
}

function droneAI(d,dt){
 if(d.drop>0){d.drop-=dt;return}
 if(d.crash){d.crash-=dt;d.alt=Math.max(0,(d.crash/1.2)*90);if(d.crash<=0){
   fx(d.x,d.y,DRONE_BLAST*.7);
   for(const e of E.slice())if(e!=d&&e.f!=d.f&&e.hp>0&&hyp(e.x-d.x,e.y-d.y)<DRONE_BLAST)hurt(e,180*(1-hyp(e.x-d.x,e.y-d.y)/DRONE_BLAST));
   kill(d);if(d.f==MYF)say('Strike drone slammed down');return;
 }return}
 d.flight=(d.flight||DRONE_FLIGHT)-dt;
 if(d.flight<=0){d.crash=1.2;d.path=[];if(d.f==MYF)say('Strike drone impact run');return}
 if(d.droneTarget){
   const dx=d.droneTarget.x-d.x,dy=d.droneTarget.y-d.y,dist=hyp(dx,dy),step=ST.drone.spd*dt;
   if(dist<=step){d.x=d.droneTarget.x;d.y=d.droneTarget.y;d.droneTarget=null}
   else{d.x+=dx/dist*step;d.y+=dy/dist*step;d.ang=Math.atan2(dy,dx)}
 }
}

const _unitAI=unitAI;
unitAI=function(u,dt){if(u.t=='drone')return droneAI(u,dt);_unitAI(u,dt)};

const _drawU=drawU;
drawU=function(g,t,x,y,ang,c){if(t=='drone'){drawDrone(g,x,y,ang,FC.indexOf(c));return}_drawU(g,t,x,y,ang,c)};

const _drawD=drawD;
drawD=function(g,e,tm,a){if(e.k=='drone'){
 g.save();g.globalAlpha=a*(e.site?.5:1);g.fillStyle='#313a35';g.fillRect(e.x-22,e.y-16,44,32);g.fillStyle='#77836e';g.fillRect(e.x-16,e.y-10,32,20);g.fillStyle='#e8b04a';g.fillRect(e.x-4,e.y-4,8,8);g.restore();return
}_drawD(g,e,tm,a)};

const _place=place;
place=function(x,y,keep){
 const k=placing&&placing.k;
 if(k=='drone'){
   if(!sel.some(u=>u.t=='eng'&&u.f==MYF)){say('Select an engineer to build');placing=null;return}
 }
 _place(x,y,keep);
};

{const b=document.createElement('button');b.id='d_drone';b.innerHTML='Drone Facility <b>'+DEF.drone.cost+'</b><br><small style="opacity:.7">open ground | launches strike drones</small>';
 b.onclick=()=>{placing={k:'drone',rot:0};menu=0;tool=null;say('Click to place the Drone Facility - right-click cancels')};$('dm').appendChild(b)}

function launchDrone(fac){
 if(!fac||fac.dead||fac.site||fac.f!=MYF)return;
 if(F[MYF].oil<DRONE_COST){say('Not enough oil for a strike drone');return}
 if(E.some(e=>e.t=='drone'&&e.f==MYF)){say('Only one strike drone can be airborne');return}
 F[MYF].oil-=DRONE_COST;const d=unit('drone',MYF,fac.x,fac.y-28);d.flight=DRONE_FLIGHT;d.alt=80;d.fac=fac;sel=[d];say('Strike drone launched - right-click to fly it');
}

const _order=order;
order=function(x,y){
 const ds=sel.filter(e=>e.t=='drone'&&e.f==MYF&&!e.crash);
 if(ds.length){ds.forEach(d=>{d.droneTarget={x:cl(x,50,W-50),y:cl(y,50,W-50)}});fx(x,y,10);return}
 _order(x,y);
};

const _hudDrone=hud;
hud=function(){
 _hudDrone();
 const fac=sel.find(e=>e.k=='drone'&&e.f==MYF&&!e.site),old=$('x_drone');
 if(!old){const b=document.createElement('button');b.id='x_drone';b.onclick=()=>launchDrone(sel.find(e=>e.k=='drone'&&e.f==MYF&&!e.site));$('btns').appendChild(b)}
 const b=$('x_drone'),d=sel.find(e=>e.t=='drone'&&e.f==MYF),f=fac||sel.find(e=>e.k=='drone'&&e.f==MYF);
 b.style.display=f&&!d?'':'none';b.textContent='Launch Drone '+DRONE_COST;b.disabled=!f||F[MYF].oil<DRONE_COST||!!E.find(e=>e.t=='drone'&&e.f==MYF);
 if(d)$('info').innerHTML='Strike Drone<br>Flight '+Math.max(0,d.flight||0).toFixed(1)+'s<br>Right-click: fly to point'+(d.crash?'<br>Impact run':'');
};

/* ---------- rig names + labels ---------- */
['Bir Nafit','Bir Zayt','Ain Dhahab','Bir Sakhr','Umm Naft','Bir Hamra','Bir Salam','Ain Qatran','Bir Jabal','Bir Rimal','Jazirat Nafit I','Jazirat Nafit II'].forEach((n,i)=>{if(rigs[i])rigs[i].name=n});
tag=function(g,e){const r=e.t=='rig',x=r?e.x-26:e.isHQ?e.x-34:e.kx+2,y=r?e.y+38:e.isHQ?e.y+40:e.ky+81;g.font='bold 11px "Courier New",monospace';g.textAlign='left';const w=g.measureText(e.name).width;g.fillStyle='rgba(10,14,9,.7)';g.fillRect(x-2,y-10,w+6,14);g.fillStyle=r?'#e8b04a':'#e8d9a8';g.fillText(e.name,x+1,y+1);g.font='10px sans-serif'};

/* ---------- faster pathfinding (binary heap) ---------- */
route=function(a,b){const D=new Map([[a,0]]),pv=new Map(),H=[[0,a]],dn=new Set();
 const push=x=>{H.push(x);let i=H.length-1;while(i>0){const p=(i-1)>>1;if(H[p][0]<=H[i][0])break;[H[p],H[i]]=[H[i],H[p]];i=p}},
 pop=()=>{const t=H[0],l=H.pop();if(H.length){H[0]=l;let i=0;for(;;){let m=i;const c1=2*i+1,c2=c1+1;if(c1<H.length&&H[c1][0]<H[m][0])m=c1;if(c2<H.length&&H[c2][0]<H[m][0])m=c2;if(m==i)break;[H[m],H[i]]=[H[i],H[m]];i=m}}return t};
 while(H.length){const [d0,u]=pop();if(dn.has(u))continue;dn.add(u);if(u==b)break;for(const e of u.a){if((e.br&&e.br.hp<=0)||e.cut)continue;const d=d0+e.w;if(!D.has(e.n)||d<D.get(e.n)){D.set(e.n,d);pv.set(e.n,u);push([d,e.n])}}}
 if(!dn.has(b))return null;const r=[];for(let u=b;u!=a;u=pv.get(u))r.unshift(u);return r};

/* ---------- sound (synthesized) ---------- */
addEventListener('pointerdown',()=>{if(!XT.ac){XT.ac=new(window.AudioContext||window.webkitAudioContext)()}XT.ac.resume()});
function sfx(k,x,y){const a=XT.ac;if(!a||XT.mute||T-(XT['s'+k]||-9)<.06)return;if(x!=null&&vi(MYF,x,y)<1)return;XT['s'+k]=T;
 const d=k=='boom'?.5:.12,n=a.sampleRate*d|0,b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);
 for(let i=0;i<n;i++)c[i]=(Math.random()*2-1)*Math.pow(1-i/n,k=='boom'?2:4);
 const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();f.type='lowpass';f.frequency.value=k=='boom'?500:2200;g.gain.value=k=='boom'?.5:.15;
 s.buffer=b;s.connect(f);f.connect(g);g.connect(a.destination);s.start()}
function ambient(){const a=XT.ac;if(!a)return;if(!XT.amb){const n=a.sampleRate*2|0,b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=Math.random()*2-1;
  const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=b;s.loop=true;f.type='lowpass';f.frequency.value=900;g.gain.value=0;s.connect(f);f.connect(g);g.connect(a.destination);s.start();XT.amb={g}}
 XT.amb.g.gain.value=XT.mute?0:.05*Math.min(1,WX.rain+WX.sand+WX.fog*.5)}
const _fire=fire;fire=function(u,t,s,a){sfx('shot',u.x,u.y);_fire(u,t,s,a)};
const _impact=impact;impact=function(p){if(p.spl)sfx('boom',p.tx,p.ty);_impact(p)};
const _kill=kill;kill=function(e,q){if(!q&&!e.dead)sfx('boom',e.x,e.y);_kill(e,q)};

/* ---------- under-attack alerts + armor upgrade ---------- */
const _hurt=hurt;hurt=function(e,d){if(e.f==MYF&&(e.u||e.def)&&e.hp>0&&T-XT.al>6){XT.al=T;XT.pings.push({x:e.x,y:e.y,t:T});say((e.u?ST[e.t].n:DEF[e.k].n)+' under attack!')}
 if(e.f==MYF&&e.u)d*=1-.15*XT.arm;_hurt(e,d)};
const _mini=mini;mini=function(){_mini();for(const p of XT.pings){const a=1-(T-p.t)/4;if(a<=0)continue;MX.strokeStyle='rgba(255,80,60,'+a+')';MX.lineWidth=2;MX.beginPath();MX.arc(p.x*150/W,p.y*150/W,3+(T-p.t)*6,0,6.28);MX.stroke()}XT.pings=XT.pings.filter(p=>T-p.t<4)};

/* ---------- rally points + attack-move (Ctrl + right click) ---------- */
C.addEventListener('contextmenu',e=>{if(!e.ctrlKey||placing)return;const p=w2(e.clientX,e.clientY),hq=sel.find(s=>s.f==MYF&&s.t=='town'),us=sel.filter(u=>u.u&&u.f==MYF&&u.t!='truck');
 if(hq){e.preventDefault();e.stopImmediatePropagation();hq.rally={x:p.x,y:p.y};say('Rally point set');return}
 if(us.length){e.preventDefault();e.stopImmediatePropagation();us.forEach(u=>{cmd(u);u.am={x:p.x,y:p.y};go(u,p.x,p.y,20)});say('Attack-move')}},true);
const _prod=prod;prod=function(e,dt){const n=E.length;_prod(e,dt);if(e.rally&&E.length>n){const u=E[E.length-1];if(u.u)go(u,e.rally.x+rnd(-30,30),e.rally.y+rnd(-30,30))}};

/* ---------- AI builds defences, uses its silo ---------- */
const _ai=aiThink;aiThink=function(f){const me=F[f],hq=hqs[f],ptw=ALLT.find(x=>x.f==f),mine=E.filter(e=>e.f==f&&e.def).length;
 if(ptw&&mine<10&&!E.some(u=>u.f==f&&u.t=='eng')&&!ptw.q.includes('eng')&&Math.random()<.25)queue(ptw,'eng');
 for(const u of E){if(u.f!=f||u.t!='eng'||u.act||u.path.length||u.dead||mine>=10||Math.random()>.5)continue;
  const ks=me.oil>700&&!E.some(e=>e.f==f&&e.k=='silo')?['silo']:['mg','at','sand','mortar','bunker','cram'],k=ks[rnd(0,ks.length)|0],d=DEF[k];
  if(me.oil>=d.cost+120){const a=rnd(0,6.28),r=rnd(70,170),c=placeCheck(k,hq.x+Math.cos(a)*r,hq.y+Math.sin(a)*r);if(c.ok){me.oil-=d.cost;const st=mkDef(k,f,c.x,c.y,0,1);u.act='build';u.at=st;u.w=0}}}
 const sl=E.find(e=>e.f==f&&e.k=='silo'&&!e.site&&e.cd<=0);if(sl){const g=[...me.gh.values()].find(g=>g.f>=0&&g.f!=f&&(g.t=='town'||g.u)&&hyp(g.x-sl.x,g.y-sl.y)<DEF.silo.rng);if(g)launchBarrage(sl,g.x,g.y)}
 _ai(f)};

/* ---------- per-tick extras: income, alerts, attack-move ---------- */
function xtick(dt){
 for(const f of F)if(f.alive)f.oil+=rigs.filter(r=>r.f==f.i&&Math.abs(r.y-RY)<80).length*1.5*dt;
 F[MYF].oil+=rigs.filter(r=>r.f==MYF).length*.5*XT.pump*dt;
 for(const r of rigs){if(r.xf===undefined)r.xf=r.f;if(r.xf!=r.f&&r.xf==MYF){say('Oil rig lost: '+(r.name||'rig'));XT.pings.push({x:r.x,y:r.y,t:T})}r.xf=r.f}
 for(const u of E)if(u.u&&u.am&&!u.dead){if(u.ft&&u.ft.hp>0&&!u.tgt)u.path=[];else if(!u.path.length&&!u.act){if(hyp(u.am.x-u.x,u.am.y-u.y)<40)u.am=null;else go(u,u.am.x,u.am.y,20)}}
 ambient()}
function xpan(dt){const sp=700*dt/cam.z;let mx=0,my=0;if(keys.a||keys.arrowleft)mx=-1;if(keys.d||keys.arrowright)mx=1;if(keys.w||keys.arrowup)my=-1;if(keys.s||keys.arrowdown)my=1;
 cam.x=cl(cam.x+mx*sp,-200,W-C.width/cam.z+200);cam.y=cl(cam.y+my*sp,-200,W-C.height/cam.z+200)}
const _upd=update;update=function(dt){if(XT.pause){xpan(dt);return}for(let i=0;i<XT.speed;i++){_upd(dt);xtick(dt)}};

/* ---------- HUD: speed/pause readout, upgrades, production progress, help ---------- */
const xt=document.createElement('div');xt.style.cssText='position:fixed;right:12px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:3;pointer-events:none;color:#e8b04a;font-size:13px;text-shadow:0 0 3px #000';document.body.appendChild(xt);
const ub=(id,fn)=>{const b=document.createElement('button');b.id=id;b.onclick=fn;$('btns').appendChild(b)};
ub('x_arm',()=>{const c=300*(XT.arm+1);if(XT.arm<3&&F[MYF].oil>=c){F[MYF].oil-=c;XT.arm++;say('Armor upgraded')}});
ub('x_pump',()=>{const c=250*(XT.pump+1);if(XT.pump<3&&F[MYF].oil>=c){F[MYF].oil-=c;XT.pump++;say('Pumps upgraded')}});
const _hud=hud;hud=function(){_hud();xt.textContent=(XT.pause?'PAUSED   ':'')+XT.speed+'x   P pause  [ ] speed  M mute  ? help';
 const a=$('x_arm'),p=$('x_pump'),ca=300*(XT.arm+1),cp=250*(XT.pump+1);a.textContent=XT.arm<3?'Armor L'+(XT.arm+1)+' '+ca:'Armor MAX';a.disabled=XT.arm>=3||F[MYF].oil<ca;p.textContent=XT.pump<3?'Pumps L'+(XT.pump+1)+' '+cp:'Pumps MAX';p.disabled=XT.pump>=3||F[MYF].oil<cp;
 const s1=sel[0];if(s1&&s1.t=='town'&&s1.f==MYF)$('info').innerHTML+=(s1.q&&s1.q.length?'<br>Building '+ST[s1.q[0]].n+' '+(s1.qt/4*100|0)+'%':'')+(s1.rally?'<br>Rally set':'<br>Ctrl+RMB: set rally point')};
const hp=document.createElement('div');hp.style.cssText='position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.78);z-index:6;white-space:pre;font-size:14px;line-height:1.7;cursor:pointer';
hp.textContent=`OIL FRONT - CONTROLS

Left drag: select      Right click: move / attack / capture
Ctrl + right click: attack-move (units) or rally point (HQ)
Q F E R T G: build units (HQ selected)      . : select idle units
B build menu   C cut road   V trench (drag freehand curves; infantry can cross)   H deploy HQ   Space: jump to HQ
Ctrl+1-5: save group, 1-5: recall group
P pause    [ ] game speed    M mute    ? or F1: this help

(click to close)`;hp.onclick=()=>hp.style.display='none';document.body.appendChild(hp);
addEventListener('keydown',e=>{const k=e.key;
 if(k=='p'||k=='P')XT.pause^=1;else if(k=='[')XT.speed=Math.max(1,XT.speed-1);else if(k==']')XT.speed=Math.min(3,XT.speed+1);else if(k=='m'||k=='M')XT.mute^=1;
 else if(k=='?'||k=='F1'){e.preventDefault();hp.style.display=hp.style.display=='flex'?'none':'flex'}
 else if(k=='.'){const idle=E.filter(u=>u.u&&u.f==MYF&&u.t!='truck'&&!u.path.length&&!u.act&&!u.tgt);sel=idle;say(idle.length+' idle unit'+(idle.length==1?'':'s'))}});

/* ---------- skirmish options on the map menu ---------- */
{const p=document.querySelector('#mapMenu .panel'),h=document.createElement('div');h.style.cssText='margin:0 0 12px;font-size:12px;color:#b9c5ad;line-height:1.9';
 h.innerHTML='AI factions <select id="xAI"><option>4</option><option>3</option><option>2</option><option>1</option></select> &nbsp; Start oil <select id="xOil"><option>260</option><option>600</option><option>1000</option></select><br>Seed '+GAME_SEED+' (add ?seed=N to the URL to replay it)';
 p.insertBefore(h,p.querySelector('button'))}
document.querySelectorAll('#mapMenu button').forEach(b=>b.addEventListener('click',()=>{const n=+$('xAI').value,o=+$('xOil').value;F.forEach(f=>f.oil=o);for(let i=n+1;i<5;i++)elim(i);say('Skirmish: '+n+' AI, '+o+' oil. Press ? for controls')}));
