# Fase 3 · Subfase 3.4 — Prioridades y recomendaciones (Z4 · Qué hago)

**Estado:** ACEPTADA CON LIMITACIONES DOCUMENTADAS (aceptación formal comunicada por el usuario el 12-nov-2026). Es un diseño y una especificación funcional: no está integrado en la aplicación real ni validado con usuarios, móviles reales, lectores de pantalla ni datos reales de FESA.
**Alcance:** exclusivamente el diseño UX de **Z4 · Qué hago** del Home inteligente, dentro de la arquitectura aceptada en 3.1 y de la decisión D-03. Consume la salida de Z3 (3.3). No diseña el prototipo (3.5), no genera recomendaciones con IA (5.4) ni define el criterio definitivo de priorización (4.4). No cambia código, motores, contratos ni documentos aceptados. **RGT Execution OS queda fuera:** sin responsables, fechas límite, estatus ni gestión de tareas.
**Autorización:** el usuario autorizó ejecutar 3.3, 3.4 y 3.5 de forma continua; no autorizó las Fases 4, 5 ni 6.
**Base:** rama `ccr-a81af632-rirtu7`, commit base `a2b3863`, cambios previos sin confirmar (no se tocaron).

**Numeración.** Secciones §0 a §16. Los requisitos de Z4 son **Z4-01 a Z4-13**. Los escenarios son **1 a 14**. Las reglas de texto de las acciones son **A1 a A7**. Las filas de la matriz de 3.1 son **M01 a M33**.
**Diseño propuesto y datos.** Todo lo de este documento y de `wireframes/z4_3_4_wireframe.html` es **diseño propuesto**, de baja fidelidad; las acciones y elementos de los escenarios son **simulados**, con el formato que hoy emiten los motores. **El formato de acción candidata es una propuesta de diseño, no un contrato aceptado de Fase 2.**
**Etiquetas de evidencia:** **Verificado**, **Reportado**, **Documentado** y **Pendiente de validación real**, como en 3.3.

**Documentos y artefactos de la subfase**
| Archivo | Qué es |
|---|---|
| `FASE_3_4_PRIORIDADES_RECOMENDACIONES.md` | Este documento |
| `FASE_3_4_ESCENARIOS_Z4.md` | Detalle de los 14 escenarios (generado; no se edita a mano) |
| `MATRIZ_TRAZABILIDAD_Z4.md` | Matriz de trazabilidad de Z4 (generada desde su JSON) |
| `wireframes/z4_3_4_wireframe.html` | Wireframe de Z4: tipos, escritorio, tableta, móvil, 14 escenarios y prueba de legibilidad |
| `wireframes/capturas_3_4/` | 20 capturas de evidencia |
| `tools/audit/z4-acciones.js`, `z4-escenarios.js` | Especificación **ejecutable** de Z4 y sus 14 escenarios (no es código de la aplicación) |

---

## 0. Estado de partida y qué se hereda
3.1 §7.4 fijó: hasta tres acciones destacadas, cada una cita el hallazgo, riesgo u oportunidad que la motiva, **sin recomendaciones genéricas** y, si no hay base, «qué dato falta»; D-03: «3 de M» y «Ver todas». Hoy los motores ya emiten pasos de acción (`attentionEngine.next` con `step`, `guide.nextStep`, `actionPriorityEngine`, `recoveryEngine`) **sin vínculo explícito al hallazgo que los motiva** (**Verificado** en `js/analytics/attentionEngine.js` y la matriz de 3.1, M19 y M30).

## 1. Objetivo y principios UX
**Objetivo.** Que el usuario sepa **qué hacer a continuación y por qué**, sin recomendaciones vacías, y sin que Z4 se convierta en un gestor de tareas.
1. **Una acción es una recomendación**, nunca un hecho ni una conclusión (nivel «acción» de la escalera de Fase 2).
2. **Siempre dice por qué:** cita el elemento de Z3 que la motiva, con su certeza (§4).
3. **Sin importe propio:** el impacto es el del elemento citado, rotulado como suyo (§5).
4. **Los datos primero** cuando la confiabilidad no permite concluir (§6).
5. **Proporcionada a la certeza:** sobre una señal o hipótesis solo se recomienda **comprobar** (§7).
6. **Sin gestión de tareas:** responsables, fechas y estatus se descartan (§8).
7. **Sin base, se dice qué dato falta;** nunca se inventa una recomendación (§9).

