# TypeOps V1

Micropráctica adaptativa local-first para sesiones de 2 a 10 minutos. Complementa la preparación para competencias Attack-Defense CTF. Sin cuenta, sin red, sin formularios.

## Requisitos

- **Node.js**: ≥ 20.19.0 o ≥ 22.12.0 (recomendado: 22 LTS o 24.x)
- **npm**: ≥ 10.0.0

```bash
node --version  # verificar
npm --version   # verificar
```

## Instalación

```bash
npm ci
```

Este comando instala exactamente las versiones del `package-lock.json`. No requiere Internet después de la primera instalación si se conserva el `node_modules/`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR en `http://localhost:5173` |
| `npm run build` | Typecheck + build de producción en `dist/` |
| `npm run preview` | Preview de producción en `http://localhost:4173` |
| `npm run typecheck` | TypeScript sin emitir, incluye archivos de config |
| `npm run lint` | ESLint con máximo 0 warnings |
| `npm run test` | Vitest en modo watch |
| `npm run test -- --run` | Vitest en modo one-shot (CI) |
| `npm run test:content` | Tests del corpus de contenido en `src/content/` |
| `npm run test:e2e` | Tests de Playwright (ver requisito abajo) |

## Tests unitarios y de componentes

```bash
# Ejecutar todos (CI)
npm run test -- --run

# Watch (desarrollo)
npm run test
```

Stack: Vitest + React Testing Library + `@testing-library/user-event` + `fake-indexeddb`.

## Tests de navegador (Playwright)

Los tests e2e requieren instalar Chromium **una vez**:

```bash
npx playwright install chromium
```

Después, `test:e2e` funciona offline:

```bash
npm run test:e2e
```

El comando levanta automáticamente `npm run preview` y ejecuta los tests en Chromium.

## Build de producción

```bash
npm run build
```

Genera `dist/` con:
- SPA estática servible desde cualquier servidor de archivos.
- Service worker para uso offline (precache del shell y assets).
- Manifest PWA.

Para verificar el build localmente:

```bash
npm run build && npm run preview
# Abrir http://localhost:4173
```

## Validación completa (desde checkout limpio)

```bash
npm ci
npm run typecheck
npm run lint
npm run test -- --run
npm run test:content
npm run build

# Requiere Playwright instalado (ver arriba):
npm run test:e2e
```

Ningún comando de validación requiere Internet después de `npm ci` y `npx playwright install chromium`.

## Uso offline

Después de una primera carga, TypeOps funciona sin red:

1. Ejecutar `npm run dev` o servir `dist/` con cualquier servidor.
2. Visitar la URL una vez con red disponible (para cachear el service worker).
3. A partir de ahí, funciona offline.

El corpus de contenido, sesiones e intentos se guardan localmente en IndexedDB del navegador.

## Backup y exportación

> **Importante:** IndexedDB puede ser eliminado por el navegador si el dispositivo queda sin espacio. Exportar el progreso regularmente.

```
(Disponible en Hito 7 — importación/exportación UI)
```

## Arquitectura

```
src/
├─ app/           # Shell, composición de sesión
├─ features/      # Lógica de UI por modo
│  ├─ typing/
│  ├─ command/
│  ├─ review/
│  ├─ guided/
│  ├─ session/
│  └─ import-export/
├─ domain/        # TypeScript puro, sin React ni Dexie
│  ├─ content/    # Tipos y validación
│  ├─ evaluation/ # Evaluadores deterministas
│  ├─ learning/   # Estados y evidencia
│  ├─ mechanical/ # Captura y agregación
│  ├─ recommendation/ # Reglas y motivos
│  └─ session/    # Presupuesto y selección
├─ data/          # Persistencia
│  ├─ db/         # Dexie, migraciones
│  ├─ repositories/
│  └─ transfer/   # Import/export atómico
├─ content/       # Corpus JSON validado con Zod
│  └─ typeops-foundations-es-ar/
├─ ui/            # Componentes accesibles compartidos
└─ test/          # Fixtures y setup
```

**Fronteras obligatorias:**
- React no contiene lógica de scoring ni recomendación.
- El dominio no importa React ni Dexie.
- Los evaluadores no ejecutan comandos ni hacen requests.
- El corpus JSON no contiene lógica ejecutable.

## Hitos

| Hito | Estado | Descripción |
|---|---|---|
| 0 — Base reproducible | ✅ Completo | Scaffold, checks, shell, PWA mínima |
| 1 — Contrato de contenido | ⏳ Pendiente | Schemas Zod, walking skeleton 4 modos |
| 2 — Persistencia | ⏳ Pendiente | Dexie, migraciones, round trip |
| 3 — Dominio | ⏳ Pendiente | Evaluadores, estados, recomendador |
| 4 — Recorrido vertical | ⏳ Pendiente | Flujo completo por teclado |
| 5 — Modos completos | ⏳ Pendiente | Typing, comando, repaso, guiada |
| 6 — Corpus inicial 40 | ⏳ Pendiente | Pack validado y revisado |
| 7 — Offline/resiliencia | ⏳ Pendiente | Precache, import/export UI |
| 8 — Aceptación | ⏳ Pendiente | Matriz AC-01..AC-33, sesiones humanas |

## Límites de V1

No implementado (por diseño):
- Terminal o ejecución de shell
- Requests a objetivos reales
- Backend, cuentas o sincronización
- Evaluación por IA
- Gamificación compleja

Ver `docs/TYPEOPS_V1_PRODUCT_SPEC.md` para la especificación completa.

## Documentos de diseño

- `docs/TYPEOPS_V1_PRODUCT_SPEC.md` — Producto y alcance
- `docs/TYPEOPS_V1_IMPLEMENTATION_PLAN.md` — Orden e hitos
- `docs/TYPEOPS_V1_CONTENT_SCHEMA.md` — Contrato de datos
- `docs/TYPEOPS_V1_ADAPTATION_RULES.md` — Reglas de recomendación
- `docs/TYPEOPS_V1_INITIAL_CORPUS.md` — Pack inicial de 40 registros
- `docs/TYPEOPS_V1_ACCEPTANCE_CRITERIA.md` — Criterios de aceptación
- `docs/ANTIGRAVITY_HANDOFF.md` — Handoff de implementación
