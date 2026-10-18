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
function rankRows(rows,empty){if(!rows.length)return empty;return '<ol class="list" style="padding:0">'+rows.map(function(r,i){return '<li class="rank'+(r.me?' me':'')+'"><span class="pos">'+(i+1)+'</span>'+avatar(r.ph,r.al)+'<span class="nm">'+esc(r.al||'Jugador')+(r.me?' <small>(vos)</small>':'')+(r.sub?'<br><small>'+esc(r.sub)+'</small>':'')+'</span>'+(r.val!=null?'<span class="pts" title="'+esc(r.vt||'Pistas resueltas')+'">'+esc(typeof r.val==='number'?num(r.val):r.val)+'</span>':'')+'</li>'}).join('')+'</ol>'}
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
// Pantalla de carga: un termo cebando el mate del logo
var LD_SVG='<svg class="ld-mate" viewBox="8 -7 100.4 96" aria-hidden="true"><g class="ld-tm"><g transform="translate(15.48 28.45)"><path class="ld-tm-h" d="M-5.5 -28.4h-2.4a1.4 1.4 0 0 0-1.4 1.4V-15.6"/><rect class="ld-tb" x="-5.5" y="-30.4" width="11" height="30.4" rx="1.8"/><path class="ld-tl" d="M-5.5 -2.2h11"/><rect class="ld-tn" x="-5" y="-32.2" width="10" height="2.2" rx=".6"/><rect class="ld-tn" x="-4.3" y="-33.8" width="8.6" height="1.9" rx=".5"/><rect class="ld-tc" x="-4.8" y="-37.4" width="9.6" height="3.8" rx=".8"/><path class="ld-tl" d="M-2.6 -36.8v2.6M0 -36.8v2.6M2.6 -36.8v2.6"/><path class="ld-tbt" d="M.6 -37.6 4.4 -39.8"/></g></g><g transform="translate(42.2 21.5) scale(.8)"><path class="ld-cal" d="M10.5 18.5C7 23.5 6.2 30 10 34c3.4 3.4 16.6 3.4 20 0 3.8-4 3-10.5-.5-15.5z"/><rect class="ld-vir" x="9" y="15.6" width="22" height="3.6" rx="1.6"/><path class="ld-bom" d="M21.5 15 27.6 5.2c.6-1 1.6-1.4 3.4-1.4"/><path class="ld-yer" d="M10.6 16.2C14 11.4 26 11.4 29.4 16.2z"/><path class="ld-vap" d="M14 11c-1.6-1.7 1.6-3.4 0-5.1"/><path class="ld-vap v2" d="M18 11c-1.6-1.7 1.6-3.4 0-5.1"/></g><g class="ld-agw"><path class="ld-ag" pathLength="1" d="M52.56 13.33c1.5.9 2.4 3.1 2.5 7L55 32"/></g><ellipse class="ld-sp" cx="55" cy="32.2" rx="2.6" ry=".8"/><ellipse class="ld-sp s2" cx="55" cy="32.2" rx="2.6" ry=".8"/></svg>';
function loader(){return '<div class="loader" role="status" aria-label="Cargando">'+LD_SVG+'</div>'}
// Firma: las de la casa dicen «Pista de Cripteando»; las enviadas, quién la mandó o que es anónima
function firma(c){if(!c)return '';if(typeof c.por!=='string')return '<p class="firma">Pista de <b>Cripteando</b></p>';return '<p class="firma">'+(c.por?'Pista enviada por <b>'+esc(c.por)+'</b>':'Pista enviada de forma anónima')+'</p>'}
function ansBox(a){return '<div class="ansbox"><span>Respuesta:</span> <b>'+esc(a)+'</b></div>'}
MC.RL=RL;
MC.chips=chips;
MC.desglose=desglose;
MC.ansBox=ansBox;
MC.firma=firma;
MC.loader=loader;
MC.LD_SVG=LD_SVG;

MC.statusNote=statusNote;
MC.avatar=avatar;
MC.rankRows=rankRows;
})(window.MC);
