# Contexto confirmado de Cyber War 2026

## 1. Propósito

Este documento separa lo confirmado de lo tentativo para impedir que TypeOps enseñe como regla algo que todavía es solo un modelo general de Attack/Defense. La fuente de los datos de esta versión es la información proporcionada por el usuario el 31 de julio de 2026.

## 2. Hechos confirmados

- La competencia será el **sábado 22 de agosto de 2026**.
- Será **presencial**.
- El formato será **Attack/Defense**.
- La interacción competitiva será **todos contra todos**.
- El equipo tiene **tres integrantes**.
- Internet estará permitido.
- El uso de IA estará permitido.
- El usuario parte de un nivel **principiante absoluto**.
- El objetivo prioritario es maximizar preparación real antes de la competencia.
- TypeOps no debe consumir más tiempo del que ahorra.
- Todavía no se dispone del reglamento detallado.

Desde el 31 de julio hay 22 días completos hasta el evento. Esta ventana convierte el coste de oportunidad en una restricción de producto: una hora dedicada a TypeOps debe justificar por qué vale más que una hora de fundamentos, laboratorio o práctica de equipo.

## 3. Información preliminar

- La duración comunicada es de **90 a 120 minutos**.

“Preliminar” significa que puede cambiar. Se puede usar para planear ejercicios breves y coordinación rápida, pero no para fijar todavía timers, estrategia de scoring ni frecuencia de sincronización como si fueran reglas oficiales.

## 4. Hipótesis de trabajo

Las siguientes ideas provienen del modelo general de Attack/Defense y sirven para aprender, pero **no describen necesariamente Cyber War 2026**:

- podría haber rondas o ticks;
- podría existir uno o más checkers que verifiquen funcionalidad;
- podría medirse disponibilidad o SLA;
- podrían existir flags rotativas o con vigencia limitada;
- cada equipo podría recibir servicios iguales o comparables;
- podría haber vulnboxes, máquinas virtuales o contenedores;
- podrían valorarse por separado ataque, defensa y disponibilidad;
- podría existir un mecanismo automatizable de envío de flags;
- podrían permitirse parches, reinicios, snapshots o resets bajo condiciones específicas.

Estas hipótesis permiten enseñar conceptos como servicio funcional, verificación y rollback. No autorizan a construir automatizaciones ni estrategia específica del evento.

## 5. Inferencias para la preparación

Son decisiones razonadas, no hechos del evento:

1. **Fundamentos antes que amplitud.** Un principiante absoluto necesita comprender host, proceso, puerto, servicio, cliente, request, sesión y autorización antes de estudiar cadenas avanzadas.
2. **Coordinación como habilidad central.** Tres personas y un evento posiblemente corto hacen costosos la duplicación, el silencio y los handoffs incompletos.
3. **Arranque rápido.** Si la duración preliminar se confirma, inventariar, comprobar funcionalidad y asignar dueños con rapidez será probablemente más valioso que una optimización marginal de escritura.
4. **IA como amplificador supervisado.** Internet e IA reducen el valor de memorizar detalles raros, pero aumentan el valor de formular contexto, revisar comandos y verificar resultados.
5. **TypeOps V0 debe ser manual.** Antes del evento conviene un protocolo y corpus pequeño; una aplicación puede evaluarse después de observar fricción real.
6. **La inclinación web/ofensiva es provisional.** El rol final debe depender del reglamento, los servicios y las fortalezas de los tres integrantes.

## 6. Decisiones que ya cambian

| Decisión anterior | Nueva decisión | Motivo |
|---|---|---|
| Diagnosticar un nivel todavía desconocido | Diseñar beginner-first | El nivel absoluto ya está confirmado |
| Considerar un experimento de producto de 14 días antes del MVP | Usar un protocolo manual inmediatamente y estudiar en paralelo | Solo quedan 22 días y el producto no debe desplazar preparación |
| Foco web/ataque con piso defensivo | Piso compartido primero; especialización provisional después de evidencia | Equipo de tres y nivel inicial |
| Roadmap sin calendario | Roadmap previo al evento con gates semanales | La fecha está confirmada |
| Coordinación como capacidad futura | Preparación de equipo desde la primera semana | Evento presencial y equipo confirmado |

## 7. Preguntas pendientes de reglamento

### Bloqueantes para estrategia

- ¿La duración definitiva es 90 o 120 minutos, u otra?
- ¿Cómo se puntúan ataque, defensa y disponibilidad?
- ¿Existen ticks, cuánto duran y cuándo empieza el ataque?
- ¿Qué comprueban los checkers y cómo se informa su estado?
- ¿Cómo funcionan flags, vigencia, formato y envío?
- ¿Qué servicios, lenguajes, sistemas operativos y arquitectura se entregan?
- ¿Qué acceso administrativo tendrá cada equipo?
- ¿Qué acciones defensivas y ofensivas están prohibidas?

### Bloqueantes para herramientas

- ¿Qué equipos físicos y red se usarán?
- ¿Se permite software preinstalado, repositorios propios y scripts preparados?
- ¿Hay restricciones sobre modelos o servicios de IA?
- ¿Se pueden compartir código, logs o artefactos del evento con servicios externos?
- ¿Se permiten proxies, scanners, automatización, concurrencia o envío automatizado?
- ¿Qué reglas existen para reinicios, snapshots, firewall y resets?

## 8. Protocolo de actualización

Cada dato nuevo debe registrarse como:

```text
Dato:
Estado: confirmado / preliminar / hipótesis / descartado
Fuente:
Fecha:
Impacto en preparación:
Impacto en TypeOps:
Documentos afectados:
```

Cuando llegue el reglamento, primero se actualiza este documento; después se revisan el plan, los roles y el roadmap. No se traduce una mención del reglamento en una función de TypeOps sin justificar su valor de aprendizaje.

