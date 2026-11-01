# Presentation Intelligence · Fase 0 — Protección y línea base

Estado: terminada. Repositorio `appalex47-lab/revnavigator`, rama `ccr-a81af632-rirtu7`.

## 1. Estado de Git al iniciar

- Rama de trabajo: `ccr-a81af632-rirtu7`, **3 commits por delante de `main` y 0 por detrás**; sin cambios pendientes.
- Los tres commits de la sesión anterior están en la rama y subidos, **no están integrados en `main`**:
  - `a17a70e` Presentación PDF: rezago de datos visible, lámina «Decisiones», títulos balanceados, anexo B sin choque.
  - `5505f2f` Periodo Q (base): calendario, series de pacing por Q y diagnóstico por Q.
  - `3f08998` Periodo Q en Diagnóstico y en la Presentación (reporte por Q con textos de Q).
- Todo lo que sigue parte de esa rama. Nada se descartó ni se revirtió.

### Divulgación: los commits de Q tocaron 7 archivos de motores o calendario

Fueron cambios **aditivos** (se agregó el tipo de periodo `quarter`); no se modificó ninguna fórmula comercial:

| Archivo | Cambio |
|---|---|
| `js/calendar/calendar.js` | `quarterRange`, `prevQuarterKey`, `periodKey/periodLabel('quarter')` |
| `js/analytics/temporalEngine.js` | `quarter` en `add`, `startOf`, `endOf`, `rangeForKey`, `isFullPeriod`, `comparisonRanges` |
| `js/forecast/forecastEngine.js` | `quarters` junto a `months` y `weeks` (mismo `summarizePeriod`) |
| `js/diagnostics/driverEngine.js` y `diagnosticEngine.js` | periodo `quarter` (días del Q, referencia = mismo día del Q anterior) y etiqueta |
| `js/products/productAnalysis.js`, `js/scenarios/scenarioEngine.js` | `quarter` en listas de periodos y en `resolvePeriod` |

Total: 49 líneas añadidas y 7 sustituidas (solo ampliaron listas con `'quarter'`). Evidencia de que los resultados existentes no cambiaron: `selftest-node` 233/233, todas las pruebas de Node, la regresión completa y la comparación numérica editorial `ED-8` (todas las cifras de los escenarios mes, mes anterior y excedente) idénticas antes y después. **Regla desde ahora:** ningún archivo de motores se modifica para facilitar la presentación; cualquier necesidad nueva se resuelve en módulos de presentación.

## 2. El reporte actual (lo que se protege)

### Flujo

1. **Datos y motores** (sin cambios): forecast y pacing por canal y total, reforecast, diagnóstico y drivers (venta = tráfico × conversión × ticket), productos, evolución, clientes, tráfico y conversión, proyección, recuperación y escenarios, acciones, confiabilidad del forecast.
2. **Contexto** (periodo semana/mes/Q/año, canal, filtro): `state.dx.settings` y `state.rp` (filtro, láminas excluidas, opciones). `state.rp` no se persiste.
3. **`buildExecutiveReport` (`js/app.js`)** reúne lo ya calculado y arma la entrada `src` de `reportBuilder.build`. Contrato de `src` (29 claves): `app, backtest, branchNames, businessName, channel, customers, diag, filters, focusData, generatedAt, lastActual, options, product, productByLevel, productFilterLabel, profiles, projection, quality, recovery, reportFilter, rf, rfMonth, run, selPacing, selection, trafficDiag, trafficWeekly, trend, trendFilterLabel`.
4. **`js/report/reportBuilder.js`** produce páginas deterministas (`page*`): `cover, summary, pacing, reliability, drivers, categories, trends, movers, customers, traffic, campaigns, recovery, seasonality, closing, decisions, annex`. Esquema `executive_report` 1.0.0. Cada página: `id, title, status (included|omitted + reason), question, headline, kpis (con sello Observado/Calculado/Estimado), tables, charts, notes, sources, tags`.
5. **`js/report/reportCopy.js`**: títulos y lecturas con conclusión por reglas (sin IA).
6. **`js/ui/report-view.js`**: orden de lectura constante, un diseño HTML por lámina (`BODY[id]`), 6 tipos de gráfico (`cumulative, waterfall, hbar, range, stacked, lines`), paginación fija 1122×630, vista previa escalada.
7. **PDF**: `mountPrint` + `@page 297mm 167mm` + `window.print()` (PDF del navegador, 16:9, sin librerías).
8. **Selección de láminas**: `rp.exclude` (por defecto `reliability, seasonality, annex`).
9. **IA**: el reporte no la usa. La narrativa de la app separa lo determinista (`narrativeEngine`) de la redacción opcional (`cohereNarrative`, que verifica que cada número exista en las afirmaciones).

### Reglas de omisión y certeza vigentes

Una página se omite con motivo cuando no hay datos que la sostengan; nunca se muestran ceros por ausencia de dato; todo KPI lleva su sello; las estimaciones se distinguen de lo observado.

