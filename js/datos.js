(function(MC){
'use strict';

MC.BANK=[
 {a:'MATE',m:'Anagrama',ik:'un anagrama',
  t:[['Tema','mat'],['confuso','ind'],['para tomar con bombilla','def']],
  ex:'Las letras de TEMA, «confuso», se reordenan en MATE. «Para tomar con bombilla» es la definición.'},
 {a:'PASMO',m:'Palabra oculta',ik:'una palabra oculta',
  t:[['El asombro','def'],['se le escapa',''],['entre','ind'],['copas mojadas','mat']],
  ex:'PASMO está escondido entre las dos últimas palabras: co<b>PAS MO</b>jadas. «Entre» es el indicador y «el asombro» es la definición.'},
 {a:'PANTALLA',m:'Charada',ik:'una suma de piezas',
  t:[['Alimento','mat'],['con','ind'],['medida,','mat'],['donde se ve la película','def']],
  ex:'El alimento es PAN y la medida es TALLA: <b>PAN</b> + <b>TALLA</b> = PANTALLA. «Con» une las piezas y «donde se ve la película» es la definición.'},
 {a:'AMOR',m:'Bifronte',ik:'leer al revés',
  t:[['Roma,','mat'],['de espaldas,','ind'],['es',''],['cariño','def']],
  ex:'ROMA leída de espaldas, letra por letra, da <b>AMOR</b>. «De espaldas» es el indicador y «cariño» es la definición.'},
 {a:'HAYA',m:'Homófono',ik:'un homófono, algo que suena igual',
  t:[['Dicen que','ind'],['encuentra,','mat'],['y es',''],['un árbol','def']],
  ex:'«Dicen que» avisa de un homófono: HALLA («encuentra») suena igual que HAYA, porque en el habla rioplatense la ll y la y suenan igual. «Un árbol» es la definición.'},
 {a:'CORTE',m:'Doble definición',ik:'',
  t:[['Tajo del sastre','def'],['y',''],['tribunal','def']],
  ex:'Una doble definición: el corte es lo que hace el sastre en la tela y también un tribunal, como la Corte Suprema. No hay indicador ni relleno.'},
 {a:'CAMINO',m:'Inserción',ik:'una inserción, una pieza dentro de otra',
  t:[['Nota que sigue al re,','mat'],['dentro de','ind'],['cano','mat'],['partido:','ind'],['sendero','def']],
  ex:'La nota que sigue al re es MI. CANO, «partido», queda CA | NO, y MI entra en el medio: CA + <b>MI</b> + NO = CAMINO. «Sendero» es la definición.'},
 {a:'ARCO',m:'Resta',ik:'quitar la primera letra',
  t:[['El',''],['barco,','mat'],['sin cabeza,','ind'],['sirve para tirar flechas','def']],
  ex:'BARCO «sin cabeza» pierde la primera letra y queda ARCO. «Sirve para tirar flechas» es la definición.'},
 {a:'LUNA',m:'Iniciales',ik:'tomar las iniciales',
  t:[['Satélite:','def'],['al principio,','ind'],['los usuarios nunca aprenden','mat']],
  ex:'Las iniciales de <b>L</b>os <b>U</b>suarios <b>N</b>unca <b>A</b>prenden dan LUNA. «Al principio» es el indicador y «satélite» es la definición.'},
 {a:'UNE',m:'Letras alternas',ik:'tomar una letra sí y otra no',
  t:[['Puente','mat'],['a saltos,','ind'],['junta','def']],
  ex:'«A saltos» pide una letra sí y otra no. En P·<b>U</b>·E·<b>N</b>·T·<b>E</b>, las que ocupan los lugares pares forman UNE. «Junta» es la definición.'},
 {a:'MANO',m:'Traducción',ik:'una traducción',
  t:[['Hombre','mat'],['en Londres,','ind'],['con el oeste,','mat'],['es una extremidad','def']],
  ex:'«Hombre» en Londres es MAN, y «el oeste» es O: <b>MAN</b> + <b>O</b> = MANO. «Una extremidad» es la definición.'},
 {a:'LOSA',m:'Combinada',ik:'dos pasos: dar vuelta y sumar',
  t:[['Sol','mat'],['de espaldas,','ind'],['más la primera vocal:','mat'],['piedra plana','def']],
  ex:'Primero, SOL de espaldas es LOS. Después se suma la primera vocal, A: <b>LOS</b> + <b>A</b> = LOSA. «Piedra plana» es la definición.'},
 {a:'TANGO',m:'Palabra oculta',ik:'una palabra oculta',
  t:[['Cantan gozando','mat'],['y esconden','ind'],['un baile','def']],
  ex:'TANGO se esconde entre las dos palabras: can<b>TAN GO</b>zando. «Esconden» es el indicador y «un baile» es la definición.'},
 {a:'PALTA',m:'Anagrama',ik:'un anagrama',
  t:[['Plata','mat'],['agitada','ind'],['se vuelve',''],['fruta verde','def']],
  ex:'Las letras de PLATA, «agitada», se reordenan en PALTA. «Fruta verde» es la definición.'}
];

MC.MECHS=[['anagrama','Anagrama'],['oculta','Palabra oculta'],['bifronte','Bifronte'],['homofono','Homófono'],['doble','Doble definición'],['charada','Charada'],['insercion','Inserción'],['resta','Resta'],['sustitucion','Sustitución'],['iniciales','Iniciales y finales'],['alternas','Letras alternas'],['traduccion','Traducción'],['combinada','Combinada'],['criptica','Definición críptica']];

MC.COLORS=['#2457d6','#17794d','#c0392b','#b7791f','#7a4fd0','#0f8aa0'];
})(window.MC=window.MC||{});
