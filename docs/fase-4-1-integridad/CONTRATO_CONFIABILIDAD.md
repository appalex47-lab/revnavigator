# Contrato `cc.reliability/1` y suficiencia de muestra `cc.sample/1` (consolidado, P-05 y P-08)

> **Actualización del cierre técnico (ver `docs/cierre-fase-4-1-4-2/`).** Lo siguiente supera a lo escrito más abajo si hay contradicción: (1) `planStatus`, `businessState` y `attentionEngine` ya **no** contienen umbrales de respaldo (solo `FP.config.forecast.pacingThresholds`); (2) `js/commandCenter/z1.js` es un archivo **generado** desde la especificación (`tools/build-z1-port.js`), no una copia manual; (3) los textos de `segments-view` salen de la configuración (P-21 resuelto, límite «textos fijos» cerrado); (4) «121 scripts, 0 fallas» (y «117») incluía **3 scripts omitidos** (requieren archivos externos): son 120 ejecutados + 3 omitidos; (5) existe `reconcileSessionsReport` y `tools/audit/validar-sesiones-ga4.js` para validar sesiones con datos reales; (6) `index.html` carga solo `planStatus.js` y `sampleSufficiency.js` desde `js/commandCenter/`.


**Módulos:** `js/commandCenter/reliability.js` y `js/commandCenter/sampleSufficiency.js` (no cargados por `index.html`, sin consumidores). **Especificación de origen:** `tools/audit/confiabilidad-contrato.js`. **Pruebas:** `test-fase4-1-confiabilidad.js` (23), `test-fase4-1-contratos-js.js` (30).

## 1. Confiabilidad `cc.reliability/1`
- **El nivel (Alta/Media/Baja/Insuficiente) no se redefine**: es el de la evaluación aceptada de Z1 (D-05). El módulo de `js/` recibe la evaluación de Z1 como entrada (`assess(i, o1)`) y falla con mensaje claro si falta: no hay una segunda regla de nivel (prueba D2).
- **Portabilidad demostrada:** con la evaluación de Z1 como entrada, `reliability.js` produce **exactamente** lo mismo que la especificación en 4 000 entradas (nivel, dimensiones, usos, explicación) y el texto de `dimensions`/`uses` es idéntico; una mutación del módulo se detecta.
- **Dimensiones:** completitud, cobertura, vigencia, consistencia, trazabilidad, comparabilidad, suficiencia de muestra. **Tipos:** `valido`, `parcial`, `insuficiente`, `inconsistente`, `no_disponible`, `desactualizado`, `no_evaluado` (cuando no llega el dato necesario).
- **Matriz de usos:** mostrar métrica · clasificar estado · diagnosticar · recomendar · estimar impacto · conclusión ejecutiva, cada una permitida/con reservas/preliminar/solo datos/bloqueada con su razón. Ninguna IA decide (`decidedBy: regla determinista`).
- **Limitación:** el evaluador de Z1 sigue siendo especificación (`tools/audit/z1-lectura-ejecutiva.js`); mientras no se porte, la aplicación **no puede producir la evaluación que `reliability.js` necesita**. Es el primer paso de 4.2.

## 2. Suficiencia de muestra contextual `cc.sample/1` (P-08)
No hay umbral universal (`universalThreshold: false` en todo resultado). La suficiencia depende de la **operación**, el **tipo de métrica** (importe · conteo · tasa), la granularidad y el periodo, y cada resultado declara su **base**:

| Base | Significado |
|---|---|
| `estructural` | condición lógica (hay una observación; plan > 0; denominador > 0); no es un umbral estadístico |
| `criterio_repo:<id>` | criterio que la aplicación **ya usa**, leído de su configuración |
| `criterio_declarado` | mínimo aportado por quien llama (aprobado por el negocio) |
| `sin_criterio` | no hay criterio aprobado → `no_evaluado` (no se inventa un umbral) |

| Operación | Regla | Ejemplo medido (12 pruebas, `E1–E12`) |
|---|---|---|
| Mostrar un dato observado | ≥ 1 observación válida | 1 observación → suficiente (D-01: la venta observada válida se muestra siempre) |
| Calcular una desviación | plan > 0 y ≥ 1 día contado; tasas: denominador > 0; canales incompletos → `parcial`; periodo parcial → aviso «a la fecha» | plan 0 → insuficiente; plan 0.01 → suficiente |
| Diagnosticar | estructural + (segmento: criterio de la aplicación `max(500, 1 % del tráfico)`) + (índices de forecast: mín. días) ; **sin criterio aprobado → `no_evaluado`** | segmento de 450 sesiones con 20 000 totales → insuficiente (mín. 500) |
| Estimar un impacto | método verificable + desviación + criterios de forecast de la aplicación (`minComparableDays` = 5, `minWindowCoverage` = 0.7, **leídos de `FP.config`**) | 4 días → insuficiente; 5 → suficiente; con 8 en la config → exige 8 |

Con los **mismos datos** (4 días, plan 100): se puede mostrar y calcular la desviación, **no** estimar un impacto (`E8`).
**Criterios existentes que se aprovechan (y deuda detectada):** `forecast.minComparableDays/minWindowCoverage` (config, editables) y el mínimo de sesiones por segmento, **copiado en tres sitios** (`trafficConversionEngine.js:76`, `segmentInsights.js:14`, `reportBuilder.js:549`): deuda técnica D-6. Otros mínimos dispersos (`minSamples` 3, `MIN_COVERAGE` 0.8/0.9, `minAnchors`) pertenecen a funciones distintas y **no se reutilizan** sin evidencia de que midan lo mismo.
