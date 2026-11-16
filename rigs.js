/* rigs.js - load AFTER extras.js and BEFORE ui.js. Per-rig pump upgrades + extra fuel trucks (max 5 per rig). Replaces the global Pumps upgrade. */
const RG={pump:150,truck:100,maxPump:3,maxEx:4};
const selRig=()=>sel.find(e=>e.t=='rig'&&e.f==0);
{const old=$('x_pump');if(old)old.style.display='none'}

/* buttons (shown only while one of your rigs is selected) */
const rb=(id,fn)=>{const b=document.createElement('button');b.id=id;b.style.display='none';b.onclick=fn;$('btns').appendChild(b)};
rb('x_rpump',()=>{const r=selRig();if(!r)return;const l=r.pl|0,c=RG.pump*(l+1);if(l<RG.maxPump&&F[0].oil>=c){F[0].oil-=c;r.pl=l+1;say((r.name||'Rig')+' pump upgraded')}});
rb('x_rtruck',()=>{const r=selRig();if(!r)return;const n=r.ex|0,c=RG.truck+50*n;if(n<RG.maxEx&&F[0].oil>=c){F[0].oil-=c;r.ex=n+1;say((r.name||'Rig')+' now has '+(n+2)+' trucks')}});

/* per-rig income + extra truck spawning */
function rtick(dt){for(const r of rigs){if(r.po===undefined)r.po=r.f;if(r.po!==r.f){r.pl=0;r.ex=0;r.sl=[];r.po=r.f}
 if(r.f==0)F[0].oil+=(r.pl|0)*dt;
 if(r.f>=0&&F[r.f].alive&&r.ex){r.sl=r.sl||[];while(r.sl.length<r.ex)r.sl.push({tk:null,tm:2+r.sl.length*1.5});
  for(const s of r.sl)if(!s.tk){s.tm-=dt;if(s.tm<=0){const t=unit('truck',r.f,r.x,r.y);t.cur=r.nd;t.rt=[];t.src=s;s.tk=t;s.tm=6}}}}}
const _u=update;update=function(dt){_u(dt);if(!XT.pause)for(let i=0;i<XT.speed;i++)rtick(dt)};

/* map label shows pump level + truck count */
const _tag=tag;tag=function(g,e){if(e.t=='rig'&&e.f==0&&(e.pl||e.ex)){const n=e.name;e.name=n+'  P'+(e.pl|0)+' T'+(1+(e.ex|0));_tag(g,e);e.name=n}else _tag(g,e)};

/* HUD */
const _hr=hud;hud=function(){_hr();const r=selRig(),p=$('x_rpump'),t=$('x_rtruck');p.style.display=t.style.display=r?'':'none';
 if(r){const l=r.pl|0,n=r.ex|0,cp=RG.pump*(l+1),ct=RG.truck+50*n;
  p.textContent=l<RG.maxPump?'Pump L'+(l+1)+' '+cp:'Pump MAX';p.disabled=l>=RG.maxPump||F[0].oil<cp;
  t.textContent=n<RG.maxEx?'Truck '+(n+2)+'/5 '+ct:'Trucks 5/5';t.disabled=n>=RG.maxEx||F[0].oil<ct;
  $('info').innerHTML=(r.name||'Oil rig')+'<br>Pump level '+l+'/'+RG.maxPump+'<br>Trucks '+(1+n)+'/5<br>Bonus +'+l+' oil/s'}};
