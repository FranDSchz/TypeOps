# Plan beginner-first: 31 de julio al 22 de agosto de 2026

## 1. Objetivo y criterio de éxito

El objetivo no es “cubrir ciberseguridad”. Es llegar al 22 de agosto pudiendo participar de manera útil y segura en un equipo de tres:

- explicar el ciclo general de Attack/Defense sin presentar hipótesis como reglas;
- orientarse en una terminal Linux;
- distinguir proceso, puerto, servicio y función;
- observar procesos, red y logs con comandos de lectura;
- comprender y construir HTTP básico con `curl`;
- distinguir autenticación, sesión, cookie y autorización;
- escribir y revisar Python básico para tareas pequeñas;
- definir qué evidencia prueba un resultado;
- pedir ayuda a una persona o IA con contexto suficiente;
- comunicar estado y siguiente acción en menos de un minuto;
- completar al menos una simulación de 90 minutos con el equipo.

No se espera dominio profundo en 22 días. Se busca un piso operativo que permita reconocer, ejecutar con guía decreciente y no bloquear al equipo.

## 2. Modalidades

La modalidad **estándar** es la recomendada. La mínima preserva continuidad cuando el tiempo es escaso. La intensiva solo sirve si no deteriora sueño, atención ni calidad.

| Modalidad | Trabajo individual | Equipo | Laboratorio/simulación | Uso de TypeOps V0 |
|---|---|---|---|---|
| Mínima | 35–45 min por día, 5–6 días/semana | 2 sesiones de 60–90 min por semana | 1 práctica breve semanal + 1 simulación final | 10–12 min, incluido en el bloque individual |
| Estándar | 75–90 min por día, 6 días/semana | 2–3 sesiones de 75–90 min por semana | 2 prácticas semanales + 2 simulaciones | 12–18 min, incluido en el bloque individual |
| Intensiva | 2 bloques de 60–75 min por día, 6 días/semana | 3 sesiones de 90 min por semana | 3 prácticas semanales + 2–3 simulaciones | máximo 20 min; el tiempo extra va a práctica real |

Reglas comunes:

- TypeOps nunca se usa antes que el bloque práctico principal si retrasa el inicio.
- Si una sesión de TypeOps requiere más de 3 minutos de preparación, se usa una selección fija.
- Al menos un día por semana es de descanso o revisión ligera.
- La modalidad intensiva se reduce automáticamente si energía ≤2/5, aparecen errores crecientes o compromete el sueño.
- No se recupera un día perdido duplicando mecánicamente el siguiente.

## 3. Formato de cada bloque individual

### Mínimo, 35–45 minutos

1. 5 min: recuperación TypeOps.
2. 10 min: modelo mental o ejemplo resuelto.
3. 15–20 min: terminal, HTTP o Python en entorno autorizado.
4. 5 min: verificar y registrar una evidencia.

### Estándar, 75–90 minutos

1. 10–15 min: TypeOps V0.
2. 15–20 min: explicación/modelo mental.
3. 35–45 min: práctica guiada y variante.
4. 10 min: verificación, síntesis y handoff breve.

### Intensivo, dos bloques

- Bloque A: estándar centrado en fundamentos/práctica.
- Bloque B: laboratorio o coordinación; nunca ampliar TypeOps por llenar tiempo.

## 4. Fases

### Fase A — Orientación y línea base, 31 de julio–2 de agosto

**Pregunta:** ¿entiendo el formato general y puedo operar una shell sin ejecutar a ciegas?

Prioridades:

- Attack/Defense: ataque, defensa y función legítima;
- hecho vs. hipótesis del evento;
- filesystem, rutas, directorio actual y ayuda local;
- comandos básicos de lectura;
- cliente/servidor, IP, puerto y protocolo;
- protocolo de equipo y registro de estado.

Evidencia de salida:

- explicación de dos minutos del formato;
- navegar y localizar un archivo sin guía paso a paso;
- explicar proceso vs. servicio vs. puerto;
- primer handoff con hechos, hipótesis y siguiente acción.

### Fase B — Linux operativo, 3–7 de agosto

**Pregunta:** ¿puedo observar un host y un servicio antes de tocarlo?

