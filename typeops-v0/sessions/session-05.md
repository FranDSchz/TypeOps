# Sesión 5 — Control de acceso y verificación de cambios

**Objetivo:** comparar identidades/objetos, evitar falsos positivos y comprobar seguridad más función. **Prerrequisitos:** sesión 4. **Duración:** 16–18 min.  
**Materiales:** archivo y registro. **No consultar:** soluciones de laboratorio/IA durante primer intento. **Sí consultar:** modelos y pistas.  
**Orden:** F2-05, F4-02, F4-03, F4-06, F4-02V y cierre. Registrá sólo tiempos de sesión; la evaluación se realiza después mediante IA.

## Modelo enseñado

IDOR describe acceso indebido a un objeto al manipular una referencia sin control adecuado; Broken Access Control es más amplio. Cambiar un número no prueba vulnerabilidad: necesitás política esperada, caso permitido y caso prohibido. El positivo protege función; el negativo protege aislamiento.

## F2-05 — Comparar dos usuarios

**Familia:** F2 · **Objetivo:** diseñar comparación autorizada · **Prerrequisitos:** F1-06/F3-05 · **Herramientas:** sesiones ficticias · **Ayuda:** dos pistas.  
**Ejemplo:** Alice→perfil propio debe funcionar; Alice→perfil privado Bob debe rechazarse.  
**Contexto:** Alice=`session=demo-alice`, perfil 10; Bob=`session=demo-bob`, perfil 11; perfiles privados por consigna.  
**Tarea:** diseñá una matriz mínima que compruebe función e aislamiento, con resultado esperado y criterio para investigar Broken Access Control.  
**Formato de respuesta:** tabla de hasta cuatro casos `identidad → objeto → esperado` + una línea `Investigar si:`.  
**Extensión máxima:** cinco líneas.

## F4-02 — Positivo y negativo

**Familia:** F4 · **Objetivo:** comprobar parche sin romper función · **Prerrequisito:** F2-05 · **Herramientas:** matriz · **Ayuda:** pista 1.  
**Contexto:** se aplicó un parche ficticio.  
**Tarea:** definí una prueba positiva y una negativa, y clasificá las cuatro combinaciones posibles de sus resultados.  
**Formato de respuesta:** dos líneas de pruebas + cuatro celdas o viñetas de interpretación.  
**Extensión máxima:** seis líneas.

## F4-03 — Antes, después y reversión

**Familia:** F4 · **Objetivo:** definir éxito antes de cambiar · **Prerrequisitos:** F4-01/F4-02 · **Herramientas:** plantilla · **Ayuda:** pista 1.  
**Ejemplo:** antes permitido=200/prohibido=200; objetivo 200/403; revertir si lo permitido deja de funcionar.  
**Contexto:** corrección conceptual del laboratorio, sin editar código.  
**Tarea:** definí línea base, cambio mínimo, pruebas posteriores, condición de reversión y evidencia a guardar.  
**Formato de respuesta:** cinco viñetas con esas etiquetas.  
**Extensión máxima:** cinco viñetas, una línea cada una.

## F4-06 — Comunicar resultado mixto

**Familia:** F4 · **Objetivo:** no ocultar incertidumbre · **Prerrequisitos:** F4-02/F4-03 · **Herramientas:** notas · **Ayuda:** pista 1.  
**Contexto:** el negativo pasa, el positivo todavía no fue ejecutado.  
**Tarea:** comunicá qué está demostrado, qué conclusión todavía no es válida y cuál es la próxima acción.  
**Formato de respuesta:** tres líneas `Demostrado / No demostrado / Próxima acción`.  
**Extensión máxima:** tres líneas.

## F4-02V — Variante integrada: seguro pero roto

**Familia:** F4 · **Objetivo:** transferir verificación conjunta · **Prerrequisito:** F4-02 · **Herramientas:** resultados · **Ayuda:** sin pista inicial.  
**Contexto:** Alice→Bob=403; Alice→Alice=403.  
**Tarea:** indicá qué objetivo cumplió, cuál falló y la decisión operativa inmediata.  
**Formato de respuesta:** tres líneas `Cumplió / Falló / Decisión`.  
**Extensión máxima:** tres líneas. Si usás pista, está en `../answer-keys/variants-key.md`.

## Cierre

Guardá respuestas y registro mínimo para evaluación posterior. La variante reemplaza un reintento; no suma una actividad primaria.  
**Práctica externa siguiente:** laboratorio introductorio autorizado de access control en PortSwigger, registrando política, positivo, negativo y evidencia.
