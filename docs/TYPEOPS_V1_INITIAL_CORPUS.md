# TypeOps V1 — Corpus inicial

## 1. Decisión de tamaño

El pack inicial tendrá **40 registros de contenido**:

- 10 fragmentos de typing técnico;
- 10 comandos desde intención;
- 12 actividades de repaso/decisión;
- 8 prácticas guiadas reanudables.

Es suficiente para validar todos los flujos y reglas de adaptación, pero no pretende cubrir el currículo CTF. Las prácticas guiadas enseñan grupos pequeños de comandos relacionados; cada comando dentro del grupo recibe modelo, sintaxis descompuesta, ejemplo y una intervención guiada antes de aparecer sin ayuda.

El pack se identifica como `typeops-foundations-es-ar` versión `1.0.0`. Toda referencia a Attack-Defense general se etiqueta `standard_model`; sólo fecha, presencialidad, modalidad, tamaño del equipo y permiso de Internet/IA pueden marcarse como hechos confirmados de Cyber War.

## 2. Reglas editoriales

- Lenguaje directo para principiante absoluto.
- Contexto máximo de 500 caracteres; tarea en una formulación.
- Respuesta máxima: un comando, una selección + una línea, o hasta tres viñetas.
- Una actividad nueva no se recomienda fuera de guided hasta cumplir sus prerrequisitos.
- Comandos, requests y fragmentos deben ser técnicamente válidos, pero nunca se ejecutan.
- Sólo `localhost`, `127.0.0.1`, `example.test` y archivos/servicios ficticios.
- No usar `rm`, escritura privilegiada, modificación de servicios, payloads destructivos ni credenciales reales.
- No evaluar coincidencia textual cuando el pack declara alternativas válidas.
- Las categorías de vulnerabilidad pueden ocultarse sólo en variantes posteriores.
- Copiar un fragmento mide mecánica; no demuestra que el usuario comprenda el comando.

## 3. Unidades y prerrequisitos

| Unidad | Contenido mínimo | Prerrequisitos |
|---|---|---|
| `ad-evidence` | ataque, defensa, disponibilidad; hecho/hipótesis/resultado; verificación | ninguno |
| `linux-navigation` | `pwd`, `ls`, `cd`; rutas absolutas/relativas | ninguno |
| `linux-reading` | `cat`, `less`, `head`, `tail` | navegación |
| `linux-search` | `grep`, `find` | navegación y lectura |
| `shell-composition` | comillas, variables, pipe y redirección básica | lectura y búsqueda |
| `service-observation` | proceso, listener, servicio, función y logs; `ps`, `ss`, `systemctl status`, `journalctl` | lectura y pipe |
| `http-foundations` | request/response, método, path, query, status y headers | ninguno |
| `http-state-access` | cookie/sesión, autenticación/autorización | HTTP foundations |
| `curl-basics` | request GET local/ficticio, headers y cookie | HTTP foundations |
| `access-control-intro` | comparación de identidades, BAC/IDOR, política esperada | HTTP state/access y curl |
| `python-minimum` | variables, lista/dict, argumentos/datos, loop, print, request simple, validación/error básico | HTTP foundations |
| `critical-ai-use` | contexto, hechos/hipótesis, salida verificable y revisión | ad-evidence |

SQL está soportado por el esquema de typing, pero se posterga del pack inicial porque no es prerrequisito de las unidades elegidas. Se agrega sólo cuando haya sido enseñado externamente o exista evidencia de utilidad.

## 4. Modo 1 — 10 fragmentos de typing

Cada target debe incluir una nota de validez técnica y las secuencias mecánicas realmente presentes.

| ID | Target o forma del target | Unidad | Objetivo mecánico/contextual |
|---|---|---|---|
| `TYP-01` | `pwd` seguido de `ls -la /srv/demo` en dos líneas | navegación | espacios, guion y ruta absoluta |
| `TYP-02` | `cd ../config` y `cd /srv/demo/config` | navegación | puntos, barras y rutas relativas/absolutas |
| `TYP-03` | `tail -n 50 /var/log/demo/app.log` | lectura | opción, número, barras y puntos |
| `TYP-04` | `grep -n "ERROR" /var/log/demo/app.log` | búsqueda | comillas, mayúsculas y opción |
| `TYP-05` | `find /srv/demo -type f -name "*.conf"` | búsqueda | asterisco, comillas y varias opciones |
| `TYP-06` | `grep "request_id=z9" app.log | tail -n 5` | shell | comillas, igual, pipe y encadenamiento válido |
| `TYP-07` | `ss -ltn` y `systemctl status demo.service --no-pager` | servicios | guiones, punto y secuencia de flags |
| `TYP-08` | request HTTP de tres líneas a `GET /profile?id=10 HTTP/1.1`, Host y Cookie ficticia | HTTP | `?`, `=`, `:`, `/`, saltos de línea |
| `TYP-09` | `curl -i -H "Cookie: session=demo-alice" "http://example.test/profile?id=10"` | curl | comillas, dos puntos, URL y query |
| `TYP-10` | fragmento Python de 4 líneas: lista de status, loop e impresión de cada valor | Python | indentación, corchetes, dos puntos y paréntesis |

