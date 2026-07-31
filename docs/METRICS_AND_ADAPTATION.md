# Métricas y adaptación

## 1. Principio

TypeOps no debe optimizar lo más fácil de contar. Las métricas sirven para elegir la próxima práctica y comprobar transferencia, no para producir una sensación de progreso.

Se mantienen dimensiones separadas. No se crea un puntaje total que permita que WPM alto compense un parche incorrecto, o que memoria factual compense incapacidad de actuar.

## 2. Métricas norte

Se recomienda un tablero pequeño de tres resultados:

### 1. Tasa de resolución verificada en tareas no vistas

Proporción de tareas de evaluación/transferencia completadas dentro de un tiempo razonable, sin ayuda no permitida y con evidencia suficiente.

Incluye por separado:

- resultado ofensivo autorizado;
- resultado defensivo con funcionalidad preservada;
- tareas operativas/automatización.

Es la métrica más cercana al objetivo, pero es costosa y ruidosa. Requiere muestras comparables y no debe calcularse con actividades de práctica conocidas.

### 2. Tiempo hasta la primera acción correcta y justificada

Desde que el estado está disponible hasta que el usuario formula o ejecuta una acción que:

- es pertinente;
- es segura;
- reduce incertidumbre o avanza el objetivo;
- incluye qué evidencia espera.

Se usa mediana por familia y dificultad. No es “tiempo hasta cualquier acción”: actuar impulsivamente no mejora la métrica.

### 3. Retención transferible

Proporción de habilidades críticas recuperadas y aplicadas correctamente a 7/21 días en una variante de superficie o contexto, sin pistas.

Se reportan por separado:

- recuperación;
- discriminación;
- aplicación.

Estas tres métricas forman un conjunto, no una suma. La primera confirma resultado; la segunda diagnostica decisión; la tercera indica durabilidad.

## 3. Métricas por capacidad

### Precisión de la acción

- porcentaje de acciones que avanzan o discriminan;
- acciones redundantes o sin hipótesis;
- acciones inseguras/prematuras;
- primer intento correcto;
- tasa de falso éxito.

### Tiempo de resolución

- tiempo total;
- tiempo hasta orientación;
- tiempo hasta primera acción útil;
- tiempo bloqueado;
- tiempo de recuperación tras error;
- tiempo de consulta/búsqueda/IA.

Comparar medianas y distribución, no solo promedio.

### Pistas y autonomía

- nivel máximo de pista;
- número de pistas;
- tiempo antes de pedir ayuda;
- resultado después de la pista;
- éxito en variante sin pista.

Una pista conceptual no equivale a mostrar la solución. Registrar su tipo.

### Calidad de decisión

Rúbrica ordinal, no falsa precisión:

0. fuera de alcance, insegura o irrelevante;
1. plausible pero sin hipótesis/evidencia;
2. útil, aunque omite riesgo o criterio;
3. priorizada, segura, verificable y sensible al contexto.

Guardar también la razón del evaluador y alternativas aceptables.

### Verificación

- define criterio antes de actuar;
- ejecuta control positivo;
- ejecuta control negativo;
- comprueba función legítima;
- distingue resultado parcial;
- conserva evidencia;
- declara limitaciones.

Reportar “tareas con verificación suficiente”, no cantidad bruta de checks.

### Fluidez con terminal

- tareas completadas sin consulta de sintaxis;
- correcciones por comando;
- errores de quoting/flags/rutas;
- tiempo de construcción desde intención;
- uso de edición frente a reescritura;
- explicación del comando;
- resultado correcto en entorno real.

### Automatización

- flujo repetible exitoso;
- targets/casos completados;
- fallos manejados vs. no manejados;
- timeout y retry correctos;
- tasa de parsing correcto;
- salida inequívoca;
- tiempo desde PoC manual a runner estable;
- tiempo de reparación ante cambio.

### IA

- tiempo hasta evidencia útil con y sin IA;
- respuestas que cambian la acción correctamente;
- defectos críticos detectados antes de ejecutar;
- defectos aceptados;
- iteraciones;
- contexto irrelevante u omitido;
- validación positiva/negativa;
- consultas que no aportaron progreso.

### Mecanografía técnica

- exactitud no corregida y final;
- correcciones por 100 caracteres;
- latencia por símbolo/transición;
- tiempo por secuencia relevante;
- estabilidad al producir desde intención;
- diferencia entre copia y reconstrucción.

