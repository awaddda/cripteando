(function(MC){
'use strict';
var store=MC.store, prog=MC.prog, today=MC.today, stats=MC.stats, streak=MC.streak, bestStreak=MC.bestStreak;

var B={db:null,auth:null,user:null,uid:null,local:false,players:{},results:{},groups:{},gmem:{},unsub:{},live:false};
var avisar=function(){},alSesion=function(){};

var reason=function(e){var c=e&&e.code||'';
  if(c==='permission-denied')return 'no tenés permiso para hacer eso. Revisá que hayas iniciado sesión.';
  if(c==='unavailable')return 'no hay conexión. Probá de nuevo en un rato.';
  if(c==='auth/requires-recent-login')return 'por seguridad, cerrá sesión, volvé a entrar y probá de nuevo.';
  return 'probá de nuevo en un rato.'};
function playerDoc(){var s=stats();return {alias:store.alias,ph:store.photo||'',played:s.played,won:s.won,streak:streak(),best:bestStreak(),last:MC.streakLast(),hw:s.hintsWon,u:Date.now()}}
function withRetry(fn){return fn().catch(function(e){if(e&&e.code==='unavailable'){return new Promise(function(r){setTimeout(r,600+Math.random()*600)}).then(fn)}throw e})}
var genCode=function(){var a='ABCDEFGHJKMNPQRSTUVWXYZ23456789',s='';for(var i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return s};

function publish(n){if(!B.db||!B.uid||!store.pub)return Promise.resolve();var p=prog(n),jobs=[];
  if(n===today()&&p.done==='w')jobs.push(withRetry(function(){return B.db.doc('results/'+n+'_'+B.uid).set({n:n,u:B.uid,al:store.alias,ph:store.photo||'',a:p.g.length+1,h:MC.hintsOf(p),t:Date.now()})}));
  jobs.push(withRetry(function(){return B.db.doc('players/'+B.uid).set(playerDoc())}));
  return Promise.all(jobs).catch(function(){})}

function listen(){if(!B.db||B.live)return;B.live=true;
  try{B.db.collection('players').orderBy('won','desc').limit(100).onSnapshot(function(s){B.players={};s.docs.forEach(function(d){B.players[d.id]=d.data()});avisar()},function(){})}catch(e){}
  subResults();
  store.groups.forEach(subGroup)}
var unres=null;
function subResults(){if(!B.db||!B.live)return;if(unres){try{unres()}catch(e){}unres=null}B.results={};
  try{unres=B.db.collection('results').where('n','==',today()).limit(500).onSnapshot(function(s){B.results={};s.docs.forEach(function(d){B.results[d.id]=d.data()});avisar()},function(){})}catch(e){}}
function subGroup(code){if(!B.db||!B.live||B.unsub[code])return;var off=[];
  try{off.push(B.db.doc('groups/'+code).onSnapshot(function(s){B.groups[code]=s.exists?s.data():null;avisar()},function(){B.groups[code]=null;avisar()}))}catch(e){}
  try{off.push(B.db.collection('members').where('g','==',code).onSnapshot(function(s){var m={};s.docs.forEach(function(d){var x=d.data();if(x&&x.u)m[x.u]=!!x.on});B.gmem[code]=m;avisar()},function(){}))}catch(e){}
  B.unsub[code]=function(){off.forEach(function(f){try{f()}catch(e){}})}}
function groupOf(code){var g=B.groups[code];if(!g)return g;var m={},k,now=B.gmem[code]||{};
  for(k in now)m[k]=now[k];
  return {name:g.name,owner:g.owner,members:m}}
function setMember(code,on){return withRetry(function(){return B.db.doc('members/'+code+'_'+B.uid).set({g:code,u:B.uid,on:on,t:Date.now()})})}

var SDK='https://www.gstatic.com/firebasejs/10.14.1/firebase-';
function isLocal(){var l=window.location||{},h=l.hostname||'';return l.protocol==='file:'||h==='localhost'||h==='127.0.0.1'||h==='[::1]'}
function loadScript(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.async=false;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
function connect(alCambiar,cambioSesion){if(alCambiar)avisar=alCambiar;if(cambioSesion)alSesion=cambioSesion;
  var cfg=window.MC_FIREBASE,ready;
  if(cfg&&cfg.apiKey)ready=window.firebase&&window.firebase.firestore?Promise.resolve():loadScript(SDK+'app-compat.js').then(function(){return Promise.all([loadScript(SDK+'auth-compat.js'),loadScript(SDK+'firestore-compat.js')])});
  else if(isLocal()){B.local=true;cfg={apiKey:'local'};ready=(window.firebase&&window.firebase.local?Promise.resolve():loadScript('js/base-local.js?v=20261017-53')).then(function(){return loadBank().then(MC.pistasPlanas,function(){})})}
  else return Promise.resolve();
  return ready.then(function(){return init(cfg)},function(){return null})}
function init(cfg){
  try{if(!firebase.apps.length)firebase.initializeApp(cfg);B.db=firebase.firestore();B.auth=firebase.auth();try{B.auth.languageCode='es'}catch(e){}}catch(e){B.db=null;B.auth=null;return Promise.resolve()}
  return new Promise(function(res){var first=true;
    B.auth.onAuthStateChanged(function(u){B.user=u||null;B.uid=u?u.uid:null;
      if(u)syncIn().then(function(){return B.creating?null:ensureAlias()}).then(function(){publish(today());if(!B.creating)alSesion()});
      if(first){first=false;res()}else if(!B.creating&&!u)alSesion()},function(){if(first){first=false;res()}})})}
function login(){if(!B.auth)return Promise.reject({code:'no-config'});var p=new firebase.auth.GoogleAuthProvider();
  return B.auth.signInWithPopup(p).catch(function(e){var c=e&&e.code||'';
    if(c==='auth/popup-blocked'||c==='auth/operation-not-supported-in-this-environment'||c==='auth/cancelled-popup-request')return B.auth.signInWithRedirect(p);
    throw e})}
function wipeLocal(){store.hist={};store.prog={};store.learn={};store.votes={};store.subs=[];store.groups=[];store.draft={};store.uname='';store.photo='';store.pub=true;store.showName=true;
  store.owner='';store.alias='Jugador'+(100+Math.floor(Math.random()*900));for(var k in B.unsub){try{B.unsub[k]()}catch(e){}}B.unsub={};B.groups={};B.gmem={};MC.save()}
function logout(){clearTimeout(upT);var go=B.uid?upload():Promise.resolve();return go.then(function(){return B.auth?B.auth.signOut():null}).then(wipeLocal)}
var loginReason=function(e){var c=e&&e.code||'';try{console.warn('Cripteando, sesión:',c||e,e&&e.message||'')}catch(x){}
  if(c==='auth/popup-closed-by-user')return 'Cerraste la ventana antes de terminar. Probá de nuevo.';
  if(c==='auth/unauthorized-domain')return 'Este dominio todavía no está autorizado para iniciar sesión.';
  if(c==='auth/network-request-failed'||c==='unavailable')return 'No hay conexión. Probá de nuevo en un rato.';
  if(c==='auth/invalid-credential'||c==='auth/wrong-password'||c==='auth/user-not-found'||c==='auth/invalid-login-credentials')return 'El email o la contraseña no coinciden.';
  if(c==='auth/email-already-in-use')return 'Ya hay una cuenta con ese email. Probá entrar.';
  if(c==='auth/weak-password')return 'La contraseña tiene que tener al menos 6 caracteres.';
  if(c==='auth/invalid-email'||c==='auth/missing-email')return 'Ese email no parece válido.';
  if(c==='auth/too-many-requests')return 'Hubo demasiados intentos. Esperá un rato y probá de nuevo.';
  if(c==='name-taken')return 'Ese nombre de usuario ya está en uso. Probá con otro.';
  if(c==='name-taken-after')return 'Tu cuenta se creó, pero alguien tomó ese nombre de usuario justo antes. Elegí otro acá abajo, en Perfil.';
  if(c==='name-after')return 'Tu cuenta se creó, pero no pude guardar tu nombre de usuario. Escribilo de nuevo acá abajo, en Perfil.';
  if(c==='auth/operation-not-allowed'||c==='auth/admin-restricted-operation')return 'Las cuentas con email y contraseña no están activadas todavía.';
  if(c==='no-bank')return 'No encontré privado/banco.js. Abrí la página desde tu compu, con localhost.';
  if(c==='permission-denied')return 'La base de datos no deja guardar esto. Revisá que las reglas de Firestore estén publicadas.';
  if(c==='auth/configuration-not-found')return 'El inicio de sesión no está activado en Firebase. Entrá a Authentication y tocá Comenzar.';
  if(c==='failed-precondition'||c==='not-found')return 'Todavía no está creada la base de datos de Firestore.';
  if(/api-key/.test(c))return 'La clave de Firebase no es válida. Revisá js/config.js.';
  if(c==='name-invalid')return 'El nombre de usuario tiene que tener de 3 a 20 letras, números, puntos o guiones bajos, sin espacios.';
  return 'No pude iniciar sesión. Probá de nuevo en un rato.'};
var nameKey=function(n){return String(n||'').trim().toLowerCase()};
var nameOk=function(n){return /^[a-z0-9_.]{3,20}$/.test(nameKey(n))};
function nameFree(n){if(!nameOk(n))return Promise.reject({code:'name-invalid'});var k=nameKey(n);
  return B.db.doc('usernames/'+k).get().then(function(s){if(s.exists&&(!B.uid||s.data().uid!==B.uid))throw {code:'name-taken'};return k})}
// Reservar el nombre nuevo, liberar el anterior y guardarlo en el perfil van juntos (todo o nada): las reglas no dejan juntar nombres
function claimName(n){var k,alias=String(n).trim().slice(0,20);return nameFree(n).then(function(key){k=key;var old=store.uname;
    return withRetry(function(){var b=B.db.batch(),d=cloudDoc();d.uname=k;d.alias=alias;
      if(old!==k)b.set(B.db.doc('usernames/'+k),{uid:B.uid});if(old&&old!==k)b.delete(B.db.doc('usernames/'+old));
      b.set(B.db.doc('saves/'+B.uid),d);return b.commit()})})
  .then(function(){store.uname=k;store.alias=alias;MC.save();if(B.user&&B.user.updateProfile)B.user.updateProfile({displayName:store.alias}).catch(function(){});return publish(today())})}
// Las reglas solo aceptan publicar con un nombre reservado o el automático JugadorNNN. Si alguien se puso otro nombre
// antes de iniciar sesión, al entrar se intenta reservar; si no se puede (tomado o inválido), vuelve a uno automático.
function ensureAlias(){if(store.uname||/^Jugador\d{3}$/.test(store.alias))return Promise.resolve();
  return claimName(store.alias).catch(function(){store.alias='Jugador'+(100+Math.floor(Math.random()*900));MC.save()})}
function signUp(name,email,pass){if(!B.auth)return Promise.reject({code:'no-config'});
  return nameFree(name).then(function(){B.creating=true;return B.auth.createUserWithEmailAndPassword(String(email).trim(),pass)})
    .then(function(cred){B.user=cred.user;B.uid=cred.user.uid;if(cred.user.sendEmailVerification)cred.user.sendEmailVerification().catch(function(){});
      return claimName(name).catch(function(e){throw {code:e&&e.code==='name-taken'?'name-taken-after':'name-after'}})})
    .then(function(){B.creating=false;alSesion()},function(e){var was=B.creating;B.creating=false;if(was&&B.uid)alSesion();throw e})}
function signIn(email,pass){if(!B.auth)return Promise.reject({code:'no-config'});return B.auth.signInWithEmailAndPassword(String(email).trim(),pass)}
function resetPass(email){if(!B.auth)return Promise.reject({code:'no-config'});return B.auth.sendPasswordResetEmail(String(email).trim())}
function setPhoto(dataUrl){store.photo=dataUrl||'';MC.save();return publish(today())}

var SYNC=['hist','prog','learn','votes','subs'],upT=null,syncing=false;
function cloudDoc(){return {hist:store.hist,prog:store.prog,learn:store.learn,votes:store.votes,subs:store.subs.slice(-50),alias:store.alias,uname:store.uname||'',photo:store.photo||'',pub:!!store.pub,showName:!!store.showName,theme:store.theme||'',u:Date.now()}}
// Partidas: si los datos locales son de esta misma cuenta (jugó con sesión y no llegó a subirse), se queda con el mejor resultado.
// Si se jugaron sin sesión o con otra cuenta, en las pistas que la cuenta ya empezó o terminó gana la cuenta (lo local se descarta);
// las que la cuenta nunca tocó se suman. Así no se puede rehacer una pista sin sesión para mejorar intentos o ayudas.
var touched=function(p){return !!(p&&typeof p==='object'&&((Array.isArray(p.g)&&p.g.length)||p.hd||p.hi||p.hm||p.hl||p.done))};
function mergeCloud(r){if(!r||typeof r!=='object')return;var rh=r.hist||{},rp=r.prog||{},k,mine=!!store.owner&&store.owner===B.uid;
  if(mine){
    for(k in rh){var l=store.hist[k],x=rh[k];if(!x||typeof x!=='object')continue;
      if(!l||(x.r==='w'&&l.r!=='w')||(x.r===l.r&&(x.a|0)<(l.a|0))){store.hist[k]=x;if(rp[k])store.prog[k]=rp[k]}}
    for(k in rp)if(!store.prog[k]&&!store.hist[k])store.prog[k]=rp[k];
  }else{
    for(k in rh){if(!rh[k]||typeof rh[k]!=='object')continue;store.hist[k]=rh[k];if(rp[k])store.prog[k]=rp[k]}
    for(k in rp)if(!rh[k]&&touched(rp[k])){store.prog[k]=rp[k];delete store.hist[k]}
  }
  var rl=r.learn||{};for(k in rl){if(!store.learn[k])store.learn[k]={};for(var j in rl[k])store.learn[k][j]=true}
  var rv=r.votes||{};for(k in rv)if(!(k in store.votes))store.votes[k]=rv[k];
  var seen={};store.subs.forEach(function(s){seen[s.t]=1});(Array.isArray(r.subs)?r.subs:[]).forEach(function(s){if(s&&!seen[s.t])store.subs.push(s)});store.subs.sort(function(a,b){return a.t-b.t});
  if(typeof r.uname==='string'&&r.uname){store.uname=r.uname;if(typeof r.alias==='string'&&r.alias)store.alias=r.alias.slice(0,24)}
  else if(typeof r.alias==='string'&&r.alias&&/^Jugador\d{3}$/.test(store.alias))store.alias=r.alias.slice(0,24);
  if(typeof r.photo==='string'&&/^data:image\/jpeg;base64,/.test(r.photo)&&!store.photo)store.photo=r.photo;
  if(typeof r.pub==='boolean')store.pub=r.pub;if(typeof r.showName==='boolean')store.showName=r.showName;
  if(['','light','dark'].indexOf(r.theme)>-1)store.theme=r.theme}
function upload(){if(!B.db||!B.uid)return Promise.resolve();return withRetry(function(){return B.db.doc('saves/'+B.uid).set(cloudDoc())}).catch(function(){})}
function scheduleUpload(){if(syncing||!B.db||!B.uid)return;clearTimeout(upT);upT=setTimeout(upload,1500)}
function syncIn(){if(!B.db||!B.uid)return Promise.resolve();syncing=true;
  return withRetry(function(){return B.db.doc('saves/'+B.uid).get()}).then(function(s){if(s.exists)mergeCloud(s.data());store.owner=B.uid;MC.save();syncing=false;return upload()})
  .catch(function(){syncing=false})}
MC.alGuardar=scheduleUpload;

// Borra todos los documentos propios de una colección (resultados de todos los días, votos)
function wipeMine(name){return B.db.collection(name).where('u','==',B.uid).get().then(function(s){return Promise.all(s.docs.map(function(d){return d.ref.delete()}))}).catch(function(){})}
function setPublic(on){store.pub=!!on;MC.save();if(!B.db||!B.uid)return Promise.resolve();
  if(on)return publish(today());
  return Promise.all([B.db.doc('players/'+B.uid).delete().catch(function(){}),wipeMine('results')])}
function sendFeedback(kind,msg){return withRetry(function(){return B.db.collection('feedback').add({u:B.uid,al:store.alias,kind:kind,msg:msg,t:Date.now()})})}
function deleteAccount(){if(!B.user)return Promise.reject({code:'no-user'});var uid=B.uid,u=B.user;
  var leave=store.groups.map(function(c){return setMember(c,false).catch(function(){})});
  return Promise.all(leave.concat([store.uname?B.db.doc('usernames/'+store.uname).delete():Promise.resolve(),B.db.doc('saves/'+uid).delete(),B.db.doc('players/'+uid).delete(),wipeMine('results'),wipeMine('votes')])).catch(function(){})
  .then(function(){return u.delete().catch(function(e){if(e&&e.code==='auth/requires-recent-login'&&(u.providerData||[]).some(function(p){return p&&p.providerId==='google.com'}))return u.reauthenticateWithPopup(new firebase.auth.GoogleAuthProvider()).then(function(){return u.delete()});throw e})}).then(wipeLocal)}

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
  return withRetry(function(){return B.db.doc('votes/'+n+'_'+B.uid).set({n:n,u:B.uid,v:v||'',t:Date.now()})}).catch(function(){})}

function fetchClues(ns){var need=MC.faltan(ns);if(!need.length)return Promise.resolve(false);
  if(!B.db)return Promise.reject({code:'unavailable'});
  var from=Math.min.apply(null,need),T=today(),to=Math.min(Math.max.apply(null,need),T);if(from>to)return Promise.resolve(false);
  var q=function(t){return B.db.collection('pistas').where('n','>=',from).where('n','<=',t).orderBy('n').get()};
  return withRetry(function(){return q(to)}).catch(function(e){if(e&&e.code==='permission-denied'&&to>from)return q(to-1);throw e})
    .then(function(s){var m={};s.docs.forEach(function(d){var x=d.data();if(x&&typeof x.c==='string'&&typeof x.n==='number')m[x.n]=x.c});return MC.guardarPistas(m)},function(e){try{console.warn('Cripteando, pistas:',e&&e.code||e,e&&e.message||'')}catch(x){}throw e})}
function refreshToday(){if(!B.db)return Promise.resolve(false);var T=today();
  return withRetry(function(){return B.db.doc('pistas/'+T).get()}).then(function(s){if(!s.exists)return false;var x=s.data(),m={};if(x&&typeof x.c==='string'){m[T]=x.c;return MC.guardarPistas(m)}return false},function(){return false})}
function quickToday(){var cfg=window.MC_FIREBASE,T=today();if(!cfg||!cfg.projectId||!window.fetch||MC.clueOf(T))return Promise.resolve(false);
  return fetch('https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(cfg.projectId)+'/databases/(default)/documents/pistas/'+T+'?key='+encodeURIComponent(cfg.apiKey||''))
    .then(function(r){return r.ok?r.json():null}).then(function(j){var c=j&&j.fields&&j.fields.c&&j.fields.c.stringValue,m={};if(!c)return false;m[T]=c;MC.guardarPistas(m);return !!MC.clueOf(T)})
    .catch(function(){return false})}
function loadBank(fresh){if(!fresh&&Array.isArray(window.MC_BANCO))return Promise.resolve(window.MC_BANCO);window.MC_BANCO=null;
  return loadScript('privado/banco.js?t='+Date.now()).then(function(){if(!Array.isArray(window.MC_BANCO))throw {code:'no-bank'};return window.MC_BANCO},function(){throw {code:'no-bank'}})}
function isAdmin(){return !!(B.uid&&(B.local||B.uid===window.MC_ADMIN))}
// meta/pistas guarda cuándo se editó cada pista ({e:{n:hora}}): así los navegadores que ya la tenían guardada saben que tienen que volver a pedirla
function markEdited(ns){var ref=B.db.doc('meta/pistas');return withRetry(function(){return ref.get()}).then(function(s){var e=(s.exists&&s.data().e)||{},t=Date.now();ns.forEach(function(n){e[n]=t});return ref.set({e:e})}).catch(function(){})}
var KSEEN='mc_pistas_v';
function checkEdits(){if(!B.db)return Promise.resolve(false);var seen={};try{seen=JSON.parse(localStorage.getItem(KSEEN)||'{}')||{}}catch(e){}
  return B.db.doc('meta/pistas').get().then(function(s){var e=(s.exists&&s.data().e)||{},T=today(),ch=false;
    var todo=Object.keys(e).filter(function(k){return +k<=T&&e[k]>(seen[k]||0)&&MC.clueOf(+k)});
    return Promise.all(todo.map(function(k){return B.db.doc('pistas/'+k).get().then(function(d){var x=d.exists?d.data():null,m={};
      if(x&&typeof x.c==='string'){m[k]=x.c;if(MC.guardarPistas(m))ch=true}else{MC.quitarPista(+k);ch=true}seen[k]=e[k]})}))
    .then(function(){try{localStorage.setItem(KSEEN,JSON.stringify(seen))}catch(x){}return ch})}).catch(function(){return false})}
function uploadClues(){if(!isAdmin())return Promise.reject({code:'permission-denied'});
  return loadBank(true).then(function(list){var i=0,n=list.length,done=0;
    var ns=[],next=function(){if(i>=n)return markEdited(ns).then(function(){return done});var k=++i,c=list[k-1];if(!MC.pistaValida(c))return next();
      return withRetry(function(){return B.db.doc('pistas/'+k).set({n:k,c:MC.codificar(c)})}).then(function(){done++;ns.push(k);return next()})};
    return next()})}
function adminOnly(){return isAdmin()&&B.db?null:Promise.reject({code:'permission-denied'})}
function allClues(){return adminOnly()||withRetry(function(){return B.db.collection('pistas').orderBy('n').get()}).then(function(s){var out=[],m={},T=today();
  s.docs.forEach(function(d){var x=d.data(),c=x&&typeof x.c==='string'?MC.decodificar(x.c):null;if(c&&typeof x.n==='number'){out.push({n:x.n,c:c});if(x.n<=T)m[x.n]=x.c}});
  MC.guardarPistas(m);return out})}
function saveClue(n,c){return adminOnly()||Promise.resolve().then(function(){if(!MC.pistaValida(c))throw {code:'bad-clue'};var h=MC.codificar(c);
  return withRetry(function(){return B.db.doc('pistas/'+n).set({n:n,c:h})}).then(function(){if(n<=today()){var m={};m[n]=h;MC.guardarPistas(m)}return markEdited([n])})})}
function deleteClue(n){return adminOnly()||withRetry(function(){return B.db.doc('pistas/'+n).delete()}).then(function(){MC.quitarPista(n);return markEdited([n])})}
function listOf(name){return adminOnly()||withRetry(function(){return B.db.collection(name).orderBy('t','desc').limit(100).get()}).then(function(s){return s.docs.map(function(d){var x=d.data()||{};x.id=d.id;return x})})}
// Votos por pista: {n:{up,down}}. Los votos se pueden leer públicamente, pero solo el panel de admin los cuenta
function countVotes(){return adminOnly()||withRetry(function(){return B.db.collection('votes').get()}).then(function(s){var m={};
  s.docs.forEach(function(d){var x=d.data()||{},n=x.n;if(typeof n!=='number'||(x.v!=='up'&&x.v!=='down'))return;if(!m[n])m[n]={up:0,down:0};m[n][x.v]++});return m})}
function markSub(id,st){return adminOnly()||withRetry(function(){return B.db.doc('submissions/'+id).update({st:st})})}

function sendClue(d){return withRetry(function(){return B.db.collection('submissions').add({u:B.uid,al:d.pub?store.alias:'',pub:!!d.pub,text:d.text,answer:d.answer,mechs:d.mechs.join(','),seg:JSON.stringify(d.seg),exp:d.exp,hd:d.hd||'',hi:d.hi||'',hm:d.hm||'',extra:JSON.stringify(d.extra||[]),notes:d.notes||'',t:d.t,st:'pendiente'})})}

MC.base={
  conectar:connect,
  escuchar:listen,
  conectada:function(){return !!B.db},
  local:function(){return B.local&&!!B.db},
  lista:function(){return !!(B.db&&B.uid)},
  uid:function(){return B.uid},
  usuario:function(){return B.user?{nombre:B.user.displayName||'',email:B.user.email||'',google:(B.user.providerData||[]).some(function(p){return p&&p.providerId==='google.com'}),verificado:!!B.user.emailVerified}:null},
  puedeEscribir:function(){return B.uid?true:null},
  entrar:login,
  salir:logout,
  motivoSesion:loginReason,
  crearCuenta:signUp,
  entrarConEmail:signIn,
  recuperarClave:resetPass,
  cambiarNombre:claimName,
  nombreValido:nameOk,
  cambiarFoto:setPhoto,
  jugadores:function(){return B.players},
  resultados:function(){return B.results},
  grupo:groupOf,
  nuevoDia:subResults,
  publicar:publish,
  suscribirGrupo:subGroup,
  crearGrupo:createGroup,
  unirseAGrupo:joinGroup,
  salirDeGrupo:leaveGroup,
  votar:vote,
  enviarPista:sendClue,
  publico:setPublic,
  enviarComentario:sendFeedback,
  eliminarCuenta:deleteAccount,
  sincronizar:syncIn,
  pistas:fetchClues,
  pistaDeHoy:refreshToday,
  pistaRapida:quickToday,
  revisarPistas:checkEdits,
  esAdmin:isAdmin,
  subirPistas:uploadClues,
  todasLasPistas:allClues,
  guardarPista:saveClue,
  borrarPista:deleteClue,
  envios:function(){return listOf('submissions')},
  comentarios:function(){return listOf('feedback')},
  marcarEnvio:markSub,
  votos:countVotes,
  motivo:reason
};
})(window.MC);
