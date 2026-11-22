# Matriz de contratos y consumidores (estado real tras 4.2)

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


Criterio: «consumidor» = código de la aplicación (cargado por `index.html`) que **lee** el contrato o la función central. Probado en `test-fase4-1-contratos-js.js` (D5), `test-fase4-1-estado-consumidores.js`, `test-fase4-2-*` y `batch_fase4_2_contratos.py`.

| Contrato | Consumidor | Estado previo | Estado final | Evidencia |
|---|---|---|---|---|
| **planStatus** `cc.plan_status/1` (delegado en `FP.gap.pacingStatus`) | `ui/guidance/home-resumen.js` (titular del Inicio) | regla propia ±2 % → (4.1) `FP.gap.pacingStatus` directo | **usa `FP.planStatus.classify`** con umbrales efectivos | 15 pruebas + batch navegador B1–B3 |
| | `ui/guidance/contextEngine.js` (frase del Inicio) | umbral 0.05 % → (4.1) `FP.gap.pacingStatus` | usa la **regla central** `FP.gap.pacingStatus` con umbrales efectivos (no pasa por el contrato) | A2, B2 |
| | Pacing (`pacing-view`, `pc-resumen`), `home-view`, `home-summary-view`, `homeSummaryEngine`, `attentionEngine`, `forecastEngine` | `FP.gap.pacingStatus` | sin cambio (ya usan la regla central; `pacing-view`/`pc-resumen` ya sin el estado por defecto, 4.1) | batch `pacing*`, `inicio*` |
| | **Exportación** `forecastExport.js` (`pacing_status`) | `p.pacingStatus` con umbral **por defecto** (ignoraba el del usuario) | `FP.gap.pacingStatus(compliance, run.settings.pacingThresholds)`; campo `pacingStatus` de `summarizePeriod` **eliminado** | batch C1–C3 (66 periodos; umbral por defecto y personalizado; paridad con la píldora de Pacing) |
| **reliability** `cc.reliability/1` | — (productor: Z1) | no existía en `js/` | contrato + Z1 integrados entre sí y probados; **sin consumidor en la aplicación** | `test-fase4-2-z1-evaluador` D1–D3; batch A1 (no cargado) |
| **z1 / businessState** | — | solo especificación | disponibles en `js/`; **sin consumidor** | `test-fase4-2-z1-evaluador` (22) |
| **sampleSufficiency** `cc.sample/1` | `analytics/trafficConversionEngine.js` (2 sitios) | constante 500 / 1 % copiada | `segmentMinSessions` | `test-fase4-2-p16` (12) |
| | `ui/segmentInsights.js` | constantes propias | `segmentMinSessions` | ídem |
| | `report/reportBuilder.js` | constantes propias | `segmentMinSessions` | ídem + `test-report-*`, golden |
| | `sampleSufficiency.evaluate` | — | **sin consumidor en la aplicación** (solo el helper de P-16) | escenarios S7, S9 |
| **findings** `cc.finding/1.1` | — | spec | sin cambios, **sin consumidor** (4.3) | `contratos-js` C1–C5 |
| **catálogo de métricas** | funciones canónicas `FP.metrics.calcGap` | 6 sitios de brecha propios | consumida por `changeEngine.js` (GAP-3) y `driverEngine.js` (GAP-6) | `test-fase4-2-p13` (10) |
| | `metricCatalog.js` (catálogo, `SESSIONS_POLICY`, `reconcileSessions`) | — | **no cargado; sin consumidor** | `contratos-js`, `sesiones`, escenarios S10 |

## Comprobaciones de los consumidores autorizados
- **Leen el contrato correcto / no reimplementan reglas:** Inicio (titular y contextEngine), exportación y Pacing usan la **única** regla; `businessState` (Z1) y `planStatus` **invocan** `FP.gap.pacingStatus`; los motores de segmentos y el reporte leen la **única** configuración del mínimo de sesiones (C3 cambia la config y ambos motores cambian).
- **No alteran resultados en los casos equivalentes:** estado con 20 000 × 4 configuraciones; P-16 en 20 013 tráficos; GAP-3/6 bit a bit.
- **Datos ausentes:** sin plan → `plan_unavailable` y la venta observada se conserva; sesiones ausentes → conversión «no verificable»; cero real ≠ ausencia (T3).
- **No concluyen sin evidencia:** sin sesiones/pedidos/venta Z1 no emite cumplimiento ni nivel Alta (T4).

## Qué NO se conectó (a propósito)
El Command Center visual, la maqueta de Fase 3 y el Home real (solo se cambió la **clasificación** del titular, no su diseño); `reliability`, `z1`, `findings` y el catálogo no tienen consumidores todavía.