Reglas especiales:

- `TYP-01` y `TYP-02` sólo son elegibles tras empezar `GUI-01`.
- Los restantes requieren que la unidad correspondiente esté al menos `practicing`.
- `TYP-08` usa una cookie de demostración y nunca se envía.
- La app no modifica targets para insertar una secuencia mecánica; el selector busca coincidencias existentes.

## 5. Modo 2 — 10 comandos desde intención

Todos poseen alternativas curadas, casos de evaluación y `unrecognizedPolicy=needs_review`.

| ID | Intención | Respuesta canónica | Alternativas/diagnóstico principal |
|---|---|---|---|
| `CMD-01` | Mostrar el directorio actual | `pwd` | sólo variaciones de espacios exteriores |
| `CMD-02` | Listar detalles y archivos ocultos de `/srv/demo` | `ls -la /srv/demo` | aceptar `ls -al /srv/demo`; comprobar herramienta/opciones/ruta |
| `CMD-03` | Ir desde `/srv/demo/app` a `/srv/demo/config` con ruta relativa | `cd ../config` | evaluar `cd` y ruta; la absoluta no satisface la intención relativa |
| `CMD-04` | Mostrar las últimas 50 líneas del log ficticio | `tail -n 50 /var/log/demo/app.log` | aceptar `tail -50 ...` sólo si se documenta y prueba como alternativa soportada |
| `CMD-05` | Buscar líneas con `ERROR` y mostrar número de línea | `grep -n "ERROR" /var/log/demo/app.log` | aceptar comillas simples; separar `grep`, `-n`, patrón y archivo |
| `CMD-06` | Encontrar archivos `.conf` bajo `/srv/demo` | `find /srv/demo -type f -name "*.conf"` | aceptar comillas simples; exigir scope, tipo y patrón |
| `CMD-07` | Filtrar `request_id=z9` y quedarse con las últimas 5 coincidencias | `grep "request_id=z9" app.log \| tail -n 5` | evaluar dos herramientas, pipe y orden |
| `CMD-08` | Mostrar listeners TCP numéricos sin resolver servicios | `ss -ltn` | aceptar orden equivalente de flags declarado; no exigir herramienta externa |
| `CMD-09` | Ver 50 entradas recientes del servicio ficticio sin paginador | `journalctl -u demo.service -n 50 --no-pager` | estructura por fragmentos; respuesta plausible no reconocida queda pendiente |
| `CMD-10` | Pedir headers y body del perfil 10 con cookie ficticia | `curl -i -H "Cookie: session=demo-alice" "http://example.test/profile?id=10"` | aceptar comillas simples; no ejecutar ni usar destino externo |

Prerrequisito editorial: cada comando debe haber aparecido en la práctica guiada asociada. `CMD-08` y `CMD-09` no se habilitan hasta completar la parte correspondiente de `GUI-05`.

## 6. Modo 3 — 12 actividades de repaso y decisiones

| ID | Tipo | Tarea resumida | Habilidad/evaluación |
|---|---|---|---|
| `REV-01` | exacta | Distinguir ataque, defensa y disponibilidad en tres acciones | selección local; modelo estándar |
| `REV-02` | decisión | Separar hecho confirmado, dato preliminar e hipótesis del reglamento | clasificación local; evita rumores |
| `REV-03` | decisión | Con proceso, listener y `/health=503`, elegir qué se sabe y próxima prueba | elección local + justificación pendiente; alcance de evidencia |
| `REV-04` | exacta | Identificar método, path, query y status en request/response | campos estructurados locales |
| `REV-05` | exacta | Ordenar cookie presente → sesión validada → identidad → autorización | pasos ordenados locales |
| `REV-06` | decisión | Alice accede a su perfil y Bob al suyo: elegir matriz mínima de comparación | elección y evidencia requerida |
| `REV-07` | decisión | Alice recibe 200 para un perfil público de Bob: decidir si basta para IDOR | evita falso positivo; política esperada |
| `REV-08` | decisión | Perfil privado ajeno devuelve datos con sesión de Alice | identificación preliminar BAC/IDOR, categoría inicialmente visible |
| `REV-09` | decisión | Tras un parche: ajeno=403, propio=403, health=200 | seguridad frente a regresión funcional |
| `REV-10` | abierta breve | Escribir handoff: hecho, hipótesis, próxima acción y evidencia esperada | rúbrica local, revisión posterior |
| `REV-11` | decisión | Criticar una IA que inventa que `demo-check --json-status` existe | supuesto, ayuda/versión local, salida verificable |
| `REV-12` | exacta | Leer un Python corto y predecir qué status imprime y cuándo informa error | interpretación de variables/lista/loop/validación |

Variantes incluidas dentro de estos 12 registros, no adicionales:

