(function(MC){
'use strict';
var store={alias:'',color:0,hist:{},prog:{},groups:[],subs:[],learn:{},votes:{},pub:true,showName:true,theme:'',draft:{},uname:'',photo:'',owner:'',rst:0};
MC.store=store;
MC.mem=false;

var kind=function(x){return Array.isArray(x)?'a':(x===null?'n':typeof x)};
function load(){try{var r=localStorage.getItem('mc_v1');if(r){var o=JSON.parse(r);if(o&&typeof o==='object')for(var k in store)if(k in o&&kind(o[k])===kind(store[k]))store[k]=o[k]}}catch(e){MC.mem=true}
  if(typeof store.alias!=='string'||!store.alias.trim()){store.alias='Jugador'+(100+Math.floor(Math.random()*900));save()}
  if(['','light','dark'].indexOf(store.theme)<0)store.theme='';
  store.alias=store.alias.slice(0,24);clean()}
// Descarta lo que no tenga la forma esperada (datos viejos, a medio guardar o tocados a mano), así ninguna sección se rompe por eso
var obj=function(x){return !!x&&typeof x==='object'&&!Array.isArray(x)};
function clean(){var k;
  for(k in store.hist){var h=store.hist[k];if(!obj(h)||(h.r!=='w'&&h.r!=='l')||!(+k>=1))delete store.hist[k];else{h.a=Math.max(0,h.a|0);h.h=Math.max(0,h.h|0);if(h.d!=null&&typeof h.d!=='number')delete h.d}}
  for(k in store.prog){var p=store.prog[k];if(!obj(p)||!Array.isArray(p.g)||!(+k>=1))delete store.prog[k];else{p.g=p.g.filter(function(g){return typeof g==='string'});['hd','hi','hm','hl'].forEach(function(f){p[f]=Math.max(0,p[f]|0)})}}
  for(k in store.learn)if(!obj(store.learn[k]))delete store.learn[k];
  for(k in store.votes)if(store.votes[k]!=='up'&&store.votes[k]!=='down')delete store.votes[k];
  store.subs=store.subs.filter(function(x){return obj(x)&&typeof x.t==='number'});
  store.groups=store.groups.filter(function(c){return typeof c==='string'&&/^[A-Z0-9]{5}$/.test(c)})}
MC.limpiar=clean;
function save(){try{localStorage.setItem('mc_v1',JSON.stringify(store))}catch(e){MC.mem=true}if(MC.alGuardar)MC.alGuardar()}

MC.load=load;
MC.save=save;

MC.prog=function(n){var c=MC.clueOf(n),p=store.prog[n];
  if(!c)return p&&typeof p==='object'&&Array.isArray(p.g)?p:{g:[],hd:0,hi:0,hm:0,hl:0,done:null,s:0,k:''};
  var k=MC.norm(c.a);
  if(p&&typeof p==='object'&&p.k&&p.k!==k){p=null;delete store.hist[n]}
  if(!p||typeof p!=='object'||!Array.isArray(p.g))p=store.prog[n]={g:[],hd:0,hi:0,hm:0,hl:0,done:null,s:0,k:k};
  else if(!p.k)p.k=k;
  return p};
MC.hintsOf=function(p){return p.hd+p.hi+p.hm+p.hl};
})(window.MC);
