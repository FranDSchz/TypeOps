# TypeOps: visión de producto

## Resumen ejecutivo

TypeOps no debería ser “Keybr con comandos de hacking”. Debería ser un sistema personal de preparación que reduce el tiempo entre **observar una situación competitiva y producir una acción correcta, explicable y verificada**.

La mecanografía técnica sigue siendo útil, pero como una capa subordinada. El producto debe aprovechar comandos, código, HTTP y logs para mejorar fluidez mecánica sin confundir copiar una cadena con saber cuándo usarla. El resultado buscado no es escribir más rápido; es resolver mejor tareas nuevas bajo presión, con menos pistas, menos acciones inútiles y menos errores que rompan servicios.

La primera apuesta de producto es deliberadamente pequeña:

> Una sesión diaria corta que selecciona recuperación de memoria, decisiones y microtareas de ejecución según olvidos y errores observados, y que periódicamente comprueba transferencia en escenarios nuevos y laboratorios externos.

No se recomienda construir inicialmente un laboratorio vulnerable, una terminal remota, un LMS, un clon de Anki, una plataforma CTF ni una integración obligatoria con una API de IA.

### Recalibración al 31 de julio de 2026

El usuario es principiante absoluto y Cyber War será el 22 de agosto. Con 22 días, un equipo de tres y una duración preliminar de 90–120 minutos, la visión de largo plazo se conserva, pero la decisión inmediata cambia:

- TypeOps V0 será un **protocolo manual con contenido beginner-first**, no una aplicación;
- el piso compartido de Linux, servicios, red, HTTP, verificación y coordinación precede a la especialización;
- la mecanografía se observa dentro de comandos, `curl` y Python;
- el experimento de producto no puede desplazar laboratorios ni práctica de equipo;
- CLI y web local se reconsideran después de evidencia de fricción, idealmente después de la competencia.

El contexto autoritativo para el evento está en [CYBER_WAR_2026_CONTEXT.md](CYBER_WAR_2026_CONTEXT.md).

## 1. Reformulación del problema

### Problema real

La competencia exige convertir conocimiento disperso en rendimiento operativo:

1. reconocer señales relevantes;
2. formar y priorizar hipótesis;
3. elegir el siguiente paso con buena relación información/tiempo/riesgo;
4. ejecutar una acción de manera precisa;
5. interpretar su resultado;
6. adaptar el plan;
7. conservar, automatizar o comunicar lo que funciona;
8. verificar que ataque, defensa y disponibilidad siguen comportándose como se espera.

La fricción de teclado puede retrasar ese ciclo, pero rara vez es su cuello de botella principal. TypeOps debe mejorar el ciclo completo y medir cada parte por separado.

### Resultados que debería producir

En tareas autorizadas y comparables, el usuario debería:

- llegar antes a una **primera acción útil y justificada**;
- reconocer patrones conocidos aunque cambien el lenguaje, endpoint o contexto;
- recordar procedimientos críticos después de días o semanas;
- formular y descartar hipótesis con evidencia;
- ejecutar terminal, HTTP y pequeños cambios de código con menos correcciones;
- convertir una explotación manual en una automatización robusta;
- diagnosticar y parchear sin perder funcionalidad legítima;
- usar IA para reducir tiempo sin delegarle juicio ni verificación;
- distinguir lo sabido, lo supuesto y lo todavía no comprobado;
- mantener rendimiento aceptable al mezclar tareas y añadir presión temporal.

### Problemas diferentes que la idea inicial mezcla

| Problema | Naturaleza | Relación con la competencia |
|---|---|---|
| Fluidez de teclado | Psicomotora y específica de secuencias | Reduce fricción local |
| Memoria de comandos y conceptos | Recuperación de conocimiento | Permite actuar sin buscar todo |
| Diagnóstico y selección de acciones | Razonamiento situado | Suele determinar el progreso |
| Explotación y parcheo | Ejecución en sistemas reales | Produce el resultado competitivo |
| Automatización | Ingeniería bajo restricciones | Escala acciones repetibles |
| Estrategia Attack-Defense | Priorización y coordinación | Decide dónde invertir minutos escasos |
| Uso de IA | Delegación, comunicación y control de calidad | Puede acelerar o introducir errores |
| Gestión de conocimiento | Referencia y recuperación externa | Reduce búsqueda y pérdida de contexto |

