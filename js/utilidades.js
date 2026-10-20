(function(MC){
'use strict';
var PZ={},KP='mc_pistas',KEY='cripteando';
function enc(o){var s=encodeURIComponent(JSON.stringify(o)),out='';for(var i=0;i<s.length;i++){var c=s.charCodeAt(i)^KEY.charCodeAt(i%KEY.length);out+=(c<16?'0':'')+c.toString(16)}return out}
function dec(h){var s='';for(var i=0;i<h.length;i+=2)s+=String.fromCharCode(parseInt(h.substr(i,2),16)^KEY.charCodeAt((i/2)%KEY.length));return JSON.parse(decodeURIComponent(s))}
function valid(c){return !!(c&&typeof c==='object'&&typeof c.a==='string'&&c.a&&Array.isArray(c.t)&&c.t.length)}
function readP(){try{var o=JSON.parse(localStorage.getItem(KP)||'{}');return o&&typeof o==='object'?o:{}}catch(e){return {}}}
var RAW=readP();
(function(){for(var k in RAW){try{var c=dec(RAW[k]);if(valid(c))PZ[k]=c;else delete RAW[k]}catch(e){delete RAW[k]}}})();
MC.codificar=enc;
MC.decodificar=function(h){try{var c=dec(h);return valid(c)?c:null}catch(e){return null}};
MC.pistaValida=valid;
MC.quitarPista=function(n){if(!(n in RAW)&&!PZ[n])return;delete RAW[n];delete PZ[n];try{localStorage.setItem(KP,JSON.stringify(RAW))}catch(e){}};
MC.guardarPistas=function(m){var ch=false;for(var k in m){try{var c=dec(m[k]);if(!valid(c))continue;if(RAW[k]!==m[k])ch=true;RAW[k]=m[k];PZ[k]=c}catch(e){}}
  if(ch)try{localStorage.setItem(KP,JSON.stringify(RAW))}catch(e){}return ch};
MC.pistasPlanas=function(list){(list||[]).forEach(function(c,i){if(valid(c))PZ[i+1]=c})};
MC.faltan=function(ns){return ns.filter(function(n){return n>=1&&!PZ[n]})};
if(Array.isArray(window.MC_BANCO))MC.pistasPlanas(window.MC_BANCO);

MC.$=function(s,r){return (r||document).querySelector(s)};
MC.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
MC.norm=function(s){return String(s).toUpperCase().replace(/Ñ/g,'\u0001').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\u0001/g,'Ñ').replace(/[^A-ZÑ]/g,'')};

var EPOCH=Math.floor(Date.UTC(2026,9,16)/86400000), DAY=86400000, OFF=3*3600000;

MC.dayOf=function(ms){return Math.floor((ms-OFF)/DAY)-EPOCH+1};
MC.today=function(){return Math.max(1,MC.dayOf(Date.now()))};

MC.clueOf=function(n){return PZ[Math.max(1,Math.floor(n)||1)]||null};
// Medianoche UTC del día n (para armar calendarios con esa fecha)
MC.diaMs=function(n){return (EPOCH+n-1)*DAY};
MC.fmtDate=function(n){return new Intl.DateTimeFormat('es-AR',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date((EPOCH+n-1)*DAY))};
// Fecha entera: «Domingo 15 de noviembre»
MC.fmtFull=function(n){var s=new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).format(new Date((EPOCH+n-1)*DAY)).replace(',','');return s.charAt(0).toUpperCase()+s.slice(1)};
MC.fmtLong=function(n){return new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date((EPOCH+n-1)*DAY)).replace(/\./g,'')};
MC.countdown=function(){var next=(Math.floor((Date.now()-OFF)/DAY)+1)*DAY+OFF,d=Math.max(0,next-Date.now()),p=function(x){return String(x).padStart(2,'0')};return p(Math.floor(d/3600000))+':'+p(Math.floor(d%3600000/60000))+':'+p(Math.floor(d%60000/1000))};

MC.hasRole=function(c,r){return c.t.some(function(p){return p[1]===r})};
MC.letterOrder=function(len){var o=[0];if(len>1)o.push(len-1);for(var i=1;i<len-1;i++)o.push(i);return o};

MC.revealedOf=function(c,p){return MC.letterOrder(MC.norm(c.a).length).slice(0,p.hl)};
MC.freeOf=function(c,p){var len=MC.norm(c.a).length,r=MC.revealedOf(c,p),o=[];for(var i=0;i<len;i++)if(r.indexOf(i)<0)o.push(i);return o};
MC.merge=function(c,p,typed){var ans=MC.norm(c.a),r=MC.revealedOf(c,p),k=0,s='';for(var i=0;i<ans.length;i++)s+=r.indexOf(i)>-1?ans[i]:(typed[k++]||'');return s};
})(window.MC);
