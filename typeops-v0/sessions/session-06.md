# Sesión 6 — Python mínimo, IA supervisada e integración

**Objetivo:** leer automatización pequeña, decidir cuándo consultar IA y validar sus propuestas. **Prerrequisitos:** sesiones 1–5 y una introducción breve a Python. **Duración:** 16–18 min.  
**Materiales:** archivo y registro. No hace falta ejecutar ni instalar `requests`. **No consultar:** IA real para responder. **Sí consultar:** modelos, fragmento y pistas.  
**Orden:** F3-06, F2-06, F4-04, F4-05 y cierre. Registrá sólo tiempos de sesión; la evaluación se realiza después mediante IA.

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
**Tarea:** completá los dos huecos, identificá entrada/lista/bucle/petición/validación/salida/error y mencioná una verificación funcional que falta.  
**Formato de respuesta:** dos líneas de código + una línea de etiquetas + una línea `Falta verificar:`.  
**Extensión máxima:** cuatro líneas.

## F2-06 — Elegir recurso

**Familia:** F2 · **Objetivo:** evitar consultas lentas o confianza ciega · **Prerrequisitos:** F1-02/F4-01 · **Herramientas:** matriz · **Ayuda:** pista 1.  
**Modelo:** acción directa si es conocida/reversible/verificable; documentación para sintaxis exacta; IA para sintetizar y proponer hipótesis, no como evidencia final. Observá primero.  
**Contexto:** A) repetir curl conocido; B) opción exacta olvidada; C) cuatro líneas contradictorias y pedido de hipótesis comprobables.  
**Tarea:** elegí acción directa, documentación o IA para A/B/C e indicá una verificación para cada elección.  
**Formato de respuesta:** tres viñetas `Caso: recurso → verificación`.  
**Extensión máxima:** tres viñetas, una línea cada una.

## F4-04 — Criticar IA

**Familia:** F4 · **Objetivo:** detectar invenciones y validar · **Prerrequisitos:** F2-06/F4-01 · **Herramientas:** respuesta ficticia · **Ayuda:** dos pistas.  
**Modelo:** entregá hechos, objetivo, restricciones y salida verificable; tratá la respuesta como propuesta.  
**Contexto:** hecho: `api-demo` visible; puerto desconocido. IA: “Está en 9999. Ejecutá `curl http://127.0.0.1:9999/health`; si responde, quedó resuelto”.  
**Tarea:** detectá tres defectos, reescribí un pedido que separe hechos/hipótesis y definí una validación segura.  
**Formato de respuesta:** tres viñetas de defectos + `Pedido:` una línea + `Validación:` una línea.  
**Extensión máxima:** cinco líneas.

## F4-05 — Handoff integrador

**Familia:** F4 · **Objetivo:** transferir análisis de IA sin convertirlo en hecho · **Prerrequisitos:** F4-04 · **Herramientas:** notas · **Ayuda:** pista 1.  
**Contexto:** usá tu respuesta anterior.  
**Tarea:** transferí el hecho, la sugerencia de IA aún no verificada, la comprobación pendiente, el riesgo y el responsable.  
**Formato de respuesta:** cinco líneas con esas etiquetas.  
**Extensión máxima:** cinco líneas.

## Cierre

Guardá respuestas y registro mínimo. La IA evaluadora determinará si hubo uso deficiente de IA según la rúbrica; el usuario no se autoasigna ese error.  
**Práctica externa siguiente:** escribir y ejecutar, en un entorno educativo autorizado, un script Python pequeño que lea dos endpoints locales y validar manualmente un resultado.
