# Sesión 1 — Piloto: orientarse antes de actuar

**Objetivo principal:** formar un modelo mínimo de Attack/Defense, distinguir evidencia de hipótesis y elegir una primera observación segura.  
**Prerrequisitos:** ninguno. **Duración:** 15–17 min. **Materiales:** este archivo, papel/editor y una copia del registro de sesión.  
**No consultar:** Internet, IA, clave de respuestas antes del intento.  
**Sí consultar:** únicamente los modelos y ejemplos de esta página; después del intento, las pistas de `../answer-keys/session-01-key.md`.  
**Tiempo:** registrá sólo inicio, final, total y tiempo aproximado de registro; no estimes minutos por actividad.

## Instrucciones exactas

1. Leé cada modelo y ejemplo; son enseñanza, no pistas ocultas.
2. Respondé con tus palabras y respetá la extensión máxima. Anotá `Confianza: baja/media/alta` en el registro.
3. Si no podés avanzar en 45 segundos, escribí `Pido pista 1`, registralo y leé sólo la pista de esa actividad.
4. Tras las cinco actividades, conservá las respuestas originales. No te autoevalúes: una IA lo hará después con la sesión, la clave y el registro.

> **Modelo estándar, no regla oficial de Cyber War:** en muchos Attack/Defense, los equipos protegen servicios propios, intentan obtener flags o evidencia en rivales y deben conservar función/disponibilidad. Checkers, ticks, SLA, flags y scoring concretos de Cyber War 2026 siguen sin confirmar.

## 1. F1-01 — Ataque, defensa y función

**Familia:** F1 Modelo mental · **Objetivo:** distinguir tres objetivos · **Prerrequisitos:** ninguno · **Herramientas:** modelo anterior · **Ayuda:** pista 1.

**Modelo mínimo:** ataque busca una ventaja o evidencia autorizada; defensa reduce abuso; disponibilidad mantiene la función esperada.  
**Ejemplo:** bloquear una ruta vulnerable puede defender; si rompe el login, perjudica la función.

**Contexto:** un integrante propone apagar el servicio ficticio de perfiles para que nadie lo ataque.  
**Tarea:** distinguí qué persiguen ataque, defensa y disponibilidad, y explicá por qué apagar el servicio no es una defensa completa sin especular sobre scoring.  
**Formato de respuesta:** tres viñetas — Ataque / Defensa / Disponibilidad y consecuencia.  
**Extensión máxima:** tres viñetas, una oración por viñeta. **Pista:** disponible.

## 2. F1-02 — Hecho, hipótesis y resultado en el canal del equipo

**Familia:** F1 · **Objetivo:** separar certeza, supuesto y observación · **Prerrequisitos:** F1-01 · **Herramientas:** ficha siguiente · **Ayuda:** pista 1.

**Modelo mínimo:** hecho = confirmado por fuente válida; hipótesis = explicación o regla posible; resultado = observación de una prueba concreta.  
**Ejemplo:** en un handoff, “curl devolvió 200 a las 14:05” es un resultado; “la base está caída” sigue siendo hipótesis hasta comprobarla.

**Contexto:** durante la competencia aparecen estos mensajes: A) “La duración comunicada es preliminar: 90–120 min”; B) “Alguien dijo que cada tick penaliza SLA”, sin reglamento; C) “`/health` devolvió 503; la IA afirma que la base de datos está caída”.  
**Tarea:** para A, B y C, indicá qué está respaldado, qué sigue siendo preliminar o hipótesis y qué decisión prematura evitarías.  
**Formato de respuesta:** tres viñetas `A/B/C: estado de evidencia → decisión que no tomaría todavía`.  
**Extensión máxima:** tres viñetas, una línea cada una. **Pista:** disponible.

## 3. F1-03 — Capas de funcionamiento

**Familia:** F1 · **Objetivo:** distinguir proceso, puerto, servicio y checker · **Prerrequisitos:** F1-01 · **Herramientas:** modelo · **Ayuda:** dos pistas.

