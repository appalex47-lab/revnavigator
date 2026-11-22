# Roadmap consolidado

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


**Subfase actual: 4.1 — técnicamente consolidada, lista para evaluación de aceptación. 4.2 NO iniciada.**
Leyenda: ✅ confirmado/aceptado · 🟦 recomendado · 🟧 pendiente de autorización · 🛠 implementado · ⏳ pendiente de implementación.

| Fase | Estado | Alcance | Resultado | Limitaciones | Dependencias | Autorización pendiente |
|---|---|---|---|---|---|---|
| 1 Auditoría/línea base | ✅ Aceptada | inventario y contratos iniciales | docs aceptados | — | — | — |
| 2 Contratos Command Center | ✅ Aceptada | cc.finding v1, clasificación, impacto v2 | specs + pruebas | — | 1 | — |
| 3 (3.1–3.5) Diseño/spec del Home | ✅ Aceptada (diseño/spec) | Z1–Z5, D-01…D-07 | specs aceptadas | Home real sin integrar | 2 | — |
| **4.1 Integridad y contraste** | 🛠 **Consolidada** (pendiente de tu aceptación) | regla de estado unificada en 2 sitios; política de sesiones; matriz de 21 reimplementaciones; P-04 investigado; contratos `cc.finding/1.1`, `cc.reliability/1`, `cc.sample/1`, `cc.plan_status/1` y catálogo en `js/commandCenter` (no integrados) | 217 pruebas nuevas; 117 scripts Node, 5 verificadores y 22 lotes de navegador sin fallas | L-01…L-08 | 3 | aceptación de 4.1; P-11…P-16 |
| 4.2 Estado y confiabilidad en la aplicación | ⏳ Propuesta, **no autorizada** | portar Z1; cargar y consumir `planStatus`/`reliability`/`sampleSufficiency`; migrar oleada 1 de fórmulas | — | — | 4.1 aceptada, P-12, P-13, P-15 | Sí |
| 4.3 Hallazgos | ⏳ Propuesta | consumir `findings` desde Atención/Home | — | — | 4.2 | Sí |
| 4.4 Acciones | ⏳ Propuesta | `actionRef` y seguimiento | — | — | 4.3 | Sí |
| 4.5 Impacto económico | ⏳ Propuesta | resolver D-01 y D-06 (`impactModel`, `combineImpacts`) | — | — | 4.3 | Sí (P-06/P-07) |
| 4.6 Integración Home | ⏳ Propuesta | Command Center en el Home real | — | — | 4.2–4.5 | Sí (P-09) |
| 5 Validación con datos reales | ⏳ Propuesta | pilotos controlados; conciliación GA4 | — | — | 4.x | Sí |
| 6 Operación | ⏳ Propuesta | release y monitoreo | — | — | 5 | Sí |
