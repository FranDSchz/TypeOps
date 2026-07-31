# TypeOps V0: plan de ejecución

## 1. Decisión

**Elegir un protocolo manual, local y basado en archivos como TypeOps V0.**

Antes del 22 de agosto, TypeOps no será una aplicación. Será un corpus pequeño, sesiones prearmadas, una rúbrica y un registro mínimo. Su propósito es ahorrar la decisión “¿qué practico ahora?” y convertir errores reales en el siguiente repaso.

La decisión vale hasta el postmortem posterior a Cyber War. Una CLI solo se considera si el protocolo manual demuestra valor y su fricción de selección/registro es repetida y medible.

## 2. Comparación de alternativas

Las estimaciones son de planificación para un producto personal, no datos de mercado.

| Criterio | Protocolo manual | CLI local | Web local mínima |
|---|---|---|---|
| Primera utilidad | Mismo día al existir contenido | Después de definir comandos, formato y persistencia | Después de UI, estado, navegación y persistencia |
| Mantenimiento | Muy bajo; Markdown/CSV | Bajo–medio; runtime, compatibilidad y bugs | Medio–alto; UI, navegador, estado y build |
| Tiempo que quita al estudio | Mínimo | Puede consumir varios bloques de preparación | Alto para una ventana de 22 días |
| Datos automáticos | Pocos | Estructurados | Estructurados y eventos de teclado |
| Adaptación | Regla manual visible | Automatizable | Automatizable |
| Mecanografía | Observación manual dentro de respuestas | Captura de input limitada | Captura detallada posible |
| Riesgo de sobreconstrucción | Bajo | Medio | Alto |
| Portabilidad para el evento | Archivos legibles sin depender de ejecución | Depende del entorno | Depende del navegador/servidor local |
| Valor beginner-first | Alto si el contenido es bueno | El mismo contenido con menor fricción futura | No agrega aprendizaje inicial por sí solo |

### Por qué no CLI ahora

La CLI podría acelerar selección, tiempo y registro, pero el problema no está validado. El riesgo es optimizar el runner antes de saber qué cuatro familias de actividad sirven. Además, una persona principiante obtiene más de practicar la terminal real que de usar una simulación o comando TypeOps.

### Por qué no web ahora

La interfaz web permitiría observar teclas y presentar feedback, pero ese dato es secundario y el coste de construirla compite directamente con fundamentos y laboratorios. No existe evidencia de que una UI mejore la preparación antes del evento.

## 3. Resultado que V0 debe producir

En 12–18 minutos, V0 debe:

1. iniciar sin configuración;
2. presentar 4–6 actividades beginner-first;
3. obligar a responder antes de ver feedback;
4. registrar independencia, error causal y evidencia;
5. elegir como máximo dos repasos futuros;
6. terminar con una próxima acción concreta de estudio o laboratorio.

Si el protocolo tarda más de 3 minutos en preparar una sesión o más de 2 minutos en cerrarla, se simplifica.

## 4. Alcance: cuatro familias

### F1 — Modelo mental y reconocimiento

- Attack/Defense general;
- Linux, red, proceso, puerto y servicio;
- HTTP, autenticación, sesión, cookie y autorización.

Respuesta típica: explicación breve, clasificación o contraste.

### F2 — Siguiente acción segura

- elegir qué observar;
- predecir una salida;
- distinguir evidencia de suposición;
- usar logs y healthchecks;
- decidir cuándo consultar, actuar o escalar.

Respuesta típica: acción + razón + evidencia esperada.

### F3 — Construir o reparar

- comandos Linux/shell;
- `curl` y HTTP;
- Python básico.

Respuesta típica: comando, request o fragmento pequeño explicado. La mecanografía se observa aquí mediante errores y correcciones, nunca como WPM.

### F4 — Verificar y comunicar

- control positivo/negativo;
- revisar respuestas de IA;
- confirmar función de servicio;
- handoff de equipo;
- declarar límites y rollback conceptual.

Respuesta típica: checklist breve, crítica o estado operativo.

No habrá una quinta familia de mecanografía. La mecánica es una señal secundaria dentro de F3.

## 5. Flujo manual

### Preparación, máximo 3 minutos

1. Elegir dos actividades programadas para repaso.
2. Elegir una del foco del día.
3. Elegir una de verificación o coordinación.
4. Si no hay historial, usar la sesión prearmada de la fecha.

### Intento

Para cada actividad:

1. leer objetivo y estímulo;
2. responder sin abrir la solución;
3. marcar confianza baja/media/alta;
4. comparar con rúbrica;
5. clasificar: independiente / con pista / incorrecta;
6. registrar un solo error causal;
7. repetir inmediatamente solo si faltó un elemento fundamental.

