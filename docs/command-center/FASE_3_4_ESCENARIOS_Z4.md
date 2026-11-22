# Escenarios de Z4 — Qué hago (Subfase 3.4)

Generado por `node tools/audit/z34-generar-artefactos.js` desde la especificación ejecutable (`tools/audit/z4-acciones.js`) y los 14 escenarios (`tools/audit/z4-escenarios.js`). **No editar a mano.** Las acciones candidatas imitan el formato que hoy emiten los motores; **todo es ilustrativo (datos simulados)**, sin datos reales de FESA. El formato de acción candidata es una propuesta de diseño, no un contrato aceptado de Fase 2.

## Escenario 1 — Acciones para las tres clases con confiabilidad alta

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 3 de 5 · «Ver todas»: Ver todas (5) |
| **Orden mostrado** | Revisar: «Revisar el pronóstico de cierre» → Pronóstico<br>Evaluar una alternativa: «Evaluar las alternativas de recuperación» → Recuperación<br>Revisar: «Ver el diagnóstico de la brecha» → Diagnóstico de brecha<br>Revisar: «Abrir el detalle de Ecommerce» → Segmentos<br>Comprobar: «Comparar el embudo de conversión por semana» → Embudo |
| **Quién la motiva** | «Revisar el pronóstico de cierre» ← ▲ El cierre proyectado queda por debajo de (Estimación)<br>«Evaluar las alternativas de recuperación» ← ● Recuperar la brecha elevando la conversi (Estimación) + ● Recuperar la brecha elevando las sesione (Estimación)<br>«Ver el diagnóstico de la brecha» ← ◆ La venta acumulada está por debajo del p (Cálculo)<br>«Abrir el detalle de Ecommerce» ← ◆ Ecommerce concentra la brecha (Cálculo)<br>«Comparar el embudo de conversión por semana» ← ◆ La conversión explica la mayor parte de  (Contribución matemática) |
| **Importe citado (del elemento, sin sumar)** | Venta en riesgo −$723 mil<br>Venta recuperable $723 mil / Venta recuperable $760 mil<br>Brecha observada −$723 mil<br>Brecha observada −$650 mil |
| **Retenidas por confiabilidad** | Ninguna |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | — |

## Escenario 2 — Las mismas acciones con confiabilidad media

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Media → modo «completo» |
| **Cabecera** | 3 de 5 · «Ver todas»: Ver todas (5) |
| **Orden mostrado** | Revisar: «Revisar el pronóstico de cierre» → Pronóstico<br>Evaluar una alternativa: «Evaluar las alternativas de recuperación» → Recuperación<br>Revisar: «Ver el diagnóstico de la brecha» → Diagnóstico de brecha<br>Revisar: «Abrir el detalle de Ecommerce» → Segmentos<br>Comprobar: «Comparar el embudo de conversión por semana» → Embudo |
| **Quién la motiva** | «Revisar el pronóstico de cierre» ← ▲ El cierre proyectado queda por debajo de (Estimación)<br>«Evaluar las alternativas de recuperación» ← ● Recuperar la brecha elevando la conversi (Estimación) + ● Recuperar la brecha elevando las sesione (Estimación)<br>«Ver el diagnóstico de la brecha» ← ◆ La venta acumulada está por debajo del p (Cálculo)<br>«Abrir el detalle de Ecommerce» ← ◆ Ecommerce concentra la brecha (Cálculo)<br>«Comparar el embudo de conversión por semana» ← ◆ La conversión explica la mayor parte de  (Contribución matemática) |
| **Importe citado (del elemento, sin sumar)** | Venta en riesgo −$723 mil<br>Venta recuperable $723 mil / Venta recuperable $760 mil<br>Brecha observada −$723 mil<br>Brecha observada −$650 mil |
| **Retenidas por confiabilidad** | Ninguna |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | — |

