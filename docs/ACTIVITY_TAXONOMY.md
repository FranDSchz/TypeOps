# Taxonomía de actividades

## 1. Criterios

Cada actividad tiene una habilidad primaria. Puede ejercitar otras, pero la evaluación no debe confundirlas. Las fases son:

- **E0:** experimento previo al MVP;
- **MVP:** solo si E0 aporta evidencia;
- **Posterior:** depende de una necesidad observada;
- **Externa:** TypeOps prepara/registra, otra herramienta ejecuta;
- **Descartar:** coste o riesgo superior al valor inicial.

## 2. Taxonomía

### 2.1 Recuperación breve contextual

- **Entrena:** memoria conceptual o procedimental.
- **Recibe:** pregunta sin opciones, diagrama parcial o intención.
- **Produce:** explicación breve, pasos, comando base o criterio.
- **Evaluación:** elementos esenciales; exactitud diferida; no estilo.
- **Datos:** correcto, latencia, confianza, pista, omisiones.
- **Adaptación:** intervalo, formato y contraste con concepto confundido.
- **Riesgo:** memorizar respuestas literales; atomizar demasiado.
- **Fase:** E0/MVP.

Ejemplos: diferencia entre autenticación y autorización; qué demuestra un healthcheck funcional; pasos mínimos antes de un parche.

### 2.2 Discriminación de patrones

- **Entrena:** reconocimiento y falsos positivos.
- **Recibe:** pequeños fragmentos mezclados de HTTP, código, configuración o logs.
- **Produce:** clasificación, señal usada y alternativa plausible.
- **Evaluación:** categoría + justificación; matriz de confusión.
- **Datos:** aciertos, falsos positivos, señal seleccionada, tiempo.
- **Adaptación:** intercalar categorías confundidas y variar superficie.
- **Riesgo:** pistas obvias; aprender formato del dataset.
- **Fase:** E0/MVP.

Ejemplos: IDOR vs. información pública; error de aplicación vs. dependencia; SQLi real vs. concatenación no alcanzable.

### 2.3 Siguiente acción

- **Entrena:** decisión y valor de la información.
- **Recibe:** objetivo, estado parcial, restricciones y artefacto.
- **Produce:** próxima acción, por qué ahora, resultado esperado y riesgo.
- **Evaluación:** rúbrica: relevancia, información, seguridad, coste y verificabilidad.
- **Datos:** tiempo hasta decisión, alternativa elegida, confianza, error causal.
- **Adaptación:** más/menos ambigüedad; hipótesis competidoras; límite de tiempo.
- **Riesgo:** una única “respuesta oficial” cuando varias sirven.
- **Fase:** E0/MVP; actividad central.

### 2.4 Predicción e interpretación

- **Entrena:** modelo causal y lectura de evidencia.
- **Recibe:** acción propuesta y contexto; luego una salida.
- **Produce:** predicción previa y actualización posterior.
- **Evaluación:** correspondencia entre predicción, salida e hipótesis.
- **Datos:** sorpresa, perseveración, cambio correcto de plan.
- **Adaptación:** salidas parciales, ambiguas o negativas.
- **Riesgo:** logs artificiales poco realistas.
- **Fase:** MVP.

### 2.5 Reconstrucción de terminal Linux

- **Entrena:** recuperación de comandos, shell y mecánica.
- **Recibe:** intención, restricciones y ejemplo de entrada/salida.
- **Produce:** comando y explicación de cada parte.
- **Evaluación:** por estructura/semántica en representación inerte; en laboratorio, por resultado.
- **Datos:** errores de flags, quoting, pipes, teclas y correcciones.
- **Adaptación:** debilidad conceptual o mecánica por separado.
- **Riesgo:** comandos peligrosos; memorizar one-liners opacos.
- **Fase:** E0/MVP para comandos no destructivos; ejecución real externa.

### 2.6 Reparación de Bash

