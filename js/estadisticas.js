(function(MC){
'use strict';
var store=MC.store, today=MC.today, clueOf=MC.clueOf;

// Para la racha, la pista del día n solo cuenta si se resolvió ese mismo día (d es el día en que se resolvió).
// Las partidas guardadas antes de que existiera d no tienen forma de saberlo, así que cuentan.
function onTime(n){var h=store.hist[n];return !!(h&&h.r==='w'&&(h.d==null||h.d===n))}
function streakEnd(){var n=today();return onTime(n)?n:n-1}
function streak(){var n=streakEnd(),c=0;while(n>=1&&onTime(n)){c++;n--}return c}
function bestStreak(){var b=0,c=0;for(var n=1;n<=today();n++){if(onTime(n)){c++;if(c>b)b=c}else c=0}return b}
// El último día de la racha actual (0 si no hay racha): con esto la clasificación sabe si una racha se cortó
function streakLast(){return streak()?streakEnd():0}
function stats(){var ns=Object.keys(store.hist).map(Number),o={played:ns.length,won:0,lost:0,dist:[0,0,0,0,0],mech:{},hints:0,hintsWon:0};
  ns.forEach(function(n){var h=store.hist[n],c=clueOf(n),m=c?c.m:'';o.hints+=h.h||0;if(m&&!o.mech[m])o.mech[m]={p:0,w:0};if(m)o.mech[m].p++;
    if(h.r==='w'){o.won++;o.hintsWon+=h.h||0;if(m)o.mech[m].w++;o.dist[Math.min(4,Math.max(0,h.a-1))]++}else o.lost++});return o}

MC.onTime=onTime;
MC.streak=streak;
MC.bestStreak=bestStreak;
MC.streakLast=streakLast;
MC.stats=stats;
})(window.MC);
