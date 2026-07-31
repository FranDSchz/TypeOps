# Modelo de aprendizaje

## 1. Objetivo del sistema

El sistema de aprendizaje debe aumentar la probabilidad de que, ante una situación nueva y bajo tiempo, el usuario pueda **recuperar conocimiento relevante, reconocer la estructura, decidir, ejecutar e interpretar sin depender de que el ejercicio anuncie la respuesta**.

No basta con mejorar durante la sesión. El aprendizaje se demuestra por retención diferida y transferencia.

## 2. Bucle de aprendizaje

```text
Diagnóstico breve
      |
      v
Modelo mental mínimo + ejemplo
      |
      v
Recuperación / reconocimiento focal
      |
      v
Microescenario con decisión
      |
      v
Ejecución o construcción
      |
      v
Feedback + reintento
      |
      v
Reaparición espaciada en otro formato
      |
      v
Evaluación acumulativa sin etiqueta
      |
      v
Transferencia a laboratorio
      |
      +----> errores y evidencia actualizan el diagnóstico
```

No todas las sesiones recorren el ciclo completo. Las tareas externas, más largas, pueden ocurrir una o dos veces por semana.

## 3. Mecanismos con valor real

### Recuperación activa

El usuario intenta producir la respuesta antes de verla. Puede ser una explicación, un comando, un criterio, una hipótesis o una secuencia de pasos.

Impacto en producto:

- ocultar opciones cuando la habilidad objetivo es producir;
- exigir una respuesta antes del feedback;
- después de un error, mostrar una explicación breve y volver a pedir recuperación;
- evitar calificar como aprendido lo que solo fue leído.

