# TypeOps V0: plan de contenido

## 1. Objetivo del corpus

El corpus inicial debe permitir seis sesiones útiles sin intentar representar todo el currículo. Se priorizan conceptos y acciones que reaparecen en Linux, web, defensa, IA y coordinación.

Tamaño inicial:

- **24 actividades principales**;
- **8 variantes** de alta prioridad;
- 4 familias;
- 6 sesiones prearmadas de 4–6 actividades;
- duración por actividad: 1–4 minutos;
- ninguna actividad requiere ejecución dentro de TypeOps.

Los laboratorios y comandos reales se realizan en entornos autorizados externos.

## 2. Plantilla de actividad

Cada actividad debe incluir:

```text
ID y versión:
Familia:
Habilidad primaria:
Prerrequisitos:
Objetivo observable:
Estímulo:
Respuesta solicitada:
Rúbrica / respuestas aceptables:
Error beginner frecuente:
Pista 1:
Pista 2:
Feedback breve:
Variante relacionada:
Tiempo esperado:
Seguridad y alcance:
Fuente técnica / fecha de revisión:
```

La respuesta no se evalúa por coincidencia textual cuando hay alternativas válidas.

## 3. Corpus de 24 actividades

### F1 — Modelo mental y reconocimiento

| ID | Actividad | Objetivo |
|---|---|---|
| F1-01 | Ataque, defensa y función | Explicar los tres frentes sin asumir scoring |
| F1-02 | Hecho o hipótesis de Cyber War | Clasificar afirmaciones sobre ticks, flags y checkers |
| F1-03 | Proceso, puerto y servicio | Distinguir estados que no prueban función |
| F1-04 | Cliente, servidor, IP, puerto y protocolo | Reconstruir un flujo simple de red |
| F1-05 | Anatomía de HTTP | Señalar método, ruta, headers, body, status y respuesta |
| F1-06 | Autenticación, sesión, cookie y autorización | Contrastar responsabilidades y acceso por objeto |

### F2 — Siguiente acción segura

| ID | Actividad | Objetivo |
|---|---|---|
| F2-01 | “El servicio está caído” | Elegir primera observación sin asumir causa |
| F2-02 | Proceso vivo, respuesta fallida | Buscar evidencia funcional/dependencia |
| F2-03 | Puerto cerrado | Priorizar proceso, bind, configuración o red con contexto |
| F2-04 | HTTP 500 y log | Elegir evidencia útil antes de cambios prematuros |
| F2-05 | Login, dos usuarios y un objeto | Separar autenticación de autorización y diseñar comparación segura |
| F2-06 | IA, documentación o acción directa | Elegir canal y timebox según coste/verificabilidad |

### F3 — Construir o reparar

| ID | Actividad | Objetivo |
|---|---|---|
| F3-01 | Navegar y listar | Producir comandos básicos desde una intención |
| F3-02 | Leer, buscar y encadenar | Elegir herramienta y explicar un pipe simple |
| F3-03 | Quoting y rutas | Reparar un comando inerte con espacios o caracteres especiales |
| F3-04 | Observar procesos/red | Construir una comprobación de solo lectura con herramientas disponibles |
| F3-05 | `curl` y estado HTTP | Construir request con header/cookie/body y explicar respuesta |
| F3-06 | Python: leer JSON y decidir | Completar/explicar variables, condición, bucle y error simple |

### F4 — Verificar y comunicar

| ID | Actividad | Objetivo |
|---|---|---|
| F4-01 | ¿Qué prueba que funciona? | Diseñar un check funcional, no solo de proceso |
| F4-02 | Caso positivo y negativo | Verificar un control de autorización |
| F4-03 | Antes/después y rollback | Definir evidencia para un cambio defensivo conceptual |
| F4-04 | Respuesta de IA defectuosa | Detectar hecho inventado o acción amplia, reducir alcance y probar |
| F4-05 | Handoff de 60 segundos | Separar estado, hecho, hipótesis, dueño y próxima acción |
| F4-06 | Cierre y evidencia contradictoria | Declarar resultado, limitación y próximo paso |

## 4. Ocho variantes prioritarias

No son cambios cosméticos:

