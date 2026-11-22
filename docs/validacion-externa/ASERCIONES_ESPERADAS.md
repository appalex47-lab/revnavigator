# Aserciones esperadas

## E-1 — `tools/test-phase21-real.js` (7 aserciones, sin modificar su contenido; solo se parametrizó la ruta del CSV con `REAL_PRODUCT_CSV` y se usa el código ACTUAL de los motores)
1. CSV tiene 85k+ filas · 2. hay productos con ≥ 6 periodos · 3. la entidad real (la de mayor venta entre las 20 candidatas) tiene historia ≥ 6 periodos · 4. el forecast real está disponible con 3 periodos · 5. el forecast conserva inicio y duración del patrón (se compara contra `patternStartPeriod || startPeriod`, igual que el motor) · 6. el backtest se calcula (periodsTested > 0, MAPE finito) · 7. los periodos futuros son posteriores y crecientes.
**Resultado esperado:** 7/7 PASS. Cualquier FAIL con datos reales es un hallazgo real a investigar (no a «arreglar» ajustando la prueba).

## E-2 — conciliación
Sin pass/fail de negocio: se esperan (i) estructura válida (sin duplicados, canales/dimensiones válidos, periodo explícito), (ii) por cada canal × dimensión: total diario, total de segmentos, diferencia, % y estado (`sin_diferencia_observada` · `discrepancia_sin_criterio` · `dentro/fuera_de_tolerancia_declarada` · `datos_faltantes` · `no_comparable`), (iii) advertencia de doble conteo si varias dimensiones suman el universo, (iv) evidencia por día (mediana, p95, máx). **La tolerancia la fija el negocio con esa evidencia; el paquete no la propone.**

## E-3 — invariantes por entidad (canal y Total)
A1 nivel de reliability = nivel de Z1 · A2 venta observada válida visible (o sin_actividad/no_calculable) · A3 sesiones/pedidos ausentes → null y sin conclusión de conversión · A4 cobertura < 100 % ⇒ nivel ≠ Alta; actividad ausente ⇒ completitud ≠ verificada · A5 venta agregada o actividad negativa ⇒ Insuficiente · A6 sin NaN/Infinity · A7 brecha y cumplimiento = `FP.metrics.calcGap` · A8 coincide con lo esperado por el analista (si lo declaró).
**Resultado esperado:** A1–A7 en OK para todas las entidades. Una diferencia en A8 no es un defecto del código: indica que Z1 evalúa distinto de lo que el analista esperaba y requiere revisión conjunta (sin cambiar reglas para hacerla coincidir).