### Qué integrar

Conviene integrar cuando una misma actividad permite observar una cadena causal real. Por ejemplo:

- leer un log, elegir una hipótesis, escribir un comando de observación e interpretar una salida;
- reconstruir una petición HTTP, explicar el control de acceso esperado y detectar una variante insegura;
- revisar un parche generado por IA, identificar un fallo y proponer la prueba funcional;
- repetir una secuencia técnica débil dentro de comandos cuyo significado ya se comprende.

La integración aporta valor si conserva mediciones separables: decisión, ejecución, interpretación y mecánica.

### Qué mantener separado

- **Adquisición conceptual y simulación cronometrada:** primero puede necesitarse apoyo; después se mide desempeño sin ayuda.
- **Práctica de copia y producción desde intención:** copiar entrena secuencias; producir desde un objetivo entrena recuperación y decisión.
- **Modelo de memoria y modelo de ejecución:** recordar qué hace `find` no demuestra usarlo bien en un host.
- **Ataque y defensa:** deben conectarse por la misma causa vulnerable, pero evaluarse con objetivos y riesgos distintos.
- **Práctica dentro de TypeOps y laboratorio real:** la aplicación puede preparar, lanzar y registrar; no debe fingir equivalencia con un sistema vivo.
- **Entrenar el uso de IA e integrar IA:** lo primero puede hacerse con respuestas guardadas o con la herramienta elegida por el usuario.
- **Velocidad y exactitud:** una mejora en una no compensa automáticamente el deterioro de la otra.

## 2. Supuestos que hay que cuestionar

1. **“Contenido útil + mecanografía produce aprendizaje técnico.”** Copiar puede generar familiaridad sin recuperación, comprensión ni transferencia.
2. **“Los errores de tecla revelan la necesidad más importante.”** Son fáciles de medir y por eso pueden desplazar debilidades más valiosas pero menos visibles.
3. **“Más categorías producen mejor preparación.”** Una lista amplia puede diluir el tiempo destinado al probable rol web/ofensivo y a las capacidades defensivas mínimas.
4. **“Una aplicación puede reemplazar laboratorios.”** No reproduce estados, permisos, latencia, fallos parciales, herramientas ni consecuencias de un servicio real.
5. **“La adaptación requiere un algoritmo sofisticado.”** Con un solo usuario y pocos datos, reglas transparentes y revisión humana pueden superar un modelo opaco.
6. **“Practicar siempre bajo tiempo mejora el rendimiento bajo presión.”** Cronometrar demasiado pronto puede premiar impulsividad y esconder comprensión frágil.
7. **“La IA permitida elimina la necesidad de recordar.”** Sin modelos mentales no se selecciona buen contexto ni se detectan respuestas plausibles pero incorrectas.
8. **“Todas las vulnerabilidades enumeradas merecen cobertura inicial.”** La prioridad debe surgir del rol, el reglamento, los servicios probables, una evaluación diagnóstica y evidencia de transferencia.
9. **“Un resultado correcto demuestra dominio.”** Puede ser azar, reconocimiento superficial, memorización del ítem o ayuda no registrada.
10. **“Gamificación mejora adherencia y por lo tanto aprendizaje.”** Puede optimizar rachas, puntos o volumen de respuestas sin mejorar tareas nuevas.

## 3. Riesgo de construir algo entretenido pero poco útil

Las señales de alerta serían:

- sesiones largas con muchos caracteres y pocas decisiones;
- WPM, rachas o XP como portada mientras no se miden tareas no vistas;
- contenido reconocible por etiquetas (“esto es SQLi”) que elimina el diagnóstico;
- ejercicios autocontenidos con una única respuesta textual exacta;
- dificultad creada por ruido o tiempo, no por decisiones relevantes;
- feedback que muestra la solución sin exigir una nueva recuperación;
- “escenarios” que son cuestionarios con decoración;
- laboratorios simulados sin fidelidad suficiente para que sus resultados transfieran;
- adaptación que repite lo que produce errores frecuentes, aunque tenga bajo valor competitivo;
- crecimiento del catálogo sin retirar actividades que no predicen desempeño.

