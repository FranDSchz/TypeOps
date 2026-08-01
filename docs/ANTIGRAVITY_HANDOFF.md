# Handoff de implementación — TypeOps V1

## 1. Objetivo del encargo

Implementar TypeOps V1: una aplicación web local-first y monousuario para micropráctica adaptativa de 2 a 10 minutos. Debe complementar el tutor, la terminal y los laboratorios mediante cuatro modos separados: copia técnica, comando desde intención, repaso/decisiones y práctica guiada.

El éxito no es “tener muchas funciones”. Es que el usuario pueda abrir, practicar con poco overhead, conservar evidencia separada y recibir una próxima recomendación explicable. Conocimiento, elección correcta, ejecución segura y verificación tienen prioridad sobre velocidad de escritura.

## 2. Contexto que no debe reinterpretarse

- El usuario es principiante.
- Cyber War es el 22 de agosto de 2026, presencial, Attack/Defense todos contra todos, equipo de tres; Internet e IA estarán permitidos.
- La duración de 90–120 minutos es preliminar.
- Ticks, checkers, SLA, flags, servicios y scoring no están confirmados como reglas particulares.
- TypeOps no sustituye formación. Su trabajo es coordinar práctica breve y adaptativa.
- Los pilotos mostraron valor en actividades operativas; también mostraron que una explicación mínima no basta para evaluar comandos nuevos, que las respuestas/formularios largos agregan fricción y que hay que separar error conceptual, herramienta, sintaxis, interpretación, verificación y mecánica.
- No hay que volver a debatir si conviene construir la app. Sí hay que detener una ampliación que no ayude a V1.

## 3. Documentos fuente y precedencia

Leer antes de modificar:

1. `AGENTS.md` — reglas del repositorio.
2. `docs/TYPEOPS_V1_PRODUCT_SPEC.md` — producto y alcance; autoridad funcional.
3. `docs/TYPEOPS_V1_CONTENT_SCHEMA.md` — contrato de datos; autoridad de formatos.
4. `docs/TYPEOPS_V1_ADAPTATION_RULES.md` — reglas y transiciones.
5. `docs/TYPEOPS_V1_INITIAL_CORPUS.md` — pack inicial cerrado.
6. `docs/TYPEOPS_V1_ACCEPTANCE_CRITERIA.md` — definición de terminado.
7. `docs/TYPEOPS_V1_IMPLEMENTATION_PLAN.md` — orden e hitos.

Usar `docs/CYBER_WAR_2026_CONTEXT.md` para claims de competencia y `typeops-v0/` como evidencia histórica, no como schema a mantener. Si dos documentos V1 parecen contradecirse, no inventar una tercera solución: señalar el conflicto y proponer el ajuste mínimo.

## 4. Alcance V1

### Funciones mínimas

- elegir modo;
- iniciar sesión rápida;
- configurar 2/5/10 minutos o 1–10 ejercicios;
- elegir foco recomendado o manual;
- mostrar contenido y capturar respuesta;
- ofrecer hasta dos pistas;
- mostrar feedback determinista cuando exista;
- guardar sesiones, intentos, progreso y mecánica;
- conservar respuestas abiertas pendientes sin bloquear;
- recomendar una próxima actividad y explicar por qué;
- importar/exportar packs y progreso con validación;
- US ANSI y navegación principal con teclado;
- funcionar offline sin servicios externos.

### Cuatro modos separados

1. **Typing técnico:** copia exacta de fragmentos coherentes; errores iniciales, correcciones, latencias y secuencias. Guía de dedos opcional como recomendación de layout, nunca detección física.
2. **Comando desde intención:** comando inerte; evaluar herramienta, estructura curada, sintaxis y mecánica por separado. Alternativa desconocida plausible queda pendiente.
3. **Repaso y decisiones:** exactas/estructuradas locales; abiertas guardadas para revisión externa u opcional, sin IA integrada.
4. **Práctica guiada:** modelo, sintaxis, ejemplo, guiada, sin ayuda y variante posterior; estados `new`, `learning`, `practicing`, `ready_for_assessment`, `review_due`.

Una sesión pertenece a un modo y no cambia automáticamente.

## 5. Fuera de alcance obligatorio

No implementar:

- terminal o ejecución de shell;
- requests reales o targets externos;
- servicios vulnerables, contenedores, labs o gameserver;
- flags/checkers/ticks/SLA/scoring funcional;
- API, generación o evaluación mediante IA;
- backend, cuentas, sincronización o multiusuario;
- rankings, logros o gamificación compleja;
- app nativa;
- ML o SRS sofisticado;
- evaluación semántica libre;
- catálogo exhaustivo;
- telemetría/analytics;
- detección de dedo físico.

