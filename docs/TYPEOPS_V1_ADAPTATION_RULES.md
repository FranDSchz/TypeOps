# TypeOps V1 — Reglas de adaptación

## 1. Propósito

V1 recomienda la próxima microactividad mediante reglas deterministas y visibles. No usa machine learning, no calcula un “nivel general” y no mezcla rapidez mecánica con dominio conceptual.

Las reglas responden tres preguntas:

1. ¿Qué contenido es elegible sin evaluar algo no enseñado?
2. ¿Qué necesidad tiene prioridad dentro del modo elegido?
3. ¿Cómo se explica la recomendación en una frase?

Los umbrales de este documento son valores operativos iniciales para que la implementación sea consistente. Deben almacenarse como configuración de dominio y revisarse con evidencia de uso; no se presentan como leyes pedagógicas.

## 2. Límites de la adaptación

- El usuario elige el modo; el recomendador no cambia de modo durante una sesión.
- El usuario puede elegir foco o ignorar la recomendación sin penalización.
- Sólo se recomiendan items habilitados, compatibles con el presupuesto y cuyos prerrequisitos estén satisfechos.
- Una respuesta abierta pendiente no se trata como correcta ni incorrecta.
- WPM no altera recomendaciones de conocimiento o competencia.
- La confianza nunca sustituye la corrección. Sirve para detectar alta confianza incorrecta una vez evaluada.
- No se recomienda exactamente el mismo item en los tres intentos siguientes, salvo reanudación guiada o reintento explícito solicitado.
- Una actividad omitida una vez no se interpreta como debilidad.

## 3. Orden de selección

El motor no suma pesos incompatibles. Aplica un embudo y una prioridad ordenada.

### Paso A — Filtrar

Excluir items que:

- pertenecen a otro modo;
- están deshabilitados;
- exceden el tiempo restante más una tolerancia de 30 segundos;
- requieren una unidad todavía `new` y no son práctica guiada;
- son la misma actividad reciente;
- ya fueron resueltos de forma independiente y confiable cuando hay alternativas útiles pendientes;
- contradicen el foco elegido.

Si el filtro deja cero candidatos, relajar sólo en este orden: duración, repetición reciente, foco. Nunca relajar prerrequisitos ni seguridad.

### Paso B — Clasificar necesidad

Dentro de candidatos, elegir la primera clase no vacía:

1. **Reanudar guiada incompleta.** Mantener continuidad de una unidad ya empezada.
2. **Contenido nuevo que requiere guía.** Sólo en modo guiado o cuando el usuario pidió aprender algo nuevo.
3. **Repaso vencido.** `review_due`, priorizando verificación y fundamentos antes que adornos mecánicos.
4. **Alta confianza incorrecta.** Contraste o variante que aísle la confusión.
5. **Error conceptual o herramienta incorrecta.** Explicación breve y práctica/variante del mismo objetivo.
6. **Interpretación, siguiente acción o verificación débil.** Escenario operativo breve que exija esa dimensión.
7. **Sintaxis débil con concepto correcto.** Reconstrucción contextual, no nueva teoría.
8. **Fricción mecánica con muestra suficiente.** Fragmento técnico coherente que contenga la secuencia.
9. **Variante pendiente tras pista.** Sin pista y no inmediatamente después del original.
10. **Variedad/exploración.** Unidad elegible menos reciente del foco.

### Paso C — Desempatar

En una misma clase:

1. menor cantidad de intentos independientes;
2. práctica menos reciente;
3. categoría menos representada en las últimas cinco actividades;
4. duración que mejor cabe en el presupuesto;
5. orden estable por ID para reproducibilidad.

## 4. Estados de aprendizaje

### Transiciones

| Desde | Evidencia | Hacia |
|---|---|---|
| `new` | abre modelo mínimo | `learning` |
| `learning` | completa modelo, sintaxis, ejemplo y ejercicio guiado | `practicing` |
| `practicing` | un éxito sin pista | permanece `practicing`; programar variante |
| `practicing` | dos éxitos sin pista en items distintos, uno de ellos variante | `ready_for_assessment` |
| `ready_for_assessment` | llega `nextReviewAt` | `review_due` |
| `review_due` | éxito sin pista | `ready_for_assessment`; ampliar intervalo |
| cualquier evaluable | error conceptual/herramienta | `learning` si falta el modelo; si no, `practicing` |
| cualquier evaluable | sólo error de sintaxis | `practicing` |

