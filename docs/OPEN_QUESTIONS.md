# Preguntas abiertas

## 1. Estado conocido

No volver a tratar como preguntas:

- fecha: 22 de agosto de 2026;
- modalidad: presencial;
- formato: Attack/Defense, todos contra todos;
- equipo: tres integrantes;
- Internet e IA: permitidos;
- nivel del usuario: principiante absoluto;
- duración: 90–120 minutos, todavía preliminar;
- reglamento detallado: pendiente.

La separación completa entre hechos, preliminares e hipótesis está en [CYBER_WAR_2026_CONTEXT.md](CYBER_WAR_2026_CONTEXT.md).

## 2. Bloqueantes para estrategia de competencia

Requieren fuente oficial y pueden cambiar prioridades, roles o prácticas:

- ¿Cuál es la duración definitiva y la agenda?
- ¿Existen rondas/ticks, cuánto duran y cuándo comienza la interacción ofensiva?
- ¿Cómo se calcula el scoring?
- ¿Cómo se mide disponibilidad o SLA, si existe?
- ¿Qué comprueban los checkers, si existen, y cómo se reportan fallos?
- ¿Cómo funcionan flags, formato, vigencia, obtención y envío?
- ¿Qué servicios, lenguajes, OS y arquitectura se proporcionan?
- ¿Los equipos reciben servicios iguales?
- ¿Qué acceso administrativo existe?
- ¿Qué acciones ofensivas y defensivas están prohibidas?
- ¿Qué reglas existen para reinicios, firewall, snapshots, resets y modificación de servicios?

Hasta resolverlas, ticks, checkers, SLA, flags y scoring permanecen como hipótesis educativas.

## 3. Bloqueantes para herramientas e IA

- ¿Qué software puede preinstalarse o prepararse?
- ¿Se permiten repositorios, scripts y documentación propia?
- ¿Qué modelos/interfaces de IA estarán disponibles y con qué límites?
- ¿Se pueden enviar código, logs o datos de la competencia a servicios externos?
- ¿Qué información se considera secreta o no compartible además de credenciales/flags?
- ¿Se permiten proxies, scanners, automatización, concurrencia y envío automático?
- ¿Cómo será la conectividad y existe un plan si Internet falla?

Estas respuestas pueden cambiar el kit del equipo, pero no justifican integrar una API de IA en TypeOps.

## 4. Usuario y disponibilidad

- ¿Cuánto tiempo real puede dedicar por día y fin de semana?
- ¿Qué sistema, shell, editor y layout usará en la competencia?
- ¿Qué tareas básicas puede completar hoy sin guía?
- ¿Qué errores aparecen al usar terminal, HTTP y Python en laboratorios?
- ¿Qué herramientas conoce actualmente?
- ¿Qué experiencia tiene revisando comandos o código generado por IA?
- ¿Qué idioma se usará en reglamento, servicios y comunicación?

El nivel “principiante absoluto” fija el punto de partida, pero una línea base breve sigue siendo necesaria para elegir ejemplos y ayuda.

## 5. Equipo

- ¿Cuál es el nivel de los otros dos integrantes?
- ¿Qué experiencia tienen en Linux, web, programación, redes y defensa?
- ¿Qué disponibilidad tienen hasta el evento?
- ¿Qué roles prefieren y qué evidencia práctica los respalda?
- ¿Quién proporciona hardware, entorno y herramientas?
- ¿Qué tablero/canal compartido usarán presencialmente?
- ¿Quién será backup de cada responsabilidad?
- ¿Cuándo pueden realizar los tres drills y la simulación de 90 minutos?

Estas respuestas son bloqueantes para roles finales, no para comenzar fundamentos compartidos.

## 6. Preparación y contenido

- ¿Qué recurso/laboratorio beginner se usará para cada fase?
- ¿Qué comandos están disponibles en el entorno de práctica y cuáles serán probables en el evento?
- ¿Qué rúbricas necesitan revisión técnica de otro integrante?
- ¿Qué actividad produce sobrecarga para el nivel actual?
- ¿Qué intervalo de repaso funciona en la ventana de 22 días: 1/3/7 o necesita ajuste?
- ¿Qué conocimientos deben quedar como referencia consultable en vez de memoria?
- ¿Qué señal demuestra que puede introducirse presión temporal?
- ¿Qué tema avanzado se vuelve prerrequisito por nueva evidencia?

## 7. TypeOps V0

Decidido: protocolo manual con cuatro familias y corpus pequeño.

Preguntas de validación:

- ¿Una sesión se inicia y cierra en menos de cinco minutos de overhead?
- ¿Las cuatro familias cubren los bloqueos observados?
- ¿Qué actividades ahorran planificación o mejoran la práctica siguiente?
- ¿Qué campos del registro nunca cambian una decisión?
- ¿Las recomendaciones manuales son mejores que una lista fija?
- ¿Se registran errores mecánicos sin distraer del contenido?
- ¿El corpus puede mantenerse con menos de 20 minutos semanales del usuario?
- ¿Existe fricción repetida que justifique una CLI después del evento?

## 8. Métricas y validación

- ¿Qué tareas externas beginner son comparables?
- ¿Quién valida decisiones abiertas o técnicas?
- ¿Qué tiempo a primera acción es razonable por actividad?
- ¿Qué grado de ayuda cuenta como independiente?
- ¿Qué métricas internas predicen una práctica real?
- ¿Cómo registrar interrupciones sin burocracia?
- ¿TypeOps ahorra, queda neutro o consume tiempo en cada sesión?
- ¿Qué evidencia durante la competencia puede capturarse sin distraer?

## 9. Mecanografía

- ¿Qué errores aparecen realmente en comandos, `curl` y Python?
- ¿La dificultad es mecánica, conceptual o ambas?
- ¿Una transformación breve corrige el error en producción posterior?
- ¿La observación manual basta para V0?

No se usará WPM como norte ni se inferirá el dedo físico.

## 10. Decisiones pospuestas

Hasta el postmortem o nueva evidencia:

- CLI local;
- aplicación web local;
- framework, lenguaje y arquitectura técnica;
- base de datos;
- captura automática de teclado;
- terminal o sandbox;
- API/modelo de IA;
- scheduler sofisticado;
- generación/evaluación por LLM;
- dashboard, gamificación y multiusuario;
- plataforma de laboratorios o CTF;
- integración de flags/scoring;
- catálogo avanzado.

## 11. Orden para resolver preguntas

1. Obtener reglamento y restricciones.
2. Conocer nivel/disponibilidad de los otros dos integrantes.
3. Confirmar tiempo personal y entorno.
4. Ejecutar primera sesión V0 y primer drill.
5. Ajustar contenido y roles.
6. Recién después discutir automatización de TypeOps.

## 12. Registro de respuestas

```text
Pregunta:
Respuesta:
Estado: confirmado / preliminar / hipótesis / descartado
Fuente:
Fecha:
Impacto en preparación:
Impacto en TypeOps:
Qué podría invalidarla:
Documentos afectados:
```

