# Preparación de equipo: tres integrantes

## 1. Objetivo

En un evento presencial y preliminarmente corto, el equipo debe evitar tres fallos: que todos investiguen lo mismo, que nadie cuide la función propia y que un hallazgo no se convierta en una acción reproducible.

Los roles siguientes son **provisionales**. No se fijan por preferencia ni por las hipótesis generales de Attack/Defense; se revisan con el reglamento, los servicios confirmados y dos drills.

## 2. Fundamentos compartidos

Los tres integrantes deben poder:

- explicar ataque, defensa y función legítima;
- distinguir hechos del evento de hipótesis generales;
- navegar Linux y usar comandos básicos de lectura;
- distinguir proceso, puerto, servicio y healthcheck funcional;
- comprender cliente/servidor, IP, puerto, DNS y protocolo;
- leer requests/responses HTTP;
- distinguir autenticación, sesión/cookie y autorización;
- consultar procesos, red y logs sin hacer cambios innecesarios;
- ejecutar un procedimiento preparado y explicar su objetivo;
- definir evidencia positiva y negativa;
- escribir un estado de seis líneas;
- usar IA sin pegar secretos, ejecutar a ciegas ni omitir validación;
- pedir ayuda antes de consumir un bloque significativo sin nueva evidencia.

Este piso compartido permite reemplazos y handoffs. No implica que los tres deban tener la misma profundidad.

## 3. Especializaciones provisionales

### Rol A — Servicio, defensa y disponibilidad

Responsabilidades probables:

- establecer línea base;
- inventariar proceso, puerto, configuración, datos y logs;
- vigilar función y cambios;
- coordinar backup/rollback cuando el reglamento lo permita;
- verificar que un parche conceptual o real no rompe el flujo legítimo;
- anunciar incidentes y estado.

Backup mínimo: Rol C.

### Rol B — Web/HTTP y análisis ofensivo

Responsabilidades probables:

- reconstruir flujo legítimo;
- revisar autenticación, sesiones y autorización;
- formular pruebas mínimas en objetivos autorizados;
- conservar request/response y evidencia;
- entregar pasos reproducibles para automatización o defensa.

Backup mínimo: Rol A para HTTP básico y Rol C para automatización.

### Rol C — Operaciones, automatización y coordinación

Responsabilidades probables:

- mantener tablero, reloj y artefactos;
- adaptar scripts pequeños solo después de un flujo entendido;
- validar entradas, salidas, errores y límites;
- preparar contextos para IA/documentación;
- recoger resultados y coordinar handoffs;
- gestionar flags o submission **solo si el reglamento confirma esa mecánica**.

Backup mínimo: Rol B para scripts HTTP y Rol A para observabilidad.

## 4. Cómo asignar roles

### Hasta el 12 de agosto

- Rotar los tres roles en ejercicios breves.
- Registrar velocidad de orientación, seguridad, claridad y autonomía.
- No especializar por título (“el hacker”, “el defensor”) sin evidencia.

### 13–16 de agosto

- Asignar roles provisionales según resultados.
- Cada persona practica su rol principal y un backup.
- El usuario con inclinación web puede probar Rol B, pero su nivel principiante exige demostrar primero HTTP, auth y verificación.

### 17–20 de agosto

- Mantener roles durante al menos una práctica y una simulación.
- Cambiar solo si el postmortem muestra un cuello de botella claro.
- Confirmar roles finales al recibir reglamento/servicios.

### Evidencia para elegir

- tiempo hasta primera acción útil;
- precisión y seguridad;
- capacidad de explicar y verificar;
- calidad de handoff;
- recuperación tras error;
- capacidad de mantener foco bajo tiempo;
- interés sostenible, como criterio secundario.

## 5. Tablero operativo mínimo

Un único tablero compartido debe tener:

| Campo | Contenido |
|---|---|
| Área/servicio | Identificador confirmado |
| Estado | desconocido / investigando / operativo / degradado / bloqueado |
| Hechos | outputs o resultados observados |
| Hipótesis | causa todavía no probada |
| Acción actual | una frase |
| Dueño | una persona |
| Próxima evidencia | qué resultado se espera |
| Riesgo/rollback | cuando corresponde |
| Próxima actualización | hora o condición |

No registrar narrativas largas durante la competencia. Enlaces a artefactos reemplazan copiar todo.

## 6. Protocolo de comunicación

### Handoff de 30–60 segundos

Formato fijo:

```text
OBJETIVO:
HECHOS:
HIPÓTESIS:
YA PROBÉ / RESULTADO:
RIESGO:
PRÓXIMA ACCIÓN:
DUEÑO:
```

### Callouts inmediatos

Interrumpir brevemente al equipo si:

