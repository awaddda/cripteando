(function(MC){
'use strict';
var store=MC.store, prog=MC.prog, today=MC.today, stats=MC.stats, streak=MC.streak, bestStreak=MC.bestStreak;

var B={db:null,user:null,uid:null,canWrite:null,players:{},results:{},groups:{},gmem:{},unsub:{}};
var avisar=function(){};

var reason=function(e){return e&&e.code==='invalid_argument'?'tu cuenta no tiene permiso para escribir en esta página.':'probá de nuevo en un rato.'};
function playerDoc(){var s=stats();return {alias:store.alias,c:store.color,played:s.played,won:s.won,streak:streak(),best:bestStreak(),u:Date.now()}}
function withRetry(fn){return fn().catch(function(e){if(e&&e.code==='unavailable'){return new Promise(function(r){setTimeout(r,600+Math.random()*600)}).then(fn)}throw e})}
var genCode=function(){var a='ABCDEFGHJKMNPQRSTUVWXYZ23456789',s='';for(var i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return s};

function publish(n){if(!B.db||!B.uid)return Promise.resolve();var p=prog(n),jobs=[];

  if(n===today()&&p.done==='w')jobs.push(withRetry(function(){return B.db.doc('results/'+n+'_'+B.uid).set({n:n,u:B.uid,al:store.alias,c:store.color,a:p.g.length+1,h:MC.hintsOf(p),t:Date.now()})}));
  jobs.push(withRetry(function(){return B.db.doc('players/'+B.uid).set(playerDoc())}));
  return Promise.all(jobs).catch(function(e){if(e&&e.code==='invalid_argument')B.canWrite=false})}

function startLive(){
  if(!B.db)return;
  try{B.db.collection('players').limit(300).onSnapshot(function(s){B.players={};s.docs.forEach(function(d){B.players[d.id]=d.data()});avisar()},function(){})}catch(e){}
  subResults();
  store.groups.forEach(subGroup)}

var unres=null;
function subResults(){if(!B.db)return;if(unres){try{unres()}catch(e){}unres=null}B.results={};
  try{unres=B.db.collection('results').where('n','==',today()).onSnapshot(function(s){B.results={};s.docs.forEach(function(d){B.results[d.id]=d.data()});avisar()},function(){})}catch(e){}}

function subGroup(code){if(!B.db||B.unsub[code])return;var off=[];
  try{off.push(B.db.doc('groups/'+code).onSnapshot(function(s){B.groups[code]=s.exists?s.data():null;avisar()},function(){}))}catch(e){}
  try{off.push(B.db.collection('members').where('g','==',code).onSnapshot(function(s){var m={};s.docs.forEach(function(d){var x=d.data();if(x&&x.u)m[x.u]=!!x.on});B.gmem[code]=m;avisar()},function(){}))}catch(e){}
  B.unsub[code]=function(){off.forEach(function(f){try{f()}catch(e){}})}}

function groupOf(code){var g=B.groups[code];if(!g)return g;var m={},k,old=g.members||{},now=B.gmem[code]||{};
  for(k in old)m[k]=!!old[k];for(k in now)m[k]=now[k];
  return {name:g.name,owner:g.owner,members:m}}
function setMember(code,on){return withRetry(function(){return B.db.doc('members/'+code+'_'+B.uid).set({g:code,u:B.uid,on:on,t:Date.now()})})}

function connect(alCambiar){if(alCambiar)avisar=alCambiar;
  var use=function(n){try{return window.claude&&window.claude.use?window.claude.use(n).catch(function(){return null}):Promise.resolve(null)}catch(e){return Promise.resolve(null)}};
  return Promise.all([use('user'),use('db')]).then(function(r){B.user=r[0];B.db=r[1];
    return (B.user?Promise.all([B.user.id(),B.user.can('data.write')]):Promise.resolve([null,null])).then(function(x){B.uid=x[0];B.canWrite=x[1];startLive()})})}

function createGroup(name){var code=genCode();
  return withRetry(function(){return B.db.doc('groups/'+code).get()}).then(function(s){if(s.exists){code=genCode()}
    return withRetry(function(){return B.db.doc('groups/'+code).set({name:name,owner:B.uid,t:Date.now()})})})
  .then(function(){return setMember(code,true)}).then(function(){return code})}
function joinGroup(code){
  return withRetry(function(){return B.db.doc('groups/'+code).get()}).then(function(s){
    if(!s.exists)return null;
    return setMember(code,true).then(function(){return s.data()})})}
function leaveGroup(c){if(B.db&&B.uid)setMember(c,false).catch(function(){});
  if(B.unsub[c]){try{B.unsub[c]()}catch(e){}delete B.unsub[c]}}

function vote(n,v){if(!B.db||!B.uid)return Promise.resolve();
  return withRetry(function(){return B.db.doc('votes/'+n+'_'+B.uid).set({n:n,u:B.uid,v:v||'',t:Date.now()})}).catch(function(e){if(e&&e.code==='invalid_argument')B.canWrite=false})}

function sendClue(item){return withRetry(function(){return B.db.collection('submissions').add({u:B.uid,al:store.alias,text:item.text,answer:item.answer,mech:item.mech,exp:item.exp,t:item.t,st:'pendiente'})})}

MC.base={
  conectar:connect,
  conectada:function(){return !!B.db},
  lista:function(){return !!(B.db&&B.uid)},
  uid:function(){return B.uid},
  puedeEscribir:function(){return B.canWrite},
  jugadores:function(){return B.players},
  resultados:function(){return B.results},
  grupo:groupOf,
  nuevoDia:subResults,
  publicar:publish,
  suscribirGrupo:subGroup,
  crearGrupo:createGroup,
  unirseAGrupo:joinGroup,
  salirDeGrupo:leaveGroup,
  enviarPista:sendClue,
  votar:vote,
  motivo:reason
};
})(window.MC);
