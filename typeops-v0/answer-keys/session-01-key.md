# Clave — Sesión 1

Leé primero sólo la pista solicitada. Las rúbricas empiezan después del separador.

## Pistas

- **F1-01 Pista 1:** preguntá qué gana el equipo si el rival no entra pero el usuario legítimo tampoco.
- **F1-02 Pista 1:** separá lo observado o comunicado de la conclusión operativa que todavía no está autorizada por esa evidencia.
- **F1-03 Pista 1:** proceso y listener prueban existencia, no una operación del usuario. **Pista 2:** elegí una petición funcional conocida.
- **F2-01 Pista 1:** convertí “caído” en una salida con hora. **Pista 2:** empezá por `curl -i` al health local provisto.
- **F4-06 Pista 1:** usá cuatro etiquetas: Hechos / Hipótesis / Función / Próxima prueba.

---

## Rúbricas y explicaciones

### F1-01

- **Elementos esenciales:** ataque obtiene ventaja/evidencia autorizada; defensa reduce abuso; disponibilidad conserva función; apagar impide abuso pero también puede romper disponibilidad y no corrige la causa.
- **Alternativas aceptables:** “continuidad”, “función” o “SLA” sólo si SLA se marca como modelo no confirmado.
- **Errores frecuentes:** definir defensa como apagar; omitir función; presentar flags/scoring como reglas oficiales.
- **Tipo de error:** confusión conceptual; acción insegura.
- **Explicación:** el objetivo operativo es conservar una función protegida, no elegir seguridad o disponibilidad como absolutos.
- **Criterio de verificación:** la respuesta anticipa una prueba funcional desde la perspectiva del cliente.
- **Siguiente recomendada:** confusión→releer modelo y F1-03; alta confianza incorrecta→F2-01V más adelante.

### F1-02

- **Elementos esenciales:** A=hecho de que se comunicó un rango preliminar, no duración definitiva; B=rumor/hipótesis no confirmada, por lo que no se debe planificar scoring como regla; C=resultado limitado a `/health=503`, mientras que la causa “base caída” es hipótesis de la IA y no justifica aún parchear, revertir o declarar todo el servicio caído.
- **Alternativas aceptables:** llamar A “información preliminar”; pedir reglamento para B; para C, proponer correlacionar logs o comprobar la dependencia sin aceptar la causa de IA.
- **Errores frecuentes:** tratar A como regla final; actuar sobre B; aceptar la causa propuesta por IA; generalizar `/health=503` a caída total del servicio.
- **Tipo de error:** confusión conceptual; interpretación.
- **Explicación:** la etiqueta depende de fuente y alcance, no de cuán plausible parezca una frase.
- **Criterio de verificación:** cada viñeta preserva el alcance de la evidencia y evita una decisión prematura concreta.
- **Siguiente recomendada:** error→reintento con tres frases propias; luego F4-06.

### F1-03

- **Elementos esenciales:** sabemos que hay proceso y listener; no sabemos que la función responda correctamente ni que un checker la acepte; próxima prueba: petición funcional local conocida y observar status/body.
- **Alternativas aceptables:** primero consultar configuración para conocer endpoint si `/health` no está confirmado.
- **Errores frecuentes:** “está funcionando”; inventar checker; reiniciar.
- **Tipo de error:** confusión conceptual; siguiente acción débil.
- **Explicación:** cada capa aporta evidencia parcial; la prueba debe acercarse a la experiencia que se necesita conservar.
- **Criterio de verificación:** distingue al menos tres capas y propone resultado observable.
- **Siguiente recomendada:** concepto→F1-03V en la sesión siguiente; acción débil→F2-01.

### F2-01

- **Elementos esenciales:** una primera petición concreta, por ejemplo `curl -i http://127.0.0.1:8080/health`; registrar hora, conexión o error, status y headers/body relevantes; uno o dos condicionales inmediatos, por ejemplo si no conecta observar listener/proceso, y si responde con error correlacionar request/log. No desarrollar pasos posteriores.
- **Alternativas aceptables:** si el endpoint no está confirmado, consultar configuración/documentación local antes del curl.
- **Errores frecuentes:** reiniciar, parchear, declarar causa, registrar sólo status, o escribir un plan completo antes de conocer el primer resultado.
- **Tipo de error:** siguiente acción débil; acción insegura; verificación omitida.
- **Explicación:** una primera prueba barata debe transformar un reporte vago en evidencia que el siguiente paso pueda discriminar.
- **Criterio de verificación:** contiene exactamente una primera acción, evidencia reproducible y hasta dos decisiones “si X, entonces Y”; no modifica estado.
- **Siguiente recomendada:** reinicio sin evidencia→F2-01V; sin condicional→F4-01.

### F4-06

- **Elementos esenciales:** hechos: proceso/listener presentes y health=503; hipótesis marcada, no causa confirmada; función health no disponible; próxima acción correlacionar log/configuración/dependencia con esa petición.
- **Alternativas aceptables:** repetir petición con hora/ID antes del log.
- **Errores frecuentes:** decir “servicio funciona” por listener; afirmar dependencia como causa; no incluir próxima acción.
- **Tipo de error:** interpretación; verificación omitida.
- **Explicación:** señales de capas distintas pueden coexistir; el cierre debe preservar incertidumbre útil.
- **Criterio de verificación:** otro integrante puede ejecutar la próxima prueba sin pedir contexto adicional.
- **Siguiente recomendada:** hipótesis como hecho→F1-02 breve; falta de acción→F4-05 en sesión 3.
