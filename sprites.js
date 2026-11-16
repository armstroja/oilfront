/* ================= ASSETS ================= */
const PAL={ground:['#85744a','#a3834a','#b98f50','#c9a05a','#d6b06a'],road:'#7b8284',roadHi:'#9aa09f',conc:'#b0a894',concLo:'#8a8372',concDk:'#9d9582',tank:'#d8d6cc',water:'#2d5568',deck:'#9a9c96',
 body:'#46515b',hi:'#74818d',lo:'#2f373f',tire:'#23282d',drab:'#6b6f4d',fire:'#e67e22',flash:'#f5d76e',sky:'#5a7f90',dark:'#3a4048',bag:'#b59a62',bagLo:'#8d7545'};
const TEAMS=[['Player (Blue)','#2b7de9'],['AI 1 (Red)','#d9383a'],['AI 2 (Yellow)','#e5b822'],['AI 3 (Green)','#2ea85c'],['AI 4 (Purple)','#8e44ad']];
const shade=(h,f)=>{const n=parseInt(h.slice(1),16),k=v=>Math.max(0,Math.min(255,Math.round(v*f)));return '#'+[n>>16,n>>8&255,n&255].map(v=>k(v).toString(16).padStart(2,'0')).join('')};
const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
const dot=(c,x,y,col)=>rect(c,x,y,1,1,col);
const hrnd=(x,y,s=0)=>{let h=(x*374761393+y*668265263+s*2147483647)>>>0;h=((h^(h>>>13))*1274126177)>>>0;return((h^(h>>>16))>>>0)/4294967295};
const line=(c,a,b,x,y,col)=>{let dx=Math.abs(x-a),dy=-Math.abs(y-b),sx=a<x?1:-1,sy=b<y?1:-1,e=dx+dy;for(;;){dot(c,a,b,col);if(a==x&&b==y)break;const e2=2*e;if(e2>=dy){e+=dy;a+=sx}if(e2<=dx){e+=dx;b+=sy}}};
const disc=(c,cx,cy,r,col)=>{c.fillStyle=col;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r*.5)c.fillRect(cx+x,cy+y,1,1)};
const vn=(x,y,s,k)=>{const gx=x/s,gy=y/s,ix=Math.floor(gx),iy=Math.floor(gy);let fx=gx-ix,fy=gy-iy;fx*=fx*(3-2*fx);fy*=fy*(3-2*fy);const a=hrnd(ix,iy,k),b=hrnd(ix+1,iy,k),d=hrnd(ix,iy+1,k),e=hrnd(ix+1,iy+1,k);return a+(b-a)*fx+(d-a)*fy+(a-b-d+e)*fx*fy};
const Terrain={};

const S={};
S.lawn={w:16,h:16,draw(c){rect(c,0,0,16,16,'#6f7a45');for(let y=0;y<16;y++)for(let x=0;x<16;x++){const r=hrnd(x,y,11);if(r<.1)dot(c,x,y,'#5f6b3a');else if(r>.96)dot(c,x,y,'#85925a')}disc(c,4,5,1,'#3f4e2a');disc(c,11,11,1,'#3f4e2a')}};
S.rock={w:16,h:16,shadow:2,draw(c){for(const [x,y,w,h] of [[4,6,5,4],[8,4,4,4],[6,9,6,3]]){rect(c,x,y,w,h,'#7a5a37');rect(c,x,y,w-1,1,'#9a7448');rect(c,x+w-1,y,1,h,'#5d4429')}}};
S.heliTrans={w:24,h:24,team:1,shadow:5,draw(c,t){rect(c,11,17,2,5,PAL.lo);rect(c,9,21,6,1,PAL.lo);rect(c,8,3,8,15,PAL.body);rect(c,9,2,6,2,PAL.sky);rect(c,8,3,1,15,PAL.hi);rect(c,6,8,2,3,PAL.lo);rect(c,16,8,2,3,PAL.lo);rect(c,8,12,8,2,t);rect(c,10,15,4,2,PAL.lo)}};
S.heliRotor={w:24,h:24,draw(c){disc(c,12,12,10,'rgba(255,255,255,.06)');line(c,2,12,22,12,'rgba(25,25,25,.55)');line(c,12,2,12,22,'rgba(25,25,25,.55)');disc(c,12,12,1,PAL.lo)}};
const wreck=(c,x0,y0,w,h,sd)=>{disc(c,8,8,7,'rgba(0,0,0,.25)');for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const r=hrnd(x,y,sd);if(r<.88)dot(c,x,y,r<.3?'#1f1b18':r<.6?'#2a2622':'#3a332c')}rect(c,x0+w-5,y0+1,4,4,'#14110a');dot(c,x0+2,y0+3,PAL.fire);dot(c,x0+5,y0+8,PAL.fire);dot(c,x0+5,y0+7,PAL.flash);for(let i=0;i<5;i++)if(((i+sd)&1)==0)dot(c,4+(hrnd(i,sd,1)*8|0),(hrnd(i,sd,2)*3|0),'#55504a')};
S.wreckTank={w:16,h:16,shadow:1,draw(c){wreck(c,3,3,10,11,1)}};
S.wreckTruck={w:16,h:16,shadow:1,draw(c){wreck(c,4,2,8,13,2)}};
const bag=(c,x,y,w,h)=>{rect(c,x,y,w,h,PAL.bag);rect(c,x,y,w,1,'#c9ad73');for(let i=0;i<w;i+=4)rect(c,x+i,y,1,h,PAL.bagLo);rect(c,x,y+(h>>1),w,1,PAL.bagLo)};
S.bunkerRubble={w:32,h:32,draw(c){for(let y=0;y<32;y++)for(let x=0;x<32;x++){const d=Math.hypot(x-16,y-16)+(hrnd(x,y,5)-.5)*6;if(d<12)dot(c,x,y,'#2f2720');else if(d<15&&((x+y)&1)==0)dot(c,x,y,'#4a3b2c')}
 for(let i=0;i<34;i++){const x=4+(hrnd(i,1,7)*22|0),y=4+(hrnd(i,2,7)*22|0),w=2+(hrnd(i,3,7)*4|0),h=2+(hrnd(i,4,7)*3|0),k=hrnd(i,5,7);rect(c,x,y,w,h,k<.4?PAL.concLo:k<.75?PAL.conc:PAL.concDk);rect(c,x,y,w,1,shade(PAL.conc,1.1))}dot(c,12,14,PAL.fire);dot(c,19,18,PAL.fire);dot(c,19,17,PAL.flash)}};