Una exposición o copia correcta no cuenta como recuperación independiente. Un éxito con pista conserva progreso, pero no satisface los dos éxitos sin ayuda.

### Repasos simples

Sin algoritmo sofisticado:

- primer éxito independiente: variante a partir del día siguiente;
- segundo éxito independiente: repaso en 3 días;
- repaso correcto: 7 días;
- siguiente repaso correcto: 14 días;
- error evaluado: reaparición en la próxima sesión compatible y luego al día siguiente;
- uso de pista: variante no inmediata en la siguiente sesión compatible.

Si la competencia está a 7 días o menos, los intervalos mayores se recortan para que fundamentos con `needs_work` reaparezcan antes del evento. Esto no convierte hipótesis del reglamento en contenido.

## 5. Reglas por tipo de error

| Evidencia | Acción siguiente | Razón visible |
|---|---|---|
| `concept_unknown` | abrir modelo mínimo o volver a etapa guiada | “Falta el modelo base; repasalo antes de evaluarlo.” |
| `tool_selection` | ejemplo comparativo y otro comando desde intención | “La sintaxis no es el problema principal: hay que elegir la herramienta adecuada.” |
| `syntax` con herramienta correcta | reconstrucción corta del mismo patrón | “Elegiste bien la herramienta; practiquemos su estructura.” |
| `interpretation` | output distinto con la misma habilidad | “La salida se leyó de forma incorrecta o incompleta.” |
| `verification_omitted` | decisión que pida evidencia esperada | “La acción necesita una comprobación observable.” |
| `overgeneralization` | contraste de alcance de evidencia | “La conclusión superó lo observado; practicá qué prueba y qué no prueba el dato.” |
| `weak_next_action` | comando/acción + máximo dos condicionales | “Hace falta una primera acción discriminante, no un plan completo.” |
| `unsafe_action` | explicación y alternativa de observación segura | “La acción propuesta puede alterar el servicio antes de obtener evidencia.” |
| `ai_critique` | respuesta de IA ficticia con afirmación verificable | “Separá propuesta, supuesto y comprobación antes de actuar.” |
| `mechanical_friction` | typing de 1–2 minutos con fragmento real | “Esta secuencia tuvo fricción reciente; practicá un uso técnico válido.” |

Si hay varios errores, el conceptual o inseguro precede a sintaxis y mecánica. La aplicación conserva todos los códigos, pero recomienda una sola necesidad principal.

## 6. Adaptación mecánica

### Observaciones válidas

Se consideran sólo intentos donde:

- el input mantuvo foco;
- no hubo pegado;
- el navegador entregó eventos consistentes;
- el texto técnico tenía al menos 10 caracteres;
- la captura no fue desactivada.

Un error inicial es la primera entrada que no coincide con el carácter esperado en esa posición, aunque luego se corrija. Una corrección cuenta Backspace/Delete o reemplazo antes de enviar. Precisión final y error inicial se muestran por separado.

### Muestra mínima

- carácter/símbolo: al menos 8 apariciones en 3 intentos válidos;
- bigrama: al menos 6 apariciones en 3 intentos;
- secuencia de 3+ caracteres: al menos 4 apariciones en 2 intentos.

Antes del mínimo se muestra “evidencia insuficiente”, no “debilidad”.

### Señal de prioridad

Una secuencia se vuelve candidata mecánica si cumple muestra mínima y alguna condición:

- tasa de error inicial ≥ 20%;
- correcciones en ≥ 25% de sus apariciones;
- latencia mediana ≥ 1.5 veces la mediana del mismo usuario para secuencias comparables.

Los valores no producen un puntaje. Sólo habilitan prioridad. La selección busca un fragmento existente técnicamente coherente que contenga una o dos secuencias candidatas. Si no existe, no genera texto: informa que falta corpus adecuado.

### Consistencia

Se informa como mediana y dispersión robusta de intervalos entre entradas en una sesión. Sólo se compara con el propio historial y nunca con una población externa. Si hay menos de 20 intervalos válidos, se oculta.

## 7. Evaluación y adaptación de comandos

El resultado separa:

1. herramienta;
2. estructura semántica dentro del subconjunto curado;
3. sintaxis;
4. mecánica.

Casos:

