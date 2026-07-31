# Primer experimento: antes del MVP

> **Estado al 31 de julio de 2026:** este diseño se conserva como experimento de producto posterior o como referencia metodológica. No se ejecutará completo antes de Cyber War: el nivel principiante, la fecha del 22 de agosto y el coste de oportunidad hacen preferible un V0 manual y un plan de preparación directo. La decisión vigente está en [TYPEOPS_V0_EXECPLAN.md](TYPEOPS_V0_EXECPLAN.md).

## 1. Decisión que debe informar

¿Vale la pena construir TypeOps como experiencia integrada, o basta con usar herramientas existentes por separado?

El experimento debe detectar:

- si el contenido técnico durante mecanografía mejora algo además de la copia;
- si una recomendación basada en errores supera una selección genérica;
- si mezclar mecánica y razonamiento produce sobrecarga;
- qué tipos de actividad tienen utilidad percibida y transferencia;
- qué señales internas predicen desempeño externo.

## 2. Hipótesis

### H1 — Valor del contenido contextual

Practicar secuencias técnicas con una recuperación o transformación asociada mejorará la producción posterior desde intención más que copiar texto técnico sin procesarlo.

No se espera necesariamente una mejora conceptual por copia sola.

### H2 — Adaptación simple

Una cola explicable basada en repaso vencido + error recurrente + prioridad producirá menos errores repetidos y menos pistas que una cola fija, con el mismo tiempo.

### H3 — Carga

Combinar simultáneamente contenido nuevo y secuencias mecánicas difíciles reducirá comprensión o precisión; separar una microfase mecánica de la microdecisión será más sostenible.

### H4 — Transferencia

El desempeño en “siguiente acción”, predicción/verificación y reconstrucción desde intención predecirá mejor el tiempo en laboratorios que WPM o precisión de copia.

### H5 — Utilidad

Las actividades de decisión, HTTP/terminal desde intención y crítica de IA serán percibidas como más útiles que copia larga, sin ser necesariamente las más entretenidas.

## 3. Diseño

### Duración

14 días de uso:

- 10 sesiones diarias de 20 minutos;
- 2 evaluaciones acumulativas de 20–30 minutos (día 1/2 y día 14);
- 2 tareas externas de 45–60 minutos, una cerca del inicio y otra al final;
- 2 días flexibles/descanso.

Para retención a 21 días, realizar un follow-up breve una semana después del día 14. Si no es posible, registrar como evidencia faltante.

### Comparación dentro de una persona

No hay población para un ensayo estadístico. Se alternan condiciones comparables:

- **Copia contextual:** copiar fragmento ya explicado.
- **Producción contextual:** recibir intención y reconstruir/transformar.
- **Cola fija:** actividades preordenadas.
- **Cola adaptativa:** reglas visibles según errores y vencimientos.
- **Mecánica integrada:** secuencia difícil dentro de tarea cognitiva.
- **Mecánica separada:** breve calentamiento y luego decisión normal.

El orden se contrabalancea de forma sencilla para reducir efecto de novedad. No afirmar causalidad fuerte: se buscan señales de producto y casos cualitativos.

## 4. Funcionalidades mínimas

No hace falta una aplicación completa. El prototipo puede ser una experiencia local mínima o incluso un conjunto navegable/manual:

- mostrar estímulo;
- capturar respuesta;
- cronómetro por fases;
- botón de confianza;
- pistas escalonadas;
- feedback curado;
- reintento;
- registro estructurado;
- selector manual que imite cola fija/adaptativa;
- exportación legible de intentos;
- enlaces a dos laboratorios externos.

No necesita:

- cuenta;
- backend;
- sincronización;
- IA integrada;
- terminal;
- ejecución;
- dashboard sofisticado;
- generación de contenido;
- scheduler estadístico;
- gamificación.

## 5. Contenido

### 40 actividades curadas

- 6 recuperaciones de fundamentos Linux/HTTP/Attack-Defense;
- 6 discriminaciones (acceso, inyección, información, servicio);
- 8 decisiones de siguiente acción;
- 4 predicción/interpretación de outputs;
- 4 terminal/Bash desde intención;
- 4 HTTP reconstrucción/mutación;
- 2 Python/automatización;
- 2 servicio/defensa;
- 2 construcción de contexto de IA;
- 2 crítica de respuesta de IA.

### Mecánica

8–12 fragmentos breves técnicamente coherentes que contengan:

- pipes y redirección;
- rutas y guiones;
- comillas y expansión;
- delimitadores de Python;
- headers, JSON y URL encoding.

Se usan tanto en copia como en transformación. No se crean pseudocomandos ni payloads activos.

### Evaluaciones

- 12 ítems acumulativos no idénticos;
- 2 microescenarios sin etiqueta;
- 2 tareas externas comparables, idealmente mystery labs o niveles autorizados ya existentes;
- rubricas preparadas antes de observar resultados.

## 6. Reglas adaptativas simuladas

Al final de cada sesión:

