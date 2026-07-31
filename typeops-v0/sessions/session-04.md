# Sesión 4 — HTTP, cookies, identidad y permisos

**Objetivo:** leer HTTP y construir una petición local distinguiendo autenticación de autorización. **Prerrequisitos:** sesiones 1–3. **Duración:** 16 min.  
**Materiales:** archivo y registro. **No consultar:** IA/clave en primer intento. **Sí consultar:** modelos, chuleta curl y pistas.  
**Orden:** F1-05 (4), F1-06 (4), F3-05 (4), F2-04 repaso (2), cierre (2).

## Modelo enseñado

Request = método, destino, headers y a veces body. Response = status, headers y body. Path identifica recurso; query aparece tras `?`. Autenticación establece identidad; sesión conserva estado; cookie puede transportar un identificador; autorización decide permiso para acción/objeto.

## F1-05 — Anatomía HTTP

**Familia:** F1 · **Objetivo:** etiquetar intercambio · **Prerrequisito:** F1-04 · **Herramientas:** modelo · **Ayuda:** dos pistas.  
**Ejemplo:** `GET /items?page=2 HTTP/1.1`: método GET, path `/items`, query `page=2`.  
**Contexto:** request `GET /profile?id=42 HTTP/1.1`, `Host: example.test`, `Accept: application/json`; response `HTTP/1.1 200 OK`, `Content-Type: application/json`, body `{"id":42}`.  
**Consigna:** identificá método, path, query, dos headers, status y body. Decí qué parte no demuestra autorización.  
**Producí:** etiquetas, límite de evidencia y confianza.

## F1-06 — Identidad y permiso

**Familia:** F1 · **Objetivo:** separar cookie/sesión/autorización · **Prerrequisito:** F1-05 · **Herramientas:** modelo · **Ayuda:** dos pistas.  
**Ejemplo:** cookie válida puede autenticar a Alice, no autorizar perfil privado de Bob.  
**Contexto:** Alice envía `Cookie: session=demo-alice` y pide `/profile?id=42` de Bob.  
**Consigna:** qué debe comprobar el servidor para autenticación y autorización; qué no concluye la mera cookie.  
**Producí:** separación de identidad/sesión/permiso, confianza y confusión si existió.

## F3-05 — Construcción con curl

**Familia:** F3 · **Objetivo:** traducir intención a petición · **Prerrequisitos:** F1-05/F1-06 · **Herramientas:** chuleta · **Ayuda:** dos pistas.  
**Chuleta:** `-i` muestra headers de respuesta; `-H` agrega header; `-b` envía cookie; la URL lleva path/query.  
**Ejemplo:** `curl -i -H "Accept: application/json" "http://127.0.0.1:8080/items?page=2"`.  
**Contexto:** laboratorio local autorizado; pedir perfil 42 como Alice y ver headers.  
**Consigna:** construí el curl con Accept JSON y cookie `session=demo-alice`; nombrá dos elementos de respuesta a verificar.  
**Producí:** comando, verificaciones y confianza.

## F2-04 — Repaso de correlación (2 min)

**Familia:** F2 · **Objetivo:** transferir HTTP a logs · **Prerrequisito:** F1-05 · **Herramientas:** evidencia · **Ayuda:** pista 1.  
**Contexto:** request `POST /login`, 11:02:10, ID `q2`, status 500; log `11:02:10 request_id=q2 parse error`.  
**Consigna:** escribí dos hechos, una hipótesis y la siguiente comprobación.  
**Producí:** cuatro líneas y confianza. Evaluá con la misma rúbrica F2-04; es una reaparición contextual, no una actividad nueva.

## Cierre (2 min)

Evaluá y aplicá una regla manual. Si el error fue mecánico en `-H`, comillas o `?`, repetí sólo el comando completo durante máximo tres minutos.  
**Práctica externa siguiente:** módulos introductorios de HTTP de PortSwigger Web Security Academy y peticiones a un laboratorio autorizado.

