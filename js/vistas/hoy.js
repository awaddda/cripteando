(function(MC){
'use strict';
var esc=MC.esc, norm=MC.norm, today=MC.today, clueOf=MC.clueOf, fmtLong=MC.fmtLong, countdown=MC.countdown, hasRole=MC.hasRole, letterOrder=MC.letterOrder, prog=MC.prog, hintsOf=MC.hintsOf, streak=MC.streak;

function cellsHtml(c,p,typed,done,win,pop,typedIn){
  var len=norm(c.a).length,ans=norm(c.a),rev=MC.revealedOf(c,p),free=MC.freeOf(c,p),h='',k=0;
  var curPos=done?-1:free[Math.min(typed.length,free.length-1)];
  for(var i=0;i<len;i++){var ch='',cls='cell';
    if(done)ch=ans[i];
    else if(rev.indexOf(i)>-1){ch=ans[i];cls+=' fixed'+(i===pop?' pop':'')}
    else{ch=typed[k]||'';if(ch)cls+=' full'+(k===typedIn?' in':'');k++}
    if(i===curPos)cls+=' cur';
    h+='<div class="'+cls+'" style="--i:'+i+'">'+esc(ch)+'</div>'}
  return h}
var LBL=MC.RL;
var THUMB='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0 4-7a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 17.1 21H7"/></svg>';
function vMissing(n){var S=MC.S,t=n===today();
  if(S.pz!=='error'&&S.pz!=='listo')return MC.loader();
  var msg=S.pz==='error'?['No pude cargar la pista','Revisá tu conexión y recargá la página.']:(S.pz==='listo'?[t?'La pista de hoy todavía no está lista':'Esta pista no existe','Volvé en un rato.']:['Cargando la pista…','']);
  return '<div class="empty" role="status"><b>'+msg[0]+'</b>'+msg[1]+'</div>'+(t?'':'<p style="text-align:center;margin-top:16px"><button class="link" data-act="go" data-v="hoy" data-n="today">Ir a la pista de hoy</button></p>')}
function vHoy(){var S=MC.S;
  if(!clueOf(S.cur))return vMissing(S.cur);
  var n=S.cur,c=clueOf(n),p=prog(n),len=norm(c.a).length,done=!!p.done,win=p.done==='w';

  var fresh=S.fresh||'';S.fresh='';
  var roles={def:p.hd||done,ind:p.hi||done,mat:p.hm||done};
  var clueOf2=function(anim){return c.t.map(function(x){return x[1]&&roles[x[1]]?'<mark class="seg m-'+x[1]+(anim&&(fresh===x[1]||fresh==='end')?' fresh':'')+'" title="'+LBL[x[1]]+'">'+esc(x[0])+'<span class="sr"> ('+LBL[x[1]].toLowerCase()+')</span></mark>':esc(x[0])}).join(' ')+' <span class="len">('+len+')</span>'};
  var pop=fresh==='let'?letterOrder(len)[p.hl-1]:-1;
  var at=p.g.length+1;
  var tried=p.g.length?'<div class="tried" aria-label="Intentos anteriores">'+p.g.map(function(g){return '<span>'+esc(g)+'</span>'}).join('')+'</div>':'';

  var hb=function(k,lbl,applies,used){var dis=done||!applies||used||(k==='let'&&p.hl>=len-1);
    return '<button class="hint h-'+k+(used?' used':'')+'" data-act="hint" data-k="'+k+'"'+(dis?' disabled':'')+'><span class="dot" aria-hidden="true"></span>'+lbl+(used?'<small>usada</small>':(applies?'':'<small>no aplica</small>'))+'</button>'};
  var isToday=n===today();
  var top='<header class="hero"><h1>'+(isToday?'Pista críptica de hoy':'Pista críptica #'+n)+'</h1>'+(isToday?'':'<button class="link" data-act="go" data-v="hoy" data-n="today">Ir a la de hoy</button>')+'</header>';
  var html=top+'<article class="sheet"><p class="clue" id="clue">'+clueOf2(true)+'</p>'+MC.firma(c)+'</article>';
  html+='<div class="cells'+(done?(win?' good':' lost'):'')+(fresh==='end'?' flip':'')+'" id="cells" role="group" aria-label="Respuesta de '+len+' letras">'+cellsHtml(c,p,S.typed,done,win,pop)+
    (done?'':'<input id="guess" class="guess-input" type="text" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="'+(len+4)+'" aria-label="Escribí tu respuesta de '+len+' letras">')+'</div>';
  html+=tried;
  if(!done){
    html+='<div class="msg '+S.msgCls+'" id="msg" role="status" aria-live="polite">'+esc(S.msg)+'</div>';
    html+='<div class="actions">'+(S.confirm==='give'?'<span class="give-q">¿Ver la respuesta? La pista queda como no resuelta.</span><button class="btn danger" data-act="give-yes">Sí, me rindo</button><button class="btn" data-act="noleave">Seguir jugando</button>':
      '<button class="btn pri" data-act="check">Comprobar</button><button class="btn ghost-btn" data-act="give">Me rindo</button>')+'</div>';
    html+='<h2 class="hints-title">Ayudas</h2><div class="hints">'+hb('def','Definición',hasRole(c,'def'),p.hd)+hb('ind','Indicador',hasRole(c,'ind'),p.hi)+hb('mat','Relleno',hasRole(c,'mat'),p.hm)+hb('let','Una letra',true,false)+'</div>';
    html+='<p class="hint-note">Usar ayudas está permitido, y buscar sinónimos en un diccionario también vale.'+(p.hi&&c.ik?' <b>Indicador:</b> pide '+esc(c.ik)+'.':'')+'</p>';
  } else {
    var h=hintsOf(p),vote=MC.store.votes[n]||'';
    html+='<section class="result'+(fresh==='end'?' fresh" style="--d:'+(len*110+500)+'ms':'')+'" aria-live="polite"><h2>'+(win?(at===1?'¡Resuelta al primer intento!':'¡Resuelta en '+at+' intentos!'):'Esta vez no salió')+'</h2>'+
      '<div class="kv"><span>Mecanismo <b>'+esc(c.m)+'</b></span><span>Intentos <b>'+(win?at:p.g.length)+'</b></span><span>Ayudas <b>'+h+'</b></span></div>'+
      '<div class="row-wrap"><button class="btn pri" data-act="shareimg">Compartir</button><button class="btn" data-act="go" data-v="archivo">Ver el archivo</button></div>'+
      '<p class="msg ok" id="smsg" role="status"></p>'+

      '<div class="vote" role="group" aria-label="¿Te gustó la pista?"><span>¿Te gustó la pista?</span>'+
        '<button class="vbtn up" data-act="vote" data-v="up" aria-pressed="'+(vote==='up')+'">'+THUMB+'Me gustó</button>'+
        '<button class="vbtn down" data-act="vote" data-v="down" aria-pressed="'+(vote==='down')+'">'+THUMB+'No me gustó</button></div>'+
      (vote?'<p class="vote-ok">'+(vote==='up'?'¡Gracias! Nos alegra que te haya gustado.':'Gracias por avisar: nos sirve para escribir mejores pistas.')+'</p>':'')+

      '<div class="bkwrap"><button class="link" data-act="bk" aria-expanded="'+S.bk+'">'+(S.bk?'Ocultar desglose escrito':'Ver desglose escrito')+'</button>'+
      (S.bk?MC.chips(c.t,roles)+'<p class="clue clue-sm">'+clueOf2(false)+'</p>'+MC.desglose(c.t,c.ik,c.ex)+MC.ansBox(c.a):'')+'</div></section>';
  }
  html+='<div class="meta"><span class="chip">Pista #'+n+'</span><span class="chip">'+MC.mateIco(streak()?'w':'n')+'Racha <b>'+streak()+'</b></span><span class="chip">'+fmtLong(n)+'</span></div>';
  html+='<p class="next">Nueva pista en <span class="cd" id="cd">'+countdown()+'</span> (00:00 hora de Argentina)</p>';
  return html}

MC.cellsHtml=cellsHtml;
MC.vHoy=vHoy;
})(window.MC);
