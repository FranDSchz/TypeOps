# Sesión 6 — Python mínimo, IA supervisada e integración

**Objetivo:** leer automatización pequeña, decidir cuándo consultar IA y validar sus propuestas. **Prerrequisitos:** sesiones 1–5 y una introducción breve a Python. **Duración:** 16–18 min.  
**Materiales:** archivo y registro. No hace falta ejecutar ni instalar `requests`. **No consultar:** IA real para responder. **Sí consultar:** modelos, fragmento y pistas.  
**Orden:** F3-06 (5), F2-06 (3), F4-04 (4), F4-05 (2), cierre (2).

## Modelo Python enseñado

Variable guarda un valor; lista varios; diccionario asocia claves/valores; `for` repite; `if` valida; `try/except` maneja un fallo esperado; `sys.argv` lee argumentos. Una respuesta 200 no prueba por sí sola toda la función.

```python
import sys
import requests

base_url = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8080"
paths = ["/health", "/version"]

for path in paths:
    try:
        response = requests.get(base_url + path, timeout=2)
        ok = ______________________________
        result = {"path": path, "status": response.status_code, "ok": _____}
        print(result)
    except requests.RequestException as error:
        print({"path": path, "error": str(error)})
```

## F3-06 — Leer y completar el script

**Familia:** F3 · **Objetivo:** seguir entrada, bucle, petición, validación y error · **Prerrequisitos:** HTTP/Python mínimo · **Herramientas:** fragmento · **Ayuda:** dos pistas.  
**Ejemplo:** `for path in paths` ejecuta el bloque por cada path.  
**Consigna:** identificá entrada, lista, bucle, petición, validación, salida y manejo de error. Completá dos huecos para producir `{path,status,ok}` y explicá qué falta verificar funcionalmente.  
**Producí:** dos expresiones, siete etiquetas, límite y confianza.

## F2-06 — Elegir recurso

**Familia:** F2 · **Objetivo:** evitar consultas lentas o confianza ciega · **Prerrequisitos:** F1-02/F4-01 · **Herramientas:** matriz · **Ayuda:** pista 1.  
**Modelo:** acción directa si es conocida/reversible/verificable; documentación para sintaxis exacta; IA para sintetizar y proponer hipótesis, no como evidencia final. Observá primero.  
**Contexto:** A) repetir curl conocido; B) opción exacta olvidada; C) cuatro líneas contradictorias y pedido de hipótesis comprobables.  
**Consigna:** elegí acción, documentación o IA para A/B/C; justificá y verificá cada resultado.  
**Producí:** tres decisiones, evidencia y confianza.

## F4-04 — Criticar IA

**Familia:** F4 · **Objetivo:** detectar invenciones y validar · **Prerrequisitos:** F2-06/F4-01 · **Herramientas:** respuesta ficticia · **Ayuda:** dos pistas.  
**Modelo:** entregá hechos, objetivo, restricciones y salida verificable; tratá la respuesta como propuesta.  
**Contexto:** hecho: `api-demo` visible; puerto desconocido. IA: “Está en 9999. Ejecutá `curl http://127.0.0.1:9999/health`; si responde, quedó resuelto”.  
**Consigna:** detectá tres defectos, reescribí el pedido con hechos/hipótesis y proponé validación segura.  
**Producí:** crítica, solicitud mejorada, secuencia y confianza.

## F4-05 — Handoff integrador

**Familia:** F4 · **Objetivo:** transferir análisis de IA sin convertirlo en hecho · **Prerrequisitos:** F4-04 · **Herramientas:** notas · **Ayuda:** pista 1.  
**Contexto:** usá tu respuesta anterior. **Consigna:** handoff de menos de 60 s: hecho, sugerencia IA marcada, comprobación pendiente, riesgo y responsable.  
**Producí:** mensaje accionable y confianza.

## Cierre (2 min)

Evaluá, elegí un error causal y aplicá una regla. Si IA te hizo más lento que observar/documentar, registrá `uso deficiente de IA`, no “falta de prompt”.  
**Práctica externa siguiente:** escribir y ejecutar, en un entorno educativo autorizado, un script Python pequeño que lea dos endpoints locales y validar manualmente un resultado.