- un servicio propio deja de funcionar;
- una acción podría destruir datos o ampliar alcance;
- aparece una evidencia reproducible de vulnerabilidad;
- se necesita una segunda revisión antes de un cambio;
- el reglamento contradice una hipótesis de trabajo;
- una herramienta o IA propone una acción no comprendida.

### Regla de bloqueo para evento corto

Es una política de equipo a ensayar, no una regla del evento:

- 0–5 min sin progreso: observar, formular hipótesis y probar una acción segura;
- a los 5 min sin nueva evidencia: anunciar bloqueo en una frase;
- a los 8–10 min: pedir pairing o entregar contexto;
- a los 12 min: abandonar, dividir o escalar salvo razón explícita.

El reloj se reinicia cuando aparece evidencia nueva, no cuando se repite una variante del mismo intento.

## 7. Apertura de una competencia de 90–120 minutos

Este timebox es un plan provisional para practicar y debe ajustarse al reglamento:

### Minutos 0–5

- leer reglas y cambios;
- confirmar alcance, infraestructura y mecanismo de puntuación;
- crear tablero;
- asignar roles y canal de evidencia.

### Minutos 5–15

- Rol A establece función y línea base;
- Rol B reconstruye interfaz/flujo legítimo;
- Rol C prepara entorno, documentación, reloj y registro;
- los tres anuncian el primer hecho, no una conclusión.

### Desde minuto 15

- trabajar en paralelo con dueño único por acción;
- sincronización de 60–90 segundos cada 10–15 minutos o ante evento crítico;
- priorizar restaurar función si el reglamento confirma que la disponibilidad importa;
- convertir hallazgos manuales en acciones repetibles solo cuando ahorre tiempo neto;
- reservar minutos finales para resultados pendientes, evidencia y no romper un estado funcional.

No se fija una estrategia de flags, ticks o scoring hasta que existan reglas.

## 8. Uso de IA en equipo

### Antes de consultar

El dueño escribe:

- objetivo;
- entorno/versiones confirmadas;
- hecho observado;
- intento y resultado;
- restricción;
- salida que necesita.

### Responsabilidad

- La persona que pide la respuesta sigue siendo dueña de validarla.
- Un segundo integrante revisa cambios que afecten servicio, datos o alcance.
- No se envían credenciales, flags ni secretos.
- Una respuesta sin evidencia se etiqueta como hipótesis.
- Consulta inicial con timebox de 3–5 minutos; si no cambia la acción, se vuelve a observar o se escala.

### Plantillas previas

Preparar offline:

- diagnóstico de servicio;
- explicación de error;
- revisión de comando/script;
- parche mínimo con pruebas;
- síntesis de handoff.

Las plantillas se adaptan; no sustituyen el contexto.

## 9. Drills requeridos

### Drill 1 — Servicio y handoff, antes del 9 de agosto

- una persona observa un servicio de laboratorio;
- redacta hechos/hipótesis;
- otra continúa con el handoff;
- la tercera evalúa si pudo actuar sin reconstruir todo.

Éxito: handoff menor a 60 segundos y siguiente acción correcta.

### Drill 2 — HTTP, autorización e IA, 13–16 de agosto

- reconstruir un flujo web autorizado;
- diseñar casos positivo/negativo;
- pedir a IA una revisión con un defecto sembrado;
- detectar el defecto y conservar evidencia.

Éxito: ningún comando/respuesta se acepta solo por autoridad.

### Drill 3 — Simulación, 17–20 de agosto

- 90 minutos;
- roles estables;
- al menos un cambio de prioridad;
- tablero y syncs breves;
- postmortem inmediato de 15 minutos.

Éxito:

- todos pueden explicar el estado final;
- no hay trabajo importante sin dueño;
- no se declara éxito sin prueba;
- se identifican tres cambios concretos, no una lista de culpas.

## 10. Kit previo al evento

Sujeto a reglamento:

- documento de contexto confirmado;
- tablero vacío;
- plantilla de handoff;
- checklist de apertura y cierre;
- comandos de observación comprendidos;
- requests `curl` de ejemplo legítimo;
- scripts propios pequeños, solo si están probados y permitidos;
- plantillas de IA sin secretos;
- lista de herramientas/versiones;
- plan de fallback si Internet o IA fallan;
- contactos, horarios y logística presencial.

## 11. Preguntas de equipo todavía abiertas

- ¿Cuál es el nivel de los otros dos integrantes?
- ¿Qué roles prefieren y qué evidencia los respalda?
- ¿Quién aporta equipo, entorno y herramientas?
- ¿Qué canal/tablero estará disponible presencialmente?
- ¿Qué persona tiene mayor experiencia en Linux, web, programación y recuperación?
- ¿Qué exige el reglamento sobre colaboración, IA y datos?
- ¿Qué servicio o lenguaje cambia la asignación provisional?

