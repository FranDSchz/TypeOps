# Clave — Sesión 6

## Pistas

- **F3-06 Pista 1:** la validación compara `status_code` con 200. **Pista 2:** el segundo hueco debe usar el nombre de la variable booleana recién creada.
- **F2-06 Pista 1:** elegí el medio más corto que produzca evidencia fiable, no el más sofisticado.
- **F4-04 Pista 1:** subrayá todo lo que la IA afirma pero el contexto no confirmó. **Pista 2:** una respuesta a un health sólo prueba ese endpoint; pedí comandos con evidencia esperada y límites.
- **F4-05 Pista 1:** Hecho / Sugerencia no verificada / Comprobación / Riesgo / Responsable.

---

## Rúbricas

### F3-06

- **Elementos esenciales:** `ok = response.status_code == 200`; diccionario usa `"ok": ok`. Entrada=`sys.argv[1]` o default; lista=`paths`; bucle=`for`; petición=`requests.get`; validación=comparación; salida=`print(result)`; error=`except ...`. Falta validar body/semántica y quizá operación real.
- **Alternativas aceptables:** `ok = 200 <= response.status_code < 300` si justifica política; acceso por `result["ok"]` no necesario.
- **Errores frecuentes:** asignar `=` en comparación; poner cadena `"ok"`; creer 200=función completa; omitir timeout/error.
- **Tipo de error:** sintaxis; interpretación; verificación omitida.
- **Explicación:** el script automatiza una señal limitada; no reemplaza criterio de éxito funcional.
- **Criterio de verificación:** sigue el flujo y explica una limitación concreta.
- **Siguiente recomendada:** sintaxis→reconstruir sólo las dos líneas; concepto→práctica Python guiada externa.

### F2-06

- **Elementos esenciales:** A acción directa/repetir curl y comparar resultado; B ayuda/documentación de versión; C IA puede proponer hipótesis si recibe las cuatro líneas, pero validar cada una. Cada caso tiene evidencia esperada.
- **Alternativas aceptables:** B IA sólo si luego contrasta documentación local; C razonamiento directo si es más rápido.
- **Errores frecuentes:** IA para todo; copiar comando; documentación como sustituto de observar entorno.
- **Tipo de error:** uso deficiente de IA; siguiente acción débil; verificación omitida.
- **Explicación:** consultar tiene costo; la herramienta correcta depende de incertidumbre y precisión necesaria.
- **Criterio de verificación:** justifica costo/beneficio y no usa IA como fuente final.
- **Siguiente recomendada:** consulta excesiva→resolver un caso sin IA; confianza ciega→F4-04.

### F4-04

- **Elementos esenciales:** puerto 9999 inventado; health quizá no representa función; “si responde” carece de status/body/esperado; no considera configuración/listeners; prompt mejorado separa hechos/hipótesis y pide opciones con evidencia/límites; validación observa `ss`/configuración, luego curl al puerto confirmado y función relevante.
- **Alternativas aceptables:** ayuda local/log de arranque para puerto; pedir a IA preguntas aclaratorias.
- **Errores frecuentes:** detectar invención sin corregir proceso; ejecutar por plausibilidad; pedir un prompt más largo sin mejor evidencia.
- **Tipo de error:** uso deficiente de IA; interpretación; verificación omitida.
- **Explicación:** calidad del prompt ayuda, pero la validación independiente sigue siendo obligatoria.
- **Criterio de verificación:** ninguna afirmación nueva se promueve a hecho sin observación.
- **Siguiente recomendada:** versión/sintaxis→F4-04V; sin validación→F4-01.

### F4-05

- **Elementos esenciales:** proceso visible como hecho; 9999 como sugerencia IA no confirmada; comprobar listener/configuración; riesgo de perder tiempo/concluir salud falsa; responsable explícito.
- **Alternativas aceptables:** mensaje o viñetas, cualquier responsable A/B/C.
- **Errores frecuentes:** “IA encontró puerto”; sin riesgo o dueño; transferir comando sin esperado.
- **Tipo de error:** uso deficiente de IA; recuperación incompleta.
- **Explicación:** el handoff debe preservar la procedencia y confiabilidad de cada afirmación.
- **Criterio de verificación:** receptor distingue evidencia, propuesta y acción.
- **Siguiente recomendada:** practicar drill-02; correcto→actividad externa integrada.

