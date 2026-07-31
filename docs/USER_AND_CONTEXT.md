# Usuario y contexto competitivo

## 1. Modelo del usuario

### Hechos declarados

- Es una aplicación inicialmente personal.
- El usuario parte de un nivel **principiante absoluto**.
- El objetivo es preparar una competencia Attack-Defense CTF.
- Cyber War 2026 será el **22 de agosto de 2026**, presencial, Attack/Defense y todos contra todos.
- El equipo tiene **tres integrantes**.
- Internet y la IA estarán permitidos.
- Existe una inclinación probable hacia hacking web y ataque.
- Se necesita competencia suficiente en defensa y en la dinámica general.
- Se priorizan conocimiento, decisión y ejecución correcta sobre velocidad bruta.
- Todo trabajo ofensivo se limita a entornos autorizados.

### Información preliminar

- La duración comunicada es de **90 a 120 minutos**.
- Todavía falta el reglamento detallado.
- Hasta contar con ese reglamento, ticks, checkers, SLA, flags, servicios y scoring son modelos de referencia, no reglas de Cyber War.

### Hipótesis de diseño

- El mayor beneficio antes del evento vendrá de fundamentos operativos, HTTP/web, triage, verificación y coordinación, no de temas avanzados aislados.
- Una competencia tan corta probablemente premie una orientación inicial rápida, roles claros y handoffs breves; esto debe validarse cuando llegue el reglamento.
- El usuario necesita ejemplos resueltos y ayuda decreciente antes de evaluaciones sin guía.
- Una herramienta personal puede aceptar curación y evaluación manuales que no escalarían a un producto comercial.
- El uso diario será breve y complementará sesiones de laboratorio más largas.

### Inferencias, no hechos

- Con 22 días entre el 31 de julio y el evento, construir TypeOps solo se justifica si reduce inmediatamente la fricción de practicar; el producto no debe competir con el estudio.
- La inclinación hacia web/ataque no basta para fijar el rol: primero se necesita un piso compartido y una prueba práctica de los tres integrantes.
- La presión probablemente hará costosa la búsqueda desordenada y la ejecución no verificada.
- La IA puede aumentar la velocidad de producción más que la calidad de la decisión; por eso la verificación será una habilidad separada.

### Desconocidos críticos

No se conocen todavía, y TypeOps no debe inventarlos:

- duración definitiva, agenda, rondas o ticks;
- scoring y peso de disponibilidad/ataque/defensa;
- formato y vigencia de flags;
- servicios, lenguajes y sistemas operativos;
- arquitectura de vulnbox;
- experiencia de los otros integrantes y roles finales;
- herramientas, modelos de IA y posibles límites concretos;
- límites de parcheo, reinicio, snapshots y acciones prohibidas;
- mecanismo de envío y automatización;
- tiempo semanal disponible de cada integrante.

## 2. Qué exige razonablemente un Attack-Defense CTF

