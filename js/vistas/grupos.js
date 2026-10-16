(function(MC){
'use strict';
var $=MC.$, esc=MC.esc, norm=MC.norm, today=MC.today, store=MC.store, save=MC.save, statusNote=MC.statusNote, rankRows=MC.rankRows;

function vGroups(){var S=MC.S;
  return '<h1 class="page-title">Grupos</h1><p class="lead">Armá un grupo con tus compañeros de curso o con tu familia y compitan entre ustedes. Se une con un código de cinco letras.</p>'+statusNote('grupos')+
  '<div class="two" style="margin:16px 0 24px"><form class="panel stack" id="f-create"><h2 style="font-size:20px">Crear un grupo</h2><div class="field"><label for="g-name">Nombre</label><input id="g-name" maxlength="40" placeholder="Por ejemplo, 5° año B" autocomplete="off"></div><div><button class="btn pri" type="submit">Crear grupo</button></div></form>'+
  '<form class="panel stack" id="f-join"><h2 style="font-size:20px">Unirme con un código</h2><div class="field"><label for="g-code">Código</label><input id="g-code" maxlength="5" placeholder="K7M2P" autocomplete="off" style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--font-mono)"></div><div><button class="btn" type="submit">Unirme</button></div></form></div>'+
  '<p class="msg '+S.gcls+'" id="gmsg" role="status" aria-live="polite" style="text-align:left">'+esc(S.gmsg)+'</p><div id="glive"></div>'}
function liveGroups(){var S=MC.S,el=$('#glive');if(!el)return;
  if(!store.groups.length){el.innerHTML='<div class="empty"><b>Todavía no estás en ningún grupo</b>Creá uno o pegá el código que te pasaron.</div>';return}
  if(!S.gsel||store.groups.indexOf(S.gsel)<0)S.gsel=store.groups[0];
  var pick='<div class="gpick" role="group" aria-label="Tus grupos">'+store.groups.map(function(c){var g=MC.base.grupo(c);return '<button data-act="gsel" data-c="'+esc(c)+'" aria-pressed="'+(c===S.gsel)+'">'+esc(g?g.name:c)+'</button>'}).join('')+'</div>';
  var g=MC.base.grupo(S.gsel),body;
  if(!g){body='<div class="empty"><b>No encuentro este grupo</b>Puede que se haya borrado o que todavía esté cargando.</div>'}
  else{var t=today(),players=MC.base.jugadores(),results=MC.base.resultados(),uid=MC.base.uid(),ms=Object.keys(g.members||{}).filter(function(u){return g.members[u]});
    var rows=ms.map(function(u){var p=players[u]||{},r=results[t+'_'+u];return {al:p.alias||'Sin partidas todavía',ph:p.ph,val:MC.num(p.won),sub:r?'Hoy: '+(MC.num(r.a)===1?'al primer intento':'en '+MC.num(r.a)+' intentos'):'Hoy: sin jugar',me:u===uid}}).sort(function(a,b){return b.val-a.val});
    body='<div class="panel stack"><div class="codebox"><span class="muted">Código</span><code>'+esc(S.gsel)+'</code><button class="btn sm" data-act="copycode">Copiar</button><span class="spacer"></span>'+(S.confirm===S.gsel?'<span>¿Salir del grupo?</span><button class="btn sm danger" data-act="leave" data-c="'+esc(S.gsel)+'">Sí, salir</button><button class="btn sm" data-act="noleave">Cancelar</button>':'<button class="btn sm" data-act="askleave">Salir del grupo</button>')+'</div>'+
      '<h2 style="font-size:20px">'+esc(g.name)+' <span class="tag">'+rows.length+(rows.length===1?' integrante':' integrantes')+'</span></h2>'+rankRows(rows,'<div class="empty"><b>Sin integrantes</b></div>')+'</div>'}
  el.innerHTML='<div class="stack">'+pick+body+'</div>'}
function gmsg(t,ok){var S=MC.S;S.gmsg=t;S.gcls=ok?'ok':'bad';var m=$('#gmsg');if(m){m.textContent=t;m.className='msg '+S.gcls}}
function addGroup(c){if(store.groups.indexOf(c)<0)store.groups.push(c);save();MC.base.suscribirGrupo(c);MC.S.gsel=c;liveGroups()}
function createGroup(){var name=($('#g-name').value||'').trim().slice(0,40);
  if(!name)return gmsg('Ponele un nombre al grupo.');
  if(!MC.base.lista())return gmsg(MC.base.conectada()?'Iniciá sesión en Cuenta para crear un grupo o unirte a uno.':'Los grupos llegan pronto. Mientras tanto, podés seguir jugando la pista del día.');
  MC.base.crearGrupo(name)
  .then(function(code){$('#g-name').value='';addGroup(code);gmsg('Grupo creado. Pasale el código '+code+' a tus compañeros.',true)})
  .catch(function(e){gmsg('No pude crear el grupo: '+MC.base.motivo(e))})}
function joinGroup(){var code=norm($('#g-code').value||'').slice(0,5);
  if(code.length<5)return gmsg('El código tiene 5 letras.');
  if(!MC.base.lista())return gmsg(MC.base.conectada()?'Iniciá sesión en Cuenta para crear un grupo o unirte a uno.':'Los grupos llegan pronto. Mientras tanto, podés seguir jugando la pista del día.');
  MC.base.unirseAGrupo(code).then(function(g){
    if(!g){gmsg('No existe un grupo con ese código. Revisalo.');return}
    $('#g-code').value='';addGroup(code);gmsg('Listo, ya estás en «'+g.name+'».',true)})
  .catch(function(e){gmsg('No pude unirme: '+MC.base.motivo(e))})}
function leaveGroup(c){var S=MC.S;S.confirm='';MC.base.salirDeGrupo(c);
  store.groups=store.groups.filter(function(x){return x!==c});save();S.gsel=null;gmsg('Saliste del grupo.',true);liveGroups()}

MC.vGroups=vGroups;
MC.liveGroups=liveGroups;
MC.createGroup=createGroup;
MC.joinGroup=joinGroup;
MC.leaveGroup=leaveGroup;
})(window.MC);