S.watchtower={w:16,h:16,team:1,shadow:3,draw(c,t){rect(c,2,2,12,12,'#6f6a55');rect(c,3,3,10,10,'#8a8372');line(c,2,2,13,13,'#6f6a55');line(c,13,2,2,13,'#6f6a55');rect(c,6,6,4,4,'#9d9582');dot(c,8,8,t);rect(c,13,0,1,4,PAL.dark);rect(c,14,0,2,2,t)}};
S.checkpoint={w:16,h:16,team:1,shadow:1,draw(c,t){rect(c,10,2,5,5,PAL.concLo);rect(c,11,3,3,3,t);rect(c,7,0,2,16,'#d8d6cc');for(let y=0;y<16;y+=4)rect(c,7,y,2,2,'#c0392b');rect(c,6,7,4,2,PAL.dark)}};
S.sandbagStraight={w:16,h:16,shadow:1,draw(c){bag(c,0,6,16,4)}};
S.sandbagCorner={w:16,h:16,shadow:1,draw(c){bag(c,6,6,10,4);bag(c,6,10,4,6)}};
S.tankTraps={w:16,h:16,shadow:1,draw(c){for(const [x,y] of [[4,4],[11,6],[6,11],[12,12]]){line(c,x-2,y-2,x+2,y+2,'#7a7f84');line(c,x-2,y+2,x+2,y-2,'#7a7f84');rect(c,x-2,y,5,1,'#4b4f54')}}};
S.emplacement={w:16,h:16,team:1,shadow:1,draw(c,t){disc(c,8,8,7,PAL.bagLo);disc(c,8,8,6,PAL.bag);disc(c,8,8,4,'#5a5340');for(let a=0;a<6.28;a+=.55)dot(c,Math.round(8+Math.cos(a)*6.5),Math.round(8+Math.sin(a)*6.5),PAL.bagLo);rect(c,7,13,2,1,t)}};
S.mortarPit={w:16,h:16,team:1,shadow:1,draw(c,t){S.emplacement.draw(c,t);rect(c,7,5,2,6,PAL.lo);rect(c,6,10,4,2,PAL.hi);dot(c,8,5,PAL.hi)}};
S.cramBase={w:16,h:16,team:1,shadow:1,draw(c,t){rect(c,1,1,14,14,PAL.concLo);rect(c,2,2,12,12,PAL.conc);rect(c,2,11,5,3,PAL.body);rect(c,9,11,5,3,PAL.body);disc(c,8,8,3,PAL.concDk);for(const [x,y] of [[2,2],[13,2]])dot(c,x,y,t);rect(c,7,13,2,1,t)}};
S.atGun={w:16,h:16,team:1,draw(c,t){rect(c,7,0,2,8,PAL.lo);rect(c,6,0,4,1,PAL.hi);dot(c,7,2,PAL.hi);rect(c,3,8,1,3,PAL.tire);rect(c,12,8,1,3,PAL.tire);rect(c,7,9,2,4,PAL.body);rect(c,4,7,8,2,PAL.hi);rect(c,5,8,6,1,t)}};
S.mgGun={w:16,h:16,team:1,draw(c,t){rect(c,7,3,2,5,PAL.lo);rect(c,6,8,4,4,PAL.body);rect(c,6,8,4,1,PAL.hi);rect(c,10,9,2,2,PAL.drab);dot(c,7,10,t);dot(c,8,10,t)}};
S.cramGun={w:16,h:16,team:1,draw(c,t){disc(c,8,9,4,'#e6e4da');dot(c,7,8,'#ffffff');rect(c,5,5,6,2,PAL.body);rect(c,6,1,4,5,PAL.lo);for(let y=1;y<6;y+=2)dot(c,7,y,PAL.hi);rect(c,6,0,4,1,PAL.hi);dot(c,8,12,t)}};
S.rocket={w:16,h:16,team:1,shadow:2,draw(c,t){rect(c,7,12,2,2,PAL.flash);dot(c,7,14,PAL.fire);dot(c,8,14,PAL.fire);dot(c,7,15,'#b8431c');rect(c,7,5,2,7,'#c8c8c0');rect(c,8,5,1,7,'#9a9a92');rect(c,6,10,1,2,PAL.lo);rect(c,9,10,1,2,PAL.lo);rect(c,7,2,2,3,t)}};
S.smokePuff={w:8,h:8,draw(c){for(let y=0;y<8;y++)for(let x=0;x<8;x++){const d=Math.hypot(x+.5-4,y+.5-4);if(d<3.2&&(((x+y)&1)==0||d<2))dot(c,x,y,d<2?'#8a8378':'#5c5750')}}};
S.scorch={w:32,h:32,draw(c){for(let y=0;y<32;y++)for(let x=0;x<32;x++){const d=Math.hypot(x+.5-16,y+.5-16)+(hrnd(x,y,5)-.5)*5;if(d<8)dot(c,x,y,'#2f2720');else if(d<13&&((x+y)&1)==0&&hrnd(x,y,6)<(13-d)/5)dot(c,x,y,'#4a3b2c')}}};
const boom=(c,p,f)=>{const cx=16,cy=16,rf=p<.75?11*Math.sin(Math.min(1,p*1.35)*Math.PI*.85)+2:0,rs=4+11*Math.sqrt(p);
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){const d=Math.hypot(x+.5-cx,y+.5-cy)+(hrnd(x,y,f)-.5)*3.5,ch=(x+y)&1;
  if(d<rs&&p>.12&&!(p>.6&&ch&&hrnd(x,y,f+9)<(p-.5)*1.6))dot(c,x,y,d<rs*.55?(hrnd(x,y,f+3)<.5?'#4a433c':'#5c5247'):(hrnd(x,y,f+4)<.5?'#6b5d4d':'#82705a'));
  if(d<rf){const q=d/rf;dot(c,x,y,q<.3?'#fff6d0':q<.55?PAL.flash:q<.8?PAL.fire:'#b8431c')}
  else if(rf>0&&d<rf+4&&ch&&hrnd(x,y,f+7)<.5)dot(c,x,y,PAL.flash)}
 if(p>.1&&p<.85)for(let i=0;i<10;i++){const a=hrnd(i,f,1)*6.283,r=rs+2+hrnd(i,f,2)*6*p;dot(c,Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r),PAL.dark)}};
for(let f=0;f<7;f++)S['explosion'+f]={w:32,h:32,draw(c){boom(c,f/6,f)}};

const roof=(c,x,y,w,h,col)=>{rect(c,x,y,w,h,shade(col,.68));rect(c,x,y,w-1,h-1,col);rect(c,x+1,y+1,w-3,h-3,shade(col,.93));for(let i=0;i<w*h/14;i++){const px=x+2+(hrnd(i,x,y)*(w-5)|0),py=y+2+(hrnd(i,y,x)*(h-5)|0);dot(c,px,py,hrnd(i,w,h)<.5?shade(col,.65):shade(col,1.2))}};
S.hq={w:48,h:48,team:1,shadow:2,draw(c,t){rect(c,1,1,46,46,PAL.concLo);rect(c,2,2,44,44,PAL.concDk);
 for(const [x,y] of [[2,2],[40,2],[2,40],[40,40]]){rect(c,x,y,6,1,t);rect(c,x,y,1,6,t)}
 roof(c,4,4,24,20,PAL.conc);rect(c,4,12,24,3,t);rect(c,10,6,6,4,PAL.sky);rect(c,20,16,4,3,PAL.dark);rect(c,6,17,3,3,PAL.concLo);
 roof(c,4,28,24,15,'#7d8186');rect(c,7,40,18,3,PAL.lo);for(let x=7;x<25;x++)if(x%4<2)dot(c,x,41,'#c9a43a');rect(c,6,31,20,1,t);rect(c,18,34,4,3,PAL.concLo);
 disc(c,38,36,8,t);disc(c,38,36,7,'#4b565e');rect(c,35,32,1,9,PAL.tank);rect(c,40,32,1,9,PAL.tank);rect(c,35,36,6,1,PAL.tank);
 disc(c,38,12,8,PAL.concLo);disc(c,38,12,6,'#c8c8c0');disc(c,38,12,4,'#a8a89e');disc(c,37,11,2,'#dcdcd2');line(c,38,12,43,7,PAL.dark);rect(c,42,6,2,2,t)}};
/* ================= ASSETS (copy this block into index.html) ================= */
const GROUND=['#85744a','#a3834a','#b98f50','#c9a05a','#d6b06a'],CAMO=['#5e5a3a','#8c7b58','#a8966c','#6b5238'];
/* material helpers */
const camo=(c,x,y,w,h,s)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){const n=vn(x+i,y+j,5,s)*.7+vn(x+i,y+j,2,s+9)*.3;dot(c,x+i,y+j,n<.33?CAMO[0]:n<.62?CAMO[1]:n<.82?CAMO[2]:CAMO[3])}};
const lit=(c,x,y,w,h)=>{rect(c,x,y,w,1,'rgba(255,245,210,.28)');rect(c,x+w-1,y,1,h,'rgba(255,245,210,.14)');rect(c,x,y,1,h,'rgba(0,0,0,.3)');rect(c,x,y+h-1,w,1,'rgba(0,0,0,.35)')};
const cyl=(c,x,y,w,h)=>{for(let i=0;i<w;i++){const t=i/(w-1);rect(c,x+i,y,1,h,t<.5?'rgba(0,0,0,'+((.5-t)*.7)+')':'rgba(255,245,210,'+((t-.5)*.4)+')')}};
const tire=(c,x,y,w,h)=>{rect(c,x,y,w,h,'#1b1c1b');for(let j=0;j<h;j+=2)rect(c,x,y+j,w,1,'#2b2c2b');rect(c,x+w-1,y,1,h,'#3a3b3a')};
const glass=(c,x,y,w,h)=>{rect(c,x,y,w,h,'#2f4552');rect(c,x,y,w,1,'#6f95a3');rect(c,x+1,y+1,w>>1,1,'#4d7080')};
/* post-process: soft dark edge + weathering specks (runs once per baked sprite) */
const finish=(cv,seed)=>{const g=cv.getContext('2d'),w=cv.width,h=cv.height,im=g.getImageData(0,0,w,h),d=im.data,o=new Uint8ClampedArray(d),al=(x,y)=>x<0||y<0||x>=w||y>=h?0:d[(y*w+x)*4+3];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<200)continue;let f=1;if(al(x-1,y)<200||al(x+1,y)<200||al(x,y-1)<200||al(x,y+1)<200)f=.55;else{const r=hrnd(x,y,seed);f=r<.07?.86:r>.95?1.12:1}for(let k=0;k<3;k++)o[i+k]=d[i+k]*f}
 im.data.set(o);g.putImageData(im,0,0)};

/* ===== Visual intensity upgrade: AssetFX.enhance toggles the stronger finish pass (outline, top-lit bevel, contrast) and heavier shadows ===== */
const AssetFX={enhance:true};

