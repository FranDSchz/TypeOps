# Drill 2 — Hallazgo y transferencia

**Duración:** 30 min. **Objetivo:** registrar un posible hallazgo web autorizado para que otra persona lo reproduzca y una tercera evalúe impacto/defensa. **No se ataca ningún sistema.**  
**Roles de esta ronda:** Philippe=observador de request, Matías=reproductor crítico, Franco=coordinador/verificador. Rotar en la próxima ejecución.

## Canal y regla

Una nota compartida `hallazgo-01`. No usar mensajes privados. El hallazgo sólo cambia de “hipótesis” a “reproducido” cuando otra persona puede reconstruirlo desde el artefacto.

## Información entregada

### Philippe — observador

Política ficticia: perfiles 10 y 11 son privados. Resultado provisto: con `session=demo-alice`, `GET /profile?id=11` devolvió 200 y body con `id=11`. No sabés aún si contiene datos de Bob ni si el fixture es consistente.

### Matías — reproductor

Sabés que Alice posee 10 y Bob 11. Exigí caso positivo, request completo sin secretos reales, esperado, observado y hora. No aceptes “es IDOR” como instrucción.

### Franco — coordinador/verificador

Debés clasificar estado como observación, hipótesis, reproducido o descartado; asignar una comprobación defensiva y preservar función positiva.

## Ejecución

1. 0–6 min: Philippe completa el artefacto sin abrir soluciones externas.
2. 6–14 min: Matías señala datos faltantes y escribe la matriz mínima que reproduciría en un laboratorio local autorizado.
3. 14–21 min: Franco define criterio de confirmación, prueba positiva/negativa y próximo responsable.
4. 21–24 min: handoff oral de 60 s.
5. 24–30 min: postmortem.

## Artefacto de handoff

```text
Estado: observado / hipótesis / reproducido / descartado
Política esperada:
Request mínimo (objetivo local/ficticio):
Identidad y objeto:
Esperado / observado:
Caso positivo / negativo pendientes:
Impacto aún no demostrado:
Próxima acción, evidencia y responsable:
```

**Finalización:** un tercero puede reconstruir la matriz sin preguntar IDs, identidad, política o esperado; se evita afirmar impacto no observado.  
**Postmortem:** ¿qué faltaba en el primer reporte?, ¿qué campo evitó un falso positivo?, ¿se duplicó alguna prueba?, ¿el handoff preservó función y seguridad?