- **Entrena:** lectura, seguridad y robustez.
- **Recibe:** script breve con un fallo (quoting, glob, exit status, timeout, datos).
- **Produce:** diff conceptual o línea corregida y prueba.
- **Evaluación:** identifica causa, corrige y propone caso negativo.
- **Datos:** tipo de bug, tiempo, tests elegidos, ayuda.
- **Adaptación:** bugs recurrentes y menor scaffolding.
- **Riesgo:** demasiadas convenciones a la vez.
- **Fase:** MVP.

### 2.7 Construcción y mutación HTTP

- **Entrena:** HTTP, estado, autenticación y pruebas web.
- **Recibe:** objetivo, flujo legítimo y/o request parcial.
- **Produce:** request válida, mutación mínima y evidencia esperada.
- **Evaluación:** sintaxis, conservación de estado, aislamiento de variable e interpretación.
- **Datos:** campos omitidos, mutaciones innecesarias, errores de encoding, tiempo.
- **Adaptación:** métodos, cuerpos, cookies, tokens, variantes de identidad.
- **Riesgo:** convertir payloads en recetas sin comprensión; solo contenido inerte o laboratorio.
- **Fase:** E0/MVP.

### 2.8 Lectura de código orientada a frontera de confianza

- **Entrena:** comprensión de servicios, dataflow y reconocimiento.
- **Recibe:** handler, modelo o función pequeña.
- **Produce:** entrada controlable, transformación, sink/control y prueba.
- **Evaluación:** marcación de líneas + explicación causal.
- **Datos:** fronteras omitidas, categorías confundidas, tiempo.
- **Adaptación:** lenguajes/frameworks solo cuando sean relevantes.
- **Riesgo:** snippets demasiado obvios o fuera de contexto.
- **Fase:** MVP; ampliar después.

### 2.9 Completar o reparar Python

- **Entrena:** automatización ofensiva/defensiva.
- **Recibe:** contrato, código breve y casos.
- **Produce:** fragmento, pseudocódigo preciso o corrección.
- **Evaluación:** casos normales, timeout, error, parsing y resultado parcial.
- **Datos:** fallos por categoría, intentos, pruebas, tiempo.
- **Adaptación:** retirar plantillas; introducir targets/respuestas variables.
- **Riesgo:** TypeOps no debería convertirse en IDE o juez general.
- **Fase:** MVP para microtareas; ejecución y proyectos, externos.

### 2.10 De manual a automatizado

- **Entrena:** diseño de exploit runner, healthcheck o recolector.
- **Recibe:** pasos manuales exitosos y restricciones.
- **Produce:** plan de automatización, interfaces, validación, logs y fallos.
- **Evaluación:** cobertura de estados y evidencia; después, prueba externa.
- **Datos:** omisiones de robustez, tiempo, revisiones.
- **Adaptación:** añadir concurrencia, deduplicación o cambio de formato.
- **Riesgo:** evaluar diseño sin ejecutar puede dar falsa confianza.
- **Fase:** MVP como diseño; Externa para ejecución.

### 2.11 Microescenario ofensivo

- **Entrena:** hipótesis, ataque web autorizado y verificación.
- **Recibe:** descripción mínima, requests/responses, código o logs.
- **Produce:** vía priorizada, prueba mínima, impacto y criterio de éxito.
- **Evaluación:** causalidad, alcance, seguridad y evidencia.
- **Datos:** tiempo a primera acción, ramas, pistas, falso éxito.
- **Adaptación:** ocultar categoría, mezclar negativos, encadenar dos pasos.
- **Riesgo:** fidelidad y contenido sensible; nunca apuntar a sistemas reales.
- **Fase:** E0/MVP inerte; Externa para explotación.

### 2.12 Ataque–parche–verificación

