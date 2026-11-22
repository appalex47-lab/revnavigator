# Escenarios de Z3 — Qué merece atención (Subfase 3.3)

Generado por `node tools/audit/z34-generar-artefactos.js` desde la especificación ejecutable (`tools/audit/z3-atencion.js`) y los 14 escenarios (`tools/audit/z3-escenarios.js`). **No editar a mano.** Los hallazgos se construyen con el contrato `cc.finding` de Fase 2 y los impactos con `makeImpact` de `js/economics/impactModel.js`. **Todo es ilustrativo (datos simulados):** ninguna cifra proviene de datos reales de FESA; las de brecha y cierre del catálogo base son las del motor con datos de demostración desviados.

## Escenario 1 — Las tres clases con confiabilidad alta

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 3 de 7 · «Ver todos»: Ver todos (7) |
| **Destacados** | ▲ Riesgo · Crítica · Estimación (respaldo alto): «El cierre proyectado queda por debajo de la meta»<br>● Oportunidad · Importante · Estimación (respaldo alto): «Recuperar la brecha elevando las sesiones»<br>◆ Hallazgo · Importante · Cálculo (respaldo alto): «La venta acumulada está por debajo del plan» |
| **Resto del universo** | ● Recuperar la brecha elevando la conversión; ◆ Ecommerce concentra la brecha; ● Escenario de mayor ticket promedio; ◆ La conversión explica la mayor parte de la brecha |
| **Impacto por elemento** | ▲ El cierre proyectado queda por debajo de: Venta en riesgo −$723 mil (proyectado, estimación); Margen no configurado · Configurar<br>● Recuperar la brecha elevando las sesione: Venta recuperable $760 mil (proyectado, estimación); Margen no configurado · Configurar<br>◆ La venta acumulada está por debajo del p: Brecha observada −$723 mil (observado); Margen no configurado · Configurar<br>● Recuperar la brecha elevando la conversi: Venta recuperable $723 mil (proyectado, estimación); Margen no configurado · Configurar<br>◆ Ecommerce concentra la brecha: Brecha observada −$650 mil (observado); Margen no configurado · Configurar<br>● Escenario de mayor ticket promedio: Venta potencial (teórica) $1.2 M (proyectado, estimación); Margen no configurado · Configurar<br>◆ La conversión explica la mayor parte de : no aplica |
| **Totales por clase** | hallazgo: Brecha observada (no se totaliza: mismo dinero); riesgo: Venta en riesgo −$723 mil; oportunidad: Venta recuperable $723 mil a $760 mil (rango), Venta potencial (teórica) $1.2 M |
| **Retenido por confiabilidad** | Nada |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | No se muestra |
| **Aviso / vacío** | — |

## Escenario 2 — Las tres clases con confiabilidad media

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Media → modo «completo» |
| **Cabecera** | 3 de 7 · «Ver todos»: Ver todos (7) |
| **Destacados** | ▲ Riesgo · Crítica · Estimación (respaldo alto): «El cierre proyectado queda por debajo de la meta»<br>● Oportunidad · Importante · Estimación (respaldo alto): «Recuperar la brecha elevando las sesiones»<br>◆ Hallazgo · Importante · Cálculo (respaldo alto): «La venta acumulada está por debajo del plan» |
| **Resto del universo** | ● Recuperar la brecha elevando la conversión; ◆ Ecommerce concentra la brecha; ● Escenario de mayor ticket promedio; ◆ La conversión explica la mayor parte de la brecha |
| **Impacto por elemento** | ▲ El cierre proyectado queda por debajo de: Venta en riesgo −$723 mil (proyectado, estimación); Margen no configurado · Configurar<br>● Recuperar la brecha elevando las sesione: Venta recuperable $760 mil (proyectado, estimación); Margen no configurado · Configurar<br>◆ La venta acumulada está por debajo del p: Brecha observada −$723 mil (observado); Margen no configurado · Configurar<br>● Recuperar la brecha elevando la conversi: Venta recuperable $723 mil (proyectado, estimación); Margen no configurado · Configurar<br>◆ Ecommerce concentra la brecha: Brecha observada −$650 mil (observado); Margen no configurado · Configurar<br>● Escenario de mayor ticket promedio: Venta potencial (teórica) $1.2 M (proyectado, estimación); Margen no configurado · Configurar<br>◆ La conversión explica la mayor parte de : no aplica |
| **Totales por clase** | hallazgo: Brecha observada (no se totaliza: mismo dinero); riesgo: Venta en riesgo −$723 mil; oportunidad: Venta recuperable $723 mil a $760 mil (rango), Venta potencial (teórica) $1.2 M |
| **Retenido por confiabilidad** | Nada |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | No se muestra |
| **Aviso / vacío** | — |

