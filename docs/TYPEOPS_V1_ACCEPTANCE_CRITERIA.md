# TypeOps V1 — Criterios de aceptación

## 1. Definición de terminado

V1 está terminada cuando todos los criterios `P0` pasan, el corpus inicial de 40 registros se carga sin errores y una persona puede completar cada modo sin red ni mouse. Un criterio no se considera cumplido por existir una pantalla: debe conservar datos correctos y tener la prueba indicada.

Los criterios `P1` pueden diferirse sólo si se documenta la razón y no degradan sesiones de 2–10 minutos. No se aceptan ampliaciones de alcance como sustituto de un `P0` incompleto.

## 2. Inicio y sesiones

### AC-01 — Entrada rápida (`P0`)

- Con datos ya inicializados, abrir la aplicación permite iniciar una sesión recomendada en tres acciones de teclado o menos.
- El tiempo medido desde shell visible hasta primer estímulo es menor a 20 segundos en un equipo de desarrollo normal, excluyendo instalación/build.
- No hay login, onboarding obligatorio extenso ni formulario previo.

Prueba: recorrido de navegador y verificación manual.

### AC-02 — Configuración (`P0`)

- Se puede elegir exactamente un modo.
- Se puede elegir 2, 5 o 10 minutos, o una cantidad entre 1 y 10 ejercicios.
- Se puede usar foco recomendado o elegir una categoría disponible.
- La sesión no cambia de modo automáticamente.

Prueba: componente + navegador.

### AC-03 — Cierre (`P0`)

- La actividad actual puede terminar cuando vence el tiempo.
- El cierre muestra intentos, pistas, evidencia evaluada, pendientes y una recomendación explicada.
- No pide autoevaluar cada respuesta ni cargar tiempos manuales.
- Salir temprano conserva los intentos enviados y registra `completionReason`.

Prueba: integración de sesión/persistencia.

## 3. Modo typing técnico

### AC-04 — Captura correcta (`P0`)

Para un fragmento conocido, el sistema registra:

- texto final;
- duración;
- error inicial por posición;
- errores corregidos y no corregidos;
- cantidad de correcciones;
- latencias con reloj monotónico;
- observaciones de caracteres y secuencias.

Un typo corregido deja precisión final correcta y error inicial registrado. Pegar invalida sólo la captura mecánica y muestra la limitación.

Prueba: dominio unitario con secuencias de eventos + navegador real.

### AC-05 — Métricas prudentes (`P0`)

- No etiqueta una secuencia débil antes de la muestra mínima.
- No infiere dedo físico.
- WPM, si se muestra, se etiqueta secundaria y no modifica conocimiento/competencia.
- Las métricas no se calculan desde respuestas conceptuales cuando `captureMechanical=false`.

Prueba: reglas unitarias.

### AC-06 — Selección coherente (`P0`)

- Una debilidad mecánica sólo prioriza un fragmento existente que contenga la secuencia.
- El target cargado coincide exactamente con el corpus; no se genera ni muta un comando.
- Si no hay target, la aplicación informa corpus insuficiente.

Prueba: selector unitario con catálogo controlado.

### AC-07 — Guía US ANSI (`P1`)

- Puede activarse/desactivarse.
- Muestra tecla y dedo recomendado según mapa US ANSI versionado.
- Incluye texto que aclara que no detecta el dedo usado.

Prueba: tabla de mapeo + UI.

## 4. Modo comando desde intención

### AC-08 — Dimensiones separadas (`P0`)

Para los casos de prueba de cada item, devuelve por separado herramienta, estructura y sintaxis. La captura mecánica no altera esos resultados.

Prueba: tabla de casos del corpus ejecutada como tests parametrizados.

### AC-09 — Alternativas (`P0`)

- Todas las alternativas declaradas son aceptadas.
- Espacios exteriores y saltos se normalizan; no se destruyen comillas ni contenido interno.
- Una respuesta plausible no reconocida queda `needs_review` y no reduce dominio.
- Ningún comando se ejecuta ni se envía a un shell.

Prueba: dominio unitario + búsqueda estática de integraciones de ejecución prohibidas.

### AC-10 — Feedback diagnóstico (`P0`)

- Herramienta correcta con opción faltante no se informa como desconocimiento total.
- Herramienta incorrecta no se reduce a “error de sintaxis”.
- Un typo corregido puede coexistir con sintaxis final correcta.
- El feedback no exige coincidencia textual si una alternativa válida fue declarada.

Prueba: casos positivos/negativos por item.

## 5. Modo repaso y decisiones

### AC-11 — Evaluación local limitada (`P0`)

