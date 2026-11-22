# Roadmap consolidado — RevNavigator Command Center Intelligence

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


**Subfase actual: 4.2 — completada con limitaciones documentadas, pendiente de tu revisión y aceptación. 4.3 NO iniciada.**
Las decisiones aceptadas no se modifican retrospectivamente; las correcciones a 4.1 se declaran en `MATRIZ_MIGRACION_P13.md`.

| Fase | Estado | Alcance | Resultado | Limitaciones | Dependencias | Autorización pendiente |
|---|---|---|---|---|---|---|
| 1 Auditoría/línea base | ✅ Aceptada | inventario y contratos iniciales | docs aceptados | — | — | — |
| 2 Contratos Command Center | ✅ Aceptada | cc.finding v1, clasificación, impacto v2 | specs + pruebas | — | 1 | — |
| 3 (3.1–3.5) Diseño/spec del Home | ✅ Aceptada (diseño) | Z1–Z5, D-01…D-07; la maqueta es **referencia de diseño**, no integración | specs aceptadas | Home real sin integrar | 2 | — |
| 4.1 Integridad y contraste | ✅ Consolidada (entregada; P-01…P-16 resueltas) | regla de estado, sesiones, fórmulas, contratos | 276 pruebas (4.1+4.2) | L-01…L-08 de 4.1 | 3 | revisión del usuario |
| **4.2 Integración de contratos** | 🛠 **Completada con limitaciones** | Z1 + businessState portados; reliability integrada con Z1; `cc.sample` y P-16 conectados; P-12; P-13 (2 de 3); `planStatus` en el titular del Inicio | 59 pruebas nuevas + 9 de navegador; 121 scripts Node, 5 verificadores, 49 lotes sin fallas | L-01…L-10 (`LIMITACIONES_Y_RIESGOS.md`) | 4.1 | aceptación de 4.2; P-17…P-21 |
| 4.3 Hallazgos y consumo de confiabilidad | ⏳ Propuesta, **no autorizada** | consumir `findings`, `reliability`/`z1`, `sampleSufficiency.evaluate`; estados `plan_unavailable/no_activity/not_comparable` | — | — | 4.2 aceptada, P-17, P-19, P-20 | Sí |
| 4.4 Acciones | ⏳ Propuesta | `actionRef` y seguimiento | — | — | 4.3 | Sí |
| 4.5 Impacto económico | ⏳ Propuesta | D-01, D-06 (`impactModel`, `combineImpacts`) | — | — | 4.3 | Sí (P-06/P-07) |
| 4.6 Integración Home / Command Center | ⏳ Propuesta | Command Center visual en el Home real | — | — | 4.2–4.5 | Sí (P-09) |
| 5 Validación con datos reales | ⏳ Propuesta | pilotos; conciliación GA4 | — | — | 4.x | Sí |
| 6 Operación | ⏳ Propuesta | release y monitoreo | — | — | 5 | Sí |

Leyenda: ✅ aceptado/entregado · 🛠 implementado en esta subfase · ⏳ no iniciado.