AssetFX.finish=(cv,seed)=>{const g=cv.getContext('2d'),w=cv.width,h=cv.height,im=g.getImageData(0,0,w,h),d=im.data,o=new Uint8ClampedArray(d),
 al=(x,y)=>x<0||y<0||x>=w||y>=h?0:d[(y*w+x)*4+3];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<200)continue;
  const edge=al(x-1,y)<200||al(x+1,y)<200||al(x,y-1)<200||al(x,y+1)<200;let f=1;
  if(edge)f=.3;
  else{const r=hrnd(x,y,seed);f=r<.07?.86:r>.95?1.1:1;
   if(al(x,y-2)<200)f*=1.22;if(al(x-2,y)<200)f*=1.1;if(al(x,y+2)<200)f*=.78;if(al(x+2,y)<200)f*=.86}
  const L=.3*d[i]+.59*d[i+1]+.11*d[i+2];
  for(let k=0;k<3;k++){let v=L+(d[i+k]-L)*1.18;v=(v-118)*1.12+118;o[i+k]=v*f}}
 im.data.set(o);g.putImageData(im,0,0)};


/* Units face UP at 32x32. Turret/gun parts pivot on the centre (16,16). */
const NS={};
NS.fuelTruck={w:32,h:32,team:1,shadow:3,draw(c,t){[4,18,24].forEach(y=>{tire(c,7,y,3,5);tire(c,22,y,3,5)});
 rect(c,11,10,10,4,'#2a2c2d');camo(c,9,1,14,10,1);lit(c,9,1,14,10);glass(c,10,3,12,3);rect(c,14,8,4,1,'#2a2c2d');rect(c,15,6,2,1,t);dot(c,10,2,'#e8e2b0');dot(c,21,2,'#e8e2b0');
 rect(c,9,13,14,17,'#6a6f4a');rect(c,9,13,14,2,'#565a3c');rect(c,9,28,14,2,'#565a3c');for(const y of [17,25])rect(c,9,y,14,1,'#3b3d38');rect(c,9,19,14,2,t);disc(c,16,16,2,'#8a8d88');dot(c,16,16,'#2a2c2d');rect(c,19,26,3,2,'#3b3d38');cyl(c,9,13,14,17);rect(c,10,30,12,1,'#2a2c2d');dot(c,10,30,'#c02020');dot(c,21,30,'#c02020')}};
NS.scoutCar={w:32,h:32,team:1,shadow:3,draw(c,t){tire(c,7,6,3,6);tire(c,7,20,3,6);tire(c,22,6,3,6);tire(c,22,20,3,6);
 camo(c,10,3,12,25,2);rect(c,10,22,12,6,'#3b3d38');rect(c,10,24,12,1,'#2a2c2d');rect(c,10,26,12,1,'#2a2c2d');rect(c,12,23,4,3,CAMO[1]);lit(c,10,3,12,25);
 rect(c,13,5,6,1,'#2a2c2d');rect(c,13,7,6,1,'#2a2c2d');rect(c,13,9,6,1,'#2a2c2d');glass(c,11,11,10,3);rect(c,11,14,10,1,'#2a2c2d');
 disc(c,16,18,3,'#2e3031');disc(c,16,18,2,'#4a4e50');rect(c,16,9,1,10,'#15171a');rect(c,14,15,5,1,'#4a4e50');rect(c,19,17,2,3,t);rect(c,21,22,1,5,'#15171a');dot(c,10,4,'#e8e2b0');dot(c,21,4,'#e8e2b0')}};
NS.infantry={w:32,h:32,team:1,shadow:2,draw(c,t){for(const [x,y] of [[4,11],[16,6],[10,20],[21,16]]){rect(c,x-1,y+3,1,4,'#5b5a3d');rect(c,x+6,y+3,1,4,'#5b5a3d');rect(c,x,y+2,6,6,'#7b7752');rect(c,x,y+2,6,1,'#968f66');rect(c,x+1,y+5,4,3,'#4e4a34');disc(c,x+3,y+3,2,'#5b5a3d');dot(c,x+2,y+2,t);dot(c,x+3,y+2,t);dot(c,x+4,y+3,'#7a7656');rect(c,x+7,y-3,1,10,'#15171a');rect(c,x+7,y+2,1,2,'#4a4e50')}}};
NS.engineerTruck={w:32,h:32,team:1,shadow:3,draw(c,t){[4,18,24].forEach(y=>{tire(c,7,y,3,5);tire(c,22,y,3,5)});
 camo(c,9,1,14,10,3);lit(c,9,1,14,10);glass(c,10,3,12,3);rect(c,14,8,4,1,'#2a2c2d');rect(c,15,6,2,1,t);dot(c,13,8,'#e67e22');dot(c,18,8,'#e67e22');
 rect(c,9,12,14,18,'#3b3f40');for(let y=13;y<30;y+=3)rect(c,9,y,14,1,'#4a4e50');rect(c,9,12,14,1,'#5a5f60');
 rect(c,10,14,6,6,'#8a6a3a');rect(c,10,14,6,1,'#a98d5a');rect(c,12,14,1,6,'#6a4f2a');rect(c,10,22,5,4,t);rect(c,10,22,5,1,shade(t,1.3));
 disc(c,19,17,3,'#2e3031');disc(c,19,17,2,'#4a4e50');rect(c,18,18,2,11,'#c9a43a');for(let y=19;y<29;y+=3)rect(c,18,y,2,1,'#2a2c2d');rect(c,17,28,4,2,'#2e3031');
 for(let x=9;x<23;x+=2)rect(c,x,30,1,2,x%4?'#e67e22':'#2a2c2d')}};
NS.tankHull={w:32,h:32,team:1,shadow:3,draw(c,t){for(const x of [4,22]){rect(c,x,2,6,28,'#1b1c1d');for(let y=2;y<30;y+=2)rect(c,x,y,6,1,'#34363a');rect(c,x+(x<10?5:0),2,1,28,'#4a4d50')}
 camo(c,4,4,2,24,4);camo(c,26,4,2,24,4);camo(c,10,3,12,28,5);lit(c,10,3,12,28);rect(c,10,3,12,7,'rgba(255,245,210,.12)');rect(c,10,10,12,1,'rgba(0,0,0,.3)');
 disc(c,16,6,2,'#3a3d3e');dot(c,16,6,'#6f95a3');dot(c,11,4,'#e8e2b0');dot(c,20,4,'#e8e2b0');
 rect(c,12,22,8,7,'#2a2c2d');for(let y=22;y<29;y+=2)rect(c,12,y,8,1,'#3f4244');rect(c,12,29,8,1,t);rect(c,10,30,3,1,'#2a2c2d');rect(c,19,30,3,1,'#2a2c2d')}};
NS.tankTurret={w:32,h:32,team:1,shadow:3,draw(c,t){rect(c,15,0,2,10,'#202224');rect(c,15,4,2,4,'#34383a');rect(c,14,0,4,2,'#15171a');rect(c,14,9,4,3,'#2a2c2d');
 camo(c,10,10,12,15,6);camo(c,11,8,10,3,6);camo(c,12,7,8,2,6);lit(c,10,10,12,15);rect(c,12,9,8,1,'rgba(255,245,210,.25)');
 rect(c,10,23,12,3,'#4e4a34');for(let x=10;x<22;x+=2)rect(c,x,23,1,3,'#3a3722');
 disc(c,19,17,3,'#3a3d3e');disc(c,19,17,2,'#565a5c');dot(c,18,16,'#6f95a3');dot(c,20,16,'#6f95a3');rect(c,11,17,4,4,'#3f4244');rect(c,12,18,2,2,'#2a2c2d');rect(c,10,12,1,3,'#15171a');rect(c,21,12,1,3,'#15171a');rect(c,11,12,4,2,t);
 cyl(c,10,10,12,15);c.clearRect(10,10,2,1);c.clearRect(10,10,1,2);c.clearRect(20,10,2,1);c.clearRect(21,10,1,2);c.clearRect(10,25,1,1);c.clearRect(21,25,1,1)}};
NS.rocketArtillery={w:32,h:32,team:1,shadow:3,draw(c,t){[3,13,23].forEach(y=>{tire(c,6,y,4,6);tire(c,22,y,4,6)});
 camo(c,9,1,14,9,7);lit(c,9,1,14,9);glass(c,10,3,12,3);rect(c,15,6,2,1,t);rect(c,13,8,6,1,'#2a2c2d');
 rect(c,9,11,14,19,'#3b3f40');rect(c,10,12,12,17,'#4e4a34');lit(c,10,12,12,17);rect(c,10,12,12,2,'rgba(255,245,210,.2)');
 for(const [x,y] of [[13,16],[19,16],[13,21],[19,21],[13,26],[19,26]]){disc(c,x,y,2,'#15171a');disc(c,x,y,1,'#2a2c2d');rect(c,x-1,y-2,2,1,t)}
 rect(c,9,14,1,10,'#7a7f82');rect(c,22,14,1,10,'#7a7f82');rect(c,8,28,3,3,'#2a2c2d');rect(c,21,28,3,3,'#2a2c2d')}};

