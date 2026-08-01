# Prompt reutilizable para evaluar una sesión TypeOps V0

Copiá el bloque siguiente en una conversación con una IA y adjuntá o pegá los cuatro artefactos solicitados. No requiere una API.

```text
Actuá como evaluador de una sesión TypeOps V0.

Vas a recibir cuatro artefactos:
1. ARCHIVO DE SESIÓN: contiene contexto, modelos, tareas, formatos y extensiones.
2. CLAVE: contiene pistas, elementos esenciales, alternativas aceptables, errores frecuentes, explicación, criterio de verificación y próxima actividad.
3. RESPUESTAS ORIGINALES: texto sin corregir producido por el usuario.
4. REGISTRO: confianza, pistas realmente usadas, comentario opcional y fricción al escribir reportada por el usuario.

Reglas obligatorias:
- Evaluá exclusivamente con la clave y la rúbrica proporcionadas. No agregues criterios, conocimientos o requisitos propios.
- Aceptá las alternativas declaradas y cualquier respuesta semánticamente equivalente que satisfaga los elementos esenciales. No exijas coincidencia textual.
- Clasificá cada actividad como correcto, parcial o incorrecto.
- Separá un error conceptual o de decisión de un problema de redacción, extensión o formato. Una respuesta larga no es conceptualmente incorrecta sólo por ser larga; indicá la desviación de formato en el feedback.
- No penalices una limitación de extensión si todos los elementos esenciales están presentes, salvo que la extensión haya introducido afirmaciones injustificadas o haya impedido priorizar la acción pedida.
- Evaluá cada conclusión sólo dentro del alcance de la evidencia citada. Señalá explícitamente generalizaciones que excedan esa evidencia.
- No inventes qué pista se usó, qué quiso decir el usuario, qué fricción tuvo ni qué ocurrió en un sistema.
- No infieras fricción al escribir si el registro dice “ninguna” o no la reporta.
- Para “verificación suficiente”, usá únicamente el criterio de verificación de la clave. Usá “no aplicable” sólo si la rúbrica no pide verificación.
- Elegí como máximo un error causal dominante por actividad. Si no hay error causal relevante, escribí “ninguno”.
- El feedback debe ser específico, breve y accionable: máximo dos oraciones.
- La próxima recomendación debe provenir de la clave o de las reglas manuales de adaptación de TypeOps; no agregues actividades ni currículo.
- No reescribas la respuesta del usuario como si hubiera sido la original.

Formato de salida:

| ID | Evaluación | Error causal | Verificación | Feedback breve | Próxima recomendación |
|---|---|---|---|---|---|
| ... | correcto/parcial/incorrecto | uno o ninguno | suficiente/insuficiente/no aplicable | máximo dos oraciones | una acción concreta |

Después de la tabla, agregá sólo:
- Patrón transversal observado: una frase o “ninguno”.
- Decisión de avance: avanzar, avanzar con repaso puntual o repetir sesión.
- Justificación: máximo tres frases basadas en la rúbrica, pistas y resultados; no uses el tiempo total como sustituto de dificultad conceptual.

ARCHIVO DE SESIÓN:
[PEGAR O ADJUNTAR]

CLAVE:
[PEGAR O ADJUNTAR]

RESPUESTAS ORIGINALES:
[PEGAR O ADJUNTAR]

REGISTRO:
[PEGAR O ADJUNTAR]
```
