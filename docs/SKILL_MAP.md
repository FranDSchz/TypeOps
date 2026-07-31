# Mapa de habilidades

## 1. Propósito

El mapa evita organizar TypeOps como una lista de temas. “SQL injection” no es una habilidad única: incluye comprender el flujo de datos, reconocer señales, formular pruebas, ejecutar, interpretar, automatizar, remediar y verificar. El sistema debe modelar **qué operación puede realizar el usuario**, en qué contexto y con cuánta ayuda.

## 2. Capas del mapa

### A. Conocimiento y memoria

| Habilidad | Evidencia mínima | Dependencias |
|---|---|---|
| Conocimiento conceptual | Explica mecanismo, precondiciones, impacto y mitigación | Vocabulario y modelos de sistema |
| Recuperación de memoria | Produce una idea/procedimiento sin opciones ni fuente visible | Exposición y comprensión previas |
| Discriminación conceptual | Distingue conceptos confundibles y justifica la diferencia | Conceptos separados |
| Recuperación de procedimientos | Reconstruye pasos y checkpoints | Modelo mental + experiencia |

### B. Percepción y razonamiento

| Habilidad | Evidencia mínima | Dependencias |
|---|---|---|
| Reconocimiento de patrones | Detecta una señal en código, tráfico o logs sin etiqueta | Variedad de ejemplos |
| Construcción de hipótesis | Propone causas compatibles y las prioriza | Conceptos + observación |
| Selección de evidencia | Elige el dato que más reduce incertidumbre | Hipótesis y coste/riesgo |
| Toma de decisiones | Selecciona siguiente acción y explica por qué ahora | Priorización + evidencia |
| Interpretación | Actualiza la hipótesis a partir del resultado | Predicción explícita |
| Razonamiento adversarial | Identifica confianza, fronteras y abusos posibles | Modelo de aplicación |

### C. Ejecución

| Habilidad | Evidencia mínima | Dependencias |
|---|---|---|
| Uso de terminal | Navega, inspecciona y compone comandos con seguridad | Linux + shell |
| Bash | Usa quoting, pipes, redirección y control de errores con intención | Terminal |
| HTTP | Construye y modifica requests conservando sintaxis y estado | Protocolo + aplicación |
| Programación Python | Implementa, prueba y depura automatizaciones pequeñas | Lógica + librerías relevantes |
| Automatización robusta | Maneja timeout, retry, parsing, estado, logs y deduplicación | Programación + operación |
| Ejecución ofensiva | Demuestra y estabiliza una vía autorizada | Reconocimiento + herramientas |
| Ejecución defensiva | Reproduce, parchea, prueba y revierte | Servicio + causa + pruebas |
| Verificación de resultados | Distingue éxito real de salida aparente | Criterio observable |

### D. Operación competitiva

| Habilidad | Evidencia mínima | Dependencias |
|---|---|---|
| Estrategia Attack-Defense | Prioriza acciones según impacto, tiempo, riesgo y estado | Modelo del juego |
| Gestión de servicio | Mantiene contrato funcional y datos | Linux + aplicación |
| Gestión de evidencia | Registra comandos, outputs, cambios y estado | Disciplina operativa |
| Handoff | Otro operador puede continuar sin reconstruir todo | Síntesis + evidencia |
| Rendimiento bajo presión | Conserva calidad al limitar tiempo e intercalar tareas | Automatización de fundamentos |
| Recuperación de errores | Detecta, contiene, revierte y aprende | Observabilidad + control |

### E. IA como herramienta

| Habilidad | Evidencia mínima | Dependencias |
|---|---|---|
| Construcción de contexto | Entrega objetivo, entorno, evidencia y restricciones suficientes | Comprensión propia |
| Formulación de solicitud | Pide una salida verificable y adecuada a la etapa | Plan de trabajo |
| Revisión crítica | Detecta supuestos, errores y omisiones | Conocimiento del dominio |
| Validación | Prueba el resultado con controles positivos/negativos | Verificación técnica |
| Iteración | Corrige el contexto y solicita el próximo delta útil | Diagnóstico |
| Decisión de consulta | Usa IA cuando el valor esperado supera coste y riesgo | Metacognición operativa |

### F. Mecánica

| Habilidad | Evidencia mínima | Dependencias |
|---|---|---|
| Mecanografía técnica | Produce secuencias relevantes con baja tasa de corrección | Familiaridad con teclado |
| Edición de línea | Corrige y transforma una línea sin reescribirla innecesariamente | Teclado + terminal |
| Sintaxis de símbolos | Maneja comillas, barras, pipes, guiones y delimitadores | Layout conocido |
| Fluidez de tool-switching | Cambia entre lectura, edición y ejecución sin perder estado | Práctica auténtica; solo parcialmente medible en TypeOps |

## 3. Dos ejes que no deben confundirse

Cada habilidad tiene al menos dos coordenadas:

- **dominio:** Linux, HTTP, acceso, inyección, servicios, IA, etc.;
- **operación:** recordar, reconocer, decidir, ejecutar, interpretar, verificar.

Ejemplo:

