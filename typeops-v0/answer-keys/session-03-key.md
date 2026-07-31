# Clave — Sesión 3

## Pistas

- **F1-04 Pista 1:** separá `http`, `127.0.0.1`, `8080` y `/health` antes de nombrar roles.
- **F2-03 Pista 1:** comprobá si el proceso existe. **Pista 2:** después mirá estado/configuración o log de arranque.
- **F3-04 Pista 1:** proceso=`ps`; listener=`ss`. **Pista 2:** estado=`systemctl status`; final=`tail`.
- **F2-04 Pista 1:** `r7` y la hora vinculan las dos observaciones, pero “timeout” aún no dice qué dependencia ni por qué.
- **F4-05 Pista 1:** Hechos / Hipótesis / Ya hecho y resultado / Próxima acción + responsable.

---

## Rúbricas

### F1-04

- **Elementos esenciales:** cliente=la herramienta; servidor=servicio local; protocolo=HTTP; IP=127.0.0.1; puerto=8080; recurso/path=`/health`.
- **Alternativas aceptables:** cliente=`curl` si lo supone explícitamente.
- **Errores frecuentes:** llamar protocolo a puerto; servidor a IP; path a URL completa.
- **Tipo de error:** recuperación incompleta; confusión conceptual.
- **Explicación:** cada parte responde una pregunta distinta: cómo, dónde y qué.
- **Criterio de verificación:** reconstruye la URL desde las etiquetas.
- **Siguiente recomendada:** repasar componentes y reintentar con otra URL local.

### F2-03

- **Elementos esenciales:** comprobar proceso/estado y logs/configuración de arranque; contemplar detenido, fallo, otro puerto/interfaz; no reiniciar.
- **Alternativas aceptables:** `systemctl status api-demo` y luego log; `ps` y revisar configuración de puerto.
- **Errores frecuentes:** “firewall” como causa automática en loopback; reinicio; conclusión única.
- **Tipo de error:** siguiente acción débil; interpretación; acción insegura.
- **Explicación:** ausencia de listener reduce posibilidades pero no identifica por sí sola la causa.
- **Criterio de verificación:** cada resultado posible conduce a una observación distinta.
- **Siguiente recomendada:** acción débil→F3-04; alta confianza causal→contraste proceso/puerto.

### F3-04

- **Elementos esenciales:** `ps aux | grep '[a]pi-demo'`; `ss -ltn` (puede filtrar `:8080`); `systemctl status api-demo`; `tail -n 30 /tmp/typeops-v0/api.log`. Límites: proceso/listener/estado/log no prueban función completa.
- **Alternativas aceptables:** `pgrep -af api-demo`; `ss -ltnp` si permisos lo permiten; `journalctl` no exigido.
- **Errores frecuentes:** comandos que cambian estado; afirmar éxito; ruta/nombre inventado fuera del caso.
- **Tipo de error:** sintaxis; verificación omitida; acción insegura.
- **Explicación:** la secuencia construye un mapa, pero requiere después petición funcional.
- **Criterio de verificación:** cuatro capas correctamente asociadas y sin modificación.
- **Siguiente recomendada:** sintaxis→reconstrucción breve; límites omitidos→F4-01.

### F2-04

- **Elementos esenciales:** hechos: 500 a hora/ID y línea correlacionada con timeout; hipótesis: una dependencia demora/no responde; comprobar salud/log/configuración de la dependencia identificada o reproducir con correlación; no afirmar causa final.
- **Alternativas aceptables:** buscar líneas vecinas por `r7` para identificar dependencia.
- **Errores frecuentes:** “base de datos caída” sin evidencia; reiniciar; ignorar ID.
- **Tipo de error:** interpretación; siguiente acción débil.
- **Explicación:** correlación respalda relación entre eventos, no completa causalidad.
- **Criterio de verificación:** prueba propuesta podría confirmar y también contradecir la hipótesis.
- **Siguiente recomendada:** confusión→reaparición F2-04 en sesión 4; correcto→F4-05.

### F4-05

- **Elementos esenciales:** hora/path/status/ID; log correlacionado; hipótesis marcada; no se cambió estado; siguiente comprobación concreta; responsable A/B/C.
- **Alternativas aceptables:** formato de viñetas o mensaje corto.
- **Errores frecuentes:** narración larga; hipótesis como hecho; sin propietario o resultado.
- **Tipo de error:** recuperación incompleta; verificación omitida; interpretación.
- **Explicación:** un buen handoff permite continuidad y evita duplicación.
- **Criterio de verificación:** otro miembro sabe qué está confirmado, qué ejecutar y cómo reportar.
- **Siguiente recomendada:** practicar `team-drills/drill-01.md`; falta de síntesis→máximo cuatro líneas.