- alternativa aceptada exacta tras normalización: las tres primeras dimensiones correctas;
- herramienta esperada pero falta opción/argumento: herramienta correcta, estructura parcial/incorrecta, sintaxis según check;
- herramienta distinta pero alternativa válida declarada: correcto mediante esa alternativa;
- respuesta plausible no reconocida: `needs_review`; no reduce dominio;
- comando inseguro declarado: `unsafe_action` aunque la sintaxis sea válida;
- typo corregido antes de enviar: mecánica registra fricción, la sintaxis final puede ser correcta.

## 8. Respuestas abiertas y revisiones externas

- Al enviar, guardar respuesta, rúbrica, confianza, pistas y versión.
- Marcar `pending_review` y continuar.
- No mostrar “correcto” ni modificar dominio.
- Una evaluación externa importada debe identificar intento, dimensión, resultado, error causal y feedback breve.
- Validar la importación igual que cualquier dato externo.
- Si la revisión no se ajusta a los valores permitidos, rechazarla; no guardar texto libre como autoridad de dominio.
- La autoevaluación puede abrirse voluntariamente, pero nunca aparece como paso obligatorio de cierre.

## 9. Confianza y pistas

- Confianza es opcional y se solicita con una tecla tras responder, sin formulario.
- `alta` + resultado incorrecto evaluado crea prioridad de contraste.
- `baja` + correcto no produce repetición inmediata; puede sugerir variante posterior para consolidar.
- Usar pista registra exactamente qué nivel y qué reveló.
- Una pista de herramienta impide contar selección independiente; una pista de sintaxis puede permitir evidencia conceptual si la rúbrica lo admite.

## 10. Composición de sesiones

### Por duración

- 2 minutos: 1–3 items muy breves o reanudar una etapa guiada.
- 5 minutos: 2–5 items.
- 10 minutos: 4–8 items.
- No iniciar un item si su estimación supera el tiempo restante + 30 segundos.
- Si vence el tiempo durante una actividad, permitir terminar o salir guardando borrador; no cortar texto.

### Por cantidad

Ejecutar exactamente la cantidad elegida, salvo salida voluntaria. Una práctica guiada cuenta como una actividad aunque tenga pantallas internas; puede reanudarse.

### Variedad

- Máximo dos items consecutivos de la misma unidad, salvo guided.
- En modo review, alternar formato cuando hay candidatos equivalentes.
- En modo typing, máximo dos fragmentos que prioricen la misma secuencia mecánica.
- El cierre recomienda una sola próxima actividad y ofrece dos alternativas de foco, no una lista infinita.

## 11. Motivos de recomendación

Cada recomendación persiste un `reasonCode` y parámetros. Códigos mínimos:

- `resume_guided`
- `new_needs_guidance`
- `review_due`
- `high_confidence_mismatch`
- `concept_repair`
- `tool_repair`
- `interpretation_repair`
- `verification_repair`
- `syntax_rebuild`
- `mechanical_sequence`
- `hinted_variant`
- `variety_exploration`
- `user_focus`

La UI genera una frase desde estos datos. No almacena una explicación opaca producida por IA.

## 12. Casos límite

- **Sin historial:** ofrecer una actividad introductoria por modo; no diagnosticar debilidades.
- **Todo pendiente de revisión:** recomendar contenido determinista o una categoría distinta, no repetir abiertas.
- **Corpus insuficiente:** explicar “no hay variante adecuada en el pack actual” y dejar elegir.
- **Progreso importado conflictivo:** recalcular desde intentos confirmados; mantener conflicto visible.
- **Cambio de layout:** conservar perfiles separados. V1 sólo habilita US ANSI.
- **Actividad anulada por error editorial:** deshabilitarla sin borrar intentos.
- **Competencia próxima:** priorizar fundamentos débiles y práctica independiente; no introducir temas avanzados no confirmados.

## 13. Registro para validar estas reglas

Sin telemetría externa, guardar localmente:

- recomendación ofrecida y motivo;
- aceptada, reemplazada o ignorada;
- item finalmente elegido;
- resultado por dimensión;
- duración total de sesión;
- pistas y confianza;
- si el usuario terminó el objetivo;
- razón de salida.

Esto permite revisar si las recomendaciones ahorran tiempo. No se registra un tiempo manual por actividad ni se pide clasificar la propia respuesta.
