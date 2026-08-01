# TypeOps V1 — Esquema de contenido y datos

## 1. Objetivo y versión

Este documento define el contrato que la implementación y el corpus deben compartir. La versión inicial es `content-schema/1.0.0`. El formato es JSON validado en runtime. TypeScript representa los mismos tipos mediante uniones discriminadas, pero Zod es la autoridad al leer datos externos.

Hay tres clases separadas:

1. **Contenido estático:** packs, unidades, actividades y rúbricas.
2. **Datos del usuario:** sesiones, intentos, progreso y mecánica.
3. **Intercambio:** sobre versionado para importar/exportar las anteriores.

El estado de aprendizaje no se escribe dentro de una actividad: es personal y vive en `LearningProgress`.

## 2. Convenciones

- Identificadores estables en minúsculas con guiones, por ejemplo `linux-tail-last-lines`.
- Identidad global de una actividad: `packId:itemId`.
- Versiones semánticas para schema y pack.
- Fechas persistidas como ISO 8601 UTC.
- Duraciones en milisegundos; estimaciones de contenido en segundos.
- Texto UTF-8 y saltos normalizados a `\n` al importar.
- Categorías visibles son etiquetas; habilidades son identificadores estables usados por adaptación.
- Todo campo desconocido se rechaza en V1, excepto `extensions`, reservado como objeto sin efecto funcional.

## 3. `ContentPack`

| Campo | Tipo | Obligatorio | Regla |
|---|---|---:|---|
| `schemaVersion` | literal `1.0.0` | sí | Versión del contrato. |
| `packId` | string | sí | Único y estable. |
| `packVersion` | semver | sí | Cambia cuando cambia el contenido. |
| `title` | string | sí | Nombre legible. |
| `locale` | literal `es-AR` | sí | Idioma inicial. |
| `createdAt` / `updatedAt` | fecha ISO | sí | Trazabilidad editorial. |
| `description` | string | sí | Propósito y alcance. |
| `sourceNotes` | `SourceNote[]` | sí | Puede ser vacío; no implica que la fuente sea regla competitiva. |
| `units` | `LearningUnit[]` | sí | Unidades conceptuales/prerrequisitos. |
| `items` | `ContentItem[]` | sí | Actividades discriminadas. |
| `guidedPaths` | `GuidedPath[]` | sí | Secuencias de seis etapas. |
| `extensions` | object | no | Ignorado por V1, nunca ejecutado. |

Validaciones del pack:

- todos los IDs son únicos dentro del pack;
- cada referencia apunta a una unidad, item o path existente;
- el grafo de prerrequisitos es acíclico;
- cada item declara una estimación entre 15 y 600 segundos;
- cada alternativa aceptada posee ID propio;
- no hay URLs de objetivos reales ni credenciales;
- todo contenido ofensivo declara contexto autorizado;
- toda regla competitiva usa clasificación `confirmed`, `preliminary`, `standard_model` o `hypothesis`.

## 4. `LearningUnit`

Representa qué se aprende, independiente de cómo se practica.

| Campo | Tipo | Descripción |
|---|---|---|
| `unitId` | string | Identidad estable. |
| `title` | string | Nombre breve. |
| `summary` | string | Modelo mínimo, máximo 500 caracteres. |
| `categories` | string[] | Por ejemplo `linux.logs`, `http.authorization`. |
| `skills` | `SkillRef[]` | Habilidades practicadas. |
| `pedagogicalDifficulty` | `1 \| 2 \| 3` | 1=primer contacto; 3=integra prerrequisitos, no dificultad “CTF”. |
| `prerequisiteUnitIds` | string[] | Deben estar enseñadas o marcadas conocidas. |
| `guidedPathId` | string opcional | Obligatorio para contenido nuevo evaluable. |
| `sourceNotes` | `SourceNote[]` | Fuente, nota editorial o procedencia externa. |

`SkillRef` contiene `skillId` y una dimensión: `knowledge`, `tool_selection`, `next_action`, `interpretation`, `verification` o `mechanical`. No se suman entre sí.

## 5. Campos comunes de `ContentItem`

