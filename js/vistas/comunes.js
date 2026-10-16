(function(MC){
'use strict';
var esc=MC.esc, COLORS=MC.COLORS;

var NOTE={clasificacion:'para aparecer en la clasificación.',grupos:'para crear un grupo o unirte a uno.',enviar:'para mandarnos tu pista.'};
function statusNote(what){
  if(!MC.base.conectada()||MC.base.uid()||!NOTE[what])return '';
  return '<div class="note">Iniciá sesión en <button class="link" data-act="go" data-v="cuenta">Cuenta</button> '+NOTE[what]+'</div>'}

var hue=function(s){s=String(s||'');var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return COLORS[Math.abs(h)%COLORS.length]};
var photoOk=function(p){return typeof p==='string'&&p.length<40000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(p)};
var avatar=function(ph,al,cls){var c='av'+(cls?' '+cls:'');if(photoOk(ph))return '<img class="'+c+'" src="'+ph+'" alt="">';return '<span class="'+c+'" style="background:'+hue(al)+'" aria-hidden="true">'+esc(String(al||'?').trim().charAt(0).toUpperCase())+'</span>'};
var num=function(x){x=+x;return isFinite(x)?Math.round(x):0};
function rankRows(rows,empty){if(!rows.length)return empty;return '<ol class="list" style="padding:0">'+rows.map(function(r,i){return '<li class="rank'+(r.me?' me':'')+'"><span class="pos">'+(i+1)+'</span>'+avatar(r.ph,r.al)+'<span class="nm">'+esc(r.al||'Jugador')+(r.me?' <small>(vos)</small>':'')+(r.sub?'<br><small>'+esc(r.sub)+'</small>':'')+'</span>'+(r.val!=null?'<span class="pts" title="Pistas resueltas">'+num(r.val)+'</span>':'')+'</li>'}).join('')+'</ol>'}
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