### Cierre, máximo 2 minutos

- seleccionar hasta dos ítems para reaparición;
- anotar la habilidad que requiere práctica real;
- registrar si V0 ahorró o consumió tiempo;
- no crear nuevas tarjetas durante el cierre.

## 6. Regla adaptativa V0

Prioridad, en este orden:

1. error inseguro o alta confianza incorrecta;
2. fundamento necesario para el foco de mañana;
3. actividad fallada hace 1–3 días;
4. variante de algo resuelto con pista;
5. habilidad con poca evidencia y alta prioridad;
6. debilidad mecánica solo si reaparece en comandos reales.

Límites:

- máximo dos actividades por el mismo error en una sesión;
- máximo una actividad puramente de copia, y solo si su significado ya fue explicado;
- no introducir tema avanzado por novedad;
- no aumentar presión mientras la explicación causal sea incorrecta;
- el usuario puede rechazar una recomendación y anotar por qué.

## 7. Registro mínimo

Campos necesarios:

- fecha;
- actividad y versión;
- resultado: independiente / pista / incorrecta;
- confianza;
- tiempo aproximado o tiempo a primera acción, solo cuando aporte;
- error causal;
- evidencia o criterio omitido;
- próxima revisión;
- coste TypeOps: ahorró / neutro / consumió tiempo.

No registrar en V0:

- WPM;
- cada pulsación;
- longitud de respuesta como calidad;
- puntos, XP o rachas;
- telemetría de navegación;
- una puntuación global.

Para mecánica solo se anota algo como: “dos errores de quoting” o “reescribí tres veces el header”.

## 8. Presupuesto y gates

### Presupuesto

- setup para el usuario: menos de 10 minutos;
- sesión: 12–18 minutos;
- preparación/cierre: menos de 5 minutos combinados;
- mantenimiento semanal: menos de 20 minutos del usuario;
- TypeOps: no más del 20% del tiempo individual de preparación.

### Gate de 3 sesiones

Continuar si:

- se inicia sin fricción;
- evita decidir desde cero qué repasar;
- al menos un error reaparece en una variante útil;
- el registro permite elegir la próxima sesión;
- el coste es neutro o ahorra tiempo.

Simplificar o pausar si:

- preparar contenido interrumpe el plan diario;
- se acumulan respuestas sin práctica real;
- el usuario usa el tracker más que terminal/lab;
- las recomendaciones son obvias o irrelevantes.

### Gate del 10 de agosto

Evaluar:

- ¿F1–F4 siguen siendo las familias correctas?
- ¿qué campos nunca se usan?
- ¿qué actividades predicen mejor la práctica HTTP/terminal?
- ¿hay fricción que una CLI realmente resolvería?

No construir CLI solo por preferencia estética.

### Gate postcompetencia

Una CLI se justifica si, durante al menos seis sesiones:

- la selección/registro manual consume más de 5 minutos;
- se pierden o duplican revisiones;
- el contenido ya es estable;
- automatizar ahorraría tiempo neto;
- el usuario quiere mantener la práctica después del evento.

Una web local exige además evidencia de que la interacción visual o captura mecánica aporta algo que la CLI no puede.

## 9. Qué debería implementar la siguiente tarea

La siguiente tarea debe **implementar el V0 manual, no software**:

1. crear 24 actividades versionadas según `TYPEOPS_V0_CONTENT_PLAN.md`;
2. crear 8 variantes de los fundamentos más críticos;
3. preparar 6 sesiones de 12–18 minutos alineadas al calendario;
4. crear una clave/rúbrica separada para evitar ver respuestas antes de intentar;
5. crear una plantilla mínima de registro y un ejemplo completo;
6. crear 3 drills de handoff/coordinación para el equipo;
7. revisar seguridad, exactitud beginner-first y tiempo real de uso;
8. ejecutar una sesión de prueba y entregar un informe de fricción.

Formato sugerido de artefactos:

```text
content/v0/activities/
content/v0/variants/
content/v0/answer_key/
sessions/v0/
tracking/
team_drills/
```

La elección exacta entre un archivo por actividad o archivos agrupados puede resolverse por legibilidad; no habilita una base de datos.

## 10. Fuera de la siguiente tarea

- código ejecutable;
- framework o arquitectura técnica;
- CLI;
- servidor o web local;
- captura automática de teclado;
- terminal embebida;
- laboratorio o sandbox;
- API de IA;
- evaluación por LLM;
- login, perfiles o sincronización;
- scheduler sofisticado;
- dashboard;
- gamificación;
- cobertura de temas avanzados;
- commits o pushes salvo solicitud posterior explícita.