| Campo | Tipo | Regla |
|---|---|---|
| `itemId` | string | Único en el pack. |
| `kind` | discriminante | Uno de los tipos de la sección 6. |
| `mode` | `typing`, `command`, `review`, `guided` | Debe ser compatible con `kind`. |
| `unitIds` | string[] | Al menos una unidad. |
| `title` | string | No revela la respuesta si `categoryVisibility=hidden`. |
| `context` | string | Plausible, breve y suficiente. |
| `task` | string | Una sola formulación operativa. |
| `responseFormat` | string | Ej.: “un comando” o “opción + una línea”. |
| `maxResponse` | objeto | `lines`, `bullets` o `characters`; al menos un límite. |
| `estimatedSeconds` | entero | 15–600. |
| `categories` | string[] | Para filtros y autoría. |
| `skills` | `SkillRef[]` | Evidencias que puede producir. |
| `difficulty` | `1 \| 2 \| 3` | Pedagógica. |
| `prerequisiteUnitIds` | string[] | Verificados al recomendar. |
| `hints` | `Hint[]` | 0–2; ordenadas, con `hintId` y texto. |
| `explanation` | string | Feedback posterior, no visible antes de responder. |
| `variantOf` | string opcional | La variante conserva habilidad y cambia superficie. |
| `categoryVisibility` | `visible \| hidden_when_ready` | Ocultar sólo si la unidad está lista. |
| `securityContext` | `SecurityContext` | Obligatorio. |
| `competitionClaim` | clasificación opcional | Impide presentar hipótesis como regla. |
| `mechanicalSequences` | `MechanicalSequence[]` | Declaradas y también verificadas al importar. |
| `sourceNotes` | `SourceNote[]` | Procedencia y fecha de consulta si aplica. |
| `enabled` | boolean | Permite retirar sin borrar historial. |

### `SecurityContext`

| Campo | Valores |
|---|---|
| `scope` | `safe_inert`, `authorized_lab_only`, `defensive_only` |
| `targets` | subconjunto de `localhost`, `127.0.0.1`, `example.test`, `fictional_files` |
| `executionAllowed` | siempre `false` en V1 |
| `note` | aclaración visible cuando corresponda |

### `MechanicalSequence`

Contiene `value` y `type` (`character`, `symbol`, `bigram`, `sequence`). Es metadato editorial para seleccionar fragmentos; un validador confirma que `value` aparece realmente en el texto objetivo. No se fabrican textos para acomodarlo.

## 6. Unión discriminada de actividades

### 6.1 `typing_copy`

Modo: `typing`.

Campos específicos:

- `targetText`: texto exacto y técnicamente válido;
- `language`: `shell`, `bash`, `path`, `http`, `python`, `sql`, `plain_technical`;
- `display`: `single_line` o `multiline`;
- `whitespacePolicy`: `exact` o `normalize_line_endings`;
- `fingerGuideEligible`: boolean;
- `technicalValidationNote`: por qué el fragmento es coherente.

No tiene respuesta alternativa. El resultado final se compara con el target, pero errores iniciales y correcciones se derivan del flujo de eventos, no sólo del texto final.

### 6.2 `command_intention`

Modo: `command`.

Campos específicos:

- `intent`: tarea solicitada;
- `answerSpec`: `CommandAnswerSpec`;
- `captureMechanical`: `true` por defecto;
- `unrecognizedPolicy`: siempre `needs_review`.

`CommandAnswerSpec`:

- `acceptedAlternatives`: 1–8 objetos con `alternativeId`, `text`, `tool`, `semanticTags` y explicación;
- `normalization`: sólo `trim_outer`, `line_endings` y, si el item lo autoriza, `spaces_outside_quotes`;
- `toolChecks`: patrones anclados y testeados para reconocer la herramienta principal;
- `requiredFragments`: fragmentos literales con orden declarado;
- `forbiddenFragments`: únicamente para acciones inseguras o que contradicen la intención;
- `syntaxChecks`: reglas editoriales limitadas, por ejemplo comillas requeridas alrededor de una variable.

El evaluador no ejecuta ni interpreta Bash completo. Si las comprobaciones no alcanzan para decidir, devuelve `needs_review`, nunca `incorrect` por descarte.

### 6.3 `exact_question`

Modo: `review`.

- `answerType`: `single_choice`, `multiple_choice`, `short_exact` o `ordered_steps`;
- `options`: requerido para choices;
- `acceptedAnswers`: alternativas normalizadas;
- `feedbackByOption`: explicación específica opcional;
- `caseSensitive`: `false` por defecto.

### 6.4 `open_question`

