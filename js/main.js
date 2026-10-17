(function(MC){
'use strict';
var $=MC.$, norm=MC.norm, today=MC.today, clueOf=MC.clueOf, store=MC.store, save=MC.save;

// Carpeta base de la página: en la compu el script está en js/main.js; publicado, todo va en un solo archivo en la raíz
var BASE=(function(){try{var s=document.currentScript.src;return new URL(/\/js\/main\.js(\?|$)/.test(s)?'../':'./',s).pathname}catch(e){return '/'}})();
var S={view:'hoy',cur:today(),typed:'',msg:'',msgCls:'',fresh:'',bk:false,
  learn:null,lstep:0,lph:'def',lfound:{},ltyped:'',lmsg:'',lcls:'',lfr:null,lwin:false,
lb:'racha',amsg:'',gsel:null,gmsg:'',gcls:'',confirm:'',smsg:'',scls:'',pz:''};
MC.S=S;
// Íconos propios: el trazo va en el color del texto y las partes {y} van rellenas con el verde de la yerba.
// {t,w,p} agrupa partes achicadas con transform; w compensa el grosor del trazo para que siga viéndose de 1.8. así Hoy y Grupos reusan el mate del logo (coordenadas de 40x40).
var MATE=['M10.5 18.5C7 23.5 6.2 30 10 34c3.4 3.4 16.6 3.4 20 0 3.8-4 3-10.5-.5-15.5z','M21.5 15 27.6 5.2c.6-1 1.6-1.4 3.4-1.4',{y:'M10.6 16.2C14 11.4 26 11.4 29.4 16.2z'}];
var VIEWS=[['hoy','Hoy',[{t:'translate(2.6 .6) scale(.62)',w:2.9,p:MATE.concat(['M10.5 11c-1.5-1.6 1.5-3.2 0-4.8M15.5 11c-1.5-1.6 1.5-3.2 0-4.8'])}]],
 ['archivo','Archivo',['M7.5 3h10a1.5 1.5 0 0 1 1.5 1.5v15a1.5 1.5 0 0 1-1.5 1.5h-10z','M5 6.5h4.5M5 10.5h4.5M5 14.5h4.5M5 18.5h4.5','M12.5 8h3.5M12.5 11.5h3.5']],
 ['aprender','Aprender',['M9.5 18h5M10.5 21h3','M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1V18h5v-2.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z',{y:'M10.6 11.6 12 9.4l1.4 2.2-1.4 2.2z'}]],
 ['estadisticas','Estadísticas',['M3.5 20.5h17','M5 14.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v6H5zM10 10.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v10h-4z',{y:'M15 4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v16h-4z'}]],
 ['clasificacion','Clasificación',['M3 20.5h18','M9 20.5V11h6v9.5M3.5 20.5V15H9M15 20.5V16.5h5.5v4',{y:'M12 3.2l1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3z'}]],
 ['grupos','Grupos',['M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 20v-1a4 4 0 0 0-3-3.9M16 4.1a3.5 3.5 0 0 1 0 6.8']],
 ['enviar','Enviar',['M14.8 4.2a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L9.5 19.5 4 20l.5-5.5z','M13 6l5 5','M13.5 20.5h6.5']],
 ['cuenta','Cuenta',['M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8z','M4.5 21c.9-3.6 3.9-5.6 7.5-5.6s6.6 2 7.5 5.6']]];
var part=function(p){return typeof p==='string'?'<path d="'+p+'"/>':(p.t?'<g transform="'+p.t+'" stroke-width="'+p.w+'">'+p.p.map(part).join('')+'</g>':'<path class="ico-y" d="'+p.y+'"/>')};
var ico=function(parts){return '<svg class="ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+parts.map(part).join('')+'</svg>'};

function renderNav(){var SEP={archivo:1,aprender:1,grupos:1,enviar:1},tab=function(v){return '<button class="tab" data-act="go" data-v="'+v[0]+'"'+(v[0]==='hoy'?' data-n="today"':'')+(S.view===v[0]?' aria-current="page"':'')+'>'+ico(v[2])+'<span>'+v[1]+'</span></button>'};
  // Cuenta va aparte, sola a la derecha
  $('#nav').innerHTML='<div class="nav-mid">'+VIEWS.filter(function(v){return v[0]!=='cuenta'}).map(function(v){return (SEP[v[0]]?'<span class="sep" aria-hidden="true"></span>':'')+tab(v)}).join('')+'</div>'+tab(VIEWS[VIEWS.length-1])}
var allAsked=false,asked={};
function need(ns){if(!MC.base.conectada())return;ns=MC.faltan(ns).filter(function(n){return !asked[n]});if(!ns.length)return;ns.forEach(function(n){asked[n]=1});
  S.pz='cargando';MC.base.pistas(ns).then(function(){S.pz='listo'},function(){S.pz='error'}).then(function(){if(!editing())render()})}
function allDays(){var o=[];for(var n=1;n<=today();n++)o.push(n);return o}
// Pantalla de bienvenida: se va cuando la pista de hoy está lista (o falló), pero queda al menos SPLASH ms para que se vea el mate
var SPLASH=1300;
function hideSplash(){var el=document.getElementById('splash');if(!el||el.className.indexOf('out')>-1)return;el.className+=' out';
  setTimeout(function(){el.className+=' go';replayEnd();setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el)},450)},Math.max(0,SPLASH-(window.performance?performance.now():0)))}