**Modelo mínimo:** proceso = programa en ejecución; puerto en escucha = punto de red abierto; servicio = función útil completa. En formatos comunes, un checker prueba automáticamente alguna función, pero Cyber War no lo confirmó.  
**Ejemplo:** proceso y puerto pueden existir mientras `/login` devuelve 500.

**Contexto:** `api-demo` aparece en procesos y 127.0.0.1:8080 escucha; todavía no hubo petición.  
**Tarea:** indicá qué está demostrado, qué no y cuál es la próxima comprobación funcional segura.  
**Formato de respuesta:** tres líneas `Sabemos / No sabemos / Comprobaría`.  
**Extensión máxima:** tres líneas. **Pistas:** disponibles.

## 4. F2-01 — “El servicio está caído”

**Familia:** F2 Siguiente acción segura · **Objetivo:** observar antes de modificar · **Prerrequisitos:** F1-03 · **Herramientas:** comando mostrado · **Ayuda:** dos pistas.

**Modelo mínimo:** convertí la frase vaga en una prueba reproducible; primero observá y después decidí.  
**Ejemplo:** `curl -i http://127.0.0.1:8080/health` produce status, headers y body sin reiniciar nada.

**Contexto:** un compañero dice “el servicio de perfiles está caído”, sin salida ni hora.  
**Tarea:** indicá únicamente la primera acción segura, la evidencia exacta que registrarías y una o dos decisiones inmediatas condicionadas al resultado. No desarrolles un plan posterior.  
**Formato de respuesta:** `Acción:` una; `Registrar:` hora, conexión/error, status y elementos relevantes de headers/body; `Si... entonces...:` una o dos.  
**Extensión máxima:** cuatro líneas; una acción y hasta dos condicionales. **Pistas:** disponibles.

## 5. F4-06 — Cierre con señales distintas

**Familia:** F4 Verificación y comunicación · **Objetivo:** comunicar incertidumbre · **Prerrequisitos:** F1-02/F1-03 · **Herramientas:** notas · **Ayuda:** pista 1.

**Modelo mínimo:** un cierre útil separa observaciones, interpretación y siguiente prueba.  
**Ejemplo:** hecho: puerto abierto; hecho: `/health`=503; hipótesis: dependencia; próxima prueba: correlacionar el log.

**Contexto:** proceso y puerto existen, pero `/health` devuelve 503.  
**Tarea:** redactá un handoff que limite la conclusión al alcance de `/health`, separe hechos e hipótesis y deje una próxima acción.  
**Formato de respuesta:** cuatro líneas `Hechos / Hipótesis / Alcance funcional / Próxima acción`.  
**Extensión máxima:** cuatro líneas. **Pista:** disponible.

## Cierre

- Guardá respuestas originales, confianza, pistas, comentario opcional y fricción al escribir sólo si existió.
- Registrá final, tiempo total y tiempo aproximado de registro.
- La evaluación y la próxima recomendación quedan para la IA; no completes esos campos.

**Práctica externa siguiente:** 20–30 min de OverTheWire Bandit inicial o introducción guiada a terminal; TypeOps no la reemplaza.

### Criterio del piloto

- **Dificultad conceptual alta:** la IA encuentra 3 o más respuestas incorrectas por comprensión aun con el modelo, o se usaron 3+ pistas por bloqueo conceptual.
- **Extensión excesiva:** las respuestas exceden repetidamente el formato o incluyen planes no solicitados; puede alargar la sesión sin indicar dificultad conceptual.
- **Fricción administrativa:** el registro supera cinco minutos o obliga a navegar/rellenar campos que no aportan evidencia.
- **Fricción al escribir:** el usuario reporta símbolos difíciles, muchas correcciones, comandos difíciles o problemas de edición. No se infiere por duración.
- **Adecuado:** las respuestas permiten evaluar el razonamiento aunque el tiempo total exceda la referencia por extensión o registro.