## Escenario 3 — Confiabilidad baja: solo lo observado

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Baja → modo «solo_observado» |
| **Cabecera** | 3 de 3 · «Ver todos»: no aparece |
| **Destacados** | ◆ Hallazgo · Importante · Cálculo (respaldo alto): «La venta acumulada está por debajo del plan»<br>◆ Hallazgo · Importante · Cálculo (respaldo alto): «Ecommerce concentra la brecha»<br>◆ Hallazgo · Seguimiento · Contribución matemática (respaldo alto): «La conversión explica la mayor parte de la brecha» |
| **Resto del universo** | — |
| **Impacto por elemento** | ◆ La venta acumulada está por debajo del p: Brecha observada −$723 mil (observado); Margen no configurado · Configurar<br>◆ Ecommerce concentra la brecha: Brecha observada −$650 mil (observado); Margen no configurado · Configurar<br>◆ La conversión explica la mayor parte de : no aplica |
| **Totales por clase** | No hay totales |
| **Retenido por confiabilidad** | 4 (1 riesgo, 3 oportunidad): 4 elementos no se presentan porque la confiabilidad de la lectura no permite sostener conclusiones. |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | Corregir las filas rechazadas de la carga |
| **Aviso / vacío** | Lectura preliminar: se muestran solo los hechos y cálculos observados. Los riesgos y las oportunidades no se presentan hasta corregir los datos. |

## Escenario 4 — Confiabilidad insuficiente: solo los datos que faltan

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Insuficiente → modo «solo_datos» |
| **Cabecera** | 2 de 2 · «Ver todos»: no aparece |
| **Destacados** | ◆ Hallazgo · Crítica · Hecho (respaldo alto): «Falta la meta anual definida»<br>◆ Hallazgo · Seguimiento · Hecho (respaldo alto): «Los datos traen avisos de calidad» |
| **Resto del universo** | — |
| **Impacto por elemento** | ◆ Falta la meta anual definida: no aplica<br>◆ Los datos traen avisos de calidad: no aplica |
| **Totales por clase** | No hay totales |
| **Retenido por confiabilidad** | 7 (3 hallazgo, 1 riesgo, 3 oportunidad): 7 elementos no se presentan porque la confiabilidad de la lectura no permite sostener conclusiones. |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | Definir la meta anual |
| **Aviso / vacío** | Con la información disponible no se emiten hallazgos, riesgos ni oportunidades del negocio: solo lo que falta en los datos. |

## Escenario 5 — Sin elementos que destacar

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | — · «Ver todos»: no aparece |
| **Destacados** | — |
| **Resto del universo** | — |
| **Impacto por elemento** | — |
| **Totales por clase** | No hay totales |
| **Retenido por confiabilidad** | Nada |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | No se muestra |
| **Aviso / vacío** | No hay hallazgos, riesgos ni oportunidades que destacar en este periodo. |

## Escenario 6 — La portada no se llena con una sola clase

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 3 de 5 · «Ver todos»: Ver todos (5) |
| **Destacados** | ◆ Hallazgo · Importante · Cálculo (respaldo alto): «La venta acumulada está por debajo del plan»<br>◆ Hallazgo · Importante · Cálculo (respaldo alto): «Ecommerce concentra la brecha»<br>▲ Riesgo · Importante · Estimación (respaldo alto): «El cierre proyectado queda por debajo de la meta» |
| **Resto del universo** | ◆ App queda por debajo de su plan; ◆ WhatsApp queda por debajo de su plan |
| **Impacto por elemento** | ◆ La venta acumulada está por debajo del p: Brecha observada −$723 mil (observado); Margen no configurado · Configurar<br>◆ Ecommerce concentra la brecha: Brecha observada −$650 mil (observado); Margen no configurado · Configurar<br>◆ App queda por debajo de su plan: Brecha observada −$400 mil (observado); Margen no configurado · Configurar<br>◆ WhatsApp queda por debajo de su plan: Brecha observada −$300 mil (observado); Margen no configurado · Configurar<br>▲ El cierre proyectado queda por debajo de: Venta en riesgo −$100 mil (proyectado, estimación); Margen no configurado · Configurar |
| **Totales por clase** | hallazgo: Brecha observada (no se totaliza: mismo dinero); riesgo: Venta en riesgo −$100 mil |
| **Retenido por confiabilidad** | Nada |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | No se muestra |
| **Aviso / vacío** | — |

