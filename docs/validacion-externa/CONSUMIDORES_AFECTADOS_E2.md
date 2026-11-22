# Cálculos de tráfico y conversión que todavía pueden consumir los periodos afectados por E-2

Complemento de [`LIMITACION_E2_TRAFFIC_VOLUME.md`](LIMITACION_E2_TRAFFIC_VOLUME.md). **Estado: la aplicación NO excluye esos periodos** (decisión pendiente del usuario; este documento no cambia ningún comportamiento).

Método: lectura del código (`grep` de `trafficVolume`, `conversionRate`, `.sessions`, `calcConversionRate` en `js/`) y de la fuente de datos de cada módulo. **No se ejecutó cada consumidor con los datos reales**: es un inventario por código, no una medición de impacto.

## Periodos de riesgo
Cualquier ventana que incluya días con `traffic_volume` no confiable:
- ecommerce: días **anteriores a 2026-10-05**; app: días **anteriores a 2026-09-25**, y app 2026-10-02.
- Por tanto: año y acumulado del año (YTD), trimestres Q1–Q3 y Q4 parcial, meses enero–septiembre, **octubre** (ecommerce 1–4 y app 2/10), semanas hasta la del 04/10, y **cualquier comparación contra el mes/semana anterior que cruce el quiebre** (p. ej. octubre vs septiembre: la base es la afectada). Desde el 05/10 (ecommerce) / 25/09 (app) la serie coincide con GA4 con diferencias ≤ ~1 % en total.

## A. Consumen la SERIE DIARIA real (pueden usar días afectados)
| Consumidor (código) | Qué calcula con tráfico/conversión | Ventana típica afectada |
|---|---|---|
| `js/calculations/pacing.js`, `js/forecast/performanceIndex.js`, `js/ui/pacing-view.js` | tráfico acumulado y conversión (`calculateConversionRate(orders, traffic)`) real vs plan | YTD, mes, trimestre |
| `js/commandCenter/z1Input.js` → `reliability` / `z1` | `activity.sessions` (hoy solo habilita/bloquea la conclusión de conversión; no cambia la brecha de venta) | periodo evaluado |
| `js/diagnostics/driverEngine.js` (+ `signalEngine`, `hypothesisEngine`, `attribution`) | descomposición tráfico × conversión × ticket de la brecha (actual vs plan, vs periodo anterior, vs año anterior) | cualquier comparación que incluya días afectados |
| `js/analytics/homeSummaryEngine.js`, `js/analytics/attentionEngine.js`, `js/ui/guidance/*` | efectos de tráfico/CR mostrados en Inicio y atención | periodo del Inicio |
| `js/forecast/reforecastEngine.js` | tráfico y CR acumulados reales (`actual_ytd`) como base del reforecast | YTD |
| `js/scenarios/scenarioEngine.js`, `js/scenarios/recoveryEngine.js` | línea base de sesiones × CR × ticket y escenarios de recuperación | periodo base elegido |
| `js/impact/impactMeasurement.js`, `js/impact/impactCalculator.js` | medición antes/después con tráfico y CR | ventanas pre/post de acciones en el periodo |
| `js/projection/projection.js` (+ calibración) | proyección de tráfico y CR por meses reales | meses reales |
| `js/report/reportBuilder.js`, `js/report/operativo.js` y vistas de reporte | tráfico y CR en los reportes | periodo del reporte |
| `js/actions/actionPlan.js`, `actionLibrary.js`, `js/promotions/opportunityEngine.js` | acciones/oportunidades que citan conversión | vía los diagnósticos anteriores |
| `js/export/forecastExport.js` | exporta lo anterior | idem |

## B. NO consumen la serie diaria (no afectados directamente por E-2)
- `js/analytics/trafficConversionEngine.js`, `js/import/ga4Segments.js` y la vista de segmentos: trabajan sobre las **filas de segmentos GA4** cargadas (la fuente que sí concilió).
- `js/forecast/planningEngine.js`, `js/calculations/seasonality.js` y la tendencia de productos: parten del **histórico** (2024–2025) y del plan, no de la serie 2026. (El histórico 2024–2025 queda fuera del alcance de E-2: no se validó contra GA4.)
- Venta, pedidos, plan y E-3 (venta contra plan).

## Qué NO existe hoy
- No hay filtro ni fecha de corte por canal en ningún consumidor de A.
- No hay aviso en la interfaz de que la serie anterior al quiebre es no confiable.
- No hay prueba que verifique esa exclusión (porque no está implementada).

## Opciones para decidir (sin implementar)
1. Mantener solo la documentación (estado actual).
2. Aviso en pantalla cuando la ventana incluya días afectados (sin cambiar cálculos).
3. Excluir esos días de los cálculos de tráfico/CR (cambia resultados y requiere pruebas y decisión de negocio).
4. Corregir el dato en el origen (re-exportar `traffic_volume`) y retirar la limitación.
