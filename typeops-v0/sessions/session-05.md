# Sesión 5 — Control de acceso y verificación de cambios

**Objetivo:** comparar identidades/objetos, evitar falsos positivos y comprobar seguridad más función. **Prerrequisitos:** sesión 4. **Duración:** 16–18 min.  
**Materiales:** archivo y registro. **No consultar:** soluciones de laboratorio/IA durante primer intento. **Sí consultar:** modelos y pistas.  
**Orden:** F2-05 (4), F4-02 (3), F4-03 (3), F4-06 (2), F4-02V (2), cierre (2).

## Modelo enseñado

IDOR describe acceso indebido a un objeto al manipular una referencia sin control adecuado; Broken Access Control es más amplio. Cambiar un número no prueba vulnerabilidad: necesitás política esperada, caso permitido y caso prohibido. El positivo protege función; el negativo protege aislamiento.

## F2-05 — Comparar dos usuarios

**Familia:** F2 · **Objetivo:** diseñar comparación autorizada · **Prerrequisitos:** F1-06/F3-05 · **Herramientas:** sesiones ficticias · **Ayuda:** dos pistas.  
**Ejemplo:** Alice→perfil propio debe funcionar; Alice→perfil privado Bob debe rechazarse.  
**Contexto:** Alice=`session=demo-alice`, perfil 10; Bob=`session=demo-bob`, perfil 11; perfiles privados por consigna.  
**Consigna:** diseñá matriz mínima de peticiones para función e aislamiento; indicá resultados esperados y hallazgo que justificaría investigar BAC.  
**Producí:** casos positivos/negativos, expectativas y confianza.

## F4-02 — Positivo y negativo

**Familia:** F4 · **Objetivo:** comprobar parche sin romper función · **Prerrequisito:** F2-05 · **Herramientas:** matriz · **Ayuda:** pista 1.  
**Contexto:** se aplicó un parche ficticio. **Consigna:** escribí prueba positiva/negativa, esperado y conclusión para pasa/pasa, pasa/falla, falla/pasa y falla/falla.  
**Producí:** dos pruebas y tabla de cuatro combinaciones, confianza.

## F4-03 — Antes, después y reversión

**Familia:** F4 · **Objetivo:** definir éxito antes de cambiar · **Prerrequisitos:** F4-01/F4-02 · **Herramientas:** plantilla · **Ayuda:** pista 1.  
**Ejemplo:** antes permitido=200/prohibido=200; objetivo 200/403; revertir si lo permitido deja de funcionar.  
**Contexto:** corrección conceptual del laboratorio, sin editar código.  
**Consigna:** completá evidencia antes, cambio mínimo en palabras, pruebas después, condición de reversión y evidencia guardada.  
**Producí:** plan verificable y confianza.

## F4-06 — Comunicar resultado mixto

**Familia:** F4 · **Objetivo:** no ocultar incertidumbre · **Prerrequisitos:** F4-02/F4-03 · **Herramientas:** notas · **Ayuda:** pista 1.  
**Contexto:** el negativo pasa, el positivo todavía no fue ejecutado.  
**Consigna:** redactá estado actual, conclusión válida/inválida y próxima acción.  
**Producí:** máximo cuatro líneas y confianza.

## F4-02V — Variante integrada: seguro pero roto

**Familia:** F4 · **Objetivo:** transferir verificación conjunta · **Prerrequisito:** F4-02 · **Herramientas:** resultados · **Ayuda:** sin pista inicial.  
**Contexto:** Alice→Bob=403; Alice→Alice=403.  
**Consigna:** evaluá qué objetivo cumplió, cuál falló y la decisión operativa siguiente.  
**Producí:** diagnóstico de regresión, decisión y confianza. Si usás pista, está en `../answer-keys/variants-key.md`.

## Cierre (2 min)

Evaluá y aplicá una regla manual. La variante reemplaza un reintento; no suma una actividad primaria.  
**Práctica externa siguiente:** laboratorio introductorio autorizado de access control en PortSwigger, registrando política, positivo, negativo y evidencia.

