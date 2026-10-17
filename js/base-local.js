(function(){
'use strict';
var KDB='mc_local_db',KAU='mc_local_auth';
function read(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v&&typeof v==='object'?v:d}catch(e){return d}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var DB=read(KDB,{}),AU=read(KAU,{accounts:{},current:null}),subs=[],seq=Date.now();
var copy=function(x){return x==null?x:JSON.parse(JSON.stringify(x))};
var later=function(f){return new Promise(function(r,j){setTimeout(function(){try{r(f())}catch(e){j(e)}},40)})};
function notify(){subs.slice().forEach(function(f){try{f()}catch(e){}})}
function commit(){write(KDB,DB);setTimeout(notify,0)}
window.addEventListener('storage',function(e){if(e.key===KDB){DB=read(KDB,{});notify()}});
function snap(path){return {id:path.split('/').pop(),exists:path in DB,ref:doc(path),data:function(){return copy(DB[path])}}}
function watch(f){subs.push(f);setTimeout(f,0);return function(){var i=subs.indexOf(f);if(i>-1)subs.splice(i,1)}}

function doc(path){return {
  get:function(){return later(function(){return snap(path)})},
  set:function(d){return later(function(){DB[path]=copy(d);commit()})},
  update:function(d){return later(function(){if(!(path in DB))throw {code:'not-found'};var o=DB[path];for(var k in d)o[k]=copy(d[k]);commit()})},
  delete:function(){return later(function(){delete DB[path];commit()})},
  onSnapshot:function(cb){return watch(function(){cb(snap(path))})}}}
function query(name,q){q=q||{f:[],o:null,n:0};
  var run=function(){var pre=name+'/',ids=Object.keys(DB).filter(function(p){if(p.indexOf(pre)!==0||p.slice(pre.length).indexOf('/')>-1)return false;
      return q.f.every(function(w){var x=DB[p][w[0]];return w[1]==='>='?x>=w[2]:w[1]==='<='?x<=w[2]:w[1]==='>'?x>w[2]:w[1]==='<'?x<w[2]:x===w[2]})});
    if(q.o)ids.sort(function(a,b){var x=DB[a][q.o[0]]||0,y=DB[b][q.o[0]]||0;return q.o[1]==='desc'?y-x:x-y});
    if(q.n)ids=ids.slice(0,q.n);
    return {docs:ids.map(snap),size:ids.length}};
  var nq=function(ch){return query(name,{f:q.f.concat(ch.f||[]),o:ch.o||q.o,n:ch.n||q.n})};
  return {
    where:function(k,op,v){return nq({f:[[k,op,v]]})},
    orderBy:function(k,dir){return nq({o:[k,dir||'asc']})},
    limit:function(n){return nq({n:n})},
    get:function(){return later(run)},
    add:function(d){return later(function(){var id='l'+(++seq).toString(36);DB[name+'/'+id]=copy(d);commit();return doc(name+'/'+id)})},
    onSnapshot:function(cb){return watch(function(){cb(run())})}}}

var listeners=[],user=null;
function saveAuth(){write(KAU,AU)}
function fail(code){return Promise.reject({code:code})}
function mkUser(a){if(!a)return null;return {uid:a.uid,email:a.email,displayName:a.name||'',emailVerified:true,providerData:[{providerId:a.prov}],
  updateProfile:function(p){a.name=p.displayName||'';this.displayName=a.name;saveAuth();return Promise.resolve()},
  sendEmailVerification:function(){return Promise.resolve()},
  reauthenticateWithPopup:function(){return Promise.resolve()},
  delete:function(){delete AU.accounts[a.email];AU.current=null;saveAuth();setUser(null);return Promise.resolve()}}}
function setUser(a){user=mkUser(a);AU.current=a?a.email:null;saveAuth();var u=user;setTimeout(function(){listeners.forEach(function(f){f(u)})},0);return u}
var mail=function(e){return String(e||'').trim().toLowerCase()};
var mailOk=function(e){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)};
function google(){var e=mail(window.prompt('Email de tu cuenta de Google',''));
  if(!e)return fail('auth/popup-closed-by-user');if(!mailOk(e))return fail('auth/invalid-email');
  var a=AU.accounts[e]||(AU.accounts[e]={uid:'g'+(++seq).toString(36),email:e,name:'',prov:'google.com'});
  return later(function(){return {user:setUser(a)}})}

var auth={
  get currentUser(){return user},
  onAuthStateChanged:function(cb){listeners.push(cb);setTimeout(function(){cb(user)},0);return function(){var i=listeners.indexOf(cb);if(i>-1)listeners.splice(i,1)}},
  signInWithPopup:google,
  signInWithRedirect:google,
  createUserWithEmailAndPassword:function(e,p){e=mail(e);if(!mailOk(e))return fail('auth/invalid-email');if(String(p||'').length<6)return fail('auth/weak-password');
    if(AU.accounts[e])return fail('auth/email-already-in-use');
    var a=AU.accounts[e]={uid:'e'+(++seq).toString(36),email:e,name:'',prov:'password',pass:p};
    return later(function(){return {user:setUser(a)}})},
  signInWithEmailAndPassword:function(e,p){e=mail(e);if(!mailOk(e))return fail('auth/invalid-email');var a=AU.accounts[e];
    if(!a||a.prov!=='password'||a.pass!==p)return later(function(){throw {code:'auth/invalid-credential'}});
    return later(function(){return {user:setUser(a)}})},
  sendPasswordResetEmail:function(e){e=mail(e);if(!mailOk(e))return fail('auth/invalid-email');return later(function(){})},
  signOut:function(){return later(function(){setUser(null)})}};
user=mkUser(AU.current&&AU.accounts[AU.current]);

var GoogleAuthProvider=function(){};
window.firebase={apps:[],local:true,
  initializeApp:function(){this.apps.push({})},
  firestore:function(){return {doc:doc,collection:function(n){return query(n)},
    batch:function(){var ops=[];return {set:function(r,d){ops.push(function(){return r.set(d)});return this},delete:function(r){ops.push(function(){return r.delete()});return this},
      commit:function(){return ops.reduce(function(p,f){return p.then(f)},Promise.resolve())}}}}},
  auth:Object.assign(function(){return auth},{GoogleAuthProvider:GoogleAuthProvider})};
})();