La defensa principal es un **test de transferencia recurrente**: una tarea nueva, con señales incompletas, ejecutada en un entorno auténtico o una representación suficientemente fiel, evaluada por resultado y evidencia.

## 4. Visión y propuesta de valor

### Visión

Convertir cada sesión corta de preparación en una mejora observable de la capacidad para decidir, ejecutar y verificar durante un Attack-Defense CTF.

### Propuesta de valor

TypeOps transforma errores de práctica, olvidos y resultados de escenarios en la próxima actividad de mayor valor; combina memoria, decisión y fluidez técnica, y dirige al usuario a laboratorios reales para demostrar transferencia.

### Usuario inicial

Una sola persona, principiante absoluta, que se prepara para competir dentro de un equipo de tres. Puede explorar una especialización web/ofensiva, pero primero necesita un piso operativo de Linux, HTTP, defensa, verificación, IA y coordinación. El diseño puede ser explícitamente personal: edición manual de contenido, reglas visibles y ausencia de funciones multiusuario son ventajas iniciales.

## 5. Principios de diseño

1. **Resultado antes que actividad:** “servicio recuperado y verificado” vale más que “20 preguntas completadas”.
2. **Decisión antes que velocidad:** medir cuándo aparece una acción útil, no solo cuándo termina el texto.
3. **Evidencia antes que confianza:** toda respuesta operacional debe incluir qué salida confirmaría o refutaría la hipótesis.
4. **Separar dimensiones:** memoria, juicio, ejecución, verificación y mecánica conservan métricas propias.
5. **Transferencia por diseño:** variar contexto, ocultar etiquetas y usar periódicamente tareas no vistas.
6. **Dificultad con propósito:** aumentar independencia, ambigüedad o presión solo después de competencia básica.
7. **Adaptación explicable:** cada recomendación debe poder decir “por qué ahora”.
8. **Seguridad por construcción:** nada se ejecuta contra objetivos no autorizados; los ejemplos peligrosos son inertes o viven en laboratorios aislados.
9. **Reusar el ecosistema:** enlazar laboratorios, documentación y Anki donde ya resuelven bien el problema.
10. **Contenido como producto:** versionar cada actividad, sus objetivos, criterios y evidencia, no tratarla como texto de relleno.
11. **Coste de mantenimiento visible:** una función que exige contenido o evaluación manual recurrente debe justificarlo.
12. **Eliminar sin nostalgia:** si una actividad no mejora ni predice transferencia, se reduce o retira.

## 6. Alcance recomendado

### Núcleo inicial

- inventario pequeño de habilidades y dependencias;
- ítems breves de recuperación y reconocimiento;
- microescenarios de “siguiente acción” con justificación y evidencia esperada;
- reconstrucción o corrección de comandos, Python y HTTP;
- revisión de respuestas de IA almacenadas;
- captura de intentos, tiempos, pistas, confianza y tipos de error;
- cola adaptativa sencilla;
- evaluaciones acumulativas y tareas de transferencia enlazadas a laboratorios externos;
- análisis secundario de teclas, símbolos y secuencias dentro de producción técnica.

### Fuera de alcance inicial

- terminal o navegador remoto propio;
- ejecución automática de payloads;
- generación dinámica de exploits;
- plataforma Attack-Defense completa;
- colaboración de equipos, scoreboard o envío de flags;
- catálogo exhaustivo de web, pwn, crypto, reversing, móvil y comunicaciones;
- tutor generativo integrado;
- biometría de pulsaciones o inferencia del dedo físico;
- predicción “inteligente” basada en pocos datos;
- sistema social, logros, marketplace o autoría colaborativa;
- reemplazo de PortSwigger Academy, OverTheWire, picoGym, HTB, TryHackMe o Anki.

## 7. Arquitectura conceptual, sin tecnologías

```text
Objetivo competitivo y perfil
            |
            v
  Mapa de habilidades <---- Evidencia externa de laboratorios
            |
            v
 Modelos separados del usuario
 memoria | decisión | ejecución | mecánica | presión
            |
            v
 Selector explicable de actividad
 vencimiento + debilidad + relevancia + variedad + carga
            |
            v
 Motor de actividad y feedback
            |
            v
 Registro de intento y evidencia
            |
      +-----+------+
      |            |
 adaptación   evaluación acumulativa/transferencia
```

