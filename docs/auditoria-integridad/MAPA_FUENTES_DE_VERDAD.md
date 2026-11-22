# Mapa de fuentes de verdad (por indicador)

> Commit `625daec`. Evidencia: `grep` sobre `js/`, lectura de código y reproducciones. «Fuente única verificable» = una función o contrato del que dependen todos los consumidores. **Marcado ⚠ cuando hay más de una implementación**; «no se probó divergencia» donde corresponda.

## 1. Flujo de la información
`Entrada` (CSV/XLSX/Sheets/GA4; datos de prueba) → `import/*` y `workers/import-worker.js` (lectura y traducción) → `quality/rules.js`/`validation.js` (reglas, cuarentena) → **confirmación del usuario** (staging) → `data/data-store.js` (colecciones `historical`, `plan`, `actual`, `segments`; modelo canónico) y `products/productStore.js` + `customerStore.js` (IndexedDB) → motores (`calculations/`, `forecast/`, `diagnostics/`, `analytics/`, `scenarios/`) → estado compartido `FP.app.state` (`app.js`, ≈ 6 000 líneas) → vistas (`ui/*`) → narrativa (`narrative/`, `ai/cohere*`, solo redacta) → exportaciones. Persistencia: `localStorage` (preferencias, metas, plan de acción) vía `storage/repository.js`; IndexedDB (productos, clientes, lotes); nube Supabase solo con sesión (**no probada**).

## 2. Indicador por indicador
| Indicador | Fuente de verdad declarada | Otras implementaciones | ¿Única y verificable? |
|---|---|---|---|
| Venta real / plan (datos) | `data-store` colecciones `actual`/`plan` | — | **Sí** (registros canónicos) |
| Plan: dos conceptos | (a) dataset «Plan/Meta» cargado → `plan` (lo usan Pacing y Home); (b) plan **generado** desde metas anuales (`forecast/planningEngine.js`, página Plan) | La página Plan no reconoce el plan cargado («Todavía no hay plan para 2026» con 120 registros de plan) | ⚠ **No**: dos orígenes sin vínculo visible |
| Brecha (real − plan), gapPct, cumplimiento | `calculations/gap.js` (`calcGap`, `metrics.js`) | `reportBuilder.js:698`, `reforecastEngine.js:225`, `planBridgeEngine.js:17`, `changeEngine.js:130` | ⚠ 5 implementaciones; no se probó divergencia |
| Estado frente al plan («en plan», «por debajo») | — | `home-resumen.js:41` (banda ±2 % `planBand`) **y** `contextEngine.js:164` (umbral 0.05 %) | ⚠ **Contradicción confirmada**: titular «Vas en plan: 99.8 %» y chip «Venta acumulada 0.2 % por debajo del plan» |
| Sesiones / tráfico | `traffic_volume` del dataset real (Pacing, Diagnóstico 1) | archivo **Segmentos** GA4 (Tráfico y conversión, Diagnóstico 2) | ⚠ **Dos fuentes** que pueden no coincidir |
| Conversión (CR = pedidos/sesiones) | `model/derivations.js` (`conversion_rate`, `metrics.calcConversionRate`) | `reforecastEngine.js:116` (con respaldo al CR cargado), `segments-view.js:228`, `px-ficha.js:119`, motor de atribución | ⚠ ≥ 4 implementaciones |
| Ticket promedio (AOV = venta/pedidos) | `derivations.js` (`aov`) | `reforecastEngine.js:117`, `planningEngine.js:201`, `opportunityEngine.js:131`, `px-view.js:145` | ⚠ ≥ 4 implementaciones |
| Identidad Venta = Volumen × CR × AOV | `diagnostics/attribution.js` (secuencial/Shapley; Σ cierra exacto) | `trafficConversionEngine.js` la consume | **Sí** (64 pruebas de atribución + 233 del motor) |
| Forecast de cierre | `forecast/forecastEngine.js` (+ `forecastConfidence`, `forecastCalibration`) | `reforecastEngine.js` (pendiente del periodo) | **Sí** para forecast; reforecast es otro concepto |
| Confiabilidad | `quality/health.js`, `coverage.js`, `forecastConfidence.js` | chip del Home (`contextEngine`), «Confiabilidad» de Pacing | ⚠ sin un contrato único (Fase 3 define 4 niveles: no existen en `js/`) |
| Clientes / LTV | `customerStore` (libro de pedidos) → `customerEngine` | — | **Sí** |
| Impacto económico | contrato `cc.economic_impact` v2 (`impactModel.js`) | cálculos en bruto en cada motor | ⚠ **Contrato sin consumidores** |
| Atribución | `attribution.js` | `driverEngine`, `trafficConversionEngine` la reutilizan | **Sí** |
| Recovery / acciones | `scenarios/recoveryEngine` → escenarios guardados → `actions/actionPlan` (clave anual en localStorage) | — | **Sí**, con cadena hipótesis → escenario → acción → medición |
| Hallazgos (qué requiere atención) | `analytics/attentionEngine.js` (tipos gap, driver, forecast, channel, data, followup) | `riskOpportunityEngine.js` (sin consumidores de producción), `hypothesisEngine`, `signalEngine` | ⚠ sin contrato de hallazgo (`cc.finding` solo en `tools/audit`) |

## 3. Datos reales, simulados, derivados e históricos
Simulados: `data/mock-*.js` (solo botones de demo). Derivados: todo lo anterior salvo `actual`/`plan`/`historical`/`segments`/productos. Históricos: colección `historical` (estacionalidad) y la base comparable de atribución. **No se encontraron datos reales en el repositorio**; la config apunta a un proyecto Supabase real (llave publicable), **no usado** en esta auditoría.
