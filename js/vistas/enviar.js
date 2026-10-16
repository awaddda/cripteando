(function(MC){
'use strict';
var $=MC.$, esc=MC.esc, norm=MC.norm, store=MC.store, save=MC.save, MECHS=MC.MECHS;

function vSend(){var S=MC.S;
  var subs=store.subs.length?'<div class="stack"><h2 style="font-size:20px">Tus envíos</h2><ul class="list">'+store.subs.slice().reverse().map(function(s){return '<li class="panel" style="padding:12px 16px"><b class="mono">'+esc(s.answer)+'</b> · '+esc(s.mechLabel)+'<br><span class="muted">'+esc(s.text)+'</span><br><small class="muted">'+(s.sent?'Enviada':'Guardada solo en este navegador')+'</small></li>'}).join('')+'</ul></div>':'';
  return '<h1 class="page-title">Enviar una pista</h1><p class="lead">¿Se te ocurrió un críptico? Mandalo. Las mejores pueden salir publicadas con tu nombre.</p>'+
  '<div class="two"><form class="panel stack" id="f-send"><div class="field"><label for="s-text">La pista</label><textarea id="s-text" rows="3" maxlength="240" placeholder="Tema confuso para tomar con bombilla (4)"></textarea><small>Escribila como la verían los jugadores, con el número de letras entre paréntesis.</small></div>'+
  '<div class="field"><label for="s-ans">La respuesta</label><input id="s-ans" maxlength="30" autocomplete="off" placeholder="MATE" style="text-transform:uppercase;font-family:var(--font-mono);letter-spacing:.1em"></div>'+
  '<div class="field"><label for="s-mech">Mecanismo</label><select id="s-mech">'+MECHS.map(function(m){return '<option value="'+m[0]+'">'+m[1]+'</option>'}).join('')+'</select></div>'+
  '<div class="field"><label for="s-exp">Cómo se resuelve</label><textarea id="s-exp" rows="3" maxlength="400" placeholder="Explicá qué es la definición, qué es el indicador y cómo se arma la respuesta."></textarea></div>'+
  '<div id="s-check" class="note" aria-live="polite"></div><div><button class="btn pri" type="submit">Enviar pista</button></div><p class="msg '+S.scls+'" id="s-msg" role="status" aria-live="polite" style="text-align:left">'+esc(S.smsg)+'</p></form>'+
  '<div class="stack"><div class="panel"><h2 style="font-size:20px;margin-bottom:10px">Antes de enviarla</h2><ul class="checks"><li>La definición describe de verdad la respuesta.</li><li>El mecanismo cierra letra por letra. Contalas dos veces.</li><li>Si hay indicador, está en la pista y apunta a lo que hay que hacer.</li><li>La frase entera se lee como algo con sentido, aunque no tenga nada que ver con la solución.</li><li>La respuesta lleva su tilde.</li></ul></div>'+subs+'</div></div>'}
function wordsOf(t){return t.replace(/\(\s*\d+(\s*,\s*\d+)*\s*\)\s*$/,'').split(/\s+/).filter(Boolean)}
function checkSend(){var el=$('#s-check');if(!el)return;var text=$('#s-text').value,ans=norm($('#s-ans').value),m=$('#s-mech').value,w=wordsOf(text),out='',cls='note';
  if(!text.trim()||!ans){el.className='note';el.textContent='Cuando completes la pista y la respuesta, verifico lo que se pueda de forma automática.';return}
  var mm=text.match(/\((\d+)\)\s*$/);var lenOk=!mm||+mm[1]===ans.length;
  var grp=function(f){for(var i=0;i<w.length;i++)for(var j=i+1;j<=Math.min(w.length,i+5);j++){if(f(w.slice(i,j)))return w.slice(i,j).join(' ')}return null};
  var sorted=function(s){return s.split('').sort().join('')};
  if(m==='oculta'){var ok=norm(text.replace(/\(.*$/,'')).indexOf(ans)>-1;out=ok?'La respuesta aparece escondida en la frase.':'No encuentro la respuesta escondida de corrido en la frase. Revisá las letras.';cls=ok?'note ok':'note warn'}
  else if(m==='anagrama'){var g=grp(function(x){var n=norm(x.join(''));return n.length===ans.length&&n!==ans&&sorted(n)===sorted(ans)});out=g?'Las letras de «'+g+'» se reordenan en '+ans+'.':'No encuentro un grupo de palabras con exactamente las letras de la respuesta.';cls=g?'note ok':'note warn'}
  else if(m==='bifronte'){var g2=grp(function(x){return norm(x.join('')).split('').reverse().join('')===ans});out=g2?'«'+g2+'» leído al revés da '+ans+'.':'No encuentro nada que al revés dé la respuesta.';cls=g2?'note ok':'note warn'}
  else if(m==='iniciales'){var g3=grp(function(x){return x.map(function(y){return norm(y).charAt(0)}).join('')===ans});out=g3?'Las iniciales de «'+g3+'» forman '+ans+'.':'No encuentro palabras seguidas cuyas iniciales formen la respuesta.';cls=g3?'note ok':'note warn'}
  else out='Para este mecanismo no puedo verificarlo solo, así que revisalo vos letra por letra.';
  if(!lenOk)out+=' Ojo: el número entre paréntesis ('+mm[1]+') no coincide con las '+ans.length+' letras de la respuesta.';
  el.className=cls;el.textContent=out}
function sendClue(){var S=MC.S,text=$('#s-text').value.trim(),ans=$('#s-ans').value.trim(),m=$('#s-mech').value,ex=$('#s-exp').value.trim();
  var say=function(t,ok){S.smsg=t;S.scls=ok?'ok':'bad';var e=$('#s-msg');if(e){e.textContent=t;e.className='msg '+S.scls}};
  if(text.length<8||norm(ans).length<2)return say('Completá la pista y la respuesta.');
  if(ex.length<8)return say('Contanos cómo se resuelve, así podemos verificarla.');
  var label=(MECHS.filter(function(x){return x[0]===m})[0]||[0,m])[1],item={text:text,answer:ans.toUpperCase(),mech:m,mechLabel:label,exp:ex,t:Date.now(),sent:false};
  var done=function(sent,msg){item.sent=sent;store.subs.push(item);save();S.smsg=msg;S.scls=sent?'ok':'bad';MC.render()};
  if(MC.base.lista()){MC.base.enviarPista(item)
    .then(function(){done(true,'Pista enviada. Gracias.')}).catch(function(e){done(false,'No pude enviarla: '+MC.base.motivo(e)+' Quedó guardada en este navegador.')})}
  else done(false,'La base compartida no está conectada, así que la pista quedó guardada en este navegador.')}

MC.vSend=vSend;
MC.checkSend=checkSend;
MC.sendClue=sendClue;
})(window.MC);