Componentes conceptuales:

- **Perfil y objetivos:** rol primario, piso defensivo, fecha y restricciones conocidas.
- **Grafo de habilidades:** capacidades observables y prerrequisitos.
- **Repositorio de contenido:** unidades, variantes, fuentes, seguridad y rúbricas.
- **Motor de sesiones:** combina repaso debido, debilidad prioritaria y transferencia.
- **Evaluadores:** exactos cuando corresponde; rúbricas y autoexplicación cuando no.
- **Modelos del usuario:** estados independientes con incertidumbre explícita.
- **Registro de evidencia:** intentos, resultados, artefactos y procedencia.
- **Panel de decisión:** muestra tendencias accionables, no una puntuación total.
- **Conectores externos ligeros:** enlaces y registro manual/importado de laboratorios; no control del entorno en la primera fase.

## 8. Modelo de contenido

La unidad mínima no es una “lección”, sino una **actividad versionada**:

- identificador y versión;
- objetivo observable;
- habilidades primarias y secundarias;
- prerrequisitos;
- contexto de competencia;
- estímulo y artefactos;
- respuesta esperada y alternativas aceptables;
- rúbrica por decisión, ejecución, explicación y verificación;
- errores frecuentes y feedback;
- pistas escalonadas con su coste;
- nivel de riesgo y requisito de aislamiento;
- variantes de superficie y de estructura;
- fuente, fecha de revisión y autor;
- estimación de tiempo;
- criterio de retiro o actualización.

Un mismo **concepto** debe poder originar varias actividades: recordar, reconocer, elegir, ejecutar, depurar, defender y verificar. Eso permite reaparición sin repetir literalmente el mismo ítem.

## 9. Modelo de actividad, adaptación y evaluación

Cada intento recorre:

1. **Orientar:** qué se sabe, cuál es el objetivo y qué restricciones existen.
2. **Responder:** recordar, elegir o producir sin revelar aún la solución.
3. **Justificar:** por qué esa acción y qué riesgo evita.
4. **Verificar:** qué evidencia distinguiría éxito de apariencia de éxito.
5. **Feedback:** contraste específico con el razonamiento y el resultado esperados.
6. **Reintento o variante:** recuperar de nuevo, no solo leer.
7. **Registrar:** resultado, ayuda, tiempo, confianza y error causal.

El selector inicial debería ser una política simple:

- reservar una parte para repasos vencidos;
- priorizar errores recurrentes de alto valor;
- mantener el foco de especialización;
- incluir un piso defensivo y operativo;
- intercalar categorías confundibles;
- limitar la carga de novedad;
- incluir transferencia periódica;
- insertar práctica mecánica solo cuando no opaque el objetivo cognitivo.

No debe calcularse un “nivel TypeOps” único. La evaluación se presenta como un perfil con intervalos de incertidumbre y muestras recientes.

## 10. Papel de la mecanografía

La mecanografía aporta valor en cuatro lugares:

- **calentamiento contextual** de 2–4 minutos con secuencias útiles;
- **reconstrucción**, donde el usuario produce un comando o petición desde intención;
- **corrección**, donde edita una línea defectuosa en vez de copiarla;
- **fluidez observada**, capturada de forma pasiva durante otras actividades.

Las señales válidas incluyen tecla, símbolo, transición, error, corrección y latencia. No permiten afirmar qué dedo físico se usó. Las secuencias débiles se incorporan a contenido técnicamente coherente, pero no desplazan repasos vencidos ni escenarios de alto valor.

## 11. Decisiones iniciales y estado

