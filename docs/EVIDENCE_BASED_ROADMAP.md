# Roadmap basado en evidencia

## 1. Regla y cambio de contexto

Una fase desbloquea una decisión, no una lista de funciones. La fecha del 22 de agosto, el nivel principiante y el equipo de tres cambian el roadmap anterior: antes del evento se priorizan preparación y TypeOps manual; la validación de software se mueve al postmortem.

La fuente de verdad temporal es [CYBER_WAR_2026_CONTEXT.md](CYBER_WAR_2026_CONTEXT.md). El plan de estudio detallado está en [BEGINNER_PREPARATION_PLAN.md](BEGINNER_PREPARATION_PLAN.md).

## Fase 0 — Contexto y V0 manual, 31 de julio–1 de agosto

### Pregunta

¿Podemos comenzar a practicar sin construir producto ni asumir reglas?

### Función/experimento

- registrar hechos/preliminares/hipótesis;
- aprobar cuatro familias beginner-first;
- materializar una primera sesión manual;
- acordar protocolo mínimo de equipo;
- medir overhead de preparación y cierre.

### Evidencia necesaria

- una sesión completa;
- tiempo de setup/cierre;
- errores y próxima acción;
- confirmación de que el contenido es comprensible.

### Criterio de éxito

La sesión se usa el mismo día, tarda ≤18 minutos, añade <5 minutos de overhead y produce una práctica siguiente concreta.

### Decisiones habilitadas

- continuar V0 manual;
- simplificar formato;
- ajustar ayuda beginner.

## Fase 1 — Fundamentos Linux/servicio, 2–7 de agosto

### Pregunta

¿El usuario puede observar y explicar un servicio sin cambios inseguros?

### Función/experimento

- sesiones S1–S3 del corpus;
- comandos reales de lectura en laboratorio;
- primer drill de handoff;
- repaso 1/3 días;
- registrar errores conceptuales vs. mecánicos.

### Evidencia necesaria

- navegación reproducible;
- distinción proceso/puerto/función;
- una hipótesis respaldada por logs;
- handoff que otro integrante puede continuar.

### Criterio de éxito

Completa la checklist básica con guía decreciente y no declara “funciona” solo porque existe proceso o puerto.

### Decisiones habilitadas

- avanzar a HTTP;
- reforzar un prerrequisito;
- retirar campos inútiles de V0.

## Fase 2 — HTTP, identidad y autorización, 8–12 de agosto

### Pregunta

¿Puede reconstruir un flujo legítimo y diseñar una comprobación de autorización?

### Función/experimento

- sesiones S4–S5;
- `curl` en laboratorio autorizado;
- caso positivo/negativo;
- una variante sin etiqueta;
- gate de utilidad V0 el 10 de agosto.

### Evidencia necesaria

- request explicada;
- trazado de cookie/sesión;
- diferencia autenticación/autorización;
- resultado externo beginner;
- overhead acumulado de V0.

### Criterio de éxito

Construye una request simple, interpreta la respuesta y evita un falso positivo de autorización en una variante.

### Decisiones habilitadas

- probar especialización web provisional;
- ajustar F1–F4;
- pausar V0 si consume más tiempo del que ahorra.

## Fase 3 — Python, IA y roles provisionales, 13–16 de agosto

### Pregunta

¿Puede usar una automatización o respuesta de IA pequeña sin perder comprensión y verificación?

### Función/experimento

- sesión S6;
- lectura/reparación de Python básico;
- context pack y crítica de IA;
- Drill 2;
- asignar rol principal y backup según evidencia.

### Evidencia necesaria

- script corto explicado;
- caso de fallo manejado;
- defecto de IA detectado antes de ejecutar;
- handoff y rol con justificación.

### Criterio de éxito

La ayuda de IA produce una acción validada, no un comando aceptado por autoridad; cada persona tiene rol provisional y backup.

### Decisiones habilitadas

- preparar plantillas finales;
- fijar roles para simulación;
- decidir qué automatización preparada merece práctica.

## Fase 4 — Integración de equipo, 17–19 de agosto

### Pregunta

¿Los fundamentos sobreviven al trabajo paralelo y a un cambio de prioridad?

### Función/experimento