## 2. Arquitectura de Z4
```
Z4 ─ Qué hago ───────────────────────────────────────────────────────  «3 de M»
 Aviso de la lectura (si la confiabilidad limita las recomendaciones)
 Filtros por tipo:  Todas · Completar o corregir datos · Revisar · Comprobar · Evaluar una alternativa
 Tres tarjetas:  [tipo]  acción · por qué · Motivada por ◆▲● elemento (certeza, respaldo) + importe DEL ELEMENTO · [Ir a: destino ▸]
 «Ver todas (M)»  → el resto
 Nota de recomendaciones retenidas por confiabilidad
 Sin acciones: «Qué dato falta» o «No hay acciones que destacar»
```
## 3. Tipos de acción y orden
| Tipo | Nombre visible | Qué significa |
|---|---|---|
| `datos` | Completar o corregir datos | Sin este dato no se puede concluir: va antes que cualquier recomendación. |
| `revisar` | Revisar | Abrir el detalle de algo observado o calculado. |
| `investigar` | Comprobar | Validar una señal o una hipótesis antes de decidir. |
| `decidir` | Evaluar una alternativa | Comparar alternativas estimadas; la decisión es del responsable del negocio. |
**Los tipos se derivan de los pasos que ya emiten los motores** (`complete_data` y `fix_quality` → datos; `review_*` → revisar; `investigate_*` → comprobar; recuperación → evaluar): no se inventa vocabulario. **Orden:** (1) las acciones de datos van primero; (2) después, el orden del elemento de Z3 que motiva la acción (urgencia → confiabilidad → impacto, ya resuelto en 3.3); (3) dentro del mismo elemento: revisar, comprobar y evaluar. **El criterio definitivo de priorización corresponde a 4.4.** La misma acción propuesta por dos motores (mismo tipo, destino y motivos) es **una sola** y conserva el origen de cada una.

## 4. Cada acción cita su motivo
Una acción **solo se muestra** si el elemento que la motiva **está a la vista en Z3**. Si ese elemento está retenido por confiabilidad, la acción se retiene; si no existe, no se muestra (queda registrada). Una acción de datos puede citar el faltante de datos o un requisito de «qué falta». La tarjeta muestra el elemento (clase, título, certeza, respaldo) y un botón «Ir a: destino» hacia un lugar concreto de la aplicación.

## 5. Economía: sin doble conteo
Una acción **no tiene importe propio**. Si el elemento citado trae impacto, la tarjeta lo muestra con su rótulo y procedencia y dice «no es un importe de la acción y no se suma». Dos acciones sobre el mismo elemento citan el mismo importe; ninguna suma. Si el importe citado es una estimación, la tarjeta lo rotula.

## 6. La confiabilidad condiciona lo que se recomienda (aclaración B)
| Confiabilidad de la lectura | Modo de Z4 | Qué recomienda | Qué se retiene |
|---|---|---|---|
| **Alta** o **Media** | Completo | Todos los tipos | Nada |
| **Baja** | Datos primero | Datos y revisión de lo observado; aviso «Lectura preliminar» | Comprobar y evaluar alternativas |
| **Insuficiente** | Solo datos | Solo acciones sobre los datos | Todo lo demás |

## 7. Certeza: comprobar, no decidir
Una acción apoyada en una **señal o hipótesis** solo puede ser una **comprobación** (se redacta «comprobar, validar, verificar, confirmar o comparar») y va rotulada «Se apoya en una señal o hipótesis: es una comprobación, no una decisión». Una **estimación** sí puede sustentar «evaluar alternativas» (con su rótulo de estimación); la decisión final es del responsable del negocio.

## 8. Fuera de alcance: gestión de tareas
Responsable, fecha límite, estatus y avance **no existen** en Z4: si una acción candidata los trae, se descartan y se informa cuáles. El texto de una acción tampoco puede asignar, fechar ni dar estatus. Esto mantiene a **RGT Execution OS fuera del proyecto**.

