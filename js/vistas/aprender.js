(function(MC){
'use strict';
var esc=MC.esc, norm=MC.norm;

function mech(name,tag,desc,inds,q,sol){return '<details class="mech"><summary>'+name+(tag?' <span class="tag">'+tag+'</span>':'')+'</summary><div class="body"><p>'+desc+'</p>'+(inds?'<div class="inds" aria-label="Indicadores típicos">'+inds.split('|').map(function(i){return '<span>'+i+'</span>'}).join('')+'</div>':'')+
  (q?'<div class="ex"><p class="q">'+q+'</p><details><summary>Ver solución</summary><p>'+sol+'</p></details></div>':'<p class="muted">Vas a encontrar uno en el archivo.</p>')+'</div></details>'}
function vGuia(){
  return '<button class="link" data-act="lhub">Volver a Aprender</button><h1 class="page-title" style="margin-top:10px">Guía de reglas</h1><p class="lead">Un críptico es una frase que dice una cosa y esconde otra. Parece absurda, pero tiene reglas, y cuando las conocés empezás a ver la trampa.</p><div class="lessons">'+
  '<section><h2>Cómo está hecha una pista</h2><p class="muted" style="margin-bottom:12px;max-width:62ch">Toda pista tiene dos partes que llevan a la misma palabra. Los colores de esta página son siempre los mismos.</p><div class="anat">'+
   '<div><b><mark class="m-def">Definición</mark></b>Describe la respuesta de forma directa. Suele estar al principio o al final.</div>'+
   '<div><b><mark class="m-ind">Indicador</mark></b>Una palabra que avisa qué hacer: «revuelto», «al revés», «dentro de».</div>'+
   '<div><b><mark class="m-mat">Relleno</mark></b>Las palabras sobre las que actúa el mecanismo.</div>'+
   '<div><b>Superficie</b>Cómo suena la frase entera. Está escrita para despistarte.</div></div>'+
   '<div class="ex" style="margin-top:14px"><p class="q"><mark class="m-mat">Solar</mark> <mark class="m-ind">revuelto:</mark> <mark class="m-def">planta con espinas</mark> <span class="mono" style="font-size:16px">(5)</span></p><details><summary>Ver solución</summary><p>Las letras de SOLAR se reordenan en <b>ROSAL</b>. El indicador «revuelto» pide el anagrama y «planta con espinas» confirma la respuesta por el otro lado.</p></details></div></section>'+
  '<section><h2>Método en seis pasos</h2><ol class="steps"><li><b>Olvidá la superficie.</b> Leé la frase palabra por palabra, no como una oración.</li><li><b>Contá las letras.</b> El número entre paréntesis descarta muchísimo. Si hay un grupo de palabras con esas letras, sospechá de un anagrama.</li><li><b>Buscá la definición.</b> Probá primero con el principio y con el final.</li><li><b>Cazá el indicador.</b> Palabras de desorden piden anagramas, palabras de giro piden inversiones, palabras de contener piden ocultas o inserciones.</li><li><b>Sin indicador, pensá en otras acepciones.</b> Las charadas y las dobles definiciones no lo llevan. Pensá en abreviaturas y significados secundarios.</li><li><b>Comprobá por las dos vías.</b> La respuesta buena encaja con la definición y con el mecanismo a la vez.</li></ol></section>'+
  '<section><h2>Los mecanismos</h2><div class="mechs">'+
   mech('Anagrama','el más frecuente','Las letras de una palabra o grupo de palabras se reordenan para formar la solución. El relleno aparece tal cual en la pista y suma exactamente las letras del paréntesis.','revuelto|mezclado|agitado|roto|borracho|bailando|hecho un lío','Solar revuelto: planta con espinas (5)','SOLAR, «revuelto», se reordena en <b>ROSAL</b>. «Planta con espinas» es la definición.')+
   mech('Palabra oculta','','La solución está escrita seguida dentro de otra palabra o a caballo entre varias. Está a la vista: hay que leer sin hacer caso a los espacios.','en|dentro de|esconde|guarda|parte de|oculto en','Un tema sano esconde la mezcla de harina (4)','Se esconde entre dos palabras: te<b>MA SA</b>no. «Esconde» es el indicador y «la mezcla de harina» es la definición.')+
   mech('Bifronte','leer al revés','La solución sale al leer una palabra o grupo de palabras de atrás para adelante.','al revés|vuelve|retrocede|de espaldas|en el espejo|desde el este','Las de espaldas: condimento (3)','LAS leído al revés es <b>SAL</b>. «De espaldas» es el indicador y «condimento» es la definición.')+
   mech('Homófono','suena igual','La solución suena igual que otra palabra de la pista, aunque se escriba distinto. En el español rioplatense dan mucho juego la b y la v, la h muda, y la ll y la y, que suenan igual. Las eses, ces y zetas también.','dicen|se oye|suena|en voz alta|escuchó|les habló','Dicen que poseyó, y es un caño (4)','TUVO («poseyó») suena igual que <b>TUBO</b>. «Dicen» es el indicador y «un caño» es la definición.')+
   mech('Doble definición','sin indicador','La pista son dos definiciones distintas de la misma palabra. El mecanismo es la propia ambigüedad. Suelen ser pistas cortas y piden pensar en una segunda acepción.','','Fábrica y vegetal (6)','Una <b>PLANTA</b> es una fábrica y también un vegetal.')+
   mech('Charada','suma de piezas','La respuesta se forma pegando piezas en orden: sinónimos, abreviaturas, letras sueltas. Normalmente no lleva indicador. La clave es encontrar otra definición para cada palabra.','con|y|ante|tras|después de|unido a|forman','Perro con palo de bandera: cesta (7)','El perro es CAN y el palo de bandera es ASTA: <b>CAN</b> + <b>ASTA</b> = CANASTA. «Cesta» es la definición.')+
   mech('Inserción','contenedor y contenido','Una pieza se mete dentro de otra. A diferencia de la palabra oculta, las piezas no están escritas tal cual: se construyen.','en medio de|dentro de|se cuela en|abraza|partido|rodea','El de se mete en por partido: autoridad (5)','POR partido queda PO | R, y DE entra en el medio: PO + <b>DE</b> + R = PODER. «Autoridad» es la definición.')+
   mech('Resta','quitar algo','A una palabra se le quita algo: la primera letra, la última, el centro o una palabra entera. El indicador dice qué sale.','sin|pierde|sale|se va|sin cabeza|sin terminar|despojado de','La trama sin cabeza es parte del árbol (4)','TRAMA sin su primera letra queda <b>RAMA</b>. «Parte del árbol» es la definición.')+
   mech('Sustitución','cambiar una letra','Una letra de una palabra se cambia por otra. Muchas veces llegan como abreviaturas, como el sur por el norte, que cambia una S por una N.','si cambias|por|en lugar de|cambiado','Gato, si la g pasa a ser p, es un ave nadadora (4)','En GATO se cambia la G por una P: <b>PATO</b>. «Un ave nadadora» es la definición.')+
   mech('Iniciales y finales','letras sueltas','Se toma la primera letra, o la última, de varias palabras seguidas.','al principio|cabeza de|primeras de|al final|colas|inicio de','Astro: al principio, salen otros luceros (3)','Las iniciales de <b>S</b>alen <b>O</b>tros <b>L</b>uceros forman SOL. «Astro» es la definición.')+
   mech('Letras alternas','de los más difíciles','Se toma una letra sí y otra no, o la segunda de cada palabra. Es de los mecanismos menos comunes y de los más difíciles de ver.','cada segundo|a saltos|pares|impares|a medias','','')+
   mech('Traducción','otro idioma','Una pieza se traduce a otro idioma, casi siempre inglés. El indicador es un lugar o una nacionalidad.','en Londres|en inglés|el yanqui|en París|en francés','Sí en Londres, con el oeste: material para paredes (4)','«Sí» en Londres es YES, y «el oeste» es O: <b>YES</b> + <b>O</b> = YESO. «Material para paredes» es la definición.')+
   mech('Combinadas','para cuando ya tenés práctica','Las pistas más difíciles encadenan dos o tres mecanismos. Resolvelas por partes, como una receta.','','Las de espaldas, con la primera vocal: habitación (4)','Primero se lee LAS al revés, que da SAL. Después se suma la primera vocal: <b>SAL</b> + <b>A</b> = SALA. «Habitación» es la definición.')+
  '</div></section>'+
  '<section><h2>El diccionario secreto</h2><p class="muted" style="margin-bottom:12px;max-width:62ch">Muchas piezas de una charada son una o dos letras que salen de abreviaturas conocidas. Si una palabra parece no pintar nada, preguntate si es una de estas.</p><div class="tblwrap"><table><thead><tr><th>Familia</th><th>Ejemplos</th></tr></thead><tbody>'+
   '<tr><td>Puntos cardinales</td><td>norte <code>N</code>, sur <code>S</code>, este <code>E</code>, oeste <code>O</code></td></tr>'+
   '<tr><td>Números romanos</td><td>uno <code>I</code>, cinco <code>V</code>, diez <code>X</code>, cien <code>C</code>, mil <code>M</code></td></tr>'+
   '<tr><td>Notas musicales</td><td><code>DO</code> <code>RE</code> <code>MI</code> <code>FA</code> <code>SOL</code> <code>LA</code> <code>SI</code>. «La que sigue al re» es MI</td></tr>'+
   '<tr><td>Elementos químicos</td><td>oxígeno <code>O</code>, sodio <code>NA</code>, fósforo <code>P</code>, arsénico <code>AS</code></td></tr>'+
   '<tr><td>Letras por su nombre</td><td>la ese <code>S</code> o <code>ESE</code>, la cuarta letra <code>D</code></td></tr>'+
   '<tr><td>Horas</td><td>por la mañana <code>AM</code>, por la tarde <code>PM</code></td></tr>'+
   '<tr><td>Prefijos</td><td>de nuevo <code>RE</code> (RE + VISTA = REVISTA)</td></tr>'+
   '<tr><td>Palabras en inglés</td><td>hombre <code>MAN</code>, sí <code>YES</code>, verdadero <code>TRUE</code></td></tr></tbody></table></div></section>'+
  '<section><h2>Reglas de esta página</h2><ul class="checks"><li>La respuesta puede escribirse sin tilde: se acepta igual.</li><li>La Ñ es su propia letra. La N y la Ñ no son intercambiables.</li><li>La definición puede ser engañosa, pero nunca miente.</li><li>Desconfiá de los nombres propios: suelen estar por sus letras, no por su significado.</li><li>Tenés intentos ilimitados y podés usar las ayudas que quieras. Si te rendís, ves la respuesta y la pista queda como no resuelta.</li></ul></section></div>'}

var NAME={def:'la definición',ind:'el indicador',mat:'el relleno'};

var IK={oculta:'una palabra oculta',iniciales:'tomar letras sueltas de cada palabra',anagrama:'un anagrama: reordenar las letras',resta:'quitar letras',bifronte:'leer al revés',insercion:'una inserción: meter una pieza dentro de otra',homofono:'un homófono: algo que suena igual',charada:'pegar las piezas en orden',abreviaturas:'pegar las piezas en orden',combinada:'varios pasos encadenados'};
var lessonOf=function(id){return MC.LESSONS.filter(function(x){return x.id===id})[0]};
var learned=function(id){var o=MC.store.learn[id];return o?Object.keys(o).length:0};
var stepsOf=function(l){return (l.theory?l.theory.length:1+l.clues.length)+1};
var count=function(cl,r){return cl.t.filter(function(x){return x[1]===r}).length};
var NOIND={doble:'La doble definición no lleva indicador: las dos partes de la pista son definiciones.',combinada:'Usan los indicadores de cada mecanismo que encadenan.'};

function vHub(){
  var rows=MC.LESSONS.map(function(l,i){var n=learned(l.id),tot=l.clues?l.clues.length:0;
    var st=l.theory?(n?'<span class="st w">Leída</span>':'<span class="st p">Solo teoría</span>'):'<span class="st'+(n>=tot?' w':(n?'':' p'))+'">'+n+'/'+tot+' practicadas</span>';
    return '<li><button class="lcard" data-act="lopen" data-l="'+l.id+'"><span class="ln">'+(i+1)+'</span><span class="d"><b>'+esc(l.name)+'</b><small>'+esc(l.desc)+'</small></span>'+st+'</button></li>'}).join('');
  return '<h1 class="page-title">Aprender</h1><p class="lead">Cada pista críptica tiene una definición y un juego de palabras que llevan a la misma respuesta. Elegí un tipo para ver cómo funciona y practicarlo con pistas cortas.</p>'+
   '<div class="lguia"><button class="btn sm" data-act="lguia">Guía de reglas</button><span>Todos los mecanismos, el diccionario de abreviaturas y las reglas de la página.</span></div>'+
   '<ol class="list lessons-list">'+rows+'</ol>'}

function progress(k,tot){var h='';for(var i=0;i<tot;i++)h+='<span class="ldot'+(i<k?' past':(i===k?' now':''))+'"></span>';
  return '<div class="lprog"><span>Paso '+(k+1)+' de '+tot+'</span><span class="ldots" aria-hidden="true">'+h+'</span></div>'}
function explain(l){
  return '<section class="lpanel"><h2>Cómo funciona</h2>'+l.exp+
   (l.inds.length?'<h3 class="lh3">Indicadores habituales</h3><div class="inds">'+l.inds.map(function(i){return '<span>'+esc(i)+'</span>'}).join('')+'</div>':'<p class="muted">'+NOIND[l.id]+'</p>')+
   '<h3 class="lh3">Un ejemplo</h3><div class="ex"><p class="q">'+esc(l.ej.q)+'</p><details><summary>Ver cómo se resuelve</summary><p>'+l.ej.sol+'</p></details></div></section>'}
function lcellsHtml(len,ans,typed,done,typedIn){var h='';
  for(var i=0;i<len;i++){var ch=done?ans[i]:(typed[i]||''),cls='cell';
    if(!done&&ch)cls+=' full'+(i===typedIn?' in':'');
    if(!done&&i===Math.min(typed.length,len-1))cls+=' cur';
    h+='<div class="'+cls+'" style="--i:'+i+'">'+esc(ch)+'</div>'}
  return h}
function practice(l,j){var S=MC.S,cl=l.clues[j],ans=norm(cl.a),len=ans.length,ph=S.lph,f=S.lfound,fr=S.lfr||{};S.lfr=null;
  var tap=ph==='def'||ph==='ind',hasMat=count(cl,'mat')>0;
  var clue=cl.t.map(function(x,i){var r=x[1],on=f[i]||(r&&(ph==='done'||(ph==='ans'&&r==='mat')));
    var fresh=i===fr.i||(fr.mat&&r==='mat')||(fr.all&&on&&!f[i]&&r!=='mat');
    var cls=(on?'seg m-'+r+(fresh?' fresh':''):'')+(i===fr.no?' nope':'');
    return tap?'<button class="lseg '+cls+'" data-act="lseg" data-i="'+i+'">'+esc(x[0])+'</button>':(on?'<mark class="'+cls+'">'+esc(x[0])+'</mark>':esc(x[0]))}).join(' ');
  var nd=count(cl,'def'),ni=count(cl,'ind');
  var ins={def:nd>1?'Tocá las dos definiciones.':'Tocá la definición: la parte que describe la respuesta.',
    ind:ni>1?'Ahora tocá los indicadores: las palabras que avisan qué hacer.':'Ahora tocá el indicador: la palabra que avisa qué hacer.',
    ans:hasMat?'El relleno quedó marcado. Escribí la respuesta.':'Ya tenés las definiciones. Escribí la respuesta.',done:''}[ph];
  var h='<section class="lpractice"><p class="lh3" style="text-align:center">Pista '+(j+1)+' de '+l.clues.length+'</p><p class="clue" id="lclue">'+clue+' <span class="len">('+len+')</span></p>';
  if(ins)h+='<p class="linstr">'+ins+'</p>';
  if(ph==='ans'||ph==='done'){var done=ph==='done';
    h+='<div class="cells'+(done?(S.lwin?' good':' lost')+(fr.all?' flip':''):'')+'" id="lcells" role="group" aria-label="Respuesta de '+len+' letras">'+lcellsHtml(len,ans,S.ltyped,done,-1)+
      (done?'':'<input id="lguess" class="guess-input" type="text" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="'+(len+4)+'" aria-label="Escribí la respuesta de '+len+' letras">')+'</div>';}
  h+='<p class="msg '+S.lcls+'" id="lmsg" role="status" aria-live="polite">'+esc(S.lmsg)+'</p>';
  if(ph==='ans')h+='<div class="actions"><button class="btn pri" data-act="lcheck">Comprobar</button><button class="btn ghost-btn" data-act="lshow">Ver la respuesta</button></div>';
  if(tap)h+='<div class="actions"><button class="btn ghost-btn" data-act="lshow">Ver la respuesta</button></div>';
  if(ph==='done')h+='<div class="result'+(fr.all?' fresh" style="--d:'+(len*110+400)+'ms':'')+'"><h2>'+(S.lwin?'¡Bien!':'Así se resuelve')+'</h2>'+MC.desglose(cl.t,IK[l.id],cl.ex)+MC.ansBox(cl.a)+'</div>';
  return h+'</section>'}
function summary(l){var n=learned(l.id),nx=MC.LESSONS[MC.LESSONS.indexOf(l)+1];
  return '<section class="lpanel lend"><h2>Lección completa</h2><p>'+(l.theory?'Ya tenés la base. Ahora toca ver cada mecanismo de cerca.':'Practicaste '+n+' de '+l.clues.length+' pistas de esta lección.')+'</p>'+
   '<div class="row-wrap">'+(nx?'<button class="btn pri" data-act="lopen" data-l="'+nx.id+'">Siguiente: '+esc(nx.name)+'</button>':'<button class="btn pri" data-act="go" data-v="hoy" data-n="today">Jugar la pista de hoy</button>')+'<button class="btn" data-act="lhub">Volver a Aprender</button></div></section>'}
function vLesson(){var S=MC.S,l=lessonOf(S.learn),tot=stepsOf(l),k=Math.min(S.lstep,tot-1),last=k===tot-1,pr=!l.theory&&k>0&&!last,body;
  if(last)body=summary(l);else if(l.theory)body='<section class="lpanel"><h2>'+l.theory[k].h+'</h2>'+l.theory[k].p+'</section>';else if(k===0)body=explain(l);else body=practice(l,k-1);
  return '<button class="link" data-act="lhub">Volver a Aprender</button><h1 class="page-title" style="margin-top:10px">'+esc(l.name)+'</h1>'+progress(k,tot)+body+
   (last?'':'<div class="lnav">'+(k>0?'<button class="btn" data-act="lprev">Atrás</button>':'<span></span>')+'<button class="btn'+(pr&&S.lph!=='done'?'':' pri')+'" data-act="lnext">'+(pr&&S.lph!=='done'?'Saltear':'Continuar')+'</button></div>')}
function vAprender(){var S=MC.S;return S.learn==='guia'?vGuia():(S.learn&&lessonOf(S.learn)?vLesson():vHub())}

function reset(){var S=MC.S;S.lph='def';S.lfound={};S.ltyped='';S.lmsg='';S.lcls='';S.lfr=null;S.lwin=false}
function mark(id,j){var st=MC.store;if(!st.learn[id])st.learn[id]={};st.learn[id][j]=true;MC.save()}
function curClue(){var S=MC.S,l=lessonOf(S.learn);return l&&l.clues?l.clues[S.lstep-1]:null}
function learnOpen(id){var S=MC.S;S.learn=id;S.lstep=0;reset();MC.marcar('aprender');MC.render();window.scrollTo(0,0)}
function learnStep(d){var S=MC.S,l=lessonOf(S.learn);S.lstep=Math.max(0,Math.min(stepsOf(l)-1,S.lstep+d));reset();
  if(l.theory&&S.lstep===stepsOf(l)-1)mark(l.id,0);MC.render();window.scrollTo(0,0)}
function learnTap(i){var S=MC.S,cl=curClue(),ph=S.lph;if(!cl||(ph!=='def'&&ph!=='ind')||S.lfound[i])return;var r=cl.t[i][1];
  if(r===ph){S.lfound[i]=true;S.lfr={i:i};
    var left=cl.t.some(function(x,j){return x[1]===ph&&!S.lfound[j]});
    if(left){S.lmsg='Bien. Falta otra.';S.lcls='ok'}
    else{S.lmsg='Bien: '+(ph==='def'?(count(cl,'def')>1?'esas son las definiciones.':'esa es la definición.'):(count(cl,'ind')>1?'esos son los indicadores.':'ese es el indicador.'));S.lcls='ok';
      if(ph==='def'&&count(cl,'ind'))S.lph='ind';else{S.lph='ans';S.lfr.mat=true}}}
  else{S.lfr={no:i};S.lcls='bad';
    S.lmsg=(r?'Esa parte es '+NAME[r]+', no '+NAME[ph]+'.':'Esa parte es solo superficie: está para que la frase suene natural.')+
      (ph==='def'?' La definición suele estar al principio o al final.':' Buscá la palabra que pide una acción: revolver, esconder, dar vuelta.')}
  MC.render()}
function learnCheck(){var S=MC.S,cl=curClue();if(!cl||S.lph!=='ans')return;var ans=norm(cl.a),g=norm(S.ltyped);
  if(g.length!==ans.length){S.lmsg='Faltan letras: la respuesta tiene '+ans.length+'.';S.lcls='bad';var m=MC.$('#lmsg');if(m){m.textContent=S.lmsg;m.className='msg bad'}return}
  if(g===ans){S.lph='done';S.lwin=true;S.lmsg='';S.lfr={all:true};mark(S.learn,S.lstep-1);MC.render();return}
  S.lmsg='No es esa. Revisá el mecanismo letra por letra.';S.lcls='bad';S.ltyped='';MC.render();var el=MC.$('#lcells');if(el)el.classList.add('shake')}
function learnShow(){var S=MC.S,cl=curClue();if(!cl||S.lph==='done')return;S.lph='done';S.lwin=false;S.lmsg='';S.lfr={all:true};mark(S.learn,S.lstep-1);MC.render()}
function paintLearn(typedIn){var S=MC.S,cl=curClue(),el=MC.$('#lcells');if(!el||!cl)return;var inp=MC.$('#lguess'),ans=norm(cl.a);
  Array.prototype.slice.call(el.children).forEach(function(ch){if(ch!==inp)el.removeChild(ch)});el.insertAdjacentHTML('afterbegin',lcellsHtml(ans.length,ans,S.ltyped,false,typedIn))}
function learnLen(){var cl=curClue();return cl?norm(cl.a).length:0}

MC.vAprender=vAprender;
MC.learnOpen=learnOpen;
MC.learnReset=reset;
MC.learnStep=learnStep;
MC.learnTap=learnTap;
MC.learnCheck=learnCheck;
MC.learnShow=learnShow;
MC.paintLearn=paintLearn;
MC.learnLen=learnLen;
})(window.MC);
