(function(MC){
'use strict';
var esc=MC.esc, stats=MC.stats, streak=MC.streak, bestStreak=MC.bestStreak;

function vStats(){var s=stats(),max=Math.max(1,Math.max.apply(null,s.dist.concat([s.lost]))),pct=s.played?Math.round(100*s.won/s.played):0;
  var bars='';for(var i=0;i<5;i++)bars+='<div class="bar-row"><span>'+(i===4?'5 o más':(i+1)+(i?' intentos':' intento'))+'</span><div class="track"><div class="fill" style="width:'+(100*s.dist[i]/max)+'%"></div></div><b>'+s.dist[i]+'</b></div>';
  bars+='<div class="bar-row"><span>Me rendí</span><div class="track"><div class="fill lose" style="width:'+(100*s.lost/max)+'%"></div></div><b>'+s.lost+'</b></div>';
  var mk=Object.keys(s.mech).sort(function(a,b){return s.mech[b].p-s.mech[a].p}),mr=mk.length?mk.map(function(k){var m=s.mech[k];return '<div class="bar-row"><span>'+esc(k)+'</span><div class="track"><div class="fill" style="width:'+(100*m.w/m.p)+'%"></div></div><b>'+m.w+'/'+m.p+'</b></div>'}).join(''):'<div class="empty"><b>Todavía no hay partidas</b>Resolvé una pista y acá vas a ver en qué mecanismos sos mejor.</div>';
  return '<h1 class="page-title">Estadísticas</h1><p class="lead">Tu progreso se guarda en este navegador.</p><div class="tiles">'+
   '<div class="tile"><b>'+s.played+'</b><span>Jugadas</span></div><div class="tile"><b>'+pct+'%</b><span>Resueltas</span></div><div class="tile"><b>'+streak()+'</b><span>Racha actual</span></div><div class="tile"><b>'+bestStreak()+'</b><span>Mejor racha</span></div><div class="tile"><b>'+s.hints+'</b><span>Ayudas usadas</span></div></div>'+
   '<div class="two"><div class="panel"><h2 style="font-size:20px;margin-bottom:14px">Cuántos intentos te llevó</h2><div class="bars">'+bars+'</div></div><div class="panel"><h2 style="font-size:20px;margin-bottom:14px">Aciertos por mecanismo</h2><div class="bars">'+mr+'</div></div></div>'}

MC.vStats=vStats;
})(window.MC);
