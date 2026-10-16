(function(MC){
'use strict';
var $=MC.$, esc=MC.esc, norm=MC.norm, store=MC.store, save=MC.save, MECHS=MC.MECHS;
var RL={def:'Definición',mat:'Relleno',ind:'Indicador'};
var HELP={def:['s-hd','hd','Qué significa la definición. Por ejemplo: «Para tomar con bombilla» describe un MATE.'],ind:['s-hi','hi','Qué pide el indicador. Por ejemplo: «confuso» pide un anagrama.'],mat:['s-hm','hm','Qué hay que hacer con el relleno. Por ejemplo: las letras de TEMA se reordenan.']};

function draft(){var d=store.draft;if(!d||typeof d!=='object'||Array.isArray(d))d=store.draft={};
  if(!Array.isArray(d.mechs))d.mechs=[];if(!Array.isArray(d.roles))d.roles=[];if(!Array.isArray(d.extra))d.extra=[];return d}
function wordsOf(t){return String(t||'').replace(/\(\s*\d+(\s*,\s*\d+)*\s*\)\s*$/,'').split(/\s+/).filter(Boolean)}
function syncRoles(d){var w=wordsOf(d.text),old=d.roles,out=[];
  for(var i=0;i<w.length;i++)out.push({w:w[i],r:old[i]&&old[i].w===w[i]?old[i].r:''});d.roles=out;return out}
function segments(d){var t=[];syncRoles(d).forEach(function(x){var last=t[t.length-1];if(last&&last[1]===x.r)last[0]+=' '+x.w;else t.push([x.w,x.r])});return t}
function marked(d){var o={};d.roles.forEach(function(x){if(x.r)o[x.r]=true});return o}

function tokensHtml(d){var w=syncRoles(d);
  if(!w.length)return '<p class="muted">Cuando escribas el enunciado, sus palabras aparecen acá.</p>';
  return '<div class="toks">'+w.map(function(x,i){return '<button type="button" class="tok'+(x.r?' r-'+x.r:'')+'" data-act="sword" data-i="'+i+'" aria-pressed="'+!!x.r+'"'+(x.r?' title="'+RL[x.r]+'"':'')+'>'+esc(x.w)+'</button>'}).join('')+'</div>'}
function helpsHtml(d){var m=marked(d),h='';
  ['def','ind','mat'].forEach(function(r){if(!m[r])return;var x=HELP[r];
    h+='<div class="field"><label for="'+x[0]+'"><span class="rchip r-'+r+'">'+RL[r]+'</span></label><textarea id="'+x[0]+'" rows="2" maxlength="300" placeholder="'+esc(x[2])+'">'+esc(d[x[1]]||'')+'</textarea></div>'});
  if(!h)h='<p class="muted">Marcá al menos la definición en el editor de segmentos y acá aparece su ayuda.</p>';
  d.extra.forEach(function(v,i){h+='<div class="field"><label for="s-x'+i+'">Ayuda extra '+(i+1)+'</label><div class="xrow"><textarea id="s-x'+i+'" rows="2" maxlength="300">'+esc(v)+'</textarea><button type="button" class="btn sm" data-act="sxdel" data-i="'+i+'" aria-label="Quitar la ayuda extra '+(i+1)+'">Quitar</button></div></div>'});
  return h}

function readForm(){var d=draft(),v=function(id){var e=$('#'+id);return e?e.value:null},x;
  if((x=v('s-text'))!==null)d.text=x;if((x=v('s-ans'))!==null)d.ans=x;if((x=v('s-exp'))!==null)d.exp=x;if((x=v('s-notes'))!==null)d.notes=x;
  ['def','ind','mat'].forEach(function(r){var y=v(HELP[r][0]);if(y!==null)d[HELP[r][1]]=y});
  d.extra=d.extra.map(function(e,i){var y=v('s-x'+i);return y===null?e:y});
  var nm=v('s-name');if(nm!==null)d.name=nm;
  syncRoles(d);return d}
var saveT=null;
function autosave(){clearTimeout(saveT);saveT=setTimeout(function(){readForm();draft().ts=Date.now();save();var e=$('#s-saved');if(e)e.textContent='Guardado en este dispositivo'},400)}

function preview(d){var t=segments(d),ans=norm(d.ans);
  if(!t.length||!ans)return '<div class="empty"><b>Todavía no hay nada para mostrar</b>Completá el enunciado y la respuesta para ver cómo la verían los jugadores.</div>';
  var shown={def:1,ind:1,mat:1};
  var clue=t.map(function(x){return x[1]?'<mark class="seg m-'+x[1]+'">'+esc(x[0])+'</mark>':esc(x[0])}).join(' ')+' <span class="len">('+ans.length+')</span>';
  var helps='';['def','ind','mat'].forEach(function(r){var tx=d[HELP[r][1]];if(tx&&tx.trim())helps+='<div class="bk"><span class="rchip r-'+r+'">Ayuda: '+RL[r]+'</span><p>'+esc(tx)+'</p></div>'});
  d.extra.forEach(function(e,i){if(e&&e.trim())helps+='<div class="bk"><span class="rchip r-how">Ayuda extra '+(i+1)+'</span><p>'+esc(e)+'</p></div>'});
  return '<div class="spreview"><p class="muted" style="text-align:center">Así la verían los jugadores:</p>'+MC.chips(t,shown)+'<p class="clue">'+clue+'</p>'+
    (helps?'<h3 class="lh3" style="text-align:center">Ayudas</h3><div class="bkd">'+helps+'</div>':'')+
    '<h3 class="lh3" style="text-align:center">Desglose</h3>'+MC.desglose(t,'',d.exp?esc(d.exp):'')+MC.ansBox(d.ans)+'</div>'}

function vSend(){var S=MC.S,d=draft(),u=MC.base.usuario(),tab=S.stab==='preview'?'preview':'form';syncRoles(d);
  var subs=store.subs.length?'<section class="acc-sec"><h2>Tus envíos</h2><ul class="list">'+store.subs.slice().reverse().map(function(s){return '<li class="panel" style="padding:12px 16px"><b class="mono">'+esc(s.answer)+'</b> · '+esc(s.mechLabel||'')+'<br><span class="muted">'+esc(s.text)+'</span><br><small class="muted">'+(s.sent?'Enviada: la estamos revisando':'Guardada en este dispositivo')+'</small></li>'}).join('')+'</ul></section>':'';
  var h='<h1 class="page-title">Enviar una pista</h1><p class="lead">Proponé una pista críptica para Cripteando. La revisamos letra por letra antes de aceptarla y, si queda, pasa a la lista de próximas pistas del día. Puede tardar un tiempo en salir, aunque la aprobemos rápido.</p>'+
    '<p style="margin:-10px 0 20px"><button class="link" data-act="lguia-go">Cómo escribirla bien</button></p>'+MC.statusNote('enviar')+
    '<div class="tabs2 wide" role="group" aria-label="Vista"><button data-act="stab" data-v="form" aria-pressed="'+(tab==='form')+'">Formulario</button><button data-act="stab" data-v="preview" aria-pressed="'+(tab==='preview')+'">Vista previa</button></div>';
  if(tab==='preview')return h+preview(d)+subs;
  h+='<form class="send" id="f-send" novalidate>';
  h+='<section class="acc-sec"><div class="sec-top"><h2>La pista</h2><small class="muted" id="s-saved">'+(d.ts?'Guardado en este dispositivo':'')+'</small></div>'+
    '<div class="field"><label for="s-text">Enunciado</label><textarea id="s-text" class="serif" rows="3" maxlength="240" placeholder="Tema confuso para tomar con bombilla (4)">'+esc(d.text||'')+'</textarea><small>Escribila como la verían los jugadores. El número de letras entre paréntesis es opcional: lo agregamos solos.</small></div>'+
    '<div class="field"><label for="s-ans">Respuesta</label><input id="s-ans" maxlength="30" autocomplete="off" placeholder="MATE" value="'+esc(d.ans||'')+'" style="text-transform:uppercase;font-family:var(--font-mono);letter-spacing:.1em"></div>'+
    '<div class="field"><label>Tipos de juego</label><div class="gpick" role="group" aria-label="Tipos de juego">'+MECHS.map(function(m){return '<button type="button" data-act="smech" data-v="'+m[0]+'" aria-pressed="'+(d.mechs.indexOf(m[0])>-1)+'">'+m[1]+'</button>'}).join('')+'</div><small>Elegí todos los que use la pista.</small></div></section>';
  h+='<section class="acc-sec"><h2>Anatomía</h2>'+
    '<div class="field"><label for="s-exp">Explicación del desglose</label><textarea id="s-exp" rows="3" maxlength="400" placeholder="Cómo se arma la respuesta. Por ejemplo: las letras de TEMA, «confuso», se reordenan en MATE.">'+esc(d.exp||'')+'</textarea></div>'+
    '<div class="field"><label>Editor de segmentos</label><small>Elegí un rol y tocá las palabras del enunciado. Marcar la definición es obligatorio.</small>'+
    '<div class="roles" role="group" aria-label="Rol a marcar">'+[['def','Definición'],['mat','Relleno'],['ind','Indicador'],['','Borrar']].map(function(r){var on=(S.srole===undefined?'def':S.srole)===r[0];return '<button type="button" class="rchip'+(r[0]?' r-'+r[0]:' r-how')+(on?' on':'')+'" data-act="srole" data-v="'+r[0]+'" aria-pressed="'+on+'">'+r[1]+'</button>'}).join('')+'</div>'+
    '<div id="s-tokens">'+tokensHtml(d)+'</div></div>'+
    '<div id="s-check" class="note" aria-live="polite"></div></section>';
  h+='<section class="acc-sec"><h2>Ayudas</h2><p class="muted">Escribí una ayuda por cada rol que marcaste. Son las que ve el jugador cuando las pide.</p><div id="s-helps" class="stack">'+helpsHtml(d)+'</div>'+
    (d.extra.length<3?'<div class="sec-top"><span>Ayudas extra (opcional)</span><button type="button" class="btn sm" data-act="sextra">Agregar</button></div>':'')+'</section>';
  h+='<section class="acc-sec"><h2>Tu perfil de autor</h2>'+(u&&u.email?'<p>Enviando como <b>'+esc(u.email)+'</b></p>':'')+
    '<div class="field"><label for="s-name">Tu nombre</label><input id="s-name" maxlength="24" autocomplete="off" value="'+esc(d.name!=null?d.name:store.alias)+'"></div>'+
    '<label class="tgl" for="s-pub"><span>Quiero mostrar mi nombre en la pista</span><input type="checkbox" id="s-pub" data-act="showname"'+(store.showName?' checked':'')+'><span class="tgl-ui" aria-hidden="true"></span></label>'+
    '<small class="muted">También podés cambiarlo en Cuenta. Si no lo marcás, la pista se publica sin nombre.</small></section>';
  h+='<section class="acc-sec"><div class="field"><label for="s-notes">Notas para quien la revisa (opcional)</label><textarea id="s-notes" rows="2" maxlength="400" placeholder="Contexto, dudas, de dónde salió…">'+esc(d.notes||'')+'</textarea></div>'+
    '<div class="row-wrap"><button class="btn pri" type="submit">Enviar pista</button></div><p class="msg '+(S.scls||'')+'" id="s-msg" role="status" aria-live="polite" style="text-align:left">'+esc(S.smsg||'')+'</p></section></form>';
  return h+subs}

function checkSend(){var el=$('#s-check');if(!el)return;var d=readForm(),text=d.text||'',ans=norm(d.ans),w=wordsOf(text),lines=[],cls='note';
  if(!text.trim()||!ans){el.className='note';el.textContent='Cuando completes el enunciado y la respuesta, verifico lo que se pueda de forma automática.';return}
  var mm=text.match(/\((\d+)\)\s*$/);
  var grp=function(f){for(var i=0;i<w.length;i++)for(var j=i+1;j<=Math.min(w.length,i+5);j++){if(f(w.slice(i,j)))return w.slice(i,j).join(' ')}return null};
  var sorted=function(s){return s.split('').sort().join('')},bad=false,any=false;
  d.mechs.forEach(function(m){var g;
    if(m==='oculta'){any=true;g=norm(text.replace(/\(.*$/,'')).indexOf(ans)>-1;lines.push(g?'La respuesta aparece escondida en la frase.':'No encuentro la respuesta escondida de corrido en la frase.');bad=bad||!g}
    else if(m==='anagrama'){any=true;g=grp(function(x){var n=norm(x.join(''));return n.length===ans.length&&n!==ans&&sorted(n)===sorted(ans)});lines.push(g?'Las letras de «'+g+'» se reordenan en '+ans+'.':'No encuentro un grupo de palabras con exactamente las letras de la respuesta.');bad=bad||!g}
    else if(m==='bifronte'){any=true;g=grp(function(x){return norm(x.join('')).split('').reverse().join('')===ans});lines.push(g?'«'+g+'» leído al revés da '+ans+'.':'No encuentro nada que al revés dé la respuesta.');bad=bad||!g}
    else if(m==='iniciales'){any=true;g=grp(function(x){return x.map(function(y){return norm(y).charAt(0)}).join('')===ans});lines.push(g?'Las iniciales de «'+g+'» forman '+ans+'.':'No encuentro palabras seguidas cuyas iniciales formen la respuesta.');bad=bad||!g}});
  if(!d.mechs.length)lines.push('Elegí al menos un tipo de juego.');
  else if(!any)lines.push('Para estos tipos de juego no puedo verificarlo solo, así que revisala vos letra por letra.');
  if(mm&&+mm[1]!==ans.length){lines.push('Ojo: el número entre paréntesis ('+mm[1]+') no coincide con las '+ans.length+' letras de la respuesta.');bad=true}
  if(!marked(d).def)lines.push('Falta marcar la definición en el editor de segmentos.');
  el.className=any?(bad?'note warn':'note ok'):'note';el.textContent=lines.join(' ')}
function paintParts(){var d=readForm(),t=$('#s-tokens');if(t)t.innerHTML=tokensHtml(d)}

function sendClue(){var S=MC.S,d=readForm(),m=marked(d),ans=(d.ans||'').trim();
  var say=function(t,ok){S.smsg=t;S.scls=ok?'ok':'bad';var e=$('#s-msg');if(e){e.textContent=t;e.className='msg '+S.scls}};
  if((d.text||'').trim().length<8||norm(ans).length<2)return say('Completá el enunciado y la respuesta.');
  if(!d.mechs.length)return say('Elegí al menos un tipo de juego.');
  if(!m.def)return say('Marcá la definición en el editor de segmentos.');
  if((d.exp||'').trim().length<8)return say('Contanos cómo se arma la respuesta en la explicación del desglose.');
  var miss=['def','ind','mat'].filter(function(r){return m[r]&&!(d[HELP[r][1]]||'').trim()});
  if(miss.length)return say('Falta la ayuda de '+miss.map(function(r){return RL[r].toLowerCase()}).join(' y ')+'.');
  var nm=(d.name||'').trim().slice(0,24);if(nm&&nm!==store.alias)store.alias=nm;
  var labels=d.mechs.map(function(k){return (MECHS.filter(function(x){return x[0]===k})[0]||[0,k])[1]});
  var item={text:d.text.trim(),answer:ans.toUpperCase(),mechs:d.mechs.slice(),mechLabel:labels.join(', '),seg:segments(d),exp:d.exp.trim(),hd:(d.hd||'').trim(),hi:(d.hi||'').trim(),hm:(d.hm||'').trim(),
    extra:d.extra.map(function(e){return String(e||'').trim()}).filter(Boolean),notes:(d.notes||'').trim(),pub:!!store.showName,t:Date.now(),sent:false};
  if(JSON.stringify(item.extra).length>1200)return say('Las ayudas extra son muy largas: acortalas un poco.');
  var done=function(sent,msg,ok){item.sent=sent;store.subs.push({text:item.text,answer:item.answer,mechLabel:item.mechLabel,t:item.t,sent:sent});
    if(sent||ok){store.draft={}}save();S.smsg=msg;S.scls=(sent||ok)?'ok':'bad';MC.render()};
  if(MC.base.lista()){MC.base.enviarPista(item)
    .then(function(){done(true,'Pista enviada. Gracias: la vamos a revisar.')}).catch(function(e){done(false,'No pude enviarla: '+MC.base.motivo(e)+' Quedó guardada como borrador.')})}
  else done(false,MC.base.conectada()?'Guardamos tu pista. Iniciá sesión en Cuenta para mandárnosla.':'¡Gracias! Guardamos tu pista.',true)}

function clickSend(a,t){var S=MC.S,d=readForm();
  if(a==='stab'){S.stab=t.dataset.v;save()}
  else if(a==='smech'){var k=t.dataset.v,i=d.mechs.indexOf(k);if(i>-1)d.mechs.splice(i,1);else d.mechs.push(k);save()}
  else if(a==='srole'){S.srole=t.dataset.v;MC.render();return}
  else if(a==='sword'){var r=S.srole===undefined?'def':S.srole,x=d.roles[+t.dataset.i];if(x)x.r=x.r===r?'':r;save()}
  else if(a==='sextra'){if(d.extra.length<3)d.extra.push('');save()}
  else if(a==='sxdel'){d.extra.splice(+t.dataset.i,1);save()}
  var y=window.scrollY;MC.render();window.scrollTo(0,y)}

MC.vSend=vSend;
MC.checkSend=checkSend;
MC.sendClue=sendClue;
MC.sendAutosave=autosave;
MC.sendParts=paintParts;
MC.clickSend=clickSend;
})(window.MC);
