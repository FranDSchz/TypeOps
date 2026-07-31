# Drill 1 — Hechos, hipótesis y próxima acción

**Duración:** 25 min. **Objetivo:** comunicar estado incierto sin convertir una inferencia en regla. **Entorno:** sólo papel/editor y este caso ficticio; no se ejecutan comandos.  
**Roles de esta ronda:** Franco=observador, Philippe=desafiador de evidencia, Matías=coordinador/registro. En la próxima ejecución, rotar un lugar.

## Preparación (2 min)

Usen un canal único: una nota compartida o chat llamado `#estado-servicio`. Mensajes de máximo cinco líneas. El coordinador copia a cada persona sólo su paquete; durante los primeros cuatro minutos no se muestran los otros.

## Información entregada

### Franco — observador

Recibís: `10:20:01 GET /health → 503`, ID `z9`; `api-demo` aparece en procesos. Tu misión es informar sólo hechos y una pregunta pendiente.

### Philippe — desafiador

Recibís: `ss -ltn` muestra 127.0.0.1:8080; log `10:20:01 request_id=z9 dependency timeout`. Tu misión es marcar qué conclusión sería prematura y proponer una prueba discriminante.

### Matías — coordinador

Recibís: Cyber War aún no confirmó checkers/ticks/SLA. Tu misión es impedir que una práctica común se comunique como regla oficial y asignar la próxima acción.

## Ejecución (15 min)

1. Min 0–4: cada uno publica un mensaje con `HECHO / HIPÓTESIS / NECESITO`.
2. Min 4–8: Philippe pregunta por una evidencia faltante; Franco responde sin inventarla.
3. Min 8–12: Matías produce el artefacto de handoff.
4. Min 12–15: los tres revisan si otra persona podría actuar sin preguntar contexto.

## Artefacto de handoff

```text
Hora/objetivo:
Hechos y fuente:
Hipótesis marcada:
Acción realizada + resultado:
Próxima acción + evidencia esperada:
Responsable:
Regla competitiva confirmada o pendiente:
```

**Finalización:** handoff de ≤7 líneas, ninguna hipótesis como hecho, una prueba que puede confirmar o contradecir y un responsable.  
**Postmortem (8 min):** ¿qué frase era ambigua?, ¿qué dato evitó duplicación?, ¿qué se habría comunicado erróneamente como regla?, ¿qué cambiarán en la próxima ronda?