## Escenario 7 — Un elemento con respaldo bajo no desplaza a uno mejor sustentado

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 3 de 3 · «Ver todos»: no aparece |
| **Destacados** | ◆ Hallazgo · Importante · Cálculo (respaldo alto): «La venta acumulada está por debajo del plan»<br>● Oportunidad · Importante · Estimación (respaldo bajo): «Recuperar la brecha elevando las sesiones»<br>▲ Riesgo · Importante · Hipótesis (respaldo bajo): «La conversión de App podría estar deteriorándose» |
| **Resto del universo** | — |
| **Impacto por elemento** | ◆ La venta acumulada está por debajo del p: Brecha observada −$723 mil (observado); Margen no configurado · Configurar<br>● Recuperar la brecha elevando las sesione: Venta recuperable $5.0 M (proyectado, estimación); Margen no configurado · Configurar<br>▲ La conversión de App podría estar deteri: no aplica |
| **Totales por clase** | hallazgo: Brecha observada −$723 mil; oportunidad: Venta recuperable $5.0 M |
| **Retenido por confiabilidad** | Nada |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | No se muestra |
| **Aviso / vacío** | — |

## Escenario 8 — Lo que bloquea el análisis va primero

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Media → modo «completo» |
| **Cabecera** | 3 de 4 · «Ver todos»: Ver todos (4) |
| **Destacados** | ◆ Hallazgo · Crítica · Hecho (respaldo alto): «Falta la meta anual definida»<br>▲ Riesgo · Crítica · Estimación (respaldo alto): «El cierre proyectado queda por debajo de la meta»<br>◆ Hallazgo · Importante · Cálculo (respaldo alto): «La venta acumulada está por debajo del plan» |
| **Resto del universo** | ● Recuperar la brecha elevando la conversión |
| **Impacto por elemento** | ◆ Falta la meta anual definida: no aplica<br>▲ El cierre proyectado queda por debajo de: Venta en riesgo −$723 mil (proyectado, estimación); Margen no configurado · Configurar<br>◆ La venta acumulada está por debajo del p: Brecha observada −$723 mil (observado); Margen no configurado · Configurar<br>● Recuperar la brecha elevando la conversi: Venta recuperable $723 mil (proyectado, estimación); Margen no configurado · Configurar |
| **Totales por clase** | hallazgo: Brecha observada −$723 mil; riesgo: Venta en riesgo −$723 mil; oportunidad: Venta recuperable $723 mil |
| **Retenido por confiabilidad** | Nada |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | No se muestra |
| **Aviso / vacío** | — |

## Escenario 9 — El mismo hallazgo dicho por dos motores es uno solo

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 2 de 2 · «Ver todos»: no aparece |
| **Destacados** | ▲ Riesgo · Crítica · Estimación (respaldo alto): «El cierre proyectado queda por debajo de la meta»<br>◆ Hallazgo · Importante · Cálculo (respaldo alto): «La venta acumulada está por debajo del plan» |
| **Resto del universo** | — |
| **Impacto por elemento** | ▲ El cierre proyectado queda por debajo de: Venta en riesgo −$723 mil (proyectado, estimación); Margen no configurado · Configurar<br>◆ La venta acumulada está por debajo del p: Brecha observada −$723 mil (observado); Margen no configurado · Configurar |
| **Totales por clase** | hallazgo: Brecha observada −$723 mil; riesgo: Venta en riesgo −$723 mil |
| **Retenido por confiabilidad** | Nada |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | No se muestra |
| **Aviso / vacío** | — |

## Escenario 10 — Lo que no cumple el contrato no se muestra

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 1 de 1 · «Ver todos»: no aparece |
| **Destacados** | ◆ Hallazgo · Importante · Cálculo (respaldo alto): «La venta acumulada está por debajo del plan» |
| **Resto del universo** | — |
| **Impacto por elemento** | ◆ La venta acumulada está por debajo del p: Brecha observada −$723 mil (observado); Margen no configurado · Configurar |
| **Totales por clase** | hallazgo: Brecha observada −$723 mil |
| **Retenido por confiabilidad** | Nada |
| **Rechazado por contrato** | x:sin-fuente: evidence[0] sin fuente (módulo y campo): no hay insight sin trazabilidad.<br>x:oportunidad-como-hecho: Una oportunidad es una estimación: no puede presentarse como hecho, cálculo, contribución ni señal.<br>x:roi: El texto usa un término financiero no permitido (utilidad, ganancia, beneficio, rentabilidad, ROI, ROAS o CAC).<br>x:observado-en-oportunidad: El impacto «observado» no corresponde a la clase oportunidad (admite: potencial_teorico, alcanzable, esperado).<br>x:riesgo-con-venta-recuperable: El impacto «alcanzable» no corresponde a la clase riesgo (admite: brecha, en_riesgo, esperado). |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | No se muestra |
| **Aviso / vacío** | — |

