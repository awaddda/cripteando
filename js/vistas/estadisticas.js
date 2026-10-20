(function(MC){
'use strict';
var esc=MC.esc, stats=MC.stats, streak=MC.streak, bestStreak=MC.bestStreak, store=MC.store, today=MC.today, fmtDate=MC.fmtDate;
var DAY=86400000, WD=['L','M','M','J','V','S','D'];

function bar(label,v,max,cls,tip){return '<div class="bar-row" data-tip="'+esc(tip)+'"><span>'+label+'</span><div class="track"><div class="fill'+(cls?' '+cls:'')+'" style="width:'+(100*v/max)+'%"></div></div><b>'+v+'</b></div>'}
function plural(n,uno,varios){return n+' '+(n===1?uno:varios)}
function dec(x){return x.toFixed(1).replace('.',',')}
function panel(t,sub,body,cls){return '<section class="panel'+(cls?' '+cls:'')+'"><h2 class="st-h">'+t+'</h2>'+(sub?'<p class="muted chart-sub">'+sub+'</p>':'')+body+'</section>'}

// Un mate por día: cebado si la resolviste, tachado si te rendiste, vacío si no jugaste
function mate(st,cls){return '<svg class="mt m-'+st+(cls?' '+cls:'')+'" viewBox="2.5 2.4 35 35" aria-hidden="true"><path class="cal" d="M10.5 18.5C7 23.5 6.2 30 10 34c3.4 3.4 16.6 3.4 20 0 3.8-4 3-10.5-.5-15.5z"/>'+
  (st==='w'?'<rect class="vir" x="9" y="15.6" width="22" height="3.6" rx="1.6"/><path class="bom" d="M21.5 15 27.6 5.2c.6-1 1.6-1.4 3.4-1.4"/><path class="yer" d="M10.6 16.2C14 11.4 26 11.4 29.4 16.2z"/>':'')+
  (st==='l'?'<path class="x" d="M13 22l14 10M27 22 13 32"/>':'')+'</svg>'}
function dayTxt(n,T){var h=store.hist[n],st=h?h.r:(n===T?'p':'n');
  return {st:st,txt:{w:'Resuelta'+(h&&h.h?' con '+plural(h.h,'ayuda','ayudas'):' sin ayudas'),l:'Me rendí',n:'Sin jugar',p:'Todavía sin jugar'}[st]}}

// Arriba: la racha en grande y un anillo con el porcentaje de resueltas
function hero(s,T){var st=streak(),best=bestStreak(),pct=s.played?Math.round(100*s.won/s.played):0,R=42,C=2*Math.PI*R;
  var ring='<svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="ring-bg" cx="50" cy="50" r="'+R+'"/><circle class="ring-fg" cx="50" cy="50" r="'+R+'" stroke-dasharray="'+(C*pct/100).toFixed(1)+' '+C.toFixed(1)+'"/></svg>';
  var playedToday=!!store.hist[T];
  return '<div class="st-hero">'+
    '<div class="st-streak panel">'+mate(st?'w':'n','st-big')+'<div><span class="st-k">Racha actual</span><b class="st-n">'+st+'</b><span class="st-sub">'+(st?(st===1?'día seguido':'días seguidos'):(playedToday?'Mañana arrancás una nueva':'Resolvé la de hoy para empezar una'))+'</span>'+
      '<span class="st-best">Mejor racha: <b>'+best+'</b></span></div></div>'+
    '<div class="st-pct panel" role="img" aria-label="'+pct+'% de las pistas jugadas resueltas">'+ring+'<div><b class="st-n">'+pct+'%</b><span class="st-k">resueltas</span><span class="st-sub">'+plural(s.won,'resuelta','resueltas')+' de '+plural(s.played,'jugada','jugadas')+'</span></div></div></div>'}

function facts(s){var tries=0;Object.keys(store.hist).forEach(function(n){var h=store.hist[n];if(h.r==='w')tries+=h.a||1});
  var f=[[s.played,'Jugadas'],[s.won?dec(tries/s.won):'–','Intentos por resuelta'],[s.won?dec(s.hintsWon/s.won):'–','Ayudas por resuelta'],[s.dist[0],'Al primer intento']];
  return '<div class="st-facts">'+f.map(function(x){return '<div class="st-fact"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'}).join('')+'</div>'}

// Calendario por mes, de lunes a domingo; cada día con su mate abre esa pista
function calendar(T){var first=new Date(MC.diaMs(1)),last=new Date(MC.diaMs(T)),out='',y=last.getUTCFullYear(),m=last.getUTCMonth();
  var monthName=function(y,m){return new Intl.DateTimeFormat('es-AR',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m,1)))};
  while(y>first.getUTCFullYear()||(y===first.getUTCFullYear()&&m>=first.getUTCMonth())){
    var start=Date.UTC(y,m,1),days=new Date(Date.UTC(y,m+1,0)).getUTCDate(),lead=(new Date(start).getUTCDay()+6)%7,cells='';
    for(var i=0;i<lead;i++)cells+='<span class="cal-x"></span>';
    for(var d=1;d<=days;d++){var n=MC.dayOf(Date.UTC(y,m,d)+3*3600000);
      if(n<1||n>T){cells+='<span class="cal-x"><span class="mt-sp"></span><i>'+d+'</i></span>';continue}
      var t=dayTxt(n,T);cells+='<button type="button" class="cal-d'+(n===T?' hoy':'')+'" data-act="open" data-n="'+n+'" data-tip="'+esc(fmtDate(n)+': '+t.txt)+'" aria-label="'+esc('Pista #'+n+', '+fmtDate(n)+': '+t.txt)+'">'+mate(t.st)+'<i>'+d+'</i></button>'}
    out+='<div class="cal-m"><h3>'+monthName(y,m)+'</h3><div class="cal-g">'+WD.map(function(w){return '<span class="cal-w" aria-hidden="true">'+w+'</span>'}).join('')+cells+'</div></div>';
    if(--m<0){m=11;y--}}
  return '<div class="cal-ms">'+out+'</div><div class="legend" aria-hidden="true"><span>'+mate('w')+'Resuelta</span><span>'+mate('l')+'Me rendí</span><span>'+mate('n')+'Sin jugar</span></div>'}