```text
Broken Access Control
├── explicar el modelo de autorización
├── reconocer una comprobación ausente
├── elegir una comparación entre dos identidades
├── construir requests válidos
├── interpretar diferencias
├── demostrar impacto autorizado
├── proponer un control del lado servidor
└── verificar flujo legítimo y negativo
```

Esto permite detectar perfiles asimétricos: conocimiento alto con ejecución baja, o ejecución memorizada con razonamiento frágil.

## 4. Dependencias principales

```text
Modelos de Linux, red, HTTP y aplicación
             |
             v
 Recuperación + reconocimiento
             |
             v
 Hipótesis -> acción -> interpretación
             |                |
             +------v---------+
                    |
     ejecución técnica y herramientas
          /                    \
      ataque                  defensa
          \                    /
           automatización + verificación
                    |
          estrategia y operación

Comprensión propia -> contexto para IA -> revisión -> validación

Mecanografía técnica reduce fricción en ejecución,
pero no es prerrequisito para comprender ni decidir.
```

Las dependencias no exigen un currículo estrictamente lineal. Se puede introducir una tarea auténtica temprano y volver al prerrequisito que bloquea el progreso.

## 5. Escala de evidencia

No se usa una barra abstracta de 0 a 100. Para cada habilidad se conserva el mejor nivel demostrado recientemente:

0. **No observado:** no hay evidencia.
1. **Reconocido:** identifica con opciones o ejemplo muy cercano.
2. **Recuperado:** produce sin opciones en contexto familiar.
3. **Aplicado:** resuelve una variante con guía limitada.
4. **Transferido:** resuelve una variante no vista y sin etiqueta.
5. **Operado bajo presión:** mantiene resultado, seguridad y verificación con tiempo/intercalado.

El nivel debe incluir:

- fecha y número de muestras;
- contexto y variante;
- ayuda utilizada;
- exactitud y resultado;
- tiempo;
- confianza;
- evidencia externa si la hubo.

Puede degradarse por olvido o por evidencia contradictoria. Un único éxito no prueba estabilidad.

## 6. Cómo medir cada familia

| Familia | Medidas primarias | Medidas de diagnóstico |
|---|---|---|
| Conceptual | Explicación causal con elementos esenciales | Omisiones y conceptos confundidos |
| Memoria | Recuperación correcta diferida | Latencia, pistas, confianza |
| Patrones | Detección en casos mezclados/no vistos | Falsos positivos y señal usada |
| Razonamiento | Hipótesis coherentes y evidencia discriminante | Acciones sin propósito |
| Decisión | Primera acción útil, segura y justificada | Alternativas, coste y riesgo |
| Terminal/HTTP | Resultado y corrección sintáctica/semántica | Ediciones, errores, tiempo |
| Programación | Tests/criterios cumplidos en variante | Robustez, depuración, ayuda |
| Ataque | Objetivo autorizado demostrado y reproducible | Estabilidad y adaptación |
| Defensa | Vulnerabilidad cerrada con función preservada | Regresión, rollback, tiempo |
| IA | Resultado útil validado por minuto | Contexto, iteraciones, errores aceptados |
| Verificación | Controles relevantes ejecutados | Éxitos declarados sin evidencia |
| Mecanografía | Precisión y tiempo por secuencia en producción | tecla/transición/símbolo; nunca dedo inferido |
| Presión | Degradación respecto de línea base | impulsividad, perseveración, recuperación |

## 7. Habilidades transversales críticas

### Verificación

Debe aparecer en todas las ramas:

- ataque: ¿se obtuvo el efecto esperado por la causa propuesta?
- defensa: ¿se cerró la vía y sigue funcionando el flujo legítimo?
- automatización: ¿maneja error, timeout y resultado parcial?
- IA: ¿la respuesta coincide con documentación, código y ejecución?
- terminal: ¿la salida demuestra el objetivo y no un proxy superficial?

### Calibración

Registrar confianza antes del feedback permite distinguir:

- error con alta confianza: modelo mental peligroso;
- acierto con baja confianza: conocimiento frágil;
- error con baja confianza: desconocimiento reconocido;
- acierto con alta confianza: candidato a intervalos más largos o transferencia.

### Seguridad operativa

Una acción técnicamente eficaz pero fuera de alcance, irreversible o no verificada no es correcta. Las rúbricas deben penalizar explícitamente:

- objetivo no autorizado;
- comando destructivo no justificado;
- falta de backup/rollback cuando corresponde;
- exposición de secretos;
- pérdida de evidencia;
- cambio defensivo sin prueba funcional.

## 8. Perfil inicial sugerido

Con un nivel principiante absoluto y 22 días, el diagnóstico debe ser corto y también enseñar el formato de práctica:

- 4–6 contrastes de fundamentos: proceso/servicio/puerto, cliente/servidor y auth/authz;
- 3–4 tareas de terminal de solo lectura;
- 2–3 lecturas o construcciones HTTP;
- 2 decisiones de siguiente acción;
- 1 ejercicio de verificación;
- 1 crítica de IA o handoff;
- 1 tarea externa beginner con ayuda permitida.

No se incluyen microescenarios ofensivos avanzados hasta que sus prerrequisitos estén presentes. El propósito es elegir el siguiente bloque de aprendizaje, no certificar competencia ni llenar todos los niveles del mapa.
