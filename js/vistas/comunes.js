(function(MC){
'use strict';
var esc=MC.esc, COLORS=MC.COLORS;

function statusNote(){
  if(!MC.base.conectada())return '<div class="note warn">La base compartida no está conectada en esta versión de la página, así que la clasificación, los grupos y los envíos no se comparten con otros jugadores. Tu progreso sí se guarda en este navegador.</div>';
  if(MC.base.puedeEscribir()===false)return '<div class="note warn">Tu acceso es de solo lectura: ves la clasificación, pero tus resultados no se publican. Pedile al dueño de la página permiso de colaborador.</div>';
  return ''}

var avatar=function(c,al){return '<span class="av" style="background:'+COLORS[Math.abs(c|0)%COLORS.length]+'" aria-hidden="true">'+esc(String(al||'?').trim().charAt(0).toUpperCase())+'</span>'};
var num=function(x){x=+x;return isFinite(x)?Math.round(x):0};
function rankRows(rows,empty){if(!rows.length)return empty;return '<ol class="list" style="padding:0">'+rows.map(function(r,i){return '<li class="rank'+(r.me?' me':'')+'"><span class="pos">'+(i+1)+'</span>'+avatar(r.c,r.al)+'<span class="nm">'+esc(r.al||'Jugador')+(r.me?' <small>(vos)</small>':'')+(r.sub?'<br><small>'+esc(r.sub)+'</small>':'')+'</span>'+(r.val!=null?'<span class="pts" title="Pistas resueltas">'+num(r.val)+'</span>':'')+'</li>'}).join('')+'</ol>'}
MC.num=num;

var RL={def:'Definición',ind:'Indicador',mat:'Relleno'};
var partsOf=function(t,r){return t.filter(function(x){return x[1]===r}).map(function(x){return x[0].replace(/[,:;.]+$/,'')})};
var quote=function(a){var q=a.map(function(p){return '«'+esc(p)+'»'});return q.length<2?q.join(''):q.slice(0,-1).join(', ')+' y '+q[q.length-1]};

function chips(t,shown){var h='';['def','mat','ind'].forEach(function(r){if(shown[r]&&partsOf(t,r).length)h+='<span class="rchip r-'+r+'">'+RL[r]+'</span>'});
  return h?'<div class="rchips" aria-hidden="true">'+h+'</div>':''}
function bkSection(r,label,text){return '<div class="bk"><span class="rchip r-'+r+'">'+label+'</span><p>'+text+'</p></div>'}

function desglose(t,ik,ex){var d=partsOf(t,'def'),i=partsOf(t,'ind'),m=partsOf(t,'mat'),h='';
  h+=bkSection('ind','Indicador',!i.length?'Esta pista no tiene indicador: '+(d.length>1?'las dos partes son definiciones de la misma palabra.':'las piezas se pegan en orden.'):
    quote(i)+(i.length>1?' son nuestros indicadores':' es nuestro indicador')+(ik?(i.length>1?': piden ':': pide ')+esc(ik)+'.':'.'));
  h+=bkSection('mat','Relleno',!m.length?'Esta pista no tiene relleno: no hay ninguna palabra que modificar.':
    quote(m)+(m.length>1?' son nuestros rellenos. Encontramos la respuesta modificándolos':' es nuestro relleno. Encontramos la respuesta modificándolo')+(i.length?' como nos lo muestra el indicador.':': hay que buscarle un sustituto a cada pieza y pegarlos en orden.'));
  h+=bkSection('def','Definición',d.length>1?quote(d)+' son dos definiciones: la respuesta tiene que significar las dos cosas.':'Estas palabras forman nuestra definición, y la respuesta será algo que signifique '+quote(d)+'.');
  if(ex)h+=bkSection('how','Cómo se arma',ex);
  return '<div class="bkd">'+h+'</div>'}
function ansBox(a){return '<div class="ansbox"><span>Respuesta:</span> <b>'+esc(a)+'</b></div>'}
MC.RL=RL;
MC.chips=chips;
MC.desglose=desglose;
MC.ansBox=ansBox;

MC.statusNote=statusNote;
MC.avatar=avatar;
MC.rankRows=rankRows;
})(window.MC);
