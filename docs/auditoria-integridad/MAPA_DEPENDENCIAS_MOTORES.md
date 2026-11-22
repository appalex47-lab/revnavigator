# Mapa de dependencias de motores

> Commit `625daec`. «Consumidores» = archivos de `js/` (distintos del propio módulo) que referencian `FP.<motor>` (barrido automático de los 233 módulos `FP.*`). «Pruebas» = archivos de `tools/` (tests Node y lotes de navegador) que lo mencionan. **Estado**: *operativo* (consumido en producción y probado), *conectado parcialmente*, *sin consumidores de producción*. Entradas/salidas resumidas de la cabecera de cada archivo.

## 1. Cadena principal de cálculo
`dataStore (actual/plan/historical/segments)` → `calculations/metrics` + `gap` + `pacing` + `seasonality` → `forecast/planningEngine` → `forecastEngine` (+`forecastConfidence`, `forecastCalibration`) → `reforecastEngine` → `diagnostics/driverEngine` (+`attribution`) → `diagnosticEngine` (+`hypothesisEngine`, `signalEngine`) → `scenarios/scenarioEngine` / `recoveryEngine` → `actions/actionPlan` → `ui/guidance/measure-view`. Capa de lectura del Home: `contextEngine` → `homeSummaryEngine` + `attentionEngine` → `home-resumen`/`home-view`.

## 2. Tabla de motores
| Motor | Entradas | Salidas | Consumidores | Estado | Pruebas |
|---|---|---|---|---|---|
| `calculations/metrics` | valores numéricos | divisiones seguras, brecha, CR, AOV | **38** | Operativo (base) | 9 |
| `calculations/gap` | plan, real | gap, gapPct, cumplimiento, forecastGap | 9 | Operativo | 1 |
| `calculations/pacing` | plan, real, calendario | ritmo, estado de pacing | 7 | Operativo | 0 directas |
| `forecast/planningEngine` | metas anuales, histórico, calendario | plan distribuido (canal × día) | 10 | Operativo | 2 |
| `forecast/forecastEngine` | plan, real, pacing | forecast de cierre, gap esperado | 10 | Operativo | 4 |
| `forecast/forecastConfidence` / `forecastCalibration` | corridas, histórico | confiabilidad del forecast | 7 / 4 | Operativo | 4 / 2 |
| `forecast/reforecastEngine` | plan original, real, pesos | pendiente por repartir, reforecast | 4 | Operativo | 2 |
| `diagnostics/attribution` | pares de periodos (T, CR, AOV) | contribuciones secuencial/Shapley (Σ exacta) | 3 | Operativo, **fuente única** de la identidad | 8 |
| `diagnostics/driverEngine` | pares diarios, atribución | drivers nivel 1 | 3 | Operativo | 2 |
| `diagnostics/diagnosticEngine` | forecast, reforecast, store, calidad | brecha, drivers, señales, hipótesis | 5 | Operativo | 1 |
| `analytics/trafficConversionEngine` | segmentos, periodos | descomposición T→CR→AOV por segmento | 8 | Operativo (depende de Segmentos) | 8 |
| `analytics/homeSummaryEngine` | corrida, diagnóstico, segmentos | 4 bloques del resumen del Inicio | 6 | Operativo; **compone**, no calcula | 1 |
| `analytics/attentionEngine` | `contextEngine`, resumen | lista «Qué necesita atención» y «siguiente mejor paso» (6 tipos) | 2 | Operativo; **sin clases riesgo/oportunidad** | 6 |
| `ui/guidance/contextEngine` | estado global | estado de datos, titulares, requisitos | 8 | Operativo; **umbral propio de «por debajo»** | 4 |
| `analytics/changeEngine` | corrida y foto previa | «qué cambió desde ayer» | 3 | Operativo; recalcula brecha propia | 1 |
| `scenarios/scenarioEngine` | drivers, cambios | simulación determinista | 8 | Operativo | 6 |
| `scenarios/recoveryEngine` | gap, restricciones | alternativas que cierran la brecha | 3 | Operativo | 2 |
| `impact/impactCalculator` | resultado de escenario | impacto esperado | 1 | Parcial (solo `scenarioEngine`) | 0 |
| `actions/actionPlan` (+`actionTracking`) | escenario guardado + hipótesis | acciones, historial, mediciones | 4 | Operativo | 6 |
| `analytics/actionPriorityEngine` | patrones, riesgos/oportunidades | prioridades por impacto en venta (arrastre/compensación/seguimiento) | 1 (`app.js`) | Parcial (no lo consume el Home) | 6 |
| `analytics/riskOpportunityEngine` | señales de tendencias | riesgos y oportunidades priorizados | **1 (solo `self-test.js`)** | **Sin consumidores de producción** | 1 |
| `analytics/patternEngine`, `trendEngine`, `shareMixEngine`, `contributionEngine`, `pvmEngine`, `cohortEngine` | histórico por entidad | patrones, tendencias, mezcla, contribución | 1–5 cada uno (vía `app.js`/vistas de Análisis) | Operativos en Producto/Evolución | 0–5 |
| `analytics/customerEngine` + `products/customerStore` | libro de pedidos | clientes, cohortes, retención, LTV | 6 / 5 | Operativo (ver H‑01) | 7 |
| `analytics/basketEngine` | libro de pedidos | cross‑sell | 2 | Operativo | 1 |
| `promotions/opportunityEngine` | ofertas, histórico | oportunidades de promoción (con su propio impacto) | — | Operativo; impacto sin contrato | — |
| `economics/impactModel` (`FP.economics`) | impactos en ventas, margen | contrato de impacto v2, contribución, `combineImpacts` | 2 (**solo configuración de margen**) | **Implementado, desconectado** | 3 |
| `narrative/narrativeEngine`, `ai/cohere*` | resultados ya calculados | texto (redacta, no calcula) | 4 | Operativo; Cohere **no probado** | 1–3 |
| `report/*` | todo lo anterior | informe PDF | — | Operativo (no probado en esta auditoría) | 3+ |

## 3. Clasificación
- **Operativos y confiables (evidencia: 233 pruebas del motor + 64 atribución + 64 economía + 8 tráfico + 15 funnel):** metrics, gap, pacing, planning, forecast, reforecast, attribution, driver/diagnostic, trafficConversion, scenario/recovery, actionPlan, customer.
- **Parcialmente conectados:** `actionPriorityEngine` (no llega al Home), `impactCalculator`, `FP.economics` (solo configuración).
- **Duplicados / con lógica repetida:** brecha (5), CR (≥ 4), AOV (≥ 4), estado frente al plan (2). Ver `MAPA_FUENTES_DE_VERDAD.md`.
- **Sin consumidores de producción:** `riskOpportunityEngine` (solo prueba), `analysisArchitecture`, `reportContent`, `responsiveTables` (barrido: 0 consumidores en `js/`).
- **Resultados inconsistentes confirmados:** solo la **contradicción de umbrales** entre el titular del Inicio (±2 %) y el chip de `contextEngine` (0.05 %). Ninguna inconsistencia numérica entre motores fue probada.
- **Principio de negocio:** `attribution.js` implementa Venta = Sesiones × CR × AOV con Σ exacta; `segments-view` declara «CR y AOV salen de sumas, nunca de promedios»; la narrativa **solo redacta** (`homeSummaryEngine`: «no crea un cálculo nuevo»).