- Exactas, choices y pasos ordenados se evalúan determinísticamente.
- En decisiones mixtas, la elección se evalúa y la justificación abierta puede quedar pendiente.
- La aplicación nunca presenta una evaluación semántica general como local.

Prueba: evaluadores unitarios y UI.

### AC-12 — Respuestas abiertas (`P0`)

- Se guardan completas con rúbrica, confianza, pistas y versión de contenido.
- Quedan `pending_review` o permiten autoevaluación voluntaria.
- La sesión continúa sin revisión.
- Hasta importar una revisión válida, no modifican dominio.

Prueba: integración de persistencia.

### AC-13 — Evidencia y contexto (`P0`)

- `REV-02`, `REV-03`, `REV-07`, `REV-08`, `REV-09` y `REV-11` distinguen qué prueba y qué no prueba la evidencia.
- Un detalle no confirmado de Cyber War nunca aparece como regla oficial.
- La identificación de BAC/IDOR es introductoria y usa política/identidad/objeto/resultado, no sólo status 200.

Prueba: revisión editorial con checklist.

## 6. Modo práctica guiada

### AC-14 — Seis etapas (`P0`)

Cada `guided_practice` carga exactamente:

1. modelo mínimo;
2. sintaxis descompuesta;
3. ejemplo contextual;
4. ejercicio guiado;
5. ejercicio sin ayuda;
6. variante posterior.

La solución del ejercicio sin ayuda no es visible antes de enviar.

Prueba: validación de schema + componentes.

### AC-15 — Progresión (`P0`)

- Abrir una explicación cambia `new` a `learning`, nunca directamente a ready.
- Completar lo guiado permite `practicing`.
- Se requieren dos éxitos independientes en items distintos, incluido uno variante, para `ready_for_assessment`.
- La variante posterior no se inserta inmediatamente como copia del ejercicio.
- El progreso se reanuda en la siguiente etapa incompleta.

Prueba: máquina de estados unitaria + persistencia.

### AC-16 — Prerrequisitos (`P0`)

- Un comando nuevo no aparece en evaluación sin haber completado su introducción guiada o sin una marca explícita de conocimiento previo importado/configurado.
- Si falta un prerrequisito, la UI explica cuál y ofrece guided; no marca error.

Prueba: selector y recorrido de navegador.

## 7. Adaptación

### AC-17 — Modelos separados (`P0`)

- Una mejora mecánica no sube dominio conceptual.
- Una respuesta conceptual correcta sin captura no altera perfil mecánico.
- Competencia conserva dimensiones de selección, siguiente acción, interpretación y verificación.
- No existe puntaje total combinado en datos ni UI.

Prueba: dominio unitario + inspección de UI.

### AC-18 — Regla y razón (`P0`)

- Para los fixtures de `TYPEOPS_V1_ADAPTATION_RULES.md`, el selector aplica el orden documentado.
- Toda recomendación tiene `reasonCode` y frase concreta.
- El usuario puede rechazarla y elegir foco sin penalización.
- No repite el mismo item en los siguientes tres intentos salvo excepciones documentadas.

Prueba: tests parametrizados.

### AC-19 — Repaso mínimo (`P0`)

- Estados y fechas siguen intervalos 1/3/7/14 días.
- Pista y alta confianza incorrecta producen las acciones indicadas.
- Cambiar la hora del dispositivo no corrompe intentos ya guardados; se usan fechas absolutas y validación razonable.

Prueba: reloj simulado.

## 8. Datos, importación y offline

### AC-20 — Persistencia (`P0`)

- Recargar conserva packs, sesiones, intentos, progreso, mecánica y settings.
- Una migración de base tiene prueba desde la versión anterior.
- Los intentos conservan versión del item.

Prueba: `fake-indexeddb` + navegador.

### AC-21 — Exportación (`P0`)

- El usuario puede exportar progreso y/o contenido a JSON versionado.
- El archivo vuelve a validar con el mismo schema.
- Incluye cantidades/checksums y no incluye secretos del navegador.

Prueba: round trip y snapshot de campos permitidos.

### AC-22 — Importación atómica (`P0`)

- JSON inválido, referencias rotas, major desconocida o conflicto de checksum se rechazan con mensaje accionable.
- La vista previa enumera altas, actualizaciones, duplicados y conflictos.
- Cancelar o fallar no escribe cambios parciales.
- Un export válido restaura un perfil vacío con resultados equivalentes.

Prueba: repositorio transaccional + navegador.

### AC-23 — Offline real (`P0`)

Después de una primera carga/instalación en `localhost`:

- con red deshabilitada se abre el shell;
- el corpus inicial carga;
- los cuatro modos completan al menos un item;
- los intentos se guardan;
- exportar funciona;
- no hay requests fallidas a fonts, analytics, IA o APIs externas.

