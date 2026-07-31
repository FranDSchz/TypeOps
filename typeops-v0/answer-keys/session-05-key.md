# Clave — Sesión 5

## Pistas

- **F2-05 Pista 1:** incluí Alice→Alice, Bob→Bob y al menos un cruce. **Pista 2:** mantené endpoint/objeto y cambiá una sola dimensión cuando compares.
- **F4-02 Pista 1:** “pasa” significa positivo permitido funciona y negativo prohibido se bloquea; interpretá ambos ejes.
- **F4-03 Pista 1:** escribí esperado y condición de reversión antes del cambio conceptual.
- **F4-06 Pista 1:** un negativo correcto sin positivo ejecutado no permite declarar éxito completo.
- **F4-02V:** la pista está en `variants-key.md`.

---

## Rúbricas

### F2-05

- **Elementos esenciales:** positivos Alice→10 y Bob→11; negativos Alice→11 y/o Bob→10; esperado: propios accesibles, ajenos privados rechazados sin datos; hallazgo: sesión A recibe objeto privado B o realiza efecto no autorizado.
- **Alternativas aceptables:** matriz de tres casos si contiene un positivo y un negativo controlados; status puede ser 403/404 según diseño.
- **Errores frecuentes:** sólo cambiar ID; no probar propios; asumir que 200 es vulnerable sin política/body.
- **Tipo de error:** confusión conceptual; verificación omitida; interpretación.
- **Explicación:** el contraste necesita función normal, frontera de autorización y política explícita.
- **Criterio de verificación:** cada request tiene identidad, objeto, esperado y observado a registrar.
- **Siguiente recomendada:** falso positivo→F2-05V; matriz incompleta→F4-02.

### F4-02

- **Elementos esenciales:** positivo=propio permitido; negativo=ajeno privado rechazado. Pasa/pasa=objetivo logrado para casos; pasa positivo/falla negativo=vulnerabilidad persiste; falla positivo/pasa negativo=regresión; falla/falla=función rota y seguridad no demostrada/resultado inválido.
- **Alternativas aceptables:** invertir orden de ejes si las etiquetas son claras.
- **Errores frecuentes:** mirar sólo negativo; llamar seguro a falla/falla; omitir contenido sensible.
- **Tipo de error:** interpretación; verificación omitida.
- **Explicación:** seguridad sin disponibilidad funcional no es un resultado aceptable.
- **Criterio de verificación:** interpreta las cuatro combinaciones correctamente.
- **Siguiente recomendada:** error→F4-02V; correcto→F4-03.

### F4-03

- **Elementos esenciales:** línea base 200/200 ficticia; cambio mínimo: control servidor de identidad/propiedad; después positivo y negativo más logs/función relevante; revertir/corregir si positivo falla o aparecen regresiones; guardar outputs con hora/versión/cambio.
- **Alternativas aceptables:** status 404 en negativo; rollback lógico explicado sin comandos.
- **Errores frecuentes:** cambio amplio; no definir condición; verificar sólo exploit; no guardar evidencia.
- **Tipo de error:** verificación omitida; siguiente acción débil.
- **Explicación:** decidir antes evita redefinir éxito a favor del resultado obtenido.
- **Criterio de verificación:** el plan permite comparar y regresar sin improvisar.
- **Siguiente recomendada:** falta de línea base→F4-01; falta de reversión→reintento breve.

### F4-06

- **Elementos esenciales:** hecho: negativo rechazado; hecho: positivo pendiente; conclusión válida: el caso negativo mejoró; inválida: parche completo/servicio funcional; próxima: ejecutar positivo y registrar respuesta.
- **Alternativas aceptables:** recomendar no desplegar/aceptar hasta completar matriz.
- **Errores frecuentes:** declarar éxito; inventar resultado; no poner próxima acción.
- **Tipo de error:** interpretación; verificación omitida.
- **Explicación:** ausencia de evidencia positiva es estado pendiente, no evidencia favorable.
- **Criterio de verificación:** el mensaje impide una decisión prematura.
- **Siguiente recomendada:** alta confianza incorrecta→F4-02V inmediatamente.

### F4-02V

Usá la rúbrica completa de `variants-key.md`. Es correcto sólo si identifica que el negativo está protegido pero el positivo tiene una regresión, por lo que no hay éxito global y corresponde corregir o revertir según el plan.

