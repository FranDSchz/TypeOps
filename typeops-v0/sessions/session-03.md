# Sesión 3 — Procesos, puertos, servicios y logs

**Objetivo:** observar capas de servicio y comunicar una hipótesis verificable. **Prerrequisitos:** sesiones 1–2. **Duración:** 16 min.  
**Materiales:** archivo, registro. **No consultar:** IA ni respuestas antes de intentar. **Sí consultar:** chuleta y pistas.  
**Orden:** F1-04, F2-03, F3-04, F2-04, F4-05 y cierre. Registrá sólo tiempos de sesión; la evaluación se realiza después mediante IA.

## Modelo enseñado

Cliente inicia; servidor escucha/responde; IP identifica interfaz, puerto aplicación y protocolo reglas de intercambio. `ps aux` observa procesos, `ss -ltn` listeners TCP, `systemctl status nombre` estado en systemd y `tail` final de log. Ninguno por sí solo prueba la función completa.

## F1-04 — Componentes de red

**Familia:** F1 · **Objetivo:** leer un destino · **Prerrequisito:** F1-03 · **Herramientas:** modelo · **Ayuda:** pista 1.  
**Ejemplo:** en `http://127.0.0.1:8080/health`, HTTP=protocolo, 127.0.0.1=IP, 8080=puerto, `/health`=path.  
**Contexto:** una herramienta local consulta esa URL.  
**Tarea:** identificá cliente, servidor, protocolo, IP, puerto y recurso solicitado.  
**Formato de respuesta:** una línea con seis pares `etiqueta=valor`.  
**Extensión máxima:** una línea.

## F2-03 — Puerto cerrado

**Familia:** F2 · **Objetivo:** separar causas posibles · **Prerrequisitos:** F1-03/F1-04 · **Herramientas:** observación · **Ayuda:** dos pistas.  
**Modelo mínimo:** sin listener puede haber proceso detenido, otro puerto/interfaz o fallo de arranque; no hay una causa única.  
**Contexto:** curl no conecta a 127.0.0.1:8080 y `ss -ltn` no muestra 8080.  
**Tarea:** proponé dos comprobaciones observacionales y una decisión inmediata condicionada a cada resultado. No reinicies.  
**Formato de respuesta:** dos viñetas `Comprobación → si X, entonces Y`.  
**Extensión máxima:** dos viñetas, una línea cada una.

## F3-04 — Secuencia observacional

**Familia:** F3 · **Objetivo:** construir comandos seguros · **Prerrequisitos:** F3-02/F2-03 · **Herramientas:** chuleta · **Ayuda:** dos pistas.  
**Ejemplo:** `ps aux | grep '[a]pi-demo'` filtra sin modificar; `api-demo` es ficticio.  
**Contexto:** servicio `api-demo`, puerto esperado 8080, log `/tmp/typeops-v0/api.log`.  
**Tarea:** escribí un comando para cada capa —proceso, puerto, estado de servicio y últimas 30 líneas del log— y anotá el límite común de esa evidencia.  
**Formato de respuesta:** cuatro comandos, uno por línea, + una línea `Límite:`.  
**Extensión máxima:** cinco líneas.

## F2-04 — HTTP 500 y correlación

**Familia:** F2 · **Objetivo:** no inventar causa · **Prerrequisitos:** F3-02/F1-04 · **Herramientas:** evidencia incluida · **Ayuda:** pista 1.  
**Modelo mínimo:** HTTP 500 no explica causa; hora, método, path e ID ayudan a correlacionar.  
**Contexto:** 10:14:03, `GET /health`→500, `X-Request-ID: r7`; log: `10:14:03 request_id=r7 dependency timeout`.  
**Tarea:** separá hechos e hipótesis y elegí una comprobación capaz de confirmar o contradecir la hipótesis principal.  
**Formato de respuesta:** tres líneas `Hechos / Hipótesis / Comprobación`.  
**Extensión máxima:** tres líneas.

## F4-05 — Handoff de 60 segundos

**Familia:** F4 · **Objetivo:** transferir estado · **Prerrequisito:** F2-04 · **Herramientas:** notas · **Ayuda:** pista 1.  
**Modelo mínimo:** objetivo, hechos con hora, hipótesis marcada, acción/resultado, próxima acción y propietario.  
**Contexto:** evidencia de F2-04.  
**Tarea:** escribí un handoff con evidencia, hipótesis marcada, próxima comprobación y responsable A, B o C.  
**Formato de respuesta:** cuatro líneas `Hechos / Hipótesis / Próxima acción / Responsable`.  
**Extensión máxima:** cuatro líneas.

## Cierre

Guardá respuestas originales y los únicos campos del usuario; registrá tiempos de sesión. La IA evalúa después con la clave.  
**Práctica externa siguiente:** observar un servicio educativo propio con `ps`, `ss`, petición funcional y logs; no hacer cambios hasta escribir la evidencia esperada.
