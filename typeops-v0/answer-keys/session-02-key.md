# Clave — Sesión 2

## Pistas

- **F3-01 Pista 1:** la secuencia empieza `pwd`, `ls`, `cd ...`, `pwd`.
- **F3-02 Pista 1:** recorrer=`less`; últimas líneas=`tail`; localizar nombres=`find`. **Pista 2:** el pipe entrega al `grep` sólo la salida de `tail`.
- **F3-03 Pista 1:** tanto `$pattern` como la ruta necesitan conservar espacios. **Pista 2:** usá comillas dobles alrededor de cada argumento.
- **F2-02 Pista 1:** correlacioná una petición repetible con el final del log; luego investigá la señal concreta.
- **F4-01 Pista 1:** verificá una acción que haría un usuario y definí también cómo se ve el fallo.

---

## Rúbricas

### F3-01

- **Elementos esenciales:** `pwd`; `ls`; `cd logs`; `pwd`; `cd /tmp/typeops-v0/logs`.
- **Alternativas aceptables:** `ls .`; ruta relativa `./logs`; usar `pwd` adicional.
- **Errores frecuentes:** confundir `pwd` con cambio; omitir verificación; escribir ruta absoluta sin `/`.
- **Tipo de error:** desconocimiento; sintaxis; verificación omitida.
- **Explicación:** navegar incluye confirmar el contexto actual antes y después.
- **Criterio de verificación:** la secuencia produce `/tmp/typeops-v0/logs` en ambos caminos si la estructura existe.
- **Siguiente recomendada:** sintaxis→reconstruir la secuencia completa una vez; luego F3-02.

### F3-02

- **Elementos esenciales:** A `less /tmp/typeops-v0/app.log`; B `tail -n 20 /tmp/typeops-v0/app.log | grep 'ERROR'`; C `find /tmp/typeops-v0/config -name '*.conf'`; pipe limita grep a la salida de tail.
- **Alternativas aceptables:** `grep ERROR` sin comillas; `find ... -type f -name '*.conf'`; para A, `cat` sólo si justifica que es breve.
- **Errores frecuentes:** invertir pipe; usar `grep` sobre todo el log; expandir `*.conf` en el shell por falta de comillas; ejecutar `>`.
- **Tipo de error:** selección, sintaxis, interpretación o acción insegura.
- **Explicación:** el comando debe corresponder al volumen y alcance de información deseados.
- **Criterio de verificación:** explica qué entrada recibe cada comando y no modifica archivos.
- **Siguiente recomendada:** selección→comparar tabla de comandos; sintaxis→una reconstrucción contextual.

### F3-03

- **Elementos esenciales:** `grep "$pattern" "/tmp/typeops-v0/logs/api demo.log"`; dobles permiten expandir variable manteniendo un argumento y preservan la ruta con espacios.
- **Alternativas aceptables:** `grep 'HTTP 500' '/tmp/typeops-v0/logs/api demo.log'` si sustituye la variable intencionalmente.
- **Errores frecuentes:** comillas simples sobre `$pattern`; citar sólo `demo.log`; citar comando entero.
- **Tipo de error:** sintaxis; confusión conceptual; fricción mecánica.
- **Explicación:** las comillas determinan argumentos y expansión antes de ejecutar `grep`.
- **Criterio de verificación:** puede explicar cuántos argumentos recibe `grep`.
- **Siguiente recomendada:** pista/sintaxis→F3-03V sin pista en la sesión siguiente.

### F2-02

- **Elementos esenciales:** repetir/registrar petición con hora o ID; leer/correlacionar últimas líneas del log; según señal, comprobar la dependencia/configuración concreta sin reiniciar a ciegas.
- **Alternativas aceptables:** revisar log primero si ya hay hora/ID exactos.
- **Errores frecuentes:** volver a `ps`; reiniciar; inferir causa desde 500.
- **Tipo de error:** siguiente acción débil; acción insegura; interpretación.
- **Explicación:** una observación útil agrega información nueva y conecta la capa HTTP con la interna.
- **Criterio de verificación:** cada acción incluye qué evidencia cambiaría la decisión.
- **Siguiente recomendada:** sin evidencia esperada→F4-01; reinicio→F2-03.

### F4-01

- **Elementos esenciales:** prueba positiva desde cliente, por ejemplo login/perfil con datos de prueba; señal de fallo como status inesperado, body incorrecto o sesión inutilizable.
- **Alternativas aceptables:** health sólo si la función exigida es explícitamente health; mejor combinar con operación real.
- **Errores frecuentes:** proceso activo, log limpio o puerto abierto como única prueba.
- **Tipo de error:** verificación omitida; confusión conceptual.
- **Explicación:** la evidencia debe representar el objetivo, no una condición necesaria aislada.
- **Criterio de verificación:** define entrada, resultado esperado y señal contraria.
- **Siguiente recomendada:** parcial→aplicar criterio en F2-04; correcto→avanzar.

