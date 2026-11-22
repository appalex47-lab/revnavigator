# Matriz de consumidores (estado verificado del código)

Fuente de cada fila: búsqueda en `js/` + pruebas (`test-fase4-1-contratos-js` D5, `test-cierre-4-1-4-2`, `batch_fase4_2_contratos`). «Cargado» = `<script>` en `index.html`.

| Contrato / función central | Cargado | Consumidores reales | Sin consumidor |
|---|---|---|---|
| `FP.gap.pacingStatus` + `FP.config.forecast.pacingThresholds` (regla y configuración únicas del estado frente al plan) | sí | `forecastEngine`, `attentionEngine` (estado y `onPlanFrom`), `pacing-view`, `pc-resumen`, `home-view`, `home-summary-view`, `homeSummaryEngine`, `contextEngine`, **exportación** (`forecastExport`), `planStatus`, `businessState` | — |
| `planStatus` (`cc.plan_status/1`) | sí | titular del Inicio (`home-resumen`) | los demás usan la función central que el contrato delega |
| `sampleSufficiency.segmentMinSessions` / `describeSegmentMin` (P-16) | sí | `trafficConversionEngine` (2), `segmentInsights`, `reportBuilder`, `segments-view` (texto, 2) | `evaluate` |
| `FP.metrics.calcGap` | sí | `changeEngine` (GAP-3), `driverEngine` (GAP-6), `gap.js` | 17 sitios sin migrar, GAP-4/GAP-5 (a propósito) |
| `z1` / `businessState` | **no** | — | todo (disponibles para 4.3) |
| `reliability` | **no** | — | todo |
| `findings` | **no** | — | todo (4.3) |
| `metricCatalog` (catálogo, `SESSIONS_POLICY`, `reconcileSessions`, `reconcileSessionsReport`) | **no** | herramienta `validar-sesiones-ga4.js` (CLI de validación) | la aplicación |
| `FP.config.diagnostics.segmentMinVolume` | sí (config) | solo vía `sampleSufficiency` | — |

## Garantías verificadas
- **Una sola definición** de cada valor: pacing 1.01/0.99 solo en `config.js` (prueba C1); mínimo de sesiones 500/1 % solo en `config.js` y sin copias en motores ni textos (B4, B5); Z1 ejecutable solo en `js/commandCenter/z1.js` generado de la especificación (A1).
- **Texto = configuración = motor** para el mínimo de sesiones (B2: cambiar la configuración cambia ambos).
- **Exportación = Inicio = Pacing** con umbrales por defecto y personalizados (navegador, 66 periodos).
- **Escalas con otro significado** (variación diaria/semanal, cierre proyectado vs meta, reporte) **no se unificaron** (C5).
