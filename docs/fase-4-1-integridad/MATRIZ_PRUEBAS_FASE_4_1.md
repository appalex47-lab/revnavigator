# Matriz de pruebas — Fase 4.1 (consolidada)

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


Todo se ejecutó realmente con **datos simulados** (nunca datos reales de FESA ni Supabase real). Se separa lo ejecutado de lo pendiente.

## Pruebas nuevas de 4.1 (Node) — 217 comprobaciones, todas bien
| Prueba | Alcance | Resultado |
|---|---|---|
| `test-fase4-1-estado-comercial.js` | contrato `cc.plan_status/1`: 12 escenarios (arriba, exacto, tolerancia, fuera, por debajo, plan 0, sin plan, ventas sin plan, sin actividad, insuficientes, no comparable, canales/agregaciones); equivalencia (100 000); determinismo; caracterización histórica; 5 mutaciones | 30/30 |
| `test-fase4-1-estado-consumidores.js` | **código real** de `home-resumen` y `contextEngine` contra `FP.gap.pacingStatus` (20 000 × 4 configuraciones), alcance del cambio, un solo sitio, defecto de `a.pacingStatus`, sitios que no se unifican | 15/15 |
| `test-fase4-1-reimplementaciones.js` | 21 sitios de brecha/CR/AOV: ancla en el código + clase de equivalencia + consecuencias (redondeo, faltante→0) | 27/27 |
| `test-fase4-1-sesiones.js` | evidencia de la arquitectura + política + `reconcileSessions` | 19/19 |
| `test-fase4-1-tolerancias.js` | Z1 real vs catálogo: 0.005, $0.01, bordes, redondeo | 9/9 |
| `test-fase4-1-metricas-y-fuentes.js` | catálogo, precisión/redondeo, D-02, mutaciones | 26/26 |
| `test-fase4-1-confiabilidad.js` | contrato vs Z1 (4 000 entradas), escenarios, mutaciones | 23/23 |
| `test-fase4-1-hallazgos.js` | hallazgos reales de `attentionEngine`, causalidad, dedupe, mutaciones | 23/23 |
| `test-fase4-1-contratos-js.js` | carga limpia como navegador, versionado, port = especificación (texto + comportamiento, 4 000 entradas), sin duplicados, **index.html no los carga**, suficiencia de muestra (12) | 30/30 |
| `test-fase4-1-impacto-conceptual.js` | principios de impacto; conflictos con D-01/D-06 (no corregidos); `impactModel.js` intacto | 15/15 |

## Regresión
| Conjunto | Resultado |
|---|---|
| Scripts Node (`tools/test-*.js` + `selftest-node.js`) | **117 scripts, 0 fallas** |
| Verificadores 3.1–3.5 (documentos aceptados, línea base, modificaciones autorizadas) | 5/5 OK |
| Sintaxis de `js/` (`node --check`) | 247 archivos, 0 errores |
| Lotes de navegador (Chromium, `run_batch.py`): `home_summary`, `inicio_b/canales/chip/compacto`, `pacing3`, `pacing_b`, `resumen`, `dxsrc`, `story`, `reforecast_b`, `dinamico` (golden del reporte: 86 OK), `j`, `l`, `route12`, `tour10`, `editorial`, `quarter`, `recuperacion_neto`, `fase2_modelo_real`, `fase3_1_home_auditoria` | **0 fallas finales** |

### Pruebas existentes que hubo que actualizar (y por qué)
1. `batch_inicio_chip.py` (C1): fijaba la regla anterior (chip «0.1 % por debajo» con brecha −0.08 %). Con P-01 esa brecha es «en plan»; ahora verifica el chip contra la misma regla central. **Cambio de comportamiento esperado, no regresión.**
2. `batch_fase3_1_home_auditoria.py` (F31.3): afirmaba que `mergeFindings`/`cc.finding` no existían en `js/`. Ahora se permiten **solo** en `js/commandCenter/` (preparados, sin consumidores); `classifyBusinessState` sigue ausente.
3. `test-fase4-1-estado-comercial.js` D0: la prueba de caracterización asumía `planBand`; se alineó con el estado actual.

## Pendiente (diseñado, no ejecutado)
Pruebas con datos reales; equivalencia por cada migración futura de los 21 sitios; pruebas de integración visual de 4.2 (cableado de `planStatus`); validación de la conciliación serie diaria ↔ GA4 con datos reales.