/* ===== Redrawn terrain tiles (32x32) and buildings (64x64). raw = no outline pass (tiles must tile) ===== */
const ground2=(c,x0,y0,w,h,wx=x0,wy=y0)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){const X=(wx+i)>>2<<2,Y=(wy+j)>>2<<2;let v=.62*vn(X,Y,144,1)+.3*vn(X,Y,40,2)+.08*hrnd(X>>2,Y>>2,3);v=(v-.2)*1.55;const b=Math.max(0,Math.min(4,Math.floor(v*5))),r=hrnd(wx+i,wy+j,9);let col=GROUND[b];if(r<.05)col=shade(col,.82);else if(r>.97)col=shade(col,1.15);else if(r>.93&&b<3)col=shade(col,.9);dot(c,x0+i,y0+j,col);if(hrnd(wx+i,wy+j,11)>.996){dot(c,x0+i,y0+j,'#6b5a42');dot(c,x0+i+1,y0+j+1,'rgba(0,0,0,.25)')}}};
NS.groundA={w:32,h:32,raw:1,draw(c){ground2(c,0,0,32,32,64,64)}};
NS.groundB={w:32,h:32,raw:1,draw(c){ground2(c,0,0,32,32,420,260)}};
const asphalt=(c,x,y,w,h,s)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)dot(c,x+i,y+j,shade('#6c7376',.84+(hrnd(x+i,y+j,s)*.5+vn(x+i,y+j,6,s)*.5)*.34))};
const gravel=(c,x,y,w,h,s)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++){const r=hrnd(x+i,y+j,s);if(r<.45)dot(c,x+i,y+j,'rgba(110,92,62,.5)');else if(r<.65)dot(c,x+i,y+j,'rgba(60,52,38,.45)')}};
NS.roadStraight={w:32,h:32,raw:1,draw(c){gravel(c,0,3,32,4,5);gravel(c,0,25,32,4,6);asphalt(c,0,7,32,18,1);rect(c,0,7,32,1,'rgba(0,0,0,.25)');rect(c,0,24,32,1,'rgba(0,0,0,.2)');rect(c,0,11,32,2,'rgba(0,0,0,.08)');rect(c,0,19,32,2,'rgba(0,0,0,.08)');
 for(let i=0;i<32;i++){if(hrnd(i,8,6)>.15)dot(c,i,9,'rgba(215,210,190,.8)');if(hrnd(i,23,6)>.15)dot(c,i,22,'rgba(215,210,190,.8)');if(i%16<9)rect(c,i,15,1,2,'rgba(201,164,58,.9)')}
 for(let k=0;k<4;k++){const x=hrnd(k,1,7)*28|0,y=9+(hrnd(k,2,7)*12|0);for(let m=0;m<5;m++)dot(c,x+m,y+(m>>1),'rgba(20,20,20,.45)')}}};
NS.roadCorner={w:32,h:32,raw:1,draw(c){for(let y=0;y<32;y++)for(let x=0;x<32;x++){const d=Math.hypot(x+.5-32,y+.5-32),r=hrnd(x,y,5);
 if(d>=4&&d<7||d>=25&&d<28){if(r<.45)dot(c,x,y,'rgba(110,92,62,.5)');else if(r<.65)dot(c,x,y,'rgba(60,52,38,.45)')}
 else if(d>=7&&d<25){let col=shade('#6c7376',.84+(r*.5+vn(x,y,6,1)*.5)*.34);if(d<8)col=shade(col,.75);else if(d>=24)col=shade(col,.8);else if((d>=9&&d<10||d>=22&&d<23)&&r>.15)col='rgba(215,210,190,.8)';else if(d>=15.5&&d<16.5&&Math.floor(Math.atan2(y-32,x-32)*10)%2==0)col='rgba(201,164,58,.9)';dot(c,x,y,col)}}}};
NS.water={w:32,h:32,raw:1,draw(c){for(let y=0;y<32;y++)for(let x=0;x<32;x++){const n=vn(x,y,9,2)*.6+vn(x,y,3,3)*.4;dot(c,x,y,shade('#2d5568',.82+n*.4))}for(let i=0;i<14;i++){const x=hrnd(i,1,4)*28|0,y=hrnd(i,2,4)*30|0,l=3+(hrnd(i,3,4)*4|0);rect(c,x,y,l,1,'rgba(150,200,220,.35)');rect(c,x+1,y+1,l,1,'rgba(0,0,0,.18)')}}};
const deck=(c,x0,x1)=>{rect(c,x0-3,25,x1-x0+3,4,'rgba(0,0,0,.3)');for(let j=6;j<26;j++)for(let i=x0;i<x1;i++)dot(c,i,j,shade('#9a9c96',.88+hrnd(i,j,3)*.2));for(let i=x0;i<x1;i++){if(i%8==0)rect(c,i,9,1,14,'#6f726e');if(i%12<7)rect(c,i,15,1,2,'#c9a43a')}rect(c,x0,6,x1-x0,3,'#b0b2ac');rect(c,x0,8,x1-x0,1,'#6f726e');rect(c,x0,23,x1-x0,3,'#b0b2ac');rect(c,x0,23,x1-x0,1,'#6f726e')};
NS.bridgeIntact={w:32,h:32,raw:1,draw(c){NS.water.draw(c);deck(c,0,32)}};
NS.bridgeDamaged={w:32,h:32,raw:1,draw(c){NS.water.draw(c);deck(c,0,32);for(let y=6;y<26;y++)for(let x=9;x<23;x++){const d=Math.hypot(x-16,y-15.5)+(hrnd(x,y,3)-.5)*6;if(d<6)dot(c,x,y,'#1f4050');else if(d<8){const r=hrnd(x,y,8);dot(c,x,y,r<.3?'#8a4b2a':'rgba(20,15,10,.5)')}}dot(c,11,12,'#e67e22');dot(c,21,19,'#e67e22');dot(c,21,18,'#f5d76e')}};
NS.bridgeDestroyed={w:32,h:32,raw:1,draw(c){NS.water.draw(c);deck(c,0,7);deck(c,25,32);for(let i=0;i<42;i++){const x=7+(hrnd(i,1,9)*17|0),y=8+(hrnd(i,2,9)*15|0),k=hrnd(i,3,9);rect(c,x,y,2+(hrnd(i,4,9)*3|0),2+(hrnd(i,5,9)*2|0),k<.4?'#6f726e':k<.8?'#9a9c96':'#8a4b2a')}dot(c,12,14,'#e67e22');dot(c,19,17,'#e67e22');dot(c,19,16,'#f5d76e')}};
const slab=(c,x,y,w,h,s)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)dot(c,x+i,y+j,shade('#b0a894',.88+(hrnd(x+i,y+j,s)*.5+vn(x+i,y+j,8,s)*.5)*.22));for(let i=14;i<w;i+=14)rect(c,x+i,y,1,h,'rgba(0,0,0,.14)');for(let j=14;j<h;j+=14)rect(c,x,y+j,w,1,'rgba(0,0,0,.14)')};
const silo=(c,x,y,r)=>{disc(c,x,y,r,'#6b695e');disc(c,x,y,r-1,'#cfcdc2');disc(c,x,y,r-3,'#c3c1b5');for(let a=0;a<6.28;a+=.4)dot(c,Math.round(x+Math.cos(a)*(r-2)),Math.round(y+Math.sin(a)*(r-2)),'#a9a79b');rect(c,x-r+3,y-1,r-3,2,'#8d8b80');disc(c,x-2,y+2,1,'#3a3d3e');disc(c,x+3,y-3,r>>1,'rgba(255,255,255,.16)')};
NS.oilRig={w:64,h:64,team:1,shadow:5,draw(c,t){slab(c,6,2,56,56,1);rect(c,6,2,56,1,'rgba(255,255,255,.3)');rect(c,6,57,56,1,'rgba(0,0,0,.3)');rect(c,6,2,1,56,'rgba(0,0,0,.25)');
 for(const [x,y] of [[8,4],[56,4],[8,52],[56,52]])rect(c,x,y,3,3,t);
 rect(c,30,17,10,2,'#5c6064');rect(c,30,44,10,2,'#5c6064');rect(c,39,15,2,32,'#5c6064');rect(c,39,15,1,32,'#8a8f94');
 [14,32,50].forEach(y=>{rect(c,41,y-1,3,2,'#5c6064');silo(c,50,y,8)});[24,38].forEach(y=>{disc(c,40,y,2,t);disc(c,40,y,1,'#2a2c2d')});
 rect(c,14,10,18,18,'#7a7f82');rect(c,16,12,14,14,'#1d1f21');line(c,16,12,29,25,'#9aa0a5');line(c,29,12,16,25,'#9aa0a5');rect(c,14,10,18,1,'#c0c4c8');disc(c,23,19,3,'#c9a43a');disc(c,23,19,1,'#1d1f21');
 for(let d=-5;d<=5;d++){const w=5-Math.abs(d);rect(c,17-w,34+d,w*2+1,1,t)}dot(c,17,34,'#1d1f21');
 rect(c,12,42,26,9,'#4a4e50');rect(c,14,44,22,3,'#8a8d88');rect(c,14,44,22,1,'#b0b2ac');rect(c,12,41,5,10,'#8a8d88');rect(c,30,41,6,10,t);rect(c,30,41,6,1,shade(t,1.3));line(c,24,52,22,44,'#2a2c2d');line(c,24,52,26,44,'#2a2c2d');disc(c,24,45,2,'#2a2c2d');rect(c,30,51,8,5,'#3a3d3e')}};
