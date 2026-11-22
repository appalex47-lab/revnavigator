# Contraste de decisiones entre expertos — Fase 4.1

> Rama `ccr-a81af632-rirtu7`, commit base `625daec`. Cada dictamen se sustenta en código, contratos y **pruebas ejecutadas** (`tools/test-fase4-1-*.js`: 117 comprobaciones; regresión completa sin fallas). Datos simulados. Dictámenes: CONFIRMADA · CONFIRMADA CON AJUSTES · ALTERNATIVA SUPERIOR · NO RECOMENDADA · NO VERIFICABLE.

> **Consolidación (segunda ronda):** tras la autorización de P-01/P-02/P-03/P-05/P-08 se contrastaron de nuevo con el código. **Desacuerdos con la primera versión, con evidencia:** (1) `pacingThresholds` es un **par de umbrales** editable, no una banda «±1 %» (±1 % es solo el valor por defecto); (2) el inventario de reimplementaciones era incorrecto: son **21 sitios** (8 CR, 7 AOV, 6 brecha), y `px-ficha`/`px-view` no calculan; (3) de los «siete sitios» de estado, **solo dos** miden cumplimiento acumulado y se unifican; los otros cinco miden otro concepto o alimentan el golden del reporte, así que su equivalencia **no es demostrable**; (4) existía un **defecto real**: `a.pacingStatus` ignoraba los umbrales del usuario; (5) 0.005 (Z1) y $0.01 (D-02) **no son equivalentes**.

## Tabla de contraste
| Decisión | Propuesta inicial | Dictamen Claude | Decisión técnica resultante | Evidencia |
|---|---|---|---|---|
| 1 · Estado del negocio | Una sola regla; banda configurable y centralizada; 7 estados; sin confundir falta de datos con desempeño | **CONFIRMADA CON AJUSTES** | Contrato `cc.plan_status/1` con los 7 estados; **tolerancia única = `FP.config.forecast.pacingThresholds` (±1 %)**, no una banda nueva; el titular del Inicio (±2 %) y los demás umbrales son los que deben migrar | 7 sitios con umbrales distintos; equivalencia exacta con `FP.gap.pacingStatus` en 100 000 casos |
| 2 · Fuente de verdad y métricas | Catálogo canónico por métrica; reglas de conciliación; $0.01 | **CONFIRMADA CON AJUSTES** | Catálogo de 13 métricas que **apunta a las funciones existentes** (no reescribe fórmulas); sesiones: fuente primaria = dataset real, segmentos = desglose del mismo universo; $0.01 solo con universo idéntico; migración por etapas con pruebas de equivalencia | 9 reimplementaciones reales; error de punto flotante 3·10⁻⁶ MXN; Z1 usa 0.005 |
| 3 · Confiabilidad | Contrato transversal con dimensiones y usos | **CONFIRMADA CON AJUSTES** | `cc.reliability/1` **construido sobre la evaluación aceptada de Z1** (no una segunda definición): mismo nivel en 4 000 entradas + dimensiones + matriz de 6 usos | Equivalencia con Z1 (D-05); decidedBy determinista |
| 4 · Hallazgos | Modelo canónico de hallazgos | **ALTERNATIVA SUPERIOR** (extender, no crear) | **No crear un contrato nuevo**: el `cc.finding` v1 de Fase 2 ya cubre ≈ 85 % de los campos pedidos; se **extiende de forma aditiva** a v1.1 (causalidad, confiabilidad de datos, recomendación/acción, fechas) y se demuestra que `attentionEngine` se expresa en él sin modificarlo | 3+ hallazgos reales validados; reglas hipótesis ≠ causa; IA no eleva causalidad |
| 5 · Impacto económico | Separar venta observada, impacto estimado y contribución; no sumar duplicados | **CONFIRMADA CON AJUSTES** | Principios confirmados; **dos conflictos con D-01/D-06 documentados, no corregidos**: el margen negativo hoy se trata como «no configurado» y `combineImpacts` consolida superposiciones. La integración debe mostrar impactos individuales con su relación, **sin total consolidado**, hasta 4.5 | `impactModel.js` caracterizado (15 comprobaciones); hash intacto |