Prueba: navegador con contexto offline y auditoría de red.

### AC-24 — Actualización segura (`P1`)

Una nueva versión del service worker no recarga mientras hay una respuesta sin enviar; ofrece actualizar al terminar la sesión.

Prueba: simulación de update.

## 9. Teclado, accesibilidad y usabilidad

### AC-25 — Teclado primero (`P0`)

- Todo flujo principal funciona con Tab, Shift+Tab, Enter, Escape y shortcuts documentados.
- El foco es visible, no queda atrapado y vuelve a un lugar lógico al cerrar overlays.
- Pedir pista, enviar, omitir y finalizar tienen teclas accesibles y botones reales.
- Los shortcuts no interceptan escritura dentro de inputs salvo combinación explícita.

Prueba: recorrido de navegador sin mouse.

### AC-26 — Semántica (`P0`)

- Inputs poseen labels; feedback y errores importantes se anuncian sin robar foco.
- Color no es el único indicador.
- El texto objetivo y la respuesta son legibles con zoom 200% en viewport de escritorio.
- No hay animaciones obligatorias que dificulten escribir.

Prueba: Testing Library por roles + revisión manual.

### AC-27 — Fricción (`P0`)

En una prueba manual de cada preset:

- no hay registro manual por actividad;
- confianza opcional requiere una sola acción;
- el cierre ocupa una pantalla;
- una sesión de 2 minutos no dedica más de 30 segundos a navegación/registro;
- una sesión de 10 minutos no dedica más de 90 segundos a navegación/registro.

Prueba: observación manual con cronómetro de sesión total, no tiempos estimados por ejercicio.

## 10. Corpus y seguridad

### AC-28 — Corpus inicial (`P0`)

- Hay exactamente 40 registros: 10 typing, 10 command, 12 review y 8 guided.
- Todos validan contra schema `1.0.0`.
- Todos los prerrequisitos y variantes existen.
- Los 10 comandos tienen casos positivos, negativos y diagnóstico dimensional.
- Los 8 guided cumplen seis etapas.

Prueba: validador de contenido.

### AC-29 — Corrección técnica (`P0`)

- Comandos y fragmentos pasan revisión humana y pruebas editoriales.
- Targets sólo usan allowlist.
- No hay credenciales, IPs externas, acciones destructivas o ejecución.
- Alternativas válidas no exigen coincidencia literal injustificada.

Prueba: checklist + búsquedas de patrones prohibidos.

### AC-30 — Alcance competitivo (`P0`)

- Las afirmaciones sobre Cyber War llevan clasificación.
- No existen checkers, ticks, SLA o scoring funcionales en V1.
- El modelo estándar de flags/servicios se presenta como tal.

Prueba: schema + revisión editorial.

## 11. Calidad técnica

### AC-31 — Validación de proyecto (`P0`)

Los comandos definidos en `package.json` deben pasar:

```text
npm run typecheck
npm run lint
npm run test -- --run
npm run test:content
npm run build
npm run test:e2e
```

No se exige cobertura porcentual global. Sí se exige cubrir todas las ramas de evaluadores, transiciones, recomendación e importación que aparecen en estos criterios.

### AC-32 — Sin dependencias externas en runtime (`P0`)

- No hay backend, autenticación, analytics, llamadas a IA ni sincronización.
- No se cargan recursos desde CDN.
- Dexie usado es sólo local; Dexie Cloud no está instalado/configurado.

Prueba: auditoría de dependencias, build y tráfico de red.

### AC-33 — Rendimiento suficiente (`P1`)

Con el corpus inicial y 5.000 intentos sintéticos:

- abrir selector y obtener recomendación no produce bloqueo perceptible mayor a 200 ms en el equipo de prueba;
- escribir no pierde eventos por trabajo síncrono de métricas;
- los cálculos agregados pueden diferirse hasta después de enviar.

Prueba: fixture local y perfil manual. No es benchmark competitivo entre equipos.

## 12. Prueba de aceptación humana

Antes de declarar V1 usable, ejecutar cuatro sesiones, una por modo:

- 2 minutos de typing;
- 5 ejercicios de comando;
- 5 minutos de repaso;
- reanudar una práctica guiada en dos sesiones separadas.

Registrar sólo:

- si empezó sin ayuda;
- si entendió tarea y feedback;
- si pudo usar teclado;
- si el cierre fue útil;
- si la recomendación tuvo una razón comprensible;
- fricción excepcional.

Continuar si las cuatro sesiones completan los objetivos sin bloqueo y sin trabajo administrativo. Corregir antes de ampliar corpus si una actividad confunde selección de herramienta, sintaxis o mecánica. No agregar V1.1 para compensar problemas del núcleo.
