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
function finish(n,r){var S=MC.S,p=prog(n);store.hist[n]={r:r,a:p.g.length+(r==='w'?1:0),h:hintsOf(p),d:MC.today()};S.typed='';S.msg='';S.fresh='end';save();MC.render();MC.base.publicar(n)}
// Tarjeta cuadrada con el resultado, con los colores del tema actual
function shareImg(btn){var n=MC.S.cur,p=prog(n),w=p.done==='w',h=hintsOf(p),c=clueOf(n);if(!p.done||!c)return;
  var css=getComputedStyle(document.documentElement),v=function(k){return css.getPropertyValue(k).trim()},
    font=function(wt,sz){return wt+' '+sz+'px Figtree, system-ui, sans-serif'},S=1080,cv=document.createElement('canvas'),x=cv.getContext('2d'),say=function(t){var m=$('#smsg');if(m)m.textContent=t};
  cv.width=cv.height=S;btn.disabled=true;
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){
    x.fillStyle=v('--bg');x.fillRect(0,0,S,S);
    x.fillStyle=v('--surface');x.strokeStyle=v('--line');x.lineWidth=3;x.beginPath();x.roundRect(60,60,S-120,S-120,56);x.fill();x.stroke();
    x.font=font(800,64);var gw=78+28+x.measureText('Cripteando').width,gx=(S-gw)/2;
    x.save();x.translate(gx-21,170);x.scale(3,3);
    [['M10.5 18.5C7 23.5 6.2 30 10 34c3.4 3.4 16.6 3.4 20 0 3.8-4 3-10.5-.5-15.5z',v('--cal')],['M10.6 16.2C14 11.4 26 11.4 29.4 16.2z',v('--yer')]].forEach(function(d){x.fillStyle=d[1];x.fill(new Path2D(d[0]))});
    x.fillStyle=v('--vir');x.beginPath();x.roundRect(9,15.6,22,3.6,1.6);x.fill();
    x.strokeStyle=v('--vir');x.lineWidth=2.2;x.lineCap='round';x.stroke(new Path2D('M21.5 15 27.6 5.2c.6-1 1.6-1.4 3.4-1.4'));x.restore();
    x.fillStyle=v('--ink');x.textAlign='left';x.textBaseline='middle';x.font=font(800,64);x.fillText('Cripteando',gx+78+28,230);
    x.textAlign='center';x.font=font(500,40);x.fillStyle=v('--ink-2');x.fillText('Pista #'+n+' · '+MC.fmtLong(n),S/2,360);
    x.font=font(700,72);x.fillStyle=v('--ink');x.fillText(w?(p.g.length?'Resuelta en '+(p.g.length+1)+' intentos':'¡Al primer intento!'):'Esta vez no salió',S/2,470);
    var marks=p.g.map(function(){return 'x'}).concat(w?['v']:[]).slice(-8),sz=96,gap=22,x0=S/2-(marks.length*sz+(marks.length-1)*gap)/2;
    marks.forEach(function(m,i){var mx=x0+i*(sz+gap),my=560;x.fillStyle=m==='v'?v('--accent'):v('--bad-soft');x.beginPath();x.roundRect(mx,my,sz,sz,22);x.fill();
      x.strokeStyle=m==='v'?v('--accent-ink'):v('--bad');x.lineWidth=9;x.lineCap='round';x.lineJoin='round';x.beginPath();
      if(m==='v'){x.moveTo(mx+26,my+50);x.lineTo(mx+42,my+66);x.lineTo(mx+71,my+32)}else{x.moveTo(mx+30,my+30);x.lineTo(mx+66,my+66);x.moveTo(mx+66,my+30);x.lineTo(mx+30,my+66)}x.stroke()});
    x.font=font(500,44);x.fillStyle=v('--ink-2');x.fillText((h?h+(h===1?' ayuda':' ayudas'):'Sin ayudas')+' · Racha '+MC.streak(),S/2,770);
    x.font=font(500,34);x.fillText(location.host+(location.pathname.replace(/\/[^/]*$/,'/')==='/'?'':location.pathname.replace(/\/[^/]*$/,'')),S/2,920);
    return new Promise(function(r){cv.toBlob(r,'image/png')})})
  .then(function(blob){if(!blob)throw 0;var name='cripteando-'+n+'.png',file=null;try{file=new File([blob],name,{type:'image/png'})}catch(e){}
    if(file&&window.matchMedia&&matchMedia('(pointer:coarse)').matches&&navigator.canShare&&navigator.canShare({files:[file]}))return navigator.share({files:[file],title:'Cripteando #'+n}).catch(function(){});
    var u=URL.createObjectURL(blob),l=document.createElement('a');l.href=u;l.download=name;document.body.appendChild(l);l.click();setTimeout(function(){URL.revokeObjectURL(u);l.remove()},1000);say('Listo, descargué la imagen.')})
  .catch(function(){say('No pude armar la imagen en este navegador.')}).then(function(){btn.disabled=false})}

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
MC.shareImg=shareImg;
MC.copyText=copyText;
})(window.MC);
