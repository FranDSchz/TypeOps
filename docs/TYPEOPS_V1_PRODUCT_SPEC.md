# TypeOps V1 — Especificación de producto

## 1. Decisión de producto

TypeOps V1 será una aplicación web local-first de micropráctica adaptativa para sesiones de 2 a 10 minutos. Su trabajo es convertir tiempos muertos en práctica breve de mecanografía técnica, recuperación de comandos y conceptos, y decisiones operativas relacionadas con Attack-Defense.

No será el curso principal ni un laboratorio. El tutor, PortSwigger, OverTheWire, la terminal local, Python y la práctica de equipo seguirán enseñando y ejercitando en entornos reales. TypeOps conservará y hará reaparecer lo aprendido allí, detectará fricciones separadas y sugerirá la siguiente microactividad con una razón visible.

### Resultado esperado

Al abrir la aplicación, el usuario debe poder empezar en menos de 20 segundos, terminar una práctica útil en 2–10 minutos y salir sin completar formularios. El resultado de cada intento debe dejar evidencia separada de:

- fluidez mecánica;
- conocimiento recuperado;
- habilidad competitiva demostrada;
- ayuda utilizada y confianza;
- aspectos aún no evaluables localmente.

WPM puede mostrarse como dato secundario del modo de typing, pero no representa preparación CTF ni alimenta por sí solo el dominio conceptual.

## 2. Evidencia que cambia V0

Las sesiones piloto manuales justifican estas decisiones:

- Se priorizan situaciones operativas y contextualizadas porque fueron percibidas como más útiles.
- Una respuesta breve y un registro automático sustituyen consignas extensas y formularios manuales.
- Un comando nuevo entra por práctica guiada; una explicación de una frase no habilita evaluación.
- La evaluación separa desconocimiento conceptual, selección de herramienta, sintaxis, interpretación, verificación y fricción mecanográfica.
- Copiar texto técnico y producirlo desde una intención son modos distintos.
- Las respuestas abiertas se conservan, pero no bloquean la sesión ni reciben una falsa evaluación automática.
- La aplicación admite casos sin categoría visible e identificación introductoria de vulnerabilidades, pero no construye todavía un catálogo exhaustivo.

No se encontraron archivos independientes con resultados crudos de ambos pilotos. La especificación usa la revisión del primer piloto en `typeops-v0/VALIDATION.md`, los artefactos de V0 y la evidencia consolidada proporcionada para esta tarea. Esto no bloquea V1, pero impide reconstruir métricas cuantitativas confiables de los pilotos.

## 3. Usuario y contexto

- Usuario único y principiante.
- Preparación para Cyber War del 22 de agosto de 2026.
- Son hechos: modalidad presencial, Attack/Defense todos contra todos, equipo de tres, Internet e IA permitidos.
- La duración de 90–120 minutos es preliminar.
- Ticks, checkers, SLA, flags, servicios y scoring no son reglas confirmadas. El contenido puede explicar el modelo común de Attack-Defense sólo si lo etiqueta como modelo estándar o hipótesis.
- El uso principal ocurre en tiempos muertos o sesiones voluntarias muy cortas.

## 4. Principios de diseño

1. **Complemento, no currículo principal.** TypeOps recupera y practica; el contenido realmente nuevo recibe una secuencia guiada mínima.
2. **Cuatro modos separados.** Una actividad pertenece a un modo. No se crea una actividad híbrida para registrar todas las dimensiones a la vez.
3. **Contexto antes que decoración.** El escenario explica para qué sirve la acción; no simula una vulnbox cuando eso no aporta aprendizaje.
4. **Respuesta corta.** Comando, selección, una línea o pocas viñetas. Las consignas abiertas declaran extensión máxima.
5. **Evaluación honesta.** Lo que no puede calificarse determinísticamente queda pendiente; no se inventa comprensión semántica.
6. **Modelos separados.** Mecánica, conocimiento y competencia nunca se condensan en un puntaje global.
7. **Adaptación explicable.** Toda recomendación muestra una causa concreta y puede ser ignorada por el usuario.
8. **Offline y teclado primero.** Ninguna función principal depende de red, mouse, cuenta o servicio externo.
9. **Seguridad por alcance.** Sólo `localhost`, `127.0.0.1`, `example.test`, archivos ficticios y entornos autorizados. V1 no ejecuta comandos ni requests.
10. **Bajo mantenimiento.** El corpus es importable, versionado y validado; no hay backend ni generación dinámica.

## 5. Alcance funcional exacto

### Flujo común

1. Elegir uno de los cuatro modos.
2. Elegir duración —2, 5 o 10 minutos— o cantidad de ejercicios.
3. Opcionalmente elegir foco; por defecto se usa la recomendación explicada.
4. Resolver actividades de ese modo. La aplicación no cambia de modo durante la sesión.
5. Pedir una pista cuando exista.
6. Recibir feedback local cuando el tipo de respuesta lo permita.
7. Finalizar automáticamente por cantidad o, al completar la actividad en curso, por tiempo.
8. Ver un cierre de una pantalla: evidencia, pendiente de revisión y próxima recomendación.

