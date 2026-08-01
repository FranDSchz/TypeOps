# TypeOps V1 — Plan de implementación

## 1. Mandato

Construir la aplicación definida en `TYPEOPS_V1_PRODUCT_SPEC.md` sin rediseñarla. El orden prioriza obtener recorridos verticales verificables y evita crear primero una infraestructura genérica.

Stack cerrada:

- Node.js 22 LTS; como mínimo una versión compatible con Vite actual (20.19+ o 22.12+).
- npm y lockfile versionado.
- React, TypeScript estricto y Vite.
- Dexie sobre IndexedDB, sin Dexie Cloud.
- Zod para datos de runtime.
- `vite-plugin-pwa` para shell/corpus offline.
- Vitest, React Testing Library, `user-event` y `fake-indexeddb`.
- Playwright sólo para recorridos de navegador críticos.
- ESLint; CSS local sin framework visual.

Las versiones exactas deben resolverse juntas al iniciar y quedar fijadas en `package-lock.json`. No se usa `latest` en comandos reproducibles posteriores.

## 2. Arquitectura prevista

```text
/
├─ src/
│  ├─ app/                    # shell, rutas/vistas y composición de sesión
│  ├─ features/
│  │  ├─ typing/
│  │  ├─ command/
│  │  ├─ review/
│  │  ├─ guided/
│  │  ├─ session/
│  │  └─ import-export/
│  ├─ domain/
│  │  ├─ content/             # tipos, schemas y validación editorial
│  │  ├─ evaluation/          # evaluadores deterministas
│  │  ├─ learning/            # estados y evidencia
│  │  ├─ mechanical/          # captura y agregación
│  │  ├─ recommendation/      # reglas y motivos
│  │  └─ session/             # presupuesto y selección
│  ├─ data/
│  │  ├─ db/                  # Dexie, migraciones
│  │  ├─ repositories/        # puertos de persistencia
│  │  └─ transfer/            # import/export atómico
│  ├─ content/
│  │  └─ typeops-foundations-es-ar/
│  ├─ ui/                     # componentes accesibles compartidos
│  └─ test/                   # fixtures y setup
├─ e2e/                       # recorridos Playwright
├─ public/                    # manifest/assets locales necesarios
├─ scripts/                   # sólo validadores/editorial, no runtime CTF
└─ docs/                      # especificación fuente
```

No es obligatorio conservar exactamente cada carpeta si una simplificación mejora claridad, pero deben permanecer estas fronteras:

- UI no accede directamente a Dexie.
- contenido no contiene lógica ejecutable;
- dominio no depende de React;
- evaluadores no ejecutan comandos;
- recomendación consume evidencia separada y devuelve motivo;
- importación valida antes de escribir.

## 3. Estrategia de entrega

Cada hito termina en una versión ejecutable o en un contrato probado. No iniciar el siguiente si fallan sus criterios. Se permiten commits por hito al agente de desarrollo sólo si su encargo los autoriza; esta especificación no los realiza.

### Hito 0 — Base reproducible

**Pregunta:** ¿Existe una base mínima que compila y prueba sin decisiones ocultas?

Entregar:

- proyecto Vite React/TS en la raíz existente, preservando documentación;
- TypeScript estricto, ESLint y scripts de validación;
- Vitest/RTL y Playwright configurados;
- estilos base y shell vacío accesible;
- PWA configurada sin requests externos;
- README de desarrollo con Node/npm requeridos.

Evidencia:

- typecheck, lint, test y build pasan;
- preview abre en localhost;
- no hay framework de UI, backend ni router innecesario.

No hacer: diseñar todos los modos, agregar analytics o escoger una base remota.

### Hito 1 — Contrato y loader de contenido

**Pregunta:** ¿El contenido puede evolucionar sin romper ni infiltrarse como datos no validados?

Entregar:

- schemas Zod del pack y unión discriminada;
- tipos inferidos;
- validación cruzada de IDs, prerrequisitos, seguridad y secuencias;
- loader del pack bundled;
- un “walking skeleton” de 1 item por modo y 1 guided completo;
- reporte editorial legible.

Evidencia:

