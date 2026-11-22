# Decisiones: autorizadas, aplicadas y pendientes

## Autorizadas en esta ronda y su resultado
| ID | Decisión | Resultado en 4.1 |
|---|---|---|
| P-01 | regla única y configuración central | **Aplicada** en 2 sitios (Inicio, contextEngine) + defecto de umbral efectivo corregido; 5 sitios **no equivalentes** se conservan (ver P-11) |
| P-02 | fuente canónica de sesiones | **Definida** (primaria = serie diaria; secundaria = segmentos; sin respaldo); conciliación sin tolerancia aprobada |
| P-03 | catálogo + migración progresiva | **Matriz de equivalencia hecha (21 sitios)**; migrados: 0; oleadas planteadas |
| P-05 | contratos reutilizables en `js/` | **Preparados** (`findings`, `reliability`, `sampleSufficiency`, `planStatus`, catálogo); **no consumidos** |
| P-08 | suficiencia contextual | **Diseñada e implementada** (`cc.sample/1`); sin umbral universal |

## No autorizadas (siguen reservadas)
P-04 (unificar 0.005 y $0.01: **investigado**, no unificado) · P-06/P-07 (`impactModel`, D-01, D-06, `combineImpacts` → 4.5) · P-09 (Command Center en el Home real) · P-10 (commits/push/merge/PR/deploy).

## Nuevas decisiones que surgieron (requieren tu criterio)
| ID | Pregunta | Recomendación |
|---|---|---|
| **P-11** | ¿Alinear la escala del **reporte** (`reportCopy` ±2 %/−10 %, `reportBuilder.readout` ±0.5 %, `config.report`) con `pacingThresholds`? Alimenta el golden del reporte y tiene umbrales por audiencia con sugerencia propia | **No tocar ahora**; evaluar en 4.2 con un nivel «lejos del plan» explícito en el contrato |
| **P-12** | ¿Usar el umbral efectivo en el campo `pacing_status` de la **exportación** y en `summarizePeriod`? | Sí, junto con P-11, versionando el contrato de exportación |
| **P-13** | ¿Migrar la primera oleada de fórmulas (GAP-3/4/6, equivalentes exactos)? | Sí, en 4.2, con la prueba comparativa como red |
| **P-14** | ¿Definir una tolerancia entre serie diaria y GA4? | Solo tras comparar con datos reales; hasta entonces se reporta la diferencia |
| **P-15** | ¿Portar el evaluador de Z1 a `js/`? Sin él, `reliability.js` no puede alimentarse | Sí: primer paso de 4.2 |
| **P-16** | ¿Centralizar el mínimo de sesiones por segmento (tres copias) en `FP.config`? | Sí, con prueba de equivalencia |