// Al entrar con la pista ya terminada, repite la animación del final (letras, partes y resultado) mientras se va la pantalla de carga
function replayEnd(){if(S.view!=='hoy'||editing()||!MC.clueOf(S.cur)||!MC.prog(S.cur).done)return;S.fresh='end';render()}
setTimeout(hideSplash,8000);
// Mientras corre la animación del final (S.hold), los redibujos de fondo (Firebase, carga de pistas) esperan a que termine;
// si no, reemplazan las letras y el resultado a mitad de camino. Cualquier clic o tecla la libera.
var held=null;
function render(){
  if(S.hold&&S.view==='hoy'&&S.hold.n===S.cur&&S.fresh!=='end'&&Date.now()<S.hold.t){renderNav();if(!held)held=setTimeout(function(){held=null;render()},S.hold.t-Date.now()+20);return}
  S.hold=null;
  if(S.pz!=='cargando'){if(S.view==='archivo'&&!allAsked){allAsked=true;need(allDays())}else if(S.view==='hoy'&&!MC.clueOf(S.cur))need([S.cur])}
  renderNav();
  var f={hoy:MC.vHoy,archivo:MC.vArchivo,aprender:MC.vAprender,estadisticas:MC.vStats,clasificacion:MC.vRank,grupos:MC.vGroups,enviar:MC.vSend,cuenta:MC.vAccount,admin:MC.vAdmin}[S.view]||MC.vHoy;
  $('#main').innerHTML=f();
  if(S.view==='hoy'){var i=$('#guess');if(i){i.value=S.typed;if(window.matchMedia&&matchMedia('(pointer:fine)').matches)i.focus()}}
  if(S.view==='aprender'){var li=$('#lguess');if(li){li.value=S.ltyped;if(window.matchMedia&&matchMedia('(pointer:fine)').matches)li.focus()}}
  if(S.view==='clasificacion'||S.view==='grupos')MC.base.escuchar();
  if(S.view==='grupos')MC.liveGroups();
  if(S.view==='enviar')MC.checkSend();
  if(S.view==='admin'&&MC.base.esAdmin()&&(!S.adm||!S.adm.st))MC.adminLoad();
  if(S.view!=='hoy'||MC.clueOf(S.cur)||S.pz!=='cargando')hideSplash();
}
function go(v,n){if(n==='today')n=today();var prev=S.cur;if(n)S.cur=n;if(v==='aprender')S.learn=null;S.view=v;
  if(n&&n!==prev){S.typed='';S.msg=''}
  S.confirm='';mark(v);render();window.scrollTo(0,0)}