| Decisión | Estado | Razón | Evidencia que podría cambiarla |
|---|---|---|---|
| TypeOps será un preparador adaptativo, no un tutor de mecanografía | Recomendada | Mejor alineación con desempeño competitivo | Que el experimento muestre mejora mecánica transferible pero ninguna mejora cognitiva |
| Los laboratorios reales serán externos al inicio | Recomendada | Ya existen opciones maduras y construirlos es costoso/riesgoso | Un vacío específico de Attack-Defense que ningún entorno pueda representar |
| Adaptación por reglas visibles | Recomendada | Un usuario, pocos datos y necesidad de interpretar recomendaciones | Volumen suficiente y prueba comparativa de un modelo mejor |
| V0 será protocolo manual | Decidida hasta el postmortem del evento | Utilidad inmediata y mínimo mantenimiento en 22 días | Fricción manual repetida que una CLI pueda ahorrar |
| Fundamentos compartidos preceden al foco web/ataque | Decidida para la preparación inmediata | Nivel principiante, equipo de tres y reglamento incompleto | Diagnóstico del equipo y servicios confirmados |
| IA se entrenará sin integración obligatoria | Recomendada | Portabilidad, menor coste y menor dependencia | Que la integración demuestre una mejora clara en feedback sin comprometer el objetivo |
| No habrá puntaje compuesto global | Decidida para la fase inicial | Ocultaría compensaciones incompatibles | Una decisión concreta que necesite un índice validado contra resultados externos |

## 12. Investigación de soluciones existentes y oportunidad

### Lo que ya está bien resuelto

- [Keybr](https://www.keybr.com/) adapta la práctica de letras y secuencias; [typing.io](https://typing.io/) permite copiar código real; [Monkeytype](https://github.com/monkeytypegame/monkeytype) ofrece modos y métricas de mecanografía. Son mejores referencias para mecánica pura.
- [Anki](https://docs.ankiweb.net/background.html) ya resuelve recuperación y repetición espaciada de contenido declarativo; no conviene recrear todo su planificador.
- [OverTheWire Bandit](https://overthewire.org/wargames/bandit/) enseña fundamentos de terminal por niveles.
- [PortSwigger Web Security Academy](https://portswigger.net/web-security) ofrece teoría, laboratorios legales y un catálogo web muy amplio. Sus “mystery labs” también eliminan la etiqueta de vulnerabilidad, una buena referencia de transferencia.
- [picoGym](https://picoctf.org/get_started.html), [HTB Academy](https://help.hackthebox.com/en/articles/12741910-academy-modules-paths), [TryHackMe](https://tryhackme.com/en-gb) y [Killercoda](https://killercoda.com/about) cubren desafíos, caminos guiados y entornos interactivos.
- Herramientas de Attack-Defense como [Ataka](https://github.com/OpenAttackDefenseTools/ataka) ilustran operación de exploits, targets, logs y flags; son herramientas de competencia, no tutores.

### Vacío plausible

Ninguna fuente revisada demuestra cubrir, como bucle personal único:

- memoria espaciada de procedimientos;
- elección cronometrada de la siguiente acción;
- ataque, parcheo y verificación del mismo defecto;
- revisión crítica de ayuda de IA;
- práctica mecánica técnica;
- transferencia periódica a laboratorios;
- adaptación explícita a errores causales y fecha de competencia.

Ese vacío **justifica experimentar**, no construir aún una plataforma. También puede resolverse con una coordinación ligera de herramientas existentes; esa alternativa debe competir honestamente con una aplicación propia.

## 13. Fuentes y límites

La investigación se realizó el 31 de julio de 2026. Las páginas de producto describen capacidades declaradas por sus responsables, no comparaciones independientes de efectividad. La evidencia pedagógica respalda mecanismos generales, pero no demuestra que su combinación específica mejore un Attack-Defense CTF.

Fuentes principales:

- Karpicke y Blunt, [retrieval practice](https://pubmed.ncbi.nlm.nih.gov/21252317/).
- Cepeda et al., [práctica distribuida](https://pubmed.ncbi.nlm.nih.gov/16719566/).
- Rohrer y Taylor, [práctica espaciada e intercalada](https://eric.ed.gov/?id=EJ786797).
- Kornell y Bjork, [intercalado y aprendizaje de categorías](https://pubmed.ncbi.nlm.nih.gov/18578849/).
- PortSwigger, [Web Security Academy](https://portswigger.net/web-security) y [essential skills](https://portswigger.net/web-security/essential-skills).
- CTFtime, [descripción general de formatos CTF](https://ctftime.org/ctf-wtf).
- ENOWARS, [ejemplo actual de evento Attack-Defense](https://10.enowars.com/).

Estas fuentes no son el reglamento de Cyber War 2026. Las reglas concretas continúan abiertas.
