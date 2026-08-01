# Sesión 4 — HTTP, cookies, identidad y permisos

**Objetivo:** leer HTTP y construir una petición local distinguiendo autenticación de autorización. **Prerrequisitos:** sesiones 1–3. **Duración:** 16 min.  
**Materiales:** archivo y registro. **No consultar:** IA/clave en primer intento. **Sí consultar:** modelos, chuleta curl y pistas.  
**Orden:** F1-05, F1-06, F3-05, F2-04 repaso y cierre. Registrá sólo tiempos de sesión; la evaluación se realiza después mediante IA.

## Modelo enseñado

Request = método, destino, headers y a veces body. Response = status, headers y body. Path identifica recurso; query aparece tras `?`. Autenticación establece identidad; sesión conserva estado; cookie puede transportar un identificador; autorización decide permiso para acción/objeto.

## F1-05 — Anatomía HTTP

**Familia:** F1 · **Objetivo:** etiquetar intercambio · **Prerrequisito:** F1-04 · **Herramientas:** modelo · **Ayuda:** dos pistas.  
**Ejemplo:** `GET /items?page=2 HTTP/1.1`: método GET, path `/items`, query `page=2`.  
**Contexto:** request `GET /profile?id=42 HTTP/1.1`, `Host: example.test`, `Accept: application/json`; response `HTTP/1.1 200 OK`, `Content-Type: application/json`, body `{"id":42}`.  
**Tarea:** identificá método, path, query, dos headers, status y body; indicá por qué ninguna parte aislada demuestra autorización.  
**Formato de respuesta:** una línea de etiquetas + una línea `Límite:`.  
**Extensión máxima:** dos líneas.

## F1-06 — Identidad y permiso

**Familia:** F1 · **Objetivo:** separar cookie/sesión/autorización · **Prerrequisito:** F1-05 · **Herramientas:** modelo · **Ayuda:** dos pistas.  
**Ejemplo:** cookie válida puede autenticar a Alice, no autorizar perfil privado de Bob.  
**Contexto:** Alice envía `Cookie: session=demo-alice` y pide `/profile?id=42` de Bob.  
**Tarea:** indicá qué debe validar el servidor para establecer identidad/sesión, qué debe comprobar para autorizar el objeto y qué no prueba la mera cookie.  
**Formato de respuesta:** tres líneas `Identidad/sesión / Autorización / La cookie no prueba`.  
**Extensión máxima:** tres líneas.

## F3-05 — Construcción con curl

**Familia:** F3 · **Objetivo:** traducir intención a petición · **Prerrequisitos:** F1-05/F1-06 · **Herramientas:** chuleta · **Ayuda:** dos pistas.  
**Chuleta:** `-i` muestra headers de respuesta; `-H` agrega header; `-b` envía cookie; la URL lleva path/query.  
**Ejemplo:** `curl -i -H "Accept: application/json" "http://127.0.0.1:8080/items?page=2"`.  
**Contexto:** laboratorio local autorizado; pedir perfil 42 como Alice y ver headers.  
**Tarea:** construí el curl con Accept JSON y cookie `session=demo-alice`, y nombrá dos elementos de la respuesta que verificarías.  
**Formato de respuesta:** comando + dos viñetas de verificación.  
**Extensión máxima:** tres líneas.

## F2-04 — Repaso de correlación

**Familia:** F2 · **Objetivo:** transferir HTTP a logs · **Prerrequisito:** F1-05 · **Herramientas:** evidencia · **Ayuda:** pista 1.  
**Contexto:** request `POST /login`, 11:02:10, ID `q2`, status 500; log `11:02:10 request_id=q2 parse error`.  
**Tarea:** escribí dos hechos, una hipótesis marcada y una comprobación que pueda confirmarla o contradecirla.  
**Formato de respuesta:** cuatro líneas `Hecho / Hecho / Hipótesis / Comprobación`.  
**Extensión máxima:** cuatro líneas. La IA usa la misma rúbrica F2-04; es una reaparición, no una actividad nueva.

## Cierre

Guardá respuestas y registro mínimo. Si reportaste fricción al escribir en `-H`, comillas o `?`, la IA podrá recomendar repetir el comando completo durante máximo tres minutos.  
**Práctica externa siguiente:** módulos introductorios de HTTP de PortSwigger Web Security Academy y peticiones a un laboratorio autorizado.