Karpicke y Blunt observaron ventajas de la práctica de recuperación incluso en preguntas de comprensión e inferencia ([estudio](https://pubmed.ncbi.nlm.nih.gov/21252317/)). No implica que una flashcard enseñe por sí sola explotación o defensa.

### Repetición espaciada

Se vuelve a pedir una recuperación después de un intervalo, idealmente cerca del momento en que comienza a ser difícil.

Impacto en producto:

- espaciar **unidades de conocimiento y procedimientos breves**, no escenarios enteros idénticos;
- aumentar el intervalo tras recuperaciones independientes;
- acortarlo ante errores, pistas o alta confianza incorrecta;
- separar “lo recordó” de “lo ejecutó”;
- permitir que la fecha de competencia reduzca intervalos y aumente repasos críticos, sin acumular todo al final.

La revisión cuantitativa de Cepeda et al. respalda la práctica distribuida ([PubMed](https://pubmed.ncbi.nlm.nih.gov/16719566/)). [Anki](https://docs.ankiweb.net/background.html) ya implementa recuperación y espaciado para tarjetas; TypeOps solo necesita un planificador propio si la unidad y la evidencia operacional no encajan allí.

### Práctica intercalada

Se mezclan problemas de tipos confundibles para obligar a elegir el método, en lugar de aplicar el tema anunciado.

Impacto en producto:

- mezclar IDOR, filtración, autenticación y lógica de negocio;
- mezclar caída de proceso, dependencia, configuración y fallo funcional;
- pedir primero “¿qué comprobarías?” antes de revelar la categoría;
- intercalar ataque, defensa y verificación del mismo mecanismo.

Rohrer y Taylor encontraron ventajas de práctica espaciada y mezclada en problemas matemáticos ([resumen ERIC](https://eric.ed.gov/?id=EJ786797)); Kornell y Bjork estudiaron el intercalado en aprendizaje de categorías ([PubMed](https://pubmed.ncbi.nlm.nih.gov/18578849/)). La transferencia a ciberseguridad es una hipótesis razonable que debe medirse.

### Ejemplos contextualizados y ejemplos resueltos

Un principiante puede gastar toda su capacidad intentando buscar una solución sin construir un modelo útil. Un ejemplo resuelto muestra:

- objetivo;
- observaciones;
- hipótesis;
- acción;
- resultado esperado;
- interpretación;
- riesgo;
- verificación.

Después se retiran pasos gradualmente: completar una parte, ordenar pasos, resolver una variante, resolver sin guía. No debe convertirse en copiar payloads.

### Microescenarios

Presentan suficiente estado para tomar una decisión realista en 1–5 minutos:

- un log y un síntoma;
- dos requests de usuarios distintos;
- un diff y un healthcheck;
- una respuesta de IA y evidencia local;
- una automatización con fallos intermitentes.

Su valor es practicar muchos ciclos de decisión y feedback. Su límite es la fidelidad: no reemplazan el comportamiento emergente de un servicio.

### Práctica deliberada

Aquí significa práctica enfocada en un error observable, con objetivo estrecho, feedback y reintento; no simplemente “hacer más CTF”.

Ejemplos:

- elegir evidencia que discrimine hipótesis;
- corregir quoting recurrente;
- añadir un timeout y distinguir sus errores;
- escribir una prueba negativa de autorización;
- detectar que una respuesta de IA inventó una ruta.

La unidad debe ser lo bastante pequeña para recibir feedback, pero lo bastante auténtica para conservar significado.

### Feedback inmediato

Debe decir:

- qué parte fue correcta;
- qué evidencia faltó;
- por qué una acción era prematura o riesgosa;
- qué resultado habría cambiado la decisión;
- cuál es el siguiente reintento.

Para recuperación factual y sintaxis, puede ser inmediato. Para una evaluación acumulativa, conviene retrasarlo hasta cerrar el caso para evitar pistas entre subpreguntas.

### Evaluación acumulativa

Cada cierto número de sesiones se presentan habilidades previas, mezcladas y sin etiquetas. No introduce enseñanza nueva y no permite ayuda.

Mide:

- retención;
- discriminación;
- transferencia cercana;
- degradación por tiempo;
- calibración de confianza.

El panel debe separar rendimiento durante práctica de rendimiento en evaluación.

### Adaptación según errores

La adaptación selecciona la próxima oportunidad de aprendizaje, no “baja o sube el nivel” de manera genérica. Usa:

- concepto o operación fallida;
- causa del error;
- ayuda usada;
- antigüedad de la última evidencia;
- relevancia competitiva;
- desempeño en variante;
- carga de la sesión.

Un typo no debe convertir un ítem conceptual correcto en “concepto olvidado”; una respuesta conceptualmente incorrecta no se arregla repitiendo sus caracteres.

### Reaparición en formatos distintos

Ejemplo con IDOR:

1. explicar autorización por objeto;
2. identificar el problema en un handler;
3. comparar dos requests;
4. elegir la prueba mínima;
5. reconstruir HTTP;
6. revisar un parche;
7. definir pruebas positiva y negativa;
8. encontrar la misma estructura sin etiqueta en un laboratorio.

La reaparición debe conservar la estructura causal y variar la superficie. Variaciones cosméticas no prueban transferencia.

## 4. Diseño de una sesión

### Sesión diaria de 20 minutos

- **3 min — recuperación vencida:** 3–5 ítems cortos.
- **3 min — fluidez técnica:** una secuencia contextual o corrección, solo si hay debilidad mecánica relevante.
- **8 min — decisión y ejecución:** 1–2 microescenarios.
- **4 min — variante o integración:** mismo concepto en otro formato.
- **2 min — cierre:** confianza, error principal y próxima evidencia necesaria.

No es una cuota rígida. Si hay una tarea de transferencia, la sesión puede limitarse a preparación y debrief.

### Sesión externa semanal

- 45–90 minutos en un laboratorio autorizado;
- objetivo y criterio de salida definidos;
- registro de tiempo hasta primera acción útil, pistas y resultado;
- postmortem breve;
- extracción de 1–3 debilidades para TypeOps, no de todo el walkthrough.

## 5. Progresión de ayuda y presión

### Ayuda

1. ejemplo resuelto;
2. checklist visible;
3. pista conceptual;
4. pista de herramienta;
5. respuesta parcial;
6. ejecución independiente.

El orden real va retirando ayuda; la lista representa tipos de soporte. Toda pista se registra por nivel y contenido.

### Presión

1. sin tiempo, una habilidad;
2. tiempo orientativo;
3. límite blando;
4. categorías mezcladas;
5. información incompleta;
6. interrupción o cambio de prioridad;
7. escenario coordinado real.

No se añade presión si todavía predominan errores de comprensión. La comparación relevante es cuánto se degrada la calidad respecto de la línea base sin presión.

## 6. Producción breve, no texto largo por defecto

La respuesta adecuada depende de la habilidad:

- seleccionar una evidencia;
- ordenar tres acciones;
- marcar una línea vulnerable;
- editar un fragmento;
- escribir un comando;
- construir una request;
- predecir una salida;
- indicar “actuar / consultar / escalar”;
- explicar en una frase;
- ejecutar en laboratorio y adjuntar evidencia.

Escribir explicaciones extensas sirve para comprobar modelos causales en algunos puntos, no como interfaz universal.

## 7. Qué complejidad evitar

### Aporta valor temprano

- cola de repasos simple;
- errores etiquetados;
- pistas graduadas;
- variantes curadas;
- rubricas claras;
- pruebas diferidas;
- comparación práctica vs. transferencia;
- razón visible de recomendación.

### Posponer

- generación automática de actividades;
- knowledge tracing probabilístico;
- embeddings para clasificar respuestas;
- evaluación libre por LLM;
- simulación adaptativa generativa;
- optimización multiobjetivo automática;
- dificultad calculada por población;
- gamificación compleja.

Con un único usuario, la calidad del contenido y de la rúbrica domina la sofisticación algorítmica.

### Descartar inicialmente

- repetir teclas aisladas cientos de veces;
- puntos por volumen de caracteres;
- “estilos de aprendizaje” como perfil;
- inferencia de dedo físico;
- respuesta correcta por coincidencia exacta cuando existen alternativas válidas;
- cronómetro siempre visible;
- penalizar búsqueda documental cuando la tarea real admite documentación.

## 8. Evitar ilusión de aprendizaje

Controles:

- incluir ítems señuelo y casos negativos;
- no mostrar siempre la categoría;
- pedir predicción antes de resultado;
- medir retención a 7 y 21 días;
- usar variantes no vistas;
- registrar si la solución fue recordada del ítem;
- alternar producción y reconocimiento;
- comprobar en laboratorio;
- pedir explicación de por qué alternativas son peores;
- separar confianza de exactitud.

## 9. Evidencia mínima para afirmar utilidad

No basta con que el usuario “sienta que aprende”. Deben aparecer, con muestras repetidas:

- mayor retención diferida que una línea base;
- menor tiempo hasta una acción correcta en casos nuevos;
- menos pistas;
- mejor verificación;
- mejor resultado o menor tiempo en laboratorios relacionados;
- carga percibida sostenible;
- relación entre las recomendaciones y una mejora posterior.

Si solo mejora la copia, TypeOps debe reducirse a un calentamiento complementario o abandonarse como producto central.