const conc=(c,x,y,w,h,s,b)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)dot(c,x+i,y+j,shade(b,.86+(hrnd(x+i,y+j,s)*.5+vn(x+i,y+j,5,s)*.5)*.3))};
NS.bunker={w:64,h:64,team:1,shadow:5,draw(c,t){conc(c,8,10,52,46,1,'#a39d8d');rect(c,8,10,52,2,'rgba(255,245,210,.3)');rect(c,58,10,2,46,'rgba(255,245,210,.15)');rect(c,8,10,2,46,'rgba(0,0,0,.3)');rect(c,8,54,52,2,'rgba(0,0,0,.35)');
 conc(c,16,20,36,30,2,'#8f897a');rect(c,16,20,36,1,'rgba(0,0,0,.35)');rect(c,16,49,36,1,'rgba(255,245,210,.2)');for(let x=24;x<52;x+=9)rect(c,x,20,1,30,'rgba(0,0,0,.18)');
 for(const x of [18,38]){rect(c,x,10,12,5,'#15171a');rect(c,x,10,12,1,'#3a3d3e');rect(c,x+1,14,10,1,'rgba(255,245,210,.3)')}
 rect(c,24,30,16,4,t);rect(c,24,30,16,1,shade(t,1.3));for(const x of [22,42]){disc(c,x,42,3,'#6f726e');disc(c,x,42,1,'#2a2c2d')}
 rect(c,28,52,8,4,'#4a4e50');rect(c,28,52,8,1,'#7a7f82');rect(c,31,53,2,2,t);
 for(let r=0;r<2;r++)for(let x=8+(r?3:0);x<58;x+=6){rect(c,x,3+r*3,6,3,'#b59a62');rect(c,x,3+r*3,6,1,'#c9ad73');rect(c,x+5,3+r*3,1,3,'#8d7545')}
 for(let i=0;i<24;i++)dot(c,16+(hrnd(i,1,3)*36|0),20+(hrnd(i,2,3)*30|0),'rgba(30,25,20,.3)')}};

/* ===== Town and capital kit, redrawn at 2x. Each module has 4px of shadow room on its left; draw with put(ctx,id,footprintX,footprintY) ===== */
const clutter=(c,x,y,w,h,s,base)=>{if(w<14||h<12)return;const n=2+(hrnd(s,w,1)*3|0);for(let k=0;k<n;k++){const r=hrnd(s,k,2),px=x+3+(hrnd(s,k,3)*(w-10)|0),py=y+3+(hrnd(s,k,4)*(h-9)|0);
 if(r<.3){rect(c,px,py,4,3,'#8a8d88');rect(c,px,py,4,1,'#b0b2ac');dot(c,px+1,py+1,'#3a3d3e');dot(c,px+2,py+1,'#3a3d3e')}
 else if(r<.5){disc(c,px+2,py+2,2,'#7a8085');disc(c,px+2,py+2,1,'#aab0b5')}
 else if(r<.65){rect(c,px,py,5,4,'#2c4a63');for(let i=1;i<5;i+=2)rect(c,px+i,py,1,4,'#4d7a9c');rect(c,px,py,5,1,'#6f9bbd')}
 else if(r<.8){rect(c,px,py,4,4,shade(base,1.1));rect(c,px,py,4,1,shade(base,1.3));dot(c,px+1,py+3,'#3a3d3e')}
 else if(r<.9){rect(c,px,py,4,3,'#6f95a3');rect(c,px,py,4,1,'#9fc3d0')}
 else{disc(c,px+1,py+1,1,'#e6e4da');dot(c,px+2,py+2,'#3a3d3e')}}};
const roofR=(c,x,y,w,h,base,s)=>{rect(c,x,y,w,h,shade(base,.55));rect(c,x,y,w-1,h-1,shade(base,.92));rect(c,x+1,y+1,w-3,h-3,shade(base,1.12));
 for(let j=2;j<h-3;j++)for(let i=2;i<w-4;i++)dot(c,x+i,y+j,shade(base,.88+(hrnd(x+i,y+j,s)*.5+vn(x+i,y+j,5,s)*.5)*.22));
 for(let j=6;j<h-4;j+=4)rect(c,x+2,y+j,w-6,1,'rgba(0,0,0,.07)');rect(c,x,y,w-1,1,'rgba(255,245,210,.3)');rect(c,x+w-2,y,1,h-1,'rgba(255,245,210,.18)');clutter(c,x,y,w,h,s,base)};
const mod=(name,w,h,fn,team)=>NS[name]={w:w+4,h:h+4,bw:w,bh:h,team:team?1:0,shadow:4,draw(c,t,td){c.save();c.translate(4,0);fn(c,t,td);c.restore()}};
[[20,16,'#b59a72'],[16,20,'#c9b88f'],[24,18,'#9a5f45'],[28,24,'#a8a08c'],[18,18,'#c79a62'],[20,24,'#7d8186'],[26,16,'#d8d2c0']].forEach(([w,h,col],i)=>mod('bld'+i,w,h,c=>roofR(c,0,0,w,h,col,i+1)));
mod('bldDepot',28,24,(c,t)=>{roofR(c,0,0,28,24,'#b0a894',9);rect(c,2,9,24,4,t);rect(c,2,9,24,1,shade(t,1.3));rect(c,20,16,6,4,'#2a2c2d');rect(c,2,20,24,1,'rgba(0,0,0,.25)')},1);
[[16,16,'#c0b8a4'],[18,16,'#b59a72'],[16,20,'#a8a08c'],[20,18,'#c9b88f']].forEach(([w,h,col],i)=>mod('cap'+i,w,h,c=>roofR(c,0,0,w,h,col,20+i)));
mod('capStep',24,24,c=>{roofR(c,0,0,24,24,'#b0a894',30);roofR(c,4,4,16,16,'#bdb49f',31);roofR(c,8,8,8,8,'#a49c88',32);rect(c,11,11,2,2,'#3a3d3e')});
const dome=(c,x,y,r)=>{disc(c,x,y,r,'#27605d');disc(c,x,y,r-1,'#3f8f8a');disc(c,x,y,r-3,'#4aa39d');for(let a=0;a<6.28;a+=.785)line(c,x,y,Math.round(x+Math.cos(a)*(r-1)),Math.round(y+Math.sin(a)*(r-1)),'rgba(0,0,0,.18)');disc(c,x+2,y-2,r>>2,'rgba(255,255,255,.22)');dot(c,x,y,'#c9a43a')};
mod('capDome',24,24,c=>{roofR(c,0,0,24,24,'#a8a08c',33);dome(c,12,12,9)});
mod('capRound',24,24,c=>{disc(c,12,12,12,'#7a7464');disc(c,12,12,11,'#b0a894');disc(c,12,12,9,'#9d9582');for(let a=0;a<6.28;a+=.26)line(c,Math.round(12+Math.cos(a)*7),Math.round(12+Math.sin(a)*7),Math.round(12+Math.cos(a)*9),Math.round(12+Math.sin(a)*9),'#7d7767');disc(c,12,12,6,'#6f7a45');for(let j=7;j<18;j+=2)rect(c,7,j,10,1,'rgba(255,255,255,.1)');disc(c,16,8,3,'rgba(255,255,255,.12)')});
mod('palace',88,64,(c,t)=>{roofR(c,0,0,88,64,'#c3a98a',40);rect(c,0,0,88,3,t);rect(c,0,0,88,1,shade(t,1.3));rect(c,12,12,64,40,'#8a8372');rect(c,13,13,62,38,'#a39d8d');
 for(const [x,y] of [[16,16],[46,16],[16,34],[46,34]]){for(let j=0;j<14;j++)for(let i=0;i<26;i++)dot(c,x+i,y+j,shade('#6f7a45',.85+hrnd(x+i,y+j,5)*.3));rect(c,x,y,26,1,'rgba(0,0,0,.25)')}
 rect(c,42,13,4,38,'#c0b8a4');rect(c,13,30,62,4,'#c0b8a4');
 for(const [x,y] of [[20,20],[28,26],[56,22],[62,28],[20,40],[30,44],[54,40],[64,44]]){disc(c,x-1,y+1,2,'rgba(0,0,0,.3)');disc(c,x,y,2,'#3f4e2a');dot(c,x+1,y-1,'#5f7a3a')}
 rect(c,33,22,22,20,'#b0a894');rect(c,33,22,22,1,'rgba(255,245,210,.3)');dome(c,44,32,9);rect(c,82,4,1,12,'#3a3d3e');rect(c,83,4,5,4,t)},1);