- pack mínimo válido carga;
- fixtures con major desconocida, referencia rota, target externo, ejecución habilitada y secuencia ausente fallan con mensaje específico;
- no se renderiza contenido inválido.

Decisión habilitada: congelar schema `1.0.0` antes de escribir los 40 items.

### Hito 2 — Persistencia e intercambio

**Pregunta:** ¿Se puede usar sin cuenta y recuperar/mover el progreso de forma segura?

Entregar:

- Dexie con tablas para packs, sesiones, intentos, progreso, perfiles mecánicos, revisiones y settings;
- interfaces de repositorio usadas por dominio;
- primera migración y fixture de migración;
- export selectivo;
- importación con vista previa, conflictos y transacción atómica.

Evidencia:

- round trip export/import conserva datos equivalentes;
- import inválido no deja escrituras parciales;
- recarga conserva un intento;
- misma versión/checksum se omite y conflicto se rechaza.

### Hito 3 — Dominio determinista

**Pregunta:** ¿Las decisiones centrales funcionan sin UI y sin IA?

Entregar:

- evaluación exacta/choices/ordered steps;
- evaluación curada de comandos por dimensiones;
- estado `needs_review`;
- máquina de estados de aprendizaje;
- captura/resumen mecánico como función de eventos normalizados;
- perfiles con muestras mínimas;
- recomendador ordenado con `reasonCode`;
- compositor de sesiones por duración/cantidad.

Evidencia:

- tests parametrizados para cada regla de adaptación;
- typo corregido queda separado de sintaxis final;
- respuesta plausible desconocida no se marca incorrecta;
- un error conceptual gana prioridad sobre mecánica;
- ningún módulo importa APIs de shell/red.

### Hito 4 — Recorrido vertical de sesión

**Pregunta:** ¿Se puede empezar, responder, guardar y cerrar una micropráctica con teclado?

Entregar:

- selector de modo/objetivo/foco;
- shell y estado de sesión;
- componente común de contexto, tarea, formato, extensión, pista y confianza opcional;
- guardado por intento;
- cierre de una pantalla con recomendación;
- shortcuts sin interferir con inputs.

Usar inicialmente el item walking-skeleton de cada modo; todavía no completar corpus.

Evidencia:

- AC-01, AC-02, AC-03 y AC-25 pasan;
- sesión de 2 minutos no exige formulario;
- recarga posterior muestra el intento.

### Hito 5 — Cuatro modos completos

**Pregunta:** ¿Cada modo cumple su función sin convertirse en un híbrido?

Entregar en este orden:

1. **Typing:** input controlado, eventos, feedback mecánico, guía US ANSI opcional.
2. **Comando:** intención, evaluación dimensional y alternativas.
3. **Repaso:** exactas, decisiones y abiertas pendientes.
4. **Guided:** seis etapas, reanudación, pistas y transición de estado.

Evidencia por modo:

- typing distingue error inicial/corrección/final;
- comando muestra herramienta/estructura/sintaxis por separado;
- abierta continúa como pendiente;
- guided no habilita evaluación antes del ejercicio sin ayuda;
- el modo de la sesión no cambia.

No crear un renderer universal prematuro. Compartir componentes pequeños; mantener controladores de modo separados.

### Hito 6 — Corpus inicial completo

**Pregunta:** ¿Hay contenido suficiente y correcto para usar V1, no sólo una demo técnica?

Entregar los 40 registros de `TYPEOPS_V1_INITIAL_CORPUS.md`:

- 10 typing;
- 10 command;
- 12 review/decision;
- 8 guided.

Evidencia:

- validador informa exactamente 40 y distribución correcta;
- todos los casos de comando se ejecutan como tests parametrizados;
- revisión humana de comandos, HTTP, Python, respuestas y claims competitivos;
- no hay respuesta visible antes de enviar;
- todos los nuevos comandos tienen enseñanza guiada.

### Hito 7 — Offline, import/export y resiliencia UX

**Pregunta:** ¿La aplicación es realmente local-first y segura ante interrupciones?

Entregar:

- precache de shell, estilos y pack bundled;
- manifest y estrategia de actualización que respeta sesión activa;
- UI de import/export y errores;
- indicador local/offline sobrio;
- recuperación de borrador de guided o descarte explícito;
- ausencia de recursos CDN.

