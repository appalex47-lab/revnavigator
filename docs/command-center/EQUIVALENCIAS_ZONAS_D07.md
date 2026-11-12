# D-07 · Nomenclatura oficial de las zonas — equivalencias, responsabilidades y hallazgos

> Decisión D-07 aceptada el 12 de noviembre de 2026. **Actualización (12-nov-2026):** H-01 y H-02 quedaron **resueltos** como aclaraciones funcionales derivadas de D-07 (`ACLARACION_H01_H02_PROPIEDAD_Z5.md`; no se crea D-08). Este documento no uniforma títulos en documentos aceptados; el único cambio autorizado a 3.1 es la frase de H-01.

## 1. Nomenclatura oficial (referencia conceptual)
| Zona | Nombre oficial | Responsabilidad |
|---|---|---|
| Z1 | Qué está pasando | Comunicar qué está pasando |
| Z2 | Contexto y desempeño | Aportar contexto y desempeño |
| Z3 | Qué merece atención | Identificar qué merece atención |
| Z4 | Qué puedo hacer | Presentar qué acciones pueden realizarse |
| Z5 | Oportunidades y visión de conjunto | Integrar oportunidades y dar visión de conjunto |

## 2. Matriz de equivalencias (oficial ↔ rótulos existentes)
| Zona | Nombre oficial | 3.1 (aceptada) | 3.2 (aceptada) | 3.3–3.5 / prototipo / especificaciones | Tipo de diferencia |
|---|---|---|---|---|---|
| Z1 | Qué está pasando | «Lectura ejecutiva» (¿Cómo está? ¿Crece o se deteriora?) | «Z1 · Lectura ejecutiva» | «Lectura ejecutiva» | **Redacción**: misma responsabilidad (veredicto, estado, brecha, cierre) |
| Z2 | Contexto y desempeño | «Qué ocurrió y por qué» (qué lo impulsa; drivers, atribución, hipótesis aparte) | No la diseña (solo la deriva) | «Qué ocurrió y por qué»; «sin especificación ejecutable propia» | **Redacción + alcance**: contexto/desempeño ⊇ drivers y atribución; compatible |
| Z3 | Qué merece atención | «Qué merece atención» (hallazgo ◆, riesgo ▲, oportunidad ●; 3 de N) | — | «Qué merece atención» | **Idéntica** |
| Z4 | Qué puedo hacer | «Qué hago» (3 acciones de M) | — | «Qué hago» | **Redacción** (primera vs. segunda persona) |
| Z5 | Oportunidades y visión de conjunto | «Evidencia y detalle» (cifras, canales, confiabilidad y cobertura, qué falta, método) | — | Prototipo y `z5-conjunto.js`: «Oportunidades y visión de conjunto» (tres niveles) | **Resuelto (H-02)**: el contenido de 3.1 pasa a ser el tercer nivel, «Evidencia y detalle», desplegable |

## 3. Contradicciones reales (no solo de redacción)
| Id | Hallazgo | ¿Requiere cambio funcional o de un contrato aceptado? | Estado |
|---|---|---|---|
| **H-01** | 3.1 §3.1 establece «Una pieza vive en **una sola** capa y zona». D-07 admite que una oportunidad esté en más de una zona si cada aparición cumple una función distinta y no duplica información, impactos ni recomendaciones. | **Sí** (la frase de un documento aceptado de 3.1 queda desactualizada). Se resuelve interpretándola como «una sola **fuente** de la información y un solo importe por elemento» (ver §4); corregir su texto exige autorización específica. | **RESUELTO (12-nov-2026)**: aclaración de la frase de 3.1; ver `ACLARACION_H01_H02_PROPIEDAD_Z5.md` |
| **H-02** | La zona oficial Z5 «Oportunidades y visión de conjunto» no coincide con el Z5 aceptado de 3.1 «Evidencia y detalle». Si Z5 pasa a ser visión de conjunto, **el contenido de evidencia** (tablas de cifras y canales, confiabilidad y cobertura, qué falta, método) **no tiene hoy un lugar oficial**; y la visión de conjunto de oportunidades **no está especificada ni implementada**. | **Sí** (decidir dónde vive la evidencia o redefinir Z5 es un cambio funcional). | **RESUELTO (12-nov-2026)**: Z5 en tres niveles; evidencia desplegable dentro de Z5 (opción (a)); sin D-08 |
| H-03 | Z1, Z2 y Z4 solo difieren en el rótulo. | No | Resuelto como equivalencia (§2) |

**Resolución:** se adoptó la opción (a): la evidencia es el tercer nivel, secundario y desplegable, de Z5; no se creó una sexta zona ni se trasladó a Z2. Las advertencias críticas permanecen visibles fuera del desplegable.

## 4. Cómo interpretar la relación entre Z3 y Z5
| | Z3 · Qué merece atención | Z5 · Oportunidades y visión de conjunto |
|---|---|---|
| Función | Cada oportunidad **como elemento que merece atención**: clase ●, certeza, importe del elemento, vigencia, límites | Las oportunidades **vistas en conjunto**: cuántas hay, su relación entre ellas (alternativas, superposición), qué conocemos y qué falta, sin re-explicar cada elemento |
| Importe | **Fuente única** del importe de cada elemento | **Referencia** al elemento (por identificador); no repite ni recalcula el importe |
| Agregación | Totales por clase solo con reglas verificables (D-06); sin cifra en líneas superpuestas | Visión de conjunto **sin** consolidar impactos superpuestos; si la metodología no permite una cifra, se dice |
| Acciones | No ofrece acciones | No ofrece acciones (las acciones son de Z4, que cita el elemento) |
Regla de lectura: la misma oportunidad puede aparecer en Z3 (elemento), Z4 (acción que la cita) y Z5 (visión de conjunto) porque cada aparición responde una pregunta distinta; **no** puede aparecer con un segundo importe, ni sumarse con otra que describa el mismo dinero, ni recomendar dos veces la misma acción.

## 5. Auditoría de duplicidad y ambigüedad (ejecutada)
| Comprobación | Resultado |
|---|---|
| Oportunidades en el prototipo: Z3 y Z4 las mencionan; Z5 no | Z5 del prototipo («Evidencia y detalle») **no contiene oportunidades** (prueba T5c) |
| Importes citados en Z4 | Son **referencias idénticas** a los de Z3 (prueba T5a, 5 referencias) |
| Alternativas de recuperación | Se agregan como rango, no como suma (T5b) |
| **Defecto encontrado y corregido:** la brecha total y la del canal que la concentra son el **mismo dinero** y el total de Z3 las sumaba (−$1.4 M frente a −$723 mil de Z1) | Corregido en la derivación (ambas llevan el grupo de superposición); Z3 ya no muestra cifra en esa línea; nueva regla **C20** del detector y prueba T5d con el defecto plantado |
| Responsabilidades ambiguas | **Resueltas**: Z5 se especifica (`z5-conjunto.js`, reglas P0–P12) y presenta las oportunidades solo como referencias a Z3 |

## 6. Qué no se hizo
No se renombraron zonas en documentos aceptados ni en 3.3–3.5; no se movieron funcionalidades; no se modificó ningún contrato. Los rótulos «Lectura ejecutiva», «Qué ocurrió y por qué», «Qué hago» y «Evidencia y detalle» se interpretan con la tabla del §2 hasta que decidas H-01 y H-02.
