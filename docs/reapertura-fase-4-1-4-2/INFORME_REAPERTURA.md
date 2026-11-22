# Informe ejecutivo — Reapertura y cierre de 4.1 y 4.2

**Estado:** el trabajo técnico de 4.1 y 4.2 está completado dentro del alcance autorizado. **No se declara «aceptada»**: queda **un** requisito externo auténtico (datos reales) que no se simula (`DEPENDENCIAS_EXTERNAS.md`). Rama `ccr-a81af632-rirtu7`, HEAD `625daec0969f9cd6e9db5d93a41eb652040d506`; sin commit, push, merge, PR ni despliegue. 4.3 no iniciada. `impactModel.js`, `combineImpacts`, D-01 y D-06 intactos.

## Defectos encontrados y corregidos (resumen; detalle en `MATRIZ_HALLAZGOS.md`)
1. 21 sitios con fórmulas propias de CR/AOV/brecha → **todos migrados** (paridad exacta con los motores originales de Git).
2. `calcConversionRate/calcAov` permitían denominadores negativos, contra lo que declaraba `derivations.js` → exigen > 0.
3. Contratos sin consumidor → **conectados** a Inicio (atención, resumen, contexto) con cadena Z1 → confiabilidad → hallazgos → suficiencia.
4. Tres escalas propias del reporte (±2 %, ±0.5 %) contradecían a Pacing → regla central única.
5. Tolerancias de conciliación dispersas → configuración única con candado frente a la especificación de Z1.
6. Dimensión «muestra» sin criterio → `sampleSufficiency` (P-17).
7. Scripts omitidos: 2 ahora se ejecutan; 1 sigue omitido (dato real).
8. Laguna de pruebas (`changeEngine`) cerrada; aserciones constantes eliminadas; 23 mutaciones en total, todas detectadas.

## Decisiones técnicas aplicadas
`calcRelativeChange` conserva `a/b − 1` (idéntico bit a bit; `calcGap().pct` no se toca); `cents()` se conserva en el redondeo de `reforecastEngine`; Z1 y `businessState` se cargan porque ahora tienen consumidor; el reporte solo transporta umbrales personalizados (para no alterar su salida por defecto); P-04 resuelto sin editar la especificación aceptada (candado por prueba).

## Resultados
128 scripts Node (127 ejecutados, 0 fallas, 1 omitido), 356 pruebas nuevas, 5 verificadores, 251 archivos sin errores de sintaxis, 57+ lotes de navegador OK, 23 mutaciones detectadas (`AUDITORIA_PRUEBAS_Y_MUTACION.md`).

## Antes → después
Antes: contratos preparados sin uso, fórmulas duplicadas, escalas contradictorias. Después: una función por fórmula, una regla de estado, una configuración por umbral, y los resultados de Z1/hallazgos visibles y trazables en Inicio.

## Límites honestos
La validación con datos reales (E-1, E-2, E-3) no se ha podido hacer; los resultados son con datos simulados. `metricCatalog` es referencia y herramienta, sin carga en la app.

---

## Resultado de la validación externa real (2026-11-20)

E-1 aprobada; E-3 aprobada (calidad declarada `warnings`); E-2 ejecutada con **limitación aceptada por el usuario**: `traffic_volume` de ecommerce anterior a 2026-10-05 y de app anterior a 2026-09-25 (y app 2026-10-02) no coincide con GA4 (cambio de origen sin explicar). Detalle, alcance y condiciones: [`docs/validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md`](../validacion-externa/LIMITACION_E2_TRAFFIC_VOLUME.md). La limitación está documentada, **no impuesta por código** (decisión pendiente). Esto no equivale a la aceptación formal de 4.1/4.2, que corresponde al usuario.
