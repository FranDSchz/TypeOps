# Alternativas de producto

## 1. Criterios de comparación

Escala cualitativa:

- valor: contribución probable a preparación real;
- complejidad: construcción, evaluación y mantenimiento;
- utilidad temprana: cuánto tarda en aportar;
- contenido: carga de crear y versionar;
- validación: facilidad para saber si funciona;
- abandono: riesgo de dejar de usarlo;
- evolución: capacidad de crecer sin reescritura conceptual.

## 2. Alternativa A — Entrenador de mecanografía contextual

### Descripción

Textos y secuencias de Linux, Python, HTTP y web; adapta teclas, símbolos y bigramas débiles.

### Fortalezas

- alcance claro;
- feedback automático;
- rápido de construir;
- uso breve y repetible;
- datos mecánicos precisos;
- puede reutilizar contenido técnico real.

### Debilidades

- copiar no entrena decidir;
- alto riesgo de familiaridad ilusoria;
- WPM puede secuestrar el producto;
- cobertura técnica puede ser superficial;
- [typing.io](https://typing.io/), [Keybr](https://www.keybr.com/) y [Monkeytype](https://github.com/monkeytypegame/monkeytype) ya cubren buena parte.

| Criterio | Evaluación |
|---|---|
| Valor competitivo | Bajo–medio |
| Complejidad | Baja |
| Utilidad temprana | Alta |
| Necesidad de contenido | Media |
| Validación | Fácil para mecánica, difícil para CTF |
| Riesgo de abandono | Medio |
| Evolución | Puede convertirse en capa, no en núcleo |

### Veredicto

No recomendar como producto principal. Sí como módulo experimental de 2–4 minutos.

## 3. Alternativa B — Sistema adaptativo de preparación CTF

### Descripción

Mapa de habilidades, recuperación espaciada, microdecisiones, pequeñas producciones y evaluaciones acumulativas; recomienda la siguiente práctica.

### Fortalezas

- alinea memoria, decisión y ejecución;
- permite personalización explícita;
- puede incorporar mecanografía sin dominar;
- mide olvidos y transferencia;
- funciona como sistema personal.

### Debilidades

- contenido y rúbricas son costosos;
- “adaptativo” puede volverse una excusa para sobreingeniería;
- corre riesgo de ser un LMS enorme;
- no reemplaza laboratorios.

| Criterio | Evaluación |
|---|---|
| Valor competitivo | Alto si transfiere |
| Complejidad | Media |
| Utilidad temprana | Media–alta con contenido pequeño |
| Necesidad de contenido | Alta |
| Validación | Media |
| Riesgo de abandono | Medio |
| Evolución | Alta |

### Veredicto

Es la mejor visión, pero debe empezar como una cola pequeña de actividades y evidencia, no como plataforma.

## 4. Alternativa C — Entorno propio de microescenarios

### Descripción

Terminal, servicios o aplicaciones vulnerables efímeras con tareas ofensivas y defensivas.

### Fortalezas

- mayor fidelidad;
- evaluación por resultado;
- integra ataque, parcheo y verificación;
- permite presión y estados.

### Debilidades

- aislamiento, seguridad, authoring y mantenimiento muy costosos;
- amplio espacio técnico;
- recrea parte de PortSwigger, HTB, TryHackMe, Killercoda o picoGym;
- tarda mucho en validar la hipótesis central;
- un simulador pobre puede enseñar conductas falsas.

| Criterio | Evaluación |
|---|---|
| Valor competitivo | Alto potencial |
| Complejidad | Muy alta |
| Utilidad temprana | Baja |
| Necesidad de contenido | Muy alta |
| Validación | Clara por tarea, difícil para producto |
| Riesgo de abandono | Alto por coste |
| Evolución | Potente pero pesada |

### Veredicto

No construir inicialmente. Usar laboratorios externos. Revisar solo si aparece un escenario Attack-Defense crítico no cubierto.

## 5. Alternativa D — Aplicación de repaso/recuperación activa

### Descripción

Tarjetas y preguntas CTF con repetición espaciada, explicaciones y estadísticas.

### Fortalezas

- valor probado para memoria;
- simple;
- offline;
- rápida de alimentar;
- utilidad temprana.

### Debilidades

- Anki ya resuelve el núcleo;
- memoria declarativa puede desplazar ejecución;
- respuestas autoevaluadas;
- transferencia limitada si no hay variantes.

| Criterio | Evaluación |
|---|---|
| Valor competitivo | Medio |
| Complejidad | Baja |
| Utilidad temprana | Alta |
| Necesidad de contenido | Media |
| Validación | Alta para retención |
| Riesgo de abandono | Bajo–medio |
| Evolución | Limitada |

### Veredicto

Usar Anki o un planificador muy pequeño. No construir un clon completo.

## 6. Alternativa E — Panel coordinador de herramientas externas

### Descripción

Plan diario, enlaces a labs, importación/registro de resultados, debilidades, runbooks y próxima acción. Puede usar Anki, PortSwigger, OverTheWire y repositorio existente.

### Fortalezas

- evita reconstruir herramientas;
- tiempo a utilidad muy corto;
- fuerza evidencia externa;
- puede ser manual al inicio;
- ayuda a combatir dispersión.

### Debilidades

- poca interacción propia;
- integraciones frágiles o manuales;
- calidad de datos heterogénea;
- puede convertirse en un tracker burocrático;
- no entrena por sí mismo.

| Criterio | Evaluación |
|---|---|
| Valor competitivo | Medio–alto |
| Complejidad | Baja–media |
| Utilidad temprana | Muy alta |
| Necesidad de contenido | Baja |
| Validación | Alta |
| Riesgo de abandono | Bajo si es ligero |
| Evolución | Alta como infraestructura |

### Veredicto

Excelente punto de partida y control. Debe combinarse con pocas actividades TypeOps distintivas.

## 7. Alternativa F — Coach de IA para CTF

### Descripción

Entrena prompts, revisa respuestas y posiblemente integra un modelo para tutoría.

### Fortalezas

- IA estará permitida;
- habilidad de alto apalancamiento;
- casos ofensivos y defensivos;
- contenido puede usar respuestas guardadas.

### Debilidades

- capacidades cambian;
- riesgo de dependencia;
- evaluación generativa inconsistente;
- API, coste, privacidad y disponibilidad;
- puede reducir práctica independiente.

| Criterio | Evaluación |
|---|---|
| Valor competitivo | Medio–alto |
| Complejidad | Baja sin API / alta integrada |
| Utilidad temprana | Alta con casos guardados |
| Necesidad de contenido | Media |
| Validación | Media–alta con tareas comparables |
| Riesgo de abandono | Medio |
| Evolución | Alta, pero volátil |

### Veredicto

Incluir como familia de habilidad sin integrar obligatoriamente una IA.

## 8. Comparación resumida

| Alternativa | Valor | Complejidad | Utilidad temprana | Contenido | Validación | Abandono |
|---|---:|---:|---:|---:|---:|---:|
| A. Mecanografía contextual | 2/5 | 2/5 | 5/5 | 3/5 | 2/5 para CTF | 3/5 |
| B. Preparación adaptativa | 5/5 | 3/5 | 3/5 | 4/5 | 3/5 | 3/5 |
| C. Microescenarios propios | 5/5 potencial | 5/5 | 1/5 | 5/5 | 3/5 | 5/5 |
| D. Repaso | 3/5 | 1/5 | 5/5 | 3/5 | 4/5 | 2/5 |
| E. Coordinador externo | 4/5 | 2/5 | 5/5 | 2/5 | 4/5 | 2/5 |
| F. Coach de IA | 4/5 | 2–4/5 | 4/5 | 3/5 | 3/5 | 3/5 |

Los números son juicio de diseño, no datos empíricos.

## 9. Recomendación combinada

Combinar:

- **E como esqueleto:** plan, evidencia y enlaces externos;
- **B como diferenciador:** recuperación, decisiones, adaptación y evaluación;
- **A como capa pequeña:** fluidez técnica;
- **F como habilidad:** casos de IA sin dependencia de API;
- **D mediante reutilización:** Anki o lógica mínima;
- **C solo mediante plataformas externas.**

Nombre funcional:

> TypeOps es un **orquestador adaptativo de práctica CTF** con microactividades de decisión y ejecución, conectado a laboratorios reales.

## 10. Investigación de soluciones existentes

### Mecanografía adaptativa y de código

- [Keybr](https://www.keybr.com/) introduce letras y favorece las más lentas; inspiración: adaptación mecánica local.
- [typing.io](https://typing.io/) usa código de proyectos abiertos; inspiración: secuencias auténticas, no pseudopalabras.
- [Monkeytype](https://github.com/monkeytypegame/monkeytype) ofrece modos configurables, precisión y feedback inmediato; no hace falta recrear su amplitud.
- [GNU Typist](https://www.gnu.org/software/gtypist/) muestra que un formato simple de lecciones puede bastar.

### Linux y terminal

- [OverTheWire Bandit](https://overthewire.org/wargames/bandit/) combina niveles, shell real y necesidad de consultar manuales.
- [Killercoda](https://killercoda.com/about) proporciona entornos Linux/Kubernetes en navegador y escenarios publicables.

Inspiración: objetivos concretos, entorno real y feedback por resultado. No reconstruir una terminal remota.

### Ciberseguridad, CTF y escenarios

- [PortSwigger Web Security Academy](https://portswigger.net/web-security) cubre teoría y laboratorios de SQLi, XSS, CSRF, SSRF, SSTI, acceso, OAuth, JWT, race conditions, NoSQL y más. Sus [mystery labs](https://portswigger.net/web-security/all-labs) ocultan la categoría y entrenan diagnóstico.
- [picoGym](https://picoctf.org/get_started.html) ofrece práctica no competitiva con desafíos previos.
- [HTB Academy](https://help.hackthebox.com/en/articles/12741910-academy-modules-paths) separa teoría y sandboxes interactivos.
- [TryHackMe](https://tryhackme.com/en-gb) combina caminos, lecciones y labs ofensivos/defensivos.
- [Ataka](https://github.com/OpenAttackDefenseTools/ataka) muestra necesidades operativas Attack-Defense: targets, ejecución central, logs y submission.

Problema bien resuelto: enseñar y practicar categorías en laboratorios. Vacío: decisión/retención/adaptación personal entre sesiones y dinámica Attack-Defense.

### Repetición espaciada y tutores adaptativos

- [Anki](https://docs.ankiweb.net/background.html) ofrece active recall y spaced repetition; su manual también advierte la carga que genera introducir demasiadas tarjetas.
- [Khan Academy Mastery Challenges](https://support.khanacademy.org/hc/en-us/articles/360037127892) mezcla habilidades y adapta según tiempo y nivel de dominio.
- Investigación de Duolingo propuso un [modelo entrenable de repetición espaciada](https://research.duolingo.com/papers/settles.acl16.pdf).

Inspiración: reaparecer, mezclar y conservar evidencia de dominio. No implementar un scheduler sofisticado antes de necesitarlo.

### Entrenamiento de IA

No se encontró una plataforma consolidada orientada específicamente a entrenar uso competitivo de IA en Attack-Defense. La evidencia de proveedores muestra capacidad creciente y fallos persistentes en horizonte largo ([Anthropic](https://www.anthropic.com/research/cyber-competitions)); [NIST](https://airc.nist.gov/) enfatiza evaluación, verificación y validación.

Vacío plausible: práctica de contexto, revisión y decisión de consulta con evidencia. Debe validarse con comparaciones con/sin IA.

## 11. Qué no reconstruir

- catálogo y labs web de PortSwigger;
- terminal educativa de OverTheWire/Killercoda;
- scheduler completo y ecosistema de Anki;
- plataforma CTF/scoreboard;
- IDE o juez de Python;
- infraestructura de exploits;
- tutor generativo general;
- analytics de mecanografía tan amplios como herramientas dedicadas.

TypeOps gana si conecta estas piezas alrededor de decisiones y evidencia; pierde si compite con todas.