1. **F1-03V:** proceso y puerto correctos, función incorrecta por dependencia.
2. **F1-06V:** cookie presente pero sesión inválida; distinguir estado de autorización.
3. **F2-01V:** servicio responde lento, no caído; elegir medición antes de reiniciar.
4. **F2-05V:** acceso legítimamente público; evitar falso positivo de IDOR.
5. **F3-03V:** variable vacía/argumento con espacios en comando inerte.
6. **F3-05V:** interpretar status y body contradictorios.
7. **F4-02V:** el caso negativo falla, pero el positivo también; no declarar parche correcto.
8. **F4-04V:** respuesta de IA técnicamente plausible pero basada en versión no confirmada.

## 5. Seis sesiones iniciales

| Sesión | Actividades | Propósito |
|---|---|---|
| S1 — Formato y sistema | F1-01, F1-02, F1-03, F2-01, F4-06 | Orientación Attack/Defense |
| S2 — Linux observable | F3-01, F3-02, F3-03, F2-02, F4-01 | Observar antes de cambiar |
| S3 — Red y servicio | F1-04, F2-03, F3-04, F2-04, F4-05 | Relacionar host, red y equipo |
| S4 — HTTP y estado | F1-05, F1-06, F3-05, F2-04 | Flujo web legítimo |
| S5 — Autorización y verificación | F1-06, F2-05, F4-02, F4-02V, F4-06 | Caso positivo/negativo |
| S6 — Python, IA y handoff | F3-06, F2-06, F4-04, F4-05 | Automatización y ayuda supervisada |

Las sesiones no sustituyen el calendario: preparan o repasan el bloque práctico del día.

## 6. Distribución de temas prioritarios

| Tema | Actividades principales |
|---|---|
| Fundamentos Attack/Defense | F1-01, F1-02, F4-01 |
| Linux/shell/terminal | F1-03, F3-01–F3-04 |
| Procesos/servicios/red | F1-03, F1-04, F2-01–F2-03, F3-04 |
| Logs | F2-04, F3-02 |
| HTTP/curl | F1-05, F3-05 |
| Auth/cookies/autorización | F1-06, F2-05, F4-02 |
| Python básico | F3-06 |
| Verificación | F2 completa, F4-01–F4-04, F4-06 |
| IA | F2-06, F4-04 |
| Coordinación | F4-05, F4-06 |

Python tiene poca presencia en el corpus porque su aprendizaje principal debe ocurrir escribiendo y ejecutando código fuera de TypeOps. Si un error concreto se repite, se agrega una actividad focal, no un curso de Python dentro de V0.

## 7. Mecanografía secundaria

Se observa solo en F3:

- errores de comillas;
- `/`, `-`, `|`, `>`, `:`, `{}`, `[]` y secuencias relevantes;
- correcciones y reescrituras;
- exactitud final del comando/request/fragmento.

No se registra WPM. Un error mecánico no degrada conocimiento si la intención y explicación son correctas; genera, como máximo, una variante breve dentro de un artefacto útil.

## 8. Criterios de calidad

Cada actividad debe:

- ser resoluble por un principiante tras el material correspondiente;
- evaluar una habilidad primaria;
- aceptar alternativas válidas;
- pedir evidencia, no autoridad;
- distinguir hecho de hipótesis;
- evitar comandos destructivos y targets reales;
- contener feedback que explique el porqué;
- poder completarse en menos de 4 minutos;
- indicar si requiere práctica externa;
- estar revisada técnicamente antes de usarse.

Retirar o reescribir si:

- solo mide recuerdo literal;
- la respuesta se adivina por la redacción;
- tarda más que la práctica que prepara;
- enseña una regla no confirmada;
- no cambia ninguna decisión de estudio;
- duplica mejor contenido externo.

## 9. Temas excluidos del corpus V0

- payloads de explotación;
- OAuth/OIDC profundo;
- JWT attacks;
- SSTI, SSRF, race conditions, NoSQL injection;
- WebSockets/WebRTC/WebLLM;
- crypto, pwn y reversing;
- malware, persistencia o targeting real;
- concurrencia avanzada;
- envío de flags o automatización específica del evento;
- parcheo ejecutable;
- teoría extensa de mecanografía.

Pueden aparecer después del reglamento o de una necesidad observada, con alcance autorizado.

## 10. Mantenimiento

- Congelar el corpus base después de la revisión técnica inicial.
- Agregar como máximo dos actividades por semana antes del evento.
- Corregir errores de contenido de inmediato; registrar cambio de versión.
- No crear una actividad durante una sesión: anotar la brecha y continuar.
- Tras la competencia, conservar solo actividades que ayudaron a una tarea real o a un error recurrente.
