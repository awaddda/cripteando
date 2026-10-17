(function(MC){
'use strict';
var esc=MC.esc, stats=MC.stats, streak=MC.streak, bestStreak=MC.bestStreak, store=MC.store, today=MC.today, fmtDate=MC.fmtDate;
var DAYS=30;

function bar(label,v,max,cls,tip){return '<div class="bar-row" data-tip="'+esc(tip)+'"><span>'+label+'</span><div class="track"><div class="fill'+(cls?' '+cls:'')+'" style="width:'+(100*v/max)+'%"></div></div><b>'+v+'</b></div>'}
function plural(n,uno,varios){return n+' '+(n===1?uno:varios)}
function panel(t,sub,body){return '<div class="panel"><h2 style="font-size:20px">'+t+'</h2>'+(sub?'<p class="muted chart-sub">'+sub+'</p>':'')+body+'</div>'}

// Cuántas pistas resolviste con 0, 1, 2 o 3+ ayudas
function hintsDist(){var d=[0,0,0,0];Object.keys(store.hist).forEach(function(n){var h=store.hist[n];if(h.r==='w')d[Math.min(3,h.h||0)]++});
  var tot=d[0]+d[1]+d[2]+d[3],max=Math.max(1,Math.max.apply(null,d));
  if(!tot)return '<div class="empty"><b>Todavía no resolviste ninguna</b>Cuando resuelvas pistas, acá vas a ver con cuántas ayudas.</div>';
  return '<div class="bars">'+d.map(function(v,i){var l=i===3?'3 o más':String(i);return bar(l,v,max,'',plural(v,'pista','pistas')+' con '+(i===3?'3 o más ayudas':plural(i,'ayuda','ayudas')))}).join('')+'</div>'}

// Un mate por día de los últimos 30: cebado si la resolviste, tachado si te rendiste, vacío si no jugaste
function mate(st,cls){return '<svg class="mt m-'+st+(cls?' '+cls:'')+'" viewBox="2.5 2.4 35 35" aria-hidden="true"><path class="cal" d="M10.5 18.5C7 23.5 6.2 30 10 34c3.4 3.4 16.6 3.4 20 0 3.8-4 3-10.5-.5-15.5z"/>'+
  (st==='w'?'<rect class="vir" x="9" y="15.6" width="22" height="3.6" rx="1.6"/><path class="bom" d="M21.5 15 27.6 5.2c.6-1 1.6-1.4 3.4-1.4"/><path class="yer" d="M10.6 16.2C14 11.4 26 11.4 29.4 16.2z"/>':'')+
  (st==='l'?'<path class="x" d="M13 22l14 10M27 22 13 32"/>':'')+'</svg>'}
function activity(T,from){var c='',k={w:0,l:0,n:0};
  for(var n=from;n<=T;n++){var h=store.hist[n],st=h?h.r:(n===T?'p':'n'),txt={w:'Resuelta'+(h&&h.h?' con '+plural(h.h,'ayuda','ayudas'):' sin ayudas'),l:'Me rendí',n:'Sin jugar',p:'Todavía sin jugar'}[st];
    if(st==='p')k.n++;else k[st]++;
    c+='<span class="day" data-tip="'+esc(fmtDate(n)+': '+txt)+'">'+mate(st)+'</span>'}
  var sum=plural(k.w,'resuelta','resueltas')+', '+plural(k.l,'rendida','rendidas')+' y '+k.n+' sin jugar';
  return '<div class="days" role="img" aria-label="'+esc('Últimos días: '+sum)+'">'+c+'</div>'+
   '<div class="legend" aria-hidden="true"><span>'+mate('w')+'Resuelta</span><span>'+mate('l')+'Me rendí</span><span>'+mate('n')+'Sin jugar</span></div>'}

function vStats(){var s=stats(),max=Math.max(1,Math.max.apply(null,s.dist.concat([s.lost]))),pct=s.played?Math.round(100*s.won/s.played):0,T=today(),from=Math.max(1,T-DAYS+1);
  var bars='';for(var i=0;i<5;i++)bars+=bar(i===4?'5 o más':(i+1)+(i?' intentos':' intento'),s.dist[i],max,'',plural(s.dist[i],'pista','pistas')+' en '+(i===4?'5 intentos o más':plural(i+1,'intento','intentos')));
  bars+=bar('Me rendí',s.lost,max,'lose',plural(s.lost,'pista rendida','pistas rendidas'));
  var mk=Object.keys(s.mech).sort(function(a,b){return s.mech[b].p-s.mech[a].p}),mr=mk.length?mk.map(function(k){var m=s.mech[k];return '<div class="bar-row" data-tip="'+esc(k+': resolviste '+m.w+' de '+m.p)+'"><span>'+esc(k)+'</span><div class="track"><div class="fill" style="width:'+(100*m.w/m.p)+'%"></div></div><b>'+m.w+'/'+m.p+'</b></div>'}).join(''):'<div class="empty"><b>Todavía no hay partidas</b>Resolvé una pista y acá vas a ver en qué mecanismos sos mejor.</div>';
  return '<h1 class="page-title">Estadísticas</h1><p class="lead">Tu progreso se guarda en este dispositivo.</p><div class="tiles">'+
   '<div class="tile"><b>'+s.played+'</b><span>Jugadas</span></div><div class="tile"><b>'+pct+'%</b><span>Resueltas</span></div><div class="tile"><b>'+streak()+'</b><span>Racha actual</span></div><div class="tile"><b>'+bestStreak()+'</b><span>Mejor racha</span></div><div class="tile"><b>'+s.hints+'</b><span>Ayudas usadas</span></div></div>'+
   '<div class="stack-charts">'+panel(T-from+1<DAYS?'Desde el primer día':'Últimos '+DAYS+' días','Un mate por cada pista del día.',activity(T,from))+
   '<div class="two">'+panel('Ayudas por pista resuelta','Menos es mejor: 0 es sin ninguna ayuda.',hintsDist())+panel('Cuántos intentos te llevó','','<div class="bars">'+bars+'</div>')+'</div>'+
   panel('Aciertos por mecanismo','Qué porcentaje de cada tipo de pista resolviste.','<div class="bars mech">'+mr+'</div>')+'</div>'}

// Tooltip compartido para todo lo que tenga data-tip
var tip=null;
function showTip(t){if(!tip){tip=document.createElement('div');tip.className='tip';tip.setAttribute('role','tooltip');document.body.appendChild(tip)}
  tip.textContent=t.getAttribute('data-tip');tip.style.display='block';var r=t.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
  tip.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px';tip.style.top=(r.top-h-8<8?r.bottom+8:r.top-h-8)+'px'}
document.addEventListener('pointerover',function(e){var t=e.target.closest&&e.target.closest('[data-tip]');if(t)showTip(t);else if(tip)tip.style.display='none'});
document.addEventListener('scroll',function(){if(tip)tip.style.display='none'},true);

MC.vStats=vStats;
MC.mateIco=mate;
})(window.MC);
