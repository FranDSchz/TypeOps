# IA como habilidad en Attack-Defense CTF

## 1. Distinción central

Hay dos productos diferentes:

1. **Entrenar el uso de IA:** practicar cómo decidir consultarla, construir contexto, revisar y validar. Esto no requiere API.
2. **Integrar IA en TypeOps:** generar feedback, actividades o análisis dentro de la aplicación. Esto añade coste, variabilidad, dependencia y una superficie de seguridad.

El primero pertenece al MVP/experimento. El segundo debe esperar evidencia de un problema que no pueda resolverse con rúbricas y respuestas guardadas.

## 2. Modelo operativo: C-E-P-R-U-E-B-A

### C — Clarificar la decisión

Antes de consultar:

- ¿qué resultado necesito?
- ¿qué decisión habilitará?
- ¿qué parte puedo comprobar?
- ¿cuánto tiempo vale invertir?

Si ya se conoce la acción segura y tarda menos que preparar contexto, conviene actuar.

### E — Elegir evidencia

Seleccionar:

- objetivo y alcance autorizado;
- entorno y versiones conocidas;
- comportamiento esperado y observado;
- request/response, código, logs o diff mínimos;
- intentos previos y sus resultados;
- restricciones: no romper checker, no perder datos, tiempo, formato.

Excluir secretos, flags reales, credenciales y material irrelevante.

### P — Pedir una salida utilizable

Una buena solicitud define:

- rol de la salida: hipótesis, comando de observación, script, parche o revisión;
- supuestos que no debe inventar;
- formato;
- controles de seguridad;
- prueba o evidencia esperada;
- necesidad de declarar incertidumbre.

No se evalúa por longitud o fórmulas mágicas. Se evalúa por cuánto reduce tiempo hasta un resultado verificado.

### R — Revisar antes de ejecutar

Inspeccionar:

- rutas, nombres, versiones y APIs inventadas;
- comandos destructivos o amplios;
- quoting, encoding, permisos y alcance;
- supuestos no presentes en evidencia;
- lógica de autorización;
- manejo de errores, timeouts y datos parciales;
- impacto sobre funcionalidad legítima;
- capacidad de rollback.

### U — Usar un entorno controlado

Cuando corresponde, probar en:

- entrada pequeña;
- target de laboratorio;
- copia o snapshot;
- modo lectura/dry-run;
- un caso representativo antes de escalar.

### E — Exigir evidencia

Definir controles:

- caso positivo;
- caso negativo;
- resultado funcional;
- cierre de la vía vulnerable;
- log o salida inequívoca;
- comparación antes/después.

### B — Buscar contradicciones

Preguntar:

- ¿qué observación refutaría esta hipótesis?
- ¿qué alternativa explica lo mismo?
- ¿el resultado proviene realmente del cambio?
- ¿funciona por datos cacheados, sesión previa o coincidencia?

### A — Actualizar y archivar

Conservar:

- prompt/contexto útil;
- respuesta aceptada o corregida;
- evidencia de prueba;
- supuestos;
- próxima acción;
- plantilla generalizable, sin secretos.

## 3. Capacidades a entrenar

### Construcción rápida de contexto

Actividad: recibir artefactos ruidosos y producir un “context pack” en 90 segundos.

Rúbrica:

- objetivo concreto;
- hechos separados de hipótesis;
- evidencia suficiente;
- entorno/versiones;
- intentos y resultados;
- restricciones;
- ausencia de secretos;
- pregunta que habilita una acción.

### Solicitudes de análisis

Pedir:

- tres hipótesis priorizadas;
- evidencia a favor/en contra;
- próxima observación de bajo riesgo;
- incertidumbres.

Evita solicitar “encuentra la vulnerabilidad” sin contexto ni criterio.

### Solicitudes de comandos

Exigir:

- propósito de cada comando;
- alcance exacto;
- riesgos y precondiciones;
- salida esperada;
- alternativa de solo lectura;
- no ejecutar automáticamente.

### Solicitudes de scripts

Incluir:

