# Contrato `cc.plan_status/1` — estado comercial frente al plan (consolidado, P-01)

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


**Contrato:** `js/commandCenter/planStatus.js` (no cargado por `index.html`; sin consumidores, ver nota). **Regla en uso por la aplicación:** `FP.gap.pacingStatus` + `FP.config.forecast.pacingThresholds`. **Pruebas:** `test-fase4-1-estado-comercial.js` (30), `test-fase4-1-estado-consumidores.js` (15), lote de navegador `batch_inicio_chip`/`pacing*`/`inicio*`.

## 1. La configuración candidata, verificada
`FP.config.forecast.pacingThresholds = { aboveFrom: 1.01, onPlanFrom: 0.99 }` (`js/config/config.js:390`):
- **Unidad:** razón de cumplimiento acumulado (`real a la fecha ÷ plan a la fecha`), no porcentaje. 1.01 = 101 %.
- **Semántica:** `≥ aboveFrom` → arriba · `≥ onPlanFrom` → en plan · menor → debajo. Límites **inclusivos**, sin épsilon (`gap.js:34`).
- **No es una banda simétrica «±1 %»:** son dos umbrales independientes; el usuario puede configurarlos asimétricos (`forecast-view.js:236-237`) y la herramienta de sugerencia de umbrales los aplica (`app.js:4758`). «±1 %» es solo el valor por defecto. **Ajuste respecto de la recomendación inicial:** se documenta como par de umbrales.
- **Consumidores:** `forecastEngine` (estado diario), `attentionEngine`, `pacing-view`, `pc-resumen`, `home-view`, `home-summary-view`, `homeSummaryEngine`, `threshold-view`, exportación. Es la configuración que representa exactamente la tolerancia de estado frente al plan. **No se introdujo otra configuración.**

## 2. Estados del contrato
`above` · `on_plan` · `below` · `no_activity` · `insufficient_data` · `plan_unavailable` · `not_comparable` (+ modificador `preliminary` si la confiabilidad es «Baja»). Precedencia (determinista): actividad verificada en cero → datos inválidos → plan no disponible/0 → faltan real o días → comparación no válida → confiabilidad «Insuficiente» → clasificación por umbrales. Nunca se convierte falta de información en «por debajo».

### Casos especiales (documentados y probados)
| Caso | Tratamiento | Prueba |
|---|---|---|
| Plan pequeño (> 0) | Se clasifica; **no se inventa un mínimo de plan**. El % es sensible y se documenta, no se bloquea. | A (plan pequeño), `sampleSufficiency` E3 |
| Plan 0 o sin plan | `plan_unavailable`; la venta observada sigue visible (D-01) | A5–A7 |
| Periodo parcial | Cumplimiento **a la fecha** (días contados contra plan de esos días); la cobertura se informa aparte (`sampleSufficiency`: «periodo parcial») | A, E2 |
| Agregación por canal | El total clasifica con su propio cumplimiento; si faltan canales con datos, `cc.sample` devuelve `parcial` y la confiabilidad lo restringe | A (canales), E4 |
| Plan negativo / venta negativa | `insufficient_data` (dato inválido, no desempeño) | A |

## 3. Los siete sitios divergentes: resultado
Se unifican **solo los que miden el mismo concepto** (cumplimiento acumulado del periodo frente al plan) y cuya equivalencia con la regla central quedó demostrada. Los demás miden otra cosa: unificarlos **no sería equivalente funcional**, así que se conservan, documentados.

| # | Sitio | Concepto | Antes | Resultado |
|---|---|---|---|---|
| 1 | `home-resumen.js` (titular del Inicio) | cumplimiento acumulado | ±2 % (`homeSummary.planBand`) | **UNIFICADO** → `FP.gap.pacingStatus(comp, run.settings.pacingThresholds)`; se **eliminó** `planBand` |
| 2 | `contextEngine.js` (frase del Inicio) | cumplimiento acumulado | |Δ| < 0.05 % | **UNIFICADO** (usa `run.settings.pacingThresholds` vía el snapshot) |
| 3 | `chg-resumen.js` / `changeEngine` | variación de **ayer/semana** contra el plan **del día** (3 niveles −5/−1/+2 %) | — | **Se conserva**: periodo y propósito distintos (ruido diario) |
| 4 | `analistaStory.js` | **cierre proyectado** frente a la meta (±0.5 %) | — | **Se conserva**: mide proyección, no cumplimiento |
| 5 | `reportCopy.js` | escala de 4 niveles del reporte (±2 %, −10 %) | — | **Se conserva**: golden del reporte; ver P-11 |
| 6 | `reportBuilder.readout.state` | frase del reporte (±0.5 %) | — | **Se conserva** (mismo motivo); ver P-11 |
| 7 | `config.report` (`okPct`/`alertPct`/`belowPlanPct`/`weakPct`) | umbrales **por audiencia**, con su sugerencia propia | — | **Se conserva**: configuración distinta y editable |

Efecto verificado en el código real (15 pruebas): el titular cambia **solo** en las bandas 98–99 % y 101–102 % (antes «en plan», ahora «por debajo/por encima»); `contextEngine` cambia solo dentro de ±1 %; el caso 99.8 % de la revisión visual ya **no se contradice**; un cambio de la configuración efectiva llega a ambos sitios a la vez.

### Defecto real encontrado y corregido (tras P-01)
`FP.pacing.summarizePeriod` calcula `pacingStatus` con los umbrales **por defecto**, e `pacing-view`/`pc-resumen` lo preferían (`a.pacingStatus`) para la venta: si el usuario cambiaba los umbrales (o aplicaba la sugerencia), la píldora de venta los **ignoraba** y las demás sí los usaban. Ahora ambos consumen siempre el umbral efectivo (idéntico con la configuración por defecto). **Residual:** el campo `pacing_status` de la exportación (`forecastExport.js:26`) y el campo `pacingStatus` del resumen siguen con el umbral por defecto (contrato de exportación; requiere decisión: P-12).

## 4. Estado de adopción
- **Aplicación (real):** reglas 1 y 2 consolidadas; defecto de umbral efectivo corregido; sin tocar Pacing/Atención (ya correctos).
- **Contrato `planStatus.js`:** listo y probado (equivalencia exacta con `FP.gap.pacingStatus` en 100 000 casos), **no cargado ni consumido**: es la base de 4.2 (estados `no_activity`, `plan_unavailable`, `not_comparable`).
- Archivos protegidos modificados con registro en `MODIFICACIONES_AUTORIZADAS.json`: `config.js`, `contextEngine.js`, `home-resumen.js`, `pacing-view.js`, `pc-resumen.js`.
