# Sesión 1 — Piloto: orientarse antes de actuar

**Objetivo principal:** formar un modelo mínimo de Attack/Defense, distinguir evidencia de hipótesis y elegir una primera observación segura.  
**Prerrequisitos:** ninguno. **Duración:** 15–17 min. **Materiales:** este archivo, papel/editor y una copia del registro de sesión.  
**No consultar:** Internet, IA, clave de respuestas antes del intento.  
**Sí consultar:** únicamente los modelos y ejemplos de esta página; después del intento, las pistas de `../answer-keys/session-01-key.md`.  
**Cronómetro opcional:** iniciá uno de 17 min; no lo uses para apurarte ni calcular WPM.

## Instrucciones exactas

1. Leé cada modelo y ejemplo; son enseñanza, no pistas ocultas.
2. Respondé con tus palabras. Anotá al final `Confianza: baja/media/alta`.
3. Si no podés avanzar en 45 segundos, escribí `Pido pista 1`, registralo y leé sólo la pista de esa actividad.
4. Tras las cinco actividades, abrí la clave, evaluá y completá el cierre. No corrijas silenciosamente tu respuesta original.

> **Modelo estándar, no regla oficial de Cyber War:** en muchos Attack/Defense, los equipos protegen servicios propios, intentan obtener flags o evidencia en rivales y deben conservar función/disponibilidad. Checkers, ticks, SLA, flags y scoring concretos de Cyber War 2026 siguen sin confirmar.

## 1. F1-01 — Ataque, defensa y función (2 min)

**Familia:** F1 Modelo mental · **Objetivo:** distinguir tres objetivos · **Prerrequisitos:** ninguno · **Herramientas:** modelo anterior · **Ayuda:** pista 1.

**Modelo mínimo:** ataque busca una ventaja o evidencia autorizada; defensa reduce abuso; disponibilidad mantiene la función esperada.  
**Ejemplo:** bloquear una ruta vulnerable puede defender; si rompe el login, perjudica la función.

**Contexto:** un integrante propone apagar el servicio ficticio de perfiles para que nadie lo ataque.  
**Consigna:** explicá en tres líneas qué persiguen ataque, defensa y disponibilidad, y por qué apagar el servicio no es una defensa completa.  
**Producí:** tres líneas conceptuales y una consecuencia verificable. **Pista:** disponible.  
**Registro:** resultado, confianza, pista y error causal dominante.

## 2. F1-02 — Hecho, hipótesis y resultado (2 min)

**Familia:** F1 · **Objetivo:** separar certeza, supuesto y observación · **Prerrequisitos:** F1-01 · **Herramientas:** ficha siguiente · **Ayuda:** pista 1.

**Modelo mínimo:** hecho = confirmado por fuente válida; hipótesis = explicación o regla posible; resultado = observación de una prueba concreta.  
**Ejemplo:** “será presencial” es hecho informado; “ticks de 60 s” es hipótesis; “curl devolvió 200 a las 14:05” es resultado.

**Contexto:** Cyber War será Attack/Defense, pero falta el reglamento detallado.  
**Consigna:** clasificá y justificá: A) duración preliminar 90–120 min; B) habrá penalización SLA por cada tick; C) una comprobación local devolvió HTTP 503.  
**Producí:** clasificación A/B/C y una frase de justificación por elemento. **Pista:** disponible.  
**Registro:** señalá si confundiste información preliminar con regla confirmada.

## 3. F1-03 — Capas de funcionamiento (3 min)

**Familia:** F1 · **Objetivo:** distinguir proceso, puerto, servicio y checker · **Prerrequisitos:** F1-01 · **Herramientas:** modelo · **Ayuda:** dos pistas.

**Modelo mínimo:** proceso = programa en ejecución; puerto en escucha = punto de red abierto; servicio = función útil completa. En formatos comunes, un checker prueba automáticamente alguna función, pero Cyber War no lo confirmó.  
**Ejemplo:** proceso y puerto pueden existir mientras `/login` devuelve 500.

**Contexto:** `api-demo` aparece en procesos y 127.0.0.1:8080 escucha; todavía no hubo petición.  
**Consigna:** indicá qué sabemos, qué no sabemos y cuál es la próxima comprobación segura.  
**Producí:** hecho, límite de evidencia y comprobación funcional. **Pistas:** disponibles.  
**Registro:** marcá si trataste proceso o puerto como prueba suficiente.

## 4. F2-01 — “El servicio está caído” (3 min)

**Familia:** F2 Siguiente acción segura · **Objetivo:** observar antes de modificar · **Prerrequisitos:** F1-03 · **Herramientas:** comando mostrado · **Ayuda:** dos pistas.

**Modelo mínimo:** convertí la frase vaga en una prueba reproducible; primero observá y después decidí.  
**Ejemplo:** `curl -i http://127.0.0.1:8080/health` produce status, headers y body sin reiniciar nada.

**Contexto:** un compañero dice “el servicio de perfiles está caído”, sin salida ni hora.  
**Consigna:** escribí la primera acción segura, qué evidencia esperás y qué harías sólo después de verla.  
**Producí:** acción + evidencia + decisión condicional. **Pistas:** disponibles.  
**Registro:** marcá cualquier reinicio o parche propuesto sin observar.

## 5. F4-06 — Cierre con señales distintas (2 min)

**Familia:** F4 Verificación y comunicación · **Objetivo:** comunicar incertidumbre · **Prerrequisitos:** F1-02/F1-03 · **Herramientas:** notas · **Ayuda:** pista 1.

**Modelo mínimo:** un cierre útil separa observaciones, interpretación y siguiente prueba.  
**Ejemplo:** hecho: puerto abierto; hecho: `/health`=503; hipótesis: dependencia; próxima prueba: correlacionar el log.

**Contexto:** proceso y puerto existen, pero `/health` devuelve 503.  
**Consigna:** redactá máximo cuatro líneas con hechos, hipótesis, estado funcional y próxima acción.  
**Producí:** handoff breve y verificable. **Pista:** disponible.  
**Registro:** marcá si presentaste una hipótesis como hecho.

## Cierre (2 min)

- Evaluá con la clave: correcto/parcial/incorrecto; no cambies la respuesta original.
- Elegí un solo error causal dominante y una regla de adaptación de la plantilla.
- Anotá una frase: `En la próxima sesión voy a comprobar ______ antes de concluir ______.`

**Práctica externa siguiente:** 20–30 min de OverTheWire Bandit inicial o introducción guiada a terminal; TypeOps no la reemplaza.

### Criterio del piloto

- **Demasiado difícil:** 3 o más actividades incorrectas aun usando el modelo, o 3+ pistas, o no se termina en 18 min por comprensión.
- **Demasiado fácil:** 5 correctas sin pista, cierre incluido en menos de 12 min y podés justificar cada respuesta; usá después variantes, no más volumen.
- **Demasiada fricción:** más de 5 min de registro, más de 3 min de fricción mecánica, o tenés que navegar entre archivos más de cuatro veces.
- **Adecuado:** 12–18 min, al menos 3 respuestas correctas/parciales con razonamiento y un error causal identificable.

