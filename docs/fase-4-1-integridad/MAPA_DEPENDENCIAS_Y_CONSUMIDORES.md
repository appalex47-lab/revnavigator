# Mapa de dependencias y consumidores (consolidado)

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


## Regla de estado frente al plan (P-01)
```
FP.config.forecast.pacingThresholds ─► (efectivo: run.settings.pacingThresholds, editable / sugerencia)
        └─► FP.gap.pacingStatus ─► forecastEngine · attentionEngine · pacing-view · pc-resumen · home-view · home-summary-view · homeSummaryEngine
                              └─► [NUEVO] home-resumen (titular del Inicio) · contextEngine (frase del Inicio)
planStatus.js (cc.plan_status/1) ── equivalente ──► FP.gap.pacingStatus     (sin consumidores: preparado)
Se conservan con escala propia: chg-resumen/changeEngine (ayer/semana) · analistaStory (cierre vs meta) · reportCopy / reportBuilder.readout / config.report (reporte)
```
## Contratos `js/commandCenter/` (todos: sin consumidores, `index.html` no los carga — prueba D5)
```
planStatus ──► FP.config, FP.gap (misma regla)
metricCatalog ──► (referencias a FP.metrics, FP.gap, FP.derivations…; SESSIONS_POLICY; reconcile / reconcileSessions)
findings ──► FP.economics.validateImpact           (port de Fase 2 + extensión 4.1)
reliability ──► evaluación de Z1 (o1, entrada)     (nivel NO recalculado)   ◄── Z1: especificación en tools/audit (sin port)
sampleSufficiency ──► FP.config.forecast.minComparableDays / minWindowCoverage
```
## Consumidores futuros
| Contrato | Consumidores previstos | Fase |
|---|---|---|
| `planStatus` | Home, Diagnóstico, Pacing, Atención, Cambios, Reportes | 4.2 |
| `reliability` + Z1 port | Command Center | 4.2 |
| `findings` | Atención / Home | 4.3 |
| `sampleSufficiency` | confiabilidad (dimensión `sample`), motores de diagnóstico | 4.2–4.3 |
| `metricCatalog` | los 21 sitios en oleadas | 4.2+ |
| impacto (D-01/D-06) | Home | 4.5 |

## Matriz de consumidores de las métricas
Brecha: reportBuilder, planBridgeEngine, changeEngine, reforecastEngine, driverEngine (+ `FP.gap` canónica en Pacing/forecast). CR/AOV: segments-view, trafficConversionEngine, projection, reforecastEngine, opportunityEngine, segmentInsights, attribution (+ `FP.metrics` canónica). Detalle y clase de equivalencia en `CATALOGO_METRICAS_CANONICAS.md`.