## Decisión 1 — Estado único frente al plan
- **Evaluación independiente.** El problema es real y **mayor** que el descrito: no son dos reglas, son **siete** sitios con umbrales distintos (ver `CONTRATO_ESTADO_COMERCIAL.md`). La contradicción observada (99.8 %) se reproduce con el código: titular ±2 % («en plan») frente a `contextEngine` 0.05 % («por debajo»).
- **Evidencia.** `gap.pacingStatus` (±1 %), usado por `attentionEngine`, las píldoras de Pacing, la tarjeta de cumplimiento del Inicio y `pc-resumen`; el contrato aceptado de Fase 2 (`DEFAULT_BANDS` 1.01/0.99); `home-resumen` ±2 % (`config.homeSummary.planBand`, marcado «PROVISIONAL»); `contextEngine` 0.0005; `chg-resumen` −5 %/−1 %/+2 %; `analistaStory` 0.5 %; `reportCopy` ±2 % y −10 %; `escenarios` 0.5 % y 1 %.
- **Ajuste a la propuesta.** La propuesta recomienda una banda «configurable»; **ya existe** y es editable por el usuario (`run.settings.pacingThresholds`). La mejor solución no es crear una tolerancia nueva sino hacer que **todos** consuman esa. El valor recomendado es **±1 %**: es el de mayor consenso en el código (Fase 2, Pacing, Home, Atención), mientras que ±2 % es una banda «provisional» solo del titular.
- **Riesgo de mantener la propuesta tal cual.** Fijar ±2 % cambiaría Pacing, Atención y el contrato aceptado; dejarla abierta mantiene la contradicción.
- **Alternativa explorada (no verificable).** Una tolerancia que dependa de los días contados (más ancha al inicio del periodo): razonable estadísticamente pero **no hay evidencia en el repositorio** para fijar su forma; queda como mejora futura, no como decisión.
- **Impacto.** Cambiar el titular de ±2 % a ±1 % altera el texto para cumplimientos entre 98–99 % y 101–102 %; requiere **autorización** (decisión comercial de tolerancia). No se cableó nada en 4.1.
- **Pruebas.** `test-fase4-1-estado-comercial.js` (30): escenarios pedidos, equivalencia, determinismo, caracterización de la divergencia, 5 mutaciones.
- **Autorización adicional:** **Sí** (tolerancia única y migración de sitios).

## Decisión 2 — Fuentes y métricas
- **Evaluación.** Correcta en principio; ajustes: (a) una definición canónica no significa reescribir: el catálogo **referencia** `metrics/derivations/gap/attribution` y la migración sustituye las 9 reimplementaciones **una por una** con equivalencia numérica; (b) «no sumar sesiones de dos fuentes»: la auditoría muestra que los segmentos GA4 son **un desglose** del mismo universo, no una fuente alternativa del total; (c) $0.01: compatible con la precisión actual (suma de 100 000 importes: error 3·10⁻⁶; `cents()` de `reforecastEngine`: ≤ 8·10⁻⁹), **pero** Z1 (aceptada) marca pendiente desde **0.005**: diferencia a reconciliar en D-02.
- **Corrección propia.** En mi primer borrador del catálogo el orden de fallback del plan estaba invertido; la prueba E2 lo detectó contra `forecastEngine` (plan original congelado → plan importado) y se corrigió.
- **Riesgo de mantener.** Catálogo sin consumo real = documento; sin pruebas de equivalencia, migrar puede cambiar cifras.
- **Pruebas.** `test-fase4-1-metricas-y-fuentes.js` (26).
- **Autorización adicional:** **Sí** para fijar la regla de fuente de sesiones y para alinear el umbral de Z1 con D-02.

## Decisión 3 — Confiabilidad
- **Evaluación.** Existe una evaluación **aceptada** (Z1, 3.2, D-05) y nada equivalente en `js/`. Crear otro contrato duplicaría reglas. **Mejor solución:** el contrato transversal **reutiliza** el nivel de Z1 y añade dimensiones y usos; así el nivel no puede divergir (4 000 entradas iguales).
- **Ajustes.** Las dimensiones «vigencia», «trazabilidad» y «suficiencia de muestra» **no pueden evaluarse con los datos que hoy llegan**: devuelven `no_evaluado` en vez de inventar un resultado; la muestra solo se evalúa con un criterio aportado por quien llama (D-03: sin umbral universal).
- **Riesgo de mantener.** Un porcentaje único ocultaría problemas; el contrato permite explicar qué falta y qué usos se bloquean.
- **Pruebas.** `test-fase4-1-confiabilidad.js` (23). **Autorización:** no para el contrato; sí para portarlo a `js/` (4.2).

