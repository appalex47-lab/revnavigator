# Matriz de migración P-13

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


Autorizados: **los tres casos «idénticos» de 4.1** (GAP-3, GAP-4, GAP-6). Resultado de la comprobación estricta en 4.2 (`test-fase4-2-p13-migracion.js`, 10 comprobaciones, **comparación exacta con `Object.is`**, no con tolerancia):

| Caso | Sitio | Fórmula original | Canónica | Equivalencia estricta | Decisión |
|---|---|---|---|---|---|
| **GAP-3** | `changeEngine.js` (brecha del canal) | `fin(a) && fin(p) ? a − p : null` | `FP.metrics.calcGap(p, a).abs` | **idéntica bit a bit** en 200 169 pares (importes con centavos + 169 degenerados: 0, −0, negativos, null, undefined, NaN, ±Infinity) | **MIGRADO** |
| **GAP-6** | `driverEngine.js` (delta contra base) | `fin(c) && fin(b) ? c − b : null` | `FP.metrics.calcGap(b, c).abs` | **idéntica bit a bit** en los mismos pares | **MIGRADO** |
| **GAP-4** | `changeEngine.js` (`pct = a/b − 1`) | `a / b − 1` | `calcGap(...).pct = (a − b)/b` | **NO idéntica**: difiere en el último bit en **156 079 de 200 000** pares válidos (≈ 78 %) | **NO MIGRADO** |

### Corrección a Fase 4.1
En 4.1 clasifiqué GAP-4 como «equivalente exacto» porque la prueba comparaba con tolerancia relativa de 10⁻¹². Con comparación exacta **no lo es**. Es numéricamente equivalente (error ≈ 10⁻¹⁶) pero no idéntico; migrarlo podría voltear un redondeo o un umbral (`r ≤ −0.05`) en un empate exacto. Por la regla de P-13 («solo los matemáticamente idénticos») **queda fuera**. No requiere decisión del usuario; queda documentado para la oleada siguiente (junto con una decisión de redondeo, P-18).

### Verificación de cada migración
1. Fórmula original e identificación del consumidor: arriba. 2. Equivalencia de entradas, unidades, redondeo y nulos: P1–P3 (ninguna redondea; ambas dan `null` ante dato ausente/no finito y 0 solo si la diferencia es 0 real). 3. Sustitución por la función canónica: M1–M2. 4. Paridad: P1–P2. 5. Regresión de consumidores: `test-change-engine` (21), `test-atribucion-escenarios`, lotes `cambios`, `cambios_b`, `diag_b`, `diag_export`, `dxsrc`, `quarter`, etc. (ver `RESULTADOS_REGRESION.md`).
6. Se añadió `const M = () => FP.metrics` en `changeEngine.js` (ya cargado después de `metrics.js` en `index.html`) y se cargó `metrics.js` en `test-change-engine.js`.

### No migrado (verificado por M3–M4)
Los 17 casos «equivalentes en dominio válido» (CR/AOV y brecha con guardas distintas), GAP-4, GAP-5 (redondeo a centavos) y sitios no autorizados. `impactModel.js` y `combineImpacts` intactos (hash de la línea base).
