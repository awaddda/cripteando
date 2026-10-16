(function(MC){
'use strict';
var $=MC.$, norm=MC.norm, today=MC.today, clueOf=MC.clueOf, store=MC.store, save=MC.save;

var S={view:'hoy',cur:today(),typed:'',msg:'',msgCls:'',fresh:'',bk:true,
  learn:null,lstep:0,lph:'def',lfound:{},ltyped:'',lmsg:'',lcls:'',lfr:null,lwin:false,
lb:'hoy',amsg:'',gsel:null,gmsg:'',gcls:'',confirm:'',smsg:'',scls:''};
MC.S=S;
var VIEWS=[['hoy','Hoy','M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
 ['archivo','Archivo','M4 19V5a2 2 0 0 1 2-2h13v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13'],
 ['aprender','Aprender','M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5'],
 ['estadisticas','Estadísticas','M5 20V10M12 20V4M19 20v-7'],
 ['clasificacion','Clasificación','M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3'],
 ['grupos','Grupos','M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1a4 4 0 0 0-3-3.9M16 4.1a3.5 3.5 0 0 1 0 6.8'],
 ['enviar','Enviar','M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z'],
 ['cuenta','Cuenta','M18.5 20v-1a4 4 0 0 0-4-4h-5a4 4 0 0 0-4 4v1M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z']];
var ico=function(d){return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>'};

function renderNav(){var SEP={archivo:1,aprender:1,grupos:1,enviar:1};$('#nav').innerHTML=VIEWS.map(function(v){return (SEP[v[0]]?'<span class="sep" aria-hidden="true"></span>':'')+'<button class="tab" data-act="go" data-v="'+v[0]+'"'+(v[0]==='hoy'?' data-n="today"':'')+(S.view===v[0]?' aria-current="page"':'')+'>'+ico(v[2])+'<span>'+v[1]+'</span></button>'}).join('')}
function render(){
  renderNav();
  var f={hoy:MC.vHoy,archivo:MC.vArchivo,aprender:MC.vAprender,estadisticas:MC.vStats,clasificacion:MC.vRank,grupos:MC.vGroups,enviar:MC.vSend,cuenta:MC.vAccount}[S.view]||MC.vHoy;
  $('#main').innerHTML=f();
  if(S.view==='hoy'){var i=$('#guess');if(i){i.value=S.typed;if(window.matchMedia&&matchMedia('(pointer:fine)').matches)i.focus()}}
  if(S.view==='aprender'){var li=$('#lguess');if(li){li.value=S.ltyped;if(window.matchMedia&&matchMedia('(pointer:fine)').matches)li.focus()}}
  if(S.view==='clasificacion'||S.view==='grupos')MC.base.escuchar();
  if(S.view==='grupos')MC.liveGroups();
  if(S.view==='enviar')MC.checkSend();
}
function go(v,n){if(n==='today')n=today();var prev=S.cur;if(n)S.cur=n;if(v==='aprender')S.learn=null;S.view=v;
  if(n&&n!==prev){S.typed='';S.msg=''}
  S.confirm='';try{history.replaceState(null,'','#'+v)}catch(e){try{location.hash=v}catch(e2){}}render();window.scrollTo(0,0)}

function refreshLive(){if(S.view==='clasificacion')$('#main').innerHTML=MC.vRank();else if(S.view==='grupos')MC.liveGroups()}
MC.render=render;
MC.go=go;

document.addEventListener('click',function(e){var t=e.target.closest('[data-act]');if(!t)return;var a=t.dataset.act;
  if(a==='go')go(t.dataset.v,t.dataset.n);
  else if(a==='open'){S.cur=+t.dataset.n;S.typed='';S.msg='';go('hoy',S.cur)}
  else if(a==='hint')MC.hint(t.dataset.k);
  else if(a==='check')MC.check();
  else if(a==='give'){S.confirm='give';render()}
  else if(a==='give-yes')MC.giveUp();
  else if(a==='bk'){S.bk=!S.bk;render()}
  else if(a==='vote')MC.vote(t.dataset.v);
  else if(a==='login'){S.amsg='';t.disabled=true;MC.base.entrar().catch(function(err){S.amsg=MC.base.motivoSesion(err);render()})}
  else if(a==='logout'){MC.base.salir()}
  else if(a==='theme'){store.theme=t.dataset.v||'';save();applyTheme();render()}
  else if(a==='pub'){MC.base.publico(t.checked)}
  else if(a==='showname'){store.showName=t.checked;save()}
  else if(a==='delacc'){S.confirm='delacc';S.dmsg='';render()}
  else if(a==='delacc-yes'){t.disabled=true;MC.base.eliminarCuenta().then(function(){S.confirm='';S.dmsg='';render()}).catch(function(err){S.dmsg='No pude eliminar la cuenta: '+MC.base.motivo(err);render()})}
  else if(a==='lguia-go'){S.view='aprender';S.learn='guia';try{history.replaceState(null,'','#aprender')}catch(e2){}render();window.scrollTo(0,0)}
  else if(/^(stab|smech|srole|sword|sextra|sxdel)$/.test(a))MC.clickSend(a,t);
  else if(a==='lopen')MC.learnOpen(t.dataset.l);
  else if(a==='lhub'){S.learn=null;render();window.scrollTo(0,0)}
  else if(a==='lguia'){S.learn='guia';render();window.scrollTo(0,0)}
  else if(a==='lnext')MC.learnStep(1);
  else if(a==='lprev')MC.learnStep(-1);
  else if(a==='lseg')MC.learnTap(+t.dataset.i);
  else if(a==='lcheck')MC.learnCheck();
  else if(a==='lshow')MC.learnShow();
  else if(a==='share')MC.share(t);
  else if(a==='lb'){S.lb=t.dataset.v;render()}
  else if(a==='gsel'){S.gsel=t.dataset.c;S.confirm='';MC.liveGroups()}
  else if(a==='copycode'){MC.copyText(S.gsel,function(ok){t.textContent=ok?'Copiado':'Seleccioná el código'})}
  else if(a==='askleave'){S.confirm=S.gsel;MC.liveGroups()}
  else if(a==='noleave'){S.confirm='';if(S.view==='grupos')MC.liveGroups();else render()}
  else if(a==='leave')MC.leaveGroup(t.dataset.c);
  else if(a==='atab'){S.atab=t.dataset.v;S.am=null;render()}
  else if(a==='nophoto'){MC.base.cambiarFoto('');render()}
  else if(a==='reset'){S.confirm='reset';render()}
  else if(a==='reset-yes'){store.hist={};store.prog={};store.subs=[];store.learn={};store.votes={};S.confirm='';S.typed='';save();MC.base.publicar(today());render()}
});
document.addEventListener('input',function(e){
  if(e.target.id==='guess'){var v=norm(e.target.value),len=MC.freeOf(clueOf(S.cur),MC.prog(S.cur)).length,prev=S.typed.length;S.typed=v.slice(0,len);if(e.target.value!==S.typed)e.target.value=S.typed;MC.paintCells(S.typed.length>prev?S.typed.length-1:-1);if(S.msg)MC.setMsg('')}
  else if(e.target.id==='lguess'){var lv=norm(e.target.value),ll=MC.learnLen(),lp=S.ltyped.length;S.ltyped=lv.slice(0,ll);if(e.target.value!==S.ltyped)e.target.value=S.ltyped;MC.paintLearn(S.ltyped.length>lp?S.ltyped.length-1:-1);if(S.lmsg){S.lmsg='';var lm=$('#lmsg');if(lm)lm.textContent=''}}
  else if(e.target.closest&&e.target.closest('#f-send')){if(e.target.id==='s-text')MC.sendParts();MC.checkSend();MC.sendAutosave()}});
document.addEventListener('keydown',function(e){if(e.key!=='Enter')return;
  if(e.target.id==='guess'){e.preventDefault();MC.check()}else if(e.target.id==='lguess'){e.preventDefault();MC.learnCheck()}});
document.addEventListener('animationend',function(e){if(e.target.id==='cells'||e.target.id==='lcells')e.target.classList.remove('shake')});
document.addEventListener('submit',function(e){e.preventDefault();var id=e.target.id;
  if(id==='f-create')MC.createGroup();else if(id==='f-join')MC.joinGroup();else if(id==='f-send')MC.sendClue();
  else if(id==='f-fb'){var k=$('#fb-kind').value,msg=($('#fb-msg').value||'').trim(),out=$('#fb-out');if(msg.length<5){if(out){out.textContent='Contanos un poco más: el mensaje es muy corto.';out.className='msg bad'}return}
    MC.base.enviarComentario(k,msg).then(function(){$('#fb-msg').value='';if($('#fb-out')){$('#fb-out').textContent='Gracias, lo leemos todo.';$('#fb-out').className='msg ok'}}).catch(function(err){if($('#fb-out')){$('#fb-out').textContent='No pude enviarlo: '+MC.base.motivo(err);$('#fb-out').className='msg bad'}})}
  else if(id==='f-login'){var le=$('#l-email').value,lp=$('#l-pass').value;if(!le||!lp)return say('a-out','Escribí tu email y tu contraseña.');
    MC.base.entrarConEmail(le,lp).catch(function(err){say('a-out',MC.base.motivoSesion(err))})}
  else if(id==='f-signup'){var un=$('#u-name').value,ue=$('#u-email').value,up=$('#u-pass').value;
    if(!MC.base.nombreValido(un))return say('a-out',MC.base.motivoSesion({code:'name-invalid'}));if(!ue)return say('a-out','Escribí tu email.');if(up.length<6)return say('a-out',MC.base.motivoSesion({code:'auth/weak-password'}));
    say('a-out','Creando tu cuenta…','ok');MC.base.crearCuenta(un,ue,up).then(function(){render()}).catch(function(err){say('a-out',MC.base.motivoSesion(err))})}
  else if(id==='f-forgot'){var fe=$('#f-email').value;if(!fe)return say('a-out','Escribí tu email.');
    var sent=function(){say('a-out','Listo: si hay una cuenta con ese email, te llega el enlace en unos minutos.','ok')};
    MC.base.recuperarClave(fe).then(sent).catch(function(err){if(err&&err.code==='auth/user-not-found')sent();else say('a-out',MC.base.motivoSesion(err))})}
  else if(id==='f-acc'){var a=($('#a-alias').value||'').trim().slice(0,20);if(!a)return say('a-msg','Escribí un nombre.');
    if(MC.base.lista()){if(!MC.base.nombreValido(a))return say('a-msg',MC.base.motivoSesion({code:'name-invalid'}));
      say('a-msg','Guardando…','ok');MC.base.cambiarNombre(a).then(function(){say('a-msg','Guardado.','ok')}).catch(function(err){say('a-msg',MC.base.motivoSesion(err))})}
    else{store.alias=a;save();say('a-msg','Guardado.','ok')}}});
function say(id,t,cls){var m=$('#'+id);if(m){m.textContent=t;m.className='msg '+(cls||'bad')}}
document.addEventListener('change',function(e){if(e.target.id!=='a-photo'||!e.target.files||!e.target.files[0])return;
  say('p-out','Subiendo foto…','ok');MC.readPhoto(e.target.files[0]).then(function(d){return MC.base.cambiarFoto(d)}).then(function(){render()})
  .catch(function(err){say('p-out',err&&err.code==='photo-type'?'Elegí un archivo de imagen.':(err&&err.code==='photo-size'?'La imagen es muy pesada: elegí una de menos de 15 MB.':'No pude usar esa imagen. Probá con otra.'))})});
window.addEventListener('hashchange',function(){var v=location.hash.slice(1);if(VIEWS.some(function(x){return x[0]===v})&&v!==S.view){S.view=v;render()}});

window.addEventListener('storage',function(e){if(e.key==='mc_v1'&&!editing()){MC.load();applyTheme();render()}});
function applyTheme(){var r=document.documentElement;if(store.theme)r.setAttribute('data-theme',store.theme);else r.removeAttribute('data-theme')}

function editing(){var a=document.activeElement;return !!(a&&a.closest&&a.closest('#main')&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.id!=='guess'&&a.id!=='lguess')}

var lastDay=today();
setInterval(function(){var n=today();
  if(n!==lastDay){var was=lastDay;lastDay=n;MC.base.nuevoDia();
    if(S.cur===was){S.cur=n;S.typed='';S.msg=''}
    if(!editing())render();return}
  if(document.hidden)return;
  var el=$('#cd');if(el)el.textContent=MC.countdown()},1000);

MC.load();applyTheme();
var h0=(location.hash||'').slice(1);if(VIEWS.some(function(x){return x[0]===h0}))S.view=h0;
render();
MC.base.conectar(refreshLive,function(){S.amsg='';S.am=null;applyTheme();if(editing()&&S.view!=='cuenta')refreshLive();else render()}).then(function(){if(editing())refreshLive();else render()}).catch(function(){});
})(window.MC);
