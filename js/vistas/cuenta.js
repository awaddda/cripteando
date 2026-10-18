(function(MC){
'use strict';
var esc=MC.esc, store=MC.store, avatar=MC.avatar;
var svg=function(d){return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>'};
var THEMES=[['','Automático','M12 21a9 9 0 1 1 0-18zM12 3a9 9 0 0 1 0 18'],['light','Claro','M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],['dark','Oscuro','M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z']];
var KINDS=['Sugerencia','Algo no funciona','Una pista con un error','Otra cosa'];

function sec(title,lead,body,cls){return '<section class="acc-sec'+(cls?' '+cls:'')+'"><h2>'+title+'</h2>'+(lead?'<p class="muted">'+lead+'</p>':'')+body+'</section>'}
function toggle(id,label,on,act){return '<label class="tgl" for="'+id+'"><span>'+label+'</span><input type="checkbox" id="'+id+'" data-act="'+act+'"'+(on?' checked':'')+'><span class="tgl-ui" aria-hidden="true"></span></label>'}
function out(id,S){var m=S.am&&S.am.id===id?S.am:null;return '<p class="msg '+(m?m.cls:'')+'" id="'+id+'" role="status" style="text-align:left">'+(m?esc(m.t):'')+'</p>'}

function authBox(S){var tab=S.atab==='signup'?'signup':(S.atab==='forgot'?'forgot':'login'),h='';
  h+='<div class="tabs2 wide" role="group" aria-label="Acceso"><button data-act="atab" data-v="login" aria-pressed="'+(tab!=='signup')+'">Entrar</button><button data-act="atab" data-v="signup" aria-pressed="'+(tab==='signup')+'">Crear cuenta</button></div>';
  if(tab==='login')h+='<form class="stack" id="f-login" novalidate><div class="field"><label for="l-email">Email</label><input id="l-email" type="email" autocomplete="email" inputmode="email" required></div>'+
    '<div class="field"><label for="l-pass">Contraseña</label><input id="l-pass" type="password" autocomplete="current-password" required></div>'+
    '<div class="row-wrap"><button class="btn pri" type="submit">Entrar</button><button type="button" class="link" data-act="atab" data-v="forgot">¿Olvidaste tu contraseña?</button></div>'+out('a-out',S)+'</form>';
  else if(tab==='signup')h+='<form class="stack" id="f-signup" novalidate><div class="field"><label for="u-name">Nombre de usuario</label><input id="u-name" maxlength="20" autocomplete="username" autocapitalize="none" spellcheck="false" required><small>De 3 a 20 letras, números, puntos o guiones bajos. Es el que ven los demás.</small></div>'+
    '<div class="field"><label for="u-email">Email</label><input id="u-email" type="email" autocomplete="email" inputmode="email" required></div>'+
    '<div class="field"><label for="u-pass">Contraseña</label><input id="u-pass" type="password" autocomplete="new-password" minlength="6" required><small>Al menos 6 caracteres.</small></div>'+
    '<div><button class="btn pri" type="submit">Crear cuenta</button></div>'+out('a-out',S)+'</form>';
  else h+='<form class="stack" id="f-forgot" novalidate><p class="muted">Escribí tu email y te mandamos un enlace para elegir una contraseña nueva.</p><div class="field"><label for="f-email">Email</label><input id="f-email" type="email" autocomplete="email" inputmode="email" required></div>'+
    '<div class="row-wrap"><button class="btn pri" type="submit">Mandarme el enlace</button><button type="button" class="link" data-act="atab" data-v="login">Volver</button></div>'+out('a-out',S)+'</form>';
  h+='<div class="or"><span>o</span></div><div><button class="btn wide btn-google" data-act="login"><svg class="g-logo" viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg><span>Entrar con Google</span></button></div>';
  return h}

function vAccount(){var S=MC.S,con=MC.base.conectada(),u=MC.base.usuario(),h='';
  h+='<header class="acc-head"><h1 class="page-title">Tu cuenta</h1><p class="lead">'+(con?'Guardá tu progreso y llevá tu racha a todos tus dispositivos.':'Elegí cómo te ven los demás y cómo se ve la página.')+'</p></header>';
  if(MC.base.local&&MC.base.local())h+='<div class="note">Estás abriendo la página desde tu computadora. Las cuentas, la clasificación y los grupos funcionan, pero se guardan solo en este navegador. Cuando conectes Firebase y la subas, pasan a ser reales.</div>';

  if(con&&u){
    h+='<section class="acc-sec acc-me">'+avatar(store.photo,store.alias,'big')+'<div><b>'+esc(store.alias)+'</b>'+(u.email?'<span class="muted">'+esc(u.email)+'</span>':'')+
      '<div class="row-wrap"><label class="btn sm" for="a-photo">Cambiar foto</label><input id="a-photo" type="file" accept="image/*" class="sr">'+(store.photo?'<button class="btn sm" data-act="nophoto">Quitar foto</button>':'')+'</div>'+out('p-out',S)+'</div></section>'+
      '<p class="acc-sync">Tu racha, tus estadísticas y tus envíos viajan entre dispositivos.</p>'+
      (!store.uname?'<div class="note">Elegí tu nombre de usuario en Perfil para aparecer en la clasificación con él.</div>':'')+
      (u.email&&!u.google&&!u.verificado?'<div class="note">Te mandamos un email para confirmar tu dirección. Si no lo ves, fijate en correo no deseado.</div>':'');
  } else if(con){
    h+=sec('Iniciá sesión','Para guardar tu progreso en la nube, aparecer en la clasificación, jugar en grupos y mandarnos pistas. Para jugar la pista del día no hace falta.',authBox(S));
  }

  var sinSesion=con&&!u;
  if(!sinSesion)h+=sec('Perfil',con&&u?'Tu nombre de usuario aparece en la clasificación, en tus grupos y en las pistas que envíes.':'Tu nombre aparece en las pistas que envíes.',
    '<form class="stack" id="f-acc"><div class="field"><label for="a-alias">'+(con&&u?'Nombre de usuario':'Nombre')+'</label><input id="a-alias" maxlength="20" value="'+esc(store.alias)+'" autocomplete="off" autocapitalize="none" spellcheck="false">'+
      (con&&u?'<small>De 3 a 20 letras, números, puntos o guiones bajos. Tiene que ser único.</small>':'<small>Elegí uno que no sea tu nombre completo.</small>')+'</div>'+
    toggle('a-show','Mostrar mi nombre en las pistas que envío',store.showName,'showname')+
    '<div class="row-wrap"><button class="btn pri" type="submit" id="a-save" disabled>Guardar perfil</button></div>'+out('a-msg',S)+'</form>');

  if(!sinSesion)h+=sec('Racha','','<p>Racha actual <b>'+MC.streak()+'</b> · máxima <b>'+MC.bestStreak()+'</b>. <button class="link" data-act="go" data-v="estadisticas">Ver estadísticas</button></p>');

  if(con&&u)h+=sec('Preferencias','',toggle('a-pub','Aparecer en la clasificación pública',store.pub,'pub')+'<small class="muted">Si lo desactivás, tus resultados dejan de verse en la clasificación y en tus grupos.</small>');

  if(con&&u)h+=sec('Enviar comentarios','Contanos qué te gusta, qué no funciona o qué te gustaría ver.',
    u?'<form class="stack" id="f-fb"><div class="field"><label for="fb-kind">Tipo</label><select id="fb-kind">'+KINDS.map(function(k){return '<option>'+k+'</option>'}).join('')+'</select></div>'+
      '<div class="field"><label for="fb-msg">Mensaje</label><textarea id="fb-msg" rows="4" maxlength="1000" placeholder="Contanos qué te gusta, qué falla o qué mejorarías…"></textarea></div>'+
      '<div><button class="btn" type="submit">Enviar comentario</button></div><p class="msg" id="fb-out" role="status" style="text-align:left"></p></form>'
     :'<p class="muted">Iniciá sesión para mandarnos comentarios.</p>');

  h+=sec('Apariencia','Elegí cómo se ve la página.','<div class="themes" role="group" aria-label="Tema">'+THEMES.map(function(t){return '<button class="theme" data-act="theme" data-v="'+t[0]+'" aria-pressed="'+(store.theme===t[0])+'">'+svg(t[2])+'<span>'+t[1]+'</span></button>'}).join('')+'</div>');
  // Instalar como app: botón donde el navegador lo permite, instrucciones en iPhone y nada si ya está instalada
  var instalada=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone,ios=/iPhone|iPad|iPod/.test(navigator.userAgent);
  if(!instalada)h+=sec('Instalar la app','Tené Cripteando en la pantalla de inicio de tu celular, con su ícono, y abrila a pantalla completa.',
    MC.instalar?'<div><button class="btn pri" data-act="install">Instalar Cripteando</button></div>':
    (ios?'<p>En Safari, tocá <b>Compartir</b> (el cuadrado con la flecha) y después <b>Agregar a inicio</b>.</p>':'<p>Desde el menú del navegador, elegí <b>Instalar app</b> o <b>Agregar a la pantalla de inicio</b>.</p>'));

  if(con&&u&&MC.base.esAdmin())h+=sec('Administración','Editá las pistas, programá las próximas y revisá lo que te mandan los jugadores.','<div><button class="btn" data-act="go" data-v="admin">Administrar pistas</button></div>');

  var everywhere=con&&u;
  h+=sec('Tu progreso',everywhere?'Tus partidas, tu racha y tus estadísticas se guardan en tu cuenta.':'Tus partidas, tu racha y tus estadísticas se guardan en este dispositivo hasta que inicies sesión.'+(MC.mem?' Ahora mismo no se pueden guardar, así que se pierden al cerrar la página.':''),
    S.confirm==='reset'?'<div class="acc-del"><p>¿Borrar todo tu progreso? Se borran tus partidas, tu racha y tus estadísticas'+(everywhere?' en todos tus dispositivos':'')+'. No se puede deshacer.</p><div class="row-wrap"><button class="btn sm danger" data-act="reset-yes">Sí, borrar</button><button class="btn sm" data-act="noleave">Cancelar</button></div></div>':'<div><button class="btn danger" data-act="reset">Borrar mi progreso</button></div>');

  if(con&&u)h+='<section class="acc-sec acc-end"><button class="btn wide" data-act="logout">Cerrar sesión</button>'+
    (S.confirm==='delacc'?'<div class="acc-del"><p>¿Eliminar tu cuenta? Se borran tus datos y tu nombre de usuario, y salís de la clasificación y de tus grupos. No se puede deshacer.</p><div class="row-wrap"><button class="btn sm danger" data-act="delacc-yes">Sí, eliminar mi cuenta</button><button class="btn sm" data-act="noleave">Cancelar</button></div></div>':'<button class="link del-link" data-act="delacc">Eliminar cuenta</button>')+
    (S.dmsg?'<p class="msg bad" role="status">'+esc(S.dmsg)+'</p>':'')+'</section>';

  return '<div class="account">'+h+'</div>'}

function readPhoto(file){return new Promise(function(res,rej){
  if(!file||!/^image\//.test(file.type))return rej({code:'photo-type'});
  if(file.size>15*1024*1024)return rej({code:'photo-size'});
  var url=URL.createObjectURL(file),img=new Image();
  img.onload=function(){var S=128,c=document.createElement('canvas'),x=c.getContext('2d'),m=Math.min(img.width,img.height);c.width=c.height=S;
    x.drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,S,S);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',0.82))};
  img.onerror=function(){URL.revokeObjectURL(url);rej({code:'photo-read'})};img.src=url})}

MC.vAccount=vAccount;
MC.readPhoto=readPhoto;
})(window.MC);
