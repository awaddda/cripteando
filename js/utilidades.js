(function(MC){
'use strict';
var BANK=MC.BANK;

MC.$=function(s,r){return (r||document).querySelector(s)};
MC.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
MC.norm=function(s){return String(s).toUpperCase().replace(/Ñ/g,'\u0001').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\u0001/g,'Ñ').replace(/[^A-ZÑ]/g,'')};

var EPOCH=Math.floor(Date.UTC(2026,9,16)/86400000), DAY=86400000, OFF=3*3600000;

MC.today=function(){return Math.max(1,Math.floor((Date.now()-OFF)/DAY)-EPOCH+1)};

MC.clueOf=function(n){n=Math.max(1,Math.floor(n)||1);return BANK[(n-1)%BANK.length]};
MC.fmtDate=function(n){return new Intl.DateTimeFormat('es-AR',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}).format(new Date((EPOCH+n-1)*DAY))};
MC.fmtLong=function(n){return new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date((EPOCH+n-1)*DAY)).replace(/\./g,'')};
MC.countdown=function(){var next=(Math.floor((Date.now()-OFF)/DAY)+1)*DAY+OFF,d=Math.max(0,next-Date.now()),p=function(x){return String(x).padStart(2,'0')};return p(Math.floor(d/3600000))+':'+p(Math.floor(d%3600000/60000))+':'+p(Math.floor(d%60000/1000))};

MC.plain=function(c){return c.t.map(function(p){return p[0]}).join(' ')};
MC.hasRole=function(c,r){return c.t.some(function(p){return p[1]===r})};
MC.letterOrder=function(len){var o=[0];if(len>1)o.push(len-1);for(var i=1;i<len-1;i++)o.push(i);return o};

MC.revealedOf=function(c,p){return MC.letterOrder(MC.norm(c.a).length).slice(0,p.hl)};
MC.freeOf=function(c,p){var len=MC.norm(c.a).length,r=MC.revealedOf(c,p),o=[];for(var i=0;i<len;i++)if(r.indexOf(i)<0)o.push(i);return o};
MC.merge=function(c,p,typed){var ans=MC.norm(c.a),r=MC.revealedOf(c,p),k=0,s='';for(var i=0;i<ans.length;i++)s+=r.indexOf(i)>-1?ans[i]:(typed[k++]||'');return s};
})(window.MC);