const tree=(c,x,y,r)=>{disc(c,x-2,y+2,r,'rgba(0,0,0,.28)');disc(c,x,y,r,'#3f4e2a');disc(c,x,y,r-1,'#4c5f33');dot(c,x+1,y-1,'#6a8446')};
const road2=(c,x,y,w,h,hz)=>{rect(c,x-2,y-2,w+4,h+4,'rgba(60,52,38,.35)');asphalt(c,x,y,w,h,2);if(hz){rect(c,x,y,w,1,'rgba(0,0,0,.2)');rect(c,x,y+h-1,w,1,'rgba(0,0,0,.2)');for(let i=0;i<w;i++)if(i%12<7)dot(c,x+i,y+(h>>1),'rgba(201,164,58,.85)')}else{rect(c,x,y,1,h,'rgba(0,0,0,.2)');rect(c,x+w-1,y,1,h,'rgba(0,0,0,.2)');for(let j=0;j<h;j++)if(j%12<7)dot(c,x+(w>>1),y+j,'rgba(201,164,58,.85)')}};
const put=(c,id,fx,fy,team=0)=>Assets.draw(c,id,team,fx-4,fy);
/* Town2.small: cross streets, lots filled with random modules and trees, one team depot. Town2.capital: ring boulevard, palace, avenues, dense blocks and landmarks. Region sizes are in 2x pixels. */
const Town2={
 small(c,x0,y0,w,h,seed,team=0,dens=.78,ruin=0.18){const mx=x0+(w>>1)-6,my=y0+(h>>1)-6;road2(c,x0,my,w,12,true);road2(c,mx,y0,12,h,false);
  for(const [rx,ry,rw,rh] of [[x0,y0,mx-x0,my-y0],[mx+12,y0,x0+w-mx-12,my-y0],[x0,my+12,mx-x0,y0+h-my-12],[mx+12,my+12,x0+w-mx-12,y0+h-my-12]])
   for(let x=rx+2;x+28<=rx+rw;x+=30)for(let y=ry+2;y+26<=ry+rh;y+=30){const r=hrnd(x,y,seed);if(r<.1)tree(c,x+14,y+13,4);else if(r<dens){const k=(r*977|0)%7,m=NS['bld'+k];{const rz=hrnd(x,y,seed+50)<ruin;if(rz){Assets.draw(c,'rubbleDecal',0,x+14-16,y+13-16);}put(c,'bld'+k+(rz?'Ruin':''),x+((28-m.bw)>>1),y+((26-m.bh)>>1))}}}
  put(c,'bldDepot',mx+16,my-26,team)},
 capital(c,x0,y0,w,h,seed,team=0,ruin=0.3){const cx=x0+w/2,cy=y0+h/2,R=Math.min(w,h)/2-12;road2(c,x0,cy-6,w,12,true);road2(c,cx-6,y0,12,h,false);
  for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const d=Math.hypot(x+.5-cx,y+.5-cy),a=Math.abs(d-R),r=hrnd(x,y,8);
   if(d<R-7)dot(c,x,y,shade('#6f7a45',.85+r*.25+(((y>>3)&1)?.04:0)));else if(a<5){let col=shade('#6c7376',.84+(r*.5+vn(x,y,6,2)*.5)*.34);if(a>3.8)col=shade(col,.78);else if(a<.5&&(Math.floor(Math.atan2(y-cy,x-cx)*R/6)&1))col='rgba(201,164,58,.85)';dot(c,x,y,col)}else if(a<7)dot(c,x,y,'rgba(60,52,38,.35)')}
  for(let a=0;a<6.28;a+=.11)tree(c,Math.round(cx+Math.cos(a)*(R-14)),Math.round(cy+Math.sin(a)*(R-14)),3);
  for(let x=x0+2;x+24<=x0+w;x+=26)for(let y=y0+2;y+24<=y0+h;y+=26){const mx=x+12,my=y+12;if(Math.hypot(mx-cx,my-cy)<R+16||Math.abs(mx-cx)<14||Math.abs(my-cy)<14)continue;const r=hrnd(x,y,seed);if(r>.96)continue;const id=r<.08?'capDome':r<.16?'capStep':r<.22?'capRound':'cap'+((r*977|0)%4),m=NS[id];{const rz=hrnd(x,y,seed+50)<ruin;if(rz){Assets.draw(c,'rubbleDecal',0,x+12-16,y+12-16);}put(c,id+(rz?'Ruin':''),x+((24-m.bw)>>1),y+((24-m.bh)>>1))}}
  put(c,'palace',Math.round(cx-44),Math.round(cy-32),team)}};

/* ===== Trees, forest texture and missile silo ===== */
const PALT={green:['#26331b','#35472a','#4d6234','#6f8a45','#97b160'],olive:['#3a4430','#52603f','#6e7d54','#8f9d70','#b2bd92']};
/* lumpy canopy: union of lobes, lit from the upper right, with leaf noise */
const blob=(c,cx,cy,R,s,pal)=>{const L=[[0,0,R]];for(let k=0;k<4;k++){const a=hrnd(s,k,1)*6.28;L.push([Math.cos(a)*R*.55,Math.sin(a)*R*.55,R*(.5+hrnd(s,k,2)*.25)])}
 for(let y=-R-1;y<=R+1;y++)for(let x=-R-1;x<=R+1;x++){let h=0;for(const [lx,ly,lr] of L){const d=Math.hypot(x-lx,y-ly);if(d<lr)h=Math.max(h,1-d/lr)}if(h<=0)continue;const px=cx+x,py=cy+y,v=h*.7+(x-y)*.012+hrnd(px,py,s)*.28-.08;dot(c,px,py,pal[Math.max(0,Math.min(4,Math.floor(v*5)))])}};
NS.treeBroad={w:32,h:32,shadow:3,draw(c){blob(c,16,16,12,3,PALT.green)}};
NS.treeOlive={w:32,h:32,shadow:3,draw(c){blob(c,16,16,10,7,PALT.olive)}};
NS.scrub={w:16,h:16,shadow:2,draw(c){blob(c,8,8,5,11,PALT.olive)}};
NS.treePalm={w:32,h:32,shadow:3,draw(c){const G=['#2a3d1c','#3d5a28','#5a7d36','#7fa047','#a6c264'];for(let k=0;k<9;k++){const a=k*.698+.2,ca=Math.cos(a),sa=Math.sin(a),lit=(ca-sa)*.7;for(let t=1;t<=14;t+=.5){const x=16+ca*t,y=16+sa*t,wd=t<4?1:t<9?2:1,col=G[Math.max(0,Math.min(4,Math.floor(2+lit*2+(t>9?-.6:.4))))];for(let q=-wd;q<=wd;q++)dot(c,Math.round(x-sa*q*.7),Math.round(y+ca*q*.7),col)}}disc(c,16,16,2,'#4a3a22');dot(c,15,15,'#8a6a3a');dot(c,17,17,'#8a6a3a')}};
const branch=(c,x,y,a,len,d)=>{let ex=x,ey=y;for(let t=0;t<len;t++){ex=x+Math.cos(a)*t;ey=y+Math.sin(a)*t;dot(c,Math.round(ex),Math.round(ey),(Math.cos(a)-Math.sin(a))>0?'#8a6f4c':'#5a4630')}if(d>0){branch(c,ex,ey,a-.55,len*.72,d-1);branch(c,ex,ey,a+.5,len*.72,d-1)}};
NS.treeDead={w:32,h:32,shadow:3,draw(c){disc(c,16,16,2,'#4a3a22');for(let k=0;k<4;k++)branch(c,16,16,k*1.57+.4,8,2)}};
/* seamless 32x32 forest canopy tile (canopies wrap around the edges) */
NS.forestTile={w:32,h:32,raw:1,draw(c){rect(c,0,0,32,32,'#222b19');const T=[];for(let i=0;i<11;i++)T.push([hrnd(i,1,5)*32|0,hrnd(i,2,5)*32|0,5+(hrnd(i,3,5)*4|0),i]);T.sort((a,b)=>a[1]-b[1]);
 for(const [x,y,r,i] of T)for(const ox of [-32,0,32])for(const oy of [-32,0,32]){disc(c,x+ox-2,y+oy+2,r,'rgba(0,0,0,.3)');blob(c,x+ox,y+oy,r,i*7+1,hrnd(i,4,5)<.35?PALT.olive:PALT.green)}}};
/* world-space forest: irregular noise-masked patch with stepped edges, small scrub at the fringe, shadows under each canopy */
const forestPatch=(c,x0,y0,w,h,seed)=>{const L=[];for(let y=y0-8;y<y0+h+8;y+=7)for(let x=x0-8;x<x0+w+8;x+=7){const jx=x+(hrnd(x,y,1)*6|0),jy=y+(hrnd(x,y,2)*6|0),m=vn(jx,jy,36,seed)*.75+vn(jx,jy,10,seed+3)*.25;if(m>.5)L.push([jx,jy,4+Math.round((m-.5)*14),x*131+y]);else if(m>.44&&hrnd(x,y,3)<.6)L.push([jx,jy,3,x*131+y])}
 L.sort((a,b)=>a[1]-b[1]);for(const [x,y,r,s] of L){disc(c,x-2,y+2,r,'rgba(0,0,0,.28)');blob(c,x,y,r,s,hrnd(s,5,5)<.35?PALT.olive:PALT.green)}};
