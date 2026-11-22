# Modelo de cuantificación económica (Subfase 2.5)

Contrato `cc.economic_impact` **v2** (compatible con v1). Implementación: `js/economics/impactModel.js` (`validateImpact`, `combineImpacts`, `checkOrdering`, `jointRelative`, …), re-exportada por `tools/audit/command-center-contracts.js` para las pruebas de contrato. **Regla de oro: el módulo no calcula impactos; orquesta los motores existentes** (`gap.js`, `scenarioEngine`, `recoveryEngine`, `attribution.js`, `impactMeasurement`) y solo agrega las reglas de combinación, solapamiento y exclusión que hoy no existen.

## 0. Modelo dual (decisión de negocio, punto B)
La prioridad es **crecer en ventas**; el margen **no es obligatorio**. Coexisten dos modalidades sin alterar los motores de ventas:

| Modalidad | Qué responde | Disponibilidad |
|---|---|---|
| **1 · Impacto comercial en ventas (MXN)** | Cuánto se vende, cuánto falta, cuánto se puede recuperar o ganar | **Siempre**, sin configuración |
| **2 · Contribución bruta estimada** | Qué parte de ese impacto en ventas se estima que contribuye, con un margen bruto promedio general | Solo si el usuario lo configura y lo activa |

Implementación: `js/economics/impactModel.js` (`FP.economics`, funciona en navegador y en Node). Contrato **`cc.economic_impact` v2** (los v1 de la primera entrega siguen siendo válidos). Pruebas: `tools/test-economia-dual.js` (64), `tools/regression/batch_fase2_margen.py` (26), más el contrato de Fase 2 (69) que ahora usa este mismo módulo.

Flujo: motores oficiales (gap, pacing, forecast, scenario, recovery) → **adaptadores** `fromGap`, `fromSimulation`, `fromRecovery` (no recalculan: traducen) → impacto de ventas → `contributionOf` (si hay margen) → `combineImpacts` sin doble conteo. El módulo no lee ni modifica sesiones, CR, AOV, pedidos, venta observada, forecast, pacing, atribución, recuperación ni diagnósticos; verificado: con margen activo, desactivado o quitado, los resultados de los motores son **idénticos** (F2.M8, M18).

### Vocabulario del impacto comercial (`salesKind`)
| `salesKind` | Categoría | Origen | Procedencia |
|---|---|---|---|
| `observada` | `observado` | `gap.js` / `pacing` (venta real a la fecha) | observed |
| `brecha` | `brecha` | `gap.js` (real − plan) | observed |
| `estimada` | `esperado`, `en_riesgo` | forecast / reforecast (con calibración) | projected |
| `potencial` | `potencial_teorico` | `scenarioEngine.simulate` (cambio completo, teórico) | projected |
| `recuperable` | `alcanzable` | `recoveryEngine.recoveryOptions` (alternativas que cierran la misma brecha) | projected |
Venta base, objetivo, forecast y «venta necesaria» se leen de los motores existentes (`pacing`, `forecastEngine`, `recoveryEngine.required`); este módulo no las duplica.

### Contribución bruta estimada (bloque `contribution`)
| Campo | Contenido |
|---|---|
| `status` | `disponible` · `no_configurado` · `desactivado` · `sin_importe` |
| `amount` | `{point, low?, high?}` si `disponible`; **`null` en cualquier otro caso (ausencia ≠ cero)** |
| `marginPct`, `marginBasis` | Margen usado y su nivel (`general`) |
| `formula` | `contribución bruta estimada = impacto en ventas × margen bruto promedio` |
| `precision` | Siempre `estimacion_margen_promedio_general` |
| `limitations` | No es el margen real de cada producto; no descuenta gastos ni costos que no estén en los datos |
| `label` | «Contribución bruta estimada» (nunca utilidad, ganancia ni beneficio neto, ni ROI) |
`amount.point = ventas × margen / 100` (verificado con 200 casos aleatorios y con importes reales de la aplicación). Margen 0 % es un estado **disponible** con contribución 0 declarada; «sin margen» es otro estado y nunca muestra 0. Datos insuficientes → `sin_importe`, nunca 0.

### Configuración del margen
Parámetro **opcional** en `state.settings.economics` (mecanismo de ajustes existente, `saveSettings`; sin persistencia paralela): `{ marginEnabled, grossMarginPct, updatedAt, source }` (`source: 'manual'`). Pantalla: Configuración → Herramienta → «Margen comercial (opcional)».
- Se captura **margen bruto sobre venta** `(venta − costo) ÷ venta` en %; la pantalla lo distingue del *markup* con el ejemplo $100 / $75 (25 % vs 33.33 %). Conversión: `margen = markup ÷ (1 + markup)`.
- Rango válido: `0 ≤ margen < 100`. Se rechazan vacío, texto, «%», notación científica, NaN/Infinity, negativos y ≥ 100 (con mensaje). Acepta coma decimal.
- Un valor guardado inválido se lee como «sin margen». Desactivar conserva valor y fecha; «Quitar margen» vuelve a `no_configurado`.
- Persiste al recargar (F2.M9); no reprocesa datos; no toca otros ajustes (F2.M19).
- Evolución sin romper contrato: `resolveMargin(setting, scope)` es el único punto que decide el margen; hoy solo existe el nivel `general` (y declara `marginBasis.level`). Un nivel por categoría/familia/producto/SKU se agregaría en `setting.overrides` y en `resolveMargin`, sin cambiar la salida. No implementado.

