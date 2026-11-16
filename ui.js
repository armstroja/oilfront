/* ui.js - load LAST (after extras.js). Pure skin: restyles the HUD and menus, no gameplay changes. */
(()=>{
const css=`
:root{--bg:rgba(14,19,12,.9);--line:#4d5d3f;--hi:#e8b04a;--txt:#dfe6d2;--dim:#9aa88c}
/* top resource pills */
#top{left:8px;right:auto;top:calc(env(safe-area-inset-top,0px) + 8px);padding:0;background:none;gap:6px;flex-wrap:wrap;max-width:calc(100vw - 230px)}
#top span{background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:3px 11px;font-size:13px;color:var(--dim);box-shadow:0 2px 8px #0008}
#top span b{color:var(--hi);margin-left:4px}
#top span:nth-child(1)::before{content:'\\26FD '}#top span:nth-child(2)::before{content:'\\1F6E2 '}#top span:nth-child(3)::before{content:'\\1F69A '}
#top span:nth-child(4)::before{content:'\\2691 '}#top span:nth-child(5)::before{content:'\\2601 '}
/* toast */
#msg{left:50%;right:auto;transform:translateX(-50%);width:max-content;max-width:80vw;top:calc(env(safe-area-inset-top,0px) + 48px);padding:6px 18px;background:var(--bg);border:1px solid var(--hi);border-radius:20px;font-size:14px}
#msg:empty{display:none}
/* command card */
#bot{left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--bg);backdrop-filter:blur(4px);box-shadow:0 4px 22px #000b;align-items:stretch;gap:14px}
#info{border-right:1px solid var(--line);padding-right:14px;min-height:70px;line-height:1.5;color:var(--txt)}
.hpbar{height:6px;margin:5px 0 2px;background:#000;border:1px solid var(--line);border-radius:3px;overflow:hidden}.hpbar i{display:block;height:100%}
#btns{align-content:flex-start}
#btns button{display:flex;align-items:center;gap:7px;background:linear-gradient(#2a3822,#1a2316);border:1px solid var(--line);border-radius:7px;padding:6px 10px;color:var(--txt);transition:border-color .12s,transform .12s,background .12s}
#btns button:not(:disabled):hover{border-color:var(--hi);transform:translateY(-1px);background:linear-gradient(#34452b,#1f2b1a)}
#btns button:disabled{opacity:.35;cursor:not-allowed}
#btns button .k{background:#0b0f09;border:1px solid var(--line);border-radius:4px;padding:0 6px;font-size:11px;color:var(--hi)}
#btns button .c{color:var(--hi);font-weight:bold}#btns button .c::before{content:'\\26FD';font-weight:normal;margin-right:2px;font-size:11px}
#b_bld,#x_arm{margin-left:12px}
/* minimap */
#mm{width:170px;height:170px;border:2px solid var(--line);border-radius:10px;box-shadow:0 0 14px #000b}
/* build menu */
#dm{left:8px;bottom:170px;border-radius:12px;width:270px;background:var(--bg);box-shadow:0 4px 22px #000b}
#dm button{border-radius:7px;background:linear-gradient(#2a3822,#1a2316);transition:border-color .12s}
#dm button:not(:disabled):hover{border-color:var(--hi)}
/* main menu */
#mapMenu .panel{border-radius:14px;min-width:340px}
#mapMenu button{border-radius:8px;padding:12px;text-align:left}#mapMenu button small{color:var(--dim)}
#mapMenu select{background:#1d2619;color:var(--txt);border:1px solid var(--line);border-radius:4px;padding:2px}
/* end screen */
#end .ep{text-align:center;background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:26px 46px}
#end .ep h1{margin:0 0 16px;font-size:46px;letter-spacing:4px}
#end .ep button{background:#263522;color:var(--txt);border:1px solid var(--hi);border-radius:8px;padding:10px 22px;font:inherit;font-size:15px;cursor:pointer}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* wrap a button's textContent so engine updates render as [key] name cost, only touching the DOM when the text changes */
const fmt=v=>{if(!v.trim())return'';const k=v.match(/^([A-Z]) (.+?)(?: (\d+))?$/),m=k||v.match(/^()(.+?)(?: (\d+))?$/);return(m[1]?'<span class="k">'+m[1]+'</span>':'')+'<span>'+m[2]+'</span>'+(m[3]?'<span class="c">'+m[3]+'</span>':'')};
const skin=b=>{if(!b||b._sk)return;b._sk=1;b._raw=b.textContent;Object.defineProperty(b,'textContent',{get(){return this._raw},set(v){if(v!==this._raw){this._raw=v;this.innerHTML=fmt(v)}}});b.innerHTML=fmt(b._raw)};
const skinAll=()=>['b_bld','b_cut','b_dig','b_dep','x_arm','x_pump',...ORDER.map(t=>'b_'+t)].forEach(id=>skin($(id)));
skinAll();

/* tooltips with unit stats */
ORDER.forEach(t=>{const s=ST[t],b=$('b_'+t);if(b)b.title=s.n+' - '+s.hp+' HP'+(s.dmg?', '+s.dmg+' dmg, range '+s.rng:'')+', speed '+s.spd});
if($('x_arm'))$('x_arm').title='-15% damage taken per level (units)';if($('x_pump'))$('x_pump').title='+0.5 oil/s per owned rig, per level';
if($('b_bld'))$('b_bld').title='Build defences (needs an engineer)';

/* health bar under the selection info */
const _h=hud;hud=function(){_h();skinAll();const s=sel[0];if(sel.length==1&&s&&s.mhp&&s.hp>=0){const v=Math.max(0,Math.min(1,s.hp/s.mhp));$('info').innerHTML+='<div class="hpbar"><i style="width:'+v*100+'%;background:'+(v>.5?'#6c6':v>.25?'#ec4':'#e54')+'"></i></div>'}};

/* nicer map menu cards */
const sub={desert:'River map - bridges, island, sandstorms',snow:'Dense jungle - no river, fog and monsoon'};
document.querySelectorAll('#mapMenu button').forEach(b=>{const n=b.textContent;b.innerHTML='<b>'+n+'</b><br><small>'+(sub[b.dataset.map]||'')+'</small>'});

/* end screen with a play-again button */
end=function(t){over=1;const d=$('end');d.style.display='flex';d.innerHTML='<div class="ep"><h1 style="color:'+(t=='VICTORY'?'#7fdc7f':'#e5604a')+'">'+t+'</h1><button onclick="location.reload()">Play again</button></div>'};
})();