## Escenario 11 — Impacto con margen configurado

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 3 de 7 · «Ver todos»: Ver todos (7) |
| **Destacados** | ▲ Riesgo · Crítica · Estimación (respaldo alto): «El cierre proyectado queda por debajo de la meta»<br>● Oportunidad · Importante · Estimación (respaldo alto): «Recuperar la brecha elevando las sesiones»<br>◆ Hallazgo · Importante · Cálculo (respaldo alto): «La venta acumulada está por debajo del plan» |
| **Resto del universo** | ● Recuperar la brecha elevando la conversión; ◆ Ecommerce concentra la brecha; ● Escenario de mayor ticket promedio; ◆ La conversión explica la mayor parte de la brecha |
| **Impacto por elemento** | ▲ El cierre proyectado queda por debajo de: Venta en riesgo −$723 mil (proyectado, estimación); Contribución bruta estimada −$181 mil<br>● Recuperar la brecha elevando las sesione: Venta recuperable $760 mil (proyectado, estimación); Contribución bruta estimada $190 mil<br>◆ La venta acumulada está por debajo del p: Brecha observada −$723 mil (observado); Contribución bruta estimada −$181 mil<br>● Recuperar la brecha elevando la conversi: Venta recuperable $723 mil (proyectado, estimación); Contribución bruta estimada $181 mil<br>◆ Ecommerce concentra la brecha: Brecha observada −$650 mil (observado); Contribución bruta estimada −$163 mil<br>● Escenario de mayor ticket promedio: Venta potencial (teórica) $1.2 M (proyectado, estimación); Contribución bruta estimada $300 mil<br>◆ La conversión explica la mayor parte de : no aplica |
| **Totales por clase** | hallazgo: Brecha observada (no se totaliza: mismo dinero); riesgo: Venta en riesgo −$723 mil; oportunidad: Venta recuperable $723 mil a $760 mil (rango), Venta potencial (teórica) $1.2 M |
| **Retenido por confiabilidad** | Nada |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | No se muestra |
| **Aviso / vacío** | — |

## Escenario 12 — Resueltos fuera de la portada; en vigilancia, rotulados

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 2 de 2 · «Ver todos»: no aparece |
| **Destacados** | ▲ Riesgo · Crítica · Estimación (respaldo alto): «El cierre proyectado queda por debajo de la meta»<br>◆ Hallazgo · Importante · Cálculo (respaldo alto): «La venta acumulada está por debajo del plan» |
| **Resto del universo** | — |
| **Impacto por elemento** | ▲ El cierre proyectado queda por debajo de: Venta en riesgo −$723 mil (proyectado, estimación); Margen no configurado · Configurar<br>◆ La venta acumulada está por debajo del p: Brecha observada −$723 mil (observado); Margen no configurado · Configurar |
| **Totales por clase** | hallazgo: Brecha observada −$723 mil; riesgo: Venta en riesgo −$723 mil |
| **Retenido por confiabilidad** | Nada |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 1 |
| **Qué falta para concluir** | No se muestra |
| **Aviso / vacío** | — |

## Escenario 13 — Impacto con datos insuficientes: se dice, no se pinta cero

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Alta → modo «completo» |
| **Cabecera** | 3 de 3 · «Ver todos»: no aparece |
| **Destacados** | ● Oportunidad · Importante · Estimación (respaldo alto): «Recuperar la brecha elevando la conversión»<br>● Oportunidad · Importante · Estimación (respaldo medio): «Recuperación por ticket promedio»<br>▲ Riesgo · Importante · Hipótesis (respaldo bajo): «La conversión de App podría estar deteriorándose» |
| **Resto del universo** | — |
| **Impacto por elemento** | ● Recuperar la brecha elevando la conversi: Venta recuperable $723 mil (proyectado, estimación); Margen no configurado · Configurar<br>● Recuperación por ticket promedio: datos insuficientes (sin importe)<br>▲ La conversión de App podría estar deteri: no aplica |
| **Totales por clase** | oportunidad: Venta recuperable $723 mil |
| **Retenido por confiabilidad** | Nada |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | No se muestra |
| **Aviso / vacío** | — |

## Escenario 14 — Confiabilidad baja y solo hay conclusiones: no se muestra nada

*Comparación con lo esperado:* coincide con el comportamiento esperado (razonado desde D-02, D-03 y la aclaración B).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad de la lectura** | Baja → modo «solo_observado» |
| **Cabecera** | — · «Ver todos»: no aparece |
| **Destacados** | — |
| **Resto del universo** | — |
| **Impacto por elemento** | — |
| **Totales por clase** | No hay totales |
| **Retenido por confiabilidad** | 2 (1 riesgo, 1 oportunidad): 2 elementos no se presentan porque la confiabilidad de la lectura no permite sostener conclusiones. |
| **Rechazado por contrato** | Nada |
| **Resueltos fuera de la portada** | 0 |
| **Qué falta para concluir** | No hay requisitos de datos pendientes registrados. |
| **Aviso / vacío** | Lectura preliminar: se muestran solo los hechos y cálculos observados. Los riesgos y las oportunidades no se presentan hasta corregir los datos. No hay elementos que mostrar con la confiabilidad actual. |