- contrato de entrada/salida;
- versiones;
- timeout y retries;
- manejo de error;
- límites de concurrencia;
- logs y resultado parcial;
- tests o casos;
- no incluir secretos.

### Solicitudes de parches

Incluir:

- causa y reproducción;
- contrato legítimo;
- cambio mínimo;
- tests positivo, negativo y regresión;
- rollback;
- limitaciones del parche.

### Revisión de código generado

Separar:

- sintaxis;
- comportamiento funcional;
- seguridad;
- robustez operacional;
- compatibilidad;
- observabilidad.

Una actividad puede sembrar un defecto plausible: autorización solo en UI, timeout ausente, regex de flags demasiado amplia, error tragado o parche que bloquea el checker.

### Iteración

La segunda consulta debe aportar un delta:

- nueva evidencia;
- error exacto;
- restricción olvidada;
- hipótesis descartada;
- fragmento relevante.

Repetir el mismo prompt con “no funciona” no entrena diagnóstico.

## 4. Ataque asistido por IA

Usos autorizados plausibles:

- resumir arquitectura y dataflow;
- identificar fronteras de confianza;
- proponer casos de prueba;
- explicar protocolos o formatos;
- construir un PoC mínimo a partir de una causa comprendida;
- reparar parsing, retries o concurrencia de un exploit;
- revisar falsos positivos y variantes;
- convertir notas en handoff.

Controles:

- alcance explícito de CTF/laboratorio;
- prueba manual y target controlado;
- no aceptar una clase vulnerable sin evidencia;
- separar descubrimiento de estabilización;
- revisar que automatización no ataque destinos fuera de lista;
- validar extracción y deduplicación.

## 5. Defensa asistida por IA

Usos:

- explicar logs y diffs;
- proponer hipótesis de caída;
- revisar configuración;
- diseñar healthchecks;
- sugerir parche mínimo;
- generar tests de regresión;
- preparar rollback y runbook;
- comparar estados antes/después.

Controles:

- no pegar secretos o flags;
- verificar documentación/versiones;
- evitar cambios amplios;
- probar función legítima y caso de abuso;
- conservar backup y rollback;
- no confundir proceso vivo con servicio funcional.

## 6. Detección de alucinaciones y fallos

Clases a entrenar:

- **hecho inventado:** archivo, endpoint, versión o salida inexistente;
- **supuesto oculto:** permisos, librería, red o formato no confirmado;
- **causalidad falsa:** un cambio correlaciona con el éxito pero no lo causa;
- **respuesta desactualizada:** API o sintaxis de otra versión;
- **incompletitud peligrosa:** funciona en happy path, no maneja errores;
- **parche cosmético:** bloquea un payload, no la causa;
- **verificación circular:** prueba con la misma suposición que el código;
- **acción insegura:** comando amplio o irreversible;
- **sobreconfianza:** no declara qué falta observar.

El [perfil de IA generativa de NIST](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=958388) trata la confabulación y enfatiza pruebas, evaluación, verificación y validación. Para TypeOps, esto se traduce en requerir evidencia externa a la respuesta.

## 7. Cuándo consultar y cuándo actuar

### Consultar suele aportar valor cuando

- hay que comprender código o logs voluminosos;
- falta familiaridad con una API o formato;
- se necesitan alternativas o casos de prueba;
- una automatización repetible justifica inversión;
- la respuesta puede verificarse rápido;
- preparar un handoff evita pérdida de contexto.

### Actuar directamente suele aportar valor cuando

- existe una observación simple, segura y rápida;
- ya se tiene un runbook probado;
- describir el contexto costaría más que la acción;
- la tarea depende de estado que la IA no puede observar;
- no hay forma rápida de validar una respuesta;
- compartir el artefacto aumenta riesgo.

### Escalar o detenerse cuando

- la acción es destructiva o fuera de alcance;
- faltan reglas de competencia;
- existe riesgo de romper servicio/datos;
- la IA y la evidencia se contradicen y no hay prueba controlada;
- el usuario no entiende el comando que ejecutaría.