// Cada sección tiene su ruta: BASE es Hoy, BASE+'aprender' es Aprender, etc.
function isView(v){return v==='admin'||VIEWS.some(function(x){return x[0]===v})}
function urlOf(v){return location.protocol==='file:'?location.pathname:BASE+(v==='hoy'?'':v)}
function viewOf(p){var lp=p.toLowerCase(),lb=BASE.toLowerCase(),s;
  if(lp.indexOf(lb)===0)s=lp.slice(lb.length);else if(lp+'/'===lb)s='';else return null;
  s=decodeURIComponent(s).replace(/^index\.html$/,'').replace(/\/+$/,'');
  return !s?'hoy':(isView(s)?s:null)}
function mark(v){try{var st=history.state;if(!(st&&st.v===v&&st.n===S.cur))history.pushState({v:v,n:S.cur},'',urlOf(v))}catch(e){}}

function refreshLive(){if(S.view==='clasificacion')$('#main').innerHTML=MC.vRank();else if(S.view==='grupos')MC.liveGroups()}
MC.render=render;
MC.go=go;

['click','keydown','input'].forEach(function(ev){document.addEventListener(ev,function(){S.hold=null},true)});
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
  else if(a==='lguia-go'){S.view='aprender';S.learn='guia';mark('aprender');render();window.scrollTo(0,0)}
  else if(/^(stab|smech|srole|sword|sextra|sxdel)$/.test(a))MC.clickSend(a,t);
  else if(/^(anew|aedit|aback|arole|aword|adel|adel-no|adel-yes|aexport|asub|ast)$/.test(a))MC.adminClick(a,t);
  else if(a==='lopen')MC.learnOpen(t.dataset.l);
  else if(a==='lhub'){S.learn=null;render();window.scrollTo(0,0)}
  else if(a==='lguia'){S.learn='guia';render();window.scrollTo(0,0)}
  else if(a==='lnext')MC.learnStep(1);
  else if(a==='lprev')MC.learnStep(-1);
  else if(a==='lseg')MC.learnTap(+t.dataset.i);
  else if(a==='lcheck')MC.learnCheck();
  else if(a==='lshow')MC.learnShow();
  else if(a==='shareimg')MC.shareImg(t);
  else if(a==='lb'){S.lb=t.dataset.v;render()}
  else if(a==='gsel'){S.gsel=t.dataset.c;S.confirm='';MC.liveGroups()}
  else if(a==='copycode'){MC.copyText(S.gsel,function(ok){t.textContent=ok?'Copiado':'Seleccioná el código'})}
  else if(a==='askleave'){S.confirm=S.gsel;MC.liveGroups()}
  else if(a==='noleave'){S.confirm='';if(S.view==='grupos')MC.liveGroups();else render()}
  else if(a==='leave')MC.leaveGroup(t.dataset.c);
  else if(a==='atab'){S.atab=t.dataset.v;S.am=null;render()}
  else if(a==='nophoto'){MC.base.cambiarFoto('');render()}
  else if(a==='upclues'){t.disabled=true;S.am={id:'ad-out',t:'Subiendo pistas…',cls:'ok'};render();MC.base.subirPistas().then(function(n){S.am={id:'ad-out',t:'Listo: subí '+n+' pistas.',cls:'ok'};if(S.adm)S.adm.st='';render()}).catch(function(err){S.am={id:'ad-out',t:MC.base.motivoSesion(err),cls:'bad'};render()})}
  else if(a==='reset'){S.confirm='reset';render()}
  else if(a==='reset-yes'){store.hist={};store.prog={};store.subs=[];store.learn={};store.votes={};S.confirm='';S.typed='';save();MC.base.publicar(today());render()}
});
document.addEventListener('input',function(e){
  if(e.target.id==='a-alias'){var sv=$('#a-save');if(sv)sv.disabled=!e.target.value.trim()||e.target.value.trim().slice(0,20)===store.alias;return}
  if(e.target.id==='guess'){if(!clueOf(S.cur))return;var v=norm(e.target.value),len=MC.freeOf(clueOf(S.cur),MC.prog(S.cur)).length,prev=S.typed.length;S.typed=v.slice(0,len);if(e.target.value!==S.typed)e.target.value=S.typed;MC.paintCells(S.typed.length>prev?S.typed.length-1:-1);if(S.msg)MC.setMsg('')}
  else if(e.target.id==='lguess'){var lv=norm(e.target.value),ll=MC.learnLen(),lp=S.ltyped.length;S.ltyped=lv.slice(0,ll);if(e.target.value!==S.ltyped)e.target.value=S.ltyped;MC.paintLearn(S.ltyped.length>lp?S.ltyped.length-1:-1);if(S.lmsg){S.lmsg='';var lm=$('#lmsg');if(lm)lm.textContent=''}}
  else if(e.target.closest&&e.target.closest('#f-adm'))MC.adminInput(e.target);
  else if(e.target.closest&&e.target.closest('#f-send')){if(e.target.id==='s-text')MC.sendParts();MC.checkSend();MC.sendAutosave()}});
