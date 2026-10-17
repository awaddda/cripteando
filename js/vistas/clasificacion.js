(function(MC){
'use strict';
var today=MC.today, statusNote=MC.statusNote, rankRows=MC.rankRows, num=MC.num;
var MIN=3; // pistas resueltas para entrar en la tabla de ayudas: si no, gana quien resolvió una sola sin ayudas

// La racha guardada es la del último día que jugó: si desde entonces pasó un día entero sin resolver, ya se cortó
function liveStreak(p){var t=today();
  if(typeof p.last==='number')return p.last>=t-1?num(p.streak):0;
  return MC.dayOf(num(p.u))>=t-1?num(p.streak):0}
var avgTxt=function(x){return x.toFixed(1).replace('.',',')};

function vRank(){
  var S=MC.S,players=MC.base.jugadores(),uid=MC.base.uid(),rows,
    all=Object.keys(players).map(function(k){var p=players[k]||{},won=num(p.won);return {k:k,al:p.alias,ph:p.ph,won:won,st:liveStreak(p),best:num(p.best),avg:typeof p.hw==='number'&&won?p.hw/won:null,me:k===uid}});
  if(S.lb==='ayudas'){
    rows=all.filter(function(r){return r.avg!=null&&r.won>=MIN}).sort(function(a,b){return a.avg-b.avg||b.won-a.won}).map(function(r){
      return {al:r.al,ph:r.ph,val:avgTxt(r.avg),vt:'Ayudas por pista resuelta',sub:'De promedio, en '+r.won+(r.won===1?' pista resuelta':' pistas resueltas'),me:r.me}});
  } else {
    rows=all.filter(function(r){return r.won>0}).sort(function(a,b){return b.st-a.st||b.best-a.best||(a.avg==null?99:a.avg)-(b.avg==null?99:b.avg)}).map(function(r){
      return {al:r.al,ph:r.ph,val:r.st,vt:'Racha actual',sub:'Mejor racha: '+r.best+' · '+r.won+(r.won===1?' resuelta':' resueltas'),me:r.me}});
  }
  var emp=MC.base.conectada()?'<div class="empty"><b>'+(S.lb==='ayudas'?'Todavía nadie resolvió '+MIN+' pistas':'Todavía no hay jugadores')+'</b>'+(S.lb==='ayudas'?'Para entrar acá hay que resolver al menos '+MIN+' pistas.':'Resolvé la pista de hoy y vas a aparecer acá.')+'</div>':'<div class="empty"><b>La clasificación llega pronto</b>Mientras tanto, seguí jugando: tus partidas ya se están guardando.</div>';
  var lead=S.lb==='ayudas'?'Quién resuelve con menos ayudas, en promedio. Se necesitan al menos '+MIN+' pistas resueltas para entrar.':'Días seguidos resolviendo la pista del día, el mismo día que sale. Las pistas que hacés desde el archivo no suman a la racha.';
  return '<h1 class="page-title">Clasificación</h1>'+statusNote('clasificacion')+
   '<div class="tabs2" style="margin-top:16px" role="group" aria-label="Tipo de clasificación"><button data-act="lb" data-v="racha" aria-pressed="'+(S.lb!=='ayudas')+'">Rachas</button><button data-act="lb" data-v="ayudas" aria-pressed="'+(S.lb==='ayudas')+'">Menos ayudas</button></div>'+
   '<p class="lead" style="margin:14px 0 16px">'+lead+'</p>'+rankRows(rows,emp)}

MC.vRank=vRank;
})(window.MC);