No se solicita autoevaluación obligatoria. Confianza es opcional con valor `baja`, `media`, `alta` o `sin indicar`.

### Modo 1 — Typing técnico

El usuario copia un fragmento técnico coherente. V1 incluye comandos, Bash, rutas, HTTP, Python, SQL introductorio y explicaciones breves de seguridad.

Debe:

- comparar por caracteres sin ejecutar el texto;
- registrar error inicial por posición, corrección, latencia entre entradas, duración y consistencia;
- mostrar precisión final y errores corregidos por separado;
- derivar caracteres, símbolos, bigramas y secuencias débiles sólo con muestra suficiente;
- seleccionar fragmentos reales del corpus que contengan debilidades observadas;
- permitir desactivar métricas detalladas y guía de dedos;
- usar inicialmente el mapa US ANSI.

La guía indica “dedo recomendado para esta tecla según US ANSI”. Nunca afirma qué dedo físico usó la persona. No se generan pseudocomandos para insertar símbolos débiles.

### Modo 2 — Comando desde intención

Se muestra una intención operacional breve y el usuario escribe un comando sin ejecutarlo.

Debe evaluar separadamente:

- `tool_selection`: herramienta principal adecuada;
- `semantic_structure`: presencia y orden de partes requeridas dentro del subconjunto soportado;
- `syntax`: coincidencia con alternativas curadas o reglas deterministas del ejercicio;
- `mechanical`: errores/correcciones observados al escribir, sin convertirlos en error conceptual.

Las respuestas alternativas se declaran en el contenido. El evaluador no pretende comprender Bash general: aplica normalización conservadora y comprobaciones curadas. Si una respuesta no coincide pero podría ser válida, queda `needs_review`, se conserva y la sesión continúa.

### Modo 3 — Repaso y decisiones

Incluye recuperación conceptual, siguiente acción, interpretación de output, verificación, ataque, defensa, crítica de IA, comparación de casos e identificación preliminar de vulnerabilidades.

- Respuestas exactas, selección múltiple y estructuras pequeñas se evalúan localmente.
- Las abiertas guardan respuesta, rúbrica y estado `pending_review`.
- Una revisión externa posterior puede importarse, pero no hay API de IA.
- La categoría puede ocultarse cuando el contenido ya fue enseñado y la actividad busca reconocimiento; nunca se ocultan prerrequisitos esenciales.
- Las conclusiones deben limitarse a la evidencia observada.

### Modo 4 — Práctica guiada

Una unidad nueva sigue seis etapas, visibles y reanudables:

1. modelo mínimo;
2. sintaxis descompuesta;
3. ejemplo contextual;
4. ejercicio guiado;
5. ejercicio sin ayuda;
6. variante posterior, programada fuera de la misma exposición inmediata.

La unidad mantiene un estado personal: `new`, `learning`, `practicing`, `ready_for_assessment` o `review_due`. Ver una explicación no equivale a dominarla. La variante posterior no introduce contenido nuevo.

## 6. Funciones transversales

### Sesiones rápidas

- Presets de 2, 5 y 10 minutos y alternativa de 1–10 ejercicios.
- Estimación de duración propia de cada actividad para llenar el presupuesto sin cortar una respuesta.
- Reanudar una práctica guiada incompleta.
- Teclas visibles para iniciar, responder, pedir pista, omitir y finalizar.

### Feedback

- Inmediato sólo para evaluación determinista.
- Se muestra por dimensión, no como sentencia única.
- Una pista marca ayuda utilizada pero no convierte automáticamente el intento en incorrecto.
- En respuestas abiertas: confirmación de guardado, rúbrica disponible opcionalmente y estado pendiente.

### Persistencia e intercambio

- Guardar localmente contenido instalado, sesiones, intentos, progreso, estadísticas mecánicas, recomendaciones y configuración.
- Exportar contenido y progreso a JSON versionado.
- Importar con validación, vista previa y operación atómica: todo o nada.
- Nunca sobrescribir en silencio un pack con la misma identidad y versión incompatible.
- No guardar credenciales ni datos de objetivos reales.

### Recomendación

La aplicación propone una actividad y muestra una razón como:

- “Esta unidad es nueva: empezá con práctica guiada”.
- “Usaste una pista en `tail`; probá una variante sin ayuda”.
- “La elección fue correcta, pero faltó verificación”.
- “Este fragmento practica `|` y `-`, que tuvieron errores recientes”.

El usuario puede elegir otro modo o foco sin penalización.

## 7. Stack elegida