No agregar una función porque sea fácil con una dependencia. Registrar como idea fuera de alcance.

## 6. Stack decidida

- Node.js 22 LTS y npm.
- React + TypeScript estricto.
- Vite, salida SPA estática.
- IndexedDB mediante Dexie local; no Dexie Cloud.
- Zod para packs/import/export.
- `vite-plugin-pwa` para manifest/service worker/precache.
- Vitest + React Testing Library + `user-event`.
- `fake-indexeddb` para repositorios.
- Playwright para seis recorridos críticos.
- ESLint y CSS local.

No usar Next.js, backend, Redux, kit visual ni router complejo salvo que aparezca una necesidad demostrable y se apruebe. Fijar versiones compatibles en lockfile.

## 7. Arquitectura

Capas obligatorias:

```text
React UI por modo
    ↓ comandos/eventos de aplicación
Dominio TypeScript puro
    ├─ evaluación determinista
    ├─ aprendizaje
    ├─ mecánica
    ├─ recomendación
    └─ composición de sesión
    ↓ repositorios
Dexie / IndexedDB

JSON de contenido → Zod + validación editorial → dominio
Export/import → Zod + preview + transacción atómica
```

Fronteras:

- React no contiene reglas de scoring/recomendación.
- Dominio no importa React ni Dexie.
- UI consume repositorios/interfaces, no tablas directamente.
- JSON nunca ejecuta lógica.
- No hay `eval`, shell, child process ni fetch a destinos del contenido.

## 8. Archivos previstos

La estructura recomendada está en `TYPEOPS_V1_IMPLEMENTATION_PLAN.md`. Como mínimo se esperan:

- configuración Vite/TypeScript/ESLint/Vitest/Playwright/PWA;
- `src/app/` y `src/features/{typing,command,review,guided,session,import-export}/`;
- `src/domain/{content,evaluation,learning,mechanical,recommendation,session}/`;
- `src/data/{db,repositories,transfer}/`;
- `src/content/typeops-foundations-es-ar/`;
- `src/ui/`, `src/test/`, `e2e/`;
- README con uso, backup, importación y límites.

Los nombres pueden simplificarse; las responsabilidades no deben mezclarse.

## 9. Modelo de datos mínimo

### Contenido

`ContentPack` versionado contiene units, items y guided paths. `ContentItem` es unión discriminada:

- `typing_copy`;
- `command_intention`;
- `exact_question`;
- `open_question`;
- `decision`;
- `guided_practice`.

Campos comunes: ID, modo, unidades, contexto, tarea, formato/límite, duración estimada, categorías, habilidades, dificultad, prerrequisitos, pistas, explicación, variante, seguridad, claim competitivo, secuencias mecánicas y fuentes.

### Datos del usuario

- `Session`: un modo, objetivo, foco, tiempos y cierre.
- `Attempt`: item/version, respuesta, pistas, confianza, evaluación dimensional, captura mecánica y revisión.
- `LearningProgress`: estado, práctica, review date y evidencia.
- `SkillEvidence`: dimensión competitiva sin score global.
- `MechanicalProfile`: secuencia/layout, muestra, error, corrección y latencia.
- `ExternalReview`: opcional e importada, nunca API.

Aplicar exactamente `TYPEOPS_V1_CONTENT_SCHEMA.md`; no diseñar un segundo formato.

## 10. Corpus obligatorio

Pack `typeops-foundations-es-ar@1.0.0`, exactamente 40 registros:

- 10 typing;
- 10 command;
- 12 review/decision;
- 8 guided.

Prioriza Linux, rutas/archivos, búsqueda, shell, procesos/puertos/servicios/logs, HTTP/curl, sesión/autenticación/autorización, Python mínimo, Attack-Defense, verificación, IA crítica y una introducción a BAC/IDOR.

No agregar SQL al pack inicial ni más vulnerabilidades. El schema puede soportarlas.

## 11. Evaluación y adaptación

### Evaluación

- exactas/choices/orden: local;
- comandos: alternativa + checks curados, por dimensión;
- abiertas: `pending_review`;
- plausibles no reconocidas: `needs_review`;
- mecánica: independiente;
- nunca ejecutar para “comprobar”.

### Recomendación

Aplicar prioridad ordenada, no score ponderado:

1. reanudar guided;
2. nuevo con guía;
3. review vencido;
4. alta confianza incorrecta;
5. concepto/herramienta;
6. interpretación/siguiente acción/verificación;
7. sintaxis;
8. mecánica con muestra;
9. variante tras pista;
10. variedad.