Evidencia:

- recorrido Playwright offline de cada modo;
- export funciona offline;
- import corrupto no altera base;
- auditoría de red en cero requests externas.

### Hito 8 — Aceptación y entrega

**Pregunta:** ¿V1 ahorra fricción y cumple la especificación completa?

Entregar:

- matriz AC-01…AC-33 con estado y evidencia;
- cuatro sesiones humanas descritas en aceptación;
- documentación de uso, backup y contenido;
- listado de deuda real, sin convertirla en V1.1 automática;
- build reproducible.

Evidencia:

- todos los `P0` pasan;
- comandos de validación pasan desde checkout limpio después de instalar dependencias;
- la sesión de 2 minutos tiene ≤30 s de overhead y la de 10 ≤90 s;
- ningún hallazgo requiere backend, IA o ejecución para considerarse cerrado.

## 4. Estrategia de pruebas

### Dominio — Vitest

Pruebas exhaustivas de:

- normalización conservadora;
- evaluadores exactos y comando;
- máquina de estados;
- cálculo de observaciones mecánicas;
- muestras mínimas;
- orden de recomendación/desempate;
- presupuesto de sesión;
- validación/importación/conflictos.

Preferir tablas de casos legibles provenientes del corpus. No probar funciones privadas; probar contratos.

### UI — React Testing Library

- consultar por roles y labels;
- escribir mediante `user-event`;
- verificar foco, pistas, feedback y pending review;
- no usar snapshots grandes como prueba principal.

### Persistencia — `fake-indexeddb`

- transacciones, round trip, migración y rollback;
- además, un recorrido real en navegador porque el fake no demuestra comportamiento de storage del browser.

### Navegador — Playwright

Mantener pocos recorridos de alto valor:

1. sesión por teclado;
2. typo/corrección en typing;
3. respuesta abierta que no bloquea;
4. reanudar guided;
5. export/import;
6. carga y uso offline.

## 5. Riesgos y controles

| Riesgo | Control de implementación |
|---|---|
| Evaluador de Bash se vuelve parser general | limitar a alternativas y checks curados; desconocido=`needs_review` |
| Eventos de teclado inconsistentes | separar `keydown` de `beforeinput/input`, probar en navegador y marcar captura incompleta |
| React rerenderiza por cada evento y pierde fluidez | buffer de captura local; persistir/agregar al enviar |
| Service worker sirve versiones mezcladas | precache versionado y actualización fuera de sesión activa |
| Schema demasiado genérico | congelar después del walking skeleton de cuatro modos, no antes ni después de 40 items |
| Corpus consume más que la aplicación | 40 registros cerrados; no crear catálogo adicional |
| Recomendación parece arbitraria | prioridad ordenada, fixture por regla y razón visible |
| IndexedDB se pierde/evicta | exportación visible y recordatorio local de backup; no prometer durabilidad absoluta |
| Open answers acumulan pendientes | no repetirlas por defecto; filtro de pendientes y export para evaluación externa |

## 6. Decisiones de alcance para el agente

El agente puede decidir nombres internos, composición de componentes y detalles visuales accesibles. Debe pedir decisión antes de:

- sustituir una tecnología de la stack;
- añadir dependencia runtime significativa;
- cambiar el schema público;
- reducir un criterio `P0`;
- introducir ejecución, red, backend, IA o contenido nuevo;
- mezclar modos;
- cambiar las 40 unidades previstas.

Errores o contradicciones técnicas pueden resolverse con el cambio mínimo y una entrada en un registro de decisiones. Una idea atractiva sin evidencia va a backlog, no a V1.

## 7. Comandos finales esperados

La implementación debe exponer y documentar:

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

`test:e2e` puede requerir la instalación inicial de los navegadores de Playwright, documentada por separado. Ningún comando de validación debe requerir Internet después de instalar dependencias y navegadores.

## 8. Informe de cada hito

Al cerrar un hito, informar:

- resultado observable;
- archivos creados/modificados;
- criterios de aceptación cubiertos;
- comandos ejecutados y resultado;
- supuestos o desviaciones;
- riesgos pendientes;
- próxima decisión habilitada.

No describir como “terminado” un flujo que sólo tiene UI sin persistencia/evidencia.