| Capa | Elección | Justificación |
|---|---|---|
| UI | React + TypeScript estricto | Los cuatro modos comparten shell, sesión, feedback y accesibilidad, pero conservan componentes separados. Los tipos discriminados reducen errores del contenido. |
| Build | Vite | Inicio rápido, plantilla React/TS, importación de JSON y salida estática sin servidor de aplicación. |
| Persistencia | IndexedDB mediante Dexie | IndexedDB es transaccional y apto para datos estructurados offline; Dexie reduce código incidental, agrega tipos y hace explícitas las migraciones. No se usa Dexie Cloud. |
| Validación | Zod | Valida packs, importaciones, exportaciones y migraciones en runtime; los tipos de TypeScript solos no validan JSON externo. |
| Offline | `vite-plugin-pwa` con precache de shell y corpus | Genera manifest y service worker. No se cachean APIs externas porque no existen. La actualización debe ser explícita para evitar perder una sesión. |
| Pruebas | Vitest + React Testing Library + `user-event` + `fake-indexeddb`; Playwright para pocos recorridos críticos | Pruebas rápidas del dominio y componentes, persistencia aislada y verificación real de teclado/offline/import-export en navegador. |
| Estilos/estado | CSS local + estado React y servicios de dominio | No se necesita kit visual, Redux ni router complejo en V1. Menos dependencias y control directo del foco. |

Se descarta una SPA vanilla porque la captura de eventos por sí sola sería simple, pero cuatro flujos, estados de sesión y accesibilidad producirían más coordinación manual. Se descartan Next.js y un backend porque SSR, rutas de servidor y despliegue no aportan al caso local de un usuario. Se descarta `localStorage` porque los intentos y estadísticas son estructurados, necesitan transacciones y evolucionarán mediante migraciones.

Referencias de la decisión: [React con TypeScript](https://react.dev/learn/typescript), [Vite y su build estático](https://vite.dev/guide/), [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), [Dexie con TypeScript](https://dexie.org/docs/Typescript), [Zod](https://zod.dev/), [Vitest](https://vitest.dev/guide/), [Testing Library user-event](https://testing-library.com/docs/user-event/intro/) y [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

## 8. Arquitectura conceptual

```text
App shell y navegación por teclado
  ├─ Selector y compositor de sesión
  ├─ Modo typing
  ├─ Modo intención→comando
  ├─ Modo repaso/decisiones
  └─ Modo práctica guiada
              │
Dominio puro ─┼─ evaluación determinista
              ├─ métricas mecánicas
              ├─ estados de aprendizaje
              └─ reglas de recomendación
              │
Datos locales ├─ repositorios IndexedDB
              ├─ packs de contenido validados
              └─ importación/exportación atómica
```

Las vistas no escriben directamente en IndexedDB ni deciden dominio. Los evaluadores y recomendadores son funciones deterministas y testeables. El contenido está separado del código de interfaz.

## 9. Modelos de evidencia separados

### Mecánico

Por layout y dispositivo: caracteres/símbolos, bigramas, errores iniciales, correcciones, latencia mediana, muestra y última observación. Sólo se actualiza en inputs técnicos configurados para captura.

### Conocimiento

Por unidad: exposición, respuestas, pistas, confianza, estado de aprendizaje, última práctica y próxima revisión. Una respuesta pendiente no modifica dominio hasta recibir evaluación.

### Competencia

Por habilidad: selección de herramienta, siguiente acción, interpretación y verificación, con evidencia reciente y cantidad de intentos independientes. No se infiere desde WPM.

## 10. Fuera de alcance de V1

- Terminal embebida o ejecución arbitraria de shell.
- Requests reales, servicios vulnerables, contenedores o laboratorios.
- Gameserver, flags dinámicas, checkers o simulación de scoring.
- Generación de contenido o evaluación libre mediante IA.
- API de IA obligatoria.
- Multiusuario, sincronización, rankings o gamificación compleja.
- Aplicación móvil nativa.
- Repetición espaciada sofisticada o machine learning.
- Catálogo exhaustivo de vulnerabilidades.
- Detección del dedo físico utilizado.
- Afirmar como reglas de Cyber War los detalles todavía no publicados.

## 11. V1.1 no bloqueante

Si V1 demuestra uso repetido y transferencia, V1.1 puede agregar 3–5 microentornos preparados fuera de la aplicación: carpetas locales, archivos/logs ficticios, terminal externa, flags estáticas y un script local limitado de validación. TypeOps sólo entregaría la tarea e importaría el resultado. No se diseña esta infraestructura en V1.

## 12. Decisiones que no deben reabrirse durante la implementación

- La aplicación se construye; su papel complementario no es motivo para detenerla.
- Los cuatro modos permanecen separados.
- La V1 es local, monousuario, sin backend y sin IA integrada.
- Los comandos se escriben pero no se ejecutan.
- Las respuestas abiertas pueden quedar pendientes.
- El corpus es pequeño y curado.
- Las recomendaciones son reglas explicables, no un puntaje ni ML.
- Una mejora fuera de alcance requiere evidencia nueva y una decisión documentada, no una ampliación oportunista.