La descripción de [CTFtime](https://ctftime.org/ctf-wtf) y eventos como [ENOWARS](https://10.enowars.com/) respaldan el modelo general: equipos reciben servicios que deben mantener mientras buscan vulnerabilidades y atacan servicios rivales. Las implementaciones concretas difieren.

### Capacidades operativas probables

1. **Orientación inicial**
   - inventariar procesos, puertos, rutas, configuraciones, código, datos y logs;
   - ejecutar un flujo legítimo y establecer una línea base;
   - identificar superficie expuesta y dependencias.

2. **Análisis ofensivo**
   - comprender protocolos y lógica de servicio;
   - reconocer clases de vulnerabilidad;
   - formular pruebas mínimas;
   - extraer el dato objetivo;
   - estabilizar un exploit y adaptarlo a múltiples targets.

3. **Defensa y disponibilidad**
   - reproducir la causa;
   - aplicar el cambio mínimo;
   - conservar datos y contrato funcional;
   - probar como lo haría el checker;
   - monitorear, detectar regresiones y hacer rollback.

4. **Automatización**
   - convertir pasos manuales en scripts con timeouts, manejo de errores, logs, validación y deduplicación;
   - observar fallos por target o ronda;
   - cambiar rápidamente una automatización sin destruir su trazabilidad.

5. **Operación de equipo**
   - comunicar hipótesis, evidencia y estado;
   - entregar artefactos reproducibles;
   - decidir entre investigar, explotar, parchear, restaurar o pedir ayuda;
   - evitar duplicación y pérdida de contexto.

6. **Gestión temporal**
   - distinguir urgencia de valor;
   - trabajar con información incompleta;
   - abandonar líneas estériles;
   - preservar un estado conocido como bueno.

## 3. Tareas bajo presión

Son ejemplos plausibles, no afirmaciones sobre Cyber War:

- leer un error y decidir si el problema es aplicación, dependencia, datos o red;
- reconstruir una petición legítima antes de mutarla;
- detectar que dos cuentas acceden al mismo objeto por IDOR;
- identificar qué entrada alcanza una consulta, plantilla, shell o ruta;
- comparar respuesta normal y anómala;
- leer código desconocido y ubicar confianza, autorización y serialización;
- producir una prueba de concepto mínima en un laboratorio;
- adaptar un script a nuevos identificadores y resultados parciales;
- revisar un parche y mantener el flujo comprobado por el checker;
- consultar logs sin destruir evidencia ni saturarse de ruido;
- elegir entre restaurar disponibilidad y continuar diagnóstico;
- preparar contexto compacto para un compañero o una IA;
- validar un comando sugerido antes de ejecutarlo;
- registrar qué cambió, cómo probarlo y cómo revertirlo.

El cuello de botella no es siempre técnico. Puede ser identificar el objetivo actual, compartir estado o reconocer que una hipótesis ya fue refutada.

## 4. Cuellos de botella habituales: modelo a validar

| Cuello de botella | Señal observable | Entrenamiento posible |
|---|---|---|
| Modelo mental incompleto | Confunde proceso, puerto y funcionalidad | Explicaciones, clasificación, escenarios |
| Recuperación lenta | Conoce el concepto al verlo, no lo produce | Recuperación espaciada |
| Reconocimiento por etiqueta | Resuelve “lab SQLi” pero no un caso sin nombre | Casos mezclados y mystery tasks |
| Siguiente acción débil | Ejecuta muchos comandos sin ganancia de información | Microescenarios con justificación |
| Interpretación pobre | Copia una salida pero no cambia su hipótesis | Predicción e interpretación de evidencia |
| Automatización frágil | Funciona una vez, falla por timeout o formato | Reparación y pruebas de scripts |
| Parcheo sin verificación | Cierra una vía y rompe el checker | Ataque–parche–prueba–rollback |
| Uso pasivo de IA | Acepta código plausible sin revisar | Crítica y validación explícitas |
| Búsqueda desordenada | Pierde tiempo reconstruyendo contexto | Plantillas, runbooks y “context packs” |
| Fricción mecánica | Errores en símbolos, pipes, quoting o edición | Práctica técnica contextual |
| Mala calibración | Alta confianza en errores / indecisión en aciertos | Confianza + feedback + revisión |
| Presión y cambio de tarea | Calidad cae al intercalar o cronometrar | Simulaciones graduadas |

No deben presentarse como universales. Un diagnóstico inicial y simulaciones externas dirán cuáles dominan en este usuario.

## 5. Qué puede entrenar TypeOps

Con fidelidad razonable:

- recuperación de conceptos, señales y procedimientos;
- reconocimiento y comparación de patrones;
- lectura de fragmentos de código, HTTP y logs;
- selección y justificación de siguientes acciones;
- predicción de resultados;
- construcción y corrección de comandos, peticiones y scripts breves;
- diseño de pruebas funcionales y criterios de éxito;
- revisión de automatizaciones y parches;
- preparación de contexto y evaluación de respuestas de IA;
- secuencias de mecanografía técnica;
- tolerancia gradual a tiempo, mezcla e información incompleta;
- hábitos de registro, verificación y rollback.

Con fidelidad limitada:

- coordinación real de equipo;
- investigación prolongada en una base de código desconocida;
- operación simultánea de varias herramientas;
- debugging de estados emergentes;
- explotación estable contra múltiples targets;
- recuperación de un servicio con datos reales;
- toma de decisiones estratégicas con scoreboard y adversarios activos.

## 6. Qué necesita laboratorios u otras herramientas

- ejecución real de terminal, permisos, procesos y red;
- Burp u otro cliente para manipular tráfico;
- vulnerabilidades con estado, concurrencia, timing y cadenas de explotación;
- SQL/NoSQL/SSTI/SSRF/RCE en entornos aislados;
- análisis de binarios, memoria, APK o aplicaciones de escritorio;
- observabilidad y recuperación de servicios;
- escritura y ejecución de exploits;
- parches con pruebas funcionales;
- simulaciones de rondas y múltiples servicios;
- coordinación con compañeros;
- uso del modelo de IA y herramientas efectivamente disponibles.

[PortSwigger Web Security Academy](https://portswigger.net/web-security) ya ofrece teoría y laboratorios web; [OverTheWire Bandit](https://overthewire.org/wargames/bandit/) cubre fundamentos de shell; [picoGym](https://picoctf.org/get_started.html), [HTB Academy](https://help.hackthebox.com/en/articles/12741910-academy-modules-paths) y [TryHackMe](https://tryhackme.com/en-gb) cubren prácticas más amplias. TypeOps debe coordinar y medir la transferencia hacia ellos, no reconstruirlos.

## 7. Priorización de dominio

Hasta conocer el reglamento, conviene priorizar por retorno transversal:

### Núcleo probable

- Linux, procesos, archivos, permisos, servicios, logs y red básica;
- Bash seguro y composición de comandos;
- HTTP, sesiones, cookies, autenticación, autorización y estados;
- terminal y `curl` desde una intención simple;
- lectura básica de aplicaciones web y Broken Access Control/IDOR como primer caso de seguridad;
- Python básico para requests, parsing sencillo, bucles, errores y evidencia;
- healthchecks, parche mínimo, pruebas, rollback y restauración;
- ciclo Attack-Defense y comunicación de estado;
- uso verificado de IA.

### Expansión condicionada

- inyecciones, path traversal, upload, información y lógica de negocio después de dominar los prerrequisitos;
- OAuth, JWT/tokens, WebSockets, race conditions, SSRF, SSTI y cadenas más complejas solo si hay evidencia o reglamento;
- crypto, pwn, reversing, APK, desktop, WebRTC o WebLLM;
- herramientas especializadas y optimizaciones competitivas.

La lista no implica que los primeros temas sean simples ni que los segundos sean irrelevantes. Indica el orden de validación.

## 8. Ventajas y límites de IA permitida

### Ventajas

- comprimir documentación y código desconocido;
- proponer hipótesis y casos de prueba;
- transformar evidencia en scripts o parches candidatos;
- explicar sintaxis, logs y protocolos;
- generar variantes y checklists;
- ayudar a revisar fallos y producir handoffs.

### Límites

- no observa lo que no se le proporciona;
- puede completar huecos con supuestos;
- produce comandos o parches plausibles que rompen seguridad o funcionalidad;
- puede perseverar con una hipótesis equivocada;
- cuesta tiempo preparar contexto y revisar;
- puede no tener acceso al modelo, Internet o herramientas esperadas;
- una respuesta correcta en abstracto puede ser incorrecta para la versión o entorno;
- información no confiable puede introducir instrucciones maliciosas en flujos agentic.

Las evaluaciones públicas de Anthropic reportan progreso fuerte de modelos en CTF, pero también limitaciones en planes largos y obstáculos inesperados ([evaluación de Claude 4](https://www.anthropic.com/research/claude-4-cyber), [competencias cyber](https://www.anthropic.com/research/cyber-competitions)). Esto justifica practicar IA como amplificador supervisado, no como oráculo.

## 9. Contextos de práctica

TypeOps debería distinguir cuatro niveles:

1. **Aprendizaje asistido:** ejemplos, explicaciones y pistas sin presión.
2. **Práctica focal:** una habilidad, feedback inmediato y variantes cercanas.
3. **Evaluación acumulativa:** habilidades mezcladas, etiquetas ocultas, sin ayuda.
4. **Transferencia/simulación:** entorno externo, estado real, tiempo y evidencia.

Mejorar en un nivel no autoriza automáticamente afirmar dominio en el siguiente.
