/* ui.js - load LAST (after extras.js). Pure skin: restyles the HUD and menus, no gameplay changes. */
(()=>{
const css=`
:root{--bg:rgba(17,20,15,.82);--solid:#161a13;--line:rgba(226,232,214,.10);--line2:rgba(226,232,214,.20);--hi:#e8b04a;--txt:#e4e8dc;--dim:#8c9582;--r:6px;
--ui:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
#top,#msg,#bot,#dm,#mapMenu,#end{font-family:var(--ui);font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}
button:focus-visible,select:focus-visible{outline:2px solid var(--hi);outline-offset:2px}

/* resource strip: one segmented bar */
#top{left:8px;right:auto;top:calc(env(safe-area-inset-top,0px) + 8px);padding:0;gap:0;flex-wrap:wrap;max-width:calc(100vw - 230px);background:var(--bg);border:1px solid var(--line);border-radius:var(--r);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);overflow:hidden}
#top span{padding:5px 12px;font-size:12px;letter-spacing:.02em;color:var(--dim);border-right:1px solid var(--line);background:none}
#top span:last-child{border-right:0}
#top span b{color:var(--txt);font-weight:600;margin-left:6px}
#top span::before{color:var(--hi);opacity:.85;margin-right:2px}
#top span:nth-child(1)::before{content:'\\26FD\\FE0E'}#top span:nth-child(2)::before{content:'\\1F6E2\\FE0E'}#top span:nth-child(3)::before{content:'\\1F69A\\FE0E'}
#top span:nth-child(4)::before{content:'\\2691\\FE0E'}#top span:nth-child(5)::before{content:'\\2601\\FE0E'}

/* toast */
#msg{left:50%;right:auto;transform:translateX(-50%);width:max-content;max-width:80vw;top:calc(env(safe-area-inset-top,0px) + 50px);padding:6px 16px;background:var(--bg);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--line2);border-left:2px solid var(--hi);border-radius:var(--r);font-size:13px;color:var(--txt)}
#msg:empty{display:none}

/* command card */
#bot{left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));padding:10px 12px;border:1px solid var(--line);border-radius:var(--r);background:var(--bg);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 8px 30px #0009;align-items:stretch;gap:14px}
#info{border-right:1px solid var(--line);padding-right:14px;min-height:70px;line-height:1.55;font-size:13px;color:var(--txt)}
.hpbar{height:4px;margin:7px 0 2px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden}.hpbar i{display:block;height:100%;border-radius:2px;transition:width .2s}
#btns{align-content:flex-start;gap:6px}
#btns button{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:4px;padding:6px 10px;font-family:var(--ui);font-size:12.5px;color:var(--txt);transition:border-color .12s,background .12s}
#btns button:not(:disabled):hover{border-color:var(--hi);background:rgba(232,176,74,.08)}
#btns button:not(:disabled):active{background:rgba(232,176,74,.16)}
#btns button:disabled{opacity:.3;cursor:not-allowed}
#btns button .k{min-width:16px;text-align:center;background:rgba(0,0,0,.35);border:1px solid var(--line2);border-radius:3px;padding:0 4px;font-size:10.5px;line-height:16px;color:var(--dim)}
#btns button .c{color:var(--hi);font-weight:600}#btns button .c::before{content:'\\26FD\\FE0E';font-weight:normal;margin-right:3px;font-size:10px;opacity:.8}
#b_bld::after{content:'\\25BE';color:var(--dim);margin-left:2px}
#x_arm{margin-left:12px}
#btns button.tile,#dm button.tile{flex-direction:column;justify-content:flex-start;gap:3px;width:68px;min-height:76px;padding:7px 4px 6px;position:relative;text-align:center;line-height:1.15;font-size:11px}
#btns button.tile .k{position:absolute;top:4px;left:4px}
.tile canvas{width:36px;height:36px;display:block;image-rendering:pixelated}
.tile .n{color:var(--txt)}
.tile .c{color:var(--hi);font-weight:600;font-size:11px}
.tile .c::before{content:'\\26FD\\FE0E';margin-right:2px;font-size:9px;opacity:.8}
@keyframes pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}

/* minimap */
#mm{width:170px;height:170px;border:1px solid var(--line2);border-radius:var(--r);box-shadow:0 8px 30px #0009}

/* build menu */
#dm{position:fixed;left:8px;bottom:170px;flex-wrap:wrap;gap:6px;padding:8px;animation:pop .12s ease-out;border:1px solid var(--line);border-radius:var(--r);width:292px;background:var(--bg);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 8px 30px #0009;font-size:13px;color:var(--txt)}
#dm .dh{flex-basis:100%;font-size:11px;color:var(--dim);padding:0 2px 2px}
#dm button{display:flex;align-items:center;border-radius:4px;background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--txt);font-family:var(--ui);transition:border-color .12s,background .12s}
#dm button:not(:disabled):hover{border-color:var(--hi);background:rgba(232,176,74,.08)}
#dm button:disabled{opacity:.3}

/* main menu */
#mapMenu{backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:var(--txt)}
#mapMenu .panel{background:var(--solid);border:1px solid var(--line2);border-radius:10px;min-width:340px;box-shadow:0 20px 60px #000c}
#mapMenu button{border-radius:var(--r);padding:12px 14px;text-align:left;font-family:var(--ui);background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--txt);transition:border-color .12s,background .12s}
#mapMenu button:hover{border-color:var(--hi);background:rgba(232,176,74,.08)}
#mapMenu button b{font-weight:600}
#mapMenu button small{color:var(--dim);font-size:12px}
#mapMenu select{background:var(--solid);color:var(--txt);border:1px solid var(--line2);border-radius:4px;padding:3px 6px;font-family:var(--ui)}

/* end screen */
#end{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);background:rgba(8,10,7,.6)}
#end .ep{text-align:center;background:var(--solid);border:1px solid var(--line2);border-radius:10px;padding:28px 52px;box-shadow:0 20px 60px #000c}
#end .ep h1{margin:0 0 20px;font-size:38px;font-weight:600;letter-spacing:.12em}
#end .ep button{background:rgba(232,176,74,.1);color:var(--txt);border:1px solid var(--hi);border-radius:var(--r);padding:10px 24px;font-family:var(--ui);font-size:14px;cursor:pointer;transition:background .12s}
#end .ep button:hover{background:rgba(232,176,74,.2)}

@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* wrap a button's textContent so engine updates render as [key] name cost, only touching the DOM when the text changes */
const fmt=v=>{if(!v.trim())return'';const k=v.match(/^([A-Z]) (.+?)(?: (\d+))?$/),m=k||v.match(/^()(.+?)(?: (\d+))?$/);return(m[1]?'<span class="k">'+m[1]+'</span>':'')+'<span>'+m[2]+'</span>'+(m[3]?'<span class="c">'+m[3]+'</span>':'')};
const skin=b=>{if(!b||b._sk)return;b._sk=1;b._raw=b.textContent;Object.defineProperty(b,'textContent',{get(){return this._raw},set(v){if(v!==this._raw){this._raw=v;this.innerHTML=fmt(v);if(this._ic)this.prepend(this._ic)}}});b.innerHTML=fmt(b._raw)};
const skinAll=()=>['b_bld','b_cut','b_dig','b_dep','x_arm','x_rpump','x_rtruck',...ORDER.map(t=>'b_'+t)].forEach(id=>skin($(id)));
skinAll();


/* ---- icons ---- */
const mkIc=fn=>{const c=document.createElement('canvas');c.width=c.height=36;try{fn(c.getContext('2d'))}catch(e){}return c};
const fit=(g,n,sc)=>{const cv=Assets.get(n,0),hr=!!(S[n]&&S[n].hr);if(!sc){sc=Math.min(30/cv.width,30/cv.height);if(!hr&&sc>=1)sc=Math.floor(sc)}g.imageSmoothingEnabled=hr;g.save();g.translate(18,18);g.scale(sc,sc);g.drawImage(cv,-cv.width/2,-cv.height/2);g.restore();return sc};
const unitIcon=t=>mkIc(g=>{g.save();g.translate(18,18);g.scale(1.3,1.3);drawU(g,t,0,0,-Math.PI/2,FC[0]);g.restore()});
const defIcon=k=>mkIc(g=>{const d=DEF[k];if(d.spr)fit(g,d.spr);else{const sc=fit(g,d.base);fit(g,d.gun,sc)}});
const roadIcon=()=>mkIc(g=>{g.translate(18,18);g.rotate(-.6);g.fillStyle='#8a7550';g.fillRect(-20,-7,40,14);g.fillStyle='#cdbd94';for(let x=-16;x<16;x+=10)g.fillRect(x,-1,5,2)});

/* ---- units: only show when an HQ / town is selected ---- */
ORDER.forEach(t=>{const b=$('b_'+t);if(!b)return;b.classList.add('tile');b._ic=unitIcon(t);b.prepend(b._ic)});

[['x_rpump',()=>mkIc(g=>fit(g,'oilRig'))],['x_rtruck',()=>unitIcon('truck')]].forEach(([id,f])=>{const b=$(id);if(b){b.classList.add('tile');b._ic=f();b.prepend(b._ic)}});

/* ---- build dropdown: icon tiles ---- */
{const dm=$('dm');if(dm){const hd=dm.firstElementChild;if(hd&&hd.tagName=='DIV'){hd.className='dh';hd.removeAttribute('style');hd.textContent='Build (Esc closes)'}
 dm.querySelectorAll('button').forEach(b=>{const id=b.id.slice(2),d=DEF[id],nm=d?d.n:'Makeshift Road',cost=b.querySelector('b').textContent,sm=b.querySelector('small');
  b.title=nm+' - '+cost+' oil'+(sm?'\n'+sm.textContent:'');b.innerHTML='';b.classList.add('tile');
  b.appendChild(d?defIcon(id):roadIcon());const n=document.createElement('span');n.className='n';n.textContent=nm;const c=document.createElement('span');c.className='c';c.textContent=cost;b.append(n,c)})}}

/* tooltips with unit stats */
ORDER.forEach(t=>{const s=ST[t],b=$('b_'+t);if(b)b.title=s.n+' - '+s.hp+' HP'+(s.dmg?', '+s.dmg+' dmg, range '+s.rng:'')+', speed '+s.spd});
if($('x_arm'))$('x_arm').title='-15% damage taken per level (units)';if($('x_rpump'))$('x_rpump').title='+1 oil/s from this rig, per level (max 3)';if($('x_rtruck'))$('x_rtruck').title='Extra fuel truck for this rig (max 5)';
if($('b_bld'))$('b_bld').title='Build defences (needs an engineer)';

/* health bar under the selection info */
const _h=hud;hud=function(){_h();skinAll();
 const prod=sel.some(e=>e.f==0&&e.t=='town');ORDER.forEach(t=>{const b=$('b_'+t);if(b)b.style.display=prod?'':'none'});
 {const dm=$('dm'),bb=$('b_bld');if(dm&&bb&&dm.style.display!='none'&&bb.style.display!='none'){const r=bb.getBoundingClientRect();dm.style.left=Math.max(8,Math.min(innerWidth-dm.offsetWidth-8,r.left))+'px';dm.style.bottom=(innerHeight-r.top+8)+'px'}}
 const s=sel[0];if(sel.length==1&&s&&s.mhp&&s.hp>=0){const v=Math.max(0,Math.min(1,s.hp/s.mhp));$('info').innerHTML+='<div class="hpbar"><i style="width:'+v*100+'%;background:'+(v>.5?'#8fb573':v>.25?'#e8b04a':'#d9604c')+'"></i></div>'}};

/* nicer map menu cards */
const sub={desert:'River map - bridges, island, sandstorms',snow:'Dense jungle - no river, fog and monsoon'};
document.querySelectorAll('#mapMenu button').forEach(b=>{const n=b.textContent;b.innerHTML='<b>'+n+'</b><br><small>'+(sub[b.dataset.map]||'')+'</small>'});

/* end screen with a play-again button */
end=function(t){over=1;const d=$('end');d.style.display='flex';d.innerHTML='<div class="ep"><h1 style="color:'+(t=='VICTORY'?'#8fb573':'#d9604c')+'">'+t+'</h1><button onclick="location.reload()">Play again</button></div>'};
})();
/* ui-portraits.js - paste at the very bottom of ui.js (after its closing })();), or load as its own script after ui.js.
   Adds a pixel-art portrait of the selected unit to the left end of the command card, coloured by that unit's team. */
(()=>{
/* Oil Front unit portraits, stripped-back red-and-black stencil style.
   64x64 pixel grid, output 256x256 (4x, nearest-neighbour). Black silhouettes plus one faction "paper" colour.
   Units: infantry, tank, scout, artillery, engineer, fuel, hq, bridge
   Usage:  const img = OFPortraits.make('tank', OFPortraits.PALETTES[0]);   // PALETTES: blue, red, yellow, green, purple
           ctx.drawImage(img, x, y);   // 256x256 canvas, cache it per unit type + faction */
const OFPortraits = (() => {
  const S = 64, K = 4, INK = '#0a0606';
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const shade = (h, f) => toHex(hex(h).map(v => f < 0 ? v * (1 + f) : v + (255 - v) * f));
  const layer = () => { const c = document.createElement('canvas'); c.width = c.height = S; return [c, c.getContext('2d')]; };
  const inside = (x, y, pts) => {
    let o = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [a, b] = pts[i], [c, d] = pts[j];
      if ((b > y) !== (d > y) && x < (c - a) * (y - b) / (d - b) + a) o = !o;
    }
    return o;
  };
  const tools = g => {
    const r = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
    const p = (x, y, c) => r(x, y, 1, 1, c);
    const disc = (cx, cy, rad, c) => { for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) if (x * x + y * y <= rad * rad + rad * .5) p(cx + x, cy + y, c); };
    const line = (x0, y0, x1, y1, c, w = 1) => {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let i = 0; i <= n; i++) { const t = n ? i / n : 0; r(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), w, w, c); }
    };
    const poly = (pts, c) => { g.fillStyle = c; for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (inside(x + .5, y + .5, pts)) g.fillRect(x, y, 1, 1); };
    return { r, p, disc, line, poly };
  };

  // faction colours, in sprite-sheet order
  const PALETTES = [
    { name: 'blue', paper: '#2f6fbf' }, { name: 'red', paper: '#cf0a0a' }, { name: 'yellow', paper: '#e0b412' },
    { name: 'green', paper: '#3f8a4c' }, { name: 'purple', paper: '#7a3fb0' }
  ];
  const UNITS = [
    { id: 'infantry', label: 'Infantry' }, { id: 'tank', label: 'Tank' }, { id: 'scout', label: 'Scout Car' },
    { id: 'artillery', label: 'Artillery Truck' }, { id: 'engineer', label: 'Engineer' }, { id: 'fuel', label: 'Fuel Truck' },
    { id: 'hq', label: 'HQ Truck' }, { id: 'bridge', label: 'Bridge Layer' }
  ];
  const BUST = { infantry: 1, engineer: 1 };

  // flat paper, dark sun, one black ground mass
  const backdrop = (g, pal, kind) => {
    const t = tools(g);
    t.r(0, 0, S, S, pal.paper);
    t.disc(47, 20, 17, shade(pal.paper, -.2));
    t.r(0, BUST[kind] ? 46 : 57, S, S, pal.ink);
  };

  // red outline hugging the silhouette wherever it overlaps black ground
  const rim = (bg, sub, pal) => {
    const b = bg.getImageData(0, 0, S, S).data, s = sub.getImageData(0, 0, S, S).data, t = tools(bg);
    const A = (x, y) => x >= 0 && y >= 0 && x < S && y < S && s[(y * S + x) * 4 + 3] > 0;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++)
      if (!A(x, y) && (A(x - 1, y) || A(x + 1, y) || A(x, y - 1) || A(x, y + 1)) && b[(y * S + x) * 4] < 40) t.p(x, y, pal.paper);
  };

  // shared bits for the trucks
  const wheel = (t, I, P, x, y, rad) => { t.disc(x, y, rad, P); t.disc(x, y, rad - 1, I); t.p(x, y, P); };
  const cab = (t, I, P, x) => {
    t.poly([[x, 48], [x, 36], [x + 4, 32], [x + 10, 32], [x + 14, 40], [x + 14, 48]], I);
    t.r(x + 5, 34, 5, 4, P);
  };

  const U = {};

  U.infantry = (t, pal, g) => {
    const { r, line, poly } = t, I = pal.ink, P = pal.paper;
    g.save(); g.translate(0, 6);
    line(49, 62, 51, 48, I, 3); line(51, 48, 57, 14, I, 2);
    poly([[8, 64], [10, 50], [16, 44], [26, 42], [38, 42], [48, 44], [54, 50], [56, 64]], I);
    r(27, 36, 10, 8, I);
    line(15, 46, 34, 64, P); line(18, 46, 37, 64, P);
    r(12, 50, 7, 6, P);
    poly([[23, 26], [41, 26], [41, 34], [38, 39], [32, 41], [26, 39], [23, 34]], I);
    r(27, 31, 3, 1, P); r(35, 31, 3, 1, P);
    poly([[19, 24], [19, 18], [22, 13], [28, 10], [36, 10], [42, 13], [45, 18], [45, 24]], I);
    r(18, 23, 28, 3, I);
    r(19, 19, 26, 2, P);
    g.restore();
  };

  U.engineer = (t, pal, g) => {
    const { r, disc, line, poly } = t, I = pal.ink, P = pal.paper;
    g.save(); g.translate(0, 6);
    line(51, 62, 55, 18, I, 2); line(47, 21, 63, 17, I, 3);                   // pickaxe
    poly([[8, 64], [10, 50], [16, 44], [26, 42], [38, 42], [48, 44], [54, 50], [56, 64]], I);
    r(27, 36, 10, 8, I);
    r(24, 47, 1, 17, P); r(39, 47, 1, 17, P); r(24, 58, 16, 1, P);            // hi-vis vest
    poly([[23, 26], [41, 26], [41, 34], [38, 39], [32, 41], [26, 39], [23, 34]], I);
    r(26, 30, 5, 3, P); r(34, 30, 5, 3, P);                                   // goggles
    poly([[20, 24], [20, 18], [23, 13], [29, 10], [35, 10], [41, 13], [44, 18], [44, 24]], I); // hard hat
    poly([[29, 10], [30, 7], [34, 7], [35, 10]], I);
    r(18, 23, 28, 2, I);
    disc(32, 17, 2, P);                                                       // lamp
    g.restore();
  };

  U.tank = (t, pal, g) => {
    const { r, disc, line, poly } = t, I = pal.ink, P = pal.paper;
    g.save(); g.translate(0, 2);
    poly([[6, 50], [8, 47], [57, 47], [59, 50], [59, 55], [57, 58], [8, 58], [6, 55]], I);
    [12, 19, 26, 33, 40, 47].forEach(x => { disc(x, 53, 3, P); disc(x, 53, 2, I); });
    poly([[8, 47], [8, 40], [12, 37], [44, 37], [58, 44], [58, 47]], I);
    r(8, 44, 50, 1, P);
    poly([[22, 37], [24, 29], [30, 25], [40, 25], [45, 29], [47, 37]], I);
    r(25, 31, 20, 2, P);
    r(46, 29, 4, 8, I); r(50, 31, 11, 3, I); r(60, 30, 3, 5, I);
    line(25, 28, 22, 10, I);
    g.restore();
  };

  U.scout = (t, pal, g) => {
    const { r, line, poly } = t, I = pal.ink, P = pal.paper;
    g.save(); g.translate(0, 2);
    wheel(t, I, P, 16, 51, 5); wheel(t, I, P, 48, 51, 5);
    poly([[6, 50], [6, 41], [16, 37], [34, 37], [56, 41], [58, 50]], I);      // body
    poly([[35, 37], [38, 30], [42, 30], [43, 37]], I); r(39, 32, 3, 3, P);   // windshield
    r(13, 32, 6, 5, I);                                                       // seat
    line(25, 37, 25, 28, I, 2); r(25, 26, 9, 2, I);                           // mounted gun
    line(10, 36, 8, 22, I);                                                   // antenna
    r(6, 44, 52, 1, P); r(20, 46, 14, 2, P);
    g.restore();
  };

  U.artillery = (t, pal, g) => {
    const { r, line } = t, I = pal.ink, P = pal.paper;
    g.save(); g.translate(0, 2);
    [12, 26, 50].forEach(x => wheel(t, I, P, x, 52, 4));
    r(4, 42, 40, 6, I); r(4, 45, 40, 1, P);                                   // bed
    line(26, 42, 26, 32, I, 3);                                               // elevating strut
    line(8, 40, 40, 20, I, 6); line(9, 38, 41, 18, P);                        // launcher pod
    cab(t, I, P, 44);
    g.restore();
  };

  U.fuel = (t, pal, g) => {
    const { r, poly } = t, I = pal.ink, P = pal.paper;
    g.save(); g.translate(0, 2);
    [12, 26, 50].forEach(x => wheel(t, I, P, x, 52, 4));
    r(4, 46, 52, 3, I);
    poly([[4, 46], [4, 37], [8, 32], [40, 32], [44, 37], [44, 46]], I);       // tank
    r(20, 29, 8, 3, I); r(21, 30, 6, 1, P);                                   // hatch
    poly([[25, 34], [21, 40], [22, 43], [28, 43], [29, 40]], P);              // oil drop
    r(12, 32, 1, 14, P); r(36, 32, 1, 14, P);
    r(2, 42, 3, 3, I);
    cab(t, I, P, 44);
    g.restore();
  };

  U.hq = (t, pal, g) => {
    const { r, line } = t, I = pal.ink, P = pal.paper;
    g.save(); g.translate(0, 2);
    [12, 26, 50].forEach(x => wheel(t, I, P, x, 52, 4));
    r(4, 46, 52, 3, I); r(4, 34, 40, 12, I);                                  // command box
    r(8, 37, 8, 5, P); r(20, 37, 8, 5, P); r(34, 35, 1, 11, P);               // windows, door
    line(36, 34, 36, 14, I); r(33, 18, 7, 1, I); r(34, 22, 5, 1, I);          // mast
    line(14, 32, 24, 27, I, 3); r(18, 31, 2, 3, I);                           // dish
    cab(t, I, P, 44);
    g.restore();
  };

  U.bridge = (t, pal, g) => {
    const { r, line } = t, I = pal.ink, P = pal.paper;
    g.save(); g.translate(0, 2);
    [8, 18, 28, 50].forEach(x => wheel(t, I, P, x, 52, 4));
    r(4, 42, 40, 6, I); r(4, 45, 40, 1, P);                                   // bed
    r(3, 35, 42, 6, I); for (let x = 7; x < 45; x += 5) r(x, 35, 1, 6, P);   // bridge span
    line(4, 41, 2, 50, I, 2);                                                 // rear leg
    line(16, 42, 24, 28, I, 2); line(24, 28, 33, 35, I, 2);                   // lifting arm
    cab(t, I, P, 44);
    g.restore();
  };

  const make = (kind, pal = PALETTES[0]) => {
    pal = { ink: INK, paper: pal.accent, ...pal };
    const [bc, bg] = layer(); backdrop(bg, pal, kind);
    const [sc, sg] = layer(); (U[kind] || U.infantry)(tools(sg), pal, sg);
    rim(bg, sg, pal);
    const c = document.createElement('canvas'); c.width = c.height = S * K;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.drawImage(bc, 0, 0, S * K, S * K); g.drawImage(sc, 0, 0, S * K, S * K);
    g.strokeStyle = pal.ink; g.lineWidth = 8; g.strokeRect(0, 0, 256, 256);
    return c;
  };

  return { make, PALETTES, UNITS };
})();

/* ---- selection portrait: bottom-left of the command card, coloured by the selected unit's team ---- */
const st2=document.createElement('style');
st2.textContent='#pt{flex:none;align-self:center;position:relative;width:clamp(84px,18vw,128px);aspect-ratio:1;border:1px solid rgba(226,232,214,.2);border-radius:6px;overflow:hidden;box-shadow:0 4px 16px #0008;background:#0a0606}'
 +'#pt canvas{display:block;width:100%;height:100%;image-rendering:pixelated}'
 +'#pt .x{position:absolute;right:4px;bottom:4px;padding:0 6px;border-radius:3px;background:rgba(10,6,6,.78);color:#e4e8dc;font:600 11px/18px ui-sans-serif,system-ui,sans-serif}'
 +'#pt .x:empty{display:none}';
document.head.appendChild(st2);
const pt=document.createElement('div');pt.id='pt';pt.style.display='none';
const pc=document.createElement('canvas');pc.width=pc.height=256;
const pn=document.createElement('span');pn.className='x';
pt.append(pc,pn);document.getElementById('bot').prepend(pt);

/* any CSS colour string -> '#rrggbb' */
const norm=(()=>{const g=document.createElement('canvas').getContext('2d');return c=>{g.fillStyle='#000000';try{g.fillStyle=c}catch(e){}return g.fillStyle}})();

/* game unit type -> portrait; matches on the type id and its display name, order matters */
const KIND=[[/bridge/,'bridge'],[/engineer|sapper/,'engineer'],[/artillery|rocket|mlrs|launcher|howitzer|mortar/,'artillery'],
 [/\bhq\b|command/,'hq'],[/fuel|tanker|truck|oil/,'fuel'],[/scout|jeep|recon|buggy|\bcar\b/,'scout'],[/tank|armou?r/,'tank'],[/infantry|rifle|soldier|trooper|squad/,'infantry']];
const kindOf=t=>{const k=(t+' '+((ST[t]&&ST[t].n)||'')).toLowerCase();for(const [re,v] of KIND)if(re.test(k))return v};

const cache={},warned={};let last='';
const showPortrait=()=>{
 const s=sel&&sel[0];
 if(!s||!ST[s.t]){pt.style.display='none';return}
 const k=kindOf(s.t);
 if(!k){pt.style.display='none';if(!warned[s.t]){warned[s.t]=1;console.warn('portrait: no match for unit type',s.t,ST[s.t].n)}return}
 const f=s.f|0,raw=FC[f],col=typeof raw=='string'?norm(raw):'',
  pal=/^#[0-9a-f]{6}$/.test(col)&&col!='#000000'?{paper:col}:OFPortraits.PALETTES[f%OFPortraits.PALETTES.length],key=k+pal.paper;
 if(key!=last){last=key;pc.getContext('2d').drawImage(cache[key]||(cache[key]=OFPortraits.make(k,pal)),0,0)}
 pn.textContent=sel.length>1?'\u00d7'+sel.length:'';
 pt.style.display='';
};
const _hp=hud;hud=function(){_hp.apply(this,arguments);showPortrait()};
showPortrait();
})();
