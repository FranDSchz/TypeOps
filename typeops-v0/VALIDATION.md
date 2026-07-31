# Validación de TypeOps V0 manual

Fecha: 31 de julio de 2026.

## Comprobaciones estructurales

- `activities.json` parsea como JSON y contiene 24 IDs primarios únicos.
- `variants.json` parsea como JSON y contiene 8 IDs de variante únicos.
- Hay exactamente 4 familias, 6 archivos de sesión, 6 claves de sesión y 3 drills.
- Cada actividad primaria aparece en al menos una sesión y tiene una sección de rúbrica en una clave.
- Cada variante apunta a una actividad primaria existente y tiene pista/rúbrica en `variants-key.md`.
- Todos los registros requeridos tienen plantilla; el formulario del piloto contiene las cinco actividades de la sesión 1.
- Las referencias relativas usadas desde las sesiones hacia las claves y las del README resuelven a archivos existentes.

## Distribución comprobada

| Sesión | Actividades | Tiempo de actividades | Cierre | Total previsto |
|---|---|---:|---:|---:|
| 1 | F1-01, F1-02, F1-03, F2-01, F4-06 | 12 min | 2 min + lectura breve | 14–17 min |
| 2 | F3-01, F3-02, F3-03, F2-02, F4-01 | 15 min | 2 min | 17 min |
| 3 | F1-04, F2-03, F3-04, F2-04, F4-05 | 14 min | 2 min | 16 min |
| 4 | F1-05, F1-06, F3-05, reaparición F2-04 | 14 min | 2 min | 16 min |
| 5 | F2-05, F4-02, F4-03, F4-06, variante F4-02V | 14 min | 2 min | 16 min |
| 6 | F3-06, F2-06, F4-04, F4-05 | 14 min | 2 min | 16 min |

Las 24 actividades primarias son únicas en el corpus. F2-04, F4-05, F4-06 reaparecen deliberadamente en otra superficie; F4-02V es una variante, no una actividad primaria adicional.

## Progresión beginner-first

- Cada habilidad nueva tiene modelo mínimo y ejemplo antes de la consigna.
- Sesión 1 no exige terminal ni instalación; enseña el vocabulario que evalúa.
- Navegación/lectura preceden a procesos/puertos/logs; estos preceden HTTP; HTTP precede autenticación/autorización y curl; Python e IA supervisada quedan al final.
- Las variantes conservan la habilidad y no agregan temas.
- El contenido avanzado no aparece; IDOR/Broken Access Control se limita al modelo fundamental y a un laboratorio ficticio autorizado.

## Separación y seguridad

- Los archivos de sesión no incluyen las respuestas de rúbrica. Los ejemplos visibles sólo enseñan el modelo mínimo necesario.
- Las pistas están al inicio de cada clave, antes de las respuestas, para reducir exposición accidental.
- Los únicos destinos HTTP son `127.0.0.1`; `example.test` se usa sólo como host ficticio.
- No se encontraron patrones de comandos destructivos ni objetivos externos.
- Los nombres de procesos, servicios, archivos, cookies y credenciales son ficticios.
- Flags, checkers, ticks, SLA y scoring se presentan explícitamente como modelo común o hipótesis, nunca como reglas confirmadas de Cyber War.

## Registro y carga operativa

- El registro por actividad usa una fila y un solo error causal dominante.
- El cierre está limitado a dos minutos y el overhead objetivo total a menos de cinco minutos.
- No se registra WPM. La fricción mecánica sólo importa si cambia el resultado y su práctica adicional está limitada a dos o tres minutos.

## Revisión técnica manual

- Se revisaron sintaxis y propósito de `pwd`, `ls`, `cd`, `cat`, `less`, `head`, `tail`, `grep`, `find`, pipes, redirección conceptual, `ps`, `ss`, `systemctl status`, `curl` y el fragmento Python.
- Las soluciones equivalentes son aceptadas por criterio semántico, no por coincidencia textual.
- Las duraciones suman entre 14 y 17 minutos incluyendo cierre y lectura breve, dentro del rango pedido de 12–18 minutos.
- No se ejecutaron pruebas automatizadas porque no existe software; sí se hicieron parseo de JSON, conteos, cobertura de IDs, resolución de referencias y búsqueda de patrones inseguros.

## Corrección de alcance registrada

El plan preliminar repetía F1-06 en sesión 5 y no ubicaba F4-03. Se sustituyó esa repetición por F4-03, sin aumentar el número de actividades, familias, sesiones ni temas.