### Combinación (con y sin margen)
Las reglas de §4 se mantienen. Con margen, la contribución de un total es **ventas combinadas × margen** (lineal): las alternativas excluyentes dan un rango de contribución (no la suma de contribuciones) y las oportunidades superpuestas no se duplican. Sin margen, el combinado de ventas es idéntico y `contribution.status = no_configurado`.

## 1. Alcance de la moneda
La base del impacto es **venta (MXN)**. La contribución bruta es una capa aparte, opcional y estimada, con un margen promedio general. No se calculan costo, CAC, ROAS, ROI ni rentabilidad neta. El contrato exige `basis.indicator = 'revenue'`.

## 2. Seis categorías (no intercambiables)
| Categoría | Qué es | Procedencia | Fuente | Condición para emitirla |
|---|---|---|---|---|
| `observado` | Efecto ya ocurrido | observed | `gap.js`, `impactMeasurement` | Solo datos reales |
| `brecha` | Real − plan en los mismos días | observed | `gap.js` | Plan definido |
| `potencial_teorico` | Lo que ganaría un cambio de driver *si ocurre completo* | projected | `scenarioEngine.simulate` | Supuestos explícitos y horizonte |
| `alcanzable` | Parte del potencial que las restricciones permiten | projected | `recoveryEngine` | **Restricciones declaradas** o desempeño histórico propio (`constraintsBasis`); nunca una tasa de captura inventada |
| `esperado` | Valor ponderado por probabilidad | projected | — | **Solo con calibración** (p. ej. error histórico del forecast); sin ella no se emite (`null`) |
| `en_riesgo` | Venta que el cierre proyectado deja fuera | projected | `forecastEngine` (spread entre métodos, `forecastGap`) | Forecast disponible |
Invariantes: `alcanzable ≤ potencial_teorico` y `esperado ≤ alcanzable` (`checkOrdering`). Observado y brecha jamás llevan supuestos de proyección; toda proyección exige ≥ 1 supuesto, horizonte y, si es un rango, `low ≤ point ≤ high`.

## 3. Fórmulas
- Brecha: `real − plan` (mismos días contados). Ejemplo verificado: −$722,816 (95.5 % de cumplimiento, cierre −3.3 %).
- Identidad: `VENTA = SESIONES × CR × AOV`.
- Efecto **conjunto** de cambios relativos a (volumen), b (CR), c (ticket) sobre una venta base R: `R·((1+a)(1+b)(1+c) − 1)`.
- Atribución del conjunto entre drivers: secuencial (`attribution.js`), Σ = conjunto exacto.
- Interacción: `conjunto − Σ individuales = R·[(1+a)(1+b)(1+c) − 1 − a − b − c]`.
Verificación en la aplicación real (`batch_fase2_modelo_real.py`): E1 conjunto = fórmula independiente; E2 la interacción coincide y es ≠ 0 (los efectos **no son aditivos**); E3 la atribución del conjunto cierra exacto.

## 4. No aditividad y doble conteo (`combineImpacts`)
1. Solo se suman impactos de la **misma categoría y procedencia**; observado y proyectado nunca se mezclan.
2. Mismo `overlapGroup` (describen el mismo dinero, p. ej. la caída de CR y la brecha del canal): **no se suman**; se toma el mayor y se advierte la superposición.
3. Mismo `exclusiveGroup` (alternativas de recuperación): cada una cierra la **misma** brecha; se reporta el rango [mín, máx], nunca la suma (F2.E7: todas las alternativas del motor de recuperación cierran la brecha).
4. `insufficient_data` no aporta cero: se lista aparte y el total queda marcado **incompleto**.
5. El rango del total = suma de extremos de grupos independientes (conservador).
6. Atribución multi-driver: un solo efecto conjunto repartido con `attribution.js`; nunca tres escenarios individuales sumados.

## 5. Datos insuficientes y extrapolación
`status: insufficient_data` con `amount: null` y `reason` (sin plan, sin días editables, sin historial para el rango). No se extrapola fuera del horizonte observable ni se anualiza un mes sin declarar el supuesto. Un valor sin intervalo solo se admite si el motor es determinista (brecha, conjunto de escenario); un pronóstico siempre lleva rango o la advertencia de que el spread entre métodos es la incertidumbre.

## 6. Reproducibilidad y auditoría
Cada impacto trae `method {id, formula, engine}`, `basis {periodo, alcance, indicador}`, `assumptions[]` y, en proyecciones, `horizon`. Con eso cualquier cifra se recalcula desde el mismo motor. Las pruebas usan un oráculo independiente (fórmula cerrada) en lugar de comparar el motor contra sí mismo.

## 7. Divergencia de atribución (resuelta)
Resuelta en el punto A: una sola regla en `FP.attribution.attributeSegment` (`ATRIBUCION_FUENTE_DE_VERDAD.md`). La cuantificación por driver usa esa regla; lo que no tiene base comparable queda como «sin atribuir» y no se valúa por factor.

## 8. Limitaciones aceptadas del Punto B (lo que no se implementa en esta fase)
Aceptadas por el usuario como parte de COMPLETADO CON LIMITACIONES DOCUMENTADAS (`ACEPTACION_FASE_2.md`); no son defectos pendientes de aceptación.

Integración visual del impacto de ventas y de la contribución con Inicio/Command Center (Fase 3/4); calibración del impacto esperado con el backtest del forecast; margen por categoría/producto/SKU (solo se dejó el punto de extensión); `estimada` solo se emite con calibración. La contribución **no** está todavía en ninguna vista de resultados: hoy solo existen el módulo, los adaptadores, la configuración y las pruebas.
