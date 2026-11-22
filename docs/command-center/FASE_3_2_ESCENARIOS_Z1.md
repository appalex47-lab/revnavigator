# Escenarios de Z1 — Lectura ejecutiva (Subfase 3.2)

Generado por `node tools/audit/z1-generar-artefactos.js` desde la especificación ejecutable (`tools/audit/z1-lectura-ejecutiva.js`) y los escenarios (`tools/audit/z1-escenarios.js`): **14 obligatorios** y **16 adicionales** (A1–A16), añadidos solo donde las decisiones D-01 a D-06, la auditoría final o la resolución de los criterios C1 a C5 abren una brecha funcional real. **No editar a mano**: la prueba `tools/test-fase3-2-z1.js` valida que cada escenario produce lo que dictan los contratos de Fase 2 y las decisiones, y el verificador `tools/audit/verificar_consistencia_3_2.py` valida que el documento principal coincide con esta fuente.

**Origen de las cifras.** Escenario 2: cumplimiento, brecha y cierre que entregó el motor con los datos de demostración desviados («motor»). Todos los demás: valores **ilustrativos** (diseñados para ejercitar la regla; no provienen de datos reales). Los textos son los que produce la especificación (diseño propuesto), no los de la aplicación actual.

## Escenario 1 — Desempeño positivo con confiabilidad alta

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad alta** (modo «definitiva») — sin motivos que advertir |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Alta |
| **Estado ejecutivo** | **En crecimiento** |
| **Veredicto permitido** | Tipo «creciendo»: «La venta crece contra agosto 2026 y supera la meta acumulada; el cierre proyectado la superaría. Lectura sustentada en datos completos.» |
| **Narrativa corta** | «Se apoya en 22 días contados y en datos sin avisos.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $10.6 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 106.0 % de cumplimiento acumulado, el estado es «En crecimiento», con una evolución de +8.0 % contra agosto 2026 (mismos días). **Limitaciones:** Sin limitaciones relevantes en los datos de este periodo. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $15.9 M, 6.0 % por encima de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **$600 mil** (por encima); base: plan de los mismos 22 días; venta observada $10.6 M; meta acumulada $10.0 M; cumplimiento 106.0 % |
| **Cierre · evolución · contribución** | cierre: $15.9 M (+6.0 % vs meta); evolución: +8.0 % vs agosto 2026 (mismos días); venta comparable $9.8 M; Contribución bruta estimada **$150 mil** solo en el detalle, sobre la brecha contra el plan (margen promedio general 25 %; estimación, no utilidad ni margen real del canal o producto) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: —. Diagnóstico disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: concluyente · evolución: valorable · conversión: observable · contribución: disponible |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Lectura condicionada (motivos) (confiabilidad alta: no hay motivos que advertir) · Alcance: qué se conoce y qué no (confiabilidad alta: todo lo que Z1 muestra es concluyente) |
| **Advertencias necesarias** | Ninguna |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos, riesgos y oportunidades · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario 2 — Desempeño negativo con confiabilidad alta

