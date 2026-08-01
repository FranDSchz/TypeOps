# Sesión 2 — Rutas, lectura y evidencia funcional

**Objetivo:** navegar, leer y filtrar sin modificar; no confundir proceso iniciado con función correcta.  
**Prerrequisitos:** sesión 1. **Duración:** 16–18 min. **Materiales:** este archivo, registro; terminal local opcional sólo en una carpeta desechable propia.  
**No consultar:** respuestas, IA o búsqueda web durante el primer intento. **Sí consultar:** modelos de esta página y pistas de la clave.  
**Orden:** F3-01, F3-02, F3-03, F2-02, F4-01 y cierre. Registrá sólo inicio, final, total y tiempo aproximado de registro. La evaluación se realiza después mediante IA.

## Modelo y chuleta enseñados

- `pwd` muestra ubicación; `ls` lista; `cd` cambia directorio. Ruta absoluta parte de raíz; relativa, del directorio actual.
- `cat` muestra un archivo breve; `less` permite recorrer; `head` y `tail` leen inicio/final; `grep` filtra; `find` localiza; `|` conecta salida con entrada.
- `>` redirige y puede reemplazar el destino. En esta sesión sólo se interpreta: no lo ejecutes.
- Comillas dobles preservan espacios y expanden `$variable`; simples preservan texto literal.

## F3-01 — Ubicarse y navegar

**Familia:** F3 · **Objetivo:** reconstruir navegación segura · **Prerrequisito:** modelo anterior · **Herramientas:** chuleta/terminal opcional · **Ayuda:** pista 1.  
**Ejemplo:** desde `/tmp/typeops-v0`, `cd logs` es relativo; `cd /tmp/typeops-v0/logs` es absoluto.  
**Contexto:** estás en `/tmp/typeops-v0`; existe `logs`.  
**Tarea:** escribí una secuencia para mostrar ubicación, listar, entrar a `logs` relativamente, verificar y mostrar el `cd` absoluto equivalente.  
**Formato de respuesta:** un bloque de comandos, uno por línea.  
**Extensión máxima:** cinco comandos.

## F3-02 — Leer y filtrar

**Familia:** F3 · **Objetivo:** elegir lectura según intención · **Prerrequisito:** F3-01 · **Herramientas:** chuleta · **Ayuda:** dos pistas.  
**Ejemplo:** `tail -n 20 /tmp/typeops-v0/app.log | grep 'ERROR'` filtra sólo las últimas 20 líneas.  
**Contexto:** existen ficticiamente `/tmp/typeops-v0/app.log` y `/tmp/typeops-v0/config`.  
**Tarea:** escribí comandos para A) recorrer el log, B) buscar `ERROR` en sus últimas 20 líneas y C) localizar `*.conf`; explicá qué recibe `grep` en B. No ejecutes redirecciones.  
**Formato de respuesta:** tres comandos etiquetados A/B/C + una línea de explicación.  
**Extensión máxima:** cuatro líneas.

## F3-03 — Comillas y espacios

**Familia:** F3 · **Objetivo:** conservar argumentos · **Prerrequisito:** F3-01 · **Herramientas:** modelo · **Ayuda:** dos pistas.  
**Ejemplo:** `cat "/tmp/typeops-v0/logs/api demo.log"`.  
**Contexto:** ruta `/tmp/typeops-v0/logs/api demo.log`; variable `pattern='HTTP 500'`.  
**Tarea:** corregí `grep $pattern /tmp/typeops-v0/logs/api demo.log` y explicá qué preserva cada par de comillas.  
**Formato de respuesta:** comando + una línea de explicación.  
**Extensión máxima:** dos líneas.

## F2-02 — Proceso vivo, respuesta fallida

**Familia:** F2 · **Objetivo:** avanzar hacia función · **Prerrequisitos:** F1-03/F3-02 · **Herramientas:** comandos presentados · **Ayuda:** pista 1.  
**Modelo mínimo:** repetir una petición conocida y correlacionarla con el final del log aporta más que volver a comprobar el proceso.  
**Contexto:** `api-demo` figura en procesos; `/health` devuelve 500.  
**Tarea:** elegí dos observaciones nuevas, en orden, e indicá qué decisión inmediata habilita cada resultado.  
**Formato de respuesta:** dos viñetas `Observación → si resultado X, decisión Y`.  
**Extensión máxima:** dos viñetas, una línea cada una.

## F4-01 — Qué prueba que funciona

**Familia:** F4 · **Objetivo:** definir evidencia funcional · **Prerrequisito:** F2-02 · **Herramientas:** notas · **Ayuda:** pista 1.  
**Modelo mínimo:** una señal interna no reemplaza la conducta visible para un cliente.  
**Ejemplo:** para login, una cuenta de prueba debe obtener respuesta y sesión utilizables.  
**Contexto:** tras un cambio ficticio, el proceso reinició sin errores visibles.  
**Tarea:** definí una prueba positiva desde el cliente y una señal que demostraría que perfiles todavía falla.  
**Formato de respuesta:** dos líneas `Prueba positiva / Señal de fallo`.  
**Extensión máxima:** dos líneas.

## Cierre

Guardá respuestas originales, confianza, pista, comentario opcional y fricción al escribir sólo si existió. Registrá final, total y tiempo de registro; la IA completa evaluación y recomendación.

**Práctica externa siguiente:** Bandit inicial y 20 min en terminal propia con archivos no sensibles; practicá `pwd`, `ls`, `cd`, lectura y búsqueda.
