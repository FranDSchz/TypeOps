# Sesión 2 — Rutas, lectura y evidencia funcional

**Objetivo:** navegar, leer y filtrar sin modificar; no confundir proceso iniciado con función correcta.  
**Prerrequisitos:** sesión 1. **Duración:** 16–18 min. **Materiales:** este archivo, registro; terminal local opcional sólo en una carpeta desechable propia.  
**No consultar:** respuestas, IA o búsqueda web durante el primer intento. **Sí consultar:** modelos de esta página y pistas de la clave.  
**Orden:** F3-01 (3), F3-02 (4), F3-03 (3), F2-02 (3), F4-01 (2), cierre (2).

## Modelo y chuleta enseñados

- `pwd` muestra ubicación; `ls` lista; `cd` cambia directorio. Ruta absoluta parte de raíz; relativa, del directorio actual.
- `cat` muestra un archivo breve; `less` permite recorrer; `head` y `tail` leen inicio/final; `grep` filtra; `find` localiza; `|` conecta salida con entrada.
- `>` redirige y puede reemplazar el destino. En esta sesión sólo se interpreta: no lo ejecutes.
- Comillas dobles preservan espacios y expanden `$variable`; simples preservan texto literal.

## F3-01 — Ubicarse y navegar

**Familia:** F3 · **Objetivo:** reconstruir navegación segura · **Prerrequisito:** modelo anterior · **Herramientas:** chuleta/terminal opcional · **Ayuda:** pista 1.  
**Ejemplo:** desde `/tmp/typeops-v0`, `cd logs` es relativo; `cd /tmp/typeops-v0/logs` es absoluto.  
**Contexto:** estás en `/tmp/typeops-v0`; existe `logs`.  
**Consigna:** escribí una secuencia para mostrar ubicación, listar, entrar a `logs` relativamente y verificar. Agregá el `cd` absoluto equivalente.  
**Producí:** cinco comandos en orden, confianza y registro de error mecánico sólo si cambió el comando.

## F3-02 — Leer y filtrar

**Familia:** F3 · **Objetivo:** elegir lectura según intención · **Prerrequisito:** F3-01 · **Herramientas:** chuleta · **Ayuda:** dos pistas.  
**Ejemplo:** `tail -n 20 /tmp/typeops-v0/app.log | grep 'ERROR'` filtra sólo las últimas 20 líneas.  
**Contexto:** existen ficticiamente `/tmp/typeops-v0/app.log` y `/tmp/typeops-v0/config`.  
**Consigna:** A) recorrer el log; B) buscar `ERROR` en sus últimas 20 líneas; C) localizar `*.conf` bajo config. Explicá el pipe de B. No ejecutes redirecciones.  
**Producí:** tres comandos, explicación, confianza y clasificación selección/sintaxis/interpretación.

## F3-03 — Comillas y espacios

**Familia:** F3 · **Objetivo:** conservar argumentos · **Prerrequisito:** F3-01 · **Herramientas:** modelo · **Ayuda:** dos pistas.  
**Ejemplo:** `cat "/tmp/typeops-v0/logs/api demo.log"`.  
**Contexto:** ruta `/tmp/typeops-v0/logs/api demo.log`; variable `pattern='HTTP 500'`.  
**Consigna:** corregí `grep $pattern /tmp/typeops-v0/logs/api demo.log` y explicá las comillas.  
**Producí:** comando corregido, explicación, confianza; separá concepto de fricción mecánica.

## F2-02 — Proceso vivo, respuesta fallida

**Familia:** F2 · **Objetivo:** avanzar hacia función · **Prerrequisitos:** F1-03/F3-02 · **Herramientas:** comandos presentados · **Ayuda:** pista 1.  
**Modelo mínimo:** repetir una petición conocida y correlacionarla con el final del log aporta más que volver a comprobar el proceso.  
**Contexto:** `api-demo` figura en procesos; `/health` devuelve 500.  
**Consigna:** elegí dos próximas observaciones, en orden, y la decisión que habilita cada una.  
**Producí:** dos observaciones condicionales, confianza y si repetiste evidencia ya disponible.

## F4-01 — Qué prueba que funciona

**Familia:** F4 · **Objetivo:** definir evidencia funcional · **Prerrequisito:** F2-02 · **Herramientas:** notas · **Ayuda:** pista 1.  
**Modelo mínimo:** una señal interna no reemplaza la conducta visible para un cliente.  
**Ejemplo:** para login, una cuenta de prueba debe obtener respuesta y sesión utilizables.  
**Contexto:** tras un cambio ficticio, el proceso reinició sin errores visibles.  
**Consigna:** definí una prueba positiva y una señal de que perfiles todavía falla.  
**Producí:** criterio positivo, señal de fallo y confianza.

## Cierre (2 min)

Evaluá, registrá un error causal y aplicá una sola regla: concepto→explicación+variante; recuperación→reintento/repaso; sin evidencia→F2/F4; sintaxis→fragmento contextual; pista→variante sin pista; alta confianza errónea→contraste; fricción→máx. 3 min; independiente→avanzar.

**Práctica externa siguiente:** Bandit inicial y 20 min en terminal propia con archivos no sensibles; practicá `pwd`, `ls`, `cd`, lectura y búsqueda.