- práctica integrada de 45–60 minutos;
- tablero compartido;
- roles estables;
- handoffs y timebox de bloqueo;
- una segunda práctica solo si la primera genera mejoras concretas.

### Evidencia necesaria

- tiempo a primera acción útil;
- trabajo con dueño;
- acciones seguras/justificadas;
- calidad de handoff;
- estado final explicable por los tres.

### Criterio de éxito

No hay duplicación prolongada, silencio de bloqueo ni éxito declarado sin evidencia; el postmortem cambia tres acciones del equipo.

### Decisiones habilitadas

- conservar/cambiar roles;
- elegir foco de simulación;
- congelar contenido no esencial.

## Fase 5 — Simulación y freeze, 20–21 de agosto

### Pregunta

¿El equipo puede operar durante 90 minutos y llegar descansado al evento?

### Función/experimento

- simulación de 90 minutos;
- postmortem de 15 minutos;
- actualizar solo checklists/roles por hallazgos críticos;
- revisar reglamento confirmado;
- congelar herramientas y contenido;
- descanso y logística.

### Evidencia necesaria

- resultado de simulación;
- degradación por tiempo;
- errores críticos;
- estado de kit y fallback;
- tres correcciones finales como máximo.

### Criterio de éxito

El equipo termina con estado coherente, roles funcionales y sin introducir cambios técnicos no probados el 21 de agosto.

### Decisiones habilitadas

- asignación final;
- checklist de apertura;
- qué no hacer durante la competencia.

## Fase 6 — Competencia, 22 de agosto

### Pregunta

¿La preparación produce acciones útiles sin añadir burocracia?

### Función/experimento

- usar checklists y tablero mínimo;
- capturar solo hechos, decisiones críticas y tiempos aproximados;
- TypeOps no se usa como sesión durante el evento;
- observar fricciones de conocimiento, coordinación y herramienta.

### Evidencia necesaria

- resultados reales permitidos por el evento;
- decisiones y handoffs significativos;
- bloqueos;
- uso/beneficio de IA;
- errores mecánicos solo si afectaron una acción.

### Criterio de éxito

El usuario contribuye de forma segura y verificable; la captura de evidencia no interfiere con competir.

### Decisiones habilitadas

- postmortem;
- continuidad o abandono de TypeOps;
- prioridades de aprendizaje reales.

## Fase 7 — Postmortem y decisión de producto, después del 22 de agosto

### Pregunta

¿TypeOps manual ahorró tiempo o mejoró decisiones lo suficiente para continuar?

### Función/experimento

- comparar V0 con desempeño real;
- identificar actividades útiles/inútiles;
- medir overhead manual;
- registrar brechas no previstas;
- decidir manual vs. CLI vs. abandono;
- conservar el experimento de 14 días para una fase sin urgencia si sigue siendo útil.

### Evidencia necesaria

- al menos seis sesiones V0;
- postmortem de competencia;
- coste de mantenimiento;
- errores repetidos y transferencia;
- fricción concreta que software resolvería.

### Criterio de éxito

Existe una decisión explícita:

- mantener protocolo;
- implementar una CLI delgada;
- rediseñar familias;
- usar herramientas existentes;
- abandonar TypeOps.

### Decisiones habilitadas

- arquitectura técnica, solo si corresponde;
- experimento de producto más largo;
- contenido postcompetencia.

## 2. Gates de detención

Pausar o reducir TypeOps antes del evento cuando:

- consume más del 20% del tiempo de preparación;
- el overhead supera 5 minutos por sesión;
- crear contenido desplaza terminal, laboratorio o equipo;
- las recomendaciones no cambian la práctica;
- se acumulan preguntas sin ejecución;
- el usuario aprende la tarjeta, no la habilidad;
- una herramienta externa resuelve mejor la necesidad.

No detener la preparación porque TypeOps falle; volver al plan manual de fundamentos y laboratorios.

## 3. Cambios deliberados frente al roadmap anterior

- El experimento de 14 días deja de ser gate previo al V0 y pasa a postcompetencia.
- La coordinación de equipo se adelanta.
- El V0 manual reemplaza al MVP de software antes del evento.
- IA se practica desde fundamentos, sin integración.
- La simulación tiene fecha concreta.
- Cualquier terminal, laboratorio propio o modelo adaptativo avanzado queda fuera antes del 22 de agosto.

