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