Modo: `review`.

- `rubric`: `Rubric` obligatoria;
- `reviewPolicy`: `pending_external` o `optional_self_review`;
- `captureMechanical`: `false` por defecto;
- `maxResponse` estricto.

No recibe evaluación semántica automática en V1.

### 6.5 `decision`

Modo: `review`.

- `evidence`: lista de observaciones entregadas;
- `choices`: decisiones plausibles;
- `correctChoiceIds`: una o más;
- `requiredEvidenceIds`: qué evidencia respalda la decisión;
- `conditionalBranches`: hasta dos condiciones “si X, entonces Y”;
- `rubric`: necesaria si incluye justificación abierta.

Permite evaluar elección localmente y dejar la justificación pendiente por separado.

### 6.6 `guided_practice`

Modo: `guided`.

- `unitId`: una unidad principal;
- `stages`: exactamente `model`, `syntax_breakdown`, `contextual_example`, `guided_exercise`, `unassisted_exercise`, `later_variant`;
- `resumePolicy`: `next_incomplete_stage`;
- `promotionRule`: referencia a regla de estado;
- `laterVariantItemId`: item distinto, no presentado en la misma exposición.

Cada etapa contiene texto, acción esperada y criterio de avance. `guided_exercise` permite ayudas visibles. `unassisted_exercise` no muestra la solución. `later_variant` es una referencia programable, no una repetición inmediata obligatoria.

## 7. Pistas, rúbricas y fuentes

### `Hint`

- `hintId` estable;
- `level`: 1 o 2;
- `text`;
- `reveals`: `concept`, `tool`, `structure` o `syntax`.

Registrar qué reveló permite interpretar el intento; no se aplica una penalización numérica universal.

### `Rubric`

- `rubricId`;
- `essentialElements`: elementos observables;
- `acceptableAlternatives`;
- `commonErrors`: cada uno con `errorCode` y explicación;
- `verificationCriterion`;
- `doNotInfer`: conclusiones que la evidencia no permite;
- `shortFeedbackTemplate` opcional.

Errores V1: `concept_unknown`, `tool_selection`, `syntax`, `interpretation`, `verification_omitted`, `unsafe_action`, `overgeneralization`, `weak_next_action`, `ai_critique`, `mechanical_friction` y `other_reviewed`.

### `SourceNote`

- `type`: `official_doc`, `course_note`, `tutor_note`, `manual_pilot`, `standard_model`, `competition_info` o `editorial`;
- `title`;
- `reference` opcional;
- `accessedAt` opcional;
- `claimStatus`: `confirmed`, `preliminary`, `standard_model`, `hypothesis` o `not_applicable`;
- `note`.

## 8. Datos de ejecución

### `Session`

| Campo | Descripción |
|---|---|
| `sessionId` | UUID generado localmente. |
| `mode` | Un único modo. |
| `goal` | `duration` o `count`, con valor. |
| `focus` | Foco elegido o `recommended`. |
| `startedAt`, `endedAt` | Tiempos de sesión. |
| `attemptIds` | Intentos en orden. |
| `completionReason` | `goal_reached`, `user_stopped`, `interrupted`. |
| `appVersion`, `contentVersions` | Reproducibilidad. |

### `Attempt`

- identidad: `attemptId`, `sessionId`, `itemRef`, `startedAt`, `submittedAt`;
- respuesta: `responseRaw`, `responseNormalized`, `selectedChoiceIds` según tipo;
- ayuda: `hintIdsUsed`, `confidence`;
- evaluación: `EvaluationResult`;
- mecánica: `mechanicalCaptureId` opcional;
- contexto: `learningStateBefore`, `recommendationReason`, `skipped`;
- revisión: `reviewStatus`, `externalReview` opcional;
- versión de contenido exacta.

### `EvaluationResult`

Cada dimensión es independiente y usa `correct`, `partial`, `incorrect`, `not_assessed` o `needs_review`:

- `concept`;
- `toolSelection`;
- `semanticStructure`;
- `syntax`;
- `interpretation`;
- `verification`;
- `mechanical` se referencia, no se mezcla en el resultado conceptual;
- `feedback`: máximo 300 caracteres;
- `matchedAlternativeId` opcional;
- `errorCodes`;
- `evaluator`: `local_exact`, `local_rules`, `external_import`, `self_optional` o `none`.