/* Missile silo 64x64: slab, berm shadow, hazard ring, team ticks, split blast doors (closed) or open pit with missile nose */
const siloDraw=(c,t,open)=>{slab(c,6,2,56,56,4);rect(c,6,2,56,1,'rgba(255,255,255,.3)');rect(c,6,57,56,1,'rgba(0,0,0,.3)');rect(c,6,2,1,56,'rgba(0,0,0,.25)');for(const [x,y] of [[8,4],[56,4],[8,52],[56,52]])rect(c,x,y,3,3,t);
 const cx=29,cy=27;for(let y=0;y<64;y++)for(let x=0;x<64;x++){const dx=x+.5-cx,dy=y+.5-cy,d=Math.hypot(dx,dy),r=hrnd(x,y,6);
  if(d>=22&&d<23)dot(c,x,y,'rgba(0,0,0,.35)');
  else if(d>=15.5&&d<22){let col=shade('#a39d8d',.86+(r*.5+vn(x,y,5,4)*.5)*.3);if(d<18.5)col=(Math.floor(Math.atan2(dy,dx)*10+d*.35)&1)?'#c9a43a':'#2a2c2d';else if(d>=19&&d<21){const a=Math.atan2(dy,dx),q=Math.abs(((a%(Math.PI/2))+Math.PI/2)%(Math.PI/2)-Math.PI/4);if(q<.2)col=t}dot(c,x,y,col)}
  else if(d<15.5){let col;if(open)col=d>13?'#1d2022':d>9?'#15171a':'#0d0f10';else{col=shade('#4a4e50',.85+r*.3);if(dx-dy>0)col=shade(col,1.12);if(d>14)col='#6f7479';else if(Math.abs(dx)<1)col='#15171a';else if(y%5==0)col=shade(col,.8);else if(Math.abs(d-12)<.6&&((Math.atan2(dy,dx)*10+20)%1)<.35)col='#9aa0a5'}dot(c,x,y,col)}}
 if(open){for(let a=0;a<6.28;a+=.5)dot(c,Math.round(cx+Math.cos(a)*13),Math.round(cy+Math.sin(a)*13),'#c0392b');for(const a of [.785,2.356,3.927,5.498])line(c,cx,cy,Math.round(cx+Math.cos(a)*11),Math.round(cy+Math.sin(a)*11),'#6f7479');disc(c,cx,cy,8,'#8a8d88');disc(c,cx,cy,7,'#c3c5c0');disc(c,cx+2,cy-2,3,'rgba(255,255,255,.35)');disc(c,cx,cy,4,t);disc(c,cx,cy,2,shade(t,1.3));dot(c,cx,cy,'#15171a')}
 roofR(c,46,46,13,10,'#9d9582',5);line(c,46,48,41,40,'#2a2c2d');for(const [x,y] of [[55,9],[10,52]]){disc(c,x,y,4,'#5c6064');disc(c,x,y,3,'#8a8d88');disc(c,x,y,1,'#15171a')}};
NS.missileSilo={w:64,h:64,team:1,shadow:5,draw(c,t){siloDraw(c,t,false)}};
NS.missileSiloOpen={w:64,h:64,team:1,shadow:5,draw(c,t){siloDraw(c,t,true)}};

/* ===== Makeshift dirt road tiles (32x32, raw alpha). The wobbling edge tapers to zero at tile ends so tiles join cleanly. ===== */
const dirt=(c,tracks,seed,planks)=>{for(let y=0;y<32;y++)for(let x=0;x<32;x++){let best=null;
  for(const f of tracks){const r=f(x+.5,y+.5);if(!r)continue;const l=r[0],u=Math.max(0,Math.min(1,r[1])),env=Math.sin(Math.PI*u),ll=l-env*(2*Math.sin(u*9+seed)+1.2*Math.sin(u*17+seed*2)),a=Math.abs(ll);if(!best||a<best.a)best={a,ll,u}}
  if(!best)continue;const {a,ll,u}=best,r=hrnd(x,y,seed+5);if(a>=11)continue;
  if(a>=8){if(r>.3+(a-8)*.15)dot(c,x,y,'rgba(180,148,100,'+(.42*(1-(a-8)/3)).toFixed(2)+')');continue}
  let col=shade('#b9966a',.84+r*.28);
  if(a>6)col=shade(col,ll<0?1.12:.82);
  else{const ru=Math.abs(a-3.5);if(ru<1.6){col=shade(col,.78);if(Math.floor(u*60)%3==0)col=shade(col,.85)}else if(a<1.5){col=shade(col,1.06);if(r<.1)col='#6f7a45'}}
  if(planks&&u>.58&&u<.74&&a<7.5){const k=Math.floor(u*32/4);col=k%2?'#8a6a3a':'#7d5f35';if(Math.floor(u*32)%4==3)col='#4a3a22';else if(r<.2)col=shade(col,.85)}
  const p=hrnd(x,y,9);if(p>.988)col='#d8d0bc';else if(p<.012)col='#6b5d48';
  dot(c,x,y,col)}};
const trkH=(x,y)=>[y-16,x/32],trkS=(x,y)=>y<16?null:[x-16,(y-16)/16],trkC=(x,y)=>{const dx=x-32,dy=y-32;return [Math.hypot(dx,dy)-16,(Math.atan2(dy,dx)+Math.PI)/(Math.PI/2)]};
NS.dirtRoadStraight={w:32,h:32,raw:1,draw(c){dirt(c,[trkH],1)}};
NS.dirtRoadPlanks={w:32,h:32,raw:1,draw(c){dirt(c,[trkH],2,true)}};
NS.dirtRoadCorner={w:32,h:32,raw:1,draw(c){dirt(c,[trkC],3)}};
NS.dirtRoadT={w:32,h:32,raw:1,draw(c){dirt(c,[trkH,trkS],4)}};


NS.mcv={w:32,h:32,team:1,shadow:3,draw(c,t){[3,13,23].forEach(y=>{tire(c,6,y,4,6);tire(c,22,y,4,6)});camo(c,9,1,14,9,8);lit(c,9,1,14,9);glass(c,10,3,12,3);rect(c,15,6,2,1,t);rect(c,13,8,6,1,'#2a2c2d');rect(c,8,11,16,19,'#3b3f40');conc(c,9,12,14,17,3,'#b0a894');lit(c,9,12,14,17);rect(c,9,18,14,4,t);rect(c,9,18,14,1,shade(t,1.3));rect(c,12,24,8,2,'#8a8372');line(c,21,14,21,8,'#2a2c2d');rect(c,20,6,3,2,'#c9a43a')}};
NS.bridgeLayer={w:32,h:32,team:1,shadow:3,draw(c,t){[4,18,24].forEach(y=>{tire(c,7,y,3,5);tire(c,22,y,3,5)});rect(c,11,10,10,4,'#2a2c2d');camo(c,9,1,14,10,9);lit(c,9,1,14,10);glass(c,10,3,12,3);rect(c,15,6,2,1,t);rect(c,9,12,14,18,'#3b3f40');for(let y=13;y<30;y+=3){rect(c,9,y,14,2,'#9a9c96');rect(c,9,y+2,14,1,'#6f726e')}rect(c,15,12,2,18,'#4a4e50');rect(c,9,12,14,1,'#c0c4c8')}};
/* ===== Destruction kit ===== */
const ruinize=(c,seed,sev)=>{
 const W=c.canvas.width,H=c.canvas.height,im=c.getImageData(0,0,W,H),d=im.data,B=[];
 for(let i=0;i<2+Math.round(sev*3);i++)B.push([W*(.15+.7*hrnd(i,seed,1)),H*(.15+.7*hrnd(i,seed,2)),Math.min(W,H)*(.25+.2*hrnd(i,seed,3))]);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(d[i+3]<20)continue;
  let bl=0;for(const [bx,by,br] of B)bl=Math.max(bl,1-Math.hypot(x-bx,y-by)/br);
  const n=vn(x,y,6,seed)*.6+vn(x,y,2.5,seed+3)*.4,v=bl*.8+n*.55+(sev-.5)*.3,r=hrnd(x,y,seed+7);
  if(v>1.05){d[i+3]=0}
  else if(v>.88){const p=r<.3?[44,36,30]:[24,20,16];d[i]=p[0];d[i+1]=p[1];d[i+2]=p[2]}
  else if(v>.62){const k=r<.2?.35:.5;d[i]=d[i]*k+30;d[i+1]=d[i+1]*k+24;d[i+2]=d[i+2]*k+18}
  else{const k=.8+r*.1;d[i]*=k;d[i+1]*=k;d[i+2]*=k}}
 c.putImageData(im,0,0);
 const alive=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&d[(y*W+x)*4+3]>0;
 const N=Math.round(W*H/38*(.6+sev));
 for(let k=0;k<N;k++){const x=hrnd(k,seed,11)*W|0,y=hrnd(k,seed,12)*H|0,r=hrnd(k,seed,13);if(!alive(x,y))continue;
  if(r<.45){const w=2+(hrnd(k,seed,14)*3|0),h=1+(hrnd(k,seed,15)*2|0);rect(c,x,y,w,h,r<.2?PAL.concLo:PAL.conc);rect(c,x,y,w,1,shade(PAL.conc,1.15))}
  else if(r<.62){const a=hrnd(k,seed,16)*6.28,l=4+(hrnd(k,seed,17)*6|0);line(c,x,y,Math.round(x+Math.cos(a)*l),Math.round(y+Math.sin(a)*l),'#2a1f17')}
  else if(r<.72){const a=hrnd(k,seed,18)*6.28;line(c,x,y,Math.round(x+Math.cos(a)*6),Math.round(y+Math.sin(a)*6),'#7a4a2a');dot(c,x,y,'#9a5a30')}
  else if(r<.80)dot(c,x,y,hrnd(k,seed,19)<.5?PAL.fire:PAL.flash)
  else{rect(c,x,y,2,1,'rgba(20,18,16,.5)')}}};
