(function(MC){
'use strict';
var esc=MC.esc, today=MC.today, clueOf=MC.clueOf, store=MC.store, hintsOf=MC.hintsOf;

function vArchivo(){
  if(MC.S.arch)return '<button class="link volver" data-act="go" data-v="archivo"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>Volver al archivo</button>'+MC.vHoy();
  var t=today(),rows='';
  for(var n=t;n>=1;n--){var c=clueOf(n),h=store.hist[n],p=store.prog[n],st,cls;
    if(h&&h.r==='w'){st='Resuelta';cls='w'}else if(h){st='No resuelta';cls='l'}else if(p&&p.g&&p.g.length+hintsOf(p)>0){st='En curso';cls='p'}else{st='Sin jugar';cls='p'}
    rows+='<li><button class="arow ar" data-act="open" data-n="'+n+'"><span class="n">#'+n+'</span><span class="d"><b>'+MC.fmtFull(n)+'</b>'+(c?'<small class="frase">'+esc(c.t.map(function(x){return x[0]}).join(' '))+'</small>':'')+'</span>'+'<span class="sts">'+(n===t?'<span class="st t">Hoy</span>':'')+'<span class="st '+cls+'">'+st+'</span></span></button></li>'}
  return '<h1 class="page-title">Archivo</h1><p class="lead">Todas las pistas publicadas hasta hoy. Podés jugar las que te perdiste: suman a tus estadísticas, pero no a la clasificación ni a la racha del día.</p><ul class="list">'+rows+'</ul>'}

MC.vArchivo=vArchivo;
})(window.MC);
