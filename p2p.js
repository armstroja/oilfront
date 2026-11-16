/* p2p.js - optional browser-to-browser desert 1v1 mode. */
const NET={active:0,host:0,local:0,peer:null,conn:null,replay:0,last:0,ready:0};
const netPanel=document.querySelector('#mapMenu .panel');
const netMode=document.createElement('div');
netMode.style.cssText='margin-top:18px;padding-top:14px;border-top:1px solid #71835d';
netMode.innerHTML='<b>DESERT 1v1</b><br><small>Browser peer-to-peer match with a room code</small><button id="v1Host">Create room</button><button id="v1Join">Join room</button><div id="v1Room" style="display:none"></div>';
netPanel.appendChild(netMode);
const netMsg=(s)=>{const d=$('v1Room');if(d){d.style.display='block';d.innerHTML=s}};
const ids=()=>sel.map(e=>e.id);
const byId=id=>E.find(e=>e.id==id)||[...rigs,...towns,...hqs].find(e=>e.id==id);

function reset1v1(){
  MYF=NET.local;
  MAP='desert';
  for(const f of F){f.alive=f.i<2?1:0;f.oil=600;f.vis.fill(0);f.gh.clear()}
  E=E.filter(e=>!e.u&&!e.def&&e.f<2);
  for(const [i,h] of hqs.entries()){
    h.f=i<2?i:-1;h.dormant=i>1?1:0;h.cap=0;h.cf=-1;h.gar=i<2?2:0;h.q=[];h.qt=0;
  }
  const spots=[[1200,2150],[1200,250]];
  for(let f=0;f<2;f++){
    const h=hqs[f];
    if(!E.includes(h))E.push(h);
    if(typeof moveHQ=='function')moveHQ(h,spots[f][0],spots[f][1]);else{h.x=spots[f][0];h.y=spots[f][1]}
    unit('scout',f,h.x+50,h.y+(f?70:-70));
    unit('tank',f,h.x-10,h.y+(f?80:-80));
    unit('inf',f,h.x-60,h.y+(f?70:-70));
    unit('eng',f,h.x+60,h.y+(f?70:-70));
  }
  for(const r of rigs){r.f=-1;r.cap=0;r.cf=-1;r.tm=6;r.tk=null}
  for(const t of towns){t.f=-1;t.cap=0;t.cf=-1;t.gar=0}
  for(const b of bridges){b.hp=b.mhp;b.rb=0}
  buildRoads();sel=[];dropping=0;over=0;MAP='desert';applyMap('desert');
  F[MYF].vis.fill(2);updVis();updGh(0);updFog();
  cam.z=Math.max(.2,Math.min(C.width/W,(C.height-90)/W));
  cam.x=(W-C.width/cam.z)/2;cam.y=(W-C.height/cam.z)/2;
  say('Desert 1v1 ready');
}

function state(){
  return {e:E.map(e=>({id:e.id,x:e.x,y:e.y,hp:e.hp,mhp:e.mhp,f:e.f,dead:e.dead,site:e.site,prog:e.prog,cap:e.cap,cf:e.cf,gar:e.gar,oil:e.oil})),
    r:rigs.map(e=>({id:e.id,f:e.f,cap:e.cap,cf:e.cf,tm:e.tm})),b:bridges.map(e=>({x:e.x,hp:e.hp,rb:e.rb})),
    o:F.slice(0,2).map(f=>f.oil)};
}
function applyState(s){
  if(!s)return;
  for(const q of s.e||[]){const e=byId(q.id);if(!e)continue;Object.assign(e,q)}
  for(const q of s.r||[]){const e=rigs.find(x=>x.id==q.id);if(e)Object.assign(e,q)}
  (s.b||[]).forEach((q,i)=>{if(bridges[i])Object.assign(bridges[i],q)});
  (s.o||[]).forEach((o,i)=>{if(F[i])F[i].oil=o});
  updVis();updGh(0);updFog();
}
function send(v){if(NET.conn&&NET.conn.open)NET.conn.send(v)}
function receive(v){
  if(!v||!NET.active)return;
  if(v.type=='state'&&!NET.host){applyState(v.data);return}
  if(v.type=='order'&&NET.host){const old=sel;NET.replay=1;sel=(v.ids||[]).map(byId).filter(Boolean);_netOrder(v.x,v.y);sel=old;NET.replay=0}
  if(v.type=='queue'&&NET.host){const p=byId(v.id);if(p){NET.replay=1;_netQueue(p,v.unit);NET.replay=0}}
  if(v.type=='place'&&NET.host){const old=sel;NET.replay=1;sel=(v.ids||[]).map(byId).filter(Boolean);_netPlace(v.x,v.y,!!v.keep);sel=old;NET.replay=0}
}
function connected(conn,host){
  NET.conn=conn;NET.host=host;NET.active=1;NET.local=host?0:1;MYF=NET.local;
  conn.on('data',receive);conn.on('close',()=>{NET.ready=0;say('Opponent disconnected')});
  reset1v1();$('mapMenu').style.display='none';NET.ready=1;
  if(host)send({type:'state',data:state()});
  say(host?'1v1 host ready':'Joined Desert 1v1');
}
function makePeer(){
  if(typeof Peer=='undefined'){netMsg('PeerJS could not load. Check your connection and try again.');return null}
  return new Peer();
}
function hostRoom(){
  const p=makePeer();if(!p)return;NET.peer=p;
  netMsg('Creating room...');
  p.on('open',id=>netMsg('<b>Room code: '+id+'</b><br><small>Share this code with your opponent.</small><br>Waiting for opponent...'));
  p.on('connection',c=>{if(NET.conn)return;c.on('open',()=>connected(c,true))});
  p.on('error',e=>netMsg('Room error: '+e.type));
}
function joinRoom(){
  const code=prompt('Enter the 1v1 room code:');if(!code)return;
  const p=makePeer();if(!p)return;NET.peer=p;netMsg('Joining room...');
  p.on('open',()=>{const c=p.connect(code.trim());c.on('open',()=>connected(c,false));c.on('error',()=>netMsg('Could not connect to that room.'))});
  p.on('error',e=>netMsg('Room error: '+e.type));
}
document.querySelector('#v1Host').onclick=hostRoom;
document.querySelector('#v1Join').onclick=joinRoom;

const _netOrder=order;
order=function(x,y){_netOrder(x,y);if(NET.active&&!NET.replay)send({type:'order',x,y,ids:ids()})};
const _netQueue=queue;
queue=function(p,t){_netQueue(p,t);if(NET.active&&!NET.replay&&p&&p.f==MYF)send({type:'queue',id:p.id,unit:t})};
const _netPlace=place;
place=function(x,y,keep){_netPlace(x,y,keep);if(NET.active&&!NET.replay)send({type:'place',x,y,keep,ids:ids()})};

const _netUpdate=update;
update=function(dt){
  _netUpdate(dt);
  if(NET.active&&NET.host&&NET.conn&&NET.conn.open&&T-NET.last>.15){NET.last=T;send({type:'state',data:state()})}
};