## 8. Métricas de uso de IA

No medir “calidad de prompt” por longitud ni una nota estética. Medir:

- tiempo desde inicio hasta evidencia útil;
- porcentaje de respuestas que producen una acción verificable;
- defectos críticos detectados antes de ejecutar;
- defectos aceptados;
- número de iteraciones hasta resultado;
- relevancia del contexto;
- tasa de supuestos no declarados;
- validaciones positivas/negativas realizadas;
- comparación con resolver sin IA en tareas equivalentes;
- tiempo desperdiciado en consultas que no cambian acción.

La métrica principal de una práctica de IA es **resultado verificado por minuto**, acompañado por una tasa de errores aceptados. Ninguna compensa a la otra en un único puntaje.

## 9. Plantillas reutilizables

Las plantillas son checklists adaptables, no prompts largos memorizados.

### Diagnóstico

```text
Objetivo:
Entorno/versiones confirmadas:
Comportamiento esperado:
Comportamiento observado:
Evidencia:
Intentos previos y resultados:
Restricciones/riesgos:

Proponé hipótesis priorizadas. Para cada una, indicá evidencia a favor,
evidencia que la refutaría y la siguiente comprobación segura. No inventes
archivos, endpoints ni versiones; marcá lo desconocido.
```

### Script

```text
Necesito automatizar [flujo autorizado].
Entrada:
Salida inequívoca:
Entorno/versiones:
Fallos que debe manejar:
Timeout/concurrencia/límites:
Evidencia de éxito:

Entregá primero supuestos y casos de prueba; después un candidato pequeño.
No incluyas secretos ni amplíes el alcance.
```

### Parche

```text
Causa reproducida:
Contrato legítimo que debe conservarse:
Código/configuración relevante:
Prueba de abuso:
Restricciones y rollback:

Proponé el cambio mínimo. Incluí prueba positiva, negativa y de regresión,
y explicá qué bypass o efecto secundario podría quedar.
```

### Revisión

```text
Contexto y objetivo:
Respuesta/código candidato:
Evidencia local:

Revisá hechos inventados, supuestos, seguridad, compatibilidad, errores,
timeouts, datos parciales y verificación. Clasificá cada hallazgo por impacto
y proponé la prueba mínima; no reescribas todo salvo necesidad.
```

## 10. Modo de entrenamiento sin API

El MVP puede usar:

- pares de contexto y respuestas guardadas, algunas correctas y otras defectuosas;
- ejercicios de construir prompts y compararlos con una rúbrica;
- uso manual de la IA elegida por el usuario fuera de TypeOps;
- importación manual del prompt, respuesta y resultado;
- “respuesta retrasada”: decidir primero, consultar después y comparar;
- pruebas A/B personales con y sin IA.

Esto mantiene portabilidad y permite que las capacidades cambien sin rehacer la aplicación.

## 11. Riesgo de dependencia excesiva

Señales:

- consultar antes de observar;
- no poder explicar el código generado;
- ejecutar sin prueba;
- pérdida de capacidad para recuperar procedimientos críticos;
- contextos cada vez más largos sin mejor resultado;
- incapacidad de continuar si la herramienta no está disponible;
- atribuir autoridad a tono seguro.

Contramedidas:

- rondas “sin IA” de habilidades críticas;
- decisión propia antes de consultar;
- revisión con defectos sembrados;
- límite de tiempo de consulta;
- checklist de validación;
- plantillas offline y documentación local;
- medir comparación con/sin IA;
- exigir explicación y evidencia posterior.

## 12. Incertidumbre tecnológica

Las capacidades de modelos cambian rápidamente. Estudios del proveedor muestran que modelos recientes pueden rendir bien en ciertos CTF y aun fallar en planes largos o ante obstáculos inesperados ([Anthropic, 2025](https://www.anthropic.com/research/cyber-competitions), [evaluación detallada](https://www.anthropic.com/research/claude-4-cyber)). Por eso el currículo debe entrenar un proceso estable —contexto, revisión, prueba y decisión— en vez de trucos de un modelo concreto.