document.addEventListener('keydown',function(e){if(e.key!=='Enter')return;
  if(e.target.id==='guess'){e.preventDefault();MC.check()}else if(e.target.id==='lguess'){e.preventDefault();MC.learnCheck()}});
document.addEventListener('animationend',function(e){if(e.target.id==='cells'||e.target.id==='lcells')e.target.classList.remove('shake')});
document.addEventListener('submit',function(e){e.preventDefault();var id=e.target.id;
  if(id==='f-adm')MC.adminSave();
  else if(id==='f-create')MC.createGroup();else if(id==='f-join')MC.joinGroup();else if(id==='f-send')MC.sendClue();
  else if(id==='f-fb'){var k=$('#fb-kind').value,msg=($('#fb-msg').value||'').trim(),out=$('#fb-out');if(msg.length<5){if(out){out.textContent='Contanos un poco más: el mensaje es muy corto.';out.className='msg bad'}return}
    MC.base.enviarComentario(k,msg).then(function(){$('#fb-msg').value='';if($('#fb-out')){$('#fb-out').textContent='Gracias, lo leemos todo.';$('#fb-out').className='msg ok'}}).catch(function(err){if($('#fb-out')){$('#fb-out').textContent='No pude enviarlo: '+MC.base.motivo(err);$('#fb-out').className='msg bad'}})}
  else if(id==='f-login'){var le=$('#l-email').value,lp=$('#l-pass').value;if(!le||!lp)return say('a-out','Escribí tu email y tu contraseña.');
    MC.base.entrarConEmail(le,lp).catch(function(err){say('a-out',MC.base.motivoSesion(err))})}
  else if(id==='f-signup'){var un=$('#u-name').value,ue=$('#u-email').value,up=$('#u-pass').value;
    if(!MC.base.nombreValido(un))return say('a-out',MC.base.motivoSesion({code:'name-invalid'}));if(!ue)return say('a-out','Escribí tu email.');if(up.length<6)return say('a-out',MC.base.motivoSesion({code:'auth/weak-password'}));
    say('a-out','Creando tu cuenta…','ok');MC.base.crearCuenta(un,ue,up).then(function(){render()}).catch(function(err){var t=MC.base.motivoSesion(err);if(MC.base.lista()){S.am={id:'a-msg',t:t,cls:'bad'};render()}else say('a-out',t)})}
  else if(id==='f-forgot'){var fe=$('#f-email').value;if(!fe)return say('a-out','Escribí tu email.');
    var sent=function(){say('a-out','Listo: si hay una cuenta con ese email, te llega el enlace en unos minutos.','ok')};
    MC.base.recuperarClave(fe).then(sent).catch(function(err){if(err&&err.code==='auth/user-not-found')sent();else say('a-out',MC.base.motivoSesion(err))})}
  else if(id==='f-acc'){S.am=null;var a=($('#a-alias').value||'').trim().slice(0,20);if(!a)return say('a-msg','Escribí un nombre.');if(a===store.alias)return;
    if(MC.base.lista()){if(!MC.base.nombreValido(a))return say('a-msg',MC.base.motivoSesion({code:'name-invalid'}));
      say('a-msg','Guardando…','ok');MC.base.cambiarNombre(a).then(function(){say('a-msg','Guardado.','ok');var sv=$('#a-save');if(sv)sv.disabled=true}).catch(function(err){say('a-msg',MC.base.motivoSesion(err))})}
    else{store.alias=a;save();say('a-msg','Guardado.','ok');var sv2=$('#a-save');if(sv2)sv2.disabled=true}}});
