# Atribución: fuente de verdad por escenario (Fase 2 · punto A)

Cierra la divergencia detectada entre `attribution.js` y `trafficConversionEngine.effects`. Implementación: `FP.attribution.attributeSegment` (`js/diagnostics/attribution.js`). Pruebas: `tools/test-atribucion-escenarios.js` (64) y `tools/regression/batch_fase2_modelo_real.py` (F2.E4, F2.E5).

## 1. Auditoría comparativa (antes del cambio)
| Aspecto | `attribution.attribute` | `trafficConversionEngine.effects` |
|---|---|---|
| Propósito | Atribución matemática de una variación multiplicativa (venta o pedidos) por **factores en tasas** | Reparto de la Δ de venta de **segmentos** (sesiones, pedidos, venta) en tráfico / CR / ticket |
| Entrada | `{trafficVolume, conversionRate, aov}` base y actual | `{t, o, r}` base y actual, o `null` |
| Fórmula | Secuencial (sesiones → CR → AOV) o Shapley; Σ = Δ exacto | Misma secuencial, escrita aparte; siempre secuencial |
| Base con 0 sesiones | `insufficient_data` (tasas no finitas) | Todo el Δ a **tráfico** (`newTraffic`) |
| Base con sesiones y 0 pedidos | Con tasas finitas (CR 0, AOV 0): **todo al ticket**; con AOV `null` (consumidores reales): insuficiente | Todo a **conversión** (`noBaseOrders`) |
| Actual con 0 pedidos | `insufficient_data` (AOV actual no finito) | Residuo a conversión, ticket 0 |
| Segmento nuevo / desaparecido | No aplica | Todo a tráfico (positivo / negativo) |
| Datos faltantes / NaN | `insufficient_data` | Sin validación explícita (se trataba como 0) |
| Valores negativos | Sin regla | Sin regla |
| Reconciliación | `closes`, `residual` | `reconciles` (tolerancia 0.5) |
| Consumidores | `driverEngine` (nivel 1, grupos, mezcla), Diagnóstico, Recovery, narrativa | `homeSummaryEngine`, `funnelEngine.decompose`, `analistaStory`, Tráfico y conversión (segmentos y cruce) |
Divergencias: (1) base con sesiones y 0 pedidos: **ticket** vs **conversión**; (2) base sin sesiones: *insuficiente* vs *tráfico*; (3) actual sin pedidos: *insuficiente* vs *conversión*; (4) nuevos/desaparecidos: sin regla vs *tráfico*; (5) datos faltantes y negativos: sin tratamiento vs tratamiento silencioso; (6) dos implementaciones de la misma fórmula.

## 2. Fuente de verdad
**Una sola regla: `attributeSegment(base, cur)`.** `effects()` es ahora un adaptador (conserva la forma histórica y agrega `status`, `attributed`, `unattributed`, `reason`), `driverEngine` la consulta cuando la atribución por tasas no es calculable, y `attribute()` no reparte cuando la base vale 0. La atribución por tasas (`attribute`) sigue siendo el cálculo para el caso `ok` (se invoca desde `attributeSegment`), así que no hay dos fórmulas.

## 3. Estados y reglas por escenario
Invariante: **traffic + cr + aov + unattributed = Δ venta** siempre que Δ sea calculable. Lo que no tiene base comparable **no se reparte** entre factores y nunca genera un porcentaje.

