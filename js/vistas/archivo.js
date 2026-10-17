(function(MC){
'use strict';
var esc=MC.esc, today=MC.today, clueOf=MC.clueOf, fmtDate=MC.fmtDate, store=MC.store, hintsOf=MC.hintsOf;

function vArchivo(){
  var t=today(),rows='';
  for(var n=t;n>=1;n--){var c=clueOf(n),h=store.hist[n],p=store.prog[n],st,cls;
    if(h&&h.r==='w'){st='Resuelta';cls='w'}else if(h){st='No resuelta';cls='l'}else if(p&&p.g&&p.g.length+hintsOf(p)>0){st='En curso';cls='p'}else{st='Sin jugar';cls='p'}
    rows+='<li><button class="arow" data-act="open" data-n="'+n+'"><span class="n">#'+n+'</span><span class="d"><b style="text-transform:capitalize">'+fmtDate(n)+'</b>'+(h&&c?'<small>'+esc(c.m)+'</small>':'<small>Mecanismo oculto hasta resolverla</small>')+'</span>'+(n===t?'<span class="st t">Hoy</span>':'')+'<span class="st '+cls+'">'+st+'</span></button></li>'}
  return '<h1 class="page-title">Archivo</h1><p class="lead">Todas las pistas publicadas hasta hoy. Podés jugar las que te perdiste: suman a tus estadísticas, pero no a la clasificación ni a la racha del día.</p><ul class="list">'+rows+'</ul>'}

MC.vArchivo=vArchivo;
})(window.MC);
