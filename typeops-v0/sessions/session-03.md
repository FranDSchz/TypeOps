# Sesión 3 — Procesos, puertos, servicios y logs

**Objetivo:** observar capas de servicio y comunicar una hipótesis verificable. **Prerrequisitos:** sesiones 1–2. **Duración:** 16 min.  
**Materiales:** archivo, registro. **No consultar:** IA ni respuestas antes de intentar. **Sí consultar:** chuleta y pistas.  
**Orden:** F1-04 (2), F2-03 (3), F3-04 (4), F2-04 (3), F4-05 (2), cierre (2).

## Modelo enseñado

Cliente inicia; servidor escucha/responde; IP identifica interfaz, puerto aplicación y protocolo reglas de intercambio. `ps aux` observa procesos, `ss -ltn` listeners TCP, `systemctl status nombre` estado en systemd y `tail` final de log. Ninguno por sí solo prueba la función completa.

## F1-04 — Componentes de red

**Familia:** F1 · **Objetivo:** leer un destino · **Prerrequisito:** F1-03 · **Herramientas:** modelo · **Ayuda:** pista 1.  
**Ejemplo:** en `http://127.0.0.1:8080/health`, HTTP=protocolo, 127.0.0.1=IP, 8080=puerto, `/health`=path.  
**Contexto:** una herramienta local consulta esa URL. **Consigna:** identificá cliente, servidor, protocolo, IP, puerto y recurso.  
**Producí:** seis etiquetas, confianza y par confundido si lo hubo.

## F2-03 — Puerto cerrado

**Familia:** F2 · **Objetivo:** separar causas posibles · **Prerrequisitos:** F1-03/F1-04 · **Herramientas:** observación · **Ayuda:** dos pistas.  
**Modelo mínimo:** sin listener puede haber proceso detenido, otro puerto/interfaz o fallo de arranque; no hay una causa única.  
**Contexto:** curl no conecta a 127.0.0.1:8080 y `ss -ltn` no muestra 8080.  
**Consigna:** proponé dos comprobaciones y qué concluirías según sus resultados. No reinicies.  
**Producí:** comprobaciones condicionales, confianza y cualquier salto causal.

## F3-04 — Secuencia observacional

**Familia:** F3 · **Objetivo:** construir comandos seguros · **Prerrequisitos:** F3-02/F2-03 · **Herramientas:** chuleta · **Ayuda:** dos pistas.  
**Ejemplo:** `ps aux | grep '[a]pi-demo'` filtra sin modificar; `api-demo` es ficticio.  
**Contexto:** servicio `api-demo`, puerto esperado 8080, log `/tmp/typeops-v0/api.log`.  
**Consigna:** escribí cuatro comandos para proceso, puerto, estado de servicio y últimas 30 líneas del log. Para cada uno, qué demuestra y qué no.  
**Producí:** cuatro comandos con límites y confianza.

## F2-04 — HTTP 500 y correlación

**Familia:** F2 · **Objetivo:** no inventar causa · **Prerrequisitos:** F3-02/F1-04 · **Herramientas:** evidencia incluida · **Ayuda:** pista 1.  
**Modelo mínimo:** HTTP 500 no explica causa; hora, método, path e ID ayudan a correlacionar.  
**Contexto:** 10:14:03, `GET /health`→500, `X-Request-ID: r7`; log: `10:14:03 request_id=r7 dependency timeout`.  
**Consigna:** separá hechos/hipótesis y elegí una comprobación que confirme o contradiga la principal.  
**Producí:** lista breve, prueba discriminante y confianza.

## F4-05 — Handoff de 60 segundos

**Familia:** F4 · **Objetivo:** transferir estado · **Prerrequisito:** F2-04 · **Herramientas:** notas · **Ayuda:** pista 1.  
**Modelo mínimo:** objetivo, hechos con hora, hipótesis marcada, acción/resultado, próxima acción y propietario.  
**Contexto:** evidencia de F2-04. **Consigna:** escribí un handoff legible en menos de 60 segundos y asigná la comprobación a A, B o C.  
**Producí:** mensaje accionable, confianza y campo faltante si lo hubo.

## Cierre (2 min)

Evaluá, elegí un error causal y una sola regla de adaptación de la plantilla.  
**Práctica externa siguiente:** observar un servicio educativo propio con `ps`, `ss`, petición funcional y logs; no hacer cambios hasta escribir la evidencia esperada.