const ruinOf=(id,seed,sev=.55)=>{const b=NS[id];NS[id+'Ruin']={...b,draw(c,t,td){b.draw(c,t,td);ruinize(c,seed,sev)}}};
['bld0','bld1','bld2','bld3','bld4','bld5','bld6','bldDepot','cap0','cap1','cap2','cap3','capStep','capDome','capRound'].forEach((id,i)=>ruinOf(id,100+i*13,.55));
ruinOf('palace',777,.7);
ruinOf('bunker',888,.6);ruinOf('oilRig',999,.6);ruinOf('missileSilo',1111,.5);
/* ===== Destruction decals ===== */
NS.rubbleDecal={w:32,h:32,raw:1,shadow:1,draw(c){
 for(let k=0;k<46;k++){const a=hrnd(k,1,21)*6.28,d=Math.sqrt(hrnd(k,2,21))*14,x=Math.round(16+Math.cos(a)*d),y=Math.round(16+Math.sin(a)*d),r=hrnd(k,3,21);
  if(r<.5)rect(c,x,y,2+(r*4|0),2,r<.25?PAL.concLo:PAL.conc);else if(r<.8)dot(c,x,y,'#2a1f17');else dot(c,x,y,PAL.concDk)}
 for(let k=0;k<3;k++){const a=hrnd(k,4,21)*6.28;line(c,16,16,Math.round(16+Math.cos(a)*9),Math.round(16+Math.sin(a)*9),'#7a4a2a')}}};
NS.craterBig={w:32,h:32,raw:1,draw(c){for(let y=0;y<32;y++)for(let x=0;x<32;x++){const d=Math.hypot(x+.5-16,y+.5-16)+(hrnd(x,y,5)-.5)*4;
 if(d<7)dot(c,x,y,'#1f1a15');else if(d<9)dot(c,x,y,(x+y)&1?'#3a2f25':'#2a221b');else if(d<12&&hrnd(x,y,6)<.5)dot(c,x,y,'#8a7350')}}};
NS.brokenWall={w:32,h:32,raw:1,shadow:1,draw(c){for(let i=0;i<32;i++){const h=hrnd(i>>2,1,22)<.5?3:hrnd(i>>2,2,22)<.5?2:1;if(hrnd(i>>2,3,22)<.2)continue;
 rect(c,i,14-h,1,h+2,i%5==0?PAL.concLo:PAL.conc);dot(c,i,14-h,shade(PAL.conc,1.2))}
 for(let k=0;k<14;k++)dot(c,(hrnd(k,1,23)*32)|0,16+(hrnd(k,2,23)*4|0),PAL.concDk)}};
/* ===== Burnt-out vehicles ===== */
const charOf=(id,seed)=>{const b=NS[id];NS[id+'Wreck']={...b,team:0,draw(c,t,td){b.draw(c,t,td);
 const W=32,im=c.getImageData(0,0,W,W),d=im.data;
 for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const r=hrnd(i>>2,seed,1),k=.28+r*.2;d[i]=d[i]*k+18;d[i+1]=d[i+1]*k+14;d[i+2]=d[i+2]*k+10;if(r>.97){d[i]=230;d[i+1]=126;d[i+2]=34}}
 c.putImageData(im,0,0);for(let k=0;k<5;k++)dot(c,8+(hrnd(k,seed,2)*16|0),8+(hrnd(k,seed,3)*16|0),PAL.fire)}}};
['fuelTruck','scoutCar','engineerTruck','tankHull','tankTurret','rocketArtillery','mcv','bridgeLayer'].forEach((id,i)=>charOf(id,i+40));
for(const k in NS){NS[k].hr=1;NS[k].k=.5;S[k]=NS[k]}
const Town={trees(c,x,y,r=1){const n=hrnd(x,y,1)<.5?'treeBroad':'treeOlive',sc=.1+.15*r,cv=Assets.get(n,0);c.imageSmoothingEnabled=true;c.drawImage(cv,x-16*sc,y-16*sc,32*sc,32*sc);c.imageSmoothingEnabled=false}};
const Assets={cache:{},
 get(name,team=0){const s=S[name],k=(AssetFX.enhance?'e:':'')+name+(s.team?team:'');if(this.cache[k])return this.cache[k];const sp=document.createElement('canvas');sp.width=s.w;sp.height=s.h;const t=TEAMS[team][1];s.draw(sp.getContext('2d'),t,shade(t,.65));if(s.hr&&!s.raw)(AssetFX.enhance?AssetFX.finish:finish)(sp,name.length*7+team);
  const cv=document.createElement('canvas');cv.width=s.w;cv.height=s.h;const g=cv.getContext('2d');
  if(s.shadow){const m=document.createElement('canvas');m.width=s.w;m.height=s.h;const q=m.getContext('2d');q.drawImage(sp,0,0);q.globalCompositeOperation='source-in';q.fillStyle='rgba(0,0,0,'+(AssetFX.enhance?.5:.35)+')';q.fillRect(0,0,s.w,s.h);g.drawImage(m,-s.shadow,s.shadow)}
  g.drawImage(sp,0,0);return this.cache[k]=cv},
 draw(ctx,name,team,x,y,ang=0){const cv=this.get(name,team);ctx.imageSmoothingEnabled=false;if(!ang)return ctx.drawImage(cv,x,y);ctx.save();ctx.translate(x+cv.width/2,y+cv.height/2);ctx.rotate(ang);ctx.drawImage(cv,-cv.width/2,-cv.height/2);ctx.restore()},
 drawK(ctx,name,team,x,y){const cv=this.get(name,team);ctx.imageSmoothingEnabled=true;ctx.drawImage(cv,x,y,cv.width/2,cv.height/2);ctx.imageSmoothingEnabled=false}};


TEAMS.push(['Neutral','#8c8c7c']);
Terrain.fast=function(c,w,h){const gr=PAL.ground;for(let Y=0;Y<h;Y+=4)for(let X=0;X<w;X+=4){let v=.62*vn(X,Y,72,1)+.3*vn(X,Y,20,2)+.08*hrnd(X>>2,Y>>2,3);v=(v-.2)*1.55;const b=Math.max(0,Math.min(4,Math.floor(v*5)));c.fillStyle=gr[b];c.fillRect(X,Y,4,4);if(b>=2)for(let j=0;j<4;j++)for(let i=0;i<4;i++)if(hrnd(X+i,Y+j,9)<.04)dot(c,X+i,Y+j,gr[b-1])}};
Terrain.jungle=function(c,w,h){const P=['#2b3a1c','#344526','#3e5129','#4a5c30','#566a38'];for(let Y=0;Y<h;Y+=4)for(let X=0;X<w;X+=4){const v=vn(X,Y,80,4)*.7+vn(X,Y,18,5)*.3,m=vn(X,Y,120,9);let col=P[Math.min(4,Math.floor(v*5))];if(m>.72&&v<.55)col='#4b3e28';c.fillStyle=col;c.fillRect(X,Y,4,4);if(hrnd(X,Y,8)<.25){dot(c,X+1,Y+1,shade(col,.8));dot(c,X+3,Y+2,shade(col,1.2))}}};

/* ===== Destruction state API ===== */
/* state: 'ruin' (buildings) or 'wreck' (vehicles). Falls back to the intact sprite if no variant exists. */
Assets.stateOf=(name,state)=>{const n=name+(state==='ruin'?'Ruin':state==='wreck'?'Wreck':'');return S[n]?n:name};
Assets.hasState=(name,state)=>Assets.stateOf(name,state)!==name;
Assets.drawState=(ctx,name,team,x,y,ang=0,state)=>Assets.draw(ctx,Assets.stateOf(name,state),team,x,y,ang);

/* ===== Intensity kit: damaged variants, fire, smoke, blasts, muzzle flashes, tracer, track and rotor frames ===== */
(()=>{
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
})();