1. poner recuperación incorrecta para reintento y revisión próxima;
2. si hay confusión, programar contraste con la categoría confundida;
3. si falta verificación, seleccionar un caso que exija control positivo/negativo;
4. si el fallo fue mecánico, seleccionar un fragmento breve con esa secuencia;
5. si hubo ayuda, presentar una variante sin ayuda antes de afirmar independencia;
6. conservar al menos una actividad de foco web/ataque y una operativa/defensiva en la semana;
7. no seleccionar más de dos actividades por el mismo error en una sesión;
8. explicar cada recomendación.

Registrar qué habría elegido la cola fija para poder comparar.

## 7. Datos a registrar

### Por intento

- actividad, versión y condición;
- habilidad primaria;
- inicio, respuesta y cierre;
- tiempo a primera decisión;
- correcto/resultado;
- rúbrica de decisión/verificación;
- pista;
- confianza;
- error causal;
- respuesta original;
- teclas/transiciones solo en campos técnicos;
- correcciones;
- carga percibida 1–5;
- utilidad percibida 1–5;
- comentario opcional de una frase.

### Por sesión

- energía/interrupciones;
- duración;
- actividades abandonadas;
- recomendación y razón;
- fricción principal;
- si el usuario elegiría repetir ese formato.

### En tarea externa

- identificador y nivel;
- novedad previa;
- tiempo a primera acción útil;
- tiempo total;
- pistas/documentación/IA;
- ramas principales;
- resultado;
- evidencia de verificación;
- errores que TypeOps había observado o no.

## 8. Análisis

### H1

Comparar copia vs. producción:

- exactitud/tiempo mecánico;
- recuperación del significado;
- producción diferida desde intención;
- transferencia a variante.

Si copia solo mejora copia, mantenerla como calentamiento pequeño.

### H2

Comparar ítems elegidos por adaptación con ítems equivalentes de cola fija:

- recurrencia del mismo error;
- éxito siguiente sin pista;
- retención;
- utilidad de la razón mostrada.

La muestra será pequeña; importa también si las recomendaciones resultan obviamente redundantes o irrelevantes.

### H3

Comparar mecánica integrada vs. separada:

- exactitud cognitiva;
- exactitud mecánica;
- tiempo;
- carga;
- abandono.

### H4

Observar cuál métrica se relaciona consistentemente con tareas externas:

- tiempo de siguiente acción;
- precisión de decisión;
- verificación;
- reconstrucción;
- WPM/copia.

No ajustar un modelo predictivo con tan pocos datos.

### H5

Matriz utilidad × desempeño × disposición a repetir. No priorizar solo lo divertido ni solo lo difícil.

## 9. Criterios de decisión

### Continuar hacia MVP acotado si

- 7 de 10 sesiones se completan sin fricción excesiva;
- la mayoría de recomendaciones adaptativas se juzga relevante y al menos algunas corrigen errores posteriores;
- producción/decisión muestra mejora diferida o menor ayuda;
- al menos dos métricas internas distintas de WPM explican resultados externos;
- la carga media es sostenible y no hay caída sistemática al combinar formatos;
- el usuario prefiere conservar al menos tres familias de actividad;
- el coste de curar contenido parece aceptable.

No se exige significancia estadística. Se exige una historia causal creíble respaldada por intentos y transferencia.

### Modificar si

- las decisiones aportan pero la mecanografía interfiere: separar mecánica;
- la adaptación no aporta: mantener selección manual;
- el contenido es útil pero crear rúbricas cuesta demasiado: reducir respuestas abiertas;
- TypeOps aporta preparación pero no predice labs: mejorar fidelidad y evaluación;
- la IA domina el tiempo: introducir rondas propias antes de consultar.

### Abandonar el enfoque integrado si

- mejora copia pero no retención, decisión ni tarea externa;
- las recomendaciones son repetitivas o peores que elegir manualmente;
- la mezcla produce carga alta persistente;
- registrar y curar cuesta más que usar Anki + labs + notas;
- el usuario evita las sesiones después de la novedad;
- no aparece ninguna relación entre métricas internas y rendimiento real.

Abandonar TypeOps como plataforma no significa abandonar los fragmentos de práctica útiles; pueden quedar como rutina ligera coordinada con herramientas existentes.

## 10. Riesgos del experimento

- efecto de práctica por repetir dominios;
- dificultad desigual de actividades;
- autoevaluación sesgada;
- novedad;
- muestra de una persona;
- laboratorios no equivalentes;
- cambios de energía y tiempo;
- recuerdo de soluciones.

Mitigaciones:

- variantes;
- rubricas previas;
- orden alternado;
- registrar novedad y ayuda;
- usar medianas;
- conservar respuestas crudas;
- interpretar como descubrimiento, no demostración universal.

## 11. Entregable del experimento

Un informe de decisión de máximo dos páginas:

- qué mejoró y dónde se observó;
- qué no mejoró;
- qué actividades conservar/retirar;
- qué métricas predijeron transferencia;
- coste de contenido por sesión útil;
- decisión: coordinador ligero, MVP adaptativo, solo rutina de mecanografía o abandono.