*Origen de las cifras:* motor (cumplimiento, brecha y cierre con los datos de demostración desviados); evolución y confiabilidad ilustrativas. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad alta** (modo «definitiva») — sin motivos que advertir |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Alta |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo, concentracion_en_un_canal |
| **Veredicto permitido** | Tipo «riesgo_cumplimiento»: «La venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos.» |
| **Narrativa corta** | «La evolución contra agosto 2026 se mantiene estable. Se apoya en 22 días contados y en datos sin avisos.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $15.2 M contra una meta acumulada de $16.0 M. **Interpretación:** Con 95.5 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan», con una evolución de −0.4 % contra agosto 2026 (mismos días). **Limitaciones:** No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $21.1 M, 3.3 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$723 mil** (por debajo); base: plan de los mismos 22 días; venta observada $15.2 M; meta acumulada $16.0 M; cumplimiento 95.5 % |
| **Cierre · evolución · contribución** | cierre: $21.1 M (−3.3 % vs meta); evolución: −0.4 % vs agosto 2026 (mismos días); venta comparable $15.3 M; «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: —. Diagnóstico disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: concluyente · evolución: valorable · conversión: observable · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Lectura condicionada (motivos) (confiabilidad alta: no hay motivos que advertir) · Alcance: qué se conoce y qué no (confiabilidad alta: todo lo que Z1 muestra es concluyente) |
| **Advertencias necesarias** | Margen no configurado: no se estima contribución. |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos, riesgos y oportunidades · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario 3 — Desempeño estable con confiabilidad alta

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad alta** (modo «definitiva») — sin motivos que advertir |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Alta |
| **Estado ejecutivo** | **Cumpliendo el plan** |
| **Veredicto permitido** | Tipo «saludable»: «La venta acumulada está en línea con la meta acumulada; el cierre proyectado quedaría en línea con ella. Lectura sustentada en datos completos.» |
| **Narrativa corta** | «La evolución contra agosto 2026 se mantiene estable. Se apoya en 22 días contados y en datos sin avisos.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $8.0 M contra una meta acumulada de $8.0 M. **Interpretación:** Con 100.3 % de cumplimiento acumulado, el estado es «Cumpliendo el plan», con una evolución de +0.2 % contra agosto 2026 (mismos días). **Limitaciones:** No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $12.0 M, en línea con la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **$24 mil** (en linea); base: plan de los mismos 22 días; venta observada $8.0 M; meta acumulada $8.0 M; cumplimiento 100.3 % |
| **Cierre · evolución · contribución** | cierre: $12.0 M (+0.4 % vs meta); evolución: +0.2 % vs agosto 2026 (mismos días); venta comparable $8.0 M; «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: —. Diagnóstico disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: concluyente · evolución: valorable · conversión: observable · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Lectura condicionada (motivos) (confiabilidad alta: no hay motivos que advertir) · Alcance: qué se conoce y qué no (confiabilidad alta: todo lo que Z1 muestra es concluyente) |
| **Advertencias necesarias** | Margen no configurado: no se estima contribución. |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos, riesgos y oportunidades · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario 4 — Desempeño positivo con confiabilidad media

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad media** (modo «con_avisos») — motivos visibles en Z1: Los datos traen avisos de calidad (12 registros). Se compararon 75 % de los días. |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Media |
| **Estado ejecutivo** | **En crecimiento** · calificadores: datos_con_avisos (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «creciendo»: «Con avisos: la venta crece contra agosto 2026 y supera la meta acumulada; el cierre proyectado la superaría. Conclusión con reservas.» |
| **Narrativa corta** | «La lectura va con avisos; sus motivos están a la vista.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $12.5 M contra una meta acumulada de $12.0 M. **Interpretación:** Con 104.0 % de cumplimiento acumulado, el estado es «En crecimiento», con una evolución de +6.0 % contra agosto 2026 (mismos días). **Limitaciones:** Los datos traen avisos de calidad (12 registros). Se compararon 75 % de los días. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $18.6 M, 3.3 % por encima de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **$480 mil** (por encima); base: plan de los mismos 22 días; venta observada $12.5 M; meta acumulada $12.0 M; cumplimiento 104.0 % |
| **Cierre · evolución · contribución** | cierre: $18.6 M (+3.3 % vs meta); evolución: +6.0 % vs agosto 2026 (mismos días); venta comparable $11.8 M; Contribución bruta estimada **$120 mil** solo en el detalle, sobre la brecha contra el plan (margen promedio general 25 %; estimación, no utilidad ni margen real del canal o producto) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: —. Diagnóstico con reservas. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: con reservas · evolución: valorable · conversión: observable · contribución: disponible |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Nada se oculta |
| **Advertencias necesarias** | Los datos traen avisos de calidad (12 registros). Se compararon 75 % de los días. |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos de calidad de datos · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario 5 — Desempeño negativo con confiabilidad baja

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad baja** (modo «preliminar») — motivos visibles en Z1: Hay filas rechazadas o con errores en los datos cargados. |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: limitación → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Baja |
| **Estado ejecutivo** | No se emite etiqueta de estado (lectura preliminar; el estado interno quedaría en «En riesgo de incumplir el plan» pero no se afirma) |
| **Veredicto permitido** | Tipo «preliminar»: «Lectura preliminar: la venta acumulada parece estar por debajo de la meta, pero los datos tienen limitaciones y no permiten una conclusión definitiva.» |
| **Narrativa corta** | «Corrige los datos antes de decidir con esta lectura.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $8.4 M contra una meta acumulada de $9.0 M. **Interpretación:** La diferencia observada es una interpretación preliminar: los datos no respaldan una lectura definitiva. **Limitaciones:** Hay filas rechazadas o con errores en los datos cargados. **Implicación:** Conviene corregir los datos antes de actuar sobre esta diferencia. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$630 mil** (por debajo) · rotulada «preliminar»; base: plan de los mismos 22 días; venta observada $8.4 M; meta acumulada $9.0 M; cumplimiento 93.0 % |
| **Cierre · evolución · contribución** | cierre: —; evolución: —; Contribución bruta estimada **−$158 mil** (preliminar) solo en el detalle, sobre la brecha contra el plan (margen promedio general 25 %; estimación, no utilidad ni margen real del canal o producto) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan (preliminares). No se puede concluir: Evolución contra el comparable; Diagnóstico del comportamiento comercial. Diagnóstico no concluyente. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: preliminar · evolución: no valorable · conversión: observable · contribución: disponible |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Contribución bruta estimada / margen |
| **Qué no se muestra** | Cierre proyectado (el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida) · Evolución vs comparable (sin lectura definitiva no se valora la evolución) |
| **Advertencias necesarias** | Hay filas rechazadas o con errores en los datos cargados. |
| **Se deriva a otras zonas** | Z2: Diagnóstico no concluyente (solo lo observado) · Z3: Hallazgos de calidad de datos · Z4: Acción de datos antes que cualquier recomendación · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario 6 — Datos insuficientes

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad insuficiente** (modo «sin_lectura») — motivos visibles en Z1: Solo se compararon 30 % de los días. |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: bloqueo ⛔ → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Insuficiente ⛔ |
| **Estado ejecutivo** | **Sin lectura concluyente** (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «sin_lectura»: «Hay venta registrada, pero los datos no alcanzan para valorar el cumplimiento ni emitir una lectura del negocio.» |
| **Narrativa corta** | «Completa la información que falta para ver el estado del negocio.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $400 mil. **Interpretación:** Con esta información no puede emitirse una interpretación del estado del negocio. **Limitaciones:** Solo se compararon 30 % de los días. **Implicación:** Hasta completar esa información no conviene decidir con esta lectura. |
| **Indicador económico** | Venta observada: **$400 mil**; base: periodo al 22 sep 2026; sin comparación válida contra el plan |
| **Cierre · evolución · contribución** | cierre: —; evolución: —; No se muestra (Sin una brecha válida contra el plan no se estima contribución.) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo. No se puede concluir: Cumplimiento y brecha contra el plan; Evolución contra el comparable; Diagnóstico del comportamiento comercial. Diagnóstico no disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: no concluyente · evolución: no valorable · conversión: observable · contribución: oculta |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no |
| **Qué no se muestra** | Cierre proyectado (el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida) · Evolución vs comparable (sin lectura definitiva no se valora la evolución) · Contribución bruta estimada / margen (sin una brecha válida contra el plan no se estima contribución) |
| **Advertencias necesarias** | Solo se compararon 30 % de los días. |
| **Se deriva a otras zonas** | Z2: No se muestra · Z3: Hallazgos de datos · Z4: Acción de datos: Solo se compararon 30 % de los días. · Z5: Qué falta para concluir; Confiabilidad y cobertura |

## Escenario 7 — Sin actividad

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad insuficiente** (modo «sin_lectura») — motivos visibles en Z1: No hay actividad observable (sesiones, pedidos ni venta) en el periodo: confirma que los datos estén cargados. |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: bloqueo ⛔ → 3. Existencia y comparabilidad de la base de referencia: comparación no válida (solo afecta a la evolución) → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Insuficiente ⛔ |
| **Estado ejecutivo** | **Sin lectura concluyente** (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «sin_lectura»: «No hay actividad observable en el periodo: no es posible emitir una lectura del negocio.» |
| **Narrativa corta** | «Confirma que los datos del periodo estén cargados antes de interpretar el resultado.» |
| **Narrativa ampliada** | **Hecho observado:** No hay actividad observable (sesiones, pedidos ni venta) en el periodo. **Interpretación:** Con esta información no puede emitirse una interpretación del estado del negocio. **Limitaciones:** No hay actividad observable (sesiones, pedidos ni venta) en el periodo: confirma que los datos estén cargados. **Implicación:** Hasta completar esa información no conviene decidir con esta lectura. |
| **Indicador económico** | Sin cifra principal (no hay venta observada válida) |
| **Cierre · evolución · contribución** | cierre: —; evolución: —; No se muestra (Sin una brecha válida contra el plan no se estima contribución.) |
| **Comparación** | Sin actividad — no permite afirmar crecimiento ni deterioro |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: —. No se puede concluir: Cumplimiento y brecha contra el plan; Evolución contra el comparable; Diagnóstico del comportamiento comercial. Diagnóstico no disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: sin actividad · cumplimiento: no concluyente · evolución: no valorable · conversión: no verificable · contribución: oculta |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no |
| **Qué no se muestra** | Indicador económico principal (no hay venta observada válida que mostrar) · Cierre proyectado (el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida) · Evolución vs comparable (sin lectura definitiva no se valora la evolución) · Contribución bruta estimada / margen (sin una brecha válida contra el plan no se estima contribución) |
| **Advertencias necesarias** | No hay actividad observable (sesiones, pedidos ni venta) en el periodo: confirma que los datos estén cargados. Comparación: Sin actividad. |
| **Se deriva a otras zonas** | Z2: No se muestra · Z3: Hallazgos de datos · Z4: Acción de datos: No hay actividad observable (sesiones, pedidos ni venta) en el periodo: confirma que los datos estén cargados. · Z5: Qué falta para concluir; Confiabilidad y cobertura |

## Escenario 8 — Sin base comparable

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad alta** (modo «definitiva») — sin motivos que advertir |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: comparación no válida (solo afecta a la evolución) → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Alta |
| **Estado ejecutivo** | **Cumpliendo el plan** |
| **Veredicto permitido** | Tipo «saludable»: «La venta acumulada está en línea con la meta acumulada; el cierre proyectado quedaría en línea con ella. Lectura sustentada en datos completos.» |
| **Narrativa corta** | «Sin base comparable no se puede valorar la evolución. Se apoya en 22 días contados y en datos sin avisos.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $10.1 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 100.5 % de cumplimiento acumulado, el estado es «Cumpliendo el plan»; la evolución no se valora (sin base comparable). **Limitaciones:** No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $15.0 M, en línea con la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **$50 mil** (en linea); base: plan de los mismos 22 días; venta observada $10.1 M; meta acumulada $10.0 M; cumplimiento 100.5 % |
| **Cierre · evolución · contribución** | cierre: $15.0 M (+0.2 % vs meta); evolución: «Sin base comparable» (sin porcentaje); «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Sin base comparable — no permite afirmar crecimiento ni deterioro |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: Evolución contra el comparable. Diagnóstico disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: concluyente · evolución: no valorable · conversión: observable · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Lectura condicionada (motivos) (confiabilidad alta: no hay motivos que advertir) · Alcance: qué se conoce y qué no (confiabilidad alta: todo lo que Z1 muestra es concluyente) |
| **Advertencias necesarias** | Margen no configurado: no se estima contribución. Comparación: Sin base comparable. |
| **Se deriva a otras zonas** | Z2: Estado de atribución: Sin base comparable (sin puente) · Z3: Hallazgos, riesgos y oportunidades · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario 9 — Recuperación desde cero

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad alta** (modo «definitiva») — sin motivos que advertir |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: comparación no válida (solo afecta a la evolución) → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Alta |
| **Estado ejecutivo** | **Cumpliendo el plan** |
| **Veredicto permitido** | Tipo «saludable»: «La venta acumulada supera la meta acumulada; el cierre proyectado la superaría. Lectura sustentada en datos completos.» |
| **Narrativa corta** | «El periodo comparable no registró pedidos: no hay porcentaje de evolución que mostrar. Se apoya en 22 días contados y en datos sin avisos.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $10.2 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 102.0 % de cumplimiento acumulado, el estado es «Cumpliendo el plan»; la evolución no se valora (recuperación desde cero). **Limitaciones:** No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $15.3 M, 2.0 % por encima de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **$200 mil** (por encima); base: plan de los mismos 22 días; venta observada $10.2 M; meta acumulada $10.0 M; cumplimiento 102.0 % |
| **Cierre · evolución · contribución** | cierre: $15.3 M (+2.0 % vs meta); evolución: «Recuperación desde cero» (sin porcentaje); «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Recuperación desde cero — no permite afirmar crecimiento ni deterioro |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: Evolución contra el comparable. Diagnóstico disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: concluyente · evolución: no valorable · conversión: observable · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Lectura condicionada (motivos) (confiabilidad alta: no hay motivos que advertir) · Alcance: qué se conoce y qué no (confiabilidad alta: todo lo que Z1 muestra es concluyente) |
| **Advertencias necesarias** | Margen no configurado: no se estima contribución. Comparación: Recuperación desde cero. |
| **Se deriva a otras zonas** | Z2: Estado de atribución: Recuperación desde cero (sin puente) · Z3: Hallazgos, riesgos y oportunidades · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario 10 — Conversión igual a cero

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad media** (modo «con_avisos») — motivos visibles en Z1: Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. (tope de diseño: no puede ser Alta — Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa.) |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: conversión cero (resultado observable) → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Media |
| **Estado ejecutivo** | **En deterioro** · calificadores: cierre_en_riesgo, datos_con_avisos (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «conversion_cero»: «Con avisos: hay sesiones en el periodo, pero no se registró ningún pedido; es un resultado observado, sin causa atribuida.» |
| **Narrativa corta** | «El resultado se informa tal como se observó, sin atribuirle una causa. La lectura va con avisos; sus motivos están a la vista.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $0 contra una meta acumulada de $5.0 M. **Interpretación:** Con 0.0 % de cumplimiento acumulado, el estado es «En deterioro», con una evolución de −100.0 % contra agosto 2026 (mismos días). **Limitaciones:** Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $0, 100.0 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$5.0 M** (por debajo); base: plan de los mismos 22 días; venta observada $0; meta acumulada $5.0 M; cumplimiento 0.0 % |
| **Cierre · evolución · contribución** | cierre: $0 (−100.0 % vs meta); evolución: −100.0 % vs agosto 2026 (mismos días); venta comparable $900 mil; «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: —. Diagnóstico con reservas. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: con reservas · evolución: valorable · conversión: cero observado · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Nada se oculta |
| **Advertencias necesarias** | Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. Margen no configurado: no se estima contribución. |
| **Se deriva a otras zonas** | Z2: Límites del diagnóstico (sin atribuir causa) · Z3: Hallazgos de calidad de datos · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario 11 — Cambio de composición

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad media** (modo «con_avisos») — motivos visibles en Z1: El conjunto de canales o segmentos no es el mismo que en el comparable. (tope de diseño: no puede ser Alta — El conjunto de canales o segmentos no es el mismo que en el comparable.) |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: comparación no válida (solo afecta a la evolución) → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: cambio de composición → 6. Nivel de confiabilidad final: Media |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo, datos_con_avisos (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «composicion»: «Con avisos: la venta acumulada está por debajo de la meta acumulada; la composición cambió frente al comparable, por lo que no se interpreta la evolución. Conclusión con reservas.» |
| **Narrativa corta** | «La separación entre efecto de composición y desempeño de los componentes se detalla en «Qué ocurrió y por qué». La lectura va con avisos; sus motivos están a la vista.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $9.7 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 97.0 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan»; la evolución no se valora (cambio de composición). **Limitaciones:** El conjunto de canales o segmentos no es el mismo que en el comparable. No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $14.6 M, 2.8 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$300 mil** (por debajo); base: plan de los mismos 22 días; venta observada $9.7 M; meta acumulada $10.0 M; cumplimiento 97.0 % |
| **Cierre · evolución · contribución** | cierre: $14.6 M (−2.8 % vs meta); evolución: «Cambio de composición» (sin porcentaje); «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Cambio de composición — no permite afirmar crecimiento ni deterioro |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: Evolución contra el comparable. Diagnóstico con reservas. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: con reservas · evolución: no valorable · conversión: observable · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Nada se oculta |
| **Advertencias necesarias** | El conjunto de canales o segmentos no es el mismo que en el comparable. Margen no configurado: no se estima contribución. Comparación: Cambio de composición. |
| **Se deriva a otras zonas** | Z2: Efecto de composición separado del desempeño de los componentes · Z3: Hallazgos de calidad de datos · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario 12 — Resultado no calculable

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad insuficiente** (modo «sin_lectura») — motivos visibles en Z1: Hay valores negativos o inconsistentes: el resultado no es calculable. |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: bloqueo ⛔ → 4. Indicadores y denominadores: bloqueo ⛔ → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Insuficiente ⛔ |
| **Estado ejecutivo** | **Sin lectura concluyente** (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «sin_lectura»: «El resultado no es calculable con los datos actuales: no es posible emitir una lectura del negocio.» |
| **Narrativa corta** | «Completa la información que falta para ver el estado del negocio.» |
| **Narrativa ampliada** | **Hecho observado:** No hay una venta observada válida en el periodo. **Interpretación:** Con esta información no puede emitirse una interpretación del estado del negocio. **Limitaciones:** Hay valores negativos o inconsistentes: el resultado no es calculable. **Implicación:** Hasta completar esa información no conviene decidir con esta lectura. |
| **Indicador económico** | Sin cifra principal (no hay venta observada válida) |
| **Cierre · evolución · contribución** | cierre: —; evolución: —; No se muestra (Sin una brecha válida contra el plan no se estima contribución.) |
| **Comparación** | Resultado no calculable — no permite afirmar crecimiento ni deterioro |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: —. No se puede concluir: Cumplimiento y brecha contra el plan; Evolución contra el comparable; Diagnóstico del comportamiento comercial. Diagnóstico no disponible. |
| **Clasificación del dato (C1, C2)** | Dato no calculable · conciliación de ventas: no evaluable |
| **Conclusiones por separado (C3)** | venta observada: no calculable · cumplimiento: no concluyente · evolución: no valorable · conversión: observable · contribución: oculta |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no |
| **Qué no se muestra** | Indicador económico principal (no hay venta observada válida que mostrar) · Cierre proyectado (el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida) · Evolución vs comparable (sin lectura definitiva no se valora la evolución) · Contribución bruta estimada / margen (sin una brecha válida contra el plan no se estima contribución) |
| **Advertencias necesarias** | Hay valores negativos o inconsistentes: el resultado no es calculable. Comparación: Resultado no calculable. |
| **Se deriva a otras zonas** | Z2: No se muestra · Z3: Hallazgos de datos · Z4: Acción de datos: Hay valores negativos o inconsistentes: el resultado no es calculable. · Z5: Qué falta para concluir; Confiabilidad y cobertura |

## Escenario 13 — Venta positiva, pero sin margen configurado

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad alta** (modo «definitiva») — sin motivos que advertir |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Alta |
| **Estado ejecutivo** | **En crecimiento** |
| **Veredicto permitido** | Tipo «creciendo»: «La venta crece contra agosto 2026 y supera la meta acumulada; el cierre proyectado la superaría. Lectura sustentada en datos completos.» |
| **Narrativa corta** | «Se apoya en 22 días contados y en datos sin avisos.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $10.4 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 104.0 % de cumplimiento acumulado, el estado es «En crecimiento», con una evolución de +5.0 % contra agosto 2026 (mismos días). **Limitaciones:** No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $15.6 M, 4.0 % por encima de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **$400 mil** (por encima); base: plan de los mismos 22 días; venta observada $10.4 M; meta acumulada $10.0 M; cumplimiento 104.0 % |
| **Cierre · evolución · contribución** | cierre: $15.6 M (+4.0 % vs meta); evolución: +5.0 % vs agosto 2026 (mismos días); venta comparable $9.9 M; «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: —. Diagnóstico disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: concluyente · evolución: valorable · conversión: observable · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Lectura condicionada (motivos) (confiabilidad alta: no hay motivos que advertir) · Alcance: qué se conoce y qué no (confiabilidad alta: todo lo que Z1 muestra es concluyente) |
| **Advertencias necesarias** | Margen no configurado: no se estima contribución. |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos, riesgos y oportunidades · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario 14 — Venta negativa, con contribución bruta estimada disponible

*Origen de las cifras:* ilustrativo. *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad alta** (modo «definitiva») — sin motivos que advertir |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Alta |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo |
| **Veredicto permitido** | Tipo «riesgo_cumplimiento»: «La venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos.» |
| **Narrativa corta** | «La evolución contra agosto 2026 es ligeramente negativa. Se apoya en 22 días contados y en datos sin avisos.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $9.3 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 93.0 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan», con una evolución de −1.5 % contra agosto 2026 (mismos días). **Limitaciones:** Sin limitaciones relevantes en los datos de este periodo. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $14.1 M, 6.0 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$700 mil** (por debajo); base: plan de los mismos 22 días; venta observada $9.3 M; meta acumulada $10.0 M; cumplimiento 93.0 % |
| **Cierre · evolución · contribución** | cierre: $14.1 M (−6.0 % vs meta); evolución: −1.5 % vs agosto 2026 (mismos días); venta comparable $9.4 M; Contribución bruta estimada **−$175 mil** solo en el detalle, sobre la brecha contra el plan (margen promedio general 25 %; estimación, no utilidad ni margen real del canal o producto) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: —. Diagnóstico disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: concluyente · evolución: valorable · conversión: observable · contribución: disponible |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Lectura condicionada (motivos) (confiabilidad alta: no hay motivos que advertir) · Alcance: qué se conoce y qué no (confiabilidad alta: todo lo que Z1 muestra es concluyente) |
| **Advertencias necesarias** | Ninguna |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos, riesgos y oportunidades · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A1 — Conversión cero sin comparación válida *(adicional)*

*Origen de las cifras:* ilustrativo (brecha que cubre: D-04, no afirmar deterioro sin base comparable). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad media** (modo «con_avisos») — motivos visibles en Z1: Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. (tope de diseño: no puede ser Alta — Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa.) |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: comparación no válida (solo afecta a la evolución) → 4. Indicadores y denominadores: conversión cero (resultado observable) → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Media |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo, datos_con_avisos (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «conversion_cero»: «Con avisos: hay sesiones en el periodo, pero no se registró ningún pedido; es un resultado observado, sin causa atribuida.» |
| **Narrativa corta** | «El resultado se informa tal como se observó, sin atribuirle una causa. La lectura va con avisos; sus motivos están a la vista.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $0 contra una meta acumulada de $5.0 M. **Interpretación:** Con 0.0 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan»; la evolución no se valora (sin base comparable). **Limitaciones:** Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $0, 100.0 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$5.0 M** (por debajo); base: plan de los mismos 22 días; venta observada $0; meta acumulada $5.0 M; cumplimiento 0.0 % |
| **Cierre · evolución · contribución** | cierre: $0 (−100.0 % vs meta); evolución: «Sin base comparable» (sin porcentaje); «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Sin base comparable — no permite afirmar crecimiento ni deterioro |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: Evolución contra el comparable. Diagnóstico con reservas. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: con reservas · evolución: no valorable · conversión: cero observado · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Nada se oculta |
| **Advertencias necesarias** | Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. Margen no configurado: no se estima contribución. Comparación: Sin base comparable. |
| **Se deriva a otras zonas** | Z2: Límites del diagnóstico (sin atribuir causa) · Z3: Hallazgos de calidad de datos · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A2 — Sin plan, con venta observada válida *(adicional)*

*Origen de las cifras:* ilustrativo (brecha que cubre: D-01, la venta observada no se oculta por falta de comparación). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad insuficiente** (modo «sin_lectura») — motivos visibles en Z1: No hay plan del periodo. |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: bloqueo ⛔ → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Insuficiente ⛔ |
| **Estado ejecutivo** | **Sin lectura concluyente** (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «sin_lectura»: «Hay venta registrada, pero sin plan del periodo no es posible valorar el cumplimiento.» |
| **Narrativa corta** | «Completa la información que falta para ver el estado del negocio.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $3.2 M. **Interpretación:** Con esta información no puede emitirse una interpretación del estado del negocio. **Limitaciones:** No hay plan del periodo. **Implicación:** Hasta completar esa información no conviene decidir con esta lectura. |
| **Indicador económico** | Venta observada: **$3.2 M**; base: periodo al 22 sep 2026; sin comparación válida contra el plan |
| **Cierre · evolución · contribución** | cierre: —; evolución: —; No se muestra (Sin una brecha válida contra el plan no se estima contribución.) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo. No se puede concluir: Cumplimiento y brecha contra el plan; Evolución contra el comparable; Diagnóstico del comportamiento comercial. Diagnóstico no disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: no concluyente · evolución: no valorable · conversión: observable · contribución: oculta |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no |
| **Qué no se muestra** | Cierre proyectado (el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida) · Evolución vs comparable (sin lectura definitiva no se valora la evolución) · Contribución bruta estimada / margen (sin una brecha válida contra el plan no se estima contribución) |
| **Advertencias necesarias** | No hay plan del periodo. |
| **Se deriva a otras zonas** | Z2: No se muestra · Z3: Hallazgos de datos · Z4: Acción de datos: No hay plan del periodo. · Z5: Qué falta para concluir; Confiabilidad y cobertura |

## Escenario A3 — Bloqueo duro con una limitación secundaria *(adicional)*

*Origen de las cifras:* ilustrativo (brecha que cubre: D-05, Baja e Insuficiente son excluyentes). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad insuficiente** (modo «sin_lectura») — motivos visibles en Z1: Solo se compararon 40 % de los días. |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: bloqueo ⛔ → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Insuficiente ⛔ |
| **Estado ejecutivo** | **Sin lectura concluyente** (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «sin_lectura»: «Hay venta registrada, pero los datos no alcanzan para valorar el cumplimiento ni emitir una lectura del negocio.» |
| **Narrativa corta** | «Completa la información que falta para ver el estado del negocio.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $8.1 M. **Interpretación:** Con esta información no puede emitirse una interpretación del estado del negocio. **Limitaciones:** Solo se compararon 40 % de los días. **Implicación:** Hasta completar esa información no conviene decidir con esta lectura. |
| **Indicador económico** | Venta observada: **$8.1 M**; base: periodo al 22 sep 2026; sin comparación válida contra el plan |
| **Cierre · evolución · contribución** | cierre: —; evolución: —; No se muestra (Sin una brecha válida contra el plan no se estima contribución.) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo. No se puede concluir: Cumplimiento y brecha contra el plan; Evolución contra el comparable; Diagnóstico del comportamiento comercial. Diagnóstico no disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: no concluyente · evolución: no valorable · conversión: observable · contribución: oculta |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no |
| **Qué no se muestra** | Cierre proyectado (el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida) · Evolución vs comparable (sin lectura definitiva no se valora la evolución) · Contribución bruta estimada / margen (sin una brecha válida contra el plan no se estima contribución) |
| **Advertencias necesarias** | Solo se compararon 40 % de los días. |
| **Se deriva a otras zonas** | Z2: No se muestra · Z3: Hallazgos de datos · Z4: Acción de datos: Solo se compararon 40 % de los días. · Z5: Qué falta para concluir; Confiabilidad y cobertura |

## Escenario A4 — Confiabilidad baja sin margen configurado *(adicional)*

*Origen de las cifras:* ilustrativo (brecha que cubre: D-02, «Margen no configurado · Configurar» con confiabilidad baja). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad baja** (modo «preliminar») — motivos visibles en Z1: Hay filas rechazadas o con errores en los datos cargados. |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: limitación → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Baja |
| **Estado ejecutivo** | No se emite etiqueta de estado (lectura preliminar; el estado interno quedaría en «En riesgo de incumplir el plan» pero no se afirma) |
| **Veredicto permitido** | Tipo «preliminar»: «Lectura preliminar: la venta acumulada parece estar por debajo de la meta, pero los datos tienen limitaciones y no permiten una conclusión definitiva.» |
| **Narrativa corta** | «Corrige los datos antes de decidir con esta lectura.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $8.4 M contra una meta acumulada de $9.0 M. **Interpretación:** La diferencia observada es una interpretación preliminar: los datos no respaldan una lectura definitiva. **Limitaciones:** Hay filas rechazadas o con errores en los datos cargados. No se estima contribución: el margen no está configurado. **Implicación:** Conviene corregir los datos antes de actuar sobre esta diferencia. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$630 mil** (por debajo) · rotulada «preliminar»; base: plan de los mismos 22 días; venta observada $8.4 M; meta acumulada $9.0 M; cumplimiento 93.0 % |
| **Cierre · evolución · contribución** | cierre: —; evolución: —; «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan (preliminares). No se puede concluir: Evolución contra el comparable; Diagnóstico del comportamiento comercial. Diagnóstico no concluyente. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: preliminar · evolución: no valorable · conversión: observable · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Contribución bruta estimada / margen |
| **Qué no se muestra** | Cierre proyectado (el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida) · Evolución vs comparable (sin lectura definitiva no se valora la evolución) |
| **Advertencias necesarias** | Hay filas rechazadas o con errores en los datos cargados. Margen no configurado: no se estima contribución. |
| **Se deriva a otras zonas** | Z2: Diagnóstico no concluyente (solo lo observado) · Z3: Hallazgos de calidad de datos · Z4: Acción de datos antes que cualquier recomendación · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A5 — Venta real igual a cero con actividad y sin plan *(adicional)*

*Origen de las cifras:* ilustrativo (auditoría final, punto 1: un cero MEDIDO se muestra y no se confunde con falta de dato). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad insuficiente** (modo «sin_lectura») — motivos visibles en Z1: No hay plan del periodo. (tope de diseño: no puede ser Alta — Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa.) |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: bloqueo ⛔ → 4. Indicadores y denominadores: conversión cero (resultado observable) → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Insuficiente ⛔ |
| **Estado ejecutivo** | **Sin lectura concluyente** (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «sin_lectura»: «Hubo sesiones, pero no se registró ningún pedido ni venta; sin plan del periodo no es posible valorar el cumplimiento.» |
| **Narrativa corta** | «Completa la información que falta para ver el estado del negocio.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $0. **Interpretación:** Con esta información no puede emitirse una interpretación del estado del negocio. **Limitaciones:** No hay plan del periodo. **Implicación:** Hasta completar esa información no conviene decidir con esta lectura. |
| **Indicador económico** | Venta observada: **$0**; base: periodo al 22 sep 2026; sin comparación válida contra el plan |
| **Cierre · evolución · contribución** | cierre: —; evolución: —; No se muestra (Sin una brecha válida contra el plan no se estima contribución.) |
| **Comparación** | Sin base comparable — no permite afirmar crecimiento ni deterioro |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo. No se puede concluir: Cumplimiento y brecha contra el plan; Evolución contra el comparable; Diagnóstico del comportamiento comercial. Diagnóstico no disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: no concluyente · evolución: no valorable · conversión: cero observado · contribución: oculta |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no |
| **Qué no se muestra** | Cierre proyectado (el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida) · Evolución vs comparable (sin lectura definitiva no se valora la evolución) · Contribución bruta estimada / margen (sin una brecha válida contra el plan no se estima contribución) |
| **Advertencias necesarias** | No hay plan del periodo. Comparación: Sin base comparable. |
| **Se deriva a otras zonas** | Z2: No se muestra · Z3: Hallazgos de datos · Z4: Acción de datos: No hay plan del periodo. · Z5: Qué falta para concluir; Confiabilidad y cobertura |

## Escenario A6 — Información incompleta: actividad no verificable *(adicional)*

*Origen de las cifras:* ilustrativo (auditoría final, punto 1: falta de dato ≠ ausencia de actividad ≠ venta cero). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad insuficiente** (modo «sin_lectura») — motivos visibles en Z1: No se puede verificar la actividad del periodo: faltan datos de sesiones, pedidos o venta. |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: bloqueo ⛔ → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Insuficiente ⛔ |
| **Estado ejecutivo** | **Sin lectura concluyente** (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «sin_lectura»: «No se puede verificar la actividad del periodo: no es posible emitir una lectura del negocio.» |
| **Narrativa corta** | «Completa los datos de actividad del periodo antes de interpretar el resultado.» |
| **Narrativa ampliada** | **Hecho observado:** No hay datos suficientes para verificar la actividad del periodo. **Interpretación:** Con esta información no puede emitirse una interpretación del estado del negocio. **Limitaciones:** No se puede verificar la actividad del periodo: faltan datos de sesiones, pedidos o venta. **Implicación:** Hasta completar esa información no conviene decidir con esta lectura. |
| **Indicador económico** | Sin cifra principal (no hay venta observada válida) |
| **Cierre · evolución · contribución** | cierre: —; evolución: —; No se muestra (Sin una brecha válida contra el plan no se estima contribución.) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: —. No se puede concluir: Cumplimiento y brecha contra el plan; Evolución contra el comparable; Diagnóstico del comportamiento comercial. Diagnóstico no disponible. |
| **Clasificación del dato (C1, C2)** | Dato no verificable · conciliación de ventas: no evaluable |
| **Conclusiones por separado (C3)** | venta observada: no verificable · cumplimiento: no concluyente · evolución: no valorable · conversión: no verificable · contribución: oculta |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no |
| **Qué no se muestra** | Indicador económico principal (no hay venta observada válida que mostrar) · Cierre proyectado (el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida) · Evolución vs comparable (sin lectura definitiva no se valora la evolución) · Contribución bruta estimada / margen (sin una brecha válida contra el plan no se estima contribución) |
| **Advertencias necesarias** | No se puede verificar la actividad del periodo: faltan datos de sesiones, pedidos o venta. |
| **Se deriva a otras zonas** | Z2: No se muestra · Z3: Hallazgos de datos · Z4: Acción de datos: No se puede verificar la actividad del periodo: faltan datos de sesiones, pedidos o venta. · Z5: Qué falta para concluir; Confiabilidad y cobertura |

## Escenario A7 — Información parcial con venta positiva: pedidos no disponibles *(adicional)*

*Origen de las cifras:* ilustrativo (C3: una medida ausente no baja por sí sola la confiabilidad; solo deja sin verificar la conclusión que la necesita). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad alta** (modo «definitiva») — sin motivos que advertir |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok (conversión no verificable) → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Alta |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo |
| **Veredicto permitido** | Tipo «riesgo_cumplimiento»: «La venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Lectura calculable; la información disponible está incompleta.» |
| **Narrativa corta** | «La evolución contra agosto 2026 es ligeramente positiva. Se apoya en 22 días contados y en datos sin avisos.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $9.5 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 95.0 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan», con una evolución de +2.0 % contra agosto 2026 (mismos días). **Limitaciones:** Falta información: pedidos. Las métricas calculables se muestran; no se interpreta el motivo. No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $14.3 M, 5.0 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$500 mil** (por debajo); base: plan de los mismos 22 días; venta observada $9.5 M; meta acumulada $10.0 M; cumplimiento 95.0 % |
| **Cierre · evolución · contribución** | cierre: $14.3 M (−5.0 % vs meta); evolución: +2.0 % vs agosto 2026 (mismos días); venta comparable $9.3 M; «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: Conversión del periodo (falta la medida de sesiones o de pedidos). Diagnóstico disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: concluyente · evolución: valorable · conversión: no verificable · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Alcance: qué se conoce y qué no · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Lectura condicionada (motivos) (confiabilidad alta: no hay motivos que advertir) |
| **Advertencias necesarias** | Margen no configurado: no se estima contribución. |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos, riesgos y oportunidades · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A8 — Dato inconsistente: pedidos registrados con venta cero *(adicional)*

*Origen de las cifras:* ilustrativo (C1: la combinación no invalida el dato; queda pendiente de interpretación y la cifra observada sigue visible). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad media** (modo «con_avisos») — motivos visibles en Z1: Se registraron pedidos y la venta del periodo es cero: combinación pendiente de interpretación. (tope de diseño: no puede ser Alta — Se registraron pedidos y la venta del periodo es cero: combinación pendiente de interpretación.) |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: inconsistencia pendiente de interpretación → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Media |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo, datos_con_avisos (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «riesgo_cumplimiento»: «Con avisos: la venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Conclusión con reservas.» |
| **Narrativa corta** | «Sin base comparable no se puede valorar la evolución. La lectura va con avisos; sus motivos están a la vista.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $0 contra una meta acumulada de $10.0 M. **Interpretación:** Con 0.0 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan»; la evolución no se valora (comparación válida). **Limitaciones:** Se registraron pedidos y la venta del periodo es cero: combinación pendiente de interpretación. No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $0, 100.0 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$10.0 M** (por debajo); base: plan de los mismos 22 días; venta observada $0; meta acumulada $10.0 M; cumplimiento 0.0 % |
| **Cierre · evolución · contribución** | cierre: $0 (−100.0 % vs meta); evolución: «Comparación válida» (sin porcentaje); «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: Evolución contra el comparable; Interpretación de las combinaciones pendientes entre sesiones, pedidos y venta. Diagnóstico con reservas. |
| **Clasificación del dato (C1, C2)** | Dato inconsistente (pendiente de interpretación): Se registraron pedidos y la venta del periodo es cero: combinación pendiente de interpretación. · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: con reservas · evolución: no valorable · conversión: pendiente de interpretacion · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Nada se oculta |
| **Advertencias necesarias** | Se registraron pedidos y la venta del periodo es cero: combinación pendiente de interpretación. Margen no configurado: no se estima contribución. |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos de calidad de datos · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A9 — Conversión cero con errores de medición en los datos *(adicional)*

*Origen de las cifras:* ilustrativo (auditoría final, punto 2: el hecho observado se conserva y no se infiere causa). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad baja** (modo «preliminar») — motivos visibles en Z1: Hay filas rechazadas o con errores en los datos cargados. Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. (tope de diseño: no puede ser Alta — Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa.) |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: limitación → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: conversión cero (resultado observable) → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Baja |
| **Estado ejecutivo** | No se emite etiqueta de estado (lectura preliminar; el estado interno quedaría en «En deterioro» pero no se afirma) |
| **Veredicto permitido** | Tipo «preliminar»: «Lectura preliminar: hay sesiones, pero no se registró ningún pedido; los datos tienen limitaciones y no permiten una conclusión definitiva.» |
| **Narrativa corta** | «Corrige los datos antes de decidir con esta lectura.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $0 contra una meta acumulada de $5.0 M. **Interpretación:** La diferencia observada es una interpretación preliminar: los datos no respaldan una lectura definitiva. **Limitaciones:** Hay filas rechazadas o con errores en los datos cargados. Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. No se estima contribución: el margen no está configurado. **Implicación:** Conviene corregir los datos antes de actuar sobre esta diferencia. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$5.0 M** (por debajo) · rotulada «preliminar»; base: plan de los mismos 22 días; venta observada $0; meta acumulada $5.0 M; cumplimiento 0.0 % |
| **Cierre · evolución · contribución** | cierre: —; evolución: —; «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan (preliminares). No se puede concluir: Evolución contra el comparable; Diagnóstico del comportamiento comercial. Diagnóstico no concluyente. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: preliminar · evolución: no valorable · conversión: cero observado · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Contribución bruta estimada / margen |
| **Qué no se muestra** | Cierre proyectado (el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida) · Evolución vs comparable (sin lectura definitiva no se valora la evolución) |
| **Advertencias necesarias** | Hay filas rechazadas o con errores en los datos cargados. Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. Margen no configurado: no se estima contribución. |
| **Se deriva a otras zonas** | Z2: Diagnóstico no concluyente (solo lo observado) · Z3: Hallazgos de calidad de datos · Z4: Acción de datos antes que cualquier recomendación · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A10 — Conversión cero con cambio de composición *(adicional)*

*Origen de las cifras:* ilustrativo (auditoría final, punto 2: dos topes simultáneos, sin lenguaje de mejora ni de causa). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad media** (modo «con_avisos») — motivos visibles en Z1: Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. El conjunto de canales o segmentos no es el mismo que en el comparable. (tope de diseño: no puede ser Alta — Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa.; El conjunto de canales o segmentos no es el mismo que en el comparable.) |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: comparación no válida (solo afecta a la evolución) → 4. Indicadores y denominadores: conversión cero (resultado observable) → 5. Cambios de composición y límites de atribución: cambio de composición → 6. Nivel de confiabilidad final: Media |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo, datos_con_avisos (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «conversion_cero»: «Con avisos: hay sesiones en el periodo, pero no se registró ningún pedido; es un resultado observado, sin causa atribuida.» |
| **Narrativa corta** | «El resultado se informa tal como se observó, sin atribuirle una causa. La lectura va con avisos; sus motivos están a la vista.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $0 contra una meta acumulada de $5.0 M. **Interpretación:** Con 0.0 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan»; la evolución no se valora (cambio de composición). **Limitaciones:** Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. El conjunto de canales o segmentos no es el mismo que en el comparable. No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $0, 100.0 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$5.0 M** (por debajo); base: plan de los mismos 22 días; venta observada $0; meta acumulada $5.0 M; cumplimiento 0.0 % |
| **Cierre · evolución · contribución** | cierre: $0 (−100.0 % vs meta); evolución: «Cambio de composición» (sin porcentaje); «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Cambio de composición — no permite afirmar crecimiento ni deterioro |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: Evolución contra el comparable. Diagnóstico con reservas. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: con reservas · evolución: no valorable · conversión: cero observado · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Nada se oculta |
| **Advertencias necesarias** | Hay actividad pero ningún pedido registrado: la información disponible no permite determinar la causa. El conjunto de canales o segmentos no es el mismo que en el comparable. Margen no configurado: no se estima contribución. Comparación: Cambio de composición. |
| **Se deriva a otras zonas** | Z2: Límites del diagnóstico (sin atribuir causa) · Z3: Hallazgos de calidad de datos · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A11 — Margen guardado no válido *(adicional)*

*Origen de las cifras:* ilustrativo (auditoría final, punto 3: margen inválido ≠ no configurado; nunca produce importe). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad alta** (modo «definitiva») — sin motivos que advertir |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Alta |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo |
| **Veredicto permitido** | Tipo «riesgo_cumplimiento»: «La venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos.» |
| **Narrativa corta** | «La evolución contra agosto 2026 es ligeramente negativa. Se apoya en 22 días contados y en datos sin avisos.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $9.3 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 93.0 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan», con una evolución de −1.5 % contra agosto 2026 (mismos días). **Limitaciones:** No se estima contribución: el margen guardado no es válido. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $14.1 M, 6.0 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$700 mil** (por debajo); base: plan de los mismos 22 días; venta observada $9.3 M; meta acumulada $10.0 M; cumplimiento 93.0 % |
| **Cierre · evolución · contribución** | cierre: $14.1 M (−6.0 % vs meta); evolución: −1.5 % vs agosto 2026 (mismos días); venta comparable $9.4 M; «Margen no válido · Revisar» (línea discreta; sin importe ni 0; motivo de la validación del motor: El margen bruto sobre venta debe ser menor a 100 %. Si calculaste (venta − costo) ÷ costo, eso es markup: conviértelo.) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: —. Diagnóstico disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: concluyente · evolución: valorable · conversión: observable · contribución: invalido |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Lectura condicionada (motivos) (confiabilidad alta: no hay motivos que advertir) · Alcance: qué se conoce y qué no (confiabilidad alta: todo lo que Z1 muestra es concluyente) |
| **Advertencias necesarias** | Ninguna |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos, riesgos y oportunidades · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A12 — Margen configurado en 0 % *(adicional)*

*Origen de las cifras:* ilustrativo (auditoría final, punto 3: un 0 % configurado es un dato válido del motor; produce $0 estimado, no «sin margen»). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad alta** (modo «definitiva») — sin motivos que advertir |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Alta |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo |
| **Veredicto permitido** | Tipo «riesgo_cumplimiento»: «La venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos.» |
| **Narrativa corta** | «La evolución contra agosto 2026 es ligeramente negativa. Se apoya en 22 días contados y en datos sin avisos.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $9.3 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 93.0 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan», con una evolución de −1.5 % contra agosto 2026 (mismos días). **Limitaciones:** Sin limitaciones relevantes en los datos de este periodo. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $14.1 M, 6.0 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$700 mil** (por debajo); base: plan de los mismos 22 días; venta observada $9.3 M; meta acumulada $10.0 M; cumplimiento 93.0 % |
| **Cierre · evolución · contribución** | cierre: $14.1 M (−6.0 % vs meta); evolución: −1.5 % vs agosto 2026 (mismos días); venta comparable $9.4 M; Contribución bruta estimada **$0** solo en el detalle, sobre la brecha contra el plan (margen promedio general 0 %; estimación, no utilidad ni margen real del canal o producto; Margen configurado explícitamente en 0 %: la contribución estimada es $0; no indica que el canal o el producto tengan un margen real de 0 %.) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: —. Diagnóstico disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: concluyente · evolución: valorable · conversión: observable · contribución: disponible |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Lectura condicionada (motivos) (confiabilidad alta: no hay motivos que advertir) · Alcance: qué se conoce y qué no (confiabilidad alta: todo lo que Z1 muestra es concluyente) |
| **Advertencias necesarias** | Ninguna |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos, riesgos y oportunidades · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A13 — Dato inconsistente: venta positiva con cero pedidos *(adicional)*

*Origen de las cifras:* ilustrativo (C1: no es conversión cero ni dato inválido; pendiente de interpretación). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad media** (modo «con_avisos») — motivos visibles en Z1: Hay venta en el periodo con cero pedidos registrados: combinación pendiente de interpretación. (tope de diseño: no puede ser Alta — Hay venta en el periodo con cero pedidos registrados: combinación pendiente de interpretación.) |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: inconsistencia pendiente de interpretación → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Media |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo, datos_con_avisos (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «riesgo_cumplimiento»: «Con avisos: la venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Conclusión con reservas.» |
| **Narrativa corta** | «La evolución contra agosto 2026 es ligeramente positiva. La lectura va con avisos; sus motivos están a la vista.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $9.5 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 95.0 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan», con una evolución de +2.0 % contra agosto 2026 (mismos días). **Limitaciones:** Hay venta en el periodo con cero pedidos registrados: combinación pendiente de interpretación. No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $14.3 M, 5.0 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$500 mil** (por debajo); base: plan de los mismos 22 días; venta observada $9.5 M; meta acumulada $10.0 M; cumplimiento 95.0 % |
| **Cierre · evolución · contribución** | cierre: $14.3 M (−5.0 % vs meta); evolución: +2.0 % vs agosto 2026 (mismos días); venta comparable $9.3 M; «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: Interpretación de las combinaciones pendientes entre sesiones, pedidos y venta. Diagnóstico con reservas. |
| **Clasificación del dato (C1, C2)** | Dato inconsistente (pendiente de interpretación): Hay venta en el periodo con cero pedidos registrados: combinación pendiente de interpretación. · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: con reservas · evolución: valorable · conversión: pendiente de interpretacion · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Nada se oculta |
| **Advertencias necesarias** | Hay venta en el periodo con cero pedidos registrados: combinación pendiente de interpretación. Margen no configurado: no se estima contribución. |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos de calidad de datos · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A14 — Venta de la actividad distinta de la venta del periodo *(adicional)*

*Origen de las cifras:* ilustrativo (C2: sin tolerancia documentada no se declara conciliada ni inválida; diferencia de 0.4 %, inferior al 1 % rechazado). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad media** (modo «con_avisos») — motivos visibles en Z1: La venta del agregado de actividad y la venta del periodo no coinciden: conciliación pendiente de definición. (tope de diseño: no puede ser Alta — La venta del agregado de actividad y la venta del periodo no coinciden: conciliación pendiente de definición.) |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: inconsistencia pendiente de interpretación → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Media |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo, datos_con_avisos (rotulado «con avisos») |
| **Veredicto permitido** | Tipo «riesgo_cumplimiento»: «Con avisos: la venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Conclusión con reservas.» |
| **Narrativa corta** | «La evolución contra agosto 2026 es ligeramente positiva. La lectura va con avisos; sus motivos están a la vista.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $9.5 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 95.0 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan», con una evolución de +2.0 % contra agosto 2026 (mismos días). **Limitaciones:** La venta del agregado de actividad y la venta del periodo no coinciden: conciliación pendiente de definición. No se estima contribución: el margen no está configurado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $14.3 M, 5.0 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$500 mil** (por debajo); base: plan de los mismos 22 días; venta observada $9.5 M; meta acumulada $10.0 M; cumplimiento 95.0 % |
| **Cierre · evolución · contribución** | cierre: $14.3 M (−5.0 % vs meta); evolución: +2.0 % vs agosto 2026 (mismos días); venta comparable $9.3 M; «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: Interpretación de las combinaciones pendientes entre sesiones, pedidos y venta. Diagnóstico con reservas. |
| **Clasificación del dato (C1, C2)** | Dato inconsistente (pendiente de interpretación): La venta del agregado de actividad y la venta del periodo no coinciden: conciliación pendiente de definición. · conciliación de ventas: pendiente de definición |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: con reservas · evolución: valorable · conversión: observable · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Nada se oculta |
| **Advertencias necesarias** | La venta del agregado de actividad y la venta del periodo no coinciden: conciliación pendiente de definición. Margen no configurado: no se estima contribución. |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos de calidad de datos · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A15 — Información parcial con venta cero: pedidos sin medir *(adicional)*

*Origen de las cifras:* ilustrativo (C3: falta información secundaria relevante para evaluar el cero; Baja, y nunca «conversión cero»). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad baja** (modo «preliminar») — motivos visibles en Z1: La venta del periodo es cero y falta la medida de sesiones o de pedidos: no se puede completar la evaluación de ese resultado. |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: limitación (falta información secundaria relevante) → 3. Existencia y comparabilidad de la base de referencia: comparación no válida (solo afecta a la evolución) → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Baja |
| **Estado ejecutivo** | No se emite etiqueta de estado (lectura preliminar; el estado interno quedaría en «En riesgo de incumplir el plan» pero no se afirma) |
| **Veredicto permitido** | Tipo «preliminar»: «Lectura preliminar: la venta acumulada parece estar por debajo de la meta, pero los datos tienen limitaciones y no permiten una conclusión definitiva.» |
| **Narrativa corta** | «Corrige los datos antes de decidir con esta lectura.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $0 contra una meta acumulada de $5.0 M. **Interpretación:** La diferencia observada es una interpretación preliminar: los datos no respaldan una lectura definitiva. **Limitaciones:** La venta del periodo es cero y falta la medida de sesiones o de pedidos: no se puede completar la evaluación de ese resultado. No se estima contribución: el margen no está configurado. **Implicación:** Conviene corregir los datos antes de actuar sobre esta diferencia. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$5.0 M** (por debajo) · rotulada «preliminar»; base: plan de los mismos 22 días; venta observada $0; meta acumulada $5.0 M; cumplimiento 0.0 % |
| **Cierre · evolución · contribución** | cierre: —; evolución: —; «Margen no configurado · Configurar» (línea discreta; sin importe ni 0) |
| **Comparación** | Sin base comparable — no permite afirmar crecimiento ni deterioro |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan (preliminares). No se puede concluir: Evolución contra el comparable; Diagnóstico del comportamiento comercial; Conversión del periodo (falta la medida de sesiones o de pedidos). Diagnóstico no concluyente. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: preliminar · evolución: no valorable · conversión: no verificable · contribución: no configurado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Lectura condicionada (motivos) · Alcance: qué se conoce y qué no · Contribución bruta estimada / margen |
| **Qué no se muestra** | Cierre proyectado (el cierre proyectado no se afirma con esta confiabilidad o sin brecha válida) · Evolución vs comparable (sin lectura definitiva no se valora la evolución) |
| **Advertencias necesarias** | La venta del periodo es cero y falta la medida de sesiones o de pedidos: no se puede completar la evaluación de ese resultado. Margen no configurado: no se estima contribución. Comparación: Sin base comparable. |
| **Se deriva a otras zonas** | Z2: Diagnóstico no concluyente (solo lo observado) · Z3: Hallazgos de calidad de datos · Z4: Acción de datos antes que cualquier recomendación · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Escenario A16 — Margen de 0 % sin evidencia de configuración *(adicional)*

*Origen de las cifras:* ilustrativo (C5: un 0 sin fecha de configuración no demuestra una configuración real; no se estima nada). *Comparación con lo esperado:* la salida de la especificación coincide con el comportamiento esperado (razonado desde Fase 2 y las decisiones).

| Aspecto | Resultado |
|---|---|
| **Confiabilidad** | **Confiabilidad alta** (modo «definitiva») — sin motivos que advertir |
| **Orden de evaluación (D-05)** | 1. Integridad y suficiencia de los datos: ok → 2. Actividad observable: ok → 3. Existencia y comparabilidad de la base de referencia: ok → 4. Indicadores y denominadores: ok → 5. Cambios de composición y límites de atribución: ok → 6. Nivel de confiabilidad final: Alta |
| **Estado ejecutivo** | **En riesgo de incumplir el plan** · calificadores: cierre_en_riesgo |
| **Veredicto permitido** | Tipo «riesgo_cumplimiento»: «La venta acumulada está por debajo de la meta; el cierre proyectado no la alcanzaría. Lectura sustentada en datos completos.» |
| **Narrativa corta** | «La evolución contra agosto 2026 es ligeramente negativa. Se apoya en 22 días contados y en datos sin avisos.» |
| **Narrativa ampliada** | **Hecho observado:** Al 22 sep 2026, la venta observada de Septiembre 2026 es $9.3 M contra una meta acumulada de $10.0 M. **Interpretación:** Con 93.0 % de cumplimiento acumulado, el estado es «En riesgo de incumplir el plan», con una evolución de −1.5 % contra agosto 2026 (mismos días). **Limitaciones:** No se estima contribución: el margen de 0 % no está confirmado. **Implicación:** Si el ritmo actual se mantiene, el periodo cierra en $14.1 M, 6.0 % por debajo de la meta. |
| **Indicador económico** | Brecha vs plan a la fecha: **−$700 mil** (por debajo); base: plan de los mismos 22 días; venta observada $9.3 M; meta acumulada $10.0 M; cumplimiento 93.0 % |
| **Cierre · evolución · contribución** | cierre: $14.1 M (−6.0 % vs meta); evolución: −1.5 % vs agosto 2026 (mismos días); venta comparable $9.4 M; «Margen sin confirmar · Revisar» (línea discreta; sin importe ni 0; hay un 0 % sin evidencia de configuración) |
| **Comparación** | Comparación válida |
| **Alcance (Se conoce / No se puede concluir)** | Se conoce: Venta observada del periodo; Cumplimiento y brecha contra el plan. No se puede concluir: —. Diagnóstico disponible. |
| **Clasificación del dato (C1, C2)** | Dato válido · conciliación de ventas: sin diferencia observada (no equivale a conciliación validada) |
| **Conclusiones por separado (C3)** | venta observada: valida · cumplimiento: concluyente · evolución: valorable · conversión: observable · contribución: no confirmado |
| **Qué se muestra** | Estado · Confiabilidad · Periodo y comparación · Veredicto · Narrativa corta · Narrativa ampliada (bajo demanda) · Indicador económico principal · Cierre proyectado · Evolución vs comparable · Contribución bruta estimada / margen |
| **Qué no se muestra** | Lectura condicionada (motivos) (confiabilidad alta: no hay motivos que advertir) · Alcance: qué se conoce y qué no (confiabilidad alta: todo lo que Z1 muestra es concluyente) |
| **Advertencias necesarias** | Ninguna |
| **Se deriva a otras zonas** | Z2: Puente de drivers con estado de atribución · Z3: Hallazgos, riesgos y oportunidades · Z4: Acciones destacadas · Z5: Tablas de cifras y canales; Confiabilidad y cobertura |

## Nombres visibles (D-06)

Los identificadores internos no cambian (son los del contrato de Fase 2). En pantalla solo se usa el nombre visible.

| Familia | Identificador interno | Nombre visible | Explicación para el usuario |
|---|---|---|---|
| estados | `saludable` | Cumpliendo el plan | La venta acumulada está en línea o por encima del plan y no hay alertas importantes. |
| estados | `creciendo` | En crecimiento | La venta crece contra el periodo comparable y va en línea o por encima del plan. |
| estados | `creciendo_bajo_potencial` | Crece, pero sin alcanzar el plan | La venta crece contra el comparable, pero queda por debajo del plan o el cierre proyectado está en riesgo. |
| estados | `riesgo_cumplimiento` | En riesgo de incumplir el plan | La venta o el cierre proyectado quedan por debajo del plan, o hay una alerta crítica activa. |
| estados | `deterioro` | En deterioro | La venta cae contra el periodo comparable y además queda por debajo del plan o el cierre está en riesgo. |
| estados | `sin_base` | Sin lectura concluyente | Falta información válida y suficiente para emitir un estado del negocio. |
| confiabilidad | `Alta` | Confiabilidad alta | Datos completos y comparables: la lectura puede sostenerse. |
| confiabilidad | `Media` | Confiabilidad media | Hay avisos o cobertura parcial: la lectura se emite con reservas visibles. |
| confiabilidad | `Baja` | Confiabilidad baja | Hay datos observables, pero con errores que impiden una conclusión sólida: solo hay lectura preliminar. |
| confiabilidad | `Insuficiente` | Confiabilidad insuficiente | Falta información válida o suficiente: no se emite lectura. |
| comparabilidad | `valida` | Comparación válida | Existe un periodo comparable con actividad y pedidos: la evolución puede valorarse. |
| comparabilidad | `sin_base_comparable` | Sin base comparable | No hay periodo comparable con el que valorar la evolución. |
| comparabilidad | `recuperacion_desde_cero` | Recuperación desde cero | El periodo comparable no registró pedidos: no hay porcentaje de evolución que mostrar. |
| comparabilidad | `cambio_de_composicion` | Cambio de composición | Los canales o segmentos no son los mismos que en el comparable: la evolución no es directa. |
| comparabilidad | `datos_insuficientes` | Datos insuficientes | Faltan datos del comparable para valorar la evolución. |
| comparabilidad | `sin_actividad` | Sin actividad | No hay actividad registrada que comparar. |
| comparabilidad | `no_calculable` | Resultado no calculable | Hay valores negativos o inconsistentes: no se calcula. |
| contribucion | `disponible` | Contribución bruta estimada | Estimación con el margen bruto promedio general; no es utilidad ni beneficio real. |
| contribucion | `no_configurado` | Margen no configurado · Configurar | Sin margen no se estima contribución. |
| contribucion | `desactivado` | Margen desactivado · Configurar | El margen está guardado pero desactivado. |
| contribucion | `invalido` | Margen no válido · Revisar | La validación del motor rechazó el margen guardado: no se estima contribución. |
| contribucion | `no_confirmado` | Margen sin confirmar · Revisar | Hay un margen de 0 % sin evidencia de haber sido configurado: no se estima contribución. |
| diagnostico | `disponible` | Diagnóstico disponible | La explicación del resultado puede sostenerse. |
| diagnostico | `con_reservas` | Diagnóstico con reservas | La explicación se emite con los avisos indicados. |
| diagnostico | `no_concluyente` | Diagnóstico no concluyente | Solo se muestra lo observado; no se explica el porqué. |
| diagnostico | `no_disponible` | Diagnóstico no disponible | No hay información suficiente para diagnosticar. |