WPM puede aparecer como diagnóstico secundario. No es norte ni proxy de competencia.

### Preparación ofensiva

- casos no vistos reconocidos;
- hipótesis válidas por caso y priorización;
- tiempo a prueba mínima;
- tasa de PoC reproducible;
- estabilidad/adaptación del exploit;
- evidencia de impacto;
- falsos positivos;
- transferencia a laboratorio mystery.

### Preparación defensiva

- tiempo a línea base y causa;
- cambio mínimo;
- vulnerabilidad cerrada;
- flujo legítimo preservado;
- disponibilidad/check equivalente;
- rollback preparado/probado;
- tiempo a restauración;
- calidad de monitoreo.

## 4. Datos útiles para adaptación

### Alta utilidad

- identificador y versión de actividad;
- habilidad/operación primaria;
- correcto y resultado observado;
- error causal etiquetado;
- tiempo activo y tiempo a primera decisión;
- pista por nivel;
- confianza previa al feedback;
- variante vista/no vista;
- fecha de última recuperación;
- evidencia de laboratorio;
- objetivo de especialización;
- prioridad competitiva;
- modo con/sin IA y con/sin presión;
- notas breves de postmortem.

### Utilidad condicionada

- pulsación, transición, símbolo, backspace y latencia;
- número de ediciones;
- longitud de prompt;
- frecuencia de sesiones;
- percepción de carga y utilidad;
- energía o interrupciones;
- navegación por pantallas.

Sirven para diagnosticar, no para inferir aprendizaje por sí solas.

### Engañosos si se usan como objetivo

- WPM global;
- caracteres escritos;
- tiempo total en la app;
- racha;
- actividades completadas;
- precisión en ítems repetidos;
- tasa de acierto con opciones;
- cantidad de prompts;
- cantidad de vulnerabilidades “cubiertas”;
- una autoevaluación de confianza sin calibración;
- un puntaje global de preparación.

## 5. Modelos de usuario separados

### Modelo de memoria

Por unidad recuperable:

- última fecha;
- historial correcto/incorrecto;
- ayuda;
- confianza;
- estabilidad estimada;
- próxima revisión.

### Modelo de competencia

Por habilidad × dominio:

- nivel de evidencia del mapa;
- muestras recientes;
- contexto y dificultad;
- éxito de transferencia;
- incertidumbre.

### Modelo de errores

Taxonomía causal:

- desconocimiento;
- recuerdo parcial;
- confusión;
- hipótesis incorrecta;
- acción no discriminante;
- interpretación;
- sintaxis;
- mecánica;
- verificación omitida;
- seguridad;
- presión;
- uso de IA.

### Modelo mecánico

- teclas/símbolos;
- bigramas o transiciones;
- secuencias técnicas;
- error inicial y correcciones;
- latencia robusta.

No infiere dedo físico ni ergonomía clínica.

### Modelo de contexto

- rol objetivo;
- fecha;
- tiempo disponible;
- reglamento conocido;
- dominios probables;
- herramientas disponibles;
- desempeño con presión e IA.

## 6. Política adaptativa inicial

No necesita aprendizaje automático. Cada candidato recibe razones visibles, no un “score de inteligencia”. El selector aplica filtros y prioridades:

1. **Seguridad y prerrequisitos:** excluir actividad insegura o demasiado avanzada.
2. **Repasos vencidos críticos:** seleccionar memoria/procedimiento de alta prioridad.
3. **Error recurrente de alto impacto:** una práctica focal, no muchas repeticiones.
4. **Objetivo de especialización:** mantener mayoría relevante a web/ataque mientras se garantiza piso defensivo.
5. **Variedad/intercalado:** evitar bloques que revelen la categoría.
6. **Transferencia:** insertar una variante no vista o tarea externa.
7. **Carga:** limitar novedad y evitar combinar alta dificultad cognitiva con secuencia mecánica extrema.
8. **Exploración:** reservar una pequeña fracción para medir habilidades con poca evidencia.

Una sesión puede mostrar:

> “Recomendado porque fallaste dos veces al elegir evidencia para autorización, la última recuperación fue hace 8 días y esta variante usa un formato distinto.”

## 7. Adaptaciones específicas

### Teclas y combinaciones débiles