## Escenario 3 — Confiabilidad baja: primero los datos

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Baja → modo «datos_primero» |
| **Cabecera** | 3 de 3 · «Ver todas»: no aparece |
| **Orden mostrado** | Completar o corregir datos: «Corregir las filas rechazadas de la carga» → Calidad<br>Revisar: «Ver el diagnóstico de la brecha» → Diagnóstico de brecha<br>Revisar: «Abrir el detalle de Ecommerce» → Segmentos |
| **Quién la motiva** | «Corregir las filas rechazadas de la carga» ← dato que falta: Corregir las filas rechazadas de la carga<br>«Ver el diagnóstico de la brecha» ← ◆ La venta acumulada está por debajo del p (Cálculo)<br>«Abrir el detalle de Ecommerce» ← ◆ Ecommerce concentra la brecha (Cálculo) |
| **Importe citado (del elemento, sin sumar)** | Brecha observada −$723 mil<br>Brecha observada −$650 mil |
| **Retenidas por confiabilidad** | 3 recomendaciones no se presentan porque la confiabilidad de la lectura no las sustenta. |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | — |

## Escenario 4 — Confiabilidad insuficiente: solo acciones de datos

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Insuficiente → modo «solo_datos» |
| **Cabecera** | 2 de 2 · «Ver todas»: no aparece |
| **Orden mostrado** | Completar o corregir datos: «Definir la meta anual» → Metas<br>Completar o corregir datos: «Revisar los avisos de calidad de la carga» → Calidad |
| **Quién la motiva** | «Definir la meta anual» ← ◆ Falta la meta anual definida (Hecho)<br>«Revisar los avisos de calidad de la carga» ← ◆ Los datos traen avisos de calidad (Hecho) |
| **Importe citado (del elemento, sin sumar)** | Ninguno |
| **Retenidas por confiabilidad** | 2 recomendaciones no se presentan porque la confiabilidad de la lectura no las sustenta. |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | — |

## Escenario 5 — Sin elementos y sin acciones

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | No hay acciones que destacar en este periodo · «Ver todas»: no aparece |
| **Orden mostrado** | — |
| **Quién la motiva** | — |
| **Importe citado (del elemento, sin sumar)** | Ninguno |
| **Retenidas por confiabilidad** | Ninguna |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | No hay acciones que destacar en este periodo |

## Escenario 6 — Sin acciones: se dice qué dato falta

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Insuficiente → modo «solo_datos» |
| **Cabecera** | Qué dato falta · «Ver todas»: no aparece |
| **Orden mostrado** | — |
| **Quién la motiva** | — |
| **Importe citado (del elemento, sin sumar)** | Ninguno |
| **Retenidas por confiabilidad** | Ninguna |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | Qué dato falta |

## Escenario 7 — Lectura preliminar sin acciones ni requisitos

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Baja → modo «datos_primero» |
| **Cabecera** | No hay acciones que recomendar con la confiabilidad actual · «Ver todas»: no aparece |
| **Orden mostrado** | — |
| **Quién la motiva** | — |
| **Importe citado (del elemento, sin sumar)** | Ninguno |
| **Retenidas por confiabilidad** | 1 recomendación no se presenta porque la confiabilidad de la lectura no las sustenta. |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | No hay acciones que recomendar con la confiabilidad actual |

## Escenario 8 — Recomendaciones genéricas, sin motivo, con importe, causales o de asignación no se muestran

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 1 de 1 · «Ver todas»: no aparece |
| **Orden mostrado** | Revisar: «Ver el diagnóstico de la brecha» → Diagnóstico de brecha |
| **Quién la motiva** | «Ver el diagnóstico de la brecha» ← ◆ La venta acumulada está por debajo del p (Cálculo) |
| **Importe citado (del elemento, sin sumar)** | Brecha observada −$723 mil |
| **Retenidas por confiabilidad** | Ninguna |
| **Rechazadas** | a:generica: Recomendación genérica: no dice qué hacer ni dónde.<br>a:sin-motivo: Una recomendación debe citar al menos un hallazgo, riesgo u oportunidad que la motive.<br>a:importe: El texto de la acción no lleva importes (el impacto es el del elemento que la motiva).<br>a:amount: Una acción no tiene importe propio: el impacto es el del elemento que la motiva (evita doble conteo).<br>a:causal: Una recomendación no afirma causas.<br>a:asignada: La acción no puede asignar responsables, fechas ni estatus (gestión de tareas fuera de alcance).<br>a:hip-decidir: Se apoya en una señal o hipótesis: solo puede recomendarse comprobarla, no decidir sobre ella. |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | — |

## Escenario 9 — Los campos de responsable, fecha y estatus se ignoran

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 1 de 1 · «Ver todas»: no aparece |
| **Orden mostrado** | Revisar: «Ver el diagnóstico de la brecha» → Diagnóstico de brecha |
| **Quién la motiva** | «Ver el diagnóstico de la brecha» ← ◆ La venta acumulada está por debajo del p (Cálculo) |
| **Importe citado (del elemento, sin sumar)** | Brecha observada −$723 mil |
| **Retenidas por confiabilidad** | Ninguna |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | a:tarea: owner, dueDate, status |
| **Sin acciones** | — |

## Escenario 10 — Una acción cuyo motivo no está a la vista no se muestra

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 1 de 1 · «Ver todas»: no aparece |
| **Orden mostrado** | Revisar: «Ver el diagnóstico de la brecha» → Diagnóstico de brecha |
| **Quién la motiva** | «Ver el diagnóstico de la brecha» ← ◆ La venta acumulada está por debajo del p (Cálculo) |
| **Importe citado (del elemento, sin sumar)** | Brecha observada −$723 mil |
| **Retenidas por confiabilidad** | Ninguna |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | a:huerfana |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | — |

## Escenario 11 — La misma acción propuesta por dos motores es una sola

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 1 de 1 · «Ver todas»: no aparece |
| **Orden mostrado** | Revisar: «Ver el diagnóstico de la brecha» → Diagnóstico de brecha |
| **Quién la motiva** | «Ver el diagnóstico de la brecha» ← ◆ La venta acumulada está por debajo del p (Cálculo) |
| **Importe citado (del elemento, sin sumar)** | Brecha observada −$723 mil |
| **Retenidas por confiabilidad** | Ninguna |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | — |

## Escenario 12 — Una acción apoyada en una hipótesis es una comprobación

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 2 de 2 · «Ver todas»: no aparece |
| **Orden mostrado** | Revisar: «Ver el diagnóstico de la brecha» → Diagnóstico de brecha<br>Comprobar: «Comprobar la conversión de App con dos semanas más» → Segmentos |
| **Quién la motiva** | «Ver el diagnóstico de la brecha» ← ◆ La venta acumulada está por debajo del p (Cálculo)<br>«Comprobar la conversión de App con dos semanas más» ← ▲ La conversión de App podría estar deteri (Hipótesis) |
| **Importe citado (del elemento, sin sumar)** | Brecha observada −$723 mil |
| **Retenidas por confiabilidad** | Ninguna |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | — |

## Escenario 13 — La acción sobre los datos va antes que las demás

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Media → modo «completo» |
| **Cabecera** | 3 de 3 · «Ver todas»: no aparece |
| **Orden mostrado** | Completar o corregir datos: «Definir la meta anual» → Metas<br>Revisar: «Revisar el pronóstico de cierre» → Pronóstico<br>Revisar: «Ver el diagnóstico de la brecha» → Diagnóstico de brecha |
| **Quién la motiva** | «Definir la meta anual» ← ◆ Falta la meta anual definida (Hecho)<br>«Revisar el pronóstico de cierre» ← ▲ El cierre proyectado queda por debajo de (Estimación)<br>«Ver el diagnóstico de la brecha» ← ◆ La venta acumulada está por debajo del p (Cálculo) |
| **Importe citado (del elemento, sin sumar)** | Venta en riesgo −$723 mil<br>Brecha observada −$723 mil |
| **Retenidas por confiabilidad** | Ninguna |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | — |

## Escenario 14 — Dos acciones sobre el mismo elemento citan el mismo importe y no lo suman

*Comparación con lo esperado:* coincide con el comportamiento esperado.

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 2 de 2 · «Ver todas»: no aparece |
| **Orden mostrado** | Revisar: «Ver el diagnóstico de la brecha» → Diagnóstico de brecha<br>Revisar: «Abrir el cumplimiento por canal» → Canales |
| **Quién la motiva** | «Ver el diagnóstico de la brecha» ← ◆ La venta acumulada está por debajo del p (Cálculo)<br>«Abrir el cumplimiento por canal» ← ◆ La venta acumulada está por debajo del p (Cálculo) |
| **Importe citado (del elemento, sin sumar)** | Brecha observada −$723 mil<br>Brecha observada −$723 mil |
| **Retenidas por confiabilidad** | Ninguna |
| **Rechazadas** | Ninguna |
| **Sin elemento a la vista** | Ninguna |
| **Campos de tarea ignorados** | Ninguno |
| **Sin acciones** | — |
