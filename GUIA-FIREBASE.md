# Cómo conectar Cripteando a Firebase

Con Firebase funcionan el inicio de sesión (Google, o email y contraseña), la clasificación, los grupos, el envío de pistas, los comentarios y la sincronización del progreso entre dispositivos.

Sin Firebase, la página igual se puede jugar: cada persona guarda su progreso en su propio dispositivo, y la clasificación y los grupos muestran "llega pronto".

Todo lo de esta guía se hace desde la web y es gratis. Tardás unos 20 minutos.

---

## 1. Crear el proyecto

1. Entrá a <https://console.firebase.google.com> con tu cuenta de Google.
2. Tocá **Crear un proyecto** y ponele un nombre, por ejemplo `mate-criptico`.
3. Cuando te pregunte por **Google Analytics**, desactivalo. No hace falta.
4. Esperá a que termine y tocá **Continuar**.

## 2. Registrar la página web

1. En la pantalla del proyecto, tocá el ícono **`</>`** (Web).
2. En "Sobrenombre de la app" escribí `Cripteando`. **No** marques "Firebase Hosting": la página ya está en GitHub Pages.
3. Tocá **Registrar app**. Firebase te muestra un bloque de código con `firebaseConfig = { apiKey: "...", ... }`.
4. Abrí el archivo `js/config.js` y copiá cada valor en su lugar. Te tiene que quedar así, con tus datos:

   ```js
   window.MC_FIREBASE={
     apiKey:'AIza...',
     authDomain:'mate-criptico.firebaseapp.com',
     projectId:'mate-criptico',
     storageBucket:'mate-criptico.appspot.com',
     messagingSenderId:'1234567890',
     appId:'1:1234567890:web:abc123'
   };
   ```

> **¿Es peligroso que esos datos estén a la vista en GitHub?** No. Esa configuración es pública por diseño: solo dice a qué proyecto conectarse. Lo que protege los datos son las **reglas de seguridad** del paso 5.

## 3. Activar el inicio de sesión

1. En el menú de la izquierda: **Compilación → Authentication → Comenzar**.
2. En la pestaña **Método de acceso**:
   - Tocá **Correo electrónico/contraseña**, activá la primera opción y guardá.
   - Tocá **Google**, activalo, elegí tu email como "correo de asistencia" y guardá.
3. En la pestaña **Configuración → Dominios autorizados**, tocá **Agregar dominio** y sumá:
   - `awaddda.github.io`
   - tu dominio propio, cuando lo tengas (por ejemplo `cripteando.eu.org`).

   Sin esto, el botón "Entrar con Google" muestra "Este dominio todavía no está autorizado".
4. Opcional: en **Plantillas** podés traducir al español los emails de "confirmá tu dirección" y "cambiá tu contraseña", y cambiar el nombre del remitente.

## 4. Crear la base de datos

1. En el menú: **Compilación → Firestore Database → Crear base de datos**.
2. Ubicación: elegí **`southamerica-east1` (São Paulo)**, que es la más cercana a Argentina. No se puede cambiar después.
3. Elegí **Iniciar en modo de producción** y tocá **Crear**.

## 5. Pegar las reglas de seguridad

Las reglas deciden quién puede leer y escribir cada cosa. Sin ellas, cualquiera podría borrar la clasificación.

1. En **Firestore Database**, abrí la pestaña **Reglas**.
2. Borrá todo lo que haya y pegá el contenido completo del archivo `firestore.rules` de este proyecto.
3. Tocá **Publicar**.

Qué protegen, en resumen:

