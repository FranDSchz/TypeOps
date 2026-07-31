# TypeOps V0 manual

TypeOps V0 es un protocolo de práctica breve, no una aplicación. Su propósito es mejorar decisiones, ejecución segura y verificación para una competencia Attack/Defense. La mecanografía se observa dentro de comandos, HTTP y Python, pero no se practica como fin ni se usa WPM como métrica principal.

## Alcance cerrado

- 24 actividades primarias, 8 variantes y 6 sesiones de 12 a 18 minutos.
- Cuatro familias: **F1 Modelo mental y reconocimiento**, **F2 Siguiente acción segura**, **F3 Construcción y reparación**, **F4 Verificación y comunicación**.
- TypeOps debe ocupar como máximo una parte pequeña del plan general: como referencia, no más del 20 % del tiempo de preparación.
- No reemplaza estudio guiado, terminal local, laboratorios autorizados, PortSwigger, OverTheWire, Python ni práctica del equipo.
- Los ejemplos usan solamente `localhost`, `127.0.0.1`, `example.test` y recursos ficticios.

Las cuatro familias fueron conservadas porque cubren una cadena completa y pequeña: entender, elegir, ejecutar y comprobar/comunicar. La crítica de IA se integra en F2 y F4; no se crea una quinta familia.

## Cómo ejecutar una sesión

1. Abrí solamente el archivo de `sessions/` y una copia de `records/session-record-template.md`.
2. Reservá entre 12 y 18 minutos. El cronómetro es orientativo, no una puntuación.
3. Leé el modelo mínimo y el ejemplo antes de responder. No consultes la clave.
4. Escribí una respuesta breve, marcá confianza baja/media/alta y, si hace falta, pedí una pista.
5. Para una pista, abrí la clave correspondiente y leé únicamente la sección **Pistas**, que aparece antes de las respuestas. Registrá la pista usada.
6. Al terminar el bloque, compará con la rúbrica. No se exige coincidencia textual: importan los elementos esenciales y la evidencia esperada.
7. Cerrá en dos minutos: registrá un error causal dominante, una verificación y la próxima práctica. El registro completo de una sesión no debería exceder cinco minutos.

La sesión 1 es el piloto recomendado y no requiere instalar nada. El corpus estructurado está en `activities/activities.json` y `activities/variants.json`; no es necesario abrirlo para practicar.

## Evaluación rápida

- **Correcto:** incluye los elementos esenciales y una verificación suficiente cuando corresponde.
- **Parcial:** la dirección es segura y útil, pero falta un elemento esencial o la verificación.
- **Incorrecto:** confunde el concepto central, propone una acción insegura o no produce evidencia útil.

Usá un solo error causal principal: `desconocimiento`, `recuperación incompleta`, `confusión conceptual`, `siguiente acción débil`, `sintaxis`, `interpretación`, `verificación omitida`, `acción insegura`, `uso deficiente de IA` o `fricción mecánica`.

## Reglas manuales de adaptación

| Resultado observado | Próxima decisión |
|---|---|
| Error conceptual | Leer la explicación breve; usar después una variante que contraste el concepto. |
| Recuperación incompleta | Reintentar una vez y programar un repaso en la sesión siguiente. |
| Acción sin evidencia esperada | Elegir una actividad F2 o F4 de siguiente acción/verificación. |
| Error de sintaxis | Reconstruir un fragmento contextual breve; no hacer una serie de teclas aisladas. |
| Uso de pista | Resolver más adelante la variante correspondiente sin pista. |
| Respuesta incorrecta con confianza alta | Contrastar explícitamente los dos conceptos confundidos antes de avanzar. |
| Dificultad mecánica | Practicar el fragmento técnico dentro de contexto durante dos o tres minutos como máximo. |
| Buen resultado independiente | Avanzar; no repetir innecesariamente. |

Aplicá como máximo una regla por actividad. La plantilla de sesión repite estas reglas para evitar trabajo administrativo.

## Variantes

Las variantes no son actividades 25–32 ni agregan currículo. Cambian la superficie para comprobar transferencia. Su momento recomendado figura en `activities/variants.json`. Si una variante se usa dentro de una sesión, reemplaza un reintento; no se suma automáticamente y no debe alargar la sesión.

## Corrección mínima respecto del plan de contenido

El mapa preliminar repetía F1-06 en la sesión 5 y dejaba F4-03 fuera de las seis sesiones. Se reemplazó esa repetición por F4-03. Así las 24 actividades primarias aparecen al menos una vez sin cambiar familias, cantidad de actividades, duración ni currículo. F4-02V sigue siendo la variante integrada en la sesión 5.

## Hipótesis competitivas

Flags, checkers, ticks, SLA y scoring se explican sólo como un **modelo común de Attack/Defense**. No son reglas confirmadas de Cyber War 2026. Antes de la competencia hay que contrastar el material con el reglamento oficial y registrar cualquier cambio en los documentos de contexto.

## Archivos

- [Sesión 1 — piloto](sessions/session-01.md) y [su clave](answer-keys/session-01-key.md).
- [Sesiones](sessions/session-02.md): estímulos y orden exacto de práctica (continuar con los archivos 03–06 del mismo directorio).
- [Actividades](activities/activities.json) y [variantes](activities/variants.json): corpus estructurado.
- [Registro de sesión](records/session-record-template.md), [registro por actividad](records/activity-record-template.md) y [formulario piloto](records/pilot-record-example.md).
- [Drill 1](team-drills/drill-01.md), [drill 2](team-drills/drill-02.md) y [drill 3](team-drills/drill-03.md): coordinación sin roles permanentes.
- [Clave de variantes](answer-keys/variants-key.md).