Toda recomendación devuelve `reasonCode`. El usuario conserva el control.

## 12. Hitos verificables

Trabajar en orden y cerrar cada hito con evidencia:

1. **Base reproducible:** scaffold, checks, shell, PWA mínima.
2. **Contrato de contenido:** Zod, validación cruzada y walking skeleton de cuatro modos.
3. **Persistencia/intercambio:** Dexie, migración, round trip y rollback.
4. **Dominio:** evaluadores, estados, mecánica, recomendador y sesión.
5. **Recorrido vertical:** elegir, responder, guardar y cerrar con teclado.
6. **Modos completos:** typing, comando, review, guided.
7. **Corpus de 40:** validado y revisado.
8. **Offline/resiliencia:** precache, import/export UI, actualizaciones seguras.
9. **Aceptación:** matriz AC, sesiones humanas y documentación.

La numeración detallada del plan usa Hito 0–8; esta lista describe las mismas nueve entregas.

## 13. Pruebas exigidas

- Unitarias de schema, evaluadores, estados, métricas, reglas y composición.
- Casos parametrizados de cada comando del corpus.
- Componentes consultados por roles/labels y escritura con `user-event`.
- IndexedDB: migración, persistencia, importación atómica, conflictos y round trip.
- Playwright: teclado, typing con corrección, abierta pendiente, reanudar guided, export/import y offline.
- Revisión editorial humana de comandos, HTTP, Python, seguridad y claims competitivos.

No perseguir porcentaje de cobertura arbitrario. Cubrir cada rama del contrato y cada `P0`.

## 14. Criterios de aceptación

La autoridad es `TYPEOPS_V1_ACCEPTANCE_CRITERIA.md`. Condiciones de entrega:

- AC-01 a AC-32 `P0` aplicables pasan; los P1 pendientes se explican.
- 40 items con distribución exacta.
- cuatro modos usables offline y por teclado.
- no hay evaluación falsa, ejecución, red externa ni score global.
- sesión de 2 minutos tiene ≤30 segundos de overhead; sesión de 10 minutos ≤90.
- import inválido no modifica datos.
- build reproducible desde dependencias fijadas.

## 15. Comandos de validación que el proyecto debe ofrecer

```text
npm ci
npm run typecheck
npm run lint
npm run test -- --run
npm run test:content
npm run build
npm run test:e2e
npm run dev
npm run preview
```

Documentar el comando único necesario para instalar navegadores de Playwright. Después de instalar dependencias y esos navegadores, validación y uso no deben necesitar Internet.

## 16. Cómo comenzar

1. Leer los siete documentos fuente en orden.
2. Inspeccionar repo y cambios existentes; preservarlos.
3. Presentar un plan que refleje Hito 0 y Hito 1, sin listar V1.1.
4. Implementar Hito 0.
5. Ejecutar typecheck, lint, test y build.
6. Implementar Hito 1 con sólo cinco registros walking-skeleton: uno por modo y una variante posterior de guided.
7. Congelar el schema sólo cuando esos cuatro recorridos puedan representarse y sus fixtures inválidos fallen correctamente.
8. Informar evidencia y esperar la decisión prevista por el flujo de trabajo antes de ampliar al dominio completo si el usuario pidió hitos separados.

No empezar escribiendo los 40 items ni la interfaz completa: primero demostrar el contrato y el recorrido vertical mínimo.

## 17. Regla de no ampliación

Cuando aparezca una idea fuera de V1:

1. verificar si un criterio P0 realmente la exige;
2. si no, registrarla como candidata futura con evidencia esperada;
3. continuar el hito actual;
4. no instalar dependencias ni crear abstracciones “por si acaso”.

V1.1 —carpetas locales, terminal externa, logs/archivos, flags estáticas, script de validación y 3–5 microentornos— no bloquea ni forma parte de esta implementación.

## 18. Formato del informe final

Entregar:

1. resultado funcional por modo;
2. hitos completados;
3. estructura y archivos principales;
4. modelo de datos y migraciones efectivas;
5. corpus y validación editorial;
6. reglas implementadas y motivos visibles;
7. pruebas/comandos ejecutados con resultados;
8. matriz de criterios P0/P1;
9. prueba offline y de teclado;
10. desviaciones o decisiones registradas;
11. riesgos/deuda pendientes;
12. instrucciones exactas para instalar, ejecutar, exportar y restaurar.

No usar “listo” si faltan P0, si un modo es sólo mock o si los datos no sobreviven una recarga.
