# Matriz de compatibilidad y riesgos (consolidada)

## Compatibilidad
| Contrato / cambio | Compatible con | Evidencia |
|---|---|---|
| `cc.plan_status/1` | `FP.gap.pacingStatus`, Fase 2 `classifyBusinessState` | equivalencia exacta en 100 000 casos + bordes |
| Titular del Inicio y `contextEngine` → regla central | Pacing, Atención, configuración del usuario | 20 000 × 4 configuraciones (incl. asimétrica); cambio acotado a 98–99 % / 101–102 % y ±1 % |
| `cc.metric_catalog/1` + política de sesiones | funciones existentes, D-02 | 27 + 26 + 19 pruebas |
| `cc.finding/1.1` (`findings.js`) | v1 de Fase 2, `attentionEngine` real | texto de funciones idéntico; JSON idéntico con hallazgos reales |
| `cc.reliability/1` (`reliability.js`) | Z1 / D-05 | idéntico a la especificación en 4 000 entradas |
| `cc.sample/1` | D-03, config de forecast | 12 pruebas; lee `FP.config` |
| Z1 | sin cambios; no se modificó | hash de la especificación aceptada intacto |
| `impactModel.js` / `combineImpacts` | sin cambios | hash de la línea base |

## Riesgos
| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Titular del Inicio cambia de texto en 98–99 % / 101–102 % | Cierta (autorizado) | Medio | documentado; la prueba de navegador `inicio_chip` se alineó con la regla central |
| R2 | Migrar las 21 reimplementaciones puede cambiar cifras | Media | Alto | oleadas con equivalencia por sitio; GAP-5 requiere decisión de redondeo |
| R3 | Dos reglas de nivel de confiabilidad | Baja | Alto | un único nivel (Z1) comprobado; D2 |
| R4 | Los ports en `js/` divergen de las especificaciones | Media | Medio | comparación de texto y comportamiento en cada corrida |
| R5 | `impactModel` vs D-01/D-06 (margen negativo; consolidación) | Alta | Alto | no se tocó; 4.5 |
| R6 | Tolerancias 0.005 / $0.01 distintas | Media | Bajo | documentadas (P-04); sin unificar |
| R7 | Sin tolerancia aprobada serie diaria ↔ GA4 | Media | Medio | se reporta la diferencia, no se oculta; datos reales pendientes |
| R8 | Umbral de la exportación `pacing_status` usa el por defecto | Baja | Bajo | P-12 |
| R9 | Datos simulados únicamente | Alta | Medio | límite declarado |
