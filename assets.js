/* ===== assets_fx.js: visual intensity upgrade. Load AFTER assets.js. =====
   1. Enhanced finish pass (crisp dark outline, top-lit bevel, contrast + saturation). Toggle with FX.enhance.
   2. "Dmg" variants (burn scorch, embers, cracks, flames and smoke) for vehicles and buildings.
   3. Animated fire, big blasts with shockwave, smoke puffs, muzzle flashes, tracer, track and rotor frames. */
const FX={enhance:true};

const finish2=(cv,seed)=>{const g=cv.getContext('2d'),w=cv.width,h=cv.height,im=g.getImageData(0,0,w,h),d=im.data,o=new Uint8ClampedArray(d),
 al=(x,y)=>x<0||y<0||x>=w||y>=h?0:d[(y*w+x)*4+3];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<200)continue;
  const edge=al(x-1,y)<200||al(x+1,y)<200||al(x,y-1)<200||al(x,y+1)<200;let f=1;
  if(edge)f=.3;
  else{const r=hrnd(x,y,seed);f=r<.07?.86:r>.95?1.1:1;
   if(al(x,y-2)<200)f*=1.22;if(al(x-2,y)<200)f*=1.1;if(al(x,y+2)<200)f*=.78;if(al(x+2,y)<200)f*=.86}
  const L=.3*d[i]+.59*d[i+1]+.11*d[i+2];
  for(let k=0;k<3;k++){let v=L+(d[i+k]-L)*1.18;v=(v-118)*1.12+118;o[i+k]=v*f}}
 im.data.set(o);g.putImageData(im,0,0)};

/* Assets.get with switchable finish and a stronger shadow */
Assets.get=function(name,team=0){const s=S[name],k=(FX.enhance?'e:':'')+name+(s.team?team:'');if(this.cache[k])return this.cache[k];
 const sp=document.createElement('canvas');sp.width=s.w;sp.height=s.h;const t=TEAMS[team][1];s.draw(sp.getContext('2d'),t,shade(t,.65));
 if(s.hr&&!s.raw)(FX.enhance?finish2:finish)(sp,name.length*7+team);
 const cv=document.createElement('canvas');cv.width=s.w;cv.height=s.h;const g=cv.getContext('2d');
 if(s.shadow){const m=document.createElement('canvas');m.width=s.w;m.height=s.h;const q=m.getContext('2d');q.drawImage(sp,0,0);q.globalCompositeOperation='source-in';q.fillStyle='rgba(0,0,0,'+(FX.enhance?.5:.35)+')';q.fillRect(0,0,s.w,s.h);g.drawImage(m,-s.shadow,s.shadow)}
 g.drawImage(sp,0,0);return this.cache[k]=cv};

/* ---- Damaged ("Dmg") variants ---- */
const flameS=(c,x,y,hg,s)=>{for(let j=0;j<hg;j++){const hw=Math.max(0,Math.round((hg-j)*.32*(.8+hrnd(j,s,1)*.4))),q=j/hg,col=q<.3?'#fff6d0':q<.55?PAL.flash:q<.85?PAL.fire:'#b8431c';rect(c,x-hw,y-j,hw*2+1,1,col)}
 for(let k=0;k<3;k++)disc(c,x+(k&1)-1,Math.max(2,y-hg-2-k*3),1+(k>>1),'rgba(52,48,44,'+(.6-k*.13).toFixed(2)+')')};
const dmgOf=(id,seed,amt,fl)=>{const b=S[id];if(!b)return;S[id+'Dmg']={...b,draw(c,t,td){b.draw(c,t,td);const w=b.w,h=b.h,im=c.getImageData(0,0,w,h),d=im.data,alive=(x,y)=>d[(y*w+x)*4+3]>20;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<20)continue;const n=vn(x,y,5,seed)*.6+vn(x,y,2,seed+4)*.4;if(n<amt){const k=.3+.3*hrnd(x,y,seed+2);d[i]*=k;d[i+1]*=k;d[i+2]*=k}}
  c.putImageData(im,0,0);
  for(let k=0;k<Math.round(w*h/80);k++){const x=hrnd(k,seed,31)*w|0,y=hrnd(k,seed,32)*h|0;if(!alive(x,y))continue;const r=hrnd(k,seed,33);if(r<.5)dot(c,x,y,r<.2?PAL.flash:PAL.fire);else line(c,x,y,x+2,y+(r<.75?1:-1),'#15110d')}
  for(let k=0;k<fl;k++){let x,y,n=0;do{x=Math.round(w*(.25+.5*hrnd(k,seed,41+n)));y=Math.round(h*(.45+.4*hrnd(k,seed,51+n)));n++}while(n<8&&!alive(x,y));flameS(c,x,y,Math.max(4,Math.round(h*.22)),seed+k)}}}};
['fuelTruck','scoutCar','engineerTruck','tankHull','rocketArtillery','mcv','bridgeLayer'].forEach((id,i)=>dmgOf(id,200+i*7,.38,1));
dmgOf('tankTurret',214,.38,0);
['bld0','bld1','bld2','bld3','bld4','bld5','bld6','bldDepot','cap0','cap1','cap2','cap3','capStep','capDome','capRound'].forEach((id,i)=>dmgOf(id,300+i*11,.3,2));
['palace','bunker','oilRig','missileSilo'].forEach((id,i)=>dmgOf(id,400+i*17,.3,4));
dmgOf('hq',480,.3,3);dmgOf('watchtower',481,.3,1);dmgOf('cramBase',482,.3,1);