## Decisión 4 — Hallazgos
- **Evaluación independiente → alternativa superior.** El contrato de Fase 2 ya exige: id estable, tipo, evidencia con fuente y números, certeza con escalera (hecho > cálculo > driver > señal > estimación > hipótesis), vigencia, linaje, impacto o razón, deduplicación y ciclo de vida. Faltaban solo: **causalidad explícita**, **confiabilidad de datos**, **recomendación/acción** y **fechas**. Reescribirlo habría duplicado y roto la trazabilidad con Z3/Z4 (aceptadas). Se extiende de forma aditiva (v1.1).
- **Evidencia.** El adaptador convierte los hallazgos **reales** de `attentionEngine` (brecha, driver, forecast, calidad de datos) y todos superan el validador de Fase 2 + la extensión; `attentionEngine` no se tocó.
- **Hallazgo propio.** La escalera no tiene «causa comprobada»; se añade como `causality: demonstrated`, con reglas estrictas (evidencia de clase hecho que pruebe la causa; la IA nunca la eleva).
- **Pruebas.** `test-fase4-1-hallazgos.js` (23). **Autorización:** no; portar a `js/` en 4.3.

## Decisión 5 — Impacto económico
- **Evaluación.** Principios correctos y compatibles con el contrato v2 (impacto en ventas siempre; contribución opcional con margen válido; null y no 0; categorías sin mezclar).
- **Conflictos con decisiones aprobadas (no se sobrescribe su significado).** (i) **D-01** pide distinguir el margen negativo de «no configurado»; hoy el motor devuelve `no_configurado` para −5 %. (ii) **D-06** pide «no consolidar automáticamente impactos superpuestos»; `combineImpacts` consolida (toma el mayor; con pérdidas, el de menor magnitud). **Reconciliación propuesta:** en la integración se muestran impactos individuales con relación explícita (incluye/alternativa/independiente) y **sin total consolidado** hasta que existan reglas verificables (4.5).
- **No se tocó** `combineImpacts` ni la lógica de margen (hash verificado). **Pruebas.** `test-fase4-1-impacto-conceptual.js` (15). **Autorización:** **Sí** para 4.5.


---
# Matriz final de decisiones (segunda ronda)

| Decisión | Dictamen final | Resultado técnico | Evidencia |
|---|---|---|---|
| **P-01** Estado único | **CONFIRMADA CON AJUSTES** | Regla = `FP.gap.pacingStatus`; configuración = `pacingThresholds` (par de umbrales); 2 sitios unificados, 5 conservados con justificación; defecto de umbral efectivo corregido; `plan_status` preparado | `test-fase4-1-estado-consumidores` (15), `estado-comercial` (30), lotes de navegador |
| **P-02** Fuente de sesiones | **CONFIRMADA** (sin respaldo; conciliación sin tolerancia inventada) | Primaria = serie diaria; secundaria = segmentos; `reconcileSessions` | `test-fase4-1-sesiones` (19) |
| **P-03** Catálogo y migración | **CONFIRMADA CON AJUSTES** | 21 sitios clasificados (3 exactos · 17 en dominio válido · 1 difiere); 0 migrados; plan por oleadas | `test-fase4-1-reimplementaciones` (27) |
| **P-04** 0.005 vs $0.01 | **NO UNIFICAR (investigado)**: no son equivalentes | significados y bordes documentados | `test-fase4-1-tolerancias` (9) |
| **P-05** Contratos en `js/` | **CONFIRMADA CON AJUSTES** | `findings`, `reliability`, `sampleSufficiency` portados con texto y comportamiento idénticos a la especificación; **no integrados** | `test-fase4-1-contratos-js` (30) |
| **P-08** Suficiencia de muestra | **CONFIRMADA** | `cc.sample/1` por operación × tipo de métrica; sin umbral universal; criterios del repositorio leídos de `FP.config` | `contratos-js` E1–E12 |
| **P-06/P-07** Economía (D-01/D-06) | **DIFERIDA a 4.5** (conflictos documentados, sin tocar) | `impactModel.js` intacto | `impacto-conceptual` (15) |
| **P-09 / P-10** | **No autorizadas** | sin cambios en el Home real; sin commits | `git status` |