- `REV-03` es variante operacional del modelo proceso/listener/función de V0.
- `REV-07` contrasta `REV-08` sin cambiar sólo nombres o IDs.
- `REV-09` contrasta “seguro pero roto” con un cambio válido.
- Una revisión futura puede ocultar la categoría de `REV-08` sólo cuando `access-control-intro` esté `ready_for_assessment`.

Las abiertas no bloquean. `REV-10` produce estado `pending_review`; la selección estructurada de otras decisiones se evalúa aunque su justificación quede pendiente.

## 7. Modo 4 — 8 prácticas guiadas

Cada registro contiene seis etapas y puede reanudarse. Cuando agrupa comandos, la etapa de sintaxis tiene una ficha y la guiada una intervención para cada comando antes de combinarlos.

| ID | Unidad | Contenido que enseña | Ejercicio sin ayuda | Variante posterior |
|---|---|---|---|---|
| `GUI-01` | navegación | `pwd`, `ls`, `cd`, absoluta/relativa | elegir y escribir el comando para ubicarse, listar e ir a una ruta indicada | `CMD-03` |
| `GUI-02` | lectura | `cat`, `less`, `head`, `tail`; archivo pequeño vs salida acotada/paginada | pedir últimas 50 líneas sin alterar archivo | `CMD-04` |
| `GUI-03` | búsqueda | `grep`, `find`; contenido vs nombre/ruta | elegir herramienta y construir una búsqueda | `CMD-05` o `CMD-06` según error |
| `GUI-04` | shell | comillas/variables, pipe y redirección básica; flujo stdin/stdout | construir filtro con pipe y explicar qué recibe cada etapa | `CMD-07` |
| `GUI-05` | servicios | proceso, puerto, servicio, función y log; `ps`, `ss`, `systemctl status`, `journalctl` como observación | elegir primera observación y evidencia esperada, sin reiniciar | `REV-03` o `CMD-09` |
| `GUI-06` | HTTP/curl | request/response y partes de `curl -i`, `-H`, URL/query/cookie | construir GET ficticio y nombrar status/body a verificar | `CMD-10` |
| `GUI-07` | Python mínimo | variable, lista/dict, loop, print, lectura simple, request conceptual, validación y `try/except` elemental | completar script corto que recorre resultados e informa valores inválidos | `REV-12` |
| `GUI-08` | evidencia e IA | ataque/defensa/disponibilidad; hecho/hipótesis/resultado; contexto y verificación de IA | elegir próxima acción segura y dos comprobaciones de una sugerencia | `REV-11` |

`GUI-07` no debe enseñar una biblioteca HTTP completa. Usa una petición sencilla a `http://example.test/health` sólo como fragmento inerte y explica que V1 no la ejecuta. El manejo de errores se limita a informar fallo y preservar evidencia.

## 8. Cobertura del alcance prioritario

| Tema | Registros principales |
|---|---|
| navegación, archivos, rutas | GUI-01/02, TYP-01/02/03, CMD-01/02/03/04 |
| lectura y búsqueda | GUI-02/03, TYP-03/04/05, CMD-04/05/06 |
| comillas, variables, pipes, redirección | GUI-04, TYP-06, CMD-07 |
| procesos, puertos, servicios, logs | GUI-05, TYP-07, CMD-08/09, REV-03 |
| HTTP y curl | GUI-06, TYP-08/09, CMD-10, REV-04 |
| cookies, sesión, autenticación, autorización | GUI-06, REV-05/06 |
| BAC e IDOR introductorios | REV-07/08/09 |
| Python mínimo | GUI-07, TYP-10, REV-12 |
| Attack-Defense y verificación | GUI-08, REV-01/02/03/09/10 |
| uso crítico de IA | GUI-08, REV-11 |

## 9. Casos de prueba editoriales del corpus

Cada item de comando incluye al menos:

- dos respuestas correctas cuando hay una alternativa real relevante, o una justificación de respuesta única;
- un caso con herramienta incorrecta;
- un caso con herramienta correcta y estructura incompleta;
- un caso con sintaxis incorrecta;
- un caso plausible no reconocido que debe quedar `needs_review` cuando corresponda.

Cada decisión incluye:

- evidencia entregada;
- opción correcta y por qué;
- qué no permite concluir;
- error causal esperado por distractor;
- criterio de verificación.

Cada práctica guiada incluye:

- modelo mínimo sin jerga no explicada;
- sintaxis descompuesta de cada comando nuevo;
- ejemplo plausible;
- ayuda graduada;
- ejercicio sin solución visible;
- variante que no introduce tema nuevo.

## 10. Criterio para ampliar el corpus

Agregar contenido sólo cuando ocurra al menos una condición:

- el tutor o laboratorio enseñó una unidad que conviene conservar;
- una debilidad aparece con muestra suficiente y no hay fragmento coherente;
- un error recurrente carece de variante;
- las 40 actividades ya no proporcionan variedad suficiente;
- se confirma una regla competitiva relevante.

No ampliar sólo para “cubrir más vulnerabilidades”. Todo lote nuevo debe declarar la evidencia que motivó su creación y pasar validación editorial.