| # | Escenario | Estado | ¿Atribuido? | Tratamiento |
|---|---|---|---|---|
| 1 | Base comparable con sesiones y pedidos | `ok` | Sí | Secuencial (o Shapley): Σ = Δ |
| 2 | Base con sesiones y 0 pedidos y el actual vende | `recuperacion_desde_cero` | No | No existe CR ni ticket base: Δ → `unattributed` |
| 3 | Base sin sesiones (sin base comparable) | `sin_base_comparable` | No | Δ → `unattributed` |
| 4 | Base con sesiones, sin pedidos y el actual también 0 | `sin_actividad` | — | Δ = 0 |
| 5 | Actual con sesiones y 0 pedidos / 0 venta | `conversion_cero_actual` | Sí | Volumen y conversión se atribuyen; el ticket no es observable (0) |
| 6 | Actual sin sesiones y sin venta | `sin_trafico_actual` | Sí | Toda la caída es de volumen (−venta base) |
| 7 | Dato faltante, no numérico o NaN | `datos_insuficientes` | No | Δ no se inventa (`null`) |
| 8 | Valores negativos o inconsistentes (venta sin pedidos, pedidos sin sesiones) | `no_calculable` | No | Δ → `unattributed`, con el motivo |
| 9 | Segmento nuevo o desaparecido | `cambio_de_composicion` | No | Δ → `unattributed`; el efecto de mezcla se mide aparte (`driverEngine.mixEffects`) |
| 10 | Ambos periodos en cero | `sin_actividad` | — | Δ = 0 |

Valores extremos (10⁹ sesiones, 1 sesión, venta de 10¹⁵) no producen NaN ni Infinity y siguen cerrando.

## 4. Vocabulario que los módulos deben respetar
| Término | Qué es | Dónde aparece |
|---|---|---|
| **Variación observada** | `actual − base`, siempre disponible | `delta` |
| **Contribución matemática** | Parte de la variación atribuible a un factor bajo la identidad | `traffic`, `cr`, `aov` |
| **Atribución secuencial** | Un factor a la vez en el orden sesiones → CR → AOV; el reparto depende del orden | `method: 'sequential'` |
| **Efecto conjunto** | La variación completa; **no** es la suma de efectos individuales (`R·términos cruzados`) | `delta` |
| **Sin atribuir** | Variación sin base comparable | `unattributed` + `status` |
| **Hipótesis causal** | Explicación posible, nunca demostrada por la aritmética | `hipotesis` (certeza del hallazgo) |
Ningún módulo presenta una contribución como causa ni un `unattributed` como contribución de un factor.

## 5. Consumidores actualizados
| Módulo | Cambio |
|---|---|
| `trafficConversionEngine` | `effects` delega; totales y cruce suman `unattributed`; `dominant` es `null` si no hay efecto atribuido |
| `homeSummaryEngine.why` | Sin base comparable no entrega `effects`; entrega `attribution {status, reason, unattributed}` |
| `funnelEngine.decompose` | Pasa `status`, `attributed`, `unattributed`; `ok` incluye lo no atribuido |
| `analistaStory` | Solo toma efectos si `attributed` |
| `driverEngine` | `attributeAgg` consulta el escenario cuando las tasas no alcanzan (casos 5 y 6 se completan; el resto queda insuficiente con motivo) |
| `segments-decomp-view`, `home-summary-view` | Textos y cascada: «sin base comparable» explícito, sin «se atribuye a conversión» |
`attribution.attribute` (API por tasas) responde `insufficient_data` si la base vale 0 y el actual no.

## 6. Diferencias matemáticas legítimas (no intercambiables)
Shapley y secuencial reparten distinto el efecto cruzado; el total es el mismo. `effects()` usa siempre secuencial («un factor a la vez» es lo que leen sus vistas); Diagnóstico usa el método de `config.diagnostics.attributionMethod`. Si ambos se muestran juntos con Shapley configurado, el reparto por factor puede diferir y no debe compararse cifra a cifra.

## 7. Limitaciones aceptadas del Punto A
Aceptadas por el usuario como parte de COMPLETADO CON LIMITACIONES DOCUMENTADAS (`ACEPTACION_FASE_2.md`); no son defectos pendientes de aceptación.
- `effects()` fija el método secuencial; unificar con Shapley requeriría un cambio visible en vistas.
- El efecto de mezcla de segmentos nuevos/desaparecidos se calcula en `driverEngine.mixEffects` y en `analyze().mix`, con definiciones propias; no se unificó.
- Un `unattributed` grande hace que el reparto por factor de un total sea parcial: las vistas lo indican, pero no existe todavía un umbral de «demasiado sin atribuir».
