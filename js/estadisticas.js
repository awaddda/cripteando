(function(MC){
'use strict';
var store=MC.store, today=MC.today, clueOf=MC.clueOf;

function streak(){var n=today();if(!store.hist[n])n--;var c=0;while(n>=1&&store.hist[n]&&store.hist[n].r==='w'){c++;n--}return c}
function bestStreak(){var b=0,c=0;for(var n=1;n<=today();n++){if(store.hist[n]&&store.hist[n].r==='w'){c++;if(c>b)b=c}else c=0}return b}
function stats(){var ns=Object.keys(store.hist).map(Number),o={played:ns.length,won:0,lost:0,dist:[0,0,0,0,0],mech:{},hints:0};
  ns.forEach(function(n){var h=store.hist[n],c=clueOf(n),m=c?c.m:'';o.hints+=h.h||0;if(m&&!o.mech[m])o.mech[m]={p:0,w:0};if(m)o.mech[m].p++;
    if(h.r==='w'){o.won++;if(m)o.mech[m].w++;o.dist[Math.min(4,Math.max(0,h.a-1))]++}else o.lost++});return o}

MC.streak=streak;
MC.bestStreak=bestStreak;
MC.stats=stats;
})(window.MC);