/* ---- Fire (6 looping frames, 16x24) ---- */
for(let f=0;f<6;f++)S['fire'+f]={w:16,h:24,draw(c){
 for(let y=0;y<24;y++){const j=23-y,t=j/22,hw=6.5*Math.pow(1-t,.8),cx=8+(vn(j,f*5,6,3)-.5)*5*t;
  for(let x=0;x<16;x++){const d=Math.abs(x+.5-cx),n=hrnd(x,j,f)*.35+vn(x,j+f*5,4,9)*.65;
   if(d<hw*(.7+.6*n)&&j<22*(.75+.25*hrnd(x>>1,0,f))){const q=d/Math.max(hw,1)+t*.6;dot(c,x,y,q<.25?'#fff6d0':q<.5?PAL.flash:q<.8?PAL.fire:'#b8431c')}}}}};

/* ---- Smoke puffs (4 frames, 16x16, grow and fade) ---- */
for(let f=0;f<4;f++)S['smokeBig'+f]={w:16,h:16,draw(c){const r=3+f*1.4,a=(.85-f*.18).toFixed(2);
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=x+.5-8,dy=y+.5-8,d=Math.hypot(dx,dy)+(hrnd(x,y,f+30)-.5)*2.6;
  if(d<r)dot(c,x,y,(dx-dy>0&&d>r*.35)?'rgba(124,116,106,'+a+')':'rgba(70,64,58,'+a+')')}}};

/* ---- Big blast (10 frames, 48x48) with shockwave ring, fireball, smoke, sparks and debris ---- */
const blast=(c,p,f)=>{const cx=24,cy=24,rf=p<.6?16*Math.sin(Math.min(1,p*1.7)*Math.PI*.8)+3:0,rs=6+17*Math.sqrt(p),rr=5+19*p;
 for(let y=0;y<48;y++)for(let x=0;x<48;x++){const dx=x+.5-cx,dy=y+.5-cy,h=Math.hypot(dx,dy),d=h+(hrnd(x,y,f)-.5)*4,ch=(x+y)&1;
  if(d<rs&&p>.15&&!(p>.65&&ch&&hrnd(x,y,f+9)<(p-.55)*1.8))dot(c,x,y,d<rs*.55?(hrnd(x,y,f+3)<.5?'#3a342e':'#4c443b'):(dx-dy>0?'#7a6a56':'#5e5143'));
  if(p<.7&&Math.abs(h-rr)<1.4)dot(c,x,y,'rgba(255,235,190,'+(.75*(1-p/.7)).toFixed(2)+')');
  if(d<rf){const q=d/rf;dot(c,x,y,q<.3?'#fff6d0':q<.55?PAL.flash:q<.8?PAL.fire:'#b8431c')}
  else if(rf>0&&d<rf+4&&ch&&hrnd(x,y,f+7)<.5)dot(c,x,y,PAL.flash)}
 if(p<.8)for(let i=0;i<18;i++){const a=hrnd(i,1,1)*6.283,r=4+hrnd(i,3,2)*20*Math.min(1,p*1.6),x=Math.round(cx+Math.cos(a)*r),y=Math.round(cy+Math.sin(a)*r);
  dot(c,x,y,i&1?PAL.flash:PAL.fire);dot(c,Math.round(cx+Math.cos(a)*(r-2)),Math.round(cy+Math.sin(a)*(r-2)),'rgba(230,126,34,.6)')}
 if(p>.1)for(let i=0;i<8;i++){const a=hrnd(i,6,3)*6.283,r=3+hrnd(i,5,3)*17*Math.min(1,p*1.3);rect(c,Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),2,2,i&1?'#2a221b':PAL.concLo)}};
for(let f=0;f<10;f++)S['blast'+f]={w:48,h:48,draw(c){blast(c,f/9,f)}};

/* ---- Muzzle flashes (3 frames, barrel tip at bottom centre, flash points up) ---- */
for(let f=0;f<3;f++)S['muzzle'+f]={w:16,h:16,draw(c){const s=[1,.75,.5][f],O=[8,15];
 for(const [a,l] of [[-1.571,14],[-1.571-.6,8],[-1.571+.6,8],[-1.571-1.2,5],[-1.571+1.2,5]])line(c,O[0],O[1],Math.round(O[0]+Math.cos(a)*l*s),Math.round(O[1]+Math.sin(a)*l*s),PAL.flash);
 disc(c,8,13,Math.max(1,Math.round(3*s)),'#fff6d0');disc(c,8,13,1,'#ffffff')}};
S.tracer={w:4,h:14,draw(c){for(let j=0;j<14;j++)rect(c,1,j,2,1,'rgba(255,220,120,'+(j/14).toFixed(2)+')');rect(c,1,12,2,2,'#fff6d0')}};

/* ---- Tank track phase frame (alternate with tankHull for rolling tracks) ---- */
{const b=S.tankHull;S.tankHullT1={...b,draw(c,t,td){b.draw(c,t,td);for(const x of [4,22]){rect(c,x,2,6,28,'#1b1c1d');for(let y=3;y<30;y+=2)rect(c,x,y,6,1,'#34363a');rect(c,x+(x<10?5:0),2,1,28,'#4a4d50')}camo(c,4,4,2,24,4);camo(c,26,4,2,24,4)}}}

/* ---- Helicopter rotor spin frames (4) ---- */
for(let k=0;k<4;k++)S['heliRotor'+k]={w:24,h:24,draw(c){disc(c,12,12,10,'rgba(255,255,255,.05)');
 for(const a of [k*.4,k*.4+1.571])line(c,Math.round(12-Math.cos(a)*10),Math.round(12-Math.sin(a)*10),Math.round(12+Math.cos(a)*10),Math.round(12+Math.sin(a)*10),'rgba(25,25,25,.6)');disc(c,12,12,1,PAL.lo)}};
