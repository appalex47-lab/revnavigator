# Procedimiento de conciliación GA4 ↔ serie diaria

1. **Mismo universo y periodo.** Extrae ambos archivos para el MISMO rango y los MISMOS canales (ecommerce y app). WhatsApp/Llamadas no tienen GA4 (se reportan `datos_faltantes`).
2. **Estructura** (`e2-sesiones.js` la valida antes de comparar): periodo explícito; canales y fechas válidos; unicidad (`date×channel` y `date×channel×dimension×segment`); sessions entero ≥ 0 o vacío; segmentos «(not set)» > 20 % → aviso; días con dato en cada lado.
3. **Comparación.** Cada canal × dimensión se compara por separado con el total diario del canal (`FP.metricCatalog.reconcileSessionsReport`). **Nunca se suman dimensiones entre sí**; si la suma de varias es ≫ el total, se advierte doble conteo.
4. **Lectura de la diferencia.** `sin_diferencia_observada` ≠ conciliación formal (D-02). Con diferencia y sin tolerancia declarada: `discrepancia_sin_criterio` (se muestra, no se oculta). Días distintos entre fuentes se señalan como diferencia de cobertura, no de medición.
5. **Evidencia para decidir.** La tabla por día (mediana, p95, máximo de |Δ %|) sirve para que el negocio decida una tolerancia; solo entonces se repite con `--tolerance X` (el paquete informa dentro/fuera sin cambiar la diferencia). La tolerancia aprobada se registrará en configuración en una fase posterior (no se inventa aquí).
6. **Ausencia ≠ cero.** `sessions` vacío se trata como ausente.

---

Resultado real de E-2: ver [`LIMITACION_E2_TRAFFIC_VOLUME.md`](LIMITACION_E2_TRAFFIC_VOLUME.md).