## 9. Estados
| Estado | Comportamiento |
|---|---|
| Sin acciones y falta un dato | «Qué dato falta» con los requisitos y su destino |
| Sin acciones y la confiabilidad limita | «No hay acciones que recomendar con la confiabilidad actual» |
| Sin acciones y todo en orden | «No hay acciones que destacar en este periodo» |
| Acción retenida | Nota con su conteo y la razón |
| Acción rechazada (genérica, sin motivo, con importe, causal, de asignación) | No se muestra; queda registrada con su motivo |

## 10. Reglas de texto de las acciones (A1–A7, ejecutables en `checkActionText`)
| Regla | Contenido |
|---|---|
| A1 | Sin utilidad, ganancia, beneficio, rentabilidad, ROI, ROAS ni CAC. |
| A2 | Sin recomendaciones genéricas («mejorar las ventas», «tomar acciones», «dar seguimiento»). |
| A3 | Una recomendación no afirma causas. |
| A4 | Sin responsables, fechas límite ni estatus de ejecución (gestión de tareas fuera de alcance). |
| A5 | El texto de la acción no lleva importes. |
| A6 | Máximo 14 palabras. |
| A7 | Una acción apoyada en una señal o hipótesis se redacta como comprobación, no como decisión ni como hecho. |

**Ejemplos incorrectos** (cada uno infringe exactamente las reglas indicadas; lo comprueba `tools/test-fase3-4-z4.js`):
| Id | Texto de la acción | Reglas que infringe |
|---|---|---|
| Y1 | Mejorar las ventas | A2 |
| Y2 | Corregir el checkout porque provocó la caída | A3 |
| Y3 | Asignar al responsable de Ecommerce la revisión | A4 |
| Y4 | Recuperar $722 mil con la conversión | A5 |
| Y5 | Revisar el ROAS de las campañas de App | A1 |
| Y6 | Abrir el detalle de Ecommerce, comparar el cumplimiento de cada canal contra su plan y revisar también todas las alertas del resto del negocio | A6 |
| Y7 | Aumentar el presupuesto de App | A7 |
| Y8 | Tomar acciones sobre la utilidad de Ecommerce | A1, A2 |

## 11. Escenarios
Los 14 escenarios están diseñados, representados en el wireframe y documentados uno a uno en `FASE_3_4_ESCENARIOS_Z4.md`. **Origen: simulados.**

| # | Escenario | Confiabilidad de la lectura | Modo | Cabecera | Orden mostrado | Retenidas | Rechazadas |
|---|---|---|---|---|---|---|---|
| 1 | Acciones para las tres clases con confiabilidad alta | Alta | completo | 3 de 5 | a:cierre, a:rec, a:gap, a:canal, a:driver | 0 | 0 |
| 2 | Las mismas acciones con confiabilidad media | Media | completo | 3 de 5 | a:cierre, a:rec, a:gap, a:canal, a:driver | 0 | 0 |
| 3 | Confiabilidad baja: primero los datos | Baja | datos_primero | 3 de 3 | a:filas, a:gap, a:canal | 3 | 0 |
| 4 | Confiabilidad insuficiente: solo acciones de datos | Insuficiente | solo_datos | 2 de 2 | a:meta, a:calidad | 2 | 0 |
| 5 | Sin elementos y sin acciones | Alta | completo | vacio | — | 0 | 0 |
| 6 | Sin acciones: se dice qué dato falta | Insuficiente | solo_datos | que_falta | — | 0 | 0 |
| 7 | Lectura preliminar sin acciones ni requisitos | Baja | datos_primero | sin_base | — | 1 | 0 |
| 8 | Recomendaciones genéricas, sin motivo, con importe, causales o de asignación no se muestran | Alta | completo | 1 de 1 | a:gap | 0 | 7 |
| 9 | Los campos de responsable, fecha y estatus se ignoran | Alta | completo | 1 de 1 | a:tarea | 0 | 0 |
| 10 | Una acción cuyo motivo no está a la vista no se muestra | Alta | completo | 1 de 1 | a:gap | 0 | 0 |
| 11 | La misma acción propuesta por dos motores es una sola | Alta | completo | 1 de 1 | a:gap | 0 | 0 |
| 12 | Una acción apoyada en una hipótesis es una comprobación | Alta | completo | 2 de 2 | a:gap, a:hip | 0 | 0 |
| 13 | La acción sobre los datos va antes que las demás | Media | completo | 3 de 3 | a:meta, a:cierre, a:gap | 0 | 0 |
| 14 | Dos acciones sobre el mismo elemento citan el mismo importe y no lo suman | Alta | completo | 2 de 2 | a:gap, a:gap-canales | 0 | 0 |

