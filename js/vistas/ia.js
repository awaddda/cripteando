(function(MC){
'use strict';
// Modo experimental: pistas generadas por IA, por dificultad. Se juegan aparte: no tocan la racha, las estadísticas ni la clasificación.
var $=MC.$, esc=MC.esc, norm=MC.norm, hasRole=MC.hasRole;
var KEY='mc_ia', DIFS=[['facil','Fácil'],['media','Media'],['dificil','Difícil']];
var st={estado:'',lista:[],dif:'facil',cur:null,typed:'',msg:'',cls:'',fresh:'',bk:false,confirm:false};

function progs(){try{var o=JSON.parse(localStorage.getItem(KEY)||'{}');return o&&typeof o==='object'?o:{}}catch(e){return {}}}
function guardar(o){try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}}
function progDe(n){var o=progs(),p=o[n];if(!p||!Array.isArray(p.g))p={g:[],hd:0,hi:0,hm:0,hl:0,done:null};return p}
function setProg(n,p){var o=progs();o[n]=p;guardar(o)}
function pistaDe(n){for(var i=0;i<st.lista.length;i++)if(st.lista[i].n===n)return st.lista[i];return null}
function deDif(d){return st.lista.filter(function(x){return x.dif===d})}
function pendientes(d){return deDif(d).filter(function(x){return !progDe(x.n).done})}
function elegir(){var p=pendientes(st.dif),en=st.cur&&pistaDe(st.cur);
  if(en&&en.dif===st.dif&&!progDe(en.n).done)return;
  st.cur=p.length?p[Math.floor(Math.random()*p.length)].n:null;st.typed='';st.msg='';st.confirm=false;st.bk=false}

function cargar(){if(st.estado==='cargando'||st.estado==='listo')return;st.estado='cargando';
  MC.base.pistasIA().then(function(l){st.lista=l;st.estado='listo';elegir()},function(){st.estado='error'}).then(function(){if(MC.S.view==='ia')MC.render()})}

function vIA(){var h='<h1 class="page-title">Pistas de IA <span class="tag">Experimental</span></h1>'+
  '<p class="lead">Pistas hechas por inteligencia artificial y verificadas automáticamente. Se juegan aparte: <b>no cuentan para tu racha, tus estadísticas ni la clasificación</b>.</p>';
  if(st.estado!=='listo'){cargar();return h+(st.estado==='error'?'<div class="empty"><b>No pude traer las pistas de IA</b>Revisá tu conexión y recargá la página.</div>':MC.loader())}
  h+='<div class="tabs2" role="group" aria-label="Dificultad">'+DIFS.map(function(d){var tot=deDif(d[0]).length,hech=tot-pendientes(d[0]).length;
    return '<button data-act="ia-dif" data-v="'+d[0]+'" aria-pressed="'+(st.dif===d[0])+'">'+d[1]+' <small class="muted">'+hech+'/'+tot+'</small></button>'}).join('')+'</div>';
  var c=st.cur&&pistaDe(st.cur);
  if(!c)return h+'<div class="empty" style="margin-top:18px"><b>'+(deDif(st.dif).length?'Ya jugaste todas las de esta dificultad':'Todavía no hay pistas de esta dificultad')+'</b>Cada día se liberan pistas nuevas. Mientras tanto, probá otra dificultad.</div>';
  return h+'<div style="margin-top:18px">'+juego(c)+'</div>'}

function juego(c){var p=progDe(c.n),len=norm(c.a).length,done=!!p.done,win=p.done==='w',fresh=st.fresh;st.fresh='';
  var roles={def:p.hd||done,ind:p.hi||done,mat:p.hm||done},RL=MC.RL;
  var clue=function(anim){return c.t.map(function(x){return x[1]&&roles[x[1]]?'<mark class="seg m-'+x[1]+(anim&&(fresh===x[1]||fresh==='end')?' fresh':'')+'" title="'+RL[x[1]]+'">'+esc(x[0])+'<span class="sr"> ('+RL[x[1]].toLowerCase()+')</span></mark>':esc(x[0])}).join(' ')+' <span class="len">('+len+')</span>'};
  var html='<article class="sheet"><p class="clue">'+clue(true)+'</p><p class="firma">Pista generada por <b>IA</b></p></article>';
  html+='<div class="cells'+(done?(win?' good':' lost'):'')+(fresh==='end'?' flip':'')+'" id="icells" role="group" aria-label="Respuesta de '+len+' letras">'+MC.cellsHtml(c,p,st.typed,done,win,-1)+
    (done?'':'<input id="iguess" class="guess-input" type="text" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="'+(len+4)+'" aria-label="Escribí tu respuesta de '+len+' letras">')+'</div>';
  if(p.g.length)html+='<div class="tried" aria-label="Intentos anteriores">'+p.g.map(function(g){return '<span>'+esc(g)+'</span>'}).join('')+'</div>';
  if(!done){
    var hb=function(k,lbl,applies,used){var dis=!applies||used||(k==='let'&&p.hl>=len-1);
      return '<button class="hint h-'+k+(used?' used':'')+'" data-act="ia-hint" data-k="'+k+'"'+(dis?' disabled':'')+'><span class="dot" aria-hidden="true"></span>'+lbl+(used?'<small>usada</small>':(applies?'':'<small>no aplica</small>'))+'</button>'};
    html+='<div class="msg '+st.cls+'" id="imsg" role="status" aria-live="polite">'+esc(st.msg)+'</div>';
    html+='<div class="actions">'+(st.confirm?'<span class="give-q">¿Ver la respuesta?</span><button class="btn danger" data-act="ia-give-yes">Sí, me rindo</button><button class="btn" data-act="ia-give-no">Seguir jugando</button>':
      '<button class="btn pri" data-act="ia-check">Comprobar</button><button class="btn ghost-btn" data-act="ia-give">Me rindo</button>')+'</div>';
    html+='<h2 class="hints-title">Ayudas</h2><div class="hints">'+hb('def','Definición',hasRole(c,'def'),p.hd)+hb('ind','Indicador',hasRole(c,'ind'),p.hi)+hb('mat','Relleno',hasRole(c,'mat'),p.hm)+hb('let','Una letra',true,false)+'</div>';
    html+=(p.hi&&c.ik?'<p class="hint-note"><b>Indicador:</b> pide '+esc(c.ik)+'.</p>':'');
  }else{
    var h=MC.hintsOf(p),at=p.g.length+(win?1:0);
    html+='<section class="result'+(fresh==='end'?' fresh" style="--d:'+(len*110+500)+'ms':'')+'"><h2>'+(win?(at===1?'¡Al primer intento!':'¡Resuelta en '+at+' intentos!'):'Esta vez no salió')+'</h2>'+
      '<div class="kv"><span>Mecanismo <b>'+esc(c.m)+'</b></span><span>Ayudas <b>'+h+'</b></span></div>'+
      '<div class="row-wrap"><button class="btn pri" data-act="ia-otra">Otra pista</button></div>'+
      '<div class="bkwrap"><button class="link" data-act="ia-bk" aria-expanded="'+st.bk+'">'+(st.bk?'Ocultar desglose escrito':'Ver desglose escrito')+'</button>'+
      (st.bk?MC.chips(c.t,roles)+'<p class="clue clue-sm">'+clue(false)+'</p>'+MC.desglose(c.t,c.ik,c.ex)+MC.ansBox(c.a):'')+'</div></section>';
  }
  return html}

function pintar(){var c=st.cur&&pistaDe(st.cur),el=$('#icells');if(!el||!c)return;var inp=$('#iguess'),p=progDe(c.n);
  Array.prototype.slice.call(el.children).forEach(function(ch){if(ch!==inp)el.removeChild(ch)});el.insertAdjacentHTML('afterbegin',MC.cellsHtml(c,p,st.typed,false,false,-1))}
function msg(t,cls){st.msg=t;st.cls=cls||'';var m=$('#imsg');if(m){m.textContent=t;m.className='msg '+(cls||'')}}
function render(){MC.render();var i=$('#iguess');if(i){i.value=st.typed;if(window.matchMedia&&matchMedia('(pointer:fine)').matches)i.focus()}}

function comprobar(){var c=pistaDe(st.cur);if(!c)return;var p=progDe(c.n),ans=norm(c.a),g=MC.merge(c,p,norm(st.typed));
  if(norm(st.typed).length!==MC.freeOf(c,p).length)return msg('Faltan letras: la respuesta tiene '+ans.length+'.','bad');
  if(p.g.indexOf(g)>-1)return msg('Esa ya la probaste.','bad');
  if(g===ans){p.done='w';setProg(c.n,p);st.typed='';st.msg='';st.fresh='end';return render()}
  p.g.push(g);setProg(c.n,p);st.typed='';st.msg='No es esa. Probá de nuevo.';st.cls='bad';render();var el=$('#icells');if(el)el.classList.add('shake')}
function ayuda(k){var c=pistaDe(st.cur);if(!c)return;var p=progDe(c.n);if(p.done)return;
  if(k==='def'&&!p.hd&&hasRole(c,'def'))p.hd=1;else if(k==='ind'&&!p.hi&&hasRole(c,'ind'))p.hi=1;else if(k==='mat'&&!p.hm&&hasRole(c,'mat'))p.hm=1;
  else if(k==='let'&&p.hl<norm(c.a).length-1){p.hl++;st.typed=st.typed.slice(0,MC.freeOf(c,p).length)}else return;
  setProg(c.n,p);st.fresh=k;st.msg='';render()}

document.addEventListener('click',function(e){var t=e.target.closest('[data-act^="ia-"]');if(!t)return;var a=t.dataset.act;
  if(a==='ia-dif'){st.dif=t.dataset.v;elegir();render()}
  else if(a==='ia-check')comprobar();
  else if(a==='ia-hint')ayuda(t.dataset.k);
  else if(a==='ia-give'){st.confirm=true;render()}
  else if(a==='ia-give-no'){st.confirm=false;render()}
  else if(a==='ia-give-yes'){var c=pistaDe(st.cur);if(!c)return;var p=progDe(c.n);p.done='l';setProg(c.n,p);st.confirm=false;st.fresh='end';render()}
  else if(a==='ia-otra'){st.cur=null;elegir();render();window.scrollTo(0,0)}
  else if(a==='ia-bk'){st.bk=!st.bk;render()}});
document.addEventListener('input',function(e){if(e.target.id!=='iguess')return;var c=pistaDe(st.cur);if(!c)return;var p=progDe(c.n),len=MC.freeOf(c,p).length,v=norm(e.target.value);
  st.typed=v.slice(0,len);if(e.target.value!==st.typed)e.target.value=st.typed;pintar();if(st.msg)msg('')});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='iguess'){e.preventDefault();comprobar()}});
document.addEventListener('animationend',function(e){if(e.target.id==='icells')e.target.classList.remove('shake')});

MC.vIA=vIA;
})(window.MC);
