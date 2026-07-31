# Drill 3 — Coordinar ataque, defensa y verificación

**Duración:** 35–40 min. **Objetivo:** mantener tres líneas de trabajo sin duplicar ni aceptar cambios sin verificación. Es un ejercicio de mesa, no un laboratorio.  
**Roles de esta ronda:** Matías=exploración ofensiva autorizada, Franco=defensa/servicio, Philippe=verificación/coordinación. Rotar después; no son especializaciones definitivas.

## Canal y tablero

Usen un canal único y un tablero con tres columnas: `Por comprobar`, `En curso (dueño)`, `Evidencia`. Máximo una tarea en curso por persona.

## Información entregada

### Matías — exploración

Caso ficticio: la política dice “cada usuario sólo ve su perfil”. Tenés una observación no reproducida: Alice recibió 200 al pedir ID 11. Debés entregar evidencia mínima y no cambiar el servicio.

### Franco — defensa

Línea base ficticia: Alice→10=200; `/health`=200. Podés proponer en palabras un control servidor de propiedad, pero no implementarlo. Antes necesitás criterio de éxito y reversión.

### Philippe — verificación/coordinación

Debés evitar que ambos repitan la misma petición, mantener un positivo y negativo, registrar hora/resultado y pedir que cualquier sugerencia de IA se marque como no verificada.

## Secuencia

1. **0–7 min — triage:** cada persona publica hechos, hipótesis y próxima acción; Philippe elimina duplicados y asigna dueños.
2. **7–17 min — ramas:** Matías diseña reproducción; Franco prepara antes/después/reversión; Philippe prepara matriz y handoff.
3. **17–27 min — integración:** simulen estos resultados provistos: Alice→11 antes=200 con datos de Bob; después=403 sin datos; Alice→10 después=200; health después=200.
4. **27–32 min — decisión:** equipo determina estado, evidencia faltante y si aceptaría el cambio conceptual.
5. **32–40 min — postmortem.**

## Artefacto de coordinación

```text
Objetivo compartido:
Tarea | Dueño | Hecho de entrada | Salida esperada | Estado
Hallazgo ofensivo:
Cambio defensivo propuesto:
Positivo / negativo / disponibilidad:
Sugerencias de IA no verificadas:
Decisión y próxima acción:
```

**Finalización:** sin tareas duplicadas; hallazgo reproducible; cambio conceptual con línea base, positivo, negativo y disponibilidad; decisión respaldada por resultados.  
**Postmortem:** ¿dónde hubo espera?, ¿qué mensaje evitó duplicación?, ¿quién verificó una afirmación ajena?, ¿qué tarea se reasignaría?, ¿qué plantilla de IA sería útil y qué evidencia exigiría?

