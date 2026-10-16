(function(MC){
'use strict';
var today=MC.today, statusNote=MC.statusNote, rankRows=MC.rankRows;

function vRank(){
  var S=MC.S,t=today(),rows,results=MC.base.resultados(),players=MC.base.jugadores(),uid=MC.base.uid();
  if(S.lb==='hoy'){
    rows=Object.keys(results).map(function(k){return results[k]||{}}).filter(function(r){return r.n===t}).sort(function(a,b){return MC.num(a.a)-MC.num(b.a)||MC.num(a.h)-MC.num(b.h)||MC.num(a.t)-MC.num(b.t)}).map(function(r){var a=MC.num(r.a),h=MC.num(r.h);
      return {al:r.al,ph:r.ph,sub:(a===1?'Al primer intento':'En '+a+' intentos')+(h?' · '+h+(h===1?' ayuda':' ayudas'):' · sin ayudas'),me:r.u===uid}});
  } else {
    rows=Object.keys(players).map(function(k){var p=players[k]||{};return {al:p.alias,ph:p.ph,val:MC.num(p.won),best:MC.num(p.best),sub:'resueltas de '+MC.num(p.played)+' jugadas',me:k===uid}}).sort(function(a,b){return b.val-a.val||b.best-a.best});
  }
  var emp=MC.base.conectada()?'<div class="empty"><b>'+(S.lb==='hoy'?'Todavía nadie resolvió la pista de hoy':'Todavía no hay jugadores')+'</b>Resolvé la pista #'+t+' y vas a aparecer acá.</div>':'<div class="empty"><b>La clasificación llega pronto</b>Mientras tanto, seguí jugando: tus partidas ya se están guardando.</div>';
  return '<h1 class="page-title">Clasificación</h1><p class="lead">Hoy gana quien la resolvió en menos intentos y con menos ayudas. El ranking general cuenta cuántas pistas resolviste.</p>'+statusNote('clasificacion')+
   '<div class="tabs2" style="margin-top:16px" role="group" aria-label="Tipo de clasificación"><button data-act="lb" data-v="hoy" aria-pressed="'+(S.lb==='hoy')+'">Hoy #'+t+'</button><button data-act="lb" data-v="general" aria-pressed="'+(S.lb==='general')+'">General</button></div>'+rankRows(rows,emp)}

MC.vRank=vRank;
})(window.MC);