| Datos | Quién puede leer | Quién puede escribir |
|---|---|---|
| Clasificación (`players`, `results`) | Todos | Solo cada jugador, lo suyo. Los resultados son solo de la pista del día, y una vez publicados no se pueden cambiar los intentos ni las ayudas |
| Progreso en la nube (`saves`) | Solo su dueño | Solo su dueño |
| Nombres de usuario (`usernames`) | Todos, para saber si están ocupados | Cada uno reserva el suyo. Nadie puede quitarle el nombre a otro |
| Grupos (`groups`, `members`) | Todos | El dueño cambia el grupo. Cada integrante maneja solo su propia membresía |
| Votos (`votes`) | Todos | Uno por jugador y por pista |
| Pistas enviadas (`submissions`) y comentarios (`feedback`) | Nadie desde la página: solo vos, desde la consola | Cualquiera con sesión iniciada, con límites de largo |

## 6. Subir los cambios

En la Terminal:

```
cd ~/Documents/Claude-Code/mate-criptico
git add -A
git commit -m "Conectar Firebase"
git push
```

En uno o dos minutos, GitHub Pages actualiza la página.

## 7. Probar que todo funcione

En <https://awaddda.github.io/cripteando/>:

- [ ] En **Cuenta**, crear una cuenta con nombre de usuario, email y contraseña.
- [ ] Cerrar sesión y volver a entrar con esa contraseña.
- [ ] Probar "¿Olvidaste tu contraseña?" y que llegue el email (revisá el correo no deseado).
- [ ] Entrar con Google desde otra pestaña privada o desde el celular.
- [ ] Resolver la pista de hoy y verla en **Clasificación → Hoy**.
- [ ] Subir una foto de perfil y verla en la clasificación.
- [ ] Crear un grupo, copiar el código y unirse desde la otra cuenta.
- [ ] En el celular, entrar con la misma cuenta y ver la misma racha.
- [ ] Mandar una pista desde **Enviar** y un comentario desde **Cuenta**.

Si algo no anda, abrí la consola del navegador (clic derecho → Inspeccionar → Consola) y mandame lo que aparezca en rojo.

## 8. El día a día

### Administrar las pistas
Todo se hace desde la página, con tu cuenta: **Cuenta → Administración → Administrar pistas**. Funciona desde cualquier compu o celular.

- **Nueva pista:** se agrega al final, en el día siguiente a la última programada. El editor verifica solo los anagramas, las palabras ocultas, las lecturas al revés y las iniciales, y muestra una vista previa como la ven los jugadores.
- **Editar:** tocá cualquier pista de la lista. Si ya salió, ojo: cambiar la respuesta borra el progreso de quienes la jugaron.
- **Borrar:** solo las que todavía no salieron. Ese día queda sin pista hasta que cargues otra.
- **Pistas enviadas:** con **Pasar al editor** la convertís en la próxima pista. Al guardarla queda marcada como aceptada. También podés rechazarla.
- **Comentarios:** se leen en la misma pantalla.
- **Descargar copia:** baja un `banco.js` con todas las pistas. Guardalo en Drive cada tanto: es tu respaldo.

Las pistas viven en Firestore, codificadas. Las reglas solo dejan leer la de hoy y las anteriores, salvo a tu cuenta.

### Ver quién se registró
**Authentication → Usuarios**. Desde ahí también podés deshabilitar o borrar una cuenta.

## 9. Límites del plan gratis (Spark)

Por día: 50.000 lecturas, 20.000 escrituras y 20.000 borrados. Cada visita que abre la Clasificación lee hasta unos 100 documentos, así que el plan gratis alcanza para varios cientos de jugadores diarios.

Para ver el consumo: **Firestore Database → Uso**. Si te acercás al límite, se puede pasar al plan Blaze, de pago por uso, que mantiene la misma cuota gratis y cobra solo lo que pase de ahí. Si lo hacés, poné una alerta de presupuesto.

## 10. Lo que todavía no protege nadie

Los resultados se calculan en el navegador del jugador. Las reglas impiden publicar resultados de otro día o cambiarlos después, pero alguien que sepa programar podría publicar "lo resolví al primer intento" sin haberlo jugado.

Evitarlo requiere que un servidor verifique la respuesta (Cloud Functions, que necesita el plan Blaze). Para una página entre amigos y conocidos, no suele hacer falta.
