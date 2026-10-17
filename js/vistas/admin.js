(function(MC){
'use strict';
var $=MC.$, esc=MC.esc, norm=MC.norm, today=MC.today, fmtLong=MC.fmtLong, MECHS=MC.MECHS;
var IK={'Anagrama':'un anagrama','Palabra oculta':'una palabra oculta','Bifronte':'leer al revés','Homófono':'un homófono, algo que suena igual','Charada':'una suma de piezas','Doble definición':''};
var STL={pendiente:['Pendiente','p'],aceptada:['Aceptada','w'],rechazada:['Rechazada','l']};

function A(){var S=MC.S;if(!S.adm)S.adm={st:'',list:[],subs:[],fb:[],msg:'',cls:''};return S.adm}
function find(n){return A().list.filter(function(x){return x.n===n})[0]}
function nextN(){var l=A().list;return l.length?l[l.length-1].n+1:1}
function status(n){var T=today();return n<T?['Publicada','w']:(n===T?['Hoy','t']:['Programada','p'])}
function fecha(t){try{return new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'short'}).format(new Date(t)).replace(/\./g,'')}catch(e){return ''}}
var THUMB='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0 4-7a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 17.1 21H7"/></svg>';
function votes(n){var v=(A().votes||{})[n]||{up:0,down:0};
  return '<span class="avotes" title="'+v.up+(v.up===1?' me gusta':' me gustan')+', '+v.down+' no'+(v.down===1?' me gusta':' me gustan')+'"><span class="avote up"><i>'+THUMB+'</i><b>'+v.up+'</b></span><span class="avote down"><i>'+THUMB+'</i><b>'+v.down+'</b></span></span>'}
function field(id,label,ctrl,small){return '<div class="field"><label for="'+id+'">'+label+'</label>'+ctrl+(small?'<small>'+small+'</small>':'')+'</div>'}