// Tu fuerte y lo que más te cuesta: entre los mecanismos que jugaste al menos 2 veces
function insights(s){var ks=Object.keys(s.mech).filter(function(k){return s.mech[k].p>=2});if(ks.length<2)return '';
  var r=function(k){return s.mech[k].w/s.mech[k].p};ks.sort(function(a,b){return r(b)-r(a)||s.mech[b].p-s.mech[a].p});
  var hi=ks[0],lo=ks[ks.length-1];if(r(hi)===r(lo))return '';
  var card=function(cls,k,t,sub){return '<div class="st-ins '+cls+'"><span class="st-k">'+t+'</span><b>'+esc(k)+'</b><span class="st-sub">'+sub+'</span></div>'};
  return '<div class="st-insights">'+card('up',hi,'Tu fuerte','Resolviste '+s.mech[hi].w+' de '+s.mech[hi].p)+card('down',lo,'Lo que más te cuesta','Resolviste '+s.mech[lo].w+' de '+s.mech[lo].p+'. <button class="link" data-act="go" data-v="aprender">Practicalo</button>')+'</div>'}

// Cuántas pistas resolviste con 0, 1, 2 o 3+ ayudas
function hintsDist(){var d=[0,0,0,0];Object.keys(store.hist).forEach(function(n){var h=store.hist[n];if(h.r==='w')d[Math.min(3,h.h||0)]++});
  var tot=d[0]+d[1]+d[2]+d[3],max=Math.max(1,Math.max.apply(null,d));
  if(!tot)return '<div class="empty"><b>Todavía no resolviste ninguna</b>Cuando resuelvas pistas, acá vas a ver con cuántas ayudas.</div>';
  return '<div class="bars">'+d.map(function(v,i){var l=i===3?'3 o más':String(i);return bar(l,v,max,'',plural(v,'pista','pistas')+' con '+(i===3?'3 o más ayudas':plural(i,'ayuda','ayudas')))}).join('')+'</div>'}

function vStats(){var s=stats(),T=today(),max=Math.max(1,Math.max.apply(null,s.dist.concat([s.lost])));
  var bars='';for(var i=0;i<5;i++)bars+=bar(i===4?'5 o más':(i+1)+(i?' intentos':' intento'),s.dist[i],max,'',plural(s.dist[i],'pista','pistas')+' en '+(i===4?'5 intentos o más':plural(i+1,'intento','intentos')));
  bars+=bar('Me rendí',s.lost,max,'lose',plural(s.lost,'pista rendida','pistas rendidas'));
  var mk=Object.keys(s.mech).sort(function(a,b){return s.mech[b].p-s.mech[a].p}),mr=mk.length?mk.map(function(k){var m=s.mech[k];return '<div class="bar-row" data-tip="'+esc(k+': resolviste '+m.w+' de '+m.p)+'"><span>'+esc(k)+'</span><div class="track"><div class="fill" style="width:'+(100*m.w/m.p)+'%"></div></div><b>'+m.w+'/'+m.p+'</b></div>'}).join(''):'<div class="empty"><b>Todavía no hay partidas</b>Resolvé una pista y acá vas a ver en qué mecanismos sos mejor.</div>';
  return '<h1 class="page-title">Estadísticas</h1><p class="lead">'+(MC.base.lista()?'Tu progreso se guarda en tu cuenta.':'Tu progreso se guarda en este dispositivo. Iniciá sesión para no perderlo.')+'</p>'+
   '<div class="st-wrap">'+hero(s,T)+facts(s)+
   panel('Calendario','Un mate por cada pista del día. Tocá uno para abrir esa pista.',calendar(T),'st-cal')+
   insights(s)+
   '<div class="two">'+panel('Cuántos intentos te llevó','','<div class="bars">'+bars+'</div>')+panel('Ayudas por pista resuelta','Menos es mejor: 0 es sin ninguna ayuda.',hintsDist())+'</div>'+
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
