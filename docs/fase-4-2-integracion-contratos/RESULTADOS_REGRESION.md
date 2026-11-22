# Resultados de regresión — Fase 4.2 (reproducibles)

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


Rama `ccr-a81af632-rirtu7`, HEAD `625daec0969f9cd6e9db5d93a41eb652040d506` (sin commits nuevos). Comandos desde la raíz del repositorio.

| Conjunto | Comando | Resultado |
|---|---|---|
| Línea base al inicio (4.1 consolidada) | `for t in tools/test-*.js tools/selftest-node.js; do node $t; done` | 117 scripts, 0 fallas; verificadores 3.1–3.5 OK; `node --check` 247 archivos OK |
| Scripts Node tras 4.2 | ídem | **121 scripts, 0 fallas** (4 nuevos de 4.2) |
| Verificadores de documentos aceptados | `python3 tools/audit/verificar_consistencia_3_{1..5}.py` | **5/5 OK** (documentos de Fases 1–3 y especificaciones aceptadas intactos; modificaciones de `js/` registradas) |
| Sintaxis | `node --check` sobre `js/**/*.js` | **249 archivos, 0 errores** |
| Pruebas nuevas 4.1 + 4.2 | `node tools/test-fase4-*.js` | **276 comprobaciones, todas bien** (59 son de 4.2) |
| Lotes de navegador (Chromium, `run_batch.py`) | `python3 tools/regression/run_batch.py <lote>.py .` | **49 lotes**: 47 OK a la primera; 2 fallaron por afirmar que Z1 no existe en `js/` (`fase3_1_home_auditoria`, `fase3_2_z1_wireframe`) → se alinearon (ver abajo) y pasan (58/58 y 48/48) |

Lotes ejecutados (49): atención, cambios, cambios_b, clientes_forecast, diag_b, diag_export, dxsrc, editorial, fase2_margen, fase2_modelo_real, fase3_1…, fase3_2…, fase3_3_3_4_zonas, fase3_5_prototipo, fase3_calidad_ux, fase3_correspondencia, home_summary, inicio_b/canales/chip/compacto, pacing3, pacing_b, plan_recuperacion, quarter, recuperacion_neto, recuperacion_todos_canales, reforecast_b, report_composer/directivo/editor/escenarios/funnel/gerencial/golden/operativo/setup, resumen, route12, story, tour10, trafico_b, agentes_fase2/3 y **`batch_fase4_2_contratos`**.
Motores cubiertos: atribución, economía (impactModel intacto), diagnóstico, pacing, forecast/reforecast, recuperación, datos normalizados (self-tests), reporte (golden), exportación; importación y persistencia **sin tocar** (sus lotes no se vieron afectados).

## Pruebas existentes que se actualizaron en 4.2 (y por qué)
| Prueba | Motivo |
|---|---|
| `test-traffic-all`, `test-traffic-conversion`, `test-report-builder` | cargan los motores aislados: ahora necesitan `sampleSufficiency` (y la configuración real del mínimo de sesiones, leída de `config.js`, sin copiar constantes) — P-16 |
| `test-change-engine` | carga `metrics.js` (changeEngine usa `FP.metrics.calcGap`) — P-13 |
| `test-fase4-1-estado-consumidores` (C4, C1) y `test-fase4-1-estado-comercial` (E1) | el campo `pacingStatus` de `summarizePeriod` ya no existe; `planStatus` delega en `FP.gap.pacingStatus` |
| `test-fase4-1-contratos-js` (D5), `test-fase4-1-metricas-y-fuentes` (B1, B3) | reflejan el nuevo estado de integración y los sitios migrados |
| `batch_fase3_1_home_auditoria` (F31.3), `batch_fase3_2_z1_wireframe` (F32.3) | afirmaban «Z1 / classifyBusinessState no existen en `js/`»; ahora existen **solo** en `js/commandCenter/` y siguen **sin** consumidores ni carga en `index.html` |
Ninguna se debilitó para «hacer pasar»: cada una sigue verificando el límite que protegía (no integración), con el estado nuevo autorizado.

## No ejecutado
Los 139 lotes de navegador no relacionados con los archivos modificados; validación visual real; datos reales.
