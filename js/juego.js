(function(MC){
'use strict';
var $=MC.$, norm=MC.norm, clueOf=MC.clueOf, hasRole=MC.hasRole, store=MC.store, save=MC.save, prog=MC.prog, hintsOf=MC.hintsOf;

function paintCells(typedIn){var S=MC.S,c=clueOf(S.cur),p=prog(S.cur),el=$('#cells');if(!el||!c)return;var inp=$('#guess');var h=MC.cellsHtml(c,p,S.typed,!!p.done,p.done==='w',-1,typedIn);
  Array.prototype.slice.call(el.children).forEach(function(ch){if(ch!==inp)el.removeChild(ch)});el.insertAdjacentHTML('afterbegin',h)}
function setMsg(t,cls){var S=MC.S;S.msg=t;S.msgCls=cls||'';var m=$('#msg');if(m){m.textContent=t;m.className='msg '+(cls||'')}}
function hint(k){var S=MC.S,n=S.cur,c=clueOf(n),p=prog(n);if(!c||p.done)return;
  if(k==='def'&&!p.hd&&hasRole(c,'def'))p.hd=1;
  else if(k==='ind'&&!p.hi&&hasRole(c,'ind'))p.hi=1;
  else if(k==='mat'&&!p.hm&&hasRole(c,'mat'))p.hm=1;
  else if(k==='let'&&p.hl<norm(c.a).length-1){p.hl++;S.typed=S.typed.slice(0,MC.freeOf(c,p).length)}
  else return;
  S.fresh=k;save();S.msg='';MC.render()}
function check(){var S=MC.S,n=S.cur,c=clueOf(n),p=prog(n);if(!c||p.done)return;var ans=norm(c.a),g=MC.merge(c,p,norm(S.typed));
  if(norm(S.typed).length!==MC.freeOf(c,p).length){setMsg('Faltan letras: la respuesta tiene '+ans.length+'.','bad');return}
  if(p.g.indexOf(g)>-1){setMsg('Esa ya la probaste.','bad');return}
  if(g===ans){p.done='w';finish(n,'w');return}
  p.g.push(g);S.typed='';save();
  S.msg='No es esa. Probá de nuevo.';S.msgCls='bad';MC.render();var el=$('#cells');if(el){el.classList.add('shake')}}

function giveUp(){var S=MC.S,n=S.cur,p=prog(n);if(p.done)return;S.confirm='';p.done='l';finish(n,'l')}
function finish(n,r){var S=MC.S,p=prog(n);store.hist[n]={r:r,a:p.g.length+(r==='w'?1:0),h:hintsOf(p)};S.typed='';S.msg='';S.fresh='end';save();MC.render();MC.base.publicar(n)}
function share(btn){var n=MC.S.cur,p=prog(n),w=p.done==='w',s='';for(var i=0;i<p.g.length;i++)s+='✗';if(w)s+='✓';
  var txt='Cripteando #'+n+'\n'+s+' · '+(hintsOf(p)?hintsOf(p)+(hintsOf(p)===1?' ayuda':' ayudas'):'sin ayudas');
  copyText(txt,function(ok){var m=$('#smsg');if(m){m.textContent=ok?'Copiado. Pegalo donde quieras.':'No pude copiar solo. Seleccioná y copiá este texto: '+txt.replace(/\n/g,' / ')}})}

function copyText(t,cb){var done=function(ok){cb&&cb(ok)};
  var legacy=function(){try{var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(ta);ta.select();var ok=document.execCommand('copy');document.body.removeChild(ta);done(ok)}catch(e){done(false)}};
  try{if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(function(){done(true)},legacy);else legacy()}catch(e){legacy()}}

function vote(v){var n=MC.S.cur;if(v!=='up'&&v!=='down')return;var now=store.votes[n]===v?'':v;
  if(now)store.votes[n]=now;else delete store.votes[n];save();MC.base.votar(n,now);MC.render()}

MC.vote=vote;
MC.paintCells=paintCells;
MC.setMsg=setMsg;
MC.hint=hint;
MC.check=check;
MC.finish=finish;
MC.giveUp=giveUp;
MC.share=share;
MC.copyText=copyText;
})(window.MC);