- **Entrena:** conexión ataque/defensa y preservación funcional.
- **Recibe:** causa demostrada, contrato legítimo y parche candidato.
- **Produce:** revisión, cambio mínimo, pruebas positiva/negativa y rollback.
- **Evaluación:** vulnerabilidad cerrada + función preservada + evidencia.
- **Datos:** regresiones, pruebas omitidas, tiempo de recuperación.
- **Adaptación:** parches incompletos, bypasses y dependencias.
- **Riesgo:** sin servicio real no demuestra disponibilidad.
- **Fase:** Posterior/Externa; en MVP solo revisión de casos.

### 2.13 Triage de servicio

- **Entrena:** Linux, servicios, observabilidad y decisión defensiva.
- **Recibe:** síntoma, inventario parcial, logs y estado de checker simulado.
- **Produce:** hipótesis, comprobación, contención/recuperación y criterio.
- **Evaluación:** orden, ganancia de información, reversibilidad y función.
- **Datos:** acciones inútiles, diagnóstico, tiempo a restauración.
- **Adaptación:** ruido, fallos múltiples, presión y handoff.
- **Riesgo:** simulación de papel no reproduce estados.
- **Fase:** MVP micro; Externa para recuperación real.

### 2.14 Interpretación de logs y detección

- **Entrena:** reconocimiento defensivo y correlación.
- **Recibe:** ventana pequeña de logs con línea base.
- **Produce:** eventos relevantes, hipótesis, consulta siguiente y limitaciones.
- **Evaluación:** precisión/recall sobre eventos curados + razonamiento.
- **Datos:** falsos positivos, señales ignoradas, tiempo.
- **Adaptación:** variar formato, ruido y contexto.
- **Riesgo:** premiar grep de una palabra; datasets poco representativos.
- **Fase:** MVP si existe contenido de calidad.

### 2.15 Priorización Attack-Defense

- **Entrena:** estrategia.
- **Recibe:** tablero de situación: servicios, disponibilidad, exploit, ataques y tiempo.
- **Produce:** ranking de acciones, asignación y condición de reevaluación.
- **Evaluación:** utilidad esperada, dependencias, riesgo, reversibilidad; varias respuestas válidas.
- **Datos:** sesgos de prioridad, cambios ante nueva evidencia, tiempo.
- **Adaptación:** ticks, interrupciones y coste de cambio.
- **Riesgo:** sin reglas reales, enseñar una estrategia falsa.
- **Fase:** MVP solo con modelo genérico y supuestos visibles; enriquecer tras reglamento.

### 2.16 Handoff comprimido

- **Entrena:** comunicación y gestión de evidencia.
- **Recibe:** notas, comandos y resultados desordenados.
- **Produce:** estado, hechos, hipótesis, artefactos, riesgo y próxima acción.
- **Evaluación:** un tercero puede continuar; rúbrica de completitud y separación hecho/supuesto.
- **Datos:** omisiones y tiempo de síntesis.
- **Adaptación:** límite de longitud y públicos distintos.
- **Riesgo:** evaluación subjetiva.
- **Fase:** V0 manual/MVP; el equipo de tres ya está confirmado.

### 2.17 Construcción de contexto para IA

- **Entrena:** delegación y síntesis.
- **Recibe:** artefactos ruidosos y objetivo.
- **Produce:** solicitud compacta con evidencia, restricciones y salida verificable.
- **Evaluación:** suficiencia, relevancia, ausencia de secretos/supuestos y testabilidad.
- **Datos:** tokens/caracteres, omisiones, iteraciones, utilidad de respuesta guardada.
- **Adaptación:** tiempo, formato y tipo de tarea.
- **Riesgo:** optimizar “prompt bonito” sin mejorar resultado.
- **Fase:** E0/MVP.

### 2.18 Crítica de respuesta de IA

- **Entrena:** revisión, alucinaciones y validación.
- **Recibe:** contexto original, respuesta candidata y evidencia local.
- **Produce:** aceptar/corregir/rechazar, lista de supuestos y plan de prueba.
- **Evaluación:** defectos detectados, falsos reclamos, validación adecuada.
- **Datos:** errores aceptados, tiempo, confianza, severidad.
- **Adaptación:** respuestas incompletas, peligrosas o demasiado convincentes.
- **Riesgo:** dataset pequeño; modelos y capacidades cambian.
- **Fase:** E0/MVP.