### `MechanicalCapture`

Se almacena el resumen por defecto, no necesariamente cada tecla cruda para siempre:

- `layout`: `us-ansi`;
- `targetText` o hash/referencia al item;
- `finalText`;
- `durationMs`;
- `initialErrorCount`, `correctedErrorCount`, `uncorrectedErrorCount`;
- `correctionCount`;
- `characterObservations[]` con target, producido, posición, primer intento correcto y latencia;
- `sequenceObservations[]` para bigramas/secuencias;
- `timingSampleCount`;
- `consistency`: mediana y dispersión robusta de intervalos, sólo si hay muestra suficiente;
- `captureLimitations`: foco perdido, pegado, composición o evento incompleto.

Pegar texto invalida las métricas mecánicas de ese intento, no la respuesta conceptual. No se infiere dedo físico.

## 9. Progreso derivado

### `LearningProgress`

- `unitRef`;
- `state`: `new`, `learning`, `practicing`, `ready_for_assessment`, `review_due`;
- `firstSeenAt`, `lastPracticedAt`, `nextReviewAt`;
- `independentSuccesses`, `hintedSuccesses`, `assessedAttempts`;
- `lastErrorCodes`;
- `lastConfidence`;
- `guidedStageCompleted`;
- `evidenceAttemptIds`.

### `SkillEvidence`

- `skillId` y dimensión;
- últimos intentos evaluados;
- `status`: `insufficient_evidence`, `needs_work`, `emerging`, `reliable`;
- fecha y cantidad de evidencia independiente.

No se calcula promedio entre dimensiones.

### `MechanicalProfile`

Por secuencia y layout:

- muestra válida;
- tasa de error inicial;
- tasa de corrección;
- latencia mediana y dispersión;
- última observación;
- tendencia descriptiva cuando existen al menos tres sesiones.

Una secuencia no se etiqueta “débil” antes del umbral mínimo definido en las reglas de adaptación.

## 10. Importación y exportación

### `TypeOpsExport`

- `format`: `typeops-export`;
- `exportSchemaVersion`: `1.0.0`;
- `appVersion`;
- `exportedAt`;
- `deviceLabel` opcional;
- secciones seleccionables: `contentPacks`, `sessions`, `attempts`, `progress`, `mechanicalProfiles`, `settings`, `externalReviews`;
- `integrity`: cantidades por colección y checksum por pack.

### Proceso de importación

1. Leer como dato no confiable.
2. Validar tamaño máximo configurable y JSON válido.
3. Validar schema con Zod.
4. Validar referencias, seguridad y checksums.
5. Mostrar vista previa: nuevos, actualizados, conflictos y rechazados.
6. Requerir confirmación.
7. Escribir en una transacción IndexedDB.
8. Si algo falla, no aplicar ningún cambio.

Política de conflictos:

- mismo pack y misma versión/checksum: omitir duplicado;
- mismo pack, versión superior: instalar junto con migración editorial explícita;
- mismo pack/versión y checksum diferente: conflicto, rechazar;
- intento con mismo UUID: omitir si idéntico, conflicto si difiere;
- progreso se recalcula desde intentos cuando sea posible; no se elige el valor más alto a ciegas.

## 11. Validación editorial obligatoria

Antes de aceptar un pack, comprobar:

- JSON y schema válidos;
- referencias y prerrequisitos válidos;
- alternativas de comando pasan casos positivos y negativos declarados;
- target de typing contiene las secuencias declaradas y es técnicamente correcto;
- pistas no revelan más de lo declarado;
- actividad abierta posee rúbrica y límite de extensión;
- actividad nueva posee práctica guiada;
- variante conserva habilidad y no introduce prerrequisito;
- contextos y targets cumplen la allowlist;
- ninguna hipótesis competitiva aparece como confirmada;
- no hay secretos, IPs externas ni ejecución habilitada.

## 12. Migraciones

- `schemaVersion` gobierna forma de contenido; `packVersion` gobierna sus datos.
- La app sólo carga versiones mayores compatibles expresamente. Una major desconocida se rechaza con explicación.
- Cada cambio de IndexedDB incrementa versión y tiene prueba de migración desde la versión anterior.
- Los intentos históricos preservan `itemRef` y `packVersion` original aunque el contenido se actualice.
- Una migración nunca inventa evaluación faltante ni combina modelos de evidencia.