function say(id,t,cls){var m=$('#'+id);if(m){m.textContent=t;m.className='msg '+(cls||'bad')}}
document.addEventListener('change',function(e){if(e.target.id!=='a-photo'||!e.target.files||!e.target.files[0])return;
  say('p-out','Subiendo foto…','ok');MC.readPhoto(e.target.files[0]).then(function(d){return MC.base.cambiarFoto(d)}).then(function(){render()})
  .catch(function(err){say('p-out',err&&err.code==='photo-type'?'Elegí un archivo de imagen.':(err&&err.code==='photo-size'?'La imagen es muy pesada: elegí una de menos de 15 MB.':'No pude usar esa imagen. Probá con otra.'))})});
window.addEventListener('popstate',function(e){var st=e.state||{};S.view=isView(st.v)?st.v:(viewOf(location.pathname)||'hoy');var n=st.n||today();if(n!==S.cur){S.cur=n;S.typed='';S.msg=''}S.confirm='';render();window.scrollTo(0,0)});

window.addEventListener('storage',function(e){if(e.key==='mc_v1'&&!editing()){MC.load();applyTheme();render()}});
function applyTheme(){var r=document.documentElement;if(store.theme)r.setAttribute('data-theme',store.theme);else r.removeAttribute('data-theme')}

function editing(){var a=document.activeElement;return !!(a&&a.closest&&a.closest('#main')&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.id!=='guess'&&a.id!=='lguess')}

var lastDay=today();
setInterval(function(){var n=today();
  if(n!==lastDay){var was=lastDay;lastDay=n;MC.base.nuevoDia();allAsked=false;asked={};if(S.pz!=='cargando')S.pz='';
    if(S.cur===was){S.cur=n;S.typed='';S.msg=''}
    if(!editing())render();return}
  if(document.hidden)return;
  var el=$('#cd');if(el)el.textContent=MC.countdown()},1000);

MC.load();applyTheme();
// 404.html manda las rutas que GitHub Pages no conoce como ?r=aprender
(function(){var r=null;try{r=new URLSearchParams(location.search).get('r')}catch(e){}
  S.view=viewOf(r!==null?BASE+r:location.pathname)||'hoy';
  try{history.replaceState({v:S.view,n:S.cur},'',urlOf(S.view)+location.hash)}catch(e){}})();
if(!MC.clueOf(S.cur))S.pz='cargando';
render();
MC.base.conectar(refreshLive,function(){S.amsg='';S.am=null;S.adm=null;S.ae=null;applyTheme();if(editing()&&S.view!=='cuenta')refreshLive();else render()}).then(function(){
  var mine=Object.keys(store.hist).map(Number).concat([today()]);
  var go2=function(){if(!editing())render();else refreshLive()};
  if(!MC.base.conectada()){S.pz=MC.clueOf(S.cur)?'listo':'error';go2();return}
  S.pz='cargando';
  Promise.all([MC.base.pistaDeHoy(),MC.base.pistas(mine),MC.base.revisarPistas()]).then(function(){S.pz='listo'},function(){S.pz=MC.clueOf(S.cur)?'listo':'error'}).then(go2)}).catch(function(){});
})(window.MC);
