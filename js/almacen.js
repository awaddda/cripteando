(function(MC){
'use strict';
var store={alias:'',color:0,hist:{},prog:{},groups:[],subs:[],learn:{},votes:{},pub:true,showName:true,theme:'',draft:{},uname:'',photo:'',owner:''};
MC.store=store;
MC.mem=false;

var kind=function(x){return Array.isArray(x)?'a':(x===null?'n':typeof x)};
function load(){try{var r=localStorage.getItem('mc_v1');if(r){var o=JSON.parse(r);if(o&&typeof o==='object')for(var k in store)if(k in o&&kind(o[k])===kind(store[k]))store[k]=o[k]}}catch(e){MC.mem=true}
  if(typeof store.alias!=='string'||!store.alias.trim()){store.alias='Jugador'+(100+Math.floor(Math.random()*900));save()}
  if(['','light','dark'].indexOf(store.theme)<0)store.theme='';
  store.alias=store.alias.slice(0,24);store.groups=store.groups.filter(function(c){return typeof c==='string'&&/^[A-Z0-9]{5}$/.test(c)})}
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
