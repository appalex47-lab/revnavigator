# Catálogo de métricas canónicas (consolidado, P-03 y P-04)

**Implementación:** `js/commandCenter/metricCatalog.js` (`cc.metric_catalog/1`, 13 entradas congeladas, `SESSIONS_POLICY`, `reconcile`, `reconcileSessions`; no cargado por `index.html`). Cada entrada: id, definición, fórmula (`formulaRef` a la función existente), fuente primaria/respaldo, unidad, granularidad, agregación, deduplicación, tratamiento de faltantes, contrato de confiabilidad, consumidores, pruebas.

## 1. Matriz comparativa de reimplementaciones (P-03)
`tools/test-fase4-1-reimplementaciones.js` (27 comprobaciones) transcribe **cada** sitio, verifica que su ancla sigue en el código y lo compara con la función canónica (`calcGap`, `calcConversionRate`, `calcAov`) sobre una malla de entradas válidas y degeneradas.

> **Corrección a la auditoría previa:** el inventario era distinto del documentado. Hay **21 sitios** (8 CR, 7 AOV, 6 brecha), no 9. `px-ficha.js` y `px-view.js` solo *leen* CR/AOV; `planningEngine.js` no existe como archivo.

Resultado: **3 equivalentes exactos**, **17 equivalentes en dominio válido**, **1 difiere** (redondeo).
| Id | Sitio | Clase | Observación |
|---|---|---|---|
| CR-1/2 | `segments-view.js` (49, 228) | equivalente en dominio válido | guarda `> 0`; difiere con denominador negativo |
| CR-3 | `segments-view.js` (231) | equivalente en dominio válido | guarda «truthy»: numerador ausente → 0 |
| CR-4 | `trafficConversionEngine.js:209` | equivalente en dominio válido | `> 0` |
| CR-5 | `projection.js:99` | equivalente en dominio válido | `> 0` |
| CR-6 | `reforecastEngine.js:116` | equivalente en dominio válido | con respaldo al CR cargado |
| CR-7 | `segmentInsights.js:90` | equivalente en dominio válido | **sin guarda**: NaN/Infinity con denominador 0 |
| CR-8 | `attribution.js:122,131` | equivalente en dominio válido | **sin guarda**; núcleo de la descomposición |
| AOV-1…5 | segments-view, trafficConversionEngine, projection, reforecastEngine, opportunityEngine | equivalente en dominio válido | guarda `> 0` (+ respaldo en 2) |
| AOV-6/7 | `segmentInsights.js:90`, `attribution.js` | equivalente en dominio válido | **sin guarda** |
| GAP-1/2 | `reportBuilder.js`, `planBridgeEngine.js` | equivalente en dominio válido | guarda aguas arriba |
| GAP-3/4 | `changeEngine.js` (brecha y % vs plan) | **equivalente exacto** | |
| GAP-6 | `driverEngine.js` | **equivalente exacto** | delta contra base |
| **GAP-5** | `reforecastEngine.js` `cents(actual − plan)` | **difiere** | redondea a centavos (máx. 0.005; compatible con D-02, **no idéntica**) |

**Hallazgo de integridad (D-05 «faltante ≠ cero»):** 13 de los 15 sitios de CR/AOV convertirían un numerador **ausente** en 0 (la canónica devuelve `null`); hoy lo evitan las guardas aguas arriba. **Plan de migración (oleadas, sin ejecutar en 4.1):** (1) GAP-3/4/6 (equivalentes exactos); (2) sitios con `> 0` mediante un envoltorio que conserve la guarda; (3) sitios sin guarda; (4) GAP-5 solo con decisión de redondeo. **Migrados en 4.1: 0** — no se elimina ninguna fórmula; el beneficio no compensa tocar archivos protegidos antes de integrar.

## 2. Tolerancias: qué significa cada una (P-04, **sin unificar**)
`tools/test-fase4-1-tolerancias.js` (9 comprobaciones, Z1 y catálogo reales):
| Tolerancia | Dónde | Significado |
|---|---|---|
| **0.005** (`|Δ| ≥ 0.005` → «pendiente») | Z1 (`reconciliation`) | **precisión de representación** (medio centavo); `tolerance: null` a propósito |
| **$0.01** (`|Δ| > 0.01` → «pendiente de conciliación») | D-02, `reconcile` | **umbral de decisión** de conciliación |
| 0.005 abs. (`technical`) | `isApproximatelyEqual` | comparar flotantes; no es de negocio |
| 1.00 abs. / 0.5 % (`revenue`, `hierarchy`) | validación de datos | calidad de la carga; **otro propósito** |

**¿Son equivalentes?** Con importes redondeados a centavos **coinciden** (salvo la diferencia exacta de $0.01). **Difieren** (a) con una diferencia exactamente $0.01 (Z1: pendiente; D-02: no) y (b) con importes sin redondear entre 0.005 y 0.01 (Z1: pendiente; D-02: sin diferencia). Ninguna declara «conciliada». **No se unificaron** (P-04 no autorizada); la discrepancia queda registrada.

## 3. Precisión y redondeo
Error de punto flotante ≤ 7.5·10⁻⁹ por brecha y 3.2·10⁻⁶ en sumas de 100 000 importes: compatible con $0.01.
