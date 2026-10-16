(function(MC){
'use strict';
var esc=MC.esc, store=MC.store, COLORS=MC.COLORS, statusNote=MC.statusNote, avatar=MC.avatar;

function vAccount(){var S=MC.S;
  var sw=COLORS.map(function(c,i){return '<button class="sw" style="background:'+c+'" data-act="color" data-i="'+i+'" aria-pressed="'+(store.color===i)+'" aria-label="Color '+(i+1)+'"></button>'}).join('');
  return '<h1 class="page-title">Cuenta</h1><p class="lead">Elegí cómo te ven los demás en la clasificación y en tus grupos.</p>'+statusNote()+
  '<div class="two" style="margin-top:16px"><form class="panel stack" id="f-acc"><div class="field"><label for="a-alias">Tu nombre de jugador</label><input id="a-alias" maxlength="24" value="'+esc(store.alias)+'" autocomplete="off"><small>Es el que aparece en los rankings. Elegí uno que no sea tu nombre completo.</small></div>'+
  '<div class="field"><label>Color</label><div class="swatches" role="group" aria-label="Color de tu avatar">'+sw+'</div></div><div class="row-wrap">'+avatar(store.color,store.alias)+'<button class="btn pri" type="submit">Guardar</button><span class="msg ok" id="a-msg" role="status" style="min-height:0;margin:0"></span></div></form>'+
  '<div class="panel stack"><h2 style="font-size:20px">Tus datos</h2><p class="muted">Tu progreso (partidas, racha y ayudas) vive en este navegador'+(MC.mem?'. Ahora mismo no se puede guardar acá, así que se pierde al cerrar la página':'')+'. Si la base compartida está conectada, tus resultados también se publican en la clasificación.</p>'+
  (S.confirm==='reset'?'<div class="row-wrap"><span>¿Borrar todo tu progreso?</span><button class="btn sm danger" data-act="reset-yes">Sí, borrar</button><button class="btn sm" data-act="noleave">Cancelar</button></div>':'<div><button class="btn danger" data-act="reset">Borrar mi progreso de este navegador</button></div>')+'</div></div>'}

MC.vAccount=vAccount;
})(window.MC);