- incluir 1–2 fragmentos coherentes que contengan la secuencia;
- preferir transformación a copia;
- no alterar sintaxis técnica para forzar caracteres;
- limitar el peso mecánico;
- verificar si mejora en producción, no solo en copia.

### Conceptos olvidados

- feedback breve;
- reintento inmediato;
- nueva recuperación espaciada;
- luego reconocimiento en contexto distinto;
- si vuelve a fallar, revisar el modelo conceptual, no solo reducir intervalo.

### Categorías débiles

- descomponer por operación;
- distinguir “no reconoce” de “no ejecuta”;
- mezclar con categoría confundida;
- exigir transferencia antes de aumentar nivel.

### Errores recurrentes

- etiquetar causa;
- crear una práctica focal;
- presentar caso negativo;
- retirar cuando desaparece en tareas auténticas.

### Tiempo de respuesta

- usar solo entre intentos correctos y comparables;
- no premiar velocidad con decisión pobre;
- detectar pausas extremas o abandono;
- añadir presión solo tras exactitud estable.

### Pistas utilizadas

- bajar evidencia de independencia;
- programar variante sin pista;
- distinguir pista de concepto, procedimiento y solución;
- no penalizar pedir ayuda oportunamente en una tarea de aprendizaje.

### Respuestas inseguras

- feedback inmediato y obligatorio;
- actividad de riesgo/reversibilidad;
- no aumentar presión;
- requerir explicación y alternativa segura.

### Dificultad de elegir la siguiente acción

- pedir hipótesis antes de comando;
- comparar dos acciones por valor de información;
- mostrar consecuencia;
- practicar con timebox;
- medir perseveración en ramas refutadas.

### Rendimiento en escenarios

- extraer 1–3 debilidades causales;
- no convertir cada detalle en tarjeta;
- seleccionar próxima práctica y posterior re-test;
- comparar microdesempeño con transferencia.

### Objetivos de especialización

Configurar bandas, no porcentajes rígidos:

- foco web/ofensivo dominante;
- fundamentos operativos recurrentes;
- piso defensivo obligatorio;
- exploración limitada de otros dominios;
- ajuste tras conocer equipo y servicios.

### Proximidad de competencia

- lejos: construir modelos, fundamentos y retención;
- medio plazo: aumentar variedad, automatización y laboratorios;
- cerca: más recuperación de alta prioridad, simulación, handoffs y presión; menos contenido nuevo;
- últimos días: conservar sueño, estabilidad, plantillas y evidencia; no perseguir catálogo.

## 8. Calibración y calidad de datos

### Confianza

Para respuestas principales, usar baja/media/alta antes del feedback. Analizar:

- exactitud por nivel de confianza;
- alta confianza incorrecta;
- baja confianza correcta.

### Tiempo

El tiempo se contamina por interrupciones. Registrar:

- pausa explícita;
- límite superior para ítems breves;
- mediana de varias muestras;
- tareas comparables;
- tiempo activo separado cuando sea posible.

### Evaluación manual

Las decisiones abiertas necesitan rúbrica. Para evitar autoengaño:

- conservar respuesta y justificación;
- aceptar múltiples opciones válidas;
- revisar muestras dudosas;
- versionar rúbricas;
- no reetiquetar resultados históricos silenciosamente.

## 9. Diseño de panel

El panel inicial debería responder:

- ¿qué puedo demostrar en tareas no vistas?
- ¿qué olvidé?
- ¿qué operación me bloquea?
- ¿qué recomendación tiene mayor valor hoy y por qué?
- ¿cómo se degrada mi desempeño con tiempo o IA?
- ¿qué evidencia falta antes de declarar una habilidad?

Vistas útiles:

- tres métricas norte;
- matriz habilidad × operación;
- errores recurrentes de alto impacto;
- repasos críticos;
- resultados de transferencia;
- tendencias mecánicas secundarias.

Evitar:

- velocímetro de WPM;
- nivel global;
- ranking de categorías por cantidad;
- gráficos sin decisión asociada.

## 10. Criterio de validez

Una métrica interna merece conservarse si predice o explica de forma repetida:

- éxito externo;
- tiempo en escenario;
- uso de pistas;
- errores críticos;
- retención.

Si no cambia una decisión de práctica ni se relaciona con transferencia, se elimina aunque sea fácil de visualizar.