function stars(html){return String(html||'').replace(/<b>([\s\S]*?)<\/b>/gi,'*$1*').replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&')}
function unstars(s){return esc(String(s||'').trim()).replace(/\*([^*]+)\*/g,'<b>$1</b>')}
function syncRoles(e){var w=MC.palabras(e.text),old=e.roles,out=[];for(var i=0;i<w.length;i++)out.push({w:w[i],r:old[i]&&old[i].w===w[i]?old[i].r:''});e.roles=out;return out}
function fromClue(n,c){var roles=[];c.t.forEach(function(x){MC.palabras(x[0]).forEach(function(w){roles.push({w:w,r:x[1]||''})})});
  return {n:n,isNew:false,a:c.a,m:c.m||'',ik:c.ik||'',text:roles.map(function(x){return x.w}).join(' '),roles:roles,ex:stars(c.ex),pk:typeof c.por!=='string'?'':(c.por?'nombre':'anonima'),por:c.por||''}}
function fromSub(s){var seg=[];try{seg=JSON.parse(s.seg)||[]}catch(e){}
  var labels=String(s.mechs||'').split(',').map(function(k){var m=MECHS.filter(function(x){return x[0]===k})[0];return m?m[1]:''}).filter(Boolean);
  var m=labels.length===1?labels[0]:(labels.length?'Combinada':'');
  var e=fromClue(nextN(),{a:String(s.answer||''),m:m,ik:IK[m]||'',t:Array.isArray(seg)&&seg.length?seg:[[String(s.text||''),'']],ex:''});
  e.isNew=true;e.ex=String(s.exp||'');e.sub=s.id;e.pk=s.pub&&s.al?'nombre':'anonima';e.por=s.pub&&s.al?String(s.al):'';return e}
function toClue(e){var t=[];syncRoles(e).forEach(function(x){var l=t[t.length-1];if(l&&l[1]===x.r)l[0]+=' '+x.w;else t.push([x.w,x.r])});
  var c={a:String(e.a||'').trim().toUpperCase(),m:String(e.m||'').trim(),ik:String(e.ik||'').trim(),t:t,ex:unstars(e.ex)};
  if(e.pk==='anonima')c.por='';else if(e.pk==='nombre'&&String(e.por||'').trim())c.por=String(e.por).trim().slice(0,24);
  return c}

function tokens(e){var w=syncRoles(e);
  if(!w.length)return '<p class="muted">Cuando escribas el enunciado, sus palabras aparecen acá.</p>';
  return '<div class="toks">'+w.map(function(x,i){return '<button type="button" class="tok'+(x.r?' r-'+x.r:'')+'" data-act="aword" data-i="'+i+'" aria-pressed="'+!!x.r+'"'+(x.r?' title="'+MC.RL[x.r]+'"':'')+'>'+esc(x.w)+'</button>'}).join('')+'</div>'}
function checkInfo(e){var c=toClue(e),ans=norm(c.a);
  if(!String(e.text||'').trim()||!ans)return {cls:'note',text:'Cuando completes el enunciado y la respuesta, verifico lo que se pueda de forma automática.'};
  var k=MECHS.filter(function(x){return x[1]===c.m})[0],v=MC.verificar(e.text,ans,k?[k[0]]:[]);
  if(!c.t.some(function(x){return x[1]==='def'}))v.lines.push('Falta marcar la definición.');
  return {cls:v.any?(v.bad?'note warn':'note ok'):'note',text:v.lines.join(' ')}}
function prev(e){var c=toClue(e),len=norm(c.a).length;
  if(!c.t.length||!len)return '<p class="muted">Completá el enunciado y la respuesta para ver cómo la verían los jugadores.</p>';
  var clue=c.t.map(function(x){return x[1]?'<mark class="seg m-'+x[1]+'">'+esc(x[0])+'</mark>':esc(x[0])}).join(' ')+' <span class="len">('+len+')</span>';
  return '<div class="spreview">'+MC.chips(c.t,{def:1,ind:1,mat:1})+'<p class="clue">'+clue+'</p>'+MC.firma(c)+MC.desglose(c.t,c.ik,c.ex)+MC.ansBox(c.a)+'</div>'}

function editor(e){var S=MC.S,T=today(),role=S.arole===undefined?'def':S.arole,ck=checkInfo(e);
  var opts=MECHS.map(function(m){return m[1]});if(e.m&&opts.indexOf(e.m)<0)opts.unshift(e.m);
  var h='<button class="link" data-act="aback">Volver a la lista</button><h1 class="page-title" style="margin-top:10px">'+(e.isNew?'Nueva pista':'Pista')+' #'+e.n+'</h1>'+
    '<p class="lead">'+(e.n<T?'Salió el ':(e.n===T?'Es la pista de hoy, del ':'Sale el '))+fmtLong(e.n)+'.</p>'+(!e.isNew&&e.n<=T?'<div style="margin:-10px 0 18px">'+votes(e.n)+'</div>':'');
  if(!e.isNew&&e.n<=T)h+='<div class="note warn">Esta pista ya salió. Si cambiás la respuesta, se borra el progreso de quienes ya la jugaron.'+(e.n<T?' Quienes ya la abrieron siguen viendo la versión anterior.':'')+'</div>';
  if(e.sub)h+='<div class="note">Viene de una pista enviada. Al guardarla, queda marcada como aceptada.</div>';
  h+='<form class="send" id="f-adm" novalidate><section class="acc-sec">'+
    field('ae-text','Enunciado','<textarea id="ae-text" class="serif" rows="3" maxlength="240" placeholder="Tema confuso para tomar con bombilla">'+esc(e.text)+'</textarea>','Sin el número de letras: la página lo agrega sola.')+
    field('ae-a','Respuesta','<input id="ae-a" maxlength="30" autocomplete="off" value="'+esc(e.a)+'" style="text-transform:uppercase;font-family:var(--font-mono);letter-spacing:.1em">')+
    field('ae-m','Mecanismo','<select id="ae-m">'+(e.m?'':'<option value="">Elegí uno</option>')+opts.map(function(o){return '<option'+(o===e.m?' selected':'')+'>'+esc(o)+'</option>'}).join('')+'</select>')+
    field('ae-ik','Qué pide el indicador','<input id="ae-ik" maxlength="80" autocomplete="off" value="'+esc(e.ik)+'" placeholder="un anagrama">','Completa la frase «el indicador pide…». Dejalo vacío si la pista no tiene indicador.')+
    field('ae-pk','Quién la escribió','<select id="ae-pk">'+[['','Cripteando (no se muestra firma)'],['nombre','Un jugador, con su nombre'],['anonima','Un jugador, de forma anónima']].map(function(o){return '<option value="'+o[0]+'"'+(o[0]===(e.pk||'')?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>')+
    field('ae-por','Nombre del autor','<input id="ae-por" maxlength="24" autocomplete="off" value="'+esc(e.por||'')+'"'+(e.pk==='nombre'?'':' disabled')+'>','Aparece debajo de la pista: «Pista enviada por…».')+'</section>';
  h+='<section class="acc-sec"><h2>Partes</h2><small class="muted">Elegí un rol y tocá las palabras del enunciado. Marcar la definición es obligatorio.</small>'+
    '<div class="roles" role="group" aria-label="Rol a marcar">'+[['def','Definición'],['mat','Relleno'],['ind','Indicador'],['','Borrar']].map(function(r){var on=role===r[0];return '<button type="button" class="rchip'+(r[0]?' r-'+r[0]:' r-how')+(on?' on':'')+'" data-act="arole" data-v="'+r[0]+'" aria-pressed="'+on+'">'+r[1]+'</button>'}).join('')+'</div>'+
    '<div id="ae-tokens">'+tokens(e)+'</div>'+
    field('ae-ex','Cómo se arma','<textarea id="ae-ex" rows="3" maxlength="600">'+esc(e.ex)+'</textarea>','Para resaltar letras, ponelas entre asteriscos: co*PAS MO*jadas.')+
    '<div id="ae-check" class="'+ck.cls+'" aria-live="polite">'+esc(ck.text)+'</div></section>';
  h+='<section class="acc-sec"><h2>Vista previa</h2><div id="ae-prev">'+prev(e)+'</div></section>';
  h+='<section class="acc-sec"><div class="row-wrap"><button class="btn pri" type="submit">Guardar</button><button type="button" class="btn" data-act="aback">Cancelar</button>'+
    (!e.isNew&&e.n>T&&!e.del?'<button type="button" class="link del-link" data-act="adel">Borrar pista</button>':'')+'</div>'+
    (e.del?'<div class="acc-del"><p>¿Borrar la pista #'+e.n+'? Ese día queda sin pista hasta que cargues otra.</p><div class="row-wrap"><button type="button" class="btn sm danger" data-act="adel-yes">Sí, borrar</button><button type="button" class="btn sm" data-act="adel-no">Cancelar</button></div></div>':'')+
    '<p class="msg '+(e.cls||'')+'" id="ae-msg" role="status" style="text-align:left">'+esc(e.msg||'')+'</p></section></form>';
  return h}

function vAdmin(){var S=MC.S,ad=A();
  if(!MC.base.esAdmin())return '<div class="empty"><b>Esta sección es solo para administrar la página</b>Iniciá sesión con la cuenta de administración.</div><p style="text-align:center;margin-top:16px"><button class="link" data-act="go" data-v="cuenta">Ir a Cuenta</button></p>';
  if(S.ae)return wrap(editor(S.ae));
  var T=today(),h='<button class="link" data-act="go" data-v="cuenta">Volver a Cuenta</button><h1 class="page-title" style="margin-top:10px">Administrar pistas</h1><p class="lead">Editá las pistas, programá las próximas y revisá lo que te mandan los jugadores.</p>';
  h+='<div class="row-wrap"><button class="btn pri" data-act="anew">Nueva pista</button><button class="btn" data-act="aexport"'+(ad.list.length?'':' disabled')+'>Descargar copia</button></div>';
  h+='<p class="msg '+(ad.cls||'')+'" id="adm-msg" role="status" style="text-align:left">'+esc(ad.msg||'')+'</p>';
  if(ad.st!=='listo'&&ad.st!=='error')return wrap(h+'<div class="empty" role="status"><b>Cargando las pistas…</b></div>');
  if(ad.st==='error')return wrap(h+'<div class="note warn">No pude leer las pistas. Revisá que las reglas de Firestore estén publicadas y recargá la página.</div>'+importBox(S));
  var last=ad.list.length?ad.list[ad.list.length-1].n:0,ahead=last-T;
  h+=ahead>0?'<div class="note ok">Tenés pistas programadas hasta el '+fmtLong(last)+': '+ahead+(ahead===1?' día más.':' días más.')+'</div>':
    '<div class="note warn">'+(ad.list.length?'No hay pistas programadas después de hoy: mañana no sale ninguna.':'Todavía no hay pistas cargadas.')+'</div>';
  h+='<section class="acc-sec"><h2>Pistas</h2>'+(ad.list.length?'<ul class="list">'+ad.list.slice().reverse().map(function(x){var st=status(x.n);
    return '<li><button class="arow" data-act="aedit" data-n="'+x.n+'"><span class="n">#'+x.n+'</span><span class="d"><b class="mono">'+esc(x.c.a)+'</b><small>'+fmtLong(x.n)+', '+esc(x.c.m)+'</small></span>'+votes(x.n)+'<span class="st '+st[1]+'">'+st[0]+'</span></button></li>'}).join('')+'</ul>':'<p class="muted">Cuando cargues pistas, aparecen acá.</p>')+'</section>';
  h+='<section class="acc-sec"><h2>Pistas enviadas</h2>'+(ad.subs.length?'<ul class="list">'+ad.subs.map(function(x,i){var st=STL[x.st]||STL.pendiente;
    return '<li class="panel" style="padding:14px 16px"><div class="sec-top"><b class="mono">'+esc(x.answer)+'</b><span class="st '+st[1]+'">'+st[0]+'</span></div><p class="serif" style="margin:6px 0">'+esc(x.text)+'</p>'+
      (x.notes?'<p class="muted" style="margin:0 0 6px">'+esc(x.notes)+'</p>':'')+'<small class="muted">'+(x.pub&&x.al?'Firma como '+esc(x.al)+', ':'Anónima, ')+fecha(x.t)+(x.u?' · cuenta <span class="mono" title="'+esc(x.u)+'">'+esc(String(x.u).slice(0,8))+'</span>':'')+'</small>'+
      '<div class="row-wrap" style="margin-top:10px"><button class="btn sm" data-act="asub" data-i="'+i+'">Pasar al editor</button>'+(x.st!=='rechazada'?'<button class="btn sm" data-act="ast" data-i="'+i+'" data-v="rechazada">Rechazar</button>':'')+'</div></li>'}).join('')+'</ul>':'<p class="muted">Todavía nadie mandó pistas.</p>')+'</section>';
  h+='<section class="acc-sec"><h2>Comentarios</h2>'+(ad.fb.length?'<ul class="list">'+ad.fb.map(function(x){
    return '<li class="panel" style="padding:14px 16px"><b>'+esc(x.kind)+'</b><p style="margin:6px 0;white-space:pre-wrap">'+esc(x.msg)+'</p><small class="muted">'+(x.al?esc(x.al)+', ':'')+fecha(x.t)+'</small></li>'}).join('')+'</ul>':'<p class="muted">Todavía no hay comentarios.</p>')+'</section>';
  return wrap(h+importBox(S))}
function wrap(h){return '<div class="account">'+h+'</div>'}
function importBox(S){var m=S.am&&S.am.id==='ad-out'?S.am:null;
  return '<section class="acc-sec"><h2>Importar desde tu compu</h2><p class="muted">Sube las pistas de privado/banco.js y reemplaza las que tengan el mismo número. Funciona solo si abrís la página desde tu compu.</p><div><button class="btn" data-act="upclues">Importar banco.js</button></div>'+
    '<p class="msg '+(m?m.cls:'')+'" id="ad-out" role="status" style="text-align:left">'+(m?esc(m.t):'')+'</p></section>'}

function load(){var S=MC.S,ad=A();if(!MC.base.esAdmin()||ad.st==='cargando')return;ad.st='cargando';
  Promise.all([MC.base.todasLasPistas().then(function(l){ad.list=l}),MC.base.envios().then(function(l){ad.subs=l},function(){ad.subs=[]}),MC.base.comentarios().then(function(l){ad.fb=l},function(){ad.fb=[]}),MC.base.votos().then(function(m){ad.votes=m},function(){ad.votes={}})])
    .then(function(){ad.st='listo'},function(e){ad.st='error';try{console.warn('Cripteando, administrar:',e&&e.code||e,e&&e.message||'')}catch(x){}}).then(function(){if(S.view==='admin'&&!S.ae)MC.render()})}

function readForm(){var e=MC.S.ae;if(!e)return null;var v=function(id){var x=$('#'+id);return x?x.value:null},y;
  if((y=v('ae-pk'))!==null)e.pk=y;if((y=v('ae-por'))!==null)e.por=y;if((y=v('ae-text'))!==null)e.text=y;if((y=v('ae-a'))!==null)e.a=y;if((y=v('ae-m'))!==null)e.m=y;if((y=v('ae-ik'))!==null)e.ik=y;if((y=v('ae-ex'))!==null)e.ex=y;
  syncRoles(e);return e}
function input(target){var e=readForm();if(!e)return;
  if(target&&target.id==='ae-text'){var tk=$('#ae-tokens');if(tk)tk.innerHTML=tokens(e)}
  if(target&&target.id==='ae-pk'){var po=$('#ae-por');if(po)po.disabled=e.pk!=='nombre'}
  if(target&&target.id==='ae-m'&&!e.ik&&IK[e.m]){e.ik=IK[e.m];var ik=$('#ae-ik');if(ik)ik.value=e.ik}
  var ck=$('#ae-check');if(ck){var i=checkInfo(e);ck.className=i.cls;ck.textContent=i.text}
  var pv=$('#ae-prev');if(pv)pv.innerHTML=prev(e)}

function exportBank(){var ad=A(),arr=[],i;ad.list.forEach(function(x){arr[x.n-1]=x.c});for(i=0;i<arr.length;i++)if(!arr[i])arr[i]=null;
  try{var b=new Blob(['window.MC_BANCO='+JSON.stringify(arr,null,1)+';\n'],{type:'text/javascript'}),u=URL.createObjectURL(b),l=document.createElement('a');
    l.href=u;l.download='banco.js';document.body.appendChild(l);l.click();setTimeout(function(){URL.revokeObjectURL(u);l.remove()},1000);
    ad.msg='Descargué banco.js. Guardalo en la carpeta privado o en Drive como copia.';ad.cls='ok'}
  catch(e){ad.msg='No pude descargar la copia.';ad.cls='bad'}
  MC.render()}

function save(){var S=MC.S,ad=A(),e=readForm();if(!e)return;var c=toClue(e);
  var say=function(t,cls){e.msg=t;e.cls=cls||'bad';var m=$('#ae-msg');if(m){m.textContent=t;m.className='msg '+e.cls}};
  if(!String(e.text||'').trim())return say('Escribí el enunciado.');
  if(norm(c.a).length<2)return say('Escribí la respuesta.');
  if(!c.m)return say('Elegí el mecanismo.');
  if(!c.t.some(function(x){return x[1]==='def'}))return say('Marcá la definición en las partes.');
  if(!c.ex)return say('Explicá cómo se arma la respuesta.');
  if(e.pk==='nombre'&&!String(e.por||'').trim())return say('Escribí el nombre del autor, o elegí que sea anónima.');
  say('Guardando…','ok');
  MC.base.guardarPista(e.n,c).then(function(){var x=find(e.n);if(x)x.c=c;else{ad.list.push({n:e.n,c:c});ad.list.sort(function(p,q){return p.n-q.n})}
    var fin=function(){S.ae=null;ad.msg='Guardé la pista #'+e.n+'.';ad.cls='ok';MC.render();window.scrollTo(0,0)};
    if(e.sub)MC.base.marcarEnvio(e.sub,'aceptada').then(function(){ad.subs.forEach(function(s){if(s.id===e.sub)s.st='aceptada'})},function(){}).then(fin);else fin()})
  .catch(function(err){say('No pude guardarla: '+MC.base.motivo(err))})}

function click(a,t){var S=MC.S,ad=A(),e;
  if(a==='anew')S.ae={n:nextN(),isNew:true,a:'',m:'',ik:'',text:'',roles:[],ex:'',pk:'',por:''};
  else if(a==='aedit'){var x=find(+t.dataset.n);if(x)S.ae=fromClue(x.n,x.c)}
  else if(a==='aback')S.ae=null;
  else if(a==='arole'){readForm();S.arole=t.dataset.v}
  else if(a==='aword'){e=readForm();var w=e&&e.roles[+t.dataset.i],r=S.arole===undefined?'def':S.arole;if(w)w.r=w.r===r?'':r}
  else if(a==='adel'){readForm();S.ae.del=true}
  else if(a==='adel-no'){readForm();S.ae.del=false}
  else if(a==='adel-yes'){var n=S.ae.n;t.disabled=true;
    MC.base.borrarPista(n).then(function(){ad.list=ad.list.filter(function(x){return x.n!==n});S.ae=null;ad.msg='Borré la pista #'+n+'.';ad.cls='ok';MC.render()})
      .catch(function(err){S.ae.del=false;S.ae.msg='No pude borrarla: '+MC.base.motivo(err);S.ae.cls='bad';MC.render()});return}
  else if(a==='aexport'){exportBank();return}
  else if(a==='asub'){var s=ad.subs[+t.dataset.i];if(s)S.ae=fromSub(s)}
  else if(a==='ast'){var s2=ad.subs[+t.dataset.i],v=t.dataset.v;if(!s2)return;t.disabled=true;
    MC.base.marcarEnvio(s2.id,v).then(function(){s2.st=v;MC.render()}).catch(function(err){ad.msg='No pude cambiar el estado: '+MC.base.motivo(err);ad.cls='bad';MC.render()});return}
  var keep=/^(aword|arole|adel|adel-no)$/.test(a),y=window.scrollY;MC.render();window.scrollTo(0,keep?y:0)}

MC.vAdmin=vAdmin;
MC.adminLoad=load;
MC.adminClick=click;
MC.adminInput=input;
MC.adminSave=save;
})(window.MC);