Prioridades:

- `pwd`, `ls`, `cd`, `cat`, `less`, `head`, `tail`, `grep`, `find`;
- rutas, permisos y usuarios a nivel básico;
- `ps`, estado de procesos y señales conceptuales;
- servicio, configuración, datos y logs;
- IP, DNS, puertos, TCP/UDP a nivel funcional;
- herramientas de observación disponibles en el entorno;
- pipes, redirección y quoting con comandos no destructivos;
- línea base y healthcheck funcional.

Evidencia de salida:

- checklist de inventario de solo lectura;
- localizar y filtrar una señal en logs de laboratorio;
- comprobar por separado proceso, puerto y respuesta funcional;
- explicar qué salida esperaba antes de cada comando.

### Fase C — HTTP y seguridad web fundamental, 8–12 de agosto

**Pregunta:** ¿puedo reconstruir un flujo web legítimo y distinguir identidad de autorización?

Prioridades:

- URL, método, headers, body, status y respuesta;
- `curl` para GET/POST simples y headers;
- cookies, sesión y estado;
- autenticación vs. autorización;
- autorización por objeto e IDOR como primer caso;
- comparación entre dos identidades en laboratorio autorizado;
- logs HTTP y evidencias positiva/negativa;
- errores comunes sin memorizar payloads.

Evidencia de salida:

- construir una request desde una intención;
- explicar dónde viaja la identidad/sesión;
- diseñar una prueba positiva y una negativa de autorización;
- completar un laboratorio beginner de HTTP/acceso y documentar el resultado.

### Fase D — Python básico, verificación e IA, 13–16 de agosto

**Pregunta:** ¿puedo leer o adaptar una automatización pequeña sin delegar la comprensión?

Prioridades:

- variables, strings, listas, diccionarios, condiciones y bucles;
- funciones y lectura de errores;
- request/response y JSON a nivel básico;
- entrada, salida inequívoca y manejo de fallo simple;
- verificación positiva/negativa;
- preparar contexto para IA;
- revisar rutas, supuestos, alcance y comandos generados;
- consultar vs. actuar directamente.

Evidencia de salida:

- explicar un script corto línea por línea;
- corregir un fallo simple con una prueba;
- producir un context pack sin secretos;
- detectar al menos dos defectos en una respuesta de IA preparada.

### Fase E — Integración y coordinación, 17–20 de agosto

**Pregunta:** ¿podemos trabajar como tres operadores durante el tiempo probable del evento?

Prioridades:

- orientación de servicio;
- siguiente acción por valor de información;
- ataque, defensa y verificación como ciclo;
- roles provisionales y backup;
- tablero compartido;
- handoffs de 30–60 segundos;
- IA con timebox y validación;
- práctica con tiempo solo sobre fundamentos ya vistos.

Evidencia de salida:

- una práctica de 45–60 minutos y una simulación de 90 minutos;
- ningún servicio o estado declarado “correcto” sin evidencia;
- cada hallazgo tiene dueño y próxima acción;
- postmortem de cinco puntos que cambie la preparación siguiente.

### Fase F — Congelar y llegar descansado, 21–22 de agosto

**21 de agosto:**

- no estudiar categorías nuevas;
- revisar comandos, HTTP, checklist de verificación y protocolo de equipo;
- confirmar equipo, acceso, archivos locales y restricciones conocidas;
- revisar plantillas de IA y fallback;
- sesión corta y cierre temprano.

**22 de agosto:**

- calentamiento de 10–15 minutos: dos comandos, una request, un handoff;
- releer hechos del reglamento, no hipótesis históricas;
- no cambiar herramientas ni roles a último momento salvo bloqueo real;
- registrar evidencia durante la competencia de forma mínima.

## 5. Calendario estándar día por día