## 3. Línea base congelada («golden»)

Tres capas complementarias:

| Capa | Archivo | Qué congela | Cobertura |
|---|---|---|---|
| Navegador (reporte completo y render) | `tools/regression/batch_report_golden.py` + `data/report_golden.json` | Forma de la entrada `src`, reporte completo (páginas, orden, títulos, textos, tablas, gráficos, sellos, omisiones, anexos) y render final (texto, gráficos y tablas por lámina) | 4 escenarios: `base`, `mes_anterior`, `excedente`, `q3` (reloj fijo, determinista) |
| Armador (contenido de cada página) | `tools/test-report-golden.js` + `data/report_builder_golden.json` | Huella SHA-256 por página, orden, titulares, motivos de omisión y sellos | 89 llamadas a `build` de `test-report-builder.js`; las **16 páginas** aparecen con datos al menos una vez (tráfico 5, campañas 2, estacionalidad 4, recuperación 10) |
| Cifras | `tools/regression/batch_editorial.py` (`ED-8`) + `data/editorial_baseline.json` | Todos los valores numéricos de los escenarios | 3 escenarios |

Se comprobó que (a) dos corridas seguidas son idénticas y (b) un cambio de una sola frase en un título o en una tabla hace fallar la línea base.

**Cómo se usa:** `python3 tools/regression/batch_report_golden.py .` y `node tools/test-report-golden.js` comparan. Para actualizar, `UPDATE=1`, y solo con una diferencia identificada y justificada en el mensaje del commit. `tools/test-report-golden.js` corre además en el CI chico (`tools/test-*.js`).

### Brecha conocida de la línea base

El render (`report-view.js`) de las láminas **tráfico, campañas y estacionalidad con datos** no está cubierto por el golden de navegador (los escenarios deterministas no cargan segmentos ni un año de historia). Su contenido sí está cubierto por el golden del armador. **Se cerrará en la Fase 1** con un golden de render alimentado por los fixtures del armador.

## 4. Inventario de pruebas y estado base

| Prueba | Resultado base |
|---|---|
| `tools/selftest-node.js` | 233/233 |
| `tools/test-report-builder.js` | pasa (135 aserciones) |
| `tools/test-report-copy.js` | pasa (19) |
| `tools/test-narrative-null.js`, `tools/test-phase23-narrative.js` | pasan (11/11) |
| `tools/test-report-golden.js` (nuevo) | pasa |
| `batch_presentacion` | 44 ✔ / 0 ✘ |
| `batch_pdf_fidelidad` | 5 ✔ / 0 ✘ |
| `batch_editorial` (correr desde la raíz del repo) | 110 ok / 0 fallas |
| `batch_branding` | 19 ✔ / 0 ✘ |
| `batch_quarter` | 17 ✔ / 0 ✘ |
| `batch_report_golden` (nuevo) | 4 ✔ / 0 ✘ |
| Pruebas de motores (`test-forecast*`, `test-action-*`, etc.) | pasan; no se tocan |

### Fallas preexistentes que no pertenecen a este módulo

Cinco baterías de navegador fallan en `main` y en la rama; ninguna trata el reporte: `batch_controles` (MN-2, MN-4, CT-1, CT-2: enlaces `#producto`/`#analisis` y botones de Cambios), `batch_movil` (M-11), `batch_dias_excluidos` (X3), `batch_evolucion_filtro` (tiempo agotado) y, a veces bajo carga, `batch_ampliar_ia`. No se investigaron a fondo ni se alteraron. No deben empeorar.

## 5. Criterios de equivalencia para el perfil LEGACY (Fase 1)

El compositor nuevo, con el perfil LEGACY y la misma entrada `src`, debe producir **exactamente** lo que hoy produce el generador:

1. Mismas páginas, mismo orden y mismos estados (`included` / `omitted`).
2. Mismos títulos, titulares y textos.
3. Mismas cifras, fuentes y sellos de certeza.
4. Mismos motivos de omisión y mismos anexos A, B y C.
5. Mismas selecciones por defecto (`reliability`, `seasonality`, `annex` fuera de la vista previa).
6. Mismo renderizado (texto, gráficos y tablas por lámina) y mismo PDF 16:9.

La comprobación es automática: los tres golden anteriores más `batch_presentacion`, `batch_pdf_fidelidad` y `batch_editorial`.

## 6. Archivos protegidos

No se modifican para esta evolución: `js/forecast/`, `js/diagnostics/`, `js/scenarios/`, `js/impact/`, `js/analytics/`, `js/calendar/`, `js/products/`, `js/calculations/`, `js/projection/`, `js/actions/`, `js/narrative/`, `js/ai/`. Verificación: `git diff --stat <commit-base>..HEAD -- <esas carpetas>` debe quedar vacío a partir de la Fase 1.

`js/report/reportBuilder.js` (964 líneas) no debe crecer: lo nuevo va en módulos independientes.
