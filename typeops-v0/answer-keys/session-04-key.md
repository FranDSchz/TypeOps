# Clave — Sesión 4

## Pistas

- **F1-05 Pista 1:** primera línea del request: método + destino; primera del response: status. **Pista 2:** lo que sigue a `?` es query; tras la línea vacía está el body.
- **F1-06 Pista 1:** presencia de cookie, validez de sesión e permiso son tres preguntas. **Pista 2:** el servidor debe asociar la sesión a Alice y luego comprobar si Alice puede leer el objeto 42.
- **F3-05 Pista 1:** combiná `-i`, `-H`, `-b` y la URL. **Pista 2:** verificá status y contenido/identidad devuelta, no sólo que hubo respuesta.
- **F2-04 repaso Pista 1:** hora e ID correlacionan; `parse error` es señal, todavía necesitás ubicar qué entrada se interpretó.

---

## Rúbricas

### F1-05

- **Elementos esenciales:** método GET; path `/profile`; query `id=42`; request headers Host y Accept; response header Content-Type; status 200; body `{"id":42}`; ninguna parte aislada prueba autorización.
- **Alternativas aceptables:** contar cualquier dos headers bien clasificados.
- **Errores frecuentes:** query incluida en path sin distinguir; confundir header/body; asumir 200=autorizado.
- **Tipo de error:** recuperación incompleta; interpretación; confusión conceptual.
- **Explicación:** HTTP describe intercambio; la política de acceso requiere contexto de identidad y objeto.
- **Criterio de verificación:** etiqueta cada componente y declara el límite de 200.
- **Siguiente recomendada:** componentes→reintento con el ejemplo; autorización→F1-06.

### F1-06

- **Elementos esenciales:** validar cookie/token de sesión, vigencia e identidad Alice; después comprobar permiso de Alice para objeto 42/propiedad/política; cookie sola no prueba sesión válida, identidad ni autorización.
- **Alternativas aceptables:** mencionar autenticación por otro mecanismo si conserva separación.
- **Errores frecuentes:** cookie=autenticado; autenticado=autorizado; confiar en ID enviado por cliente.
- **Tipo de error:** confusión conceptual.
- **Explicación:** identidad responde “quién”; autorización responde “puede hacer qué sobre cuál objeto”.
- **Criterio de verificación:** incluye un control de objeto del lado servidor.
- **Siguiente recomendada:** error/pista→F1-06V; correcto→F3-05.

### F3-05

- **Elementos esenciales:** `curl -i -H "Accept: application/json" -b "session=demo-alice" "http://127.0.0.1:8080/profile?id=42"`; verificar status y body/identidad/campos esperados.
- **Alternativas aceptables:** `-H "Cookie: session=demo-alice"`; opciones en otro orden; `--include`, `--cookie`.
- **Errores frecuentes:** URL sin comillas; cookie como query; omitir `-i`; verificar sólo conexión.
- **Tipo de error:** sintaxis; verificación omitida; fricción mecánica.
- **Explicación:** el comando expresa intención; la respuesta aún debe compararse con política y esperado.
- **Criterio de verificación:** petición equivalente y dos evidencias, sin exigir texto idéntico.
- **Siguiente recomendada:** sintaxis→reconstrucción contextual; verificación→F3-05V; correcto→F2-05.

### F2-04 — reaparición

- **Elementos esenciales:** hechos: POST/login=500, hora/ID, línea correlacionada `parse error`; hipótesis: formato/entrada no pudo interpretarse; comprobar request/body/content-type o líneas vecinas por q2.
- **Alternativas aceptables:** repetir petición conocida válida y comparar.
- **Errores frecuentes:** declarar credenciales malas o bug sin evidencia; reiniciar.
- **Tipo de error:** interpretación; siguiente acción débil.
- **Explicación:** la misma técnica de correlación se transfiere a otra ruta y otra señal.
- **Criterio de verificación:** conserva hechos/hipótesis y propone contraste.
- **Siguiente recomendada:** si volvió a fallar, repasar F2-04 antes de avanzar; si no, sesión 5.