| Fecha | Foco principal | Evidencia del día |
|---|---|---|
| Vie 31/7 | Modelo Attack/Defense y separación hecho/hipótesis | Explicación propia + lista de dudas |
| Sáb 1/8 | Terminal, rutas y comandos de lectura | Navegación reproducible |
| Dom 2/8 | Red básica y primer protocolo de equipo | Diagrama cliente–servicio + handoff |
| Lun 3/8 | Archivos, permisos y usuarios | Explicar tres permisos/casos |
| Mar 4/8 | Procesos y señales | Distinguir proceso vivo de función |
| Mié 5/8 | Servicios, configuración y datos | Inventario de un servicio de laboratorio |
| Jue 6/8 | Puertos, conexiones y DNS | Comprobaciones de solo lectura |
| Vie 7/8 | Logs, pipes, grep y tail | Hipótesis respaldada por una línea |
| Sáb 8/8 | HTTP: request/response | Anotar una transacción completa |
| Dom 9/8 | `curl`: métodos, headers y body | Dos requests explicadas |
| Lun 10/8 | Cookies, sesión y autenticación | Trazar estado de un login |
| Mar 11/8 | Autorización e IDOR | Pruebas positiva/negativa diseñadas |
| Mié 12/8 | Integración HTTP y logs | Laboratorio beginner con postmortem |
| Jue 13/8 | Python: datos y control de flujo | Explicar/cambiar script corto |
| Vie 14/8 | Python: HTTP/JSON y errores | Resultado inequívoco + caso de fallo |
| Sáb 15/8 | Verificación y rollback conceptual | Checklist antes/después |
| Dom 16/8 | IA: contexto, revisión y prueba | Prompt compacto + crítica |
| Lun 17/8 | Triage y siguiente acción | Microescenario sin acción inútil |
| Mar 18/8 | Roles, tablero y handoffs | Drill de tres personas |
| Mié 19/8 | Práctica integrada 45–60 min | Postmortem y ajuste de roles |
| Jue 20/8 | Simulación de 90 min | Métricas y tres mejoras concretas |
| Vie 21/8 | Repaso, setup y descanso | Checklist final confirmado |
| Sáb 22/8 | Competencia | Operación segura y evidencia mínima |

## 6. Cómo escalar por modalidad

### Mínima

- Mantener la evidencia del calendario, pero usar un solo ejemplo y una sola variante.
- Hacer equipo el 2, 9, 16 y 20 de agosto como mínimo.
- Si hay que recortar, retirar contenido nuevo antes que práctica de terminal, HTTP, verificación o simulación.

### Estándar

- Seguir el calendario completo.
- Agregar una variante al día siguiente y dos laboratorios por semana.
- Hacer al menos tres drills de equipo antes de la simulación final.

### Intensiva

- Mantener el mismo temario; usar el tiempo extra en ejemplos resueltos, laboratorios y repetición con menos ayuda.
- No añadir crypto, pwn, reversing, OAuth o cadenas avanzadas solo por disponer de horas.
- Incluir una segunda simulación entre el 17 y el 19 si la primera produce evidencia útil y el equipo se recupera bien.

## 7. Temas postergados

Hasta que sean prerrequisito, aparezcan en servicios confirmados o el reglamento los priorice:

- OAuth/OIDC en profundidad;
- JWT attacks avanzados;
- SSTI, SSRF, NoSQL injection y race conditions avanzadas;
- WebSockets, WebRTC y WebLLM;
- criptografía competitiva;
- memory corruption/pwn;
- reversing de APK o desktop;
- fuerza bruta a escala;
- exploits multi-stage;
- orquestación compleja, scanners y automatización de flags;
- optimizaciones avanzadas de Bash/Python;
- mecanografía aislada o entrenamiento de WPM.

Si el reglamento o un servicio confirmado requiere uno, se incorpora el prerrequisito mínimo y una práctica, no un currículo completo.

## 8. Métricas semanales

No se usa WPM. Revisar:

- tareas completadas con evidencia;
- tiempo hasta primera acción útil en casos comparables;
- porcentaje de acciones seguras y justificadas;
- tareas resueltas sin pista, con pista o no resueltas;
- capacidad de explicar comandos/requests/scripts usados;
- verificaciones positiva y negativa realizadas;
- calidad del handoff;
- coste diario de TypeOps y si ahorró planificación o repaso.

Un buen resultado al 22 de agosto es ser un integrante confiable en fundamentos, no parecer avanzado por cantidad de temas vistos.

