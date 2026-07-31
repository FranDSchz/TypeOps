# Clave de las ocho variantes

## Pistas

- **F1-03V:** separá capa de red de dependencia funcional.
- **F1-06V:** una cookie puede estar presente y apuntar a nada válido.
- **F2-01V:** medí varias veces la misma operación y conservá status, tiempo y body.
- **F2-05V:** empezá por la política: ¿qué campos son públicos?
- **F3-03V:** los dos huecos son argumentos completos; uno expande variable.
- **F3-05V:** el status y el campo `ok` deben concordar con el objetivo.
- **F4-02V:** evaluá positivo y negativo por separado.
- **F4-04V:** comprobá versión y ayuda local antes de aceptar la opción.

---

## Rúbricas

### F1-03V

- **Esenciales:** proceso/listener funcionan; health/función falla con 503; hipótesis de dependencia; revisar log/configuración/salud de la dependencia identificada.
- **Alternativas:** correlacionar ID/hora primero. **Errores:** “todo caído” o “todo funciona”. **Revela:** confusión conceptual/interpretación.
- **Explicación y verificación:** evidencias de capas diferentes coexisten; la próxima prueba debe confirmar/contradecir dependencia. **Siguiente:** si falla, F2-04; si pasa, avanzar.

### F1-06V

- **Esenciales:** request llevaba cookie; 401 sugiere no autenticado; Set-Cookie borra; no prueba causa exacta ni permiso; probar login válido/flujo esperado.
- **Alternativas:** revisar expiración del entorno educativo. **Errores:** cookie=sesión válida. **Revela:** confusión conceptual.
- **Explicación y verificación:** presencia no implica validez. **Siguiente:** contraste autenticación/autorización antes de F2-05.

### F2-01V

- **Esenciales:** repetir número pequeño y definido, registrar hora/status/body/latencia; no concluir caída por un 200 lento ni causa; comparar patrón y logs correlacionados.
- **Alternativas:** tres a cinco mediciones sin carga agresiva. **Errores:** benchmark/fuerza bruta/reinicio. **Revela:** siguiente acción débil/acción insegura.
- **Explicación y verificación:** caracterizar variación precede a intervenir. **Siguiente:** F4-01 si no define esperado.

### F2-05V

- **Esenciales:** no hay evidencia de fallo si sólo aparecen alias/avatar públicos; comprobar ausencia de email/campos privados y política; hallazgo sería campo privado o acción no autorizada.
- **Alternativas:** comparar usuario anónimo y autenticado. **Errores:** otro ID=IDOR. **Revela:** interpretación/confusión conceptual.
- **Explicación y verificación:** autorización depende de política. **Siguiente:** reintentar F2-05 si persiste.

### F3-03V

- **Esenciales:** `printf '[%s] [%s]\\n' "$label" 'estado actual'`; comillas conservan argumento vacío y texto con espacio.
- **Alternativas:** dobles para el literal. **Errores:** `$label` sin comillas; comillas alrededor del comando entero. **Revela:** sintaxis/fricción mecánica.
- **Explicación y verificación:** contar dos argumentos de datos. **Siguiente:** máximo 3 min de fragmento contextual si fue mecánico.

### F3-05V

- **Esenciales:** petición equivalente a `curl -i -H "Content-Type: application/json" -d '{"name":"Ada"}' "http://127.0.0.1:8080/save"`; 200 no basta si `ok=false`; éxito requiere status y semántica esperada.
- **Alternativas:** `--data`, `--header`; `-X POST` opcional. **Errores:** declarar éxito por 200; JSON/comillas inválidos. **Revela:** verificación/sintaxis.
- **Explicación y verificación:** comparar ambos canales. **Siguiente:** F4-01 si omite semántica.

### F4-02V

- **Esenciales:** negativo protegido; positivo roto; regresión, no éxito global; corregir o revertir según plan y repetir ambos casos.
- **Alternativas:** detener despliegue. **Errores:** declarar seguro/terminado. **Revela:** verificación omitida/interpretación.
- **Explicación y verificación:** seguridad y función son conjuntas. **Siguiente:** F4-03 si no hay plan de reversión.

### F4-04V

- **Esenciales:** tratar opción como hipótesis; obtener versión y `--help`/documentación local; usar sólo si aparece y verificar salida/exit code/semántica.
- **Alternativas:** prueba inocua en copia educativa. **Errores:** confiar por plausibilidad; buscar sólo confirmación. **Revela:** uso deficiente de IA.
- **Explicación y verificación:** compatibilidad es evidencia local. **Siguiente:** reintentar sin IA o con prompt que exija supuestos.