## 12. Diseño responsive
| | Escritorio ≥ 1025 px | Tableta 600–1024 px | Móvil < 600 px |
|---|---|---|---|
| Tarjetas | 3 columnas | 2 columnas | 1 columna |
| Orden | Aviso → filtros → acciones → «Ver todas» → retenidas | Igual | **Mismo orden** |
| Nunca se ocultan | Tipo, acción, motivo con su certeza, importe del elemento rotulado, destino | Igual | Igual |
Verificado con una prueba de legibilidad en los tres anchos (`F33.Z4.9`); **Chromium emulado, no un dispositivo real (Pendiente de validación real).**

## 13. Matriz de trazabilidad y dependencias
`MATRIZ_TRAZABILIDAD_Z4.md` conecta cada requisito con su decisión, componente, fuente, motor, estado, evidencia y dependencia. **13 requisitos: 2 Disponible, 5 Parcial, 6 Por desarrollar.**
**Dependencias por categoría** (ninguna se implementa aquí):
- **contratos_existentes** — Resoluble con contratos y motores existentes: solo falta conectar y presentar. (1): Z4-02 (Fase 4.4).
- **completar_motores** — Requiere completar o ampliar un motor (Fase 4) antes de poder mostrarse. (10): Z4-01 (Fase 4.4); Z4-03 (Fase 4.4); Z4-05 (Fase 4.4); Z4-06 (Fase 4.2); Z4-07 (Fase 4.4); Z4-08 (Fase 4.4); Z4-09 (Fase 4.5); Z4-10 (Fase 4.4); Z4-11 (Fase 4.4); Z4-13 (Fase 4.4).
- **requiere_ia** — Requiere inteligencia artificial (Fase 5) para su versión final; existe una versión determinista de respaldo. (1): Z4-07 (Fase 5.4).
- **validacion_produccion** — Requiere validación con datos y usuarios de producción (umbrales y supuestos de la especificación). (1): Z4-08 (Fase 4.4).

## 14. Verificación y evidencia
| Prueba | Tipo | Qué verifica |
|---|---|---|
| `tools/test-fase3-4-z4.js` | Lógica y especificación, **datos simulados** | 14 escenarios; 20 invariantes sobre 2 000 conjuntos aleatorios; 6 propiedades metamórficas; ejemplos de texto incorrecto; 8 acciones inválidas; 21 mutaciones |
| `tools/regression/batch_fase3_3_3_4_zonas.py` | Navegador emulado e integración con rutas reales | Matriz contra la aplicación; wireframe a tres anchos; capturas |
| `tools/audit/verificar_consistencia_3_4.py` | Consistencia documental con oráculo independiente | Documento, matriz, escenarios generados, wireframe y `ESTADO.md` |
**Ninguna usa datos reales de FESA.** **Pendiente de validación real:** que las recomendaciones se entiendan y se consideren útiles; la frecuencia real de cada tipo de acción; el criterio de orden con usuarios.

## 15. Limitaciones, riesgos y decisiones propias
**Limitaciones:** el formato de acción candidata y su vínculo al elemento son una propuesta (los motores no lo traen hoy); sin IA (5.4); criterio cualitativo (4.4); datos simulados.
**Riesgos:** (1) retener recomendaciones con confiabilidad baja puede dejar al usuario sin guía clara si los datos tardan en corregirse; (2) la regla «comprobar, no decidir» puede parecer conservadora; (3) acciones que dependen de un elemento retenido desaparecen sin que el usuario lo vea salvo por la nota.
**Decisiones propias:** el vocabulario de tipos y su orden; retener «comprobar» y «evaluar» con confiabilidad Baja; redactar como comprobación toda acción sobre una señal o hipótesis; descartar campos de tarea en lugar de rechazar la acción.

## 16. Relación con el roadmap
3.4 queda **completada con limitaciones documentadas, pendiente de aceptación formal**; continúa 3.5 por autorización expresa. Las Fases 4, 5 y 6 permanecen NO INICIADAS. No se modificó ningún documento aceptado ni código de la aplicación.