### 2.19 Decidir: IA, documentación, herramienta o acción directa

- **Entrena:** economía de consulta.
- **Recibe:** tarea, estado, tiempo y recursos.
- **Produce:** canal elegido, razón y timebox.
- **Evaluación:** coste esperado, riesgo y capacidad de verificar.
- **Datos:** consultas evitables, tiempo hasta progreso, cambio de canal.
- **Adaptación:** presión y familiaridad.
- **Riesgo:** respuesta depende del entorno y modelo disponible.
- **Fase:** MVP.

### 2.20 Copia técnica contextual

- **Entrena:** mecanografía técnica, no comprensión.
- **Recibe:** comando, código o HTTP ya explicado.
- **Produce:** copia exacta.
- **Evaluación:** precisión, correcciones y latencia por secuencia.
- **Datos:** teclas, transiciones, símbolos y edición.
- **Adaptación:** seleccionar fragmentos coherentes que contienen secuencias débiles.
- **Riesgo:** familiaridad ilusoria; puede dominar el tiempo.
- **Fase:** E0, máximo 2–4 minutos por sesión.

### 2.21 Transformación mecánica con intención

- **Entrena:** edición + comprensión ligera.
- **Recibe:** línea válida y objetivo de cambio.
- **Produce:** transformación mínima.
- **Evaluación:** resultado semántico y mecánica.
- **Datos:** ediciones, errores, comandos destructivos, tiempo.
- **Adaptación:** secuencias débiles dentro de transformaciones útiles.
- **Riesgo:** múltiples soluciones y shortcuts dependientes del entorno.
- **Fase:** MVP, preferible a copia larga.

### 2.22 Laboratorio o mystery task externo

- **Entrena:** integración y transferencia.
- **Recibe:** entorno autorizado sin categoría visible cuando sea posible.
- **Produce:** resultado del laboratorio, notas y evidencia.
- **Evaluación:** criterio externo + postmortem.
- **Datos:** tiempo, pistas, ramas, artefactos, resultado y recuperación.
- **Adaptación:** TypeOps recomienda preparación y siguiente laboratorio.
- **Riesgo:** datos manuales inconsistentes; dificultad no controlada.
- **Fase:** Externa desde E0; imprescindible.

## 3. Actividades que no deberían entrar

- ejecución libre de comandos o payloads dentro de TypeOps sin aislamiento validado;
- generación de objetivos reales o descubrimiento de Internet;
- simulador de terminal que acepta solo una secuencia exacta;
- copia de walkthroughs completos;
- preguntas triviales creadas solo para aumentar volumen;
- repetición de una tecla aislada como actividad principal;
- evaluación automática de razonamiento libre sin rúbrica verificable;
- “duelos” o leaderboards para un único usuario;
- detección del dedo físico a partir de eventos de teclado.

## 4. Paquete inicial de contenido

> **Recalibración:** el paquete siguiente corresponde al experimento amplio posterior. Antes de Cyber War, V0 se limita a las 24 actividades y 8 variantes de [TYPEOPS_V0_CONTENT_PLAN.md](TYPEOPS_V0_CONTENT_PLAN.md).

Para el experimento posterior no se necesita cubrir todo el currículo. Bastan 36–48 unidades:

- 8 recuperación/discriminación;
- 8 siguiente acción/predicción;
- 6 terminal/Bash;
- 6 HTTP/web;
- 4 Python/automatización;
- 4 servicio/defensa;
- 4 IA;
- 4 fragmentos de copia/transformación técnica;
- 2 evaluaciones acumulativas;
- 2 tareas de transferencia externas.

Cada unidad debe tener al menos una variante estructural o de contexto.
