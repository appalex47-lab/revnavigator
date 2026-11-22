# Matriz de hallazgos originales → resolución con evidencia

Fuente: `docs/cierre-fase-4-1-4-2/MATRIZ_LIMITACIONES.md` (T-xx, R-xx, B-xx) y los puntos del mandato. Cada fila: qué faltaba · qué se hizo · prueba reproducible.

| Hallazgo original | Resolución | Evidencia |
|---|---|---|
| **17 fórmulas «equivalentes en dominio válido» sin migrar** (+ GAP-4, GAP-5, GAP-1/2) | **TODAS migradas** a `FP.metrics.calcConversionRate` / `calcAov` / `calcGap` / `calcRelativeChange`. Decisión técnica: `calcConversionRate`/`calcAov` exigen denominador > 0 (lo que ya declaraba `derivations.js`: `requires: sessions > 0 / orders > 0`); `calcRelativeChange` conserva EXACTAMENTE `a/b − 1` (GAP-4 idéntico bit a bit; `calcGap().pct` no se tocó) | `tools/test-reapertura-formulas.js` (13): ningún sitio conserva la fórmula inline (11 archivos); paridad de motores REALES contra Git HEAD con `Object.is` (trafficConversionEngine, segmentInsights, attribution 200 000 pares secuencial y Shapley, planBridgeEngine, changeEngine, driverEngine); datos degenerados sin NaN/Infinity y salida idéntica |
| Consumidores reales de Z1, businessState, reliability, findings, sampleSufficiency | Adaptador `z1Input` (productor de la entrada de Z1) y `attentionContract` (consumidor) conectados a **attention-view**, **home-resumen** y **contextEngine**; 8 módulos cargados en `index.html` | `tools/test-reapertura-consumidores.js` (18), lote de navegador `batch_reapertura_consumidores.py` (10: DOM con id estable/naturaleza/causalidad, chip de confiabilidad = nivel de Z1, ausencia ≠ cero) |
| Integración de los contratos con la aplicación | cadena Inicio → attentionContract → z1Input · reliability → z1 → businessState · findings · sampleSufficiency · planStatus | idem + `test-fase4-1-contratos-js` D5 |
| Conciliación series diarias ↔ GA4 | Política sin fallback + `reconcileSessionsReport` + CLI `tools/audit/validar-sesiones-ga4.js` (alerta de doble conteo, ausencia ≠ cero, tolerancia solo declarada). **Falta el insumo externo real** (ver `DEPENDENCIAS_EXTERNAS.md`) | `test-cierre-4-1-4-2` E1–E9 |
| Configuración centralizada de umbrales | pacing 1.01/0.99 solo en `config.js`; mínimo de sesiones y tolerancias de conciliación en `config.js`; sin respaldos copiados | `test-cierre-4-1-4-2` C1–C6, `test-reapertura-conciliacion` (7) |
| **P-04** (0.005 vs $0.01) | Una configuración `diagnostics.reconciliation {representationMXN 0.005, decisionMXN 0.01}` con semántica distinta documentada; **candado**: el literal de la especificación aceptada de Z1 debe ser igual a `representationMXN`; el catálogo lee `decisionMXN`; matriz por banda | `test-reapertura-conciliacion` |
| **P-11** (escala del reporte) | `reportCopy.standing`, `voice.standingDir`, `directivo` y `reportBuilder.readout` usan `FP.gap.pacingStatus` con los umbrales efectivos (`report.context.pacingThresholds`); «se aleja del plan» pasa a `config.reports.farFromPlanBelow` | `test-reapertura-reporte` (9) + golden del armador |
| **P-17** (evaluate → reliability.sample) | la dimensión «muestra» se evalúa con `FP.sampleSufficiency` (mínimo de `FP.config`) | `test-reapertura-consumidores` C8 |
| **P-18** (GAP-4/GAP-5) | resueltos: GAP-4 → `calcRelativeChange` (misma fórmula); GAP-5 → `cents(calcGap().abs)` (se conserva el redondeo a centavos) | `test-reapertura-formulas` B6–B7 |
| **P-19** (carga en index.html) | se cargan al existir consumidores | `batch_fase4_2_contratos` A1, `test-cierre-4-1-4-2` A4 |
| **P-20** (planStatus en más consumidores) | `contextEngine` y `home-resumen` clasifican con `FP.planStatus` | `test-fase4-1-estado-consumidores` |
| Pruebas de changeEngine / driverEngine / atención | aserción de brecha en `test-change-engine`; paridad con Git; atención con consumidor real | `test-cierre-paridad-consumidores`, `test-reapertura-formulas` |
| **3 scripts omitidos** | 2 ejecutan ahora el código ACTUAL (`test-phase20-diagnostic` 15/15, `test-phase21-forecast` 13/13); el 3.º usa un CSV real inexistente: se añade `test-phase21-simulado-grande` (7/7, SIMULADO, etiquetado como tal) y el real queda omitido | scripts; `DEPENDENCIAS_EXTERNAS.md` |
| Integridad de las pruebas de navegador | 4 lotes que fijaban la integración anterior se alinearon con el estado real, sin bajar su cobertura | `AUDITORIA_PRUEBAS_Y_MUTACION.md` |
| Consistencia documentación ↔ especificaciones ↔ código | avisos de actualización en los documentos de 4.1/4.2/cierre y este directorio | verificadores 3.1–3.5 OK |
| P-04, P-11, P-17, P-18, P-19, P-20 | **resueltos** (arriba) | — |

---

## Resultado de la validación externa real (2026-11-20)

E-1 aprobada; E-3 aprobada (calidad declarada `warnings`); E-2 ejecutada con **limitación aceptada por el usuario**: `traffic_volume` de ecommerce anterior a 2026-10-05 y de app anterior a 2026-09-25 (y app 2026-10-02) no coincide con GA4 (cambio de origen sin explicar). Detalle, alcance y condiciones: [`docs/validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md`](../validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md). La limitación está documentada, **no impuesta por código** (decisión pendiente). Esto no equivale a la aceptación formal de 4.1/4.2, que corresponde al usuario.
